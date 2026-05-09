/**
 * Post-build prerender for SEO.
 *
 * MYOUKEE is a Vite SPA — Googlebot can render JS but Bing/Yandex/Baidu/Naver
 * are unreliable, and even Google takes weeks to render JS pages.
 * To rank for "karaoke", "卡拉OK", "노래방", "カラオケ", "קריוקי" etc. in every
 * market, we generate a static HTML snapshot per route at build time with the
 * correct localized <title>, <meta description>, hreflang, canonical, OG tags,
 * JSON-LD structured data, and a <noscript> H1+content block (real SEO content
 * for crawlers).
 *
 * Hosting (Render static) serves these per-path files BEFORE applying
 * _redirects fallback, so /lang/he/ gets /lang/he/index.html, etc.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { ALL_FEATURES, RTL_LANGS } from "../src/data/feature-seo";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, "..", "dist", "public");
const TEMPLATE_PATH = join(DIST, "index.html");
const SITE = "https://myoukee.com";

if (!existsSync(TEMPLATE_PATH)) {
  console.error(`[prerender] Template not found: ${TEMPLATE_PATH}`);
  console.error("[prerender] Run 'vite build' first.");
  process.exit(1);
}

const TEMPLATE = readFileSync(TEMPLATE_PATH, "utf8");

const LANGS = ["he", "en", "ar", "ru", "es", "fr", "de", "ja", "zh", "ko", "th", "vi", "tl", "id"] as const;
type L = (typeof LANGS)[number];

/* ─────── Per-language SEO for /lang/:lang ─────── */
const LANG_SEO: Record<L, { title: string; description: string; h1: string; intro: string }> = {
  he: {
    title: "הפוך כל שיר לקריוקי תוך שניות | הסרת קולות AI | Myoukee",
    description: "הפוך כל שיר לקריוקי מיידית — חינם. הסר קולות עם AI, קבל מילים מסונכרנות ושר. העלה MP3 או הדבק קישור מיוטיוב. ללא הורדות.",
    h1: "הפוך כל שיר לקריוקי בעברית",
    intro: "MYOUKEE הוא יוצר קריוקי AI חינמי בעברית. הפרידו קולות מכל שיר, קבלו מילים מסונכרנות אוטומטית, שירו, קבלו ניקוד מקצועי ושתפו עם חברים. עובד בדפדפן בכל מכשיר ללא הורדות. תומך בעברית, ערבית, אנגלית ועוד 11 שפות.",
  },
  en: {
    title: "Turn Any Song into Karaoke in Seconds — Free AI Vocal Remover | Myoukee",
    description: "Turn any song into karaoke instantly — free online. Remove vocals with AI, get auto-synced lyrics, sing along and get scored. Upload MP3 or paste a YouTube link.",
    h1: "Turn Any Song Into Karaoke",
    intro: "MYOUKEE is the free AI karaoke maker that turns any song into karaoke in seconds. Remove vocals with AI, get auto-synced lyrics, sing along, get scored, and share with friends. Works in any browser, no downloads. Supports 14 languages including English, Spanish, Korean, Japanese, Chinese, Arabic, Hebrew and more.",
  },
  ar: {
    title: "حول أي أغنية إلى كاريوكي في ثوانٍ | مزيل صوت AI مجاني | Myoukee",
    description: "حول أي أغنية إلى كاريوكي فوراً — مجاناً. أزل الأصوات بالذكاء الاصطناعي، احصل على كلمات متزامنة وغنِّ. ارفع MP3 أو الصق رابط يوتيوب.",
    h1: "حوّل أي أغنية إلى كاريوكي",
    intro: "MYOUKEE هو صانع كاريوكي مجاني بالذكاء الاصطناعي. أزل الأصوات من أي أغنية، احصل على كلمات متزامنة تلقائياً، غنِّ واحصل على درجاتك. يعمل في أي متصفح بدون تنزيل. يدعم 14 لغة بما فيها العربية والعبرية والإنجليزية.",
  },
  ru: {
    title: "Превратите любую песню в караоке за секунды | AI удаление вокала | Myoukee",
    description: "Превратите любую песню в караоке мгновенно — бесплатно. Удалите вокал с помощью ИИ, получите синхронизированный текст и пойте. Загрузите MP3 или вставьте ссылку YouTube.",
    h1: "Превратите любую песню в караоке",
    intro: "MYOUKEE — бесплатный AI генератор караоке. Удалите вокал из любой песни, получите автоматически синхронизированный текст, пойте, получайте оценку и делитесь с друзьями. Работает в любом браузере без установки. Поддерживает 14 языков.",
  },
  es: {
    title: "Convierte cualquier canción en karaoke en segundos | Eliminador vocal AI | Myoukee",
    description: "Convierte cualquier canción en karaoke al instante — gratis. Elimina las voces con IA, obtén letras sincronizadas y canta. Sube MP3 o pega un enlace de YouTube.",
    h1: "Convierte cualquier canción en karaoke",
    intro: "MYOUKEE es el creador de karaoke con IA gratuito que convierte cualquier canción en karaoke en segundos. Elimina las voces, obtén letras sincronizadas, canta, recibe puntuación y comparte con amigos. Funciona en cualquier navegador sin descargas. Soporta 14 idiomas.",
  },
  fr: {
    title: "Transformez n'importe quelle chanson en karaoké en secondes | Myoukee",
    description: "Transformez n'importe quelle chanson en karaoké instantanément — gratuit. Supprimez les voix avec l'IA, obtenez des paroles synchronisées et chantez. MP3 ou lien YouTube.",
    h1: "Transformez n'importe quelle chanson en karaoké",
    intro: "MYOUKEE est le créateur de karaoké IA gratuit qui transforme n'importe quelle chanson en karaoké en quelques secondes. Supprimez les voix, obtenez des paroles synchronisées, chantez, recevez une note et partagez. Fonctionne dans tout navigateur sans téléchargement. 14 langues supportées.",
  },
  de: {
    title: "Verwandeln Sie jeden Song in Karaoke in Sekunden | KI-Gesangsentferner | Myoukee",
    description: "Verwandeln Sie jeden Song sofort in Karaoke — kostenlos. Entfernen Sie Gesang mit KI, erhalten Sie synchronisierte Texte und singen Sie mit. MP3 oder YouTube-Link.",
    h1: "Verwandeln Sie jeden Song in Karaoke",
    intro: "MYOUKEE ist der kostenlose KI-Karaoke-Macher, der jeden Song in Sekunden in Karaoke verwandelt. Entfernen Sie Gesang, erhalten Sie synchronisierte Texte, singen Sie, erhalten Sie Bewertungen und teilen Sie mit Freunden. Funktioniert in jedem Browser ohne Downloads. Unterstützt 14 Sprachen.",
  },
  ja: {
    title: "どんな曲も数秒でカラオケに | 無料AIボーカル除去 | Myoukee",
    description: "どんな曲も瞬時にカラオケに変換 — 無料。AIでボーカルを除去し、自動同期歌詞で歌えます。MP3アップロードまたはYouTubeリンク。",
    h1: "どんな曲もカラオケに変換",
    intro: "MYOUKEEは無料のAIカラオケメーカー。どんな曲からもボーカルを除去し、自動同期歌詞を取得、歌って採点され、友達と共有できます。ダウンロード不要、どのブラウザでも動作。日本語、英語、韓国語、中国語など14言語対応。",
  },
  zh: {
    title: "将任何歌曲秒变卡拉OK | 免费AI去人声 | Myoukee",
    description: "立即将任何歌曲转换为卡拉OK — 免费。使用AI去除人声，获取同步歌词，尽情歌唱。上传MP3或粘贴YouTube链接。",
    h1: "将任何歌曲变成卡拉OK",
    intro: "MYOUKEE是免费的AI卡拉OK制作工具，可在几秒内将任何歌曲转换为卡拉OK。去除人声，获取同步歌词，唱歌，获得评分，与朋友分享。无需下载，适用于任何浏览器。支持14种语言，包括中文、英语、日语、韩语等。",
  },
  ko: {
    title: "모든 노래를 몇 초 만에 노래방으로 | 무료 AI 보컬 제거 | Myoukee",
    description: "모든 노래를 즉시 노래방으로 변환하세요 — 무료. AI로 보컬을 제거하고 자동 동기화된 가사로 노래하세요. MP3 업로드 또는 YouTube 링크.",
    h1: "어떤 노래든 노래방으로",
    intro: "MYOUKEE는 어떤 노래든 몇 초 안에 노래방으로 만들어주는 무료 AI 노래방 메이커입니다. 보컬을 제거하고, 자동 동기화된 가사를 받고, 노래하고, 점수를 받고, 친구들과 공유하세요. 다운로드 없이 어떤 브라우저에서도 작동합니다. K-Pop, J-Pop, C-Pop을 포함한 14개 언어 지원.",
  },
  th: {
    title: "เปลี่ยนเพลงเป็นคาราโอเกะในไม่กี่วินาที | ลบเสียงร้อง AI ฟรี | Myoukee",
    description: "เปลี่ยนเพลงใดก็ได้เป็นคาราโอเกะทันที — ฟรี ลบเสียงร้องด้วย AI รับเนื้อเพลงซิงค์อัตโนมัติและร้องตาม อัปโหลด MP3 หรือลิงก์ YouTube",
    h1: "เปลี่ยนทุกเพลงเป็นคาราโอเกะ",
    intro: "MYOUKEE คือเครื่องมือสร้างคาราโอเกะ AI ฟรีที่เปลี่ยนเพลงใดก็ได้เป็นคาราโอเกะในไม่กี่วินาที ลบเสียงร้อง รับเนื้อเพลงซิงค์อัตโนมัติ ร้องเพลง รับคะแนน และแชร์กับเพื่อนๆ ทำงานในเบราว์เซอร์ใดก็ได้โดยไม่ต้องดาวน์โหลด รองรับ 14 ภาษา",
  },
  vi: {
    title: "Biến bất kỳ bài hát nào thành karaoke trong vài giây | Xóa giọng hát AI miễn phí | Myoukee",
    description: "Biến bất kỳ bài hát nào thành karaoke ngay lập tức — miễn phí. Xóa giọng hát bằng AI, nhận lời bài hát đồng bộ tự động và hát theo. MP3 hoặc liên kết YouTube.",
    h1: "Biến mọi bài hát thành karaoke",
    intro: "MYOUKEE là công cụ tạo karaoke AI miễn phí biến bất kỳ bài hát nào thành karaoke trong vài giây. Xóa giọng hát, nhận lời bài hát đồng bộ tự động, hát, nhận điểm số và chia sẻ với bạn bè. Hoạt động trong mọi trình duyệt mà không cần tải xuống. Hỗ trợ 14 ngôn ngữ.",
  },
  tl: {
    title: "Gawing Karaoke ang Anumang Kanta sa Ilang Segundo | Libreng AI Vocal Remover | Myoukee",
    description: "Gawing karaoke ang anumang kanta agad-agad — libre. Alisin ang vocals gamit ang AI, makakuha ng naka-sync na lyrics at kumanta. MP3 o YouTube link.",
    h1: "Gawing Karaoke ang Anumang Kanta",
    intro: "Ang MYOUKEE ay libreng AI karaoke maker na gumagawa ng karaoke mula sa anumang kanta sa loob ng ilang segundo. Alisin ang vocals, makakuha ng naka-sync na lyrics, kumanta, makakuha ng score, at i-share sa mga kaibigan. Gumagana sa anumang browser nang walang download. Sumusuporta sa 14 wika kasama ang Filipino at OPM.",
  },
  id: {
    title: "Ubah Lagu Apa Pun Jadi Karaoke dalam Hitungan Detik | Penghapus Vokal AI Gratis | Myoukee",
    description: "Ubah lagu apa pun menjadi karaoke secara instan — gratis. Hapus vokal dengan AI, dapatkan lirik tersinkronisasi otomatis dan bernyanyilah. MP3 atau link YouTube.",
    h1: "Ubah Lagu Apa Pun Jadi Karaoke",
    intro: "MYOUKEE adalah pembuat karaoke AI gratis yang mengubah lagu apa pun menjadi karaoke dalam hitungan detik. Hapus vokal, dapatkan lirik tersinkronisasi otomatis, bernyanyi, dapatkan skor, dan bagikan dengan teman. Berfungsi di browser apa pun tanpa unduhan. Mendukung 14 bahasa termasuk Indonesia.",
  },
};

