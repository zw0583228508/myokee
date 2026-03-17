# MYOUKEE — AI Karaoke Generator

## Overview

Full-stack AI karaoke generator. Upload any audio or video file → AI separates vocals (Demucs htdemucs_ft) → Whisper auto-detects language & transcribes lyrics with word-level timestamps → user reviews/edits transcript → generates a karaoke MP4 video with synchronized lyrics + optional animated user avatar. Supports all languages with automatic RTL/LTR layout.

## Key Features (Latest)
- **PWA**: Full Progressive Web App support with `site.webmanifest` (shortcuts, maskable icons) and `sw.js` service worker (asset caching for offline). Service worker registered in `main.tsx`.
- **Share buttons**: `ShareButtons.tsx` component on karaoke results page — WhatsApp, Twitter/X, Facebook, Copy Link, Web Share API fallback. Integrated in `JobDetails.tsx` below download buttons.
- **Referral program**: Users get unique referral codes, share invite links (`?ref=CODE`), both referrer and new user earn 2 credits. Backend uses DB transactions for atomicity. Routes: `GET /api/referral/stats`, `POST /api/referral/apply`. Frontend: `ReferralPanel.tsx`, `/referral` page, auto-apply on login via `useAutoApplyReferral` hook.
- **Full i18n**: 14 languages (he/en/ar/ru/es/fr/de + ja/zh/ko/th/vi/tl/id) with auto-detect. All Home.tsx content, tabs, CTAs, feature cards, and support footer use LanguageContext translations. Asian languages added for the biggest global karaoke markets. Nav includes `leaderboard` and `history` keys in all languages.
- **Avatar animation**: Upload profile photo → rembg removes background → neon glow added → you appear in the karaoke video while singing.
- **Sticky tabs**: Fixed via `[overflow-x:clip]` on root container (avoids BFC from `overflow-x:hidden` which breaks sticky).
- **Whisper W-filter**: `_clean_word()` now drops single-character ASCII alpha words (hallucination artifacts like "W").
- **Background images**: Opacity increased to 40–50% across all sections for a richer premium feel.
- **Support email**: windot100@gmail.com — in footer and all language translations.
- **Upload section removed from home**: `/upload` route is a separate page; all CTAs use `<Link href="/upload">`.
- **Multilingual legal pages**: Terms (`/terms`), Privacy (`/privacy`), Copyright/DMCA (`/copyright`) — rendered in the user's selected language with English fallback for untranslated languages. Content stored as per-language section arrays in each page component using `Partial<Record<SupportedLang, Section[]>>`.
- **Consent modal**: Shows 3 links — Privacy Policy | Terms of Service | Copyright & DMCA.
- **Copyright checkbox**: Upload page requires user to check "I confirm I have the legal right to use this audio" before the submit button is enabled. Checkbox text is translated in all 7 languages via `upload.copyrightConfirm`.
- **Vocal sync architecture**: Mic + all worklets (RNNoise, recorder) are set up BEFORE the instrumental is scheduled, ensuring the recorder is always capturing when the song starts. The trim/pad logic correctly handles both early and late recorder starts using `alignSec = (firstCtxTime - songCtxTime) - systemLatency`. If recorder started early (alignSec < 0), trims excess; if late (alignSec > 0), pads silence. Default sync offset: +340ms (hardcoded). Auto-alignment disabled — cross-correlation was unreliable. Stored in localStorage `karaoke-sync-offset`.
- **Vocal FX defaults**: Reverb wet=45%, decay=55%, delay time=28ms, feedback=35%, delay wet=25%. All FX are baked into the recorded PCM chunks (recorder taps post-limiter). The offline `renderMix` simply mixes pre-processed vocal + instrumental.
- **Singing mode background**: Video brightness=0.38 saturation=0.85, fallback image brightness=0.30 blur=8px. Overlays reduced for more visible background during singing.
- **MYOUKEE watermark**: 48×48 semi-transparent (55% opacity) logo in top-right corner of all generated karaoke videos. Added to both `_render_video_fast` and `_render_video` FFmpeg pipelines. Watermark file: `artifacts/karaoke-processor/watermark.png` (copied from favicon-192.png).
- **Full mobile responsiveness**: All pages optimized for smartphones (390×844+). Navbar has hamburger menu on mobile (`md:hidden`). Hero, sections, bento grid, feature cards, upload dropzone, JobDetails buttons, KaraokeSingMode overlay, modals, and Leaderboard all use `sm:` breakpoint scaling for padding, font sizes, grid columns, and spacing. Pattern: reduce padding `p-8→p-4 sm:p-8`, reduce headings `text-4xl→text-3xl sm:text-4xl`, lyrics sidebar `h-[350px] lg:h-[600px]`.
- **Favicon**: PNG fallbacks (32, 180, 192, 512) + SVG. Web app manifest at `/site.webmanifest`. Purple-blue gradient with white mic icon.
- **OG / Social sharing**: Absolute URLs pointing to `https://myoukee.com/`. OG image `opengraph.jpg` (1200×630). Includes `og:url`, `og:image:type`, Twitter card tags. Production domain: `myoukee.com`.

