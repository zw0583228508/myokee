/**
 * Demo data shown on the community/leaderboard/challenges screens
 * when the database has no real entries yet — so first-time visitors
 * see a lively, working app instead of empty states.
 *
 * Demo items are tagged with `is_demo: true`. Interactive handlers
 * (likes / comments / follow / enter-challenge) treat them as visual-only.
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

/** Type guard usable across the app */
export const isDemo = (x: any): boolean => !!x?.is_demo;
