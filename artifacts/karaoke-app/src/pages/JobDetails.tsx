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
import { BackgroundChanger } from "@/components/karaoke/BackgroundChanger";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiUrl, authFetchOptions } from "@/lib/api";
import { PricingModal } from "@/components/karaoke/PricingModal";
import { useUITranslations } from "@/contexts/uiTranslations";
import { useLang } from "@/contexts/LanguageContext";

type ChargeState = "pending" | "free" | "charged" | "insufficient" | "error";

export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { data: job, isLoading, error } = useKaraokeJob(id || "");
  // Only fetch lyrics for the done-state sidebar (video playback sync)
  const { data: lyricsData } = useJobLyrics(id || "", job?.status === "done");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const uiT = useUITranslations();
  const { lang } = useLang();

  const retryJob = useRetryJob(id || "");
  const [currentTime, setCurrentTime] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chargeTriggeredRef = useRef(false);
  const chargingInProgressRef = useRef(false);
  const prevStatusRef = useRef<string>("");
  const [chargeState, setChargeState] = useState<ChargeState>("pending");
  const [creditsCharged, setCreditsCharged] = useState(0);
  const [chargeError, setChargeError] = useState("");
  const [singMode, setSingMode] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [videoCacheBust, setVideoCacheBust] = useState(0);

  const isJobStuck = useMemo(() => {
    if (!job) return false;
    const activeStatuses = new Set(["separating", "transcribing", "rendering", "pending", "queued"]);
    if (!activeStatuses.has(job.status)) return false;
    const updatedAt = new Date(job.updated_at).getTime();
    if (isNaN(updatedAt)) return false;
    const staleMinutes = (Date.now() - updatedAt) / 60000;
    return staleMinutes > 5;
  }, [job?.status, job?.updated_at]);

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
        title: uiT.jobPage.toastReviewTitle,
        description: `${job.filename} — ${uiT.jobPage.toastReviewDesc}`,
      });
      if ("Notification" in window && Notification.permission === "granted") {
        try {
          new Notification(uiT.jobPage.notifReviewTitle, {
            body: `${job.filename} — ${uiT.jobPage.notifReviewBody}`,
            icon: "/favicon.svg",
            tag: `job-awaiting-${job.id}`,
          });
        } catch { /* non-critical */ }
      }
    } else if (curr === "done") {
      setVideoCacheBust(Date.now());
      toast({
        title: uiT.jobPage.toastDoneTitle,
        description: `${job.filename} — ${uiT.jobPage.toastDoneDesc}`,
      });
      if ("Notification" in window && Notification.permission === "granted") {
        try {
          new Notification(uiT.jobPage.notifDoneTitle, {
            body: `${job.filename} — ${uiT.jobPage.notifDoneBody}`,
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

  const checkAccess = async (jobId: string): Promise<boolean> => {
    try {
      const res = await fetch(apiUrl(`/api/jobs/${jobId}/access`), authFetchOptions());
      if (!res.ok) {
        console.warn(`[Charge] Access check failed: HTTP ${res.status}`);
        return false;
      }
      const data = await res.json();
      console.log(`[Charge] Access check:`, data);
      if (data.access && data.creditsCharged != null && data.creditsCharged >= 0) {
        setChargeState(data.creditsCharged === 0 ? "free" : "charged");
        setCreditsCharged(data.creditsCharged ?? 0);
        return true;
      }
    } catch (e) {
      console.warn(`[Charge] Access check error:`, e);
    }
    return false;
  };

  const attemptCharge = async (jobId: string, durationSeconds?: number) => {
    if (chargingInProgressRef.current) return;
    chargingInProgressRef.current = true;
    chargeTriggeredRef.current = true;
    setChargeState("pending");

    if (!durationSeconds) {
      durationSeconds = (job as any)?.duration_seconds;
    }
    console.log(`[Charge] Starting charge for job ${jobId}, duration=${durationSeconds}`);

    const MAX_RETRIES = 3;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        console.log(`[Charge] Retry ${attempt}/${MAX_RETRIES}`);
        await new Promise(r => setTimeout(r, attempt * 1500));
      }

      try {
        const accessRes = await fetch(apiUrl(`/api/jobs/${jobId}/access`), authFetchOptions());
        if (accessRes.ok) {
          const accessData = await accessRes.json();
          console.log(`[Charge] Access check:`, accessData);
          if (accessData.access && accessData.creditsCharged != null && accessData.creditsCharged >= 0) {
            setChargeState(accessData.creditsCharged === 0 ? "free" : "charged");
            setCreditsCharged(accessData.creditsCharged);
            chargingInProgressRef.current = false;
            return;
          }
        }
      } catch (e) {
        console.warn(`[Charge] Access check error:`, e);
      }

      try {
        const res = await fetch(apiUrl(`/api/jobs/${jobId}/charge`), authFetchOptions({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(durationSeconds ? { durationSeconds } : {}),
        }));
        const data = await res.json();
        console.log(`[Charge] Response:`, data);

        if (data.alreadyCharged) {
          const cc = data.creditsCharged >= 0 ? data.creditsCharged : 0;
          setChargeState(cc === 0 ? "free" : "charged");
          setCreditsCharged(cc);
          chargingInProgressRef.current = false;
          return;
        }
        if (data.success === false) {
          setChargeState("insufficient");
          chargeTriggeredRef.current = false;
          chargingInProgressRef.current = false;
          return;
        }
        if (data.success === true) {
          if (data.creditsCharged === 0) {
            setChargeState("free");
            toast({ title: uiT.jobPage.toastFreeTitle, description: uiT.jobPage.toastFreeDesc });
          } else {
            setChargeState("charged");
            setCreditsCharged(data.creditsCharged);
            toast({
              title: uiT.jobPage.toastChargedTitle(data.creditsCharged),
              description: uiT.jobPage.toastChargedDesc(data.newBalance),
            });
            queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
          }
          chargingInProgressRef.current = false;
          return;
        }
        if (data.error) {
          console.error(`[Charge] API error: ${data.error}`);
          setChargeError(`${res.status}: ${data.error}`);
          continue;
        }
      } catch (err: any) {
        console.error(`[Charge] Network error:`, err);
        setChargeError(`Network: ${err.message}`);
        continue;
      }
    }

    console.error(`[Charge] All retries exhausted for job ${jobId}`);
    setChargeState("error");
    chargingInProgressRef.current = false;
    chargeTriggeredRef.current = false;
    toast({ title: uiT.jobPage.toastChargeError, description: uiT.jobPage.toastChargeErrorDesc, variant: "destructive" });
  };

  useEffect(() => {
    if (job?.status !== "done" || !id) return;
    const dur = (job as any)?.duration_seconds;
    if (dur && dur > 0) {
      fetch(apiUrl(`/api/jobs/${id}/store-duration`), authFetchOptions({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ durationSeconds: dur }),
      })).catch(() => {});
    }
    if (chargeTriggeredRef.current) return;
    console.log(`[Charge] Job done, triggering charge for ${id}, duration=${dur}`);
    attemptCharge(id, dur);
  }, [job?.status, id]);

  useEffect(() => {
    if (chargeState !== "insufficient" || !id) return;
    const handler = () => {
      if (document.visibilityState === "visible" && chargeState === "insufficient") {
        attemptCharge(id);
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [chargeState, id]);

  const handleLyricsConfirmed = () => {
    queryClient.invalidateQueries({ queryKey: getGetJobQueryKey(id || "") });
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-xl font-display animate-pulse">{uiT.jobPage.loading}</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-20 text-center">
        <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-6" />
        <h2 className="text-3xl font-display font-bold mb-4">{uiT.jobPage.notFound}</h2>
        <p className="text-muted-foreground mb-8">{uiT.jobPage.notFoundDesc}</p>
        <Link href="/">
          <Button variant="gradient"><ArrowLeft className="mr-2 w-4 h-4"/> {uiT.jobPage.backToStudio}</Button>
        </Link>
      </div>
    );
  }

  const { videoUrl, audioUrl } = getDownloadUrls(job.id, videoCacheBust || undefined);
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
        <div className="flex items-center gap-4 mb-6">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> {uiT.jobPage.backToStudio}
          </Link>
          <span className="text-muted-foreground/40">|</span>
          <Link href="/history" className="inline-flex items-center text-sm text-muted-foreground hover:text-white transition-colors">
            <Music2 className="w-4 h-4 mr-2" /> {uiT.jobPage.backToGallery}
          </Link>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold mb-2 truncate max-w-full sm:max-w-2xl" dir="auto">{job.filename}</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <JobStatusBadge status={job.status} />
              <span>•</span>
              <span>{new Date(job.created_at).toLocaleString(lang === 'he' ? 'he-IL' : lang === 'ar' ? 'ar' : lang === 'ja' ? 'ja-JP' : lang === 'zh' ? 'zh-CN' : lang === 'ko' ? 'ko-KR' : 'en-US')}</span>
            </div>
          </div>
          
          {isDone && (chargeState === "free" || chargeState === "charged") && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm">
                  <a href={audioUrl} download>
                    <Music2 className="w-3.5 h-3.5 mr-1.5" />
                    {uiT.jobPage.noVocal}
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm">
                  <a href={videoUrl} download>
                    <FileVideo className="w-3.5 h-3.5 mr-1.5" />
                    {uiT.jobPage.karaokeVideo}
                  </a>
                </Button>
              </div>
              <ShareButtons title={job.filename} jobId={job.id} />
            </div>
          )}
          {isDone && chargeState === "pending" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
              <span>{uiT.jobPage.processingCharge}</span>
            </div>
          )}
          {isDone && chargeState === "insufficient" && (
            <div className="flex items-center gap-3">
              <Button variant="gradient" onClick={() => navigate("/")}>
                <CreditCard className="w-4 h-4 mr-2" />
                {uiT.jobPage.buyCreditsDownload}
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
              canRetry={job.status === 'error' || isJobStuck}
              isConfirming={isConfirming}
            />
            {isJobStuck && !job.error && (
              <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-200 text-sm w-full max-w-2xl text-center">
                <AlertTriangle className="w-5 h-5 inline-block ml-2 mb-0.5" />
                <strong>{uiT.jobPage.stuck}</strong>{" "}
                {uiT.jobPage.stuckRetry}
              </div>
            )}
            {job.error && (
              <div className="mt-8 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm w-full max-w-2xl">
                <strong>{uiT.jobPage.errorDetails}</strong> {job.error}
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
              initialBgStyle={(job as any).bg_style}
            />
          )}
        </div>
      )}

      {/* Charge pending — show loading */}
      {isDone && chargeState === "pending" && (
        <Card className="p-8 mb-6 flex flex-col items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-primary border-t-transparent mb-4" />
          <h3 className="font-semibold mb-1">{uiT.jobPage.verifyingCharge}</h3>
          <p className="text-sm text-muted-foreground">{uiT.jobPage.verifyingChargeDesc}</p>
        </Card>
      )}

      {isDone && chargeState === "error" && (
        <Card className="p-6 mb-6 border-destructive/30 bg-destructive/10">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-right">
            <CreditCard className="w-8 h-8 text-destructive shrink-0" />
            <div>
              <h3 className="font-semibold text-destructive mb-1">{uiT.jobPage.chargeError}</h3>
              <p className="text-sm text-muted-foreground">{uiT.jobPage.chargeErrorDesc}</p>
              {chargeError && <p className="text-xs text-muted-foreground/60 mt-1 font-mono" dir="ltr">{chargeError}</p>}
            </div>
            <Button variant="gradient" className="shrink-0" onClick={() => {
              if (id) attemptCharge(id);
            }}>
              {uiT.jobPage.retry}
            </Button>
          </div>
        </Card>
      )}

      {isDone && chargeState === "insufficient" && (
        <Card className="p-6 mb-6 border-destructive/30 bg-destructive/10">
          <div className="flex items-center gap-4">
            <CreditCard className="w-8 h-8 text-destructive shrink-0" />
            <div>
              <h3 className="font-semibold text-destructive mb-1">{uiT.jobPage.insufficientCredits}</h3>
              <p className="text-sm text-muted-foreground">{uiT.jobPage.insufficientCreditsDesc}</p>
            </div>
            <div className="flex gap-2 ml-auto shrink-0">
              <Button variant="outline" onClick={() => {
                if (id) attemptCharge(id);
              }}>
                {uiT.jobPage.retry}
              </Button>
              <Button variant="gradient" onClick={() => navigate("/")}>
                {uiT.jobPage.buyCredits}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Done state — video player + lyrics sidebar */}
      {isDone && (chargeState === "free" || chargeState === "charged") && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-primary/10">
              <VideoPlayer 
                src={videoUrl} 
                onTimeUpdate={setCurrentTime}
              />
            </div>

            <BackgroundChanger
              jobId={job.id}
              currentBgStyle={(job as any).bg_style || "aurora"}
            />

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
                      {uiT.jobPage.singNowTitle}
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      {uiT.jobPage.singNowDesc}
                    </div>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-primary/70 group-hover:text-primary group-hover:translate-x-[-4px] transition-all duration-300">
                  <span className="text-sm font-medium">{uiT.jobPage.start}</span>
                  <ArrowLeft className="w-5 h-5" />
                </div>
              </div>
            </button>

            {chargeState === "free" && (
              <button
                onClick={() => setShowPricing(true)}
                className="group relative w-full overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-r from-accent/15 via-yellow-500/10 to-accent/15 p-5 sm:p-6 transition-all duration-300 hover:border-accent/60 hover:shadow-[0_0_40px_rgba(234,179,8,0.25)] active:scale-[0.99]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/5 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-accent to-yellow-500 shadow-lg shadow-accent/30 group-hover:shadow-accent/50 group-hover:scale-105 transition-all duration-300">
                      <Coins className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-lg sm:text-xl font-display font-bold text-white group-hover:text-accent transition-colors">
                        {uiT.jobPage.buyCreditsTitle}
                      </div>
                      <div className="text-sm text-muted-foreground mt-0.5">
                        {uiT.jobPage.buyCreditsDesc}
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 text-accent/70 group-hover:text-accent group-hover:translate-x-[-4px] transition-all duration-300">
                    <span className="text-sm font-medium">{uiT.jobPage.buyNow}</span>
                    <ArrowLeft className="w-5 h-5" />
                  </div>
                </div>
              </button>
            )}

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Music2 className="w-5 h-5 text-accent" />
                {uiT.jobPage.trackDetails}
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block mb-1">{uiT.jobPage.statusLabel}</span>
                  <span className="text-green-400 font-medium">{uiT.jobPage.statusSuccess}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">{uiT.jobPage.wordsLabel}</span>
                  <span className="font-medium">{lyricsData?.words?.length ?? jobWords.length} {uiT.jobPage.wordsTranscribed}</span>
                </div>
                {chargeState === "free" && (
                  <div>
                    <span className="text-muted-foreground block mb-1">{uiT.jobPage.costLabel}</span>
                    <span className="text-green-400 font-medium flex items-center gap-1"><Coins className="w-3.5 h-3.5" /> {uiT.jobPage.freeUnder40}</span>
                  </div>
                )}
                {chargeState === "charged" && (
                  <div>
                    <span className="text-muted-foreground block mb-1">{uiT.jobPage.creditsUsed}</span>
                    <span className="font-medium flex items-center gap-1"><Coins className="w-3.5 h-3.5 text-accent" /> {creditsCharged} {uiT.jobPage.creditsUnit}</span>
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
                  {uiT.jobPage.lyricsTitle}
                </h3>
              </div>
              
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-2 scroll-smooth"
                style={{ scrollbarWidth: 'thin' }}
              >
                {!lyricsData?.words || lyricsData.words.length === 0 ? (
                  <div className="text-center text-muted-foreground py-12">
                    {uiT.jobPage.noVocalDetected}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-x-2 gap-y-3 leading-loose text-lg" dir="auto">
                    {lyricsData.words.map((w, i) => {
                      const isActive = currentTime >= w.start && currentTime <= w.end + 0.2;
                      const isPast = currentTime > w.end + 0.2;
                      
                      return (
                        <span 
                          key={i}
                          dir="auto"
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
      <PricingModal open={showPricing} onOpenChange={setShowPricing} />
    </div>
  );
}
