import { useKaraokeJobs, useRemoveJob } from "@/hooks/use-karaoke";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Music, ArrowRight, ArrowLeft, Trash2, Video, Loader2 } from "lucide-react";
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

      <div className="absolute top-0 inset-x-0 h-[340px] overflow-hidden -z-10 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&h=500&fit=crop&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-[0.22]"
        />
        <div className="absolute inset-0 bg-[#06060f]/70" />
        <div className="absolute inset-0 bg-gradient-to-br from-accent/15 via-transparent to-primary/8" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent from-40% via-background/70 to-background" />
      </div>

      <main className="flex-1 container mx-auto px-4 py-14 sm:px-6 lg:px-8">

        <div className="mb-12">
          <Link href="/">
            <button className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-6 group">
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              {t.history.backToHome}
            </button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-accent/20 border border-primary/20">
              <Music className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-display">{t.history.title}</h1>
          </div>
          <p className="text-muted-foreground mt-2 text-sm">
            {t.history.subtitle}
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : !jobs || jobs.length === 0 ? (
          <div className="glass-panel rounded-3xl p-10 sm:p-16 text-center border-dashed max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-2">{t.history.empty}</h3>
            <p className="text-muted-foreground text-sm mb-6">
              {t.history.emptySubtitle}
            </p>
            <Link href="/">
              <Button className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                {t.history.startCreating}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {jobs.map((job) => (
              <Card key={job.id} className="group hover:border-primary/50 transition-colors duration-300">
                <div className="p-4 sm:p-6 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <JobStatusBadge status={job.status} />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.preventDefault();
                        if (confirm(t.history.deleteSong)) removeJob.mutate(job.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <h4 className="font-semibold text-lg mb-1 truncate" title={job.filename} dir="auto">
                    {job.filename}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-6">
                    {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                  </p>

                  <div className="mt-auto pt-4 border-t border-white/5">
                    <Link href={`/job/${job.id}`}>
                      <Button
                        variant="ghost"
                        className="w-full justify-between group/btn text-primary hover:text-primary-foreground hover:bg-primary/20"
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
