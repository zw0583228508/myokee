import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Shield, CheckCircle, Mic } from "lucide-react";
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
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-title"
    >
      <div
        className={`absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`relative z-10 w-full max-w-md rounded-3xl overflow-hidden transition-all duration-700 ${visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"}`}
        dir={t.dir}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-fuchsia-500/20 animate-gradient-shift" style={{ backgroundSize: "200% 200%" }} />
        <div className="absolute inset-[1px] rounded-3xl bg-card/95 backdrop-blur-xl" />

        <div className="absolute -right-20 -top-20 w-52 h-52 rounded-full bg-primary/10 blur-[60px] animate-float-slow" />
        <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-accent/10 blur-[40px] animate-float-reverse" />

        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-accent blur-xl opacity-40 animate-glow-breathe" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
                <Shield className="w-8 h-8 text-white" />
              </div>
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
              className="text-primary hover:text-primary/80 hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded transition-colors"
            >
              {t.consent.privacyLink}
            </Link>
            <span className="text-white/20">|</span>
            <Link
              href="/terms"
              className="text-primary hover:text-primary/80 hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded transition-colors"
            >
              {t.consent.termsLink}
            </Link>
            <span className="text-white/20">|</span>
            <Link
              href="/copyright"
              className="text-primary hover:text-primary/80 hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded transition-colors"
            >
              {t.consent.copyrightLink}
            </Link>
          </div>

          <button
            onClick={onAccept}
            autoFocus
            className="group relative w-full flex items-center justify-center gap-2 h-12 text-base font-bold text-white rounded-2xl overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] animate-btn-glow"
            style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <CheckCircle className="w-5 h-5 relative z-10" />
            <span className="relative z-10">{t.consent.accept}</span>
          </button>

          <p className="text-xs text-muted-foreground/50 text-center mt-4">
            MYOUKEE &copy; {new Date().getFullYear()}
          </p>
        </div>
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
