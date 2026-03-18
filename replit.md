# MYOUKEE — AI Karaoke Generator

## Overview
MYOUKEE is a full-stack AI karaoke generator that transforms audio or video files into karaoke MP4s with synchronized, animated lyrics. It leverages AI for vocal separation and transcription, supports multiple languages including automatic RTL/LTR layout, and offers a personalized experience with optional animated user avatars. The project aims to provide a high-quality, accessible karaoke creation tool for a global audience. Key capabilities include karaoke generation from user uploads, a comprehensive party mode for group singing, and a gamification system to enhance user engagement.

## User Preferences
I want iterative development. I prefer detailed explanations. Ask before making major changes. Do not make changes to the `artifacts/karaoke-mobile/` folder. Do not make changes to the `lib/api-spec/` folder.

## System Architecture

### UI/UX Decisions
The frontend is built with React, Vite, TailwindCSS, shadcn/ui, and Framer Motion, supporting PWA functionality and full internationalization for 14 languages. The design prioritizes responsiveness across devices, featuring optimized layouts, mobile-specific fixes, and dynamic viewport handling. Visuals include a cinematic karaoke video style with animated gradients and specific lyric layouts for readability. RTL layout is fully supported with critical fixes to prevent display issues. A full-page login screen offers Google OAuth and email/password options, requiring acceptance of legal terms.

### Technical Implementations
The project uses a monorepo structure with pnpm workspaces for the React frontend (`karaoke-app`), Node.js Express API (`api-server`), and Python FastAPI processor (`karaoke-processor`). Authentication is handled via Google OAuth and email/password with `passport.js` and `bcrypt`. Data is managed with a PostgreSQL database and Drizzle ORM. Orval generates API clients and Zod schemas for type safety. A credit-based payment system is integrated with Stripe and PayPal. Advanced audio processing ensures precise vocal synchronization and applies baked-in vocal effects.

### Feature Specifications
- **Karaoke Generation**: Upload audio/video -> AI (Demucs, faster-whisper) processes for vocal separation and transcription -> user edits -> generates MP4 with synchronized, animated lyrics and optional avatar.
- **Avatar Animation**: User profile photos are background-removed, enhanced, and integrated into videos.
- **Content Management**: Multilingual legal pages.
- **Copyright Confirmation**: Required user consent for uploaded audio.
- **Watermarking**: MYOUKEE logo on all generated videos.
- **Party Mode**: Features party rooms, a song queue with host controls, scoring and leaderboards, duet/battle modes, theme packs, social clip sharing, YouTube/gallery song picker, auto-playing videos, and a fullscreen party display, all with full i18n support.
- **Gamification System**: XP-based progression with 30 level tiers, 22 badges across 5 tiers, 8 progress-based achievements, a global XP leaderboard (opt-in for performance sharing), and daily login streaks, with full i18n and anti-farming rate limiting.
- **Cloud Recording Save**: Mixed karaoke recordings are uploaded to Replit Object Storage (GCS) via presigned URLs and stored in a `recordings` DB table. A "My Recordings" page allows playback, download, and deletion with access control.
- **Gallery Upload in Party**: Enables direct audio/video uploads from phone galleries within party rooms, processing them into the queue.
- **Public Shared View**: `/shared/:id` page shows karaoke video publicly without authentication. Bypasses both consent gate and auth gate. Share buttons generate `/shared/:id` URLs. Includes CTA to create own karaoke.

### System Design Choices
The processing pipeline uses a serial Demucs→Whisper flow to prevent OOM errors, with parallel pre-rendering to reduce wait times and automatic fallback for failed pre-renders. GPU-accelerated encoding (NVENC) is used where available, falling back to CPU. Job state is managed in-memory with temporary file storage. FFmpeg utilizes ASS for complex subtitle rendering. Comprehensive language support includes both RTL and LTR languages for UI and video subtitles.

## External Dependencies

- **Cloud Deployment**:
    - Frontend: Render (static build)
    - API Server: Render (Node.js)
    - Karaoke Processor: Modal Labs (H100 GPU)
- **AI Models**:
    - Vocal Separation: Demucs v4 `htdemucs_ft`
    - Transcription: faster-whisper `large-v3`
- **Database**: PostgreSQL
- **Payment Gateways**:
    - PayPal (direct REST API v2) — sole payment method
- **Authentication**:
    - Google OAuth
    - Email/Password (bcrypt)
    - Password Reset via email (Brevo SMTP)
    - JWT tokens for cross-origin auth
- **Email Service**: Brevo SMTP
- **Other**:
    - FFmpeg (video generation)
    - Google Fonts (Montserrat, Noto Sans Hebrew, Noto Sans CJK SC)

## Video Generation Visual Style
- **Fonts**: Montserrat (Latin, bold cinematic look), Noto Sans Hebrew (RTL), Noto Sans CJK SC (CJK). All in `artifacts/karaoke-processor/fonts/`.
- **ASS Subtitle Effects**: Neon cyan/magenta active word glow (\\blur6 + \\fscx105/\\fscy105 scale pop), pinkish "sung" words, gradient opacity for context lines (Near 48px, Far 36px, Active 68px). 6 styles: Active, Glow, Sung, ActiveDim, Near, Far.
- **Background**: Multi-layer aurora nebula (geq sine waves with clip(), 5+ overlapping color frequencies for purple/cyan/magenta/blue), gaussian blur σ=6, pre-rendered at 160×90 upscaled to 640×360.
- **Waveform**: 3-color (cyan/magenta/purple) cline mode, sqrt scale.
- **Avatar**: Only explicitly uploaded photos — Google profile photos are NOT auto-sent.