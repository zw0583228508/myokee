import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AUTH_TOKEN_KEY, authFetchOptions, clearAuthToken, setAuthToken } from "@/lib/api";

export interface AuthUser {
  id: string;
  provider: "google" | "email";
  displayName: string;
  email: string | null;
  picture: string | null;
  credits: number;
}

const API_BASE = import.meta.env.VITE_API_URL ?? "";

export function useAuth() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async (): Promise<{ user: AuthUser | null }> => {
      const res = await fetch(`${API_BASE}/api/auth/me`, authFetchOptions());
      if (!res.ok) return { user: null };
      return res.json();
    },
    staleTime: 60 * 1000,
    retry: false,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE}/api/auth/logout`, authFetchOptions({ method: "POST" }));
      if (!res.ok) throw new Error("Logout failed");
      return res.json();
    },
    onSuccess: () => {
      clearAuthToken();
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

export function useLoginWithGoogle() {
  return () => {
    const width = 500;
    const height = 650;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    window.open(
      `${API_BASE}/api/auth/google`,
      "google-auth",
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );
  };
}

export function useEmailLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Login failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      if (data.token) {
        setAuthToken(data.token);
      }
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

export function useEmailRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, password, displayName }: { email: string; password: string; displayName?: string }) => {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, displayName }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Registration failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      if (data.token) {
        setAuthToken(data.token);
      }
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

/** Call this on app init to pick up auth_token from URL (redirect fallback) */
export function consumeAuthTokenFromUrl(): void {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("auth_token");
  if (token) {
    setAuthToken(token);
    params.delete("auth_token");
    const newUrl = window.location.pathname + (params.toString() ? `?${params}` : "");
    window.history.replaceState({}, "", newUrl);
  }
}

/** Check for auth error in URL (from failed Google OAuth redirect) */
export function consumeAuthErrorFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  const authStatus = params.get("auth");
  const reason = params.get("reason");
  if (authStatus === "error") {
    params.delete("auth");
    params.delete("reason");
    const newUrl = window.location.pathname + (params.toString() ? `?${params}` : "");
    window.history.replaceState({}, "", newUrl);
    return reason || "unknown";
  }
  return null;
}
