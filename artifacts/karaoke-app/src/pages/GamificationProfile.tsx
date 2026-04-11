import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { ArrowLeft, Trophy, Award, Target, Loader2, Crown, Zap, User } from "lucide-react";
import { useGamificationProfile, useXPLeaderboard, useAwardXP } from "@/hooks/use-gamification";
import { useGamificationTranslations } from "@/hooks/use-gamification-translations";
import { useLang } from "@/contexts/LanguageContext";
import { XPProfileCard } from "@/components/gamification/XPProfileCard";
import { BadgeGrid } from "@/components/gamification/BadgeGrid";
import { AchievementList } from "@/components/gamification/AchievementList";
const MEDALS = ["🥇", "🥈", "🥉"];

export default function GamificationProfile() {
  const { t: { dir } } = useLang();
  const gt = useGamificationTranslations();
  const [tab, setTab] = useState<"profile" | "leaderboard">("profile");
  const [lbMode, setLbMode] = useState<"all" | "weekly">("all");

  const { data: profile, isLoading: loadingProfile } = useGamificationProfile();
  const { data: lbData, isLoading: loadingLb } = useXPLeaderboard(lbMode);
  const awardXP = useAwardXP();
  const dailyLoginSent = useRef(false);

  useEffect(() => {
    if (!dailyLoginSent.current && profile) {
      dailyLoginSent.current = true;
      awardXP.mutate({ action: "daily_login" });
    }
  }, [profile]);

  const tabs = [
    { key: "profile" as const, icon: <Award className="w-4 h-4" />, label: gt.xp.title },
    { key: "leaderboard" as const, icon: <Trophy className="w-4 h-4" />, label: gt.leaderboard.title },
  ];

  return (
    <div className="min-h-screen flex flex-col" dir={dir}>
      <div className="relative overflow-hidden py-12 sm:py-20 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-primary/[0.04] blur-[140px]" />

        <div className="relative z-10">
          <Link href="/">
            <button className="inline-flex items-center gap-1.5 text-sm text-white/25 hover:text-white/60 transition-colors mb-6">
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </Link>
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 border border-primary/15 flex items-center justify-center shadow-lg shadow-primary/10">
              <Zap className="w-6 h-6 text-primary drop-shadow-[0_0_8px_rgba(147,51,234,0.5)]" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold">XP & {gt.badges.title}</h1>
          </div>
        </div>
      </div>

      <div className="w-full max-w-2xl mx-auto px-4 mb-6">
        <div className="flex gap-1.5 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                tab === t.key
                  ? "bg-primary text-white shadow-[0_0_25px_rgba(147,51,234,.25)]"
                  : "text-white/30 hover:text-white/60"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full max-w-2xl mx-auto px-4 pb-20 flex-1">
        {tab === "profile" && (
          <>
            {loadingProfile ? (
              <div className="flex items-center justify-center py-20 gap-3 text-white/25">
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
                    <Award className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.4)]" />
                    {gt.badges.title}
                    <span className="text-xs text-white/20 font-normal">
                      ({profile.badges.length}/{profile.badgeDefinitions.length})
                    </span>
                  </h2>
                  <BadgeGrid
                    earnedBadges={profile.badges}
                    definitions={profile.badgeDefinitions}
                    t={gt.badges}
                  />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary drop-shadow-[0_0_6px_rgba(147,51,234,0.4)]" />
                    {gt.achievements.title}
                  </h2>
                  <AchievementList
                    achievements={profile.achievements}
                    definitions={profile.achievementDefinitions}
                    t={gt.achievements}
                  />
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
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    lbMode === mode
                      ? "bg-white/[0.06] text-white border border-white/10"
                      : "text-white/30 hover:text-white/60"
                  }`}
                >
                  {mode === "all" ? gt.leaderboard.allTime : gt.leaderboard.thisWeek}
                </button>
              ))}
            </div>

            {loadingLb ? (
              <div className="flex items-center justify-center py-20 gap-3 text-white/25">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : lbData?.leaderboard?.length > 0 ? (
              <div className="space-y-2">
                {lbData.yourRank && (
                  <div className="mb-4 px-4 py-3 rounded-2xl bg-primary/8 border border-primary/15 text-sm text-white/60">
                    {gt.leaderboard.yourRank}: <span className="font-bold text-white">#{lbData.yourRank}</span>
                  </div>
                )}

                {lbData.leaderboard.map((entry: any) => {
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
                          {(lbMode === "weekly" ? entry.weeklyXP : entry.totalXP).toLocaleString()}
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
      </div>
    </div>
  );
}
