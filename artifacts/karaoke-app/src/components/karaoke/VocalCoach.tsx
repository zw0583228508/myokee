import { useLang } from "@/contexts/LanguageContext";
import { useVocalTips, useVocalProgress } from "@/hooks/use-vocal-coach";
import { Lightbulb, TrendingUp, Target, Music2, Award, ArrowUp, ArrowDown, Minus } from "lucide-react";

const T: Record<string, Record<string, string>> = {
  en: {
    title: "AI Vocal Coach",
    tips: "Tips for this performance",
    progress: "Your Progress",
    avgScore: "Avg Score",
    avgPitch: "Avg Pitch",
    avgTiming: "Avg Timing",
    bestScore: "Best Score",
    totalPerf: "Total Performances",
    improvement: "Improvement",
    pitch: "Pitch",
    timing: "Timing",
    coverage: "Lyrics",
    overall: "Overall",
    noData: "Sing more songs to see your progress!",
    improving: "improving",
    declining: "declining",
    stable: "stable",
  },
  he: {
    title: "מאמן שירה AI",
    tips: "טיפים לביצוע הזה",
    progress: "ההתקדמות שלך",
    avgScore: "ציון ממוצע",
    avgPitch: "טון ממוצע",
    avgTiming: "תזמון ממוצע",
    bestScore: "ציון הכי גבוה",
    totalPerf: "סה\"כ ביצועים",
    improvement: "שיפור",
    pitch: "טון",
    timing: "תזמון",
    coverage: "מילים",
    overall: "כללי",
    noData: "שר עוד שירים כדי לראות את ההתקדמות שלך!",
    improving: "בשיפור",
    declining: "בירידה",
    stable: "יציב",
  },
};

const CATEGORY_ICONS: Record<string, any> = {
  pitch: Music2,
  timing: Target,
  coverage: Lightbulb,
  overall: Award,
};

const SEVERITY_COLORS: Record<string, string> = {
  praise: "border-green-500/30 bg-green-500/5",
  suggestion: "border-blue-500/30 bg-blue-500/5",
  warning: "border-orange-500/30 bg-orange-500/5",
};

const SEVERITY_TEXT: Record<string, string> = {
  praise: "text-green-400",
  suggestion: "text-blue-400",
  warning: "text-orange-400",
};

export function VocalCoachTips({ performanceId }: { performanceId: number }) {
  const { lang } = useLang();
  const t = T[lang] || T.en;
  const isHe = lang === "he";
  const { data, isLoading } = useVocalTips(performanceId);

  if (isLoading) return <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />;
  if (!data?.tips) return null;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-yellow-400" />{t.tips}
      </h3>
      <div className="space-y-3">
        {data.tips.map((tip: any, i: number) => {
          const Icon = CATEGORY_ICONS[tip.category] || Lightbulb;
          return (
            <div key={i} className={`border rounded-xl p-4 ${SEVERITY_COLORS[tip.severity] || ""}`}>
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${SEVERITY_TEXT[tip.severity] || "text-white/40"}`} />
                <div>
                  <span className={`text-xs font-medium uppercase tracking-wider ${SEVERITY_TEXT[tip.severity]}`}>
                    {t[tip.category as keyof typeof t] || tip.category}
                  </span>
                  <p className="text-sm text-white/80 mt-1">{isHe ? tip.tipHe : tip.tip}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function VocalCoachProgress() {
  const { lang } = useLang();
  const t = T[lang] || T.en;
  const isRtl = lang === "he" || lang === "ar";
  const { data, isLoading } = useVocalProgress();

  if (isLoading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  if (!data?.stats) {
    return (
      <div className="text-center py-12">
        <TrendingUp className="w-12 h-12 text-white/20 mx-auto mb-4" />
        <p className="text-white/40">{t.noData}</p>
      </div>
    );
  }

  const { stats, performances } = data;
  const ImprovementIcon = stats.improvement > 0 ? ArrowUp : stats.improvement < 0 ? ArrowDown : Minus;
  const improvementColor = stats.improvement > 0 ? "text-green-400" : stats.improvement < 0 ? "text-red-400" : "text-white/40";
  const improvementLabel = stats.improvement > 0 ? t.improving : stats.improvement < 0 ? t.declining : t.stable;

  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {[
          { label: t.avgScore, value: stats.avgScore, color: "text-primary" },
          { label: t.avgPitch, value: stats.avgPitch, color: "text-blue-400" },
          { label: t.avgTiming, value: stats.avgTiming, color: "text-green-400" },
          { label: t.bestScore, value: stats.bestScore, color: "text-yellow-400" },
          { label: t.totalPerf, value: stats.totalPerformances, color: "text-white" },
          { label: t.improvement, value: `${stats.improvement > 0 ? "+" : ""}${stats.improvement}`, color: improvementColor },
        ].map(s => (
          <div key={s.label} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-white/40 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {performances.length > 1 && (
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
          <h4 className="text-sm font-medium text-white/60 mb-3 flex items-center gap-2">
            <ImprovementIcon className={`w-4 h-4 ${improvementColor}`} />
            {improvementLabel} ({stats.improvement > 0 ? "+" : ""}{stats.improvement} pts)
          </h4>
          <div className="flex items-end gap-1 h-24">
            {performances.map((p: any, i: number) => {
              const height = Math.max(5, (p.score / 100) * 100);
              const color = p.score >= 90 ? "bg-green-400" : p.score >= 70 ? "bg-yellow-400" : p.score >= 50 ? "bg-orange-400" : "bg-red-400";
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-t ${color} opacity-70 hover:opacity-100 transition-opacity relative group`}
                  style={{ height: `${height}%` }}
                  title={`${p.song_name}: ${p.score}`}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-white/50 hidden group-hover:block whitespace-nowrap">
                    {p.score}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
