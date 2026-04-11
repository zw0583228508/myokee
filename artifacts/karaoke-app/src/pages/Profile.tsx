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
  ar: { followers: "متابعون", following: "يتابع", performances: "عروض", follow: "متابعة", unfollow: "إلغاء المتابعة", level: "المستوى", noPerf: "لا توجد عروض عامة بعد", back: "رجوع" },
  ko: { followers: "팔로워", following: "팔로잉", performances: "공연", follow: "팔로우", unfollow: "언팔로우", level: "레벨", noPerf: "아직 공개 공연이 없습니다", back: "뒤로" },
  ja: { followers: "フォロワー", following: "フォロー中", performances: "パフォーマンス", follow: "フォロー", unfollow: "フォロー解除", level: "レベル", noPerf: "まだ公開パフォーマンスがありません", back: "戻る" },
  zh: { followers: "粉丝", following: "关注", performances: "演出", follow: "关注", unfollow: "取消关注", level: "等级", noPerf: "还没有公开演出", back: "返回" },
  es: { followers: "Seguidores", following: "Siguiendo", performances: "Actuaciones", follow: "Seguir", unfollow: "Dejar de seguir", level: "Nivel", noPerf: "No hay actuaciones públicas aún", back: "Volver" },
  ru: { followers: "Подписчики", following: "Подписки", performances: "Выступления", follow: "Подписаться", unfollow: "Отписаться", level: "Уровень", noPerf: "Публичных выступлений пока нет", back: "Назад" },
  fr: { followers: "Abonnés", following: "Abonnements", performances: "Performances", follow: "Suivre", unfollow: "Ne plus suivre", level: "Niveau", noPerf: "Pas encore de performances publiques", back: "Retour" },
  de: { followers: "Follower", following: "Folgt", performances: "Auftritte", follow: "Folgen", unfollow: "Entfolgen", level: "Level", noPerf: "Noch keine öffentlichen Auftritte", back: "Zurück" },
  th: { followers: "ผู้ติดตาม", following: "กำลังติดตาม", performances: "การแสดง", follow: "ติดตาม", unfollow: "เลิกติดตาม", level: "ระดับ", noPerf: "ยังไม่มีการแสดงสาธารณะ", back: "กลับ" },
  vi: { followers: "Người theo dõi", following: "Đang theo dõi", performances: "Biểu diễn", follow: "Theo dõi", unfollow: "Bỏ theo dõi", level: "Cấp độ", noPerf: "Chưa có buổi biểu diễn công khai", back: "Quay lại" },
  fil: { followers: "Mga Tagasunod", following: "Sinusundan", performances: "Mga Performance", follow: "Sundan", unfollow: "I-unfollow", level: "Antas", noPerf: "Wala pang pampublikong performance", back: "Bumalik" },
  id: { followers: "Pengikut", following: "Mengikuti", performances: "Penampilan", follow: "Ikuti", unfollow: "Berhenti mengikuti", level: "Level", noPerf: "Belum ada penampilan publik", back: "Kembali" },
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
  if (!data) return <div className="text-center py-20 text-white/30">User not found</div>;

  const { user, stats, isFollowing, performances } = data;
  const isMe = me === userId;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8" dir={isRtl ? "rtl" : "ltr"}>
      <Link href="/feed">
        <button className="flex items-center gap-2 text-white/30 hover:text-white/70 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />{t.back}
        </button>
      </Link>

      <div className="glass-card rounded-2xl p-6 mb-6">
        <div className="relative">
          <div className="flex items-center gap-4 mb-6">
            {user.picture ? (
              <img src={user.picture} alt="" className="w-20 h-20 rounded-full object-cover ring-4 ring-primary/15 shadow-lg shadow-primary/10" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                <User className="w-10 h-10 text-white" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white font-display">{user.display_name}</h1>
              <div className="flex items-center gap-2 text-sm text-white/30 mt-1">
                <Zap className="w-4 h-4 text-primary drop-shadow-[0_0_6px_rgba(147,51,234,0.5)]" />
                {t.level} {stats.level}
                <span className="text-primary/40">•</span>
                {stats.totalXp} XP
              </div>
            </div>
            {!isMe && (
              <button
                onClick={() => follow.mutate({ userId, follow: !isFollowing })}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  isFollowing
                    ? "bg-white/[0.06] text-white/60 hover:bg-red-500/15 hover:text-red-400 border border-white/[0.06]"
                    : "btn-primary text-white"
                }`}
              >
                {isFollowing ? t.unfollow : t.follow}
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: t.followers, value: stats.followers, icon: Users },
              { label: t.following, value: stats.following, icon: Users },
              { label: t.performances, value: stats.performances, icon: Music },
            ].map(s => (
              <div key={s.label} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3">
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-white/30 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-white mb-4 font-display">{t.performances}</h2>

      {performances.length === 0 ? (
        <p className="text-center py-8 text-white/20">{t.noPerf}</p>
      ) : (
        <div className="space-y-3">
          {performances.map((p: any) => {
            const scoreColor = p.score >= 90 ? "text-green-400" : p.score >= 70 ? "text-yellow-400" : "text-orange-400";
            return (
              <div key={p.id} className="glass-card rounded-xl p-4 flex items-center gap-3 transition-all duration-300 hover:border-white/10">
                <div className="relative">
                  <div className={`text-2xl font-bold ${scoreColor} w-12 text-center`} style={{ filter: "brightness(1.1)" }}>{p.score}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80 truncate">{p.song_name || "Unknown"}</p>
                  <p className="text-xs text-white/20">{new Date(p.created_at).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => like.mutate({ performanceId: p.id, like: !p.liked_by_me })}
                  className={`p-2 transition-all duration-300 ${p.liked_by_me ? "text-red-400 drop-shadow-[0_0_6px_rgba(248,113,113,0.4)]" : "text-white/20 hover:text-red-400"}`}
                >
                  <Heart className={`w-4 h-4 ${p.liked_by_me ? "fill-current" : ""}`} />
                </button>
                <span className="text-xs text-white/20">{p.like_count || 0}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
