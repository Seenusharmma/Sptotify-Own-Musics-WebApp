import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useMusicStore } from "@/stores/useMusicStore";
import {
  Laptop2,
  ListMusic,
  Mic2,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume1,
  WifiOff,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { idbStorage } from "@/lib/idb";

/* ---------------- Utils ---------------- */
const formatTime = (sec: number) => {
  if (!sec || isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export const PlaybackControls = () => {
  const navigate = useNavigate();

  const {
    currentSong,
    isPlaying,
    togglePlay,
    playNext,
    playPrevious,
    autoPlayNext,
    toggleAutoPlay,
    isShuffled,
    toggleShuffle,
    isRepeating,
    toggleRepeat,
  } = usePlayerStore();

  const { isOffline } = useMusicStore();

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [volume, setVolume] = useState(75);
  const [showMobileVolume, setShowMobileVolume] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);

  /* ---------------- Load Cached Image (FIXED) ---------------- */
  useEffect(() => {
    let blobUrl: string | null = null;

    const loadImage = async () => {
      if (!currentSong?._id) {
        setLocalImageUrl(null);
        return;
      }

      const blob = await idbStorage.get(`image-${currentSong._id}`);
      if (blob) {
        blobUrl = URL.createObjectURL(blob);
        setLocalImageUrl(blobUrl);
      } else {
        setLocalImageUrl(null);
      }
    };

    loadImage();

    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [currentSong?._id]);

  /* ---------------- Audio Binding (ROBUST) ---------------- */
  useEffect(() => {
    const audio = document.querySelector("audio") as HTMLAudioElement | null;
    if (!audio) return;

    audioRef.current = audio;
    audio.volume = volume / 100;

    const onTime = () => {
      if (!isNaN(audio.currentTime)) {
        setCurrentTime(audio.currentTime);
      }
    };

    const onMeta = () => {
      if (!isNaN(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
    };
  }, [currentSong]);

  /* ---------------- Volume Sync ---------------- */
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = Math.min(1, Math.max(0, volume / 100));
    }
  }, [volume]);

  /* ---------------- Seek (FIXED) ---------------- */
  const handleSeek = (value: number[]) => {
    if (!audioRef.current || duration <= 0) return;

    const seekTo = value[0];
    if (isNaN(seekTo)) return;

    audioRef.current.currentTime = seekTo;
    setCurrentTime(seekTo); // immediate UI feedback
  };

  const seekDisabled = !currentSong || duration <= 0;

  /* ---------------- UI ---------------- */
  return (
    <footer className="fixed bottom-16 md:bottom-0 left-0 right-0 z-50 bg-zinc-900 border-t border-zinc-800 rounded-3xl px-4 h-20 sm:h-24">
      <div className="flex justify-between items-center h-full max-w-[1800px] mx-auto gap-4">

        {/* -------- Song Info -------- */}
        <div className="flex items-center gap-3 min-w-0 w-[30%]">
          {currentSong && (
            <div
              onClick={() => navigate(`/song/${currentSong._id}`)}
              className="flex items-center gap-3 cursor-pointer hover:opacity-80"
            >
              <img
                src={localImageUrl || currentSong.imageUrl}
                alt={currentSong.title}
                className="w-12 h-12 rounded-md object-cover"
              />
              <div className="min-w-0">
                <p className="truncate font-medium">{currentSong.title}</p>
                <p className="truncate text-sm text-zinc-400">
                  {currentSong.artist}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* -------- Player Controls -------- */}
        <div className="flex flex-col items-center gap-2 w-full sm:max-w-[45%]">

          <div className="flex items-center gap-3">
            <Button size="icon" variant="ghost" onClick={toggleShuffle}
              className={cn(isShuffled && "text-emerald-500")}>
              <Shuffle className="h-4 w-4" />
            </Button>

            <Button size="icon" variant="ghost" onClick={playPrevious}>
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button
              size="icon"
              className="bg-white text-black rounded-full h-9 w-9"
              onClick={togglePlay}
              disabled={!currentSong}
            >
              {isPlaying ? <Pause /> : <Play />}
            </Button>

            <Button size="icon" variant="ghost" onClick={playNext}>
              <SkipForward className="h-4 w-4" />
            </Button>

            <Button size="icon" variant="ghost" onClick={toggleRepeat}
              className={cn(isRepeating && "text-emerald-500")}>
              <Repeat className="h-4 w-4" />
            </Button>

            <Button size="icon" variant="ghost" onClick={toggleAutoPlay}
              className={cn(autoPlayNext && "text-emerald-500")}>
              <ListMusic className="h-4 w-4" />
            </Button>

            {/* -------- Mobile Volume -------- */}
            <div className="relative md:hidden">
              <Button size="icon" variant="ghost"
                onClick={() => setShowMobileVolume(p => !p)}>
                <Volume1 className="h-4 w-4" />
              </Button>

              {showMobileVolume && (
                <div className="absolute bottom-10 right-0 z-50 h-28 w-10 bg-zinc-900 border border-zinc-700 rounded-xl flex items-center justify-center">
                  <Slider
                    orientation="vertical"
                    value={[volume]}
                    max={100}
                    step={1}
                    onValueChange={(v) => setVolume(v[0])}
                    className="h-20 [&_[role=slider]]:bg-emerald-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* -------- Seek Bar (INTUITIVE) -------- */}
          <div className="flex items-center gap-2 w-full">
            <span className="text-xs text-zinc-400 w-10 text-right">
              {formatTime(currentTime)}
            </span>

            <Slider
              value={[currentTime]}
              max={duration || 1}
              step={0.1}
              disabled={seekDisabled}
              onValueChange={handleSeek}
              className={cn(
                "w-full",
                seekDisabled && "opacity-40 cursor-not-allowed"
              )}
            />

            <span className="text-xs text-zinc-400 w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* -------- Desktop Volume -------- */}
        <div className="hidden md:flex items-center gap-2 w-[30%] justify-end">
          <Button size="icon" variant="ghost"><Mic2 /></Button>
          <Button size="icon" variant="ghost"><ListMusic /></Button>
          <Button size="icon" variant="ghost"><Laptop2 /></Button>

          {isOffline && (
            <div className="flex items-center gap-1 text-red-500 text-xs font-bold">
              <WifiOff className="h-3 w-3" /> Offline
            </div>
          )}

          <Button size="icon" variant="ghost"><Volume1 /></Button>
          <Slider
            value={[volume]}
            max={100}
            step={1}
            onValueChange={(v) => setVolume(v[0])}
            className="w-24"
          />
        </div>
      </div>
    </footer>
  );
};
