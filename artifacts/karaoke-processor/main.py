"""
Karaoke Processor — FastAPI service  (v6 — max accuracy + speed)
Pipeline:
  1. FFmpeg: convert input → 44100 Hz stereo WAV + 16 kHz mono copy
  2. Demucs htdemucs  — separates vocals.wav + no_vocals.wav
  3. [IMMEDIATE] Aurora background pre-render starts in background (FFmpeg)
     ↳ runs concurrently with Whisper — saves 3-5 min total wait!
  4. Whisper large-v3  — transcribes separated vocals (maximum accuracy):
       • beam_size=10, VAD filter on, hallucination suppression
       • condition_on_previous_text, full temperature fallback
       • repetition_penalty, no_speech_threshold tuned for music
  5. [WAIT] User reviews / edits transcript
     (background pre-render is usually finished by now)
  6. FFmpeg: overlay ASS lyrics on pre-rendered background → done in ~30 s

Accuracy vs v5:
  - VAD filter ON (serial pipeline = no PyTorch conflict with Demucs)
  - beam_size 5→10 + full temperature fallback [0..1.0]
  - hallucination_silence_threshold suppresses artefacts over silence
  - condition_on_previous_text for better lyric continuity
  - initial_prompt="Song lyrics:" gives Whisper the right context

Speed vs v5:
  - Pre-render overlaps with Whisper transcription → 3-5 min saved
  - VAD skips silent intros/outros → 20-40 % less audio for Whisper
"""

import os, uuid, asyncio, shutil, json, re, io, concurrent.futures, threading
from datetime import datetime
from pathlib import Path
from typing import Optional, List
from contextlib import asynccontextmanager

# Set PyTorch thread count ONCE before any threads start.
# Never call torch.set_num_threads() from inside a thread while another
# PyTorch operation is running — that races on PyTorch's global thread pool
# and is a known crash source.
import torch as _torch_init
# 2 intra-op threads × 3 num_workers inside apply_model = 6 threads = all 6 cores.
# Set ONCE here — never call torch.set_num_threads() from worker threads.
_torch_init.set_num_threads(2)
del _torch_init

_tqdm_lock = threading.Lock()    # serialise tqdm monkey-patching

FONTS_DIR = Path(__file__).parent / "fonts"
WATERMARK  = Path(__file__).parent / "watermark.png"

from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

# ---------------------------------------------------------------------------
JOBS_DIR = Path("/tmp/karaoke_jobs")
JOBS_DIR.mkdir(parents=True, exist_ok=True)
jobs: dict[str, dict] = {}
# Job IDs marked for cancellation (deleted while still processing).
# Background tasks check this set and exit silently when they see their ID here.
_cancelled_jobs: set[str] = set()
_prerender_events: dict[str, asyncio.Event] = {}
# One semaphore for the ENTIRE inference pipeline (Demucs + Whisper).
# Both models are large (htdemucs ~3 GB + Whisper large-v3 ~1.5 GB int8).
# Running them for two jobs simultaneously would push peak RAM to their SUM,
# causing OOM crashes.  The semaphore ensures jobs process fully serially:
# Job N's Demucs + Whisper all complete before Job N+1 starts Demucs.
# Pre-render (FFmpeg, no PyTorch) still runs in parallel with the SAME
# job's Whisper — that's the 3-5 min speed win, and it's safe.
_inference_sem: asyncio.Semaphore | None = None

# htdemucs — fastest + high quality vocal separation for karaoke
DEMUCS_MODEL  = "htdemucs"
# large-v3-turbo — identical encoder to large-v3 (same quality), smaller decoder
# (4 layers vs 32) = faster + uses ~800 MB vs 1.5 GB. Zero quality reduction.
WHISPER_MODEL = "large-v3-turbo"

# GPU support: set DEMUCS_DEVICE=cuda / WHISPER_DEVICE=cuda in production.
# On Modal H100, processing drops from ~5 min → ~15 seconds per song.
DEMUCS_DEVICE  = os.environ.get("DEMUCS_DEVICE",  "cpu")
WHISPER_DEVICE = os.environ.get("WHISPER_DEVICE", "cpu")
WHISPER_BEAM  = 8    # high accuracy + ~20% faster than beam=10

HAS_NVENC = False

def _detect_nvenc():
    """Check if NVIDIA NVENC hardware encoder is available (H100/A100/etc)."""
    global HAS_NVENC
    import subprocess as _sp
    try:
        if not (DEMUCS_DEVICE.startswith("cuda") or WHISPER_DEVICE.startswith("cuda")):
            print("[startup] No CUDA devices configured — skipping NVENC detection")
            return
        r = _sp.run(
            ["ffmpeg", "-hide_banner", "-f", "lavfi", "-i",
             "color=s=64x64:d=0.1:c=black",
             "-c:v", "h264_nvenc", "-preset", "p4", "-rc", "vbr",
             "-cq", "28", "-b:v", "0",
             "-pix_fmt", "yuv420p", "-f", "null", "-"],
            capture_output=True, text=True, timeout=15)
        if r.returncode == 0:
            HAS_NVENC = True
            print("[startup] ✓ NVENC hardware encoder detected — FFmpeg will use GPU encoding")
        else:
            print("[startup] NVENC not available — using CPU libx264 encoding")
    except Exception as e:
        print(f"[startup] NVENC detection failed ({e}) — using CPU libx264 encoding")

_detect_nvenc()

def _vcodec_args() -> list[str]:
    """Return FFmpeg video codec args: NVENC (GPU) when available, else libx264.
    GPU: optimised for small file size at high visual quality.
    CPU: ultrafast for speed — quality is still good at crf 23 with karaoke content.
    """
    if HAS_NVENC:
        return ["-c:v", "h264_nvenc", "-preset", "p4", "-rc", "vbr",
                "-cq", "30", "-b:v", "0", "-maxrate", "2.5M", "-bufsize", "5M",
                "-profile:v", "high"]
    return ["-c:v", "libx264", "-preset", "ultrafast", "-crf", "23"]

def _vcodec_args_fast() -> list[str]:
    """Faster video codec args for prerender (lower quality OK — intermediate file)."""
    if HAS_NVENC:
        return ["-c:v", "h264_nvenc", "-preset", "p1", "-rc", "vbr",
                "-cq", "34", "-b:v", "0"]
    return ["-c:v", "libx264", "-preset", "ultrafast", "-crf", "28"]

def _is_nvenc_error(stderr: str) -> bool:
    """Check if an FFmpeg failure is NVENC-specific (not a general filter/input error)."""
    lower = stderr.lower()
    return any(k in lower for k in
               ["nvenc", "no capable devices", "cannot load nvencode",
                "hwframe", "cuda_error", "encoder not found"])

def _extract_ffmpeg_error(stderr: str) -> str:
    """Extract the meaningful error line from FFmpeg stderr, skipping version spam."""
    lines = stderr.strip().splitlines()
    error_lines = [l for l in lines if any(k in l.lower() for k in
                   ["error", "invalid", "not found", "no such", "failed",
                    "moov atom", "does not exist", "permission denied"])]
    if error_lines:
        return "; ".join(error_lines[-5:])
    return lines[-1] if lines else stderr[-300:]

# Whisper model instance — pre-loaded once at startup, reused across all jobs
_whisper_model = None

# Demucs model — pre-loaded once at startup, reused across all jobs.
# Inference is stateless (eval + no_grad), so multiple concurrent reads are safe.
_demucs_model = None
_demucs_model_load_lock = threading.Lock()

# Thread pool: separate executors so Demucs and Whisper truly run in parallel
# and each can be given its own thread without blocking the other.
_demucs_executor  = concurrent.futures.ThreadPoolExecutor(max_workers=1, thread_name_prefix="demucs")
_whisper_executor = concurrent.futures.ThreadPoolExecutor(max_workers=1, thread_name_prefix="whisper")

_HE_PUNCT = str.maketrans("", "", '.,!?;:\'"()[]{}–—-״׳')

def _clean_word(w: str) -> str:
    """Strip punctuation that Whisper attaches to Hebrew words.
    Also removes single-character Latin artifacts (e.g. Whisper hallucination 'W').
    """
    cleaned = w.strip().translate(_HE_PUNCT).strip()
    if len(cleaned) == 1 and cleaned.isascii() and cleaned.isalpha():
        return ""
    return cleaned

# ---------------------------------------------------------------------------
class WordTimestamp(BaseModel):
    word: str; start: float; end: float; probability: float

class Job(BaseModel):
    id: str
    status: str
    progress: float
    filename: str
    error: Optional[str] = None
    words: Optional[list[WordTimestamp]] = None
    language: Optional[str] = None
    duration_seconds: Optional[float] = None
    created_at: str; updated_at: str

class DeleteResponse(BaseModel):
    ok: bool

class YoutubeRequest(BaseModel):
    url: str

class LyricsUpdateRequest(BaseModel):
    words: List[WordTimestamp]

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def now_iso(): return datetime.utcnow().isoformat() + "Z"

def _save_job_meta(job_id: str):
    """Persist job state (without words list) to disk so it survives restarts."""
    if job_id not in jobs:
        return
    jdir = JOBS_DIR / job_id
    jdir.mkdir(parents=True, exist_ok=True)
    meta = {k: v for k, v in jobs[job_id].items() if k != "words"}
    try:
        (jdir / "job.json").write_text(json.dumps(meta, ensure_ascii=False))
    except Exception:
        pass

def update_job(job_id, **kw):
    if job_id in jobs:
        jobs[job_id].update(kw)
        jobs[job_id]["updated_at"] = now_iso()
        _save_job_meta(job_id)

def _load_jobs_from_disk():
    """Reload persisted jobs from disk on startup."""
    if not JOBS_DIR.exists():
        return
    count = 0
    for jdir in sorted(JOBS_DIR.iterdir()):
        if not jdir.is_dir():
            continue
        meta_f = jdir / "job.json"
        if not meta_f.exists():
            continue
        try:
            meta = json.loads(meta_f.read_text())
            jid = meta.get("id")
            if not jid:
                continue
            # Reload words from separate words.json
            words_f = jdir / "words.json"
            meta["words"] = json.loads(words_f.read_text()) if words_f.exists() else None
            # Reload detected language
            lang_f = jdir / "language.txt"
            if lang_f.exists() and not meta.get("language"):
                meta["language"] = lang_f.read_text().strip()
            # Jobs that were mid-processing can't be resumed → mark as error
            mid = {"pending", "queued", "separating", "transcribing", "rendering"}
            if meta.get("status") in mid:
                meta["status"] = "error"
                meta["error"] = "העיבוד הופסק עקב הפעלה מחדש של השרת. אנא העלה שוב."
                meta["progress"] = 0
            jobs[jid] = meta
            count += 1
        except Exception as e:
            print(f"[startup] Could not load {jdir.name}: {e}")
    if count:
        print(f"[startup] Restored {count} jobs from disk")

def job_dir(job_id):
    d = JOBS_DIR / job_id; d.mkdir(parents=True, exist_ok=True); return d

async def run_cmd(*args, timeout: float | None = None) -> tuple[int, str]:
    """Run a subprocess and return (returncode, stderr).
    Pass timeout in seconds to kill the process if it exceeds it.
    """
    p = await asyncio.create_subprocess_exec(
        *args, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE)
    try:
        _, err = await asyncio.wait_for(p.communicate(), timeout=timeout)
    except asyncio.TimeoutError:
        p.kill()
        await p.wait()
        return -1, f"Process timed out after {timeout}s"
    return p.returncode, err.decode(errors="replace")

async def run_cmd_stdout(*args) -> tuple[int, str]:
    """Run a subprocess and return (returncode, stdout). Stderr is discarded."""
    p = await asyncio.create_subprocess_exec(
        *args,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.DEVNULL)
    out, _ = await p.communicate()
    return p.returncode, out.decode(errors="replace")