/* ─────── Per-route SEO for /challenges, /feed, /leaderboard, /vocal-coach ─────── */
const PAGE_SEO: Record<string, Partial<Record<L, { title: string; description: string; h1: string; intro: string }>>> = {
  challenges: {
    en: { title: "Weekly Karaoke Singing Challenges — Compete Worldwide | Myoukee", description: "Join weekly singing challenges on MYOUKEE. Sing the featured songs, compete for top spots, win credits and badges. New challenges every week.", h1: "Weekly Karaoke Challenges", intro: "Join the weekly singing challenges on MYOUKEE. Each week features new songs to sing — compete with karaoke singers worldwide for the top spot, win credits, badges and XP. Free to enter." },
    he: { title: "אתגרי שירה שבועיים — התחרו עם העולם | Myoukee", description: "הצטרפו לאתגרי שירה שבועיים ב-MYOUKEE. שירו את השירים הנבחרים, התחרו על המקומות הראשונים וזכו בקרדיטים ותגים.", h1: "אתגרי קריוקי שבועיים", intro: "הצטרפו לאתגרי השירה השבועיים ב-MYOUKEE. כל שבוע שירים חדשים — התחרו עם זמרים מכל העולם, זכו בקרדיטים, תגים ו-XP. הצטרפות חינם." },
    es: { title: "Desafíos Semanales de Karaoke — Compite en Todo el Mundo | Myoukee", description: "Únete a los desafíos de canto semanales de MYOUKEE. Canta las canciones destacadas, compite por los primeros lugares y gana créditos.", h1: "Desafíos Semanales de Karaoke", intro: "Únete a los desafíos de canto semanales en MYOUKEE. Cada semana hay canciones nuevas — compite con cantantes de todo el mundo, gana créditos, insignias y XP. Gratis para participar." },
    ko: { title: "주간 노래방 챌린지 — 전 세계와 경쟁하세요 | Myoukee", description: "MYOUKEE의 주간 노래 챌린지에 참여하세요. 추천 노래를 부르고 상위권을 위해 경쟁하며 크레딧과 배지를 획득하세요.", h1: "주간 노래방 챌린지", intro: "MYOUKEE의 주간 노래 챌린지에 참여하세요. 매주 새로운 노래 — 전 세계 가수들과 경쟁하고 크레딧, 배지, XP를 획득하세요. 무료 참여." },
    ja: { title: "週間カラオケチャレンジ — 世界中と競う | Myoukee", description: "MYOUKEEの週間歌唱チャレンジに参加しよう。注目曲を歌い、トップを目指して競い、クレジットとバッジを獲得しよう。", h1: "週間カラオケチャレンジ", intro: "MYOUKEEの週間歌唱チャレンジに参加しよう。毎週新しい曲 — 世界中の歌い手と競い、クレジット、バッジ、XPを獲得。参加無料。" },
    zh: { title: "每周卡拉OK歌唱挑战 — 与全球竞争 | Myoukee", description: "参加MYOUKEE的每周歌唱挑战。演唱精选歌曲，争夺榜首，赢取积分和徽章。", h1: "每周卡拉OK挑战", intro: "参加MYOUKEE的每周歌唱挑战。每周新歌 — 与全球歌手竞争，赢取积分、徽章和XP。免费参加。" },
  },
  feed: {
    en: { title: "Karaoke Community Feed — Discover Singers Worldwide | Myoukee", description: "Discover karaoke performances from singers around the world. Like, comment, follow your favorite singers and get inspired by the global karaoke community.", h1: "Karaoke Community Feed", intro: "Browse the global MYOUKEE karaoke community feed. Discover amazing singers, like and comment on performances, follow your favorites, and share your own. From K-Pop to Hebrew ballads to Latin pop — all in one place." },
    he: { title: "פיד קהילת קריוקי — גלו זמרים מכל העולם | Myoukee", description: "גלו ביצועי קריוקי מזמרים מכל העולם. תנו לייק, הגיבו, עקבו אחרי הזמרים האהובים עליכם וקבלו השראה מהקהילה הגלובלית.", h1: "פיד קהילת הקריוקי", intro: "עיינו בפיד הקהילה הגלובלית של MYOUKEE. גלו זמרים מדהימים, תנו לייק והגיבו לביצועים, עקבו אחרי המועדפים שלכם ושתפו את שלכם. מק-פופ ועד בלדות עבריות ופופ לטיני — הכל במקום אחד." },
    es: { title: "Feed de la Comunidad de Karaoke — Descubre Cantantes | Myoukee", description: "Descubre actuaciones de karaoke de cantantes de todo el mundo. Da me gusta, comenta, sigue a tus cantantes favoritos.", h1: "Feed de Comunidad de Karaoke", intro: "Explora el feed de la comunidad global de karaoke MYOUKEE. Descubre cantantes increíbles, dale me gusta y comenta actuaciones, sigue a tus favoritos y comparte las tuyas." },
    ko: { title: "노래방 커뮤니티 피드 — 전 세계 가수 발견 | Myoukee", description: "전 세계 가수들의 노래방 공연을 발견하세요. 좋아요, 댓글, 좋아하는 가수를 팔로우하고 글로벌 커뮤니티에서 영감을 받으세요.", h1: "노래방 커뮤니티 피드", intro: "MYOUKEE의 글로벌 노래방 커뮤니티 피드를 둘러보세요. 놀라운 가수들을 발견하고, 공연에 좋아요와 댓글을 달고, 좋아하는 가수를 팔로우하세요." },
    ja: { title: "カラオケコミュニティフィード — 世界中の歌い手を発見 | Myoukee", description: "世界中の歌い手のカラオケパフォーマンスを発見。いいね、コメント、お気に入りの歌い手をフォロー、グローバルコミュニティからインスピレーションを得よう。", h1: "カラオケコミュニティフィード", intro: "MYOUKEEのグローバルカラオケコミュニティフィードを閲覧。素晴らしい歌い手を発見し、パフォーマンスにいいねやコメント、お気に入りをフォロー。" },
    zh: { title: "卡拉OK社区动态 — 发现全球歌手 | Myoukee", description: "发现来自世界各地歌手的卡拉OK表演。点赞、评论、关注你最喜欢的歌手。", h1: "卡拉OK社区动态", intro: "浏览MYOUKEE全球卡拉OK社区动态。发现令人惊叹的歌手，为表演点赞和评论，关注你的最爱并分享你自己的作品。" },
  },
  leaderboard: {
    en: { title: "Global Karaoke Leaderboard — Top Singers Worldwide | Myoukee", description: "See the top karaoke singers from around the world. Compete for the #1 spot, climb the rankings, and prove you're the best.", h1: "Global Karaoke Leaderboard", intro: "The MYOUKEE global karaoke leaderboard ranks the top singers worldwide by score. Sing along to your favorite songs, climb the rankings, earn XP and badges, and prove you have what it takes to be #1." },
    he: { title: "טבלת המובילים בקריוקי — הזמרים הטובים בעולם | Myoukee", description: "ראו את הזמרים הטובים ביותר מכל העולם. התחרו על המקום הראשון וטפסו במעלה הדירוג.", h1: "טבלת מובילים גלובלית", intro: "טבלת המובילים הגלובלית של MYOUKEE מדרגת את הזמרים הטובים בעולם לפי ציון. שירו את השירים האהובים, טפסו במעלה הדירוג, צברו XP ותגים." },
    es: { title: "Tabla Global de Karaoke — Mejores Cantantes | Myoukee", description: "Mira a los mejores cantantes de karaoke del mundo. Compite por el #1 y escala el ranking.", h1: "Clasificación Global de Karaoke", intro: "La clasificación global de karaoke de MYOUKEE clasifica a los mejores cantantes del mundo por puntuación." },
    ko: { title: "글로벌 노래방 리더보드 — 세계 최고의 가수 | Myoukee", description: "전 세계 최고의 노래방 가수를 확인하세요. #1을 위해 경쟁하고 순위를 올리세요.", h1: "글로벌 노래방 리더보드", intro: "MYOUKEE 글로벌 노래방 리더보드는 점수별로 전 세계 최고의 가수들을 순위 매깁니다." },
    ja: { title: "グローバルカラオケランキング — 世界トップシンガー | Myoukee", description: "世界中のトップカラオケシンガーを見よう。1位を目指して競い、ランキングを駆け上がろう。", h1: "グローバルカラオケランキング", intro: "MYOUKEEのグローバルカラオケランキングはスコアで世界中のトップシンガーをランク付けします。" },
    zh: { title: "全球卡拉OK排行榜 — 世界顶级歌手 | Myoukee", description: "查看全球顶级卡拉OK歌手。争夺第一名，攀登排名。", h1: "全球卡拉OK排行榜", intro: "MYOUKEE全球卡拉OK排行榜按分数对全球顶级歌手进行排名。" },
  },
  "vocal-coach": {
    en: { title: "AI Vocal Coach — Personalized Singing Tips | Myoukee", description: "Get personalized AI singing tips and improve your voice. Track pitch accuracy, timing, breath control over time. Free AI vocal coach.", h1: "AI Vocal Coach", intro: "MYOUKEE's AI vocal coach analyzes every performance and gives you personalized tips to improve. Track your progress on pitch accuracy, timing and vocal control over time. Like having a singing teacher in your pocket — free." },
    he: { title: "מאמן שירה AI — טיפים אישיים לשיפור הקול | Myoukee", description: "קבלו טיפי שירה אישיים וטפחו את הקול. עקבו אחר דיוק טון, תזמון ושליטה לאורך זמן. מאמן שירה AI חינם.", h1: "מאמן שירה AI", intro: "מאמן השירה החכם של MYOUKEE מנתח כל ביצוע ונותן לכם טיפים אישיים לשיפור. עקבו אחר ההתקדמות שלכם בדיוק טון, תזמון ושליטה לאורך זמן." },
    ko: { title: "AI 보컬 코치 — 개인화된 노래 팁 | Myoukee", description: "개인화된 AI 노래 팁을 받고 목소리를 개선하세요. 음정 정확도, 타이밍, 호흡 제어를 시간에 따라 추적합니다.", h1: "AI 보컬 코치", intro: "MYOUKEE의 AI 보컬 코치는 모든 공연을 분석하고 개선을 위한 개인화된 팁을 제공합니다." },
    ja: { title: "AIボーカルコーチ — パーソナライズされた歌唱アドバイス | Myoukee", description: "パーソナライズされたAI歌唱アドバイスで声を改善。ピッチの正確性、タイミング、呼吸制御を経時的に追跡。", h1: "AIボーカルコーチ", intro: "MYOUKEEのAIボーカルコーチがすべてのパフォーマンスを分析し、改善のためのパーソナライズされたアドバイスを提供します。" },
    zh: { title: "AI声乐教练 — 个性化唱歌建议 | Myoukee", description: "获得个性化AI唱歌建议，改善你的嗓音。跟踪音准、节奏和呼吸控制。", h1: "AI声乐教练", intro: "MYOUKEE的AI声乐教练分析每次表演，并为你提供改进的个性化建议。" },
  },
  xp: {
    en: { title: "Your Karaoke XP & Achievements | Myoukee", description: "Track your karaoke XP, levels, badges and achievements. Level up by singing more songs and getting higher scores.", h1: "Karaoke XP & Achievements", intro: "Earn XP every time you sing on MYOUKEE. Level up, unlock badges, complete achievements, and climb the global leaderboard." },
    he: { title: "ה-XP וההישגים שלך בקריוקי | Myoukee", description: "עקבו אחר ה-XP, הרמות, התגים וההישגים שלכם. עלו רמה על ידי שירת עוד שירים וציונים גבוהים יותר.", h1: "XP והישגים בקריוקי", intro: "צברו XP בכל פעם שאתם שרים ב-MYOUKEE. עלו רמה, פתחו תגים, השלימו הישגים." },
  },
};

