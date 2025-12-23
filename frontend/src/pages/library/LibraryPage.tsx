import { ScrollArea } from "@/components/ui/scroll-area";
import { useMusicStore } from "@/stores/useMusicStore";
import { Download, Heart, Music } from "lucide-react";
import { Link } from "react-router-dom";

const LibraryPage = () => {
    const { albums, featuredPlaylists, likedSongs, downloadedSongs } = useMusicStore();

    return (
        <ScrollArea className='h-full'>
            <div className='p-6'>
                <h1 className='text-3xl font-bold mb-6 text-white'>Your Library</h1>

                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
                    {/* Liked Songs Card */}
                    <Link
                        to='/liked-songs'
                        className='bg-zinc-800/40 p-4 rounded-md hover:bg-zinc-800 transition-all group cursor-pointer relative'
                    >
                        <div className="relative mb-4">
                            <div className='aspect-square rounded-md bg-gradient-to-br from-indigo-700 to-indigo-900 flex items-center justify-center'>
                                <Heart className="w-16 h-16 text-white fill-white" />
                            </div>
                        </div>
                        <h3 className='font-semibold text-white mb-1 truncate'>Liked Songs</h3>
                        <p className='text-sm text-zinc-400 truncate'>
                            Playlist • {likedSongs.length} songs
                        </p>
                    </Link>

                    {/* Downloaded Songs Card */}
                    <Link
                        to='/downloaded-songs'
                        className='bg-zinc-800/40 p-4 rounded-md hover:bg-zinc-800 transition-all group cursor-pointer relative'
                    >
                        <div className="relative mb-4">
                            <div className='aspect-square rounded-md bg-gradient-to-br from-emerald-700 to-emerald-900 flex items-center justify-center'>
                                <Download className="w-16 h-16 text-white" />
                            </div>
                        </div>
                        <h3 className='font-semibold text-white mb-1 truncate'>Downloads</h3>
                        <p className='text-sm text-zinc-400 truncate'>
                            Local • {downloadedSongs.length} songs
                        </p>
                    </Link>

                    {/* Albums & Playlists */}
                    {[...albums, ...featuredPlaylists].map((item) => (
                        <Link
                            key={item._id}
                            to={`/albums/${item._id}`}
                            className='bg-zinc-800/40 p-4 rounded-md hover:bg-zinc-800 transition-all group cursor-pointer'
                        >
                            <div className='relative mb-4'>
                                <div className='aspect-square rounded-md overflow-hidden bg-zinc-800 flex items-center justify-center'>
                                    {item.imageUrl ? (
                                        <img
                                            src={item.imageUrl}
                                            alt={item.title}
                                            className='w-full h-full object-cover transition-transform group-hover:scale-105'
                                        />
                                    ) : (
                                        <Music className="w-16 h-16 text-zinc-600" />
                                    )}
                                </div>
                            </div>
                            <h3 className='font-semibold text-white mb-1 truncate'>{item.title}</h3>
                            <p className='text-sm text-zinc-400 truncate'>
                                {item.artist}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </ScrollArea>
    );
};

export default LibraryPage;
