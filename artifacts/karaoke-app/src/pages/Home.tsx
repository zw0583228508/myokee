import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  CheckCircle2, XCircle, Sparkles, Music, Video, Upload, ChevronDown,
  Mic, Trophy, Users, Star, Swords, Play, Headphones, ArrowRight,
  Camera, Mail, FileText, Zap, Globe, Wand2, Radio, Share2, Crown,
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
    <div className="music-bars" aria-hidden="true">
      <span /><span /><span /><span /><span />
    </div>
  );
}

/* Cinematic aurora/galaxy stage that lives behind the hero */
function HeroStage() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden ds-bg-galaxy">
      {/* Animated aurora gradient layer */}
      <div className="ds-bg-aurora absolute inset-0 opacity-70" />
      {/* Soft top vignette → page background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050510]/30 via-transparent to-[#050510]" />
      {/* Floating glow orbs */}
      <div className="ds-orb ds-orb-violet absolute -top-24 -left-24 w-[420px] h-[420px]" />
      <div className="ds-orb ds-orb-cyan absolute top-1/3 -right-32 w-[480px] h-[480px]" style={{ animationDelay: "2s" }} />
      <div className="ds-orb ds-orb-pink absolute bottom-0 left-1/4 w-[360px] h-[360px]" style={{ animationDelay: "4s" }} />
      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)`,
        backgroundSize: "84px 84px",
        maskImage: "radial-gradient(ellipse at center, black 35%, transparent 75%)",
        WebkitMaskImage: "radial-gradient(ellipse at center, black 35%, transparent 75%)",
      }} />
      {/* Animated waveform at the bottom */}
      <svg className="absolute bottom-0 left-0 right-0 w-full h-32 sm:h-44 opacity-[0.18]" viewBox="0 0 1440 200" preserveAspectRatio="none" aria-hidden="true">
        <path fill="url(#wgrad1)" d="M0,120 C240,180 480,60 720,120 C960,180 1200,60 1440,120 L1440,200 L0,200 Z">
          <animate attributeName="d" dur="8s" repeatCount="indefinite"
            values="M0,120 C240,180 480,60 720,120 C960,180 1200,60 1440,120 L1440,200 L0,200 Z;M0,140 C240,60 480,180 720,100 C960,60 1200,180 1440,140 L1440,200 L0,200 Z;M0,120 C240,180 480,60 720,120 C960,180 1200,60 1440,120 L1440,200 L0,200 Z" />
        </path>
        <path fill="url(#wgrad2)" opacity="0.6" d="M0,150 C360,100 720,200 1080,130 C1260,100 1440,150 1440,150 L1440,200 L0,200 Z">
          <animate attributeName="d" dur="6s" repeatCount="indefinite"
            values="M0,150 C360,100 720,200 1080,130 C1260,100 1440,150 1440,150 L1440,200 L0,200 Z;M0,130 C360,190 720,110 1080,170 C1260,190 1440,130 1440,130 L1440,200 L0,200 Z;M0,150 C360,100 720,200 1080,130 C1260,100 1440,150 1440,150 L1440,200 L0,200 Z" />
        </path>
        <defs>
          <linearGradient id="wgrad1" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
          <linearGradient id="wgrad2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor="#22D3EE" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#FACC15" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/* Mock player preview card with synced karaoke lyrics overlay */
function MockKaraokePreview({ lang }: { lang: string }) {
  const lyrics =
    lang === "he"
      ? ["…אני שר את השיר שלי", "עם MYOUKEE על הבמה", "כל מילה מסונכרנת בדיוק"]
      : lang === "ar"
      ? ["…أغني أغنيتي الآن", "مع MYOUKEE على المسرح", "كل كلمة متزامنة بدقة"]
      : ["…I sing my song tonight", "With MYOUKEE on the stage", "Every word in perfect sync"];
  const liveLabel = lang === "he" ? "שידור חי" : lang === "ar" ? "بث مباشر" : "LIVE";
  return (
    <div className="ds-card-feature relative w-full max-w-[560px] mx-auto p-4 sm:p-5 overflow-hidden">
      {/* glow ring */}
      <div className="absolute -inset-px rounded-[inherit] pointer-events-none" style={{
        background: "linear-gradient(135deg, rgba(139,92,246,.45), rgba(34,211,238,.35), rgba(236,72,153,.45))",
        WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
        WebkitMaskComposite: "xor", maskComposite: "exclude", padding: "1px",
      }} />
      <div className="relative aspect-video rounded-2xl overflow-hidden ds-bg-neon-stage">
        {/* spotlight beams */}
        <div className="absolute inset-x-0 top-0 h-2/3" style={{
          background: "radial-gradient(ellipse at 30% 10%, rgba(139,92,246,.55), transparent 55%), radial-gradient(ellipse at 70% 0%, rgba(34,211,238,.45), transparent 55%)",
        }} />
        {/* mic silhouette + bars */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center shadow-[0_0_60px_rgba(139,92,246,.55)]">
              <Mic className="w-8 h-8 text-white" />
            </div>
            <div className="flex items-end gap-1 h-8">
              {[14,22,30,18,26,12,24,32,16,20].map((h, i) => (
                <span key={i} className="w-1.5 rounded-full bg-gradient-to-t from-violet-500 via-cyan-400 to-pink-500" style={{ height: `${h}px`, animation: `barPulse 1.${(i%9)+1}s ease-in-out infinite alternate`, animationDelay: `${i*0.08}s` }} />
              ))}
            </div>
          </div>
        </div>
        {/* live badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[10px] font-bold tracking-wider text-white">
          <span className="w-1.5 h-1.5 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,.9)] animate-pulse" />
          {liveLabel}
        </div>
        {/* karaoke lyrics overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/85 via-black/40 to-transparent">
          <div className="space-y-1 text-center">
            <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/80 font-semibold">{lyrics[0]}</div>
            <div className="text-base sm:text-lg font-bold ds-grad-text leading-tight">{lyrics[1]}</div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">{lyrics[2]}</div>
          </div>
        </div>
      </div>
      <style>{`@keyframes barPulse { from { transform: scaleY(.4); } to { transform: scaleY(1); } }`}</style>
    </div>
  );
}

/* Tiny floating "preview" pill — orbits around hero on desktop */
function FloatingPill({ icon: Icon, label, className = "", delay = "0s" }: { icon: any; label: string; className?: string; delay?: string }) {
  return (
    <div
      className={`hidden md:flex items-center gap-2 px-3.5 py-2 rounded-full ds-glass border border-white/10 text-xs font-semibold text-white/85 shadow-[0_8px_30px_rgba(0,0,0,.4)] ${className}`}
      style={{ animation: "floatGently 6s ease-in-out infinite", animationDelay: delay }}
    >
      <Icon className="w-3.5 h-3.5 text-cyan-300" />
      {label}
      <style>{`@keyframes floatGently { 0%,100%{ transform: translateY(0)} 50%{ transform: translateY(-10px)} }`}</style>
    </div>
  );
}

export default function Home() {
  const fulfillPayment = useFulfillPayment();
  const fulfillPayPal  = useFulfillPayPal();
  const queryClient    = useQueryClient();
  const [, navigate]   = useLocation();
  const { t, lang }    = useLang();
  const { data: authData } = useAuth();
  const [paymentBanner, setPaymentBanner] = useState<PaymentBanner>(null);
  const [activeTab, setActiveTab]         = useState<string>("home");
  const scrollContainer = useScrollReveal();

  const tabsBarRef = useRef<HTMLDivElement>(null);
  const [heroMinHeight, setHeroMinHeight] = useState<string>("calc(100dvh - 7rem)");

  useEffect(() => {
    function measureHero() {
      const vh = window.innerHeight;
      const tabsH = tabsBarRef.current?.offsetHeight ?? 48;
      const navbarEl = document.querySelector("header") as HTMLElement | null;
      const navbarH = navbarEl?.offsetHeight ?? 64;
      const target = Math.max(360, vh - tabsH - navbarH);
      setHeroMinHeight(`${target}px`);
    }
    measureHero();
    window.addEventListener("resize", measureHero);
    window.addEventListener("orientationchange", measureHero);
    const t1 = setTimeout(measureHero, 100);
    const t2 = setTimeout(measureHero, 500);
    return () => {
      window.removeEventListener("resize", measureHero);
      window.removeEventListener("orientationchange", measureHero);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const recovery = useRecoverPayPal(!!authData?.user);
  useEffect(() => {
    if (recovery.data?.recovered && recovery.data.recovered > 0) {
      setPaymentBanner("success");
    }
  }, [recovery.data]);

  const featuresRef = useRef<HTMLDivElement>(null);
  const howRef      = useRef<HTMLDivElement>(null);
  const pricingRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params  = new URLSearchParams(window.location.search);
    const refCode = params.get("ref");
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

  /* Localized strings that aren't (yet) in uiTranslations.ts — same pattern the file already uses */
  const i18n = {
    pillVocal:    lang === "he" ? "ווקאל הוסר"      : lang === "ar" ? "إزالة الصوت"        : "Vocal removed",
    pillLyrics:   lang === "he" ? "מילים מסונכרנות" : lang === "ar" ? "كلمات متزامنة"       : "Lyrics synced",
    pillSing:     lang === "he" ? "שיר עכשיו"       : lang === "ar" ? "غنِّ الآن"           : "Sing now",
    pillShare:    lang === "he" ? "שתף הופעה"       : lang === "ar" ? "شارك الأداء"         : "Share performance",
    pillReady:    lang === "he" ? "וידאו מוכן"      : lang === "ar" ? "الفيديو جاهز"        : "Karaoke video ready",
    langsBadge:   lang === "he" ? "14 שפות"         : lang === "ar" ? "14 لغة"              : "14 Languages",
    langsTitle:   lang === "he" ? "שר בכל שפה"      : lang === "ar" ? "غنِّ بأي لغة"          : "Sing in Any Language",
    langsSub:     lang === "he" ? "MYOUKEE תומכת ב-14 שפות עם זיהוי אוטומטי" : lang === "ar" ? "يدعم MYOUKEE 14 لغة مع الكشف التلقائي" : "MYOUKEE supports 14 languages with automatic detection",
    finalTitle:   lang === "he" ? "מוכן לשיר?"      : lang === "ar" ? "مستعد للغناء؟"       : "Ready to sing?",
    finalSub:     lang === "he" ? "הפוך כל שיר לקריוקי תוך שניות. בחינם. בלי התקנה." : lang === "ar" ? "حوّل أي أغنية إلى كاريوكي في ثوانٍ. مجاناً. بدون تثبيت." : "Turn any song into karaoke in seconds. Free. No install needed.",
    pricingBadge: lang === "he" ? "תמחור פשוט"      : lang === "ar" ? "تسعير بسيط"          : "Simple pricing",
    pricingTitle: lang === "he" ? "התחל בחינם. שדרג כשאתה מוכן."
                : lang === "ar" ? "ابدأ مجاناً. ترقّ عندما تكون جاهزاً."
                : "Start free. Upgrade when you're ready.",
    pricingSub:   lang === "he" ? "קרדיטים פותחים שירים ארוכים יותר, הקלטות, ייצוא ושיתוף ויראלי."
                : lang === "ar" ? "الكريديت يفتح أغاني أطول وتسجيلات وتصدير ومشاركة."
                : "Credits unlock longer tracks, recordings, exports and viral sharing.",
    planFreeName:    lang === "he" ? "חינם"   : lang === "ar" ? "مجاني"     : "Free",
    planFreeDesc:    lang === "he" ? "התחל מיד" : lang === "ar" ? "ابدأ فوراً" : "Get started",
    planProName:     lang === "he" ? "סטודיו" : lang === "ar" ? "استوديو"    : "Studio",
    planProDesc:     lang === "he" ? "הכי פופולרי" : lang === "ar" ? "الأكثر شعبية" : "Most popular",
    planMaxName:     lang === "he" ? "סטאר"   : lang === "ar" ? "نجم"        : "Star",
    planMaxDesc:     lang === "he" ? "ללא הגבלה" : lang === "ar" ? "بلا حدود" : "Unlimited feel",
    planCta:         lang === "he" ? "ראה תמחור" : lang === "ar" ? "عرض الأسعار" : "View pricing",
    bgGalleryBadge:  lang === "he" ? "אווירה קולנועית" : lang === "ar" ? "أجواء سينمائية" : "Cinematic atmosphere",
    bgGalleryTitle:  lang === "he" ? "במה אחת. אינסוף תאורה." : lang === "ar" ? "مسرح واحد. إضاءة لا نهائية." : "One stage. Endless lighting.",
    bgGallerySub:    lang === "he" ? "בחר רקע מונפש לכל שיר — אורורה, ניאון, גלקסיה ועוד." : lang === "ar" ? "اختر خلفية متحركة لكل أغنية — أورورا، نيون، مجرة وأكثر." : "Pick an animated stage for every song — aurora, neon, galaxy and more.",
  };

  const banners: Array<{ kind: PaymentBanner; bg: string; bd: string; tx: string; icon: any; msg?: string }> = [
    { kind: "success",   bg: "bg-emerald-500/10", bd: "border-emerald-500/25", tx: "text-emerald-300", icon: CheckCircle2, msg: t.nav.paymentSuccess },
    { kind: "cancelled", bg: "bg-yellow-500/10",  bd: "border-yellow-500/25",  tx: "text-yellow-300",  icon: XCircle,      msg: t.nav.paymentCancelled },
    { kind: "error",     bg: "bg-rose-500/10",    bd: "border-rose-500/25",    tx: "text-rose-300",    icon: XCircle,      msg: t.nav.paymentError },
  ];

  return (
    <div className="min-h-screen flex flex-col relative bg-[var(--ds-bg-app)]" ref={scrollContainer}>
      {banners.map((b) => paymentBanner === b.kind && (
        <div key={b.kind} className={`w-full ${b.bg} border-b ${b.bd} px-4 py-3 flex items-center justify-center gap-3 text-sm backdrop-blur-xl`}>
          <b.icon className={`w-4 h-4 ${b.tx} shrink-0`} />
          <span className={`${b.tx} font-medium`}>{b.msg}</span>
          <button onClick={() => setPaymentBanner(null)} className={`${b.tx} opacity-60 hover:opacity-100 ml-2`}>✕</button>
        </div>
      ))}

      {/* Sticky inner-page tabs */}
      <div ref={tabsBarRef} className="sticky top-16 z-40 bg-[var(--ds-bg-app)]/65 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-stretch gap-0 overflow-x-auto scrollbar-none" dir={dir}>
            {TABS.map(({ id, label, icon: Icon, href }: any) => {
              const isActive = activeTab === id;
              const cls = "relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-300 shrink-0 " +
                (isActive ? "text-white" : "text-white/35 hover:text-white/70");
              const inner = (
                <>
                  <Icon className="w-3.5 h-3.5" />{label}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full" style={{ background: "var(--ds-grad-primary)" }} />
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

      {/* ═══════════════════════════════════ HERO ═══════════════════════════════════ */}
      <section
        className="relative flex flex-col items-center justify-center overflow-hidden w-full"
        style={{ minHeight: heroMinHeight }}
      >
        <HeroStage />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-10 sm:pb-16 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] gap-10 lg:gap-14 items-center">

          {/* Left: copy + CTAs */}
          <div className="text-center lg:text-start ds-reveal" dir={dir}>
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full ds-glass border border-white/10 text-xs sm:text-sm text-white/75 mb-6 sm:mb-8">
              <MusicBars />
              {t.home.hero.badge}
            </div>

            <div className="mx-auto lg:mx-0 inline-flex mb-6 sm:mb-8">
              <div className="ds-icon-orb w-16 h-16 sm:w-20 sm:h-20 rounded-3xl">
                <Mic className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-lg" />
              </div>
            </div>

            <h1 className="ds-hero-title font-bold leading-[0.94] tracking-tight mb-5 sm:mb-7">
              <span className="block text-white">{t.home.hero.headline1}</span>
              <span className="block ds-grad-text">{t.home.hero.headline2}</span>
              <span className="block text-white/90">{t.home.hero.headline3}</span>
            </h1>

            <p className="text-base sm:text-lg text-white/60 max-w-xl mx-auto lg:mx-0 mb-7 sm:mb-9 leading-relaxed">
              {t.home.hero.sub}
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 sm:gap-2 mb-7 sm:mb-10">
              {t.home.hero.chips.map((f: string) => (
                <span key={f} className="px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-xs sm:text-sm text-white/65 backdrop-blur-sm hover:bg-white/[0.1] hover:text-white transition-colors">
                  {f}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3">
              <Link href="/upload">
                <button className="ds-btn ds-btn-primary px-9 py-4 text-base">
                  <Mic className="w-5 h-5" />
                  <span>{t.home.hero.ctaCreate}</span>
                  <ArrowRight className="w-4 h-4 opacity-80" />
                </button>
              </Link>
              <Link href="/leaderboard">
                <button className="ds-btn ds-btn-secondary px-7 py-4 text-base">
                  <Trophy className="w-5 h-5 text-yellow-300" />
                  {t.home.hero.ctaLeaderboard}
                </button>
              </Link>
            </div>
          </div>

          {/* Right: mock player + floating preview pills */}
          <div className="relative ds-reveal" style={{ animationDelay: "120ms" }}>
            <MockKaraokePreview lang={lang} />
            {/* orbiting pills */}
            <FloatingPill icon={Wand2}    label={i18n.pillVocal}  className="absolute -top-4 -left-6"  delay="0s" />
            <FloatingPill icon={Music}    label={i18n.pillLyrics} className="absolute -top-2 -right-4" delay="1.2s" />
            <FloatingPill icon={Video}    label={i18n.pillReady}  className="absolute top-1/2 -right-12" delay="2.4s" />
            <FloatingPill icon={Mic}      label={i18n.pillSing}   className="absolute -bottom-3 -left-8" delay="3.2s" />
            <FloatingPill icon={Share2}   label={i18n.pillShare}  className="absolute -bottom-5 right-6" delay="4s" />
          </div>
        </div>

        <button onClick={() => scrollTo("how-it-works")}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/30 hover:text-white/70 transition-colors duration-500 z-10">
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </button>
      </section>

      {/* ═══════════════════════════ HOW IT WORKS ═══════════════════════════ */}
      <section ref={howRef} id="how-it-works" className="relative scroll-mt-32 py-20 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-[#050510] via-[#080814] to-[#050510]" />
          <div className="ds-orb ds-orb-violet absolute top-10 left-[8%] w-[320px] h-[320px] opacity-40" />
          <div className="ds-orb ds-orb-cyan absolute bottom-10 right-[8%] w-[360px] h-[360px] opacity-40" style={{ animationDelay: "3s" }} />
        </div>

        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8" dir={dir}>
          <div className="text-center mb-14 sm:mb-20 reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full ds-glass border border-cyan-400/25 text-xs text-cyan-300 font-semibold mb-4">
              <Play className="w-3 h-3" />{t.home.howItWorks.badge}
            </div>
            <h2 className="ds-page-title font-bold mb-4">{t.home.howItWorks.title}</h2>
            <p className="text-white/55 text-base max-w-md mx-auto">{t.home.howItWorks.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 relative">
            <div className="hidden sm:block absolute top-12 left-[16%] right-[16%] h-px overflow-hidden">
              <div className="w-full h-full" style={{ background: "var(--ds-grad-primary)" }} />
            </div>

            {[
              { num: "01", icon: Upload,   step: t.home.howItWorks.step1, gradient: "linear-gradient(135deg,#8B5CF6,#7C3AED)", glow: "rgba(139,92,246,.45)" },
              { num: "02", icon: Sparkles, step: t.home.howItWorks.step2, gradient: "linear-gradient(135deg,#22D3EE,#0891B2)", glow: "rgba(34,211,238,.45)" },
              { num: "03", icon: Mic,      step: t.home.howItWorks.step3, gradient: "linear-gradient(135deg,#EC4899,#DB2777)", glow: "rgba(236,72,153,.45)" },
            ].map(({ num, icon: Icon, step, gradient, glow }, i) => (
              <div key={num} className="relative text-center group reveal-on-scroll" dir={dir} style={{ transitionDelay: `${i * 150}ms` }}>
                <div className="relative inline-flex mb-6">
                  <div className="w-24 h-24 rounded-3xl flex items-center justify-center transition-all duration-700 group-hover:scale-105"
                    style={{ background: gradient, boxShadow: `0 0 60px ${glow}, 0 0 120px ${glow.replace(".45", ".18")}` }}>
                    <Icon className="w-10 h-10 text-white drop-shadow-lg" />
                  </div>
                  <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[var(--ds-bg-app)] border border-white/15 flex items-center justify-center text-xs font-bold text-white/70 shadow-xl shadow-black/40">
                    {num}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed max-w-[260px] mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center reveal-on-scroll">
            <Link href="/upload">
              <button className="ds-btn ds-btn-primary px-9 py-4 text-base">
                <Mic className="w-5 h-5" />
                <span>{t.home.howItWorks.cta}</span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ FEATURES GRID ═══════════════════════════ */}
      <section ref={featuresRef} id="features" className="relative scroll-mt-32 py-20 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-[#050510] via-[#0A0A18] to-[#050510]" />
          <div className="ds-orb ds-orb-pink absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] opacity-30" />
        </div>

        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" dir={dir}>
          <div className="text-center mb-12 sm:mb-20 reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full ds-glass border border-violet-400/25 text-xs text-violet-300 font-semibold mb-4">
              <Sparkles className="w-3 h-3" />{t.home.features.badge}
            </div>
            <h2 className="ds-page-title font-bold mb-4">{t.home.features.title}</h2>
            <p className="text-white/55 text-base max-w-md mx-auto">{t.home.features.subtitle}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 auto-rows-fr">
            {/* Sing hero */}
            <div className="col-span-2 ds-card relative p-5 sm:p-8 overflow-hidden reveal-on-scroll group">
              <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-violet-500/20 blur-[60px] group-hover:bg-violet-500/30 transition-all duration-700" />
              <div className="relative">
                <div className="flex items-start justify-between mb-5">
                  <div className="ds-icon-orb w-14 h-14 rounded-2xl"><Mic className="w-7 h-7 text-white" /></div>
                  <span className="px-2.5 py-1 rounded-full bg-violet-500/15 text-violet-200 text-xs font-semibold border border-violet-400/25">{t.home.features.singBadge}</span>
                </div>
                <h3 className="ds-section-title font-bold text-white mb-2">{t.home.features.sing}</h3>
                <p className="text-white/60 text-sm leading-relaxed mb-4">{t.home.features.singDesc}</p>
                <div className="flex flex-wrap gap-2">
                  {t.home.features.singTags.map((tag: string) => (
                    <span key={tag} className="px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/10 text-white/60 text-xs">{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* AI hero */}
            <div className="col-span-2 ds-card relative p-5 sm:p-8 overflow-hidden reveal-on-scroll group" style={{ transitionDelay: "100ms" }}>
              <div className="absolute -left-10 -bottom-10 w-56 h-56 rounded-full bg-cyan-500/20 blur-[60px] group-hover:bg-cyan-500/30 transition-all duration-700" />
              <div className="relative">
                <div className="flex items-start justify-between mb-5">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#22D3EE,#0EA5E9)", boxShadow: "0 0 40px rgba(34,211,238,.5)" }}>
                    <Headphones className="w-7 h-7 text-white" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-200 text-xs font-semibold border border-cyan-400/25">{t.home.features.aiBadge}</span>
                </div>
                <h3 className="ds-section-title font-bold text-white mb-2">{t.home.features.ai}</h3>
                <p className="text-white/60 text-sm leading-relaxed mb-4">{t.home.features.aiDesc}</p>
                <div className="flex flex-wrap gap-2">
                  {t.home.features.aiTags.map((tag: string) => (
                    <span key={tag} className="px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/10 text-white/60 text-xs">{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Avatar full-width */}
            <div className="col-span-2 lg:col-span-4 ds-card relative p-5 sm:p-8 overflow-hidden reveal-on-scroll group" style={{ transitionDelay: "200ms" }}>
              <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-pink-500/20 blur-[80px] group-hover:bg-pink-500/30 transition-all duration-700" />
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="flex items-start justify-between sm:justify-start gap-4 w-full sm:w-auto">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg,#EC4899,#D946EF)", boxShadow: "0 0 40px rgba(236,72,153,.5)" }}>
                    <Camera className="w-7 h-7 text-white" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-pink-500/15 text-pink-200 text-xs font-semibold border border-pink-400/25 sm:hidden">{t.home.features.avatarBadge}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="ds-section-title font-bold text-white">{t.home.features.avatar}</h3>
                    <span className="hidden sm:inline px-2.5 py-1 rounded-full bg-pink-500/15 text-pink-200 text-xs font-semibold border border-pink-400/25">{t.home.features.avatarBadge}</span>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed mb-4 max-w-2xl">{t.home.features.avatarDesc}</p>
                  <div className="flex flex-wrap gap-2">
                    {t.home.features.avatarTags.map((tag: string) => (
                      <span key={tag} className="px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/10 text-white/60 text-xs">{tag}</span>
                    ))}
                  </div>
                </div>
                <Link href="/upload" className="shrink-0">
                  <button className="ds-btn ds-btn-secondary px-5 py-2.5 text-sm">
                    <Upload className="w-4 h-4" />
                    {t.nav.createKaraoke}
                    <ArrowRight className="w-3.5 h-3.5 opacity-80" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Small feature cards */}
            {t.home.features.cards.map((f: any, i: number) => {
              const Icon = SMALL_CARD_ICONS[i];
              const palette = [
                { col: "text-yellow-300",  glow: "rgba(250,204,21,.3)",  bg: "bg-yellow-500/8" },
                { col: "text-orange-300",  glow: "rgba(251,146,60,.3)",  bg: "bg-orange-500/8" },
                { col: "text-emerald-300", glow: "rgba(52,211,153,.3)",  bg: "bg-emerald-500/8" },
                { col: "text-rose-300",    glow: "rgba(248,113,113,.3)", bg: "bg-rose-500/8" },
                { col: "text-indigo-300",  glow: "rgba(129,140,248,.3)", bg: "bg-indigo-500/8" },
                { col: "text-pink-300",    glow: "rgba(244,114,182,.3)", bg: "bg-pink-500/8" },
              ][i];
              if (!palette || !Icon) return null;
              return (
                <div key={i} className="ds-card relative p-4 sm:p-6 overflow-hidden reveal-on-scroll group" style={{ transitionDelay: `${(i + 3) * 100}ms` }}>
                  <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full ${palette.bg} blur-[40px] transition-all duration-700`} />
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500">
                        <Icon className={`w-5 h-5 ${palette.col}`} style={{ filter: `drop-shadow(0 0 8px ${palette.glow})` }} />
                      </div>
                      {f.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-white/60 text-[10px] font-semibold border border-white/10">{f.badge}</span>
                      )}
                    </div>
                    <h3 className="font-bold text-white text-sm mb-1.5">{f.title}</h3>
                    <p className="text-white/55 text-xs leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════ BACKGROUND GALLERY (atmosphere teaser) ═══════════════════ */}
      <section className="relative py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#050510] via-[#08081A] to-[#050510]" />
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" dir={dir}>
          <div className="text-center mb-10 reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full ds-glass border border-yellow-400/25 text-xs text-yellow-300 font-semibold mb-4">
              <Radio className="w-3 h-3" />{i18n.bgGalleryBadge}
            </div>
            <h2 className="ds-page-title font-bold mb-3">{i18n.bgGalleryTitle}</h2>
            <p className="text-white/55 text-base max-w-md mx-auto">{i18n.bgGallerySub}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 reveal-on-scroll">
            {[
              { name: "Aurora",   cls: "ds-bg-aurora" },
              { name: "Neon",     cls: "ds-bg-neon-stage" },
              { name: "Galaxy",   cls: "ds-bg-galaxy" },
              { name: "Studio",   cls: "ds-bg-studio" },
              { name: "Party",    cls: "ds-bg-party" },
            ].map((bg) => (
              <div key={bg.name} className={`relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 group cursor-default ${bg.cls}`}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{bg.name}</span>
                  <span className="text-[10px] uppercase tracking-wider text-white/50">live</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ LANGUAGES ═══════════════════════════ */}
      <section className="relative py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-[#050510] via-[#06061A] to-[#050510]" />
          <div className="ds-orb ds-orb-cyan absolute top-1/2 left-1/4 w-[500px] h-[300px] opacity-25" />
        </div>
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8" dir={dir}>
          <div className="text-center mb-10 reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full ds-glass border border-cyan-400/25 text-xs text-cyan-300 font-semibold mb-4">
              <Globe className="w-3 h-3" />{i18n.langsBadge}
            </div>
            <h2 className="ds-page-title font-bold mb-3">{i18n.langsTitle}</h2>
            <p className="text-white/55 text-base max-w-md mx-auto">{i18n.langsSub}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 reveal-on-scroll" style={{ transitionDelay: "150ms" }}>
            {[
              { flag: "🇺🇸", name: "English" },{ flag: "🇮🇱", name: "עברית" },
              { flag: "🇸🇦", name: "العربية" },{ flag: "🇷🇺", name: "Русский" },
              { flag: "🇪🇸", name: "Español" },{ flag: "🇫🇷", name: "Français" },
              { flag: "🇩🇪", name: "Deutsch" },{ flag: "🇯🇵", name: "日本語" },
              { flag: "🇨🇳", name: "中文" },   { flag: "🇰🇷", name: "한국어" },
              { flag: "🇹🇭", name: "ไทย" },    { flag: "🇻🇳", name: "Tiếng Việt" },
              { flag: "🇵🇭", name: "Filipino" },{ flag: "🇮🇩", name: "Indonesia" },
            ].map(({ flag, name }) => (
              <div key={name} className="ds-glass group flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-default hover:border-white/20 transition-all duration-300">
                <span className="text-lg group-hover:scale-125 transition-transform duration-300">{flag}</span>
                <span className="text-sm text-white/65 group-hover:text-white transition-colors">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ PRICING TEASER ═══════════════════════════ */}
      <section ref={pricingRef} className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-[#050510] via-[#0A0820] to-[#050510]" />
          <div className="ds-orb ds-orb-violet absolute top-0 right-1/4 w-[400px] h-[400px] opacity-30" />
        </div>
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" dir={dir}>
          <div className="text-center mb-12 reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full ds-glass border border-amber-400/25 text-xs text-amber-300 font-semibold mb-4">
              <Crown className="w-3 h-3" />{i18n.pricingBadge}
            </div>
            <h2 className="ds-page-title font-bold mb-3">{i18n.pricingTitle}</h2>
            <p className="text-white/55 text-base max-w-lg mx-auto">{i18n.pricingSub}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {[
              { name: i18n.planFreeName, desc: i18n.planFreeDesc, credits: 30,  price: "$0",  highlight: false, glow: "rgba(34,211,238,.25)" },
              { name: i18n.planProName,  desc: i18n.planProDesc,  credits: 300, price: "$9",  highlight: true,  glow: "rgba(139,92,246,.45)" },
              { name: i18n.planMaxName,  desc: i18n.planMaxDesc,  credits: 1000,price: "$29", highlight: false, glow: "rgba(236,72,153,.25)" },
            ].map((p, i) => (
              <div
                key={p.name}
                className={`reveal-on-scroll relative p-6 sm:p-7 overflow-hidden ${p.highlight ? "ds-card-feature" : "ds-card"}`}
                style={{ transitionDelay: `${i * 100}ms`, ...(p.highlight ? { boxShadow: `0 0 60px ${p.glow}, var(--ds-shadow-card)` } : {}) }}
              >
                {p.highlight && (
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider text-white" style={{ background: "var(--ds-grad-primary)" }}>
                    ★ {i18n.planProDesc}
                  </span>
                )}
                <div className="ds-icon-orb w-12 h-12 rounded-2xl mb-5" style={p.highlight ? {} : { background: "rgba(255,255,255,.06)", boxShadow: "none" }}>
                  <Zap className={`w-6 h-6 ${p.highlight ? "text-white" : "text-white/70"}`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{p.name}</h3>
                <p className="text-xs text-white/50 mb-5">{p.desc}</p>
                <div className="flex items-baseline gap-2 mb-5">
                  <span className="text-4xl font-black text-white">{p.price}</span>
                  <span className="text-sm text-white/40">/ {p.credits} credits</span>
                </div>
                <button
                  onClick={() => navigate("/upload")}
                  className={`w-full ${p.highlight ? "ds-btn ds-btn-primary" : "ds-btn ds-btn-secondary"} py-3 text-sm`}
                >
                  {i18n.planCta}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ FINAL CTA ═══════════════════════════ */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[#050510]" />
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" dir={dir}>
          <div className="reveal-on-scroll relative rounded-[var(--ds-radius-2xl)] p-8 sm:p-16 overflow-hidden ds-card-feature">
            <div className="absolute inset-0 opacity-30" style={{ background: "var(--ds-grad-primary)" }} />
            <div className="absolute inset-[1px] rounded-[inherit]" style={{ background: "rgba(5,5,16,.85)", backdropFilter: "blur(24px)" }} />
            <div className="ds-orb ds-orb-violet absolute -right-20 -top-20 w-72 h-72" />
            <div className="ds-orb ds-orb-pink absolute -left-10 -bottom-10 w-48 h-48" style={{ animationDelay: "2s" }} />
            <div className="relative z-10">
              <div className="ds-icon-orb w-16 h-16 rounded-3xl mb-6 mx-auto">
                <Zap className="w-8 h-8 text-white drop-shadow-lg" />
              </div>
              <h2 className="ds-page-title font-bold mb-5">{i18n.finalTitle}</h2>
              <p className="text-white/65 text-base sm:text-lg mb-10 max-w-lg mx-auto">{i18n.finalSub}</p>
              <Link href="/upload">
                <button className="ds-btn ds-btn-primary px-10 py-4 text-lg">
                  <Mic className="w-6 h-6" />
                  <span>{t.home.hero.ctaCreate}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ FOOTER ═══════════════════════════ */}
      <footer className="relative py-12 border-t border-white/[0.06] bg-white/[0.01]">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8" dir={dir}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 group">
              <div className="ds-icon-orb h-9 w-9 rounded-xl">
                <Mic className="h-4 w-4 text-white" />
              </div>
              <span className="font-display font-bold text-white/70 group-hover:text-white transition-colors">MYOUKEE</span>
            </div>

            <a
              href="https://mail.google.com/mail/?view=cm&to=windot100@gmail.com"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl ds-glass text-white/65 hover:text-white transition-all text-sm"
            >
              <Mail className="w-4 h-4 text-violet-300" />
              {t.home.support.label}
            </a>

            <div className="flex items-center gap-4 text-xs text-white/40">
              <Link href="/privacy"><span className="hover:text-white/80 cursor-pointer transition-colors">{t.consent.privacyLink}</span></Link>
              <span className="w-px h-3 bg-white/15" />
              <Link href="/terms"><span className="hover:text-white/80 cursor-pointer transition-colors">{t.consent.termsLink}</span></Link>
              <span className="w-px h-3 bg-white/15" />
              <span>MYOUKEE © 2026</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
