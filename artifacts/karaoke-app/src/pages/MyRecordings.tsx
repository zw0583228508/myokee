import { Link } from "wouter";
import { ArrowLeft, Mic2, Loader2, Play, Pause, Trash2, Download, Music2, Cloud, Users, Lock, Crown } from "lucide-react";
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
  he: { title:"ההקלטות שלי", subtitle:"כל ההקלטות והביצועים שלך — במקום אחד", back:"חזרה לדף הבית", empty:"אין הקלטות עדיין", emptyDesc:"שיר שיר ושמור בענן — וזה יופיע כאן", goSing:"לך לשיר", recordings:"הקלטות בענן", performances:"הביצועים שלי", play:"נגן", stop:"עצור", download:"הורד", delete:"מחק", confirmDelete:"למחוק את ההקלטה?", score:"ציון", noPerf:"אין ביצועים עדיין", shareToCommunity:"שתף לקהילה", makePrivate:"הסתר מהקהילה", shared:"משותף", private:"פרטי" },
  en: { title:"My Recordings", subtitle:"All your recordings and performances — in one place", back:"Back to home", empty:"No recordings yet", emptyDesc:"Sing a song and save to cloud — it will appear here", goSing:"Go sing", recordings:"Cloud Recordings", performances:"My Performances", play:"Play", stop:"Stop", download:"Download", delete:"Delete", confirmDelete:"Delete this recording?", score:"Score", noPerf:"No performances yet", shareToCommunity:"Share to Community", makePrivate:"Make Private", shared:"Shared", private:"Private" },
  ar: { title:"تسجيلاتي", subtitle:"جميع تسجيلاتك وأدائك — في مكان واحد", back:"العودة إلى الرئيسية", empty:"لا توجد تسجيلات بعد", emptyDesc:"غنِّ أغنية واحفظ في السحابة — ستظهر هنا", goSing:"اذهب للغناء", recordings:"تسجيلات السحابة", performances:"أدائي", play:"تشغيل", stop:"إيقاف", download:"تحميل", delete:"حذف", confirmDelete:"حذف هذا التسجيل؟", score:"النتيجة", noPerf:"لا يوجد أداء بعد", shareToCommunity:"شارك مع المجتمع", makePrivate:"اجعل خاص", shared:"مشارك", private:"خاص" },
};
const getLabels = (lang: string) => LABELS[lang] || LABELS.en;

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
    if (playingId === id) { audioRef.current?.pause(); setPlayingId(null); return; }
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(apiUrl(`/api/storage${objectPath}`));
    audio.onended = () => setPlayingId(null);
    audio.play().catch(() => {});
    audioRef.current = audio;
    setPlayingId(id);
  };
  const handleDelete = (id: number) => {
    if (confirm(l.confirmDelete)) {
      deleteRec.mutate(id);
      if (playingId === id) { audioRef.current?.pause(); setPlayingId(null); }
    }
  };
  const handleDownload = (objectPath: string, fileName: string) => {
    const a = document.createElement("a");
    a.href = apiUrl(`/api/storage${objectPath}`);
    a.download = fileName;
    a.click();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--ds-bg-app)]" dir={t.dir}>
      {/* Cinematic header */}
      <div className="relative overflow-hidden py-14 sm:py-20 text-center">
        <div className="absolute inset-0 -z-10 ds-bg-galaxy" />
        <div className="absolute inset-0 -z-10 ds-bg-aurora opacity-50" />
        <div className="ds-orb ds-orb-violet absolute -top-32 -left-32 w-[440px] h-[440px] opacity-50 -z-10" />
        <div className="ds-orb ds-orb-cyan absolute top-0 -right-32 w-[420px] h-[420px] opacity-40 -z-10" style={{ animationDelay: "2s" }} />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#050510]/40 via-transparent to-[var(--ds-bg-app)]" />

        <div className="relative ds-reveal">
          <Link href="/">
            <button className="inline-flex items-center gap-1.5 text-sm text-white/45 hover:text-white transition-colors mb-7">
              <ArrowLeft className="w-3.5 h-3.5" />{l.back}
            </button>
          </Link>
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="ds-icon-orb h-14 w-14 rounded-2xl" style={{ background: "linear-gradient(135deg,#22D3EE,#0891B2)", boxShadow: "0 0 40px rgba(34,211,238,.5)" }}>
              <Mic2 className="w-7 h-7 text-white" />
            </div>
            <h1 className="ds-page-title font-bold text-white">{l.title}</h1>
          </div>
          <p className="text-white/55 text-base">{l.subtitle}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full max-w-2xl mx-auto px-4 mb-6 -mt-2">
        <div className="flex gap-1.5 p-1.5 rounded-2xl ds-glass">
          <button
            onClick={() => setTab("recordings")}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              tab === "recordings" ? "text-white" : "text-white/45 hover:text-white/75"
            }`}
            style={tab === "recordings" ? { background: "var(--ds-grad-primary)", boxShadow: "var(--ds-glow-violet)" } : {}}
          >
            <Cloud className="w-4 h-4" />{l.recordings}
          </button>
          <button
            onClick={() => setTab("performances")}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              tab === "performances" ? "text-white" : "text-white/45 hover:text-white/75"
            }`}
            style={tab === "performances" ? { background: "var(--ds-grad-primary)", boxShadow: "var(--ds-glow-violet)" } : {}}
          >
            <Music2 className="w-4 h-4" />{l.performances}
          </button>
        </div>
      </div>

      <div className="w-full max-w-2xl mx-auto px-4 flex-1 pb-20">
        {tab === "recordings" && (
          loadingRec ? (
            <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-violet-300" /></div>
          ) : !recordings?.length ? (
            <div className="ds-card text-center py-16 px-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center mb-5">
                <Cloud className="w-8 h-8 text-white/30" />
              </div>
              <p className="text-white/65 text-base font-semibold mb-1">{l.empty}</p>
              <p className="text-white/40 text-sm mb-6">{l.emptyDesc}</p>
              <Link href="/upload">
                <button className="ds-btn ds-btn-primary px-6 py-2.5 text-sm">
                  <Mic2 className="w-4 h-4" />{l.goSing}
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recordings.map((rec, i) => (
                <div key={rec.id} className="ds-card flex items-center gap-3 px-4 py-3.5 hover:border-white/15 transition-all ds-reveal" style={{ animationDelay: `${i * 30}ms` }}>
                  <button
                    onClick={() => handlePlay(rec.object_path, rec.id)}
                    className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      playingId === rec.id
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_20px_rgba(248,113,113,.35)]"
                        : "bg-violet-500/15 text-violet-200 border border-violet-400/30 hover:bg-violet-500/25"
                    }`}
                  >
                    {playingId === rec.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ms-0.5" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate text-sm" dir="auto">{rec.song_name || rec.file_name}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-white/40">
                      <span>{formatDate(rec.created_at, lang)}</span>
                      <span className="text-white/20">·</span>
                      <span>{formatSize(rec.size_bytes)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleDownload(rec.object_path, rec.file_name)}
                      className="w-9 h-9 rounded-full ds-glass flex items-center justify-center text-white/45 hover:text-white transition-all"
                      title={l.download}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(rec.id)}
                      disabled={deleteRec.isPending}
                      className="w-9 h-9 rounded-full ds-glass flex items-center justify-center text-rose-400/60 hover:text-rose-300 hover:bg-rose-500/15 transition-all"
                      title={l.delete}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {tab === "performances" && (
          loadingPerf ? (
            <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-violet-300" /></div>
          ) : !performances?.length ? (
            <div className="ds-card text-center py-16 px-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center mb-5">
                <Music2 className="w-8 h-8 text-white/30" />
              </div>
              <p className="text-white/65 text-base font-semibold">{l.noPerf}</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {performances.map((perf, i) => (
                <div key={perf.id} className="ds-card hover:border-white/15 transition-all ds-reveal" style={{ animationDelay: `${i * 30}ms` }}>
                  <Link href={perf.job_id ? `/job/${perf.job_id}` : "#"}>
                    <div className="flex items-center gap-3 px-4 pt-4 pb-2 cursor-pointer">
                      <div className="ds-icon-orb w-11 h-11 rounded-xl shrink-0">
                        <Music2 className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate text-sm" dir="auto">{perf.song_name || "—"}</p>
                        <p className="text-[11px] text-white/40 mt-0.5">{formatDate(perf.created_at, lang)}</p>
                      </div>
                      <div className="shrink-0 text-end">
                        <p className="text-3xl font-black ds-grad-text leading-none">{perf.score}</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1">{l.score}</p>
                      </div>
                    </div>
                  </Link>
                  <div className="px-4 pb-3.5 flex items-center justify-between border-t border-white/[0.04] mt-2 pt-3">
                    {perf.is_public ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-400/25 rounded-full px-2.5 py-1">
                        <Users className="w-3 h-3" />{l.shared}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-white/45 bg-white/[0.05] border border-white/10 rounded-full px-2.5 py-1">
                        <Lock className="w-3 h-3" />{l.private}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (perf.is_public) unpublishPerf.mutate(perf.id);
                        else publishPerf.mutate(perf.id);
                      }}
                      disabled={publishPerf.isPending || unpublishPerf.isPending}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all ${
                        perf.is_public
                          ? "text-rose-300 bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/20"
                          : "text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20"
                      }`}
                    >
                      {perf.is_public ? (<><Lock className="w-3 h-3" />{l.makePrivate}</>) : (<><Crown className="w-3 h-3" />{l.shareToCommunity}</>)}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
