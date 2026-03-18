import { useRoute } from "wouter";
import { useEffect, useState, useRef } from "react";
import { Mic2, Music, Trophy, Users, SkipForward } from "lucide-react";
import { usePartyRoom, usePartyLeaderboard } from "@/hooks/use-party";
import { usePartyTranslations } from "@/hooks/use-party-translations";
import { getTheme } from "@/lib/party-themes";

function Particles({ colors }: { colors: string[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; color: string; alpha: number }[] = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -Math.random() * 0.5 - 0.2,
        r: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.6 + 0.2,
      });
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, [colors]);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

export default function PartyDisplay() {
  const [, params] = useRoute("/party/:id/display");
  const roomId = params?.id || null;
  const { data: room } = usePartyRoom(roomId);
  const { data: leaderboard } = usePartyLeaderboard(roomId);
  const pt = usePartyTranslations();
  const theme = getTheme(room?.theme || "neon");
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const iv = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  const queue = room?.queue || [];
  const currentItem = queue.find((q: any) => q.status === "singing");
  const waitingQueue = queue.filter((q: any) => q.status === "waiting");

  return (
    <div className={`min-h-screen ${theme.bg} relative overflow-hidden`}>
      <div className="absolute inset-0" style={{ background: theme.bgPattern }} />
      <Particles colors={theme.particleColors} />

      <div className="relative z-10 min-h-screen flex flex-col p-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{getTheme(room?.theme || "neon").emoji}</span>
            <div>
              <h1 className="text-3xl font-bold text-white">{room?.name || "Karaoke Party"}</h1>
              <div className="text-lg text-white/40 font-mono tracking-widest">
                {pt.room.partyCode}: {room?.code || "..."}
              </div>
            </div>
          </div>
          <div className="text-end">
            <div className="text-4xl font-mono text-white/80 tabular-nums">
              {clock.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div className="text-sm text-white/30 flex items-center gap-1 justify-end">
              <Users className="w-4 h-4" />
              {(room?.members || []).length} {pt.room.members.toLowerCase()}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex gap-8">
          {/* Center — Now Singing */}
          <div className="flex-1 flex flex-col items-center justify-center">
            {currentItem ? (
              <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center mx-auto mb-8 shadow-2xl ${theme.scoreGlow}`}>
                  <Mic2 className="w-16 h-16 text-white" />
                </div>
                <div className="text-sm font-semibold text-primary uppercase tracking-[0.3em] mb-3">
                  {pt.room.nowSinging}
                </div>
                <h2 className="text-5xl md:text-6xl font-bold text-white mb-4 max-w-2xl">
                  {currentItem.song_name}
                </h2>
                <div className="text-2xl text-white/60">{currentItem.display_name}</div>
                {currentItem.mode !== "solo" && (
                  <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${theme.gradient} text-white text-sm font-semibold`}>
                    {currentItem.mode === "duet" ? "🎵" : "⚔️"}
                    {pt.room[currentItem.mode as keyof typeof pt.room] || currentItem.mode}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center animate-pulse">
                <Music className="w-24 h-24 text-white/10 mx-auto mb-6" />
                <p className="text-2xl text-white/30">{pt.display.waitingForHost}</p>
                <p className="text-lg text-white/15 mt-2">{pt.display.addSongsHint}</p>
              </div>
            )}
          </div>

          {/* Right sidebar — Queue + Leaderboard */}
          <div className="w-80 flex flex-col gap-6">
            {/* Up Next */}
            <div className={`${theme.card} rounded-2xl border ${theme.cardBorder} p-4 flex-1`}>
              <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2">
                <SkipForward className="w-4 h-4" />
                {pt.display.nextUp}
              </h3>
              {waitingQueue.length === 0 ? (
                <div className="text-center py-8 text-white/20 text-sm">
                  {pt.display.queueEmpty}
                </div>
              ) : (
                <div className="space-y-2">
                  {waitingQueue.slice(0, 8).map((item: any, idx: number) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-2.5 rounded-xl ${
                        idx === 0 ? "bg-white/10 ring-1 ring-white/10" : "bg-white/5"
                      } transition-all`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold text-white/50">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{item.song_name}</div>
                        <div className="text-xs text-white/40">{item.display_name}</div>
                      </div>
                    </div>
                  ))}
                  {waitingQueue.length > 8 && (
                    <div className="text-center text-xs text-white/30 pt-1">
                      +{waitingQueue.length - 8} more
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mini Leaderboard */}
            {leaderboard && leaderboard.length > 0 && (
              <div className={`${theme.card} rounded-2xl border ${theme.cardBorder} p-4`}>
                <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  {pt.display.partyLeaderboard}
                </h3>
                <div className="space-y-2">
                  {leaderboard.slice(0, 5).map((entry: any, idx: number) => (
                    <div key={entry.user_id} className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                        idx === 0 ? "text-yellow-400" : idx === 1 ? "text-gray-300" : idx === 2 ? "text-orange-400" : "text-white/40"
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 text-sm text-white truncate">{entry.display_name}</div>
                      <div className="text-sm font-bold text-white/80">{entry.total_score}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
