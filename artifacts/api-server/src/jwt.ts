import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? process.env.SESSION_SECRET ?? "karaoke-jwt-dev-secret";
const JWT_EXPIRES_IN = "30d";

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): { sub: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { sub: string };
  } catch {
    return null;
  }
}
