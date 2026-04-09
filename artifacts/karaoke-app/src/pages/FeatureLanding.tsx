import { useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useLang } from "@/contexts/LanguageContext";
import {
  Headphones, Mic, Music, Users, Trophy, Sparkles, Star,
  ArrowRight, Upload, Swords, Video, Brain,
} from "lucide-react";

interface FeatureConfig {
  slug: string;
  icon: typeof Mic;
  color: string;
  seo: {
    en: { title: string; description: string; h1: string; subtitle: string };
    he: { title: string; description: string; h1: string; subtitle: string };
  };
  features: { icon: typeof Mic; en: string; he: string }[];
  faq: { q: { en: string; he: string }; a: { en: string; he: string } }[];
  cta: { en: string; he: string; href: string };
}

const FEATURES: Record<string, FeatureConfig> = {
  "vocal-remover": {
    slug: "vocal-remover",
    icon: Headphones,
    color: "from-cyan-500 to-blue-600",
    seo: {
      en: {
        title: "AI Vocal Remover — Remove Vocals from Any Song Instantly | Myoukee",
        description: "Remove vocals from any song instantly with AI. Get clean instrumentals and backing tracks in seconds. Free online vocal remover — no downloads needed. Upload MP3 or paste YouTube link.",
        h1: "AI Vocal Remover",
        subtitle: "Remove vocals from any song instantly with advanced AI. Get clean instrumentals and backing tracks in seconds.",
      },
      he: {
        title: "הסרת קולות AI — הסר שירה מכל שיר מיידית | Myoukee",
        description: "הסר קולות מכל שיר מיידית עם AI. קבל פסקול נקי ללא שירה תוך שניות. כלי אונליין חינמי — ללא הורדות. העלה MP3 או הדבק קישור מיוטיוב.",
        h1: "הסרת קולות AI",
        subtitle: "הסר קולות מכל שיר מיידית עם בינה מלאכותית מתקדמת. קבל פסקול נקי תוך שניות.",
      },
    },
    features: [
      { icon: Sparkles, en: "State-of-the-art AI vocal separation (Demucs v4)", he: "הפרדת קולות AI מתקדמת (Demucs v4)" },
      { icon: Music, en: "Clean instrumental / backing track output", he: "פסקול נקי ללא שירה" },
      { icon: Upload, en: "Upload MP3, MP4, WAV or paste YouTube URL", he: "העלה MP3, MP4, WAV או הדבק קישור יוטיוב" },
      { icon: Mic, en: "Works with any language and music genre", he: "עובד עם כל שפה וסגנון מוזיקלי" },
    ],
    faq: [
      {
        q: { en: "How do I remove vocals from a song?", he: "איך מסירים קולות משיר?" },
        a: { en: "Upload any MP3/MP4 file or paste a YouTube URL. MYOUKEE's AI (Demucs v4) automatically separates vocals from instruments in seconds, giving you a clean backing track.", he: "העלה קובץ MP3/MP4 או הדבק קישור יוטיוב. ה-AI של MYOUKEE (Demucs v4) מפריד אוטומטית קולות ממוזיקה תוך שניות ונותן לך פסקול נקי." },
      },
      {
        q: { en: "Is the vocal remover free?", he: "האם הסרת הקולות חינמית?" },
        a: { en: "Yes! The first 40 seconds of every song are completely free. After that, credit packages start at just $5.", he: "כן! 40 השניות הראשונות של כל שיר הן חינם לגמרי. אחרי זה, חבילות קרדיטים מתחילות מ-5$ בלבד." },
      },
      {
        q: { en: "What quality is the vocal separation?", he: "מה איכות הפרדת הקולות?" },
        a: { en: "MYOUKEE uses Demucs v4 htdemucs_ft, one of the most advanced AI models for source separation, running on H100 GPUs for maximum quality.", he: "MYOUKEE משתמש ב-Demucs v4 htdemucs_ft, אחד ממודלי ה-AI המתקדמים ביותר להפרדת קולות, רץ על GPU H100 לאיכות מקסימלית." },
      },
    ],
    cta: { en: "Remove Vocals Now — Free", he: "הסר קולות עכשיו — חינם", href: "/upload" },
  },
  "karaoke-from-any-song": {
    slug: "karaoke-from-any-song",
    icon: Mic,
    color: "from-violet-500 to-purple-600",
    seo: {
      en: {
        title: "Make Karaoke from Any Song — AI Karaoke Generator | Myoukee",
        description: "Turn any song into karaoke instantly. Upload MP3/MP4 or paste YouTube link. AI removes vocals, syncs lyrics, and creates karaoke video. Free online karaoke maker.",
        h1: "Make Karaoke from Any Song",
        subtitle: "Upload any song or paste a YouTube link — AI creates a professional karaoke video with synced lyrics in seconds.",
      },
      he: {
        title: "הפוך כל שיר לקריוקי — יוצר קריוקי AI | Myoukee",
        description: "הפוך כל שיר לקריוקי מיידית. העלה MP3/MP4 או הדבק קישור יוטיוב. AI מסיר קולות, מסנכרן מילים, ויוצר סרטון קריוקי. כלי אונליין חינמי.",
        h1: "הפוך כל שיר לקריוקי",
        subtitle: "העלה כל שיר או הדבק קישור יוטיוב — AI יוצר סרטון קריוקי מקצועי עם מילים מסונכרנות תוך שניות.",
      },
    },
    features: [
      { icon: Upload, en: "Upload MP3, MP4, WAV or paste any YouTube URL", he: "העלה MP3, MP4, WAV או הדבק קישור יוטיוב" },
      { icon: Headphones, en: "AI vocal removal — clean backing track", he: "הסרת קולות AI — פסקול נקי" },
      { icon: Sparkles, en: "Auto lyrics transcription with word-level timing", he: "תמלול מילים אוטומטי עם סנכרון מדויק" },
      { icon: Video, en: "Professional karaoke video with animated subtitles", he: "סרטון קריוקי מקצועי עם כתוביות מונפשות" },
      { icon: Music, en: "11 visual background styles to choose from", he: "11 סגנונות רקע חזותיים לבחירה" },
      { icon: Star, en: "Works with 30+ languages", he: "עובד עם 30+ שפות" },
    ],
    faq: [
      {
        q: { en: "How do I make karaoke from a song?", he: "איך הופכים שיר לקריוקי?" },
        a: { en: "Simply upload an MP3/MP4 file or paste a YouTube URL. MYOUKEE's AI automatically removes vocals, transcribes lyrics with precise timing, and generates a karaoke video with animated subtitles — all in under a minute.", he: "פשוט העלה קובץ MP3/MP4 או הדבק קישור יוטיוב. ה-AI של MYOUKEE מסיר קולות אוטומטית, מתמלל מילים עם תזמון מדויק, ויוצר סרטון קריוקי עם כתוביות מונפשות — הכל תוך פחות מדקה." },
      },
      {
        q: { en: "Can I make karaoke from YouTube?", he: "אפשר ליצור קריוקי מיוטיוב?" },
        a: { en: "Absolutely! Just paste any YouTube URL and MYOUKEE handles everything — download, vocal removal, lyrics transcription, and video generation.", he: "בוודאי! פשוט הדבק קישור יוטיוב ו-MYOUKEE מטפל בהכל — הורדה, הסרת קולות, תמלול מילים, ויצירת וידאו." },
      },
      {
        q: { en: "What languages are supported?", he: "באילו שפות זה עובד?" },
        a: { en: "MYOUKEE supports lyrics in virtually any language including English, Hebrew, Korean, Japanese, Chinese, Spanish, French, German, Russian, Arabic, Thai, Vietnamese, and many more.", he: "MYOUKEE תומך במילים כמעט בכל שפה כולל אנגלית, עברית, קוריאנית, יפנית, סינית, ספרדית, צרפתית, גרמנית, רוסית, ערבית, תאילנדית, ויאטנמית ועוד רבות." },
      },
    ],
    cta: { en: "Create Karaoke Now — Free", he: "צור קריוקי עכשיו — חינם", href: "/upload" },
  },
  "party-mode": {
    slug: "party-mode",
    icon: Users,
    color: "from-pink-500 to-rose-600",
    seo: {
      en: {
        title: "Karaoke Party Mode — Host Online Karaoke Nights with Friends | Myoukee",
        description: "Host the ultimate karaoke party online. Create rooms, invite friends with a code, build song queues, battle or sing duets, score performances, and see who's the best singer.",
        h1: "Karaoke Party Mode",
        subtitle: "Host the ultimate karaoke night — create rooms, invite friends, battle, sing duets, and crown the champion.",
      },
      he: {
        title: "מצב מסיבת קריוקי — ערכו ערב קריוקי אונליין עם חברים | Myoukee",
        description: "ערכו את מסיבת הקריוקי המושלמת אונליין. צרו חדרים, הזמינו חברים עם קוד, בנו תור שירים, התחרו או שירו דואט.",
        h1: "מצב מסיבת קריוקי",
        subtitle: "ערכו את ערב הקריוקי המושלם — צרו חדרים, הזמינו חברים, התחרו, שירו דואט, והכתירו את האלוף.",
      },
    },
    features: [
      { icon: Users, en: "Create party rooms — invite friends with a 6-character code", he: "צרו חדרי מסיבה — הזמינו חברים עם קוד בן 6 תווים" },
      { icon: Music, en: "Song queue with host controls & auto-play", he: "תור שירים עם שליטת מארח וניגון אוטומטי" },
      { icon: Swords, en: "Battle Mode — head-to-head singing competition", he: "מצב באטל — תחרות שירה ראש בראש" },
      { icon: Mic, en: "Duet Mode — split lyrics between two singers", he: "מצב דואט — חלוקת מילים בין שני זמרים" },
      { icon: Trophy, en: "Real-time scoring & party leaderboard", he: "ניקוד בזמן אמת ולוח מובילים" },
      { icon: Star, en: "5 party themes: Neon Night, Birthday Bash & more", he: "5 ערכות נושא: Neon Night, Birthday Bash ועוד" },
    ],
    faq: [
      {
        q: { en: "How do I host a karaoke party?", he: "איך מארחים מסיבת קריוקי?" },
        a: { en: "Create a party room on MYOUKEE and share the 6-character code with friends. Everyone joins from their phone or computer. Build a song queue together, take turns singing, and see who tops the leaderboard!", he: "צרו חדר מסיבה ב-MYOUKEE ושתפו את הקוד בן 6 התווים עם חברים. כולם מצטרפים מהטלפון או המחשב. בנו תור שירים יחד, התחלפו בשירה, וגלו מי מוביל בלידרבורד!" },
      },
      {
        q: { en: "What is karaoke battle mode?", he: "מה זה מצב באטל?" },
        a: { en: "Battle mode lets two singers compete head-to-head on the same song. Each gets scored in real time, and the winner is announced with a split-screen display.", he: "מצב באטל מאפשר לשני זמרים להתחרות ראש בראש על אותו שיר. כל אחד מקבל ניקוד בזמן אמת, והמנצח מוכרז עם תצוגת מסך מפוצל." },
      },
    ],
    cta: { en: "Start a Party — Free", he: "התחל מסיבה — חינם", href: "/party" },
  },
  "lyrics-sync": {
    slug: "lyrics-sync",
    icon: Music,
    color: "from-emerald-500 to-teal-600",
    seo: {
      en: {
        title: "Auto Lyrics Sync — AI-Powered Word-Level Lyrics Timing | Myoukee",
        description: "Get perfectly synced karaoke lyrics automatically. AI transcribes and times every word precisely. Edit lyrics, adjust timing, and generate videos with animated word-by-word highlighting.",
        h1: "Auto Lyrics Sync",
        subtitle: "AI transcribes and times every word precisely — edit, adjust, and generate karaoke videos with word-by-word highlighting.",
      },
      he: {
        title: "סנכרון מילים אוטומטי — תזמון מילים ברמת מילה עם AI | Myoukee",
        description: "קבלו מילי קריוקי מסונכרנות בצורה מושלמת אוטומטית. AI מתמלל ומתזמן כל מילה בדיוק. ערכו מילים, כווננו תזמון, וצרו סרטונים עם הדגשת מילה-מילה.",
        h1: "סנכרון מילים אוטומטי",
        subtitle: "AI מתמלל ומתזמן כל מילה בדיוק — ערכו, כווננו, וצרו סרטוני קריוקי עם הדגשת מילה-מילה.",
      },
    },
    features: [
      { icon: Sparkles, en: "AI transcription with faster-whisper large-v3", he: "תמלול AI עם faster-whisper large-v3" },
      { icon: Music, en: "Word-level timing precision", he: "דיוק תזמון ברמת מילה" },
      { icon: Video, en: "Animated word-by-word highlighting in videos", he: "הדגשת מילה-מילה מונפשת בוידאו" },
      { icon: Star, en: "Built-in lyrics editor for manual adjustments", he: "עורך מילים מובנה להתאמות ידניות" },
      { icon: Mic, en: "Supports 30+ languages automatically", he: "תומך ב-30+ שפות אוטומטית" },
    ],
    faq: [
      {
        q: { en: "How accurate is the lyrics sync?", he: "כמה מדויק הסנכרון?" },
        a: { en: "MYOUKEE uses faster-whisper large-v3 for word-level timing. The AI achieves near-perfect sync for most songs, and you can fine-tune any word in the built-in lyrics editor.", he: "MYOUKEE משתמש ב-faster-whisper large-v3 לתזמון ברמת מילה. ה-AI משיג סנכרון כמעט מושלם לרוב השירים, ואפשר לכוונן כל מילה בעורך המילים המובנה." },
      },
    ],
    cta: { en: "Try Lyrics Sync — Free", he: "נסה סנכרון מילים — חינם", href: "/upload" },
  },
  "singing-score": {
    slug: "singing-score",
    icon: Trophy,
    color: "from-amber-500 to-orange-600",
    seo: {
      en: {
        title: "AI Singing Score & Vocal Coach — Get Rated on Your Singing | Myoukee",
        description: "Get your singing scored by AI. Pitch accuracy, timing, stability, vibrato detection, and expression analysis. Track your improvement over time with AI vocal coaching tips.",
        h1: "AI Singing Score & Vocal Coach",
        subtitle: "Sing along and get rated by AI — pitch, timing, stability, vibrato, and expression. Track your progress and improve.",
      },
      he: {
        title: "ניקוד שירה AI ומאמן שירה — קבל ציון על השירה שלך | Myoukee",
        description: "קבל ציון על השירה שלך מ-AI. דיוק טון, תזמון, יציבות, זיהוי ויברטו, וניתוח ביטוי. עקוב אחרי ההתקדמות שלך עם טיפים מ-AI.",
        h1: "ניקוד שירה AI ומאמן שירה",
        subtitle: "שיר ושירי וקבל ציון מ-AI — טון, תזמון, יציבות, ויברטו, וביטוי. עקוב אחרי ההתקדמות שלך והשתפר.",
      },
    },
    features: [
      { icon: Sparkles, en: "AI pitch analysis with octave-invariant scoring", he: "ניתוח טון AI עם ציון ללא תלות באוקטבה" },
      { icon: Music, en: "DTW temporal alignment — handles tempo variations", he: "יישור תזמון DTW — מתאים לשינויי קצב" },
      { icon: Star, en: "Vibrato detection (4-8 Hz) — treated as positive stability", he: "זיהוי ויברטו (4-8 Hz) — מתפרש כיציבות חיובית" },
      { icon: Brain, en: "Expression & dynamics — energy contour correlation", he: "ביטוי ודינמיקה — ניתוח עוצמת קול" },
      { icon: Trophy, en: "Global leaderboard & weekly challenges", he: "לוח מובילים גלובלי ואתגרים שבועיים" },
      { icon: Mic, en: "AI vocal coaching tips after each performance", he: "טיפים מ-AI אחרי כל ביצוע" },
    ],
    faq: [
      {
        q: { en: "How does the singing score work?", he: "איך עובד ניקוד השירה?" },
        a: { en: "MYOUKEE analyzes 6 dimensions: pitch accuracy (40%), timing (25%), stability with vibrato detection (15%), melody contour (10%), and expression (10%). The AI compares your singing to the original vocal using advanced signal processing on GPU.", he: "MYOUKEE מנתח 6 ממדים: דיוק טון (40%), תזמון (25%), יציבות עם זיהוי ויברטו (15%), קו מנגינה (10%), וביטוי (10%). ה-AI משווה את השירה שלך לקול המקורי באמצעות עיבוד אותות מתקדם על GPU." },
      },
      {
        q: { en: "What is the AI vocal coach?", he: "מה זה מאמן שירה AI?" },
        a: { en: "After each performance, the AI analyzes your scores and gives personalized tips to improve — covering pitch control, timing precision, breath support, and overall technique.", he: "אחרי כל ביצוע, ה-AI מנתח את הציונים שלך ונותן טיפים מותאמים אישית לשיפור — כולל שליטה בטון, דיוק תזמון, תמיכת נשימה, וטכניקה כללית." },
      },
    ],
    cta: { en: "Sing & Get Scored — Free", he: "שיר וקבל ציון — חינם", href: "/upload" },
  },
};