/* ─────── HTML helpers ─────── */
const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const RTL_SET = new Set(RTL_LANGS);
const LANG_ATTR_MAP: Record<L, string> = {
  he: "he", en: "en", ar: "ar", ru: "ru", es: "es", fr: "fr", de: "de",
  ja: "ja", zh: "zh-CN", ko: "ko", th: "th", vi: "vi", tl: "fil", id: "id",
};

function buildHreflang(pathFor: (l: L) => string): string {
  const tags = LANGS.map(l => `<link rel="alternate" hreflang="${LANG_ATTR_MAP[l]}" href="${SITE}${pathFor(l)}" />`);
  tags.push(`<link rel="alternate" hreflang="x-default" href="${SITE}/" />`);
  return tags.join("\n    ");
}

/**
 * Strip every existing instance of a head tag from the template so we can
 * re-emit a single, page-correct version. Without this, snapshots inherit
 * canonical/hreflang/og:locale from index.html and end up with duplicates
 * (or worse, conflicting values).
 */
function stripTemplateTags(html: string): string {
  return html
    // canonical
    .replace(/\s*<link\s+rel="canonical"[^>]*>\s*/gi, "\n    ")
    // hreflang alternates (including x-default)
    .replace(/\s*<link\s+rel="alternate"\s+hreflang="[^"]*"[^>]*>\s*/gi, "\n    ")
    // og:locale + og:locale:alternate
    .replace(/\s*<meta\s+property="og:locale(?::alternate)?"[^>]*>\s*/gi, "\n    ");
}

