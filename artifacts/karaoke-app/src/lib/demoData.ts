/**
 * Demo data shown across the community / leaderboard / challenges /
 * gamification / recordings / history / party screens when the database
 * has no real entries yet — so first-time visitors see a lively, working
 * app instead of empty states.
 *
 * Demo items are tagged with `is_demo: true`. Interactive handlers
 * (likes / comments / follow / enter-challenge / queue actions) treat
 * them as visual-only and never hit the API.
 */

export type DemoPerformance = {
  id: number;
  user_id: string;
  display_name: string;
  picture: string | null;
  song_name: string;
  score: number;
  pitch_score: number;
  timing_score: number;
  like_count: number;
  comment_count: number;
  liked_by_me: boolean;
  is_public: true;
  is_demo: true;
  created_at: string;
};

const daysAgo = (n: number, hours = 0) =>
  new Date(Date.now() - n * 86400_000 - hours * 3600_000).toISOString();

const SINGERS: Array<{ id: string; name: string; pic: string | null }> = [
  { id: "demo-1", name: "Maya Stern", pic: "https://i.pravatar.cc/120?img=47" },
  { id: "demo-2", name: "Daniel Cohen", pic: "https://i.pravatar.cc/120?img=12" },
  { id: "demo-3", name: "نور الهدى", pic: "https://i.pravatar.cc/120?img=49" },
  { id: "demo-4", name: "Sofia Rivera", pic: "https://i.pravatar.cc/120?img=45" },
  { id: "demo-5", name: "Liam Park", pic: "https://i.pravatar.cc/120?img=33" },
  { id: "demo-6", name: "유진 김", pic: "https://i.pravatar.cc/120?img=20" },
  { id: "demo-7", name: "Aria Müller", pic: "https://i.pravatar.cc/120?img=44" },
  { id: "demo-8", name: "Tomer Levi", pic: "https://i.pravatar.cc/120?img=15" },
  { id: "demo-9", name: "Mei Tanaka", pic: "https://i.pravatar.cc/120?img=32" },
  { id: "demo-10", name: "Ben Avraham", pic: "https://i.pravatar.cc/120?img=8" },
  { id: "demo-11", name: "Noor Hassan", pic: "https://i.pravatar.cc/120?img=29" },
  { id: "demo-12", name: "Camila Rojas", pic: "https://i.pravatar.cc/120?img=36" },
];

const SONGS = [
  "Shallow — Lady Gaga & Bradley Cooper",
  "Bohemian Rhapsody — Queen",
  "אהבת חיי — אייל גולן",
  "حبيبي يا نور العين — عمرو دياب",
  "Believer — Imagine Dragons",
  "Despacito — Luis Fonsi",
  "Rolling in the Deep — Adele",
  "Dynamite — BTS",
  "Perfect — Ed Sheeran",
  "ערב טוב — נועה קירל",
  "Lose Yourself — Eminem",
  "Senorita — Shawn Mendes",
];

const SCORES = [98, 96, 94, 92, 91, 89, 87, 85, 83, 81, 79, 76];

export const DEMO_PERFORMANCES: DemoPerformance[] = SINGERS.map((s, i) => ({
  id: 900_000 + i,
  user_id: s.id,
  display_name: s.name,
  picture: s.pic,
  song_name: SONGS[i % SONGS.length],
  score: SCORES[i],
  pitch_score: Math.max(60, SCORES[i] - 3 - (i % 5)),
  timing_score: Math.max(60, SCORES[i] - 1 - (i % 4)),
  like_count: 1240 - i * 73 + (i % 3) * 17,
  comment_count: 86 - i * 5 + (i % 4) * 3,
  liked_by_me: false,
  is_public: true,
  is_demo: true,
  created_at: daysAgo(Math.floor(i / 2), (i * 5) % 23),
}));

/* ---------- following feed (subset of singers, different ordering) ----- */

export const DEMO_FOLLOWING_FEED: DemoPerformance[] = [0, 2, 4, 6, 8, 10].map(
  (idx, i) => ({
    ...DEMO_PERFORMANCES[idx],
    id: 910_000 + i,
    // a couple already liked to look believable in "Following"
    liked_by_me: i % 3 === 0,
    created_at: daysAgo(i, (i * 7) % 23),
  })
);

/* ---------- challenges ------------------------------------------------- */

