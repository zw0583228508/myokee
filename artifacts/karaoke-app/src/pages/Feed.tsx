import { useState } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { useFeed, useDiscover, useLikePerformance, useComments, useAddComment } from "@/hooks/use-social";
import { Heart, MessageCircle, User, Music, ChevronDown, Send, Sparkles, Globe2, Users } from "lucide-react";
import { Link } from "wouter";

const T: Record<string, Record<string, string>> = {
  en: { feed: "Following", discover: "Discover", title: "Community", subtitle: "See what others are singing", noFeed: "No performances yet", noFeedDesc: "Follow other singers to see their performances here", noDiscover: "No public performances yet", score: "Score", addComment: "Add a comment...", showComments: "comments", loadMore: "Load More" },
  he: { feed: "עוקב", discover: "גילוי", title: "קהילה", subtitle: "ראו מה אחרים שרים", noFeed: "אין ביצועים עדיין", noFeedDesc: "עקבו אחרי זמרים אחרים כדי לראות את הביצועים שלהם כאן", noDiscover: "אין ביצועים פומביים עדיין", score: "ציון", addComment: "הוסף תגובה...", showComments: "תגובות", loadMore: "טען עוד" },
  ar: { feed: "متابعة", discover: "اكتشف", title: "المجتمع", subtitle: "شاهد ما يغنيه الآخرون", noFeed: "لا توجد عروض بعد", noFeedDesc: "تابع مغنين آخرين لرؤية عروضهم هنا", noDiscover: "لا توجد عروض عامة بعد", score: "النتيجة", addComment: "أضف تعليقًا...", showComments: "تعليقات", loadMore: "تحميل المزيد" },
  ko: { feed: "팔로잉", discover: "탐색", title: "커뮤니티", subtitle: "다른 사람들의 노래를 확인하세요", noFeed: "아직 공연이 없습니다", noFeedDesc: "다른 가수를 팔로우하여 공연을 확인하세요", noDiscover: "아직 공개 공연이 없습니다", score: "점수", addComment: "댓글을 입력하세요...", showComments: "댓글", loadMore: "더 보기" },
  ja: { feed: "フォロー中", discover: "発見", title: "コミュニティ", subtitle: "みんなの歌を見てみよう", noFeed: "まだパフォーマンスがありません", noFeedDesc: "他の歌手をフォローしてパフォーマンスを見ましょう", noDiscover: "まだ公開パフォーマンスがありません", score: "スコア", addComment: "コメントを追加...", showComments: "コメント", loadMore: "もっと見る" },
  zh: { feed: "关注", discover: "发现", title: "社区", subtitle: "看看大家都在唱什么", noFeed: "还没有演出", noFeedDesc: "关注其他歌手，在这里查看他们的演出", noDiscover: "还没有公开演出", score: "分数", addComment: "添加评论...", showComments: "评论", loadMore: "加载更多" },
  es: { feed: "Siguiendo", discover: "Descubrir", title: "Comunidad", subtitle: "Mira lo que otros cantan", noFeed: "No hay actuaciones aún", noFeedDesc: "Sigue a otros cantantes para ver sus actuaciones aquí", noDiscover: "No hay actuaciones públicas aún", score: "Puntuación", addComment: "Añadir comentario...", showComments: "comentarios", loadMore: "Cargar más" },
  ru: { feed: "Подписки", discover: "Обзор", title: "Сообщество", subtitle: "Смотрите, что поют другие", noFeed: "Выступлений пока нет", noFeedDesc: "Подписывайтесь на других певцов", noDiscover: "Публичных выступлений пока нет", score: "Счёт", addComment: "Добавить комментарий...", showComments: "комментарии", loadMore: "Загрузить ещё" },
  fr: { feed: "Abonnements", discover: "Découvrir", title: "Communauté", subtitle: "Découvrez ce que chantent les autres", noFeed: "Pas encore de performances", noFeedDesc: "Suivez d'autres chanteurs", noDiscover: "Pas encore de performances publiques", score: "Score", addComment: "Ajouter un commentaire...", showComments: "commentaires", loadMore: "Charger plus" },
  de: { feed: "Folge", discover: "Entdecken", title: "Community", subtitle: "Schau was andere singen", noFeed: "Noch keine Auftritte", noFeedDesc: "Folge anderen Sängern", noDiscover: "Noch keine öffentlichen Auftritte", score: "Punkte", addComment: "Kommentar hinzufügen...", showComments: "Kommentare", loadMore: "Mehr laden" },
  th: { feed: "ติดตาม", discover: "ค้นพบ", title: "ชุมชน", subtitle: "ดูว่าคนอื่นร้องเพลงอะไร", noFeed: "ยังไม่มีการแสดง", noFeedDesc: "ติดตามนักร้องคนอื่น", noDiscover: "ยังไม่มีการแสดงสาธารณะ", score: "คะแนน", addComment: "เพิ่มความคิดเห็น...", showComments: "ความคิดเห็น", loadMore: "โหลดเพิ่ม" },
  vi: { feed: "Theo dõi", discover: "Khám phá", title: "Cộng đồng", subtitle: "Xem mọi người đang hát gì", noFeed: "Chưa có buổi biểu diễn", noFeedDesc: "Theo dõi ca sĩ khác", noDiscover: "Chưa có buổi biểu diễn công khai", score: "Điểm", addComment: "Thêm bình luận...", showComments: "bình luận", loadMore: "Tải thêm" },
  fil: { feed: "Sinusundan", discover: "Tuklasin", title: "Komunidad", subtitle: "Tingnan ang kinakanta ng iba", noFeed: "Wala pang performance", noFeedDesc: "Mag-follow ng ibang mang-aawit", noDiscover: "Wala pang pampublikong performance", score: "Puntos", addComment: "Magdagdag ng komento...", showComments: "mga komento", loadMore: "Magpakita pa" },
  id: { feed: "Mengikuti", discover: "Jelajahi", title: "Komunitas", subtitle: "Lihat apa yang orang lain nyanyikan", noFeed: "Belum ada penampilan", noFeedDesc: "Ikuti penyanyi lain", noDiscover: "Belum ada penampilan publik", score: "Skor", addComment: "Tambahkan komentar...", showComments: "komentar", loadMore: "Muat lebih banyak" },
};

