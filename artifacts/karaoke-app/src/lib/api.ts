const API_BASE = import.meta.env.VITE_API_URL ?? "";

export const AUTH_TOKEN_KEY = "myoukee_auth_token";
export const REFRESH_TOKEN_KEY = "myoukee_refresh_token";

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

/** Store whichever tokens an auth response contains. */
export function storeTokens(data: { token?: string; refreshToken?: string }): void {
  if (data?.token) setAuthToken(data.token);
  if (data?.refreshToken) setRefreshToken(data.refreshToken);
}

/** Returns fetch options that include Authorization header + credentials */
export function authFetchOptions(extra: RequestInit = {}): RequestInit {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(extra.headers as Record<string, string> ?? {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return {
    ...extra,
    credentials: "include",
    headers,
  };
}

// ── Access-token refresh (single-flight) ────────────────────────────────────
let refreshPromise: Promise<boolean> | null = null;

/** Exchange the stored refresh token for a new access token. Returns success. */
export function tryRefreshToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  const refreshToken = getRefreshToken();
  if (!refreshToken) return Promise.resolve(false);

  refreshPromise = (async () => {
    try {
      const res = await fetch(apiUrl("/api/auth/refresh"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) {
        if (res.status === 401) clearAuthToken();
        return false;
      }
      storeTokens(await res.json());
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

/**
 * fetch with Authorization header that transparently retries ONCE after
 * refreshing an expired access token.
 */
export async function authFetch(input: string, extra: RequestInit = {}): Promise<Response> {
  const res = await fetch(input, authFetchOptions(extra));
  if (res.status === 401 && getRefreshToken()) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      return fetch(input, authFetchOptions(extra));
    }
  }
  return res;
}
