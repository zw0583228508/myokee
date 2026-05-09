import { useQuery } from "@tanstack/react-query";
import { apiUrl } from "@/lib/api";

export type PublicStats = {
  songsProcessed: number;
  singers: number;
  countries: number;
};

export function usePublicStats() {
  return useQuery<PublicStats>({
    queryKey: ["public-stats"],
    queryFn: async () => {
      const res = await fetch(apiUrl("/api/stats/public"));
      if (!res.ok) throw new Error("stats failed");
      return res.json();
    },
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}
