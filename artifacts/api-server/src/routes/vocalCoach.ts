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

interface VocalTip {
  category: "pitch" | "timing" | "coverage" | "overall";
  severity: "praise" | "suggestion" | "warning";
  tip: string;
  tipHe: string;
}

function generateTips(perf: {
  score: number;
  timing_score: number;
  pitch_score: number;
  words_covered: number;
  total_words: number;
}): VocalTip[] {
  const tips: VocalTip[] = [];
  const coverage = perf.total_words > 0 ? (perf.words_covered / perf.total_words) * 100 : 0;

  if (perf.pitch_score >= 90) {
    tips.push({ category: "pitch", severity: "praise", tip: "Excellent pitch accuracy! Your intonation is nearly perfect.", tipHe: "דיוק טון מעולה! האינטונציה שלך כמעט מושלמת." });
  } else if (perf.pitch_score >= 70) {
    tips.push({ category: "pitch", severity: "suggestion", tip: "Good pitch overall. Try warming up with scales before singing to improve consistency.", tipHe: "טון טוב באופן כללי. נסה לחמם עם סולמות לפני שירה כדי לשפר עקביות." });
  } else if (perf.pitch_score >= 50) {
    tips.push({ category: "pitch", severity: "suggestion", tip: "Focus on the melody line. Try singing along with the original track a few times before going solo.", tipHe: "התמקד בקו המלודי. נסה לשיר יחד עם השיר המקורי כמה פעמים לפני שרה סולו." });
  } else {
    tips.push({ category: "pitch", severity: "warning", tip: "Work on pitch control. Try humming the melody first, then gradually add the lyrics.", tipHe: "עבוד על שליטה בטון. נסה לזמזם את המלודיה קודם, ואז הוסף בהדרגה את המילים." });
  }

  if (perf.timing_score >= 90) {
    tips.push({ category: "timing", severity: "praise", tip: "Perfect timing! You're right on beat with the music.", tipHe: "תזמון מושלם! אתה בדיוק על הקצב עם המוזיקה." });
  } else if (perf.timing_score >= 70) {
    tips.push({ category: "timing", severity: "suggestion", tip: "Good rhythm sense. Practice tapping the beat with your foot while singing for better sync.", tipHe: "חוש קצב טוב. תרגל לדפוק את הקצב עם הרגל בזמן שירה לסנכרון טוב יותר." });
  } else if (perf.timing_score >= 50) {
    tips.push({ category: "timing", severity: "suggestion", tip: "Try listening to the instrumental track more carefully. Pay attention to when each line starts.", tipHe: "נסה להקשיב לפסקול הנגינה בקפידה יותר. שים לב מתי כל שורה מתחילה." });
  } else {
    tips.push({ category: "timing", severity: "warning", tip: "Timing needs work. Start by clapping along to the beat, then try singing shorter phrases.", tipHe: "תזמון דורש עבודה. התחל במחיאות כפיים עם הקצב, ואז נסה לשיר משפטים קצרים." });
  }

  if (coverage >= 90) {
    tips.push({ category: "coverage", severity: "praise", tip: "Great lyric coverage! You sang almost every word.", tipHe: "כיסוי מילים מעולה! שרת כמעט כל מילה." });
  } else if (coverage >= 60) {
    tips.push({ category: "coverage", severity: "suggestion", tip: "Try to learn the lyrics better. Reading them a few times before singing helps a lot.", tipHe: "נסה ללמוד את המילים טוב יותר. לקרוא אותן כמה פעמים לפני שירה עוזר מאוד." });
  } else {
    tips.push({ category: "coverage", severity: "warning", tip: "Practice the lyrics! Knowing the words is the foundation of a great performance.", tipHe: "תרגל את המילים! ידיעת המילים היא הבסיס לביצוע מעולה." });
  }

  if (perf.score >= 90) {
    tips.push({ category: "overall", severity: "praise", tip: "Outstanding performance! You're a natural star. Keep it up!", tipHe: "ביצוע יוצא מן הכלל! אתה כוכב טבעי. המשך כך!" });
  } else if (perf.score >= 70) {
    tips.push({ category: "overall", severity: "suggestion", tip: "Solid performance! With a bit more practice, you could hit 90+. Try recording yourself and listening back.", tipHe: "ביצוע מוצק! עם קצת יותר תרגול, אתה יכול להגיע ל-90+. נסה להקליט את עצמך ולהקשיב." });
  } else if (perf.score >= 50) {
    tips.push({ category: "overall", severity: "suggestion", tip: "Good effort! Focus on one aspect at a time — pitch or timing — rather than trying to fix everything at once.", tipHe: "מאמץ טוב! התמקד בהיבט אחד בכל פעם — טון או תזמון — במקום לנסות לתקן הכל בבת אחת." });
  } else {
    tips.push({ category: "overall", severity: "warning", tip: "Everyone starts somewhere! Choose an easier song and practice it until you feel comfortable.", tipHe: "כולם מתחילים מאיפשהו! בחר שיר קל יותר ותרגל אותו עד שתרגיש בנוח." });
  }

  return tips;
}

router.get("/vocal-coach/:performanceId", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const userId = (req as any).user.id;
  const perfId = parseInt(req.params.performanceId, 10);

  try {
    const perf = await query(
      "SELECT * FROM performances WHERE id = $1 AND user_id = $2",
      [perfId, userId]
    );
    if (perf.rows.length === 0) {
      return res.status(404).json({ error: "Performance not found" });
    }

    const p = perf.rows[0];
    const tips = generateTips({
      score: p.score || 0,
      timing_score: p.timing_score || 0,
      pitch_score: p.pitch_score || 0,
      words_covered: p.words_covered || 0,
      total_words: p.total_words || 0,
    });

    return res.json({ tips, performance: p });
  } catch (err: any) {
    console.error("[VocalCoach] Tips error:", err.message);
    return res.status(500).json({ error: "Failed to generate tips" });
  }
});

router.get("/vocal-coach/progress/me", async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;
  const userId = (req as any).user.id;

  try {
    const result = await query(
      `SELECT id, song_name, score, timing_score, pitch_score, words_covered, total_words, created_at
       FROM performances
       WHERE user_id = $1
       ORDER BY created_at ASC
       LIMIT 50`,
      [userId]
    );

    const performances = result.rows;
    if (performances.length === 0) {
      return res.json({ performances: [], stats: null });
    }

    const avgScore = performances.reduce((s: number, p: any) => s + (p.score || 0), 0) / performances.length;
    const avgPitch = performances.reduce((s: number, p: any) => s + (p.pitch_score || 0), 0) / performances.length;
    const avgTiming = performances.reduce((s: number, p: any) => s + (p.timing_score || 0), 0) / performances.length;
    const bestScore = Math.max(...performances.map((p: any) => p.score || 0));

    const recentPerfs = performances.slice(-5);
    const earlyPerfs = performances.slice(0, 5);
    const recentAvg = recentPerfs.reduce((s: number, p: any) => s + (p.score || 0), 0) / recentPerfs.length;
    const earlyAvg = earlyPerfs.reduce((s: number, p: any) => s + (p.score || 0), 0) / earlyPerfs.length;
    const improvement = Math.round(recentAvg - earlyAvg);

    return res.json({
      performances,
      stats: {
        totalPerformances: performances.length,
        avgScore: Math.round(avgScore),
        avgPitch: Math.round(avgPitch),
        avgTiming: Math.round(avgTiming),
        bestScore,
        improvement,
      },
    });
  } catch (err: any) {
    console.error("[VocalCoach] Progress error:", err.message);
    return res.status(500).json({ error: "Failed to fetch progress" });
  }
});

export default router;
