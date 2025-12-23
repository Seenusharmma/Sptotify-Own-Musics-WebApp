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
			className={`grid grid-cols-[16px_4fr_2fr_1fr] gap-4 px-4 py-2 text-sm 
			text-zinc-400 hover:bg-white/5 rounded-md group cursor-pointer items-center`}
		>
			<div className='flex items-center justify-center' onClick={() => handlePlaySong(index)}>
				{isCurrentSong && isPlaying ? (
					<div className='size-4 text-green-500 font-bold'>♫</div>
				) : (
					<span className='group-hover:hidden'>{index + 1}</span>
				)}
				{!isCurrentSong && (
					<Play className='h-4 w-4 hidden group-hover:block text-white translate-x-0.5' />
				)}
			</div>

			<div className='flex items-center gap-3 min-w-0' onClick={() => handlePlaySong(index)}>
				<img src={imageUrl} alt={song.title} className='size-10 rounded shadow-md object-cover flex-shrink-0' />
				<div className="min-w-0 overflow-hidden">
					<div className={`font-medium truncate ${isCurrentSong ? 'text-green-500' : 'text-white'}`}>{song.title}</div>
					<div className="truncate text-zinc-400 text-xs">{song.artist}</div>
				</div>
			</div>
			
			<div className='flex items-center truncate' onClick={() => handlePlaySong(index)}>{song.albumId || 'Single'}</div>
			
			<div className='flex items-center justify-between pointer-events-none'>
				<span className="group-hover:hidden">{formatDuration(song.duration)}</span>
				<Button
					size="icon"
					variant="ghost"
					className="hidden group-hover:flex h-8 w-8 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 pointer-events-auto"
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
		<div className='h-full'>
			<ScrollArea className='h-full rounded-md'>
				{/* Main Content */}
				<div className='relative min-h-full'>
					{/* bg gradient */}
					<div
						className='absolute inset-0 bg-gradient-to-b from-emerald-800/80 via-zinc-900/80
					 to-zinc-900 pointer-events-none'
						aria-hidden='true'
					/>

					{/* Content */}
					<div className='relative z-10'>
						<div className='flex p-6 gap-6 pb-8'>
							<div className="w-[240px] h-[240px] shadow-xl rounded bg-gradient-to-br from-emerald-700 to-emerald-900 flex items-center justify-center">
                                <Download className="size-32 text-white" />
                            </div>
							<div className='flex flex-col justify-end'>
								<p className='text-sm font-medium'>Playlist</p>
								<h1 className='text-5xl sm:text-7xl font-bold my-4'>Downloaded Songs</h1>
								<div className='flex items-center gap-2 text-sm text-zinc-100'>
									<span className='font-medium text-white'>You</span>
									<span>• {downloadedSongs.length} songs</span>
								</div>
							</div>
						</div>

						{/* play button */}
						<div className='px-6 pb-4 flex items-center gap-6'>
							<Button
								onClick={handlePlayPlaylist}
                                disabled={downloadedSongs.length === 0}
								size='icon'
								className='w-14 h-14 rounded-full bg-green-500 hover:bg-green-400 
                hover:scale-105 transition-all text-black disabled:bg-zinc-600 disabled:opacity-50'
							>
								{isPlaying && downloadedSongs.some((song) => song._id === currentSong?._id) ? (
									<Pause className='h-7 w-7 fill-black' />
								) : (
									<Play className='h-7 w-7 fill-black' />
								)}
							</Button>
						</div>

						{/* Table Section */}
						<div className='bg-black/20 backdrop-blur-sm'>
							{/* table header */}
							<div
								className='grid grid-cols-[16px_4fr_2fr_1fr] gap-4 px-10 py-2 text-sm 
            text-zinc-400 border-b border-white/5'
							>
								<div>#</div>
								<div>Title</div>
								<div>Album</div>
								<div>
									<Clock className='h-4 w-4' />
								</div>
							</div>

							{/* songs list */}

							<div className='px-6'>
								<div className='space-y-2 py-4'>
                                    {downloadedSongs.length === 0 && (
                                        <div className="text-center py-10 text-zinc-500">
                                            No downloaded songs yet.
                                        </div>
                                    )}
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
