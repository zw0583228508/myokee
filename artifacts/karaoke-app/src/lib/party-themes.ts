export interface PartyTheme {
  id: string;
  name: string;
  emoji: string;
  bg: string;
  bgPattern: string;
  accent: string;
  accentHover: string;
  text: string;
  textMuted: string;
  card: string;
  cardBorder: string;
  gradient: string;
  lyricsActive: string;
  lyricsUpcoming: string;
  lyricsSung: string;
  particleColors: string[];
  scoreGlow: string;
}

export const PARTY_THEMES: Record<string, PartyTheme> = {
  neon: {
    id: "neon",
    name: "Neon Night",
    emoji: "🌃",
    bg: "bg-gradient-to-br from-gray-950 via-purple-950/40 to-gray-950",
    bgPattern: "radial-gradient(ellipse at 20% 50%, rgba(139,92,246,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(236,72,153,0.1) 0%, transparent 50%)",
    accent: "bg-violet-500",
    accentHover: "hover:bg-violet-400",
    text: "text-white",
    textMuted: "text-violet-300/70",
    card: "bg-gray-900/80 backdrop-blur-xl",
    cardBorder: "border-violet-500/20",
    gradient: "from-violet-500 to-fuchsia-500",
    lyricsActive: "text-violet-400",
    lyricsUpcoming: "text-white/90",
    lyricsSung: "text-green-400",
    particleColors: ["#8b5cf6", "#ec4899", "#06b6d4"],
    scoreGlow: "shadow-violet-500/50",
  },
  birthday: {
    id: "birthday",
    name: "Birthday Bash",
    emoji: "🎂",
    bg: "bg-gradient-to-br from-pink-950/80 via-yellow-950/30 to-purple-950/60",
    bgPattern: "radial-gradient(ellipse at 30% 40%, rgba(236,72,153,0.2) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(234,179,8,0.15) 0%, transparent 50%)",
    accent: "bg-pink-500",
    accentHover: "hover:bg-pink-400",
    text: "text-white",
    textMuted: "text-pink-300/70",
    card: "bg-pink-950/50 backdrop-blur-xl",
    cardBorder: "border-pink-500/20",
    gradient: "from-pink-500 to-yellow-500",
    lyricsActive: "text-pink-400",
    lyricsUpcoming: "text-white/90",
    lyricsSung: "text-yellow-400",
    particleColors: ["#ec4899", "#eab308", "#f97316", "#8b5cf6"],
    scoreGlow: "shadow-pink-500/50",
  },
  retro: {
    id: "retro",
    name: "Retro Vibes",
    emoji: "🕺",
    bg: "bg-gradient-to-br from-orange-950/60 via-red-950/40 to-yellow-950/40",
    bgPattern: "radial-gradient(ellipse at 50% 50%, rgba(249,115,22,0.15) 0%, transparent 60%), repeating-linear-gradient(45deg, rgba(234,179,8,0.03) 0px, rgba(234,179,8,0.03) 2px, transparent 2px, transparent 20px)",
    accent: "bg-orange-500",
    accentHover: "hover:bg-orange-400",
    text: "text-white",
    textMuted: "text-orange-300/70",
    card: "bg-orange-950/40 backdrop-blur-xl",
    cardBorder: "border-orange-500/20",
    gradient: "from-orange-500 to-red-500",
    lyricsActive: "text-orange-400",
    lyricsUpcoming: "text-white/90",
    lyricsSung: "text-yellow-300",
    particleColors: ["#f97316", "#ef4444", "#eab308"],
    scoreGlow: "shadow-orange-500/50",
  },
  elegant: {
    id: "elegant",
    name: "Elegant Gold",
    emoji: "✨",
    bg: "bg-gradient-to-br from-gray-950 via-amber-950/20 to-gray-950",
    bgPattern: "radial-gradient(ellipse at 50% 30%, rgba(217,169,78,0.1) 0%, transparent 60%)",
    accent: "bg-amber-500",
    accentHover: "hover:bg-amber-400",
    text: "text-white",
    textMuted: "text-amber-200/60",
    card: "bg-gray-900/70 backdrop-blur-xl",
    cardBorder: "border-amber-500/20",
    gradient: "from-amber-400 to-yellow-600",
    lyricsActive: "text-amber-400",
    lyricsUpcoming: "text-white/90",
    lyricsSung: "text-amber-300",
    particleColors: ["#d4a24e", "#f59e0b", "#fbbf24"],
    scoreGlow: "shadow-amber-500/50",
  },
  ocean: {
    id: "ocean",
    name: "Ocean Wave",
    emoji: "🌊",
    bg: "bg-gradient-to-br from-cyan-950/80 via-blue-950/60 to-teal-950/40",
    bgPattern: "radial-gradient(ellipse at 30% 70%, rgba(6,182,212,0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 30%, rgba(59,130,246,0.1) 0%, transparent 50%)",
    accent: "bg-cyan-500",
    accentHover: "hover:bg-cyan-400",
    text: "text-white",
    textMuted: "text-cyan-300/70",
    card: "bg-cyan-950/40 backdrop-blur-xl",
    cardBorder: "border-cyan-500/20",
    gradient: "from-cyan-400 to-blue-500",
    lyricsActive: "text-cyan-400",
    lyricsUpcoming: "text-white/90",
    lyricsSung: "text-teal-300",
    particleColors: ["#06b6d4", "#3b82f6", "#14b8a6"],
    scoreGlow: "shadow-cyan-500/50",
  },
};

export function getTheme(id: string): PartyTheme {
  return PARTY_THEMES[id] || PARTY_THEMES.neon;
}

export const THEME_LIST = Object.values(PARTY_THEMES);