const VALID_SLUGS = Object.keys(FEATURES);

export default function FeatureLanding() {
  const [, params] = useRoute("/features/:slug");
  const { lang } = useLang();
  const slug = params?.slug ?? "";
  const feature = FEATURES[slug];
  const l = lang === "he" || lang === "ar" ? "he" : "en";
  const dir = l === "he" ? "rtl" : "ltr";

  useEffect(() => {
    if (!feature) return;
    const seo = feature.seo[l];
    const url = `https://myoukee.com/features/${slug}`;

    document.title = seo.title;

    const update = (sel: string, attr: string, val: string) => {
      const el = document.querySelector(sel) as HTMLElement | null;
      if (el) (el as any)[attr] = val;
    };

    update('meta[name="description"]', "content", seo.description);
    update('link[rel="canonical"]', "href", url);
    update('meta[property="og:title"]', "content", seo.title);
    update('meta[property="og:description"]', "content", seo.description);
    update('meta[property="og:url"]', "content", url);
    update('meta[name="twitter:title"]', "content", seo.title);
    update('meta[name="twitter:description"]', "content", seo.description);

    let breadcrumb = document.getElementById("seo-breadcrumb");
    if (!breadcrumb) {
      breadcrumb = document.createElement("script");
      breadcrumb.id = "seo-breadcrumb";
      breadcrumb.type = "application/ld+json";
      document.head.appendChild(breadcrumb);
    }
    breadcrumb.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "MYOUKEE", "item": "https://myoukee.com" },
        { "@type": "ListItem", "position": 2, "name": seo.h1, "item": url },
      ],
    });

    let faqSchema = document.getElementById("seo-faq-feature");
    if (!faqSchema) {
      faqSchema = document.createElement("script");
      faqSchema.id = "seo-faq-feature";
      faqSchema.type = "application/ld+json";
      document.head.appendChild(faqSchema);
    }
    faqSchema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": feature.faq.map((f) => ({
        "@type": "Question",
        "name": f.q[l],
        "acceptedAnswer": { "@type": "Answer", "text": f.a[l] },
      })),
    });

    return () => {
      const defTitle = "Turn Any Song into Karaoke in Seconds | Free AI Vocal Remover & Lyrics Sync | Myoukee";
      const defDesc = "Turn any song into karaoke instantly — free online tool. Remove vocals with AI, get auto-synced lyrics, and sing along.";
      document.title = defTitle;
      update('meta[name="description"]', "content", defDesc);
      update('link[rel="canonical"]', "href", "https://myoukee.com/");
      update('meta[property="og:title"]', "content", defTitle);
      update('meta[property="og:description"]', "content", defDesc);
      update('meta[property="og:url"]', "content", "https://myoukee.com/");
      update('meta[name="twitter:title"]', "content", defTitle);
      update('meta[name="twitter:description"]', "content", defDesc);
      breadcrumb?.remove();
      faqSchema?.remove();
    };
  }, [slug, l]);

  if (!feature) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-white">Feature not found</h1>
          <Link href="/">
            <button className="px-6 py-3 rounded-full text-white font-semibold bg-gradient-to-r from-primary to-accent">
              {l === "he" ? "חזרה לדף הבית" : "Back to Home"}
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const seo = feature.seo[l];
  const Icon = feature.icon;

  return (
    <div className="min-h-screen" dir={dir}>
      <section className="relative overflow-hidden py-20 sm:py-28 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-gradient-to-r ${feature.color} opacity-[0.08] blur-[100px]`} />

        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mx-auto mb-6 shadow-lg`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-white mb-4">
            {seo.h1}
          </h1>
          <p className="text-lg text-white/50 max-w-xl mx-auto mb-8">
            {seo.subtitle}
          </p>
          <Link href={feature.cta.href}>
            <button className={`inline-flex items-center gap-2 px-8 py-4 rounded-full text-white text-lg font-semibold bg-gradient-to-r ${feature.color} hover:scale-105 transition-transform shadow-xl`}>
              {feature.cta[l]}
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-white text-center mb-10">
          {l === "he" ? "תכונות עיקריות" : "Key Features"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {feature.features.map((f, i) => {
            const FIcon = f.icon;
            return (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/8">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center shrink-0 opacity-80`}>
                  <FIcon className="w-5 h-5 text-white" />
                </div>
                <p className="text-white/70 text-sm pt-2">{f[l]}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-white text-center mb-10">
          {l === "he" ? "שאלות נפוצות" : "Frequently Asked Questions"}
        </h2>
        <div className="space-y-4">
          {feature.faq.map((f, i) => (
            <details key={i} className="group rounded-xl bg-white/[0.03] border border-white/8 overflow-hidden">
              <summary className="px-5 py-4 cursor-pointer text-white font-medium flex items-center justify-between">
                {f.q[l]}
                <span className="text-white/30 group-open:rotate-180 transition-transform">&#9662;</span>
              </summary>
              <div className="px-5 pb-4 text-white/50 text-sm">{f.a[l]}</div>
            </details>
          ))}
        </div>
      </section>

      <section className="text-center py-16 px-4">
        <h2 className="text-2xl font-bold text-white mb-4">
          {l === "he" ? "מוכנים להתחיל?" : "Ready to get started?"}
        </h2>
        <Link href={feature.cta.href}>
          <button className={`inline-flex items-center gap-2 px-8 py-4 rounded-full text-white text-lg font-semibold bg-gradient-to-r ${feature.color} hover:scale-105 transition-transform shadow-xl`}>
            {feature.cta[l]}
            <ArrowRight className="w-5 h-5" />
          </button>
        </Link>
      </section>

      <div style={{ position: "absolute", clip: "rect(0,0,0,0)", clipPath: "inset(50%)", width: "1px", height: "1px", overflow: "hidden" }} aria-hidden="true">
        <h2>Other Features — {l === "he" ? "פיצ'רים נוספים" : "More from MYOUKEE"}</h2>
        <ul>
          {VALID_SLUGS.filter((s) => s !== slug).map((s) => (
            <li key={s}>
              <a href={`https://myoukee.com/features/${s}`}>{FEATURES[s].seo.en.h1}</a> — {FEATURES[s].seo.en.subtitle}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