function CommentsSection({ performanceId, lang }: { performanceId: number; lang: string }) {
  const t = T[lang] || T.en;
  const { data } = useComments(performanceId);
  const addComment = useAddComment();
  const [text, setText] = useState("");

  return (
    <div className="border-t border-white/[0.05] mt-3 pt-3">
      <div className="max-h-48 overflow-y-auto space-y-2.5 mb-3">
        {(data?.comments || []).map((c: any) => (
          <div key={c.id} className="flex gap-2.5 text-sm">
            <div className="w-7 h-7 rounded-full ds-icon-orb shrink-0">
              {c.picture ? <img src={c.picture} alt="" className="w-7 h-7 rounded-full object-cover" /> : <span className="text-[10px] text-white">{(c.display_name || "?")[0]}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-white/75 font-semibold text-xs">{c.display_name}</span>
              <p className="text-white/55 text-xs mt-0.5" dir="auto">{c.content}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={t.addComment}
          className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-full px-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-400/50 focus:bg-white/[0.06] transition-all"
          onKeyDown={e => {
            if (e.key === "Enter" && text.trim()) {
              addComment.mutate({ performanceId, content: text.trim() });
              setText("");
            }
          }}
        />
        <button
          onClick={() => { if (text.trim()) { addComment.mutate({ performanceId, content: text.trim() }); setText(""); } }}
          className="w-9 h-9 rounded-full ds-glass flex items-center justify-center text-violet-300 hover:text-white hover:bg-violet-500/20 transition-all disabled:opacity-30"
          disabled={!text.trim()}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function PerformanceCard({ perf, lang, idx }: { perf: any; lang: string; idx: number }) {
  const t = T[lang] || T.en;
  const like = useLikePerformance();
  const [showComments, setShowComments] = useState(false);
  const scoreColor = perf.score >= 90 ? "text-emerald-300" : perf.score >= 70 ? "text-amber-300" : perf.score >= 50 ? "text-orange-300" : "text-rose-300";

  return (
    <div className="ds-card relative overflow-hidden p-5 ds-reveal hover:border-white/15 transition-all duration-500 group" style={{ animationDelay: `${idx * 50}ms` }}>
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-violet-500/8 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative">
        <div className="flex items-center gap-3 mb-3.5">
          <Link href={`/profile/${perf.user_id}`}>
            <div className="cursor-pointer shrink-0">
              {perf.picture ? (
                <img src={perf.picture} alt="" className="w-11 h-11 rounded-full object-cover ring-2 ring-violet-400/25" />
              ) : (
                <div className="w-11 h-11 rounded-full ds-icon-orb">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          </Link>
          <div className="flex-1 min-w-0">
            <Link href={`/profile/${perf.user_id}`}>
              <span className="text-sm font-semibold text-white hover:text-violet-200 cursor-pointer transition-colors">{perf.display_name}</span>
            </Link>
            <p className="text-xs text-white/35 mt-0.5">{new Date(perf.created_at).toLocaleDateString()}</p>
          </div>
          <div className={`text-3xl font-black ${scoreColor} drop-shadow-[0_0_10px_currentColor] leading-none`} style={{ filter: "brightness(1.1)" }}>{perf.score}</div>
        </div>

        <div className="flex items-center gap-2 mb-3 ds-glass rounded-full px-3 py-1.5 w-fit">
          <Music className="w-4 h-4 text-violet-300" />
          <span className="text-sm text-white/75 font-medium" dir="auto">{perf.song_name || "Unknown"}</span>
        </div>

        <div className="flex gap-3 text-xs">
          <span className="text-white/35">Pitch <span className="text-white/65 font-semibold ml-1">{perf.pitch_score}</span></span>
          <span className="text-white/15">·</span>
          <span className="text-white/35">Timing <span className="text-white/65 font-semibold ml-1">{perf.timing_score}</span></span>
        </div>

        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/[0.05]">
          <button
            onClick={() => like.mutate({ performanceId: perf.id, like: !perf.liked_by_me })}
            className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full transition-all ${
              perf.liked_by_me
                ? "text-rose-300 bg-rose-500/15 border border-rose-400/30 drop-shadow-[0_0_8px_rgba(248,113,113,.4)]"
                : "text-white/40 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent"
            }`}
          >
            <Heart className={`w-4 h-4 ${perf.liked_by_me ? "fill-current" : ""}`} />
            {perf.like_count || 0}
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/40 hover:text-violet-300 transition-colors px-3 py-1.5 rounded-full"
          >
            <MessageCircle className="w-4 h-4" />
            {perf.comment_count || 0}
          </button>
        </div>

        {showComments && <CommentsSection performanceId={perf.id} lang={lang} />}
      </div>
    </div>
  );
}

export default function Feed() {
  const { lang } = useLang();
  const t = T[lang] || T.en;
  const isRtl = lang === "he" || lang === "ar";
  const [tab, setTab] = useState<"feed" | "discover">("discover");
  const [page, setPage] = useState(0);

  const feed = useFeed(tab === "feed" ? page : -1);
  const discover = useDiscover(tab === "discover" ? page : -1);

  const data = tab === "feed" ? feed.data : discover.data;
  const isLoading = tab === "feed" ? feed.isLoading : discover.isLoading;
  const performances = data?.performances || [];

  return (
    <div className="min-h-screen bg-[var(--ds-bg-app)] relative" dir={isRtl ? "rtl" : "ltr"}>
      <div className="absolute top-0 inset-x-0 h-[400px] -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 ds-bg-aurora opacity-50" />
        <div className="ds-orb ds-orb-violet absolute -top-24 -left-24 w-[400px] h-[400px] opacity-50" />
        <div className="ds-orb ds-orb-pink absolute top-10 -right-24 w-[360px] h-[360px] opacity-40" style={{ animationDelay: "2s" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050510]/30 via-transparent to-[#050510]" />
      </div>

      <div className="w-full max-w-2xl mx-auto px-4 py-10">
        <div className="text-center mb-8 ds-reveal">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl ds-icon-orb mb-4">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="ds-page-title font-bold text-white mb-1">{t.title}</h1>
          <p className="text-white/55 text-sm sm:text-base">{t.subtitle}</p>
        </div>

        <div className="flex gap-1.5 ds-glass p-1.5 rounded-2xl mb-6">
          {(["discover", "feed"] as const).map(key => {
            const Icon = key === "discover" ? Globe2 : Users;
            const isActive = tab === key;
            return (
              <button
                key={key}
                onClick={() => { setTab(key); setPage(0); }}
                className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive ? "text-white" : "text-white/40 hover:text-white/75"
                }`}
                style={isActive ? { background: "var(--ds-grad-primary)", boxShadow: "var(--ds-glow-violet)" } : {}}
              >
                <Icon className="w-4 h-4" />
                {t[key]}
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-violet-300 border-t-transparent rounded-full animate-spin" /></div>
        ) : performances.length === 0 ? (
          <div className="ds-card-feature text-center py-16 px-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center mb-5">
              <Music className="w-8 h-8 text-white/30" />
            </div>
            <p className="text-white/65 text-base font-semibold">{tab === "feed" ? t.noFeed : t.noDiscover}</p>
            {tab === "feed" && <p className="text-white/40 text-sm mt-1.5">{t.noFeedDesc}</p>}
          </div>
        ) : (
          <div className="space-y-3.5">
            {performances.map((p: any, i: number) => (
              <PerformanceCard key={p.id} perf={p} lang={lang} idx={i} />
            ))}
            {data?.hasMore && (
              <button
                onClick={() => setPage(p => p + 1)}
                className="w-full py-3.5 text-sm font-semibold text-white/45 hover:text-white flex items-center justify-center gap-2 ds-glass rounded-2xl transition-all"
              >
                <ChevronDown className="w-4 h-4" />{t.loadMore}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
