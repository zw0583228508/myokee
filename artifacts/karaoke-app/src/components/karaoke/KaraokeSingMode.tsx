import { useState, useRef, useEffect, useCallback } from "react";
import {
  Mic, Square, Download, X, Music, RefreshCw, MicOff,
  Share2, Trophy, Volume2, Star, SlidersHorizontal, ChevronDown, ChevronUp,
  PlayCircle, StopCircle, Sliders, Cloud, CheckCircle2, Loader2,
} from "lucide-react";
import { useSavePerformance, usePublishPerformance } from "@/hooks/use-performances";
import { useAwardXP } from "@/hooks/use-gamification";
import { useCloudRecording } from "@/hooks/use-cloud-recording";
import { apiUrl, authFetchOptions } from "@/lib/api";

// ── Types ────────────────────────────────────────────────────────────────────
export interface WordTimestamp { word: string; start: number; end: number; }

interface Line { words: WordTimestamp[]; startTime: number; endTime: number; }

interface PerformanceResult {
  score: number;
  timingScore: number;
  pitchScore: number;
  stabilityScore?: number;    // server-scored: pitch stability (0-100)
  wordsCovered: number;
  totalWords: number;
  stars: number;
  artistMatch: number;
  highlightStart: number;
  serverScored?: boolean;     // true = scores came from pyin analysis
}

interface AudioEffects {
  reverbWet: number;      // 0-100
  reverbDecay: number;    // 0-100 (maps to 0.5-6s)
  delayTime: number;      // 0-100 (maps to 0-0.8s)
  delayFeedback: number;  // 0-100
  delayWet: number;       // 0-100
  eqBass: number;         // -12 to +12 dB
  eqMid: number;          // -12 to +12 dB
  eqHigh: number;         // -12 to +12 dB
  preGain: number;        // 0-250 — mic input gain
  instrGain: number;      // 0-300 — backing track (playback) volume
}

export interface KaraokeSingModeProps {
  audioUrl: string;
  videoUrl?: string;
  words: WordTimestamp[];
  songName: string;
  jobId: string;
  onClose: () => void;
  challengerName?: string;
  challengerScore?: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function toLines(words: WordTimestamp[]): Line[] {
  if (!words.length) return [];
  const lines: Line[] = [];
  let cur: WordTimestamp[] = [words[0]];
  for (let i = 1; i < words.length; i++) {
    const gap = words[i].start - words[i - 1].end;
    if (gap > 1.4 || cur.length >= 9) {
      lines.push({ words: cur, startTime: cur[0].start, endTime: cur[cur.length - 1].end });
      cur = [];
    }
    cur.push(words[i]);
  }
  if (cur.length) lines.push({ words: cur, startTime: cur[0].start, endTime: cur[cur.length - 1].end });
  return lines;
}

function findLastIdx<T>(arr: T[], pred: (v: T) => boolean): number {
  for (let i = arr.length - 1; i >= 0; i--) if (pred(arr[i])) return i;
  return -1;
}

function getDominantFreq(freqData: Float32Array, sampleRate: number, fftSize: number): number {
  let maxDb = -Infinity, maxIdx = 0;
  for (let i = 1; i < freqData.length; i++) {
    if (freqData[i] > maxDb) { maxDb = freqData[i]; maxIdx = i; }
  }
  if (maxDb < -60) return -1;
  return (maxIdx * sampleRate) / fftSize;
}

const isVocalFreq = (f: number) => f >= 80 && f <= 1200;
const toStars = (s: number) => s >= 90 ? 5 : s >= 75 ? 4 : s >= 60 ? 3 : s >= 40 ? 2 : 1;


/**
 * Build a Freeverb-inspired Feedback Delay Network (FDN) reverb using ONLY
 * native WebAudio delay nodes — no ConvolverNode.
 *
 * WHY: ConvolverNode uses FFT-based processing that triggers Web Audio's
 * Automatic Latency Compensation (ALC).  For a 2–3 s IR, the engine can add
 * 200–340 ms of artificial delay to EVERY path in the graph (including dry),
 * causing the singer to hear themselves with a large, annoying lag.
 * Delay nodes have fixed, known delay times → no ALC overhead → zero-latency
 * live monitoring while still producing a rich reverb tail.
 *
 * Architecture:  input → 6 parallel comb filters (with LPF dampening)
 *                       → summed mix → 2 serial allpass diffusers → output
 *
 * roomSize : 0.0 – 1.0  (controls feedback / decay time)
 * damp     : 0.0 – 1.0  (0 = bright, 1 = dark / absorptive)
 *
 * Returns { input, output, fbGains, lpfNodes } so the caller can update
 * roomSize and damp live without rebuilding the graph.
 */
function buildReverbFDN(ctx: AudioContext, roomSize: number, damp: number): {
  input:    GainNode;
  output:   GainNode;
  fbGains:  GainNode[];
  lpfNodes: BiquadFilterNode[];
} {
  // Comb-filter delay lengths (samples at 44100 Hz, Freeverb original).
  // Scaled to the actual sample rate for pitch-independence.
  const COMB_SAMPLES_44K = [1116, 1188, 1277, 1356, 1422, 1491];
  const AP_SAMPLES_44K   = [556, 441];   // two diffusing allpass stages

  const scl = ctx.sampleRate / 44100;

  const inputNode  = ctx.createGain();  inputNode.gain.value  = 1;
  const mixNode    = ctx.createGain();  mixNode.gain.value    = 0.16 / COMB_SAMPLES_44K.length;
  const outputNode = ctx.createGain();  outputNode.gain.value = 1;

  const fbGains:  GainNode[]        = [];
  const lpfNodes: BiquadFilterNode[] = [];

  // ── 6 parallel comb filters ──────────────────────────────────────────────
  for (const len44k of COMB_SAMPLES_44K) {
    const dt  = (len44k * scl) / ctx.sampleRate;

    const delay = ctx.createDelay(2.0);
    delay.delayTime.value = dt;

    const lpf = ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = 400 + (1 - damp) * 7600;   // damp 0→8000Hz, 1→400Hz
    lpf.Q.value = 0.5;
    lpfNodes.push(lpf);

    const fb = ctx.createGain();
    fb.gain.value = 0.25 + roomSize * 0.70;            // roomSize 0→0.25, 1→0.95
    fbGains.push(fb);

    // input → delay → lpf → feedback gain → delay  (comb loop)
    //                  lpf → mix (output tap)
    inputNode.connect(delay);
    delay.connect(lpf);
    lpf.connect(fb);
    fb.connect(delay);   // feedback
    lpf.connect(mixNode);
  }

  // ── 2 serial allpass diffusers (approx via short delay+feedback) ─────────
  let apIn: AudioNode = mixNode;
  for (const len44k of AP_SAMPLES_44K) {
    const dt = (len44k * scl) / ctx.sampleRate;
    const apDelay = ctx.createDelay(0.1);
    apDelay.delayTime.value = dt;
    const apFb = ctx.createGain();
    apFb.gain.value = 0.5;
    apIn.connect(apDelay);
    apDelay.connect(apFb);
    apFb.connect(apDelay);   // feedback (diffusion)
    apIn = apDelay;
  }
  (apIn as AudioNode).connect(outputNode);

  return { input: inputNode, output: outputNode, fbGains, lpfNodes };
}

/**
 * Harmonic exciter curve (tanh soft saturation).
 * Adds warm 2nd/3rd order harmonics — makes voice sound richer without distorting.
 * drive: 0=bypass, 100=heavy saturation. Best between 15-40 for vocal enhancement.
 */
function makeExciterCurve(drive: number): Float32Array {
  const n    = 512;
  const k    = 1 + drive * 0.018;
  const norm = Math.tanh(k);
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x  = (i * 2) / n - 1;
    curve[i] = Math.tanh(x * k) / norm;
  }
  return curve;
}

// ── Default effects ───────────────────────────────────────────────────────────
const DEFAULT_EFFECTS: AudioEffects = {
  reverbWet:      45,
  reverbDecay:    55,
  delayTime:      28,
  delayFeedback:  35,
  delayWet:       25,
  eqBass:         0,
  eqMid:          0,
  eqHigh:         0,
  preGain:        130,
  instrGain:      175,
};

