FROM pytorch/pytorch:2.3.0-cuda12.1-cudnn8-runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive \
    DEMUCS_DEVICE=cuda

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    git \
    curl \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN python -c "\
from faster_whisper import WhisperModel; \
WhisperModel('large-v3-turbo', device='cpu', compute_type='int8')" && \
python -c "\
import demucs.pretrained; \
demucs.pretrained.get_model('htdemucs')"

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
