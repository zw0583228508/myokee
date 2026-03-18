interface Badge {
  badge_id: string;
  earned_at: string;
}

interface BadgeDef {
  id: string;
  icon: string;
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond";
}

interface BadgeGridProps {
  earnedBadges: Badge[];
  definitions: BadgeDef[];
  t: Record<string, string>;
}

const TIER_STYLES = {
  bronze: "border-amber-700/40 bg-amber-900/10",
  silver: "border-zinc-300/30 bg-zinc-400/5",
  gold: "border-yellow-400/40 bg-yellow-500/8",
  platinum: "border-cyan-400/40 bg-cyan-500/8",
  diamond: "border-violet-400/40 bg-violet-500/8",
};

const TIER_GLOW = {
  bronze: "",
  silver: "",
  gold: "shadow-[0_0_15px_rgba(234,179,8,0.1)]",
  platinum: "shadow-[0_0_15px_rgba(34,211,238,0.1)]",
  diamond: "shadow-[0_0_20px_rgba(139,92,246,0.15)]",
};

export function BadgeGrid({ earnedBadges, definitions, t }: BadgeGridProps) {
  const earnedIds = new Set(earnedBadges.map(b => b.badge_id));

  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
      {definitions.map((def) => {
        const earned = earnedIds.has(def.id);
        return (
          <div
            key={def.id}
            className={`relative flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all ${
              earned
                ? `${TIER_STYLES[def.tier]} ${TIER_GLOW[def.tier]}`
                : "border-white/5 bg-white/[0.02] opacity-30"
            }`}
            title={t[def.id] || def.id.replace(/_/g, " ")}
          >
            <span className="text-2xl">{def.icon}</span>
            <span className="text-[10px] text-white/50 text-center leading-tight truncate w-full">
              {t[def.id] || def.id.replace(/_/g, " ")}
            </span>
            {earned && (
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-background flex items-center justify-center">
                <span className="text-[8px] text-white">✓</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
