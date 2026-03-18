import { Zap, Flame, TrendingUp } from "lucide-react";

interface XPProfileCardProps {
  totalXP: number;
  level: number;
  levelTitle: string;
  weeklyXP: number;
  streakDays: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
}

const LEVEL_COLORS: Record<number, string> = {
  1: "from-zinc-400 to-zinc-500",
  2: "from-zinc-300 to-zinc-400",
  3: "from-green-400 to-emerald-500",
  4: "from-green-400 to-emerald-500",
  5: "from-blue-400 to-cyan-500",
  6: "from-blue-400 to-cyan-500",
  7: "from-violet-400 to-purple-500",
  8: "from-violet-400 to-purple-500",
  9: "from-purple-400 to-pink-500",
  10: "from-yellow-400 to-orange-500",
  15: "from-orange-400 to-red-500",
  20: "from-red-400 to-rose-500",
  25: "from-rose-400 to-pink-500",
  30: "from-amber-300 to-yellow-500",
};

function getLevelColor(level: number): string {
  const keys = Object.keys(LEVEL_COLORS).map(Number).sort((a, b) => b - a);
  for (const k of keys) {
    if (level >= k) return LEVEL_COLORS[k];
  }
  return LEVEL_COLORS[1];
}

export function XPProfileCard({ totalXP, level, levelTitle, weeklyXP, streakDays, xpForCurrentLevel, xpForNextLevel }: XPProfileCardProps) {
  const xpInLevel = totalXP - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const progress = xpNeeded > 0 ? Math.min((xpInLevel / xpNeeded) * 100, 100) : 100;
  const gradientClass = getLevelColor(level);

  return (
    <div className="relative rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradientClass}`} />

      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradientClass} flex items-center justify-center text-2xl font-black text-white shadow-lg`}>
            {level}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">{levelTitle}</h3>
            <p className="text-white/40 text-sm">{totalXP.toLocaleString()} XP</p>
          </div>
        </div>

        <div className="mb-5">
          <div className="flex justify-between text-xs text-white/40 mb-2">
            <span>Level {level}</span>
            <span>Level {level + 1}</span>
          </div>
          <div className="h-3 bg-white/8 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${gradientClass} transition-all duration-700 ease-out`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-white/30 mt-1.5">
            {xpInLevel.toLocaleString()} / {xpNeeded.toLocaleString()} XP
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/5 border border-white/8">
            <Zap className="w-4 h-4 text-yellow-400" />
            <div>
              <p className="text-xs text-white/40">Weekly</p>
              <p className="text-sm font-bold text-white">{weeklyXP.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/5 border border-white/8">
            <Flame className={`w-4 h-4 ${streakDays >= 3 ? "text-orange-400" : "text-white/30"}`} />
            <div>
              <p className="text-xs text-white/40">Streak</p>
              <p className="text-sm font-bold text-white">{streakDays} {streakDays === 1 ? "day" : "days"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
