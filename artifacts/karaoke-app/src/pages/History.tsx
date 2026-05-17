import { useKaraokeJobs, useRemoveJob } from "@/hooks/use-karaoke";
import { formatDistanceToNow } from "date-fns";
import { Music, ArrowRight, ArrowLeft, Trash2, Video, Loader2, Sparkles, Mic } from "lucide-react";
import { Link } from "wouter";
import { useNoIndex } from "@/hooks/use-noindex";
import { JobStatusBadge } from "@/components/karaoke/JobStatusBadge";
import { useLang } from "@/contexts/LanguageContext";
import { DEMO_JOBS, isDemo } from "@/lib/demoData";

export default function History() {
  useNoIndex();
  const { t, lang } = useLang();
  const isRtl = t.dir === "rtl";
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;
  const { data: realJobs, isLoading } = useKaraokeJobs();
  const removeJob = useRemoveJob();
  // Show demo songs when there's no real history yet, so the page feels
  // populated for first-time visitors. Demo cards aren't deletable / clickable.
  const jobs = (!isLoading && (realJobs?.length ?? 0) === 0) ? DEMO_JOBS as any : realJobs;

  return (
    <div className="min-h-screen flex flex-col relative bg-[var(--ds-bg-app)]" dir={t.dir}>
      {/* Cinematic header background */}
      <div className="absolute top-0 inset-x-0 h-[480px] overflow-hidden -z-10 pointer-events-none">
        <div className="absolute inset-0 ds-bg-galaxy" />
        <div className="absolute inset-0 ds-bg-aurora opacity-50" />
        <div className="ds-orb ds-orb-violet absolute -top-32 -left-32 w-[440px] h-[440px] opacity-50" />
        <div className="ds-orb ds-orb-cyan absolute top-0 -right-32 w-[420px] h-[420px] opacity-40" style={{ animationDelay: "2s" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050510]/30 via-transparent to-[#050510]" />
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-12 sm:py-16 sm:px-6 lg:px-8">
        <div className="mb-12 ds-reveal">
          <Link href="/">
            <button className="inline-flex items-center gap-2 text-sm text-white/45 hover:text-white transition-colors mb-7 group">
              <BackArrow className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              {t.history.backToHome}
            </button>
          </Link>
          <div className="flex items-center gap-4 mb-3">
            <div className="ds-icon-orb h-14 w-14 rounded-2xl">
              <Music className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="ds-page-title font-bold text-white">{t.history.title}</h1>
              <p className="text-white/55 mt-1 text-sm sm:text-base">{t.history.subtitle}</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-10 h-10 text-violet-300 animate-spin" />
          </div>
        ) : !jobs || jobs.length === 0 ? (
          <div className="ds-card-feature relative max-w-lg mx-auto p-12 text-center overflow-hidden ds-reveal">
            <div className="ds-orb ds-orb-violet absolute -top-12 -right-12 w-48 h-48 opacity-50" />
            <div className="relative">
              <div className="mx-auto ds-icon-orb w-16 h-16 rounded-2xl mb-5">
                <Video className="w-8 h-8 text-white" />
              </div>
              <h3 className="ds-section-title font-bold text-white mb-2">{t.history.empty}</h3>
              <p className="text-white/55 text-sm mb-8">{t.history.emptySubtitle}</p>
              <Link href="/upload">
                <button className="ds-btn ds-btn-primary px-7 py-3">
                  <Mic className="w-4 h-4" />
                  {t.history.startCreating}
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {jobs.map((job: any, i: number) => (
              <div
                key={job.id}
                className="ds-card group relative p-5 sm:p-6 flex flex-col h-full ds-reveal overflow-hidden hover:border-white/15 transition-all duration-500"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-violet-500/10 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <JobStatusBadge status={job.status} />
                    <button
                      onClick={(e) => { e.preventDefault(); if (isDemo(job)) return; if (confirm(t.history.deleteSong)) removeJob.mutate(job.id); }}
                      disabled={isDemo(job)}
                      className="h-8 w-8 rounded-full text-white/30 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center disabled:hidden"
                      aria-label={t.history.deleteSong}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-start gap-3 mb-1">
                    <div className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Music className="w-4 h-4 text-violet-300" />
                    </div>
                    <h4 className="font-semibold text-base sm:text-lg text-white truncate flex-1" title={job.filename} dir="auto">
                      {job.filename}
                    </h4>
                  </div>
                  <p className="text-xs text-white/40 mb-6 ps-12">
                    {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                  </p>

                  <div className="mt-auto pt-4 border-t border-white/[0.06]">
                    {isDemo(job) ? (
                      <div className="w-full flex items-center justify-between text-sm font-semibold text-white/30 px-2 py-2 cursor-default">
                        <span className="inline-flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          {job.status === "done" ? t.history.viewResults : t.history.viewProgress}
                        </span>
                      </div>
                    ) : (
                      <Link href={`/job/${job.id}`}>
                        <button className="w-full flex items-center justify-between text-sm font-semibold text-violet-300 hover:text-white transition-colors group/btn px-2 py-2">
                          <span className="inline-flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            {job.status === "done" ? t.history.viewResults : t.history.viewProgress}
                          </span>
                          {isRtl
                            ? <ArrowLeft className="w-4 h-4 transition-transform group-hover/btn:-translate-x-1" />
                            : <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />}
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
