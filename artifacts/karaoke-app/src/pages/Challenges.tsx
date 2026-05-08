import { useState } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { useChallenges, useChallengeDetail, useEnterChallenge } from "@/hooks/use-challenges";
import { useMyPerformances } from "@/hooks/use-performances";
import { Trophy, Clock, Users, ChevronRight, Medal, Star, ArrowLeft, Check, Music2, Sparkles } from "lucide-react";

const T: Record<string, Record<string, string>> = {
  en: { title: "Weekly Challenges", subtitle: "Compete with singers worldwide", active: "Active", upcoming: "Upcoming", ended: "Ended", participants: "participants", prize: "Prize", credits: "credits", enterChallenge: "Enter Challenge", leaderboard: "Leaderboard", noChallenge: "No challenges yet", noDesc: "New challenges are posted every week. Check back soon!", rank: "Rank", singer: "Singer", score: "Score", timeLeft: "Time left", days: "d", hours: "h", mins: "m", entered: "Entered", back: "Back", yourScore: "Your Score", selectPerformance: "Select a performance to submit" },
  he: { title: "אתגרים שבועיים", subtitle: "התחרו עם זמרים מכל העולם", active: "פעיל", upcoming: "בקרוב", ended: "הסתיים", participants: "משתתפים", prize: "פרס", credits: "קרדיטים", enterChallenge: "הצטרף לאתגר", leaderboard: "טבלת מובילים", noChallenge: "אין אתגרים עדיין", noDesc: "אתגרים חדשים מתפרסמים כל שבוע. חזרו בקרוב!", rank: "דירוג", singer: "זמר", score: "ציון", timeLeft: "זמן נותר", days: "י", hours: "ש", mins: "ד", entered: "נרשמת", back: "חזרה", yourScore: "הציון שלך", selectPerformance: "בחר ביצוע להגשה" },
  ar: { title: "تحديات أسبوعية", subtitle: "تنافس مع مغنين من حول العالم", active: "نشط", upcoming: "قادم", ended: "انتهى", participants: "مشاركين", prize: "جائزة", credits: "رصيد", enterChallenge: "شارك في التحدي", leaderboard: "لوحة المتصدرين", noChallenge: "لا توجد تحديات بعد", noDesc: "تُنشر تحديات جديدة كل أسبوع. عد قريبًا!", rank: "الترتيب", singer: "مغني", score: "النتيجة", timeLeft: "الوقت المتبقي", days: "ي", hours: "س", mins: "د", entered: "مسجل", back: "رجوع", yourScore: "نتيجتك", selectPerformance: "اختر أداءً للإرسال" },
  ko: { title: "주간 챌린지", subtitle: "전 세계 가수들과 경쟁하세요", active: "진행중", upcoming: "예정", ended: "종료", participants: "참가자", prize: "상금", credits: "크레딧", enterChallenge: "챌린지 참가", leaderboard: "리더보드", noChallenge: "아직 챌린지가 없습니다", noDesc: "매주 새로운 챌린지가 게시됩니다. 곧 다시 확인하세요!", rank: "순위", singer: "가수", score: "점수", timeLeft: "남은 시간", days: "일", hours: "시", mins: "분", entered: "참가완료", back: "뒤로", yourScore: "내 점수", selectPerformance: "제출할 공연을 선택하세요" },
  ja: { title: "ウィークリーチャレンジ", subtitle: "世界中の歌手と競争しよう", active: "開催中", upcoming: "近日", ended: "終了", participants: "参加者", prize: "賞品", credits: "クレジット", enterChallenge: "チャレンジに参加", leaderboard: "リーダーボード", noChallenge: "まだチャレンジはありません", noDesc: "毎週新しいチャレンジが公開されます。またチェックしてください！", rank: "順位", singer: "歌手", score: "スコア", timeLeft: "残り時間", days: "日", hours: "時", mins: "分", entered: "参加済み", back: "戻る", yourScore: "あなたのスコア", selectPerformance: "提出するパフォーマンスを選択" },
  zh: { title: "每周挑战", subtitle: "与全球歌手一较高下", active: "进行中", upcoming: "即将开始", ended: "已结束", participants: "参与者", prize: "奖品", credits: "积分", enterChallenge: "参加挑战", leaderboard: "排行榜", noChallenge: "暂无挑战", noDesc: "每周发布新挑战，请稍后再来！", rank: "排名", singer: "歌手", score: "分数", timeLeft: "剩余时间", days: "天", hours: "时", mins: "分", entered: "已参加", back: "返回", yourScore: "你的分数", selectPerformance: "选择要提交的表演" },
  es: { title: "Desafíos semanales", subtitle: "Compite con cantantes de todo el mundo", active: "Activo", upcoming: "Próximo", ended: "Finalizado", participants: "participantes", prize: "Premio", credits: "créditos", enterChallenge: "Participar", leaderboard: "Tabla de líderes", noChallenge: "No hay desafíos aún", noDesc: "Se publican nuevos desafíos cada semana. ¡Vuelve pronto!", rank: "Pos.", singer: "Cantante", score: "Puntuación", timeLeft: "Tiempo restante", days: "d", hours: "h", mins: "m", entered: "Inscrito", back: "Volver", yourScore: "Tu puntuación", selectPerformance: "Selecciona una actuación para enviar" },
  ru: { title: "Еженедельные вызовы", subtitle: "Соревнуйтесь с певцами со всего мира", active: "Активно", upcoming: "Скоро", ended: "Завершено", participants: "участников", prize: "Приз", credits: "кредитов", enterChallenge: "Участвовать", leaderboard: "Таблица лидеров", noChallenge: "Пока нет вызовов", noDesc: "Новые вызовы публикуются каждую неделю. Заходите позже!", rank: "Место", singer: "Певец", score: "Счёт", timeLeft: "Осталось", days: "д", hours: "ч", mins: "м", entered: "Участвует", back: "Назад", yourScore: "Ваш счёт", selectPerformance: "Выберите выступление для отправки" },
  fr: { title: "Défis hebdomadaires", subtitle: "Affrontez des chanteurs du monde entier", active: "Actif", upcoming: "À venir", ended: "Terminé", participants: "participants", prize: "Prix", credits: "crédits", enterChallenge: "Participer", leaderboard: "Classement", noChallenge: "Pas encore de défis", noDesc: "De nouveaux défis sont publiés chaque semaine. Revenez bientôt !", rank: "Rang", singer: "Chanteur", score: "Score", timeLeft: "Temps restant", days: "j", hours: "h", mins: "m", entered: "Inscrit", back: "Retour", yourScore: "Votre score", selectPerformance: "Sélectionnez une performance à soumettre" },
  de: { title: "Wöchentliche Challenges", subtitle: "Tritt gegen Sänger weltweit an", active: "Aktiv", upcoming: "Bevorstehend", ended: "Beendet", participants: "Teilnehmer", prize: "Preis", credits: "Credits", enterChallenge: "Teilnehmen", leaderboard: "Bestenliste", noChallenge: "Noch keine Challenges", noDesc: "Jede Woche werden neue Challenges veröffentlicht. Schau bald wieder vorbei!", rank: "Rang", singer: "Sänger", score: "Punkte", timeLeft: "Verbleibend", days: "T", hours: "Std", mins: "Min", entered: "Teilgenommen", back: "Zurück", yourScore: "Deine Punkte", selectPerformance: "Wähle einen Auftritt zum Einreichen" },
  th: { title: "ชาเลนจ์ประจำสัปดาห์", subtitle: "แข่งขันกับนักร้องทั่วโลก", active: "กำลังดำเนินการ", upcoming: "เร็วๆ นี้", ended: "สิ้นสุดแล้ว", participants: "ผู้เข้าร่วม", prize: "รางวัล", credits: "เครดิต", enterChallenge: "เข้าร่วม", leaderboard: "อันดับ", noChallenge: "ยังไม่มีชาเลนจ์", noDesc: "ชาเลนจ์ใหม่จะเผยแพร่ทุกสัปดาห์ กลับมาเร็วๆ นี้!", rank: "อันดับ", singer: "นักร้อง", score: "คะแนน", timeLeft: "เวลาที่เหลือ", days: "ว", hours: "ชม", mins: "น", entered: "เข้าร่วมแล้ว", back: "กลับ", yourScore: "คะแนนของคุณ", selectPerformance: "เลือกการแสดงเพื่อส่ง" },
  vi: { title: "Thử thách hàng tuần", subtitle: "Thi đấu với ca sĩ toàn thế giới", active: "Đang diễn ra", upcoming: "Sắp tới", ended: "Đã kết thúc", participants: "người tham gia", prize: "Giải thưởng", credits: "tín dụng", enterChallenge: "Tham gia", leaderboard: "Bảng xếp hạng", noChallenge: "Chưa có thử thách", noDesc: "Thử thách mới được đăng hàng tuần. Hãy quay lại sớm!", rank: "Hạng", singer: "Ca sĩ", score: "Điểm", timeLeft: "Còn lại", days: "n", hours: "g", mins: "p", entered: "Đã tham gia", back: "Quay lại", yourScore: "Điểm của bạn", selectPerformance: "Chọn màn trình diễn để gửi" },
  fil: { title: "Lingguhang Hamon", subtitle: "Makipagkompetensya sa mga mang-aawit sa buong mundo", active: "Aktibo", upcoming: "Paparating", ended: "Tapos na", participants: "kalahok", prize: "Premyo", credits: "credits", enterChallenge: "Sumali", leaderboard: "Leaderboard", noChallenge: "Wala pang hamon", noDesc: "Bagong hamon ang ilalabas bawat linggo. Bumalik ka agad!", rank: "Ranggo", singer: "Mang-aawit", score: "Puntos", timeLeft: "Natitirang oras", days: "a", hours: "o", mins: "m", entered: "Sumali na", back: "Bumalik", yourScore: "Iyong puntos", selectPerformance: "Pumili ng performance na isusumite" },
  id: { title: "Tantangan Mingguan", subtitle: "Bersaing dengan penyanyi di seluruh dunia", active: "Aktif", upcoming: "Segera", ended: "Selesai", participants: "peserta", prize: "Hadiah", credits: "kredit", enterChallenge: "Ikut serta", leaderboard: "Papan peringkat", noChallenge: "Belum ada tantangan", noDesc: "Tantangan baru diterbitkan setiap minggu. Cek lagi nanti!", rank: "Peringkat", singer: "Penyanyi", score: "Skor", timeLeft: "Sisa waktu", days: "h", hours: "j", mins: "m", entered: "Terdaftar", back: "Kembali", yourScore: "Skor Anda", selectPerformance: "Pilih performa untuk dikirim" },
};

