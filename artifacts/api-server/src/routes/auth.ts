import { Router } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { storage } from "../storage";
import { signToken } from "../jwt";
import { sendPasswordResetEmail } from "../emailService";

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
    const provider = u.id?.startsWith("email:") ? "email" : "google";
    res.json({
      user: {
        id: u.id,
        provider,
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
  console.log("[auth] Google OAuth initiation — host:", req.get("host"), "protocol:", req.protocol);
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
      (err: any, user: any, info: any) => {
        const errorRedirectBase = FRONTEND_URL || `${req.protocol}://${req.get("host")}`;
        if (err) {
          console.error("[auth] Google callback error:", err.message, err.stack);
          return res.redirect(`${errorRedirectBase}/?auth=error&reason=${encodeURIComponent(err.message ?? "unknown")}`);
        }
        if (!user) {
          console.error("[auth] Google callback: no user. Info:", JSON.stringify(info));
          return res.redirect(`${errorRedirectBase}/?auth=error&reason=no_user`);
        }
        // Issue JWT regardless of session save result — JWT is the primary
        // auth mechanism for cross-origin (Netlify ↔ Render) requests.
        const token = signToken(user.id);
        console.log("[auth] Issued JWT for:", user.id);
        // Redirect URL: prefer FRONTEND_URL, fallback to request origin (same-origin prod)
        const redirectUrl = FRONTEND_URL || `${req.protocol}://${req.get("host")}`;
        console.log("[auth] Redirect URL:", redirectUrl);
        const html = `<!DOCTYPE html><html><head><title>Login successful</title></head><body>
<script>
  var token = ${JSON.stringify(token)};
  var redirectUrl = ${JSON.stringify(redirectUrl)};
  // Always persist token to localStorage — works for same-origin popup flows
  // even when window.opener is nullified by cross-origin navigation through Google.
  try { localStorage.setItem("myoukee_auth_token", token); } catch(e) {}
  if (window.opener) {
    try {
      window.opener.postMessage({ type: "AUTH_SUCCESS", token: token }, "*");
    } catch(e) {}
    window.close();
  } else {
    // No opener — full redirect. Use origin of THIS page (same-origin in prod)
    // or fall back to configured frontend URL.
    var dest = window.location.origin || redirectUrl;
    window.location.href = dest + "/?auth_token=" + encodeURIComponent(token);
  }
</script>
<p>Login successful. Redirecting...</p>
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

// ---------------------------------------------------------------------------
// Email + Password Auth
// ---------------------------------------------------------------------------
router.post("/auth/register", async (req: Request, res: Response) => {
  const { email, password, displayName } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  try {
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: "User with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await storage.createEmailUser({
      email,
      display_name: displayName || email.split("@")[0],
      password_hash: passwordHash,
    });

    const token = signToken(user.id);
    console.log("[auth] Email registration for:", email);

    return res.json({
      token,
      user: {
        id: user.id,
        provider: "email",
        displayName: user.display_name,
        email: user.email,
        picture: null,
        credits: user.credits ?? 0,
      },
    });
  } catch (err: any) {
    console.error("[auth] Register error:", err.message);
    if (err.message?.includes("already exists")) {
      return res.status(409).json({ error: "User with this email already exists" });
    }
    return res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const userId = `email:${email}`;
    const user = await storage.getUser(userId);

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const passwordHash = await storage.getUserPasswordHash(userId);
    if (!passwordHash) {
      return res.status(401).json({ error: "This account uses Google login. Please sign in with Google." });
    }

    const valid = await bcrypt.compare(password, passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken(user.id);
    console.log("[auth] Email login for:", email);

    return res.json({
      token,
      user: {
        id: user.id,
        provider: "email",
        displayName: user.display_name,
        email: user.email,
        picture: user.picture,
        credits: user.credits ?? 0,
      },
    });
  } catch (err: any) {
    console.error("[auth] Login error:", err.message);
    return res.status(500).json({ error: "Login failed" });
  }
});

// Forgot password — send reset email
router.post("/auth/forgot-password", async (req: Request, res: Response) => {
  const { email, lang } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const user = await storage.findUserByEmail(email);
    if (!user) {
      return res.json({ sent: true });
    }

    if (user.id.startsWith("google:")) {
      return res.json({ sent: true });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await storage.createPasswordResetToken(user.id, token, expiresAt);

    const resetUrl = `${FRONTEND_URL}/?reset_token=${token}`;
    await sendPasswordResetEmail(email, resetUrl, lang || "en");

    console.log(`[auth] Password reset email sent to: ${email}`);
    return res.json({ sent: true });
  } catch (err: any) {
    console.error("[auth] Forgot password error:", err.message);
    return res.status(500).json({ error: "Failed to process request" });
  }
});

// Reset password — validate token and update password
router.post("/auth/reset-password", async (req: Request, res: Response) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: "Token and password are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  try {
    const consumed = await storage.consumeResetToken(token);
    if (!consumed) {
      return res.status(400).json({ error: "Invalid or expired reset link" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await storage.updatePasswordHash(consumed.userId, passwordHash);

    const jwtToken = signToken(consumed.userId);
    const user = await storage.getUser(consumed.userId);

    console.log(`[auth] Password reset completed for: ${consumed.userId}`);
    return res.json({
      success: true,
      token: jwtToken,
      user: user ? {
        id: user.id,
        provider: "email",
        displayName: user.display_name,
        email: user.email,
        picture: user.picture,
        credits: user.credits ?? 0,
      } : null,
    });
  } catch (err: any) {
    console.error("[auth] Reset password error:", err.message);
    return res.status(500).json({ error: "Failed to reset password" });
  }
});

// Logout
router.post("/auth/logout", (req: Request, res: Response) => {
  req.logout?.(() => {
    res.json({ ok: true });
  });
});

export default router;
export { passport };
