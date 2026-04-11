# MYOUKEE — AI Karaoke Generator

## Overview
MYOUKEE is a full-stack AI karaoke generator that transforms audio or video files into karaoke MP4s with synchronized, animated lyrics. It uses AI for vocal separation and transcription, supports multiple languages including automatic RTL/LTR layout, and offers a personalized experience with optional animated user avatars. The project aims to provide a high-quality, accessible karaoke creation tool for a global audience, featuring karaoke generation, a party mode for group singing, and a gamification system for user engagement.

## User Preferences
I want iterative development. I prefer detailed explanations. Ask before making major changes. Do not make changes to the `artifacts/karaoke-mobile/` folder. Do not make changes to the `lib/api-spec/` folder.

## System Architecture

### UI/UX Decisions
The frontend is built with React, Vite, TailwindCSS, shadcn/ui, and Framer Motion, supporting PWA and full internationalization for 14 languages. It prioritizes responsive design across devices, with optimized layouts and RTL layout support. The visual style is cinematic with animated gradients and specific lyric layouts for readability. A full-page login supports Google OAuth and email/password. The home page features a 3-section structure: Hero, How it Works, and Features (unified bento grid with singing, AI, avatar hero cards + 6 feature cards for Party Mode, Battle & Duet, Levels/Badges, Export MP4, Performance Analysis, Lyrics Editor).

### Technical Implementations
The project uses a monorepo structure with pnpm workspaces for the React frontend (`karaoke-app`), Node.js Express API (`api-server`), and Python FastAPI processor (`karaoke-processor`). Authentication is handled via Google OAuth and email/password with `passport.js` and `bcrypt`. Data is managed with PostgreSQL and Drizzle ORM. Orval generates API clients and Zod schemas. A credit-based payment system is integrated with Stripe and PayPal. Advanced audio processing ensures precise vocal synchronization and applies baked-in vocal effects.

### Feature Specifications
- **Karaoke Generation**: Processes user-uploaded audio/video using AI (Demucs, faster-whisper) for vocal separation and transcription, allowing user edits, and generating MP4s with synchronized, animated lyrics and optional avatars.
- **Avatar Animation**: User profile photos are background-removed, enhanced, and integrated into videos.
- **Party Mode**: Offers party rooms, a song queue with host controls, scoring and leaderboards, duet/battle modes, theme packs, social clip sharing, and YouTube/gallery song picker, all with full i18n support.
- **Gamification System**: Includes XP-based progression (30 level tiers), 22 badges, 8 achievements, a global XP leaderboard, and daily login streaks, with i18n and anti-farming rate limiting.
- **Purchase Receipt Emails**: Automatic multilingual email receipts sent after credit purchases via Stripe.
- **Weekly Challenges & Tournaments (Stage 1 Complete)**: Weekly singing challenges with countdown timers, leaderboards, prize credits, performance-picker entry UI, and admin-only challenge creation (`ADMIN_EMAILS` env var). Full i18n for all 14 languages. Routes: `GET/POST /api/challenges`, `GET /api/challenges/:id`, `POST /api/challenges/:id/enter`. Frontend: `/challenges` page with `use-challenges.ts` hooks.
- **Social Feed (Stage 1 Complete)**: Follow system, performance feed (personal + discover tabs), likes/comments, user profiles with stats. Full i18n for all 14 languages. Routes: `/api/social/follow/:userId`, `/api/social/feed`, `/api/social/like/:performanceId`, `/api/social/comment/:performanceId`, `/api/social/profile/:userId`. Frontend: `/community` feed page, `/profile/:userId` page, `use-social.ts` hooks.
- **AI Vocal Coach (Stage 1 Complete)**: Rule-based vocal coaching tips per performance (pitch, timing, coverage, overall) with severity levels (praise/suggestion/warning). Progress tracking with score history chart. Tips integrated into VocalCoach page with performance selector. Full i18n for all 14 languages. Routes: `GET /api/vocal-coach/:performanceId`, `GET /api/vocal-coach/progress/me`. Frontend: `/vocal-coach` page, `VocalCoachTips` + `VocalCoachProgress` components, `use-vocal-coach.ts` hooks.
- **Gallery Upload in Party**: Allows direct audio/video uploads from phone galleries within party rooms.
- **Public Shared View**: Enables public viewing of karaoke videos via `/shared/:id` URLs without authentication.
- **Vocal Scoring Engine v2**: Utilizes multi-dimensional AI analysis (Modal Labs) for pitch accuracy, DTW temporal alignment, melody contour matching, per-note stability (with vibrato detection), onset timing precision, and expression/dynamics. Audio preprocessing includes RMS normalization and noise gating.
- **System Design Choices**: Processing pipeline uses serial Demucs→Whisper flow, parallel pre-rendering, and GPU-accelerated encoding with CPU fallback. Job state is in-memory with temporary file storage. FFmpeg uses ASS for complex subtitle rendering with full language support, including RTL video subtitles with per-word `\pos()` placement and character reversal. A Whisper hallucination filter removes unwanted text from transcript boundaries. FFmpeg calls have timeouts, and frontend detects and allows retrying stuck jobs.
- **Analytics Dashboard**: Provides real-time insights into platform data at `/analytics/`, including KPIs, user activity, song processing, performances, gamification, referrals, and party room statistics.
- **International SEO (i18n)**: Language-specific SEO landing pages at `/lang/{code}` with full marketing content, dynamic SEO meta tags, hreflang clusters in `sitemap.xml`, and `robots.txt` configuration.
- **SEO Feature Landing Pages**: 5 public feature landing pages at `/features/:slug` for Vocal Remover, Karaoke Generator, Party Mode, Auto Lyrics Sync, and AI Singing Score & Vocal Coach, bypassing authentication and featuring dynamic meta tags and JSON-LD.
- **SEO Infrastructure**: Includes `robots.txt` configuration, a comprehensive `sitemap.xml`, `index.html` JSON-LD graph, dynamic `VideoObject` JSON-LD for shared views, and bypassed consent gate for SEO-critical routes.

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
    - PayPal (direct REST API v2)
    - Lemon Squeezy (credit card payments, Merchant of Record)
- **Authentication**:
    - Google OAuth
    - Email/Password (bcrypt)
    - Password Reset via email (Brevo SMTP)
    - JWT tokens
- **Email Service**: Brevo SMTP
- **Other**:
    - FFmpeg (video generation)
    - Google Fonts (Montserrat, Noto Sans Hebrew, Noto Sans CJK SC)