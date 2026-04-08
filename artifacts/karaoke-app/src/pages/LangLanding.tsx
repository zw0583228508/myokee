import { useEffect, useRef } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { useLang, SupportedLang } from "@/contexts/LanguageContext";
import {
  Mic, Upload, Sparkles, Play, ChevronDown,
  Headphones, Users, Swords, Trophy, Star, Video, FileText,
  Camera, ArrowRight, Mail,
} from "lucide-react";

const VALID_LANGS: SupportedLang[] = [
  "he", "en", "ar", "ru", "es", "fr", "de", "ja", "zh", "ko", "th", "vi", "tl", "id",
];

const SEO_META: Record<string, { title: string; description: string }> = {
  he: {
    title: "הפוך כל שיר לקריוקי תוך שניות | הסרת קולות AI וסנכרון מילים | Myoukee",
    description: "הפוך כל שיר לקריוקי מיידית — כלי אונליין חינמי. הסר קולות עם AI, קבל מילים מסונכרנות ושר. העלה MP3 או הדבק קישור מיוטיוב.",
  },
  en: {
    title: "Turn Any Song into Karaoke in Seconds | Free AI Vocal Remover & Lyrics Sync | Myoukee",
    description: "Turn any song into karaoke instantly — free online tool. Remove vocals with AI, get auto-synced lyrics, and sing along. Upload MP3 or paste a YouTube link.",
  },
  ar: {
    title: "حول أي أغنية إلى كاريوكي في ثوانٍ | مزيل صوت AI مجاني ومزامنة كلمات | Myoukee",
    description: "حول أي أغنية إلى كاريوكي فوراً — أداة مجانية عبر الإنترنت. أزل الأصوات بالذكاء الاصطناعي واحصل على كلمات متزامنة.",
  },
  ru: {
    title: "Превратите любую песню в караоке за секунды | Бесплатное AI удаление вокала | Myoukee",
    description: "Превратите любую песню в караоке мгновенно. Удалите вокал с помощью ИИ, получите синхронизированный текст и пойте.",
  },
  es: {
    title: "Convierte cualquier canción en karaoke en segundos | Eliminador vocal AI gratis | Myoukee",
    description: "Convierte cualquier canción en karaoke al instante. Elimina las voces con IA, obtén letras sincronizadas y canta.",
  },
  fr: {
    title: "Transformez n'importe quelle chanson en karaoké en quelques secondes | Myoukee",
    description: "Transformez n'importe quelle chanson en karaoké instantanément. Supprimez les voix avec l'IA et obtenez des paroles synchronisées.",
  },
  de: {
    title: "Verwandeln Sie jeden Song in Karaoke in Sekunden | Kostenloser AI-Gesangsentferner | Myoukee",
    description: "Verwandeln Sie jeden Song sofort in Karaoke. Entfernen Sie den Gesang mit KI und erhalten Sie synchronisierte Texte.",
  },
  ja: {
    title: "どんな曲も数秒でカラオケに | 無料AIボーカル除去＆歌詞同期 | Myoukee",
    description: "どんな曲も瞬時にカラオケに変換。AIでボーカルを除去し、自動同期歌詞で歌いましょう。",
  },
  zh: {
    title: "将任何歌曲秒变卡拉OK | 免费AI去人声和歌词同步 | Myoukee",
    description: "即时将任何歌曲转换为卡拉OK。使用AI去除人声，获取同步歌词，尽情歌唱。",
  },
  ko: {
    title: "모든 노래를 몇 초 만에 노래방으로 | 무료 AI 보컬 제거 및 가사 동기화 | Myoukee",
    description: "모든 노래를 즉시 노래방으로 변환하세요. AI로 보컬을 제거하고 자동 동기화된 가사로 노래하세요.",
  },
  th: {
    title: "เปลี่ยนเพลงเป็นคาราโอเกะในไม่กี่วินาที | ลบเสียงร้อง AI ฟรี | Myoukee",
    description: "เปลี่ยนเพลงเป็นคาราโอเกะทันที ลบเสียงร้องด้วย AI รับเนื้อเพลงซิงค์อัตโนมัติ",
  },
  vi: {
    title: "Biến bất kỳ bài hát nào thành karaoke trong vài giây | Xóa giọng hát AI miễn phí | Myoukee",
    description: "Biến bất kỳ bài hát nào thành karaoke ngay lập tức. Xóa giọng hát bằng AI, nhận lời bài hát đồng bộ tự động.",
  },
  tl: {
    title: "Gawing Karaoke ang Kahit Anong Kanta sa Ilang Segundo | Libreng AI Vocal Remover | Myoukee",
    description: "Gawing karaoke ang kahit anong kanta agad-agad. Alisin ang vocals gamit ang AI at makakuha ng naka-sync na lyrics.",
  },
  id: {
    title: "Ubah Lagu Apa Pun Jadi Karaoke dalam Hitungan Detik | Penghapus Vokal AI Gratis | Myoukee",
    description: "Ubah lagu apa pun menjadi karaoke secara instan. Hapus vokal dengan AI, dapatkan lirik yang disinkronkan otomatis.",
  },
};

