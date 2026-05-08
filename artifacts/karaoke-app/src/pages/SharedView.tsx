import { useEffect } from "react";
import { useGetJob } from "@workspace/api-client-react";
import { VideoPlayer } from "@/components/karaoke/VideoPlayer";
import { Loader2, AlertTriangle, Mic2, Sparkles } from "lucide-react";
import { apiUrl } from "@/lib/api";

function useSharedSEO(job: any, jobId: string) {
  useEffect(() => {
    if (!job) return;
    const title = `${job.filename || "Karaoke"} — AI Karaoke by MYOUKEE`;
    const desc = `Listen to "${job.filename || "this song"}" as AI-generated karaoke on MYOUKEE. Remove vocals, sync lyrics, and sing along to any song.`;
    const url = `https://myoukee.com/shared/${jobId}`;
    const videoUrl = `https://myoukee.com/api/processor/jobs/${jobId}/video`;
    const thumb = "https://myoukee.com/opengraph.jpg";

    document.title = title;
    const update = (sel: string, attr: string, val: string) => {
      const el = document.querySelector(sel) as HTMLElement | null;
      if (el) (el as any)[attr] = val;
    };
    update('meta[name="description"]', "content", desc);
    update('link[rel="canonical"]', "href", url);
    update('meta[property="og:title"]', "content", title);
    update('meta[property="og:description"]', "content", desc);
    update('meta[property="og:url"]', "content", url);
    update('meta[property="og:type"]', "content", "video.other");
    update('meta[name="twitter:title"]', "content", title);
    update('meta[name="twitter:description"]', "content", desc);

    let videoSchema = document.getElementById("seo-video-shared");
    if (!videoSchema) {
      videoSchema = document.createElement("script");
      videoSchema.id = "seo-video-shared";
      (videoSchema as any).type = "application/ld+json";
      document.head.appendChild(videoSchema);
    }
    videoSchema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "VideoObject",
      "name": `${job.filename || "Karaoke Video"} — AI Karaoke`,
      "description": desc,
      "thumbnailUrl": thumb,
      "contentUrl": videoUrl,
      "embedUrl": url,
      "uploadDate": job.created_at ? new Date(job.created_at).toISOString().split("T")[0] : "2026-01-01",
      "publisher": {
        "@type": "Organization",
        "name": "MYOUKEE",
        "logo": { "@type": "ImageObject", "url": "https://myoukee.com/opengraph.jpg" },
      },
    });

    return () => {
      videoSchema?.remove();
      const defTitle = "Turn Any Song into Karaoke in Seconds | Free AI Vocal Remover & Lyrics Sync | Myoukee";
      const defDesc = "Turn any song into karaoke instantly — free online tool. Remove vocals with AI, get auto-synced lyrics, and sing along.";
      document.title = defTitle;
      update('meta[name="description"]', "content", defDesc);
      update('link[rel="canonical"]', "href", "https://myoukee.com/");
      update('meta[property="og:title"]', "content", defTitle);
      update('meta[property="og:description"]', "content", defDesc);
      update('meta[property="og:url"]', "content", "https://myoukee.com/");
      update('meta[property="og:type"]', "content", "website");
      update('meta[name="twitter:title"]', "content", defTitle);
      update('meta[name="twitter:description"]', "content", defDesc);
    };
  }, [job, jobId]);
}

