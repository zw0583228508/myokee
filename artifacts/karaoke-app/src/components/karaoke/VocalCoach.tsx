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
  ar: { title: "مدرب الغناء AI", tips: "نصائح لهذا الأداء", progress: "تقدمك", avgScore: "متوسط النتيجة", avgPitch: "متوسط الطبقة", avgTiming: "متوسط التوقيت", bestScore: "أفضل نتيجة", totalPerf: "إجمالي العروض", improvement: "التحسن", pitch: "الطبقة", timing: "التوقيت", coverage: "الكلمات", overall: "إجمالي", noData: "غنِّ المزيد لتتبع تقدمك!", improving: "تحسن", declining: "تراجع", stable: "مستقر" },
  ko: { title: "AI 보컬 코치", tips: "이 공연의 팁", progress: "내 진행 상황", avgScore: "평균 점수", avgPitch: "평균 음정", avgTiming: "평균 타이밍", bestScore: "최고 점수", totalPerf: "총 공연", improvement: "향상", pitch: "음정", timing: "타이밍", coverage: "가사", overall: "전체", noData: "진행 상황을 보려면 더 많이 노래하세요!", improving: "향상 중", declining: "하락 중", stable: "안정적" },
  ja: { title: "AIボーカルコーチ", tips: "このパフォーマンスのヒント", progress: "あなたの進歩", avgScore: "平均スコア", avgPitch: "平均ピッチ", avgTiming: "平均タイミング", bestScore: "最高スコア", totalPerf: "総パフォーマンス", improvement: "改善", pitch: "ピッチ", timing: "タイミング", coverage: "歌詞", overall: "総合", noData: "もっと歌って進歩を確認しましょう！", improving: "改善中", declining: "低下中", stable: "安定" },
  zh: { title: "AI声乐教练", tips: "本次演出的建议", progress: "你的进步", avgScore: "平均分", avgPitch: "平均音准", avgTiming: "平均节奏", bestScore: "最高分", totalPerf: "总演出", improvement: "进步", pitch: "音准", timing: "节奏", coverage: "歌词", overall: "综合", noData: "多唱几首歌来查看你的进步！", improving: "进步中", declining: "下降中", stable: "稳定" },
  es: { title: "Entrenador vocal AI", tips: "Consejos para esta actuación", progress: "Tu progreso", avgScore: "Puntuación media", avgPitch: "Tono medio", avgTiming: "Tiempo medio", bestScore: "Mejor puntuación", totalPerf: "Total actuaciones", improvement: "Mejora", pitch: "Tono", timing: "Tiempo", coverage: "Letra", overall: "General", noData: "¡Canta más canciones para ver tu progreso!", improving: "mejorando", declining: "bajando", stable: "estable" },
  ru: { title: "AI Вокальный тренер", tips: "Советы по выступлению", progress: "Ваш прогресс", avgScore: "Средний балл", avgPitch: "Средняя высота", avgTiming: "Среднее время", bestScore: "Лучший балл", totalPerf: "Всего выступлений", improvement: "Улучшение", pitch: "Высота", timing: "Ритм", coverage: "Слова", overall: "Общее", noData: "Пойте больше, чтобы увидеть прогресс!", improving: "улучшается", declining: "снижается", stable: "стабильно" },
  fr: { title: "Coach vocal AI", tips: "Conseils pour cette performance", progress: "Votre progrès", avgScore: "Score moyen", avgPitch: "Tonalité moyenne", avgTiming: "Timing moyen", bestScore: "Meilleur score", totalPerf: "Total performances", improvement: "Amélioration", pitch: "Tonalité", timing: "Timing", coverage: "Paroles", overall: "Global", noData: "Chantez plus pour voir votre progrès !", improving: "en amélioration", declining: "en baisse", stable: "stable" },
  de: { title: "AI Gesangscoach", tips: "Tipps für diesen Auftritt", progress: "Dein Fortschritt", avgScore: "Durchschnittspunkte", avgPitch: "Durchschnittston", avgTiming: "Durchschnittszeit", bestScore: "Bestpunkte", totalPerf: "Gesamtauftritte", improvement: "Verbesserung", pitch: "Tonhöhe", timing: "Timing", coverage: "Text", overall: "Gesamt", noData: "Singe mehr um deinen Fortschritt zu sehen!", improving: "verbessernd", declining: "abnehmend", stable: "stabil" },
  th: { title: "โค้ชเสียง AI", tips: "เคล็ดลับสำหรับการแสดงนี้", progress: "ความคืบหน้าของคุณ", avgScore: "คะแนนเฉลี่ย", avgPitch: "ระดับเสียงเฉลี่ย", avgTiming: "จังหวะเฉลี่ย", bestScore: "คะแนนสูงสุด", totalPerf: "การแสดงทั้งหมด", improvement: "การพัฒนา", pitch: "ระดับเสียง", timing: "จังหวะ", coverage: "เนื้อเพลง", overall: "รวม", noData: "ร้องเพลงเพิ่มเพื่อดูความคืบหน้า!", improving: "กำลังพัฒนา", declining: "ลดลง", stable: "คงที่" },
  vi: { title: "Huấn luyện viên AI", tips: "Gợi ý cho buổi biểu diễn này", progress: "Tiến trình của bạn", avgScore: "Điểm TB", avgPitch: "Cao độ TB", avgTiming: "Nhịp TB", bestScore: "Điểm cao nhất", totalPerf: "Tổng biểu diễn", improvement: "Cải thiện", pitch: "Cao độ", timing: "Nhịp", coverage: "Lời", overall: "Tổng", noData: "Hát thêm để xem tiến trình của bạn!", improving: "đang tiến bộ", declining: "đang giảm", stable: "ổn định" },
  fil: { title: "AI Vocal Coach", tips: "Mga tip para sa performance na ito", progress: "Ang iyong progreso", avgScore: "Avg Puntos", avgPitch: "Avg Tono", avgTiming: "Avg Timing", bestScore: "Pinakamataas", totalPerf: "Kabuuang performance", improvement: "Pagpapabuti", pitch: "Tono", timing: "Timing", coverage: "Lyrics", overall: "Kabuuan", noData: "Kumanta pa para makita ang iyong progreso!", improving: "bumubuti", declining: "bumababa", stable: "matatag" },
  id: { title: "Pelatih Vokal AI", tips: "Tips untuk penampilan ini", progress: "Kemajuan Anda", avgScore: "Rata-rata Skor", avgPitch: "Rata-rata Nada", avgTiming: "Rata-rata Timing", bestScore: "Skor Terbaik", totalPerf: "Total Penampilan", improvement: "Peningkatan", pitch: "Nada", timing: "Timing", coverage: "Lirik", overall: "Keseluruhan", noData: "Nyanyikan lebih banyak lagu untuk melihat kemajuan!", improving: "meningkat", declining: "menurun", stable: "stabil" },
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
