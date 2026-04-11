import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiUrl, authFetchOptions } from "@/lib/api";

export function useFeed(page = 0) {
  return useQuery({
    queryKey: ["social-feed", page],
    queryFn: async () => {
      const res = await fetch(apiUrl(`/api/social/feed?page=${page}`), authFetchOptions());
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
      const res = await fetch(apiUrl(`/api/social/discover?page=${page}`), authFetchOptions());
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
      const res = await fetch(apiUrl(`/api/social/profile/${userId}`), authFetchOptions());
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
      const res = await fetch(apiUrl(`/api/social/follow/${userId}`), authFetchOptions({
        method: follow ? "POST" : "DELETE",
      }));
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
      const res = await fetch(apiUrl(`/api/social/like/${performanceId}`), authFetchOptions({
        method: like ? "POST" : "DELETE",
      }));
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
      const res = await fetch(apiUrl(`/api/social/comments/${performanceId}`), authFetchOptions());
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
      const res = await fetch(apiUrl(`/api/social/comment/${performanceId}`), authFetchOptions({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      }));
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
