import { Link } from "wouter";
import { ArrowLeft, Trophy, Star, Loader2, Music2, RefreshCw, Mic, Zap, Crown, User } from "lucide-react";
import { useLeaderboard, useMyPerformances } from "@/hooks/use-performances";
import { useXPLeaderboard } from "@/hooks/use-gamification";
import { useState } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { useGamificationTranslations } from "@/hooks/use-gamification-translations";
const toStars = (s: number) => s >= 90 ? 5 : s >= 75 ? 4 : s >= 60 ? 3 : s >= 40 ? 2 : 1;
const MEDALS = ["🥇", "🥈", "🥉"];

function formatDate(iso: string, lang: string) {
  return new Date(iso).toLocaleDateString(lang === "he" ? "he-IL" : lang === "ar" ? "ar-SA" : lang, { day: "numeric", month: "short" });
}

export default function Leaderboard() {
  const { t, lang } = useLang();
  const gt = useGamificationTranslations();
  const [tab, setTab] = useState<"global" | "me" | "xp">("global");
  const [xpMode, setXpMode] = useState<"all" | "weekly">("all");

  const { data: globalData, isLoading: loadingGlobal, refetch: refetchGlobal } = useLeaderboard();
  const { data: myData,    isLoading: loadingMe,     refetch: refetchMe     } = useMyPerformances();
  const { data: xpData,    isLoading: loadingXP,     refetch: refetchXP     } = useXPLeaderboard(xpMode);

  const isLoading = tab === "global" ? loadingGlobal : tab === "me" ? loadingMe : loadingXP;
  const doRefetch = tab === "global" ? refetchGlobal : tab === "me" ? refetchMe : refetchXP;

  return (
    <div className="min-h-screen flex flex-col" dir={t.dir}>

      <div className="relative overflow-hidden py-14 sm:py-24 text-center">
        <img
          src="https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1920&h=600&fit=crop&q=80"
          className="absolute inset-0 w-full h-full object-cover opacity-[0.15]"
          style={{ filter: "saturate(0.6) brightness(0.5)" }}
          alt=""
        />
        <div className="absolute inset-0 bg-[#040410]/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/10 to-background/95" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-yellow-500/[0.04] blur-[120px]" />

        <div className="relative z-10">
          <Link href="/">
            <button className="inline-flex items-center gap-1.5 text-sm text-white/25 hover:text-white/60 transition-colors mb-8">
              <ArrowLeft className="w-3.5 h-3.5" />{t.leaderboard.backToHome}
            </button>
          </Link>
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/12 border border-yellow-500/15 flex items-center justify-center shadow-lg shadow-yellow-500/10">
              <Trophy className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold">{t.leaderboard.title}</h1>
          </div>
          <p className="text-white/25 text-sm">{t.leaderboard.subtitle}</p>
        </div>
      </div>

      <div className="w-full max-w-2xl mx-auto px-4 flex items-center justify-between mb-5 gap-4">
        <div className="flex gap-1.5 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          {(["global", "me", "xp"] as const).map(tabKey => (
            <button
              key={tabKey}
              onClick={() => setTab(tabKey)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                tab === tabKey
                  ? "bg-primary text-white shadow-[0_0_25px_rgba(147,51,234,.25)]"
                  : "text-white/30 hover:text-white/60"
              }`}
            >
              {tabKey === "global" ? `🌍 ${t.leaderboard.global}` : tabKey === "me" ? `👤 ${t.leaderboard.mine}` : `⚡ XP`}
            </button>
          ))}
        </div>
        <button
          onClick={() => doRefetch()}
          className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/25 hover:text-white hover:bg-white/[0.08] transition-all duration-300">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="w-full max-w-2xl mx-auto px-4 flex-1 pb-20">
        {tab === "xp" && (
          <div className="flex gap-2 mb-5">
            {(["all", "weekly"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setXpMode(mode)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  xpMode === mode
                    ? "bg-white/[0.06] text-white border border-white/10"
                    : "text-white/30 hover:text-white/60"
                }`}
              >
                {mode === "all" ? gt.leaderboard.allTime : gt.leaderboard.thisWeek}
              </button>
            ))}
          </div>
        )}

        {tab !== "xp" && (
          <>
            {isLoading ? (
              <div className="flex items-center justify-center py-24 gap-3 text-white/25">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">{t.leaderboard.loading}</span>
              </div>
            ) : (tab === "global" ? (globalData ?? []) : (myData ?? [])).length === 0 ? (
              <div className="text-center py-24 space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center mx-auto">
                  <Music2 className="w-8 h-8 text-white/15" />
                </div>
                <p className="text-white/30 text-sm">{t.leaderboard.empty}</p>
                <Link href="/">
                  <button className="btn-primary gap-2 mt-2 px-6 py-2.5 rounded-full text-sm text-white">
                    <Mic className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">{t.leaderboard.singNow}</span>
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {(tab === "global" ? (globalData ?? []) : (myData ?? [])).map((row: any, i: number) => {
                  const stars = toStars(row.score);
                  const rankEmoji = i < 3 ? MEDALS[i] : `#${i + 1}`;
                  const isPodium = i < 3;
                  return (
                    <div
                      key={row.id}
                      className={`flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4 rounded-2xl border transition-all duration-300 hover:scale-[1.005] ${
                        i === 0
                          ? "glass-card bg-yellow-500/[0.06] border-yellow-500/15 shadow-[0_0_40px_rgba(234,179,8,0.04)]"
                          : i === 1
                          ? "glass-card bg-zinc-300/[0.03] border-zinc-300/10"
                          : i === 2
                          ? "glass-card bg-amber-600/[0.03] border-amber-600/10"
                          : "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]"
                      }`}
                    >
                      <span className={`text-lg w-8 text-center shrink-0 ${isPodium ? "" : "text-white/25 text-sm font-bold"}`}>
                        {rankEmoji}
                      </span>

                      {row.picture ? (
                        <img src={row.picture} alt={row.display_name}
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-primary/15 shrink-0" />
                      ) : (
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary/70 to-accent/70 flex items-center justify-center shrink-0 text-white shadow-lg shadow-primary/15">
                          <User className="w-5 h-5" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white/90 truncate text-sm">{row.display_name}</p>
                        <p className="text-white/25 text-xs truncate" dir="auto">{row.song_name}</p>
                        <div className="flex items-center gap-0.5 mt-1">
                          {Array.from({ length: 5 }).map((_, si) => (
                            <Star key={si} className={`w-2.5 h-2.5 ${si < stars ? "text-yellow-400 fill-yellow-400" : "text-white/8"}`} />
                          ))}
                        </div>
                      </div>

                      <div className={`shrink-0 ${t.dir === "rtl" ? "text-left" : "text-right"}`}>
                        <p className="text-2xl font-black animated-gradient-text leading-none" style={{ fontSize: "1.5rem" }}>
                          {row.score}
                        </p>
                        <p className="text-white/20 text-[10px] mt-1">{formatDate(row.created_at, lang)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {tab === "xp" && (
          <>
            {loadingXP ? (
              <div className="flex items-center justify-center py-24 gap-3 text-white/25">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : xpData?.leaderboard?.length > 0 ? (
              <div className="space-y-2">
                {xpData.yourRank && (
                  <div className="mb-4 px-4 py-3 rounded-2xl bg-primary/8 border border-primary/15 text-sm text-white/60">
                    {gt.leaderboard.yourRank}: <span className="font-bold text-white">#{xpData.yourRank}</span>
                  </div>
                )}

                {xpData.leaderboard.map((entry: any) => {
                  const isPodium = entry.rank <= 3;
                  return (
                    <div
                      key={entry.userId}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all duration-300 ${
                        entry.isYou
                          ? "glass-card bg-primary/6 border-primary/15 ring-1 ring-primary/8"
                          : entry.rank === 1
                          ? "glass-card bg-yellow-500/[0.06] border-yellow-500/15"
                          : entry.rank === 2
                          ? "glass-card bg-zinc-300/[0.03] border-zinc-300/10"
                          : entry.rank === 3
                          ? "glass-card bg-amber-600/[0.03] border-amber-600/10"
                          : "bg-white/[0.015] border-white/[0.05]"
                      }`}
                    >
                      <span className={`text-lg w-8 text-center shrink-0 ${!isPodium ? "text-white/25 text-sm font-bold" : ""}`}>
                        {isPodium ? MEDALS[entry.rank - 1] : `#${entry.rank}`}
                      </span>

                      {entry.picture ? (
                        <img src={entry.picture} alt={entry.displayName}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/15 shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/70 to-accent/70 flex items-center justify-center shrink-0 text-white shadow-lg shadow-primary/15">
                          <User className="w-5 h-5" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-white/90 truncate text-sm">
                            {entry.displayName}
                            {entry.isYou && <span className="text-primary text-xs ml-1">(you)</span>}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-white/25">Lv.{entry.level}</span>
                          <span className="text-[10px] text-white/15">{entry.levelTitle}</span>
                          {entry.streakDays >= 3 && (
                            <span className="text-[10px] text-orange-400">🔥{entry.streakDays}</span>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-xl font-black animated-gradient-text leading-none" style={{ fontSize: "1.25rem" }}>
                          {(xpMode === "weekly" ? entry.weeklyXP : entry.totalXP).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-white/20 mt-0.5">XP</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 space-y-3">
                <Crown className="w-12 h-12 text-white/10 mx-auto" />
                <p className="text-white/25 text-sm">{gt.leaderboard.empty}</p>
              </div>
            )}
          </>
        )}

        {tab !== "xp" && (tab === "global" ? (globalData ?? []) : (myData ?? [])).length > 0 && (
          <div className="mt-10 text-center">
            <Link href="/">
              <button className="btn-primary gap-2 px-7 py-3 rounded-2xl text-sm text-white">
                <Mic className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{t.leaderboard.ctaSing}</span>
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
