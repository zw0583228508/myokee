import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Zap, Star, AlertCircle, Sparkles, Shield, Check } from "lucide-react";
import { usePackages, usePayPalPurchase } from "@/hooks/use-payments";
import { useAuth } from "@/hooks/use-auth";
import { LoginModal } from "./LoginModal";
import { useLang } from "@/contexts/LanguageContext";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PricingModal({ open, onOpenChange }: Props) {
  const { t } = useLang();
  const { data: authData } = useAuth();
  const user = authData?.user ?? null;
  const { data: packages, isLoading: loadingPackages } = usePackages();
  const paypalPurchase = usePayPalPurchase();
  const [showLogin, setShowLogin] = useState(false);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleBuy(packageId: string) {
    if (!user) { setShowLogin(true); return; }
    setError(null);
    setBuyingId(packageId);
    paypalPurchase.mutate(packageId, {
      onSuccess: (url) => { window.location.href = url; },
      onError: (err: any) => {
        setBuyingId(null);
        setError(err?.message ?? t.pricing.error);
      },
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="sm:max-w-3xl border-white/[0.08] p-0 overflow-hidden"
          style={{ background: "linear-gradient(180deg, rgba(15,12,30,.98), rgba(8,6,18,.98))" }}
          dir={t.dir}
        >
          <div className="relative px-6 sm:px-8 pt-7 pb-6 overflow-hidden">
            <div className="absolute inset-0 ds-bg-aurora opacity-30 pointer-events-none" />
            <div className="ds-orb ds-orb-violet absolute -top-24 -right-16 w-72 h-72 opacity-45 pointer-events-none" />
            <div className="ds-orb ds-orb-pink absolute -top-20 -left-20 w-64 h-64 opacity-40 pointer-events-none" style={{ animationDelay: "1.5s" }} />

            <div className="relative text-center">
              <div className="inline-flex items-center gap-1.5 ds-glass rounded-full px-3 py-1 text-[11px] font-bold text-violet-300 uppercase tracking-wider mb-3">
                <Sparkles className="w-3 h-3" />Credits
              </div>
              <DialogTitle className="text-2xl sm:text-3xl font-display font-bold mb-2 text-white">
                {t.pricing.title}
              </DialogTitle>
              <p className="text-white/55 text-sm">{t.pricing.subtitle}</p>
              {user && (
                user.credits > 0 ? (
                  <p className="text-sm mt-3 font-medium text-white/80">
                    {t.pricing.currentBalance}{" "}
                    <span className="ds-grad-text font-bold">{user.credits} {t.pricing.credits}</span>
                  </p>
                ) : (
                  <p className="text-sm mt-3 text-white/45">{t.pricing.freeNote}</p>
                )
              )}
            </div>
          </div>

          <div className="px-6 sm:px-8 pb-7 -mt-2">
            {error && (
              <div className="flex items-center gap-2 text-rose-300 text-sm bg-rose-500/10 border border-rose-500/25 rounded-xl px-4 py-3 mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}

            {loadingPackages ? (
              <div className="flex justify-center py-14">
                <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
              </div>
            ) : !packages || packages.length === 0 ? (
              <div className="text-center py-14 text-white/45">
                <Zap className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>{t.pricing.unavailable}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {packages.map((pkg: any) => {
                  const isPopular = pkg.popular;
                  const priceUSD = pkg.unitAmount / 100;
                  const isBuying = buyingId === pkg.id;

                  return (
                    <div
                      key={pkg.id}
                      className="relative flex flex-col rounded-2xl p-4 text-center transition-all duration-300 ds-reveal overflow-hidden"
                      style={isPopular ? {
                        background: "linear-gradient(180deg, rgba(139,92,246,.16), rgba(236,72,153,.10))",
                        border: "1.5px solid rgba(139,92,246,.45)",
                        boxShadow: "0 0 28px rgba(139,92,246,.25), inset 0 1px 0 rgba(255,255,255,.08)",
                        transform: "scale(1.04)",
                      } : {
                        background: "rgba(255,255,255,.025)",
                        border: "1px solid rgba(255,255,255,.07)",
                      }}
                    >
                      {isPopular && (
                        <>
                          <div className="ds-orb ds-orb-violet absolute -top-12 -right-8 w-28 h-28 opacity-60 pointer-events-none" />
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white whitespace-nowrap shadow-lg"
                                  style={{ background: "var(--ds-grad-primary)", boxShadow: "0 4px 14px rgba(139,92,246,.5)" }}>
                              <Star className="w-2.5 h-2.5 fill-current" />{t.pricing.mostPopular}
                            </span>
                          </div>
                        </>
                      )}

                      <div className="relative">
                        <p className="text-sm font-bold text-white/85 mt-2">{pkg.name}</p>
                        <p className={`text-3xl font-black my-1.5 ${isPopular ? "ds-grad-text" : "text-white"}`}>
                          {pkg.credits}
                        </p>
                        <p className="text-[10px] text-white/45 mb-1 uppercase tracking-wider font-semibold">{t.pricing.credits}</p>
                        {pkg.description && (
                          <p className="text-[11px] text-white/45 mb-3 leading-relaxed line-clamp-2">{pkg.description}</p>
                        )}
                        <p className="text-lg font-bold text-white mb-4">${priceUSD}</p>

                        <button
                          className={`w-full mt-auto py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                            isPopular ? "ds-btn ds-btn-primary" : "ds-btn ds-btn-ghost"
                          } disabled:opacity-40`}
                          disabled={!!buyingId}
                          onClick={() => handleBuy(pkg.id)}
                        >
                          {isBuying ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                            <><Check className="w-3.5 h-3.5" />{t.pricing.buyNow}</>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <p className="text-xs text-center text-white/40 mt-5 inline-flex items-center gap-1.5 justify-center w-full">
              <Shield className="w-3.5 h-3.5" />{t.pricing.securePaypal}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <LoginModal open={showLogin} onOpenChange={setShowLogin} reason="paywall" />
    </>
  );
}
