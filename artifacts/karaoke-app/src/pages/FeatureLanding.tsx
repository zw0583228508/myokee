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
              {feature.cta.text[l] || feature.cta.text.en}
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-white text-center mb-10">
          {labels.keyFeatures[l] || labels.keyFeatures.en}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {feature.features.map((f, i) => {
            const FIcon = ICON_MAP[f.iconName] || Sparkles;
            return (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/8">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center shrink-0 opacity-80`}>
                  <FIcon className="w-5 h-5 text-white" />
                </div>
                <p className="text-white/70 text-sm pt-2">{f.text[l] || f.text.en}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-white text-center mb-10">
          {labels.faq[l] || labels.faq.en}
        </h2>
        <div className="space-y-4">
          {feature.faq.map((f, i) => (
            <details key={i} className="group rounded-xl bg-white/[0.03] border border-white/8 overflow-hidden">
              <summary className="px-5 py-4 cursor-pointer text-white font-medium flex items-center justify-between">
                {f.q[l] || f.q.en}
                <span className="text-white/30 group-open:rotate-180 transition-transform">&#9662;</span>
              </summary>
              <div className="px-5 pb-4 text-white/50 text-sm">{f.a[l] || f.a.en}</div>
            </details>
          ))}
        </div>
      </section>

      <section className="text-center py-16 px-4">
        <h2 className="text-2xl font-bold text-white mb-4">
          {labels.ready[l] || labels.ready.en}
        </h2>
        <Link href={feature.cta.href}>
          <button className={`inline-flex items-center gap-2 px-8 py-4 rounded-full text-white text-lg font-semibold bg-gradient-to-r ${feature.color} hover:scale-105 transition-transform shadow-xl`}>
            {feature.cta.text[l] || feature.cta.text.en}
            <ArrowRight className="w-5 h-5" />
          </button>
        </Link>
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
