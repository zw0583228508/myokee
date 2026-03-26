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
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          style={{ filter: "saturate(1.1)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background/90" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full bg-primary/8 blur-[120px]" />
      </div>

      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-medium mb-3 sm:mb-5">
            <UploadIcon className="w-3 h-3" aria-hidden="true" />
            {t.upload.title}
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-bold mb-3 sm:mb-4 leading-tight">
            {t.upload.headline1}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">
              {t.upload.headline2}
            </span>
          </h1>
          <p className="text-white/40 text-base mb-2">{t.upload.subtitle}</p>
          <p className="text-white/25 text-sm flex items-center justify-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
            {t.upload.freeTip}
          </p>
        </div>

        <FileUpload />
      </div>
    </main>
  );
}
