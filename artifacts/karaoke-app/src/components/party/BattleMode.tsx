import { useState, useEffect } from "react";
import { Swords, Trophy, Crown, Zap, Star, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePartyTranslations } from "@/hooks/use-party-translations";
import type { PartyTheme } from "@/lib/party-themes";

interface BattleScore {
  overall: number;
  timing: number;
  pitch: number;
}

interface BattleModeProps {
  theme: PartyTheme;
  challengerName: string;
  defenderName: string;
  challengerScore?: BattleScore | null;
  defenderScore?: BattleScore | null;
  songName: string;
  status: "waiting" | "singing" | "result";
  onPlayAgain?: () => void;
}

function ScoreBar({ label, value, maxValue, color }: {
  label: string;
  value: number;
  maxValue: number;
  color: string;
}) {
  const pct = Math.min(100, (value / maxValue) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-white/50">{label}</span>
        <span className="font-bold text-white/80">{value}</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}80, ${color})`,
          }}
        />
      </div>
    </div>
  );
}

export function BattleMode({
  theme,
  challengerName,
  defenderName,
  challengerScore,
  defenderScore,
  songName,
  status,
  onPlayAgain,
}: BattleModeProps) {
  const pt = usePartyTranslations();
  const [showResult, setShowResult] = useState(false);

  const colorA = theme.particleColors[0] || "#8b5cf6";
  const colorB = theme.particleColors[1] || "#ec4899";

  useEffect(() => {
    if (status === "result") {
      const timer = setTimeout(() => setShowResult(true), 500);
      return () => clearTimeout(timer);
    }
    setShowResult(false);
  }, [status]);

  const winner =
    challengerScore && defenderScore
      ? challengerScore.overall > defenderScore.overall
        ? "challenger"
        : defenderScore.overall > challengerScore.overall
        ? "defender"
        : "draw"
      : null;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Swords className="w-5 h-5 text-orange-400" />
          <h2 className="text-lg font-bold text-white">{pt.battle.title}</h2>
        </div>
        <p className="text-sm text-white/40">"{songName}"</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div
          className={`rounded-2xl p-4 border-2 transition-all duration-500 ${
            status === "result" && winner === "challenger"
              ? "border-yellow-400/60 bg-yellow-400/5"
              : "border-white/10 bg-white/5"
          }`}
          style={{
            borderColor:
              status !== "result"
                ? `${colorA}30`
                : winner === "challenger"
                ? undefined
                : `${colorA}20`,
          }}
        >
          <div className="text-center mb-3">
            <div
              className="w-14 h-14 rounded-full mx-auto mb-2 flex items-center justify-center text-xl font-bold"
              style={{ backgroundColor: `${colorA}20`, color: colorA }}
            >
              {challengerName[0]?.toUpperCase() || "?"}
            </div>
            <p className="text-sm font-bold text-white truncate">{challengerName}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-wider">
              {pt.battle.challenger}
            </p>
          </div>

          {status === "waiting" && (
            <div className="text-center py-4">
              <div className="text-3xl animate-bounce">🎤</div>
              <p className="text-xs text-white/40 mt-2">{pt.battle.ready}</p>
            </div>
          )}

          {status === "singing" && (
            <div className="text-center py-4">
              <div className="flex items-center justify-center gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full animate-pulse"
                    style={{
                      backgroundColor: colorA,
                      height: `${12 + Math.random() * 20}px`,
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
              <p className="text-xs text-white/40 mt-2">♪♪♪</p>
            </div>
          )}

          {status === "result" && challengerScore && (
            <div className={`space-y-2 transition-all duration-700 ${showResult ? "opacity-100" : "opacity-0"}`}>
              <div className="text-center mb-3">
                <div className="text-3xl font-black text-white">{challengerScore.overall}</div>
                {winner === "challenger" && (
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Crown className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs font-bold text-yellow-400">{pt.battle.winner}</span>
                  </div>
                )}
              </div>
              <ScoreBar label={pt.battle.timing} value={challengerScore.timing} maxValue={100} color={colorA} />
              <ScoreBar label={pt.battle.pitch} value={challengerScore.pitch} maxValue={100} color={colorA} />
            </div>
          )}
        </div>

        <div
          className={`rounded-2xl p-4 border-2 transition-all duration-500 ${
            status === "result" && winner === "defender"
              ? "border-yellow-400/60 bg-yellow-400/5"
              : "border-white/10 bg-white/5"
          }`}
          style={{
            borderColor:
              status !== "result"
                ? `${colorB}30`
                : winner === "defender"
                ? undefined
                : `${colorB}20`,
          }}
        >
          <div className="text-center mb-3">
            <div
              className="w-14 h-14 rounded-full mx-auto mb-2 flex items-center justify-center text-xl font-bold"
              style={{ backgroundColor: `${colorB}20`, color: colorB }}
            >
              {defenderName[0]?.toUpperCase() || "?"}
            </div>
            <p className="text-sm font-bold text-white truncate">{defenderName}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-wider">
              {pt.battle.defender}
            </p>
          </div>

          {status === "waiting" && (
            <div className="text-center py-4">
              <div className="text-3xl animate-bounce" style={{ animationDelay: "0.2s" }}>🎤</div>
              <p className="text-xs text-white/40 mt-2">{pt.battle.ready}</p>
            </div>
          )}

          {status === "singing" && (
            <div className="text-center py-4">
              <div className="flex items-center justify-center gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full animate-pulse"
                    style={{
                      backgroundColor: colorB,
                      height: `${12 + Math.random() * 20}px`,
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
              <p className="text-xs text-white/40 mt-2">♪♪♪</p>
            </div>
          )}

          {status === "result" && defenderScore && (
            <div className={`space-y-2 transition-all duration-700 ${showResult ? "opacity-100" : "opacity-0"}`}>
              <div className="text-center mb-3">
                <div className="text-3xl font-black text-white">{defenderScore.overall}</div>
                {winner === "defender" && (
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Crown className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs font-bold text-yellow-400">{pt.battle.winner}</span>
                  </div>
                )}
              </div>
              <ScoreBar label={pt.battle.timing} value={defenderScore.timing} maxValue={100} color={colorB} />
              <ScoreBar label={pt.battle.pitch} value={defenderScore.pitch} maxValue={100} color={colorB} />
            </div>
          )}
        </div>
      </div>

      {status === "result" && showResult && (
        <div className="text-center space-y-3">
          {winner === "draw" && (
            <div className="flex items-center justify-center gap-2 py-3">
              <Zap className="w-6 h-6 text-yellow-400" />
              <span className="text-xl font-bold text-yellow-400">{pt.battle.draw}</span>
              <Zap className="w-6 h-6 text-yellow-400" />
            </div>
          )}

          {winner && winner !== "draw" && (
            <div className="py-3">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-lg font-bold text-white">
                  {winner === "challenger" ? challengerName : defenderName}
                </span>
                <Star className="w-5 h-5 text-yellow-400" />
              </div>
              <span className="text-sm text-yellow-400 font-medium">{pt.battle.winner}</span>
            </div>
          )}

          {onPlayAgain && (
            <Button
              onClick={onPlayAgain}
              className={`gap-2 bg-gradient-to-r ${theme.gradient} hover:opacity-90`}
            >
              <RotateCcw className="w-4 h-4" />
              {pt.battle.playAgain}
            </Button>
          )}
        </div>
      )}

      {status === "result" && !challengerScore && !defenderScore && (
        <div className="text-center py-6">
          <Trophy className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/40">{pt.battle.battleResult}</p>
        </div>
      )}
    </div>
  );
}
