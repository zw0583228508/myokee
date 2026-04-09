import { Router, type Request, type Response } from "express";
import { query } from "../db";

const router = Router();

function requireAuth(req: Request, res: Response): boolean {
  if (!(req as any).user) {
    res.status(401).json({ error: "Authentication required" });
    return false;
  }
  return true;
}

router.post("/social/follow/:userId", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const me = (req as any).user.id;
  const target = req.params.userId;

  if (me === target) return res.status(400).json({ error: "Cannot follow yourself" });

  try {
    const userExists = await query("SELECT id FROM users WHERE id = $1", [target]);
    if (userExists.rows.length === 0) return res.status(404).json({ error: "User not found" });

    await query(
      "INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [me, target]
    );
    return res.json({ success: true });
  } catch (err: any) {
    console.error("[Social] Follow error:", err.message);
    return res.status(500).json({ error: "Failed to follow user" });
  }
});

router.delete("/social/follow/:userId", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const me = (req as any).user.id;
  const target = req.params.userId;

  try {
    await query("DELETE FROM follows WHERE follower_id = $1 AND following_id = $2", [me, target]);
    return res.json({ success: true });
  } catch (err: any) {
    console.error("[Social] Unfollow error:", err.message);
    return res.status(500).json({ error: "Failed to unfollow user" });
  }
});

