import jwt from "jsonwebtoken";
import { requireSecret } from "./env";

const JWT_SECRET = requireSecret("JWT_SECRET");

const ACCESS_TOKEN_EXPIRES_IN = "1h";
const REFRESH_TOKEN_EXPIRES_IN = "30d";

export interface TokenPayload {
  sub: string;
  /** token_version at signing time — bumping the DB value invalidates old tokens */
  ver?: number;
  /** "access" | "refresh" — legacy tokens (pre-rotation) have no type */
  type?: "access" | "refresh";
}

export function signAccessToken(userId: string, tokenVersion: number): string {
  return jwt.sign(
    { sub: userId, ver: tokenVersion, type: "access" },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN, issuer: "myoukee", audience: "myoukee-app" }
  );
}

export function signRefreshToken(userId: string, tokenVersion: number): string {
  return jwt.sign(
    { sub: userId, ver: tokenVersion, type: "refresh" },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN, issuer: "myoukee", audience: "myoukee-app" }
  );
}

/**
 * Verify any token signed with JWT_SECRET.
 * NOTE: issuer/audience are NOT enforced here so legacy 30-day tokens
 * (issued before the access/refresh split) keep working until they expire.
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}
