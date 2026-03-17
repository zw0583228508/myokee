import { Linking, Platform } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const API_BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`
  : Platform.OS === "web"
    ? "/api"
    : "http://localhost:8080/api";

export interface User {
  id: string;
  email: string | null;
  displayName: string;
  picture: string | null;
  credits: number;
}

export function useAuth() {
  return useQuery<{ user: User | null }>({
    queryKey: ["auth"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
      if (!res.ok) return { user: null };
      return res.json();
    },
    staleTime: 30_000,
    retry: false,
  });
}

export function useLogin() {
  const loginUrl = process.env.EXPO_PUBLIC_DOMAIN
    ? `https://${process.env.EXPO_PUBLIC_DOMAIN}/api/auth/google`
    : "http://localhost:8080/api/auth/google";
  return () => Linking.openURL(loginUrl);
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" });
    },
    onSuccess: () => {
      qc.setQueryData(["auth"], { user: null });
      qc.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}
