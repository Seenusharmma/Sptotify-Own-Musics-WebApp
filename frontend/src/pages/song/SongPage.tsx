import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Play, Pause, Clock, User, Download, Share2, Heart } from "lucide-react";

import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { formatDuration } from "@/pages/album/AlbumPage";
import toast from "react-hot-toast";
import { useRef, useState } from "react";

const formatTime = (seconds: number) => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.floor(seconds % 60);
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const SongPage = () => {
  const { songId } = useParams();

  const { fetchSongById, currentSongDetails, isLoading, error, toggleLike, isLiked, addDownload, removeDownload, downloadedSongs, recommendations, fetchRecommendations } =
    useMusicStore();
  const { currentSong, isPlaying, playAlbum, togglePlay } =
    usePlayerStore();

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = document.querySelector("audio");
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
    };
  }, [songId]);

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
    }
  };

  useEffect(() => {
    if (songId) {
        fetchSongById(songId);
        fetchRecommendations(songId);
    }
  }, [songId, fetchSongById, fetchRecommendations]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-zinc-950">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-red-500 text-sm">
        {error}
      </div>
    );
  }

  if (!currentSongDetails) return null;

  const isCurrentSong = currentSong?._id === currentSongDetails._id;

  const handlePlay = () => {
    if (isCurrentSong) togglePlay();
    else playAlbum([currentSongDetails], 0);
  };

  const isDownloaded = downloadedSongs.some((s) => s._id === currentSongDetails._id);

  const handleDownload = async () => {
    if (isDownloaded) {
      await removeDownload(currentSongDetails._id);
    } else {
      await addDownload(currentSongDetails);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: currentSongDetails.title,
      text: `Check out "${currentSongDetails.title}" by ${currentSongDetails.artist}`,
      url: window.location.href,
    };

    try {
      // Use Web Share API if available (mobile)
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Share failed:', error);
        toast.error('Failed to share');
      }
    }
  };

  return (
    <main className="relative h-full bg-zinc-950 overflow-hidden">
      <ScrollArea className="h-full">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-500/20 via-zinc-950 to-zinc-950 h-[900px]" />

        {/* HEADER */}
        <section className="px-4 sm:px-6 lg:px-16 pt-20 pb-10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-end gap-6">

            {/* Artwork */}
            <div className="relative group shrink-0 rounded-xl overflow-hidden shadow-2xl">
              <img
                src={currentSongDetails.imageUrl}
                alt={currentSongDetails.title}
                className="w-36 h-36 sm:w-48 sm:h-48 lg:w-72 lg:h-72 object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>

            {/* Meta */}
            <div className="flex-1 min-w-0 text-center md:text-left space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-7xl font-extrabold text-white leading-tight break-words tracking-tight">
                {currentSongDetails.title}
              </h1>

              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm sm:text-base text-zinc-300 items-center">
                <span className="flex items-center gap-2 font-medium text-white">
                  <User className="size-5 text-emerald-400" />
                  {currentSongDetails.artist}
                </span>

                <span className="hidden sm:inline w-1 h-1 bg-zinc-500 rounded-full"></span>

                <span className="flex items-center gap-2">
                  <Clock className="size-4" />
                  {formatDuration(currentSongDetails.duration)}
                </span>
                
                <span className="hidden sm:inline w-1 h-1 bg-zinc-500 rounded-full"></span>

                <span className="text-zinc-400">
                    {new Date(currentSongDetails.createdAt).getFullYear()}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <section className="px-4 sm:px-6 lg:px-16 pb-16">
          <div className="max-w-7xl mx-auto space-y-12">

            {/* Progress Slider (Mobile & Desktop) */}
            <div className="space-y-2">
                <Slider
                    value={[currentTime]}
                    max={duration || 100}
                    step={1}
                    className="w-full hover:cursor-grab active:cursor-grabbing"
                    onValueChange={handleSeek}
                />
                <div className="flex justify-between text-xs text-zinc-400 font-medium tracking-wider">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 border-t border-white/10 pt-8">
              <div className="flex items-center gap-6">
                <Button
                    onClick={handlePlay}
                    className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 hover:scale-105 transition-all text-black shadow-lg shadow-emerald-500/20"
                >
                    {isCurrentSong && isPlaying ? (
                    <Pause className="w-8 h-8 fill-black" />
                    ) : (
                    <Play className="w-8 h-8 ml-1 fill-black" />
                    )}
                </Button>

                <div className="flex items-center gap-4">
                    <Button
                        onClick={() => toggleLike(currentSongDetails)}
                        variant="ghost"
                        size="icon"
                        className={`w-12 h-12 rounded-full border border-white/10 hover:bg-white/5 
                        ${isLiked(currentSongDetails._id) ? "text-emerald-500" : "text-zinc-400 hover:text-white"}`}
                        title="Like"
                    >
                        <Heart className={`w-6 h-6 ${isLiked(currentSongDetails._id) ? "fill-emerald-500" : ""}`} />
                    </Button>

                    <Button
                        onClick={handleDownload}
                        variant="ghost"
                        size="icon"
                        className={`w-12 h-12 rounded-full border border-white/10 hover:bg-white/5 transition-colors
                        ${isDownloaded ? "text-emerald-500 border-emerald-500/50 bg-emerald-500/5" : "text-zinc-400 hover:text-white"}`}
                        title={isDownloaded ? "Remove from downloads" : "Download for offline playback"}
                    >
                        <Download className={`w-6 h-6 ${isDownloaded ? "fill-emerald-500" : ""}`} />
                    </Button>

                    <Button
                        onClick={handleShare}
                        variant="ghost"
                        size="icon"
                        className="w-12 h-12 rounded-full border border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white"
                        title="Share"
                    >
                        <Share2 className="w-6 h-6" />
                    </Button>
                </div>
              </div>
            </div>

            {/* Recommendations section */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white px-1">Similar Songs</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-8">
                    {recommendations?.slice(0, 10).map((song) => (
                        <div key={song._id} className="bg-zinc-900/40 p-3 rounded-lg hover:bg-zinc-800/60 transition-all group flex flex-col gap-3">
                            <div className="relative aspect-square rounded-md overflow-hidden shadow-lg">
                                <img src={song.imageUrl} alt={song.title} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button
                                        size="icon"
                                        className="bg-emerald-500 hover:bg-emerald-400 text-black rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 shadow-xl"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            playAlbum([song], 0);
                                        }}
                                    >
                                        <Play className="fill-current ml-1" />
                                    </Button>
                                </div>
                            </div>
                            <Link to={`/song/${song._id}`} className="flex-1 min-w-0">
                                <h3 className="font-semibold text-white truncate hover:underline">{song.title}</h3>
                                <p className="text-sm text-zinc-400 truncate">{song.artist}</p>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </section>
      </ScrollArea>
    </main>
  );
};

export default SongPage;
