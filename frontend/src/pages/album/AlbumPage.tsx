import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Clock, Pause, Play } from "lucide-react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

export const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const AlbumPage = () => {
  const { albumId } = useParams();
  const { fetchAlbumById, currentAlbum, isLoading } = useMusicStore();
  const { currentSong, isPlaying, playAlbum, togglePlay } = usePlayerStore();

  useEffect(() => {
    if (albumId) fetchAlbumById(albumId);
  }, [fetchAlbumById, albumId]);

  if (isLoading || !currentAlbum) return null;

  const isAlbumPlaying =
    Array.isArray(currentAlbum.songs) &&
    currentAlbum.songs.some((s) => s._id === currentSong?._id);

  return (
    <div className="h-full">
      <ScrollArea className="h-full">
        <div className="relative min-h-full">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#5038a0]/70 via-zinc-900 to-zinc-900" />

          <div className="relative z-10 px-4 sm:px-6 pb-10">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-6">
              <img
                src={currentAlbum.imageUrl}
                alt={currentAlbum.title}
                className="w-40 h-40 sm:w-56 sm:h-56 rounded-lg shadow-xl mx-auto sm:mx-0"
              />

              <div className="flex flex-col justify-end text-center sm:text-left">
                <p className="text-xs uppercase text-zinc-400">Album</p>

                <h1 className="text-2xl sm:text-4xl font-bold text-white mt-1">
                  {currentAlbum.title}
                </h1>

                <div className="mt-2 text-xs sm:text-sm text-zinc-300 space-y-1 sm:space-y-0 sm:flex sm:items-center sm:gap-2">
                  <span className="font-medium text-white">
                    {currentAlbum.artist}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span>{currentAlbum.songs.length} songs</span>
                  <span className="hidden sm:inline">•</span>
                  <span>{currentAlbum.releaseYear}</span>
                </div>
              </div>
            </div>

            {/* PLAY BUTTON */}
            <div className="mt-5 flex justify-center sm:justify-start">
              <Button
                onClick={() =>
                  isAlbumPlaying ? togglePlay() : playAlbum(currentAlbum.songs, 0)
                }
                size="icon"
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-green-500 hover:bg-green-400"
              >
                {isAlbumPlaying && isPlaying ? (
                  <Pause className="h-6 w-6 text-black" />
                ) : (
                  <Play className="h-6 w-6 text-black" />
                )}
              </Button>
            </div>

            {/* SONG LIST */}
            <div className="mt-6 bg-black/20 backdrop-blur-sm rounded-lg">
              {/* HEADER (HIDDEN ON MOBILE) */}
              <div className="hidden sm:grid grid-cols-[24px_4fr_2fr_1fr] px-6 py-2 text-xs text-zinc-400 border-b border-white/10">
                <div>#</div>
                <div>Title</div>
                <div>Release</div>
                <div>
                  <Clock className="h-4 w-4" />
                </div>
              </div>

              {/* SONG ROWS */}
              <div className="divide-y divide-white/5">
                {currentAlbum.songs.map((song, index) => {
                  const isCurrent = song._id === currentSong?._id;

                  return (
                    <div
                      key={song._id}
                      onClick={() => playAlbum(currentAlbum.songs, index)}
                      className="flex sm:grid sm:grid-cols-[24px_4fr_2fr_1fr] items-center gap-3 px-4 py-3 text-xs sm:text-sm hover:bg-white/5 cursor-pointer"
                    >
                      {/* INDEX / PLAY */}
                      <div className="hidden sm:flex justify-center text-zinc-400">
                        {isCurrent && isPlaying ? "♫" : index + 1}
                      </div>

                      {/* TITLE */}
                      <div className="flex items-center gap-3 flex-1">
                        <img
                          src={song.imageUrl}
                          alt={song.title}
                          className="w-10 h-10 rounded"
                        />
                        <div>
                          <p className="font-medium text-white leading-tight">
                            {song.title}
                          </p>
                          <p className="text-zinc-400 text-xs">
                            {song.artist}
                          </p>
                        </div>
                      </div>

                      {/* RELEASE (HIDDEN MOBILE) */}
                      <div className="hidden sm:block text-zinc-400">
                        {song.createdAt.split("T")[0]}
                      </div>

                      {/* DURATION */}
                      <div className="text-zinc-400 ml-auto sm:ml-0">
                        {formatDuration(song.duration)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default AlbumPage;
