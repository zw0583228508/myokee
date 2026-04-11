import { useKaraokeJobs, useRemoveJob } from "@/hooks/use-karaoke";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Music, ArrowRight, ArrowLeft, Trash2, Video, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useNoIndex } from "@/hooks/use-noindex";
import { JobStatusBadge } from "@/components/karaoke/JobStatusBadge";
import { Button } from "@/components/ui/button";
import { useLang } from "@/contexts/LanguageContext";

export default function History() {
  useNoIndex();
  const { t } = useLang();
  const { data: jobs, isLoading } = useKaraokeJobs();
  const removeJob = useRemoveJob();

  return (
    <div className="min-h-screen flex flex-col relative" dir={t.dir}>

      <div className="absolute top-0 inset-x-0 h-[380px] overflow-hidden -z-10 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&h=500&fit=crop&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-[0.18]"
          style={{ filter: "saturate(0.6) brightness(0.5)" }}
        />
        <div className="absolute inset-0 bg-[#040410]/60" />
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-primary/6" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent from-30% via-background/70 to-background" />
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-14 sm:px-6 lg:px-8">

        <div className="mb-12">
          <Link href="/">
            <button className="inline-flex items-center gap-2 text-sm text-white/30 hover:text-white/70 transition-colors mb-6 group">
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              {t.history.backToHome}
            </button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-accent/15 border border-primary/15 shadow-lg shadow-primary/10">
              <Music className="w-6 h-6 text-primary drop-shadow-[0_0_8px_rgba(147,51,234,0.5)]" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-display">{t.history.title}</h1>
          </div>
          <p className="text-white/30 mt-2 text-sm">
            {t.history.subtitle}
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : !jobs || jobs.length === 0 ? (
          <div className="glass-card rounded-3xl p-10 sm:p-16 text-center border-dashed max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-xl font-medium mb-2">{t.history.empty}</h3>
            <p className="text-white/30 text-sm mb-6">
              {t.history.emptySubtitle}
            </p>
            <Link href="/">
              <Button className="btn-primary gap-2 px-6 py-2.5 rounded-xl text-sm text-white">
                <ArrowLeft className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{t.history.startCreating}</span>
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {jobs.map((job) => (
              <div key={job.id} className="glass-card group hover:border-primary/25 transition-all duration-500 card-hover-glow rounded-2xl">
                <div className="p-4 sm:p-6 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <JobStatusBadge status={job.status} />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white/20 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                      onClick={(e) => {
                        e.preventDefault();
                        if (confirm(t.history.deleteSong)) removeJob.mutate(job.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <h4 className="font-semibold text-lg mb-1 truncate text-white/90" title={job.filename} dir="auto">
                    {job.filename}
                  </h4>
                  <p className="text-sm text-white/25 mb-6">
                    {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                  </p>

                  <div className="mt-auto pt-4 border-t border-white/[0.04]">
                    <Link href={`/job/${job.id}`}>
                      <Button
                        variant="ghost"
                        className="w-full justify-between group/btn text-primary hover:text-primary-foreground hover:bg-primary/15"
                      >
                        {job.status === "done" ? t.history.viewResults : t.history.viewProgress}
                        <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </Link>
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
