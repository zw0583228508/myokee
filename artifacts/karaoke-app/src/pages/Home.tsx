import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  CheckCircle2, XCircle, Sparkles,
  Music, Video, Upload, ChevronDown, Mic, Trophy, Users,
  Star, Swords, Play, Headphones, ArrowRight,
  Camera, Mail, FileText, Zap, Globe,
} from "lucide-react";
import { useFulfillPayment, useFulfillPayPal, useRecoverPayPal } from "@/hooks/use-payments";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { useLang } from "@/contexts/LanguageContext";
import { trackCreditPurchase } from "@/lib/analytics";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

type PaymentBanner = "success" | "cancelled" | "already_fulfilled" | "error" | null;

const SMALL_CARD_ICONS = [Users, Swords, Trophy, Video, Star, FileText];

function MusicBars() {
  return (
    <div className="music-bars">
      <span /><span /><span /><span /><span />
    </div>
  );
}

function FloatingOrbs() {
  return (
    <>
      <div className="absolute top-[15%] left-[10%] w-72 h-72 rounded-full bg-violet-600/20 animate-float-slow animate-glow-breathe" />
      <div className="absolute top-[40%] right-[8%] w-56 h-56 rounded-full bg-blue-500/15 animate-float-medium animate-glow-breathe" style={{ animationDelay: "2s" }} />
      <div className="absolute bottom-[20%] left-[30%] w-40 h-40 rounded-full bg-fuchsia-500/15 animate-float-reverse animate-glow-breathe" style={{ animationDelay: "4s" }} />
      <div className="absolute top-[60%] right-[35%] w-32 h-32 rounded-full bg-cyan-400/10 animate-float-slow" style={{ animationDelay: "1s" }} />
      <div className="absolute top-[10%] right-[25%] w-24 h-24 rounded-full bg-pink-500/10 animate-float-medium" style={{ animationDelay: "3s" }} />
    </>
  );
}

function GridPattern() {
  return (
    <div className="absolute inset-0 opacity-[0.03]" style={{
      backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
      backgroundSize: "60px 60px",
    }} />
  );
}

