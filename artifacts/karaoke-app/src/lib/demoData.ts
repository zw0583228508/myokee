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

/**
 * Singer pool — 12 culturally appropriate display names per language.
 * IDs (demo-1..demo-12) and avatar pictures are stable across all langs,
 * so deep links like /profile/demo-3 keep working regardless of UI lang.
 */
const SINGER_PICS = [
  "https://i.pravatar.cc/120?img=47", "https://i.pravatar.cc/120?img=12",
  "https://i.pravatar.cc/120?img=49", "https://i.pravatar.cc/120?img=45",
  "https://i.pravatar.cc/120?img=33", "https://i.pravatar.cc/120?img=20",
  "https://i.pravatar.cc/120?img=44", "https://i.pravatar.cc/120?img=15",
  "https://i.pravatar.cc/120?img=32", "https://i.pravatar.cc/120?img=8",
  "https://i.pravatar.cc/120?img=29", "https://i.pravatar.cc/120?img=36",
];

const SINGER_NAMES_BY_LANG: Partial<Record<string, string[]>> = {
  en: ["Maya Stone","Daniel Reed","Sofia Rivera","Liam Parker","Aria Brooks","Noah Wright","Olivia Hayes","Ethan Carter","Emma Bennett","Lucas Reyes","Chloe Morgan","Mason Cole"],
  he: ["מאיה שטרן","דניאל כהן","נועה לוי","איתן פרץ","שירה ביטון","יונתן אבני","תמר הלוי","עומר שטרן","ליאל אוחיון","איתי מזרחי","יעל אזולאי","עידן רוזן"],
  ar: ["مايا حسن","دانيال خليل","سارة منصور","ياسين كريم","نور الهدى","عمر صالح","ليلى ناصر","كريم فؤاد","رنا حداد","زياد عثمان","هبة شاكر","مازن قاسم"],
  ko: ["김유진","박지훈","이서연","최민호","정수아","강도윤","윤하늘","조은우","임채린","서지호","한예나","오재현"],
  ja: ["田中 美咲","佐藤 大輔","鈴木 結衣","高橋 颯太","伊藤 さくら","渡辺 蓮","山本 葵","中村 陽斗","小林 凛","加藤 悠真","吉田 ひかり","山田 大翔"],
  zh: ["李美华","王浩然","张雨欣","刘子轩","陈思琪","赵宇航","黄诗雅","周博文","吴梓彤","徐若曦","孙嘉怡","马天宇"],
  es: ["Sofía García","Mateo López","Lucía Martín","Diego Fernández","Camila Ruiz","Sebastián Torres","Valentina Cruz","Tomás Romero","Isabella Vega","Joaquín Ortega","Martina Soto","Andrés Castillo"],
  ru: ["Анна Иванова","Дмитрий Петров","Мария Соколова","Александр Кузнецов","Полина Морозова","Артём Орлов","Софья Новикова","Михаил Васильев","Виктория Лебедева","Иван Смирнов","Ева Попова","Никита Громов"],
  fr: ["Léa Martin","Lucas Bernard","Camille Dubois","Hugo Laurent","Manon Petit","Léo Moreau","Chloé Rousseau","Nathan Simon","Inès Garnier","Théo Faure","Sarah Mercier","Adam Vincent"],
  de: ["Mia Schneider","Leon Fischer","Hanna Weber","Paul Becker","Lena Hoffmann","Felix Wagner","Emilia Schulz","Jonas Richter","Lina Köhler","Noah Bauer","Sophia Lehmann","Finn Krüger"],
  th: ["มินตรา จันทร์","ภาคิน สมบูรณ์","ปริยา ศรีสุข","กิตติ พงษ์ศักดิ์","พิมพ์ชนก ทอง","ธนวัฒน์ ศิริ","นภัสสร ไพศาล","ชยพล วรกิจ","อรปรียา รุ่ง","ปิยะพงษ์ ใจดี","ลลิตา สุวรรณ","ภูริ ตันเจริญ"],
  vi: ["Linh Nguyễn","Minh Trần","Hà Phạm","Quang Lê","Trang Hoàng","Hùng Đỗ","Mai Vũ","Tuấn Bùi","Thảo Phan","Anh Đặng","Phương Dương","Long Trịnh"],
  tl: ["Maria Reyes","Juan Cruz","Andrea Santos","Miguel Bautista","Bianca Aquino","Carlos Mendoza","Sofia Gonzales","Daniel Garcia","Camille Torres","Joshua Dela Cruz","Patricia Ramos","Marco Villanueva"],
  id: ["Sari Wijaya","Budi Pratama","Citra Lestari","Andi Saputra","Dewi Anggraini","Rizky Putra","Putri Maharani","Bayu Nugroho","Anisa Hartono","Fajar Setiawan","Maya Permata","Reza Hidayat"],
};

