import { useState } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { useChallenges, useChallengeDetail, useEnterChallenge } from "@/hooks/use-challenges";
import { Trophy, Clock, Users, ChevronRight, Medal, Star, ArrowLeft } from "lucide-react";

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
};

function getTimeLeft(endDate: string) {
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return { days, hours, mins };
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

        {myEntry && (
          <div className="mt-4 p-3 bg-primary/10 border border-primary/30 rounded-xl text-sm">
            <span className="text-primary font-medium">✓ {t.entered}</span>
            <span className="text-white/60 ms-3">{t.yourScore}: {myEntry.score}</span>
          </div>
        )}
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
