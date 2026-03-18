import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiUrl, authFetchOptions } from "@/lib/api";

export interface Recording {
  id: number;
  user_id: string;
  song_name: string;
  job_id: string;
  object_path: string;
  file_name: string;
  content_type: string;
  size_bytes: number;
  created_at: string;
}

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(apiUrl(path), authFetchOptions(options));
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function useRecordings() {
  return useQuery<Recording[]>({
    queryKey: ["recordings"],
    queryFn: () => apiFetch("/api/storage/recordings"),
    staleTime: 30_000,
  });
}

export function useDeleteRecording() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/api/storage/recordings/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recordings"] });
    },
  });
}
