---
name: Auth token model
description: How MYOUKEE JWT auth works after the security hardening (access/refresh split, token_version, feature-gated routers)
---

# Auth token model (api-server + karaoke-app)

- JWTs are split: 1h access token + 30d refresh token, both carry `ver` (token_version) and `type` claims. Legacy pre-split tokens (no type/ver) are still accepted as access tokens with ver=0 until they expire — do not enforce issuer/audience in `verifyToken` or all existing logged-in users get logged out.
- "Logout everywhere" = bump `users.token_version` (POST /api/auth/logout-all); every issued token becomes invalid.
- `/api/auth/me` returns 200 `{user:null}` (never 401) for bad tokens — frontend refresh-on-401 does NOT fire there; `useAuth` explicitly tries the refresh token when it gets `user:null`.
- Frontend must use `authFetch()` from `@/lib/api` for authenticated calls (retries once after refresh), not raw `fetch(url, authFetchOptions())`.
- OAuth popup postMessage uses an explicit target origin and listeners verify `e.origin` against the API origin — never revert to `"*"`.
- `JWT_SECRET` and `SESSION_SECRET` are required (≥32 chars, fail-fast, must be different values). JWT_SECRET is set in Replit dev env; **must also be added in Render** for production or the server won't boot.
- Server-side feature routers (party, gamification, challenges, social, vocalCoach) are OFF unless env `FEATURE_*=true` — mirrors the client flags in `src/config/features.ts`.
- CORS is an explicit allow-list (myoukee.com, www, FRONTEND_URL, dev localhost/replit domain); disallowed origins get 403.
