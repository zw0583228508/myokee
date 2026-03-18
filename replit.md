# MYOUKEE — AI Karaoke Generator

## Overview
MYOUKEE is a full-stack AI karaoke generator that transforms audio or video files into karaoke MP4s with synchronized, animated lyrics. It leverages AI for vocal separation and transcription, supports multiple languages including automatic RTL/LTR layout, and offers a personalized experience with optional animated user avatars. The project aims to provide a high-quality, accessible karaoke creation tool for a global audience.

## User Preferences
I want iterative development. I prefer detailed explanations. Ask before making major changes. Do not make changes to the `artifacts/karaoke-mobile/` folder. Do not make changes to the `lib/api-spec/` folder.

## System Architecture

### UI/UX Decisions
The frontend is built with React, Vite, TailwindCSS, shadcn/ui, and Framer Motion, ensuring a modern, responsive, and performant user interface across all devices (mobile, tablet, desktop). Key design elements include:
- **PWA Support**: Full Progressive Web App functionality for offline access and native app-like experience.
- **Internationalization**: Full i18n support for 14 languages. Default language is **English** for first-time users; user's choice is persisted in localStorage.
- **Visuals**: Increased background image opacity for a richer feel, cinematic karaoke video style with animated aurora/plasma gradients, and specific lyric layout for readability and aesthetic.
- **Responsiveness**: Optimized layouts for various screen sizes using `sm:`, `md:`, `lg:` breakpoints. Mobile-specific fixes include: non-blocking Google Fonts via `<link>` tags (not CSS `@import`), `-webkit-backdrop-filter` prefixes with `@supports not` fallbacks, 44px minimum touch targets, 16px input font (prevents iOS auto-zoom), `ErrorBoundary` component wrapping the app, branded loading screen with retry button for JS boot failures, and `overflow-x-hidden` instead of `overflow-x: clip` for broader browser support.
- **Service Worker**: Cache version `myoukee-v4` with network-first strategy for both HTML navigation AND static assets (prevents stale cached content causing blank screens on mobile after deploys). Includes SW version tracking in `main.tsx` with automatic cache purge on version mismatch. `sw.js`, `index.html`, and `site.webmanifest` served with `no-cache` headers in both Vercel and Netlify configs to ensure SW updates propagate. Build targets set to Chrome 87+/Safari 14+/Firefox 78+ for maximum mobile browser compatibility. Viewport uses `viewport-fit=cover` for notched iPhones; safe-area padding applied only in `display-mode: standalone` (PWA). Uses `100dvh` for dynamic viewport height on mobile. `background-attachment: fixed` overridden to `scroll` on mobile for iOS Safari compatibility.
- **RTL Layout**: Critical RTL fixes — `overflow-x: clip` on `html` (with `hidden` fallback) instead of `overflow-x-hidden` on `body` to prevent content-shift bugs in Chrome/Samsung browsers. `max-width: 100%` instead of `100vw` to avoid scrollbar-width discrepancies. SEO content hidden via `clip-path:inset(50%)` instead of `left:-9999px` (the latter creates massive horizontal overflow in RTL, pushing visible content to the right on tablets). Page-level `overflow-x-hidden` removed from Home.tsx; individual sections handle their own overflow.
- **Login Experience**: Full-page login screen with Google OAuth and email/password options, including a language picker and RTL-aware layout. A mandatory Terms of Service / Privacy Policy / Copyright checkbox must be checked before any login method (Google or email/password) is enabled. Both LoginPage.tsx and LoginModal.tsx enforce this gate.

### Technical Implementations
- **Monorepo Structure**: Managed with pnpm workspaces for `karaoke-app` (React frontend), `api-server` (Node.js Express), and `karaoke-processor` (Python FastAPI).
- **Authentication**: Supports Google OAuth and email/password authentication using `passport.js` and `bcrypt` for password hashing.
- **Data Layer**: PostgreSQL database managed with Drizzle ORM.
- **API Codegen**: Orval is used to generate API clients and Zod schemas from an OpenAPI specification, ensuring type safety and consistency.
- **Referral Program**: Implemented with unique referral codes and a credit-based reward system, leveraging DB transactions for atomicity.
- **Payment System**: Credit-based system with one-time payments supported via Stripe and PayPal integrations. Includes features like payment recovery, atomic fulfillment, retry logic (3 attempts with backoff), and Stripe webhook support for automatic credit fulfillment. The `fulfilled_sessions` table provides idempotent credit delivery (prevents double-crediting). Comprehensive logging with `[Fulfill]`, `[CreditFulfill]`, and `[Stripe Webhook]` prefixes for production debugging.
- **Vocal Sync**: Advanced audio processing to ensure precise synchronization of recorded vocals with instrumental tracks, including trim/pad logic for alignment.
- **Vocal FX**: Baked-in vocal effects (reverb, delay) applied during recording.

