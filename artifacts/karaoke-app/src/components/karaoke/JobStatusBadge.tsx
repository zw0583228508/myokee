import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, AlertCircle, Music, Mic, Film, Clock, Eye } from "lucide-react";
import type { JobStatus } from "@workspace/api-client-react/src/generated/api.schemas";
import { useUITranslations } from "@/contexts/uiTranslations";

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const uiT = useUITranslations();

  switch (status) {
    case 'pending':
      return (
        <Badge variant="outline" className="gap-1.5 py-1 px-3">
          <Loader2 className="h-3 w-3 animate-spin" />
          {uiT.status.starting}
        </Badge>
      );
    case 'queued':
      return (
        <Badge variant="outline" className="gap-1.5 py-1 px-3 border-yellow-500/40 text-yellow-400">
          <Clock className="h-3 w-3" />
          {uiT.status.waitingQueue}
        </Badge>
      );
    case 'separating':
      return (
        <Badge variant="default" className="gap-1.5 py-1 px-3 bg-purple-500/20 text-purple-400 border-purple-500/20">
          <Music className="h-3 w-3 animate-pulse" />
          {uiT.status.isolatingVocals}
        </Badge>
      );
    case 'transcribing':
      return (
        <Badge variant="default" className="gap-1.5 py-1 px-3 bg-blue-500/20 text-blue-400 border-blue-500/20">
          <Mic className="h-3 w-3 animate-pulse" />
          {uiT.status.transcribing}
        </Badge>
      );
    case 'awaiting_review':
      return (
        <Badge variant="default" className="gap-1.5 py-1 px-3 bg-amber-500/20 text-amber-400 border-amber-500/20">
          <Eye className="h-3 w-3" />
          {uiT.status.awaitingReview}
        </Badge>
      );
    case 'rendering':
      return (
        <Badge variant="default" className="gap-1.5 py-1 px-3 bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/20">
          <Film className="h-3 w-3 animate-pulse" />
          {uiT.status.renderingVideo}
        </Badge>
      );
    case 'done':
      return (
        <Badge variant="success" className="gap-1.5 py-1 px-3">
          <CheckCircle2 className="h-3 w-3" />
          {uiT.status.complete}
        </Badge>
      );
    case 'error':
      return (
        <Badge variant="destructive" className="gap-1.5 py-1 px-3">
          <AlertCircle className="h-3 w-3" />
          {uiT.status.failed}
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
