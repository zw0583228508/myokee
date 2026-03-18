import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiUrl, authFetchOptions } from "@/lib/api";

async function gamFetch(path: string, options?: RequestInit) {
  const res = await fetch(apiUrl(`/api${path}`), authFetchOptions(options));
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

export function useGamificationProfile() {
  return useQuery({
    queryKey: ["gamification", "profile"],
    queryFn: () => gamFetch("/gamification/profile"),
    staleTime: 30_000,
  });
}

export function useXPLeaderboard(mode: "all" | "weekly" = "all") {
  return useQuery({
    queryKey: ["gamification", "leaderboard", mode],
    queryFn: () => gamFetch(`/gamification/leaderboard?mode=${mode}`),
    staleTime: 30_000,
  });
}

export function useAwardXP() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { action: string; metadata?: object }) =>
      gamFetch("/gamification/award", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gamification"] });
    },
  });
}
