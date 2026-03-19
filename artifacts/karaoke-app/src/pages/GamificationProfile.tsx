import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { ArrowLeft, Trophy, Award, Target, Loader2, Crown, Zap, User, Sparkles, Flame } from "lucide-react";
import { useGamificationProfile, useXPLeaderboard, useAwardXP } from "@/hooks/use-gamification";
import { useGamificationTranslations } from "@/hooks/use-gamification-translations";
import { useLang } from "@/contexts/LanguageContext";
import { XPProfileCard } from "@/components/gamification/XPProfileCard";
import { BadgeGrid } from "@/components/gamification/BadgeGrid";
import { AchievementList } from "@/components/gamification/AchievementList";

const MEDALS = ["🥇", "🥈", "🥉"];

// Animated sparkles component
function FloatingSparkles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 60}%`,
            animation: `sparkle ${2 + Math.random() * 2}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        >
          <Sparkles className="w-3 h-3 text-purple-400/30" />
        </div>
      ))}
    </div>
  );
}

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
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden py-14 sm:py-20 text-center">
        <FloatingSparkles />
        
        {/* Multi-layered background */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full bg-purple-500/15 blur-[120px] animate-pulse" />
        <div className="absolute top-10 right-1/4 w-64 h-64 rounded-full bg-blue-500/10 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative z-10">
          <Link href="/">
            <button className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/80 transition-colors mb-8 glass-panel rounded-full px-4 py-2 border-white/10">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          
          {/* XP Icon with glow */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 blur-xl opacity-60" />
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 flex items-center justify-center shadow-2xl shadow-purple-500/30">
                <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-black mb-3">
            <span className="text-white">XP &</span>{" "}
            <span className="animated-gradient-text">{gt.badges.title}</span>
          </h1>
          <p className="text-white/40 text-lg">Level up, earn badges, and compete globally</p>
        </div>
      </div>

      {/* Premium Tab Navigation */}
      <div className="w-full max-w-3xl mx-auto px-4 mb-8">
        <div className="flex gap-2 p-1.5 rounded-2xl glass-panel-glow border-purple-500/20">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`relative flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t.key
                  ? "text-white"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {tab === t.key && (
                <>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500" />
                  <div className="absolute inset-0 rounded-xl bg-purple-500/50 blur-xl" />
                </>
              )}
              <span className="relative">{t.icon}</span>
              <span className="relative">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="w-full max-w-3xl mx-auto px-4 pb-20 flex-1">
        {/* Profile Tab */}
        {tab === "profile" && (
          <>
            {loadingProfile ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-white/30">
                <div className="w-16 h-16 rounded-2xl glass-panel-glow flex items-center justify-center">
                  <Loader2 className="w-7 h-7 animate-spin text-purple-400" />
                </div>
              </div>
            ) : profile ? (
              <div className="space-y-10">
                {/* XP Profile Card */}
                <XPProfileCard
                  totalXP={profile.totalXP}
                  level={profile.level}
                  levelTitle={profile.levelTitle}
                  weeklyXP={profile.weeklyXP}
                  streakDays={profile.streakDays}
                  xpForCurrentLevel={profile.xpForCurrentLevel}
                  xpForNextLevel={profile.xpForNextLevel}
                />

                {/* Badges Section */}
                <div className="glass-panel rounded-3xl p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/30">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    {gt.badges.title}
                    <span className="text-sm text-purple-400/60 font-normal ml-auto">
                      {profile.badges.length}/{profile.badgeDefinitions.length}
                    </span>
                  </h2>
                  <BadgeGrid
                    earnedBadges={profile.badges}
                    definitions={profile.badgeDefinitions}
                    t={gt.badges}
                  />
                </div>

                {/* Achievements Section */}
                <div className="glass-panel rounded-3xl p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                      <Target className="w-5 h-5 text-white" />
                    </div>
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

        {/* Leaderboard Tab */}
        {tab === "leaderboard" && (
          <>
            {/* Mode Switcher */}
            <div className="flex gap-2 mb-6">
              {(["all", "weekly"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setLbMode(mode)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    lbMode === mode
                      ? "glass-panel-glow text-purple-300 border-purple-500/30"
                      : "text-white/40 hover:text-white/70 border border-transparent"
                  }`}
                >
                  {mode === "all" ? gt.leaderboard.allTime : gt.leaderboard.thisWeek}
                </button>
              ))}
            </div>

            {loadingLb ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-white/30">
                <div className="w-16 h-16 rounded-2xl glass-panel-glow flex items-center justify-center">
                  <Loader2 className="w-7 h-7 animate-spin text-purple-400" />
                </div>
              </div>
            ) : lbData?.leaderboard?.length > 0 ? (
              <div className="space-y-3">
                {/* Your Rank Banner */}
                {lbData.yourRank && (
                  <div className="mb-6 px-5 py-4 rounded-2xl glass-panel-glow border-purple-500/30 text-base text-white/70 flex items-center gap-3">
                    <Crown className="w-5 h-5 text-purple-400" />
                    {gt.leaderboard.yourRank}: <span className="font-bold text-purple-300 text-xl">#{lbData.yourRank}</span>
                  </div>
                )}

                {/* Leaderboard Entries */}
                {lbData.leaderboard.map((entry: any) => {
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
                            className="relative w-11 h-11 rounded-full object-cover ring-2 ring-purple-500/30" 
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
                          {(lbMode === "weekly" ? entry.weeklyXP : entry.totalXP).toLocaleString()}
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
      </div>
    </div>
  );
}
