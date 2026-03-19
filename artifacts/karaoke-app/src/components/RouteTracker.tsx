import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { trackPageView, setUserId, setUserProperties, clearUserIdentity } from "@/lib/analytics";
import { useAuth } from "@/hooks/use-auth";

const PAGE_TITLES: Record<string, string> = {
  "/": "Home",
  "/upload": "Upload",
  "/history": "History",
  "/leaderboard": "Leaderboard",
  "/xp": "XP Profile",
  "/party": "Party",
  "/privacy": "Privacy",
  "/terms": "Terms",
  "/copyright": "Copyright",
  "/referral": "Referral",
};

export function RouteTracker() {
  const [location] = useLocation();
  const { data: authData } = useAuth();
  const prevLocation = useRef<string | null>(null);
  const prevUserId = useRef<string | null>(null);

  useEffect(() => {
    if (location !== prevLocation.current) {
      prevLocation.current = location;
      const basePath = location.split("/").slice(0, 2).join("/");
      const title = PAGE_TITLES[basePath] || PAGE_TITLES[location] || "MYOUKEE";
      trackPageView(location, title);
    }
  }, [location]);

  useEffect(() => {
    const user = authData?.user;
    if (user && user.id !== prevUserId.current) {
      prevUserId.current = user.id;
      setUserId(user.id);
      setUserProperties({
        credits: user.credits,
        has_email: !!user.email,
      });
    } else if (!user && prevUserId.current) {
      prevUserId.current = null;
      clearUserIdentity();
    }
  }, [authData?.user]);

  return null;
}