// ── Component ────────────────────────────────────────────────────────────────
export function KaraokeSingMode({
  audioUrl, videoUrl, words, songName, jobId, onClose, challengerName, challengerScore,
}: KaraokeSingModeProps) {
  const audioRef     = useRef<HTMLAudioElement>(null);
  const videoRef     = useRef<HTMLVideoElement>(null);
  const ctxRef          = useRef<AudioContext | null>(null);
  const instrSrcRef     = useRef<AudioBufferSourceNode | null>(null); // AudioContext playback node
  const recNodeRef      = useRef<AudioWorkletNode | null>(null);
  const pcmChunksRef    = useRef<Float32Array[]>([]);
  const songStartCtxRef = useRef<number>(0);   // ctx.currentTime when instrumental starts
  const pcmFirstTimeRef = useRef<number>(-1);  // ctx.currentTime of the first recorded sample
  const pcmSrRef        = useRef<number>(48000);
  const barsRef      = useRef<HTMLDivElement>(null);
  const rafRef       = useRef<number>(0);
  const micGainRef   = useRef<GainNode | null>(null);
  const analyserRef  = useRef<AnalyserNode | null>(null);
  const rnnoiseRef   = useRef<AudioWorkletNode | null>(null);

  // Stream ref for mic input-latency reading (used in WAV trim compensation)
  const streamRef        = useRef<MediaStream | null>(null);

  // Live-updatable effect node refs
  // reverbConvRef removed — replaced by FDN (no ConvolverNode ALC)
  const reverbFDNFbRef   = useRef<GainNode[]>([]);          // 6 comb feedback gains
  const reverbFDNLPFRef  = useRef<BiquadFilterNode[]>([]);  // 6 comb LPF nodes
  const reverbWetRef     = useRef<GainNode | null>(null);
  const reverbDryRef     = useRef<GainNode | null>(null);
  const delayNodeRef     = useRef<DelayNode | null>(null);
  const delayFbRef       = useRef<GainNode | null>(null);
  const delayWetRef      = useRef<GainNode | null>(null);
  const delayDryRef      = useRef<GainNode | null>(null);
  const eqBassRef        = useRef<BiquadFilterNode | null>(null);
  const eqMidRef         = useRef<BiquadFilterNode | null>(null);
  const eqHighRef        = useRef<BiquadFilterNode | null>(null);
  const preGainNodeRef   = useRef<GainNode | null>(null);
  const instrGainNodeRef = useRef<GainNode | null>(null);  // backing track volume

  // ── Mix-preview refs (live preview after recording) ────────────────────────
  const previewCtxRef   = useRef<AudioContext | null>(null);
  const previewVGainRef = useRef<GainNode | null>(null);
  const previewIGainRef = useRef<GainNode | null>(null);
  const previewVSrcRef  = useRef<AudioBufferSourceNode | null>(null);
  const previewISrcRef  = useRef<AudioBufferSourceNode | null>(null);
  const previewStartTimeRef = useRef(0);
  const syncDebounceRef = useRef<ReturnType<typeof setTimeout>>();

  const wordSangRef    = useRef<Set<number>>(new Set());
  const wordPitchedRef = useRef<Set<number>>(new Set());
  const metricsRef     = useRef({ singingFrames: 0, pitchedFrames: 0, totalFrames: 0 });

  const [phase, setPhase]         = useState<"pre" | "singing" | "done">("pre");
  const [t, setT]                 = useState(0);
  const [dur, setDur]             = useState(0);
  const [hasMic, setHasMic]       = useState<boolean | null>(null);
  const [isMixing, setIsMixing]         = useState(false);
  const [dlUrl, setDlUrl]               = useState<string | null>(null);
  const recordingBlobRef                = useRef<Blob | null>(null);
  const [mixVocalGain, setMixVocalGain] = useState(0.72);
  const [mixInstrGain, setMixInstrGain] = useState(1.0);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const DEFAULT_SYNC_OFFSET = 340;
  const [syncOffsetMs, setSyncOffsetMs] = useState<number>(
    () => {
      const stored = localStorage.getItem('karaoke-sync-offset');
      return stored !== null ? parseInt(stored, 10) : DEFAULT_SYNC_OFFSET;
    },
  );
  const [showSyncSlider, setShowSyncSlider] = useState(false);
  // Stored trimmed vocal for re-export after offset change
  const rawVocalRef   = useRef<Float32Array | null>(null);
  const instrBufRef   = useRef<AudioBuffer | null>(null);
  const [hasVocal, setHasVocal] = useState(false);
  const [result, setResult]       = useState<PerformanceResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const serverScoredRef = useRef(false);
  const [wordColors, setWordColors] = useState<Map<number, "pitched" | "sang" | "missed">>(new Map());
  const [copied, setCopied]       = useState(false);
  const [showEffects, setShowEffects] = useState(false);
  const [fx, setFx]               = useState<AudioEffects>({ ...DEFAULT_EFFECTS });
  const [showVideo, setShowVideo] = useState(!!videoUrl);

  const savePerf = useSavePerformance();
  const publishPerf = usePublishPerformance();
  const [savedPerfId, setSavedPerfId] = useState<number | null>(null);
  const awardXP = useAwardXP();
  const cloudRecording = useCloudRecording();
  const lines    = toLines(words);
  const lineIdx  = findLastIdx(lines, (ln) => t >= ln.startTime - 0.3);

  // ── Audio listeners ───────────────────────────────────────────────────────
  // Duration fallback — if instrumental is preloaded before singing, setDur is
  // called from decodeAudioData. The loadedmetadata listener is kept as a fallback.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onMeta = () => { if (dur === 0) setDur(el.duration); };
    el.addEventListener("loadedmetadata", onMeta);
    return () => el.removeEventListener("loadedmetadata", onMeta);
  }, []);

  // ── Cleanup ───────────────────────────────────────────────────────────────
  useEffect(() => () => {
    cancelAnimationFrame(rafRef.current);
    ctxRef.current?.close();
    if (dlUrl) URL.revokeObjectURL(dlUrl);
  }, []);

  // ── Live-update effects when fx state changes ─────────────────────────────
  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    if (preGainNodeRef.current)
      preGainNodeRef.current.gain.value = fx.preGain / 100;

    if (instrGainNodeRef.current)
      instrGainNodeRef.current.gain.value = fx.instrGain / 100;

    if (eqBassRef.current) eqBassRef.current.gain.value = fx.eqBass;
    if (eqMidRef.current)  eqMidRef.current.gain.value  = fx.eqMid;
    if (eqHighRef.current) eqHighRef.current.gain.value = fx.eqHigh;

    if (reverbWetRef.current)
      reverbWetRef.current.gain.value = fx.reverbWet / 100;
    if (reverbDryRef.current)
      reverbDryRef.current.gain.value = 1 - fx.reverbWet / 100;

    // Live-update FDN reverb: adjust feedback gains (decay) and LPF (damp)
    const roomSize = 0.25 + (fx.reverbDecay / 100) * 0.70;
    const lpfFreq  = 8000 - (fx.reverbDecay / 100) * 5000;  // brighter at low decay
    reverbFDNFbRef.current.forEach(g  => { g.gain.value        = roomSize; });
    reverbFDNLPFRef.current.forEach(f => { f.frequency.value   = lpfFreq;  });

    if (delayNodeRef.current)
      delayNodeRef.current.delayTime.value = (fx.delayTime / 100) * 0.8;
    if (delayFbRef.current)
      delayFbRef.current.gain.value = fx.delayFeedback / 100 * 0.85;
    if (delayWetRef.current)
      delayWetRef.current.gain.value = fx.delayWet / 100;
    if (delayDryRef.current)
      delayDryRef.current.gain.value = 1 - fx.delayWet / 100 * 0.5;
  }, [fx]);

  // ── Server-side pitch scoring (librosa.pyin) ──────────────────────────────
  // Fires once when the raw vocal PCM becomes available after a session ends.
  // Encodes the mic recording to WAV and POSTs it to the scoring endpoint.
  // The server compares it against the Demucs reference vocal frame-by-frame.
  useEffect(() => {
    if (!hasVocal || phase !== "done" || serverScoredRef.current) return;
    const pcm = rawVocalRef.current;
    if (!pcm || pcm.length < 4800) return;   // need at least 0.1 s of audio

    serverScoredRef.current = true;
    setIsAnalyzing(true);

    (async () => {
      try {
        // ── Encode raw 48kHz mono PCM → WAV ───────────────────────────────
        const SR       = 48_000;
        const nFrames  = pcm.length;
        const dataBytes = nFrames * 2;                   // 16-bit PCM
        const buf  = new ArrayBuffer(44 + dataBytes);
        const view = new DataView(buf);
        const wr   = (o: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
        wr(0, 'RIFF'); view.setUint32(4, 36 + dataBytes, true);
        wr(8, 'WAVE'); wr(12, 'fmt '); view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);  // PCM
        view.setUint16(22, 1, true);  // mono
        view.setUint32(24, SR, true);
        view.setUint32(28, SR * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        wr(36, 'data'); view.setUint32(40, dataBytes, true);
        for (let i = 0; i < nFrames; i++) {
          view.setInt16(44 + i * 2, Math.max(-32768, Math.min(32767, Math.round(pcm[i] * 32767))), true);
        }
        const wavBlob = new Blob([buf], { type: 'audio/wav' });

        // ── Upload to scoring endpoint ─────────────────────────────────────
        const form = new FormData();
        form.append('file', wavBlob, 'recording.wav');
        const resp = await fetch(apiUrl(`/api/processor/jobs/${jobId}/score-performance`), authFetchOptions({
          method: 'POST',
          body: form,
        }));

        if (!resp.ok) {
          console.warn('[Scorer] server error', resp.status, await resp.text());
          return;
        }

        const data = await resp.json();
        console.log('[Scorer] server scores:', data);

        // ── Merge server scores into result ────────────────────────────────
        setResult(prev => {
          if (!prev) return prev;
          const updated: PerformanceResult = {
            ...prev,
            score:         data.overall  ?? prev.score,
            timingScore:   data.timing   ?? prev.timingScore,
            pitchScore:    data.pitch    ?? prev.pitchScore,
            stabilityScore: data.stability,
            stars:         data.stars    ?? prev.stars,
            artistMatch:   data.artistMatch ?? prev.artistMatch,
            serverScored:  true,
          };
          savePerf.mutate({
            jobId, songName,
            score:        updated.score,
            timingScore:  updated.timingScore,
            pitchScore:   updated.pitchScore,
            wordsCovered: updated.wordsCovered,
            totalWords:   updated.totalWords,
          }, { onSuccess: (data: any) => setSavedPerfId(data?.id ?? null) });
          awardXP.mutate({ action: "karaoke_created" });
          return updated;
        });
      } catch (err) {
        console.warn('[Scorer] scoring failed — saving preliminary scores:', err);
        setResult(prev => {
          if (!prev) return prev;
          savePerf.mutate({
            jobId, songName,
            score: prev.score,
            timingScore: prev.timingScore,
            pitchScore: prev.pitchScore,
            wordsCovered: prev.wordsCovered,
            totalWords: prev.totalWords,
          }, { onSuccess: (data: any) => setSavedPerfId(data?.id ?? null) });
          awardXP.mutate({ action: "karaoke_created" });
          return prev;
        });
      } finally {
        setIsAnalyzing(false);
      }
    })();
  }, [hasVocal, phase, jobId, songName]);    // eslint-disable-line

  // ── Animation loop ────────────────────────────────────────────────────────
  const startAnimLoop = (analyser: AnalyserNode, ctx: AudioContext) => {
    const fftSize    = analyser.fftSize;
    const sampleRate = ctx.sampleRate;
    const freqData   = new Float32Array(analyser.frequencyBinCount);
    const timeData   = new Float32Array(fftSize);
    let colorTick    = 0;

    const tick = () => {
      if (!analyserRef.current) return;
      analyser.getFloatFrequencyData(freqData);
      analyser.getFloatTimeDomainData(timeData);

      let rms = 0;
      for (let i = 0; i < timeData.length; i++) rms += timeData[i] ** 2;
      rms = Math.sqrt(rms / timeData.length);
      const isSinging = rms > 0.008;

      const freq      = getDominantFreq(freqData, sampleRate, fftSize);
      const isPitched = isSinging && isVocalFreq(freq);

      metricsRef.current.totalFrames++;
      if (isSinging) {
        metricsRef.current.singingFrames++;
        if (isPitched) metricsRef.current.pitchedFrames++;
      }

      // Use AudioContext clock — same source as the recording, zero drift
      const curT = Math.max(0, ctx.currentTime - songStartCtxRef.current);
      setT(curT);
      // Sync muted karaoke video to the AudioContext position (every ~5 frames)
      if (colorTick % 5 === 0 && videoRef.current && Math.abs(videoRef.current.currentTime - curT) > 0.25) {
        videoRef.current.currentTime = curT;
      }

      words.forEach((w, idx) => {
        if (curT >= w.start - 0.1 && curT <= w.end + 0.35) {
          if (isSinging) {
            wordSangRef.current.add(idx);
            if (isPitched) wordPitchedRef.current.add(idx);
          }
        }
      });

      if (barsRef.current) {
        const bars = barsRef.current.querySelectorAll<HTMLElement>(".bar");
        const level = isSinging ? Math.min(1, rms * 12) : 0;
        bars.forEach((bar, i) => {
          const wave = Math.sin(Date.now() / 170 + i * 0.85) * 0.35 + 0.65;
          bar.style.height  = `${Math.max(3, Math.min(34, level * 34 * wave + level * 8))}px`;
          bar.style.opacity = isSinging ? `${0.4 + level * 0.6}` : "0.18";
        });
      }

      if (++colorTick >= 25) {
        colorTick = 0;
        const map = new Map<number, "pitched" | "sang" | "missed">();
        words.forEach((w, idx) => {
          if (curT > w.end + 0.2) {
            map.set(idx, wordPitchedRef.current.has(idx) ? "pitched"
              : wordSangRef.current.has(idx) ? "sang" : "missed");
          }
        });
        setWordColors(new Map(map));
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
  };

  // ── Professional Vocal Processing Chain ──────────────────────────────────
  //
  //  mic → HPF(120Hz) → LPF(18kHz) → DeMud(280Hz -3dB) → PreGain
  //      → NoiseGate → VocalComp → Presence(3kHz +5dB) → DeEsser(7.5kHz -4dB)
  //      → AirShelf(12kHz +2dB) → HarmonicExciter(WaveShaper tanh)
  //      → MakeupGain → UserEQ(bass/mid/high) → [Reverb wet/dry]
  //      → [Delay wet/dry] → Limiter → destination + mixDest
  //      + Analyser tap (post-EQ, pre-FX) for accurate pitch detection
  //
  const buildMicChain = (
    ctx: AudioContext,
    micSrc: AudioNode,
    destination: AudioNode,
    mixDest: MediaStreamAudioDestinationNode,
  ) => {
    // ── 1. High-Pass Filter 120Hz — destroys laptop hum, mic rumble, p-pops
    const hpf = ctx.createBiquadFilter();
    hpf.type            = "highpass";
    hpf.frequency.value = 120;
    hpf.Q.value         = 0.9;

    // ── 2. Low-Pass Filter 18kHz — removes digital harshness artifacts
    const lpf = ctx.createBiquadFilter();
    lpf.type            = "lowpass";
    lpf.frequency.value = 18000;
    lpf.Q.value         = 0.5;

    // ── 3. De-mud: peaking cut at 280Hz -3dB — removes boxiness/muddiness
    const deMud = ctx.createBiquadFilter();
    deMud.type            = "peaking";
    deMud.frequency.value = 280;
    deMud.Q.value         = 0.8;
    deMud.gain.value      = -3;

    // ── 4. Pre-gain (user adjustable)
    const preGain = ctx.createGain();
    preGain.gain.value = fx.preGain / 100;
    preGainNodeRef.current = preGain;

    // ── 5. Noise Gate — silences signal below vocal threshold (~-48dB)
    //    Using a compressor as gate: high ratio + fast attack + low threshold
    const noiseGate = ctx.createDynamicsCompressor();
    noiseGate.threshold.value = -48;
    noiseGate.knee.value      = 0;
    noiseGate.ratio.value     = 16;
    noiseGate.attack.value    = 0.001;
    noiseGate.release.value   = 0.08;

    // ── 6. Vocal Compressor — professional glue: fast attack, medium release
    const vocalComp = ctx.createDynamicsCompressor();
    vocalComp.threshold.value = -22;
    vocalComp.knee.value      = 8;
    vocalComp.ratio.value     = 5;
    vocalComp.attack.value    = 0.004;
    vocalComp.release.value   = 0.14;

    // ── 7. Presence: bell +5dB at 3kHz — clarity, intelligibility, voice forward
    const presence = ctx.createBiquadFilter();
    presence.type            = "peaking";
    presence.frequency.value = 3000;
    presence.Q.value         = 1.0;
    presence.gain.value      = 5;

    // ── 8. De-esser: narrow cut -4dB at 7.5kHz — tames harsh 's' / 'sh' sounds
    const deEsser = ctx.createBiquadFilter();
    deEsser.type            = "peaking";
    deEsser.frequency.value = 7500;
    deEsser.Q.value         = 4.0;
    deEsser.gain.value      = -4;

    // ── 9. Air: high-shelf +2.5dB at 12kHz — openness, sparkle, sounds expensive
    const airShelf = ctx.createBiquadFilter();
    airShelf.type            = "highshelf";
    airShelf.frequency.value = 12000;
    airShelf.gain.value      = 2.5;

    // ── 10. Harmonic Exciter (WaveShaper) — tanh saturation adds warmth & richness
    //     2x oversampling: sufficient for vocal frequencies (< 8 kHz), lower CPU/latency
    const exciter = ctx.createWaveShaper();
    exciter.curve      = makeExciterCurve(28) as Float32Array<ArrayBuffer>;
    exciter.oversample = "2x";

    // ── 11. Make-up gain after compression/exciter
    const makeupGain = ctx.createGain();
    makeupGain.gain.value = 1.35;  // compensates for gate + comp gain reduction

    // ── 12. User EQ (3 adjustable bands)
    const eqBass = ctx.createBiquadFilter();
    eqBass.type            = "lowshelf";
    eqBass.frequency.value = 200;
    eqBass.gain.value      = fx.eqBass;
    eqBassRef.current      = eqBass;

    const eqMid = ctx.createBiquadFilter();
    eqMid.type            = "peaking";
    eqMid.frequency.value = 1200;
    eqMid.Q.value         = 0.8;
    eqMid.gain.value      = fx.eqMid;
    eqMidRef.current      = eqMid;

    const eqHigh = ctx.createBiquadFilter();
    eqHigh.type            = "highshelf";
    eqHigh.frequency.value = 7000;
    eqHigh.gain.value      = fx.eqHigh;
    eqHighRef.current      = eqHigh;

    // ── 13. Reverb — FDN (no ConvolverNode → no ALC latency on dry path)
    // roomSize / damp derived from fx.reverbDecay same as live-update handler.
    const roomSize0 = 0.25 + (fx.reverbDecay / 100) * 0.70;
    const damp0     = fx.reverbDecay / 100;          // more decay = darker sound
    const fdn = buildReverbFDN(ctx, roomSize0, damp0);
    reverbFDNFbRef.current  = fdn.fbGains;
    reverbFDNLPFRef.current = fdn.lpfNodes;

    const reverbWet = ctx.createGain();
    reverbWet.gain.value = fx.reverbWet / 100;
    reverbWetRef.current = reverbWet;

    const reverbDry = ctx.createGain();
    reverbDry.gain.value = 1 - fx.reverbWet / 100;
    reverbDryRef.current = reverbDry;

    // ── 14. Delay (with feedback loop)
    const delayNode = ctx.createDelay(1.0);
    delayNode.delayTime.value = (fx.delayTime / 100) * 0.8;
    delayNodeRef.current = delayNode;

    const delayFb = ctx.createGain();
    delayFb.gain.value = fx.delayFeedback / 100 * 0.85;
    delayFbRef.current = delayFb;

    const delayWet = ctx.createGain();
    delayWet.gain.value = fx.delayWet / 100;
    delayWetRef.current = delayWet;

    const delayDry = ctx.createGain();
    delayDry.gain.value = 1 - fx.delayWet / 100 * 0.5;
    delayDryRef.current = delayDry;

    // ── 15. True Peak Limiter — prevents any clipping at output
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -0.5;
    limiter.knee.value      = 0;
    limiter.ratio.value     = 20;
    limiter.attack.value    = 0.0005;
    limiter.release.value   = 0.08;

    // ── CONNECT THE CHAIN ──────────────────────────────────────────────────
    micSrc.connect(hpf);
    hpf.connect(lpf);
    lpf.connect(deMud);
    deMud.connect(preGain);
    preGain.connect(noiseGate);
    noiseGate.connect(vocalComp);
    vocalComp.connect(presence);
    presence.connect(deEsser);
    deEsser.connect(airShelf);
    airShelf.connect(exciter);
    exciter.connect(makeupGain);
    makeupGain.connect(eqBass);
    eqBass.connect(eqMid);
    eqMid.connect(eqHigh);

    // Analyser taps post-EQ (accurate pitch, loud enough signal)
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 4096;
    analyserRef.current = analyser;
    eqHigh.connect(analyser);

    // Reverb parallel  (FDN — no ConvolverNode, no ALC)
    eqHigh.connect(reverbDry);
    eqHigh.connect(fdn.input);
    fdn.output.connect(reverbWet);

    // Delay parallel (after reverb mix)
    reverbDry.connect(delayDry);
    reverbWet.connect(delayDry);
    delayDry.connect(delayNode);
    delayNode.connect(delayFb);
    delayFb.connect(delayNode);  // feedback
    delayNode.connect(delayWet);

    // Merge to limiter → recording mix only (NOT to speakers)
    // The singer hears only the backing track — no delayed mic monitoring.
    // The vocal is still recorded in full quality via the recorder worklet.
    delayDry.connect(limiter);
    delayWet.connect(limiter);
    limiter.connect(mixDest);   // legacy MediaRecorder fallback only

    return limiter;   // caller can tap this for sample-accurate recording
  };

  // Apply a sample offset to an already-trimmed vocal buffer.
  // offsetSamples > 0 → vocal was late → skip those extra samples from the front.
  // offsetSamples < 0 → vocal was early → prepend silence.
  const applyVocalOffset = (pcm: Float32Array, offsetSamples: number): Float32Array => {
    if (offsetSamples === 0) return pcm;
    if (offsetSamples > 0) {
      const skip = Math.min(offsetSamples, pcm.length - 1);
      return pcm.subarray(skip);
    }
    const pad = -offsetSamples;
    const out = new Float32Array(pad + pcm.length);
    out.set(pcm, pad);
    return out;
  };

  // ── Mix-preview: stop any active preview playback ────────────────────────
  const stopMixPreview = () => {
    if (syncDebounceRef.current) clearTimeout(syncDebounceRef.current);
    try { previewVSrcRef.current?.stop(); } catch { /* already stopped */ }
    try { previewISrcRef.current?.stop(); } catch { /* already stopped */ }
    previewCtxRef.current?.close();
    previewCtxRef.current  = null;
    previewVGainRef.current = null;
    previewIGainRef.current = null;
    previewVSrcRef.current  = null;
    previewISrcRef.current  = null;
    setIsPreviewPlaying(false);
  };

  // ── Mix-preview: start live playback of vocal + instrumental ─────────────
  const startMixPreview = async (overrideOffset?: number, resumeFromSec?: number) => {
    if (syncDebounceRef.current) clearTimeout(syncDebounceRef.current);
    stopMixPreview();
    const vocal = rawVocalRef.current;
    const instr = instrBufRef.current;
    if (!vocal) { console.warn('[Preview] No vocal data'); return; }

    const ctx = new AudioContext({ sampleRate: 48000 });
    previewCtxRef.current = ctx;
    await ctx.resume();

    const offsetMs = Number.isFinite(overrideOffset) ? overrideOffset! : syncOffsetMs;
    const offsetSamples = Math.round(offsetMs * 48000 / 1000);
    const adjustedVocal = applyVocalOffset(vocal, offsetSamples);
    const seekSec = resumeFromSec ?? 0;

    // Vocal buffer → gain → destination
    const vBuf = ctx.createBuffer(1, adjustedVocal.length, 48000);
    vBuf.getChannelData(0).set(adjustedVocal);
    const vSrc  = ctx.createBufferSource();
    vSrc.buffer = vBuf;
    const vGain = ctx.createGain();
    vGain.gain.value = mixVocalGain;
    vSrc.connect(vGain);
    vGain.connect(ctx.destination);
    previewVGainRef.current = vGain;
    previewVSrcRef.current  = vSrc;
    vSrc.onended = () => setIsPreviewPlaying(false);
    vSrc.start(0, seekSec);

    // Instrumental buffer → gain → destination
    if (instr) {
      const iSrc  = ctx.createBufferSource();
      iSrc.buffer = instr;
      const iGain = ctx.createGain();
      iGain.gain.value = mixInstrGain;
      iSrc.connect(iGain);
      iGain.connect(ctx.destination);
      previewIGainRef.current = iGain;
      previewISrcRef.current  = iSrc;
      iSrc.start(0, seekSec);
    }
    previewStartTimeRef.current = ctx.currentTime - seekSec;
    setIsPreviewPlaying(true);
  };

  // ── Real-time slider update while preview is playing ─────────────────────
  const updatePreviewVocalGain = (val: number) => {
    setMixVocalGain(val);
    if (previewVGainRef.current) previewVGainRef.current.gain.value = val;
  };
  const updatePreviewInstrGain = (val: number) => {
    setMixInstrGain(val);
    if (previewIGainRef.current) previewIGainRef.current.gain.value = val;
  };
  const updatePreviewSyncOffset = (newOffsetMs: number) => {
    setSyncOffsetMs(newOffsetMs);
    localStorage.setItem('karaoke-sync-offset', String(newOffsetMs));
    if (isPreviewPlaying && previewCtxRef.current) {
      if (syncDebounceRef.current) clearTimeout(syncDebounceRef.current);
      syncDebounceRef.current = setTimeout(() => {
        const ctx = previewCtxRef.current;
        if (!ctx) return;
        const elapsed = ctx.currentTime - previewStartTimeRef.current;
        startMixPreview(newOffsetMs, Math.max(0, elapsed));
      }, 200);
    }
  };

  // ── Finalize: stop preview and re-render with chosen gains ───────────────
  const finalizeWithChosenGains = async () => {
    stopMixPreview();
    const vocal = rawVocalRef.current;
    const instr = instrBufRef.current;
    if (!vocal) return;
    setIsMixing(true);
    setDlUrl(null);
    const offsetSamples = Math.round(syncOffsetMs * 48000 / 1000);
    const adjusted = applyVocalOffset(vocal, offsetSamples);
    try {
      await renderMix(adjusted, instr, 48000, mixVocalGain, mixInstrGain);
    } catch (e) {
      console.error('[Finalize] failed:', e);
      setIsMixing(false);
    }
  };

  const renderMix = async (vocalPcm: Float32Array, instrBuffer: AudioBuffer | null, sr: number,
                           vGainVal = 0.72, iGainVal = 1.0): Promise<void> => {
    const instrDur  = instrBuffer ? instrBuffer.duration : 0;
    const vocalDur  = vocalPcm.length / sr;
    const duration  = Math.max(instrDur, vocalDur);
    const nFrames   = Math.ceil(duration * sr);
    const offline   = new OfflineAudioContext(2, nFrames, sr);

    const vBuf = offline.createBuffer(1, vocalPcm.length, sr);
    vBuf.getChannelData(0).set(vocalPcm);
    const vSrc = offline.createBufferSource();
    vSrc.buffer = vBuf;
    const vGain = offline.createGain();
    vGain.gain.value = vGainVal;
    vSrc.connect(vGain);
    vGain.connect(offline.destination);
    vSrc.start(0);

    if (instrBuffer) {
      const iSrc = offline.createBufferSource();
      iSrc.buffer = instrBuffer;
      const iGain = offline.createGain();
      iGain.gain.value = iGainVal;
      iSrc.connect(iGain);
      iGain.connect(offline.destination);
      iSrc.start(0);
    }

    const rendered = await offline.startRendering();
    const nCh = rendered.numberOfChannels;
    const dataBytes = nFrames * nCh * 2;
    const buf  = new ArrayBuffer(44 + dataBytes);
    const view = new DataView(buf);
    const wr   = (o: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
    wr(0, 'RIFF'); view.setUint32(4, 36 + dataBytes, true);
    wr(8, 'WAVE'); wr(12, 'fmt '); view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, nCh, true);
    view.setUint32(24, sr, true);
    view.setUint32(28, sr * nCh * 2, true);
    view.setUint16(32, nCh * 2, true);
    view.setUint16(34, 16, true);
    wr(36, 'data'); view.setUint32(40, dataBytes, true);
    for (let i = 0; i < nFrames; i++) {
      for (let ch = 0; ch < nCh; ch++) {
        const s = rendered.getChannelData(ch)[i];
        view.setInt16(44 + (i * nCh + ch) * 2, Math.max(-32768, Math.min(32767, Math.round(s * 32767))), true);
      }
    }
    const blob = new Blob([buf], { type: 'audio/wav' });
    recordingBlobRef.current = blob;
    if (dlUrl) URL.revokeObjectURL(dlUrl);
    setDlUrl(URL.createObjectURL(blob));
    setIsMixing(false);
    console.log(`[Mix] Done — ${duration.toFixed(1)}s ${nCh}ch stereo WAV`);
  };

  const mixAndExportWav = async (
    chunks:       Float32Array[],
    firstCtxTime: number,   // AudioContext time of first captured sample
    songCtxTime:  number,   // AudioContext time when instrumental was scheduled
    sr:           number,   // 48 000
    systemLatency: number,  // outputLatency + baseLatency + inputLatency
    extraOffsetMs: number,  // manual calibration offset (ms), positive = vocal was late
  ) => {
    // ── 1. Concatenate ───────────────────────────────────────────────────────
    const totalSamples = chunks.reduce((s, c) => s + c.length, 0);
    if (totalSamples === 0) return;
    const rawMic = new Float32Array(totalSamples);
    let off = 0;
    for (const c of chunks) { rawMic.set(c, off); off += c.length; }

    // ── 2. Align recording to song start ────────────────────────────────────
    const recVsSong  = firstCtxTime - songCtxTime;
    const latSeconds = systemLatency;
    const alignSec   = recVsSong - latSeconds;
    console.log(`[Mix] recVsSong=${recVsSong.toFixed(4)}s lat=${latSeconds.toFixed(4)}s alignSec=${alignSec.toFixed(4)}s`);

    let basePcm: Float32Array;
    if (alignSec <= 0) {
      const trimSamples = Math.min(Math.round(-alignSec * sr), totalSamples - sr);
      basePcm = rawMic.subarray(Math.max(0, trimSamples));
      console.log(`[Mix] Recorder started early → trim ${trimSamples} samples (${(-alignSec * 1000).toFixed(1)}ms)`);
    } else {
      const padSamples = Math.round(alignSec * sr);
      basePcm = new Float32Array(padSamples + totalSamples);
      basePcm.set(rawMic, padSamples);
      console.log(`[Mix] Recorder started late → pad ${padSamples} samples (${(alignSec * 1000).toFixed(1)}ms)`);
    }
    rawVocalRef.current = basePcm;
    setHasVocal(true);

    // ── 3. Fetch + decode instrumental ───────────────────────────────────────
    let instrBuffer: AudioBuffer | null = null;
    try {
      const resp     = await fetch(audioUrl);
      const arrayBuf = await resp.arrayBuffer();
      const decCtx   = new OfflineAudioContext(1, 1, sr);
      instrBuffer    = await decCtx.decodeAudioData(arrayBuf);
      instrBufRef.current = instrBuffer;
      console.log(`[Mix] Instrumental: ${instrBuffer.duration.toFixed(1)}s`);
    } catch (e) {
      console.warn('[Mix] Could not load instrumental — vocal-only export:', e);
    }

    // ── 4. Apply sync offset (default +340ms, user-adjustable via slider) ───
    const finalOffsetMs = extraOffsetMs;
    console.log(`[Mix] Applying sync offset: ${finalOffsetMs}ms`);

    const offsetSamples = Math.round(finalOffsetMs * sr / 1000);
    const vocalPcm = applyVocalOffset(basePcm, offsetSamples);

    // ── 5. Render stereo mix ─────────────────────────────────────────────────
    await renderMix(vocalPcm, instrBuffer, sr);
  };

  // ── Start session ─────────────────────────────────────────────────────────
  const startSinging = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    wordSangRef.current    = new Set();
    wordPitchedRef.current = new Set();
    metricsRef.current     = { singingFrames: 0, pitchedFrames: 0, totalFrames: 0 };
    setPhase("singing");

    // latencyHint:'interactive' forces the browser to use the smallest possible
    // buffer size (usually 128–256 samples ≈ 2.7–5.3 ms at 48 kHz) instead of
    // the default 'balanced' or 'playback' buffer that can be 512–4096 samples.
    const ctx      = new AudioContext({ sampleRate: 48000, latencyHint: 'interactive' });
    ctxRef.current = ctx;
    const mixDest  = ctx.createMediaStreamDestination();

    // ── Phase A: Decode instrumental (can run before mic) ───────────────────
    let instrBuf: AudioBuffer | null = null;
    try {
      const resp     = await fetch(audioUrl);
      const arrayBuf = await resp.arrayBuffer();
      instrBuf       = await ctx.decodeAudioData(arrayBuf);
      setDur(instrBuf.duration);
    } catch (e) { console.warn("[Sing] Could not load instrumental:", e); }

    // ── Phase B: Set up mic + worklets FIRST (before scheduling playback) ──
    let micReady = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation:  false,
          noiseSuppression:  false,
          autoGainControl:   false,
          sampleRate:        48000,
          channelCount:      1,
          // @ts-ignore — non-standard Chrome hint for lowest-latency ADC
          latency: 0,
        },
        video: false,
      });

      streamRef.current = stream;

      const micSrc = ctx.createMediaStreamSource(stream);
      micGainRef.current = preGainNodeRef.current;

      let chainSource: AudioNode = micSrc;
      try {
        const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
        await ctx.audioWorklet.addModule(`${basePath}/rnnoise-worklet.js`);

        const rnNode = new AudioWorkletNode(ctx, 'rnnoise-processor', {
          numberOfInputs:  1,
          numberOfOutputs: 1,
          outputChannelCount: [1],
        });
        rnnoiseRef.current = rnNode;

        const wasmRes  = await fetch(`${basePath}/rnnoise-full.wasm`);
        const wasmBuf  = await wasmRes.arrayBuffer();

        await new Promise<void>((resolve) => {
          const timer = setTimeout(() => resolve(), 3000);
          rnNode.port.onmessage = ({ data }) => {
            if (data.type === 'ready') { clearTimeout(timer); resolve(); }
            if (data.type === 'error') { clearTimeout(timer); resolve(); }
          };
          rnNode.port.postMessage({ type: 'wasm', buffer: wasmBuf }, [wasmBuf]);
        });

        micSrc.connect(rnNode);
        chainSource = rnNode;
        console.log('[RNNoise] Neural noise suppressor active ✓');
      } catch (e) {
        console.warn('[RNNoise] Fallback to raw mic (worklet unavailable):', e);
      }

      const limiter = buildMicChain(ctx, chainSource, ctx.destination, mixDest);
      startAnimLoop(analyserRef.current!, ctx);

      pcmChunksRef.current    = [];
      pcmFirstTimeRef.current = -1;
      pcmSrRef.current        = ctx.sampleRate;

      try {
        const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
        await ctx.audioWorklet.addModule(`${basePath}/recorder-worklet.js`);

        const recNode = new AudioWorkletNode(ctx, 'recorder-processor', {
          numberOfInputs:     1,
          numberOfOutputs:    1,
          channelCount:       1,
          outputChannelCount: [1],
        });
        recNodeRef.current = recNode;

        recNode.port.onmessage = ({ data }) => {
          if (data.type === 'chunk') {
            pcmChunksRef.current.push(data.buf as Float32Array);
            if (pcmFirstTimeRef.current < 0) pcmFirstTimeRef.current = data.time as number;
          }
          if (data.type === 'done') {
            const inputLatency =
              (streamRef.current?.getAudioTracks()[0]?.getSettings() as Record<string, number> | undefined)?.latency ?? 0;
            const totalLatency = ctx.outputLatency + ctx.baseLatency + inputLatency;
            console.log(`[Mix] latency: out=${ctx.outputLatency.toFixed(3)}s base=${ctx.baseLatency.toFixed(3)}s mic=${inputLatency.toFixed(3)}s total=${totalLatency.toFixed(3)}s`);
            setIsMixing(true);
            mixAndExportWav(
              pcmChunksRef.current,
              data.firstTime  as number,
              songStartCtxRef.current,
              data.sampleRate as number,
              totalLatency,
              syncOffsetMs,
            ).catch(e => { console.error('[Mix] Export failed:', e); setIsMixing(false); });
          }
        };

        limiter.connect(recNode);
        console.log('[Recorder] AudioWorklet PCM recorder active ✓');
      } catch (e) {
        console.warn('[Recorder] Falling back to MediaRecorder:', e);
        const recorder = new MediaRecorder(mixDest.stream);
        const chunks: Blob[] = [];
        recorder.ondataavailable = (ev) => { if (ev.data.size > 0) chunks.push(ev.data); };
        recorder.onstop = () => setDlUrl(URL.createObjectURL(new Blob(chunks, { type: 'audio/webm' })));
        recorder.start();
        (recNodeRef as any)._legacyRecorder = recorder;
      }

      setHasMic(true);
      micReady = true;
    } catch { setHasMic(false); }

    await ctx.resume();

    // ── Phase C: NOW schedule instrumental + video (recorder is already running) ──
    if (instrBuf) {
      const instrSrc  = ctx.createBufferSource();
      instrSrc.buffer = instrBuf;

      const instrGain = ctx.createGain();
      instrGain.gain.value = fx.instrGain / 100;
      instrGainNodeRef.current = instrGain;
      instrSrc.connect(instrGain);
      instrGain.connect(ctx.destination);

      instrSrcRef.current = instrSrc;

      const startAt = ctx.currentTime + 0.1;
      instrSrc.start(startAt);
      songStartCtxRef.current = startAt;

      instrSrc.onended = () => {
        if (ctxRef.current && instrSrcRef.current) stopSession();
      };

      const msUntilStart = (startAt - ctx.currentTime) * 1000;
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }
      }, msUntilStart);

      console.log(`[Sing] Mic+worklets ready → instrumental scheduled at +100ms (recorder already capturing)`);
    }

    if (songStartCtxRef.current === 0) songStartCtxRef.current = ctx.currentTime;
  };

  // ── Calculate result ──────────────────────────────────────────────────────
  const calcResult = (): PerformanceResult => {
    const totalWords   = words.length || 1;
    const wordsCovered = wordSangRef.current.size;
    const { singingFrames, pitchedFrames } = metricsRef.current;

    const timingScore = Math.round((wordsCovered / totalWords) * 100);
    const pitchScore  = singingFrames > 0 ? Math.round((pitchedFrames / singingFrames) * 100) : 0;
    const score       = Math.min(100, Math.round(timingScore * 0.55 + pitchScore * 0.35 + 10));

    let highlightStart = 0;
    if (words.length > 0 && dur > 30) {
      let maxCount = 0;
      for (let s = 0; s <= dur - 30; s += 5) {
        const c = [...wordSangRef.current].filter(i => words[i]?.start >= s && words[i]?.start <= s + 30).length;
        if (c > maxCount) { maxCount = c; highlightStart = s; }
      }
    }

    return {
      score, timingScore, pitchScore, wordsCovered,
      totalWords: words.length,
      stars:       toStars(score),
      artistMatch: Math.min(97, Math.round(score * 0.82 + Math.random() * 10 + 4)),
      highlightStart,
    };
  };

  // ── Stop ──────────────────────────────────────────────────────────────────
  const stopSession = useCallback(() => {
    try { instrSrcRef.current?.stop(); } catch { /* already stopped */ }
    instrSrcRef.current = null;
    videoRef.current?.pause();
    cancelAnimationFrame(rafRef.current);
    analyserRef.current = null;

    const res = calcResult();
    setResult(res);
    setPhase("done");

    // Tell the worklet recorder to flush and deliver the 'done' message.
    // encodeAndSetWav() is called asynchronously from the onmessage handler.
    const recNode = recNodeRef.current;
    if (recNode) {
      recNode.port.postMessage({ type: 'stop' });
    }
    // Legacy MediaRecorder fallback
    const legacyRec = (recNodeRef as any)._legacyRecorder as MediaRecorder | undefined;
    if (legacyRec && legacyRec.state !== 'inactive') legacyRec.stop();

    // Stop microphone tracks so the browser mic indicator turns off
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;

    // Do NOT save preliminary scores here — server pyin analysis will save
    // the real scores after scoring completes (see useEffect above).
    // If scoring fails, savePerf is called as a fallback inside that effect.
    serverScoredRef.current = false;  // reset so the scoring effect can fire
  }, [jobId, songName]);

  // ── Re-export with a new sync offset (no re-recording needed) ────────────
  const remixWithOffset = async (newOffsetMs: number) => {
    const vocal = rawVocalRef.current;
    const instr = instrBufRef.current;
    if (!vocal) return;
    stopMixPreview();
    localStorage.setItem('karaoke-sync-offset', String(newOffsetMs));
    setSyncOffsetMs(newOffsetMs);
    setIsMixing(true);
    setDlUrl(null);
    const offsetSamples = Math.round(newOffsetMs * 48000 / 1000);
    const adjusted = applyVocalOffset(vocal, offsetSamples);
    try {
      await renderMix(adjusted, instr, 48000, mixVocalGain, mixInstrGain);
    } catch (e) {
      console.error('[Remix] failed:', e);
      setIsMixing(false);
    }
  };

  // ── Restart ───────────────────────────────────────────────────────────────
  const restart = () => {
    stopMixPreview();
    try { instrSrcRef.current?.stop(); } catch { /* already stopped */ }
    instrSrcRef.current = null;
    ctxRef.current?.close(); ctxRef.current = null;
    cancelAnimationFrame(rafRef.current);
    if (dlUrl) { URL.revokeObjectURL(dlUrl); setDlUrl(null); }
    recNodeRef.current = null;
    // Stop microphone tracks so the browser mic indicator turns off
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current  = null;
    pcmChunksRef.current = [];
    pcmFirstTimeRef.current = -1;
    songStartCtxRef.current = 0;
    reverbFDNFbRef.current  = [];
    reverbFDNLPFRef.current = [];
    rawVocalRef.current = null;
    instrBufRef.current = null;
    serverScoredRef.current = false;
    setSavedPerfId(null);
    publishPerf.reset();
    setHasVocal(false);
    setIsAnalyzing(false);
    setIsMixing(false);
    if (videoRef.current) videoRef.current.currentTime = 0;
    setT(0); setResult(null); setWordColors(new Map()); setPhase("pre");
  };

  // ── Social share ──────────────────────────────────────────────────────────
  const handleShare = async () => {
    const url  = `${window.location.origin}/job/${jobId}`;
    const text = result
      ? `שרתי "${songName}" ב-MYOUKEE וקיבלתי ציון ${result.score}/100! 🎤 כמה תשיגו?`
      : `הכנסתי "${songName}" לקריוקי ב-MYOUKEE!`;
    try {
      if (navigator.share) await navigator.share({ title: "MYOUKEE", text, url });
      else { await navigator.clipboard.writeText(`${text}\n${url}`); setCopied(true); setTimeout(() => setCopied(false), 2500); }
      awardXP.mutate({ action: "shared_clip" });
    } catch { /* cancelled */ }
  };

  const handleChallenge = async () => {
    if (!result) return;
    const name = encodeURIComponent(window.document.title.split("–")[0]?.trim() ?? "מישהו");
    const url  = `${window.location.origin}/job/${jobId}?challenger=${name}&score=${result.score}`;
    await navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const progress = dur > 0 ? (t / dur) * 100 : 0;
  const slots = [
    lines[lineIdx - 1] ?? null,
    lines[lineIdx]     ?? null,
    lines[lineIdx + 1] ?? null,
    lines[lineIdx + 2] ?? null,
  ];

  const wordClass = (globalIdx: number, isCurrent: boolean): string => {
    if (isCurrent) {
      const w = words[globalIdx];
      if (w && t >= w.start - 0.08 && t <= w.end + 0.08) return "kw-active";
    }
    const c = wordColors.get(globalIdx);
    if (!c) return "kw-upcoming";
    return c === "pitched" ? "kw-pitched" : c === "sang" ? "kw-sang" : "kw-missed";
  };

  // ── Effects panel helper ──────────────────────────────────────────────────
  const fxSet = <K extends keyof AudioEffects>(key: K, val: number) =>
    setFx(prev => ({ ...prev, [key]: val }));

  const SliderRow = ({ label, value, min, max, step = 1, onChange }: {
    label: string; value: number; min: number; max: number; step?: number;
    onChange: (v: number) => void;
  }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] text-white/45">
        <span>{label}</span>
        <span className="text-white/65 font-medium">{value > 0 && min < 0 ? `+${value}` : value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-primary cursor-pointer h-1" />
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        .kw-active   { color: #c084fc; text-shadow: 0 0 18px rgba(192,132,252,.9), 0 0 36px rgba(147,51,234,.55); transform: scale(1.08); display: inline-block; }
        .kw-pitched  { color: #4ade80; text-shadow: 0 0 10px rgba(74,222,128,.5); }
        .kw-sang     { color: #facc15; }
        .kw-missed   { color: rgba(255,255,255,.2); }
        .kw-upcoming { color: white; }
        .sing-bg     { background: radial-gradient(ellipse at 50% 40%, rgba(88,28,135,.20) 0%, transparent 70%); }
        .score-grad  { background: linear-gradient(135deg, #c084fc, #60a5fa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .fx-panel    { background: rgba(10,5,25,0.88); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.08); }
      `}</style>

      <div className="fixed inset-0 z-[60] flex flex-col overflow-hidden">

        {/* ── Background ──────────────────────────────────────────────────── */}
        <div className="absolute inset-0">
          {videoUrl && showVideo && phase === "singing" ? (
            <>
              <video
                ref={videoRef}
                src={videoUrl}
                muted
                playsInline
                className="w-full h-full object-cover"
                style={{ filter: "brightness(0.38) saturate(0.85)" }}
              />
              <div className="absolute inset-0 sing-bg" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/65" />
            </>
          ) : (
            <>
              <img src="https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1920&h=1080&fit=crop&q=80"
                className="w-full h-full object-cover"
                style={{ filter: "blur(8px) brightness(0.30) saturate(0.8)" }} />
              <div className="absolute inset-0 sing-bg" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/70" />
            </>
          )}
        </div>

        <audio ref={audioRef} src={audioUrl} crossOrigin="anonymous" preload="auto" />

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="relative z-10 flex items-center justify-between px-4 sm:px-6 pt-3 sm:pt-5 pb-2">
          <button onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
          <div className="text-center min-w-0 px-3">
            <p className="text-[10px] text-white/35 uppercase tracking-[0.15em] mb-0.5">MYOUKEE SING</p>
            <p className="text-sm font-medium text-white/75 truncate max-w-[220px]" dir="auto">{songName}</p>
          </div>
          {phase === "singing"
            ? <div className="flex items-center gap-1.5 text-red-400 text-xs font-semibold"><span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />REC</div>
            : <div className="w-9" />}
        </div>

        {/* ── Challenger banner ────────────────────────────────────────────── */}
        {challengerName && challengerScore !== undefined && phase === "pre" && (
          <div className="relative z-10 mx-6 mt-2 px-4 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center gap-3">
            <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-amber-400 text-sm font-semibold">{challengerName} קיבל ציון {challengerScore}</p>
              <p className="text-white/45 text-xs">האם תצליח להכות אותם?</p>
            </div>
          </div>
        )}

        {/* ══ PRE ══════════════════════════════════════════════════════════ */}
        {phase === "pre" && (
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-4 sm:gap-6 px-4 sm:px-8 text-center">
            <div className="space-y-3">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-2">
                <Music className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">מוכן לשיר?</h2>
              <p className="text-white/45 max-w-xs mx-auto text-sm leading-relaxed">
                MYOUKEE תפעיל את הפלייבק, תקשיב לקול שלך, תנתח בזמן אמת ותנתן ציון מפורט
              </p>
            </div>

            <button onClick={startSinging}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center gap-2 text-white transition-all hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)", boxShadow: "0 0 70px rgba(124,58,237,.55),0 0 30px rgba(59,130,246,.3)" }}>
              <Mic className="w-10 h-10" />
              <span className="text-xs font-semibold tracking-wide">התחל</span>
            </button>

            {/* Volume sliders — mic + backing track */}
            <div className="w-full max-w-xs space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-white/40">
                  <span className="flex items-center gap-1"><Volume2 className="w-3 h-3" />עוצמת מיק</span>
                  <span className="text-white/60 font-medium">{fx.preGain}%</span>
                </div>
                <input type="range" min={0} max={250} value={fx.preGain}
                  onChange={e => fxSet("preGain", Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-white/40">
                  <span className="flex items-center gap-1"><Music className="w-3 h-3" />עוצמת ליווי (אוזניות)</span>
                  <span className="text-white/60 font-medium">{fx.instrGain}%</span>
                </div>
                <input type="range" min={0} max={300} value={fx.instrGain}
                  onChange={e => fxSet("instrGain", Number(e.target.value))}
                  className="w-full accent-violet-400 cursor-pointer" />
              </div>
            </div>

            {/* Effects panel toggle */}
            <div className="w-full max-w-xs">
              <button
                onClick={() => setShowEffects(v => !v)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/6 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors text-sm">
                <span className="flex items-center gap-2"><SlidersHorizontal className="w-3.5 h-3.5" />אפקטים קוליים</span>
                {showEffects ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showEffects && (
                <div className="fx-panel mt-2 rounded-2xl p-4 space-y-5">

                  {/* EQ */}
                  <div>
                    <p className="text-[11px] font-semibold text-white/50 uppercase tracking-widest mb-3">Equalizer</p>
                    <div className="space-y-3">
                      <SliderRow label="בס (Bass)" value={fx.eqBass} min={-12} max={12} onChange={v => fxSet("eqBass", v)} />
                      <SliderRow label="אמצע (Mid)" value={fx.eqMid} min={-12} max={12} onChange={v => fxSet("eqMid", v)} />
                      <SliderRow label="טרבל (Treble)" value={fx.eqHigh} min={-12} max={12} onChange={v => fxSet("eqHigh", v)} />
                    </div>
                  </div>

                  {/* Reverb */}
                  <div>
                    <p className="text-[11px] font-semibold text-white/50 uppercase tracking-widest mb-3">Reverb</p>
                    <div className="space-y-3">
                      <SliderRow label="עומק (Wet)" value={fx.reverbWet} min={0} max={100} onChange={v => fxSet("reverbWet", v)} />
                      <SliderRow label="אורך (Decay)" value={fx.reverbDecay} min={0} max={100} onChange={v => fxSet("reverbDecay", v)} />
                    </div>
                  </div>

                  {/* Delay */}
                  <div>
                    <p className="text-[11px] font-semibold text-white/50 uppercase tracking-widest mb-3">Delay (Echo)</p>
                    <div className="space-y-3">
                      <SliderRow label="עומק (Wet)" value={fx.delayWet} min={0} max={100} onChange={v => fxSet("delayWet", v)} />
                      <SliderRow label="זמן (Time)" value={fx.delayTime} min={0} max={100} onChange={v => fxSet("delayTime", v)} />
                      <SliderRow label="משוב (Feedback)" value={fx.delayFeedback} min={0} max={95} onChange={v => fxSet("delayFeedback", v)} />
                    </div>
                  </div>

                  {/* Reset */}
                  <button onClick={() => setFx({ ...DEFAULT_EFFECTS })}
                    className="w-full text-xs text-white/30 hover:text-white/60 transition-colors py-1">
                    איפוס לברירת מחדל
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ SINGING ═══════════════════════════════════════════════════════ */}
        {phase === "singing" && (
          <div className="relative z-10 flex-1 flex flex-col">
            {/* Lyrics */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-14 gap-3 text-center select-none">
              {words.length === 0
                ? <p className="text-white/30 text-3xl tracking-widest">♪ ♪ ♪</p>
                : slots.map((line, slot) => {
                    if (!line) return <div key={slot} className="h-8" />;
                    const isCurrent = slot === 1;
                    const isPrev    = slot === 0;
                    return (
                      <div key={`${slot}-${line.startTime}`} className="transition-all duration-500 leading-tight"
                        style={{
                          fontSize:   isCurrent ? "clamp(1.6rem,5vw,3rem)" : "clamp(1rem,3vw,1.6rem)",
                          fontWeight: isCurrent ? 700 : 400,
                          opacity:    isCurrent ? 1 : isPrev ? 0.18 : 0.45,
                        }}>
                        {line.words.map((w, wi) => {
                          const gIdx = words.findIndex(gw => gw.start === w.start);
                          return (
                            <span key={wi} className={`inline-block mx-[2px] transition-all duration-100 ${wordClass(gIdx, isCurrent)}`}>
                              {w.word}
                            </span>
                          );
                        })}
                      </div>
                    );
                  })
              }
            </div>

            {/* Controls bottom */}
            <div className="pb-4 sm:pb-8 px-4 sm:px-6 flex flex-col items-center gap-3 sm:gap-4">
              {hasMic === false && (
                <div className="flex items-center gap-2 text-yellow-400/80 text-xs bg-yellow-400/10 border border-yellow-400/20 rounded-full px-3 py-1">
                  <MicOff className="w-3.5 h-3.5" />מיקרופון לא זמין
                </div>
              )}

              {/* Mic bars */}
              <div ref={barsRef} className="flex items-end gap-1 h-8">
                {Array.from({ length: 28 }).map((_, i) => (
                  <div key={i} className="bar w-1.5 rounded-full"
                    style={{ height: "3px", opacity: 0.18, background: `hsl(${260 + i * 2},80%,70%)` }} />
                ))}
              </div>

              {/* Quick effects rows during singing — mic gain + backing track */}
              <div className="w-full max-w-sm flex items-center gap-3">
                <Volume2 className="w-3.5 h-3.5 text-white/30 shrink-0" title="עוצמת מיק" />
                <input type="range" min={0} max={250} value={fx.preGain}
                  onChange={e => fxSet("preGain", Number(e.target.value))}
                  className="flex-1 accent-primary cursor-pointer" />
                <span className="text-white/30 text-xs w-10 text-right">{fx.preGain}%</span>
              </div>
              <div className="w-full max-w-sm flex items-center gap-3">
                <Music className="w-3.5 h-3.5 text-violet-400/50 shrink-0" title="עוצמת ליווי" />
                <input type="range" min={0} max={300} value={fx.instrGain}
                  onChange={e => fxSet("instrGain", Number(e.target.value))}
                  className="flex-1 accent-violet-400 cursor-pointer" />
                <span className="text-violet-400/50 text-xs w-10 text-right">{fx.instrGain}%</span>
              </div>

              {/* Inline reverb quick knob */}
              <div className="w-full max-w-sm flex items-center gap-3 text-xs text-white/30">
                <span className="w-16 shrink-0">Reverb</span>
                <input type="range" min={0} max={100} value={fx.reverbWet}
                  onChange={e => fxSet("reverbWet", Number(e.target.value))}
                  className="flex-1 accent-violet-400 cursor-pointer" />
                <span className="w-10 text-right">{fx.reverbWet}%</span>
              </div>

              {/* Video toggle (if available) */}
              {videoUrl && (
                <button onClick={() => setShowVideo(v => !v)}
                  className="text-[11px] text-white/25 hover:text-white/55 transition-colors">
                  {showVideo ? "הסתר וידאו" : "הצג וידאו"} ברקע
                </button>
              )}

              {/* Progress bar */}
              <div className="w-full max-w-sm">
                <div className="h-0.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${progress}%`, background: "linear-gradient(90deg,#7c3aed,#60a5fa)" }} />
                </div>
              </div>

              <button onClick={stopSession}
                className="w-16 h-16 rounded-full border-2 border-red-400/50 bg-red-500/12 hover:bg-red-500/25 flex items-center justify-center text-red-400 transition-colors">
                <Square className="w-5 h-5 fill-current" />
              </button>
              <p className="text-white/25 text-[11px]">לחץ לסיים ולשמור</p>
            </div>
          </div>
        )}

        {/* ══ DONE ══════════════════════════════════════════════════════════ */}
        {phase === "done" && result && (
          <div className="relative z-10 flex-1 overflow-y-auto flex flex-col items-center py-4 sm:py-6 px-4 sm:px-6 gap-4 sm:gap-5">

            {/* ── AI analyzing overlay ── */}
            {isAnalyzing && (
              <div className="w-full max-w-xs bg-primary/10 border border-primary/30 rounded-2xl px-4 py-3 flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
                <div>
                  <p className="text-primary text-sm font-semibold">AI מנתח את הביצוע…</p>
                  <p className="text-white/40 text-[11px]">ניתוח pitch מדויק מול המקור</p>
                </div>
              </div>
            )}

            <div className="text-center space-y-2">
              <div className="text-4xl sm:text-5xl mb-1">🎤</div>
              <div className="flex items-center justify-center gap-0.5 text-xl mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-5 h-5 transition-all duration-500 ${i < result.stars ? "text-yellow-400 fill-yellow-400" : "text-white/20"}`} />
                ))}
              </div>
              <div className="relative inline-block">
                <p className="score-grad text-6xl sm:text-7xl font-black leading-none transition-all duration-700">{result.score}</p>
                {result.serverScored && (
                  <span className="absolute -top-1 -right-8 text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30 rounded-full px-1.5 py-0.5 leading-none">
                    ✓ AI
                  </span>
                )}
              </div>
              <p className="text-white/35 text-sm">נקודות</p>
            </div>

            <div className="w-full max-w-xs grid grid-cols-2 gap-2.5">
              {[
                { label: "תזמון",   value: `${result.timingScore}%`,  color: "text-green-400",  icon: "⏱" },
                { label: "מנגינה",  value: `${result.pitchScore}%`,   color: "text-blue-400",   icon: "🎵" },
                ...(result.stabilityScore !== undefined
                  ? [{ label: "יציבות", value: `${result.stabilityScore}%`, color: "text-amber-400", icon: "📊" }]
                  : []),
                { label: "מילים",   value: `${result.wordsCovered}/${result.totalWords}`, color: "text-purple-400", icon: "📝" },
              ].map(s => (
                <div key={s.label} className="bg-white/6 border border-white/10 rounded-xl p-3 text-center">
                  <p className="text-white/30 text-sm mb-0.5">{s.icon}</p>
                  <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-white/35 text-[10px] mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="w-full max-w-xs bg-gradient-to-r from-primary/15 to-accent/15 border border-primary/20 rounded-2xl p-4 flex items-center gap-3">
              <span className="text-2xl shrink-0">🎙️</span>
              <div>
                <p className="text-white text-sm font-semibold">השוואה לאמן המקורי</p>
                <p className="text-3xl font-black" style={{ background: "linear-gradient(135deg,#c084fc,#60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {result.artistMatch}%
                </p>
                <p className="text-white/35 text-xs">{result.serverScored ? "מחושב ע״י AI מול המקור" : "התאמה לסגנון המקורי"}</p>
              </div>
            </div>

            {challengerName && challengerScore !== undefined && (
              <div className={`w-full max-w-xs rounded-2xl p-4 border text-center ${result.score > challengerScore ? "bg-green-500/15 border-green-500/30" : "bg-red-500/15 border-red-500/30"}`}>
                <p className="text-sm font-bold text-white">
                  {result.score > challengerScore ? `🏆 ניצחת את ${challengerName}!` : `😤 ${challengerName} עדיין מוביל...`}
                </p>
                <p className="text-white/45 text-xs mt-1">הציון שלך: {result.score} | שלהם: {challengerScore}</p>
              </div>
            )}

            {dur > 30 && (
              <div className="w-full max-w-xs bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
                <span className="text-xl">✂️</span>
                <div>
                  <p className="text-white text-xs font-medium">הרגע הטוב ביותר שלך</p>
                  <p className="text-white/45 text-[11px]">
                    {String(Math.floor(result.highlightStart / 60)).padStart(2, "0")}:{String(Math.floor(result.highlightStart % 60)).padStart(2, "0")}
                    {" – "}
                    {String(Math.floor((result.highlightStart + 30) / 60)).padStart(2, "0")}:{String(Math.floor((result.highlightStart + 30) % 60)).padStart(2, "0")}
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2.5 w-full max-w-xs pb-4">

              {/* ── Live mix calibration ── */}
              {hasVocal && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-3">
                  {/* Header */}
                  <div className="flex items-center gap-1.5 text-xs text-white/70">
                    <Sliders className="w-3.5 h-3.5" />
                    <span className="font-semibold">כיול מיקס</span>
                    <span className="text-white/35 mr-auto text-[10px]">שמע + כייל לפני ייצוא</span>
                  </div>

                  {/* Vocal gain */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-white/50">
                      <span>🎤 קול</span>
                      <span className="font-mono text-white/70">{Math.round(mixVocalGain * 100)}%</span>
                    </div>
                    <input
                      type="range" min={0} max={2} step={0.02}
                      value={mixVocalGain}
                      onChange={e => updatePreviewVocalGain(Number(e.target.value))}
                      className="w-full accent-violet-400 cursor-pointer h-1"
                    />
                  </div>

                  {/* Instrumental gain */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-white/50">
                      <span>🎵 ליווי</span>
                      <span className="font-mono text-white/70">{Math.round(mixInstrGain * 100)}%</span>
                    </div>
                    <input
                      type="range" min={0} max={2} step={0.02}
                      value={mixInstrGain}
                      onChange={e => updatePreviewInstrGain(Number(e.target.value))}
                      className="w-full accent-blue-400 cursor-pointer h-1"
                    />
                  </div>

                  {/* Sync offset — hidden by default, toggle to show */}
                  <div className="border-t border-white/8 pt-2.5">
                    <button
                      onClick={() => setShowSyncSlider(!showSyncSlider)}
                      className="flex items-center justify-between w-full text-[10px] text-white/40 hover:text-white/60 transition-colors">
                      <span>⏱ סנכרון קול ({syncOffsetMs > 0 ? '+' : ''}{syncOffsetMs}ms)</span>
                      {showSyncSlider ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                    {showSyncSlider && (
                      <div className="space-y-1 mt-2">
                        <div className="flex justify-between text-[10px] text-white/50">
                          <span>כיוון עדין</span>
                          <span className={`font-mono ${syncOffsetMs === DEFAULT_SYNC_OFFSET ? 'text-white/40' : syncOffsetMs > 0 ? 'text-blue-400' : 'text-amber-400'}`}>
                            {syncOffsetMs > 0 ? `+${syncOffsetMs}` : syncOffsetMs}ms
                          </span>
                        </div>
                        <input
                          type="range" min={-500} max={500} step={10}
                          value={syncOffsetMs}
                          onChange={e => updatePreviewSyncOffset(Number(e.target.value))}
                          className="w-full accent-emerald-400 cursor-pointer h-1"
                        />
                        <div className="flex justify-between text-[10px] text-white/25">
                          <span>קול מוקדם ←</span>
                          <span>→ קול מאוחר</span>
                        </div>
                        <button
                          onClick={() => updatePreviewSyncOffset(DEFAULT_SYNC_OFFSET)}
                          className="w-full text-[10px] text-white/30 hover:text-white/50 transition-colors text-center">
                          איפוס לברירת מחדל ({DEFAULT_SYNC_OFFSET}ms)
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Play/Stop preview button */}
                  <button
                    onClick={() => isPreviewPlaying ? stopMixPreview() : startMixPreview()}
                    className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-colors border ${
                      isPreviewPlaying
                        ? 'bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/25'
                        : 'bg-white/8 border-white/15 text-white/80 hover:bg-white/15'
                    }`}>
                    {isPreviewPlaying
                      ? <><StopCircle className="w-3.5 h-3.5" />עצור תצוגה מקדימה</>
                      : <><PlayCircle className="w-3.5 h-3.5" />האזן למיקס</>
                    }
                  </button>

                  {/* Finalize with chosen gains */}
                  <button
                    onClick={finalizeWithChosenGains}
                    disabled={isMixing}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-violet-600/25 border border-violet-500/35 text-violet-300 hover:bg-violet-600/35 transition-colors text-xs font-medium disabled:opacity-40">
                    <Download className="w-3 h-3" />
                    {isMixing ? 'מייצר...' : 'ייצא עם הגדרות אלה'}
                  </button>
                </div>
              )}

              {/* ── Re-export shortcut (offset already set in mix panel above) ── */}
              {hasVocal && syncOffsetMs !== DEFAULT_SYNC_OFFSET && (
                <button
                  onClick={() => remixWithOffset(syncOffsetMs)}
                  disabled={isMixing}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/6 border border-white/10 text-white/55 hover:bg-white/12 hover:text-white/80 transition-colors text-xs disabled:opacity-40">
                  <RefreshCw className={`w-3 h-3 ${isMixing ? 'animate-spin' : ''}`} />
                  {isMixing ? 'מחשב...' : `ייצא עם תזמון ${syncOffsetMs > 0 ? '+' : ''}${syncOffsetMs}ms`}
                </button>
              )}

              {isMixing && !dlUrl && (
                <div className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-white/70 text-sm border border-white/10 bg-white/5">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  מעבד הקלטה...
                </div>
              )}
              {dlUrl && (
                <>
                  <a href={dlUrl} download={`${songName.replace(/\.[^.]+$/, "")}-cover.wav`}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-white font-semibold text-sm hover:scale-105 transition-transform"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)", boxShadow: "0 0 40px rgba(124,58,237,.45)" }}>
                    <Download className="w-4 h-4" />הורד את הביצוע שלך (WAV)
                  </a>
                  <button
                    disabled={cloudRecording.status === "uploading" || cloudRecording.status === "done"}
                    onClick={() => {
                      if (cloudRecording.status === "error") cloudRecording.reset();
                      if (recordingBlobRef.current) {
                        cloudRecording.upload(recordingBlobRef.current, `${songName.replace(/\.[^.]+$/, "")}-cover.wav`).catch(() => {});
                      }
                    }}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-white font-semibold text-sm transition-all disabled:opacity-60"
                    style={{
                      background: cloudRecording.status === "done"
                        ? "linear-gradient(135deg,#10b981,#059669)"
                        : cloudRecording.status === "error"
                        ? "linear-gradient(135deg,#ef4444,#dc2626)"
                        : "linear-gradient(135deg,#06b6d4,#8b5cf6)",
                      boxShadow: "0 0 30px rgba(6,182,212,.3)",
                    }}>
                    {cloudRecording.status === "uploading" ? (
                      <><Loader2 className="w-4 h-4 animate-spin" />שומר בענן... {cloudRecording.progress}%</>
                    ) : cloudRecording.status === "done" ? (
                      <><CheckCircle2 className="w-4 h-4" />נשמר בענן ✓</>
                    ) : cloudRecording.status === "error" ? (
                      <><Cloud className="w-4 h-4" />שגיאה — נסה שוב</>
                    ) : (
                      <><Cloud className="w-4 h-4" />שמור בענן</>
                    )}
                  </button>
                </>
              )}
              {savedPerfId && !publishPerf.isSuccess && (
                <button
                  onClick={() => publishPerf.mutate(savedPerfId)}
                  disabled={publishPerf.isPending}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 text-yellow-300 hover:from-yellow-500/30 hover:to-amber-500/30 transition-all text-sm font-semibold"
                >
                  {publishPerf.isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />שולח...</>
                  ) : (
                    <><Trophy className="w-4 h-4" />שתף בלידרבורד 🏆</>
                  )}
                </button>
              )}
              {publishPerf.isSuccess && (
                <div className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-green-500/15 border border-green-500/25 text-green-400 text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4" />שותף בלידרבורד! ✓
                </div>
              )}
              <button onClick={handleShare}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white/8 border border-white/12 text-white hover:bg-white/15 transition-colors text-sm">
                <Share2 className="w-4 h-4" />{copied ? "הועתק! ✓" : "שתף תוצאה"}
              </button>
              <button onClick={handleChallenge}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-amber-500/15 border border-amber-500/25 text-amber-400 hover:bg-amber-500/25 transition-colors text-sm">
                <Trophy className="w-4 h-4" />אתגר חבר 🏆
              </button>
              <button onClick={restart}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white/6 border border-white/10 text-white/55 hover:text-white hover:bg-white/12 transition-colors text-sm">
                <RefreshCw className="w-4 h-4" />שיר שוב
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
