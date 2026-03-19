import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useGetJob, useDeleteJob, getGetJobQueryKey } from "@workspace/api-client-react";
import type { Job, WordTimestamp } from "@workspace/api-client-react/src/generated/api.schemas";
import { apiUrl, authFetchOptions, getAuthToken } from "@/lib/api";

export function useKaraokeJobs() {
  return useQuery({
    queryKey: ['/api/jobs/mine'],
    queryFn: async () => {
      const res = await fetch(apiUrl('/api/jobs/mine'), authFetchOptions());
      if (!res.ok) {
        if (res.status === 401) return [];
        throw new Error("Failed to fetch jobs");
      }
      return res.json() as Promise<Job[]>;
    },
  });
}

export function useKaraokeJob(jobId: string) {
  return useGetJob(jobId, {
    query: {
      refetchInterval: (query) => {
        if (query.state.error) return 5000;
        const status = query.state.data?.status;
        if (!status) return 2000;
        if (status === 'done' || status === 'error') return false;
        if (status === 'awaiting_review') return 5000;
        return 2000;
      },
      retry: (failureCount, error) => {
        if (error && 'status' in error && (error as any).status === 404) return false;
        return failureCount < 2;
      },
    },
  });
}

export function useJobLyrics(jobId: string, enabled = true) {
  return useQuery({
    queryKey: ['/api/processor/jobs', jobId, 'lyrics'],
    queryFn: async (): Promise<{ words: WordTimestamp[] }> => {
      const res = await fetch(apiUrl(`/api/processor/jobs/${jobId}/lyrics`));
      if (!res.ok) throw new Error("Failed to fetch lyrics");
      return res.json();
    },
    enabled: !!jobId && enabled,
  });
}

export function useConfirmLyrics(jobId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ words, bg_style = "aurora" }: { words: WordTimestamp[]; bg_style?: string }) => {
      const res = await fetch(apiUrl(`/api/processor/jobs/${jobId}/lyrics`), authFetchOptions({
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ words, bg_style }),
      }));
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to confirm lyrics: ${errorText}`);
      }
      return res.json() as Promise<Job>;
    },
    onSuccess: (updatedJob) => {
      queryClient.setQueryData(getGetJobQueryKey(jobId), (old: any) => ({
        ...(old ?? {}),
        ...updatedJob,
        status: updatedJob.status ?? 'rendering',
      }));
      queryClient.invalidateQueries({ queryKey: getGetJobQueryKey(jobId) });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs/mine'] });
    },
  });
}

export function useChangeBackground(jobId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bg_style: string) => {
      const lyricsRes = await fetch(apiUrl(`/api/processor/jobs/${jobId}/lyrics`), authFetchOptions());
      if (!lyricsRes.ok) throw new Error("Failed to fetch current lyrics");
      const lyricsData = await lyricsRes.json();
      const words = lyricsData.words || [];

      const res = await fetch(apiUrl(`/api/processor/jobs/${jobId}/lyrics`), authFetchOptions({
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ words, bg_style }),
      }));
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to change background: ${errorText}`);
      }
      return res.json() as Promise<Job>;
    },
    onSuccess: (updatedJob) => {
      queryClient.setQueryData(getGetJobQueryKey(jobId), (old: any) => ({
        ...(old ?? {}),
        ...updatedJob,
        status: updatedJob.status ?? 'rendering',
      }));
      queryClient.invalidateQueries({ queryKey: getGetJobQueryKey(jobId) });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs/mine'] });
    },
  });
}

async function claimJob(jobId: string) {
  try {
    await fetch(apiUrl(`/api/jobs/${jobId}/claim`), authFetchOptions({ method: 'POST' }));
  } catch {
    // Non-critical
  }
}

interface ProcessorConfig {
  processorUrl: string;
  maxDurationSecs: number | null;
}

async function getProcessorConfig(): Promise<ProcessorConfig> {
  const res = await fetch(apiUrl('/api/processor-config'), authFetchOptions());
  if (!res.ok) {
    const text = await res.text();
    throw new Error(res.status === 401 ? 'Authentication required' : `Config error: ${text}`);
  }
  return res.json();
}

// Route uploads directly to the processor when it's a remote URL (production).
// This avoids the double-upload bottleneck: browser → API server → processor.
// In local dev (localhost), still route through the API server proxy.
function resolveUploadUrl(processorUrl: string, path: string): { url: string; direct: boolean } {
  const isLocal = processorUrl.includes('localhost') || processorUrl.includes('127.0.0.1');
  if (!isLocal) {
    // Production: upload directly to processor — no double-hop
    return { url: `${processorUrl}${path}`, direct: true };
  }
  // Local dev: route through API server proxy
  const subPath = path.replace(/^\/processor/, '');
  return { url: apiUrl(`/api/processor${subPath}`), direct: false };
}

