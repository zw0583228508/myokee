import { useEffect, useRef } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
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
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import JobDetails from "@/pages/JobDetails";
import History from "@/pages/History";
import Leaderboard from "@/pages/Leaderboard";
import LoginPage from "@/pages/LoginPage";

import Upload from "@/pages/Upload";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Copyright from "@/pages/Copyright";
import Referral from "@/pages/Referral";
import Party from "@/pages/Party";
import PartyRoom from "@/pages/PartyRoom";
import PartyDisplay from "@/pages/PartyDisplay";
import GamificationProfile from "@/pages/GamificationProfile";
import MyRecordings from "@/pages/MyRecordings";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

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
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[300] bg-primary text-white px-4 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-white"
      >
        דלג לתוכן הראשי
      </a>

      <div className="fixed inset-0 -z-20 pointer-events-none overflow-hidden" aria-hidden="true">
        <img
          src="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1920&h=1080&fit=crop&q=80"
          alt=""
          className="w-full h-full object-cover opacity-[0.08]"
          style={{ filter: "saturate(0.6)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/5" />
      </div>
      <Navbar />
      <main id="main-content" className="flex-1 w-full" tabIndex={-1}>
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
          <Route path="/referral"   component={Referral}    />
          <Route path="/recordings" component={MyRecordings} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <FloatingShareFab />
    </div>
  );
}

// Pick up auth_token from URL on first load (popup redirect fallback)
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
