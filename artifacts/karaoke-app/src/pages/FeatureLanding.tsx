import { useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useLang } from "@/contexts/LanguageContext";
import {
  Headphones, Mic, Music, Users, Trophy, Sparkles, Star,
  ArrowRight, Upload, Swords, Video, Brain,
} from "lucide-react";
import { ALL_FEATURES, LANG_LABELS, RTL_LANGS, getLangKey } from "@/data/feature-seo";

const ICON_MAP: Record<string, typeof Mic> = {
  Headphones, Mic, Music, Users, Trophy, Sparkles, Star,
  Upload, Swords, Video, Brain, ArrowRight,
};

const VALID_SLUGS = Object.keys(ALL_FEATURES);

export default function FeatureLanding() {
  const [, params] = useRoute("/features/:slug");
  const { lang } = useLang();
  const slug = params?.slug ?? "";
  const feature = ALL_FEATURES[slug];
  const l = getLangKey(lang);
  const dir = RTL_LANGS.includes(l) ? "rtl" : "ltr";
  const labels = LANG_LABELS;

  useEffect(() => {
    if (!feature) return;
    const seo = feature.seo[l] || feature.seo.en;
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
        "name": f.q[l] || f.q.en,
        "acceptedAnswer": { "@type": "Answer", "text": f.a[l] || f.a.en },
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
          <h1 className="text-3xl font-bold text-white">{labels.notFound[l] || labels.notFound.en}</h1>
          <Link href="/">
            <button className="px-6 py-3 rounded-full text-white font-semibold bg-gradient-to-r from-primary to-accent">
              {labels.backHome[l] || labels.backHome.en}
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const seo = feature.seo[l] || feature.seo.en;
  const Icon = ICON_MAP[feature.iconName] || Mic;

  return (
    <div className="min-h-screen" dir={dir}>
      <section className="relative overflow-hidden py-20 sm:py-32 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full bg-gradient-to-r ${feature.color} opacity-[0.12] blur-[120px] animate-glow-breathe`} />
        <div className={`absolute bottom-0 right-1/4 w-[300px] h-[200px] rounded-full bg-gradient-to-r ${feature.color} opacity-[0.06] blur-[80px] animate-float-slow`} />
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }} />

        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <div className="relative inline-flex mb-8">
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} blur-xl opacity-40 animate-glow-breathe`} />
            <div className={`relative w-[4.5rem] h-[4.5rem] sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-2xl`}>
              <Icon className="w-9 h-9 sm:w-10 sm:h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold text-white mb-5 hero-text-line" style={{ animationDelay: "0.1s" }}>
            {seo.h1}
          </h1>
          <p className="text-lg sm:text-xl text-white/50 max-w-xl mx-auto mb-10 hero-text-line" style={{ animationDelay: "0.3s" }}>
            {seo.subtitle}
          </p>
          <div className="hero-text-line" style={{ animationDelay: "0.5s" }}>
            <Link href={feature.cta.href}>
              <button className={`group relative inline-flex items-center gap-2.5 px-9 py-4 rounded-2xl text-white text-lg font-bold bg-gradient-to-r ${feature.color} hover:scale-105 active:scale-95 transition-all shadow-xl overflow-hidden animate-btn-glow`}>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="relative z-10">{feature.cta.text[l] || feature.cta.text.en}</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-10">
          {labels.keyFeatures[l] || labels.keyFeatures.en}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {feature.features.map((f, i) => {
            const FIcon = ICON_MAP[f.iconName] || Sparkles;
            return (
              <div key={i} className="group flex items-start gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/15 transition-all duration-300 card-hover-glow">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shrink-0 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300`}>
                  <FIcon className="w-5 h-5 text-white" />
                </div>
                <p className="text-white/70 text-sm pt-2 group-hover:text-white/90 transition-colors">{f.text[l] || f.text.en}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-10">
          {labels.faq[l] || labels.faq.en}
        </h2>
        <div className="space-y-3">
          {feature.faq.map((f, i) => (
            <details key={i} className="group rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-hidden hover:border-white/15 transition-colors">
              <summary className="px-6 py-5 cursor-pointer text-white font-medium flex items-center justify-between">
                {f.q[l] || f.q.en}
                <span className="text-white/30 group-open:rotate-180 transition-transform duration-300 text-lg">&#9662;</span>
              </summary>
              <div className="px-6 pb-5 text-white/50 text-sm leading-relaxed">{f.a[l] || f.a.en}</div>
            </details>
          ))}
        </div>
      </section>

      <section className="relative py-20 px-4 overflow-hidden">
        <div className="max-w-2xl mx-auto text-center relative">
          <div className="absolute inset-0 -z-10 rounded-3xl overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-10 animate-gradient-shift`} style={{ backgroundSize: "200% 200%" }} />
          </div>
          <div className="relative rounded-3xl p-10 sm:p-14">
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-5">
              {labels.ready[l] || labels.ready.en}
            </h2>
            <Link href={feature.cta.href}>
              <button className={`group relative inline-flex items-center gap-2.5 px-9 py-4 rounded-2xl text-white text-lg font-bold bg-gradient-to-r ${feature.color} hover:scale-105 active:scale-95 transition-all shadow-xl overflow-hidden animate-btn-glow`}>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="relative z-10">{feature.cta.text[l] || feature.cta.text.en}</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      <div style={{ position: "absolute", clip: "rect(0,0,0,0)", clipPath: "inset(50%)", width: "1px", height: "1px", overflow: "hidden" }} aria-hidden="true">
        <h2>{labels.moreFeatures[l] || labels.moreFeatures.en}</h2>
        <ul>
          {VALID_SLUGS.filter((s) => s !== slug).map((s) => (
            <li key={s}>
              <a href={`https://myoukee.com/features/${s}`}>{ALL_FEATURES[s].seo.en.h1}</a> — {ALL_FEATURES[s].seo.en.subtitle}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
