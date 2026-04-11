import { useState } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { useChallenges, useChallengeDetail, useEnterChallenge } from "@/hooks/use-challenges";
import { useMyPerformances } from "@/hooks/use-performances";
import { Trophy, Clock, Users, ChevronRight, Medal, Star, ArrowLeft, Check } from "lucide-react";

const T: Record<string, Record<string, string>> = {
  en: {
    title: "Weekly Challenges",
    subtitle: "Compete with singers worldwide",
    active: "Active",
    upcoming: "Upcoming",
    ended: "Ended",
    participants: "participants",
    prize: "Prize",
    credits: "credits",
    enterChallenge: "Enter Challenge",
    leaderboard: "Leaderboard",
    noChallenge: "No challenges yet",
    noDesc: "New challenges are posted every week. Check back soon!",
    rank: "Rank",
    singer: "Singer",
    score: "Score",
    timeLeft: "Time left",
    days: "d",
    hours: "h",
    mins: "m",
    entered: "Entered",
    back: "Back",
    yourScore: "Your Score",
    selectPerformance: "Select a performance to submit",
  },
  he: {
    title: "אתגרים שבועיים",
    subtitle: "התחרו עם זמרים מכל העולם",
    active: "פעיל",
    upcoming: "בקרוב",
    ended: "הסתיים",
    participants: "משתתפים",
    prize: "פרס",
    credits: "קרדיטים",
    enterChallenge: "הצטרף לאתגר",
    leaderboard: "טבלת מובילים",
    noChallenge: "אין אתגרים עדיין",
    noDesc: "אתגרים חדשים מתפרסמים כל שבוע. חזרו בקרוב!",
    rank: "דירוג",
    singer: "זמר",
    score: "ציון",
    timeLeft: "זמן נותר",
    days: "י",
    hours: "ש",
    mins: "ד",
    entered: "נרשמת",
    back: "חזרה",
    yourScore: "הציון שלך",
    selectPerformance: "בחר ביצוע להגשה",
  },
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
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return { days, hours, mins };
}