### Feature Specifications
- **Karaoke Generation**: Upload audio/video -> AI separates vocals (Demucs) -> AI transcribes lyrics with word-level timestamps (faster-whisper) -> User reviews/edits transcript -> Generates MP4 video with synchronized, animated lyrics and optional user avatar.
- **Avatar Animation**: Users can upload a profile photo, which is background-removed and enhanced with a neon glow, then integrated into the karaoke video.
- **Content Management**: Multilingual legal pages (Terms, Privacy, Copyright) with content stored as per-language arrays.
- **Copyright Confirmation**: Required user consent for legal right to use uploaded audio.
- **Watermarking**: Semi-transparent MYOUKEE logo in the top-right corner of all generated karaoke videos.
- **Party Mode**: Full party karaoke system with 7 features:
  - **Party Rooms**: Create/join rooms via 6-char codes, polling-based real-time updates (2-5s refetchInterval)
  - **Queue System**: Song queue with host controls for advancing and reordering (up/down arrows), guests can add songs. Host can reorder waiting items via `PUT /party/rooms/:id/queue/:itemId/reorder` (atomic single-query swap).
  - **Scoring & Leaderboard**: Party scores with leaderboard display (total score, best score, songs sung)
  - **Duet Mode**: Split lyrics between Singer A/B with color-coded lines and turn indicators (`DuetMode.tsx`)
  - **Battle Mode**: Two singers compete with split-screen scoring display and winner announcement (`BattleMode.tsx`)
  - **Theme Packs**: 5 themes (Neon Night, Birthday Bash, Retro Vibes, Elegant Gold, Ocean Wave) in `party-themes.ts`
  - **Social Clips**: Shareable score cards with WhatsApp/Twitter/native share (`SocialClip.tsx`)
  - **Song Picker**: Add songs via YouTube URL (direct paste in party room, processes and auto-adds to queue), file upload from gallery, or from user's completed karaoke job history with search filter
  - **Auto-Play Video**: Karaoke videos auto-play inline when queue item has a `job_id`; auto-advances to next song on video end (host only)
  - **Party Display**: Fullscreen TV/projector mode with animated particles (`PartyDisplay.tsx`)
  - **i18n**: Full translations for all party strings across 14 languages (`partyTranslations.ts`), including `noSongs`/`noResults` keys
  - DB tables: `party_rooms`, `party_queue`, `party_members`, `party_scores`
  - API routes: `api-server/src/routes/party.ts`
  - Frontend hooks: `use-party.ts`, `use-party-translations.ts`
- **Gamification System**: XP-based progression with levels, badges, and achievements:
  - **XP & Levels**: 30 level tiers with named titles, XP awarded for key actions (karaoke creation, battles, parties, sharing, daily login)
  - **Badges**: 22 badges across 5 tiers (bronze/silver/gold/platinum/diamond) auto-awarded on milestones
  - **Achievements**: 8 progress-based achievements with XP rewards on completion
  - **Leaderboard**: Global XP leaderboard with all-time/weekly toggle, integrated into existing Leaderboard page as XP tab. Performance leaderboard is opt-in: performances are saved privately by default, users click "שתף בלידרבורד" button to publish. `is_public` column on `performances` table, `POST /api/performances/:id/publish` endpoint. Auth uses `req.user` check (not `req.isAuthenticated()`) for JWT compatibility.
  - **Streak System**: Daily login streaks with badge milestones (3/7/30 days)
  - **Rate Limiting**: Per-action cooldowns prevent XP farming (30s-86400s depending on action)
  - **i18n**: Full translations for all 14 languages (`gamificationTranslations.ts`)
  - DB tables: `user_xp`, `user_badges`, `user_achievements`, `xp_log`
  - API routes: `api-server/src/routes/gamification.ts` (profile, leaderboard, award)
  - Constants: `api-server/src/gamification-constants.ts` (XP_REWARDS, BADGES, ACHIEVEMENTS, LEVEL_TITLES)
  - Frontend: `/xp` page (`GamificationProfile.tsx`), components (`XPProfileCard`, `BadgeGrid`, `AchievementList`)
  - Hooks: `use-gamification.ts`, `use-gamification-translations.ts`
  - **XP Auto-Award**: `useAwardXP` hook calls wired into: `KaraokeSingMode` (karaoke_created + shared_clip), `Party` (party_hosted, party_joined), `SocialClip` (shared_clip), `GamificationProfile` (daily_login on mount)
