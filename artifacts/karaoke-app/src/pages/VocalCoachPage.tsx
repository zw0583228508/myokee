import { useState } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { VocalCoachProgress, VocalCoachTips } from "@/components/karaoke/VocalCoach";
import { useVocalProgress } from "@/hooks/use-vocal-coach";
import { Mic, ChevronDown } from "lucide-react";

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
    <div className="w-full max-w-3xl mx-auto px-4 py-10" dir={isRtl ? "rtl" : "ltr"}>
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/15 mb-4">
          <Mic className="w-8 h-8 text-white drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2 font-display">{t.title}</h1>
        <p className="text-white/30">{t.subtitle}</p>
      </div>

      <VocalCoachProgress />

      {performances.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-white mb-3 font-display">{t.recentPerf}</h3>
          <p className="text-sm text-white/30 mb-3">{t.selectPerf}</p>
          <div className="space-y-2 mb-4">
            {performances.slice(-10).reverse().map((p: any) => {
              const scoreColor = p.score >= 90 ? "text-green-400" : p.score >= 70 ? "text-yellow-400" : "text-orange-400";
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPerfId(selectedPerfId === p.id ? null : p.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-start transition-all duration-300 ${
                    selectedPerfId === p.id ? "bg-primary/12 border border-primary/25" : "glass-card hover:bg-white/[0.04]"
                  }`}
                >
                  <span className={`text-lg font-bold w-10 text-center ${scoreColor}`} style={{ filter: "brightness(1.1)" }}>{p.score}</span>
                  <span className="text-sm text-white/60 flex-1 truncate">{p.song_name || "Unknown"}</span>
                  <ChevronDown className={`w-4 h-4 text-white/20 transition-transform duration-300 ${selectedPerfId === p.id ? "rotate-180" : ""}`} />
                </button>
              );
            })}
          </div>

          {selectedPerfId && <VocalCoachTips performanceId={selectedPerfId} />}
        </div>
      )}
    </div>
  );
}