const SONGS_BY_LANG: Partial<Record<string, string[]>> = {
  en: ["Shallow — Lady Gaga","Bohemian Rhapsody — Queen","Believer — Imagine Dragons","Rolling in the Deep — Adele","Perfect — Ed Sheeran","Lose Yourself — Eminem","Stay — Rihanna","Someone Like You — Adele","Bad Guy — Billie Eilish","Don't Stop Believin' — Journey","Hello — Adele","Hey Jude — The Beatles"],
  he: ["אהבת חיי — אייל גולן","ערב טוב — נועה קירל","תמיד אהיה איתך — שלמה ארצי","אם נדבר — אריק איינשטיין","יש בי אהבה — להקת כוורת","אהבתיה — בני אלבז","תוצרת הארץ — שלום חנוך","שיר השכונה — שלמה ארצי","מילים יפות מאלה — שרית חדד","בלילות הקיץ — עומר אדם","אני ואתה — אריק איינשטיין","שיר אהבה בדואי — דוד ברוזה"],
  ar: ["حبيبي يا نور العين — عمرو دياب","تملي معاك — عمرو دياب","نور العين — عمرو دياب","قارئة الفنجان — عبد الحليم حافظ","الأطلال — أم كلثوم","قد الحروف — كاظم الساهر","حبك نار — وائل كفوري","رومانسية — ماجدة الرومي","يا ليل يا عين — فيروز","سيد الحبايب — كاظم الساهر","لما بدا يتثنى — فيروز","يا غايب — فضل شاكر"],
  ko: ["봄날 — BTS","Dynamite — BTS","좋은 날 — IU","밤편지 — IU","Through the Night — IU","러브 시나리오 — iKON","사건의 지평선 — 윤하","Love Dive — IVE","마지막처럼 — BLACKPINK","Stay With Me — 찬열 & 펀치","후라이의 꿈 — AKMU","오래된 노래 — 김동률"],
  ja: ["Lemon — 米津玄師","紅蓮華 — LiSA","残酷な天使のテーゼ — 高橋洋子","Pretender — Official髭男dism","夜に駆ける — YOASOBI","アイドル — YOASOBI","Subtitle — Official髭男dism","怪物 — YOASOBI","Lemon — 米津玄師","First Love — 宇多田ヒカル","明日があるさ — 坂本九","世界に一つだけの花 — SMAP"],
  zh: ["稻香 — 周杰伦","告白气球 — 周杰伦","青花瓷 — 周杰伦","起风了 — 买辣椒也用券","学猫叫 — 小潘潘","下一站天后 — 容祖儿","小幸运 — 田馥甄","后来 — 刘若英","遇见 — 孙燕姿","成全 — 林宥嘉","干杯 — 五月天","海阔天空 — Beyond"],
  es: ["Despacito — Luis Fonsi","Bailando — Enrique Iglesias","La Bamba — Ritchie Valens","La Bicicleta — Shakira","Vivir Mi Vida — Marc Anthony","Hips Don't Lie — Shakira","Bésame Mucho — Consuelo Velázquez","Color Esperanza — Diego Torres","La Camisa Negra — Juanes","Tusa — Karol G","Macarena — Los del Río","Échame La Culpa — Luis Fonsi"],
  ru: ["Сансара — Баста","Лабиринт — Любэ","Дискотека — Руки Вверх","Берега — Руки Вверх","Тает лёд — Грибы","Розовое вино — Элджей","Минимал — IOWA","Прованс — Ёлка","Город — Сплин","Любимка — Niletto","Я свободен — Кипелов","Звезда — Алла Пугачёва"],
  fr: ["La Vie en Rose — Édith Piaf","Non, je ne regrette rien — Édith Piaf","Je veux — Zaz","Dernière danse — Indila","Tous les mêmes — Stromae","Papaoutai — Stromae","Formidable — Stromae","Champs-Élysées — Joe Dassin","La Bohème — Charles Aznavour","Aline — Christophe","Mistral gagnant — Renaud","Mon amie la rose — Françoise Hardy"],
  de: ["99 Luftballons — Nena","Über den Wolken — Reinhard Mey","Atemlos durch die Nacht — Helene Fischer","Major Tom — Peter Schilling","Ein Stern — DJ Ötzi","Auf uns — Andreas Bourani","An Tagen wie diesen — Die Toten Hosen","Skandal im Sperrbezirk — Spider Murphy","Stadt — Cassandra Steen","Cordula Grün — Josh","Königlich — Mark Forster","Lieblingsmensch — Namika"],
  th: ["คู่คอง — ก้อง ห้วยไร่","คิดถึง — Cocktail","ขอบฟ้า — โต๋ ศักดิ์สิทธิ์","แค่ลมผ่าน — Calories Blah Blah","รักแท้ดูแลไม่ได้ — ETC","เพียงชายคนนี้ — เจมส์ จิรายุ","คนใจง่าย — TaitosmitH","หรือฉันคิดไปเอง — Loso","ฉันจะร้องเพลงรัก — เบิร์ด ธงไชย","คนที่ใช่ — Klear","ใจเย็น — ตรี ชัยณรงค์","อย่าให้ฉันคิดมาก — Bodyslam"],
  vi: ["Bống Bống Bang Bang — 365","Em Gái Mưa — Hương Tràm","Lạc Trôi — Sơn Tùng M-TP","Chúng Ta Của Hiện Tại — Sơn Tùng M-TP","Ngày Đầu Tiên — Đức Phúc","Có Chàng Trai Viết Lên Cây — Phan Mạnh Quỳnh","Người Lạ Ơi — Karik","Anh Nhà Ở Đâu Thế — AMEE","Để Mị Nói Cho Mà Nghe — Hoàng Thùy Linh","Hồng Nhan — Jack","Hoa Hải Đường — Jack","Đi Để Trở Về — Soobin"],
  tl: ["Anak — Freddie Aguilar","Bakit Ngayon Ka Lang — Freestyle","Forevermore — Side A","Tadhana — Up Dharma Down","Kahit Ayaw Mo Na — This Band","Hawak Kamay — Yeng Constantino","Buwan — Juan Karlos","Pagsamo — Arthur Nery","With a Smile — Eraserheads","Ang Huling El Bimbo — Eraserheads","Salamat — Yeng Constantino","Mundo — IV of Spades"],
  id: ["Bento — Iwan Fals","Kisah Sempurna — Mahalini","Mungkin Hari Ini Esok Atau Nanti — Anggi Marito","Bintang di Surga — Peterpan","Akad — Payung Teduh","Cinta Luar Biasa — Andmesh","Hingga Tua Bersama — Rizky Febian","Asmalibrasi — Soegi Bornean","Sakit Sendiri — Mahalini","Berlayar Denganku — Adrian Khalif","Komang — Raim Laode","Melukis Senja — Budi Doremi"],
};

