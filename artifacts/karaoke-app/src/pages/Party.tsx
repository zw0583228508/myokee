import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { PartyPopper, Plus, LogIn, Crown, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePartyTranslations } from "@/hooks/use-party-translations";
import { useCreateParty, useJoinParty, useMyParties } from "@/hooks/use-party";
import { useAwardXP } from "@/hooks/use-gamification";
import { THEME_LIST, getTheme } from "@/lib/party-themes";
import { useAuth } from "@/hooks/use-auth";
import { useLang } from "@/contexts/LanguageContext";
import { trackPartyCreated, trackPartyJoined } from "@/lib/analytics";
import { useNoIndex } from "@/hooks/use-noindex";

export default function Party() {
  useNoIndex();
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
      trackPartyCreated();
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
      trackPartyJoined();
      navigate(`/party/${room.id}`);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const activeParties = (myParties || []).filter((p: any) => p.status === "active");

  return (
    <div className="min-h-screen px-4 py-8 max-w-2xl mx-auto" dir={dir}>
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
          <PartyPopper className="w-5 h-5" />
          <span className="text-sm font-semibold">{pt.hub.title}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{pt.hub.title}</h1>
        <p className="text-muted-foreground">{pt.hub.subtitle}</p>
      </div>

      <div className="flex gap-2 mb-6">
        <Button
          variant={tab === "create" ? "default" : "outline"}
          className="flex-1 gap-2"
          onClick={() => setTab("create")}
        >
          <Plus className="w-4 h-4" />
          {pt.hub.createParty}
        </Button>
        <Button
          variant={tab === "join" ? "default" : "outline"}
          className="flex-1 gap-2"
          onClick={() => setTab("join")}
        >
          <LogIn className="w-4 h-4" />
          {pt.hub.joinParty}
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {tab === "create" && (
        <Card className="bg-card/60 backdrop-blur-xl border-white/10">
          <CardContent className="pt-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">{pt.hub.partyName}</label>
              <input
                type="text"
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
                placeholder={pt.hub.partyNamePlaceholder}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-3">{pt.hub.selectTheme}</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {THEME_LIST.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`relative p-4 rounded-xl border-2 transition-all text-start ${
                      selectedTheme === theme.id
                        ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="text-2xl mb-1">{theme.emoji}</div>
                    <div className="text-sm font-medium text-white">
                      {pt.themes[theme.id as keyof typeof pt.themes]}
                    </div>
                    {selectedTheme === theme.id && (
                      <div className="absolute top-2 end-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleCreate}
              disabled={createParty.isPending}
              className="w-full py-6 text-lg font-semibold gap-2"
              size="lg"
            >
              <PartyPopper className="w-5 h-5" />
              {createParty.isPending ? "..." : pt.hub.create}
            </Button>
          </CardContent>
        </Card>
      )}

      {tab === "join" && (
        <Card className="bg-card/60 backdrop-blur-xl border-white/10">
          <CardContent className="pt-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">{pt.hub.yourDisplayName}</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={user?.displayName || "Guest"}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">{pt.hub.enterCode}</label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder={pt.hub.codePlaceholder}
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-center text-2xl font-mono tracking-[0.3em] placeholder:text-white/30 placeholder:tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-primary/50 uppercase"
              />
            </div>
            <Button
              onClick={handleJoin}
              disabled={joinParty.isPending || !joinCode.trim()}
              className="w-full py-6 text-lg font-semibold gap-2"
              size="lg"
            >
              <LogIn className="w-5 h-5" />
              {joinParty.isPending ? "..." : pt.hub.join}
            </Button>
          </CardContent>
        </Card>
      )}

      {activeParties.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            {pt.hub.recentParties}
          </h2>
          <div className="space-y-3">
            {activeParties.map((room: any) => {
              const theme = getTheme(room.theme);
              return (
                <button
                  key={room.id}
                  onClick={() => navigate(`/party/${room.id}`)}
                  className="w-full text-start p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/30 transition-all flex items-center gap-4"
                >
                  <div className="text-2xl">{theme.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate">{room.name}</div>
                    <div className="text-sm text-white/50 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {room.code}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(room.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                    {pt.hub.active}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
