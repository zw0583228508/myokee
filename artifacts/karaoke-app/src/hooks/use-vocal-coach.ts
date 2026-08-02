import { useQuery } from "@tanstack/react-query";
import { apiUrl, authFetch } from "@/lib/api";

export function useVocalTips(performanceId: number) {
  return useQuery({
    queryKey: ["vocal-tips", performanceId],
    queryFn: async () => {
      const res = await authFetch(apiUrl(`/api/vocal-coach/${performanceId}`));
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
      const res = await authFetch(apiUrl("/api/vocal-coach/progress/me"));
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });
}