const SCORES = [98, 96, 94, 92, 91, 89, 87, 85, 83, 81, 79, 76];

type Singer = { id: string; name: string; pic: string };

/** Build a 12-singer pool for the given UI language. IDs stay stable across langs. */
function getSingers(lang: string = "en"): Singer[] {
  const names = pick(SINGER_NAMES_BY_LANG, lang, SINGER_NAMES_BY_LANG.en!);
  return names.map((name, i) => ({
    id: `demo-${i + 1}`,
    name,
    pic: SINGER_PICS[i],
  }));
}

/** Localized song pool — 12 culturally-appropriate titles. */
function getSongs(lang: string = "en"): string[] {
  return pick(SONGS_BY_LANG, lang, SONGS_BY_LANG.en!);
}

/** Resolve a demo singer id (demo-1..demo-12) to its localized display name. */
function singerById(userId: string, lang: string = "en"): Singer | null {
  const singers = getSingers(lang);
  return singers.find((s) => s.id === userId) ?? null;
}

export function buildDemoPerformances(lang: string = "en"): DemoPerformance[] {
  const singers = getSingers(lang);
  const songs = getSongs(lang);
  return singers.map((s, i) => ({
    id: 900_000 + i,
    user_id: s.id,
    display_name: s.name,
    picture: s.pic,
    song_name: songs[i % songs.length],
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
}

/* ---------- following feed (subset of singers, different ordering) ----- */

export function buildDemoFollowingFeed(lang: string = "en"): DemoPerformance[] {
  const all = buildDemoPerformances(lang);
  return [0, 2, 4, 6, 8, 10].map((idx, i) => ({
    ...all[idx],
    id: 910_000 + i,
    liked_by_me: i % 3 === 0,
    created_at: daysAgo(i, (i * 7) % 23),
  }));
}

/** Back-compat default-language exports. */
export const DEMO_PERFORMANCES: DemoPerformance[] = buildDemoPerformances("en");
export const DEMO_FOLLOWING_FEED: DemoPerformance[] = buildDemoFollowingFeed("en");

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

/** Localized title/description pairs for the 4 demo challenges (order matches DEMO_CHALLENGES). */
const CHALLENGE_TEXT_BY_LANG: Partial<Record<string, Array<{ title: string; description: string }>>> = {
  en: [
    { title: "Power Ballad Week",     description: "Bring your strongest vocals — long high notes and heart." },
    { title: "Global Hits Challenge", description: "Sing your favorite chart-topper from anywhere in the world." },
    { title: "K-Pop Showdown",        description: "Match the energy. Match the moves. Match the score." },
    { title: "Classic Rock Legends",  description: "Channel your inner Freddie. The crowd is watching." },
  ],
  he: [
    { title: "שבוע בלדות עוצמתיות",  description: "תנו את הוקאל החזק ביותר — תווים גבוהים ארוכים ולב." },
    { title: "אתגר הלהיטים העולמי",   description: "שירו את הלהיט האהוב עליכם מכל מקום בעולם." },
    { title: "התמודדות K-Pop",        description: "אותה אנרגיה. אותן תנועות. אותו ציון." },
    { title: "אגדות הרוק הקלאסי",     description: "תכלו את הפרדי שבכם. הקהל צופה." },
  ],
  ar: [
    { title: "أسبوع الأغاني العاطفية", description: "قدّم أقوى أداء صوتي — نغمات عالية طويلة وعاطفة." },
    { title: "تحدي الأغاني العالمية",  description: "غنِّ أغنيتك المفضلة من أي مكان في العالم." },
    { title: "مواجهة الكي بوب",        description: "نفس الطاقة. نفس الحركات. نفس النتيجة." },
    { title: "أساطير الروك الكلاسيكي", description: "أطلق فريدي الذي بداخلك. الجمهور يشاهد." },
  ],
  ko: [
    { title: "파워 발라드 위크",   description: "가장 강력한 보컬을 선보이세요 — 긴 고음과 감정." },
    { title: "글로벌 히트 챌린지", description: "전 세계 어디서든 좋아하는 차트 1위 곡을 불러보세요." },
    { title: "K-Pop 쇼다운",       description: "에너지도, 동작도, 점수도 똑같이." },
    { title: "클래식 록 레전드",   description: "당신 안의 프레디를 깨우세요. 관객이 보고 있어요." },
  ],
  ja: [
    { title: "パワーバラードウィーク",  description: "最強のボーカルを — 長い高音と情熱を込めて。" },
    { title: "グローバルヒットチャレンジ", description: "世界中のお気に入りヒット曲を歌おう。" },
    { title: "K-Pop ショーダウン",       description: "エネルギー、動き、スコアすべてを合わせよう。" },
    { title: "クラシックロック レジェンド", description: "内なるフレディを解き放て。観客が見ている。" },
  ],
  zh: [
    { title: "力量情歌周",     description: "拿出最强嗓音——长高音与情感。" },
    { title: "全球热门挑战",   description: "演唱来自世界任何地方的你最爱的金曲。" },
    { title: "K-Pop 对决",     description: "同样的能量、同样的舞步、同样的分数。" },
    { title: "经典摇滚传奇",   description: "释放你心中的弗雷迪。观众正在看着。" },
  ],
  es: [
    { title: "Semana Power Ballad",    description: "Da lo mejor de tu voz — notas altas largas y corazón." },
    { title: "Desafío Éxitos Globales", description: "Canta tu éxito favorito desde cualquier parte del mundo." },
    { title: "Duelo K-Pop",            description: "Iguala la energía. Iguala los pasos. Iguala la puntuación." },
    { title: "Leyendas del Rock Clásico", description: "Canaliza tu Freddie interior. El público mira." },
  ],
  ru: [
    { title: "Неделя пауэр-баллад",   description: "Покажи самый сильный вокал — долгие высокие ноты и душа." },
    { title: "Глобальный хит-челлендж", description: "Спой свой любимый мировой хит откуда угодно." },
    { title: "K-Pop поединок",        description: "Та же энергия. Те же движения. Тот же счёт." },
    { title: "Легенды классического рока", description: "Прояви в себе Фредди. Публика смотрит." },
  ],
  fr: [
    { title: "Semaine Power Ballad",   description: "Donne le meilleur de ta voix — notes hautes et cœur." },
    { title: "Défi Hits Mondiaux",     description: "Chante ton tube préféré venu d’ailleurs dans le monde." },
    { title: "K-Pop Showdown",         description: "Même énergie. Mêmes mouvements. Même score." },
    { title: "Légendes du Rock Classique", description: "Libère le Freddie en toi. Le public regarde." },
  ],
  de: [
    { title: "Power-Ballad-Woche",     description: "Zeig deinen stärksten Gesang — lange hohe Töne und Herz." },
    { title: "Globale Hits Challenge", description: "Singe deinen Lieblingshit von irgendwo auf der Welt." },
    { title: "K-Pop Showdown",         description: "Gleiche Energie. Gleiche Moves. Gleiche Punktzahl." },
    { title: "Klassische Rock-Legenden", description: "Lass den Freddie in dir raus. Die Menge schaut zu." },
  ],
  th: [
    { title: "สัปดาห์เพลงพาวเวอร์บัลลาด", description: "ปล่อยเสียงร้องที่ทรงพลังที่สุด — โน้ตสูงยาวและหัวใจ." },
    { title: "ชาเลนจ์เพลงฮิตทั่วโลก",   description: "ร้องเพลงฮิตโปรดจากทุกที่ในโลก." },
    { title: "K-Pop โชว์ดาวน์",         description: "พลังงานเดียวกัน ท่าเดียวกัน คะแนนเดียวกัน." },
    { title: "ตำนานคลาสสิกร็อก",       description: "ปลดปล่อยเฟรดดี้ในตัวคุณ ผู้ชมกำลังจ้องมอง." },
  ],
  vi: [
    { title: "Tuần Power Ballad",       description: "Hát giọng mạnh nhất của bạn — nốt cao dài và cảm xúc." },
    { title: "Thử thách Hit Toàn cầu",  description: "Hát bản hit yêu thích từ bất cứ nơi nào trên thế giới." },
    { title: "K-Pop Showdown",          description: "Cùng năng lượng. Cùng vũ đạo. Cùng điểm số." },
    { title: "Huyền thoại Rock Cổ điển", description: "Đánh thức Freddie trong bạn. Khán giả đang xem." },
  ],
  tl: [
    { title: "Linggo ng Power Ballad", description: "Ipakita ang pinakamalakas mong boses — mahabang mataas na nota at puso." },
    { title: "Global Hits Challenge",  description: "Kantahin ang paborito mong hit mula saanmang panig ng mundo." },
    { title: "K-Pop Showdown",         description: "Parehong enerhiya. Parehong galaw. Parehong puntos." },
    { title: "Mga Alamat ng Classic Rock", description: "Palayain ang Freddie sa loob mo. Nanonood ang mga tao." },
  ],
  id: [
    { title: "Pekan Power Ballad",     description: "Berikan vokal terkuatmu — nada tinggi panjang dan perasaan." },
    { title: "Tantangan Hit Global",   description: "Nyanyikan hit favorit dari mana saja di dunia." },
    { title: "K-Pop Showdown",         description: "Energi sama. Gerakan sama. Skor sama." },
    { title: "Legenda Rock Klasik",    description: "Bangkitkan Freddie dalam dirimu. Penonton menyaksikan." },
  ],
};

const CHALLENGE_META = [
  { id: 990_001, song_idx: 0, status: "active"   as const, prize_credits: 200, entry_count: 1284, start_date: daysAgo(2),  end_date: daysAgo(-5)  },
  { id: 990_002, song_idx: 2, status: "active"   as const, prize_credits: 150, entry_count: 642,  start_date: daysAgo(1),  end_date: daysAgo(-3)  },
  { id: 990_003, song_idx: 7, status: "upcoming" as const, prize_credits: 250, entry_count: 0,    start_date: daysAgo(-3), end_date: daysAgo(-10) },
  { id: 990_004, song_idx: 1, status: "ended"    as const, prize_credits: 200, entry_count: 2117, start_date: daysAgo(14), end_date: daysAgo(7)   },
];

export function buildDemoChallenges(lang: string = "en"): DemoChallenge[] {
  const texts = pick(CHALLENGE_TEXT_BY_LANG, lang, CHALLENGE_TEXT_BY_LANG.en!);
  const songs = getSongs(lang);
  return CHALLENGE_META.map((m, i) => {
    const { song_idx, ...rest } = m;
    return {
      ...rest,
      song_name: songs[song_idx],
      title: texts[i].title,
      description: texts[i].description,
      hasEntered: false as const,
      is_demo: true as const,
    };
  });
}

/** Back-compat default-language export (kept for any legacy importers). */
export const DEMO_CHALLENGES: DemoChallenge[] = buildDemoChallenges("en");

/** Build a demo challenge-detail payload (leaderboard rows for the modal). */
export function buildDemoChallengeDetail(id: number, lang: string = "en") {
  const list = buildDemoChallenges(lang);
  const challenge = list.find((c) => c.id === id) || list[0];
  const leaderboard = getSingers(lang).slice(0, 8).map((s, i) => ({
    user_id: s.id,
    display_name: s.name,
    picture: s.pic,
    score: SCORES[i],
  }));
  return { challenge, leaderboard, myEntry: null, is_demo: true };
}

/** Helper used by Challenges page to decide whether to fall back to a demo detail. */
export const isDemoChallengeId = (id: number) =>
  CHALLENGE_META.some((c) => c.id === id);

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

export function buildDemoLeaderboard(lang: string = "en"): DemoLeaderRow[] {
  const singers = getSingers(lang);
  const songs = getSongs(lang);
  return singers.slice(0, 10).map((s, i) => ({
    id: 800_000 + i,
    user_id: s.id,
    display_name: s.name,
    picture: s.pic,
    song_name: songs[i % songs.length],
    score: SCORES[i],
    timing_score: Math.max(60, SCORES[i] - 1 - (i % 4)),
    pitch_score: Math.max(60, SCORES[i] - 3 - (i % 5)),
    words_covered: 120 - i * 4,
    total_words: 132,
    job_id: `demo-${i}`,
    created_at: daysAgo(Math.floor(i / 2), (i * 5) % 23),
    is_demo: true,
  }));
}

/** Back-compat default-language export. */
export const DEMO_LEADERBOARD: DemoLeaderRow[] = buildDemoLeaderboard("en");

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
  const leaderboard = getSingers(lang).slice(0, 10).map((s, i) => ({
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

/** Localized "Demo" tag label for visible placeholder badges. */
const DEMO_LABEL_BY_LANG: Partial<Record<string, string>> = {
  en: "Demo", he: "הדגמה", ar: "عرض", ko: "데모", ja: "デモ", zh: "示例",
  es: "Demo", ru: "Демо", fr: "Démo", de: "Demo", th: "ตัวอย่าง", vi: "Demo",
  tl: "Demo", id: "Demo",
};
export function demoLabel(lang: string = "en"): string {
  return pick(DEMO_LABEL_BY_LANG, lang, "Demo");
}

export function buildDemoMyPerformances(lang: string = "en") {
  const me = pick(ME_LABEL_BY_LANG, lang, "You");
  const songs = getSongs(lang);
  return [
    { id: 850_001, score: 94, timing_score: 92, pitch_score: 91, words_covered: 128, total_words: 132, song_name: songs[0], job_id: "demo-mp-1", created_at: daysAgo(0, 2), display_name: me, picture: undefined as string | undefined, is_public: true,  is_demo: true as const },
    { id: 850_002, score: 88, timing_score: 86, pitch_score: 87, words_covered: 122, total_words: 130, song_name: songs[3], job_id: "demo-mp-2", created_at: daysAgo(1, 4), display_name: me, picture: undefined,                       is_public: false, is_demo: true as const },
    { id: 850_003, score: 81, timing_score: 79, pitch_score: 82, words_covered: 110, total_words: 128, song_name: songs[6], job_id: "demo-mp-3", created_at: daysAgo(3, 1), display_name: me, picture: undefined,                       is_public: true,  is_demo: true as const },
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
  const SINGERS = getSingers(lang);
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

export function buildDemoRecordings(lang: string = "en") {
  const songs = getSongs(lang);
  return [
    { id: 700_001, user_id: "demo-me", song_name: songs[0], job_id: "demo-mp-1", object_path: "/demo/track-1.m4a", file_name: "track-1.m4a", content_type: "audio/m4a", size_bytes: 3_640_000, created_at: daysAgo(0, 2), is_demo: true },
    { id: 700_002, user_id: "demo-me", song_name: songs[3], job_id: "demo-mp-2", object_path: "/demo/track-2.m4a", file_name: "track-2.m4a", content_type: "audio/m4a", size_bytes: 2_910_000, created_at: daysAgo(1, 4), is_demo: true },
    { id: 700_003, user_id: "demo-me", song_name: songs[6], job_id: "demo-mp-3", object_path: "/demo/track-3.m4a", file_name: "track-3.m4a", content_type: "audio/m4a", size_bytes: 3_150_000, created_at: daysAgo(3, 1), is_demo: true },
    { id: 700_004, user_id: "demo-me", song_name: songs[9], job_id: "demo-mp-4", object_path: "/demo/track-4.m4a", file_name: "track-4.m4a", content_type: "audio/m4a", size_bytes: 4_220_000, created_at: daysAgo(5, 3), is_demo: true },
  ];
}

/** Back-compat default-language export. */
export const DEMO_RECORDINGS = buildDemoRecordings("en");

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

export function buildDemoProfile(userId: string, lang: string = "en") {
  const singer = singerById(userId, lang);
  if (!singer) return null;
  const idx = parseInt(singer.id.replace("demo-", ""), 10) - 1;
  const myPerfs = buildDemoPerformances(lang).filter((p) => p.user_id === userId);
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
  const SINGERS = getSingers(lang);
  const songs = getSongs(lang);
  return {
    id: meta.id,
    name: meta.name,
    code: meta.code,
    theme: meta.theme,
    status: meta.status,
    isHost: false,
    created_at: meta.created_at,
    queue: [
      { id: 1, status: "singing", song_name: songs[1], display_name: SINGERS[0].name, user_id: SINGERS[0].id, job_id: null, mode: "solo",   is_demo: true },
      { id: 2, status: "waiting", song_name: songs[4], display_name: SINGERS[1].name, user_id: SINGERS[1].id, job_id: null, mode: "duet",   is_demo: true },
      { id: 3, status: "waiting", song_name: songs[2], display_name: SINGERS[5].name, user_id: SINGERS[5].id, job_id: null, mode: "battle", is_demo: true },
      { id: 4, status: "waiting", song_name: songs[7], display_name: SINGERS[3].name, user_id: SINGERS[3].id, job_id: null, mode: "solo",   is_demo: true },
      { id: 5, status: "done",    song_name: songs[9], display_name: SINGERS[2].name, user_id: SINGERS[2].id, job_id: null, mode: "solo",   is_demo: true },
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

export function buildDemoPartyLeaderboard(lang: string = "en") {
  return getSingers(lang).slice(0, 6).map((s, i) => ({
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
