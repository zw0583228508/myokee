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

import type { Job } from "@workspace/api-client-react";

/** Supported UI languages (mirrors SupportedLang in LanguageContext). */
export type DemoLang =
  | "en" | "he" | "ar" | "ko" | "ja" | "zh" | "es" | "ru"
  | "fr" | "de" | "th" | "vi" | "tl" | "fil" | "id";

const pick = <T,>(map: Partial<Record<string, T>>, lang: string, fallback: T): T =>
  map[lang] ?? map[lang === "fil" ? "tl" : lang === "tl" ? "fil" : "en"] ?? fallback;

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

// Song titles are proper nouns — we keep the original artist/title strings
// in their canonical form (English / Hebrew / Arabic / Korean as released).
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
  { id: 990_001, title: "Power Ballad Week",     description: "Bring your strongest vocals — long high notes and heart.", song_name: SONGS[0], status: "active",   prize_credits: 200, entry_count: 1284, start_date: daysAgo(2),  end_date: daysAgo(-5),  hasEntered: false, is_demo: true },
  { id: 990_002, title: "Hebrew Hits Challenge", description: "שירו את הלהיט הישראלי האהוב עליכם.",                       song_name: SONGS[2], status: "active",   prize_credits: 150, entry_count: 642,  start_date: daysAgo(1),  end_date: daysAgo(-3),  hasEntered: false, is_demo: true },
  { id: 990_003, title: "K-Pop Showdown",        description: "Match the energy. Match the moves. Match the score.",      song_name: SONGS[7], status: "upcoming", prize_credits: 250, entry_count: 0,    start_date: daysAgo(-3), end_date: daysAgo(-10), hasEntered: false, is_demo: true },
  { id: 990_004, title: "Classic Rock Legends",  description: "Channel your inner Freddie. The crowd is watching.",       song_name: SONGS[1], status: "ended",    prize_credits: 200, entry_count: 2117, start_date: daysAgo(14), end_date: daysAgo(7),   hasEntered: false, is_demo: true },
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

/** Helper used by Challenges page to decide whether to fall back to a demo detail. */
export const isDemoChallengeId = (id: number) =>
  DEMO_CHALLENGES.some((c) => c.id === id);

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

/* ---------- localized level titles ------------------------------------ */

const LEVEL_TITLES_BY_LANG: Partial<Record<string, string[]>> = {
  en: ["Rising Star","Crowd Pleaser","Stage Veteran","Mic Master","Vocal Wizard","Headliner","Showstopper","Local Legend","Chart Topper","Hall of Famer"],
  he: ["כוכב עולה","שובה לב הקהל","ותיק הבמה","שולט במיקרופון","קוסם הקול","ראש החגיגה","עוצר נשימה","אגדה מקומית","ראשון במצעדים","היכל התהילה"],
  ar: ["نجم صاعد","محبوب الجمهور","قديم المسرح","سيد الميكروفون","ساحر الصوت","نجم العرض","خاطف الأنفاس","أسطورة محلية","متصدر القوائم","قاعة المشاهير"],
  ko: ["떠오르는 별","관객의 사랑","무대 베테랑","마이크 마스터","보컬 마법사","헤드라이너","쇼스타퍼","로컬 레전드","차트 1위","명예의 전당"],
  ja: ["ライジングスター","観客の人気者","ステージのベテラン","マイクマスター","ボーカルウィザード","ヘッドライナー","ショーストッパー","ローカルレジェンド","チャートトップ","殿堂入り"],
  zh: ["新星","人气王","舞台老将","麦霸","声乐大师","主角","压轴之星","本地传奇","榜首之王","名人堂"],
  es: ["Estrella en ascenso","Favorito del público","Veterano del escenario","Maestro del micrófono","Mago vocal","Cabeza de cartel","Showstopper","Leyenda local","Número uno","Salón de la fama"],
  ru: ["Восходящая звезда","Любимец публики","Ветеран сцены","Мастер микрофона","Вокальный волшебник","Хедлайнер","Шоустоппер","Местная легенда","Лидер чартов","Зал славы"],
  fr: ["Étoile montante","Chouchou du public","Vétéran de la scène","Maître du micro","Magicien vocal","Tête d'affiche","Show-stopper","Légende locale","Tête des charts","Panthéon"],
  de: ["Aufsteigender Star","Publikumsliebling","Bühnenveteran","Mikrofon-Meister","Stimmzauberer","Headliner","Showstopper","Lokale Legende","Chart-Stürmer","Hall of Fame"],
  th: ["ดาวรุ่ง","ขวัญใจมหาชน","ขาประจำเวที","เจ้าแห่งไมค์","พ่อมดเสียง","ตัวจริง","สะกดทุกสายตา","ตำนานท้องถิ่น","อันดับหนึ่ง","หอเกียรติยศ"],
  vi: ["Ngôi sao mới","Người được yêu thích","Bậc thầy sân khấu","Ông hoàng micro","Phù thủy giọng hát","Ngôi sao chính","Người gây sốt","Huyền thoại địa phương","Top bảng xếp hạng","Đại sảnh danh vọng"],
  tl: ["Bagong Bituin","Paborito ng Madla","Beterano sa Entablado","Hari ng Mikropono","Salamangkero ng Boses","Pangunahing Tagapagtanghal","Tagapamayagpag","Lokal na Alamat","Numero Uno","Bulwagan ng Kabantugan"],
  id: ["Bintang Baru","Idola Penonton","Veteran Panggung","Raja Mikrofon","Penyihir Vokal","Headliner","Pencuri Perhatian","Legenda Lokal","Puncak Tangga Lagu","Hall of Fame"],
};

