import { useState } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { useFeed, useDiscover, useLikePerformance, useComments, useAddComment } from "@/hooks/use-social";
import { useAuth } from "@/hooks/use-auth";
import { Heart, MessageCircle, User, Music, ChevronDown, Send } from "lucide-react";
import { Link } from "wouter";

const T: Record<string, Record<string, string>> = {
  en: {
    feed: "Feed",
    discover: "Discover",
    title: "Social Feed",
    subtitle: "See what others are singing",
    noFeed: "No performances yet",
    noFeedDesc: "Follow other singers to see their performances here",
    noDiscover: "No public performances yet",
    score: "Score",
    like: "Like",
    comment: "Comment",
    addComment: "Add a comment...",
    send: "Send",
    viewProfile: "View Profile",
    showComments: "comments",
    loadMore: "Load More",
  },
  he: {
    feed: "פיד",
    discover: "גילוי",
    title: "פיד חברתי",
    subtitle: "ראו מה אחרים שרים",
    noFeed: "אין ביצועים עדיין",
    noFeedDesc: "עקבו אחרי זמרים אחרים כדי לראות את הביצועים שלהם כאן",
    noDiscover: "אין ביצועים פומביים עדיין",
    score: "ציון",
    like: "לייק",
    comment: "תגובה",
    addComment: "הוסף תגובה...",
    send: "שלח",
    viewProfile: "צפה בפרופיל",
    showComments: "תגובות",
    loadMore: "טען עוד",
  },
};

function CommentsSection({ performanceId, lang }: { performanceId: number; lang: string }) {
  const t = T[lang] || T.en;
  const { data } = useComments(performanceId);
  const addComment = useAddComment();
  const [text, setText] = useState("");

  return (
    <div className="border-t border-white/5 mt-3 pt-3">
      <div className="max-h-48 overflow-y-auto space-y-2 mb-3">
        {(data?.comments || []).map((c: any) => (
          <div key={c.id} className="flex gap-2 text-sm">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/50 to-accent/50 flex items-center justify-center flex-shrink-0">
              {c.picture ? <img src={c.picture} alt="" className="w-6 h-6 rounded-full object-cover" /> : <span className="text-[10px] text-white">{(c.display_name || "?")[0]}</span>}
            </div>
            <div>
              <span className="text-white/70 font-medium text-xs">{c.display_name}</span>
              <p className="text-white/50 text-xs">{c.content}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={t.addComment}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50"
          onKeyDown={e => {
            if (e.key === "Enter" && text.trim()) {
              addComment.mutate({ performanceId, content: text.trim() });
              setText("");
            }
          }}
        />
        <button
          onClick={() => { if (text.trim()) { addComment.mutate({ performanceId, content: text.trim() }); setText(""); } }}
          className="p-2 text-primary hover:text-white transition-colors"
          disabled={!text.trim()}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function PerformanceCard({ perf, lang }: { perf: any; lang: string }) {
  const t = T[lang] || T.en;
  const like = useLikePerformance();
  const [showComments, setShowComments] = useState(false);
  const isRtl = lang === "he" || lang === "ar";

  const scoreColor = perf.score >= 90 ? "text-green-400" : perf.score >= 70 ? "text-yellow-400" : perf.score >= 50 ? "text-orange-400" : "text-red-400";

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 transition-all hover:border-white/15">
      <div className="flex items-center gap-3 mb-3">
        <Link href={`/profile/${perf.user_id}`}>
          <div className="cursor-pointer">
            {perf.picture ? (
              <img src={perf.picture} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/profile/${perf.user_id}`}>
            <span className="text-sm font-medium text-white hover:text-primary cursor-pointer transition-colors">{perf.display_name}</span>
          </Link>
          <p className="text-xs text-white/30">{new Date(perf.created_at).toLocaleDateString()}</p>
        </div>
        <div className={`text-2xl font-bold ${scoreColor}`}>{perf.score}</div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Music className="w-4 h-4 text-primary/60" />
        <span className="text-sm text-white/70">{perf.song_name || "Unknown"}</span>
      </div>

      <div className="flex gap-4 text-sm text-white/40">
        <div className="flex gap-1">
          <span className="text-white/30">Pitch:</span>
          <span className="text-white/60">{perf.pitch_score}</span>
        </div>
        <div className="flex gap-1">
          <span className="text-white/30">Timing:</span>
          <span className="text-white/60">{perf.timing_score}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/5">
        <button
          onClick={() => like.mutate({ performanceId: perf.id, like: !perf.liked_by_me })}
          className={`flex items-center gap-1.5 text-sm transition-colors ${perf.liked_by_me ? "text-red-400" : "text-white/40 hover:text-red-400"}`}
        >
          <Heart className={`w-4 h-4 ${perf.liked_by_me ? "fill-current" : ""}`} />
          {perf.like_count || 0}
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm text-white/40 hover:text-primary transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          {perf.comment_count || 0} {t.showComments}
        </button>
      </div>

      {showComments && <CommentsSection performanceId={perf.id} lang={lang} />}
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
    <div className="w-full max-w-2xl mx-auto px-4 py-8" dir={isRtl ? "rtl" : "ltr"}>
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white mb-1">{t.title}</h1>
        <p className="text-white/50 text-sm">{t.subtitle}</p>
      </div>

      <div className="flex gap-1 bg-white/[0.03] p-1 rounded-xl mb-6">
        {(["discover", "feed"] as const).map(key => (
          <button
            key={key}
            onClick={() => { setTab(key); setPage(0); }}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              tab === key ? "bg-primary/20 text-primary" : "text-white/40 hover:text-white"
            }`}
          >
            {t[key]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : performances.length === 0 ? (
        <div className="text-center py-16">
          <Music className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 text-lg">{tab === "feed" ? t.noFeed : t.noDiscover}</p>
          {tab === "feed" && <p className="text-white/30 text-sm mt-2">{t.noFeedDesc}</p>}
        </div>
      ) : (
        <div className="space-y-4">
          {performances.map((p: any) => (
            <PerformanceCard key={p.id} perf={p} lang={lang} />
          ))}
          {data?.hasMore && (
            <button
              onClick={() => setPage(p => p + 1)}
              className="w-full py-3 text-sm text-white/40 hover:text-white flex items-center justify-center gap-2 transition-colors"
            >
              <ChevronDown className="w-4 h-4" />{t.loadMore}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
