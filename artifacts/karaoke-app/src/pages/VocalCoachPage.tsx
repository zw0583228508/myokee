import { useLang } from "@/contexts/LanguageContext";
import { VocalCoachProgress } from "@/components/karaoke/VocalCoach";
import { Mic, TrendingUp } from "lucide-react";

const T: Record<string, Record<string, string>> = {
  en: { title: "AI Vocal Coach", subtitle: "Track your singing progress over time" },
  he: { title: "מאמן שירה AI", subtitle: "עקוב אחרי ההתקדמות שלך בשירה" },
};

export default function VocalCoachPage() {
  const { lang } = useLang();
  const t = T[lang] || T.en;
  const isRtl = lang === "he" || lang === "ar";

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8" dir={isRtl ? "rtl" : "ltr"}>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/20 mb-4">
          <Mic className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">{t.title}</h1>
        <p className="text-white/50">{t.subtitle}</p>
      </div>
      <VocalCoachProgress />
    </div>
  );
}
