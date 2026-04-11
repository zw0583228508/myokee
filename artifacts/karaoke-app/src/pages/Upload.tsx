import { Upload as UploadIcon, Zap } from "lucide-react";
import { FileUpload } from "@/components/karaoke/FileUpload";
import { useLang } from "@/contexts/LanguageContext";
import { useNoIndex } from "@/hooks/use-noindex";

export default function Upload() {
  useNoIndex();
  const { t } = useLang();

  return (
    <main id="main-content" className="relative min-h-screen py-8 sm:py-16 overflow-hidden" dir={t.dir}>
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=1920&h=600&fit=crop&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-15"
          style={{ filter: "saturate(0.5) brightness(0.5)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/30 to-background/95" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-primary/6 blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] rounded-full bg-accent/4 blur-[100px]" />
      </div>

      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/8 border border-primary/15 text-xs text-primary font-medium mb-3 sm:mb-5 backdrop-blur-sm">
            <UploadIcon className="w-3 h-3" aria-hidden="true" />
            {t.upload.title}
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-bold mb-3 sm:mb-4 leading-tight">
            {t.upload.headline1}<br />
            <span className="animated-gradient-text" style={{ fontSize: "inherit", lineHeight: "inherit" }}>
              {t.upload.headline2}
            </span>
          </h1>
          <p className="text-white/35 text-base mb-2">{t.upload.subtitle}</p>
          <p className="text-white/20 text-sm flex items-center justify-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-primary drop-shadow-[0_0_6px_rgba(147,51,234,0.5)]" aria-hidden="true" />
            {t.upload.freeTip}
          </p>
        </div>

        <FileUpload />
      </div>
    </main>
  );
}
