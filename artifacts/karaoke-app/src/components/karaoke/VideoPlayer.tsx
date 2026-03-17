import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  onTimeUpdate?: (time: number) => void;
}

export function VideoPlayer({ src, poster, onTimeUpdate }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setProgress((video.currentTime / video.duration) * 100);
      if (onTimeUpdate) onTimeUpdate(video.currentTime);
    };

    const handleEnded = () => setIsPlaying(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, [onTimeUpdate]);

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
    </div>
  );
}
