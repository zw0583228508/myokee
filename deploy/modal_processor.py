"""
MYOUKEE Karaoke Processor — Modal Deployment
H100 SXM GPU · Serverless · Auto-scales to 50+ concurrent jobs

Usage:
  pip install modal
  modal setup                          # authenticate once
  modal deploy deploy/modal_processor.py

After deploy, copy the printed URL to your API server's PROCESSOR_URL env var.
"""

import modal

app = modal.App("myoukee-processor")

# ── Persistent shared volume ───────────────────────────────────────────────────
# All GPU instances share the same volume so job files + state are consistent.
jobs_volume = modal.Volume.from_name("myoukee-jobs", create_if_missing=True)
JOBS_MOUNT  = "/tmp/karaoke_jobs"

# ── Container image ────────────────────────────────────────────────────────────
# PyTorch 2.3 + CUDA 12.1 base, then add all MYOUKEE dependencies.
processor_image = (
    modal.Image.from_registry(
        "pytorch/pytorch:2.3.0-cuda12.1-cudnn8-runtime",
        add_python="3.11",
    )
    .apt_install(
        "ffmpeg",
        "git",
        "curl",
        "nodejs",   # required by yt-dlp for JS challenge solving
        "npm",
    )
    .pip_install(
        "fastapi==0.135.1",
        "uvicorn[standard]==0.41.0",
        "python-multipart",
        "demucs==4.0.1",
        "faster-whisper==1.2.1",
        "ffmpeg-python==0.2.0",
        "httpx==0.28.1",
        "numpy==2.4.3",
        "pillow==12.1.1",
        "pydantic==2.12.5",
        "rembg==2.0.72",
        "scipy==1.17.1",
        "torchaudio==2.3.0",
        "yt-dlp",
    )
    # Copy processor source into the image
    .copy_local_dir("artifacts/karaoke-processor", "/app")
    # Pre-bake model weights — eliminates cold-start model download
    .run_commands(
        "cd /app && python -c \""
        "from faster_whisper import WhisperModel; "
        "WhisperModel('large-v3-turbo', device='cpu', compute_type='int8')"
        "\"",
        "cd /app && python -c \""
        "import demucs.pretrained; "
        "demucs.pretrained.get_model('htdemucs')"
        "\"",
    )
)

# ── ASGI endpoint — full FastAPI app served with H100 GPU ─────────────────────
@app.function(
    image=processor_image,
    gpu="H100",                          # Fastest GPU available on Modal
    volumes={JOBS_MOUNT: jobs_volume},   # Shared job storage
    timeout=900,                         # 15 min max (handles very long songs)
    memory=32768,                        # 32 GB RAM
    secrets=[modal.Secret.from_name("myoukee-secrets", required=False)],
    keep_warm=1,                         # 1 warm instance → zero cold start
    allow_concurrent_inputs=4,           # Process up to 4 jobs per H100 instance
)
@modal.asgi_app()
def serve():
    """Run the MYOUKEE FastAPI processor with H100 GPU and CUDA acceleration."""
    import os
    import sys

    # Tell the processor to use CUDA (GPU) instead of CPU
    os.environ["DEMUCS_DEVICE"] = "cuda"
    os.environ["WHISPER_DEVICE"] = "cuda"

    sys.path.insert(0, "/app")
    from main import app as fastapi_app  # noqa: PLC0415
    return fastapi_app


# ── One-off GPU job trigger (alternative: call via HTTP) ─────────────────────
@app.function(
    image=processor_image,
    gpu="H100",
    volumes={JOBS_MOUNT: jobs_volume},
    timeout=900,
    memory=32768,
)
def process_job_gpu(job_id: str):
    """Trigger processing of a single job by ID. Called from the API server."""
    import os, sys
    os.environ["DEMUCS_DEVICE"] = "cuda"
    os.environ["WHISPER_DEVICE"] = "cuda"
    sys.path.insert(0, "/app")
    import asyncio
    from main import process_job
    asyncio.run(process_job(job_id))


if __name__ == "__main__":
    # Local test: modal run deploy/modal_processor.py::process_job_gpu --job-id=<id>
    pass
