# MYOUKEE — AI Karaoke Generator

## Overview
MYOUKEE is a full-stack AI karaoke generator that transforms audio or video files into karaoke MP4s with synchronized, animated lyrics. It leverages AI for vocal separation and transcription, supports multiple languages including automatic RTL/LTR layout, and offers a personalized experience with optional animated user avatars. The project aims to provide a high-quality, accessible karaoke creation tool for a global audience.

## User Preferences
I want iterative development. I prefer detailed explanations. Ask before making major changes. Do not make changes to the `artifacts/karaoke-mobile/` folder. Do not make changes to the `lib/api-spec/` folder.

## System Architecture

### UI/UX Decisions
The frontend is built with React, Vite, TailwindCSS, shadcn/ui, and Framer Motion, ensuring a modern, responsive, and performant user interface across all devices (mobile, tablet, desktop). Key design elements include:
- **PWA Support**: Full Progressive Web App functionality for offline access and native app-like experience.
- **Internationalization**: Full i18n support for 14 languages with auto-detection, covering all key UI elements and legal pages.
- **Visuals**: Increased background image opacity for a richer feel, cinematic karaoke video style with animated aurora/plasma gradients, and specific lyric layout for readability and aesthetic.
- **Responsiveness**: Optimized layouts for various screen sizes using `sm:`, `md:`, `lg:` breakpoints.
- **Login Experience**: Full-page login screen with Google OAuth and email/password options, including a language picker and RTL-aware layout.

### Technical Implementations
- **Monorepo Structure**: Managed with pnpm workspaces for `karaoke-app` (React frontend), `api-server` (Node.js Express), and `karaoke-processor` (Python FastAPI).
- **Authentication**: Supports Google OAuth and email/password authentication using `passport.js` and `bcrypt` for password hashing.
- **Data Layer**: PostgreSQL database managed with Drizzle ORM.
- **API Codegen**: Orval is used to generate API clients and Zod schemas from an OpenAPI specification, ensuring type safety and consistency.
- **Referral Program**: Implemented with unique referral codes and a credit-based reward system, leveraging DB transactions for atomicity.
- **Payment System**: Credit-based system with one-time payments supported via Stripe and PayPal integrations. Includes features like payment recovery, atomic fulfillment, retry logic (3 attempts with backoff), and Stripe webhook support for automatic credit fulfillment.
- **Vocal Sync**: Advanced audio processing to ensure precise synchronization of recorded vocals with instrumental tracks, including trim/pad logic for alignment.
- **Vocal FX**: Baked-in vocal effects (reverb, delay) applied during recording.

### Feature Specifications
- **Karaoke Generation**: Upload audio/video -> AI separates vocals (Demucs) -> AI transcribes lyrics with word-level timestamps (faster-whisper) -> User reviews/edits transcript -> Generates MP4 video with synchronized, animated lyrics and optional user avatar.
- **Avatar Animation**: Users can upload a profile photo, which is background-removed and enhanced with a neon glow, then integrated into the karaoke video.
- **Content Management**: Multilingual legal pages (Terms, Privacy, Copyright) with content stored as per-language arrays.
- **Copyright Confirmation**: Required user consent for legal right to use uploaded audio.
- **Watermarking**: Semi-transparent MYOUKEE logo in the top-right corner of all generated karaoke videos.

### System Design Choices
- **Processing Pipeline**: A serial Demucs→Whisper pipeline is used to prevent OOM errors, with pre-rendering starting in parallel to Whisper to reduce overall wait time.
- **Job Management**: Job state is managed in-memory within the Python service, with files stored temporarily.
- **Subtitle Format**: FFmpeg utilizes ASS (Advanced SubStation Alpha) for subtitle rendering, allowing for complex styling and animation of lyrics.
- **Language Support**: Comprehensive support for RTL (Hebrew, Arabic) and LTR languages in both UI and video subtitles.

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
    - Stripe (via Replit Stripe connector)
    - PayPal (direct REST API v2)
- **Authentication**:
    - Google OAuth (popup flow with localStorage fallback + redirect fallback)
    - Email/Password (bcrypt)
    - Password Reset via email (Brevo SMTP, 1-hour token expiry, atomic token consumption)
    - JWT tokens used for cross-origin auth (30-day expiry)
    - Callback HTML stores JWT in localStorage AND sends via postMessage for robustness
    - Auth errors from Google OAuth are surfaced on LoginPage via URL params
- **Email Service**: Brevo SMTP (smtp-relay.brevo.com:587), env vars: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_EMAIL, SMTP_FROM_NAME
- **Other**:
    - FFmpeg (for video generation and processing)
    - Google Fonts (for Noto Sans Hebrew and other fonts)