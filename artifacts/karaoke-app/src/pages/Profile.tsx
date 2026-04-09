import { useLang } from "@/contexts/LanguageContext";
import { useProfile, useFollow, useLikePerformance } from "@/hooks/use-social";
import { useAuth } from "@/hooks/use-auth";
import { useRoute } from "wouter";
import { User, Users, Music, Star, Heart, ArrowLeft, Zap } from "lucide-react";
import { Link } from "wouter";

const T: Record<string, Record<string, string>> = {
  en: {
    followers: "Followers",
    following: "Following",
    performances: "Performances",
    follow: "Follow",
    unfollow: "Unfollow",
    level: "Level",
    noPerf: "No public performances yet",
    back: "Back",
  },
  he: {
    followers: "עוקבים",
    following: "עוקב",
    performances: "ביצועים",
    follow: "עקוב",
    unfollow: "הפסק לעקוב",
    level: "רמה",
    noPerf: "אין ביצועים פומביים עדיין",
    back: "חזרה",
  },
};

export default function Profile() {
  const [, params] = useRoute("/profile/:userId");
  const userId = params?.userId || "";
  const { lang } = useLang();
  const t = T[lang] || T.en;
  const isRtl = lang === "he" || lang === "ar";
  const { data: authData } = useAuth();
  const me = authData?.user?.id;
  const { data, isLoading } = useProfile(userId);
  const follow = useFollow();
  const like = useLikePerformance();

  if (isLoading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return <div className="text-center py-20 text-white/40">User not found</div>;

  const { user, stats, isFollowing, performances } = data;
  const isMe = me === userId;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8" dir={isRtl ? "rtl" : "ltr"}>
      <Link href="/feed">
        <button className="flex items-center gap-2 text-white/50 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />{t.back}
        </button>
      </Link>

      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          {user.picture ? (
            <img src={user.picture} alt="" className="w-20 h-20 rounded-full object-cover ring-4 ring-primary/20" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{user.display_name}</h1>
            <div className="flex items-center gap-2 text-sm text-white/40 mt-1">
              <Zap className="w-4 h-4 text-primary" />
              {t.level} {stats.level}
              <span className="text-primary">•</span>
              {stats.totalXp} XP
            </div>
          </div>
          {!isMe && (
            <button
              onClick={() => follow.mutate({ userId, follow: !isFollowing })}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                isFollowing
                  ? "bg-white/10 text-white/70 hover:bg-red-500/20 hover:text-red-400"
                  : "bg-primary text-white hover:bg-primary/80"
              }`}
            >
              {isFollowing ? t.unfollow : t.follow}
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: t.followers, value: stats.followers, icon: Users },
            { label: t.following, value: stats.following, icon: Users },
            { label: t.performances, value: stats.performances, icon: Music },
          ].map(s => (
            <div key={s.label} className="bg-white/[0.03] rounded-xl p-3">
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-white/40 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <h2 className="text-lg font-semibold text-white mb-4">{t.performances}</h2>

      {performances.length === 0 ? (
        <p className="text-center py-8 text-white/30">{t.noPerf}</p>
      ) : (
        <div className="space-y-3">
          {performances.map((p: any) => {
            const scoreColor = p.score >= 90 ? "text-green-400" : p.score >= 70 ? "text-yellow-400" : "text-orange-400";
            return (
              <div key={p.id} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex items-center gap-3">
                <div className={`text-2xl font-bold ${scoreColor} w-12 text-center`}>{p.score}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{p.song_name || "Unknown"}</p>
                  <p className="text-xs text-white/30">{new Date(p.created_at).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => like.mutate({ performanceId: p.id, like: !p.liked_by_me })}
                  className={`p-2 transition-colors ${p.liked_by_me ? "text-red-400" : "text-white/30 hover:text-red-400"}`}
                >
                  <Heart className={`w-4 h-4 ${p.liked_by_me ? "fill-current" : ""}`} />
                </button>
                <span className="text-xs text-white/30">{p.like_count || 0}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
