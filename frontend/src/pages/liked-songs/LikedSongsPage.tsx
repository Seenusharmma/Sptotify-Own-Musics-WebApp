import { ScrollArea } from "@/components/ui/scroll-area";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Play, Pause, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDuration } from "../album/AlbumPage";

const LikedSongsPage = () => {
  const { likedSongs, toggleLike } = useMusicStore();
  const { currentSong, isPlaying, playAlbum, togglePlay } = usePlayerStore();

  const isPlayingLiked = likedSongs.some(
    (s) => s._id === currentSong?._id
  );

  return (
    <div className="h-full bg-zinc-900">
      <ScrollArea className="h-full">
        <div className="px-4 pb-24">
          {/* HEADER */}
          <div className="pt-6 pb-4">
            <p className="text-xs text-zinc-400">Playlist</p>
            <h1 className="text-2xl font-semibold text-white mt-1">
              Liked Songs
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              {likedSongs.length} songs
            </p>
          </div>

          {/* PLAY BUTTON */}
          <div className="mb-4">
            <Button
              onClick={() =>
                isPlayingLiked ? togglePlay() : playAlbum(likedSongs, 0)
              }
              disabled={!likedSongs.length}
              className="h-10 px-6 rounded-full bg-green-500 text-black text-sm font-medium hover:bg-green-400"
            >
              {isPlaying && isPlayingLiked ? (
                <>
                  <Pause className="w-4 h-4 mr-2" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" /> Play
                </>
              )}
            </Button>
          </div>

          {/* SONG LIST */}
          <div className="space-y-1">
            {likedSongs.length === 0 && (
              <p className="text-sm text-zinc-500 text-center mt-10">
                No liked songs yet
              </p>
            )}

            {likedSongs.map((song, index) => {
              const isCurrent = song._id === currentSong?._id;

              return (
                <div
                  key={song._id}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-zinc-800 transition"
                  onClick={() => playAlbum(likedSongs, index)}
                >
                  {/* IMAGE */}
                  <img
                    src={song.imageUrl}
                    alt={song.title}
                    className="w-12 h-12 rounded object-cover"
                  />

                  {/* INFO */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm truncate ${
                        isCurrent ? "text-green-400" : "text-white"
                      }`}
                    >
                      {song.title}
                    </p>
                    <p className="text-xs text-zinc-400 truncate">
                      {song.artist}
                    </p>
                  </div>

                  {/* RIGHT ACTIONS */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-400">
                      {formatDuration(song.duration)}
                    </span>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-zinc-500 hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(song);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default LikedSongsPage;
