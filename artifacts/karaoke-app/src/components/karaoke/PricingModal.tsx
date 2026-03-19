import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Zap, Star, AlertCircle, CreditCard } from "lucide-react";
import { usePackages, usePayPalPurchase, useLemonSqueezyPurchase } from "@/hooks/use-payments";
import { useAuth } from "@/hooks/use-auth";
import { LoginModal } from "./LoginModal";
import { useLang } from "@/contexts/LanguageContext";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PaymentMethod = "paypal" | "card";

function PayPalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797H9.283c-.413 0-.756.297-.82.702l-1.387 8.304zm7.093-14.69h-1.85c-.272 0-.503.2-.545.47l-.76 4.835c.014-.004.06-.007.09-.007h1.376c3.17 0 5.655-1.29 6.38-5.022.06-.306.1-.588.12-.848-.89-.384-2.3-.428-4.811-.428z"/>
    </svg>
  );
}

export function PricingModal({ open, onOpenChange }: Props) {
  const { t } = useLang();
  const { data: authData } = useAuth();
  const user = authData?.user ?? null;
  const { data: packages, isLoading: loadingPackages } = usePackages();
  const paypalPurchase = usePayPalPurchase();
  const lsPurchase = useLemonSqueezyPurchase();
  const [showLogin, setShowLogin] = useState(false);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");

  function handleBuy(packageId: string) {
    if (!user) {
      setShowLogin(true);
      return;
    }
    setError(null);
    setBuyingId(packageId);

    const mutation = paymentMethod === "card" ? lsPurchase : paypalPurchase;

    mutation.mutate(packageId, {
      onSuccess: (url) => {
        window.location.href = url;
      },
      onError: (err: any) => {
        setBuyingId(null);
        const msg = err?.message ?? t.pricing.error;
        setError(msg);
      },
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl bg-card border-white/10" dir={t.dir}>
          <div className="text-center mb-6">
            <DialogTitle className="text-2xl font-display font-bold mb-2">
              {t.pricing.title}
            </DialogTitle>
            <p className="text-muted-foreground text-sm">
              {t.pricing.subtitle}
            </p>
            {user && (
              user.credits > 0 ? (
                <p className="text-sm mt-2 font-medium">
                  {t.pricing.currentBalance}{" "}
                  <span className="text-primary">{user.credits} {t.pricing.credits}</span>
                </p>
              ) : (
                <p className="text-sm mt-2 text-muted-foreground">
                  {t.pricing.freeNote}
                </p>
              )
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-xl px-4 py-3 mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex items-center justify-center gap-2 mb-5">
            <button
              onClick={() => { setPaymentMethod("card"); setError(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                paymentMethod === "card"
                  ? "bg-violet-500/20 border-2 border-violet-500/60 text-violet-300"
                  : "bg-white/5 border border-white/15 text-white/50 hover:text-white/70 hover:border-white/25"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Credit Card
            </button>
            <button
              onClick={() => { setPaymentMethod("paypal"); setError(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                paymentMethod === "paypal"
                  ? "bg-[#0070ba]/20 border-2 border-[#0070ba]/60 text-[#0070ba]"
                  : "bg-white/5 border border-white/15 text-white/50 hover:text-white/70 hover:border-white/25"
              }`}
            >
              <PayPalIcon className="w-4 h-4" />
              PayPal
            </button>
          </div>

          {loadingPackages ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !packages || packages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Zap className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>{t.pricing.unavailable}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {packages.map((pkg) => {
                const isPopular = pkg.popular;
                const priceUSD = pkg.unitAmount / 100;
                const isBuying = buyingId === pkg.id;

                return (
                  <div
                    key={pkg.id}
                    className={`relative flex flex-col rounded-2xl border p-4 text-center transition-all duration-200 ${
                      isPopular
                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/20 scale-105"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold whitespace-nowrap">
                          <Star className="w-3 h-3 fill-current" />
                          {t.pricing.mostPopular}
                        </span>
                      </div>
                    )}

                    <p className="text-lg font-bold font-display mt-2">{pkg.name}</p>
                    <p className="text-3xl font-black text-primary my-2">{pkg.credits}</p>
                    <p className="text-xs text-muted-foreground mb-1">{t.pricing.credits}</p>
                    {pkg.description && (
                      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                        {pkg.description}
                      </p>
                    )}
                    <p className="text-lg font-semibold mb-4">${priceUSD}</p>

                    <Button
                      size="sm"
                      className={`w-full mt-auto ${isPopular ? "bg-primary hover:bg-primary/80" : ""}`}
                      variant={isPopular ? "default" : "outline"}
                      disabled={!!buyingId}
                      onClick={() => handleBuy(pkg.id)}
                    >
                      {isBuying ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        t.pricing.buyNow
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-xs text-center text-muted-foreground mt-4">
            {paymentMethod === "card"
              ? t.pricing.secureCard ?? "Secure payment by credit card"
              : t.pricing.securePaypal}
          </p>
        </DialogContent>
      </Dialog>

      <LoginModal open={showLogin} onOpenChange={setShowLogin} reason="paywall" />
    </>
  );
}
