import { useState } from "react";
import { Palette, Loader2, ChevronDown, ChevronUp, Check } from "lucide-react";
import { BG_STYLES } from "@/lib/bg-styles";
import { useChangeBackground } from "@/hooks/use-karaoke";
import { useUITranslations, getBgLabel } from "@/contexts/uiTranslations";

interface BackgroundChangerProps {
  jobId: string;
  currentBgStyle?: string;
}

export function BackgroundChanger({ jobId, currentBgStyle = "aurora" }: BackgroundChangerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBg, setSelectedBg] = useState(currentBgStyle);
  const changeBackground = useChangeBackground(jobId);
  const uiT = useUITranslations();

  const handleApply = async () => {
    if (selectedBg === currentBgStyle || changeBackground.isPending) return;
    await changeBackground.mutateAsync(selectedBg);
  };

  const currentStyle = BG_STYLES.find(s => s.id === currentBgStyle) || BG_STYLES[0];

  return (
    <div className="ds-card overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/[0.04] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="ds-icon-orb w-10 h-10 rounded-xl">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div className="text-start">
            <div className="font-semibold text-sm text-white">{uiT.bg.changeBackground}</div>
            <div className="text-xs text-white/50 flex items-center gap-1.5 mt-0.5">
              <span
                className="inline-block w-3 h-3 rounded-full border border-white/25"
                style={{ background: `linear-gradient(135deg, ${currentStyle.colors[0]}, ${currentStyle.colors[1]}, ${currentStyle.colors[2]})` }}
              />
              {currentStyle.emoji} {getBgLabel(uiT, currentStyle.id)}
            </div>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-violet-300/70" />
        ) : (
          <ChevronDown className="w-4 h-4 text-white/40" />
        )}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/[0.06] pt-3">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {BG_STYLES.map((bg) => {
              const isSel = selectedBg === bg.id;
              return (
                <button
                  key={bg.id}
                  onClick={() => setSelectedBg(bg.id)}
                  className={`relative rounded-xl p-2 text-center transition-all duration-300 ${
                    isSel ? "scale-105" : "hover:scale-[1.02]"
                  }`}
                  style={{
                    background: isSel ? "rgba(139,92,246,.10)" : "rgba(255,255,255,.025)",
                    border: isSel ? "1.5px solid rgba(139,92,246,.55)" : "1px solid rgba(255,255,255,.07)",
                    boxShadow: isSel ? "0 0 18px rgba(139,92,246,.25)" : undefined,
                  }}
                >
                  {isSel && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full ds-icon-orb flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </span>
                  )}
                  <div
                    className="w-full aspect-video rounded-lg mb-1.5"
                    style={{ background: `linear-gradient(135deg, ${bg.colors[0]}, ${bg.colors[1]}, ${bg.colors[2]})` }}
                  />
                  <div className="text-[10px] leading-tight truncate text-white/75">
                    {bg.emoji} {getBgLabel(uiT, bg.id)}
                  </div>
                </button>
              );
            })}
          </div>

          {selectedBg !== currentBgStyle && (
            <button
              onClick={handleApply}
              disabled={changeBackground.isPending}
              className="ds-btn ds-btn-primary w-full py-3 text-sm disabled:opacity-50"
            >
              {changeBackground.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />{uiT.bg.reRendering}
                </>
              ) : (
                <>
                  <Palette className="w-4 h-4" />{uiT.bg.applyNew}
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
