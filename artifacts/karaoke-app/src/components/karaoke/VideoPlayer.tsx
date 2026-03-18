import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  onTimeUpdate?: (time: number) => void;
  onEnded?: () => void;
}

export function VideoPlayer({ src, poster, autoPlay, onTimeUpdate, onEnded }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setProgress((video.currentTime / video.duration) * 100);
      if (onTimeUpdate) onTimeUpdate(video.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (onEnded) onEnded();
    };

    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);
    const handleCanPlay = () => setIsBuffering(false);
    const handleStalled = () => setIsBuffering(true);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("stalled", handleStalled);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("stalled", handleStalled);
    };
  }, [onTimeUpdate, onEnded]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !autoPlay) return;

    video.muted = false;
    video.play().then(() => {
      setIsPlaying(true);
      setIsMuted(false);
    }).catch(() => {
      video.muted = true;
      setIsMuted(true);
      video.play().then(() => {
        setIsPlaying(true);
        const unmute = () => {
          if (videoRef.current) {
            videoRef.current.muted = false;
            setIsMuted(false);
          }
          document.removeEventListener("click", unmute);
          document.removeEventListener("touchstart", unmute);
        };
        document.addEventListener("click", unmute, { once: true });
        document.addEventListener("touchstart", unmute, { once: true });
      }).catch(() => {});
    });
  }, [src, autoPlay]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * videoRef.current.duration;
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <div className="relative group rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl shadow-black/50 aspect-video flex flex-col">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        preload="auto"
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        playsInline
      />
      
      {/* Custom Controls Overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4 pb-4 pt-12 flex flex-col gap-3">
        {/* Progress Bar */}
        <div 
          className="h-1.5 w-full bg-white/20 rounded-full cursor-pointer relative group/bar"
          onClick={handleSeek}
        >
          <div 
            className="absolute top-0 left-0 h-full bg-primary rounded-full group-hover/bar:bg-accent transition-colors"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={togglePlay} className="text-white hover:bg-white/20">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white hover:bg-white/20">
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-white hover:bg-white/20">
              <Maximize className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Play Overlay (Big Center Button) */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-primary/80 backdrop-blur-md flex items-center justify-center text-white shadow-lg shadow-primary/50 pl-1">
            <Play className="w-8 h-8 fill-current" />
          </div>
        </div>
      )}

      {isBuffering && isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <Loader2 className="w-10 h-10 text-white/70 animate-spin" />
        </div>
      )}

      {isPlaying && isMuted && (
        <button
          onClick={(e) => { e.stopPropagation(); toggleMute(); }}
          className="absolute top-3 end-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-sm text-white text-xs font-medium border border-white/20 animate-pulse hover:bg-black/90 transition-colors z-10"
        >
          <VolumeX className="w-3.5 h-3.5" />
          לחץ להפעלת שמע
        </button>
      )}
    </div>
  );
}