const LEVELS = [27, 24, 22, 19, 17, 15, 12, 10, 8, 6];
const TOTAL_XP = [48200, 38100, 31650, 24900, 20300, 16450, 12800, 9650, 7100, 4850];
const WEEKLY_XP = [2840, 2310, 1980, 1620, 1480, 1240, 1050, 870, 720, 540];
const STREAKS = [28, 14, 7, 21, 4, 9, 3, 12, 5, 2];

export function buildDemoXPLeaderboard(
  mode: "all" | "weekly" = "all",
  lang: string = "en",
) {
  const titles = pick(LEVEL_TITLES_BY_LANG, lang, LEVEL_TITLES_BY_LANG.en!);
  const leaderboard = SINGERS.slice(0, 10).map((s, i) => ({
    rank: i + 1,
    userId: s.id,
    displayName: s.name,
    picture: s.pic,
    level: LEVELS[i],
    levelTitle: titles[i] ?? titles[titles.length - 1],
    totalXP: TOTAL_XP[i],
    weeklyXP: WEEKLY_XP[i],
    streakDays: STREAKS[i],
    isYou: false,
  }));
  if (mode === "weekly") {
    leaderboard.sort((a, b) => b.weeklyXP - a.weeklyXP);
    leaderboard.forEach((e, i) => (e.rank = i + 1));
  }
  return { leaderboard, yourRank: null, is_demo: true };
}

/* ---------- "Me" performances on the leaderboard --------------------- */

const ME_LABEL_BY_LANG: Partial<Record<string, string>> = {
  en: "You", he: "אתה", ar: "أنت", ko: "당신", ja: "あなた", zh: "你",
  es: "Tú", ru: "Вы", fr: "Toi", de: "Du", th: "คุณ", vi: "Bạn",
  tl: "Ikaw", id: "Kamu",
};

export function buildDemoMyPerformances(lang: string = "en") {
  const me = pick(ME_LABEL_BY_LANG, lang, "You");
  return [
    { id: 850_001, score: 94, timing_score: 92, pitch_score: 91, words_covered: 128, total_words: 132, song_name: SONGS[8], job_id: "demo-mp-1", created_at: daysAgo(0, 2), display_name: me, picture: undefined as string | undefined, is_public: true,  is_demo: true as const },
    { id: 850_002, score: 88, timing_score: 86, pitch_score: 87, words_covered: 122, total_words: 130, song_name: SONGS[4], job_id: "demo-mp-2", created_at: daysAgo(1, 4), display_name: me, picture: undefined,                       is_public: false, is_demo: true as const },
    { id: 850_003, score: 81, timing_score: 79, pitch_score: 82, words_covered: 110, total_words: 128, song_name: SONGS[11],job_id: "demo-mp-3", created_at: daysAgo(3, 1), display_name: me, picture: undefined,                       is_public: true,  is_demo: true as const },
  ];
}

/** Back-compat default-language export (kept for any legacy importers). */
export const DEMO_MY_PERFORMANCES = buildDemoMyPerformances("en");

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
  { id: "songs_created",  icon: "🎤", target: 100,   xpReward: 500 },
  { id: "battles_won",    icon: "⚔️", target: 50,    xpReward: 400 },
  { id: "duets_sung",     icon: "👥", target: 25,    xpReward: 300 },
  { id: "parties_hosted", icon: "🎉", target: 20,    xpReward: 350 },
  { id: "parties_joined", icon: "🥳", target: 50,    xpReward: 250 },
  { id: "clips_shared",   icon: "📤", target: 30,    xpReward: 200 },
  { id: "login_streak",   icon: "🔥", target: 30,    xpReward: 600 },
  { id: "total_xp",       icon: "✨", target: 10000, xpReward: 1000 },
];

