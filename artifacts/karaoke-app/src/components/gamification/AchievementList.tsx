import { Check } from "lucide-react";

interface Achievement {
  achievement_id: string;
  progress: number;
  target: number;
  completed_at: string | null;
}

interface AchievementDef {
  id: string;
  icon: string;
  target: number;
  xpReward: number;
}

interface AchievementListProps {
  achievements: Achievement[];
  definitions: AchievementDef[];
  t: Record<string, string>;
}

export function AchievementList({ achievements, definitions, t }: AchievementListProps) {
  const progressMap = new Map(achievements.map(a => [a.achievement_id, a]));

  return (
    <div className="space-y-3">
      {definitions.map((def) => {
        const ach = progressMap.get(def.id);
        const progress = ach?.progress || 0;
        const completed = ach?.completed_at != null;
        const pct = Math.min((progress / def.target) * 100, 100);

        return (
          <div
            key={def.id}
            className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl border transition-all ${
              completed
                ? "bg-green-500/5 border-green-500/20"
                : "bg-white/[0.02] border-white/8"
            }`}
          >
            <span className="text-2xl shrink-0">{def.icon}</span>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-white truncate">
                  {t[def.id] || def.id.replace(/_/g, " ")}
                </p>
                {completed && (
                  <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>
              <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    completed
                      ? "bg-green-500"
                      : "bg-gradient-to-r from-primary to-accent"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-white/30">
                  {progress} / {def.target}
                </span>
                <span className="text-[10px] text-yellow-400/60">
                  +{def.xpReward} XP
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
