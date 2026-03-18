import { useMemo } from "react";
import { Heart, Mic2, Users } from "lucide-react";
import { usePartyTranslations } from "@/hooks/use-party-translations";
import type { PartyTheme } from "@/lib/party-themes";

interface LyricLine {
  text: string;
  startTime: number;
  endTime: number;
}

interface DuetModeProps {
  theme: PartyTheme;
  singerAName: string;
  singerBName: string;
  lyrics: LyricLine[];
  currentTime: number;
  isFullscreen?: boolean;
}

type Assignment = "A" | "B" | "both";

function assignLines(lyrics: LyricLine[]): Assignment[] {
  return lyrics.map((_, idx) => {
    if (idx % 4 === 3) return "both";
    return idx % 2 === 0 ? "A" : "B";
  });
}

export function DuetMode({
  theme,
  singerAName,
  singerBName,
  lyrics,
  currentTime,
  isFullscreen = false,
}: DuetModeProps) {
  const pt = usePartyTranslations();
  const assignments = useMemo(() => assignLines(lyrics), [lyrics]);

  const currentLineIdx = lyrics.findIndex(
    (l) => currentTime >= l.startTime && currentTime < l.endTime
  );

  const currentAssignment = currentLineIdx >= 0 ? assignments[currentLineIdx] : null;

  const colorA = theme.particleColors[0] || "#8b5cf6";
  const colorB = theme.particleColors[1] || "#ec4899";

  const getLineColor = (assignment: Assignment, isCurrent: boolean, isPast: boolean) => {
    if (isPast) return "text-white/25";
    if (!isCurrent) return "text-white/50";
    if (assignment === "A") return "";
    if (assignment === "B") return "";
    return "";
  };

  const getLineStyle = (assignment: Assignment, isCurrent: boolean) => {
    if (!isCurrent) return {};
    if (assignment === "A") return { color: colorA, textShadow: `0 0 20px ${colorA}40` };
    if (assignment === "B") return { color: colorB, textShadow: `0 0 20px ${colorB}40` };
    return {
      background: `linear-gradient(90deg, ${colorA}, ${colorB})`,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      filter: "brightness(1.2)",
    };
  };

  const visibleRange = isFullscreen ? 4 : 3;
  const startIdx = Math.max(0, currentLineIdx - 1);
  const endIdx = Math.min(lyrics.length, startIdx + visibleRange + 2);
  const visibleLyrics = lyrics.slice(startIdx, endIdx);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full animate-pulse"
            style={{ backgroundColor: colorA }}
          />
          <span className="text-sm font-medium" style={{ color: colorA }}>
            {singerAName || pt.duet.singerA}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Heart className="w-4 h-4 text-pink-400" />
          <span className="text-xs font-medium text-white/60">{pt.duet.title}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: colorB }}>
            {singerBName || pt.duet.singerB}
          </span>
          <div
            className="w-3 h-3 rounded-full animate-pulse"
            style={{ backgroundColor: colorB }}
          />
        </div>
      </div>

      {currentAssignment && (
        <div
          className={`text-center py-2 rounded-xl ${
            currentAssignment === "both"
              ? "bg-white/10"
              : "bg-white/5"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Mic2 className="w-4 h-4" style={{
              color: currentAssignment === "A" ? colorA : currentAssignment === "B" ? colorB : "#fff",
            }} />
            <span
              className="text-sm font-bold uppercase tracking-wider"
              style={{
                color: currentAssignment === "A" ? colorA : currentAssignment === "B" ? colorB : "#fff",
              }}
            >
              {currentAssignment === "A" && (singerAName || pt.duet.singerA)}
              {currentAssignment === "B" && (singerBName || pt.duet.singerB)}
              {currentAssignment === "both" && pt.duet.together}
            </span>
          </div>
        </div>
      )}

      <div className={`space-y-3 ${isFullscreen ? "text-3xl" : "text-lg"}`}>
        {visibleLyrics.map((line, visIdx) => {
          const realIdx = startIdx + visIdx;
          const assignment = assignments[realIdx];
          const isCurrent = realIdx === currentLineIdx;
          const isPast = currentLineIdx >= 0 && realIdx < currentLineIdx;

          return (
            <div
              key={realIdx}
              className={`flex items-center gap-3 transition-all duration-500 ${
                isCurrent ? "scale-105" : isPast ? "opacity-40" : "opacity-70"
              }`}
            >
              <div className="w-6 flex justify-center shrink-0">
                {assignment === "A" && (
                  <div
                    className={`w-2 h-2 rounded-full ${isCurrent ? "animate-pulse" : ""}`}
                    style={{ backgroundColor: colorA }}
                  />
                )}
                {assignment === "B" && (
                  <div
                    className={`w-2 h-2 rounded-full ${isCurrent ? "animate-pulse" : ""}`}
                    style={{ backgroundColor: colorB }}
                  />
                )}
                {assignment === "both" && (
                  <Users className="w-4 h-4 text-white/60" />
                )}
              </div>

              <p
                className={`flex-1 font-bold transition-all duration-300 ${
                  getLineColor(assignment, isCurrent, isPast)
                } ${isCurrent ? "font-extrabold" : ""}`}
                style={getLineStyle(assignment, isCurrent)}
              >
                {line.text}
              </p>
            </div>
          );
        })}
      </div>

      {lyrics.length === 0 && (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/40">{pt.duet.title}</p>
          <p className="text-white/25 text-sm mt-1">
            {singerAName || pt.duet.singerA} & {singerBName || pt.duet.singerB}
          </p>
        </div>
      )}
    </div>
  );
}
