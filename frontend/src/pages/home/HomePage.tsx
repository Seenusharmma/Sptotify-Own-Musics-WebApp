import { useEffect } from "react";
import Topbar from "@/components/Topbar";
import { ScrollArea } from "@/components/ui/scroll-area";

import FeaturedSection from "./components/FeaturedSection";
import HeroCarousel from "./components/HeroCarousel";
import SectionGrid from "./components/SectionGrid";
import AlbumGrid from "./components/AlbumGrid";

import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useSearchStore } from "@/stores/useSearchStore";
import { WifiOff, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HomePage = () => {
  const {
    fetchFeaturedSongs,
    fetchMadeForYouSongs,
    fetchTrendingSongs,
    fetchBollywoodSongs,
    fetchPunjabiSongs,
    fetchHollywoodSongs,
    isLoading,
    featuredSongs,
    madeForYouSongs,
    trendingSongs,
    bollywoodSongs,
    punjabiSongs,
    hollywoodSongs,
    isOffline,
    downloadedSongs,
    fetchJioOriginals,
    fetchTrendingAlbums,
    fetchArijitAlbums,
    jioOriginals,
    trendingAlbums,
    arijitAlbums,
  } = useMusicStore();

  const { recentlyPlayed } = useSearchStore();
  const { initializeQueue } = usePlayerStore();

  // Fetch songs
  useEffect(() => {
    if (isOffline) return;
    
    fetchFeaturedSongs();
    fetchMadeForYouSongs();
    fetchTrendingSongs();
    fetchBollywoodSongs();
    fetchPunjabiSongs();
    fetchHollywoodSongs();
    fetchJioOriginals();
    fetchTrendingAlbums();
    fetchArijitAlbums();
  }, [isOffline, fetchFeaturedSongs, fetchMadeForYouSongs, fetchTrendingSongs, fetchBollywoodSongs, fetchPunjabiSongs, fetchHollywoodSongs, fetchJioOriginals, fetchTrendingAlbums, fetchArijitAlbums]);

  // Initialize queue
  useEffect(() => {
    // Safety check: ensure all arrays are valid before spreading
    const safeFeaturedSongs = Array.isArray(featuredSongs) ? featuredSongs : [];
    const safeMadeForYouSongs = Array.isArray(madeForYouSongs) ? madeForYouSongs : [];
    const safeTrendingSongs = Array.isArray(trendingSongs) ? trendingSongs : [];
    const safeBollywoodSongs = Array.isArray(bollywoodSongs) ? bollywoodSongs : [];
    const safePunjabiSongs = Array.isArray(punjabiSongs) ? punjabiSongs : [];
    const safeHollywoodSongs = Array.isArray(hollywoodSongs) ? hollywoodSongs : [];

    const allSongs = [
      ...safeFeaturedSongs,
      ...safeMadeForYouSongs,
      ...safeTrendingSongs,
      ...safeBollywoodSongs,
      ...safePunjabiSongs,
      ...safeHollywoodSongs,
    ];
    if (allSongs.length) initializeQueue(allSongs);
  }, [
    featuredSongs,
    madeForYouSongs,
    trendingSongs,
    bollywoodSongs,
    punjabiSongs,
    hollywoodSongs,
    initializeQueue,
  ]);

  return (
    <main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900'>
      <Topbar />
      <ScrollArea className='h-[calc(100%-80px)]'>
        <div className='p-4 sm:p-6'>
          {isOffline && featuredSongs.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
                <WifiOff className="size-20 text-zinc-500 relative z-10" />
              </div>
              <div className="space-y-2 relative z-10">
                <h2 className="text-3xl font-bold text-white">You're Offline</h2>
                <p className="text-zinc-400 max-w-md mx-auto">
                  Connect to the internet to discover new music, or listen to your downloaded songs right now.
                </p>
              </div>
              <Link to="/downloaded-songs">
                <Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 py-6 rounded-full text-lg shadow-lg hover:scale-105 transition-all">
                  <Download className="mr-2 size-5" />
                  Go to Downloads ({downloadedSongs.length})
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <HeroCarousel />
              <FeaturedSection />

              <div className='space-y-8'>
                {recentlyPlayed.length > 0 && (
                  <SectionGrid
                    title='Recently Played'
                    songs={recentlyPlayed}
                    isLoading={isLoading}
                  />
                )}

                <SectionGrid
                  title='Made For You'
                  songs={madeForYouSongs}
                  isLoading={isLoading}
                />

                <SectionGrid
                  title='Trending Now'
                  songs={trendingSongs}
                  isLoading={isLoading}
                />

                <SectionGrid
                  title='Bollywood Hits'
                  songs={bollywoodSongs}
                  isLoading={isLoading}
                />

                <SectionGrid
                  title='Punjabi Vibes'
                  songs={punjabiSongs}
                  isLoading={isLoading}
                />

                <SectionGrid
                  title='Hollywood'
                  songs={hollywoodSongs}
                  isLoading={isLoading}
                />

                <SectionGrid
                  title='JioSaavn Originals'
                  songs={jioOriginals}
                  isLoading={isLoading}
                />

                <AlbumGrid
                  title='Trending Albums'
                  albums={trendingAlbums}
                  isLoading={isLoading}
                />

                <AlbumGrid
                  title='Arijit Singh Hits'
                  albums={arijitAlbums}
                  isLoading={isLoading}
                />
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </main>
  );
};

export default HomePage;