function jsonLdScript(obj: unknown): string {
  return `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`;
}

/**
 * Build the rendered HTML for a route. Replaces head meta tags in the
 * built template, sets <html lang>/dir, and injects an SEO <noscript>
 * block + JSON-LD into the body.
 */
function renderHtml(opts: {
  url: string;
  lang: L;
  title: string;
  description: string;
  h1: string;
  intro: string;
  /** Pre-built hreflang block. Omit/empty for pages with no language alternates. */
  hreflang?: string;
  jsonLd?: unknown[];
  bullets?: string[];
}): string {
  const dir = RTL_SET.has(opts.lang) ? "rtl" : "ltr";
  // Strip canonical/hreflang/og:locale from the template first so we don't
  // emit duplicates when re-injecting the page-correct versions below.
  let html = stripTemplateTags(TEMPLATE);

  // OG locale codes (BCP-47-ish per Open Graph convention)
  const OG_LOCALE: Record<L, string> = {
    en: "en_US", he: "he_IL", ar: "ar_SA", ru: "ru_RU", es: "es_ES",
    fr: "fr_FR", de: "de_DE", ja: "ja_JP", zh: "zh_CN", ko: "ko_KR",
    th: "th_TH", vi: "vi_VN", tl: "fil_PH", id: "id_ID",
  };

  // <html lang="en"> → localized
  html = html.replace(/<html\s+lang="[^"]*"[^>]*>/i, `<html lang="${LANG_ATTR_MAP[opts.lang]}" dir="${dir}">`);

  // <title>
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escape(opts.title)}</title>`);

  // <meta name="description">
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${escape(opts.description)}" />`,
  );

  // og: tags — replace title/description/url
  html = html.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${escape(opts.title)}" />`);
  html = html.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${escape(opts.description)}" />`);
  html = html.replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${opts.url}" />`);
  html = html.replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${escape(opts.title)}" />`);
  html = html.replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${escape(opts.description)}" />`);

  // Inject before </head>: single canonical + og:locale + (optional) hreflang block + JSON-LD.
  const headExtras = [
    `<link rel="canonical" href="${opts.url}" />`,
    `<meta property="og:locale" content="${OG_LOCALE[opts.lang]}" />`,
    `<meta name="prerendered" content="true" />`,
    opts.hreflang || "",
    ...(opts.jsonLd?.map(jsonLdScript) ?? []),
  ].filter(Boolean).join("\n    ");

  html = html.replace(/<\/head>/i, `    ${headExtras}\n  </head>`);

  // Inject SEO <noscript> block before existing <noscript> at end of body.
  // This gives crawlers a real H1 + content paragraph + bullet list.
  const seoBlock = `<noscript>
    <div lang="${LANG_ATTR_MAP[opts.lang]}" dir="${dir}">
      <h1>${escape(opts.h1)}</h1>
      <p>${escape(opts.intro)}</p>
      ${opts.bullets?.length ? `<ul>${opts.bullets.map(b => `<li>${escape(b)}</li>`).join("")}</ul>` : ""}
    </div>
  </noscript>`;

  // Insert just after <div id="root">
  html = html.replace(/(<div\s+id="root"[^>]*>)/i, `$1${seoBlock}`);

  return html;
}

