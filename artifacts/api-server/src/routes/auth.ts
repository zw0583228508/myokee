import { Router } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { signToken } from "../jwt";

const router = Router();

// ---------------------------------------------------------------------------
// Passport serialization — store only the user ID in session
// ---------------------------------------------------------------------------
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user ?? null);
  } catch (err) {
    console.error("[auth] deserializeUser error:", err);
    done(err, null);
  }
});

// ---------------------------------------------------------------------------
// Google OAuth Strategy
// ---------------------------------------------------------------------------
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL ?? "https://myoukee.com";

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL ?? "/api/auth/google/callback",
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        console.log("[auth] Google profile received for:", profile.emails?.[0]?.value);
        const user = await storage.upsertUser({
          id: `google:${profile.id}`,
          email: profile.emails?.[0]?.value ?? null,
          display_name: profile.displayName,
          picture: profile.photos?.[0]?.value ?? null,
        });
        console.log("[auth] User upserted:", user.id);
        done(null, user);
      } catch (err) {
        console.error("[auth] upsertUser error:", err);
        done(err as Error);
      }
    }
  ));
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// GET /api/auth/me — return current user info + credits (or null)
// Works with BOTH session cookie (same-origin) AND Bearer JWT token (cross-origin)
router.get("/auth/me", async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user) {
    const fresh = await storage.getUser(user.id).catch(() => null);
    const u = fresh ?? user;
    res.json({
      user: {
        id: u.id,
        provider: "google",
        displayName: u.display_name,
        email: u.email,
        picture: u.picture,
        credits: u.credits ?? 0,
      }
    });
  } else {
    res.json({ user: null });
  }
});

// Google OAuth
router.get("/auth/google", (req: Request, res: Response, next: NextFunction) => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({
      error: "Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
    });
  }
  return passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});

// Google OAuth callback — use a custom callback so errors redirect instead of 500
// After success: generate a JWT and pass it to the opener window via postMessage
// This avoids third-party cookie issues (Netlify frontend ↔ Render API).
router.get(
  "/auth/google/callback",
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "google",
      (err: any, user: any, _info: any) => {
        if (err) {
          console.error("[auth] Google callback error:", err);
          return res.redirect(`${FRONTEND_URL}/?auth=error&reason=${encodeURIComponent(err.message ?? "unknown")}`);
        }
        if (!user) {
          console.error("[auth] Google callback: no user");
          return res.redirect(`${FRONTEND_URL}/?auth=error&reason=no_user`);
        }
        // Issue JWT regardless of session save result — JWT is the primary
        // auth mechanism for cross-origin (Netlify ↔ Render) requests.
        const token = signToken(user.id);
        console.log("[auth] Issued JWT for:", user.id);
        const html = `<!DOCTYPE html><html><head><title>Login successful</title></head><body>
<script>
  var token = ${JSON.stringify(token)};
  var frontendUrl = ${JSON.stringify(FRONTEND_URL)};
  if (window.opener) {
    window.opener.postMessage({ type: "AUTH_SUCCESS", token: token }, "*");
    window.close();
  } else {
    window.location.href = frontendUrl + "?auth_token=" + encodeURIComponent(token);
  }
</script>
<p>Login successful. You may close this window.</p>
</body></html>`;
        // Send HTML immediately — don't wait for session (session is optional).
        res.send(html);
        // Fire-and-forget session save — errors logged but never thrown.
        req.login(user, (loginErr) => {
          if (loginErr) {
            console.warn("[auth] Session save failed (non-fatal, JWT issued):", loginErr.message);
          }
        });
      }
    )(req, res, next);
  }
);

// Logout
router.post("/auth/logout", (req: Request, res: Response) => {
  req.logout?.(() => {
    res.json({ ok: true });
  });
});

export default router;
export { passport };
