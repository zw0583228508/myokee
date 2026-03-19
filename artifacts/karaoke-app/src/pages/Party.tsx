import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { PartyPopper, Plus, LogIn, Crown, Clock, Users, Sparkles, Music, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePartyTranslations } from "@/hooks/use-party-translations";
import { useCreateParty, useJoinParty, useMyParties } from "@/hooks/use-party";
import { useAwardXP } from "@/hooks/use-gamification";
import { THEME_LIST, getTheme } from "@/lib/party-themes";
import { useAuth } from "@/hooks/use-auth";
import { useLang } from "@/contexts/LanguageContext";

// Floating disco balls
function DiscoBalls() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-3 h-3 rounded-full bg-gradient-to-br from-purple-400 to-pink-400"
          style={{
            left: `${15 + Math.random() * 70}%`,
            top: `${10 + Math.random() * 40}%`,
            animation: `float ${4 + Math.random() * 3}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
            opacity: 0.4,
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.5)',
          }}
        />
      ))}
    </div>
  );
}

export default function Party() {
  const pt = usePartyTranslations();
  const { t: { dir } } = useLang();
  const [, navigate] = useLocation();
  const { data: authData } = useAuth();
  const user = authData?.user;

  const search = useSearch();
  const codeFromUrl = new URLSearchParams(search).get("code") || "";

  const [tab, setTab] = useState<"create" | "join">(codeFromUrl ? "join" : "create");
  const [partyName, setPartyName] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("neon");
  const [joinCode, setJoinCode] = useState(codeFromUrl);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [error, setError] = useState("");

  const createParty = useCreateParty();
  const joinParty = useJoinParty();
  const awardXP = useAwardXP();
  const { data: myParties } = useMyParties();

  const handleCreate = async () => {
    setError("");
    try {
      const room = await createParty.mutateAsync({
        name: partyName || pt.hub.partyNamePlaceholder,
        theme: selectedTheme,
      });
      awardXP.mutate({ action: "party_hosted" });
      navigate(`/party/${room.id}`);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleJoin = async () => {
    setError("");
    if (!joinCode.trim()) return;
    try {
      const room = await joinParty.mutateAsync({
        code: joinCode.trim().toUpperCase(),
        displayName: displayName || undefined,
      });
      awardXP.mutate({ action: "party_joined" });
      navigate(`/party/${room.id}`);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const activeParties = (myParties || []).filter((p: any) => p.status === "active");

  return (
    <div className="min-h-screen page-bg-party" dir={dir}>
      {/* Premium Hero Background */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <img
          src="/images/party-bg.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-background/80 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-pink-900/10 via-transparent to-purple-900/10" />
        
        {/* Animated glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-pink-500/15 blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-purple-500/10 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <DiscoBalls />

      <div className="relative px-4 py-12 sm:py-16 max-w-2xl mx-auto">
        {/* Premium Header */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full glass-panel-glow border-pink-500/30 text-sm text-pink-300 font-medium mb-6">
            <PartyPopper className="w-5 h-5" />
            <span className="animated-gradient-text font-semibold">{pt.hub.title}</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-black mb-4">
            <span className="text-white">{pt.hub.title}</span>
          </h1>
          <p className="text-white/40 text-lg">{pt.hub.subtitle}</p>
        </div>

        {/* Premium Tab Navigation */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setTab("create")}
            className={`relative flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold transition-all ${
              tab === "create"
                ? "text-white"
                : "glass-panel text-white/50 hover:text-white/70"
            }`}
          >
            {tab === "create" && (
              <>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500" />
                <div className="absolute inset-0 rounded-2xl bg-purple-500/30 blur-xl" />
              </>
            )}
            <Plus className="relative w-5 h-5" />
            <span className="relative">{pt.hub.createParty}</span>
          </button>
          <button
            onClick={() => setTab("join")}
            className={`relative flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold transition-all ${
              tab === "join"
                ? "text-white"
                : "glass-panel text-white/50 hover:text-white/70"
            }`}
          >
            {tab === "join" && (
              <>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500" />
                <div className="absolute inset-0 rounded-2xl bg-blue-500/30 blur-xl" />
              </>
            )}
            <LogIn className="relative w-5 h-5" />
            <span className="relative">{pt.hub.joinParty}</span>
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">!</div>
            {error}
          </div>
        )}

        {/* Create Party Form */}
        {tab === "create" && (
          <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-3">{pt.hub.partyName}</label>
              <input
                type="text"
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
                placeholder={pt.hub.partyNamePlaceholder}
                className="w-full px-5 py-4 rounded-xl input-glow text-white placeholder:text-white/30 text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/80 mb-4">{pt.hub.selectTheme}</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {THEME_LIST.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`relative p-5 rounded-2xl transition-all text-start group ${
                      selectedTheme === theme.id
                        ? "card-premium ring-2 ring-purple-500/50"
                        : "card-premium hover:border-purple-500/30"
                    }`}
                  >
                    {selectedTheme === theme.id && (
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/5" />
                    )}
                    <div className="relative">
                      <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{theme.emoji}</div>
                      <div className="text-sm font-medium text-white">
                        {pt.themes[theme.id as keyof typeof pt.themes]}
                      </div>
                    </div>
                    {selectedTheme === theme.id && (
                      <div className="absolute top-3 end-3 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCreate}
              disabled={createParty.isPending}
              className="w-full py-5 rounded-2xl btn-neon text-white text-lg font-bold flex items-center justify-center gap-3 transition-all hover:scale-[1.02]"
            >
              <PartyPopper className="w-6 h-6" />
              {createParty.isPending ? "..." : pt.hub.create}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Join Party Form */}
        {tab === "join" && (
          <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-3">{pt.hub.yourDisplayName}</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={user?.displayName || "Guest"}
                className="w-full px-5 py-4 rounded-xl input-glow text-white placeholder:text-white/30 text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-3">{pt.hub.enterCode}</label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder={pt.hub.codePlaceholder}
                maxLength={6}
                className="w-full px-5 py-5 rounded-xl input-glow text-white text-center text-3xl font-mono tracking-[0.4em] placeholder:text-white/20 placeholder:tracking-[0.4em] uppercase"
              />
            </div>
            <button
              onClick={handleJoin}
              disabled={joinParty.isPending || !joinCode.trim()}
              className="w-full py-5 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-lg font-bold flex items-center justify-center gap-3 transition-all hover:scale-[1.02] disabled:opacity-50 shadow-lg shadow-blue-500/30"
            >
              <LogIn className="w-6 h-6" />
              {joinParty.isPending ? "..." : pt.hub.join}
            </button>
          </div>
        )}

        {/* Active Parties */}
        {activeParties.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              {pt.hub.recentParties}
            </h2>
            <div className="space-y-3">
              {activeParties.map((room: any) => {
                const theme = getTheme(room.theme);
                return (
                  <button
                    key={room.id}
                    onClick={() => navigate(`/party/${room.id}`)}
                    className="w-full text-start card-premium rounded-2xl p-5 flex items-center gap-5 group"
                  >
                    <div className="text-3xl group-hover:scale-110 transition-transform">{theme.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white truncate text-base">{room.name}</div>
                      <div className="text-sm text-white/40 flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1.5">
                          <Users className="w-4 h-4" />
                          {room.code}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {new Date(room.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <span className="px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-semibold">
                      {pt.hub.active}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