export function buildDemoGamificationProfile(lang: string = "en") {
  const titles = pick(LEVEL_TITLES_BY_LANG, lang, LEVEL_TITLES_BY_LANG.en!);
  return {
    totalXP: 1850,
    level: 4,
    levelTitle: titles[1] ?? "Crowd Pleaser",
    weeklyXP: 320,
    streakDays: 3,
    xpForCurrentLevel: 1500,
    xpForNextLevel: 3000,
    badges: [
      { badge_id: "first_song",        earned_at: daysAgo(6) },
      { badge_id: "song_5",            earned_at: daysAgo(2) },
      { badge_id: "streak_3",          earned_at: daysAgo(1) },
      { badge_id: "social_butterfly",  earned_at: daysAgo(4) },
    ],
    badgeDefinitions: DEMO_BADGE_DEFS,
    achievements: [
      { achievement_id: "songs_created",  progress: 7,    target: 100,   completed_at: null },
      { achievement_id: "duets_sung",     progress: 3,    target: 25,    completed_at: null },
      { achievement_id: "parties_joined", progress: 4,    target: 50,    completed_at: null },
      { achievement_id: "clips_shared",   progress: 2,    target: 30,    completed_at: null },
      { achievement_id: "login_streak",   progress: 3,    target: 30,    completed_at: null },
      { achievement_id: "total_xp",       progress: 1850, target: 10000, completed_at: null },
    ],
    achievementDefinitions: DEMO_ACH_DEFS,
    is_demo: true,
  };
}

/* ---------- localized comments --------------------------------------- */

const COMMENT_TEMPLATES_BY_LANG: Partial<Record<string, string[]>> = {
  en: ["This was incredible! 🔥", "Goosebumps. Pure goosebumps.", "OK who let you sound this good 😭", "The high note at 2:14 lives in my head rent free", "Need this on Spotify yesterday", "I keep coming back to this", "Voice of an angel ✨", "We have a new favorite"],
  he: ["זה היה מדהים! 🔥", "צמרמורת. ממש צמרמורת.", "מי הרשה לך להישמע ככה 😭", "הצליל הגבוה הזה לא יוצא לי מהראש", "צריך את זה ב-Spotify אתמול", "אני חוזר/ת לזה כל הזמן", "קול של מלאך ✨", "יש לנו אהוב/ה חדש/ה"],
  ar: ["كان هذا رائعًا! 🔥", "قشعريرة، قشعريرة حقيقية.", "من سمح لك أن تبدع هكذا 😭", "النغمة العالية لا تفارق ذهني", "نريد هذا على Spotify الآن", "أعود إليها مرارًا", "صوت ملاك ✨", "لدينا مفضّل جديد"],
  ko: ["정말 대단했어요! 🔥", "소름이 돋아요, 진심으로.", "이렇게 잘 부르다니 😭", "그 고음이 머릿속에서 안 사라져요", "당장 Spotify에 올려주세요", "계속 다시 듣게 돼요", "천사의 목소리 ✨", "최애가 한 명 더 생겼어요"],
  ja: ["最高でした！🔥", "鳥肌が立ちました、本当に。", "なんでこんなに上手なの 😭", "あの高音が頭から離れません", "今すぐSpotifyに欲しい", "何度も聴き直しています", "天使の声 ✨", "新しいお気に入りができた"],
  zh: ["太精彩了！🔥", "起鸡皮疙瘩了。", "怎么能唱得这么好 😭", "那个高音一直在我脑里循环", "请马上上 Spotify", "我反复在听", "天使的嗓音 ✨", "新的最爱诞生了"],
  es: ["¡Esto fue increíble! 🔥", "Se me puso la piel de gallina.", "¿Quién te dejó cantar tan bien? 😭", "Esa nota alta vive en mi cabeza", "Necesito esto en Spotify ya", "Vuelvo a escucharlo una y otra vez", "Voz de ángel ✨", "Tenemos un nuevo favorito"],
  ru: ["Это было невероятно! 🔥", "Мурашки. Просто мурашки.", "Кто разрешил тебе петь так круто 😭", "Эта высокая нота крутится в голове", "Хочу это в Spotify уже вчера", "Возвращаюсь к этому снова и снова", "Голос ангела ✨", "У нас новый фаворит"],
  fr: ["C'était incroyable ! 🔥", "Chair de poule garantie.", "Qui t'a permis de chanter aussi bien 😭", "La note aiguë me trotte dans la tête", "Il me faut ça sur Spotify, maintenant", "J'y reviens sans cesse", "Voix d'ange ✨", "Nouveau coup de cœur"],
  de: ["Das war unglaublich! 🔥", "Gänsehaut pur.", "Wer hat dir erlaubt, so gut zu klingen 😭", "Der hohe Ton geht mir nicht mehr aus dem Kopf", "Brauche das sofort auf Spotify", "Ich höre es immer wieder", "Engelsstimme ✨", "Neuer Favorit gefunden"],
  th: ["สุดยอดมาก! 🔥", "ขนลุกเลย ขนลุกจริงๆ", "ใครให้คุณร้องเก่งขนาดนี้ 😭", "เสียงสูงนั่นวนอยู่ในหัวเลย", "อยากได้ใน Spotify เดี๋ยวนี้", "กลับมาฟังซ้ำตลอด", "เสียงนางฟ้า ✨", "มีคนโปรดคนใหม่แล้ว"],
  vi: ["Quá tuyệt vời! 🔥", "Nổi cả da gà luôn.", "Ai cho phép bạn hát hay vậy 😭", "Nốt cao đó cứ vang mãi trong đầu mình", "Cần bài này lên Spotify ngay", "Mình nghe đi nghe lại", "Giọng hát thiên thần ✨", "Có thần tượng mới rồi"],
  tl: ["Sobrang galing! 🔥", "Kinilabutan ako, totoo.", "Sino nag-allow sa'yong kumanta nang ganito kagaling 😭", "Yung mataas na nota, di mawala sa isip ko", "Kailangan na 'to sa Spotify", "Paulit-ulit kong pinapakinggan", "Boses ng anghel ✨", "May bagong paborito kami"],
  id: ["Ini luar biasa! 🔥", "Merinding banget, sumpah.", "Siapa yang izinin kamu senyaring ini 😭", "Nada tinggi itu nempel di kepala", "Tolong segera masuk Spotify", "Aku terus mengulanginya", "Suara malaikat ✨", "Ada favorit baru, nih"],
};

