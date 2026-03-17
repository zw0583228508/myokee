import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Loader2, RotateCcw, FileText } from "lucide-react";
import type { WordTimestamp } from "@workspace/api-client-react/src/generated/api.schemas";
import { useConfirmLyrics } from "@/hooks/use-karaoke";

interface TranscriptEditorProps {
  jobId: string;
  words: WordTimestamp[];
  onConfirmed: () => void;
  onConfirmingChange?: (confirming: boolean) => void;
}

export function TranscriptEditor({ jobId, words: initialWords, onConfirmed, onConfirmingChange }: TranscriptEditorProps) {
  const initialText = initialWords.map(w => w.word).join(" ");
  const [text, setText] = useState(initialText);
  const confirmLyrics = useConfirmLyrics(jobId);

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
      await confirmLyrics.mutateAsync(mapped);
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
            בדיקת תמלול
          </h3>
          <p className="text-sm text-muted-foreground">
            ערוך את הטקסט ישירות. שינויים בשמות/מילים ישמרו את התזמון המקורי.
          </p>
        </div>
        {isDirty && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground shrink-0">
            <RotateCcw className="w-4 h-4 mr-1" />
            איפוס
          </Button>
        )}
      </div>

      <textarea
        dir="rtl"
        value={text}
        onChange={e => setText(e.target.value)}
        rows={6}
        className="w-full rounded-xl bg-background/50 border border-white/10 px-4 py-3 text-white
                   text-base leading-relaxed resize-none outline-none
                   focus:border-primary/50 focus:ring-1 focus:ring-primary/30
                   placeholder:text-muted-foreground transition-colors"
        placeholder="לא זוהה ווקאל בקובץ..."
        spellCheck={false}
      />

      <div className="flex items-center justify-between gap-4 pt-1 border-t border-white/5">
        <p className="text-xs text-muted-foreground">
          {wordCount} מילים
          {isDirty && <span className="ml-2 text-accent">• נערך</span>}
        </p>
        <Button
          onClick={handleConfirm}
          disabled={confirmLyrics.isPending || wordCount === 0}
          className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
        >
          {confirmLyrics.isPending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />מתחיל עיבוד…</>
          ) : (
            <><CheckCircle2 className="w-4 h-4 mr-2" />אישור ויצירת וידאו</>
          )}
        </Button>
      </div>

      {confirmLyrics.isError && (
        <p className="text-sm text-destructive">
          שגיאה: {(confirmLyrics.error as Error).message}
        </p>
      )}
    </Card>
  );
}
