import { Upload as UploadIcon, Zap, Music, Sparkles, Mic } from "lucide-react";
import { FileUpload } from "@/components/karaoke/FileUpload";
import { useLang } from "@/contexts/LanguageContext";

// Sound bars animation component
function SoundBars() {
  return (
    <div className="flex items-end gap-1 h-8 opacity-60">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-1 rounded-full bg-gradient-to-t from-purple-500 to-blue-500"
          style={{
            animation: `sound-wave 1s ease-in-out infinite`,
            animationDelay: `${i * 0.15}s`,
            height: `${12 + Math.random() * 20}px`,
          }}
        />
      ))}
    </div>
  );
}

export default function Upload() {
  const { t } = useLang();

  return (
    <main id="main-content" className="relative min-h-screen py-12 sm:py-20 overflow-hidden page-bg-upload" dir={t.dir}>
      {/* Multi-layered premium background */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <img
          src="/images/upload-bg.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-background/70 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-blue-900/20" />
        
        {/* Animated glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-purple-500/15 blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-blue-500/10 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-pink-500/5 blur-[150px]" />
      </div>

      {/* Floating music notes decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute text-purple-500/10 text-4xl music-note-float"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          >
            ♪
          </div>
        ))}
      </div>

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Premium header section */}
        <div className="text-center mb-10 sm:mb-16">
          {/* Badge with glow */}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full glass-panel-glow border-purple-500/30 text-sm text-purple-300 font-medium mb-6 sm:mb-8">
            <div className="relative">
              <UploadIcon className="w-4 h-4" aria-hidden="true" />
              <div className="absolute inset-0 blur-sm bg-purple-400/50" />
            </div>
            <span className="animated-gradient-text font-semibold">{t.upload.title}</span>
            <SoundBars />
          </div>

          {/* Main headline with intense effects */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-black mb-5 sm:mb-6 leading-[0.9]">
            <span className="text-white drop-shadow-[0_0_30px_rgba(168,85,247,0.2)]">
              {t.upload.headline1}
            </span>
            <br />
            <span className="animated-gradient-text text-glow">
              {t.upload.headline2}
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-white/50 mb-4 max-w-xl mx-auto">{t.upload.subtitle}</p>
          
          {/* Free tip with premium styling */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
            <Zap className="w-4 h-4 text-purple-400 animate-pulse" aria-hidden="true" />
            <span className="text-sm text-purple-300/80">{t.upload.freeTip}</span>
          </div>
        </div>

        {/* Upload component wrapper with premium glow */}
        <div className="relative">
          {/* Outer glow effect */}
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-r from-purple-500/20 via-blue-500/10 to-purple-500/20 blur-2xl opacity-50" />
          
          {/* Main card container */}
          <div className="relative glass-panel-glow rounded-3xl p-1 overflow-hidden">
            {/* Animated border gradient */}
            <div className="absolute inset-0 rounded-3xl animated-gradient-border opacity-30" />
            
            <div className="relative bg-background/80 rounded-[1.4rem] p-2 sm:p-4">
              <FileUpload />
            </div>
          </div>
        </div>

        {/* Premium features strip */}
        <div className="mt-12 sm:mt-16 grid grid-cols-3 gap-4 sm:gap-6">
          {[
            { icon: Mic, label: t.dir === "rtl" ? "ווקאלים מבודדים" : "Vocal Isolation", color: "from-purple-500 to-violet-600" },
            { icon: Music, label: t.dir === "rtl" ? "כתוביות אוטומטיות" : "Auto Lyrics", color: "from-blue-500 to-cyan-500" },
            { icon: Sparkles, label: t.dir === "rtl" ? "AI מתקדם" : "Advanced AI", color: "from-pink-500 to-rose-500" },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="text-center group">
              <div className={`relative inline-flex w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${color} items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white relative" />
              </div>
              <p className="text-xs sm:text-sm text-white/40 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