export default function SharedView({ jobId }: { jobId: string }) {
  const { data: job, isLoading, error } = useGetJob(jobId, {
    query: {
      refetchInterval: ((query: any) => {
        const status = query.state.data?.status;
        if (!status) return 3000;
        if (status === "done" || status === "error") return false;
        return 3000;
      }) as any,
    } as any,
  });

  useSharedSEO(job, jobId);
  const homeUrl = window.location.origin;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--ds-bg-app)] relative">
        <div className="absolute inset-0 -z-10 ds-bg-galaxy opacity-60" />
        <div className="ds-icon-orb w-16 h-16 rounded-2xl mb-5">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
        <p className="text-xl font-display text-white/85 animate-pulse">Loading shared karaoke…</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--ds-bg-app)] relative px-4">
        <div className="absolute inset-0 -z-10 ds-bg-galaxy opacity-60" />
        <div className="ds-card-feature p-10 text-center max-w-md">
          <div className="ds-icon-orb w-16 h-16 rounded-2xl mx-auto mb-5"
               style={{ background: "linear-gradient(135deg,#F43F5E,#F59E0B)", boxShadow: "0 0 32px rgba(244,63,94,.5)" }}>
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-display font-bold mb-3 text-white">Karaoke not found</h2>
          <p className="text-white/55 mb-7">This karaoke link may have expired or been removed.</p>
          <a href={homeUrl}>
            <button className="ds-btn ds-btn-primary w-full py-3">
              <Mic2 className="w-4 h-4" />Create Your Own Karaoke
            </button>
          </a>
        </div>
      </div>
    );
  }

  const videoUrl = apiUrl(`/api/processor/jobs/${job.id}/video`);
  const isDone = job.status === "done";
  const isProcessing = !isDone && job.status !== "error";

  return (
    <div className="min-h-screen bg-[var(--ds-bg-app)] relative">
      <div className="absolute top-0 inset-x-0 h-[500px] -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 ds-bg-galaxy" />
        <div className="absolute inset-0 ds-bg-aurora opacity-50" />
        <div className="ds-orb ds-orb-violet absolute -top-32 left-1/4 w-[500px] h-[500px] opacity-55" />
        <div className="ds-orb ds-orb-cyan absolute -top-24 right-1/4 w-[440px] h-[440px] opacity-45" style={{ animationDelay: "2s" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050510]/30 via-transparent to-[#050510]" />
      </div>

      <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-14">
        <div className="text-center mb-10 ds-reveal">
          <div className="inline-flex items-center gap-1.5 ds-glass rounded-full px-3 py-1 text-[11px] font-bold text-violet-300 uppercase tracking-wider mb-4">
            <Sparkles className="w-3 h-3" />Shared Performance
          </div>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl ds-icon-orb mb-4">
            <Mic2 className="w-8 h-8 text-white drop-shadow-lg" />
          </div>
          <h1 className="ds-page-title font-display font-bold text-white mb-2" dir="auto">
            {job.filename}
          </h1>
          <p className="text-white/55">Shared via MYOUKEE AI Karaoke</p>
        </div>

        {isDone && (
          <div className="space-y-8">
            <div className="rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-violet-500/15 ds-glass">
              <VideoPlayer src={videoUrl} />
            </div>

            <div className="ds-card-feature relative p-7 sm:p-9 text-center overflow-hidden">
              <div className="ds-orb ds-orb-violet absolute -top-16 -right-16 w-52 h-52 opacity-50" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl ds-icon-orb mb-4">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-3">
                  Create Your Own Karaoke
                </h2>
                <p className="text-white/60 mb-7 max-w-md mx-auto leading-relaxed">
                  Turn any song into karaoke in seconds. Upload an MP3 or paste a YouTube link — AI removes vocals and generates synced lyrics.
                </p>
                <a href={homeUrl} className="inline-block">
                  <button className="ds-btn ds-btn-primary px-8 py-3.5 text-base">
                    <Mic2 className="w-5 h-5" />Try MYOUKEE Free
                  </button>
                </a>
              </div>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="ds-card p-12 sm:p-16 flex flex-col items-center justify-center text-center">
            <div className="ds-icon-orb w-14 h-14 rounded-2xl mb-5">
              <Loader2 className="w-7 h-7 text-white animate-spin" />
            </div>
            <h2 className="text-xl font-display font-bold text-white mb-2">
              Karaoke is being generated…
            </h2>
            <p className="text-white/55">This song is still processing. Check back in a few moments.</p>
          </div>
        )}

        {job.status === "error" && (
          <div className="ds-card p-12 sm:p-16 flex flex-col items-center justify-center text-center">
            <div className="ds-icon-orb w-14 h-14 rounded-2xl mb-5"
                 style={{ background: "linear-gradient(135deg,#F43F5E,#F59E0B)", boxShadow: "0 0 32px rgba(244,63,94,.5)" }}>
              <AlertTriangle className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-xl font-display font-bold text-white mb-2">Processing Failed</h2>
            <p className="text-white/55 mb-6">Unfortunately, this karaoke could not be generated.</p>
            <a href={homeUrl}>
              <button className="ds-btn ds-btn-primary px-6 py-3">
                <Mic2 className="w-4 h-4" />Create Your Own Karaoke
              </button>
            </a>
          </div>
        )}

        <div className="mt-10 text-center">
          <a href={homeUrl} className="text-sm text-white/35 hover:text-white/65 transition-colors">
            Powered by MYOUKEE — AI Karaoke Generator
          </a>
        </div>
      </div>
    </div>
  );
}
