import { ScrollArea } from "@/components/ui/scroll-area";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Clock, Play, Pause, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDuration } from "../album/AlbumPage";
import { idbStorage } from "@/lib/idb";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

const DownloadItem = ({ song, index, isCurrentSong, isPlaying, handlePlaySong, removeDownload }: any) => {
	const [imageUrl, setImageUrl] = useState<string>(song.imageUrl);

	useEffect(() => {
		const loadLocalImage = async () => {
			const blob = await idbStorage.get(`image-${song._id}`);
			if (blob) {
				const url = URL.createObjectURL(blob);
				setImageUrl(url);
				return () => URL.revokeObjectURL(url);
			}
		};
		loadLocalImage();
	}, [song._id]);

	return (
		<div
			className={`grid grid-cols-[auto_1fr_auto] sm:grid-cols-[16px_4fr_2fr_1fr] gap-4 px-4 py-3 text-sm 
			text-zinc-400 hover:bg-white/5 rounded-md group cursor-pointer items-center transition-colors`}
            onClick={() => handlePlaySong(index)}
		>
			<div className='flex items-center justify-center text-zinc-500'>
				{isCurrentSong && isPlaying ? (
					<div className='size-4 text-green-500 font-bold'>♫</div>
				) : (
					<span className='group-hover:hidden w-4 text-center'>{index + 1}</span>
				)}
				{!isCurrentSong && (
					<Play className='h-4 w-4 hidden group-hover:block text-white' />
				)}
			</div>

			<div className='flex items-center gap-4 min-w-0'>
                <div className="relative size-10 flex-shrink-0">
				    <img src={imageUrl} alt={song.title} className='size-10 rounded shadow-md object-cover' />
                    {isCurrentSong && (
                         <div className="absolute inset-0 bg-black/20 rounded flex items-center justify-center">
                            {/* Optional: Add playing indicator overlay */}
                         </div>
                    )}
                </div>
				<div className="min-w-0 overflow-hidden">
					<div className={`font-medium truncate leading-tight ${isCurrentSong ? 'text-green-500' : 'text-white'}`}>{song.title}</div>
					<div className="truncate text-zinc-400 text-xs mt-0.5">{song.artist}</div>
				</div>
			</div>
			
			<div className='hidden sm:flex items-center truncate text-zinc-400 text-xs'>{song.albumId || 'Single'}</div>
			
			<div className='flex items-center justify-end sm:justify-between pointer-events-none'>
				<span className="hidden sm:inline text-xs">{formatDuration(song.duration)}</span>
				<Button
					size="icon"
					variant="ghost"
					className="h-8 w-8 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity"
					onClick={(e) => {
						e.stopPropagation();
						removeDownload(song._id);
					}}
				>
					<Trash2 className="size-4" />
				</Button>
			</div>
		</div>
	);
};

const DownloadedSongsPage = () => {
	const { downloadedSongs, removeDownload } = useMusicStore();
	const { currentSong, isPlaying, playAlbum, togglePlay } = usePlayerStore();

	const handlePlayPlaylist = () => {
		if (!downloadedSongs.length) return;

		const isDownloadedPlaying = downloadedSongs.some((song) => song._id === currentSong?._id);
		if (isDownloadedPlaying) togglePlay();
		else {
			playAlbum(downloadedSongs, 0);
		}
	};

	const handlePlaySong = (index: number) => {
		playAlbum(downloadedSongs, index);
	};

	return (
		<div className='h-full bg-zinc-950/50'>
			<ScrollArea className='h-full rounded-md'>
				<div className='relative min-h-full'>
					{/* Subtle Mesh Background */}
					<div
						className='absolute inset-0 bg-gradient-to-b from-emerald-900/40 via-zinc-950/60
					 to-zinc-950 pointer-events-none'
						aria-hidden='true'
					/>

					{/* Content */}
					<div className='relative z-10'>
						{/* Header Section */}
						<div className='flex flex-col md:flex-row items-center md:items-end gap-8 p-8 pb-10'>
							<div className="size-32 md:size-44 shadow-2xl rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-900 flex items-center justify-center flex-shrink-0 border border-white/5">
                                <Download className="size-16 md:size-20 text-white/90" />
                            </div>
							<div className='flex flex-col items-center md:items-start text-center md:text-left flex-1 min-w-0'>
								<p className='text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2'>Offline Library</p>
								<h1 className='text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-none mb-4'>
                                    Downloaded Songs
                                </h1>
								<div className='flex items-center gap-2 text-sm text-zinc-400 font-medium'>
                                    <div className="size-6 rounded-full bg-zinc-700 flex items-center justify-center text-xs text-white">U</div>
									<span className='text-zinc-300'>Your Collection</span>
									<span>•</span>
                                    <span>{downloadedSongs.length} tracks</span>
								</div>
							</div>
						</div>

						{/* Action Bar */}
						<div className='px-8 pb-6 sticky top-0 bg-zinc-950/95 backdrop-blur-md z-20 md:static md:bg-transparent flex items-center gap-4 border-b border-white/5 md:border-none'>
							<Button
								onClick={handlePlayPlaylist}
                                disabled={downloadedSongs.length === 0}
								size='icon'
								className='size-12 rounded-full bg-emerald-500 hover:bg-emerald-400 
                hover:scale-105 transition-all text-black shadow-lg shadow-emerald-500/20'
							>
								{isPlaying && downloadedSongs.some((song) => song._id === currentSong?._id) ? (
									<Pause className='size-6 fill-black' />
								) : (
									<Play className='size-6 translate-x-0.5 fill-black' />
								)}
							</Button>
						</div>

						{/* Songs List */}
						<div className='bg-black/10 backdrop-blur-sm min-h-[500px]'>
							{/* Table Header - Hidden on Mobile */}
							<div
								className='hidden sm:grid grid-cols-[16px_4fr_2fr_1fr] gap-4 px-8 py-3 text-xs font-medium uppercase tracking-wider
            text-zinc-500 border-b border-white/5'
							>
								<div className="text-center">#</div>
								<div>Title</div>
								<div>Album</div>
								<div className="text-right pr-8">
									<Clock className='size-4 ml-auto' />
								</div>
							</div>

							<div className='px-2 sm:px-6 py-2'>
                                {downloadedSongs.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-4">
                                        <div className="size-16 rounded-full bg-zinc-900 flex items-center justify-center">
                                            <Download className="size-8 opacity-50" />
                                        </div>
                                        <p>No songs downloaded for offline listening.</p>
                                    </div>
                                )}
								<div className='space-y-1'>
									{downloadedSongs.map((song, index) => (
										<DownloadItem 
											key={song._id}
											song={song}
											index={index}
											isCurrentSong={currentSong?._id === song._id}
											isPlaying={isPlaying}
											handlePlaySong={handlePlaySong}
											removeDownload={removeDownload}
										/>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</ScrollArea>
		</div>
	);
};
export default DownloadedSongsPage;
