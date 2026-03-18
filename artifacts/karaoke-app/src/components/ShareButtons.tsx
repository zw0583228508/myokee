import { useState } from "react";
import { Share2, Copy, Check, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareButtonsProps {
  title: string;
  jobId: string;
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export function ShareButtons({ title, jobId }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/shared/${jobId}`;
  const shareText = `${title} - MYOUKEE AI Karaoke`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareText, url: shareUrl });
      } catch {}
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {"share" in navigator && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleNativeShare}
          className="gap-1.5 text-xs border-white/10 hover:bg-white/10"
        >
          <Share2 className="w-3.5 h-3.5" />
          Share
        </Button>
      )}

      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs border-green-500/30 text-green-400 hover:bg-green-500/10"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          WhatsApp
        </Button>
      </a>

      <a href={twitterUrl} target="_blank" rel="noopener noreferrer">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs border-white/10 hover:bg-white/10"
        >
          <XIcon className="w-3.5 h-3.5" />
          X
        </Button>
      </a>

      <a href={facebookUrl} target="_blank" rel="noopener noreferrer">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
        >
          <FacebookIcon className="w-3.5 h-3.5" />
          Facebook
        </Button>
      </a>

      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className={`gap-1.5 text-xs border-white/10 ${copied ? "text-green-400 border-green-500/30" : "hover:bg-white/10"}`}
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? "Copied!" : "Copy Link"}
      </Button>
    </div>
  );
}
