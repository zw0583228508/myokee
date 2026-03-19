import path from "path";
import fs from "fs";
import express, { type Express } from "express";
import cors, { type CorsOptions } from "cors";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { createProxyMiddleware } from "http-proxy-middleware";
import router from "./routes";
import { passport } from "./routes/auth";
import { storage } from "./storage";
import { pool } from "./db";
import { verifyToken } from "./jwt";

const isProd = process.env.NODE_ENV === "production";

const app: Express = express();

app.set("trust proxy", 1);

const corsOptions: CorsOptions = {
  origin: true,
  credentials: true,
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "x-language-hint",
    "x-max-duration",
  ],
};

// ── Handle OPTIONS preflight HERE — must come before the proxy so the proxy
// never intercepts preflight requests and swallows the CORS headers.
// Express 5 requires a regex or explicit pattern instead of bare "*".
app.options(/(.*)/, cors(corsOptions));

// Apply CORS headers to every other request too.
app.use(cors(corsOptions));

// ── Persistent session store (Neon PostgreSQL) ─────────────────────────────
// MemoryStore is wiped on every Render deploy; connect-pg-simple survives.
const PgSession = connectPgSimple(session);

const sessionStore = process.env.DATABASE_URL
  ? new PgSession({
      pool,
      tableName: "session",
      // createTableIfMissing removed — reads table.sql which is absent from
      // the production bundle. The session table is created by runMigrations().
    })
  : undefined;

app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || "karaoke-fallback-dev-secret-do-not-use-in-prod",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    sameSite: "none",
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));

app.use(passport.initialize());
app.use(passport.session());

// ── JWT Bearer token middleware ─────────────────────────────────────────────
// If a valid Bearer token is present, set req.user from it.
// This lets cross-origin frontends (Netlify) authenticate without third-party cookies.
app.use(async (req: any, _res, next) => {
  if (!req.user) {
    const auth = req.headers["authorization"];
    if (auth?.startsWith("Bearer ")) {
      const token = auth.slice(7);
      const payload = verifyToken(token);
      if (payload?.sub) {
        try {
          req.user = await storage.getUser(payload.sub);
        } catch {
          // ignore — unauthenticated
        }
      }
    }
  }
  next();
});

// ── Auth + free-mode guard for job creation ────────────────────────────────
app.use("/api/processor/jobs", async (req, res, next) => {
  if (req.method !== "POST") return next();
  if (!(req as any).user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  try {
    const user = (req as any).user;
    const credits = await storage.getCredits(user.id);
    if (credits <= 0) {
      (req as any)._maxDurationSecs = 40;
    }
  } catch (_) {
    // Non-fatal — proceed without limit flag
  }
  next();
});

// ── Proxy: /api/processor/* → Karaoke Processor ───────────────────────────
// Must be BEFORE body parsers — multipart uploads need the raw stream.
// IMPORTANT: use a function filter (not a string) so that /api/processor-config
// (which starts with /api/processor but is an Express route, not a proxy target)
// is NOT captured by the proxy.
const PROCESSOR_URL = process.env.PROCESSOR_URL ?? "http://localhost:8000";
app.use(
  createProxyMiddleware({
    pathFilter: (path) => path.startsWith("/api/processor/"),
    target: PROCESSOR_URL,
    changeOrigin: true,
    pathRewrite: { "^/api/processor": "/processor" },
    // 150-second timeout — Modal cold-start can take up to 120s on first run.
    // The frontend also has its own 150-second AbortController timeout.
    proxyTimeout: 150_000,
    timeout: 150_000,
    on: {
      proxyReq: (proxyReq, req) => {
        const maxDur = (req as any)._maxDurationSecs;
        if (maxDur) {
          proxyReq.setHeader("X-Max-Duration", String(maxDur));
        }
      },
      proxyRes: (proxyRes, req, res) => {
        // Ensure CORS headers survive the proxy — overwrite what Modal sends.
        const origin = (req as any).headers?.origin;
        if (origin) {
          proxyRes.headers["access-control-allow-origin"] = origin;
          proxyRes.headers["access-control-allow-credentials"] = "true";
        }
      },
      error: (err, req, res) => {
        console.error("Proxy error:", err.message);
        if (res && typeof (res as any).status === "function") {
          const origin = (req as any).headers?.origin;
          if (origin) {
            (res as any).setHeader("Access-Control-Allow-Origin", origin);
            (res as any).setHeader("Access-Control-Allow-Credentials", "true");
          }
          (res as any).status(502).json({ error: "Karaoke processor unavailable" });
        }
      },
    },
  }),
);

// ── Production: proxy /mobile/ → Expo web server (port 3001) ──────────────
if (isProd) {
  app.use(
    createProxyMiddleware({
      pathFilter: "/mobile",
      target: "http://localhost:3001",
      changeOrigin: true,
      on: {
        error: (err, _req, res) => {
          console.error("Mobile proxy error:", err.message);
          if (res && typeof (res as any).status === "function") {
            (res as any).status(502).json({ error: "Mobile app unavailable" });
          }
        },
      },
    }),
  );
}

app.use("/api/stripe/webhook", express.raw({ type: "application/json" }), (req: any, _res, next) => {
  req.rawBody = req.body;
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// ── Production: serve built React web app from / ───────────────────────────
if (isProd) {
  const webDistDir = path.resolve(process.cwd(), "artifacts/karaoke-app/dist/public");

  if (fs.existsSync(webDistDir)) {
    app.use(express.static(webDistDir));
    app.get(/(.*)/, (req, res) => {
      const ext = path.extname(req.path);
      if (ext && ext !== ".html") {
        return res.status(404).send("Not found");
      }
      res.sendFile(path.join(webDistDir, "index.html"));
    });
    console.log(`[static] Serving web app from ${webDistDir}`);
  } else {
    console.warn(`[static] Web app dist not found at ${webDistDir} — skipping static serve`);
  }
}

// ── Global error handler ────────────────────────────────────────────────────
// Catches any error passed to next(err) and returns JSON instead of the
// default "Internal Server Error" HTML page.
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err.status ?? err.statusCode ?? 500;
  const message = err.message ?? "Internal Server Error";
  console.error(`[error] ${status} — ${message}`, err.stack ?? "");
  res.status(status).json({ error: message });
});

export default app;
