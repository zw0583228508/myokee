import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Mic2, LogOut, Loader2, Zap, Trophy, Globe, Plus, Menu, X, Music, History, Gift } from "lucide-react";
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
        className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/50 backdrop-blur-2xl"
        role="banner"
      >
        <div className="w-full max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 group transition-all duration-300" aria-label="MYOUKEE - דף הבית">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20 group-hover:shadow-primary/40 group-hover:scale-105 transition-all" aria-hidden="true">
              <Mic2 className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold tracking-wide">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">MY</span><span className="text-white">OUKEE</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1" aria-label="ניווט ראשי">
            <Link href="/upload"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                location === "/upload"
                  ? "bg-primary/15 text-primary"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
              aria-current={location === "/upload" ? "page" : undefined}
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />{t.nav.createKaraoke}
            </Link>
            <Link href="/leaderboard"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                location === "/leaderboard"
                  ? "bg-primary/15 text-primary"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
              aria-current={location === "/leaderboard" ? "page" : undefined}
            >
              <Trophy className="w-3.5 h-3.5" aria-hidden="true" />{t.nav.leaderboard}
            </Link>
          </nav>

          <nav className="flex items-center gap-2" aria-label="כלים">
            {/* Mobile hamburger */}
            <button
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="תפריט"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Language picker */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label={`${t.nav.language}: ${allLangs.find(l => l.code === lang)?.name}`}
                  title={t.nav.language}
                >
                  <Globe className="w-4 h-4" aria-hidden="true" />
                  <span className="text-base leading-none">{allLangs.find(l => l.code === lang)?.flag}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-white/10 min-w-[160px]" role="menu" aria-label={t.nav.language}>
                {allLangs.map(({ code, name, flag }) => (
                  <DropdownMenuItem
                    key={code}
                    onClick={() => setLang(code as SupportedLang)}
                    className={`cursor-pointer gap-2 ${lang === code ? "text-primary" : ""}`}
                    role="menuitemradio"
                    aria-checked={lang === code}
                  >
                    <span aria-hidden="true">{flag}</span>{name}
                    {lang === code && <span className="ml-auto text-primary text-xs">✓</span>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {isLoading ? (
              <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" aria-label="טוען..." />
            ) : user ? (
              <>
                {/* Credits badge + buy button */}
                <button
                  onClick={() => setShowPricing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-colors group focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label={`${user.credits} ${t.nav.credits} — לחץ לרכישה`}
                >
                  <Zap className="w-4 h-4 text-primary group-hover:animate-pulse" aria-hidden="true" />
                  <span className="text-sm font-semibold text-primary">{user.credits}</span>
                  <span className="text-xs text-muted-foreground hidden sm:block">{t.nav.credits}</span>
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                      aria-label={`תפריט משתמש — ${user.displayName}`}
                    >
                      {user.picture ? (
                        <img
                          src={user.picture}
                          alt={user.displayName}
                          className="w-7 h-7 rounded-full object-cover ring-2 ring-primary/30"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold" aria-hidden="true">
                          {user.displayName.charAt(0)}
                        </div>
                      )}
                      <span className="text-sm font-medium hidden sm:block max-w-[120px] truncate">
                        {user.displayName}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card border-white/10">
                    <div className="px-3 py-2 border-b border-white/5 mb-1">
                      <p className="text-sm font-medium">{user.displayName}</p>
                      {user.email && (
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      )}
                    </div>
                    <DropdownMenuItem onClick={() => setShowPricing(true)} className="cursor-pointer">
                      <Zap className="w-4 h-4 mr-2 text-primary" aria-hidden="true" />{t.nav.buyCredits}
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/leaderboard" className="cursor-pointer flex items-center w-full">
                        <Trophy className="w-4 h-4 mr-2 text-yellow-400" aria-hidden="true" />{t.nav.leaderboard}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/referral" className="cursor-pointer flex items-center w-full">
                        <Gift className="w-4 h-4 mr-2 text-violet-400" aria-hidden="true" />הזמן חברים
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/5" />
                    <DropdownMenuItem onClick={() => logout.mutate()}
                      className="text-muted-foreground hover:text-destructive cursor-pointer">
                      <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />{t.nav.logout}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-white/10 hover:bg-white/5 focus:ring-2 focus:ring-primary"
                onClick={() => setShowLogin(true)}
                aria-label={t.nav.login}
              >
                <GoogleIcon />
                <span className="hidden sm:block">{t.nav.login}</span>
              </Button>
            )}
          </nav>
        </div>

        {/* Mobile slide-down menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/8 bg-background/95 backdrop-blur-2xl">
            <nav className="w-full max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
              {[
                { href: "/upload",      icon: Plus,    label: t.nav.createKaraoke },
                { href: "/history",     icon: History, label: t.nav.history || "היסטוריה" },
                { href: "/leaderboard", icon: Trophy,  label: t.nav.leaderboard },
              ].map(({ href, icon: Icon, label }) => (
                <Link key={href} href={href} onClick={() => setMobileOpen(false)}>
                  <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${
                    location === href ? "bg-primary/15 text-primary" : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}>
                    <Icon className="w-4 h-4" />
                    {label}
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
