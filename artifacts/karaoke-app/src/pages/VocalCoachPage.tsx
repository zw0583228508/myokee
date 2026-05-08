import { useState } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { VocalCoachProgress, VocalCoachTips } from "@/components/karaoke/VocalCoach";
import { useVocalProgress } from "@/hooks/use-vocal-coach";
import { Mic, ChevronDown, Sparkles } from "lucide-react";

const T: Record<string, Record<string, string>> = {
  en: { title: "AI Vocal Coach", subtitle: "Track your singing progress and get AI tips", recentPerf: "Get Tips for a Performance", selectPerf: "Select a performance below" },
  he: { title: "מאמן שירה AI", subtitle: "עקוב אחרי ההתקדמות שלך וקבל טיפים מ-AI", recentPerf: "קבל טיפים לביצוע", selectPerf: "בחר ביצוע מהרשימה" },
  ar: { title: "مدرب الغناء AI", subtitle: "تتبع تقدمك في الغناء واحصل على نصائح AI", recentPerf: "احصل على نصائح للأداء", selectPerf: "اختر أداءً أدناه" },
  ko: { title: "AI 보컬 코치", subtitle: "노래 진행 상황을 추적하고 AI 팁을 받으세요", recentPerf: "공연 팁 받기", selectPerf: "아래에서 공연을 선택하세요" },
  ja: { title: "AIボーカルコーチ", subtitle: "歌の進歩を追跡してAIのヒントを得よう", recentPerf: "パフォーマンスのヒントを取得", selectPerf: "下のパフォーマンスを選択" },
  zh: { title: "AI声乐教练", subtitle: "追踪你的歌唱进步并获取AI建议", recentPerf: "获取演出建议", selectPerf: "选择下方的演出" },
  es: { title: "Entrenador Vocal AI", subtitle: "Sigue tu progreso vocal y obtén consejos de IA", recentPerf: "Obtener consejos", selectPerf: "Selecciona una actuación abajo" },
  ru: { title: "AI Вокальный тренер", subtitle: "Отслеживайте прогресс и получайте советы от AI", recentPerf: "Получить советы", selectPerf: "Выберите выступление ниже" },
  fr: { title: "Coach Vocal AI", subtitle: "Suivez vos progrès et obtenez des conseils IA", recentPerf: "Obtenir des conseils", selectPerf: "Sélectionnez une performance ci-dessous" },
  de: { title: "AI Gesangscoach", subtitle: "Verfolge deinen Fortschritt und erhalte KI-Tipps", recentPerf: "Tipps erhalten", selectPerf: "Wähle einen Auftritt unten" },
  th: { title: "โค้ชเสียง AI", subtitle: "ติดตามความก้าวหน้าและรับเคล็ดลับจาก AI", recentPerf: "รับเคล็ดลับ", selectPerf: "เลือกการแสดงด้านล่าง" },
  vi: { title: "Huấn luyện viên AI", subtitle: "Theo dõi tiến trình và nhận gợi ý từ AI", recentPerf: "Nhận gợi ý", selectPerf: "Chọn buổi biểu diễn bên dưới" },
  fil: { title: "AI Vocal Coach", subtitle: "Subaybayan ang iyong progreso at makakuha ng AI tips", recentPerf: "Kumuha ng tips", selectPerf: "Pumili ng performance sa ibaba" },
  id: { title: "Pelatih Vokal AI", subtitle: "Pantau kemajuan Anda dan dapatkan tips AI", recentPerf: "Dapatkan tips", selectPerf: "Pilih penampilan di bawah" },
};

export default function VocalCoachPage() {
  const { lang } = useLang();
  const t = T[lang] || T.en;
  const isRtl = lang === "he" || lang === "ar";
  const { data } = useVocalProgress();
  const [selectedPerfId, setSelectedPerfId] = useState<number | null>(null);

  const performances = data?.performances || [];

  return (
    <div className="min-h-screen bg-[var(--ds-bg-app)] relative" dir={isRtl ? "rtl" : "ltr"}>
      <div className="absolute top-0 inset-x-0 h-[420px] -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 ds-bg-aurora opacity-50" />
        <div className="ds-orb ds-orb-cyan absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050510]/30 via-transparent to-[#050510]" />
      </div>

      <div className="w-full max-w-3xl mx-auto px-4 py-12 sm:py-16">
        <div className="text-center mb-10 ds-reveal">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ds-icon-orb"
               style={{ background: "linear-gradient(135deg,#22D3EE,#3B82F6)", boxShadow: "0 0 40px rgba(59,130,246,.55)" }}>
            <Mic className="w-8 h-8 text-white drop-shadow-lg" />
          </div>
          <div className="inline-flex items-center gap-1.5 ds-glass rounded-full px-3 py-1 text-[11px] font-bold text-cyan-300 uppercase tracking-wider mb-3">
            <Sparkles className="w-3 h-3" />AI Powered
          </div>
          <h1 className="ds-page-title font-bold text-white mb-2">{t.title}</h1>
          <p className="text-white/55 text-base">{t.subtitle}</p>
        </div>

        <VocalCoachProgress />

        {performances.length > 0 && (
          <div className="mt-10">
            <h3 className="text-lg font-bold text-white mb-1">{t.recentPerf}</h3>
            <p className="text-sm text-white/45 mb-4">{t.selectPerf}</p>
            <div className="space-y-2 mb-4">
              {performances.slice(-10).reverse().map((p: any, i: number) => {
                const scoreColor = p.score >= 90 ? "text-emerald-300" : p.score >= 70 ? "text-amber-300" : "text-orange-300";
                const sel = selectedPerfId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPerfId(sel ? null : p.id)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-start transition-all duration-300 ds-reveal ${
                      sel ? "ds-card border-cyan-400/30 bg-cyan-500/[0.06]" : "ds-card hover:border-white/15"
                    }`}
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <span className={`text-xl font-black w-12 text-center ${scoreColor} drop-shadow-[0_0_8px_currentColor]`} style={{ filter: "brightness(1.1)" }}>{p.score}</span>
                    <span className="text-sm text-white/75 flex-1 truncate font-medium" dir="auto">{p.song_name || "Unknown"}</span>
                    <ChevronDown className={`w-4 h-4 text-white/30 transition-transform duration-300 ${sel ? "rotate-180 text-cyan-300" : ""}`} />
                  </button>
                );
              })}
            </div>

            {selectedPerfId && <VocalCoachTips performanceId={selectedPerfId} />}
          </div>
        )}
      </div>
    </div>
  );
}