router.get("/social/feed", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const me = (req as any).user.id;
  const page = parseInt(req.query.page as string) || 0;
  const limit = 20;
  const offset = page * limit;

  try {
    const result = await query(
      `SELECT p.*, u.display_name, u.picture,
        EXISTS(SELECT 1 FROM performance_likes pl WHERE pl.performance_id = p.id AND pl.user_id = $1) as liked_by_me
       FROM performances p
       JOIN users u ON u.id = p.user_id
       WHERE p.is_public = true
         AND (p.user_id IN (SELECT following_id FROM follows WHERE follower_id = $1) OR p.user_id = $1)
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [me, limit, offset]
    );

    return res.json({ performances: result.rows, page, hasMore: result.rows.length === limit });
  } catch (err: any) {
    console.error("[Social] Feed error:", err.message);
    return res.status(500).json({ error: "Failed to fetch feed" });
  }
});

router.get("/social/discover", async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 0;
  const limit = 20;
  const offset = page * limit;
  const userId = (req as any).user?.id;

  try {
    const result = await query(
      `SELECT p.*, u.display_name, u.picture,
        ${userId ? `EXISTS(SELECT 1 FROM performance_likes pl WHERE pl.performance_id = p.id AND pl.user_id = $2) as liked_by_me` : `false as liked_by_me`}
       FROM performances p
       JOIN users u ON u.id = p.user_id
       WHERE p.is_public = true
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET ${userId ? '$3' : '$2'}`,
      userId ? [limit, userId, offset] : [limit, offset]
    );

    return res.json({ performances: result.rows, page, hasMore: result.rows.length === limit });
  } catch (err: any) {
    console.error("[Social] Discover error:", err.message);
    return res.status(500).json({ error: "Failed to fetch discover feed" });
  }
});

router.post("/social/like/:performanceId", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const me = (req as any).user.id;
  const perfId = parseInt(req.params.performanceId, 10);
  if (isNaN(perfId)) return res.status(400).json({ error: "Invalid performance ID" });

  try {
    const perf = await query(
      "SELECT id FROM performances WHERE id = $1 AND (is_public = true OR user_id = $2)",
      [perfId, me]
    );
    if (perf.rows.length === 0) return res.status(404).json({ error: "Performance not found" });

    const result = await query(
      "INSERT INTO performance_likes (user_id, performance_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *",
      [me, perfId]
    );
    if (result.rowCount && result.rowCount > 0) {
      await query("UPDATE performances SET like_count = like_count + 1 WHERE id = $1", [perfId]);
    }
    return res.json({ success: true });
  } catch (err: any) {
    console.error("[Social] Like error:", err.message);
    return res.status(500).json({ error: "Failed to like" });
  }
});

router.delete("/social/like/:performanceId", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const me = (req as any).user.id;
  const perfId = parseInt(req.params.performanceId, 10);
  if (isNaN(perfId)) return res.status(400).json({ error: "Invalid performance ID" });

  try {
    const result = await query(
      "DELETE FROM performance_likes WHERE user_id = $1 AND performance_id = $2",
      [me, perfId]
    );
    if (result.rowCount && result.rowCount > 0) {
      await query("UPDATE performances SET like_count = GREATEST(like_count - 1, 0) WHERE id = $1", [perfId]);
    }
    return res.json({ success: true });
  } catch (err: any) {
    console.error("[Social] Unlike error:", err.message);
    return res.status(500).json({ error: "Failed to unlike" });
  }
});

router.post("/social/comment/:performanceId", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const me = (req as any).user.id;
  const perfId = parseInt(req.params.performanceId, 10);
  if (isNaN(perfId)) return res.status(400).json({ error: "Invalid performance ID" });
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: "Comment content is required" });
  }

  if (content.length > 500) {
    return res.status(400).json({ error: "Comment too long (max 500 chars)" });
  }

  try {
    const perf = await query(
      "SELECT id FROM performances WHERE id = $1 AND (is_public = true OR user_id = $2)",
      [perfId, me]
    );
    if (perf.rows.length === 0) return res.status(404).json({ error: "Performance not found" });

    const result = await query(
      "INSERT INTO performance_comments (user_id, performance_id, content) VALUES ($1, $2, $3) RETURNING *",
      [me, perfId, content.trim()]
    );
    await query("UPDATE performances SET comment_count = comment_count + 1 WHERE id = $1", [perfId]);

    const user = await query("SELECT display_name, picture FROM users WHERE id = $1", [me]);

    return res.json({
      comment: {
        ...result.rows[0],
        display_name: user.rows[0]?.display_name,
        picture: user.rows[0]?.picture,
      },
    });
  } catch (err: any) {
    console.error("[Social] Comment error:", err.message);
    return res.status(500).json({ error: "Failed to add comment" });
  }
});

router.get("/social/comments/:performanceId", async (req: Request, res: Response) => {
  const perfId = parseInt(req.params.performanceId, 10);
  if (isNaN(perfId)) return res.status(400).json({ error: "Invalid performance ID" });
  const userId = (req as any).user?.id;

  try {
    const perf = await query(
      userId
        ? "SELECT id FROM performances WHERE id = $1 AND (is_public = true OR user_id = $2)"
        : "SELECT id FROM performances WHERE id = $1 AND is_public = true",
      userId ? [perfId, userId] : [perfId]
    );
    if (perf.rows.length === 0) return res.status(404).json({ error: "Performance not found" });

    const result = await query(
      `SELECT pc.*, u.display_name, u.picture
       FROM performance_comments pc
       JOIN users u ON u.id = pc.user_id
       WHERE pc.performance_id = $1
       ORDER BY pc.created_at ASC
       LIMIT 100`,
      [perfId]
    );
    return res.json({ comments: result.rows });
  } catch (err: any) {
    console.error("[Social] Comments error:", err.message);
    return res.status(500).json({ error: "Failed to fetch comments" });
  }
});

router.get("/social/profile/:userId", async (req: Request, res: Response) => {
  const targetId = req.params.userId;
  const myId = (req as any).user?.id;

  try {
    const user = await query(
      "SELECT id, display_name, picture, created_at FROM users WHERE id = $1",
      [targetId]
    );
    if (user.rows.length === 0) return res.status(404).json({ error: "User not found" });

    const [followers, following, perfCount, xp] = await Promise.all([
      query("SELECT COUNT(*) FROM follows WHERE following_id = $1", [targetId]),
      query("SELECT COUNT(*) FROM follows WHERE follower_id = $1", [targetId]),
      query("SELECT COUNT(*) FROM performances WHERE user_id = $1 AND is_public = true", [targetId]),
      query("SELECT total_xp, level FROM user_xp WHERE user_id = $1", [targetId]),
    ]);

    let isFollowing = false;
    if (myId && myId !== targetId) {
      const follow = await query(
        "SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2",
        [myId, targetId]
      );
      isFollowing = follow.rows.length > 0;
    }

    const recentPerfs = await query(
      `SELECT p.*, 
        ${myId ? `EXISTS(SELECT 1 FROM performance_likes pl WHERE pl.performance_id = p.id AND pl.user_id = $2) as liked_by_me` : `false as liked_by_me`}
       FROM performances p
       WHERE p.user_id = $1 AND p.is_public = true
       ORDER BY p.created_at DESC
       LIMIT 20`,
      myId ? [targetId, myId] : [targetId]
    );

    return res.json({
      user: user.rows[0],
      stats: {
        followers: parseInt(followers.rows[0].count, 10),
        following: parseInt(following.rows[0].count, 10),
        performances: parseInt(perfCount.rows[0].count, 10),
        totalXp: xp.rows[0]?.total_xp || 0,
        level: xp.rows[0]?.level || 1,
      },
      isFollowing,
      performances: recentPerfs.rows,
    });
  } catch (err: any) {
    console.error("[Social] Profile error:", err.message);
    return res.status(500).json({ error: "Failed to fetch profile" });
  }
});

export default router;
