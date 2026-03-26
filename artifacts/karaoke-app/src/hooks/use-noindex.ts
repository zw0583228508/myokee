import { useEffect } from "react";

export function useNoIndex() {
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "robots";
      document.head.appendChild(meta);
    }
    const prev = meta.content;
    meta.content = "noindex, nofollow";
    return () => {
      if (prev) {
        meta!.content = prev;
      } else {
        meta!.remove();
      }
    };
  }, []);
}