import { Router } from "express";
import { query } from "../db";

const router = Router();

router.get("/analytics/overview", async (_req, res) => {
  try {
    const [
      usersResult,
      jobsResult,
      revenueResult,
      activeToday,
      performancesResult,
      partiesResult,
    ] = await Promise.all([
      query(`SELECT COUNT(*) as total, 
             COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as last_7d,
             COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as last_30d
             FROM users`),
      query(`SELECT COUNT(*) as total,
             COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as last_7d,
             COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as last_30d,
             COALESCE(AVG(duration_seconds), 0) as avg_duration
             FROM job_ownership`),
      query(`SELECT 
             COALESCE(SUM(credits_added), 0) as total_stripe,
             COUNT(*) as stripe_count
             FROM fulfilled_sessions WHERE credits_added > 0`),
      query(`SELECT COUNT(DISTINCT user_id) as count FROM job_ownership WHERE created_at >= NOW() - INTERVAL '1 day'`),
      query(`SELECT COUNT(*) as total, COALESCE(AVG(score), 0) as avg_score FROM performances`),
      query(`SELECT COUNT(*) as total FROM party_rooms`),
    ]);

    const paypalResult = await query(
      `SELECT COALESCE(SUM(credits), 0) as total_paypal, COUNT(*) as paypal_count FROM pending_paypal_orders WHERE status = 'completed'`
    );

    res.json({
      users: {
        total: parseInt(usersResult.rows[0].total),
        last7d: parseInt(usersResult.rows[0].last_7d),
        last30d: parseInt(usersResult.rows[0].last_30d),
      },
      jobs: {
        total: parseInt(jobsResult.rows[0].total),
        last7d: parseInt(jobsResult.rows[0].last_7d),
        last30d: parseInt(jobsResult.rows[0].last_30d),
        avgDuration: parseFloat(jobsResult.rows[0].avg_duration),
      },
      revenue: {
        totalStripeCredits: parseInt(revenueResult.rows[0].total_stripe),
        stripeTransactions: parseInt(revenueResult.rows[0].stripe_count),
        totalPaypalCredits: parseInt(paypalResult.rows[0].total_paypal),
        paypalTransactions: parseInt(paypalResult.rows[0].paypal_count),
      },
      activeUsersToday: parseInt(activeToday.rows[0].count),
      performances: {
        total: parseInt(performancesResult.rows[0].total),
        avgScore: parseFloat(performancesResult.rows[0].avg_score),
      },
      parties: {
        total: parseInt(partiesResult.rows[0].total),
      },
    });
  } catch (err: any) {
    console.error("[analytics] overview error:", err.message);
    res.status(500).json({ error: "Failed to fetch overview" });
  }
});

router.get("/analytics/users-over-time", async (_req, res) => {
  try {
    const result = await query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM users
      WHERE created_at >= NOW() - INTERVAL '90 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);
    res.json(result.rows.map((r: any) => ({ date: r.date, count: parseInt(r.count) })));
  } catch (err: any) {
    console.error("[analytics] users-over-time error:", err.message);
    res.status(500).json({ error: "Failed to fetch users over time" });
  }
});

router.get("/analytics/jobs-over-time", async (_req, res) => {
  try {
    const result = await query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM job_ownership
      WHERE created_at >= NOW() - INTERVAL '90 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);
    res.json(result.rows.map((r: any) => ({ date: r.date, count: parseInt(r.count) })));
  } catch (err: any) {
    console.error("[analytics] jobs-over-time error:", err.message);
    res.status(500).json({ error: "Failed to fetch jobs over time" });
  }
});

router.get("/analytics/top-users", async (_req, res) => {
  try {
    const result = await query(`
      SELECT u.id, u.display_name, u.email, u.credits, u.created_at,
             COUNT(j.job_id) as job_count,
             COALESCE(SUM(j.credits_charged), 0) as total_credits_used
      FROM users u
      LEFT JOIN job_ownership j ON j.user_id = u.id
      GROUP BY u.id, u.display_name, u.email, u.credits, u.created_at
      ORDER BY job_count DESC
      LIMIT 50
    `);
    res.json(result.rows.map((r: any) => ({
      id: r.id,
      displayName: r.display_name || r.email || r.id,
      email: r.email,
      credits: parseInt(r.credits),
      createdAt: r.created_at,
      jobCount: parseInt(r.job_count),
      totalCreditsUsed: parseInt(r.total_credits_used),
    })));
  } catch (err: any) {
    console.error("[analytics] top-users error:", err.message);
    res.status(500).json({ error: "Failed to fetch top users" });
  }
});

