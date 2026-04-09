import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/contexts/LanguageContext";

const CONSENT_KEY = "myoukee-consent-v1";

export function useConsent() {
  const [consented, setConsented] = useState<boolean>(() => {
    return localStorage.getItem(CONSENT_KEY) === "accepted";
  });

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setConsented(true);
  };

  return { consented, accept };
}

interface ConsentModalProps {
  open: boolean;
  onAccept: () => void;
  onClose?: () => void;
}

export function ConsentModal({ open, onAccept, onClose }: ConsentModalProps) {
  const { t } = useLang();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-title"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-card/95 p-5 sm:p-8 shadow-2xl shadow-black/50"
        dir={t.dir}
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
            <Shield className="w-8 h-8 text-white" />
          </div>
        </div>

        <h2
          id="consent-title"
          className="text-2xl font-display font-bold text-center mb-3"
        >
          {t.consent.title}
        </h2>

        <p className="text-sm text-muted-foreground text-center leading-relaxed mb-6">
          {t.consent.body}
        </p>

        <div className="flex justify-center gap-4 text-sm mb-8 flex-wrap">
          <Link
            href="/privacy"
            className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
          >
            {t.consent.privacyLink}
          </Link>
          <span className="text-white/20">|</span>
          <Link
            href="/terms"
            className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
          >
            {t.consent.termsLink}
          </Link>
          <span className="text-white/20">|</span>
          <Link
            href="/copyright"
            className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
          >
            {t.consent.copyrightLink}
          </Link>
        </div>

        <Button
          variant="gradient"
          className="w-full gap-2 h-12 text-base"
          onClick={onAccept}
          autoFocus
        >
          <CheckCircle className="w-5 h-5" />
          {t.consent.accept}
        </Button>

        <p className="text-xs text-muted-foreground/50 text-center mt-4">
          MYOUKEE &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

export function ConsentGate({ children }: { children: React.ReactNode }) {
  const { consented, accept } = useConsent();
  const [showModal, setShowModal] = useState(false);

  const path = window.location.pathname;
  const isPublicPage = path.startsWith("/shared/") || path.startsWith("/features/") || path.startsWith("/lang/");
  useEffect(() => {
    if (consented || isPublicPage) return;
    const t = setTimeout(() => setShowModal(true), 300);
    return () => clearTimeout(t);
  }, [consented, isPublicPage]);

  return (
    <>
      {children}
      <ConsentModal
        open={showModal && !consented && !isPublicPage}
        onAccept={() => { accept(); setShowModal(false); }}
      />
    </>
  );
}