function writeRoute(routePath: string, html: string) {
  const cleanPath = routePath.replace(/^\/+/, "").replace(/\/+$/, "");
  const outDir = cleanPath ? join(DIST, cleanPath) : DIST;
  if (cleanPath) mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "index.html");
  writeFileSync(outPath, html, "utf8");
  return outPath.replace(DIST, "");
}

/* ─────── 1. Root /  ─────── */
function renderRoot(): string {
  const en = LANG_SEO.en;
  const homeJsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "MYOUKEE",
      url: SITE,
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE}/feed?q={query}`,
        "query-input": "required name=query",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "MYOUKEE",
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", ratingCount: "12847" },
      description: en.description,
    },
  ];
  return renderHtml({
    url: `${SITE}/`,
    lang: "en",
    title: "Free AI Karaoke Maker — Turn Any Song Into Karaoke | Myoukee",
    description: en.description,
    h1: en.h1,
    intro: en.intro,
    hreflang: buildHreflang(l => `/lang/${l === "tl" ? "tl" : l}/`),
    jsonLd: homeJsonLd,
    bullets: [
      "Free online karaoke maker — no downloads, no app install",
      "AI vocal removal in seconds — works on any song",
      "Auto-synced lyrics in 14 languages",
      "Sing, get scored, share with friends",
      "Weekly singing challenges and global leaderboard",
    ],
  });
}

/* ─────── 2. /lang/:lang ─────── */
function renderLang(lang: L): string {
  const meta = LANG_SEO[lang];
  return renderHtml({
    url: `${SITE}/lang/${lang}/`,
    lang,
    title: meta.title,
    description: meta.description,
    h1: meta.h1,
    intro: meta.intro,
    hreflang: buildHreflang(l => `/lang/${l}/`),
    jsonLd: [{
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "MYOUKEE", item: SITE },
        { "@type": "ListItem", position: 2, name: meta.h1, item: `${SITE}/lang/${lang}/` },
      ],
    }],
  });
}

/* ─────── 3. /features/:slug ─────── */
function renderFeature(slug: string): string {
  const feature = ALL_FEATURES[slug];
  if (!feature) throw new Error(`Unknown feature slug: ${slug}`);
  // Pick best lang per slug — if it's hebrew-karaoke, use he as primary. Otherwise en.
  const langKey: L = slug.startsWith("hebrew") ? "he"
    : slug.startsWith("arabic") ? "ar"
    : slug.startsWith("korean") ? "ko"
    : slug.startsWith("japanese") ? "ja"
    : slug.startsWith("chinese") ? "zh"
    : slug.startsWith("spanish") ? "es"
    : slug.startsWith("russian") ? "ru"
    : slug.startsWith("french") ? "fr"
    : slug.startsWith("german") ? "de"
    : slug.startsWith("thai") ? "th"
    : slug.startsWith("vietnamese") ? "vi"
    : slug.startsWith("filipino") ? "tl"
    : slug.startsWith("indonesian") ? "id"
    : "en";
  const seo = feature.seo[langKey] ?? feature.seo.en;

  // FAQ in primary lang for JSON-LD
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: feature.faq.map(f => ({
      "@type": "Question",
      name: f.q[langKey] || f.q.en,
      acceptedAnswer: { "@type": "Answer", text: f.a[langKey] || f.a.en },
    })),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "MYOUKEE", item: SITE },
      { "@type": "ListItem", position: 2, name: seo.h1, item: `${SITE}/features/${slug}` },
    ],
  };

  // Bullets from feature.features (text in primary lang)
  const bullets = feature.features.slice(0, 6).map(f => f.text[langKey] || f.text.en);

  return renderHtml({
    url: `${SITE}/features/${slug}`,
    lang: langKey,
    title: seo.title,
    description: seo.description,
    h1: seo.h1,
    intro: seo.subtitle,
    // No hreflang — feature pages serve all langs at the same URL via i18n.
    jsonLd: [breadcrumbJsonLd, faqJsonLd],
    bullets,
  });
}

/* ─────── 4. /challenges, /feed, /leaderboard, /vocal-coach, /xp ─────── */
function renderPage(pageKey: string): string {
  const meta = PAGE_SEO[pageKey]?.en;
  if (!meta) throw new Error(`No PAGE_SEO for ${pageKey}`);
  return renderHtml({
    url: `${SITE}/${pageKey}`,
    lang: "en",
    title: meta.title,
    description: meta.description,
    h1: meta.h1,
    intro: meta.intro,
    // No hreflang — main pages serve all langs at the same URL via i18n.
    jsonLd: [{
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "MYOUKEE", item: SITE },
        { "@type": "ListItem", position: 2, name: meta.h1, item: `${SITE}/${pageKey}` },
      ],
    }],
  });
}

/* ─────── Run ─────── */
const written: string[] = [];

written.push(writeRoute("/", renderRoot()));

for (const lang of LANGS) {
  written.push(writeRoute(`/lang/${lang}/`, renderLang(lang)));
}

for (const slug of Object.keys(ALL_FEATURES)) {
  written.push(writeRoute(`/features/${slug}`, renderFeature(slug)));
}

for (const page of Object.keys(PAGE_SEO)) {
  written.push(writeRoute(`/${page}`, renderPage(page)));
}

console.log(`[prerender] Generated ${written.length} static HTML snapshots:`);
for (const p of written) console.log(`  ${p}`);
