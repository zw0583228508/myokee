import { useKaraokeJobs, useRemoveJob } from "@/hooks/use-karaoke";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Music, ArrowRight, ArrowLeft, Trash2, Video, Loader2, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { JobStatusBadge } from "@/components/karaoke/JobStatusBadge";
import { Button } from "@/components/ui/button";
import { useLang } from "@/contexts/LanguageContext";

export default function History() {
  const { t } = useLang();
  const { data: jobs, isLoading } = useKaraokeJobs();
  const removeJob = useRemoveJob();

  return (
    <div className="min-h-screen flex flex-col relative" dir={t.dir}>
      {/* Premium Hero Background */}
      <div className="absolute top-0 inset-x-0 h-[450px] overflow-hidden -z-10 pointer-events-none">
        <img
          src="/images/hero-bg.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-[#06060f]/60" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/15" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent from-40% via-background/70 to-background" />
        
        {/* Animated orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-accent/15 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-14 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-12">
          <Link href="/">
            <button className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              {t.history.backToHome}
            </button>
          </Link>
          <div className="flex items-center gap-4 mb-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 rounded-2xl blur-xl animate-pulse-glow" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/40 to-accent/30 border border-primary/30 shadow-lg shadow-primary/20">
                <Music className="w-7 h-7 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
                {t.history.title}
              </h1>
              <p className="text-muted-foreground mt-1 text-sm flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                {t.history.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <Loader2 className="w-10 h-10 text-primary animate-spin relative" />
            </div>
          </div>
        ) : !jobs || jobs.length === 0 ? (
          <div className="glass-panel rounded-3xl p-10 sm:p-16 text-center border-dashed max-w-lg mx-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center mx-auto mb-6 border border-primary/20">
                <Video className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t.history.empty}</h3>
              <p className="text-muted-foreground text-sm mb-8">
                {t.history.emptySubtitle}
              </p>
              <Link href="/">
                <Button className="gap-2 btn-glow bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold px-8 py-3 rounded-xl">
                  <ArrowLeft className="w-4 h-4" />
                  {t.history.startCreating}
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {jobs.map((job, index) => (
              <Card 
                key={job.id} 
                className="group card-premium relative overflow-hidden hover:border-primary/50 transition-all duration-500"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/10 group-hover:to-accent/5 transition-all duration-500" />
                
                <div className="p-5 sm:p-6 flex flex-col h-full relative">
                  <div className="flex justify-between items-start mb-4">
                    <JobStatusBadge status={job.status} />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-lg"
                      onClick={(e) => {
                        e.preventDefault();
                        if (confirm(t.history.deleteSong)) removeJob.mutate(job.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <h4 className="font-bold text-lg mb-1 truncate group-hover:text-primary transition-colors" title={job.filename} dir="auto">
                    {job.filename}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-6">
                    {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                  </p>

                  <div className="mt-auto pt-4 border-t border-white/5">
                    <Link href={`/job/${job.id}`}>
                      <Button
                        variant="ghost"
                        className="w-full justify-between group/btn text-primary hover:text-white hover:bg-primary/20 rounded-xl transition-all duration-300"
                      >
                        {job.status === "done" ? t.history.viewResults : t.history.viewProgress}
                        <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