export type DemoChallenge = {
  id: number;
  title: string;
  description: string;
  song_name: string;
  status: "active" | "upcoming" | "ended";
  prize_credits: number;
  entry_count: number;
  end_date: string;
  start_date: string;
  hasEntered: false;
  is_demo: true;
};

export const DEMO_CHALLENGES: DemoChallenge[] = [
  {
    id: 990_001,
    title: "Power Ballad Week",
    description: "Bring your strongest vocals — long high notes and heart.",
    song_name: "Shallow — Lady Gaga & Bradley Cooper",
    status: "active",
    prize_credits: 200,
    entry_count: 1284,
    start_date: daysAgo(2),
    end_date: daysAgo(-5),
    hasEntered: false,
    is_demo: true,
  },
  {
    id: 990_002,
    title: "Hebrew Hits Challenge",
    description: "שירו את הלהיט הישראלי האהוב עליכם.",
    song_name: "אהבת חיי — אייל גולן",
    status: "active",
    prize_credits: 150,
    entry_count: 642,
    start_date: daysAgo(1),
    end_date: daysAgo(-3),
    hasEntered: false,
    is_demo: true,
  },
  {
    id: 990_003,
    title: "K-Pop Showdown",
    description: "Match the energy. Match the moves. Match the score.",
    song_name: "Dynamite — BTS",
    status: "upcoming",
    prize_credits: 250,
    entry_count: 0,
    start_date: daysAgo(-3),
    end_date: daysAgo(-10),
    hasEntered: false,
    is_demo: true,
  },
  {
    id: 990_004,
    title: "Classic Rock Legends",
    description: "Channel your inner Freddie. The crowd is watching.",
    song_name: "Bohemian Rhapsody — Queen",
    status: "ended",
    prize_credits: 200,
    entry_count: 2117,
    start_date: daysAgo(14),
    end_date: daysAgo(7),
    hasEntered: false,
    is_demo: true,
  },
];

/** Build a demo challenge-detail payload (leaderboard rows for the modal). */
export function buildDemoChallengeDetail(id: number) {
  const challenge =
    DEMO_CHALLENGES.find((c) => c.id === id) || DEMO_CHALLENGES[0];
  const leaderboard = SINGERS.slice(0, 8).map((s, i) => ({
    user_id: s.id,
    display_name: s.name,
    picture: s.pic,
    score: SCORES[i],
  }));
  return { challenge, leaderboard, myEntry: null, is_demo: true };
}

/* ---------- leaderboard rows (re-uses singer pool) --------------------- */

export type DemoLeaderRow = {
  id: number;
  user_id: string;
  display_name: string;
  picture: string | null;
  song_name: string;
  score: number;
  timing_score: number;
  pitch_score: number;
  words_covered: number;
  total_words: number;
  job_id: string;
  created_at: string;
  is_demo: true;
};

export const DEMO_LEADERBOARD: DemoLeaderRow[] = SINGERS.slice(0, 10).map((s, i) => ({
  id: 800_000 + i,
  user_id: s.id,
  display_name: s.name,
  picture: s.pic,
  song_name: SONGS[i % SONGS.length],
  score: SCORES[i],
  timing_score: Math.max(60, SCORES[i] - 1 - (i % 4)),
  pitch_score: Math.max(60, SCORES[i] - 3 - (i % 5)),
  words_covered: 120 - i * 4,
  total_words: 132,
  job_id: `demo-${i}`,
  created_at: daysAgo(Math.floor(i / 2), (i * 5) % 23),
  is_demo: true,
}));

/* ---------- XP leaderboard -------------------------------------------- */

const LEVEL_TITLES = [
  "Rising Star", "Crowd Pleaser", "Stage Veteran", "Mic Master",
  "Vocal Wizard", "Headliner", "Showstopper", "Local Legend",
  "Chart Topper", "Hall of Famer",
];

const LEVELS = [27, 24, 22, 19, 17, 15, 12, 10, 8, 6];
const TOTAL_XP = [48200, 38100, 31650, 24900, 20300, 16450, 12800, 9650, 7100, 4850];
const WEEKLY_XP = [2840, 2310, 1980, 1620, 1480, 1240, 1050, 870, 720, 540];
const STREAKS = [28, 14, 7, 21, 4, 9, 3, 12, 5, 2];