## Deployment Architecture

- **Frontend (karaoke-app)**: Deployed to Render (static build)
- **API Server**: Deployed to Render (Node.js)
- **Karaoke Processor**: Deployed to **Modal Labs** (H100 GPU)
  - URL: `https://windot100--karaoke-processor-fastapi-app.modal.run`
  - Deploy: `modal deploy artifacts/karaoke-processor/modal_app.py`
  - `PROCESSOR_URL` env var on Render API server points to this Modal URL
- **Direct uploads**: In production, browser uploads directly to Modal (bypasses API server proxy)

### Package Version Compatibility (Modal)
- torch==2.3.0 requires numpy<2.0 (use numpy==1.26.4)
- scipy==1.13.1 is compatible with numpy 1.26.4
- soundfile must be explicitly listed

## Architecture

```text
workspace/
├── artifacts/
│   ├── karaoke-app/       # React + Vite frontend (port 19131, preview at /)
│   ├── karaoke-mobile/    # Expo React Native mobile app (port 22425, preview at /mobile/)
│   ├── api-server/        # Node.js Express API (port 8080, at /api)
│   │                        Also proxies /api/processor → Python service
│   │                        Handles Google/Facebook OAuth (passport.js)
│   └── karaoke-processor/ # Python FastAPI processing service (port 8000)
├── lib/
│   ├── api-spec/          # OpenAPI spec + Orval codegen
│   ├── api-client-react/  # Generated React Query hooks
│   ├── api-zod/           # Generated Zod schemas
│   └── db/                # Drizzle ORM (PostgreSQL)
```

## Stack

- **Monorepo**: pnpm workspaces
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui + Framer Motion + React Dropzone
- **API Server**: Express 5 + passport.js + express-session (Google & Facebook OAuth)
- **Processing Service**: FastAPI + Uvicorn (Python 3.11)
- **AI - Vocal Separation**: Demucs v4 `htdemucs` model (hybrid transformer, fast, high quality)
- **AI - Transcription**: faster-whisper `large-v3` (best accuracy, beam_size=10, VAD filter, hallucination_silence_threshold, condition_on_previous_text, full temperature fallback, initial_prompt="Song lyrics:", word timestamps, 99 languages)
- **Pipeline**: Serial Demucs→Whisper (prevents OOM). Pre-render starts AFTER Demucs, runs parallel to Whisper → saves 3-5 min total wait time
- **Video Generation**: FFmpeg with ASS subtitle format (karaoke word highlighting), optional animated avatar
- **Database**: PostgreSQL + Drizzle ORM
- **API Codegen**: Orval (from OpenAPI spec)

## Services

| Service | Port | Path | Command |
|---------|------|------|---------|
| React Frontend | 19131 | `/` | `pnpm --filter @workspace/karaoke-app run dev` |
| Node.js API | 8080 | `/api` | `pnpm --filter @workspace/api-server run dev` |
| Python Processor | 8000 | proxied at `/api/processor` | `PORT=8000 python3 artifacts/karaoke-processor/main.py` |

## Auth Endpoints (Node.js API)

