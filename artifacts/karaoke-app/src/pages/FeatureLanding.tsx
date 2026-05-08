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
    <div className="min-h-screen bg-[var(--ds-bg-app)] relative" dir={dir}>
      <section className="relative overflow-hidden py-20 sm:py-32 text-center">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute inset-0 ds-bg-galaxy" />
          <div className="absolute inset-0 ds-bg-aurora opacity-50" />
          <div className="ds-orb ds-orb-violet absolute -top-32 left-1/4 w-[500px] h-[500px] opacity-55" />
          <div className="ds-orb ds-orb-pink absolute -top-24 right-1/4 w-[440px] h-[440px] opacity-45" style={{ animationDelay: "2s" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050510]/40 via-transparent to-[#050510]" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-1.5 ds-glass rounded-full px-3 py-1 text-[11px] font-bold text-violet-300 uppercase tracking-wider mb-6 ds-reveal">
            <Sparkles className="w-3 h-3" />MYOUKEE Feature
          </div>
          <div className="inline-flex mb-7 ds-reveal" style={{ animationDelay: "60ms" }}>
            <div className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-2xl`}
                 style={{ boxShadow: "0 0 50px rgba(139,92,246,.4), inset 0 1px 0 rgba(255,255,255,.15)" }}>
              <Icon className="w-10 h-10 sm:w-12 sm:h-12 text-white drop-shadow-lg" />
            </div>
          </div>
          <h1 className="ds-page-title font-display font-bold text-white mb-5 ds-reveal" style={{ animationDelay: "120ms" }}>
            <span className="ds-grad-text">{seo.h1}</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/55 max-w-xl mx-auto mb-10 leading-relaxed ds-reveal" style={{ animationDelay: "180ms" }}>
            {seo.subtitle}
          </p>
          <div className="ds-reveal" style={{ animationDelay: "240ms" }}>
            <Link href={feature.cta.href}>
              <button className="ds-btn ds-btn-primary px-9 py-4 text-base">
                <span>{feature.cta.text[l] || feature.cta.text.en}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-16 sm:py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-10">
          <span className="ds-grad-text">{labels.keyFeatures[l] || labels.keyFeatures.en}</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {feature.features.map((f, i) => {
            const FIcon = ICON_MAP[f.iconName] || Sparkles;
            return (
              <div key={i} className="group flex items-start gap-4 p-5 ds-card hover:border-violet-400/30 transition-all duration-300 ds-reveal" style={{ animationDelay: `${i * 40}ms` }}>
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shrink-0 opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                  <FIcon className="w-5 h-5 text-white" />
                </div>
                <p className="text-white/70 text-sm pt-2 group-hover:text-white/90 transition-colors leading-relaxed">{f.text[l] || f.text.en}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-16 sm:py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-10">
          <span className="ds-grad-text">{labels.faq[l] || labels.faq.en}</span>
        </h2>
        <div className="space-y-2.5">
          {feature.faq.map((f, i) => (
            <details key={i} className="group rounded-2xl ds-card overflow-hidden hover:border-violet-400/25 transition-colors">
              <summary className="px-5 py-4 cursor-pointer text-white font-medium flex items-center justify-between text-sm">
                {f.q[l] || f.q.en}
                <span className="text-violet-300/60 group-open:rotate-180 transition-transform duration-300 text-base">&#9662;</span>
              </summary>
              <div className="px-5 pb-5 text-white/55 text-sm leading-relaxed">{f.a[l] || f.a.en}</div>
            </details>
          ))}
        </div>
      </section>

      <section className="relative py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="ds-card-feature relative p-10 sm:p-14 overflow-hidden">
            <div className="ds-orb ds-orb-violet absolute -top-20 -right-20 w-64 h-64 opacity-50" />
            <div className="ds-orb ds-orb-pink absolute -bottom-20 -left-20 w-56 h-56 opacity-45" style={{ animationDelay: "1.5s" }} />
            <div className="relative">
              <h2 className="text-2xl sm:text-4xl font-bold text-white mb-6">
                <span className="ds-grad-text">{labels.ready[l] || labels.ready.en}</span>
              </h2>
              <Link href={feature.cta.href}>
                <button className="ds-btn ds-btn-primary px-9 py-4 text-base">
                  <span>{feature.cta.text[l] || feature.cta.text.en}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>
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
