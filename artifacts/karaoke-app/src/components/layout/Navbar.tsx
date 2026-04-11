import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Mic2, LogOut, Loader2, Zap, Trophy, Globe, Plus, Menu, X, History, Gift, PartyPopper, Cloud, User, Medal, Users } from "lucide-react";
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

  const navLinks = [
    { href: "/upload",     icon: Plus,        label: t.nav.createKaraoke, primary: true },
    { href: "/leaderboard", icon: Trophy,     label: t.nav.leaderboard },
    { href: "/xp",          icon: Zap,        label: t.nav.xpBadges },
    { href: "/party",       icon: PartyPopper, label: t.nav.party, match: (l: string) => l.startsWith("/party") },
    { href: "/challenges",  icon: Medal,      label: t.nav.challenges },
    { href: "/feed",        icon: Users,      label: t.nav.feed, match: (l: string) => l === "/feed" || l.startsWith("/profile/") },
  ];

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full"
        role="banner"
      >
        <div className="absolute inset-0 bg-background/60 backdrop-blur-2xl" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px">
          <div className="h-full bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        </div>

        <div className="relative w-full max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 group transition-all duration-300" aria-label="MYOUKEE">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-accent to-primary shadow-lg shadow-primary/25 group-hover:shadow-primary/50 group-hover:scale-110 transition-all duration-500" aria-hidden="true">
              <Mic2 className="h-5 w-5 text-white drop-shadow-lg" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <span className="font-display text-xl font-bold tracking-wide">
              <span className="animated-gradient-text">MY</span><span className="text-white">OUKEE</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-0.5" aria-label="main navigation">
            {navLinks.map(({ href, icon: Icon, label, primary, match }) => {
              const isActive = match ? match(location) : location === href;
              return (
                <Link key={href} href={href}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "text-white"
                      : primary
                        ? "text-primary/80 hover:text-primary"
                        : "text-white/40 hover:text-white/80"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />{label}
                  {isActive && (
                    <span className="absolute bottom-0 inset-x-2 h-[2px] rounded-full bg-gradient-to-r from-primary via-accent to-primary animate-gradient-shift" style={{ backgroundSize: "200% 200%" }} />
                  )}
                </Link>
              );
            })}
          </nav>

          <nav className="flex items-center gap-2" aria-label="tools">
            <button
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all duration-300"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm text-white/40 hover:text-white/80 hover:bg-white/5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  aria-label={`${t.nav.language}: ${allLangs.find(l => l.code === lang)?.name}`}
                  title={t.nav.language}
                >
                  <Globe className="w-4 h-4" aria-hidden="true" />
                  <span className="text-base leading-none">{allLangs.find(l => l.code === lang)?.flag}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-panel min-w-[160px]" role="menu" aria-label={t.nav.language}>
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
              <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" aria-label="loading" />
            ) : user ? (
              <>
                <button
                  onClick={() => setShowPricing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/15 to-accent/10 border border-primary/25 hover:border-primary/40 hover:from-primary/25 hover:to-accent/15 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-primary/50"
                  aria-label={`${user.credits} ${t.nav.credits}`}
                >
                  <Zap className="w-4 h-4 text-primary group-hover:text-primary drop-shadow-[0_0_6px_rgba(147,51,234,0.5)]" aria-hidden="true" />
                  <span className="text-sm font-bold text-primary">{user.credits}</span>
                  <span className="text-xs text-white/30 hidden sm:block">{t.nav.credits}</span>
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/15 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      aria-label={`${user.displayName}`}
                    >
                      {user.picture ? (
                        <img
                          src={user.picture}
                          alt={user.displayName}
                          className="w-7 h-7 rounded-full object-cover ring-2 ring-primary/30 ring-offset-1 ring-offset-background"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20" aria-hidden="true">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <span className="text-sm font-medium hidden sm:block max-w-[120px] truncate text-white/70">
                        {user.displayName}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="glass-panel">
                    <div className="px-3 py-2.5 border-b border-white/[0.06] mb-1">
                      <p className="text-sm font-semibold text-white">{user.displayName}</p>
                      {user.email && (
                        <p className="text-xs text-white/30 mt-0.5">{user.email}</p>
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
                      <Link href="/xp" className="cursor-pointer flex items-center w-full">
                        <Zap className="w-4 h-4 mr-2 text-primary" aria-hidden="true" />{t.nav.xpBadges}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/recordings" className="cursor-pointer flex items-center w-full">
                        <Cloud className="w-4 h-4 mr-2 text-cyan-400" aria-hidden="true" />{t.nav.myRecordings}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/referral" className="cursor-pointer flex items-center w-full">
                        <Gift className="w-4 h-4 mr-2 text-violet-400" aria-hidden="true" />{t.nav.inviteFriends}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/[0.04]" />
                    <DropdownMenuItem onClick={() => logout.mutate()}
                      className="text-white/40 hover:text-destructive cursor-pointer">
                      <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />{t.nav.logout}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/15 transition-all duration-300 focus:ring-2 focus:ring-primary/50"
                onClick={() => setShowLogin(true)}
                aria-label={t.nav.login}
              >
                <GoogleIcon />
                <span className="hidden sm:block">{t.nav.login}</span>
              </Button>
            )}
          </nav>
        </div>

        {mobileOpen && (
          <div className="md:hidden absolute top-full inset-x-0 bg-background/95 backdrop-blur-2xl border-b border-white/[0.06]">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] to-transparent pointer-events-none" />
            <nav className="relative w-full max-w-7xl mx-auto px-4 py-3 flex flex-col gap-0.5">
              {[
                { href: "/upload",      icon: Plus,        label: t.nav.createKaraoke },
                { href: "/history",     icon: History,     label: t.nav.history },
                { href: "/recordings",  icon: Cloud,       label: t.nav.myRecordings },
                { href: "/leaderboard", icon: Trophy,      label: t.nav.leaderboard },
                { href: "/xp",          icon: Zap,         label: t.nav.xpBadges },
                { href: "/party",       icon: PartyPopper, label: t.nav.party },
                { href: "/challenges",  icon: Medal,       label: t.nav.challenges },
                { href: "/feed",        icon: Users,       label: t.nav.feed },
              ].map(({ href, icon: Icon, label }) => (
                <Link key={href} href={href} onClick={() => setMobileOpen(false)}>
                  <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    location === href
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-white/50 hover:text-white hover:bg-white/[0.04]"
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
