import { useQuery } from "@tanstack/react-query";
import { apiUrl, authFetchOptions } from "@/lib/api";

export function useVocalTips(performanceId: number) {
  return useQuery({
    queryKey: ["vocal-tips", performanceId],
    queryFn: async () => {
      const res = await fetch(apiUrl(`/api/vocal-coach/${performanceId}`), authFetchOptions());
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: performanceId > 0,
  });
}

export function useVocalProgress() {
  return useQuery({
    queryKey: ["vocal-progress"],
    queryFn: async () => {
      const res = await fetch(apiUrl("/api/vocal-coach/progress/me"), authFetchOptions());
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });
}