- `GET /api/auth/me` — Get current logged-in user (null if not logged in)
- `GET /api/auth/google` — Start Google OAuth flow
- `GET /api/auth/google/callback` — Google OAuth callback
- `POST /api/auth/logout` — Logout current user

### Required Environment Variables for OAuth
- `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` — Google OAuth app credentials
- `SESSION_SECRET` — Secret for express-session cookie signing

## Credits & Payments

Credit-based payment system with dual payment providers (Stripe + PayPal):
- **1 credit = 1 minute** of song processing
- **First 40 seconds FREE** per song
- **Packages**: Starter (10cr/$5), Popular (40cr/$16, ⭐ Most Popular), Pro (120cr/$36), Creator (500cr/$120)
- One-time payments (no subscription)
- PricingModal lets user choose between credit card (Stripe) and PayPal

### Stripe Payment Flow
1. User clicks "קנה עכשיו" in PricingModal with credit card selected
2. Backend creates Stripe Checkout Session with `price_data` + `metadata: {userId, credits}`
3. Stripe redirects to `/?payment=success&session_id={cs_xxx}` after payment
4. Frontend calls `POST /api/credits/fulfill` with `session_id`
5. Backend verifies session with Stripe → adds credits → marks `fulfilled_sessions` table

### PayPal Payment Flow
1. User clicks "קנה עכשיו" in PricingModal with PayPal selected
2. Backend creates PayPal order + saves to `pending_paypal_orders` table
3. User is redirected (same window) to PayPal for approval
4. PayPal redirects to `/?payment=paypal_success&token={order_id}` after payment
5. Frontend calls `POST /api/paypal/capture` with `orderId`
6. Backend captures payment (atomic transaction) → adds credits → marks `fulfilled_sessions`
- **Auto-recovery**: On every page load, `GET /api/paypal/recover` checks for uncaptured pending orders (last 7 days) and auto-captures them. This handles cases where the redirect back from PayPal fails (network issue, browser closed, etc.)

### Payment Endpoints
- `GET /api/packages` — List credit packages (hardcoded, no Stripe product sync)
- `POST /api/checkout` — Create Stripe Checkout Session (body: `{packageId}`)
- `POST /api/credits/fulfill` — Verify Stripe payment + add credits (body: `{sessionId}`)
- `POST /api/paypal/checkout` — Create PayPal order (body: `{packageId}`)
- `POST /api/paypal/capture` — Capture PayPal payment + add credits (body: `{orderId}`)
- `GET /api/paypal/recover` — Auto-recover uncaptured PayPal payments for logged-in user
- `GET /api/paypal/health` — Check PayPal API connectivity

### Stripe Integration
- Uses Replit Stripe connector via `@replit/connectors-sdk` (proxy-based, no raw API key)
- `stripeClient.ts` wraps `ReplitConnectors.proxy("stripe", path, options)` for all Stripe API calls

### PayPal Integration
- Direct PayPal REST API v2 via `paypalClient.ts` (client credentials auth)
- Env vars: `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_MODE` (live/sandbox)
- Fulfillment is atomic (DB transaction) and idempotent (fulfilled_sessions dedup)
- Ownership validation: PayPal custom_id contains userId, verified before crediting

### Database Tables
- `users` — id, email, display_name, picture, stripe_customer_id, credits, referral_code (UNIQUE), referred_by, created_at
- `fulfilled_sessions` — session_id (PK), user_id, credits_added, fulfilled_at
- `pending_paypal_orders` — order_id (PK), user_id, credits, package_id, status, created_at
- `referrals` — id, referrer_id, referred_id (UNIQUE), credits_awarded, created_at

## API Endpoints

All karaoke processing endpoints are at `/api/processor/*` (Node.js proxies to Python):

