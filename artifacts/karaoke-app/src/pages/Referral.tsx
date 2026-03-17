import { ReferralPanel } from "@/components/ReferralPanel";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLang } from "@/contexts/LanguageContext";

export default function Referral() {
  const { t } = useLang();
  const { data: authData } = useAuth();

  if (!authData?.user) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-20 text-center" dir={t.dir}>
        <h2 className="text-2xl font-display font-bold mb-4">
          {t.referral.loginRequired}
        </h2>
        <Link href="/">
          <button className="text-primary hover:underline">{t.referral.back}</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8" dir={t.dir}>
      <Link
        href="/"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className={`w-4 h-4 ${t.dir === "rtl" ? "ml-2" : "mr-2"}`} /> {t.referral.back}
      </Link>

      <h1 className="text-2xl font-display font-bold mb-6">
        {t.referral.title}
      </h1>

      <ReferralPanel />
    </div>
  );
}
