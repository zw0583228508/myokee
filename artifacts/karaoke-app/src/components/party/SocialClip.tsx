import { useState, useRef } from "react";
import { Share2, MessageCircle, Twitter, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePartyTranslations } from "@/hooks/use-party-translations";
import { useAwardXP } from "@/hooks/use-gamification";
import type { PartyTheme } from "@/lib/party-themes";

interface SocialClipProps {
  roomName: string;
  theme: PartyTheme;
  leaderboard: any[];
  score?: { score: number; songName: string; displayName: string } | null;
}

export function SocialClip({ roomName, theme, leaderboard, score }: SocialClipProps) {
  const pt = usePartyTranslations();
  const awardXP = useAwardXP();
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const shareText = score
    ? `${pt.social.myScore}: ${score.score} - "${score.songName}" ${pt.social.atParty} ${roomName}! ${pt.social.singWith}`
    : `${pt.social.atParty} ${roomName}! ${pt.social.singWith}`;

  const shareUrl = window.location.origin + "/party";

  const trackShare = () => awardXP.mutate({ action: "shared_clip" });

  const handleShareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + "\n" + shareUrl)}`;
    window.open(url, "_blank");
    trackShare();
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank");
    trackShare();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareText + "\n" + shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    trackShare();
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: roomName, text: shareText, url: shareUrl });
        trackShare();
      } catch { /* user cancelled */ }
    } else {
      handleCopyLink();
    }
  };

  if (!score && (!leaderboard || leaderboard.length === 0)) return null;

  return (
    <div className="mt-6 space-y-4">
      {/* Shareable card preview */}
      <div
        ref={cardRef}
        className={`${theme.card} border ${theme.cardBorder} rounded-2xl p-6 relative overflow-hidden`}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{ background: `linear-gradient(135deg, ${theme.particleColors[0]}, ${theme.particleColors[1] || theme.particleColors[0]})` }}
        />
        <div className="relative z-10">
          <div className="text-center mb-4">
            <div className="text-3xl mb-2">{theme.emoji}</div>
            <h3 className="text-lg font-bold text-white">{roomName}</h3>
            <p className="text-sm text-white/40">{pt.social.atParty}</p>
          </div>

          {score && (
            <div className="text-center mb-4 py-4 rounded-xl bg-white/5">
              <div className="text-sm text-white/50 mb-1">{score.displayName}</div>
              <div className="text-4xl font-bold text-white mb-1">{score.score}</div>
              <div className="text-sm text-white/40">"{score.songName}"</div>
            </div>
          )}

          {leaderboard.length > 0 && !score && (
            <div className="space-y-2">
              {leaderboard.slice(0, 3).map((entry: any, idx: number) => (
                <div key={entry.user_id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                  <div className={`text-lg font-bold ${
                    idx === 0 ? "text-yellow-400" : idx === 1 ? "text-gray-300" : "text-orange-400"
                  }`}>
                    {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}
                  </div>
                  <div className="flex-1 text-sm text-white">{entry.display_name}</div>
                  <div className="text-sm font-bold text-white/80">{entry.total_score}</div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-4">
            <span className="text-xs text-white/20 font-mono">MYOUKEE.COM</span>
          </div>
        </div>
      </div>

      {/* Share buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={handleShareWhatsApp}
          className="gap-2 bg-green-600 hover:bg-green-500 text-white"
        >
          <MessageCircle className="w-4 h-4" />
          {pt.social.shareWhatsApp}
        </Button>
        <Button
          onClick={handleShareTwitter}
          className="gap-2 bg-sky-500 hover:bg-sky-400 text-white"
        >
          <Twitter className="w-4 h-4" />
          {pt.social.shareTwitter}
        </Button>
        <Button onClick={handleNativeShare} variant="outline" className="gap-2">
          <Share2 className="w-4 h-4" />
          {pt.social.shareScore}
        </Button>
        <Button onClick={handleCopyLink} variant="outline" className="gap-2">
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Link2 className="w-4 h-4" />}
          {copied ? pt.social.copied : pt.social.copyLink}
        </Button>
      </div>
    </div>
  );
}
