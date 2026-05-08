import { Upload as UploadIcon, Zap, Sparkles, Wand2, Music, Mic } from "lucide-react";
import { FileUpload } from "@/components/karaoke/FileUpload";
import { useLang } from "@/contexts/LanguageContext";
import { useNoIndex } from "@/hooks/use-noindex";

export default function Upload() {
  useNoIndex();
  const { t, lang } = useLang();

  const i18n = {
    badge:
      lang === "he" ? "סטודיו AI"
      : lang === "ar" ? "استوديو AI"
      : "AI Karaoke Studio",
    perks: [
      lang === "he" ? "הסרת ווקאל מקצועית" : lang === "ar" ? "إزالة الصوت الاحترافية" : "Pro vocal removal",
      lang === "he" ? "מילים מסונכרנות"     : lang === "ar" ? "كلمات متزامنة"           : "Synced lyrics",
      lang === "he" ? "וידאו במה קולנועי"   : lang === "ar" ? "فيديو سينمائي للمسرح"    : "Cinematic stage video",
    ],
  };

  return (
    <main id="main-content" className="relative min-h-screen py-10 sm:py-16 overflow-hidden bg-[var(--ds-bg-app)]" dir={t.dir}>
      {/* Cinematic studio background */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 ds-bg-aurora opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050510]/20 via-[#050510]/60 to-[#050510]" />
        <div className="ds-orb ds-orb-violet absolute -top-32 left-1/4 w-[480px] h-[480px] opacity-50" />
        <div className="ds-orb ds-orb-cyan   absolute top-1/3 -right-32 w-[420px] h-[420px] opacity-45" style={{ animationDelay: "2s" }} />
        <div className="ds-orb ds-orb-pink   absolute bottom-0 left-10 w-[360px] h-[360px] opacity-35" style={{ animationDelay: "4s" }} />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)`,
          backgroundSize: "84px 84px",
          maskImage: "radial-gradient(ellipse at center top, black 25%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at center top, black 25%, transparent 70%)",
        }} />
      </div>

      <div className="relative w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 ds-reveal">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full ds-glass border border-violet-400/25 text-xs text-violet-300 font-semibold mb-5">
            <Sparkles className="w-3 h-3" />
            {i18n.badge}
          </div>

          <div className="flex justify-center mb-6">
            <div className="ds-icon-orb w-16 h-16 sm:w-20 sm:h-20 rounded-3xl">
              <UploadIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
          </div>

          <h1 className="ds-page-title font-bold leading-[1.05] tracking-tight mb-4">
            <span className="block text-white">{t.upload.headline1}</span>
            <span className="block ds-grad-text">{t.upload.headline2}</span>
          </h1>

          <p className="text-white/60 text-base sm:text-lg max-w-xl mx-auto mb-3">{t.upload.subtitle}</p>

          <p className="text-white/45 text-sm flex items-center justify-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-violet-300 drop-shadow-[0_0_6px_rgba(139,92,246,0.6)]" aria-hidden="true" />
            {t.upload.freeTip}
          </p>

          {/* Perk pills */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {[
              { icon: Wand2, text: i18n.perks[0] },
              { icon: Music, text: i18n.perks[1] },
              { icon: Mic,   text: i18n.perks[2] },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ds-glass border border-white/10 text-xs sm:text-sm text-white/75">
                <Icon className="w-3.5 h-3.5 text-cyan-300" />
                {text}
              </span>
            ))}
          </div>
        </div>

        {/* Studio shell — wraps the existing FileUpload form */}
        <div className="relative ds-reveal" style={{ animationDelay: "120ms" }}>
          {/* Soft glow ring behind the studio card */}
          <div className="absolute -inset-2 rounded-[var(--ds-radius-2xl)] opacity-60 blur-2xl pointer-events-none"
               style={{ background: "var(--ds-grad-primary)" }} />
          <div className="relative ds-card-feature p-3 sm:p-5">
            <FileUpload />
          </div>
        </div>
      </div>
    </main>
  );
}