const SMALL_CARD_ICONS = [Users, Swords, Trophy, Video, Star, FileText];

export default function LangLanding() {
  const [, params] = useRoute("/lang/:lang");
  const { t, setLang } = useLang();
  const howRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  const [, navigate] = useLocation();
  const urlLang = (params?.lang ?? "en") as SupportedLang;
  const isValid = VALID_LANGS.includes(urlLang);

  useEffect(() => {
    if (!isValid) {
      navigate("/", { replace: true });
      return;
    }
    setLang(urlLang);
  }, [urlLang]);

  useEffect(() => {
    if (!isValid) return;

    const seo = SEO_META[urlLang] ?? SEO_META.en;
    const langUrl = `https://myoukee.com/lang/${urlLang}/`;

    document.title = seo.title;

    const descEl = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (descEl) descEl.content = seo.description;

    const canonEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (canonEl) canonEl.href = langUrl;

    const ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement | null;
    if (ogTitle) ogTitle.content = seo.title;

    const ogDesc = document.querySelector('meta[property="og:description"]') as HTMLMetaElement | null;
    if (ogDesc) ogDesc.content = seo.description;

    const ogUrl = document.querySelector('meta[property="og:url"]') as HTMLMetaElement | null;
    if (ogUrl) ogUrl.content = langUrl;

    const twTitle = document.querySelector('meta[name="twitter:title"]') as HTMLMetaElement | null;
    if (twTitle) twTitle.content = seo.title;

    const twDesc = document.querySelector('meta[name="twitter:description"]') as HTMLMetaElement | null;
    if (twDesc) twDesc.content = seo.description;

    return () => {
      const defTitle = "Turn Any Song into Karaoke in Seconds | Free AI Vocal Remover & Lyrics Sync | Myoukee";
      const defDesc = "Turn any song into karaoke instantly — free online tool. Remove vocals with AI, get auto-synced lyrics, and sing along. Upload MP3 or paste a YouTube link. No downloads, no app install needed.";
      document.title = defTitle;
      if (descEl) descEl.content = defDesc;
      if (canonEl) canonEl.href = "https://myoukee.com/";
      if (ogTitle) ogTitle.content = defTitle;
      if (ogDesc) ogDesc.content = defDesc;
      if (ogUrl) ogUrl.content = "https://myoukee.com/";
      if (twTitle) twTitle.content = defTitle;
      if (twDesc) twDesc.content = defDesc;
    };
  }, [urlLang, isValid]);

  if (!isValid) return null;

  const dir = t.dir;

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      const top = ref.current.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="fixed inset-0 -z-20 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/5" />
      </div>

      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-2xl border-b border-white/8">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16" dir={dir}>
          <Link href="/">
            <span className="flex items-center gap-2.5 cursor-pointer">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
                <Mic className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-white tracking-tight">MYOUKEE</span>
            </span>
          </Link>
          <Link href="/upload">
            <button className="flex items-center gap-2 px-5 py-2 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)" }}>
              <Mic className="w-4 h-4" />
              {t.nav.createKaraoke}
            </button>
          </Link>
        </div>
      </header>

      <section className="relative min-h-[70vh] sm:min-h-[94vh] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src="https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1920&h=1080&fit=crop&q=80"
            alt="" className="absolute inset-0 w-full h-full object-cover object-top opacity-50"
            style={{ filter: "saturate(0.75)" }}
          />
          <div className="absolute inset-0 bg-[#06060f]/50" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/10" />
          <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full bg-primary/15 blur-[140px]" />
          <div className="absolute top-1/2 right-1/5 w-60 h-60 rounded-full bg-accent/10 blur-[100px]" />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-16 pb-8 sm:pb-12">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/6 border border-white/10 text-sm text-white/60 mb-6 sm:mb-10 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            {t.home.hero.badge}
          </div>

          <h1 className="text-4xl sm:text-7xl lg:text-8xl font-bold font-display leading-[0.88] tracking-tight mb-4 sm:mb-6">
            {t.home.hero.headline1}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-primary to-blue-400">
              {t.home.hero.headline2}
            </span>
            <span className="text-white">{t.home.hero.headline3}</span>
          </h1>

          <p className="text-base sm:text-xl text-white/50 max-w-lg mx-auto mb-6 sm:mb-10 leading-relaxed">
            {t.home.hero.sub}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-6 sm:mb-10">
            {t.home.hero.chips.map((f: string) => (
              <span key={f} className="px-3 py-1.5 rounded-full bg-white/6 border border-white/10 text-sm text-white/55 backdrop-blur-sm">
                {f}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <Link href="/upload">
              <button
                className="flex items-center gap-2.5 px-9 py-4 rounded-2xl text-white font-bold text-base transition-all hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(124,58,237,0.4)]"
                style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)" }}>
                <Mic className="w-5 h-5" />
                {t.home.hero.ctaCreate}
              </button>
            </Link>
            <Link href="/leaderboard">
              <button className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-white/7 border border-white/12 text-white/75 hover:bg-white/12 hover:text-white transition-all font-semibold text-base">
                <Trophy className="w-5 h-5 text-yellow-400" />
                {t.home.hero.ctaLeaderboard}
              </button>
            </Link>
          </div>
        </div>

        <button onClick={() => scrollTo(howRef)}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/20 hover:text-white/45 transition-colors">
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </button>
      </section>

      <section ref={howRef} className="relative scroll-mt-32 py-14 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1920&h=800&fit=crop&q=80"
            alt="" className="absolute inset-0 w-full h-full object-cover opacity-45"
            style={{ filter: "saturate(1.2)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/10 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
        </div>

        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8" dir={dir}>
          <div className="text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs text-accent font-medium mb-4">
              <Play className="w-3 h-3" />{t.home.howItWorks.badge}
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-bold mb-3">{t.home.howItWorks.title}</h2>
            <p className="text-white/35 text-base">{t.home.howItWorks.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
            <div className="hidden sm:block absolute top-10 left-[16%] right-[16%] h-px bg-gradient-to-r from-primary/40 via-accent/60 to-primary/40" />

            {[
              { num: "01", icon: Upload, step: t.home.howItWorks.step1, gradient: "from-violet-600 to-primary" },
              { num: "02", icon: Sparkles, step: t.home.howItWorks.step2, gradient: "from-blue-500 to-cyan-500" },
              { num: "03", icon: Mic, step: t.home.howItWorks.step3, gradient: "from-accent to-pink-500" },
            ].map(({ num, icon: Icon, step, gradient }) => (
              <div key={num} className="relative text-center group" dir={dir}>
                <div className="relative inline-flex mb-6">
                  <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-[0_0_40px_rgba(124,58,237,0.2)] group-hover:shadow-[0_0_60px_rgba(124,58,237,0.3)] transition-all`}>
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

          <div className="mt-14 text-center">
            <Link href="/upload">
              <button
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-white font-semibold text-sm transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)", boxShadow: "0 0 40px rgba(124,58,237,.3)" }}>
                <Mic className="w-4 h-4" />
                {t.home.howItWorks.cta}
              </button>
            </Link>
          </div>
        </div>
      </section>

      <section ref={featuresRef} className="relative scroll-mt-32 py-14 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1920&h=1000&fit=crop&q=80"
            alt="" className="absolute inset-0 w-full h-full object-cover opacity-45"
            style={{ filter: "saturate(1.1)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/20 to-background/70" />
        </div>

        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" dir={dir}>
          <div className="text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-medium mb-4">
              <Sparkles className="w-3 h-3" />{t.home.features.badge}
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-bold mb-3">{t.home.features.title}</h2>
            <p className="text-white/35 text-base max-w-md mx-auto">{t.home.features.subtitle}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 auto-rows-fr">

            <div className="col-span-2 sm:col-span-2 relative rounded-2xl sm:rounded-3xl p-5 sm:p-8 bg-gradient-to-br from-violet-500/15 to-purple-600/5 border border-violet-500/20 overflow-hidden hover:border-violet-400/35 transition-all">
              <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-violet-500/8 blur-3xl" />
              <div className="flex items-start justify-between mb-3 sm:mb-5">
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-violet-500/20 border border-violet-400/20 flex items-center justify-center">
                  <Mic className="w-5 h-5 sm:w-7 sm:h-7 text-violet-300" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-semibold">{t.home.features.singBadge}</span>
              </div>
              <h3 className="text-lg sm:text-2xl font-bold text-white mb-1.5 sm:mb-2">{t.home.features.sing}</h3>
              <p className="text-white/45 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-5">{t.home.features.singDesc}</p>
              <div className="flex flex-wrap gap-2">
                {t.home.features.singTags.map((tag: string) => (
                  <span key={tag} className="px-2.5 py-1 rounded-full bg-white/8 text-white/55 text-xs">{tag}</span>
                ))}
              </div>
            </div>

            <div className="col-span-2 sm:col-span-2 relative rounded-2xl sm:rounded-3xl p-5 sm:p-8 bg-gradient-to-br from-blue-500/15 to-cyan-600/5 border border-blue-500/20 overflow-hidden hover:border-blue-400/35 transition-all">
              <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-blue-500/8 blur-3xl" />
              <div className="flex items-start justify-between mb-3 sm:mb-5">
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-blue-500/20 border border-blue-400/20 flex items-center justify-center">
                  <Headphones className="w-5 h-5 sm:w-7 sm:h-7 text-blue-300" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold">{t.home.features.aiBadge}</span>
              </div>
              <h3 className="text-lg sm:text-2xl font-bold text-white mb-1.5 sm:mb-2">{t.home.features.ai}</h3>
              <p className="text-white/45 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-5">{t.home.features.aiDesc}</p>
              <div className="flex flex-wrap gap-2">
                {t.home.features.aiTags.map((tag: string) => (
                  <span key={tag} className="px-2.5 py-1 rounded-full bg-white/8 text-white/55 text-xs">{tag}</span>
                ))}
              </div>
            </div>

            <div className="col-span-2 lg:col-span-4 relative rounded-2xl sm:rounded-3xl p-5 sm:p-8 bg-gradient-to-br from-fuchsia-500/15 via-purple-600/8 to-pink-600/5 border border-fuchsia-500/25 overflow-hidden hover:border-fuchsia-400/40 transition-all">
              <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-fuchsia-500/8 blur-[80px]" />
              <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-pink-500/8 blur-3xl" />
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="flex items-start justify-between sm:justify-start gap-4 w-full sm:w-auto">
                  <div className="w-14 h-14 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-400/20 flex items-center justify-center shrink-0">
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
                      <span key={tag} className="px-2.5 py-1 rounded-full bg-white/8 text-white/55 text-xs">{tag}</span>
                    ))}
                  </div>
                </div>
                <Link href="/upload" className="shrink-0">
                  <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-fuchsia-500/20 border border-fuchsia-400/30 text-fuchsia-300 hover:bg-fuchsia-500/30 transition-colors text-sm font-semibold whitespace-nowrap">
                    <Upload className="w-4 h-4" />
                    {t.nav.createKaraoke}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>
            </div>

            {t.home.features.cards.map((f: any, i: number) => {
              const Icon = SMALL_CARD_ICONS[i];
              const colors = [
                { color: "text-yellow-400", bg: "from-yellow-500/12 to-amber-600/5", border: "border-yellow-500/20" },
                { color: "text-orange-400", bg: "from-orange-500/12 to-red-600/5", border: "border-orange-500/20" },
                { color: "text-green-400", bg: "from-green-500/12 to-teal-600/5", border: "border-green-500/20" },
                { color: "text-red-400", bg: "from-red-500/12 to-orange-600/5", border: "border-red-500/20" },
                { color: "text-indigo-400", bg: "from-indigo-500/12 to-violet-600/5", border: "border-indigo-500/20" },
                { color: "text-pink-400", bg: "from-pink-500/12 to-rose-600/5", border: "border-pink-500/20" },
              ][i];
              if (!colors) return null;
              return (
                <div key={i} className={`relative rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-gradient-to-br ${colors.bg} border ${colors.border} overflow-hidden hover:scale-[1.02] transition-all`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center shrink-0">
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

      <footer className="relative py-12 border-t border-white/8 bg-white/[0.01]">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8" dir={dir}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                <Mic className="h-4 w-4 text-white" />
              </div>
              <span className="font-display font-bold text-white/70">MYOUKEE</span>
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
