import { useState, useEffect, type FormEvent } from "react";
import { Mic2, Mail, Lock, User, Loader2, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useEmailLogin, useEmailRegister, useForgotPassword, useResetPassword, consumeAuthErrorFromUrl } from "@/hooks/use-auth";
import { useLang, type SupportedLang } from "@/contexts/LanguageContext";
import { trackLogin, trackSignUp } from "@/lib/analytics";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

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

type PageMode = "login" | "register" | "forgot" | "reset" | "reset-success";

export default function LoginPage() {
  const queryClient = useQueryClient();
  const { t, lang, setLang, allLangs } = useLang();
  const emailLogin = useEmailLogin();
  const emailRegister = useEmailRegister();
  const forgotPassword = useForgotPassword();
  const resetPassword = useResetPassword();

  const [mode, setMode] = useState<PageMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    const authError = consumeAuthErrorFromUrl();
    if (authError) {
      setError(`Google login failed: ${authError}`);
    }

    const params = new URLSearchParams(window.location.search);
    const token = params.get("reset_token");
    if (token) {
      setResetToken(token);
      setMode("reset");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const handleGoogleLogin = () => {
    if (!agreedToTerms) {
      setError(t.login.mustAgreeError);
      return;
    }
    const apiBase = import.meta.env.VITE_API_URL ?? "";
    const width = 500;
    const height = 650;
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
        if (e.data.token) {
          localStorage.setItem("myoukee_auth_token", e.data.token);
        }
        cleanup();
        trackLogin("google");
        queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      }
    };

    const cleanup = () => {
      clearInterval(timer);
      window.removeEventListener("message", onMessage);
    };

    window.addEventListener("message", onMessage);

    const timer = setInterval(() => {
      if (popup.closed) {
        cleanup();
        queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      }
    }, 500);
  };

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agreedToTerms) {
      setError(t.login.mustAgreeError);
      return;
    }

    if (!email || !password) {
      setError(t.login.emailLabel + " & " + t.login.passwordLabel + " required");
      return;
    }

    if (password.length < 6) {
      setError(t.login.passwordMinLength);
      return;
    }

    setLoading(true);
    try {
      if (mode === "register") {
        await emailRegister.mutateAsync({ email, password, displayName: displayName || undefined });
        trackSignUp("email");
      } else {
        await emailLogin.mutateAsync({ email, password });
        trackLogin("email");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError(t.login.emailLabel + " required");
      return;
    }
    setLoading(true);
    try {
      await forgotPassword.mutateAsync({ email, lang });
      setResetSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!password || !confirmPw) {
      setError(t.login.newPassword + " required");
      return;
    }
    if (password.length < 6) {
      setError(t.login.passwordMinLength);
      return;
    }
    if (password !== confirmPw) {
      setError(t.login.passwordsNoMatch);
      return;
    }
    if (!resetToken) {
      setError(t.login.resetLinkExpired);
      return;
    }
    setLoading(true);
    try {
      await resetPassword.mutateAsync({ token: resetToken, password });
      setMode("reset-success");
    } catch (err: any) {
      setError(err.message || t.login.resetLinkExpired);
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    setMode("login");
    setError(null);
    setResetSent(false);
    setPassword("");
    setConfirmPw("");
  };

  const isRtl = t.dir === "rtl";

  const renderContent = () => {
    if (mode === "reset-success") {
      return (
        <div className="glass-panel rounded-3xl border border-white/10 backdrop-blur-xl p-6 sm:p-8 shadow-2xl text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">{t.login.resetSuccess}</h3>
          <p className="text-sm text-white/50 mb-6">{t.login.resetEmailSentDesc.replace(
            t.login.resetEmailSentDesc, 
            mode === "reset-success" ? t.login.resetSuccess : t.login.resetEmailSentDesc
          )}</p>
          <Button
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
            }}
            className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
          >
            {t.login.loginButton}
          </Button>
        </div>
      );
    }

    if (mode === "forgot") {
      if (resetSent) {
        return (
          <div className="glass-panel rounded-3xl border border-white/10 backdrop-blur-xl p-6 sm:p-8 shadow-2xl text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Mail className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{t.login.resetEmailSent}</h3>
            <p className="text-sm text-white/50 mb-6">{t.login.resetEmailSentDesc}</p>
            <button
              onClick={goToLogin}
              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              {t.login.backToLogin}
            </button>
          </div>
        );
      }

      return (
        <div className="glass-panel rounded-3xl border border-white/10 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
          <button
            onClick={goToLogin}
            className={`flex items-center gap-1 text-sm text-white/40 hover:text-white/70 transition-colors mb-6 ${isRtl ? 'flex-row-reverse' : ''}`}
          >
            <ArrowLeft className="w-4 h-4" />
            {t.login.backToLogin}
          </button>

          <h3 className="text-lg font-bold text-white mb-2">{t.login.forgotPassword}</h3>
          <p className="text-sm text-white/50 mb-6">{t.login.resetEmailSentDesc}</p>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-xl px-4 py-3 mb-4" dir="auto">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <div className="relative">
              <Mail className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 ${isRtl ? 'right-3' : 'left-3'}`} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.login.emailLabel}
                required
                dir="ltr"
                className={`w-full bg-white/5 border border-white/10 rounded-xl py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${isRtl ? 'pr-10 pl-3 text-right' : 'pl-10 pr-3'}`}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                t.login.sendResetLink
              )}
            </Button>
          </form>
        </div>
      );
    }

    if (mode === "reset") {
      return (
        <div className="glass-panel rounded-3xl border border-white/10 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
          <h3 className="text-lg font-bold text-white mb-2">{t.login.resetPassword}</h3>
          <p className="text-sm text-white/50 mb-6">{t.login.passwordMinLength}</p>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-xl px-4 py-3 mb-4" dir="auto">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div className="relative">
              <Lock className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 ${isRtl ? 'right-3' : 'left-3'}`} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.login.newPassword}
                required
                dir="ltr"
                className={`w-full bg-white/5 border border-white/10 rounded-xl py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${isRtl ? 'pr-10 pl-10 text-right' : 'pl-10 pr-10'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors ${isRtl ? 'left-3' : 'right-3'}`}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="relative">
              <Lock className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 ${isRtl ? 'right-3' : 'left-3'}`} />
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder={t.login.confirmPassword}
                required
                dir="ltr"
                className={`w-full bg-white/5 border border-white/10 rounded-xl py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${isRtl ? 'pr-10 pl-3 text-right' : 'pl-10 pr-3'}`}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                t.login.resetPassword
              )}
            </Button>
          </form>

          <div className="mt-5 text-center">
            <button
              onClick={goToLogin}
              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              {t.login.backToLogin}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="glass-panel rounded-3xl border border-white/10 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
        <Button
          size="lg"
          className="w-full gap-3 bg-white text-gray-900 hover:bg-gray-100 font-semibold h-12 text-base rounded-xl shadow-md"
          onClick={handleGoogleLogin}
        >
          <GoogleIcon />
          {t.login.googleButton}
        </Button>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-sm text-white/30 font-medium">{t.login.orDivider}</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-xl px-4 py-3 mb-4" dir="auto">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleEmailSubmit} className="space-y-4">
          {mode === "register" && (
            <div className="relative">
              <User className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 ${isRtl ? 'right-3' : 'left-3'}`} />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={t.login.displayNameLabel}
                className={`w-full bg-white/5 border border-white/10 rounded-xl py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${isRtl ? 'pr-10 pl-3' : 'pl-10 pr-3'}`}
              />
            </div>
          )}

          <div className="relative">
            <Mail className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 ${isRtl ? 'right-3' : 'left-3'}`} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.login.emailLabel}
              required
              dir="ltr"
              className={`w-full bg-white/5 border border-white/10 rounded-xl py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${isRtl ? 'pr-10 pl-3 text-right' : 'pl-10 pr-3'}`}
            />
          </div>

          <div className="relative">
            <Lock className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 ${isRtl ? 'right-3' : 'left-3'}`} />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.login.passwordLabel}
              required
              dir="ltr"
              className={`w-full bg-white/5 border border-white/10 rounded-xl py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${isRtl ? 'pr-10 pl-10 text-right' : 'pl-10 pr-10'}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors ${isRtl ? 'left-3' : 'right-3'}`}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {mode === "login" && (
            <div className={`flex ${isRtl ? 'justify-start' : 'justify-end'}`}>
              <button
                type="button"
                onClick={() => { setMode("forgot"); setError(null); }}
                className="text-xs text-white/40 hover:text-primary transition-colors"
              >
                {t.login.forgotPassword}
              </button>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : mode === "login" ? (
              t.login.loginButton
            ) : (
              t.login.registerButton
            )}
          </Button>
        </form>

        <div className="mt-5 text-center">
          {mode === "login" ? (
            <p className="text-sm text-white/40">
              {t.login.noAccount}{" "}
              <button
                onClick={() => { setMode("register"); setError(null); }}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                {t.login.registerButton}
              </button>
            </p>
          ) : (
            <p className="text-sm text-white/40">
              {t.login.hasAccount}{" "}
              <button
                onClick={() => { setMode("login"); setError(null); }}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                {t.login.loginButton}
              </button>
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 grid place-items-center overflow-auto" dir={t.dir}>
      <div className="fixed inset-0 -z-20 pointer-events-none overflow-hidden" aria-hidden="true">
        <img
          src="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1920&h=1080&fit=crop&q=80"
          alt=""
          className="w-full h-full object-cover opacity-[0.12]"
          style={{ filter: "saturate(0.6)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/8" />
      </div>

      <div className="fixed top-4 right-4 z-50" dir="ltr">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/10 transition-colors border border-white/10 bg-white/5 backdrop-blur-sm">
              <Globe className="w-4 h-4" />
              <span className="text-base leading-none">{allLangs.find(l => l.code === lang)?.flag}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card border-white/10 min-w-[160px] max-h-[400px] overflow-y-auto">
            {allLangs.map(({ code, name, flag }) => (
              <DropdownMenuItem
                key={code}
                onClick={() => setLang(code as SupportedLang)}
                className={`cursor-pointer gap-2 ${lang === code ? "text-primary" : ""}`}
              >
                <span>{flag}</span>{name}
                {lang === code && <span className="ml-auto text-primary text-xs">✓</span>}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="w-full max-w-md px-4 py-8 sm:py-12 mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
                <Mic2 className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
              </div>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold mb-1">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">MY</span>
              <span className="text-white">OUKEE</span>
            </h1>
            {(mode === "login" || mode === "register") && (
              <>
                <h2 className="text-xl sm:text-2xl font-display font-bold mt-4 text-white">
                  {t.login.welcome}
                </h2>
                <p className="text-muted-foreground text-sm mt-2 max-w-xs mx-auto">
                  {t.login.subtitle}
                </p>
              </>
            )}
          </div>

          {renderContent()}

          {(mode === "login" || mode === "register") && (
            <label className="flex items-start gap-3 mt-6 max-w-xs mx-auto cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => { setAgreedToTerms(e.target.checked); if (e.target.checked) setError(null); }}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/30 bg-white/5 text-primary focus:ring-primary focus:ring-offset-0 accent-[hsl(var(--primary))] cursor-pointer"
              />
              <span className="text-xs text-white/40 group-hover:text-white/60 transition-colors leading-relaxed">
                {t.login.agreeToTerms}{" "}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 underline">{t.consent.termsLink}</a>
                {" · "}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 underline">{t.consent.privacyLink}</a>
                {" · "}
                <a href="/copyright" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 underline">{t.consent.copyrightLink}</a>
              </span>
            </label>
          )}
      </div>
    </div>
  );
}
