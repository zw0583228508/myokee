import { useState } from "react";
import { apiUrl, authFetchOptions } from "@/lib/api";

interface UploadState {
  status: "idle" | "uploading" | "done" | "error";
  progress: number;
  url?: string;
  error?: string;
}

export function useCloudRecording() {
  const [state, setState] = useState<UploadState>({ status: "idle", progress: 0 });

  const upload = async (blob: Blob, fileName: string) => {
    setState({ status: "uploading", progress: 0 });

    try {
      const res = await fetch(
        apiUrl("/api/storage/uploads/request-url"),
        authFetchOptions({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: fileName,
            size: blob.size,
            contentType: blob.type || "audio/wav",
          }),
        }),
      );

      if (!res.ok) throw new Error("Failed to get upload URL");

      const { uploadURL, objectPath } = await res.json();

      const xhr = new XMLHttpRequest();
      await new Promise<void>((resolve, reject) => {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setState((s) => ({ ...s, progress: Math.round((e.loaded / e.total) * 100) }));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed: ${xhr.status}`));
        };
        xhr.onerror = () => reject(new Error("Upload network error"));
        xhr.open("PUT", uploadURL);
        xhr.setRequestHeader("Content-Type", blob.type || "audio/wav");
        xhr.send(blob);
      });

      const objectUrl = apiUrl(`/api/storage${objectPath}`);
      setState({ status: "done", progress: 100, url: objectUrl });
      return objectUrl;
    } catch (err: any) {
      setState({ status: "error", progress: 0, error: err.message });
      throw err;
    }
  };

  const reset = () => setState({ status: "idle", progress: 0 });

  return { ...state, upload, reset };
}
