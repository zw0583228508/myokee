"""
Modal Labs deployment for Karaoke Processor.
Deploy:  modal deploy artifacts/karaoke-processor/modal_app.py
"""

import modal
from pathlib import Path

_local_dir = str(Path(__file__).parent)

jobs_volume = modal.Volume.from_name("karaoke-jobs", create_if_missing=True)

image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("ffmpeg", "libsndfile1", "git", "curl", "nodejs", "npm")
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
        "soundfile",
        "torch==2.3.0",
        "torchaudio==2.3.0",
        "yt-dlp==2026.3.17",
    )
    .run_commands(
        "python -c \"from demucs.pretrained import get_model; get_model('htdemucs')\"",
        "python -c \"from faster_whisper import WhisperModel; WhisperModel('large-v3-turbo', device='cpu', compute_type='int8')\"",
    )
    .add_local_dir(_local_dir, remote_path="/app")
)

app = modal.App("karaoke-processor", image=image)


@app.function(
    gpu="H100",
    volumes={
        "/tmp/karaoke_jobs": jobs_volume,
    },
    min_containers=1,
    max_containers=1,
    scaledown_window=300,
    timeout=600,
    secrets=[
        modal.Secret.from_dict({
            "DEMUCS_DEVICE": "cuda",
            "WHISPER_DEVICE": "cuda",
        })
    ],
)
@modal.concurrent(max_inputs=100)
@modal.asgi_app()
def fastapi_app():
    import sys
    sys.path.insert(0, "/app")
    from main import app as processor_app
    return processor_app
