import { Link } from "wouter";
import { ArrowLeft, Trophy, Star, Loader2, Music2, RefreshCw, Mic, Crown, User, Globe2, UserCheck, Zap } from "lucide-react";
import { useLeaderboard, useMyPerformances } from "@/hooks/use-performances";
import { useXPLeaderboard } from "@/hooks/use-gamification";
import { useState } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { useGamificationTranslations } from "@/hooks/use-gamification-translations";
import { buildDemoLeaderboard, buildDemoMyPerformances, buildDemoXPLeaderboard } from "@/lib/demoData";

const toStars = (s: number) => s >= 90 ? 5 : s >= 75 ? 4 : s >= 60 ? 3 : s >= 40 ? 2 : 1;
const MEDALS = ["🥇", "🥈", "🥉"];
const formatDate = (iso: string, lang: string) =>
  new Date(iso).toLocaleDateString(lang === "he" ? "he-IL" : lang === "ar" ? "ar-SA" : lang, { day: "numeric", month: "short" });

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

  const tabIcons = { global: Globe2, me: UserCheck, xp: Zap };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--ds-bg-app)]" dir={t.dir}>
      <div className="relative overflow-hidden py-14 sm:py-20 text-center">
        <div className="absolute inset-0 -z-10 ds-bg-galaxy" />
        <div className="absolute inset-0 -z-10 ds-bg-aurora opacity-50" />
        <div className="ds-orb absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] opacity-50 -z-10"
             style={{ background: "radial-gradient(circle, rgba(252,211,77,.4) 0%, transparent 70%)" }} />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#050510]/40 via-transparent to-[var(--ds-bg-app)]" />

        <div className="relative ds-reveal">
          <Link href="/">
            <button className="inline-flex items-center gap-1.5 text-sm text-white/45 hover:text-white transition-colors mb-8">
              <ArrowLeft className="w-3.5 h-3.5" />{t.leaderboard.backToHome}
            </button>
          </Link>
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-14 h-14 rounded-2xl ds-icon-orb"
                 style={{ background: "linear-gradient(135deg,#FBBF24,#F97316)", boxShadow: "0 0 40px rgba(251,191,36,.55)" }}>
              <Trophy className="w-7 h-7 text-white drop-shadow-lg" />
            </div>
            <h1 className="ds-page-title font-bold text-white">{t.leaderboard.title}</h1>
          </div>
          <p className="text-white/55 text-base">{t.leaderboard.subtitle}</p>
        </div>
      </div>

      <div className="w-full max-w-2xl mx-auto px-4 flex items-center justify-between mb-5 gap-4">
        <div className="flex gap-1.5 p-1.5 rounded-2xl ds-glass">
          {(["global", "me", "xp"] as const).map(tabKey => {
            const Icon = tabIcons[tabKey];
            const isActive = tab === tabKey;
            return (
              <button
                key={tabKey}
                onClick={() => setTab(tabKey)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive ? "text-white" : "text-white/45 hover:text-white/75"
                }`}
                style={isActive ? { background: "var(--ds-grad-primary)", boxShadow: "var(--ds-glow-violet)" } : {}}
              >
                <Icon className="w-3.5 h-3.5" />
                {tabKey === "global" ? t.leaderboard.global : tabKey === "me" ? t.leaderboard.mine : "XP"}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => doRefetch()}
          className="w-9 h-9 rounded-full ds-glass flex items-center justify-center text-white/45 hover:text-white transition-all">
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
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  xpMode === mode ? "ds-glass text-white border-white/15" : "text-white/45 hover:text-white/75"
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
              <div className="flex items-center justify-center py-24 gap-3 text-white/45">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">{t.leaderboard.loading}</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {(tab === "global"
                  ? ((globalData ?? []).length === 0 ? buildDemoLeaderboard(lang) : (globalData ?? []))
                  : ((myData ?? []).length === 0 ? buildDemoMyPerformances(lang) : (myData ?? []))
                ).map((row: any, i: number) => {
                  const stars = toStars(row.score);
                  const isPodium = i < 3;
                  const podiumGlow = i === 0 ? "shadow-[0_0_40px_rgba(252,211,77,.18)]" : "";
                  return (
                    <div
                      key={row.id}
                      className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 rounded-2xl transition-all duration-300 hover:scale-[1.005] ds-reveal ${
                        isPodium ? `ds-card ${podiumGlow}` : "bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04]"
                      }`}
                      style={{ animationDelay: `${i * 30}ms` }}
                    >
                      <span className={`text-xl w-8 text-center shrink-0 ${isPodium ? "" : "text-white/35 text-sm font-bold"}`}>
                        {isPodium ? MEDALS[i] : `#${i + 1}`}
                      </span>
                      {row.picture ? (
                        <img src={row.picture} alt={row.display_name} className="w-10 h-10 rounded-full object-cover ring-2 ring-violet-400/25 shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-full ds-icon-orb shrink-0">
                          <User className="w-5 h-5" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate text-sm">{row.display_name}</p>
                        <p className="text-white/35 text-xs truncate" dir="auto">{row.song_name}</p>
                        <div className="flex items-center gap-0.5 mt-1">
                          {Array.from({ length: 5 }).map((_, si) => (
                            <Star key={si} className={`w-2.5 h-2.5 ${si < stars ? "text-amber-300 fill-amber-300" : "text-white/10"}`} />
                          ))}
                        </div>
                      </div>
                      <div className={`shrink-0 ${t.dir === "rtl" ? "text-left" : "text-right"}`}>
                        <p className="text-2xl font-black ds-grad-text leading-none">{row.score}</p>
                        <p className="text-white/35 text-[10px] mt-1">{formatDate(row.created_at, lang)}</p>
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
              <div className="flex items-center justify-center py-24 text-white/45">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : (() => {
              const effective = (xpData?.leaderboard?.length ?? 0) > 0
                ? xpData
                : buildDemoXPLeaderboard(xpMode, lang);
              return (
              <div className="space-y-2.5">
                {effective.yourRank && (
                  <div className="mb-4 px-4 py-3 rounded-2xl bg-violet-500/10 border border-violet-400/25 text-sm text-white/70">
                    {gt.leaderboard.yourRank}: <span className="font-bold ds-grad-text text-base">#{effective.yourRank}</span>
                  </div>
                )}
                {effective.leaderboard.map((entry: any, i: number) => {
                  const isPodium = entry.rank <= 3;
                  return (
                    <div
                      key={entry.userId}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ds-reveal ${
                        entry.isYou ? "ds-card border-violet-400/30 bg-violet-500/[0.06] ring-1 ring-violet-400/20"
                          : isPodium ? "ds-card"
                          : "bg-white/[0.02] border border-white/[0.05]"
                      }`}
                      style={{ animationDelay: `${i * 25}ms` }}
                    >
                      <span className={`text-xl w-8 text-center shrink-0 ${!isPodium ? "text-white/35 text-sm font-bold" : ""}`}>
                        {isPodium ? MEDALS[entry.rank - 1] : `#${entry.rank}`}
                      </span>
                      {entry.picture ? (
                        <img src={entry.picture} alt={entry.displayName} className="w-10 h-10 rounded-full object-cover ring-2 ring-violet-400/25 shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-full ds-icon-orb shrink-0"><User className="w-5 h-5" /></div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate text-sm">
                          {entry.displayName}
                          {entry.isYou && <span className="text-violet-300 text-xs ml-1">(you)</span>}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-white/35 font-semibold">Lv.{entry.level}</span>
                          <span className="text-[10px] text-white/25">{entry.levelTitle}</span>
                          {entry.streakDays >= 3 && <span className="text-[10px] text-orange-300">🔥{entry.streakDays}</span>}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xl font-black ds-grad-text leading-none">
                          {(xpMode === "weekly" ? entry.weeklyXP : entry.totalXP).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-white/35 mt-0.5">XP</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              );
            })()}
          </>
        )}

        {tab !== "xp" && (
          tab === "global"
            ? ((globalData ?? []).length > 0 || true)
            : (myData ?? []).length > 0
        ) && (
          <div className="mt-10 text-center">
            <Link href="/">
              <button className="ds-btn ds-btn-primary px-8 py-3 text-sm">
                <Mic className="w-4 h-4" />{t.leaderboard.ctaSing}
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
