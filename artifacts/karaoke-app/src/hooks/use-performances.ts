import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiUrl, authFetchOptions } from "@/lib/api";

export interface Performance {
  id: number;
  score: number;
  timing_score: number;
  pitch_score: number;
  words_covered: number;
  total_words: number;
  song_name: string;
  job_id: string;
  created_at: string;
  display_name: string;
  picture?: string;
  is_public?: boolean;
}

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(apiUrl(path), authFetchOptions(options));
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function useLeaderboard() {
  return useQuery<Performance[]>({
    queryKey: ["leaderboard"],
    queryFn: () => apiFetch("/api/performances/leaderboard"),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useMyPerformances() {
  return useQuery<Performance[]>({
    queryKey: ["my-performances"],
    queryFn: () => apiFetch("/api/performances/me"),
    staleTime: 10_000,
  });
}

export function useSongLeaderboard(jobId: string) {
  return useQuery<Performance[]>({
    queryKey: ["song-leaderboard", jobId],
    queryFn: () => apiFetch(`/api/performances/song/${jobId}`),
    enabled: !!jobId,
    staleTime: 30_000,
  });
}

export function useSavePerformance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      jobId: string;
      songName: string;
      score: number;
      timingScore: number;
      pitchScore: number;
      wordsCovered: number;
      totalWords: number;
    }) =>
      apiFetch("/api/performances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leaderboard"] });
      qc.invalidateQueries({ queryKey: ["my-performances"] });
    },
  });
}

export function usePublishPerformance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (perfId: number) =>
      apiFetch(`/api/performances/${perfId}/publish`, {
        method: "POST",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leaderboard"] });
      qc.invalidateQueries({ queryKey: ["my-performances"] });
    },
  });
}
