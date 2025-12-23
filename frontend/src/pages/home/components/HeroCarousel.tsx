import { useEffect, useState } from "react";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

const HeroCarousel = () => {
    const { featuredSongs, isLoading } = useMusicStore();
    const { currentSong, isPlaying, playAlbum, togglePlay } = usePlayerStore();
    const [currentIndex, setCurrentIndex] = useState(0);

    const safeFeaturedSongs = Array.isArray(featuredSongs) ? featuredSongs.slice(0, 5) : [];

    useEffect(() => {
        if (safeFeaturedSongs.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % safeFeaturedSongs.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [safeFeaturedSongs.length]);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % safeFeaturedSongs.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + safeFeaturedSongs.length) % safeFeaturedSongs.length);
    };

    const currentSlide = safeFeaturedSongs[currentIndex];

    if (isLoading) {
        return (
            <div className='w-full h-[250px] sm:h-[400px] bg-zinc-800/50 rounded-xl animate-pulse mb-8' />
        );
    }

    if (safeFeaturedSongs.length === 0) return null;

    const isCurrentPlaying = currentSong?._id === currentSlide?._id && isPlaying;

    const handlePlay = () => {
        if (currentSong?._id === currentSlide?._id) {
            togglePlay();
        } else {
            playAlbum(safeFeaturedSongs, currentIndex);
        }
    };

    return (
        <div className='relative w-full h-[300px] sm:h-[450px] overflow-hidden rounded-xl group mb-8 shadow-2xl'>
            {/* Slides */}
            {safeFeaturedSongs.map((song, index) => (
                <div
                    key={song._id}
                    className={cn(
                        "absolute inset-0 transition-all duration-1000 ease-in-out",
                        index === currentIndex ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
                    )}
                >
                    {/* Background Image with Blur/Gradient */}
                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 group-hover:scale-110" 
                         style={{ backgroundImage: `url(${song.imageUrl})` }} />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />

                    {/* Content */}
                    <div className='absolute inset-0 flex flex-col justify-end p-6 sm:p-12 space-y-4'>
                        <div className='animate-in slide-in-from-left-8 duration-700'>
                            <span className="px-3 py-1 bg-emerald-500 text-black text-xs font-bold rounded-full uppercase tracking-wider mb-2 inline-block">
                                Featured
                            </span>
                            <h2 className='text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight drop-shadow-lg mb-2'>
                                {song.title}
                            </h2>
                            <p className='text-zinc-300 text-lg sm:text-xl font-medium drop-shadow-md'>
                                {song.artist}
                            </p>
                        </div>

                        <div className='flex items-center gap-4 animate-in slide-in-from-bottom-8 duration-700 delay-150'>
                            <Button
                                size='lg'
                                className='bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-12 px-8 rounded-full shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95'
                                onClick={handlePlay}
                            >
                                {isCurrentPlaying ? (
                                    <>
                                        <Pause className='mr-2 fill-current' />
                                        Pause
                                    </>
                                ) : (
                                    <>
                                        <Play className='mr-2 fill-current' />
                                        Listen Now
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            ))}

            {/* Navigation Buttons */}
            <button
                onClick={handlePrev}
                className='absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-md hidden sm:block'
            >
                <ChevronLeft className='size-6' />
            </button>
            <button
                onClick={handleNext}
                className='absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-md hidden sm:block'
            >
                <ChevronRight className='size-6' />
            </button>

            {/* Progress Indicators */}
            <div className='absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2'>
                {safeFeaturedSongs.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={cn(
                            "h-1.5 rounded-full transition-all duration-300",
                            index === currentIndex ? "w-8 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "w-2 bg-zinc-500 hover:bg-zinc-400"
                        )}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroCarousel;
