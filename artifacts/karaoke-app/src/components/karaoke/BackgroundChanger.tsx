import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { BG_STYLES } from "@/lib/bg-styles";
import { useChangeBackground } from "@/hooks/use-karaoke";

interface BackgroundChangerProps {
  jobId: string;
  currentBgStyle?: string;
}

export function BackgroundChanger({ jobId, currentBgStyle = "aurora" }: BackgroundChangerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBg, setSelectedBg] = useState(currentBgStyle);
  const changeBackground = useChangeBackground(jobId);

  const handleApply = async () => {
    if (selectedBg === currentBgStyle || changeBackground.isPending) return;
    await changeBackground.mutateAsync(selectedBg);
  };

  const currentStyle = BG_STYLES.find(s => s.id === currentBgStyle) || BG_STYLES[0];

  return (
    <Card className="border-white/10 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
            <Palette className="w-5 h-5 text-primary" />
          </div>
          <div className="text-right">
            <div className="font-medium text-sm">שינוי רקע</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span
                className="inline-block w-3 h-3 rounded-full border border-white/20"
                style={{
                  background: `linear-gradient(135deg, ${currentStyle.colors[0]}, ${currentStyle.colors[1]}, ${currentStyle.colors[2]})`,
                }}
              />
              {currentStyle.emoji} {currentStyle.label}
            </div>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-3">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {BG_STYLES.map((bg) => (
              <button
                key={bg.id}
                onClick={() => setSelectedBg(bg.id)}
                className={`relative rounded-xl p-2 text-center transition-all duration-200 border ${
                  selectedBg === bg.id
                    ? "border-primary ring-2 ring-primary/40 scale-105"
                    : "border-white/10 hover:border-white/30"
                }`}
              >
                <div
                  className="w-full aspect-video rounded-lg mb-1.5"
                  style={{
                    background: `linear-gradient(135deg, ${bg.colors[0]}, ${bg.colors[1]}, ${bg.colors[2]})`,
                  }}
                />
                <div className="text-[10px] leading-tight truncate">
                  {bg.emoji} {bg.label}
                </div>
              </button>
            ))}
          </div>

          {selectedBg !== currentBgStyle && (
            <Button
              onClick={handleApply}
              disabled={changeBackground.isPending}
              className="w-full"
              variant="gradient"
            >
              {changeBackground.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  מרנדר מחדש...
                </>
              ) : (
                <>
                  <Palette className="w-4 h-4 mr-2" />
                  החל רקע חדש
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