function ChallengeEntryForm({ challengeId, lang }: { challengeId: number; lang: string }) {
  const t = T[lang] || T.en;
  const { data: perfs, isLoading } = useMyPerformances();
  const enterChallenge = useEnterChallenge();
  const [selectedPerfId, setSelectedPerfId] = useState<number | null>(null);

  if (isLoading) return <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />;
  if (!perfs || perfs.length === 0) return <p className="text-white/40 text-sm">{t.noChallenge}</p>;

  return (
    <div className="mt-4 p-4 bg-white/[0.03] border border-white/10 rounded-xl">
      <p className="text-sm text-white/60 mb-3">{t.selectPerformance}</p>
      <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
        {perfs.map((p: any) => (
          <button
            key={p.id}
            onClick={() => setSelectedPerfId(p.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg text-start transition-all ${
              selectedPerfId === p.id ? "bg-primary/20 border border-primary/40" : "bg-white/[0.02] border border-white/5 hover:bg-white/[0.05]"
            }`}
          >
            <span className={`text-lg font-bold ${p.score >= 90 ? "text-green-400" : p.score >= 70 ? "text-yellow-400" : "text-orange-400"}`}>{p.score}</span>
            <span className="text-sm text-white/70 flex-1 truncate">{p.song_name || "Unknown"}</span>
            {selectedPerfId === p.id && <Check className="w-4 h-4 text-primary" />}
          </button>
        ))}
      </div>
      <button
        onClick={() => { if (selectedPerfId) enterChallenge.mutate({ challengeId, performanceId: selectedPerfId }); }}
        disabled={!selectedPerfId || enterChallenge.isPending}
        className="w-full py-2.5 rounded-xl bg-primary text-white font-medium text-sm disabled:opacity-40 hover:bg-primary/80 transition-colors"
      >
        {enterChallenge.isPending ? "..." : t.enterChallenge}
      </button>
    </div>
  );
}

function ChallengeDetail({ id, onBack, lang }: { id: number; onBack: () => void; lang: string }) {
  const { data, isLoading } = useChallengeDetail(id);
  const t = T[lang] || T.en;
  const isRtl = lang === "he" || lang === "ar";

  if (isLoading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return null;

  const { challenge, leaderboard, myEntry } = data;
  const timeLeft = getTimeLeft(challenge.end_date);

  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
      <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />{t.back}
      </button>

      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">{challenge.title}</h2>
            {challenge.description && <p className="text-white/50 text-sm">{challenge.description}</p>}
            {challenge.song_name && <p className="text-primary text-sm mt-1">🎵 {challenge.song_name}</p>}
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            challenge.status === "active" ? "bg-green-500/20 text-green-400" :
            challenge.status === "upcoming" ? "bg-blue-500/20 text-blue-400" :
            "bg-white/10 text-white/50"
          }`}>{t[challenge.status as keyof typeof t] || challenge.status}</span>
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          {timeLeft && (
            <div className="flex items-center gap-1.5 text-yellow-400">
              <Clock className="w-4 h-4" />
              {t.timeLeft}: {timeLeft.days}{t.days} {timeLeft.hours}{t.hours} {timeLeft.mins}{t.mins}
            </div>
          )}
          {challenge.prize_credits > 0 && (
            <div className="flex items-center gap-1.5 text-primary">
              <Star className="w-4 h-4" />
              {t.prize}: {challenge.prize_credits} {t.credits}
            </div>
          )}
        </div>

        {myEntry ? (
          <div className="mt-4 p-3 bg-primary/10 border border-primary/30 rounded-xl text-sm">
            <span className="text-primary font-medium">✓ {t.entered}</span>
            <span className="text-white/60 ms-3">{t.yourScore}: {myEntry.score}</span>
          </div>
        ) : challenge.status === "active" ? (
          <ChallengeEntryForm challengeId={id} lang={lang} />
        ) : null}
      </div>

      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-400" />{t.leaderboard}
      </h3>

      {leaderboard.length === 0 ? (
        <p className="text-white/40 text-center py-8">{t.noChallenge}</p>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry: any, i: number) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
              i < 3 ? "bg-white/[0.05] border border-white/10" : "bg-white/[0.02]"
            }`}>
              <span className="w-8 text-center font-bold text-lg">
                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : <span className="text-white/30">{i + 1}</span>}
              </span>
              {entry.picture ? (
                <img src={entry.picture} alt="" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs text-white font-bold">
                  {(entry.display_name || "?")[0]}
                </div>
              )}
              <span className="flex-1 text-sm text-white truncate">{entry.display_name}</span>
              <span className="text-primary font-bold">{entry.score}</span>
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
      <div className="w-full max-w-3xl mx-auto px-4 py-8">
        <ChallengeDetail id={selectedId} onBack={() => setSelectedId(null)} lang={lang} />
      </div>
    );
  }

  const challenges = data?.challenges || [];
  const active = challenges.filter((c: any) => c.status === "active");
  const upcoming = challenges.filter((c: any) => c.status === "upcoming");
  const ended = challenges.filter((c: any) => c.status === "ended");

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8" dir={isRtl ? "rtl" : "ltr"}>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg shadow-yellow-500/20 mb-4">
          <Trophy className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">{t.title}</h1>
        <p className="text-white/50">{t.subtitle}</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : challenges.length === 0 ? (
        <div className="text-center py-16">
          <Medal className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 text-lg">{t.noChallenge}</p>
          <p className="text-white/30 text-sm mt-2">{t.noDesc}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {[
            { label: t.active, items: active, color: "green" },
            { label: t.upcoming, items: upcoming, color: "blue" },
            { label: t.ended, items: ended, color: "gray" },
          ].filter(g => g.items.length > 0).map(group => (
            <div key={group.label}>
              <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">{group.label}</h2>
              <div className="space-y-3">
                {group.items.map((c: any) => {
                  const timeLeft = getTimeLeft(c.end_date);
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedId(c.id)}
                      className="w-full text-start bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-2xl p-5 transition-all group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors">{c.title}</h3>
                        <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-primary transition-colors" />
                      </div>
                      {c.song_name && <p className="text-primary/70 text-sm mb-3">🎵 {c.song_name}</p>}
                      <div className="flex flex-wrap gap-4 text-xs text-white/40">
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{c.entry_count} {t.participants}</span>
                        {c.prize_credits > 0 && <span className="flex items-center gap-1 text-primary"><Star className="w-3.5 h-3.5" />{c.prize_credits} {t.credits}</span>}
                        {timeLeft && <span className="flex items-center gap-1 text-yellow-400/70"><Clock className="w-3.5 h-3.5" />{timeLeft.days}{t.days} {timeLeft.hours}{t.hours}</span>}
                        {c.hasEntered && <span className="text-green-400">✓ {t.entered}</span>}
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
  );
}
