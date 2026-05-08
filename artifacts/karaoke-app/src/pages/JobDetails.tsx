import { useParams, Link, useLocation } from "wouter";
import { useKaraokeJob, useJobLyrics, useRetryJob, getDownloadUrls } from "@/hooks/use-karaoke";
import { getGetJobQueryKey } from "@workspace/api-client-react";
import { JobPipeline } from "@/components/karaoke/JobPipeline";
import { TranscriptEditor } from "@/components/karaoke/TranscriptEditor";
import { VideoPlayer } from "@/components/karaoke/VideoPlayer";
import { JobStatusBadge } from "@/components/karaoke/JobStatusBadge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Music2, FileVideo, AlertTriangle, Loader2, Mic, CreditCard,
  Coins, Sparkles, Crown, ChevronRight, Download,
} from "lucide-react";
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
import { useAuth } from "@/hooks/use-auth";

type ChargeState = "pending" | "free" | "charged" | "insufficient" | "error";

export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { data: job, isLoading, error } = useKaraokeJob(id || "");
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
  const [showPremiumGate, setShowPremiumGate] = useState(false);
  const [videoCacheBust, setVideoCacheBust] = useState(0);
  const { data: authData } = useAuth();
  const isPremium = !!authData?.user?.isPremium;

  const isJobStuck = useMemo(() => {
    if (!job) return false;
    const activeStatuses = new Set(["separating", "transcribing", "rendering", "pending", "queued"]);
    if (!activeStatuses.has(job.status)) return false;
    const updatedAt = new Date(job.updated_at).getTime();
    if (isNaN(updatedAt)) return false;
    return (Date.now() - updatedAt) / 60000 > 5;
  }, [job?.status, job?.updated_at]);

  useEffect(() => {
    if (job?.status && job.status !== "awaiting_review") setIsConfirming(false);
  }, [job?.status]);

  const urlSearch       = useMemo(() => new URLSearchParams(window.location.search), []);
  const challengerName  = urlSearch.get("challenger") ?? undefined;
  const challengerScore = urlSearch.get("score") ? Number(urlSearch.get("score")) : undefined;

  const handleRetry = () => retryJob.mutate();

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!job) return;
    const prev = prevStatusRef.current;
    const curr = job.status as string;
    if (!prev || prev === curr) { prevStatusRef.current = curr; return; }
    prevStatusRef.current = curr;

    if (curr === "awaiting_review") {
      toast({ title: uiT.jobPage.toastReviewTitle, description: `${job.filename} — ${uiT.jobPage.toastReviewDesc}` });
      if ("Notification" in window && Notification.permission === "granted") {
        try { new Notification(uiT.jobPage.notifReviewTitle, {
          body: `${job.filename} — ${uiT.jobPage.notifReviewBody}`, icon: "/favicon.svg", tag: `job-awaiting-${job.id}`,
        }); } catch {}
      }
    } else if (curr === "done") {
      setVideoCacheBust(Date.now());
      toast({ title: uiT.jobPage.toastDoneTitle, description: `${job.filename} — ${uiT.jobPage.toastDoneDesc}` });
      if ("Notification" in window && Notification.permission === "granted") {
        try { new Notification(uiT.jobPage.notifDoneTitle, {
          body: `${job.filename} — ${uiT.jobPage.notifDoneBody}`, icon: "/favicon.svg", tag: `job-done-${job.id}`,
        }); } catch {}
      }
    }
  }, [job?.status]);

  useEffect(() => {
    if (!lyricsData?.words || !scrollRef.current) return;
    const activeWordIndex = lyricsData.words.findIndex(w => currentTime >= w.start && currentTime <= w.end + 0.5);
    if (activeWordIndex !== -1) {
      const container = scrollRef.current;
      const wordEl = container.getElementsByClassName("lyric-word")[activeWordIndex] as HTMLElement | undefined;
      if (wordEl) {
        const target = wordEl.offsetTop - container.clientHeight / 2 + wordEl.clientHeight / 2;
        container.scrollTo({ top: target, behavior: "smooth" });
      }
    }
  }, [currentTime, lyricsData?.words]);

  const attemptCharge = async (jobId: string, durationSeconds?: number) => {
    if (chargingInProgressRef.current) return;
    chargingInProgressRef.current = true;
    chargeTriggeredRef.current = true;
    setChargeState("pending");

    if (!durationSeconds) durationSeconds = (job as any)?.duration_seconds;

    const MAX_RETRIES = 3;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (attempt > 0) await new Promise(r => setTimeout(r, attempt * 1500));

      try {
        const accessRes = await fetch(apiUrl(`/api/jobs/${jobId}/access`), authFetchOptions());
        if (accessRes.ok) {
          const accessData = await accessRes.json();
          if (accessData.access && accessData.creditsCharged != null && accessData.creditsCharged >= 0) {
            setChargeState(accessData.creditsCharged === 0 ? "free" : "charged");
            setCreditsCharged(accessData.creditsCharged);
            chargingInProgressRef.current = false;
            return;
          }
        }
      } catch (e) { console.warn("[Charge] Access check error:", e); }

      try {
        const res = await fetch(apiUrl(`/api/jobs/${jobId}/charge`), authFetchOptions({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(durationSeconds ? { durationSeconds } : {}),
        }));
        const data = await res.json();
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
        if (data.error) { setChargeError(`${res.status}: ${data.error}`); continue; }
      } catch (err: any) {
        setChargeError(`Network: ${err.message}`);
        continue;
      }
    }

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
    attemptCharge(id, dur);
  }, [job?.status, id]);

  useEffect(() => {
    if (chargeState !== "insufficient" || !id) return;
    const handler = () => {
      if (document.visibilityState === "visible" && chargeState === "insufficient") attemptCharge(id);
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [chargeState, id]);

  const handleLyricsConfirmed = () =>
    queryClient.invalidateQueries({ queryKey: getGetJobQueryKey(id || "") });

  /* ────────────────── Loading / Not-found states ────────────────── */
  if (isLoading) {
    return (
      <div className="relative min-h-[80vh] flex flex-col items-center justify-center bg-[var(--ds-bg-app)]">
        <div className="absolute inset-0 ds-bg-aurora opacity-40 -z-10" />
        <div className="ds-icon-orb w-20 h-20 rounded-3xl mb-6">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        </div>
        <p className="text-xl font-display animate-pulse ds-grad-text">{uiT.jobPage.loading}</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="relative min-h-[80vh] flex flex-col items-center justify-center bg-[var(--ds-bg-app)] px-4 text-center">
        <div className="absolute inset-0 ds-bg-aurora opacity-30 -z-10" />
        <div className="ds-icon-orb w-20 h-20 rounded-3xl mb-6" style={{ background: "linear-gradient(135deg,#F87171,#DC2626)" }}>
          <AlertTriangle className="w-10 h-10 text-white" />
        </div>
        <h2 className="ds-page-title font-bold mb-3 text-white">{uiT.jobPage.notFound}</h2>
        <p className="text-white/55 mb-8 max-w-md">{uiT.jobPage.notFoundDesc}</p>
        <Link href="/">
          <button className="ds-btn ds-btn-primary px-7 py-3"><ArrowLeft className="w-4 h-4" /> {uiT.jobPage.backToStudio}</button>
        </Link>
      </div>
    );
  }

  const { videoUrl, audioUrl } = getDownloadUrls(job.id, videoCacheBust || undefined);
  const isDone = job.status === "done";
  const isAwaitingReview = job.status === "awaiting_review";
  const jobWords = (job.words as any[]) || [];

  const localeFor = (l: string) =>
    l === "he" ? "he-IL" : l === "ar" ? "ar" : l === "ja" ? "ja-JP" : l === "zh" ? "zh-CN" : l === "ko" ? "ko-KR" : "en-US";

  return (
    <div className="relative min-h-screen bg-[var(--ds-bg-app)]">
      {/* Cinematic page background */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 ds-bg-galaxy" />
        <div className="absolute inset-0 ds-bg-aurora opacity-40" />
        <div className="ds-orb ds-orb-violet absolute -top-32 -left-32 w-[480px] h-[480px] opacity-50" />
        <div className="ds-orb ds-orb-cyan   absolute top-1/3 -right-32 w-[420px] h-[420px] opacity-40" style={{ animationDelay: "2s" }} />
        <div className="ds-orb ds-orb-pink   absolute bottom-0 left-1/4 w-[360px] h-[360px] opacity-30" style={{ animationDelay: "4s" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050510]/40 via-transparent to-[#050510]" />
      </div>

      <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:py-10">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-3 mb-6 text-sm">
          <Link href="/" className="inline-flex items-center text-white/40 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> {uiT.jobPage.backToStudio}
          </Link>
          <span className="text-white/15">·</span>
          <Link href="/history" className="inline-flex items-center text-white/40 hover:text-white transition-colors">
            <Music2 className="w-4 h-4 mr-1.5" /> {uiT.jobPage.backToGallery}
          </Link>
        </div>

        {/* Header card — title + status + actions */}
        <div className="ds-card-feature relative p-5 sm:p-7 mb-8 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-violet-500/15 blur-[80px] pointer-events-none" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="ds-icon-orb w-11 h-11 rounded-xl shrink-0">
                  <Music2 className="w-5 h-5 text-white" />
                </div>
                <h1 className="ds-section-title font-bold truncate text-white" dir="auto">{job.filename}</h1>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/45 ps-14">
                <JobStatusBadge status={job.status} />
                <span className="opacity-50">·</span>
                <span>{new Date(job.created_at).toLocaleString(localeFor(lang))}</span>
              </div>
            </div>

            {isDone && (chargeState === "free" || chargeState === "charged") && (
              <div className="flex flex-col items-stretch md:items-end gap-3 shrink-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <a href={audioUrl} download className="ds-btn ds-btn-secondary px-4 py-2.5 text-sm">
                    <Download className="w-3.5 h-3.5" /> {uiT.jobPage.noVocal}
                  </a>
                  <a href={videoUrl} download className="ds-btn ds-btn-secondary px-4 py-2.5 text-sm">
                    <FileVideo className="w-3.5 h-3.5" /> {uiT.jobPage.karaokeVideo}
                  </a>
                </div>
                <ShareButtons title={job.filename} jobId={job.id} />
              </div>
            )}
            {isDone && chargeState === "pending" && (
              <div className="flex items-center gap-2 text-sm text-white/55 shrink-0">
                <Loader2 className="w-4 h-4 animate-spin text-violet-300" />
                <span>{uiT.jobPage.processingCharge}</span>
              </div>
            )}
            {isDone && chargeState === "insufficient" && (
              <button onClick={() => navigate("/")} className="ds-btn ds-btn-premium px-5 py-2.5 text-sm shrink-0">
                <CreditCard className="w-4 h-4" /> {uiT.jobPage.buyCreditsDownload}
              </button>
            )}
          </div>
        </div>

        {/* ── Processing / awaiting review ─────────────────────── */}
        {!isDone && (
          <div className="space-y-8">
            <div className="ds-card p-6 sm:p-10 md:p-14 flex flex-col items-center justify-center min-h-[260px]">
              <JobPipeline
                status={job.status}
                progress={job.progress}
                onRetry={handleRetry}
                isRetrying={retryJob.isPending}
                canRetry={job.status === "error" || isJobStuck}
                isConfirming={isConfirming}
              />
              {isJobStuck && !job.error && (
                <div className="mt-8 p-4 rounded-xl bg-yellow-500/10 border border-yellow-400/25 text-yellow-200 text-sm w-full max-w-2xl text-center">
                  <AlertTriangle className="w-5 h-5 inline-block ml-2 -mt-0.5" />
                  <strong>{uiT.jobPage.stuck}</strong> {uiT.jobPage.stuckRetry}
                </div>
              )}
              {job.error && (
                <div className="mt-8 p-4 rounded-xl bg-rose-500/10 border border-rose-400/25 text-rose-200 text-sm w-full max-w-2xl">
                  <strong>{uiT.jobPage.errorDetails}</strong> {job.error}
                </div>
              )}
            </div>

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

        {/* Charge pending */}
        {isDone && chargeState === "pending" && (
          <div className="ds-card p-8 mb-6 flex flex-col items-center justify-center min-h-[200px]">
            <Loader2 className="w-8 h-8 text-violet-300 animate-spin mb-4" />
            <h3 className="font-semibold text-white mb-1">{uiT.jobPage.verifyingCharge}</h3>
            <p className="text-sm text-white/45">{uiT.jobPage.verifyingChargeDesc}</p>
          </div>
        )}

        {isDone && chargeState === "error" && (
          <div className="ds-card border-rose-400/30 bg-rose-500/8 p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-start">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0">
                <CreditCard className="w-6 h-6 text-rose-300" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-rose-200 mb-1">{uiT.jobPage.chargeError}</h3>
                <p className="text-sm text-white/55">{uiT.jobPage.chargeErrorDesc}</p>
                {chargeError && <p className="text-xs text-white/30 mt-1 font-mono" dir="ltr">{chargeError}</p>}
              </div>
              <button className="ds-btn ds-btn-primary px-5 py-2.5 text-sm shrink-0" onClick={() => id && attemptCharge(id)}>
                {uiT.jobPage.retry}
              </button>
            </div>
          </div>
        )}

        {isDone && chargeState === "insufficient" && (
          <div className="ds-card border-rose-400/30 bg-rose-500/8 p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0">
                <CreditCard className="w-6 h-6 text-rose-300" />
              </div>
              <div className="flex-1 text-center sm:text-start">
                <h3 className="font-semibold text-rose-200 mb-1">{uiT.jobPage.insufficientCredits}</h3>
                <p className="text-sm text-white/55">{uiT.jobPage.insufficientCreditsDesc}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button className="ds-btn ds-btn-secondary px-4 py-2.5 text-sm" onClick={() => id && attemptCharge(id)}>
                  {uiT.jobPage.retry}
                </button>
                <button className="ds-btn ds-btn-premium px-5 py-2.5 text-sm" onClick={() => navigate("/")}>
                  {uiT.jobPage.buyCredits}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── DONE state — player + lyrics sidebar ─────────────────────── */}
        {isDone && (chargeState === "free" || chargeState === "charged") && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Player card */}
              <div className="relative rounded-[var(--ds-radius-2xl)] overflow-hidden border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,.5)]">
                <div className="absolute -inset-px rounded-[inherit] pointer-events-none opacity-60" style={{ background: "var(--ds-grad-primary)" }} />
                <div className="relative">
                  <VideoPlayer src={videoUrl} onTimeUpdate={setCurrentTime} />
                </div>
              </div>

              <BackgroundChanger jobId={job.id} currentBgStyle={(job as any).bg_style || "aurora"} />

              {/* Sing Now CTA */}
              <button
                onClick={() => isPremium ? setSingMode(true) : setShowPremiumGate(true)}
                className="group relative w-full overflow-hidden rounded-[var(--ds-radius-2xl)] p-5 sm:p-6 text-start ds-card-feature transition-transform active:scale-[0.99]"
              >
                <div className="absolute inset-0 opacity-40 group-hover:opacity-70 transition-opacity duration-500" style={{ background: "var(--ds-grad-primary)" }} />
                <div className="absolute inset-[1px] rounded-[inherit]" style={{ background: "rgba(5,5,16,.85)", backdropFilter: "blur(20px)" }} />
                <div className="ds-orb ds-orb-violet absolute -top-12 -right-12 w-44 h-44 opacity-60" />
                <div className="ds-orb ds-orb-pink absolute -bottom-10 -left-10 w-36 h-36 opacity-40" style={{ animationDelay: "2s" }} />
                <div className="relative flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="ds-icon-orb w-14 h-14 sm:w-16 sm:h-16 rounded-2xl shrink-0">
                      <Mic className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-lg sm:text-xl font-bold text-white truncate">{uiT.jobPage.singNowTitle}</div>
                      <div className="text-sm text-white/55 truncate">{uiT.jobPage.singNowDesc}</div>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 text-cyan-300 group-hover:translate-x-1 transition-transform shrink-0">
                    <span className="text-sm font-semibold">{uiT.jobPage.start}</span>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </button>

              {/* Buy credits CTA (free track only) */}
              {chargeState === "free" && (
                <button
                  onClick={() => setShowPricing(true)}
                  className="group relative w-full overflow-hidden rounded-[var(--ds-radius-2xl)] p-5 sm:p-6 text-start ds-card transition-transform active:scale-[0.99]"
                  style={{ borderColor: "rgba(250,204,21,.3)" }}
                >
                  <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-amber-400/15 blur-[60px]" />
                  <div className="relative flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0"
                           style={{ background: "linear-gradient(135deg,#FACC15,#F59E0B)", boxShadow: "0 0 40px rgba(250,204,21,.45)" }}>
                        <Coins className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-lg sm:text-xl font-bold text-white truncate">{uiT.jobPage.buyCreditsTitle}</div>
                        <div className="text-sm text-white/55 truncate">{uiT.jobPage.buyCreditsDesc}</div>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 text-amber-300 group-hover:translate-x-1 transition-transform shrink-0">
                      <span className="text-sm font-semibold">{uiT.jobPage.buyNow}</span>
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </button>
              )}

              {/* Track details */}
              <div className="ds-card p-6">
                <h3 className="text-base font-semibold mb-5 flex items-center gap-2 text-white">
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  {uiT.jobPage.trackDetails}
                </h3>
                <div className="grid grid-cols-2 gap-5 text-sm">
                  <div>
                    <span className="text-white/35 block mb-1 text-xs uppercase tracking-wider">{uiT.jobPage.statusLabel}</span>
                    <span className="text-emerald-300 font-semibold">{uiT.jobPage.statusSuccess}</span>
                  </div>
                  <div>
                    <span className="text-white/35 block mb-1 text-xs uppercase tracking-wider">{uiT.jobPage.wordsLabel}</span>
                    <span className="text-white font-semibold">{lyricsData?.words?.length ?? jobWords.length} {uiT.jobPage.wordsTranscribed}</span>
                  </div>
                  {chargeState === "free" && (
                    <div>
                      <span className="text-white/35 block mb-1 text-xs uppercase tracking-wider">{uiT.jobPage.costLabel}</span>
                      <span className="text-emerald-300 font-semibold flex items-center gap-1.5"><Coins className="w-3.5 h-3.5" /> {uiT.jobPage.freeUnder40}</span>
                    </div>
                  )}
                  {chargeState === "charged" && (
                    <div>
                      <span className="text-white/35 block mb-1 text-xs uppercase tracking-wider">{uiT.jobPage.creditsUsed}</span>
                      <span className="text-amber-300 font-semibold flex items-center gap-1.5"><Coins className="w-3.5 h-3.5" /> {creditsCharged} {uiT.jobPage.creditsUnit}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Lyrics sidebar */}
            <div className="lg:col-span-1 h-[400px] lg:h-[640px] flex flex-col">
              <div className="ds-card flex-1 flex flex-col overflow-hidden p-0">
                <div className="p-4 border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-md">
                  <h3 className="font-display font-semibold flex items-center gap-2 text-white">
                    <Mic className="w-4 h-4 text-violet-300" />
                    {uiT.jobPage.lyricsTitle}
                  </h3>
                </div>
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-2 scroll-smooth" style={{ scrollbarWidth: "thin" }}>
                  {!lyricsData?.words || lyricsData.words.length === 0 ? (
                    <div className="text-center text-white/30 py-12">{uiT.jobPage.noVocalDetected}</div>
                  ) : (
                    <div className="flex flex-wrap gap-x-2 gap-y-3 leading-loose text-lg" dir="auto">
                      {lyricsData.words.map((w, i) => {
                        const isActive = currentTime >= w.start && currentTime <= w.end + 0.2;
                        const isPast = currentTime > w.end + 0.2;
                        return (
                          <span
                            key={i}
                            dir="auto"
                            className={`lyric-word transition-all duration-200 ${
                              isActive ? "font-bold scale-110 ds-grad-text drop-shadow-[0_0_10px_rgba(34,211,238,.7)]" :
                              isPast ? "text-white/85" : "text-white/30"
                            }`}
                          >
                            {w.word}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sing-now overlay */}
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
            isPremium={isPremium}
          />
        )}
      </div>

      <PricingModal open={showPricing} onOpenChange={setShowPricing} />

      {/* Premium gate */}
      {showPremiumGate && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          onClick={() => setShowPremiumGate(false)}
          role="dialog" aria-modal="true"
        >
          <div
            className="relative w-full max-w-md ds-modal-shell p-8 text-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 opacity-50 pointer-events-none" style={{ background: "var(--ds-grad-primary)" }} />
            <div className="absolute inset-[1px] rounded-[inherit]" style={{ background: "rgba(8,8,18,.92)", backdropFilter: "blur(24px)" }} />
            <div className="ds-orb ds-orb-violet absolute -top-16 -right-16 w-48 h-48" />
            <div className="ds-orb ds-orb-pink   absolute -bottom-10 -left-10 w-36 h-36" style={{ animationDelay: "2s" }} />
            <div className="relative">
              <div className="mx-auto ds-icon-orb w-16 h-16 rounded-2xl mb-5" style={{ background: "linear-gradient(135deg,#FACC15,#F59E0B)", boxShadow: "0 0 40px rgba(250,204,21,.5)" }}>
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h3 className="ds-section-title font-bold text-white mb-3">{uiT.sing.premiumRequired}</h3>
              <p className="text-white/65 text-sm leading-relaxed mb-7">{uiT.sing.premiumRequiredDesc}</p>
              <div className="flex flex-col gap-2.5">
                <Button
                  size="lg"
                  className="w-full ds-btn ds-btn-premium font-semibold"
                  onClick={() => { setShowPremiumGate(false); setShowPricing(true); }}
                >
                  <CreditCard className="w-4 h-4" /> {uiT.sing.upgrade}
                </Button>
                <Button
                  size="lg" variant="ghost"
                  className="w-full text-white/60 hover:text-white hover:bg-white/5"
                  onClick={() => setShowPremiumGate(false)}
                >
                  {uiT.sing.maybeLater}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