export function buildDemoXPLeaderboard(mode: "all" | "weekly" = "all") {
  const leaderboard = SINGERS.slice(0, 10).map((s, i) => ({
    rank: i + 1,
    userId: s.id,
    displayName: s.name,
    picture: s.pic,
    level: LEVELS[i],
    levelTitle: LEVEL_TITLES[i],
    totalXP: TOTAL_XP[i],
    weeklyXP: WEEKLY_XP[i],
    streakDays: STREAKS[i],
    isYou: false,
  }));
  // sort weekly if needed
  if (mode === "weekly") {
    leaderboard.sort((a, b) => b.weeklyXP - a.weeklyXP);
    leaderboard.forEach((e, i) => (e.rank = i + 1));
  }
  return { leaderboard, yourRank: null, is_demo: true };
}

/* ---------- "Me" performances on the leaderboard --------------------- */

export const DEMO_MY_PERFORMANCES = [
  { id: 850_001, score: 94, timing_score: 92, pitch_score: 91, words_covered: 128, total_words: 132, song_name: "Perfect — Ed Sheeran", job_id: "demo-mp-1", created_at: daysAgo(0, 2), display_name: "You", picture: undefined as string | undefined, is_public: true, is_demo: true },
  { id: 850_002, score: 88, timing_score: 86, pitch_score: 87, words_covered: 122, total_words: 130, song_name: "Believer — Imagine Dragons", job_id: "demo-mp-2", created_at: daysAgo(1, 4), display_name: "You", picture: undefined, is_public: false, is_demo: true },
  { id: 850_003, score: 81, timing_score: 79, pitch_score: 82, words_covered: 110, total_words: 128, song_name: "Senorita — Shawn Mendes", job_id: "demo-mp-3", created_at: daysAgo(3, 1), display_name: "You", picture: undefined, is_public: true, is_demo: true },
];

/* ---------- gamification profile ------------------------------------- */

const DEMO_BADGE_DEFS = [
  { id: "first_song", icon: "🎤", tier: "bronze" as const },
  { id: "song_5", icon: "🎵", tier: "bronze" as const },
  { id: "song_10", icon: "🎶", tier: "silver" as const },
  { id: "song_25", icon: "🎼", tier: "silver" as const },
  { id: "song_50", icon: "💿", tier: "gold" as const },
  { id: "song_100", icon: "📀", tier: "platinum" as const },
  { id: "battle_winner", icon: "⚔️", tier: "bronze" as const },
  { id: "battle_5_wins", icon: "🏆", tier: "silver" as const },
  { id: "battle_champ", icon: "👑", tier: "gold" as const },
  { id: "duet_star", icon: "👥", tier: "bronze" as const },
  { id: "party_host", icon: "🎉", tier: "bronze" as const },
  { id: "party_regular", icon: "🥳", tier: "silver" as const },
  { id: "streak_3", icon: "🔥", tier: "bronze" as const },
  { id: "streak_7", icon: "💥", tier: "silver" as const },
  { id: "streak_30", icon: "⚡", tier: "gold" as const },
  { id: "level_5", icon: "⭐", tier: "bronze" as const },
  { id: "level_10", icon: "🌟", tier: "silver" as const },
  { id: "level_20", icon: "✨", tier: "gold" as const },
  { id: "social_butterfly", icon: "🦋", tier: "bronze" as const },
  { id: "xp_1000", icon: "💎", tier: "silver" as const },
  { id: "xp_10000", icon: "🏅", tier: "gold" as const },
  { id: "xp_50000", icon: "🎖️", tier: "platinum" as const },
];

const DEMO_ACH_DEFS = [
  { id: "songs_created", icon: "🎤", target: 100, xpReward: 500 },
  { id: "battles_won", icon: "⚔️", target: 50, xpReward: 400 },
  { id: "duets_sung", icon: "👥", target: 25, xpReward: 300 },
  { id: "parties_hosted", icon: "🎉", target: 20, xpReward: 350 },
  { id: "parties_joined", icon: "🥳", target: 50, xpReward: 250 },
  { id: "clips_shared", icon: "📤", target: 30, xpReward: 200 },
  { id: "login_streak", icon: "🔥", target: 30, xpReward: 600 },
  { id: "total_xp", icon: "✨", target: 10000, xpReward: 1000 },
];