// Quick ping to /processor/health — 15-second timeout.
// If it times out, we proceed anyway — Modal cold-start can take 30-90s,
// and the actual upload has its own 90s AbortController timeout.
// Only throws on a definitive error (non-2xx, or network-refused).
async function pingProcessor(processorUrl: string): Promise<void> {
  const { url } = resolveUploadUrl(processorUrl, '/processor/health');
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), 15_000);
  try {
    const r = await fetch(url, { signal: controller.signal });
    if (!r.ok) throw new Error(`Health check returned ${r.status}`);
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      // Timeout — Modal is likely cold-starting. Let the upload attempt proceed
      // with its own 90-second timeout instead of failing here.
      return;
    }
    // Clear network error (e.g. connection refused) — Modal is not deployed.
    throw new Error(
      'שרת העיבוד אינו זמין. ודא שה-Modal נפרס ושה-PROCESSOR_URL מוגדר ב-Render.'
    );
  } finally {
    clearTimeout(tid);
  }
}

export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, languageHint }: { file: File; languageHint?: string }): Promise<Job> => {
      // Step 1: Auth check + get processor URL from Render
      const config = await getProcessorConfig();

      // Step 1b: Quick health check — fail in 8s instead of 90s if Modal is down.
      await pingProcessor(config.processorUrl);

      const { url: uploadUrl } = resolveUploadUrl(config.processorUrl, '/processor/jobs');

      const formData = new FormData();
      formData.append('file', file);

      const headers: Record<string, string> = {};
      const token = getAuthToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (languageHint && languageHint !== 'auto') {
        headers['x-language-hint'] = languageHint;
      }
      if (config.maxDurationSecs) {
        headers['x-max-duration'] = String(config.maxDurationSecs);
      }

      // Step 2: Upload via API proxy → Modal.
      // 150-second timeout: Modal cold-start can take up to 120s on first run.
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 150_000);

      let res: Response;
      try {
        res = await fetch(uploadUrl, {
          method: 'POST',
          body: formData,
          signal: controller.signal,
          headers,
        });
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          throw new Error(
            'שרת ה-AI לא הגיב תוך 150 שניות. ייתכן שהשרת מתחמם (cold start). ' +
            'נסה שוב — לרוב ניסיון שני יצליח ב-5 שניות.'
          );
        }
        throw new Error(`שגיאת רשת: ${err.message}`);
      } finally {
        clearTimeout(timeoutId);
      }

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`העלאה נכשלה: ${errorText}`);
      }

      const job: Job = await res.json();
      claimJob(job.id);
      return job;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs/mine'] });
    },
  });
}

export function useCreateJobFromYouTube() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ url, languageHint }: { url: string; languageHint?: string }): Promise<Job> => {
      // Step 1: Auth check + get processor URL
      const config = await getProcessorConfig();

      // Step 1b: Quick health check — fail in 8s instead of 90s if Modal is down.
      await pingProcessor(config.processorUrl);

      const { url: uploadUrl } = resolveUploadUrl(config.processorUrl, '/processor/jobs/youtube');

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const token = getAuthToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (languageHint && languageHint !== 'auto') {
        headers['x-language-hint'] = languageHint;
      }
      if (config.maxDurationSecs) {
        headers['x-max-duration'] = String(config.maxDurationSecs);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 150_000);

      let res: Response;
      try {
        res = await fetch(uploadUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({ url }),
          signal: controller.signal,
        });
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          throw new Error(
            'שרת ה-AI לא הגיב תוך 150 שניות. ייתכן שהשרת מתחמם (cold start). ' +
            'נסה שוב — לרוב ניסיון שני יצליח ב-5 שניות.'
          );
        }
        throw new Error(`שגיאת רשת: ${err.message}`);
      } finally {
        clearTimeout(timeoutId);
      }

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`YouTube download failed: ${errorText}`);
      }

      const job: Job = await res.json();
      claimJob(job.id);
      return job;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs/mine'] });
    },
  });
}

export function useRetryJob(jobId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(apiUrl(`/api/processor/jobs/${jobId}/retry`), authFetchOptions({ method: 'POST' }));
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Retry failed: ${errorText}`);
      }
      return res.json() as Promise<Job>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetJobQueryKey(jobId) });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs/mine'] });
    },
  });
}

export function useRemoveJob() {
  const queryClient = useQueryClient();
  const mutation = useDeleteJob();

  return useMutation({
    mutationFn: async (jobId: string) => {
      return mutation.mutateAsync({ jobId });
    },
    onSuccess: (_, jobId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs/mine'] });
      queryClient.removeQueries({ queryKey: getGetJobQueryKey(jobId) });
    },
  });
}

export function getDownloadUrls(jobId: string) {
  return {
    videoUrl: apiUrl(`/api/processor/jobs/${jobId}/video`),
    audioUrl: apiUrl(`/api/processor/jobs/${jobId}/instrumental`),
  };
}
