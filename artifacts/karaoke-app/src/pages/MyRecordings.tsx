import { Link } from "wouter";
import { ArrowLeft, Mic2, Loader2, Play, Pause, Trash2, Download, Music2, Cloud, Users, Lock } from "lucide-react";
import { useRecordings, useDeleteRecording } from "@/hooks/use-recordings";
import { useLang } from "@/contexts/LanguageContext";
import { useMyPerformances, usePublishPerformance, useUnpublishPerformance } from "@/hooks/use-performances";
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
    subtitle: "כל ההקלטות והביצועים שלך — במקום אחד",
    back: "חזרה לדף הבית",
    empty: "אין הקלטות עדיין",
    emptyDesc: "שיר שיר ושמור בענן — וזה יופיע כאן",
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
    shareToCommunity: "שתף לקהילה",
    makePrivate: "הסתר מהקהילה",
    shared: "משותף",
    private: "פרטי",
  },
  en: {
    title: "My Recordings",
    subtitle: "All your recordings and performances — in one place",
    back: "Back to home",
    empty: "No recordings yet",
    emptyDesc: "Sing a song and save to cloud — it will appear here",
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
    shareToCommunity: "Share to Community",
    makePrivate: "Make Private",
    shared: "Shared",
    private: "Private",
  },
  ar: {
    title: "تسجيلاتي",
    subtitle: "جميع تسجيلاتك وأدائك — في مكان واحد",
    back: "العودة إلى الرئيسية",
    empty: "لا توجد تسجيلات بعد",
    emptyDesc: "غنِّ أغنية واحفظ في السحابة — ستظهر هنا",
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
    shareToCommunity: "شارك مع المجتمع",
    makePrivate: "اجعل خاص",
    shared: "مشارك",
    private: "خاص",
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
  const publishPerf = usePublishPerformance();
  const unpublishPerf = useUnpublishPerformance();
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
      <div className="relative overflow-hidden py-12 sm:py-20 text-center">
        <img
          src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1920&h=600&fit=crop&q=80"
          className="absolute inset-0 w-full h-full object-cover opacity-[0.12]"
          style={{ filter: "saturate(0.5) brightness(0.5)" }}
          alt=""
        />
        <div className="absolute inset-0 bg-[#040410]/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/10 to-background/95" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] rounded-full bg-cyan-500/[0.03] blur-[120px]" />

        <div className="relative z-10">
          <Link href="/">
            <button className="inline-flex items-center gap-1.5 text-sm text-white/25 hover:text-white/60 transition-colors mb-8">
              <ArrowLeft className="w-3.5 h-3.5" />{l.back}
            </button>
          </Link>
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/12 border border-cyan-500/15 flex items-center justify-center shadow-lg shadow-cyan-500/10">
              <Mic2 className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold">{l.title}</h1>
          </div>
          <p className="text-white/25 text-sm">{l.subtitle}</p>
        </div>
      </div>

      <div className="w-full max-w-2xl mx-auto px-4 mb-5">
        <div className="flex gap-1.5 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <button
            onClick={() => setTab("recordings")}
            className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
              tab === "recordings"
                ? "bg-primary text-white shadow-[0_0_25px_rgba(147,51,234,.25)]"
                : "text-white/30 hover:text-white/60"
            }`}
          >
            <Cloud className="w-3.5 h-3.5 inline mr-1.5" />{l.recordings}
          </button>
          <button
            onClick={() => setTab("performances")}
            className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
              tab === "performances"
                ? "bg-primary text-white shadow-[0_0_25px_rgba(147,51,234,.25)]"
                : "text-white/30 hover:text-white/60"
            }`}
          >
            <Music2 className="w-3.5 h-3.5 inline mr-1.5" />{l.performances}
          </button>
        </div>
      </div>

      <div className="w-full max-w-2xl mx-auto px-4 flex-1 pb-20">
        {tab === "recordings" && (
          <>
            {loadingRec ? (
              <div className="flex items-center justify-center py-24 gap-3 text-white/30">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : !recordings?.length ? (
              <div className="text-center py-24 space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                  <Cloud className="w-8 h-8 text-white/20" />
                </div>
                <p className="text-white/35 text-sm">{l.empty}</p>
                <p className="text-white/25 text-xs">{l.emptyDesc}</p>
                <Link href="/">
                  <button className="btn-primary gap-2 mt-2 px-6 py-2.5 rounded-full text-sm text-white">
                    <Mic2 className="w-4 h-4 relative z-10" /><span className="relative z-10">{l.goSing}</span>
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recordings.map((rec) => (
                  <div
                    key={rec.id}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border bg-white/[0.03] border-white/7 hover:bg-white/5 transition-all"
                  >
                    <button
                      onClick={() => handlePlay(rec.object_path, rec.id)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                        playingId === rec.id
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25"
                      }`}
                    >
                      {playingId === rec.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate text-sm" dir="auto">
                        {rec.song_name || rec.file_name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-white/25">{formatDate(rec.created_at, lang)}</span>
                        <span className="text-[10px] text-white/20">{formatSize(rec.size_bytes)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleDownload(rec.object_path, rec.file_name)}
                        className="w-8 h-8 rounded-full bg-white/5 border border-white/8 flex items-center justify-center text-white/35 hover:text-white hover:bg-white/10 transition-all"
                        title={l.download}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(rec.id)}
                        disabled={deleteRec.isPending}
                        className="w-8 h-8 rounded-full bg-white/5 border border-white/8 flex items-center justify-center text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title={l.delete}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
              <div className="flex items-center justify-center py-24 gap-3 text-white/30">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : !performances?.length ? (
              <div className="text-center py-24 space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                  <Music2 className="w-8 h-8 text-white/20" />
                </div>
                <p className="text-white/35 text-sm">{l.noPerf}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {performances.map((perf) => (
                  <div key={perf.id} className="rounded-2xl border bg-white/[0.03] border-white/7 hover:bg-white/5 transition-all">
                    <Link href={perf.job_id ? `/job/${perf.job_id}` : "#"}>
                      <div className="flex items-center gap-3 px-4 pt-3.5 pb-2 cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center shrink-0">
                          <Music2 className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white truncate text-sm" dir="auto">
                            {perf.song_name || "—"}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-white/25">{formatDate(perf.created_at, lang)}</span>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-violet-300 to-blue-400 leading-none">
                            {perf.score}
                          </p>
                          <p className="text-[10px] text-white/25 mt-0.5">{l.score}</p>
                        </div>
                      </div>
                    </Link>
                    <div className="px-4 pb-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {perf.is_public ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-green-400 bg-green-500/10 border border-green-500/20 rounded-full px-2.5 py-0.5">
                            <Users className="w-3 h-3" />{l.shared}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-white/30 bg-white/5 border border-white/8 rounded-full px-2.5 py-0.5">
                            <Lock className="w-3 h-3" />{l.private}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (perf.is_public) {
                            unpublishPerf.mutate(perf.id);
                          } else {
                            publishPerf.mutate(perf.id);
                          }
                        }}
                        disabled={publishPerf.isPending || unpublishPerf.isPending}
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
                          perf.is_public
                            ? "text-red-400/80 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20"
                            : "text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20"
                        }`}
                      >
                        {perf.is_public ? (
                          <><Lock className="w-3 h-3" />{l.makePrivate}</>
                        ) : (
                          <><Users className="w-3 h-3" />{l.shareToCommunity}</>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
