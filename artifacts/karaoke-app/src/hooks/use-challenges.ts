import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiUrl, authFetch } from "@/lib/api";

export function useChallenges() {
  return useQuery({
    queryKey: ["challenges"],
    queryFn: async () => {
      const res = await authFetch(apiUrl("/api/challenges"));
      if (!res.ok) return { challenges: [] };
      return res.json();
    },
  });
}

export function useChallengeDetail(id: number) {
  return useQuery({
    queryKey: ["challenge", id],
    queryFn: async () => {
      const res = await authFetch(apiUrl(`/api/challenges/${id}`));
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: id > 0,
  });
}

export function useEnterChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ challengeId, performanceId }: { challengeId: number; performanceId: number }) => {
      const res = await authFetch(apiUrl(`/api/challenges/${challengeId}/enter`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ performanceId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).error || "Failed to enter");
      }
      return res.json();
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["challenges"] });
      qc.invalidateQueries({ queryKey: ["challenge", vars.challengeId] });
    },
  });
}
