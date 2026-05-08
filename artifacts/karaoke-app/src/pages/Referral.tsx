import { ReferralPanel } from "@/components/ReferralPanel";
import { ArrowLeft, Gift, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLang } from "@/contexts/LanguageContext";
import { useNoIndex } from "@/hooks/use-noindex";

export default function Referral() {
  useNoIndex();
  const { t } = useLang();
  const { data: authData } = useAuth();

  if (!authData?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--ds-bg-app)] relative px-4" dir={t.dir}>
        <div className="absolute inset-0 -z-10 ds-bg-aurora opacity-50" />
        <div className="ds-card-feature max-w-md w-full p-10 text-center">
          <div className="ds-icon-orb w-16 h-16 rounded-2xl mx-auto mb-5">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-display font-bold mb-3 text-white">{t.referral.loginRequired}</h2>
          <Link href="/">
            <button className="ds-btn ds-btn-primary px-6 py-2.5 text-sm">{t.referral.back}</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--ds-bg-app)] relative" dir={t.dir}>
      <div className="absolute top-0 inset-x-0 h-[400px] -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 ds-bg-aurora opacity-50" />
        <div className="ds-orb ds-orb-pink absolute -top-32 left-1/3 w-[420px] h-[420px] opacity-50" />
        <div className="ds-orb ds-orb-violet absolute top-10 -right-24 w-[360px] h-[360px] opacity-40" style={{ animationDelay: "2s" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050510]/30 via-transparent to-[#050510]" />
      </div>

      <div className="w-full max-w-lg mx-auto px-4 py-10">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-white/45 hover:text-white transition-colors mb-7">
          <ArrowLeft className="w-3.5 h-3.5" />{t.referral.back}
        </Link>

        <div className="text-center mb-8 ds-reveal">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ds-icon-orb"
               style={{ background: "linear-gradient(135deg,#EC4899,#8B5CF6)", boxShadow: "0 0 40px rgba(236,72,153,.55)" }}>
            <Gift className="w-8 h-8 text-white drop-shadow-lg" />
          </div>
          <div className="inline-flex items-center gap-1.5 ds-glass rounded-full px-3 py-1 text-[11px] font-bold text-pink-300 uppercase tracking-wider mb-3">
            <Sparkles className="w-3 h-3" />Earn Credits
          </div>
          <h1 className="ds-page-title font-display font-bold text-white">{t.referral.title}</h1>
        </div>

        <ReferralPanel />
      </div>
    </div>
  );
}
