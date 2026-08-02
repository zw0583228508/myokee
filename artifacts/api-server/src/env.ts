/**
 * Environment helpers — fail fast on missing/weak secrets instead of
 * silently falling back to insecure development defaults.
 */
export function requireSecret(name: string): string {
  const value = process.env[name];
  if (!value || value.length < 32) {
    throw new Error(`${name} must be set to a value of at least 32 characters`);
  }
  return value;
}

/** Feature flag helper — server-side features are OFF unless explicitly enabled. */
export function featureEnabled(name: string): boolean {
  return process.env[name] === "true";
}
