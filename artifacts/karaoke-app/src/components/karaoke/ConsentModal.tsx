import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Shield, CheckCircle, Sparkles } from "lucide-react";
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
    if (open) requestAnimationFrame(() => setVisible(true));
    else setVisible(false);
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
        className={`absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`relative z-10 w-full max-w-md rounded-3xl overflow-hidden transition-all duration-700 ${visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"}`}
        style={{
          background: "linear-gradient(180deg, rgba(15,12,30,.98), rgba(8,6,18,.98))",
          border: "1px solid rgba(139,92,246,.25)",
          boxShadow: "0 30px 80px rgba(0,0,0,.6), 0 0 60px rgba(139,92,246,.18)",
        }}
        dir={t.dir}
      >
        <div className="absolute inset-0 ds-bg-aurora opacity-35 pointer-events-none" />
        <div className="ds-orb ds-orb-violet absolute -top-24 -right-16 w-72 h-72 opacity-50 pointer-events-none" />
        <div className="ds-orb ds-orb-pink absolute -bottom-20 -left-16 w-60 h-60 opacity-45 pointer-events-none" style={{ animationDelay: "1.5s" }} />

        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex justify-center mb-3">
            <div className="inline-flex items-center gap-1.5 ds-glass rounded-full px-3 py-1 text-[11px] font-bold text-violet-300 uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />MYOUKEE
            </div>
          </div>

          <div className="flex justify-center mb-5">
            <div className="ds-icon-orb w-16 h-16 rounded-2xl">
              <Shield className="w-8 h-8 text-white drop-shadow-lg" />
            </div>
          </div>

          <h2
            id="consent-title"
            className="text-2xl font-display font-bold text-center mb-3 text-white"
          >
            {t.consent.title}
          </h2>

          <p className="text-sm text-white/60 text-center leading-relaxed mb-6">
            {t.consent.body}
          </p>

          <div className="flex justify-center gap-4 text-sm mb-7 flex-wrap">
            <Link
              href="/privacy"
              className="text-violet-300 hover:text-violet-200 hover:underline focus:outline-none focus:ring-2 focus:ring-violet-400 rounded transition-colors"
            >
              {t.consent.privacyLink}
            </Link>
            <span className="text-white/15">|</span>
            <Link
              href="/terms"
              className="text-violet-300 hover:text-violet-200 hover:underline focus:outline-none focus:ring-2 focus:ring-violet-400 rounded transition-colors"
            >
              {t.consent.termsLink}
            </Link>
            <span className="text-white/15">|</span>
            <Link
              href="/copyright"
              className="text-violet-300 hover:text-violet-200 hover:underline focus:outline-none focus:ring-2 focus:ring-violet-400 rounded transition-colors"
            >
              {t.consent.copyrightLink}
            </Link>
          </div>

          <button
            onClick={onAccept}
            autoFocus
            className="ds-btn ds-btn-primary w-full h-12 text-base"
          >
            <CheckCircle className="w-5 h-5" />
            <span>{t.consent.accept}</span>
          </button>

          <p className="text-xs text-white/35 text-center mt-4">
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
