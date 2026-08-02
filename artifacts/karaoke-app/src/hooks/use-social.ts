import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiUrl, authFetch } from "@/lib/api";

export function useFeed(page = 0) {
  return useQuery({
    queryKey: ["social-feed", page],
    queryFn: async () => {
      const res = await authFetch(apiUrl(`/api/social/feed?page=${page}`));
      if (!res.ok) return { performances: [], page: 0, hasMore: false };
      return res.json();
    },
    enabled: page >= 0,
  });
}

export function useDiscover(page = 0) {
  return useQuery({
    queryKey: ["social-discover", page],
    queryFn: async () => {
      const res = await authFetch(apiUrl(`/api/social/discover?page=${page}`));
      if (!res.ok) return { performances: [], page: 0, hasMore: false };
      return res.json();
    },
    enabled: page >= 0,
  });
}

export function useProfile(userId: string) {
  return useQuery({
    queryKey: ["social-profile", userId],
    queryFn: async () => {
      const res = await authFetch(apiUrl(`/api/social/profile/${userId}`));
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
    enabled: !!userId,
  });
}

export function useFollow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, follow }: { userId: string; follow: boolean }) => {
      const res = await authFetch(apiUrl(`/api/social/follow/${userId}`), {
        method: follow ? "POST" : "DELETE",
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["social-profile", vars.userId] });
      qc.invalidateQueries({ queryKey: ["social-feed"] });
    },
  });
}

export function useLikePerformance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ performanceId, like }: { performanceId: number; like: boolean }) => {
      const res = await authFetch(apiUrl(`/api/social/like/${performanceId}`), {
        method: like ? "POST" : "DELETE",
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["social-feed"] });
      qc.invalidateQueries({ queryKey: ["social-discover"] });
    },
  });
}

export function useComments(performanceId: number) {
  return useQuery({
    queryKey: ["comments", performanceId],
    queryFn: async () => {
      const res = await authFetch(apiUrl(`/api/social/comments/${performanceId}`));
      if (!res.ok) return { comments: [] };
      return res.json();
    },
    enabled: performanceId > 0,
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ performanceId, content }: { performanceId: number; content: string }) => {
      const res = await authFetch(apiUrl(`/api/social/comment/${performanceId}`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["comments", vars.performanceId] });
      qc.invalidateQueries({ queryKey: ["social-feed"] });
      qc.invalidateQueries({ queryKey: ["social-discover"] });
    },
  });
}
