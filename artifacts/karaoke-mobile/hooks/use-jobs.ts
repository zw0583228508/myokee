import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
  probability: number;
}

export interface Job {
  id: string;
  status:
    | "pending"
    | "downloading"
    | "queued"
    | "separating"
    | "transcribing"
    | "awaiting_review"
    | "rendering"
    | "done"
    | "error";
  progress: number;
  filename: string;
  error?: string;
  words?: WordTimestamp[];
  language?: string;
  created_at: string;
  updated_at: string;
}

const BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}/api/processor`
  : "http://localhost:8080/api/processor"; // dev: go through API server so auth middleware runs

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { credentials: "include", ...init });
  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function useJobs() {
  return useQuery<Job[]>({
    queryKey: ["jobs"],
    queryFn: () => apiFetch<Job[]>("/jobs"),
    refetchInterval: 3000,
  });
}

export function useJob(id: string) {
  return useQuery<Job>({
    queryKey: ["job", id],
    queryFn: () => apiFetch<Job>(`/jobs/${id}`),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (!status) return 2000;
      const terminal = status === "done" || status === "error" || status === "awaiting_review";
      return terminal ? false : 2000;
    },
    enabled: !!id,
  });
}

export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation<Job, Error, FormData>({
    mutationFn: (formData) =>
      apiFetch<Job>("/jobs", { method: "POST", body: formData }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jobs"] }),
  });
}

export function useCreateJobFromYouTube() {
  const qc = useQueryClient();
  return useMutation<Job, Error, string>({
    mutationFn: (url) =>
      apiFetch<Job>("/jobs/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jobs"] }),
  });
}

export async function uploadAvatar(
  jobId: string,
  avatarUri: string,
  webFile?: File,
): Promise<void> {
  const form = new FormData();
  if (webFile) {
    // Web: use the actual browser File object
    form.append("file", webFile);
  } else if (avatarUri.startsWith("blob:") || avatarUri.startsWith("data:")) {
    // Web fallback: fetch blob/data URI and convert to Blob
    const resp = await fetch(avatarUri);
    const blob = await resp.blob();
    form.append("file", blob, "avatar.jpg");
  } else {
    // Native: React Native FormData handles { uri, name, type }
    form.append("file", { uri: avatarUri, name: "avatar.jpg", type: "image/jpeg" } as any);
  }
  const res = await fetch(`${BASE}/jobs/${jobId}/avatar`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(`Avatar upload failed: ${res.status}`);
}

export function useDeleteJob() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => apiFetch<void>(`/jobs/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jobs"] }),
  });
}

export function useUpdateLyrics(jobId: string) {
  const qc = useQueryClient();
  return useMutation<Job, Error, WordTimestamp[]>({
    mutationFn: (words) =>
      apiFetch<Job>(`/jobs/${jobId}/lyrics`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ words }),
      }),
    onSuccess: (updated) => {
      qc.setQueryData(["job", jobId], updated);
      qc.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

export function videoUrl(jobId: string) {
  return `${BASE}/jobs/${jobId}/video`;
}
