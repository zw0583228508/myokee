import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { PartyPopper, Plus, LogIn, Crown, Clock, Users, Check, Sparkles } from "lucide-react";
import { usePartyTranslations } from "@/hooks/use-party-translations";
import { useCreateParty, useJoinParty, useMyParties } from "@/hooks/use-party";
import { useAwardXP } from "@/hooks/use-gamification";
import { THEME_LIST, getTheme } from "@/lib/party-themes";
import { useAuth } from "@/hooks/use-auth";
import { useLang } from "@/contexts/LanguageContext";
import { trackPartyCreated, trackPartyJoined } from "@/lib/analytics";
import { useNoIndex } from "@/hooks/use-noindex";
import { buildDemoParties } from "@/lib/demoData";

export default function Party() {
  useNoIndex();
  const pt = usePartyTranslations();
  const { t: { dir }, lang } = useLang();
  const [, navigate] = useLocation();
  const { data: authData } = useAuth();
  const user = authData?.user;

  const search = useSearch();
  const codeFromUrl = new URLSearchParams(search).get("code") || "";

  const [tab, setTab] = useState<"create" | "join">(codeFromUrl ? "join" : "create");
  const [partyName, setPartyName] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("neon");
  const [joinCode, setJoinCode] = useState(codeFromUrl);
  const [displayName, setDisplayName] = useState((user as any)?.displayName || "");
  const [error, setError] = useState("");

  const createParty = useCreateParty();
  const joinParty = useJoinParty();
  const awardXP = useAwardXP();
  const { data: myParties } = useMyParties();

  const handleCreate = async () => {
    setError("");
    try {
      const room = await createParty.mutateAsync({ name: partyName || pt.hub.partyNamePlaceholder, theme: selectedTheme });
      awardXP.mutate({ action: "party_hosted" });
      trackPartyCreated();
      navigate(`/party/${room.id}`);
    } catch (e: any) { setError(e.message); }
  };

  const handleJoin = async () => {
    setError("");
    if (!joinCode.trim()) return;
    try {
      const room = await joinParty.mutateAsync({ code: joinCode.trim().toUpperCase(), displayName: displayName || undefined });
      awardXP.mutate({ action: "party_joined" });
      trackPartyJoined();
      navigate(`/party/${room.id}`);
    } catch (e: any) { setError(e.message); }
  };

  const realActive = (myParties || []).filter((p: any) => p.status === "active");
  // Show demo parties when the user has none, so the hub never looks empty.
  // Demo party cards navigate into a read-only demo party room.
  const activeParties = realActive.length > 0 ? realActive : buildDemoParties(lang);

  return (
    <div className="min-h-screen bg-[var(--ds-bg-app)] relative" dir={dir}>
      <div className="absolute top-0 inset-x-0 h-[420px] -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 ds-bg-galaxy" />
        <div className="absolute inset-0 ds-bg-aurora opacity-50" />
        <div className="ds-orb ds-orb-pink absolute -top-32 left-10 w-[440px] h-[440px] opacity-50" />
        <div className="ds-orb ds-orb-violet absolute -top-24 right-10 w-[400px] h-[400px] opacity-40" style={{ animationDelay: "2s" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050510]/30 via-transparent to-[#050510]" />
      </div>

      <div className="px-4 py-12 max-w-2xl mx-auto">
        <div className="text-center mb-10 ds-reveal">
          <div className="inline-flex items-center gap-1.5 ds-glass rounded-full px-3 py-1 text-[11px] font-bold text-pink-300 uppercase tracking-wider mb-4">
            <Sparkles className="w-3 h-3" />Group Karaoke
          </div>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ds-icon-orb"
               style={{ background: "linear-gradient(135deg,#EC4899,#8B5CF6)", boxShadow: "0 0 40px rgba(236,72,153,.55)" }}>
            <PartyPopper className="w-8 h-8 text-white drop-shadow-lg" />
          </div>
          <h1 className="ds-page-title font-bold text-white mb-2">{pt.hub.title}</h1>
          <p className="text-white/55 text-base">{pt.hub.subtitle}</p>
        </div>

        <div className="flex gap-1.5 p-1.5 rounded-2xl ds-glass mb-6">
          {[
            { key: "create" as const, icon: Plus, label: pt.hub.createParty },
            { key: "join" as const, icon: LogIn, label: pt.hub.joinParty },
          ].map(({ key, icon: Icon, label }) => {
            const isActive = tab === key;
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive ? "text-white" : "text-white/45 hover:text-white/75"
                }`}
                style={isActive ? { background: "var(--ds-grad-primary)", boxShadow: "var(--ds-glow-violet)" } : {}}
              >
                <Icon className="w-4 h-4" />{label}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-sm">{error}</div>
        )}

        {tab === "create" && (
          <div className="ds-card-feature relative p-6 sm:p-7 space-y-6 overflow-hidden">
            <div className="ds-orb ds-orb-pink absolute -top-12 -right-12 w-48 h-48 opacity-50" />
            <div className="relative">
              <label className="block text-sm font-semibold text-white/75 mb-2">{pt.hub.partyName}</label>
              <input
                type="text"
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
                placeholder={pt.hub.partyNamePlaceholder}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400/50 transition-all"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-white/75 mb-3">{pt.hub.selectTheme}</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {THEME_LIST.map((theme) => {
                  const sel = selectedTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme.id)}
                      className={`relative p-4 rounded-xl border-2 transition-all duration-300 text-start ${
                        sel ? "border-violet-400/60 bg-violet-500/12 ring-2 ring-violet-400/20 shadow-[0_0_24px_rgba(139,92,246,.2)]"
                            : "border-white/[0.08] bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.05]"
                      }`}
                    >
                      <div className="text-2xl mb-1.5">{theme.emoji}</div>
                      <div className="text-sm font-semibold text-white/85">{pt.themes[theme.id as keyof typeof pt.themes]}</div>
                      {sel && (
                        <div className="absolute top-2 end-2 w-5 h-5 rounded-full ds-icon-orb">
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleCreate}
              disabled={createParty.isPending}
              className="ds-btn ds-btn-primary w-full py-4 text-base disabled:opacity-40"
            >
              <PartyPopper className="w-5 h-5" />
              {createParty.isPending ? "..." : pt.hub.create}
            </button>
          </div>
        )}

        {tab === "join" && (
          <div className="ds-card-feature relative p-6 sm:p-7 space-y-5 overflow-hidden">
            <div className="ds-orb ds-orb-cyan absolute -top-12 -right-12 w-48 h-48 opacity-50" />
            <div className="relative space-y-5">
              <div>
                <label className="block text-sm font-semibold text-white/75 mb-2">{pt.hub.yourDisplayName}</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={(user as any)?.displayName || "Guest"}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/75 mb-2">{pt.hub.enterCode}</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder={pt.hub.codePlaceholder}
                  maxLength={6}
                  className="w-full px-4 py-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-center text-3xl font-mono tracking-[0.4em] placeholder:text-white/20 placeholder:tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400/50 uppercase transition-all"
                />
              </div>
              <button
                onClick={handleJoin}
                disabled={joinParty.isPending || !joinCode.trim()}
                className="ds-btn ds-btn-primary w-full py-4 text-base disabled:opacity-40"
              >
                <LogIn className="w-5 h-5" />
                {joinParty.isPending ? "..." : pt.hub.join}
              </button>
            </div>
          </div>
        )}

        {activeParties.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,.5)]" />
              {pt.hub.recentParties}
            </h2>
            <div className="space-y-2.5">
              {activeParties.map((room: any, i: number) => {
                const theme = getTheme(room.theme);
                return (
                  <button
                    key={room.id}
                    onClick={() => navigate(`/party/${room.id}`)}
                    className="w-full text-start p-4 rounded-2xl ds-card transition-all duration-300 flex items-center gap-4 ds-reveal hover:border-violet-400/30"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <div className="text-2xl">{theme.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white truncate">{room.name}</div>
                      <div className="text-xs text-white/45 flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{room.code}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{new Date(room.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/25">
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