export function buildDemoGamificationProfile() {
  return {
    totalXP: 1850,
    level: 4,
    levelTitle: "Crowd Pleaser",
    weeklyXP: 320,
    streakDays: 3,
    xpForCurrentLevel: 1500,
    xpForNextLevel: 3000,
    badges: [
      { badge_id: "first_song", earned_at: daysAgo(6) },
      { badge_id: "song_5", earned_at: daysAgo(2) },
      { badge_id: "streak_3", earned_at: daysAgo(1) },
      { badge_id: "social_butterfly", earned_at: daysAgo(4) },
    ],
    badgeDefinitions: DEMO_BADGE_DEFS,
    achievements: [
      { achievement_id: "songs_created", progress: 7, target: 100, completed_at: null },
      { achievement_id: "duets_sung", progress: 3, target: 25, completed_at: null },
      { achievement_id: "parties_joined", progress: 4, target: 50, completed_at: null },
      { achievement_id: "clips_shared", progress: 2, target: 30, completed_at: null },
      { achievement_id: "login_streak", progress: 3, target: 30, completed_at: null },
      { achievement_id: "total_xp", progress: 1850, target: 10000, completed_at: null },
    ],
    achievementDefinitions: DEMO_ACH_DEFS,
    is_demo: true,
  };
}

/* ---------- comments -------------------------------------------------- */

const COMMENT_TEMPLATES = [
  "This was incredible! 🔥",
  "Goosebumps. Pure goosebumps.",
  "OK who let you sound this good 😭",
  "The high note at 2:14 lives in my head rent free",
  "Need this on Spotify yesterday",
  "I keep coming back to this",
  "Voice of an angel ✨",
  "We have a new favorite",
];

/** Deterministic, per-performance comment list — won't change on re-render. */
export function buildDemoComments(performanceId: number) {
  const seed = performanceId % 1000;
  const count = 3 + (seed % 4);
  return {
    comments: Array.from({ length: count }, (_, i) => {
      const s = SINGERS[(seed + i) % SINGERS.length];
      return {
        id: performanceId * 100 + i,
        user_id: s.id,
        display_name: s.name,
        picture: s.pic,
        content: COMMENT_TEMPLATES[(seed + i) % COMMENT_TEMPLATES.length],
        created_at: daysAgo(0, i + 1),
        is_demo: true,
      };
    }),
    is_demo: true,
  };
}

/* ---------- recordings / history (jobs) ------------------------------ */

export const DEMO_RECORDINGS = [
  { id: 700_001, user_id: "demo-me", song_name: "Perfect — Ed Sheeran",        job_id: "demo-mp-1", object_path: "/demo/perfect.m4a",   file_name: "perfect.m4a",   content_type: "audio/m4a", size_bytes: 3_640_000, created_at: daysAgo(0, 2), is_demo: true },
  { id: 700_002, user_id: "demo-me", song_name: "Believer — Imagine Dragons",  job_id: "demo-mp-2", object_path: "/demo/believer.m4a",  file_name: "believer.m4a",  content_type: "audio/m4a", size_bytes: 2_910_000, created_at: daysAgo(1, 4), is_demo: true },
  { id: 700_003, user_id: "demo-me", song_name: "Senorita — Shawn Mendes",     job_id: "demo-mp-3", object_path: "/demo/senorita.m4a",  file_name: "senorita.m4a",  content_type: "audio/m4a", size_bytes: 3_150_000, created_at: daysAgo(3, 1), is_demo: true },
  { id: 700_004, user_id: "demo-me", song_name: "Shallow — Lady Gaga",         job_id: "demo-mp-4", object_path: "/demo/shallow.m4a",   file_name: "shallow.m4a",   content_type: "audio/m4a", size_bytes: 4_220_000, created_at: daysAgo(5, 3), is_demo: true },
];