router.get("/analytics/recent-jobs", async (_req, res) => {
  try {
    const result = await query(`
      SELECT j.job_id, j.user_id, j.duration_seconds, j.credits_charged, j.created_at,
             u.display_name, u.email
      FROM job_ownership j
      LEFT JOIN users u ON u.id = j.user_id
      ORDER BY j.created_at DESC
      LIMIT 100
    `);
    res.json(result.rows.map((r: any) => ({
      jobId: r.job_id,
      userId: r.user_id,
      userName: r.display_name || r.email || r.user_id,
      durationSeconds: parseFloat(r.duration_seconds || 0),
      creditsCharged: parseInt(r.credits_charged || 0),
      createdAt: r.created_at,
    })));
  } catch (err: any) {
    console.error("[analytics] recent-jobs error:", err.message);
    res.status(500).json({ error: "Failed to fetch recent jobs" });
  }
});

router.get("/analytics/revenue-over-time", async (_req, res) => {
  try {
    const [stripeResult, paypalResult] = await Promise.all([
      query(`
        SELECT DATE(fulfilled_at) as date, SUM(credits_added) as credits, COUNT(*) as transactions
        FROM fulfilled_sessions
        WHERE fulfilled_at >= NOW() - INTERVAL '90 days'
        GROUP BY DATE(fulfilled_at)
        ORDER BY date ASC
      `),
      query(`
        SELECT DATE(created_at) as date, SUM(credits) as credits, COUNT(*) as transactions
        FROM pending_paypal_orders
        WHERE status = 'completed' AND created_at >= NOW() - INTERVAL '90 days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `),
    ]);

    const dateMap: Record<string, { date: string; stripe: number; paypal: number; total: number }> = {};

    for (const r of stripeResult.rows) {
      const d = r.date?.toISOString?.()?.slice(0, 10) || String(r.date);
      if (!dateMap[d]) dateMap[d] = { date: d, stripe: 0, paypal: 0, total: 0 };
      dateMap[d].stripe = parseInt(r.credits);
      dateMap[d].total += parseInt(r.credits);
    }
    for (const r of paypalResult.rows) {
      const d = r.date?.toISOString?.()?.slice(0, 10) || String(r.date);
      if (!dateMap[d]) dateMap[d] = { date: d, stripe: 0, paypal: 0, total: 0 };
      dateMap[d].paypal = parseInt(r.credits);
      dateMap[d].total += parseInt(r.credits);
    }

    const sorted = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
    res.json(sorted);
  } catch (err: any) {
    console.error("[analytics] revenue-over-time error:", err.message);
    res.status(500).json({ error: "Failed to fetch revenue over time" });
  }
});

router.get("/analytics/gamification", async (_req, res) => {
  try {
    const [xpResult, badgesResult, achievementsResult, xpLogResult] = await Promise.all([
      query(`
        SELECT COUNT(*) as total_users, 
               COALESCE(AVG(total_xp), 0) as avg_xp, 
               COALESCE(MAX(total_xp), 0) as max_xp,
               COALESCE(AVG(level), 0) as avg_level,
               COALESCE(MAX(level), 0) as max_level,
               COALESCE(AVG(streak_days), 0) as avg_streak,
               COALESCE(MAX(streak_days), 0) as max_streak
        FROM user_xp
      `),
      query(`SELECT badge_id, COUNT(*) as count FROM user_badges GROUP BY badge_id ORDER BY count DESC`),
      query(`SELECT achievement_id, COUNT(*) as total, COUNT(completed_at) as completed FROM user_achievements GROUP BY achievement_id ORDER BY total DESC`),
      query(`
        SELECT reason, COUNT(*) as count, SUM(amount) as total_xp
        FROM xp_log
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY reason
        ORDER BY total_xp DESC
      `),
    ]);

    res.json({
      xp: {
        totalUsers: parseInt(xpResult.rows[0]?.total_users || "0"),
        avgXp: parseFloat(xpResult.rows[0]?.avg_xp || "0"),
        maxXp: parseInt(xpResult.rows[0]?.max_xp || "0"),
        avgLevel: parseFloat(xpResult.rows[0]?.avg_level || "0"),
        maxLevel: parseInt(xpResult.rows[0]?.max_level || "0"),
        avgStreak: parseFloat(xpResult.rows[0]?.avg_streak || "0"),
        maxStreak: parseInt(xpResult.rows[0]?.max_streak || "0"),
      },
      badges: badgesResult.rows.map((r: any) => ({
        badgeId: r.badge_id,
        count: parseInt(r.count),
      })),
      achievements: achievementsResult.rows.map((r: any) => ({
        achievementId: r.achievement_id,
        total: parseInt(r.total),
        completed: parseInt(r.completed),
      })),
      xpActions: xpLogResult.rows.map((r: any) => ({
        reason: r.reason,
        count: parseInt(r.count),
        totalXp: parseInt(r.total_xp),
      })),
    });
  } catch (err: any) {
    console.error("[analytics] gamification error:", err.message);
    res.status(500).json({ error: "Failed to fetch gamification data" });
  }
});

