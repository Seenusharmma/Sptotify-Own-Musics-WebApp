import { useEffect } from "react";
import Topbar from "@/components/Topbar";
import { ScrollArea } from "@/components/ui/scroll-area";

import FeaturedSection from "./components/FeaturedSection";
import SectionGrid from "./components/SectionGrid";

import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useSearchStore } from "@/stores/useSearchStore";

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
  } = useMusicStore();

  const { recentlyPlayed } = useSearchStore();
  const { initializeQueue } = usePlayerStore();

  // Fetch songs
  useEffect(() => {
    fetchFeaturedSongs();
    fetchMadeForYouSongs();
    fetchTrendingSongs();
    fetchBollywoodSongs();
    fetchPunjabiSongs();
    fetchHollywoodSongs();
  }, []);

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
          <h1 className='text-2xl sm:text-3xl font-bold mb-6'>Good afternoon</h1>
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
          </div>
        </div>
      </ScrollArea>
    </main>
  );
};

export default HomePage;
