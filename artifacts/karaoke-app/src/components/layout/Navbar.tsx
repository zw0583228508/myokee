import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Mic2, LogOut, Loader2, Zap, Trophy, Globe, Plus, Menu, X, History, Gift, PartyPopper, Cloud, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { PricingModal } from "@/components/karaoke/PricingModal";
import { LoginModal } from "@/components/karaoke/LoginModal";
import { useLang, type SupportedLang } from "@/contexts/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

// Sound wave animation component
function SoundWave() {
  return (
    <div className="sound-wave opacity-70">
      <span style={{ height: '12px' }} />
      <span style={{ height: '18px' }} />
      <span style={{ height: '10px' }} />
      <span style={{ height: '16px' }} />
      <span style={{ height: '8px' }} />
    </div>
  );
}

export function Navbar() {
  const { data: authData, isLoading } = useAuth();
  const logout      = useLogout();
  const [location]  = useLocation();
  const user        = authData?.user ?? null;
  const [showPricing, setShowPricing] = useState(false);
  const [showLogin,   setShowLogin]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const { t, lang, setLang, allLangs } = useLang();

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full navbar-premium"
        role="banner"
      >
        {/* Animated top border glow */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        
        <div className="w-full max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo with glow effect */}
          <Link href="/" className="flex items-center gap-3 group transition-all duration-300" aria-label="MYOUKEE - דף הבית">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 blur-lg opacity-50 group-hover:opacity-80 transition-opacity" />
              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Mic2 className="h-5 w-5 text-white mic-pulse" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold tracking-wide">
                <span className="animated-gradient-text">MY</span>
                <span className="text-white">OUKEE</span>
              </span>
              <span className="text-[10px] text-purple-400/60 tracking-widest uppercase hidden sm:block">Karaoke Studio</span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1" aria-label="ניווט ראשי">
            <NavLink href="/upload" icon={Plus} isActive={location === "/upload"}>
              {t.nav.createKaraoke}
            </NavLink>
            <NavLink href="/leaderboard" icon={Trophy} isActive={location === "/leaderboard"}>
              {t.nav.leaderboard}
            </NavLink>
            <NavLink href="/xp" icon={Zap} isActive={location === "/xp"}>
              XP
            </NavLink>
            <NavLink href="/party" icon={PartyPopper} isActive={location.startsWith("/party")}>
              Party
            </NavLink>
          </nav>

          <nav className="flex items-center gap-2" aria-label="כלים">
            {/* Sound wave indicator */}
            <div className="hidden lg:block">
              <SoundWave />
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300 neon-border"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="תפריט"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Language picker */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all duration-300 neon-border"
                  aria-label={`${t.nav.language}: ${allLangs.find(l => l.code === lang)?.name}`}
                  title={t.nav.language}
                >
                  <Globe className="w-4 h-4" aria-hidden="true" />
                  <span className="text-base leading-none">{allLangs.find(l => l.code === lang)?.flag}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-panel-glow border-purple-500/20 min-w-[160px]" role="menu" aria-label={t.nav.language}>
                {allLangs.map(({ code, name, flag }) => (
                  <DropdownMenuItem
                    key={code}
                    onClick={() => setLang(code as SupportedLang)}
                    className={`cursor-pointer gap-2 transition-colors ${lang === code ? "text-purple-400 bg-purple-500/10" : "hover:bg-white/5"}`}
                    role="menuitemradio"
                    aria-checked={lang === code}
                  >
                    <span aria-hidden="true">{flag}</span>{name}
                    {lang === code && <Sparkles className="ml-auto w-3 h-3 text-purple-400" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {isLoading ? (
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-purple-400 animate-spin" aria-label="טוען..." />
              </div>
            ) : user ? (
              <>
                {/* Credits badge with glow */}
                <button
                  onClick={() => setShowPricing(true)}
                  className="relative group flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 hover:border-purple-500/60 transition-all duration-300"
                  aria-label={`${user.credits} ${t.nav.credits} — לחץ לרכישה`}
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
                  <Zap className="w-4 h-4 text-purple-400 group-hover:text-purple-300 transition-colors" aria-hidden="true" />
                  <span className="relative text-sm font-bold text-purple-300">{user.credits}</span>
                  <span className="relative text-xs text-purple-400/60 hidden sm:block">{t.nav.credits}</span>
                </button>

                {/* User menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="relative group flex items-center gap-2 px-2 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-purple-500/40 transition-all duration-300"
                      aria-label={`תפריט משתמש — ${user.displayName}`}
                    >
                      <div className="absolute inset-0 rounded-full bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {user.picture ? (
                        <div className="relative">
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 blur opacity-50" />
                          <img
                            src={user.picture}
                            alt={user.displayName}
                            className="relative w-8 h-8 rounded-full object-cover ring-2 ring-purple-500/50"
                          />
                        </div>
                      ) : (
                        <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <span className="relative text-sm font-medium hidden sm:block max-w-[100px] truncate text-white/90">
                        {user.displayName}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="glass-panel-glow border-purple-500/20 min-w-[200px]">
                    <div className="px-3 py-3 border-b border-white/5 mb-1">
                      <p className="text-sm font-semibold text-white">{user.displayName}</p>
                      {user.email && (
                        <p className="text-xs text-purple-400/60 mt-0.5">{user.email}</p>
                      )}
                    </div>
                    <DropdownMenuItem onClick={() => setShowPricing(true)} className="cursor-pointer gap-2 hover:bg-purple-500/10">
                      <Zap className="w-4 h-4 text-purple-400" aria-hidden="true" />{t.nav.buyCredits}
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/leaderboard" className="cursor-pointer flex items-center w-full gap-2 hover:bg-purple-500/10">
                        <Trophy className="w-4 h-4 text-yellow-400" aria-hidden="true" />{t.nav.leaderboard}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/xp" className="cursor-pointer flex items-center w-full gap-2 hover:bg-purple-500/10">
                        <Zap className="w-4 h-4 text-purple-400" aria-hidden="true" />XP & Badges
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/recordings" className="cursor-pointer flex items-center w-full gap-2 hover:bg-purple-500/10">
                        <Cloud className="w-4 h-4 text-cyan-400" aria-hidden="true" />{lang === "he" ? "ההקלטות שלי" : lang === "ar" ? "تسجيلاتي" : "My Recordings"}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/referral" className="cursor-pointer flex items-center w-full gap-2 hover:bg-purple-500/10">
                        <Gift className="w-4 h-4 text-pink-400" aria-hidden="true" />הזמן חברים
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/5" />
                    <DropdownMenuItem onClick={() => logout.mutate()}
                      className="text-red-400/80 hover:text-red-400 hover:bg-red-500/10 cursor-pointer gap-2">
                      <LogOut className="w-4 h-4" aria-hidden="true" />{t.nav.logout}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button
                size="sm"
                className="btn-neon gap-2 px-5 py-2 rounded-full text-white font-semibold"
                onClick={() => setShowLogin(true)}
                aria-label={t.nav.login}
              >
                <GoogleIcon />
                <span className="hidden sm:block">{t.nav.login}</span>
              </Button>
            )}
          </nav>
        </div>

        {/* Mobile slide-down menu with premium styling */}
        {mobileOpen && (
          <div className="md:hidden border-t border-purple-500/20 glass-panel">
            <nav className="w-full max-w-7xl mx-auto px-4 py-4 flex flex-col gap-2">
              {[
                { href: "/upload",      icon: Plus,        label: t.nav.createKaraoke },
                { href: "/history",     icon: History,     label: t.nav.history || "היסטוריה" },
                { href: "/recordings",  icon: Cloud,       label: lang === "he" ? "ההקלטות שלי" : lang === "ar" ? "تسجيلاتي" : "My Recordings" },
                { href: "/leaderboard", icon: Trophy,      label: t.nav.leaderboard },
                { href: "/xp",          icon: Zap,         label: "XP" },
                { href: "/party",       icon: PartyPopper, label: "Party" },
              ].map(({ href, icon: Icon, label }) => (
                <Link key={href} href={href} onClick={() => setMobileOpen(false)}>
                  <button className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    location === href 
                      ? "bg-gradient-to-r from-purple-500/20 to-blue-500/10 text-purple-300 border border-purple-500/30" 
                      : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}>
                    <Icon className={`w-5 h-5 ${location === href ? "text-purple-400" : ""}`} />
                    {label}
                    {location === href && (
                      <div className="ml-auto">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                      </div>
                    )}
                  </button>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      <PricingModal open={showPricing} onOpenChange={setShowPricing} />
      <LoginModal open={showLogin} onOpenChange={setShowLogin} />
    </>
  );
}

// Reusable NavLink component with premium styling
function NavLink({ 
  href, 
  icon: Icon, 
  isActive, 
  children 
}: { 
  href: string; 
  icon: React.ElementType; 
  isActive: boolean; 
  children: React.ReactNode;
}) {
  return (
    <Link href={href}>
      <button
        className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
          isActive
            ? "text-purple-300"
            : "text-white/50 hover:text-white"
        }`}
        aria-current={isActive ? "page" : undefined}
      >
        {isActive && (
          <>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/10 border border-purple-500/30" />
            <div className="absolute inset-0 rounded-xl bg-purple-500/10 blur-xl" />
          </>
        )}
        <Icon className={`relative w-4 h-4 ${isActive ? "text-purple-400" : ""}`} aria-hidden="true" />
        <span className="relative">{children}</span>
      </button>
    </Link>
  );
}
