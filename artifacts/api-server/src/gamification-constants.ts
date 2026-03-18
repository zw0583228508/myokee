export const XP_REWARDS = {
  KARAOKE_CREATED: 50,
  BATTLE_WON: 30,
  BATTLE_PLAYED: 15,
  DUET_COMPLETED: 20,
  PARTY_HOSTED: 25,
  PARTY_JOINED: 10,
  DAILY_LOGIN: 5,
  STREAK_BONUS_3: 15,
  STREAK_BONUS_7: 40,
  STREAK_BONUS_30: 150,
  FIRST_KARAOKE: 100,
  SHARED_CLIP: 10,
} as const;

export interface BadgeDefinition {
  id: string;
  icon: string;
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond";
}

export const BADGES: BadgeDefinition[] = [
  { id: "first_song", icon: "🎤", tier: "bronze" },
  { id: "song_5", icon: "🎵", tier: "bronze" },
  { id: "song_10", icon: "🎶", tier: "silver" },
  { id: "song_25", icon: "🎼", tier: "silver" },
  { id: "song_50", icon: "💿", tier: "gold" },
  { id: "song_100", icon: "📀", tier: "platinum" },
  { id: "battle_winner", icon: "⚔️", tier: "bronze" },
  { id: "battle_5_wins", icon: "🏆", tier: "silver" },
  { id: "battle_champ", icon: "👑", tier: "gold" },
  { id: "duet_star", icon: "👥", tier: "bronze" },
  { id: "party_host", icon: "🎉", tier: "bronze" },
  { id: "party_regular", icon: "🥳", tier: "silver" },
  { id: "streak_3", icon: "🔥", tier: "bronze" },
  { id: "streak_7", icon: "💥", tier: "silver" },
  { id: "streak_30", icon: "⚡", tier: "gold" },
  { id: "level_5", icon: "⭐", tier: "bronze" },
  { id: "level_10", icon: "🌟", tier: "silver" },
  { id: "level_20", icon: "✨", tier: "gold" },
  { id: "social_butterfly", icon: "🦋", tier: "bronze" },
  { id: "xp_1000", icon: "💎", tier: "silver" },
  { id: "xp_10000", icon: "🏅", tier: "gold" },
  { id: "xp_50000", icon: "🎖️", tier: "platinum" },
];

export interface AchievementDefinition {
  id: string;
  icon: string;
  target: number;
  xpReward: number;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  { id: "songs_created", icon: "🎤", target: 100, xpReward: 500 },
  { id: "battles_won", icon: "⚔️", target: 50, xpReward: 300 },
  { id: "duets_sung", icon: "👥", target: 25, xpReward: 200 },
  { id: "parties_hosted", icon: "🎉", target: 20, xpReward: 200 },
  { id: "parties_joined", icon: "🥳", target: 50, xpReward: 250 },
  { id: "clips_shared", icon: "📤", target: 30, xpReward: 150 },
  { id: "login_streak", icon: "🔥", target: 30, xpReward: 300 },
  { id: "total_xp", icon: "💎", target: 10000, xpReward: 500 },
];

export const LEVEL_TITLES: Record<number, string> = {
  1: "Beginner",
  2: "Novice",
  3: "Singer",
  4: "Vocalist",
  5: "Performer",
  6: "Artist",
  7: "Star",
  8: "Rising Star",
  9: "Sensation",
  10: "Superstar",
  11: "Icon",
  12: "Legend",
  13: "Maestro",
  14: "Virtuoso",
  15: "Prodigy",
  16: "Champion",
  17: "Grand Champion",
  18: "Elite",
  19: "Master",
  20: "Grand Master",
  21: "Supreme",
  22: "Mythic",
  23: "Immortal",
  24: "Divine",
  25: "Celestial",
  26: "Cosmic",
  27: "Transcendent",
  28: "Legendary",
  29: "Ultimate",
  30: "GOAT",
};
