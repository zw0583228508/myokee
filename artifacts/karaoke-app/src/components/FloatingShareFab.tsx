import { useState, useRef, useEffect, useCallback } from "react";
import { Share2, X, Copy, Check, MessageCircle, Mail, Send } from "lucide-react";
import { trackShare } from "@/lib/analytics";

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

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const APP_URL = "https://myoukee.com";
const SHARE_TEXT = "MYOUKEE — צור קריוקי AI מכל שיר תוך שניות! 🎤🎶";
const MENU_ID = "share-fab-menu";

function openExternal(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

interface ShareOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
  keepOpen?: boolean;
}

export function FloatingShareFab() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(APP_URL);
      setCopied(true);
      trackShare({ contentType: "app_link", method: "clipboard" });
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, []);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "MYOUKEE", text: SHARE_TEXT, url: APP_URL });
        trackShare({ contentType: "app_link", method: "native_share" });
        setOpen(false);
      } catch {}
    }
  }, []);

  const options: ShareOption[] = [
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: <MessageCircle className="w-5 h-5" />,
      color: "bg-green-600 hover:bg-green-500",
      action: () => { trackShare({ contentType: "app_link", method: "whatsapp" }); openExternal(`https://wa.me/?text=${encodeURIComponent(`${SHARE_TEXT}\n${APP_URL}`)}`); },
    },
    {
      id: "telegram",
      label: "Telegram",
      icon: <Send className="w-5 h-5" />,
      color: "bg-sky-600 hover:bg-sky-500",
      action: () => { trackShare({ contentType: "app_link", method: "telegram" }); openExternal(`https://t.me/share/url?url=${encodeURIComponent(APP_URL)}&text=${encodeURIComponent(SHARE_TEXT)}`); },
    },
    {
      id: "x",
      label: "X",
      icon: <XIcon className="w-5 h-5" />,
      color: "bg-neutral-700 hover:bg-neutral-600",
      action: () => { trackShare({ contentType: "app_link", method: "x" }); openExternal(`https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(APP_URL)}`); },
    },
    {
      id: "facebook",
      label: "Facebook",
      icon: <FacebookIcon className="w-5 h-5" />,
      color: "bg-blue-700 hover:bg-blue-600",
      action: () => { trackShare({ contentType: "app_link", method: "facebook" }); openExternal(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(APP_URL)}`); },
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      icon: <LinkedInIcon className="w-5 h-5" />,
      color: "bg-blue-800 hover:bg-blue-700",
      action: () => { trackShare({ contentType: "app_link", method: "linkedin" }); openExternal(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(APP_URL)}`); },
    },
    {
      id: "email",
      label: "Email",
      icon: <Mail className="w-5 h-5" />,
      color: "bg-orange-600 hover:bg-orange-500",
      action: () => { trackShare({ contentType: "app_link", method: "email" }); openExternal(`mailto:?subject=${encodeURIComponent("MYOUKEE — AI Karaoke")}&body=${encodeURIComponent(`${SHARE_TEXT}\n\n${APP_URL}`)}`); },
    },
    {
      id: "copy",
      label: copied ? "הועתק!" : "העתק קישור",
      icon: copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />,
      color: copied ? "bg-green-600" : "bg-white/10 hover:bg-white/20",
      action: handleCopy,
      keepOpen: true,
    },
  ];

  if ("share" in navigator) {
    options.unshift({
      id: "native",
      label: "שתף...",
      icon: <Share2 className="w-5 h-5" />,
      color: "bg-gradient-to-r from-primary to-accent hover:opacity-90",
      action: handleNativeShare,
      keepOpen: true,
    });
  }

  return (
    <div ref={menuRef} className="fixed bottom-6 left-6 z-40" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      {open && (
        <div
          id={MENU_ID}
          role="menu"
          className="absolute bottom-16 left-0 flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-4 duration-200 mb-2 max-h-[60vh] overflow-y-auto"
        >
          {options.map((opt) => (
            <button
              key={opt.id}
              role="menuitem"
              onClick={() => {
                opt.action();
                if (!opt.keepOpen) setOpen(false);
              }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-full text-white text-sm font-medium shadow-lg whitespace-nowrap transition-all ${opt.color}`}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      )}

      <button
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "סגור תפריט שיתוף" : "שתף את האפליקציה"}
        aria-expanded={open}
        aria-controls={MENU_ID}
        className={`flex items-center justify-center w-14 h-14 rounded-full shadow-xl transition-all duration-300 ${
          open
            ? "bg-white/10 backdrop-blur-md rotate-0"
            : "bg-gradient-to-br from-primary to-accent hover:scale-110 hover:shadow-primary/40"
        }`}
      >
        {open ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Share2 className="w-6 h-6 text-white" />
        )}
      </button>
    </div>
  );
}
