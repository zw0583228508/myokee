import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { XP_REWARDS, BADGES, ACHIEVEMENTS, LEVEL_TITLES } from "../gamification-constants";

const router = Router();

router.get("/gamification/profile", async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Authentication required" });
  const userId = (req.user as any).id;

  try {
    const streak = await storage.updateStreak(userId);
    await checkStreakBadges(userId, streak);

    const profile = await storage.getGamificationProfile(userId);
    profile.streakDays = streak;

    const levelTitle = LEVEL_TITLES[Math.min(profile.level, 30)] || "GOAT";

    res.json({
      ...profile,
      levelTitle,
      badgeDefinitions: BADGES,
      achievementDefinitions: ACHIEVEMENTS,
    });
  } catch (e: any) {
    console.error("[gamification] profile error:", e.message);
    res.status(500).json({ error: "Failed to load profile" });
  }
});

router.get("/gamification/leaderboard", async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Authentication required" });
  const userId = (req.user as any).id;
  const mode = (req.query.mode as "all" | "weekly") || "all";

  try {
    const leaderboard = await storage.getXPLeaderboard(mode, 100);

    const userRank = leaderboard.findIndex((e: any) => e.user_id === userId);

    res.json({
      leaderboard: leaderboard.map((entry: any, i: number) => ({
        rank: i + 1,
        userId: entry.user_id,
        displayName: entry.display_name || "Anonymous",
        picture: entry.picture,
        totalXP: entry.total_xp,
        weeklyXP: entry.weekly_xp,
        level: entry.level,
        streakDays: entry.streak_days,
        levelTitle: LEVEL_TITLES[Math.min(entry.level, 30)] || "GOAT",
        isYou: entry.user_id === userId,
      })),
      yourRank: userRank >= 0 ? userRank + 1 : null,
      mode,
    });
  } catch (e: any) {
    console.error("[gamification] leaderboard error:", e.message);
    res.status(500).json({ error: "Failed to load leaderboard" });
  }
});

const ACTION_COOLDOWNS: Record<string, number> = {
  daily_login: 86400,
  karaoke_created: 30,
  battle_won: 10,
  battle_played: 10,
  duet_completed: 30,
  party_hosted: 60,
  party_joined: 30,
  shared_clip: 30,
};

router.post("/gamification/award", async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Authentication required" });
  const userId = (req.user as any).id;
  const { action, metadata } = req.body;

  const xpMap: Record<string, number> = {
    karaoke_created: XP_REWARDS.KARAOKE_CREATED,
    battle_won: XP_REWARDS.BATTLE_WON,
    battle_played: XP_REWARDS.BATTLE_PLAYED,
    duet_completed: XP_REWARDS.DUET_COMPLETED,
    party_hosted: XP_REWARDS.PARTY_HOSTED,
    party_joined: XP_REWARDS.PARTY_JOINED,
    daily_login: XP_REWARDS.DAILY_LOGIN,
    shared_clip: XP_REWARDS.SHARED_CLIP,
  };

  const amount = xpMap[action];
  if (!amount) return res.status(400).json({ error: "Unknown action" });

  const cooldown = ACTION_COOLDOWNS[action] || 30;
  const isDuplicate = await storage.checkXPCooldown(userId, action, cooldown);
  if (isDuplicate) return res.status(429).json({ error: "Action too frequent" });

  try {
    const result = await storage.awardXP(userId, amount, action, metadata || {});

    await processAchievements(userId, action);
    await checkLevelBadges(userId, result.level);
    await checkXPBadges(userId, result.totalXP);

    res.json(result);
  } catch (e: any) {
    console.error("[gamification] award error:", e.message);
    res.status(500).json({ error: "Failed to award XP" });
  }
});

async function processAchievements(userId: string, action: string) {
  const achievementMap: Record<string, { id: string; target: number }> = {
    karaoke_created: { id: "songs_created", target: 100 },
    battle_won: { id: "battles_won", target: 50 },
    duet_completed: { id: "duets_sung", target: 25 },
    party_hosted: { id: "parties_hosted", target: 20 },
    party_joined: { id: "parties_joined", target: 50 },
    shared_clip: { id: "clips_shared", target: 30 },
  };

  const mapping = achievementMap[action];
  if (!mapping) return;

  const beforeRes = await storage.getAchievementRow(userId, mapping.id);
  const wasCompleted = beforeRes?.completed_at != null;

  const result = await storage.updateAchievementProgress(userId, mapping.id, 1, mapping.target);

  const justCompleted = result?.completed_at != null && !wasCompleted;
  if (justCompleted) {
    const achDef = ACHIEVEMENTS.find(a => a.id === mapping.id);
    if (achDef) {
      await storage.awardXP(userId, achDef.xpReward, `achievement_${mapping.id}`);
    }
  }

  if (action === "karaoke_created") {
    const count = result?.progress || 0;
    if (count >= 1) await storage.awardBadge(userId, "first_song");
    if (count >= 5) await storage.awardBadge(userId, "song_5");
    if (count >= 10) await storage.awardBadge(userId, "song_10");
    if (count >= 25) await storage.awardBadge(userId, "song_25");
    if (count >= 50) await storage.awardBadge(userId, "song_50");
    if (count >= 100) await storage.awardBadge(userId, "song_100");
  }

  if (action === "battle_won") {
    const count = result?.progress || 0;
    if (count >= 1) await storage.awardBadge(userId, "battle_winner");
    if (count >= 5) await storage.awardBadge(userId, "battle_5_wins");
    if (count >= 20) await storage.awardBadge(userId, "battle_champ");
  }

  if (action === "duet_completed") {
    await storage.awardBadge(userId, "duet_star");
  }

  if (action === "party_hosted") {
    await storage.awardBadge(userId, "party_host");
    const count = result?.progress || 0;
    if (count >= 10) await storage.awardBadge(userId, "party_regular");
  }

  if (action === "shared_clip") {
    const count = result?.progress || 0;
    if (count >= 5) await storage.awardBadge(userId, "social_butterfly");
  }
}

async function checkStreakBadges(userId: string, streak: number) {
  if (streak >= 3) await storage.awardBadge(userId, "streak_3");
  if (streak >= 7) await storage.awardBadge(userId, "streak_7");
  if (streak >= 30) await storage.awardBadge(userId, "streak_30");

  if (streak >= 1) {
    await storage.setAchievementProgress(userId, "login_streak", streak, 30);
  }
}

async function checkLevelBadges(userId: string, level: number) {
  if (level >= 5) await storage.awardBadge(userId, "level_5");
  if (level >= 10) await storage.awardBadge(userId, "level_10");
  if (level >= 20) await storage.awardBadge(userId, "level_20");
}

async function checkXPBadges(userId: string, totalXP: number) {
  if (totalXP >= 1000) await storage.awardBadge(userId, "xp_1000");
  if (totalXP >= 10000) await storage.awardBadge(userId, "xp_10000");
  if (totalXP >= 50000) await storage.awardBadge(userId, "xp_50000");
}

export default router;