/** Deterministic, per-performance localized comment list. */
export function buildDemoComments(performanceId: number, lang: string = "en") {
  const templates = pick(COMMENT_TEMPLATES_BY_LANG, lang, COMMENT_TEMPLATES_BY_LANG.en!);
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
        content: templates[(seed + i) % templates.length],
        created_at: daysAgo(0, i + 1),
        is_demo: true,
      };
    }),
    is_demo: true,
  };
}

/* ---------- recordings / history (jobs) ------------------------------ */

export const DEMO_RECORDINGS = [
  { id: 700_001, user_id: "demo-me", song_name: SONGS[8],  job_id: "demo-mp-1", object_path: "/demo/perfect.m4a",   file_name: "perfect.m4a",   content_type: "audio/m4a", size_bytes: 3_640_000, created_at: daysAgo(0, 2), is_demo: true },
  { id: 700_002, user_id: "demo-me", song_name: SONGS[4],  job_id: "demo-mp-2", object_path: "/demo/believer.m4a",  file_name: "believer.m4a",  content_type: "audio/m4a", size_bytes: 2_910_000, created_at: daysAgo(1, 4), is_demo: true },
  { id: 700_003, user_id: "demo-me", song_name: SONGS[11], job_id: "demo-mp-3", object_path: "/demo/senorita.m4a",  file_name: "senorita.m4a",  content_type: "audio/m4a", size_bytes: 3_150_000, created_at: daysAgo(3, 1), is_demo: true },
  { id: 700_004, user_id: "demo-me", song_name: SONGS[0],  job_id: "demo-mp-4", object_path: "/demo/shallow.m4a",   file_name: "shallow.m4a",   content_type: "audio/m4a", size_bytes: 4_220_000, created_at: daysAgo(5, 3), is_demo: true },
];

/** Demo job rows — shape-compatible with the real `Job` schema plus `is_demo`. */
export type DemoJob = Pick<Job, "id" | "status" | "filename" | "created_at"> & {
  progress: number;
  updated_at: string;
  duration_seconds: number;
  is_demo: true;
};