- **Cloud Recording Save**: Upload mixed karaoke recordings to Replit Object Storage (GCS):
  - Object Storage: provisioned via `setupObjectStorage()`, bucket ID in `DEFAULT_OBJECT_STORAGE_BUCKET_ID`
  - Server: `api-server/src/lib/objectStorage.ts` + `objectAcl.ts`, routes at `api-server/src/routes/storage.ts`
  - Endpoints: `POST /api/storage/uploads/request-url` (presigned URL), `GET /api/storage/objects/*` (serve objects)
  - Client: `use-cloud-recording.ts` hook — XHR upload with progress, state machine (idle/uploading/done/error)
  - UI: "שמור בענן ☁️" (Save to Cloud) button in `KaraokeSingMode` results screen, next to download button; shows specific error messages on failure
  - Recording metadata saved to `recordings` DB table (user_id, song_name, job_id, object_path, etc.)
  - **My Recordings page** (`/recordings`): Two-tab gallery — "הקלטות בענן" (cloud recordings with play/download/delete) and "הביצועים שלי" (performances with scores)
  - Access control: `/api/storage/objects/*` requires auth + ownership check via `recordings` table
  - Nav: "ההקלטות שלי" link in both mobile menu and desktop user dropdown
- **Gallery Upload in Party**: Upload audio/video files directly from phone gallery inside party rooms:
  - File input in PartyRoom's "Add Song" panel with `accept="audio/*,video/*,..."`
  - Uses existing `useCreateJob` to process uploaded file, then auto-adds to party queue
  - Status feedback: uploading → processing → done/error

### System Design Choices
- **Processing Pipeline**: A serial Demucs→Whisper pipeline is used to prevent OOM errors, with pre-rendering starting in parallel to Whisper to reduce overall wait time. Pre-render completion is tracked via `asyncio.Event` to prevent race conditions where `render_job` reads an incomplete `bg_prerender.mp4`. If the fast render path fails (e.g., corrupt pre-render), it automatically falls back to the full render path instead of erroring out. MP4 validation checks both video+audio streams and attempts to decode a frame.
- **GPU-accelerated encoding**: Auto-detects NVENC on CUDA servers (H100/A100) and uses `h264_nvenc` for video encoding instead of CPU `libx264`. Falls back to `libx264 -preset ultrafast` when no GPU is available. NVENC presets: `p4` for final render, `p1` for prerender. Full render uses 20fps (vs prerender 25fps) and `gblur=sigma=4` (reduced from 8) to minimize CPU filter overhead.
- **Job Management**: Job state is managed in-memory within the Python service, with files stored temporarily.
- **Subtitle Format**: FFmpeg utilizes ASS (Advanced SubStation Alpha) for subtitle rendering, allowing for complex styling and animation of lyrics.
- **Language Support**: Comprehensive support for RTL (Hebrew, Arabic) and LTR languages in both UI and video subtitles.

## International Growth Roadmap
The following features are planned to make MYOUKEE a global karaoke platform:
1. **Gamification** (XP, levels, badges, achievements) — COMPLETE
2. **Weekly Challenges** — global "Song of the Week" with leaderboard
3. **Public Feed** — gallery of best performances with likes/comments
4. **Pitch/Key Change** — adjust song key to match singer's voice
5. **Auto-Tune** — real-time pitch correction
6. **Song Library Integration** — connect to music catalogs for one-click karaoke
7. **Remote Live Karaoke** — sing together in real-time over the internet
8. **Leagues & Competitions** — team/country-based tournaments
9. **Virtual Currency & Marketplace** — unlock effects, premium themes
10. **Subscription Model** — unlimited songs, advanced effects, no watermark
11. **Paid Events** — businesses host karaoke nights through the platform

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