- `POST /api/processor/jobs` — Upload file (multipart/form-data), starts processing
- `GET /api/processor/jobs` — List all jobs
- `GET /api/processor/jobs/{id}` — Get job status (poll every 2s while processing)
- `DELETE /api/processor/jobs/{id}` — Delete job and files
- `PUT /api/processor/jobs/{id}/lyrics` — Update words + trigger video render (from awaiting_review status)
- `POST /api/processor/jobs/{id}/avatar` — Upload profile photo for animated overlay in video
- `GET /api/processor/jobs/{id}/video` — Download karaoke MP4
- `GET /api/processor/jobs/{id}/instrumental` — Download instrumental WAV
- `GET /api/processor/jobs/{id}/vocals` — Download reference vocal WAV (for auto-alignment)
- `GET /api/processor/jobs/{id}/lyrics` — Get word timestamps JSON

## Processing Pipeline (per job)

1. **Separating** (0→40%): Demucs `htdemucs_ft` separates `vocals.wav` and `no_vocals.wav`
2. **Transcribing** (44→68%): faster-whisper transcribes `vocals.wav` with word timestamps
3. **Awaiting Review** (70%): Pipeline STOPS — user reviews and edits transcript in UI
4. **Rendering** (72→100%): FFmpeg renders `karaoke.mp4` with ASS subtitle overlay (+ animated avatar if uploaded)

## Job Data Model

```typescript
{
  id: string,
  status: "pending" | "queued" | "separating" | "transcribing" | "awaiting_review" | "rendering" | "done" | "error",
  progress: number (0-100),
  filename: string,
  error: string | null,
  words: [{ word, start, end, probability }] | null,
  created_at: string,  // ISO UTC
  updated_at: string,
}
```

## Video Rendering — Cinematic Karaoke Style (v4)

Matches professional karaoke bar aesthetic (see reference examples in `attached_assets/`):

### Background
- Animated **aurora/plasma gradient** generated via FFmpeg `geq` filter on a 128×72 source upscaled to 1280×720 + gblur sigma=8
- Colour palette: deep indigo (#06061A) + drifting purple/pink/teal waves
- FFmpeg variable: `T` (uppercase, time in seconds)
- ~100× faster than full-resolution geq
- Waveform visualizer (80px, purple→blue) at y=640

### Lyrics Layout (1280×720)
5 lines visible simultaneously — centred at y≈305:

| Offset | Y pos | Style | Size | Effect          |
|--------|-------|-------|------|-----------------|
| -2     | y=115 | Far   | 36px | 31% opaque white |
| -1     | y=210 | Near  | 48px | 55% opaque white |
|  0     | y=305 | Active| 64px | **YELLOW** bold + black outline (6px) + shadow |
| +1     | y=405 | Near  | 48px | 55% opaque white |
| +2     | y=495 | Far   | 36px | 31% opaque white |

- Active line: entire line in bright yellow (`&H0000FFFF&` = ASS BGR for yellow)
- `\kf` karaoke fill: words transition from gray (secondary) → yellow (primary) as song progresses
- Works correctly for RTL (Hebrew/Arabic) and LTR text
- Lines grouped: max 5 words per line, split on pause > 0.45s OR word count limit

## RTL / Hebrew Support

- HTML `lang="he"` + Noto Sans Hebrew loaded via Google Fonts
- `dir="auto"` on all text content elements for automatic bidirectional text
- Body and fonts configured for Hebrew-first rendering
- ASS subtitles: Noto Sans Hebrew font via `fontsdir=` parameter

## Important Notes

- Job state is stored **in-memory** in the Python service (resets on restart)
- Job files stored in `/tmp/karaoke_jobs/{job_id}/`
- `htdemucs_ft` overlap=0.25 (default) used to reduce boundary artifacts
- `awaiting_review` status: polling stops, user edits transcript, PUT lyrics triggers Phase 2
- Avatar: after job creation, frontend POSTs avatar image; if user is OAuth-logged-in, profile picture is fetched from provider
- The proxy middleware MUST be placed BEFORE `express.json()` in app.ts for multipart upload forwarding

## Development

```bash
# Run all services
pnpm --filter @workspace/karaoke-app run dev    # Frontend
pnpm --filter @workspace/api-server run dev     # API server
PORT=8000 python3 artifacts/karaoke-processor/main.py  # Python processor

# Codegen
pnpm --filter @workspace/api-spec run codegen

# DB push (dev)
pnpm --filter @workspace/db run push
```