export const DEMO_JOBS: DemoJob[] = [
  { id: "demo-job-1", filename: "Perfect — Ed Sheeran.mp3",        status: "done"      as const, progress: 100, created_at: daysAgo(0, 2), updated_at: daysAgo(0, 2), duration_seconds: 263, is_demo: true },
  { id: "demo-job-2", filename: "Believer — Imagine Dragons.mp3",  status: "done"      as const, progress: 100, created_at: daysAgo(1, 4), updated_at: daysAgo(1, 4), duration_seconds: 204, is_demo: true },
  { id: "demo-job-3", filename: "Senorita — Shawn Mendes.mp3",     status: "done"      as const, progress: 100, created_at: daysAgo(3, 1), updated_at: daysAgo(3, 1), duration_seconds: 191, is_demo: true },
  { id: "demo-job-4", filename: "Shallow — Lady Gaga.mp3",         status: "rendering" as const, progress: 65,  created_at: daysAgo(0, 0), updated_at: daysAgo(0, 0), duration_seconds: 217, is_demo: true },
  { id: "demo-job-5", filename: "Bohemian Rhapsody — Queen.mp3",   status: "done"      as const, progress: 100, created_at: daysAgo(5, 3), updated_at: daysAgo(5, 3), duration_seconds: 354, is_demo: true },
  { id: "demo-job-6", filename: "Rolling in the Deep — Adele.mp3", status: "done"      as const, progress: 100, created_at: daysAgo(7, 6), updated_at: daysAgo(7, 6), duration_seconds: 228, is_demo: true },
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

/* ---------- party hub: localized party names -------------------------- */

const PARTY_NAMES_BY_LANG: Partial<Record<string, [string, string, string]>> = {
  en: ["Friday Night Karaoke",          "Office Hits 2026",            "K-Pop Power Hour"],
  he: ["קריוקי של ליל שישי",            "להיטי המשרד 2026",            "שעת ק-פופ"],
  ar: ["كاريوكي ليلة الجمعة",           "أغاني المكتب 2026",           "ساعة الكي-بوب"],
  ko: ["금요일 밤 노래방",               "오피스 히트 2026",            "K-Pop 파워 아워"],
  ja: ["金曜の夜カラオケ",               "オフィスヒッツ 2026",          "K-POPパワーアワー"],
  zh: ["周五夜卡拉OK",                   "办公室金曲 2026",              "K-Pop能量时刻"],
  es: ["Karaoke de viernes por la noche","Éxitos de la oficina 2026",   "Hora de K-Pop"],
  ru: ["Караоке в пятницу вечером",      "Офисные хиты 2026",            "K-Pop час"],
  fr: ["Karaoké du vendredi soir",       "Hits du bureau 2026",          "K-Pop Power Hour"],
  de: ["Freitagabend-Karaoke",           "Office-Hits 2026",             "K-Pop Power-Hour"],
  th: ["คาราโอเกะคืนวันศุกร์",            "ฮิตชาวออฟฟิศ 2026",            "ชั่วโมง K-Pop"],
  vi: ["Karaoke tối thứ Sáu",            "Hit văn phòng 2026",           "Giờ K-Pop"],
  tl: ["Karaoke Tuwing Biyernes",        "Office Hits 2026",             "K-Pop Power Hour"],
  id: ["Karaoke Jumat Malam",            "Hits Kantor 2026",             "Jam K-Pop"],
};

export type DemoParty = {
  id: string;
  name: string;
  code: string;
  theme: string;
  status: string;
  created_at: string;
  is_demo: true;
};

const PARTY_META: Array<Omit<DemoParty, "name">> = [
  { id: "demo-room-1", code: "NEONXX", theme: "neon",     status: "active", created_at: daysAgo(0, 3), is_demo: true },
  { id: "demo-room-2", code: "OFFICE", theme: "retro",    status: "active", created_at: daysAgo(2, 0), is_demo: true },
  { id: "demo-room-3", code: "KPOPXX", theme: "midnight", status: "active", created_at: daysAgo(4, 0), is_demo: true },
];

export function buildDemoParties(lang: string = "en"): DemoParty[] {
  const names = pick(PARTY_NAMES_BY_LANG, lang, PARTY_NAMES_BY_LANG.en!);
  return PARTY_META.map((m, i) => ({ ...m, name: names[i] ?? names[0] }));
}

/** Back-compat default-language export. */
export const DEMO_PARTIES: DemoParty[] = buildDemoParties("en");

/** Whether a routed room id refers to one of our demo party rooms. */
export const isDemoPartyId = (id: string) => id.startsWith("demo-room-");

/* ---------- party room (queue / members / leaderboard) ---------------- */

export function buildDemoPartyRoom(roomId: string, lang: string = "en") {
  const parties = buildDemoParties(lang);
  const meta = parties.find((p) => p.id === roomId) || parties[0];
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
