import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { ArrowLeft, Trophy, Award, Target, Loader2, Crown, Zap, User } from "lucide-react";
import { useGamificationProfile, useXPLeaderboard, useAwardXP } from "@/hooks/use-gamification";
import { useGamificationTranslations } from "@/hooks/use-gamification-translations";
import { useLang } from "@/contexts/LanguageContext";
import { XPProfileCard } from "@/components/gamification/XPProfileCard";
import { BadgeGrid } from "@/components/gamification/BadgeGrid";
import { AchievementList } from "@/components/gamification/AchievementList";
import { buildDemoGamificationProfile, buildDemoXPLeaderboard } from "@/lib/demoData";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function GamificationProfile() {
  const { t: { dir } } = useLang();
  const gt = useGamificationTranslations();
  const [tab, setTab] = useState<"profile" | "leaderboard">("profile");
  const [lbMode, setLbMode] = useState<"all" | "weekly">("all");

  const { data: realProfile, isLoading: loadingProfile } = useGamificationProfile();
  const { data: realLbData, isLoading: loadingLb } = useXPLeaderboard(lbMode);
  // When backend has nothing yet (first-time visitor), substitute a demo
  // profile + XP leaderboard so the page never looks empty.
  const profile = realProfile ?? (loadingProfile ? null : buildDemoGamificationProfile());
  const lbData = (realLbData?.leaderboard?.length ?? 0) > 0
    ? realLbData
    : buildDemoXPLeaderboard(lbMode);
  const awardXP = useAwardXP();
  const dailyLoginSent = useRef(false);

  useEffect(() => {
    // Only award daily-login XP for the real user profile, never for demo
    // fallback (which would be a no-op against the backend anyway).
    if (!dailyLoginSent.current && realProfile) {
      dailyLoginSent.current = true;
      awardXP.mutate({ action: "daily_login" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realProfile]);

  const tabs = [
    { key: "profile" as const, icon: Award, label: gt.xp.title },
    { key: "leaderboard" as const, icon: Trophy, label: gt.leaderboard.title },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--ds-bg-app)]" dir={dir}>
      <div className="relative overflow-hidden py-12 sm:py-20 text-center">
        <div className="absolute inset-0 -z-10 ds-bg-galaxy" />
        <div className="absolute inset-0 -z-10 ds-bg-aurora opacity-50" />
        <div className="ds-orb ds-orb-violet absolute -top-32 left-1/2 -translate-x-1/2 w-[520px] h-[520px] opacity-50 -z-10" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#050510]/40 via-transparent to-[var(--ds-bg-app)]" />

        <div className="relative ds-reveal">
          <Link href="/">
            <button className="inline-flex items-center gap-1.5 text-sm text-white/45 hover:text-white transition-colors mb-6">
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </Link>
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-14 h-14 rounded-2xl ds-icon-orb">
              <Zap className="w-7 h-7 text-white drop-shadow-lg" />
            </div>
            <h1 className="ds-page-title font-bold text-white">XP & {gt.badges.title}</h1>
          </div>
        </div>
      </div>

      <div className="w-full max-w-2xl mx-auto px-4 mb-6">
        <div className="flex gap-1.5 p-1.5 rounded-2xl ds-glass">
          {tabs.map((tb) => {
            const Icon = tb.icon;
            const isActive = tab === tb.key;
            return (
              <button
                key={tb.key}
                onClick={() => setTab(tb.key)}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive ? "text-white" : "text-white/45 hover:text-white/75"
                }`}
                style={isActive ? { background: "var(--ds-grad-primary)", boxShadow: "var(--ds-glow-violet)" } : {}}
              >
                <Icon className="w-4 h-4" />{tb.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full max-w-2xl mx-auto px-4 pb-20 flex-1">
        {tab === "profile" && (
          <>
            {loadingProfile ? (
              <div className="flex items-center justify-center py-20 text-white/45">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : profile ? (
              <div className="space-y-8">
                <XPProfileCard
                  totalXP={profile.totalXP}
                  level={profile.level}
                  levelTitle={profile.levelTitle}
                  weeklyXP={profile.weeklyXP}
                  streakDays={profile.streakDays}
                  xpForCurrentLevel={profile.xpForCurrentLevel}
                  xpForNextLevel={profile.xpForNextLevel}
                />

                <div>
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,.5)]" />
                    {gt.badges.title}
                    <span className="text-xs text-white/35 font-normal ml-1">({profile.badges.length}/{profile.badgeDefinitions.length})</span>
                  </h2>
                  <BadgeGrid earnedBadges={profile.badges} definitions={profile.badgeDefinitions} t={gt.badges} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-violet-300 drop-shadow-[0_0_8px_rgba(167,139,250,.5)]" />
                    {gt.achievements.title}
                  </h2>
                  <AchievementList achievements={profile.achievements} definitions={profile.achievementDefinitions} t={gt.achievements} />
                </div>
              </div>
            ) : null}
          </>
        )}

        {tab === "leaderboard" && (
          <>
            <div className="flex gap-2 mb-6">
              {(["all", "weekly"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setLbMode(mode)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    lbMode === mode ? "ds-glass text-white border-white/15" : "text-white/45 hover:text-white/75"
                  }`}
                >
                  {mode === "all" ? gt.leaderboard.allTime : gt.leaderboard.thisWeek}
                </button>
              ))}
            </div>

            {loadingLb ? (
              <div className="flex items-center justify-center py-20 text-white/45">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : lbData?.leaderboard?.length > 0 ? (
              <div className="space-y-2.5">
                {lbData.yourRank && (
                  <div className="mb-4 px-4 py-3 rounded-2xl bg-violet-500/10 border border-violet-400/25 text-sm text-white/70">
                    {gt.leaderboard.yourRank}: <span className="font-bold ds-grad-text text-base">#{lbData.yourRank}</span>
                  </div>
                )}
                {lbData.leaderboard.map((entry: any, i: number) => {
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
                          {(lbMode === "weekly" ? entry.weeklyXP : entry.totalXP).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-white/35 mt-0.5">XP</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 space-y-3">
                <Crown className="w-12 h-12 text-white/15 mx-auto" />
                <p className="text-white/45 text-sm">{gt.leaderboard.empty}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