router.get("/analytics/performances", async (_req, res) => {
  try {
    const [distribution, topScores, overTime] = await Promise.all([
      query(`
        SELECT 
          CASE 
            WHEN score >= 90 THEN '90-100'
            WHEN score >= 80 THEN '80-89'
            WHEN score >= 70 THEN '70-79'
            WHEN score >= 60 THEN '60-69'
            WHEN score >= 50 THEN '50-59'
            ELSE 'Below 50'
          END as range,
          COUNT(*) as count
        FROM performances
        WHERE score IS NOT NULL
        GROUP BY range
        ORDER BY range DESC
      `),
      query(`
        SELECT p.score, p.created_at, u.display_name, u.email
        FROM performances p
        LEFT JOIN users u ON u.id = p.user_id
        WHERE p.score IS NOT NULL
        ORDER BY p.score DESC
        LIMIT 20
      `),
      query(`
        SELECT DATE(created_at) as date, COUNT(*) as count, COALESCE(AVG(score), 0) as avg_score
        FROM performances
        WHERE created_at >= NOW() - INTERVAL '90 days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `),
    ]);

    res.json({
      distribution: distribution.rows.map((r: any) => ({
        range: r.range,
        count: parseInt(r.count),
      })),
      topScores: topScores.rows.map((r: any) => ({
        score: parseInt(r.score),
        userName: r.display_name || r.email || "Unknown",
        createdAt: r.created_at,
      })),
      overTime: overTime.rows.map((r: any) => ({
        date: r.date,
        count: parseInt(r.count),
        avgScore: parseFloat(r.avg_score),
      })),
    });
  } catch (err: any) {
    console.error("[analytics] performances error:", err.message);
    res.status(500).json({ error: "Failed to fetch performances" });
  }
});

router.get("/analytics/referrals", async (_req, res) => {
  try {
    const [summary, topReferrers] = await Promise.all([
      query(`
        SELECT COUNT(*) as total_referrals, COALESCE(SUM(credits_awarded), 0) as total_credits
        FROM referrals
      `),
      query(`
        SELECT r.referrer_id, u.display_name, u.email, COUNT(*) as referral_count, SUM(r.credits_awarded) as total_credits
        FROM referrals r
        LEFT JOIN users u ON u.id = r.referrer_id
        GROUP BY r.referrer_id, u.display_name, u.email
        ORDER BY referral_count DESC
        LIMIT 20
      `),
    ]);

    res.json({
      totalReferrals: parseInt(summary.rows[0]?.total_referrals || "0"),
      totalCreditsAwarded: parseInt(summary.rows[0]?.total_credits || "0"),
      topReferrers: topReferrers.rows.map((r: any) => ({
        userId: r.referrer_id,
        name: r.display_name || r.email || r.referrer_id,
        referralCount: parseInt(r.referral_count),
        totalCredits: parseInt(r.total_credits),
      })),
    });
  } catch (err: any) {
    console.error("[analytics] referrals error:", err.message);
    res.status(500).json({ error: "Failed to fetch referrals" });
  }
});

router.get("/analytics/parties", async (_req, res) => {
  try {
    const [summary, recentRooms] = await Promise.all([
      query(`
        SELECT 
          COUNT(*) as total_rooms,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_rooms,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as rooms_last_7d
        FROM party_rooms
      `),
      query(`
        SELECT r.id, r.name, r.code, r.status, r.created_at, u.display_name as host_name,
               (SELECT COUNT(*) FROM party_members pm WHERE pm.room_id = r.id) as member_count,
               (SELECT COUNT(*) FROM party_queue pq WHERE pq.room_id = r.id) as queue_size
        FROM party_rooms r
        LEFT JOIN users u ON u.id = r.host_user_id
        ORDER BY r.created_at DESC
        LIMIT 20
      `),
    ]);

    res.json({
      totalRooms: parseInt(summary.rows[0]?.total_rooms || "0"),
      activeRooms: parseInt(summary.rows[0]?.active_rooms || "0"),
      roomsLast7d: parseInt(summary.rows[0]?.rooms_last_7d || "0"),
      recentRooms: recentRooms.rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        code: r.code,
        status: r.status,
        hostName: r.host_name || "Unknown",
        memberCount: parseInt(r.member_count),
        queueSize: parseInt(r.queue_size),
        createdAt: r.created_at,
      })),
    });
  } catch (err: any) {
    console.error("[analytics] parties error:", err.message);
    res.status(500).json({ error: "Failed to fetch parties" });
  }
});

router.get("/analytics/credits-distribution", async (_req, res) => {
  try {
    const result = await query(`
      SELECT 
        CASE 
          WHEN credits = 0 THEN '0'
          WHEN credits BETWEEN 1 AND 5 THEN '1-5'
          WHEN credits BETWEEN 6 AND 20 THEN '6-20'
          WHEN credits BETWEEN 21 AND 50 THEN '21-50'
          ELSE '50+'
        END as range,
        COUNT(*) as count
      FROM users
      GROUP BY range
      ORDER BY range
    `);
    res.json(result.rows.map((r: any) => ({ range: r.range, count: parseInt(r.count) })));
  } catch (err: any) {
    console.error("[analytics] credits-distribution error:", err.message);
    res.status(500).json({ error: "Failed to fetch credits distribution" });
  }
});

export default router;
