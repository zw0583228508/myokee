/**
 * Feature flags — central on/off switches for optional product areas.
 *
 * To bring a feature back, simply flip its value to `true`.
 * No code was deleted anywhere; everything is only hidden behind these flags.
 */
export const FEATURES = {
  /** Party rooms, duet/battle modes, room leaderboards, social clips (/party) */
  party: false,
  /** Weekly challenges & tournaments (/challenges) */
  challenges: false,
  /** Community feed, follows, likes, comments, public profiles (/feed, /profile/:id) */
  socialFeed: false,
  /** Global score leaderboard (/leaderboard) */
  leaderboard: false,
  /** XP, levels, badges, achievements, streaks, XP leaderboard (/xp) */
  gamification: false,
  /** AI vocal coach page (/vocal-coach) */
  vocalCoach: false,
} as const;

export type FeatureKey = keyof typeof FEATURES;
