import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Zap, CheckCircle2, XCircle, Scissors, FileText, Globe, Sparkles,
  Music, Video, Upload, ChevronDown, Mic, Trophy, Users, Star,
  Share2, Download, Swords, Play, ChevronRight, Headphones, ArrowRight,
  Camera, Mail,
} from "lucide-react";
import { useFulfillPayment, useFulfillPayPal, useRecoverPayPal } from "@/hooks/use-payments";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { useLang } from "@/contexts/LanguageContext";

type PaymentBanner = "success" | "cancelled" | "already_fulfilled" | "error" | null;

const SMALL_CARD_ICONS = [Trophy, Swords, Users, Video, Download, Star, Share2, FileText];

// Animated particles component
function ParticlesBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-purple-500/30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${5 + Math.random() * 5}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
      {[...Array(15)].map((_, i) => (
        <div
          key={`blue-${i}`}
          className="absolute w-0.5 h-0.5 rounded-full bg-blue-500/40"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${4 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}
    </div>
  );
}

// Sound wave visualizer
function SoundWaveVisualizer() {
  return (
    <div className="flex items-end gap-1 h-16">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="w-1.5 rounded-full bg-gradient-to-t from-purple-500 to-blue-500"
          style={{
            animation: `sound-wave 1s ease-in-out infinite`,
            animationDelay: `${i * 0.1}s`,
            height: `${20 + Math.random() * 40}px`,
          }}
        />
      ))}
    </div>
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

  const recovery = useRecoverPayPal(!!authData?.user);
  useEffect(() => {
    if (recovery.data?.recovered && recovery.data.recovered > 0) {
      setPaymentBanner("success");
    }
  }, [recovery.data]);

  const featuresRef = useRef<HTMLDivElement>(null);
  const howRef      = useRef<HTMLDivElement>(null);
  const whyRef      = useRef<HTMLDivElement>(null);

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
      { id: "why-myoukee",  ref: whyRef      },
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
    { id: "why-myoukee",  label: t.home.tabs.whyMyoukee,   icon: Star     },
    { id: "upload",       label: t.nav.createKaraoke,      icon: Upload,  href: "/upload" },
    { id: "history",      label: t.nav.history,            icon: Video,   href: "/history" },
  ] as const;

  const scrollTo = (id: string) => {
    if (id === "home") { window.scrollTo({ top: 0, behavior: "smooth" }); setActiveTab("home"); return; }
    const map: Record<string, React.RefObject<HTMLDivElement | null>> = {
      features: featuresRef, "how-it-works": howRef, "why-myoukee": whyRef,
    };
    const ref = map[id];
    if (ref?.current) {
      const top = ref.current.getBoundingClientRect().top + window.scrollY - (64 + 49);
      window.scrollTo({ top, behavior: "smooth" });
      setActiveTab(id);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">

      {/* ── Payment Banners with Premium Styling ─────────────────────────────────────── */}
      {paymentBanner === "success" && (
        <div className="w-full bg-gradient-to-r from-green-500/10 via-green-500/15 to-green-500/10 border-b border-green-500/30 px-4 py-4 flex items-center justify-center gap-3 text-sm backdrop-blur-xl">
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          </div>
          <span className="text-green-300 font-medium">{lang === "he" ? "הרכישה הצליחה! הקרדיטים נוספו לחשבונך." : "Purchase successful! Credits added to your account."}</span>
          <button onClick={() => setPaymentBanner(null)} className="ml-4 w-6 h-6 rounded-full bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors flex items-center justify-center">X</button>
        </div>
      )}
      {paymentBanner === "cancelled" && (
        <div className="w-full bg-gradient-to-r from-yellow-500/10 via-yellow-500/15 to-yellow-500/10 border-b border-yellow-500/30 px-4 py-4 flex items-center justify-center gap-3 text-sm backdrop-blur-xl">
          <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <XCircle className="w-4 h-4 text-yellow-400" />
          </div>
          <span className="text-yellow-300">{lang === "he" ? "הרכישה בוטלה. ניתן לרכוש בכל עת." : "Purchase cancelled. You can buy at any time."}</span>
          <button onClick={() => setPaymentBanner(null)} className="ml-4 w-6 h-6 rounded-full bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-colors flex items-center justify-center">X</button>
        </div>
      )}
      {paymentBanner === "error" && (
        <div className="w-full bg-gradient-to-r from-red-500/10 via-red-500/15 to-red-500/10 border-b border-red-500/30 px-4 py-4 flex items-center justify-center gap-3 text-sm backdrop-blur-xl">
          <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <span className="text-red-300">{lang === "he" ? "אירעה שגיאה בעיבוד התשלום. הקרדיטים יתווספו אוטומטית בכניסה הבאה." : "Payment processing error. Credits will be added automatically on next login."}</span>
          <button onClick={() => setPaymentBanner(null)} className="ml-4 w-6 h-6 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors flex items-center justify-center">X</button>
        </div>
      )}

      {/* ── Premium Sticky Tabs ─────────────────────────────────────────── */}
      <div className="sticky top-16 z-40 glass-panel border-b border-purple-500/10">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-stretch gap-0 overflow-x-auto scrollbar-none" dir={dir}>
            {TABS.map(({ id, label, icon: Icon, href }: any) => {
              const isActive = activeTab === id;
              return href ? (
                <Link key={id} href={href}>
                  <button className={`relative flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                    isActive 
                      ? "text-purple-300" 
                      : "text-white/40 hover:text-white/70"
                  }`}>
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                </Link>
              ) : (
                <button 
                  key={id} 
                  className={`relative flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                    isActive 
                      ? "text-purple-300" 
                      : "text-white/40 hover:text-white/70"
                  }`}
                  onClick={() => scrollTo(id)}
                >
                  {isActive && (
                    <>
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500" />
                      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-purple-500/20 to-transparent" />
                    </>
                  )}
                  <Icon className={`w-4 h-4 ${isActive ? "text-purple-400" : ""}`} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          1. ULTRA PREMIUM HERO
      ══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[85vh] sm:min-h-[95vh] flex flex-col items-center justify-center overflow-hidden hero-bg">
        <ParticlesBackground />
        
        {/* Multiple layered backgrounds for depth */}
        <div className="absolute inset-0 -z-10">
          <img
            src="/images/hero-bg.jpg"
            alt="" 
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-blue-900/20" />
          
          {/* Animated glow orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-500/20 blur-[150px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-blue-500/15 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-pink-500/10 blur-[180px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-16 pb-8 sm:pb-12">
          {/* Premium badge with glow */}
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass-panel-glow border-purple-500/30 text-sm text-white/80 mb-8 sm:mb-12">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
            </span>
            <span className="animated-gradient-text font-semibold">{t.home.hero.badge}</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>

          {/* Main headline with intense glow */}
          <h1 className="text-5xl sm:text-7xl lg:text-9xl font-black font-display leading-[0.85] tracking-tight mb-6 sm:mb-8">
            <span className="text-white drop-shadow-[0_0_30px_rgba(168,85,247,0.3)]">
              {t.home.hero.headline1}
            </span>
            <br />
            <span className="animated-gradient-text text-glow-intense">
              {t.home.hero.headline2}
            </span>
            <br />
            <span className="text-white">{t.home.hero.headline3}</span>
          </h1>

          {/* Sound wave visualizer */}
          <div className="flex justify-center mb-6">
            <SoundWaveVisualizer />
          </div>

          <p className="text-lg sm:text-2xl text-white/60 max-w-2xl mx-auto mb-3 leading-relaxed font-light">
            {t.home.hero.sub}
          </p>
          <p className="text-sm sm:text-base text-white/40 max-w-xl mx-auto mb-8 sm:mb-12">
            {t.home.hero.sub2}
          </p>

          {/* Premium feature chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8 sm:mb-12">
            {t.home.hero.chips.map((f, i) => (
              <span 
                key={f} 
                className="px-4 py-2 rounded-full glass-panel border-purple-500/20 text-sm text-white/70 shimmer"
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                {f}
              </span>
            ))}
          </div>

          {/* Premium CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link href="/upload">
              <button className="group relative flex items-center gap-3 px-10 py-5 rounded-2xl text-white font-bold text-lg transition-all duration-300 hover:scale-105 active:scale-95 btn-neon overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500 opacity-100" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-500 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Mic className="relative w-6 h-6 mic-pulse" />
                <span className="relative">{t.home.hero.ctaCreate}</span>
                <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="/leaderboard">
              <button className="group flex items-center gap-3 px-8 py-5 rounded-2xl glass-panel-glow border-yellow-500/20 text-white/80 hover:text-white hover:border-yellow-500/40 transition-all duration-300 font-semibold text-lg">
                <Trophy className="w-6 h-6 text-yellow-400 group-hover:scale-110 transition-transform" />
                {t.home.hero.ctaLeaderboard}
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>

        {/* Scroll indicator with glow */}
        <button 
          onClick={() => scrollTo("how-it-works")}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 hover:text-purple-400 transition-colors"
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <ChevronDown className="w-6 h-6 animate-bounce" />
        </button>
      </section>

      {/* ══════════════════════════════════════════════════════════
          2. PREMIUM VALUE STRIP
      ══════════════════════════════════════════════════════════ */}
      <section className="relative py-16 sm:py-24 border-y border-purple-500/10">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-blue-500/5" />
        
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative" dir={dir}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Music, title: t.home.valueStrip.title1, desc: t.home.valueStrip.desc1, gradient: "from-purple-500 to-violet-600" },
              { icon: Zap,   title: t.home.valueStrip.title2, desc: t.home.valueStrip.desc2, gradient: "from-blue-500 to-cyan-500" },
              { icon: Globe, title: t.home.valueStrip.title3, desc: t.home.valueStrip.desc3, gradient: "from-green-500 to-emerald-500" },
            ].map(({ icon: Icon, title, desc, gradient }, i) => (
              <div 
                key={title} 
                className="card-premium rounded-3xl p-8 text-center group"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`relative inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
                  <Icon className="w-8 h-8 text-white relative" />
                </div>
                <h3 className="font-bold text-white text-xl mb-3">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          3. HOW IT WORKS - PREMIUM
      ══════════════════════════════════════════════════════════ */}
      <section ref={howRef} id="how-it-works" className="relative scroll-mt-32 py-20 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1920&h=800&fit=crop&q=80"
            alt="" className="absolute inset-0 w-full h-full object-cover opacity-30"
            style={{ filter: "saturate(1.2)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/30 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-background/90" />
        </div>

        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative" dir={dir}>
          <div className="text-center mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border-blue-500/30 text-sm text-blue-300 font-medium mb-6">
              <Play className="w-4 h-4" />
              {t.home.howItWorks.badge}
            </div>
            <h2 className="text-4xl sm:text-6xl font-display font-black mb-4">
              <span className="text-white">{t.home.howItWorks.title}</span>
            </h2>
            <p className="text-white/40 text-lg max-w-md mx-auto">{t.home.howItWorks.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden sm:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-purple-500/50 via-blue-500/50 to-pink-500/50" />

            {[
              { num: "01", icon: Upload,   step: t.home.howItWorks.step1, gradient: "from-purple-500 to-violet-600", glow: "shadow-purple-500/30" },
              { num: "02", icon: Sparkles, step: t.home.howItWorks.step2, gradient: "from-blue-500 to-cyan-500", glow: "shadow-blue-500/30" },
              { num: "03", icon: Mic,      step: t.home.howItWorks.step3, gradient: "from-pink-500 to-rose-500", glow: "shadow-pink-500/30" },
            ].map(({ num, icon: Icon, step, gradient, glow }) => (
              <div key={num} className="relative text-center group" dir={dir}>
                <div className="relative inline-flex mb-8">
                  {/* Glow effect */}
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${gradient} blur-xl opacity-50 group-hover:opacity-80 transition-opacity`} />
                  
                  <div className={`relative w-24 h-24 rounded-3xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-2xl ${glow} group-hover:scale-110 transition-all duration-300`}>
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent" />
                    <Icon className="w-10 h-10 text-white relative" />
                  </div>
                  
                  {/* Step number */}
                  <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-background border-2 border-purple-500/50 flex items-center justify-center text-xs font-bold text-purple-300">
                    {num}
                  </span>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed max-w-[250px] mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link href="/upload">
              <button className="group inline-flex items-center gap-3 px-10 py-4 rounded-2xl btn-neon text-white font-bold text-lg transition-all duration-300 hover:scale-105">
                <Mic className="w-5 h-5" />
                {t.home.howItWorks.cta}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          4. CORE FEATURES - ULTRA PREMIUM BENTO
      ══════════════════════════════════════════════════════════ */}
      <section ref={featuresRef} id="features" className="relative scroll-mt-32 py-20 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1920&h=1000&fit=crop&q=80"
            alt="" className="absolute inset-0 w-full h-full object-cover opacity-25"
            style={{ filter: "saturate(1.1)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background" />
        </div>

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative" dir={dir}>
          <div className="text-center mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border-purple-500/30 text-sm text-purple-300 font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              {t.home.features.badge}
            </div>
            <h2 className="text-4xl sm:text-6xl font-display font-black mb-4">
              <span className="text-white">{t.home.features.title}</span>
            </h2>
            <p className="text-white/40 text-lg max-w-lg mx-auto">{t.home.features.subtitle}</p>
          </div>

          {/* Premium Bento grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 auto-rows-fr">

            {/* Hero card: Real-time singing */}
            <div className="col-span-2 sm:col-span-2 relative rounded-3xl p-6 sm:p-10 card-premium overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/15 via-purple-600/5 to-transparent" />
              <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-purple-500/20 blur-[80px] group-hover:bg-purple-500/30 transition-colors" />
              
              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <Mic className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <span className="px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold">{t.home.features.singBadge}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">{t.home.features.sing}</h3>
                <p className="text-white/50 text-sm sm:text-base leading-relaxed mb-6">{t.home.features.singDesc}</p>
                <div className="flex flex-wrap gap-2">
                  {t.home.features.singTags.map(tag => (
                    <span key={tag} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs">{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Hero card: AI Separation */}
            <div className="col-span-2 sm:col-span-2 relative rounded-3xl p-6 sm:p-10 card-premium overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 via-cyan-600/5 to-transparent" />
              <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-blue-500/20 blur-[80px] group-hover:bg-blue-500/30 transition-colors" />
              
              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Headphones className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <span className="px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold">{t.home.features.aiBadge}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">{t.home.features.ai}</h3>
                <p className="text-white/50 text-sm sm:text-base leading-relaxed mb-6">{t.home.features.aiDesc}</p>
                <div className="flex flex-wrap gap-2">
                  {t.home.features.aiTags.map(tag => (
                    <span key={tag} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs">{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Avatar animation card — full width */}
            <div className="col-span-2 lg:col-span-4 relative rounded-3xl p-6 sm:p-10 card-premium overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/15 via-purple-600/5 to-transparent" />
              <div className="absolute -right-32 -top-32 w-96 h-96 rounded-full bg-pink-500/15 blur-[100px] group-hover:bg-pink-500/25 transition-colors" />
              <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-purple-500/15 blur-[80px]" />
              
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-8">
                <div className="flex items-start justify-between sm:justify-start gap-4 w-full sm:w-auto">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shrink-0 shadow-lg shadow-pink-500/30">
                    <Camera className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <span className="px-3 py-1.5 rounded-full bg-pink-500/20 border border-pink-500/30 text-pink-300 text-xs font-bold sm:hidden">{t.home.features.avatarBadge}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-2xl sm:text-3xl font-bold text-white">{t.home.features.avatar}</h3>
                    <span className="hidden sm:inline px-3 py-1.5 rounded-full bg-pink-500/20 border border-pink-500/30 text-pink-300 text-xs font-bold">{t.home.features.avatarBadge}</span>
                  </div>
                  <p className="text-white/50 text-sm sm:text-base leading-relaxed mb-5 max-w-2xl">{t.home.features.avatarDesc}</p>
                  <div className="flex flex-wrap gap-2">
                    {t.home.features.avatarTags.map(tag => (
                      <span key={tag} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs">{tag}</span>
                    ))}
                  </div>
                </div>
                <Link href="/upload" className="shrink-0">
                  <button className="group/btn flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500/20 to-rose-500/10 border border-pink-500/30 text-pink-300 hover:bg-pink-500/30 transition-all text-sm font-semibold whitespace-nowrap">
                    <Upload className="w-4 h-4" />
                    {t.nav.createKaraoke}
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Medium cards */}
            {t.home.features.cards.map((f, i) => {
              const Icon = SMALL_CARD_ICONS[i];
              const colors = [
                { gradient: "from-yellow-500 to-amber-600", glow: "shadow-yellow-500/20", bg: "from-yellow-500/10 to-amber-600/5" },
                { gradient: "from-orange-500 to-red-600", glow: "shadow-orange-500/20", bg: "from-orange-500/10 to-red-600/5" },
                { gradient: "from-green-500 to-emerald-600", glow: "shadow-green-500/20", bg: "from-green-500/10 to-emerald-600/5" },
                { gradient: "from-red-500 to-rose-600", glow: "shadow-red-500/20", bg: "from-red-500/10 to-rose-600/5" },
                { gradient: "from-indigo-500 to-violet-600", glow: "shadow-indigo-500/20", bg: "from-indigo-500/10 to-violet-600/5" },
                { gradient: "from-pink-500 to-rose-600", glow: "shadow-pink-500/20", bg: "from-pink-500/10 to-rose-600/5" },
                { gradient: "from-sky-500 to-blue-600", glow: "shadow-sky-500/20", bg: "from-sky-500/10 to-blue-600/5" },
                { gradient: "from-purple-500 to-violet-600", glow: "shadow-purple-500/20", bg: "from-purple-500/10 to-violet-600/5" },
              ][i];
              return (
                <div key={i} className={`relative rounded-3xl p-5 sm:p-7 card-premium overflow-hidden group`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg}`} />
                  
                  <div className="relative">
                    <div className="flex items-start justify-between mb-5">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg ${colors.glow}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      {f.badge && (
                        <span className="px-2.5 py-1 rounded-full bg-white/10 text-white/70 text-[10px] font-bold">{f.badge}</span>
                      )}
                    </div>
                    <h3 className="font-bold text-white text-base mb-2">{f.title}</h3>
                    <p className="text-white/45 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          5. AI TECHNOLOGY - PREMIUM
      ══════════════════════════════════════════════════════════ */}
      <section className="relative py-20 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&h=700&fit=crop&q=80"
            alt="" className="absolute inset-0 w-full h-full object-cover opacity-25"
            style={{ filter: "saturate(0.7)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-blue-500/10 blur-[150px]" />
        </div>

        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative" dir={dir}>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border-blue-500/30 text-sm text-blue-300 font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              {t.home.aiTech.badge}
            </div>
            <h2 className="text-4xl sm:text-6xl font-display font-black mb-4">
              {t.home.aiTech.title} <span className="animated-gradient-text">{t.home.aiTech.titleHighlight}</span>
            </h2>
            <p className="text-white/40 text-lg max-w-lg mx-auto">{t.home.aiTech.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <div className="card-premium rounded-3xl p-8 sm:p-10 group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-600/5 rounded-3xl" />
              <div className="relative">
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Scissors className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{t.home.aiTech.demucsTitle}</h3>
                    <p className="text-blue-400/80 text-sm">{t.home.aiTech.demucsSub}</p>
                  </div>
                </div>
                <p className="text-white/55 text-base leading-relaxed mb-8">{t.home.aiTech.demucsDesc}</p>
                <div className="space-y-3">
                  {t.home.aiTech.demucsBullets.map(f => (
                    <div key={f} className="flex items-center gap-3 text-sm text-white/50">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card-premium rounded-3xl p-8 sm:p-10 group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-violet-600/5 rounded-3xl" />
              <div className="relative">
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{t.home.aiTech.whisperTitle}</h3>
                    <p className="text-purple-400/80 text-sm">{t.home.aiTech.whisperSub}</p>
                  </div>
                </div>
                <p className="text-white/55 text-base leading-relaxed mb-8">{t.home.aiTech.whisperDesc}</p>
                <div className="space-y-3">
                  {t.home.aiTech.whisperBullets.map(f => (
                    <div key={f} className="flex items-center gap-3 text-sm text-white/50">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stats with glow */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {[
              { num: "+100", label: dir === "rtl" ? "שפות נתמכות" : "+100 Languages" },
              { num: "<5m",  label: dir === "rtl" ? "זמן עיבוד"   : "Processing Time" },
              { num: "AI",   label: dir === "rtl" ? "פירוד ווקאל" : "Vocal Separation" },
              { num: "0$",   label: dir === "rtl" ? "40 שניות ראשונות" : "First 40 Seconds" },
            ].map((s, i) => (
              <div key={s.label} className="text-center card-premium rounded-2xl py-8">
                <p className="text-4xl sm:text-5xl font-black animated-gradient-text mb-2">{s.num}</p>
                <p className="text-white/40 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          6. SOCIAL EXPERIENCE - PREMIUM
      ══════════════════════════════════════════════════════════ */}
      <section className="relative py-20 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src="https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=1920&h=800&fit=crop&q=80"
            alt="" className="absolute inset-0 w-full h-full object-cover opacity-25"
            style={{ filter: "saturate(1.5)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full bg-amber-500/10 blur-[150px]" />
        </div>

        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative" dir={dir}>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border-amber-500/30 text-sm text-amber-300 font-medium mb-6">
              <Trophy className="w-4 h-4" />
              {t.home.compete.badge}
            </div>
            <h2 className="text-4xl sm:text-6xl font-display font-black mb-4 text-white">{t.home.compete.title}</h2>
            <p className="text-white/40 text-lg max-w-lg mx-auto">{t.home.compete.subtitle}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { emoji: "🏆", title: dir === "rtl" ? "לידרבורד גלובלי"  : "Global Leaderboard", desc: dir === "rtl" ? "ביצועים מכל העולם, דירוג שבועי ותגי הישג בלעדיים." : "Performances from around the world, weekly rankings and exclusive achievement badges.", badge: dir === "rtl" ? "גלובלי" : "Global",  gradient: "from-yellow-500 to-amber-600" },
              { emoji: "⚔️", title: "Battle Mode", desc: dir === "rtl" ? "אתגר חבר ישירות — הוא רואה את הציון שלך וצריך לנצח." : "Challenge a friend directly — they see your score and need to win.", badge: dir === "rtl" ? "ויראלי" : "Viral", gradient: "from-orange-500 to-red-600" },
              { emoji: "⭐", title: dir === "rtl" ? "דירוג כוכבים" : "Star Rating", desc: dir === "rtl" ? "ניתוח תזמון + מנגינה + כיסוי → ציון 0-100 ו-1-5 כוכבים." : "Timing + pitch + coverage analysis → score 0-100 and 1-5 stars.", badge: "", gradient: "from-pink-500 to-rose-600" },
              { emoji: "🔥", title: dir === "rtl" ? "אתגרי השבוע" : "Weekly Challenges", desc: dir === "rtl" ? "השלם אתגרים שבועיים, צבור נקודות ועלה בדירוג." : "Complete weekly challenges, earn points and climb the rankings.", badge: dir === "rtl" ? "שבועי" : "Weekly", gradient: "from-red-500 to-orange-600" },
              { emoji: "📱", title: dir === "rtl" ? "שיתוף מיידי" : "Instant Sharing", desc: dir === "rtl" ? "WhatsApp, Instagram — עם ציון, כוכבים ולינק לשיר." : "WhatsApp, Instagram — with score, stars and song link.", badge: "", gradient: "from-sky-500 to-blue-600" },
            ].map(ch => (
              <div key={ch.title} className="card-premium rounded-2xl sm:rounded-3xl p-5 sm:p-7 overflow-hidden group">
                <div className={`absolute inset-0 bg-gradient-to-br ${ch.gradient.replace('from-', 'from-').replace(' to-', '/10 to-')}/5`} />
                {ch.badge && (
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/40 text-white/60 text-[10px] font-bold border border-white/10">{ch.badge}</span>
                )}
                <div className="relative">
                  <div className="text-3xl sm:text-4xl mb-4 sm:mb-5">{ch.emoji}</div>
                  <h3 className="font-bold text-white text-sm sm:text-base mb-2">{ch.title}</h3>
                  <p className="text-white/45 text-xs sm:text-sm leading-relaxed">{ch.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/leaderboard">
              <button className="group flex items-center gap-3 px-8 py-4 rounded-2xl glass-panel-glow border-yellow-500/30 text-yellow-300 hover:border-yellow-500/50 transition-all font-semibold">
                <Trophy className="w-5 h-5" />
                {t.home.compete.ctaLeaderboard}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          7. WHY MYOUKEE - PREMIUM
      ══════════════════════════════════════════════════════════ */}
      <section ref={whyRef} id="why-myoukee" className="relative scroll-mt-32 py-20 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src="https://images.unsplash.com/photo-1614680376739-414d95ff43df?w=1920&h=800&fit=crop&q=80"
            alt="" className="absolute inset-0 w-full h-full object-cover opacity-25"
            style={{ filter: "saturate(0.8)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background" />
        </div>

        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative" dir={dir}>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border-yellow-500/30 text-sm text-yellow-300 font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              {t.home.why.badge}
            </div>
            <h2 className="text-4xl sm:text-6xl font-display font-black mb-4 text-white">{t.home.why.title}</h2>
            <p className="text-white/40 text-lg">{t.home.why.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {t.home.why.items.map(({ title, desc }, i) => {
              const icons = [Music, Zap, Video, Camera, Trophy, Mic];
              const Icon = icons[i] ?? Star;
              const highlight = i === 0;
              const gradients = [
                "from-purple-500 to-violet-600",
                "from-blue-500 to-cyan-500",
                "from-green-500 to-emerald-500",
                "from-pink-500 to-rose-500",
                "from-yellow-500 to-amber-500",
                "from-indigo-500 to-purple-500",
              ];
              return (
                <div 
                  key={i} 
                  className={`card-premium rounded-2xl p-7 group ${highlight ? "ring-1 ring-purple-500/30" : ""}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${highlight ? "from-purple-500/10 to-blue-500/5" : "from-white/[0.02] to-transparent"} rounded-2xl`} />
                  <div className="relative flex items-start gap-5">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradients[i]} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base mb-2">{title}</h3>
                      <p className="text-white/45 text-sm leading-relaxed">{desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          8. PREMIUM FOOTER
      ══════════════════════════════════════════════════════════ */}
      <footer className="relative py-16 border-t border-purple-500/10">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-500/5 to-transparent" />
        
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative" dir={dir}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 blur-lg opacity-50" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600">
                  <Mic className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <span className="font-display font-bold text-xl text-white">MYOUKEE</span>
                <p className="text-xs text-purple-400/60 tracking-wide">Karaoke Studio</p>
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <Link href="/upload" className="text-white/50 hover:text-purple-300 transition-colors">{t.nav.createKaraoke}</Link>
              <Link href="/leaderboard" className="text-white/50 hover:text-purple-300 transition-colors">{t.nav.leaderboard}</Link>
              <Link href="/party" className="text-white/50 hover:text-purple-300 transition-colors">Party</Link>
              <Link href="/xp" className="text-white/50 hover:text-purple-300 transition-colors">XP</Link>
            </div>

            {/* Support */}
            <div className="flex items-center gap-4">
              <a 
                href="mailto:support@myoukee.com" 
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass-panel border-purple-500/20 text-white/60 hover:text-purple-300 hover:border-purple-500/40 transition-all text-sm"
              >
                <Mail className="w-4 h-4" />
                {lang === "he" ? "תמיכה" : "Support"}
              </a>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/30 text-sm">
              {new Date().getFullYear()} MYOUKEE. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-xs">
              <Link href="/privacy" className="text-white/30 hover:text-white/60 transition-colors">Privacy</Link>
              <Link href="/terms" className="text-white/30 hover:text-white/60 transition-colors">Terms</Link>
              <Link href="/copyright" className="text-white/30 hover:text-white/60 transition-colors">Copyright</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
