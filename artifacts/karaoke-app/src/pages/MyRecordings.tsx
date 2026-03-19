import { Link } from "wouter";
import { ArrowLeft, Mic2, Loader2, Play, Pause, Trash2, Download, Music2, Cloud, Sparkles, Star } from "lucide-react";
import { useRecordings, useDeleteRecording } from "@/hooks/use-recordings";
import { useLang } from "@/contexts/LanguageContext";
import { useMyPerformances } from "@/hooks/use-performances";
import { apiUrl } from "@/lib/api";
import { useState, useRef } from "react";

function formatDate(iso: string, lang: string) {
  return new Date(iso).toLocaleDateString(
    lang === "he" ? "he-IL" : lang === "ar" ? "ar-SA" : lang,
    { day: "numeric", month: "short", year: "numeric" }
  );
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const LABELS: Record<string, Record<string, string>> = {
  he: {
    title: "ההקלטות שלי",
    subtitle: "כל ההקלטות והביצועים שלך - במקום אחד",
    back: "חזרה לדף הבית",
    empty: "אין הקלטות עדיין",
    emptyDesc: "שיר שיר ושמור בענן - וזה יופיע כאן",
    goSing: "לך לשיר",
    recordings: "הקלטות בענן",
    performances: "הביצועים שלי",
    play: "נגן",
    stop: "עצור",
    download: "הורד",
    delete: "מחק",
    confirmDelete: "למחוק את ההקלטה?",
    score: "ציון",
    noPerf: "אין ביצועים עדיין",
  },
  en: {
    title: "My Recordings",
    subtitle: "All your recordings and performances - in one place",
    back: "Back to home",
    empty: "No recordings yet",
    emptyDesc: "Sing a song and save to cloud - it will appear here",
    goSing: "Go sing",
    recordings: "Cloud Recordings",
    performances: "My Performances",
    play: "Play",
    stop: "Stop",
    download: "Download",
    delete: "Delete",
    confirmDelete: "Delete this recording?",
    score: "Score",
    noPerf: "No performances yet",
  },
  ar: {
    title: "تسجيلاتي",
    subtitle: "جميع تسجيلاتك وأدائك - في مكان واحد",
    back: "العودة إلى الرئيسية",
    empty: "لا توجد تسجيلات بعد",
    emptyDesc: "غني أغنية واحفظ في السحابة - ستظهر هنا",
    goSing: "اذهب للغناء",
    recordings: "تسجيلات السحابة",
    performances: "أدائي",
    play: "تشغيل",
    stop: "إيقاف",
    download: "تحميل",
    delete: "حذف",
    confirmDelete: "حذف هذا التسجيل؟",
    score: "النتيجة",
    noPerf: "لا يوجد أداء بعد",
  },
};

function getLabels(lang: string) {
  return LABELS[lang] || LABELS.en;
}

export default function MyRecordings() {
  const { t, lang } = useLang();
  const l = getLabels(lang);
  const { data: recordings, isLoading: loadingRec } = useRecordings();
  const { data: performances, isLoading: loadingPerf } = useMyPerformances();
  const deleteRec = useDeleteRecording();
  const [tab, setTab] = useState<"recordings" | "performances">("recordings");
  const [playingId, setPlayingId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlay = (objectPath: string, id: number) => {
    if (playingId === id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    const url = apiUrl(`/api/storage${objectPath}`);
    const audio = new Audio(url);
    audio.onended = () => setPlayingId(null);
    audio.play().catch(() => {});
    audioRef.current = audio;
    setPlayingId(id);
  };

  const handleDelete = (id: number) => {
    if (confirm(l.confirmDelete)) {
      deleteRec.mutate(id);
      if (playingId === id) {
        audioRef.current?.pause();
        setPlayingId(null);
      }
    }
  };

  const handleDownload = (objectPath: string, fileName: string) => {
    const url = apiUrl(`/api/storage${objectPath}`);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
  };

  return (
    <div className="min-h-screen flex flex-col" dir={t.dir}>
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden py-16 sm:py-24 text-center">
        <img
          src="/images/upload-bg.jpg"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          alt=""
        />
        <div className="absolute inset-0 bg-[#06060f]/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background" />
        
        {/* Animated orbs */}
        <div className="absolute top-10 left-1/3 w-80 h-80 bg-cyan-500/20 rounded-full blur-[100px] animate-pulse-glow" />
        <div className="absolute bottom-10 right-1/3 w-64 h-64 bg-primary/15 rounded-full blur-[80px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

        <div className="relative z-10">
          <Link href="/">
            <button className="group inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-primary transition-colors mb-8">
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />{l.back}
            </button>
          </Link>
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/30 rounded-2xl blur-xl animate-pulse-glow" />
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-primary/20 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Mic2 className="w-7 h-7 text-cyan-400" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
              {l.title}
            </h1>
          </div>
          <p className="text-white/40 text-sm flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            {l.subtitle}
          </p>
        </div>
      </div>

      {/* Premium Tab Switcher */}
      <div className="w-full max-w-2xl mx-auto px-4 -mt-6 mb-8 relative z-20">
        <div className="flex gap-2 p-1.5 rounded-2xl glass-panel border border-white/10">
          <button
            onClick={() => setTab("recordings")}
            className={`flex-1 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
              tab === "recordings"
                ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30"
                : "text-white/40 hover:text-white/70 hover:bg-white/5"
            }`}
          >
            <Cloud className="w-4 h-4 inline mr-2" />{l.recordings}
          </button>
          <button
            onClick={() => setTab("performances")}
            className={`flex-1 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
              tab === "performances"
                ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30"
                : "text-white/40 hover:text-white/70 hover:bg-white/5"
            }`}
          >
            <Music2 className="w-4 h-4 inline mr-2" />{l.performances}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="w-full max-w-2xl mx-auto px-4 flex-1 pb-20">
        {tab === "recordings" && (
          <>
            {loadingRec ? (
              <div className="flex items-center justify-center py-24">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                  <Loader2 className="w-10 h-10 text-primary animate-spin relative" />
                </div>
              </div>
            ) : !recordings?.length ? (
              <div className="text-center py-24 space-y-5">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse-glow" />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center border border-primary/20">
                    <Cloud className="w-10 h-10 text-white/30" />
                  </div>
                </div>
                <p className="text-white/40 text-sm font-medium">{l.empty}</p>
                <p className="text-white/25 text-xs">{l.emptyDesc}</p>
                <Link href="/">
                  <button className="inline-flex items-center gap-2 mt-4 px-8 py-3 rounded-xl text-white text-sm font-bold transition-all hover:scale-105 btn-glow bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/30">
                    <Mic2 className="w-4 h-4" />{l.goSing}
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recordings.map((rec, index) => (
                  <div
                    key={rec.id}
                    className="group flex items-center gap-4 px-5 py-4 rounded-2xl glass-panel border border-white/10 hover:border-primary/30 transition-all duration-300"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <button
                      onClick={() => handlePlay(rec.object_path, rec.id)}
                      className={`relative w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                        playingId === rec.id
                          ? "bg-gradient-to-br from-red-500/30 to-red-600/20 text-red-400 border border-red-500/40"
                          : "bg-gradient-to-br from-primary/20 to-accent/10 text-primary border border-primary/30 hover:border-primary/50 group-hover:shadow-lg group-hover:shadow-primary/20"
                      }`}
                    >
                      {playingId === rec.id && (
                        <div className="absolute inset-0 rounded-xl animate-ping bg-red-500/20" />
                      )}
                      {playingId === rec.id ? <Pause className="w-5 h-5 relative" /> : <Play className="w-5 h-5 relative" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white truncate group-hover:text-primary transition-colors" dir="auto">
                        {rec.song_name || rec.file_name}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-white/30">{formatDate(rec.created_at, lang)}</span>
                        <span className="text-xs text-white/20">{formatSize(rec.size_bytes)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => handleDownload(rec.object_path, rec.file_name)}
                        className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-primary hover:bg-primary/10 hover:border-primary/30 transition-all"
                        title={l.download}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(rec.id)}
                        disabled={deleteRec.isPending}
                        className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-red-400/50 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all"
                        title={l.delete}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "performances" && (
          <>
            {loadingPerf ? (
              <div className="flex items-center justify-center py-24">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                  <Loader2 className="w-10 h-10 text-primary animate-spin relative" />
                </div>
              </div>
            ) : !performances?.length ? (
              <div className="text-center py-24 space-y-5">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-accent/20 rounded-full blur-2xl animate-pulse-glow" />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-accent/20 to-primary/10 flex items-center justify-center border border-accent/20">
                    <Music2 className="w-10 h-10 text-white/30" />
                  </div>
                </div>
                <p className="text-white/40 text-sm font-medium">{l.noPerf}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {performances.map((perf, index) => (
                  <Link key={perf.id} href={perf.job_id ? `/job/${perf.job_id}` : "#"}>
                    <div 
                      className="group flex items-center gap-4 px-5 py-4 rounded-2xl glass-panel border border-white/10 hover:border-primary/30 transition-all duration-300 cursor-pointer"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center shrink-0 border border-primary/30 group-hover:shadow-lg group-hover:shadow-primary/20 transition-all">
                        <Music2 className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white truncate group-hover:text-primary transition-colors" dir="auto">
                          {perf.song_name || "-"}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-white/30">{formatDate(perf.created_at, lang)}</span>
                          {perf.is_public && (
                            <span className="flex items-center gap-1 text-xs text-yellow-400">
                              <Star className="w-3 h-3 fill-current" /> Public
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary via-accent to-cyan-400 leading-none">
                          {perf.score}
                        </p>
                        <p className="text-[10px] text-white/30 mt-1 font-medium">{l.score}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