function getTimeLeft(endDate: string) {
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return null;
  return { days: Math.floor(diff / 86400000), hours: Math.floor((diff % 86400000) / 3600000), mins: Math.floor((diff % 3600000) / 60000) };
}

function ChallengeEntryForm({ challengeId, lang }: { challengeId: number; lang: string }) {
  const t = T[lang] || T.en;
  const { data: perfs, isLoading } = useMyPerformances();
  const enterChallenge = useEnterChallenge();
  const [selectedPerfId, setSelectedPerfId] = useState<number | null>(null);

  if (isLoading) return <div className="w-6 h-6 border-2 border-violet-300 border-t-transparent rounded-full animate-spin mx-auto" />;
  if (!perfs || perfs.length === 0) return <p className="text-white/40 text-sm">{t.noChallenge}</p>;

  return (
    <div className="mt-5 p-4 ds-glass rounded-xl">
      <p className="text-sm text-white/60 mb-3 font-medium">{t.selectPerformance}</p>
      <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
        {perfs.map((p: any) => {
          const sc = p.score >= 90 ? "text-emerald-300" : p.score >= 70 ? "text-amber-300" : "text-orange-300";
          const sel = selectedPerfId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedPerfId(p.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-start transition-all ${
                sel ? "bg-violet-500/20 border border-violet-400/40" : "bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06]"
              }`}
            >
              <span className={`text-lg font-bold ${sc} drop-shadow-[0_0_8px_currentColor]`}>{p.score}</span>
              <span className="text-sm text-white/70 flex-1 truncate" dir="auto">{p.song_name || "Unknown"}</span>
              {sel && <Check className="w-4 h-4 text-violet-300" />}
            </button>
          );
        })}
      </div>
      <button
        onClick={() => { if (selectedPerfId) enterChallenge.mutate({ challengeId, performanceId: selectedPerfId }); }}
        disabled={!selectedPerfId || enterChallenge.isPending}
        className="ds-btn ds-btn-primary w-full py-3 text-sm disabled:opacity-40"
      >
        {enterChallenge.isPending ? "..." : <><Sparkles className="w-4 h-4" />{t.enterChallenge}</>}
      </button>
    </div>
  );
}

function ChallengeDetail({ id, onBack, lang }: { id: number; onBack: () => void; lang: string }) {
  const { data, isLoading } = useChallengeDetail(id);
  const t = T[lang] || T.en;
  const isRtl = lang === "he" || lang === "ar";

  if (isLoading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-violet-300 border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return null;

  const { challenge, leaderboard, myEntry } = data;
  const timeLeft = getTimeLeft(challenge.end_date);

  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
      <button onClick={onBack} className="inline-flex items-center gap-2 text-white/45 hover:text-white mb-6 transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" />{t.back}
      </button>

      <div className="ds-card-feature relative p-6 sm:p-8 mb-6 overflow-hidden">
        <div className="ds-orb ds-orb-violet absolute -top-12 -right-12 w-48 h-48 opacity-50" />
        <div className="relative">
          <div className="flex items-start justify-between mb-4 gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-1.5">{challenge.title}</h2>
              {challenge.description && <p className="text-white/55 text-sm">{challenge.description}</p>}
              {challenge.song_name && (
                <div className="inline-flex items-center gap-1.5 mt-2 text-violet-300 text-sm bg-violet-500/10 border border-violet-400/25 rounded-full px-3 py-1">
                  <Music2 className="w-3.5 h-3.5" />{challenge.song_name}
                </div>
              )}
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
              challenge.status === "active" ? "bg-emerald-500/15 text-emerald-300 border border-emerald-400/25" :
              challenge.status === "upcoming" ? "bg-cyan-500/15 text-cyan-300 border border-cyan-400/25" :
              "bg-white/[0.05] text-white/45 border border-white/10"
            }`}>{t[challenge.status as keyof typeof t] || challenge.status}</span>
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            {timeLeft && (
              <div className="ds-glass rounded-full px-4 py-1.5 inline-flex items-center gap-1.5 text-amber-300">
                <Clock className="w-3.5 h-3.5" />
                {t.timeLeft}: {timeLeft.days}{t.days} {timeLeft.hours}{t.hours} {timeLeft.mins}{t.mins}
              </div>
            )}
            {challenge.prize_credits > 0 && (
              <div className="ds-glass rounded-full px-4 py-1.5 inline-flex items-center gap-1.5 text-violet-300">
                <Star className="w-3.5 h-3.5" />
                {t.prize}: {challenge.prize_credits} {t.credits}
              </div>
            )}
          </div>

          {myEntry ? (
            <div className="mt-5 p-4 bg-violet-500/10 border border-violet-400/30 rounded-xl text-sm flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-violet-300 font-semibold"><Check className="w-4 h-4" />{t.entered}</span>
              <span className="text-white/65">{t.yourScore}: <span className="font-bold text-white">{myEntry.score}</span></span>
            </div>
          ) : challenge.status === "active" ? (
            <ChallengeEntryForm challengeId={id} lang={lang} />
          ) : null}
        </div>
      </div>

      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,.5)]" />{t.leaderboard}
      </h3>

      {leaderboard.length === 0 ? (
        <p className="text-white/40 text-center py-8">{t.noChallenge}</p>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry: any, i: number) => (
            <div key={i} className={`flex items-center gap-3 p-3.5 rounded-2xl transition-all ${
              i < 3 ? "ds-card" : "bg-white/[0.02] border border-white/[0.05]"
            }`}>
              <span className="w-8 text-center font-bold text-lg shrink-0">
                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : <span className="text-white/35 text-sm">#{i + 1}</span>}
              </span>
              {entry.picture ? (
                <img src={entry.picture} alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-violet-400/20" />
              ) : (
                <div className="w-9 h-9 rounded-full ds-icon-orb text-xs font-bold">{(entry.display_name || "?")[0]}</div>
              )}
              <span className="flex-1 text-sm text-white truncate font-medium">{entry.display_name}</span>
              <span className="text-lg font-black ds-grad-text">{entry.score}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Challenges() {
  const { lang } = useLang();
  const t = T[lang] || T.en;
  const isRtl = lang === "he" || lang === "ar";
  const { data, isLoading } = useChallenges();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  if (selectedId) {
    return (
      <div className="min-h-screen bg-[var(--ds-bg-app)] relative" dir={isRtl ? "rtl" : "ltr"}>
        <div className="absolute top-0 inset-x-0 h-[420px] -z-10 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 ds-bg-aurora opacity-50" />
          <div className="ds-orb ds-orb-violet absolute -top-24 left-10 w-96 h-96 opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050510]/30 via-transparent to-[#050510]" />
        </div>
        <div className="w-full max-w-3xl mx-auto px-4 py-10">
          <ChallengeDetail id={selectedId} onBack={() => setSelectedId(null)} lang={lang} />
        </div>
      </div>
    );
  }

  const challenges = data?.challenges || [];
  const active = challenges.filter((c: any) => c.status === "active");
  const upcoming = challenges.filter((c: any) => c.status === "upcoming");
  const ended = challenges.filter((c: any) => c.status === "ended");

  return (
    <div className="min-h-screen bg-[var(--ds-bg-app)] relative" dir={isRtl ? "rtl" : "ltr"}>
      <div className="absolute top-0 inset-x-0 h-[460px] -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 ds-bg-galaxy" />
        <div className="absolute inset-0 ds-bg-aurora opacity-50" />
        <div className="ds-orb absolute -top-32 left-1/2 -translate-x-1/2 w-[520px] h-[520px] opacity-50" style={{ background: "radial-gradient(circle, rgba(252,211,77,.4) 0%, transparent 70%)" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050510]/30 via-transparent to-[#050510]" />
      </div>

      <div className="w-full max-w-3xl mx-auto px-4 py-12 sm:py-16">
        <div className="text-center mb-12 ds-reveal">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ds-icon-orb"
               style={{ background: "linear-gradient(135deg,#FBBF24,#F97316)", boxShadow: "0 0 40px rgba(251,191,36,.55)" }}>
            <Trophy className="w-8 h-8 text-white drop-shadow-lg" />
          </div>
          <h1 className="ds-page-title font-bold text-white mb-2">{t.title}</h1>
          <p className="text-white/55 text-base">{t.subtitle}</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-violet-300 border-t-transparent rounded-full animate-spin" /></div>
        ) : challenges.length === 0 ? (
          <div className="ds-card-feature text-center py-16">
            <Medal className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/50 text-lg font-semibold">{t.noChallenge}</p>
            <p className="text-white/35 text-sm mt-2">{t.noDesc}</p>
          </div>
        ) : (
          <div className="space-y-10">
            {[
              { label: t.active, items: active, accent: "emerald" },
              { label: t.upcoming, items: upcoming, accent: "cyan" },
              { label: t.ended, items: ended, accent: "white" },
            ].filter(g => g.items.length > 0).map(group => (
              <div key={group.label}>
                <h2 className="text-xs font-bold text-white/45 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <span className={`w-1 h-4 rounded-full ${group.accent === "emerald" ? "bg-emerald-400" : group.accent === "cyan" ? "bg-cyan-400" : "bg-white/20"}`} />
                  {group.label}
                </h2>
                <div className="space-y-3">
                  {group.items.map((c: any, i: number) => {
                    const timeLeft = getTimeLeft(c.end_date);
                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelectedId(c.id)}
                        className="w-full text-start ds-card relative overflow-hidden p-5 sm:p-6 transition-all duration-300 hover:border-white/15 group ds-reveal"
                        style={{ animationDelay: `${i * 40}ms` }}
                      >
                        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-violet-500/10 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-violet-200 transition-colors">{c.title}</h3>
                            <ChevronRight className={`w-5 h-5 text-white/30 group-hover:text-violet-300 transition-all group-hover:translate-x-1 ${isRtl ? "rotate-180" : ""}`} />
                          </div>
                          {c.song_name && (
                            <div className="inline-flex items-center gap-1.5 mb-3 text-violet-300/85 text-sm">
                              <Music2 className="w-3.5 h-3.5" />{c.song_name}
                            </div>
                          )}
                          <div className="flex flex-wrap gap-3 text-xs">
                            <span className="inline-flex items-center gap-1.5 text-white/55 bg-white/[0.04] border border-white/[0.08] rounded-full px-2.5 py-1">
                              <Users className="w-3.5 h-3.5" />{c.entry_count} {t.participants}
                            </span>
                            {c.prize_credits > 0 && (
                              <span className="inline-flex items-center gap-1.5 text-violet-300 bg-violet-500/10 border border-violet-400/25 rounded-full px-2.5 py-1">
                                <Star className="w-3.5 h-3.5" />{c.prize_credits} {t.credits}
                              </span>
                            )}
                            {timeLeft && (
                              <span className="inline-flex items-center gap-1.5 text-amber-300 bg-amber-500/10 border border-amber-400/25 rounded-full px-2.5 py-1">
                                <Clock className="w-3.5 h-3.5" />{timeLeft.days}{t.days} {timeLeft.hours}{t.hours}
                              </span>
                            )}
                            {c.hasEntered && (
                              <span className="inline-flex items-center gap-1.5 text-emerald-300 bg-emerald-500/10 border border-emerald-400/25 rounded-full px-2.5 py-1 font-semibold">
                                <Check className="w-3.5 h-3.5" />{t.entered}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
