import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Mic2, AlertCircle, Sparkles } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLang } from "@/contexts/LanguageContext";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason?: "paywall" | "general";
}

export function LoginModal({ open, onOpenChange, reason = "general" }: Props) {
  const queryClient = useQueryClient();
  const { t } = useLang();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = () => {
    if (!agreedToTerms) { setError(t.login.mustAgreeError); return; }
    const apiBase = import.meta.env.VITE_API_URL ?? "";
    const width = 500, height = 650;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    const popup = window.open(
      `${apiBase}/api/auth/google`,
      "google-auth",
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );
    if (!popup) return;

    const onMessage = (e: MessageEvent) => {
      if (e.source !== popup) return;
      if (e.data?.type === "AUTH_SUCCESS") {
        if (e.data.token) localStorage.setItem("myoukee_auth_token", e.data.token);
        cleanup();
        queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
        onOpenChange(false);
      }
    };
    const cleanup = () => { clearInterval(timer); window.removeEventListener("message", onMessage); };
    window.addEventListener("message", onMessage);
    const timer = setInterval(() => {
      if (popup.closed) {
        cleanup();
        queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
        onOpenChange(false);
      }
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md border-white/[0.08] text-center p-0 overflow-hidden"
        style={{ background: "linear-gradient(180deg, rgba(15,12,30,.98), rgba(8,6,18,.98))" }}
        dir={t.dir}
      >
        <div className="relative p-7 sm:p-8 overflow-hidden">
          <div className="absolute inset-0 ds-bg-aurora opacity-30 pointer-events-none" />
          <div className="ds-orb ds-orb-violet absolute -top-20 -right-16 w-64 h-64 opacity-50 pointer-events-none" />
          <div className="ds-orb ds-orb-pink absolute -bottom-16 -left-16 w-56 h-56 opacity-40 pointer-events-none" style={{ animationDelay: "1.5s" }} />

          <div className="relative flex flex-col items-center gap-5">
            <div className="inline-flex items-center gap-1.5 ds-glass rounded-full px-3 py-1 text-[11px] font-bold text-violet-300 uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />Sign in
            </div>

            <div className="ds-icon-orb h-16 w-16 rounded-2xl">
              <Mic2 className="h-8 w-8 text-white drop-shadow-lg" />
            </div>

            <DialogTitle className="text-2xl font-display font-bold text-white">
              {reason === "paywall" ? t.login.paywallTitle : t.login.welcome}
            </DialogTitle>

            <p className="text-white/55 text-sm max-w-xs leading-relaxed">
              {reason === "paywall" ? t.login.paywallSubtitle : t.login.subtitle}
            </p>

            {error && (
              <div className="flex items-center gap-2 text-rose-300 text-sm bg-rose-500/10 border border-rose-500/25 rounded-xl px-4 py-3 w-full" dir="auto">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}

            <button
              onClick={handleGoogleLogin}
              className="w-full inline-flex items-center justify-center gap-3 py-3.5 rounded-xl bg-white text-gray-900 hover:bg-gray-100 font-semibold text-sm transition-all duration-300 shadow-lg shadow-black/20 hover:shadow-violet-500/20 active:scale-[0.98]"
            >
              <GoogleIcon />{t.login.googleButton}
            </button>

            <label className="flex items-start gap-3 max-w-xs cursor-pointer select-none group text-start">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => { setAgreedToTerms(e.target.checked); if (e.target.checked) setError(null); }}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/25 bg-white/5 text-violet-500 focus:ring-violet-400/40 focus:ring-offset-0 accent-violet-500 cursor-pointer"
              />
              <span className="text-xs text-white/45 group-hover:text-white/65 transition-colors leading-relaxed">
                {t.login.agreeToTerms}{" "}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-violet-300 hover:text-violet-200 underline">{t.consent.termsLink}</a>
                {" · "}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-violet-300 hover:text-violet-200 underline">{t.consent.privacyLink}</a>
                {" · "}
                <a href="/copyright" target="_blank" rel="noopener noreferrer" className="text-violet-300 hover:text-violet-200 underline">{t.consent.copyrightLink}</a>
              </span>
            </label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