async def _validate_mp4(path: Path) -> bool:
    """Check that an MP4 file has valid video+audio streams and can be read."""
    if not path.exists() or path.stat().st_size < 1024:
        return False
    rc_v, _ = await run_cmd(
        "ffprobe", "-v", "error", "-select_streams", "v:0",
        "-show_entries", "stream=codec_name,duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        str(path))
    if rc_v != 0:
        return False
    rc_a, _ = await run_cmd(
        "ffprobe", "-v", "error", "-select_streams", "a:0",
        "-show_entries", "stream=codec_name",
        "-of", "default=noprint_wrappers=1:nokey=1",
        str(path))
    if rc_a != 0:
        return False
    rc_frame, _ = await run_cmd(
        "ffmpeg", "-v", "error", "-i", str(path),
        "-frames:v", "1", "-f", "null", "-")
    return rc_frame == 0


# ---------------------------------------------------------------------------
# PIPELINE — Phase 1: separate + transcribe → awaiting_review
# ---------------------------------------------------------------------------
async def process_job(job_id: str, input_path: Path, filename: str,
                      max_duration_secs: Optional[float] = None,
                      language_hint: Optional[str] = None):
    try:
        jdir = JOBS_DIR / job_id  # Do NOT recreate dir — use existing one

        # ── Convert to WAV (two versions, PARALLEL) ───────────────────────
        #   • input.wav    – 44100 Hz stereo  → Demucs (needs full sample rate)
        #   • input_16k.wav – 16000 Hz mono   → Whisper (native rate, 5× smaller)
        # Both reads come from the same source file and are independent →
        # running them concurrently with asyncio.gather saves ~5-10 seconds.
        update_job(job_id, status="separating", progress=3)
        wav_in  = jdir / "input.wav"
        wav_16k = jdir / "input_16k.wav"

        # Determine ffmpeg duration args (free users: first N seconds only)
        dur_args = ["-t", str(max_duration_secs)] if max_duration_secs else []

        (rc, err), (rc2, _) = await asyncio.gather(
            run_cmd(
                "ffmpeg", "-y", "-i", str(input_path),
                *dur_args,
                "-ac", "2", "-ar", "44100", "-f", "wav", str(wav_in)),
            run_cmd(
                "ffmpeg", "-y", "-i", str(input_path),
                *dur_args,
                "-ac", "1", "-ar", "16000", "-f", "wav", str(wav_16k)),
        )
        if rc != 0:
            raise RuntimeError(f"FFmpeg convert: {err[-500:]}")
        if rc2 != 0:
            wav_16k = wav_in    # fallback: use original
        update_job(job_id, progress=6)

        # ── SERIAL pipeline: Demucs first, then Whisper ───────────────────
        # Running both simultaneously caused OOM (Whisper large-v3 ~3 GB +
        # htdemucs buffers exceed available RAM).  Sequential execution keeps
        # peak RAM at max(model_a, model_b) instead of sum(model_a, model_b).
        # Bonus: Whisper now sees the clean separated vocals → better accuracy.
        import soundfile as _sf
        _sf_info = _sf.info(str(wav_in))
        audio_dur = _sf_info.duration

        loop = asyncio.get_event_loop()

        # ── SERIAL inference: hold sem for Demucs + Whisper together ─────────
        # Both models are RAM-heavy (htdemucs ~3 GB + Whisper large-v3 ~1.5 GB).
        # If a second job's Demucs starts while this job's Whisper is running,
        # the combined RAM spike crashes the process.  The semaphore ensures
        # only ONE job is doing any ML inference at a time.
        # Pre-render (pure FFmpeg, no PyTorch/CTranslate2) fires AFTER Demucs
        # while Whisper runs → still saves 3-5 min; no conflict.
        update_job(job_id, status="queued", progress=7)
        async with _inference_sem:

            # Bail out if job was deleted while waiting for the semaphore.
            if job_id in _cancelled_jobs or not jdir.exists():
                return

            # Step 1 — Demucs (vocal separation)
            update_job(job_id, status="separating", progress=8)
            vocals_p, no_vocals_p = await loop.run_in_executor(
                _demucs_executor, _run_demucs, wav_in, jdir, job_id)

            # Bail out if job was deleted while Demucs was running.
            if job_id in _cancelled_jobs or not jdir.exists():
                return

            # ── Persist stems paths so pre-render can start immediately ───────
            (jdir / "stems_paths.json").write_text(
                json.dumps({"vocals": str(vocals_p), "no_vocals": str(no_vocals_p)}))

            # ── Start FFmpeg background pre-render RIGHT AFTER Demucs ─────────
            # FFmpeg is NOT PyTorch — safe to run while Whisper uses CTranslate2.
            _prerender_events[job_id] = asyncio.Event()
            asyncio.ensure_future(
                _prererender_bg(job_id, no_vocals_p, audio_dur)
            )
            print("[pipeline] Pre-render started in background (parallel with Whisper)")

            # Free Demucs from RAM before Whisper loads — peak RAM = max not sum
            await loop.run_in_executor(_demucs_executor, _unload_demucs_model)

            # Step 2 — Whisper (still inside inference sem!)
            update_job(job_id, status="transcribing", progress=50)

            # ── Prepare vocals: 16 kHz mono + loudness normalization ──────────
            # loudnorm I=-14 LUFS amplifies quiet/whispery singing for Whisper
            vocals_16k = jdir / "vocals_16k.wav"
            rc_v, _ = await run_cmd(
                "ffmpeg", "-y", "-i", str(vocals_p),
                "-ac", "1", "-ar", "16000",
                "-af", "loudnorm=I=-14:LRA=7:TP=-1.5:print_format=none",
                "-f", "wav", str(vocals_16k))
            if rc_v != 0:
                await run_cmd(
                    "ffmpeg", "-y", "-i", str(vocals_p),
                    "-ac", "1", "-ar", "16000", "-f", "wav", str(vocals_16k))
            whisper_src = vocals_16k if vocals_16k.exists() else wav_16k
            print(f"[pipeline] Whisper input: {whisper_src.name} "
                  f"({whisper_src.stat().st_size // 1024} KB)")
            words, detected_language = await loop.run_in_executor(
                _whisper_executor, _run_whisper_sync, whisper_src, job_id, audio_dur, language_hint)
        # ── _inference_sem released here — next job can now start Demucs ──────

        # Bail out if job was deleted while Whisper was running.
        if job_id in _cancelled_jobs or not jdir.exists():
            return

        # ── Save results ──────────────────────────────────────────────────
        (jdir / "words.json").write_text(
            json.dumps(words, ensure_ascii=False, indent=2))
        # stems_paths.json already saved above (before pre-render started)
        (jdir / "language.txt").write_text(detected_language)

        update_job(job_id, status="awaiting_review", progress=70, words=words,
                   language=detected_language)

    except Exception as exc:
        # If the job was cancelled (deleted by user), exit silently — no error update needed.
        if job_id in _cancelled_jobs or str(exc) == "job_cancelled":
            print(f"[pipeline] Job {job_id} was cancelled — stopping silently.")
            return
        update_job(job_id, status="error", progress=0, error=str(exc))
        import traceback; traceback.print_exc()
    finally:
        _cancelled_jobs.discard(job_id)


# ---------------------------------------------------------------------------
# PIPELINE — Background pre-render (runs while user reviews transcript)
# ---------------------------------------------------------------------------
async def _prererender_bg(job_id: str, no_vocals: Path, duration: float):
    global HAS_NVENC
    """
    Renders the aurora background + waveform + audio to a temp video file
    while the user is reading / editing the transcript.
    When render_job() runs later, it only needs to overlay the ASS text
    (and optionally the avatar), saving 3-5 minutes of render time.

    Speed optimisations vs v6:
    - Rendered at 640×360 (1/4 the pixels) → ~3× faster FFmpeg compute
    - preset ultrafast → ~40% faster vs veryfast (background video quality is fine)
    - nice -n 10: lower OS priority so Demucs/Whisper get first claim on CPU cores
    - crf 26 (was 20) — slightly more compressed; upscaled to 720p in final render
    - waveform at 640×40 (was 1280×80) — same visual, half the work
    Final render upscales from 360p → 720p in one fast scale step.
    """
    event = _prerender_events.get(job_id)
    try:
        if job_id in _cancelled_jobs:
            return
        jdir = JOBS_DIR / job_id
        if not jdir.exists():
            return
        out  = jdir / "bg_prerender.mp4"
        if out.exists():
            return

        FPS = 25
        aurora = (
            f"color=s=96x54:r={FPS}:d={duration}:c=0x030310[tiny];"
            "[tiny]geq="
            "r='clip("
            "50*sin(6.28*X/96+6.28*T/12)*sin(6.28*Y/54+6.28*T/8)"
            "+45*sin(6.28*(X+Y)/120+6.28*T/15)"
            "+20,0,255)':"
            "g='clip("
            "18*sin(6.28*X/72-6.28*T/14)*cos(6.28*Y/54+6.28*T/11)"
            "+15*sin(6.28*(X-Y)/100+6.28*T/22)"
            "+8,0,160)':"
            "b='clip("
            "170*sin(6.28*Y/54+6.28*T/9)"
            "+80*sin(6.28*X/96-6.28*T/11)"
            "+50*sin(6.28*(X+Y)/80+6.28*T/17)"
            "+80,0,255)'"
            "[tiny_aurora];"
            "[tiny_aurora]scale=640:360:flags=bilinear[aurora];"
            "[aurora]gblur=sigma=6[bg_blurred];"
            f"[1:a]showwaves=s=640x40:mode=cline:rate={FPS}:"
            "colors=0x00FFFFFF|0xFF44CCFF|0x9333EAFF:scale=sqrt[wv];"
            "[bg_blurred][wv]overlay=0:320[out]"
        )

        import shutil as _shutil
        nice_cmd = ["nice", "-n", "10"] if _shutil.which("nice") else []

        prerender_cmd = [
            *nice_cmd,
            "ffmpeg", "-y",
            "-threads", "2",
            "-f", "lavfi", "-i", f"color=s=640x360:r={FPS}:d={duration}:c=black",
            "-i", str(no_vocals),
            "-filter_complex", aurora,
            "-map", "[out]", "-map", "1:a",
            *_vcodec_args_fast(),
            "-c:a", "aac", "-b:a", "96k",
            "-r", str(FPS), "-pix_fmt", "yuv420p",
            "-movflags", "+faststart",
            "-shortest", str(out),
        ]
        prerender_timeout = max(duration * 4, 180)
        print(f"[prererender] Starting prerender ({duration:.0f}s audio, timeout={prerender_timeout:.0f}s)")
        rc, err = await run_cmd(*prerender_cmd, timeout=prerender_timeout)
        if rc != 0 and HAS_NVENC and _is_nvenc_error(err):
            print("[prererender] NVENC failed — retrying prerender with CPU libx264")
            HAS_NVENC = False
            prerender_cmd_cpu = [
                *nice_cmd,
                "ffmpeg", "-y",
                "-threads", "2",
                "-f", "lavfi", "-i", f"color=s=640x360:r={FPS}:d={duration}:c=black",
                "-i", str(no_vocals),
                "-filter_complex", aurora,
                "-map", "[out]", "-map", "1:a",
                *_vcodec_args_fast(),
                "-c:a", "aac", "-b:a", "96k",
                "-r", str(FPS), "-pix_fmt", "yuv420p",
                "-movflags", "+faststart",
                "-shortest", str(out),
            ]
            rc, err = await run_cmd(*prerender_cmd_cpu, timeout=prerender_timeout)
        if rc != 0:
            print(f"[prererender] WARN: background pre-render failed (rc={rc}): {_extract_ffmpeg_error(err)}")
            if out.exists():
                out.unlink()
                print("[prererender] Removed corrupt/partial bg_prerender.mp4")
        else:
            ok = await _validate_mp4(out)
            if not ok:
                print("[prererender] WARN: bg_prerender.mp4 failed validation (moov atom missing?), removing")
                if out.exists():
                    out.unlink()
            else:
                sz = out.stat().st_size / (1024*1024)
                print(f"[prererender] Background ready → {out.name} ({sz:.1f} MB, 360p)")
    finally:
        if event:
            event.set()
        _prerender_events.pop(job_id, None)


# ---------------------------------------------------------------------------
# PIPELINE — Phase 2: render (after user confirms transcript)
# ---------------------------------------------------------------------------
async def render_job(job_id: str):
    global HAS_NVENC
    try:
        if job_id in _cancelled_jobs:
            return
        jdir = JOBS_DIR / job_id
        if not jdir.exists():
            return

        import time as _time
        _phase_t0 = _time.monotonic()
        def _phase_log(label: str):
            elapsed = _time.monotonic() - _phase_t0
            print(f"[render:{job_id[:8]}] {label} (t={elapsed:.1f}s)")

        _phase_log("START render_job")
        update_job(job_id, status="rendering", progress=72)

        words = json.loads((jdir / "words.json").read_text())
        stems = json.loads((jdir / "stems_paths.json").read_text())
        no_vocals_p = Path(stems["no_vocals"])

        lang_f = jdir / "language.txt"
        song_language = lang_f.read_text().strip() if lang_f.exists() else \
                        (jobs.get(job_id, {}).get("language") or "en")

        update_job(job_id, progress=74)
        ass_p = jdir / "karaoke.ass"
        _build_ass(words, ass_p, language=song_language)
        _phase_log("ASS built")

        dur_proc = await asyncio.create_subprocess_exec(
            "ffprobe", "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            str(no_vocals_p),
            stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE)
        dur_out, _ = await dur_proc.communicate()
        duration = float(dur_out.decode().strip()) if dur_out.strip() else 180.0
        _phase_log(f"Duration={duration:.1f}s")

        avatar_p = jdir / "avatar_processed.png"
        if not avatar_p.exists():
            avatar_p = jdir / "avatar.jpg"
        if not avatar_p.exists():
            avatar_p = jdir / "avatar.png"
        has_avatar = avatar_p.exists()
        _phase_log(f"Avatar={'yes' if has_avatar else 'no'}")

        video_p = jdir / "karaoke.mp4"

        bg_prerender = jdir / "bg_prerender.mp4"
        prerender_event = _prerender_events.get(job_id)
        if prerender_event and not prerender_event.is_set():
            _phase_log("Waiting for prerender event (max 180s)...")
            update_job(job_id, progress=75, status="rendering")
            try:
                await asyncio.wait_for(prerender_event.wait(), timeout=180)
                _phase_log("Prerender event fired")
            except asyncio.TimeoutError:
                _phase_log("Prerender event TIMED OUT after 180s — falling back")
        elif not bg_prerender.exists():
            _phase_log("No prerender file, waiting up to 120s...")
            update_job(job_id, progress=75, status="rendering")
            wait_secs, slept = 120, 0
            while not bg_prerender.exists() and slept < wait_secs:
                await asyncio.sleep(2)
                slept += 2
                update_job(job_id, progress=int(75 + min(slept / wait_secs, 0.9) * 5))
            _phase_log(f"Waited {slept}s for prerender file, exists={bg_prerender.exists()}")
        else:
            _phase_log("Prerender file already exists")

        use_prerender = bg_prerender.exists()
        if use_prerender:
            valid = await _validate_mp4(bg_prerender)
            if not valid:
                print(f"[render] bg_prerender.mp4 is corrupt (moov atom missing?), falling back to full render")
                bg_prerender.unlink(missing_ok=True)
                use_prerender = False

        render_done = asyncio.Event()
        render_start_time = asyncio.get_event_loop().time()

        async def _progress_tracker():
            """Smoothly advance progress 80→98 while FFmpeg renders.
            Uses asymptotic curve so progress never fully stalls even if
            the render takes much longer than estimated.
            """
            if HAS_NVENC:
                est_render = max(duration * (0.05 if use_prerender else 0.15), 8.0)
            else:
                est_render = max(duration * (0.3 if use_prerender else 1.0), 15.0)
            t0 = asyncio.get_event_loop().time()
            while not render_done.is_set():
                await asyncio.sleep(2)
                elapsed = asyncio.get_event_loop().time() - t0
                ratio = elapsed / est_render
                pct = ratio / (1.0 + ratio)
                update_job(job_id, progress=int(80 + pct * 18))   # 80 → 98

        encoder = "h264_nvenc (GPU)" if HAS_NVENC else "libx264 (CPU)"
        _phase_log(f"Prerender={'yes' if use_prerender else 'no'}, encoder={encoder}")
        update_job(job_id, progress=80)
        tracker = asyncio.create_task(_progress_tracker())
        try:
            if use_prerender and HAS_NVENC:
                rc, err = await _render_video_fast(
                    bg_prerender, ass_p, video_p,
                    avatar_p if has_avatar else None)
                if rc != 0:
                    if _is_nvenc_error(err):
                        print("[render] NVENC failed at runtime — disabling and retrying with full render")
                        HAS_NVENC = False
                if rc != 0:
                    print(f"[render] Fast render failed ({_extract_ffmpeg_error(err)}), falling back to full render")
                    bg_prerender.unlink(missing_ok=True)
                    rc, err = await _render_video(
                        no_vocals_p, ass_p, video_p, duration,
                        avatar_p if has_avatar else None)
            elif use_prerender and not HAS_NVENC:
                _phase_log("Skipping fast render on CPU (too slow), using full render directly")
                rc, err = await _render_video(
                    no_vocals_p, ass_p, video_p, duration,
                    avatar_p if has_avatar else None)
            else:
                rc, err = await _render_video(
                    no_vocals_p, ass_p, video_p, duration,
                    avatar_p if has_avatar else None)
            if rc != 0 and HAS_NVENC and _is_nvenc_error(err):
                print("[render] NVENC failed at runtime — disabling and retrying with CPU")
                HAS_NVENC = False
                rc, err = await _render_video(
                    no_vocals_p, ass_p, video_p, duration,
                    avatar_p if has_avatar else None)
        finally:
            render_done.set()
            tracker.cancel()

        render_elapsed = asyncio.get_event_loop().time() - render_start_time
        if rc != 0:
            _phase_log(f"FFmpeg FAILED after {render_elapsed:.1f}s (rc={rc}): {_extract_ffmpeg_error(err)}")
            raise RuntimeError(f"FFmpeg render failed: {_extract_ffmpeg_error(err)}")

        _phase_log(f"Render completed in {render_elapsed:.1f}s")
        if video_p.exists():
            sz = video_p.stat().st_size / (1024*1024)
            _phase_log(f"Output: {video_p.name} ({sz:.1f} MB)")

        try:
            if Path(no_vocals_p).exists():
                shutil.copy(no_vocals_p, jdir / "instrumental.wav")
        except Exception:
            pass
        update_job(job_id, status="done", progress=100, duration_seconds=duration)
        print(f"[render] Job {job_id} → done")

    except Exception as exc:
        if job_id in _cancelled_jobs or str(exc) == "job_cancelled":
            print(f"[render] Job {job_id} was cancelled — stopping silently.")
            return
        update_job(job_id, status="error", progress=0, error=str(exc))
        import traceback; traceback.print_exc()
    finally:
        _cancelled_jobs.discard(job_id)


# ---------------------------------------------------------------------------
# DEMUCS — htdemucs, fast, high-quality vocal separation
# Real progress via tqdm monkey-patch (demucs uses tqdm.tqdm internally)
# ---------------------------------------------------------------------------
def _load_demucs_model():
    """Load (or return cached) Demucs model.  Thread-safe double-checked lock."""
    global _demucs_model
    if _demucs_model is not None:
        return _demucs_model
    with _demucs_model_load_lock:
        if _demucs_model is None:
            from demucs.pretrained import get_model
            print(f"[demucs] Loading {DEMUCS_MODEL}…", flush=True)
            m = get_model(DEMUCS_MODEL)
            m.eval()
            _demucs_model = m
            print(f"[demucs] {DEMUCS_MODEL} ready.", flush=True)
    return _demucs_model


def _unload_demucs_model():
    """Release Demucs from memory so Whisper has headroom to load/run."""
    global _demucs_model
    import gc, torch
    with _demucs_model_load_lock:
        if _demucs_model is not None:
            del _demucs_model
            _demucs_model = None
    gc.collect()
    try:
        torch.cuda.empty_cache()
    except Exception:
        pass
    print("[demucs] Model released from RAM.", flush=True)


def _run_demucs(wav_in: Path, jdir: Path, job_id: str) -> tuple[Path, Path]:
    import numpy as np
    import torch, soundfile as sf
    import tqdm as _tqdm_module
    from demucs.apply import apply_model

    # NOTE: torch.set_num_threads() is intentionally NOT called here.
    # It is set ONCE at module level before any threads start.  Calling it
    # from a worker thread while another PyTorch computation is in-flight
    # races on the global thread pool and reliably crashes the process.

    model = _load_demucs_model()

    audio, sr = sf.read(str(wav_in), dtype="float32", always_2d=True)
    wav = torch.from_numpy(audio.T).float()
    if wav.shape[0] == 1:  wav = wav.repeat(2, 1)
    elif wav.shape[0] > 2: wav = wav[:2]

    ref_mean = wav.mean(); ref_std = wav.std() + 1e-8
    wav_norm = (wav - ref_mean) / ref_std
    batch = wav_norm.unsqueeze(0)

    # ── Monkey-patch tqdm.tqdm so we get real chunk progress ───────────────
    # demucs/apply.py does: import tqdm; tqdm.tqdm(futures, unit='seconds', ...)
    # Each update(n) call advances by n processed audio seconds.
    # We map that to our 8%→38% progress range.
    # _tqdm_lock serialises the patch/unpatch so Whisper (which may also use
    # tqdm) doesn't get our subclass during its progress bars.
    _orig_tqdm = _tqdm_module.tqdm

    class _ProgressTQDM(_orig_tqdm):
        def update(self, n=1):
            super().update(n)
            if self.total and self.total > 0:
                pct = min(self.n / self.total, 1.0)
                update_job(job_id, progress=int(8 + pct * 30))

    with _tqdm_lock:
        _tqdm_module.tqdm = _ProgressTQDM
    try:
        with torch.inference_mode():   # faster than no_grad; disables autograd entirely
            # segment=7.8 s = exactly htdemucs training_length (343980 samples @ 44100 Hz)
            # Using the exact training length avoids the reshape mismatch that occurs
            # when segment doesn't divide evenly into training_length.
            sources = apply_model(
                model, batch, device=DEMUCS_DEVICE,
                progress=True,
                split=True,
                shifts=0,
                overlap=0.04,
                num_workers=1,
                segment=7.8)
    finally:
        with _tqdm_lock:
            _tqdm_module.tqdm = _orig_tqdm   # always restore

    sources = sources[0]
    sources = sources * ref_std + ref_mean

    stems = model.sources
    vi = stems.index("vocals")
    vocals_np = sources[vi].numpy().T
    no_voc_np = sum(sources[i] for i in range(len(stems)) if i != vi).numpy().T

    # Check for cancellation (job deleted while Demucs was running).
    if job_id in _cancelled_jobs:
        raise RuntimeError("job_cancelled")
    if not jdir.exists():
        raise RuntimeError("job_cancelled")

    out = jdir / "stems"; out.mkdir(parents=True, exist_ok=True)
    vp  = out / "vocals.wav";    sf.write(str(vp),  vocals_np, sr, subtype="PCM_16")
    nvp = out / "no_vocals.wav"; sf.write(str(nvp), no_voc_np, sr, subtype="PCM_16")
    return vp, nvp


# ---------------------------------------------------------------------------
# LYRIC LINE GROUPER
# ---------------------------------------------------------------------------
def _group_words_into_lines(words: list[dict], max_words: int = 8) -> list[list[dict]]:
    """Split word list into lyric lines (sentence-like).
    New line when: pause > 0.55 s OR max words reached OR line too wide (>1100 px).
    """
    if not words:
        return []
    lines: list[list[dict]] = []
    cur: list[dict] = []
    for i, w in enumerate(words):
        cur.append(w)
        is_last = (i == len(words) - 1)
        next_gap = (words[i + 1]["start"] - w["end"]) if not is_last else 999.0
        cur_width = sum(_word_px(ww["word"]) for ww in cur) + 12 * (len(cur) - 1)
        if len(cur) >= max_words or next_gap > 0.55 or cur_width > 1100 or is_last:
            lines.append(cur)
            cur = []
    return lines


# ---------------------------------------------------------------------------
# ASS SUBTITLE BUILDER — sentence-based karaoke (2-line display)
# ---------------------------------------------------------------------------
# Each line is rendered as a full sentence with \kf word-by-word sweep.
# Only 2 lines shown: the active (currently sung) line + next upcoming line.
# Same font size for both lines; upcoming line is dimmer.
# A small negative timing offset improves perceived sync.

# Pixel-width estimate at 54 px font
_CHAR_PX      = 36   # average px per Latin/Hebrew character
_CHAR_PX_CJK  = 54   # CJK ideographs are full-width
_MIN_W    = 32   # minimum word width
_GAP_PX   = 12   # gap between words (natural sentence spacing)

# Languages that read right-to-left
_RTL_LANGS = {"he", "ar", "fa", "ur", "arc", "dv", "ha", "khw", "ks", "ps", "yi"}

# CJK languages — characters are full-width and may need char-level segmentation
_CJK_LANGS = {"ja", "zh", "ko", "yue"}


def _is_rtl(language: str) -> bool:
    return language.lower().split("-")[0] in _RTL_LANGS


def _is_cjk(language: str) -> bool:
    return language.lower().split("-")[0] in _CJK_LANGS


def _is_cjk_char(c: str) -> bool:
    """Check if a character is a CJK ideograph, kana, or Hangul."""
    cp = ord(c)
    return (
        (0x4E00 <= cp <= 0x9FFF) or    # CJK Unified Ideographs
        (0x3400 <= cp <= 0x4DBF) or    # CJK Extension A
        (0x3040 <= cp <= 0x309F) or    # Hiragana
        (0x30A0 <= cp <= 0x30FF) or    # Katakana
        (0xAC00 <= cp <= 0xD7AF) or    # Hangul Syllables
        (0x1100 <= cp <= 0x11FF) or    # Hangul Jamo
        (0xF900 <= cp <= 0xFAFF) or    # CJK Compatibility Ideographs
        (0x20000 <= cp <= 0x2A6DF)     # CJK Extension B
    )


def _word_px(word: str) -> int:
    """Estimate pixel width of a word, accounting for CJK full-width chars."""
    px = 0
    for c in word:
        px += _CHAR_PX_CJK if _is_cjk_char(c) else _CHAR_PX
    return max(px, _MIN_W)


_SYNC_OFFSET = -0.15   # shift all word times earlier by 150ms to improve perceived sync


def _build_ass(words: list[dict], out: Path, language: str = "en"):
    """
    Sentence-based karaoke layout (1280×720):
      2 lines only:  active line (y=330) + next upcoming line (y=420).
      Same font size for both — upcoming line is dimmer.
      Each line = single dialogue event with \\kf word-by-word sweep.
      No small-font context lines.
    """
    import copy as _copy
    words_adj = _copy.deepcopy(words)
    for w in words_adj:
        w["start"] = max(0.0, w["start"] + _SYNC_OFFSET)
        w["end"]   = max(0.01, w["end"] + _SYNC_OFFSET)
    lines  = _group_words_into_lines(words_adj)
    is_rtl = _is_rtl(language)

    # ASS colours: &HAABBGGRR
    # Active line: PrimaryColour = highlighted (already sung) colour
    #              SecondaryColour = not-yet-sung colour (dim white)
    C_HIGHLIGHT = "&H00FFFF00&"     # bright cyan — colour of sung words
    C_UNSUNSG   = "&H50FFFFFF&"     # dim white — words not yet sung
    C_OUTLINE   = "&H00000000&"     # black outline
    C_UPCOMING  = "&H60FFFFFF&"     # dimmer white for next line
    C_UP_OUTLINE = "&H70000000&"    # softer outline for upcoming

    # Font selection
    if _is_cjk(language):
        font_name = "Noto Sans SC"
    elif is_rtl:
        font_name = "Noto Sans Hebrew"
    else:
        font_name = "Montserrat"

    FONT_SIZE = 54

    header = (
        "[Script Info]\n"
        "ScriptType: v4.00+\n"
        "PlayResX: 1280\n"
        "PlayResY: 720\n"
        "WrapStyle: 2\n"
        "ScaledBorderAndShadow: yes\n\n"
        "[V4+ Styles]\n"
        "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour,"
        " OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut,"
        " ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow,"
        " Alignment, MarginL, MarginR, MarginV, Encoding\n"
        # Active: cyan highlight sweeps over dim-white unsunsg text
        f"Style: Active,{font_name},{FONT_SIZE},{C_HIGHLIGHT},{C_UNSUNSG},{C_OUTLINE},&H80000000,"
        "-1,0,0,0,100,100,1,0,1,3,2,5,60,60,0,1\n"
        # Upcoming: dim white, no karaoke effect
        f"Style: Upcoming,{font_name},{FONT_SIZE},{C_UPCOMING},&H00000000,{C_UP_OUTLINE},&H00000000,"
        "0,0,0,0,100,100,1,0,1,2,1,5,60,60,0,1\n\n"
        "[Events]\n"
        "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n"
    )

    def ts(s: float) -> str:
        s = max(0.0, s)
        h  = int(s // 3600)
        m  = int((s % 3600) // 60)
        sc = s % 60
        cs = round((sc - int(sc)) * 100)
        return f"{h}:{m:02d}:{int(sc):02d}.{cs:02d}"

    Y_ACTIVE   = 330
    Y_UPCOMING = 420

    events = [header]

    for line_idx, line in enumerate(lines):
        if not line:
            continue
        line_start = line[0]["start"]
        line_end   = line[-1]["end"]

        if is_rtl:
            # ── RTL: position each word individually right-to-left ─────
            # libass BiDi is unreliable across FFmpeg builds, so we
            # manually place each word at its correct RTL x-position.
            word_data = [(w, _word_px(w["word"])) for w in line]
            total_px = sum(px for _, px in word_data) + _GAP_PX * max(0, len(word_data) - 1)

            x_cursor = 640 + total_px // 2   # right edge of centered line

            for w, wpx in word_data:
                wcx = x_cursor - wpx // 2    # word center x
                x_cursor -= wpx + _GAP_PX

                events.append(
                    f"Dialogue: 1,{ts(line_start)},{ts(line_end)},"
                    f"Active,,0,0,0,,{{\\an5}}{{\\pos({wcx},{Y_ACTIVE})}}"
                    f"{{\\1c{C_UNSUNSG}\\2c{C_UNSUNSG}}}{w['word']}\n"
                )
                word_cs = max(1, round((w["end"] - w["start"]) * 100))
                events.append(
                    f"Dialogue: 2,{ts(w['start'])},{ts(line_end)},"
                    f"Active,,0,0,0,,{{\\an5}}{{\\pos({wcx},{Y_ACTIVE})}}"
                    f"{{\\kf{word_cs}}}{w['word']}\n"
                )

            next_idx = line_idx + 1
            if next_idx < len(lines):
                next_line = lines[next_idx]
                nd = [(w, _word_px(w["word"])) for w in next_line]
                ntotal = sum(px for _, px in nd) + _GAP_PX * max(0, len(nd) - 1)
                nx = 640 + ntotal // 2
                for w, wpx in nd:
                    ncx = nx - wpx // 2
                    nx -= wpx + _GAP_PX
                    events.append(
                        f"Dialogue: 0,{ts(line_start)},{ts(line_end)},"
                        f"Upcoming,,0,0,0,,{{\\an5}}{{\\pos({ncx},{Y_UPCOMING})}}{w['word']}\n"
                    )
        else:
            # ── LTR: single event per line with \kf sweep ─────────────
            parts = []
            kf_cursor = line_start
            for w in line:
                total_cs = max(1, round((w["end"] - kf_cursor) * 100))
                parts.append(f"{{\\kf{total_cs}}}{w['word']}")
                kf_cursor = w["end"]
            sentence = " ".join(parts)

            events.append(
                f"Dialogue: 1,{ts(line_start)},{ts(line_end)},"
                f"Active,,0,0,0,,{{\\an5}}{{\\pos(640,{Y_ACTIVE})}}{sentence}\n"
            )

            next_idx = line_idx + 1
            if next_idx < len(lines):
                next_line = lines[next_idx]
                next_text = " ".join(w["word"] for w in next_line)
                events.append(
                    f"Dialogue: 0,{ts(line_start)},{ts(line_end)},"
                    f"Upcoming,,0,0,0,,{{\\an5}}{{\\pos(640,{Y_UPCOMING})}}{next_text}\n"
                )

    out.write_text("".join(events), encoding="utf-8")


# ---------------------------------------------------------------------------
# FFMPEG — Fast final render using pre-rendered background
# ---------------------------------------------------------------------------
async def _render_video_fast(bg: Path, ass: Path,
                             out: Path,
                             avatar: Path | None = None) -> tuple[int, str]:
    """
    Overlay ASS karaoke text (and optionally the singer avatar) onto the
    pre-rendered aurora+waveform+audio background video.
    Audio is stream-copied → no re-encoding.  Runs in ~20-60 s vs 3-5 min.
    """
    ass_path   = str(ass).replace("\\", "/")
    fonts_path = str(FONTS_DIR).replace("\\", "/")

    # Detect whether the pre-render is 360p (new fast path) or 720p (legacy).
    # If 360p, upscale to 1280×720 before overlaying ASS so text positions match.
    import subprocess as _sp
    _probe = _sp.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0",
         "-show_entries", "stream=width", "-of", "default=noprint_wrappers=1:nokey=1",
         str(bg)],
        capture_output=True, text=True)
    bg_width = int(_probe.stdout.strip() or "1280")
    upscale_filter = "scale=1280:720:flags=bilinear[bg720];" if bg_width < 1280 else ""
    bg_ref = "[bg720]" if upscale_filter else "[0:v]"

    wm_path = str(WATERMARK).replace("\\", "/")
    wm_input_flag = WATERMARK.exists()
    wm_scale = "scale=48:48:flags=bilinear,format=rgba"
    wm_opacity = "colorchannelmixer=aa=0.55"

    fast_timeout = 300

    if avatar and avatar.exists():
        pulse   = "0.88+0.12*sin(6.2832*T/4.0)"
        opacity = "0.82"
        fc = (
            upscale_filter +
            f"[1:v]format=rgba,"
            "scale=trunc(oh*a/2)*2:720:flags=bilinear,"
            "format=rgba,"
            "split=2[av_a][av_b];"
            f"[av_a]alphaextract,geq=lum='p(X,Y)*{opacity}'[av_mask];"
            f"[av_b]format=rgb24,"
            f"geq=r='r(X,Y)*({pulse})':g='g(X,Y)*({pulse})':b='b(X,Y)*({pulse})'[av_rgb];"
            "[av_rgb][av_mask]alphamerge[singer];"
            f"{bg_ref}[singer]overlay=(W-w)/2:0[bg_singer];"
        )
        if wm_input_flag:
            fc += (
                f"[2:v]{wm_scale},{wm_opacity}[wm];"
                "[bg_singer][wm]overlay=W-w-16:16[bg_wm];"
                f"[bg_wm]ass={ass_path}:fontsdir={fonts_path}[out]"
            )
        else:
            fc += f"[bg_singer]ass={ass_path}:fontsdir={fonts_path}[out]"
        inputs = ["-i", str(bg), "-loop", "1", "-i", str(avatar)]
        if wm_input_flag:
            inputs += ["-loop", "1", "-i", wm_path]
        return await run_cmd(
            "ffmpeg", "-y", "-threads", "0",
            *inputs,
            "-filter_complex", fc,
            "-map", "[out]", "-map", "0:a",
            *_vcodec_args(),
            "-c:a", "copy",
            "-pix_fmt", "yuv420p",
            "-movflags", "+faststart",
            "-shortest", str(out),
            timeout=fast_timeout,
        )
    else:
        if wm_input_flag:
            fc = (
                upscale_filter +
                f"[1:v]{wm_scale},{wm_opacity}[wm];"
                f"{bg_ref}[wm]overlay=W-w-16:16[bg_wm];"
                f"[bg_wm]ass={ass_path}:fontsdir={fonts_path}[out]"
            )
            return await run_cmd(
                "ffmpeg", "-y", "-threads", "0",
                "-i", str(bg),
                "-loop", "1", "-i", wm_path,
                "-filter_complex", fc,
                "-map", "[out]", "-map", "0:a",
                *_vcodec_args(),
                "-c:a", "copy",
                "-pix_fmt", "yuv420p",
                "-movflags", "+faststart",
                str(out),
                timeout=fast_timeout,
            )
        else:
            fc = upscale_filter + f"{bg_ref}ass={ass_path}:fontsdir={fonts_path}[out]"
            return await run_cmd(
                "ffmpeg", "-y", "-threads", "0",
                "-i", str(bg),
                "-filter_complex", fc,
                "-map", "[out]", "-map", "0:a",
                *_vcodec_args(),
                "-c:a", "copy",
                "-pix_fmt", "yuv420p",
                "-movflags", "+faststart",
                str(out),
                timeout=fast_timeout,
            )


# ---------------------------------------------------------------------------
# FFMPEG — Cinematic karaoke video renderer (fallback, no pre-render)
# ---------------------------------------------------------------------------
async def _render_video(no_vocals: Path, ass: Path,
                        out: Path, duration: float,
                        avatar: Path | None = None) -> tuple[int, str]:
    ass_path   = str(ass).replace("\\", "/")
    fonts_path = str(FONTS_DIR).replace("\\", "/")

    FPS = 20   # 20 fps — adequate for karaoke text, 33% fewer frames than 30

    aurora_expr = (
        f"color=s=96x54:r={FPS}:d={duration}:c=0x030310[tiny];"
        "[tiny]geq="
        "r='clip("
        "50*sin(6.28*X/96+6.28*T/12)*sin(6.28*Y/54+6.28*T/8)"
        "+45*sin(6.28*(X+Y)/120+6.28*T/15)"
        "+20,0,255)':"
        "g='clip("
        "18*sin(6.28*X/72-6.28*T/14)*cos(6.28*Y/54+6.28*T/11)"
        "+15*sin(6.28*(X-Y)/100+6.28*T/22)"
        "+8,0,160)':"
        "b='clip("
        "170*sin(6.28*Y/54+6.28*T/9)"
        "+80*sin(6.28*X/96-6.28*T/11)"
        "+50*sin(6.28*(X+Y)/80+6.28*T/17)"
        "+80,0,255)'"
        "[tiny_aurora];"
        "[tiny_aurora]scale=1280:720:flags=bilinear[aurora];"
        "[aurora]gblur=sigma=6[bg_blurred];"
    )

    wave_expr = (
        f"[0:a]showwaves=s=1280x80:mode=cline:rate={FPS}:"
        "colors=0x00FFFFFF|0xFF44CCFF|0x9333EAFF:scale=sqrt[wv];"
    )

    wm_path = str(WATERMARK).replace("\\", "/")
    wm_input_flag = WATERMARK.exists()
    wm_scale = "scale=48:48:flags=bilinear,format=rgba"
    wm_opacity = "colorchannelmixer=aa=0.55"

    def _wm_overlay(prev_label: str) -> str:
        if not wm_input_flag:
            return f"[{prev_label}]ass={ass_path}:fontsdir={fonts_path}[out]"
        wm_idx = "2" if avatar and avatar.exists() else "1"
        return (
            f"[{wm_idx}:v]{wm_scale},{wm_opacity}[wm];"
            f"[{prev_label}][wm]overlay=W-w-16:16[v_wm];"
            f"[v_wm]ass={ass_path}:fontsdir={fonts_path}[out]"
        )

    def compose_no_avatar():
        return (
            aurora_expr +
            wave_expr +
            "[bg_blurred][wv]overlay=0:640[v1];" +
            _wm_overlay("v1")
        )

    def compose_with_avatar():
        pulse   = "0.88+0.12*sin(6.2832*T/4.0)"
        opacity = "0.82"
        return (
            aurora_expr +
            wave_expr +
            "[1:v]format=rgba,"
            "scale=trunc(oh*a/2)*2:720:flags=bilinear,"
            "format=rgba,"
            "split=2[av_a][av_b];"
            f"[av_a]alphaextract,geq=lum='p(X,Y)*{opacity}'[av_mask];"
            f"[av_b]format=rgb24,"
            f"geq=r='r(X,Y)*({pulse})'"
            f":g='g(X,Y)*({pulse})'"
            f":b='b(X,Y)*({pulse})'[av_rgb];"
            "[av_rgb][av_mask]alphamerge[singer];"
            "[bg_blurred][singer]overlay=(W-w)/2:0[bg_singer];"
            "[bg_singer][wv]overlay=0:640[v1];" +
            _wm_overlay("v1")
        )

    base_inputs = [
        "-i", str(no_vocals),
    ]

    render_timeout = max(duration * 3, 300)

    if avatar and avatar.exists():
        fg = compose_with_avatar()
        inputs = base_inputs + ["-loop", "1", "-i", str(avatar)]
        if wm_input_flag:
            inputs += ["-loop", "1", "-i", wm_path]
        return await run_cmd(
            "ffmpeg", "-y", "-threads", "0",
            *inputs,
            "-filter_complex", fg,
            "-map", "[out]", "-map", "0:a",
            *_vcodec_args(),
            "-c:a", "aac", "-b:a", "96k",
            "-r", str(FPS), "-pix_fmt", "yuv420p",
            "-movflags", "+faststart",
            "-shortest", str(out),
            timeout=render_timeout,
        )
    else:
        fg = compose_no_avatar()
        inputs = list(base_inputs)
        if wm_input_flag:
            inputs += ["-loop", "1", "-i", wm_path]
        return await run_cmd(
            "ffmpeg", "-y", "-threads", "0",
            *inputs,
            "-filter_complex", fg,
            "-map", "[out]", "-map", "0:a",
            *_vcodec_args(),
            "-c:a", "aac", "-b:a", "96k",
            "-r", str(FPS), "-pix_fmt", "yuv420p",
            "-movflags", "+faststart",
            "-shortest", str(out),
            timeout=render_timeout,
        )


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
def _load_whisper_model():
    """Load (or return cached) Whisper model. Called in _whisper_executor thread."""
    global _whisper_model
    if _whisper_model is None:
        print(f"[whisper] Loading {WHISPER_MODEL}…", flush=True)
        # NOTE: torch.set_num_threads() NOT called here — set once at module level.
        # faster-whisper / ctranslate2 manages its OWN thread pool independently
        # of PyTorch, so cpu_threads=6 doesn't compete with Demucs's PyTorch threads.
        from faster_whisper import WhisperModel
        compute = "float16" if WHISPER_DEVICE == "cuda" else "int8"
        _whisper_model = WhisperModel(
            WHISPER_MODEL,
            device=WHISPER_DEVICE,
            compute_type=compute,     # float16 on GPU (faster), int8 on CPU
            cpu_threads=6,            # only used on CPU; ignored on GPU
            num_workers=2,
        )
        print(f"[whisper] {WHISPER_MODEL} ready.", flush=True)
    return _whisper_model


def _run_whisper_sync(audio_path: Path, job_id: str, audio_dur: float,
                      language_hint: Optional[str] = None) -> tuple[list[dict], str]:
    """
    Maximum-accuracy Whisper transcription for song lyrics.
    Runs inside _whisper_executor thread (serial with Demucs — no OOM risk).

    language_hint options:
    - None / "auto"      → auto-detect (default)
    - "sacred_he"        → Biblical / liturgical Hebrew (לשון הקודש, פיוטים)
    - "yi"               → Yiddish (ייִדיש) — forces yi language code
    - Any Whisper code   → e.g. "he", "ar", "en", "es" — passed directly

    Key accuracy settings:
    - vad_filter=True   : VAD pre-filters silence → fewer hallucinations
    - beam_size=10      : wider beam search → better word selection
    - temperature full  : full fallback cascade [0.0 .. 1.0]
    - condition_on_prev : Whisper uses prior text as context → better lyric flow
    - hallucination_silence_threshold: silence > 2 s with text = hallucination
    - repetition_penalty=1.1: mild penalty prevents looping lyric repetition
    - no_speech_threshold=0.35: tighter filter → less non-vocal noise mis-transcribed
    """
    wmodel = _load_whisper_model()

    # ── Resolve language + initial_prompt from hint ───────────────────────────
    hint = (language_hint or "auto").strip().lower()

    if hint in ("sacred_he", "lashon_kodesh", "liturgical_he", "he_liturgical"):
        whisper_lang      = "he"
        initial_prompt    = (
            "מילות פיוט ותפילה בלשון הקודש. "
            "שיר קדוש עם מילים עתיקות:"
        )
        print(f"[whisper] Language mode: לשון הקודש (sacred Hebrew, he)")

    elif hint == "yi":
        whisper_lang   = "yi"
        initial_prompt = "ייִדישע לידער. ווערטער פון אַ ייִדישן ליד:"
        print(f"[whisper] Language mode: Yiddish (yi)")

    elif hint == "ja":
        whisper_lang   = "ja"
        initial_prompt = "日本語の歌詞。カラオケの歌の言葉："
        print(f"[whisper] Language mode: Japanese (ja)")

    elif hint in ("zh", "zh-cn", "zh-tw", "chinese"):
        whisper_lang   = "zh"
        initial_prompt = "中文歌词。卡拉OK歌曲的歌词："
        print(f"[whisper] Language mode: Chinese (zh)")

    elif hint == "ko":
        whisper_lang   = "ko"
        initial_prompt = "한국어 가사. 노래방 노래 가사："
        print(f"[whisper] Language mode: Korean (ko)")

    elif hint == "th":
        whisper_lang   = "th"
        initial_prompt = "เนื้อเพลงภาษาไทย คาราโอเกะ："
        print(f"[whisper] Language mode: Thai (th)")

    elif hint == "vi":
        whisper_lang   = "vi"
        initial_prompt = "Lời bài hát tiếng Việt. Karaoke："
        print(f"[whisper] Language mode: Vietnamese (vi)")

    elif hint == "tl":
        whisper_lang   = "tl"
        initial_prompt = "Lyrics ng kanta sa Filipino. Karaoke："
        print(f"[whisper] Language mode: Filipino/Tagalog (tl)")

    elif hint == "id":
        whisper_lang   = "id"
        initial_prompt = "Lirik lagu bahasa Indonesia. Karaoke："
        print(f"[whisper] Language mode: Indonesian (id)")

    elif hint in ("auto", ""):
        whisper_lang   = None
        initial_prompt = "Song lyrics:"
        print(f"[whisper] Language mode: auto-detect")

    else:
        whisper_lang   = hint
        initial_prompt = "Song lyrics:"
        print(f"[whisper] Language mode: explicit={hint!r}")

    # VAD parameters tuned for music:
    # - Songs often have 0.5-2 s gaps between lines → min_silence_duration_ms=500
    # - Pad detected speech regions by 400 ms so word edges aren't clipped
    vad_params = {
        "min_silence_duration_ms": 500,
        "speech_pad_ms": 400,
        "threshold": 0.35,        # lower = more sensitive (picks up quiet singing)
    }

    # ── Common transcription kwargs ───────────────────────────────────────────
    # Speed optimisations applied here (vs original):
    #   beam_size 10→8:  still very accurate, ~20% faster beam search per segment
    #   patience  1.5→1.0: default patience; removes 50% extra beam exploration
    #   best_of   5→2:  only matters during temperature fallback (rare for clear vocals)
    # Net effect: ~25-35% faster Whisper without perceptible accuracy loss.
    common_kwargs = dict(
        word_timestamps=True,
        beam_size=8,                         # was 10 → still high quality, ~20% faster
        best_of=2,                           # was 5 → fewer fallback candidates (rare path)
        patience=1.0,                        # was 1.5 → default patience → ~25% faster beam
        length_penalty=1.0,
        temperature=[0.0, 0.2, 0.4, 0.6, 0.8, 1.0],   # full fallback cascade
        compression_ratio_threshold=2.4,    # discard repetitive / garbled segments
        log_prob_threshold=-1.0,
        no_speech_threshold=0.35,           # tighter: was 0.5 — less noise mis-transcribed
        condition_on_previous_text=True,    # use prior segment as context → better lyric flow
        prompt_reset_on_temperature=0.5,    # reset prompt context when temp rises (fallback)
        initial_prompt=initial_prompt,
        repetition_penalty=1.1,             # mild anti-loop penalty
        no_repeat_ngram_size=0,             # 0 = off (songs legitimately repeat)
        vad_filter=True,                    # SAFE: Demucs is done, no PyTorch conflict
        vad_parameters=vad_params,
        hallucination_silence_threshold=2.0,  # silence > 2 s with text → likely hallucination
        suppress_blank=True,
        language_detection_segments=3,      # use 3 segments for language detection (was 1)
        language_detection_threshold=0.3,   # lower threshold → more robust lang detection
    )

    segments_gen, info = wmodel.transcribe(
        str(audio_path),
        language=whisper_lang,              # None = auto-detect; explicit code = forced
        **common_kwargs,
    )

    detected_lang = info.language or "en"
    dur = max(info.duration, audio_dur, 1.0)
    print(f"[whisper] Detected language: {detected_lang} "
          f"(prob={info.language_probability:.2f}), duration={dur:.1f}s")

    # ── Smart Yiddish fallback: if auto-detected Hebrew with low confidence,
    #    re-run with language="yi" and pick whichever has higher avg log-prob ──
    if whisper_lang is None and detected_lang == "he" and info.language_probability < 0.60:
        print(f"[whisper] Low-confidence Hebrew ({info.language_probability:.2f}) — "
              f"trying Yiddish fallback…")
        try:
            yi_gen, yi_info = wmodel.transcribe(
                str(audio_path),
                language="yi",
                initial_prompt="ייִדישע לידער:",
                **{k: v for k, v in common_kwargs.items()
                   if k not in ("language_detection_segments", "language_detection_threshold")},
            )
            # Collect yi words to compare
            yi_words_raw: list[dict] = []
            yi_segs = list(yi_gen)
            for seg in yi_segs:
                if seg.words:
                    for w in seg.words:
                        cleaned = _clean_word(w.word)
                        if cleaned:
                            yi_words_raw.append({
                                "word": cleaned,
                                "start": round(w.start, 3),
                                "end":   round(w.end, 3),
                                "probability": round(w.probability, 3),
                            })
            if yi_words_raw:
                yi_avg = sum(w["probability"] for w in yi_words_raw) / len(yi_words_raw)
                print(f"[whisper] Yiddish avg word-prob={yi_avg:.3f} "
                      f"vs Hebrew lang-prob={info.language_probability:.2f}")
                # Use Yiddish if average word probability is clearly better
                if yi_avg > 0.55:
                    print(f"[whisper] Switching to Yiddish transcription")
                    detected_lang = "yi"
                    # yi_segs already consumed; return directly
                    words: list[dict] = yi_words_raw
                    return words, detected_lang
        except Exception as e:
            print(f"[whisper] Yiddish fallback failed: {e} — keeping Hebrew result")

    words: list[dict] = []
    for seg in segments_gen:
        if seg.words:
            for w in seg.words:
                cleaned = _clean_word(w.word)
                if cleaned:
                    words.append({
                        "word": cleaned,
                        "start": round(w.start, 3),
                        "end":   round(w.end, 3),
                        "probability": round(w.probability, 3),
                    })
        pct = min(seg.end / dur, 1.0)
        update_job(job_id, progress=int(50 + pct * 18))   # 50 → 68

    # ── CJK character-level segmentation ────────────────────────────────────
    # For Japanese/Chinese/Korean, Whisper often groups multiple characters
    # into a single "word" with one timestamp span. For karaoke, each
    # character should highlight individually. Split multi-char CJK words
    # into per-character entries with evenly distributed timestamps.
    if _is_cjk(detected_lang) and words:
        expanded: list[dict] = []
        for wd in words:
            cjk_chars = [c for c in wd["word"] if _is_cjk_char(c)]
            if len(cjk_chars) > 1 and len(wd["word"]) > 1:
                span = wd["end"] - wd["start"]
                n = len(wd["word"])
                char_dur = span / n if n > 0 else span
                for ci, ch in enumerate(wd["word"]):
                    expanded.append({
                        "word": ch,
                        "start": round(wd["start"] + ci * char_dur, 3),
                        "end":   round(wd["start"] + (ci + 1) * char_dur, 3),
                        "probability": wd["probability"],
                    })
            else:
                expanded.append(wd)
        words = expanded
        print(f"[whisper] CJK segmentation: {len(words)} character-level entries")

    words = _filter_hallucinations(words)

    return words, detected_lang


# ---------------------------------------------------------------------------
# Post-processing: remove Whisper hallucinations
# ---------------------------------------------------------------------------
_HALLUCINATION_PHRASES = {
    "תודה רבה", "תודה", "תודה לצפייה", "שלום", "לתמלול", "תודה רבה לך",
    "תודה רבה רבה", "בשם אללה", "ברוך השם",
    "thank you", "thanks for watching", "thank you for watching",
    "thanks", "subscribe", "like and subscribe", "please subscribe",
    "thank you very much", "thanks for listening",
    "شكرا", "شكرا لكم", "شكرا جزيلا",
    "merci", "merci beaucoup", "danke", "danke schön", "gracias",
}

def _filter_hallucinations(words: list[dict]) -> list[dict]:
    """
    Remove common Whisper hallucinations:
    1. Known single-word and multi-word phrases at the start/end
    2. Runs of ≥ 3 consecutive identical words collapsed to 1
    3. Known hallucination bigrams in the interior of the transcript
    """
    if not words:
        return words

    single_set = set()
    bigram_set = set()
    for p in _HALLUCINATION_PHRASES:
        parts = p.lower().split()
        if len(parts) == 1:
            single_set.add(parts[0])
        elif len(parts) == 2:
            bigram_set.add((parts[0], parts[1]))
            single_set.add(parts[0])
            single_set.add(parts[1])

    def _wl(w: dict) -> str:
        return w["word"].lower().strip()

    def _matches_boundary(idx: int, wlist: list[dict]) -> int:
        """Check if position idx starts a hallucination phrase.
        Returns number of words consumed (0 if no match)."""
        w0 = _wl(wlist[idx])
        if idx + 1 < len(wlist):
            w1 = _wl(wlist[idx + 1])
            if (w0, w1) in bigram_set:
                return 2
        if w0 in single_set:
            return 1
        return 0

    # Pass 1: Remove leading hallucination words/phrases
    start = 0
    while start < len(words):
        consumed = _matches_boundary(start, words)
        if consumed == 0:
            break
        start += consumed

    # Pass 2: Remove trailing hallucination words/phrases
    end = len(words)
    while end > start:
        w0 = _wl(words[end - 1])
        if w0 in single_set:
            end -= 1
            continue
        if end - 2 >= start:
            w_prev = _wl(words[end - 2])
            if (w_prev, w0) in bigram_set:
                end -= 2
                continue
        break

    filtered = words[start:end]

    # Pass 3: Collapse runs of ≥ 3 consecutive identical words to 1
    if len(filtered) > 2:
        result = []
        i = 0
        while i < len(filtered):
            w_lower = _wl(filtered[i])
            run_end = i + 1
            while run_end < len(filtered) and _wl(filtered[run_end]) == w_lower:
                run_end += 1
            run_len = run_end - i
            if run_len >= 3:
                result.append(filtered[i])
            else:
                result.extend(filtered[i:run_end])
            i = run_end
        filtered = result

    # Pass 4: Remove known hallucination bigrams in interior
    if len(filtered) > 2:
        result = []
        i = 0
        while i < len(filtered):
            if i + 1 < len(filtered):
                pair = (_wl(filtered[i]), _wl(filtered[i + 1]))
                if pair in bigram_set:
                    i += 2
                    continue
            result.append(filtered[i])
            i += 1
        filtered = result

    removed = len(words) - len(filtered)
    if removed > 0:
        print(f"[whisper] Hallucination filter: removed {removed} word(s)")

    return filtered


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _inference_sem
    _inference_sem = asyncio.Semaphore(1)
    _load_jobs_from_disk()
    # ── Pre-warm Whisper in a background thread at startup ────────────────────
    # Whisper (large-v3-turbo) takes ~30 s to load on first use.
    # By starting the load NOW (server startup) the first real job arrives to
    # a warm model — saving the user ~30 s of waiting.
    # Demucs stays LAZY (only loaded when a job starts) because:
    #   1. Demucs + Whisper simultaneously = >3 GB RAM → OOM risk
    #   2. Demucs is unloaded after each job anyway, so no benefit to keeping it
    def _prewarm_whisper():
        try:
            _load_whisper_model()
            print("[startup] ✓ Whisper pre-warmed — first job will skip model load", flush=True)
        except Exception as e:
            print(f"[startup] Whisper pre-warm failed (non-fatal): {e}", flush=True)
    threading.Thread(target=_prewarm_whisper, daemon=True, name="whisper-prewarm").start()
    yield

app = FastAPI(title="Karaoke Processor", lifespan=lifespan)
app.add_middleware(CORSMiddleware,
                   allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


@app.get("/processor/health")
async def health(): return {"status": "ok"}


@app.post("/processor/jobs", response_model=Job)
async def create_job(request: Request, background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    job_id = str(uuid.uuid4())
    filename = file.filename or "upload"
    jdir = job_dir(job_id)
    suffix = Path(filename).suffix or ".mp4"
    ip = jdir / f"input{suffix}"
    ip.write_bytes(await file.read())
    now = now_iso()
    jd = {"id": job_id, "status": "pending", "progress": 0,
          "filename": filename, "error": None, "words": None,
          "created_at": now, "updated_at": now}
    jobs[job_id] = jd
    _save_job_meta(job_id)
    max_dur_hdr = request.headers.get("x-max-duration")
    max_dur = float(max_dur_hdr) if max_dur_hdr else None
    lang_hint = request.headers.get("x-language-hint") or None
    background_tasks.add_task(process_job, job_id, ip, filename, max_dur, lang_hint)
    return Job(**jd)


async def _download_youtube_and_process(job_id: str, url: str,
                                         max_duration_secs: Optional[float] = None,
                                         language_hint: Optional[str] = None):
    """Download a YouTube video's audio with yt-dlp, then run the normal pipeline."""
    jdir = job_dir(job_id)
    try:
        update_job(job_id, status="downloading", progress=2)

        # ── Fetch title via --print (stdout only, stderr discarded) ──────────
        # --get-title writes to stdout; run_cmd only returns stderr → use run_cmd_stdout
        title_rc, title_out = await run_cmd_stdout(
            "yt-dlp", "--no-playlist",
            "--js-runtimes", "node", "--remote-components", "ejs:github",
            "--cache-dir", "/tmp/yt-dlp-cache",
            "--print", "%(title)s", "--simulate", url)
        raw_title = title_out.strip().splitlines()[-1] if title_out.strip() else ""
        display_name = (raw_title[:80] + "…") if len(raw_title) > 80 else raw_title
        if not display_name:
            display_name = "YouTube song"
        jobs[job_id]["filename"] = display_name
        _save_job_meta(job_id)
        print(f"[youtube] Title: {display_name!r}")

        # ── Stream download with live progress tracking ───────────────────────
        output_template = str(jdir / "input.%(ext)s")
        proc = await asyncio.create_subprocess_exec(
            "yt-dlp",
            "--no-playlist",
            "--js-runtimes", "node", "--remote-components", "ejs:github",
            "--cache-dir", "/tmp/yt-dlp-cache",
            "-f", "bestaudio/best",
            "-x",
            "--audio-format", "mp3",
            "--audio-quality", "0",
            "--no-continue",
            "--newline",            # one progress line per stdout update
            "--progress",
            "--extractor-retries", "5",
            "--retry-sleep", "3",
            "--socket-timeout", "30",
            "--no-check-certificates",
            "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "-o", output_template,
            url,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,  # capture stderr for error reporting
        )
        stderr_lines: list[str] = []
        # Parse yt-dlp progress lines:  "[download]  50.3% of ~8.00MiB at 2.50MiB/s ETA 00:02"
        async def read_stderr():
            async for raw in proc.stderr:
                ln = raw.decode(errors="replace").strip()
                if ln:
                    stderr_lines.append(ln)
                    if "ERROR" in ln:
                        print(f"[youtube] yt-dlp stderr: {ln}")
        import asyncio as _aio
        stderr_task = _aio.ensure_future(read_stderr())
        async for raw_line in proc.stdout:
            line = raw_line.decode(errors="replace").strip()
            if "[download]" in line and "%" in line:
                try:
                    pct_str = line.split("%")[0].split()[-1]
                    dl_pct = float(pct_str)
                    # Map 0-100% download → job progress 5-25%
                    update_job(job_id, progress=int(5 + dl_pct * 0.20))
                except Exception:
                    pass
        await proc.wait()
        await stderr_task
        if proc.returncode != 0:
            err_detail = "; ".join(l for l in stderr_lines if "ERROR" in l)[:200]
            raise RuntimeError(f"yt-dlp failed (exit {proc.returncode})" + (f": {err_detail}" if err_detail else ""))

        # ── Locate downloaded file ───────────────────────────────────────────
        candidates = [f for f in jdir.iterdir()
                      if f.stem == "input" and f.suffix not in {".json", ".part"}]
        if not candidates:
            raise RuntimeError("yt-dlp finished but no audio file was created")
        input_path = sorted(candidates)[-1]
        update_job(job_id, progress=26)
        print(f"[youtube] Downloaded: {input_path.name}  "
              f"({input_path.stat().st_size // 1024} KB)")

        # ── Hand off to the exact same pipeline as a file upload ─────────────
        await process_job(job_id, input_path, display_name, max_duration_secs, language_hint)

    except Exception as exc:
        print(f"[youtube] job={job_id} error: {exc}")
        update_job(job_id, status="error",
                   error=f"הורדה מ-YouTube נכשלה: {exc}")
        _save_job_meta(job_id)


@app.post("/processor/jobs/youtube", response_model=Job)
async def create_job_from_youtube(
    request: Request,
    body: YoutubeRequest,
    background_tasks: BackgroundTasks,
):
    """Accept a YouTube URL, download the audio, and run the full karaoke pipeline."""
    url = body.url.strip()
    # Accept youtube.com and youtu.be links only
    if not any(d in url for d in ("youtube.com", "youtu.be")):
        raise HTTPException(400, "חייב להיות קישור של YouTube")
    if not url.startswith(("http://", "https://")):
        raise HTTPException(400, "קישור לא תקין")

    job_id = str(uuid.uuid4())
    now = now_iso()
    jd = {
        "id": job_id, "status": "pending", "progress": 0,
        "filename": "Downloading from YouTube…", "error": None, "words": None,
        "created_at": now, "updated_at": now,
    }
    jobs[job_id] = jd
    _save_job_meta(job_id)
    max_dur_hdr = request.headers.get("x-max-duration")
    max_dur = float(max_dur_hdr) if max_dur_hdr else None
    lang_hint = request.headers.get("x-language-hint") or None
    background_tasks.add_task(_download_youtube_and_process, job_id, url, max_dur, lang_hint)
    return Job(**jd)


@app.get("/processor/jobs", response_model=list[Job])
async def list_jobs():
    return [Job(**j) for j in sorted(jobs.values(),
                                     key=lambda x: x["created_at"], reverse=True)]


@app.get("/processor/jobs/{jid}", response_model=Job)
async def get_job(jid: str):
    if jid not in jobs:
        raise HTTPException(404, "Not found")
    return Job(**jobs[jid])


@app.delete("/processor/jobs/{jid}", response_model=DeleteResponse)
async def delete_job(jid: str):
    if jid not in jobs:
        raise HTTPException(404, "Not found")
    # Mark as cancelled BEFORE removing the directory so that any
    # background task (Demucs / Whisper / render) can detect it and exit
    # cleanly instead of crashing on a missing path.
    _cancelled_jobs.add(jid)
    _prerender_events.pop(jid, None)
    jobs.pop(jid)
    d = JOBS_DIR / jid
    if d.exists():
        shutil.rmtree(d)
    return DeleteResponse(ok=True)


@app.put("/processor/jobs/{jid}/lyrics")
async def update_lyrics_and_render(
    jid: str,
    body: LyricsUpdateRequest,
    background_tasks: BackgroundTasks
):
    if jid not in jobs:
        raise HTTPException(404, "Not found")
    allowed = {"awaiting_review", "done", "error"}
    if jobs[jid]["status"] not in allowed:
        raise HTTPException(409, f"Cannot edit lyrics while status is '{jobs[jid]['status']}'")
    words = [w.model_dump() for w in body.words]
    # Persist corrected transcription — this is the source of truth going forward
    (JOBS_DIR / jid / "words.json").write_text(
        json.dumps(words, ensure_ascii=False, indent=2))
    # Remove old video so render_job produces a fresh one with the new lyrics
    old_video = JOBS_DIR / jid / "karaoke.mp4"
    if old_video.exists():
        old_video.unlink(missing_ok=True)
    update_job(jid, words=words, status="rendering", progress=72)
    background_tasks.add_task(render_job, jid)
    return Job(**jobs[jid])


def _process_avatar(raw_path: Path, out_path: Path) -> None:
    """
    Remove background from profile photo and add a neon purple edge glow.
    The full-size RGBA PNG is saved for FFmpeg to scale/composite as the
    video background (singer fills the whole backdrop).
    """
    from rembg import remove
    from PIL import Image, ImageFilter

    # 1. Remove background — rembg returns RGBA bytes
    with open(raw_path, "rb") as f:
        raw_data = f.read()
    nobg = remove(raw_data)
    img  = Image.open(io.BytesIO(nobg)).convert("RGBA")

    # 2. Upscale to at least 1280 px on longest side so FFmpeg has
    #    enough resolution when scaling to fill the 1280×720 canvas.
    max_side = max(img.width, img.height)
    if max_side < 1280:
        scale = 1280 / max_side
        img = img.resize(
            (int(img.width * scale), int(img.height * scale)),
            Image.LANCZOS,
        )

    # 3. Build a neon purple glow layer from the subject's alpha silhouette.
    #    We blur the alpha channel at multiple radii to create a soft halo.
    alpha_ch = img.split()[3]

    glow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    for blur_r, strength in [(40, 0.25), (20, 0.45), (10, 0.65), (4, 0.80)]:
        blurred = alpha_ch.filter(ImageFilter.GaussianBlur(blur_r))
        # Scale blurred mask by strength
        blurred_scaled = blurred.point(lambda p: int(p * strength))
        layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
        layer.paste(Image.new("RGB", img.size, (147, 51, 234)), mask=blurred_scaled)
        glow = Image.alpha_composite(glow, layer)

    # 4. Composite: glow behind the person
    result = Image.new("RGBA", img.size, (0, 0, 0, 0))
    result = Image.alpha_composite(result, glow)
    result = Image.alpha_composite(result, img)

    result.save(out_path, "PNG")


@app.post("/processor/jobs/{jid}/avatar")
async def upload_avatar(jid: str, file: UploadFile = File(...)):
    if jid not in jobs:
        raise HTTPException(404, "Not found")
    jdir = job_dir(jid)
    raw_bytes = await file.read()
    suffix = Path(file.filename or "avatar.jpg").suffix or ".jpg"
    raw_path = jdir / f"avatar_raw{suffix}"
    raw_path.write_bytes(raw_bytes)

    # Process avatar in thread so we don't block the event loop
    processed_path = jdir / "avatar_processed.png"
    loop = asyncio.get_event_loop()
    try:
        await loop.run_in_executor(None, _process_avatar, raw_path, processed_path)
    except Exception as e:
        # Fallback: use original if rembg fails
        import shutil as _sh
        _sh.copy(raw_path, processed_path)

    return {"ok": True}


@app.post("/processor/jobs/{jid}/retry")
async def retry_job(jid: str, background_tasks: BackgroundTasks):
    """
    Retry a failed job. Behaviour depends on what files exist on disk:
      - stems + words  → skip straight to rendering (no re-upload needed)
      - words only     → reset to awaiting_review (user re-confirms, then render)
      - nothing        → 409 (must re-upload)
    """
    if jid not in jobs:
        raise HTTPException(404, "Not found")
    retryable = {"error", "done"}
    stuck_statuses = {"pending", "queued", "separating", "transcribing", "rendering"}
    if jobs[jid]["status"] in stuck_statuses:
        updated = jobs[jid].get("updated_at", "")
        try:
            from datetime import timezone
            last = datetime.fromisoformat(updated.rstrip("Z")).replace(tzinfo=timezone.utc)
            stale_secs = (datetime.now(timezone.utc) - last).total_seconds()
        except Exception:
            stale_secs = 999
        if stale_secs > 120:
            print(f"[retry] Job {jid} stuck in '{jobs[jid]['status']}' for {stale_secs:.0f}s — allowing retry")
            retryable = retryable | stuck_statuses
    if jobs[jid]["status"] not in retryable:
        raise HTTPException(409, "Job must be in error or done state to retry")

    jdir = JOBS_DIR / jid
    has_stems = (jdir / "stems_paths.json").exists()
    has_words = (jdir / "words.json").exists()

    if has_stems and has_words:
        # Can go straight to rendering
        words = json.loads((jdir / "words.json").read_text())
        update_job(jid, status="rendering", progress=72, error=None, words=words)
        background_tasks.add_task(render_job, jid)
        return Job(**jobs[jid])
    elif has_words:
        # Need user to re-confirm (stems lost but words saved)
        words = json.loads((jdir / "words.json").read_text())
        update_job(jid, status="awaiting_review", progress=70, error=None, words=words)
        return Job(**jobs[jid])
    else:
        raise HTTPException(409, "No recoverable data — please re-upload the file")


@app.get("/processor/jobs/{jid}/video")
async def get_video(jid: str, request: Request):
    p = JOBS_DIR / jid / "karaoke.mp4"
    if not p.exists():
        if jid in jobs and jobs[jid]["status"] != "done":
            raise HTTPException(409, "Not done yet")
        raise HTTPException(404, "File not found")

    file_size = p.stat().st_size
    range_header = request.headers.get("range")

    if range_header:
        range_match = re.match(r"bytes=(\d+)-(\d*)", range_header)
        if range_match:
            start = int(range_match.group(1))
            end = int(range_match.group(2)) if range_match.group(2) else file_size - 1
            end = min(end, file_size - 1)
            chunk_size = end - start + 1

            async def stream_range():
                with open(p, "rb") as f:
                    f.seek(start)
                    remaining = chunk_size
                    while remaining > 0:
                        read_size = min(remaining, 65536)
                        data = f.read(read_size)
                        if not data:
                            break
                        remaining -= len(data)
                        yield data

            from starlette.responses import StreamingResponse
            return StreamingResponse(
                stream_range(),
                status_code=206,
                media_type="video/mp4",
                headers={
                    "Content-Range": f"bytes {start}-{end}/{file_size}",
                    "Accept-Ranges": "bytes",
                    "Content-Length": str(chunk_size),
                    "Cache-Control": "public, max-age=3600",
                },
            )

    return FileResponse(str(p), media_type="video/mp4",
                        filename=f"karaoke_{jid[:8]}.mp4",
                        headers={
                            "Content-Disposition": f'inline; filename="karaoke_{jid[:8]}.mp4"',
                            "Accept-Ranges": "bytes",
                            "Content-Length": str(file_size),
                            "Cache-Control": "public, max-age=3600",
                        })


@app.get("/processor/jobs/{jid}/instrumental")
async def get_instrumental(jid: str):
    p = JOBS_DIR / jid / "instrumental.wav"
    if not p.exists():
        if jid in jobs and jobs[jid]["status"] != "done":
            raise HTTPException(409, "Not done yet")
        raise HTTPException(404, "File not found")
    return FileResponse(str(p), media_type="audio/wav",
                        filename=f"instrumental_{jid[:8]}.wav")


@app.get("/processor/jobs/{jid}/vocals")
async def get_vocals(jid: str):
    """Return the Demucs-separated reference vocal for auto-alignment."""
    jdir = JOBS_DIR / jid
    # Try stems reference first, then fallback paths
    if jid in jobs and "stems" in jobs[jid]:
        vp = Path(jobs[jid]["stems"].get("vocals", ""))
        if vp.exists():
            return FileResponse(str(vp), media_type="audio/wav",
                                filename=f"vocals_{jid[:8]}.wav")
    for name in ("vocals_16k.wav", "vocals.wav"):
        p = jdir / name
        if p.exists():
            return FileResponse(str(p), media_type="audio/wav",
                                filename=f"vocals_{jid[:8]}.wav")
    if jid in jobs and jobs[jid]["status"] != "done":
        raise HTTPException(409, "Not done yet")
    raise HTTPException(404, "Vocals file not found")


@app.get("/processor/jobs/{jid}/lyrics")
async def get_lyrics(jid: str):
    # Prefer in-memory (most up-to-date)
    if jid in jobs:
        words = jobs[jid].get("words") or []
        return {"words": words}
    # Fallback: disk (works after restart)
    p = JOBS_DIR / jid / "words.json"
    if p.exists():
        return {"words": json.loads(p.read_text())}
    raise HTTPException(404, "Not found")



# ──────────────────────────────────────────────────────────────────────────────
# SERVER-SIDE VOCAL PERFORMANCE SCORING
# Uses librosa.pyin (probabilistic YIN) to extract pitch from both the
# reference vocal (Demucs stem) and the singer's recording, then compares
# them frame-by-frame at semitone resolution — same methodology as SingStar.
# ──────────────────────────────────────────────────────────────────────────────

def _score_performance_sync(
    ref_path: Path,
    perf_path: Path,
    words_path: Optional[Path],
) -> dict:
    """
    Real pitch-accurate vocal scoring using librosa.pyin.

    Algorithm:
    1. Load reference vocal (Demucs stem) + user recording at 16 kHz.
    2. Extract f0 (fundamental frequency) + voiced flags from both using pyin.
    3. For frames where BOTH have a clear pitch, compute semitone distance.
    4. Grade tiers: perfect ≤0.5 st, good ≤1.5 st, ok ≤3.0 st — like SingStar.
    5. Stability = low pitch variance within note windows.
    6. Timing = % of lyric words where user was voiced.
    7. Overall = weighted combination.
    """
    import librosa
    import numpy as np

    SR  = 16_000           # 16 kHz — enough for pitch; 5× faster than 44.1 kHz
    HOP = 512              # ~32 ms per frame at 16 kHz
    FMIN = librosa.note_to_hz("C2")   # 65 Hz  — low bass
    FMAX = librosa.note_to_hz("C7")   # 2093 Hz — high soprano

    # ── Load audio ────────────────────────────────────────────────────────────
    ref_audio,  _ = librosa.load(str(ref_path),  sr=SR, mono=True)
    perf_audio, _ = librosa.load(str(perf_path), sr=SR, mono=True)

    # Trim to the shorter duration (user may have stopped early)
    min_len = min(len(ref_audio), len(perf_audio))
    ref_audio  = ref_audio[:min_len]
    perf_audio = perf_audio[:min_len]

    print(f"[score] ref={len(ref_audio)/SR:.1f}s  perf={len(perf_audio)/SR:.1f}s  at {SR} Hz")

    # ── Pitch extraction — pyin is the state-of-the-art for monophonic pitch ─
    ref_f0,  ref_voiced,  _ = librosa.pyin(
        ref_audio,  sr=SR, fmin=FMIN, fmax=FMAX, hop_length=HOP)
    perf_f0, perf_voiced, _ = librosa.pyin(
        perf_audio, sr=SR, fmin=FMIN, fmax=FMAX, hop_length=HOP)

    n_ref_frames  = len(ref_f0)
    n_perf_frames = len(perf_f0)
    n_frames      = min(n_ref_frames, n_perf_frames)

    ref_f0    = ref_f0[:n_frames];   ref_voiced  = ref_voiced[:n_frames]
    perf_f0   = perf_f0[:n_frames];  perf_voiced = perf_voiced[:n_frames]

    # ── Pitch accuracy ────────────────────────────────────────────────────────
    # Only compare frames where BOTH have a clear voiced note.
    both_mask = ref_voiced & perf_voiced
    n_both    = int(np.sum(both_mask))

    if n_both >= 10:
        ref_hz  = ref_f0[both_mask]
        perf_hz = perf_f0[both_mask]
        # Absolute semitone error (0 = perfect, 12 = octave off)
        st_err = np.abs(12.0 * np.log2(np.clip(perf_hz / ref_hz, 1e-6, 1e6)))
        pct_perfect = float(np.mean(st_err <= 0.5))
        pct_good    = float(np.mean(st_err <= 1.5))
        pct_ok      = float(np.mean(st_err <= 3.0))
        # Weighted pitch score (100 = perfect intonation)
        pitch_score = int(pct_perfect * 50 + (pct_good - pct_perfect) * 30
                          + (pct_ok - pct_good) * 15)
        pitch_score = max(0, min(100, pitch_score))
        mean_st_err   = float(np.mean(st_err))
        median_st_err = float(np.median(st_err))
    else:
        pitch_score   = 0
        mean_st_err   = -1.0
        median_st_err = -1.0
        pct_ok        = 0.0

    # ── Coverage: % of reference vocal frames where user also sang ────────────
    n_ref_voiced  = int(np.sum(ref_voiced))
    n_perf_voiced = int(np.sum(perf_voiced))
    coverage = n_both / max(n_ref_voiced, 1)
    coverage_score = max(0, min(100, int(coverage * 100)))

    # ── Stability: pitch std-dev inside note windows ──────────────────────────
    stability_score = 70   # sensible default if not enough data
    if n_perf_voiced >= 30:
        perf_hz_v = perf_f0[perf_voiced]
        med        = float(np.median(perf_hz_v))
        if med > 0:
            semitones  = 12.0 * np.log2(np.clip(perf_hz_v / med, 1e-6, 1e6))
            win        = 15    # ~0.5 s window
            stds       = [float(np.std(semitones[i:i + win]))
                          for i in range(0, len(semitones) - win, win // 2)]
            if stds:
                avg_std      = float(np.mean(stds))
                # avg_std 0→perfect, ~3→unstable; map to 0-100
                stability_score = max(0, min(100, int(100 - avg_std * 25)))

    # ── Timing: % of lyric words the singer voiced ────────────────────────────
    timing_score = coverage_score   # fallback
    if words_path and words_path.exists():
        try:
            words_data = json.loads(words_path.read_text())
            if isinstance(words_data, list) and words_data:
                frame_dur    = HOP / SR
                words_sung   = 0
                for w in words_data:
                    sf = max(0, int(w.get("start", 0) / frame_dur))
                    ef = min(n_frames, int(w.get("end",   0) / frame_dur) + 1)
                    if ef > sf and np.any(perf_voiced[sf:ef]):
                        words_sung += 1
                timing_score = max(0, min(100, int(words_sung / len(words_data) * 100)))
        except Exception as e:
            print(f"[score] timing calc failed: {e}")

    # ── Overall weighted score ────────────────────────────────────────────────
    overall = max(0, min(100, int(
        pitch_score    * 0.50 +
        timing_score   * 0.30 +
        stability_score * 0.20
    )))

    # Stars 1-5
    stars = 1
    if overall >= 90: stars = 5
    elif overall >= 74: stars = 4
    elif overall >= 55: stars = 3
    elif overall >= 35: stars = 2

    # Entertaining "artist match" % (similar to Smule)
    artist_match = min(97, int(overall * 0.82 + float(np.random.uniform(3, 10))))

    print(f"[score] pitch={pitch_score}  timing={timing_score}  "
          f"stability={stability_score}  overall={overall}  stars={stars}  "
          f"mean_st_err={mean_st_err:.2f}  coverage={coverage:.2f}")

    return {
        "overall":    overall,
        "pitch":      pitch_score,
        "timing":     timing_score,
        "stability":  stability_score,
        "coverage":   round(coverage, 3),
        "stars":      stars,
        "artistMatch": artist_match,
        "details": {
            "meanSemitoneError":   round(mean_st_err,   2),
            "medianSemitoneError": round(median_st_err, 2),
            "voicedFrames":        n_perf_voiced,
            "refVoicedFrames":     n_ref_voiced,
            "overlappingFrames":   n_both,
            "pctPitchOk":          round(pct_ok, 3),
        },
    }


@app.post("/processor/jobs/{jid}/score-performance")
async def score_performance_endpoint(jid: str, file: UploadFile = File(...)):
    """
    Accept a WAV recording of the user singing, compare it to the reference
    Demucs vocal stem, and return pitch-accurate performance scores.
    """
    if jid not in jobs:
        raise HTTPException(404, "Job not found")

    jdir       = job_dir(jid)
    stems_file = jdir / "stems_paths.json"
    if not stems_file.exists():
        raise HTTPException(409, "Processing not complete — stems not available yet")

    stems          = json.loads(stems_file.read_text())
    ref_vocal_path = Path(stems["vocals"])
    if not ref_vocal_path.exists():
        # Fall back to vocals_16k if full-quality is missing
        ref_vocal_path = jdir / "vocals_16k.wav"
    if not ref_vocal_path.exists():
        raise HTTPException(404, "Reference vocal file not found")

    words_path = jdir / "words.json"

    perf_bytes = await file.read()
    if len(perf_bytes) < 4_000:   # < 4 KB ≈ empty
        raise HTTPException(400, "Recording too short or empty")

    perf_path = jdir / f"perf_{uuid.uuid4().hex[:8]}.wav"
    perf_path.write_bytes(perf_bytes)

    try:
        loop   = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,   # default thread pool — doesn't block Whisper/Demucs executors
            _score_performance_sync,
            ref_vocal_path,
            perf_path,
            words_path if words_path.exists() else None,
        )
        return JSONResponse(result)
    except Exception as exc:
        print(f"[score] job={jid} error: {exc}")
        raise HTTPException(500, f"Scoring failed: {exc}")
    finally:
        perf_path.unlink(missing_ok=True)


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
