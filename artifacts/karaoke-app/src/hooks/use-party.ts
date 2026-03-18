import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiUrl, authFetchOptions } from "@/lib/api";

async function partyFetch(path: string, options?: RequestInit) {
  const res = await fetch(apiUrl(`/api${path}`), authFetchOptions(options));
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

export function useMyParties() {
  return useQuery({
    queryKey: ["party", "mine"],
    queryFn: () => partyFetch("/party/rooms/mine"),
    staleTime: 10_000,
  });
}

export function usePartyRoom(roomId: string | null) {
  return useQuery({
    queryKey: ["party", "room", roomId],
    queryFn: () => partyFetch(`/party/rooms/${roomId}`),
    enabled: !!roomId,
    refetchInterval: 3000,
  });
}

export function usePartyQueue(roomId: string | null) {
  return useQuery({
    queryKey: ["party", "queue", roomId],
    queryFn: () => partyFetch(`/party/rooms/${roomId}/queue`),
    enabled: !!roomId,
    refetchInterval: 2000,
  });
}

export function usePartyMembers(roomId: string | null) {
  return useQuery({
    queryKey: ["party", "members", roomId],
    queryFn: () => partyFetch(`/party/rooms/${roomId}/members`),
    enabled: !!roomId,
    refetchInterval: 5000,
  });
}

export function usePartyLeaderboard(roomId: string | null) {
  return useQuery({
    queryKey: ["party", "leaderboard", roomId],
    queryFn: () => partyFetch(`/party/rooms/${roomId}/leaderboard`),
    enabled: !!roomId,
    refetchInterval: 5000,
  });
}

export function useCreateParty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; theme: string; settings?: Record<string, any> }) =>
      partyFetch("/party/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["party", "mine"] }),
  });
}

export function useJoinParty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { code: string; displayName?: string }) =>
      partyFetch("/party/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["party"] }),
  });
}

export function useAddToQueue(roomId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { songName: string; jobId?: string; mode?: string; duetPartner?: string; displayName?: string }) =>
      partyFetch(`/party/rooms/${roomId}/queue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["party", "queue", roomId] });
      qc.invalidateQueries({ queryKey: ["party", "room", roomId] });
    },
  });
}

export function useRemoveFromQueue(roomId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: number) =>
      partyFetch(`/party/rooms/${roomId}/queue/${itemId}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["party", "queue", roomId] });
      qc.invalidateQueries({ queryKey: ["party", "room", roomId] });
    },
  });
}

export function useReorderQueue(roomId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, direction }: { itemId: number; direction: "up" | "down" }) =>
      partyFetch(`/party/rooms/${roomId}/queue/${itemId}/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["party", "queue", roomId] });
      qc.invalidateQueries({ queryKey: ["party", "room", roomId] });
    },
  });
}

export function useAdvanceQueue(roomId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      partyFetch(`/party/rooms/${roomId}/next`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["party", "queue", roomId] });
      qc.invalidateQueries({ queryKey: ["party", "room", roomId] });
    },
  });
}

export function useUpdatePartyRoom(roomId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name?: string; theme?: string; status?: string; settings?: Record<string, any> }) =>
      partyFetch(`/party/rooms/${roomId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["party", "room", roomId] }),
  });
}

export function useEndParty(roomId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      partyFetch(`/party/rooms/${roomId}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["party"] });
    },
  });
}

export function useSavePartyScore(roomId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { queueItemId: number; score: number; timingScore: number; pitchScore: number }) =>
      partyFetch(`/party/rooms/${roomId}/scores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["party", "leaderboard", roomId] }),
  });
}
