import { Link } from "wouter";
import { ArrowLeft, Trophy, Star, Loader2, Music2, RefreshCw, Mic, Crown, User, Sparkles, Flame } from "lucide-react";
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

// Animated confetti particles
function Confetti() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 50}%`,
            backgroundColor: ['#a855f7', '#3b82f6', '#f59e0b', '#ec4899', '#10b981'][Math.floor(Math.random() * 5)],
            animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
            opacity: 0.4,
          }}
        />
      ))}
    </div>
  );
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
    <div className="min-h-screen flex flex-col page-bg-leaderboard" dir={t.dir}>
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden py-16 sm:py-24 text-center">
        <Confetti />
        
        {/* Multi-layered background */}
        <img
          src="/images/leaderboard-bg.jpg"
          className="absolute inset-0 w-full h-full object-cover"
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-background/60 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-900/10 via-transparent to-yellow-900/10" />
        
        {/* Animated glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-yellow-500/15 blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-purple-500/10 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative z-10">
          <Link href="/">
            <button className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/80 transition-colors mb-10 glass-panel rounded-full px-4 py-2 border-white/10">
              <ArrowLeft className="w-4 h-4" />{t.leaderboard.backToHome}
            </button>
          </Link>
          
          {/* Trophy with glow */}
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-500 blur-xl opacity-50" />
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 flex items-center justify-center shadow-2xl shadow-yellow-500/30">
                <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-black mb-4">
            <span className="text-white">{t.leaderboard.title}</span>
          </h1>
          <p className="text-white/40 text-lg max-w-md mx-auto">{t.leaderboard.subtitle}</p>
        </div>
      </div>

      {/* Premium Tab Navigation */}
      <div className="w-full max-w-3xl mx-auto px-4 flex items-center justify-between mb-8 gap-4">
        <div className="flex gap-2 p-1.5 rounded-2xl glass-panel-glow border-purple-500/20">
          {(["global", "me", "xp"] as const).map(tabKey => (
            <button
              key={tabKey}
              onClick={() => setTab(tabKey)}
              className={`relative px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
                tab === tabKey
                  ? "text-white"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {tab === tabKey && (
                <>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500" />
                  <div className="absolute inset-0 rounded-xl bg-purple-500/50 blur-xl" />
                </>
              )}
              <span className="relative flex items-center gap-2">
                {tabKey === "global" ? (
                  <>🌍 {t.leaderboard.global}</>
                ) : tabKey === "me" ? (
                  <>👤 {t.leaderboard.mine}</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> XP</>
                )}
              </span>
            </button>
          ))}
        </div>
        
        <button
          onClick={() => doRefetch()}
          className="w-10 h-10 rounded-xl glass-panel border-purple-500/20 flex items-center justify-center text-white/40 hover:text-purple-400 hover:border-purple-500/40 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="w-full max-w-3xl mx-auto px-4 flex-1 pb-20">
        {/* XP Mode Switcher */}
        {tab === "xp" && (
          <div className="flex gap-2 mb-6">
            {(["all", "weekly"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setXpMode(mode)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  xpMode === mode
                    ? "glass-panel-glow text-purple-300 border-purple-500/30"
                    : "text-white/40 hover:text-white/70 border border-transparent"
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
              <div className="flex flex-col items-center justify-center py-28 gap-4 text-white/30">
                <div className="w-16 h-16 rounded-2xl glass-panel-glow flex items-center justify-center">
                  <Loader2 className="w-7 h-7 animate-spin text-purple-400" />
                </div>
                <span className="text-sm">{t.leaderboard.loading}</span>
              </div>
            ) : (tab === "global" ? (globalData ?? []) : (myData ?? [])).length === 0 ? (
              <div className="text-center py-28 space-y-6">
                <div className="w-20 h-20 rounded-2xl glass-panel-glow flex items-center justify-center mx-auto">
                  <Music2 className="w-10 h-10 text-white/20" />
                </div>
                <p className="text-white/40 text-base">{t.leaderboard.empty}</p>
                <Link href="/">
                  <button className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl btn-neon text-white font-bold text-base transition-all hover:scale-105">
                    <Mic className="w-5 h-5" />
                    {t.leaderboard.singNow}
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {(tab === "global" ? (globalData ?? []) : (myData ?? [])).map((row: any, i: number) => {
                  const stars = toStars(row.score);
                  const rankEmoji = i < 3 ? MEDALS[i] : `#${i + 1}`;
                  const isPodium = i < 3;
                  
                  return (
                    <div
                      key={row.id}
                      className={`relative flex items-center gap-4 sm:gap-5 px-4 sm:px-6 py-4 sm:py-5 rounded-2xl transition-all hover:scale-[1.01] overflow-hidden ${
                        i === 0
                          ? "card-premium podium-gold"
                          : i === 1
                          ? "card-premium podium-silver"
                          : i === 2
                          ? "card-premium podium-bronze"
                          : "card-premium"
                      }`}
                    >
                      {/* Gradient overlay for podium positions */}
                      {i === 0 && <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-amber-500/5" />}
                      {i === 1 && <div className="absolute inset-0 bg-gradient-to-r from-gray-400/10 to-gray-300/5" />}
                      {i === 2 && <div className="absolute inset-0 bg-gradient-to-r from-amber-700/10 to-orange-600/5" />}

                      <span className={`relative text-2xl w-10 text-center shrink-0 ${isPodium ? "" : "text-white/30 text-sm font-bold"}`}>
                        {rankEmoji}
                      </span>

                      {row.picture ? (
                        <div className="relative shrink-0">
                          {isPodium && <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-500 to-amber-500 blur opacity-50" />}
                          <img src={row.picture} alt={row.display_name}
                            className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ${
                              i === 0 ? "ring-yellow-400/50" : i === 1 ? "ring-gray-300/50" : i === 2 ? "ring-amber-600/50" : "ring-purple-500/30"
                            }`} 
                          />
                        </div>
                      ) : (
                        <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shrink-0 text-white">
                          <User className="w-5 h-5" />
                        </div>
                      )}

                      <div className="relative flex-1 min-w-0">
                        <p className="font-bold text-white truncate text-base">{row.display_name}</p>
                        <p className="text-white/40 text-sm truncate" dir="auto">{row.song_name}</p>
                        <div className="flex items-center gap-1 mt-1.5">
                          {Array.from({ length: 5 }).map((_, si) => (
                            <Star key={si} className={`w-3 h-3 ${si < stars ? "text-yellow-400 fill-yellow-400" : "text-white/15"}`} />
                          ))}
                        </div>
                      </div>

                      <div className={`relative shrink-0 ${t.dir === "rtl" ? "text-left" : "text-right"}`}>
                        <p className="text-3xl font-black animated-gradient-text leading-none">
                          {row.score}
                        </p>
                        <p className="text-white/30 text-xs mt-1.5">{formatDate(row.created_at, lang)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* XP Leaderboard */}
        {tab === "xp" && (
          <>
            {loadingXP ? (
              <div className="flex flex-col items-center justify-center py-28 gap-4 text-white/30">
                <div className="w-16 h-16 rounded-2xl glass-panel-glow flex items-center justify-center">
                  <Loader2 className="w-7 h-7 animate-spin text-purple-400" />
                </div>
              </div>
            ) : xpData?.leaderboard?.length > 0 ? (
              <div className="space-y-3">
                {xpData.yourRank && (
                  <div className="mb-6 px-5 py-4 rounded-2xl glass-panel-glow border-purple-500/30 text-sm text-white/70 flex items-center gap-3">
                    <Crown className="w-5 h-5 text-purple-400" />
                    {gt.leaderboard.yourRank}: <span className="font-bold text-purple-300 text-lg">#{xpData.yourRank}</span>
                  </div>
                )}

                {xpData.leaderboard.map((entry: any) => {
                  const isPodium = entry.rank <= 3;
                  return (
                    <div
                      key={entry.userId}
                      className={`relative flex items-center gap-4 px-5 py-4 rounded-2xl transition-all overflow-hidden ${
                        entry.isYou
                          ? "card-premium ring-2 ring-purple-500/30"
                          : entry.rank === 1
                          ? "card-premium podium-gold"
                          : entry.rank === 2
                          ? "card-premium podium-silver"
                          : entry.rank === 3
                          ? "card-premium podium-bronze"
                          : "card-premium"
                      }`}
                    >
                      {entry.rank === 1 && <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-amber-500/5" />}

                      <span className={`relative text-2xl w-10 text-center shrink-0 ${!isPodium ? "text-white/30 text-sm font-bold" : ""}`}>
                        {isPodium ? MEDALS[entry.rank - 1] : `#${entry.rank}`}
                      </span>

                      {entry.picture ? (
                        <div className="relative shrink-0">
                          {isPodium && <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 blur opacity-50" />}
                          <img src={entry.picture} alt={entry.displayName}
                            className="relative w-11 h-11 rounded-full object-cover ring-2 ring-purple-500/30 shrink-0" 
                          />
                        </div>
                      ) : (
                        <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shrink-0 text-white">
                          <User className="w-5 h-5" />
                        </div>
                      )}

                      <div className="relative flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white truncate text-base">
                            {entry.displayName}
                            {entry.isYou && <span className="text-purple-400 text-xs ml-2">(you)</span>}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-purple-400/80 font-medium">Lv.{entry.level}</span>
                          <span className="text-xs text-white/30">{entry.levelTitle}</span>
                          {entry.streakDays >= 3 && (
                            <span className="flex items-center gap-1 text-xs text-orange-400">
                              <Flame className="w-3 h-3" />
                              {entry.streakDays}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="relative shrink-0 text-right">
                        <p className="text-2xl font-black animated-gradient-text leading-none">
                          {(xpMode === "weekly" ? entry.weeklyXP : entry.totalXP).toLocaleString()}
                        </p>
                        <p className="text-xs text-purple-400/60 mt-1 font-medium">XP</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-24 space-y-5">
                <div className="w-20 h-20 rounded-2xl glass-panel-glow flex items-center justify-center mx-auto">
                  <Crown className="w-10 h-10 text-white/20" />
                </div>
                <p className="text-white/40 text-base">{gt.leaderboard.empty}</p>
              </div>
            )}
          </>
        )}

        {/* CTA Button */}
        {tab !== "xp" && (tab === "global" ? (globalData ?? []) : (myData ?? [])).length > 0 && (
          <div className="mt-12 text-center">
            <Link href="/">
              <button className="group inline-flex items-center gap-3 px-10 py-5 rounded-2xl btn-neon text-white font-bold text-lg transition-all hover:scale-105">
                <Mic className="w-5 h-5" />
                {t.leaderboard.ctaSing}
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
