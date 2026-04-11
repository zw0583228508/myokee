import { useEffect } from "react";
import { useGetJob } from "@workspace/api-client-react";
import { VideoPlayer } from "@/components/karaoke/VideoPlayer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
      videoSchema.type = "application/ld+json";
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
      refetchInterval: (query) => {
        const status = query.state.data?.status;
        if (!status) return 3000;
        if (status === "done" || status === "error") return false;
        return 3000;
      },
    },
  });

  useSharedSEO(job, jobId);
  const homeUrl = window.location.origin;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-xl font-display animate-pulse text-white">Loading shared karaoke...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-6" />
        <h2 className="text-3xl font-display font-bold mb-4 text-white">Karaoke not found</h2>
        <p className="text-white/30 mb-8 text-center">This karaoke link may have expired or been removed.</p>
        <a href={homeUrl}>
          <Button variant="gradient">
            <Mic2 className="mr-2 w-4 h-4" />
            Create Your Own Karaoke
          </Button>
        </a>
      </div>
    );
  }

  const videoUrl = apiUrl(`/api/processor/jobs/${job.id}/video`);
  const isDone = job.status === "done";
  const isProcessing = !isDone && job.status !== "error";

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1920&h=1080&fit=crop&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-[0.05]"
          style={{ filter: "saturate(0.4) brightness(0.4) blur(3px)" }}
        />
        <div className="absolute inset-0 bg-[#040410]/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/95" />
      </div>

      <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20 mb-4">
            <Mic2 className="w-8 h-8 text-white drop-shadow-lg" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-display font-bold text-white mb-2" dir="auto">
            {job.filename}
          </h1>
          <p className="text-white/30">
            Shared via MYOUKEE AI Karaoke
          </p>
        </div>

        {isDone && (
          <div className="space-y-8">
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-primary/10">
              <VideoPlayer src={videoUrl} />
            </div>

            <Card className="p-6 sm:p-8 text-center border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
              <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
              <h2 className="text-xl sm:text-2xl font-display font-bold text-white mb-2">
                Create Your Own Karaoke
              </h2>
              <p className="text-white/30 mb-6 max-w-md mx-auto">
                Turn any song into karaoke in seconds. Upload an MP3 or paste a YouTube link — AI removes vocals and generates synced lyrics.
              </p>
              <a href={homeUrl}>
                <Button size="lg" variant="gradient" className="text-base px-8">
                  <Mic2 className="w-5 h-5 mr-2" />
                  Try MYOUKEE Free
                </Button>
              </a>
            </Card>
          </div>
        )}

        {isProcessing && (
          <Card className="p-8 sm:p-16 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <h2 className="text-xl font-display font-bold text-white mb-2">
              Karaoke is being generated...
            </h2>
            <p className="text-white/30">
              This song is still processing. Check back in a few moments.
            </p>
          </Card>
        )}

        {job.status === "error" && (
          <Card className="p-8 sm:p-16 flex flex-col items-center justify-center text-center">
            <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
            <h2 className="text-xl font-display font-bold text-white mb-2">
              Processing Failed
            </h2>
            <p className="text-white/30 mb-6">
              Unfortunately, this karaoke could not be generated.
            </p>
            <a href={homeUrl}>
              <Button variant="gradient">
                <Mic2 className="mr-2 w-4 h-4" />
                Create Your Own Karaoke
              </Button>
            </a>
          </Card>
        )}

        <div className="mt-8 text-center">
          <a
            href={homeUrl}
            className="text-sm text-white/25 hover:text-white/60 transition-colors"
          >
            Powered by MYOUKEE — AI Karaoke Generator
          </a>
        </div>
      </div>
    </div>
  );
}
