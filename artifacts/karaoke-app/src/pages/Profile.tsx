import { useLang } from "@/contexts/LanguageContext";
import { useProfile, useFollow, useLikePerformance } from "@/hooks/use-social";
import { useAuth } from "@/hooks/use-auth";
import { useRoute } from "wouter";
import { User, Users, Music, Heart, ArrowLeft, Zap, Crown, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { buildDemoProfile, isDemo } from "@/lib/demoData";

const T: Record<string, Record<string, string>> = {
  en: { followers: "Followers", following: "Following", performances: "Performances", follow: "Follow", unfollow: "Unfollow", level: "Level", noPerf: "No public performances yet", back: "Back" },
  he: { followers: "עוקבים", following: "עוקב", performances: "ביצועים", follow: "עקוב", unfollow: "הפסק לעקוב", level: "רמה", noPerf: "אין ביצועים פומביים עדיין", back: "חזרה" },
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
  const { data: realData, isLoading } = useProfile(userId);
  const follow = useFollow();
  const like = useLikePerformance();

  // If the backend has no record for this user, fall back to a demo
  // profile when the userId matches one of our demo singers (e.g. links
  // coming from demo Feed/Leaderboard rows). This keeps the page lively.
  // Additionally, if a real profile has no performances, inject demo
  // performance cards (non-interactive) so the page never looks empty.
  let data = realData ?? buildDemoProfile(userId, lang);
  if (realData && (!realData.performances || realData.performances.length === 0)) {
    const fillerProfile = buildDemoProfile("demo-1", lang);
    data = {
      ...realData,
      performances: fillerProfile ? fillerProfile.performances.slice(0, 3) : [],
    };
  }

  if (isLoading)
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[var(--ds-bg-app)]">
        <Loader2 className="w-8 h-8 text-violet-300 animate-spin" />
      </div>
    );

  if (!data)
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[var(--ds-bg-app)] text-white/40 text-sm">
        User not found
      </div>
    );

  const { user, stats, isFollowing, performances } = data;
  const isMe = me === userId;
  const demo = isDemo(data);

  return (
    <div className="min-h-screen relative bg-[var(--ds-bg-app)]" dir={isRtl ? "rtl" : "ltr"}>
      {/* Cinematic top background */}
      <div className="absolute top-0 inset-x-0 h-[420px] -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 ds-bg-aurora opacity-50" />
        <div className="ds-orb ds-orb-violet absolute -top-24 left-1/4 w-[400px] h-[400px] opacity-50" />
        <div className="ds-orb ds-orb-cyan absolute top-10 -right-24 w-[360px] h-[360px] opacity-40" style={{ animationDelay: "2s" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050510]/30 via-transparent to-[#050510]" />
      </div>

      <div className="w-full max-w-2xl mx-auto px-4 py-10">
        <Link href="/feed">
          <button className="inline-flex items-center gap-2 text-white/45 hover:text-white mb-6 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />{t.back}
          </button>
        </Link>

        <div className="ds-card-feature relative p-6 sm:p-8 mb-6 overflow-hidden ds-reveal">
          <div className="ds-orb ds-orb-violet absolute -top-12 -right-12 w-48 h-48 opacity-50" />
          <div className="relative">
            <div className="flex items-center gap-5 mb-7">
              <div className="relative shrink-0">
                {user.picture ? (
                  <img src={user.picture} alt="" className="w-24 h-24 rounded-full object-cover ring-4 ring-violet-500/30 shadow-[0_0_30px_rgba(139,92,246,.45)]" />
                ) : (
                  <div className="ds-icon-orb w-24 h-24 rounded-full">
                    <User className="w-12 h-12 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">{user.display_name}</h1>
                <div className="flex items-center gap-2 text-sm text-white/55 mt-1.5">
                  <Zap className="w-4 h-4 text-amber-300 drop-shadow-[0_0_6px_rgba(250,204,21,.5)]" />
                  <span className="font-semibold text-white/80">{t.level} {stats.level}</span>
                  <span className="text-white/25">·</span>
                  <span>{stats.totalXp} XP</span>
                </div>
              </div>
              {!isMe && !demo && (
                <button
                  onClick={() => follow.mutate({ userId, follow: !isFollowing })}
                  className={
                    isFollowing
                      ? "px-5 py-2.5 rounded-full text-sm font-semibold ds-glass border border-white/15 text-white/65 hover:bg-rose-500/15 hover:text-rose-300 hover:border-rose-400/30 transition-all"
                      : "ds-btn ds-btn-primary px-5 py-2.5 text-sm"
                  }
                >
                  {isFollowing ? t.unfollow : t.follow}
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: t.followers, value: stats.followers, icon: Users, color: "text-violet-300" },
                { label: t.following, value: stats.following, icon: Users, color: "text-cyan-300" },
                { label: t.performances, value: stats.performances, icon: Music, color: "text-pink-300" },
              ].map(s => (
                <div key={s.label} className="ds-glass rounded-xl p-4">
                  <s.icon className={`w-4 h-4 ${s.color} mx-auto mb-1.5`} />
                  <div className="text-2xl font-black text-white">{s.value}</div>
                  <div className="text-[11px] text-white/45 uppercase tracking-wider mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-300" />
          {t.performances}
        </h2>

        {performances.length === 0 ? (
          <div className="ds-card text-center py-10 text-white/35">{t.noPerf}</div>
        ) : (
          <div className="space-y-3">
            {performances.map((p: any) => {
              const scoreColor = p.score >= 90 ? "text-emerald-300" : p.score >= 70 ? "text-amber-300" : "text-orange-300";
              return (
                <div key={p.id} className="ds-card p-4 flex items-center gap-3 hover:border-white/15 transition-all">
                  <div className={`text-3xl font-black ${scoreColor} w-14 text-center drop-shadow-[0_0_10px_currentColor]`} style={{ filter: "brightness(1.1)" }}>
                    {p.score}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{p.song_name || "Unknown"}</p>
                    <p className="text-xs text-white/35 mt-0.5">{new Date(p.created_at).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => { if (!demo && !isDemo(p)) like.mutate({ performanceId: p.id, like: !p.liked_by_me }); }}
                    disabled={demo || isDemo(p)}
                    className={`p-2 rounded-full transition-all ${
                      p.liked_by_me
                        ? "text-rose-400 bg-rose-500/15 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]"
                        : "text-white/30 hover:text-rose-400 hover:bg-rose-500/10"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${p.liked_by_me ? "fill-current" : ""}`} />
                  </button>
                  <span className="text-xs text-white/40 min-w-[1.5rem] text-end">{p.like_count || 0}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
