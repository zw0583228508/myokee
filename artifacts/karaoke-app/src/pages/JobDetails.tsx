import { useParams, Link, useLocation } from "wouter";
import { useKaraokeJob, useJobLyrics, useRetryJob, getDownloadUrls } from "@/hooks/use-karaoke";
import { getGetJobQueryKey } from "@workspace/api-client-react";
import { JobPipeline } from "@/components/karaoke/JobPipeline";
import { TranscriptEditor } from "@/components/karaoke/TranscriptEditor";
import { VideoPlayer } from "@/components/karaoke/VideoPlayer";
import { JobStatusBadge } from "@/components/karaoke/JobStatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Music2, FileVideo, AlertTriangle, Loader2, Mic, CreditCard, Coins, Share2 } from "lucide-react";
import { ShareButtons } from "@/components/ShareButtons";
import { useState, useRef, useEffect, useMemo } from "react";
import { KaraokeSingMode } from "@/components/karaoke/KaraokeSingMode";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiUrl, authFetchOptions } from "@/lib/api";

type ChargeState = "pending" | "free" | "charged" | "insufficient";

export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { data: job, isLoading, error } = useKaraokeJob(id || "");
  // Only fetch lyrics for the done-state sidebar (video playback sync)
  const { data: lyricsData } = useJobLyrics(id || "", job?.status === "done");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const retryJob = useRetryJob(id || "");
  const [currentTime, setCurrentTime] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chargeTriggeredRef = useRef(false);
  const prevStatusRef = useRef<string>("");
  const [chargeState, setChargeState] = useState<ChargeState>("pending");
  const [creditsCharged, setCreditsCharged] = useState(0);
  const [singMode, setSingMode] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (job?.status && job.status !== 'awaiting_review') {
      setIsConfirming(false);
    }
  }, [job?.status]);

  // Challenger params from URL (e.g. /job/xxx?challenger=Name&score=85)
  const urlSearch      = useMemo(() => new URLSearchParams(window.location.search), []);
  const challengerName  = urlSearch.get("challenger") ?? undefined;
  const challengerScore = urlSearch.get("score") ? Number(urlSearch.get("score")) : undefined;

  const handleRetry = () => {
    retryJob.mutate();
  };

  // Request browser notification permission on first visit to this page
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Fire toast + browser notification when job status reaches key milestones
  useEffect(() => {
    if (!job) return;
    const prev = prevStatusRef.current;
    const curr = job.status as string;
    if (!prev || prev === curr) {
      prevStatusRef.current = curr;
      return;
    }
    prevStatusRef.current = curr;

    if (curr === "awaiting_review") {
      toast({
        title: "✅ התמלול מוכן לבדיקה!",
        description: `${job.filename} — גלול למטה לבדיקת המילים`,
      });
      if ("Notification" in window && Notification.permission === "granted") {
        try {
          new Notification("MYOUKEE — תמלול מוכן!", {
            body: `${job.filename} — לחץ לבדיקת המילים`,
            icon: "/favicon.svg",
            tag: `job-awaiting-${job.id}`,
          });
        } catch { /* non-critical */ }
      }
    } else if (curr === "done") {
      toast({
        title: "🎤 הקריוקי מוכן!",
        description: `${job.filename} — ניתן לשיר עכשיו!`,
      });
      if ("Notification" in window && Notification.permission === "granted") {
        try {
          new Notification("MYOUKEE — קריוקי מוכן! 🎤", {
            body: `${job.filename} — לחץ לשירה`,
            icon: "/favicon.svg",
            tag: `job-done-${job.id}`,
          });
        } catch { /* non-critical */ }
      }
    }
  }, [job?.status]);

  // Auto-scroll lyrics sidebar based on video time (done state only)
  // Uses scrollTop directly on the container so the PAGE doesn't jump
  useEffect(() => {
    if (!lyricsData?.words || !scrollRef.current) return;
    const activeWordIndex = lyricsData.words.findIndex(
      w => currentTime >= w.start && currentTime <= w.end + 0.5
    );
    if (activeWordIndex !== -1) {
      const container = scrollRef.current;
      const wordElements = container.getElementsByClassName('lyric-word');
      const wordEl = wordElements[activeWordIndex] as HTMLElement | undefined;
      if (wordEl) {
        const target = wordEl.offsetTop - container.clientHeight / 2 + wordEl.clientHeight / 2;
        container.scrollTo({ top: target, behavior: 'smooth' });
      }
    }
  }, [currentTime, lyricsData?.words]);

  const attemptCharge = (jobId: string, durationSeconds: number) => {
    chargeTriggeredRef.current = true;
    setChargeState("pending");

    fetch(apiUrl(`/api/jobs/${jobId}/charge`), authFetchOptions({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ durationSeconds }),
    }))
      .then(res => {
        if (!res.ok && res.status !== 200) {
          console.error(`[Charge] HTTP ${res.status} for job ${jobId}`);
        }
        return res.json();
      })
      .then(data => {
        if (data.error) {
          console.error(`[Charge] API error: ${data.error}`);
          chargeTriggeredRef.current = false;
          toast({ title: "שגיאה בחיוב", description: "נסה שוב בעוד כמה שניות", variant: "destructive" });
          return;
        }
        if (data.alreadyCharged) {
          setChargeState(data.creditsCharged === 0 ? "free" : "charged");
          setCreditsCharged(data.creditsCharged);
          return;
        }
        if (data.success === false) {
          setChargeState("insufficient");
          chargeTriggeredRef.current = false;
          return;
        }
        if (data.creditsCharged === 0) {
          setChargeState("free");
          toast({ title: "שיר חינמי!", description: "שיר קצר מ-40 שניות — ללא עלות." });
        } else {
          setChargeState("charged");
          setCreditsCharged(data.creditsCharged);
          toast({
            title: `נוצלו ${data.creditsCharged} קרדיטים`,
            description: `יתרה חדשה: ${data.newBalance} קרדיטים`,
          });
          queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
        }
      })
      .catch((err) => {
        console.error(`[Charge] Network error:`, err);
        chargeTriggeredRef.current = false;
        toast({ title: "שגיאת רשת", description: "לא הצלחנו לחייג לשרת, נסה שוב", variant: "destructive" });
      });
  };

  useEffect(() => {
    if (job?.status !== "done" || chargeTriggeredRef.current || !id) return;
    const durationSeconds = (job as any).duration_seconds;
    if (!durationSeconds || durationSeconds <= 0) return;
    attemptCharge(id, durationSeconds);
  }, [job?.status, (job as any)?.duration_seconds, id]);

  useEffect(() => {
    if (chargeState !== "insufficient" || !id) return;
    const dur = (job as any)?.duration_seconds;
    if (!dur) return;
    const handler = () => {
      if (document.visibilityState === "visible" && chargeState === "insufficient") {
        attemptCharge(id, dur);
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [chargeState, id, (job as any)?.duration_seconds]);

  const handleLyricsConfirmed = () => {
    queryClient.invalidateQueries({ queryKey: getGetJobQueryKey(id || "") });
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-xl font-display animate-pulse">טוען פרטי עבודה...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-20 text-center">
        <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-6" />
        <h2 className="text-3xl font-display font-bold mb-4">העבודה לא נמצאה</h2>
        <p className="text-muted-foreground mb-8">הטראק שאתה מחפש לא קיים או נמחק.</p>
        <Link href="/">
          <Button variant="gradient"><ArrowLeft className="mr-2 w-4 h-4"/> חזרה לסטודיו</Button>
        </Link>
      </div>
    );
  }

  const { videoUrl, audioUrl } = getDownloadUrls(job.id);
  const isDone = job.status === 'done';
  const isAwaitingReview = job.status === 'awaiting_review';

  // Use words directly from the job object (populated when status = awaiting_review)
  // This avoids any race condition with a separate lyrics fetch
  const jobWords = (job.words as any[]) || [];

  return (
    <div className="relative min-h-screen">
      {/* Page background */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1920&h=1080&fit=crop&q=80"
          alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.07]"
          style={{ filter: "saturate(0.7) blur(3px)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
      </div>
    <div className="w-full max-w-6xl mx-auto px-4 py-4 sm:py-8">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> חזרה לסטודיו
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold mb-2 truncate max-w-full sm:max-w-2xl" dir="auto">{job.filename}</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <JobStatusBadge status={job.status} />
              <span>•</span>
              <span>{new Date(job.created_at).toLocaleString('he-IL')}</span>
            </div>
          </div>
          
          {isDone && chargeState !== "insufficient" && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm">
                  <a href={audioUrl} download>
                    <Music2 className="w-3.5 h-3.5 mr-1.5" />
                    ללא ווקאל
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm">
                  <a href={videoUrl} download>
                    <FileVideo className="w-3.5 h-3.5 mr-1.5" />
                    וידאו קריוקי
                  </a>
                </Button>
              </div>
              <ShareButtons title={job.filename} jobId={job.id} />
            </div>
          )}
          {isDone && chargeState === "insufficient" && (
            <div className="flex items-center gap-3">
              <Button variant="gradient" onClick={() => navigate("/")}>
                <CreditCard className="w-4 h-4 mr-2" />
                קנה קרדיטים להורדה
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Processing / awaiting review state */}
      {!isDone && (
        <div className="space-y-8">
          <Card className="p-4 sm:p-8 md:p-16 flex flex-col items-center justify-center min-h-[250px] sm:min-h-[300px]">
            <JobPipeline
              status={job.status}
              progress={job.progress}
              onRetry={handleRetry}
              isRetrying={retryJob.isPending}
              canRetry={job.status === 'error'}
              isConfirming={isConfirming}
            />
            {job.error && (
              <div className="mt-8 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm w-full max-w-2xl">
                <strong>פרטי שגיאה:</strong> {job.error}
              </div>
            )}
          </Card>

          {/* Transcript editor — uses job.words directly (no separate fetch needed) */}
          {isAwaitingReview && !isConfirming && (
            <TranscriptEditor
              jobId={job.id}
              words={jobWords}
              onConfirmed={handleLyricsConfirmed}
              onConfirmingChange={setIsConfirming}
            />
          )}
        </div>
      )}

      {/* Insufficient credits banner */}
      {isDone && chargeState === "insufficient" && (
        <Card className="p-6 mb-6 border-destructive/30 bg-destructive/10">
          <div className="flex items-center gap-4">
            <CreditCard className="w-8 h-8 text-destructive shrink-0" />
            <div>
              <h3 className="font-semibold text-destructive mb-1">אין מספיק קרדיטים</h3>
              <p className="text-sm text-muted-foreground">השיר עובד בהצלחה! כדי להוריד, נדרש לרכוש קרדיטים. חזור לדף הראשי וקנה חבילה.</p>
            </div>
            <div className="flex gap-2 ml-auto shrink-0">
              <Button variant="outline" onClick={() => {
                const dur = (job as any)?.duration_seconds;
                if (id && dur) attemptCharge(id, dur);
              }}>
                נסה שוב
              </Button>
              <Button variant="gradient" onClick={() => navigate("/")}>
                קנה קרדיטים
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Done state — video player + lyrics sidebar */}
      {isDone && chargeState !== "insufficient" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-primary/10">
              <VideoPlayer 
                src={videoUrl} 
                onTimeUpdate={setCurrentTime}
              />
            </div>

            <button
              onClick={() => setSingMode(true)}
              className="group relative w-full overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/15 via-accent/10 to-primary/15 p-5 sm:p-6 transition-all duration-300 hover:border-primary/60 hover:shadow-[0_0_40px_rgba(147,51,234,0.25)] active:scale-[0.99]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-accent/10 rounded-full blur-2xl group-hover:bg-accent/20 transition-colors duration-500" />
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors duration-500" />
              <div className="relative flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30 group-hover:shadow-primary/50 group-hover:scale-105 transition-all duration-300">
                    <Mic className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-lg sm:text-xl font-display font-bold text-white group-hover:text-primary-foreground transition-colors">
                      שר עכשיו
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      הקלט את עצמך שר על הקריוקי
                    </div>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-primary/70 group-hover:text-primary group-hover:translate-x-[-4px] transition-all duration-300">
                  <span className="text-sm font-medium">התחל</span>
                  <ArrowLeft className="w-5 h-5" />
                </div>
              </div>
            </button>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Music2 className="w-5 h-5 text-accent" />
                פרטי טראק
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block mb-1">סטטוס</span>
                  <span className="text-green-400 font-medium">עובד בהצלחה</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">מילים</span>
                  <span className="font-medium">{lyricsData?.words?.length ?? jobWords.length} מילים תומללו</span>
                </div>
                {chargeState === "free" && (
                  <div>
                    <span className="text-muted-foreground block mb-1">עלות</span>
                    <span className="text-green-400 font-medium flex items-center gap-1"><Coins className="w-3.5 h-3.5" /> חינם (עד 40 שניות)</span>
                  </div>
                )}
                {chargeState === "charged" && (
                  <div>
                    <span className="text-muted-foreground block mb-1">קרדיטים שנוצלו</span>
                    <span className="font-medium flex items-center gap-1"><Coins className="w-3.5 h-3.5 text-accent" /> {creditsCharged} קרדיטים</span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Lyrics sidebar — fixed height so inner overflow-y:auto works */}
          <div className="lg:col-span-1 h-[350px] lg:h-[600px] flex flex-col">
            <Card className="flex-1 flex flex-col overflow-hidden border-white/5">
              <div className="p-4 border-b border-white/5 bg-background/50 backdrop-blur-md z-10">
                <h3 className="font-display font-semibold flex items-center gap-2">
                  <Mic className="w-4 h-4 text-primary" />
                  מילות השיר
                </h3>
              </div>
              
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-2 scroll-smooth"
                style={{ scrollbarWidth: 'thin' }}
              >
                {!lyricsData?.words || lyricsData.words.length === 0 ? (
                  <div className="text-center text-muted-foreground py-12">
                    לא זוהה ווקאל בטראק זה.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-x-2 gap-y-3 leading-loose text-lg" dir="rtl">
                    {lyricsData.words.map((w, i) => {
                      const isActive = currentTime >= w.start && currentTime <= w.end + 0.2;
                      const isPast = currentTime > w.end + 0.2;
                      
                      return (
                        <span 
                          key={i}
                          dir="rtl"
                          className={`
                            lyric-word transition-all duration-200
                            ${isActive ? 'text-accent font-bold scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 
                              isPast ? 'text-white/80' : 'text-white/30'}
                          `}
                        >
                          {w.word}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── Sing Now overlay ─────────────────────────────── */}
      {singMode && isDone && (
        <KaraokeSingMode
          audioUrl={audioUrl}
          videoUrl={videoUrl}
          words={lyricsData?.words ?? jobWords}
          songName={job.filename}
          jobId={id ?? ""}
          onClose={() => setSingMode(false)}
          challengerName={challengerName}
          challengerScore={challengerScore}
        />
      )}
    </div>
    </div>
  );
}
