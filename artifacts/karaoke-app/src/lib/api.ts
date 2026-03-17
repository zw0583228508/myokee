const API_BASE = import.meta.env.VITE_API_URL ?? "";

export const AUTH_TOKEN_KEY = "myoukee_auth_token";

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
