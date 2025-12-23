import { useEffect, useState } from "react";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

const HeroCarousel = () => {
  const { featuredSongs = [], isLoading } = useMusicStore();
  const { currentSong, isPlaying, playAlbum, togglePlay } = usePlayerStore();

  const slides = featuredSongs.slice(0, 5);
  const [index, setIndex] = useState(0);

  /* Auto Slide */
  useEffect(() => {
    if (!slides.length) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 4500);
    return () => clearInterval(id);
  }, [slides.length]);

  if (isLoading) {
    return (
      <div className="w-full aspect-[16/6] sm:aspect-[16/5] bg-zinc-800/50 rounded-xl animate-pulse mb-6" />
    );
  }

  if (!slides.length) return null;

  const current = slides[index];
  const isCurrentPlaying =
    currentSong?._id === current?._id && isPlaying;

  const handlePlay = () => {
    if (currentSong?._id === current?._id) togglePlay();
    else playAlbum(slides, index);
  };

  return (
    <div className="relative w-full overflow-hidden mb-6">
      {/* Slider Track */}
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((song) => (
          <div
            key={song._id}
            className="min-w-full px-2"
          >
            <div className="relative rounded-xl overflow-hidden aspect-[16/9] sm:aspect-[16/6] shadow-lg">
              {/* Image */}
              <img
                src={song.imageUrl}
                alt={song.title}
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 p-4 sm:p-8 max-w-[70%]">
                <span className="text-xs bg-emerald-500 text-black px-2 py-1 rounded-full font-semibold">
                  Featured
                </span>

                <h2 className="text-xl sm:text-3xl font-bold text-white mt-2 line-clamp-2">
                  {song.title}
                </h2>

                <p className="text-zinc-300 text-sm sm:text-base">
                  {song.artist}
                </p>

                <Button
                  onClick={handlePlay}
                  className="mt-3 h-9 px-5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold"
                >
                  {isCurrentPlaying ? (
                    <>
                      <Pause className="mr-2 size-4" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 size-4" /> Play
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Arrows (Desktop) */}
      <button
        onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
        className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full"
      >
        <ChevronLeft />
      </button>

      <button
        onClick={() => setIndex((i) => (i + 1) % slides.length)}
        className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full"
      >
        <ChevronRight />
      </button>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === index
                ? "w-6 bg-emerald-500"
                : "w-2 bg-zinc-400"
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