export const DEMO_JOBS = [
  { id: "demo-job-1", filename: "Perfect — Ed Sheeran.mp3",       status: "done"      as const, created_at: daysAgo(0, 2),  duration_seconds: 263, is_demo: true },
  { id: "demo-job-2", filename: "Believer — Imagine Dragons.mp3", status: "done"      as const, created_at: daysAgo(1, 4),  duration_seconds: 204, is_demo: true },
  { id: "demo-job-3", filename: "Senorita — Shawn Mendes.mp3",    status: "done"      as const, created_at: daysAgo(3, 1),  duration_seconds: 191, is_demo: true },
  { id: "demo-job-4", filename: "Shallow — Lady Gaga.mp3",        status: "rendering" as const, created_at: daysAgo(0, 0),  duration_seconds: 217, is_demo: true },
  { id: "demo-job-5", filename: "Bohemian Rhapsody — Queen.mp3",  status: "done"      as const, created_at: daysAgo(5, 3),  duration_seconds: 354, is_demo: true },
  { id: "demo-job-6", filename: "Rolling in the Deep — Adele.mp3",status: "done"      as const, created_at: daysAgo(7, 6),  duration_seconds: 228, is_demo: true },
];

/* ---------- public profile (used on /profile/:userId) ----------------- */

export function buildDemoProfile(userId: string) {
  const singer = SINGERS.find((s) => s.id === userId);
  if (!singer) return null;
  const idx = SINGERS.indexOf(singer);
  const myPerfs = DEMO_PERFORMANCES.filter((p) => p.user_id === userId);
  return {
    user: {
      id: singer.id,
      display_name: singer.name,
      picture: singer.pic,
    },
    stats: {
      level: LEVELS[idx] ?? 8,
      totalXp: TOTAL_XP[idx] ?? 9000,
      followers: 420 - idx * 31 + (idx % 3) * 12,
      following: 180 - idx * 11,
      performances: myPerfs.length || 3,
    },
    isFollowing: false,
    performances: myPerfs,
    is_demo: true,
  };
}

/* ---------- party hub: recent parties --------------------------------- */

export const DEMO_PARTIES = [
  { id: "demo-room-1", name: "Friday Night Karaoke",      code: "NEONXX", theme: "neon",    status: "active", created_at: daysAgo(0, 3), is_demo: true },
  { id: "demo-room-2", name: "Office Hits 2026",          code: "OFFICE", theme: "retro",   status: "active", created_at: daysAgo(2, 0), is_demo: true },
  { id: "demo-room-3", name: "K-Pop Power Hour",          code: "KPOPXX", theme: "midnight",status: "active", created_at: daysAgo(4, 0), is_demo: true },
];

/* ---------- party room (queue / members / leaderboard) ---------------- */

export function buildDemoPartyRoom(roomId: string) {
  const meta =
    DEMO_PARTIES.find((p) => p.id === roomId) || DEMO_PARTIES[0];
  return {
    id: meta.id,
    name: meta.name,
    code: meta.code,
    theme: meta.theme,
    status: meta.status,
    isHost: false,
    created_at: meta.created_at,
    queue: [
      { id: 1, status: "singing", song_name: SONGS[4], display_name: SINGERS[0].name, user_id: SINGERS[0].id, job_id: null, mode: "solo",   is_demo: true },
      { id: 2, status: "waiting", song_name: SONGS[1], display_name: SINGERS[1].name, user_id: SINGERS[1].id, job_id: null, mode: "duet",   is_demo: true },
      { id: 3, status: "waiting", song_name: SONGS[7], display_name: SINGERS[5].name, user_id: SINGERS[5].id, job_id: null, mode: "battle", is_demo: true },
      { id: 4, status: "waiting", song_name: SONGS[0], display_name: SINGERS[3].name, user_id: SINGERS[3].id, job_id: null, mode: "solo",   is_demo: true },
      { id: 5, status: "done",    song_name: SONGS[8], display_name: SINGERS[2].name, user_id: SINGERS[2].id, job_id: null, mode: "solo",   is_demo: true },
    ],
    members: SINGERS.slice(0, 6).map((s, i) => ({
      user_id: s.id,
      display_name: s.name,
      picture: s.pic,
      role: i === 0 ? "host" : "guest",
    })),
    is_demo: true,
  };
}

export function buildDemoPartyLeaderboard() {
  return SINGERS.slice(0, 6).map((s, i) => ({
    user_id: s.id,
    display_name: s.name,
    picture: s.pic,
    songs_sung: 4 - Math.floor(i / 2),
    total_score: 360 - i * 27,
    best_score: SCORES[i],
    is_demo: true,
  }));
}

/** Type guard usable across the app */
export const isDemo = (x: any): boolean => !!x?.is_demo;