export default function Home() {
  const fulfillPayment = useFulfillPayment();
  const fulfillPayPal  = useFulfillPayPal();
  const queryClient   = useQueryClient();
  const [, navigate]  = useLocation();
  const { t, lang }   = useLang();
  const { data: authData } = useAuth();
  const [paymentBanner, setPaymentBanner] = useState<PaymentBanner>(null);
  const [activeTab, setActiveTab]         = useState<string>("home");
  const scrollContainer = useScrollReveal();

  const recovery = useRecoverPayPal(!!authData?.user);
  useEffect(() => {
    if (recovery.data?.recovered && recovery.data.recovered > 0) {
      setPaymentBanner("success");
    }
  }, [recovery.data]);

  const featuresRef = useRef<HTMLDivElement>(null);
  const howRef      = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params    = new URLSearchParams(window.location.search);
    const refCode   = params.get("ref");
    if (refCode) {
      localStorage.setItem("myoukee-ref", refCode);
      const url = new URL(window.location.href);
      url.searchParams.delete("ref");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  }, []);

  useEffect(() => {
    const params    = new URLSearchParams(window.location.search);
    const payment   = params.get("payment");
    const sessionId = params.get("session_id");
    const paypalOrderId = params.get("paypal_order_id") || params.get("token") || sessionStorage.getItem("paypal_order_id");

    if (payment === "success" && sessionId) {
      const attemptFulfill = (attempt = 0) => {
        fulfillPayment.mutate(sessionId, {
          onSuccess: (data) => {
            setPaymentBanner(data.alreadyFulfilled ? "already_fulfilled" : "success");
            if (!data.alreadyFulfilled && data.credits) {
              trackCreditPurchase({ gateway: "stripe", credits: data.credits });
            }
            queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
            sessionStorage.removeItem("pending_stripe_session");
          },
          onError: (err) => {
            console.error(`[Payment] Stripe fulfillment error (attempt ${attempt + 1}):`, err);
            if (attempt < 2) {
              setTimeout(() => attemptFulfill(attempt + 1), 2000 * (attempt + 1));
            } else {
              sessionStorage.setItem("pending_stripe_session", sessionId);
              setPaymentBanner("error");
            }
          },
        });
      };
      attemptFulfill();
      window.history.replaceState({}, "", window.location.pathname);
    } else if ((payment === "paypal_success" || !payment) && paypalOrderId) {
      sessionStorage.removeItem("paypal_order_id");
      const attemptCapture = (attempt = 0) => {
        fulfillPayPal.mutate(paypalOrderId, {
          onSuccess: (data) => {
            setPaymentBanner(data.alreadyFulfilled ? "already_fulfilled" : "success");
            if (!data.alreadyFulfilled && data.credits) {
              trackCreditPurchase({ gateway: "paypal", credits: data.credits });
            }
            queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
          },
          onError: (err) => {
            console.error(`[Payment] PayPal capture error (attempt ${attempt + 1}):`, err);
            if (attempt < 2) {
              setTimeout(() => attemptCapture(attempt + 1), 2000 * (attempt + 1));
            } else {
              sessionStorage.setItem("paypal_order_id", paypalOrderId);
              setPaymentBanner("error");
            }
          },
        });
      };
      attemptCapture();
      window.history.replaceState({}, "", window.location.pathname);
    } else if (payment === "cancelled") {
      setPaymentBanner("cancelled");
      window.history.replaceState({}, "", window.location.pathname);
    }

    const pendingStripe = sessionStorage.getItem("pending_stripe_session");
    if (pendingStripe && !sessionId && payment !== "success") {
      fulfillPayment.mutate(pendingStripe, {
        onSuccess: (data) => {
          setPaymentBanner(data.alreadyFulfilled ? "already_fulfilled" : "success");
          queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
          sessionStorage.removeItem("pending_stripe_session");
        },
        onError: () => {},
      });
    }
  }, []);

  useEffect(() => {
    const sections = [
      { id: "features",     ref: featuresRef },
      { id: "how-it-works", ref: howRef      },
    ];
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          const m = sections.find((s) => s.ref.current === e.target);
          if (m) setActiveTab(m.id);
        }
      }),
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );
    sections.forEach(({ ref }) => { if (ref.current) observer.observe(ref.current); });
    return () => observer.disconnect();
  }, []);

  const dir = t.dir;

  const TABS = [
    { id: "home",         label: t.home.tabs.home,         icon: Music    },
    { id: "how-it-works", label: t.home.tabs.howItWorks,   icon: Play     },
    { id: "features",     label: t.home.tabs.features,     icon: Sparkles },
    { id: "upload",       label: t.nav.createKaraoke,      icon: Upload,  href: "/upload" },
    { id: "history",      label: t.nav.history,            icon: Video,   href: "/history" },
  ] as const;

  const scrollTo = (id: string) => {
    if (id === "home") { window.scrollTo({ top: 0, behavior: "smooth" }); setActiveTab("home"); return; }
    const map: Record<string, React.RefObject<HTMLDivElement | null>> = {
      features: featuresRef, "how-it-works": howRef,
    };
    const ref = map[id];
    if (ref?.current) {
      const top = ref.current.getBoundingClientRect().top + window.scrollY - (64 + 49);
      window.scrollTo({ top, behavior: "smooth" });
      setActiveTab(id);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative" ref={scrollContainer}>

      {paymentBanner === "success" && (
        <div className="w-full bg-green-500/10 border-b border-green-500/20 px-4 py-3 flex items-center justify-center gap-3 text-sm">
          <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
          <span className="text-green-400 font-medium">{t.nav.paymentSuccess}</span>
          <button onClick={() => setPaymentBanner(null)} className="text-green-600 hover:text-green-400 ml-2">✕</button>
        </div>
      )}
      {paymentBanner === "cancelled" && (
        <div className="w-full bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-3 flex items-center justify-center gap-3 text-sm">
          <XCircle className="w-4 h-4 text-yellow-400 shrink-0" />
          <span className="text-yellow-400">{t.nav.paymentCancelled}</span>
          <button onClick={() => setPaymentBanner(null)} className="text-yellow-600 hover:text-yellow-400 ml-2">✕</button>
        </div>
      )}
      {paymentBanner === "error" && (
        <div className="w-full bg-red-500/10 border-b border-red-500/20 px-4 py-3 flex items-center justify-center gap-3 text-sm">
          <XCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="text-red-400">{t.nav.paymentError}</span>
          <button onClick={() => setPaymentBanner(null)} className="text-red-600 hover:text-red-400 ml-2">✕</button>
        </div>
      )}

      <div className="sticky top-16 z-40 bg-background/60 backdrop-blur-2xl border-b border-white/[0.06]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-stretch gap-0 overflow-x-auto scrollbar-none" dir={dir}>
            {TABS.map(({ id, label, icon: Icon, href }: any) => {
              const isActive = activeTab === id;
              const cls = "relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all shrink-0 " +
                (isActive
                  ? "text-white"
                  : "text-white/40 hover:text-white/70");
              const inner = (
                <>
                  <Icon className="w-3.5 h-3.5" />{label}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-gradient-to-r from-primary via-accent to-primary animate-gradient-shift" style={{ backgroundSize: "200% 200%" }} />
                  )}
                </>
              );
              return href ? (
                <Link key={id} href={href}><button className={cls}>{inner}</button></Link>
              ) : (
                <button key={id} className={cls} onClick={() => scrollTo(id)}>{inner}</button>
              );
            })}
          </div>
        </div>
      </div>

      <section className="relative min-h-[70vh] sm:min-h-[94vh] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src="https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1920&h=1080&fit=crop&q=80"
            alt="" className="absolute inset-0 w-full h-full object-cover object-top opacity-40"
            style={{ filter: "saturate(0.6) brightness(0.7)" }}
          />
          <div className="absolute inset-0 bg-[#06060f]/60" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-accent/8" />
          <FloatingOrbs />
          <GridPattern />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-16 pb-8 sm:pb-12">
          <div className="hero-text-line inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/[0.06] border border-white/[0.08] text-sm text-white/60 mb-6 sm:mb-10 backdrop-blur-xl">
            <MusicBars />
            {t.home.hero.badge}
          </div>

          <h1 className="text-4xl sm:text-7xl lg:text-8xl font-bold font-display leading-[0.88] tracking-tight mb-4 sm:mb-6">
            <span className="hero-text-line block">{t.home.hero.headline1}</span>
            <span className="hero-text-line block text-transparent bg-clip-text animate-gradient-shift" style={{ backgroundImage: "linear-gradient(135deg, #a78bfa, #7c3aed, #3b82f6, #06b6d4, #7c3aed, #a78bfa)", backgroundSize: "300% 300%" }}>
              {t.home.hero.headline2}
            </span>
            <span className="hero-text-line block text-white">{t.home.hero.headline3}</span>
          </h1>

          <p className="hero-text-line text-base sm:text-xl text-white/50 max-w-lg mx-auto mb-6 sm:mb-10 leading-relaxed">
            {t.home.hero.sub}
          </p>

          <div className="hero-text-line flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-6 sm:mb-10">
            {t.home.hero.chips.map((f: string) => (
              <span key={f} className="px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-sm text-white/55 backdrop-blur-sm hover:bg-white/[0.1] hover:border-white/20 hover:text-white/80 transition-all duration-300 cursor-default">
                {f}
              </span>
            ))}
          </div>

          <div className="hero-text-line flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <Link href="/upload">
              <button
                className="group relative flex items-center gap-2.5 px-9 py-4 rounded-2xl text-white font-bold text-base transition-all hover:scale-105 active:scale-95 animate-btn-glow overflow-hidden"
                style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)" }}>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Mic className="w-5 h-5 relative z-10" />
                <span className="relative z-10">{t.home.hero.ctaCreate}</span>
              </button>
            </Link>
            <Link href="/leaderboard">
              <button className="group flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-white/[0.05] border border-white/[0.1] text-white/75 hover:bg-white/[0.1] hover:border-white/20 hover:text-white transition-all font-semibold text-base backdrop-blur-sm">
                <Trophy className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform" />
                {t.home.hero.ctaLeaderboard}
              </button>
            </Link>
          </div>
        </div>

        <button onClick={() => scrollTo("how-it-works")}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/20 hover:text-white/45 transition-colors">
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </button>
      </section>

      <section ref={howRef} id="how-it-works" className="relative scroll-mt-32 py-14 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1920&h=800&fit=crop&q=80"
            alt="" className="absolute inset-0 w-full h-full object-cover opacity-35"
            style={{ filter: "saturate(1.2) brightness(0.8)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/20 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
          <GridPattern />
        </div>

        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8" dir={dir}>
          <div className="text-center mb-10 sm:mb-16 reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-xs text-accent font-medium mb-4 backdrop-blur-sm">
              <Play className="w-3 h-3" />{t.home.howItWorks.badge}
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-bold mb-3">{t.home.howItWorks.title}</h2>
            <p className="text-white/35 text-base">{t.home.howItWorks.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
            <div className="hidden sm:block absolute top-10 left-[16%] right-[16%] h-px overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-primary/40 via-accent/60 to-primary/40 animate-gradient-shift" style={{ backgroundSize: "200% 200%" }} />
            </div>

            {[
              { num: "01", icon: Upload,   step: t.home.howItWorks.step1, gradient: "from-violet-600 to-primary", glow: "rgba(139,92,246,0.3)" },
              { num: "02", icon: Sparkles, step: t.home.howItWorks.step2, gradient: "from-blue-500 to-cyan-500", glow: "rgba(59,130,246,0.3)" },
              { num: "03", icon: Mic,      step: t.home.howItWorks.step3, gradient: "from-accent to-pink-500", glow: "rgba(236,72,153,0.3)" },
            ].map(({ num, icon: Icon, step, gradient, glow }, i) => (
              <div key={num} className="relative text-center group reveal-on-scroll" dir={dir} style={{ transitionDelay: `${i * 150}ms` }}>
                <div className="relative inline-flex mb-6">
                  <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${gradient} flex items-center justify-center transition-all duration-500 group-hover:scale-110`}
                    style={{ boxShadow: `0 0 40px ${glow}` }}>
                    <Icon className="w-9 h-9 text-white" />
                  </div>
                  <span className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-background border border-white/15 flex items-center justify-center text-[11px] font-bold text-white/50">
                    {num}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed max-w-[220px] mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center reveal-on-scroll">
            <Link href="/upload">
              <button
                className="group relative inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-white font-semibold text-sm transition-all hover:scale-105 overflow-hidden animate-btn-glow"
                style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)" }}>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Mic className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{t.home.howItWorks.cta}</span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      <section ref={featuresRef} id="features" className="relative scroll-mt-32 py-14 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1920&h=1000&fit=crop&q=80"
            alt="" className="absolute inset-0 w-full h-full object-cover opacity-30"
            style={{ filter: "saturate(1.1) brightness(0.7)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/30 to-background/80" />
          <GridPattern />
        </div>

        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" dir={dir}>
          <div className="text-center mb-10 sm:mb-16 reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-medium mb-4 backdrop-blur-sm">
              <Sparkles className="w-3 h-3" />{t.home.features.badge}
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-bold mb-3">{t.home.features.title}</h2>
            <p className="text-white/35 text-base max-w-md mx-auto">{t.home.features.subtitle}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 auto-rows-fr">

            <div className="col-span-2 sm:col-span-2 relative rounded-2xl sm:rounded-3xl p-5 sm:p-8 bg-gradient-to-br from-violet-500/15 to-purple-600/5 border border-violet-500/20 overflow-hidden card-hover-glow reveal-on-scroll group">
              <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-violet-500/10 blur-3xl group-hover:bg-violet-500/20 transition-all duration-700" />
              <div className="absolute right-4 bottom-4 w-32 h-32 rounded-full bg-violet-400/5 blur-2xl group-hover:bg-violet-400/15 transition-all duration-700" />
              <div className="flex items-start justify-between mb-3 sm:mb-5">
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-violet-500/20 border border-violet-400/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <Mic className="w-5 h-5 sm:w-7 sm:h-7 text-violet-300" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-semibold">{t.home.features.singBadge}</span>
              </div>
              <h3 className="text-lg sm:text-2xl font-bold text-white mb-1.5 sm:mb-2">{t.home.features.sing}</h3>
              <p className="text-white/45 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-5">{t.home.features.singDesc}</p>
              <div className="flex flex-wrap gap-2">
                {t.home.features.singTags.map((tag: string) => (
                  <span key={tag} className="px-2.5 py-1 rounded-full bg-white/8 text-white/55 text-xs hover:bg-violet-500/20 hover:text-violet-300 transition-colors duration-300">{tag}</span>
                ))}
              </div>
            </div>

            <div className="col-span-2 sm:col-span-2 relative rounded-2xl sm:rounded-3xl p-5 sm:p-8 bg-gradient-to-br from-blue-500/15 to-cyan-600/5 border border-blue-500/20 overflow-hidden card-hover-glow reveal-on-scroll group" style={{ transitionDelay: "100ms" }}>
              <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl group-hover:bg-blue-500/20 transition-all duration-700" />
              <div className="absolute right-6 top-6 w-24 h-24 rounded-full bg-cyan-400/5 blur-2xl group-hover:bg-cyan-400/15 transition-all duration-700" />
              <div className="flex items-start justify-between mb-3 sm:mb-5">
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-blue-500/20 border border-blue-400/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <Headphones className="w-5 h-5 sm:w-7 sm:h-7 text-blue-300" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold">{t.home.features.aiBadge}</span>
              </div>
              <h3 className="text-lg sm:text-2xl font-bold text-white mb-1.5 sm:mb-2">{t.home.features.ai}</h3>
              <p className="text-white/45 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-5">{t.home.features.aiDesc}</p>
              <div className="flex flex-wrap gap-2">
                {t.home.features.aiTags.map((tag: string) => (
                  <span key={tag} className="px-2.5 py-1 rounded-full bg-white/8 text-white/55 text-xs hover:bg-blue-500/20 hover:text-blue-300 transition-colors duration-300">{tag}</span>
                ))}
              </div>
            </div>

            <div className="col-span-2 lg:col-span-4 relative rounded-2xl sm:rounded-3xl p-5 sm:p-8 overflow-hidden card-hover-glow reveal-on-scroll group" style={{ transitionDelay: "200ms" }}>
              <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/15 via-purple-600/8 to-pink-600/5" />
              <div className="absolute inset-0 border border-fuchsia-500/25 rounded-2xl sm:rounded-3xl group-hover:border-fuchsia-400/40 transition-colors duration-500" />
              <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-fuchsia-500/10 blur-[80px] group-hover:bg-fuchsia-500/20 transition-all duration-700" />
              <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-pink-500/10 blur-3xl group-hover:bg-pink-500/20 transition-all duration-700" />
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="flex items-start justify-between sm:justify-start gap-4 w-full sm:w-auto">
                  <div className="w-14 h-14 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-400/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500">
                    <Camera className="w-7 h-7 text-fuchsia-300" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-300 text-xs font-semibold sm:hidden">{t.home.features.avatarBadge}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-white">{t.home.features.avatar}</h3>
                    <span className="hidden sm:inline px-2.5 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-300 text-xs font-semibold">{t.home.features.avatarBadge}</span>
                  </div>
                  <p className="text-white/45 text-sm leading-relaxed mb-4 max-w-2xl">{t.home.features.avatarDesc}</p>
                  <div className="flex flex-wrap gap-2">
                    {t.home.features.avatarTags.map((tag: string) => (
                      <span key={tag} className="px-2.5 py-1 rounded-full bg-white/8 text-white/55 text-xs hover:bg-fuchsia-500/20 hover:text-fuchsia-300 transition-colors duration-300">{tag}</span>
                    ))}
                  </div>
                </div>
                <Link href="/upload" className="shrink-0">
                  <button className="group/btn relative flex items-center gap-2 px-5 py-2.5 rounded-xl bg-fuchsia-500/20 border border-fuchsia-400/30 text-fuchsia-300 hover:bg-fuchsia-500/30 transition-all text-sm font-semibold whitespace-nowrap overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                    <Upload className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">{t.nav.createKaraoke}</span>
                    <ArrowRight className="w-3.5 h-3.5 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>
            </div>

            {t.home.features.cards.map((f: any, i: number) => {
              const Icon = SMALL_CARD_ICONS[i];
              const colors = [
                { color: "text-yellow-400", bg: "from-yellow-500/12 to-amber-600/5",   border: "border-yellow-500/20", hoverBorder: "hover:border-yellow-400/40", hoverBg: "hover:bg-yellow-500/20", hoverText: "hover:text-yellow-300" },
                { color: "text-orange-400", bg: "from-orange-500/12 to-red-600/5",     border: "border-orange-500/20", hoverBorder: "hover:border-orange-400/40", hoverBg: "hover:bg-orange-500/20", hoverText: "hover:text-orange-300" },
                { color: "text-green-400",  bg: "from-green-500/12 to-teal-600/5",    border: "border-green-500/20",  hoverBorder: "hover:border-green-400/40", hoverBg: "hover:bg-green-500/20", hoverText: "hover:text-green-300" },
                { color: "text-red-400",    bg: "from-red-500/12 to-orange-600/5",     border: "border-red-500/20",    hoverBorder: "hover:border-red-400/40", hoverBg: "hover:bg-red-500/20", hoverText: "hover:text-red-300" },
                { color: "text-indigo-400", bg: "from-indigo-500/12 to-violet-600/5",  border: "border-indigo-500/20", hoverBorder: "hover:border-indigo-400/40", hoverBg: "hover:bg-indigo-500/20", hoverText: "hover:text-indigo-300" },
                { color: "text-pink-400",   bg: "from-pink-500/12 to-rose-600/5",      border: "border-pink-500/20",   hoverBorder: "hover:border-pink-400/40", hoverBg: "hover:bg-pink-500/20", hoverText: "hover:text-pink-300" },
              ][i];
              if (!colors) return null;
              return (
                <div key={i} className={`relative rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-gradient-to-br ${colors.bg} border ${colors.border} ${colors.hoverBorder} overflow-hidden card-hover-glow reveal-on-scroll group`} style={{ transitionDelay: `${(i + 3) * 100}ms` }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500">
                      <Icon className={`w-5 h-5 ${colors.color}`} />
                    </div>
                    {f.badge && (
                      <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/60 text-[10px] font-semibold">{f.badge}</span>
                    )}
                  </div>
                  <h3 className="font-bold text-white text-sm mb-1.5">{f.title}</h3>
                  <p className="text-white/40 text-xs leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.03] to-background" />
          <GridPattern />
        </div>
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8" dir={dir}>
          <div className="text-center mb-12 reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-400 font-medium mb-4 backdrop-blur-sm">
              <Globe className="w-3 h-3" />{lang === "he" ? "14 שפות" : lang === "ar" ? "14 لغة" : "14 Languages"}
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-bold mb-3">
              {lang === "he" ? "שר בכל שפה" : lang === "ar" ? "غنِّ بأي لغة" : "Sing in Any Language"}
            </h2>
            <p className="text-white/35 text-base max-w-md mx-auto">
              {lang === "he" ? "MYOUKEE תומכת ב-14 שפות עם זיהוי אוטומטי" : lang === "ar" ? "يدعم MYOUKEE 14 لغة مع الكشف التلقائي" : "MYOUKEE supports 14 languages with automatic detection"}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 reveal-on-scroll" style={{ transitionDelay: "200ms" }}>
            {[
              { flag: "🇺🇸", name: "English" },
              { flag: "🇮🇱", name: "עברית" },
              { flag: "🇸🇦", name: "العربية" },
              { flag: "🇷🇺", name: "Русский" },
              { flag: "🇪🇸", name: "Español" },
              { flag: "🇫🇷", name: "Français" },
              { flag: "🇩🇪", name: "Deutsch" },
              { flag: "🇯🇵", name: "日本語" },
              { flag: "🇨🇳", name: "中文" },
              { flag: "🇰🇷", name: "한국어" },
              { flag: "🇹🇭", name: "ไทย" },
              { flag: "🇻🇳", name: "Tiếng Việt" },
              { flag: "🇵🇭", name: "Filipino" },
              { flag: "🇮🇩", name: "Indonesia" },
            ].map(({ flag, name }) => (
              <div key={name} className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 cursor-default backdrop-blur-sm">
                <span className="text-lg group-hover:scale-125 transition-transform duration-300">{flag}</span>
                <span className="text-sm text-white/50 group-hover:text-white/80 transition-colors">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/[0.03] to-background" />
        </div>
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" dir={dir}>
          <div className="reveal-on-scroll relative rounded-3xl p-8 sm:p-14 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-fuchsia-500/15 animate-gradient-shift" style={{ backgroundSize: "200% 200%" }} />
            <div className="absolute inset-[1px] rounded-3xl bg-background/90 backdrop-blur-xl" />
            <div className="absolute -right-20 -top-20 w-60 h-60 rounded-full bg-primary/10 blur-[60px] animate-float-slow" />
            <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-accent/10 blur-[40px] animate-float-reverse" />
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl sm:text-5xl font-display font-bold mb-4">
                {lang === "he" ? "מוכן לשיר?" : lang === "ar" ? "مستعد للغناء؟" : "Ready to Sing?"}
              </h2>
              <p className="text-white/45 text-base sm:text-lg mb-8 max-w-lg mx-auto">
                {lang === "he" ? "הפוך כל שיר לקריוקי תוך שניות. בחינם. בלי התקנה." : lang === "ar" ? "حوّل أي أغنية إلى كاريوكي في ثوانٍ. مجاناً. بدون تثبيت." : "Turn any song into karaoke in seconds. Free. No install needed."}
              </p>
              <Link href="/upload">
                <button
                  className="group relative inline-flex items-center gap-3 px-10 py-4 rounded-2xl text-white font-bold text-lg transition-all hover:scale-105 active:scale-95 animate-btn-glow overflow-hidden"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)" }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <Mic className="w-6 h-6 relative z-10" />
                  <span className="relative z-10">{t.home.hero.ctaCreate}</span>
                  <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative py-12 border-t border-white/[0.06] bg-white/[0.01]">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8" dir={dir}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent group-hover:scale-110 transition-transform">
                <Mic className="h-4 w-4 text-white" />
              </div>
              <span className="font-display font-bold text-white/70 group-hover:text-white transition-colors">MYOUKEE</span>
            </div>

            <a
              href="https://mail.google.com/mail/?view=cm&to=windot100@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white/80 hover:bg-white/10 transition-all text-sm"
            >
              <Mail className="w-4 h-4 text-primary" />
              {t.home.support.label}
            </a>

            <div className="flex items-center gap-4 text-xs text-white/25">
              <Link href="/privacy"><span className="hover:text-white/50 cursor-pointer transition-colors">{t.consent.privacyLink}</span></Link>
              <span className="w-px h-3 bg-white/15" />
              <Link href="/terms"><span className="hover:text-white/50 cursor-pointer transition-colors">{t.consent.termsLink}</span></Link>
              <span className="w-px h-3 bg-white/15" />
              <span>MYOUKEE © 2026</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
