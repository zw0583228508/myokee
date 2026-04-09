import { useEffect, useRef, Suspense, lazy } from "react";
import { Switch, Route, Router as WouterRouter, useRoute } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/layout/Navbar";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ConsentGate } from "@/components/karaoke/ConsentModal";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { consumeAuthTokenFromUrl, useAuth } from "@/hooks/use-auth";
import { apiUrl, authFetchOptions } from "@/lib/api";
import { Mic2 } from "lucide-react";
import { FloatingShareFab } from "@/components/FloatingShareFab";
import { useUITranslations } from "@/contexts/uiTranslations";
import { RouteTracker } from "@/components/RouteTracker";
import NotFound from "@/pages/not-found";

const Home = lazy(() => import("@/pages/Home"));
const JobDetails = lazy(() => import("@/pages/JobDetails"));
const History = lazy(() => import("@/pages/History"));
const Leaderboard = lazy(() => import("@/pages/Leaderboard"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const Upload = lazy(() => import("@/pages/Upload"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Terms = lazy(() => import("@/pages/Terms"));
const Copyright = lazy(() => import("@/pages/Copyright"));
const Referral = lazy(() => import("@/pages/Referral"));
const Party = lazy(() => import("@/pages/Party"));
const PartyRoom = lazy(() => import("@/pages/PartyRoom"));
const PartyDisplay = lazy(() => import("@/pages/PartyDisplay"));
const GamificationProfile = lazy(() => import("@/pages/GamificationProfile"));
const SharedView = lazy(() => import("@/pages/SharedView"));
const LangLanding = lazy(() => import("@/pages/LangLanding"));
const Challenges = lazy(() => import("@/pages/Challenges"));
const Feed = lazy(() => import("@/pages/Feed"));
const Profile = lazy(() => import("@/pages/Profile"));
const VocalCoachPage = lazy(() => import("@/pages/VocalCoachPage"));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

function PageLoader() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30 animate-pulse">
        <Mic2 className="h-6 w-6 text-white" />
      </div>
    </div>
  );
}

function useAutoApplyReferral() {
  const { data: authData } = useAuth();
  const applied = useRef(false);
  useEffect(() => {
    if (applied.current || !authData?.user) return;
    const code = localStorage.getItem("myoukee-ref");
    if (!code) return;
    applied.current = true;
    fetch(apiUrl("/api/referral/apply"), authFetchOptions({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })).then((res) => {
      if (res.ok) localStorage.removeItem("myoukee-ref");
    }).catch(() => {});
  }, [authData?.user]);
}

function Router() {
  useAutoApplyReferral();
  const { data: authData, isLoading } = useAuth();
  const user = authData?.user ?? null;
  const uiT = useUITranslations();
  const [isSharedRoute, sharedParams] = useRoute("/shared/:id");
  const [isLangRoute] = useRoute("/lang/:lang");

  if (isLangRoute) {
    return (
      <Suspense fallback={<PageLoader />}>
        <LangLanding />
      </Suspense>
    );
  }

  if (isSharedRoute && sharedParams?.id) {
    return (
      <Suspense fallback={<PageLoader />}>
        <SharedView jobId={sharedParams.id} />
      </Suspense>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30 animate-pulse">
            <Mic2 className="h-7 w-7 text-white" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[300] bg-primary text-white px-4 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-white"
      >
        {uiT.skipToContent}
      </a>

      <div className="fixed inset-0 -z-20 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/5" />
      </div>
      <Navbar />
      <main id="main-content" className="flex-1 w-full" tabIndex={-1}>
        <Suspense fallback={<PageLoader />}>
          <Switch>
            <Route path="/"            component={Home}        />
            <Route path="/upload"      component={Upload}      />
            <Route path="/history"     component={History}     />
            <Route path="/leaderboard" component={Leaderboard} />
            <Route path="/xp"          component={GamificationProfile} />

            <Route path="/job/:id"     component={JobDetails}  />
            <Route path="/party"       component={Party}       />
            <Route path="/party/:id"   component={PartyRoom}   />
            <Route path="/party/:id/display" component={PartyDisplay} />
            <Route path="/privacy"     component={Privacy}     />
            <Route path="/terms"       component={Terms}       />
            <Route path="/copyright"   component={Copyright}   />
            <Route path="/referral"    component={Referral}    />
            <Route path="/challenges"  component={Challenges}  />
            <Route path="/feed"        component={Feed}        />
            <Route path="/profile/:userId" component={Profile} />
            <Route path="/vocal-coach"  component={VocalCoachPage} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </main>
      <FloatingShareFab />
    </div>
  );
}

consumeAuthTokenFromUrl();

function App() {
  useEffect(() => {
    const loader = document.getElementById('app-loader');
    if (loader) {
      loader.classList.add('hide');
      setTimeout(() => loader.remove(), 400);
    }
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <ConsentGate>
                <RouteTracker />
                <Router />
              </ConsentGate>
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
