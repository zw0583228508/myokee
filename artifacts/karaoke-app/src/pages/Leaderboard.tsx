import { Link } from "wouter";
import { ArrowLeft, Trophy, Star, Loader2, Music2, RefreshCw, Mic } from "lucide-react";
import { useLeaderboard, useMyPerformances } from "@/hooks/use-performances";
import { useState } from "react";
import { useLang } from "@/contexts/LanguageContext";

const toStars = (s: number) => s >= 90 ? 5 : s >= 75 ? 4 : s >= 60 ? 3 : s >= 40 ? 2 : 1;
const MEDALS = ["🥇", "🥈", "🥉"];

function formatDate(iso: string, lang: string) {
  return new Date(iso).toLocaleDateString(lang === "he" ? "he-IL" : lang === "ar" ? "ar-SA" : lang, { day: "numeric", month: "short" });
}

export default function Leaderboard() {
  const { t, lang } = useLang();
  const [tab, setTab] = useState<"global" | "me">("global");
  const { data: globalData, isLoading: loadingGlobal, refetch: refetchGlobal } = useLeaderboard();
  const { data: myData,    isLoading: loadingMe,     refetch: refetchMe     } = useMyPerformances();

  const isLoading = tab === "global" ? loadingGlobal : loadingMe;
  const rows      = tab === "global" ? (globalData ?? []) : (myData ?? []);
  const doRefetch = tab === "global" ? refetchGlobal : refetchMe;

  return (
    <div className="min-h-screen flex flex-col" dir={t.dir}>

      <div className="relative overflow-hidden py-12 sm:py-20 text-center">
        <img
          src="https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1920&h=600&fit=crop&q=80"
          className="absolute inset-0 w-full h-full object-cover opacity-[0.22]"
          style={{ filter: "saturate(1.2)" }}
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/55 via-background/20 to-background/90" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] rounded-full bg-yellow-500/5 blur-[100px]" />

        <div className="relative z-10">
          <Link href="/">
            <button className="inline-flex items-center gap-1.5 text-sm text-white/35 hover:text-white/70 transition-colors mb-8">
              <ArrowLeft className="w-3.5 h-3.5" />{t.leaderboard.backToHome}
            </button>
          </Link>
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/15 border border-yellow-500/25 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-yellow-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold">{t.leaderboard.title}</h1>
          </div>
          <p className="text-white/35 text-sm">{t.leaderboard.subtitle}</p>
        </div>
      </div>

      <div className="w-full max-w-2xl mx-auto px-4 flex items-center justify-between mb-5 gap-4">
        <div className="flex gap-2 p-1 rounded-2xl bg-white/5 border border-white/8">
          {(["global", "me"] as const).map(tabKey => (
            <button
              key={tabKey}
              onClick={() => setTab(tabKey)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === tabKey
                  ? "bg-primary text-white shadow-[0_0_20px_rgba(124,58,237,.3)]"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {tabKey === "global" ? `🌍 ${t.leaderboard.global}` : `👤 ${t.leaderboard.mine}`}
            </button>
          ))}
        </div>
        <button
          onClick={() => doRefetch()}
          className="w-8 h-8 rounded-full bg-white/5 border border-white/8 flex items-center justify-center text-white/35 hover:text-white hover:bg-white/10 transition-all">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="w-full max-w-2xl mx-auto px-4 flex-1 pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-white/30">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">{t.leaderboard.loading}</span>
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-24 space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
              <Music2 className="w-8 h-8 text-white/20" />
            </div>
            <p className="text-white/35 text-sm">{t.leaderboard.empty}</p>
            <Link href="/">
              <button className="inline-flex items-center gap-2 mt-2 px-6 py-2.5 rounded-full text-white text-sm font-semibold transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)" }}>
                <Mic className="w-4 h-4" />
                {t.leaderboard.singNow}
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {rows.map((row, i) => {
              const stars = toStars(row.score);
              const rankEmoji = i < 3 ? MEDALS[i] : `#${i + 1}`;
              const isPodium = i < 3;
              return (
                <div
                  key={row.id}
                  className={`flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4 rounded-2xl border transition-all hover:scale-[1.005] ${
                    i === 0
                      ? "bg-yellow-500/8 border-yellow-500/25 shadow-[0_0_30px_rgba(234,179,8,0.06)]"
                      : i === 1
                      ? "bg-zinc-300/5 border-zinc-300/15"
                      : i === 2
                      ? "bg-amber-600/5 border-amber-600/15"
                      : "bg-white/3 border-white/7 hover:bg-white/5"
                  }`}
                >
                  <span className={`text-lg w-8 text-center shrink-0 ${isPodium ? "" : "text-white/30 text-sm font-bold"}`}>
                    {rankEmoji}
                  </span>

                  {row.picture ? (
                    <img src={row.picture} alt={row.display_name}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-primary/20 shrink-0" />
                  ) : (
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary/70 to-accent/70 flex items-center justify-center text-sm font-bold shrink-0 text-white">
                      {row.display_name?.charAt(0)?.toUpperCase() ?? "?"}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate text-sm">{row.display_name}</p>
                    <p className="text-white/35 text-xs truncate" dir="auto">{row.song_name}</p>
                    <div className="flex items-center gap-0.5 mt-1">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Star key={si} className={`w-2.5 h-2.5 ${si < stars ? "text-yellow-400 fill-yellow-400" : "text-white/12"}`} />
                      ))}
                    </div>
                  </div>

                  <div className={`shrink-0 ${t.dir === "rtl" ? "text-left" : "text-right"}`}>
                    <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-violet-300 to-blue-400 leading-none">
                      {row.score}
                    </p>
                    <p className="text-white/25 text-[10px] mt-1">{formatDate(row.created_at, lang)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {rows.length > 0 && (
          <div className="mt-10 text-center">
            <Link href="/">
              <button className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl text-white font-semibold text-sm transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)", boxShadow: "0 0 30px rgba(124,58,237,.25)" }}>
                <Mic className="w-4 h-4" />
                {t.leaderboard.ctaSing}
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
