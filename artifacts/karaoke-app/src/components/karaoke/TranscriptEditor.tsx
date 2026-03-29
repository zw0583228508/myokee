import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Loader2, RotateCcw, FileText } from "lucide-react";
import type { WordTimestamp } from "@workspace/api-client-react/src/generated/api.schemas";
import { useConfirmLyrics } from "@/hooks/use-karaoke";
import { BG_STYLES } from "@/lib/bg-styles";
import { useUITranslations, getBgLabel } from "@/contexts/uiTranslations";

interface TranscriptEditorProps {
  jobId: string;
  words: WordTimestamp[];
  onConfirmed: () => void;
  onConfirmingChange?: (confirming: boolean) => void;
  initialBgStyle?: string;
}

export function TranscriptEditor({ jobId, words: initialWords, onConfirmed, onConfirmingChange, initialBgStyle }: TranscriptEditorProps) {
  const initialText = initialWords.map(w => w.word).join(" ");
  const [text, setText] = useState(initialText);
  const [selectedBg, setSelectedBg] = useState(initialBgStyle || "aurora");
  const confirmLyrics = useConfirmLyrics(jobId);
  const uiT = useUITranslations();

  const handleReset = () => setText(initialText);

  const handleConfirm = async () => {
    if (confirmLyrics.isPending) return;
    const newWordStrings = text.trim().split(/\s+/).filter(Boolean);

    const mapped: WordTimestamp[] = newWordStrings.map((word, i) => {
      const original = initialWords[Math.min(i, initialWords.length - 1)];
      return {
        word,
        start: original.start,
        end: original.end,
        probability: original.probability ?? 1.0,
      };
    });

    onConfirmingChange?.(true);
    try {
      await confirmLyrics.mutateAsync({ words: mapped, bg_style: selectedBg });
      onConfirmed();
    } catch {
      onConfirmingChange?.(false);
    }
  };

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const isDirty = text !== initialText;

  return (
    <Card className="p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-accent" />
            {uiT.transcript.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {uiT.transcript.desc}
          </p>
        </div>
        {isDirty && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground shrink-0">
            <RotateCcw className="w-4 h-4 mr-1" />
            {uiT.transcript.reset}
          </Button>
        )}
      </div>

      <textarea
        dir="auto"
        value={text}
        onChange={e => setText(e.target.value)}
        rows={6}
        className="w-full rounded-xl bg-background/50 border border-white/10 px-4 py-3 text-white
                   text-base leading-relaxed resize-none outline-none
                   focus:border-primary/50 focus:ring-1 focus:ring-primary/30
                   placeholder:text-muted-foreground transition-colors"
        placeholder={uiT.transcript.placeholder}
        spellCheck={false}
      />

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">{uiT.bg.chooseBg}</h4>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {BG_STYLES.map((bg) => (
            <button
              key={bg.id}
              onClick={() => setSelectedBg(bg.id)}
              className={`relative flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                selectedBg === bg.id
                  ? "border-primary shadow-lg shadow-primary/25 ring-1 ring-primary/40"
                  : "border-white/10 hover:border-white/25"
              }`}
            >
              <div
                className="w-full aspect-video rounded-lg"
                style={{
                  background: `linear-gradient(135deg, ${bg.colors[0]}, ${bg.colors[1]}, ${bg.colors[2]})`,
                }}
              />
              <span className="text-xs leading-tight text-center">
                {bg.emoji} {getBgLabel(uiT, bg.id)}
              </span>
              {selectedBg === bg.id && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 pt-1 border-t border-white/5">
        <p className="text-xs text-muted-foreground">
          {wordCount} {uiT.transcript.words}
          {isDirty && <span className="ml-2 text-accent">• {uiT.transcript.edited}</span>}
        </p>
        <Button
          onClick={handleConfirm}
          disabled={confirmLyrics.isPending || wordCount === 0}
          className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
        >
          {confirmLyrics.isPending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{uiT.transcript.processing}</>
          ) : (
            <><CheckCircle2 className="w-4 h-4 mr-2" />{uiT.transcript.confirmCreate}</>
          )}
        </Button>
      </div>

      {confirmLyrics.isError && (
        <p className="text-sm text-destructive">
          {uiT.transcript.error} {(confirmLyrics.error as Error).message}
        </p>
      )}
    </Card>
  );
}
