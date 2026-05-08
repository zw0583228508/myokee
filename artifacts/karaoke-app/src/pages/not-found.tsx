import { AlertCircle, Home, Mic2 } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 bg-[var(--ds-bg-app)] relative overflow-hidden">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 ds-bg-galaxy" />
        <div className="absolute inset-0 ds-bg-aurora opacity-40" />
        <div className="ds-orb ds-orb-violet absolute top-1/3 left-1/4 w-[500px] h-[500px] opacity-50" />
        <div className="ds-orb ds-orb-pink absolute bottom-1/4 right-1/4 w-[440px] h-[440px] opacity-45" style={{ animationDelay: "2s" }} />
      </div>

      <div className="ds-card-feature relative max-w-md w-full p-10 text-center overflow-hidden ds-reveal">
        <div className="ds-orb ds-orb-pink absolute -top-20 -right-20 w-56 h-56 opacity-50" />
        <div className="relative">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 ds-icon-orb"
               style={{ background: "linear-gradient(135deg,#F43F5E,#EC4899)", boxShadow: "0 0 40px rgba(244,63,94,.55)" }}>
            <AlertCircle className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-7xl font-black ds-grad-text mb-3 tracking-tight">404</h1>
          <p className="text-white text-lg font-semibold mb-2">Page not found</p>
          <p className="text-white/55 text-sm mb-8 leading-relaxed">
            This page doesn't exist or has been moved. Let's get you back to making karaoke.
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <Link href="/" className="flex-1">
              <button className="ds-btn ds-btn-primary w-full py-3 text-sm">
                <Home className="w-4 h-4" />Back Home
              </button>
            </Link>
            <Link href="/upload" className="flex-1">
              <button className="ds-btn ds-btn-ghost w-full py-3 text-sm">
                <Mic2 className="w-4 h-4" />Create Karaoke
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
