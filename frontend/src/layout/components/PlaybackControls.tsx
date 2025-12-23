import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Laptop2, ListMusic, Mic2, Pause, Play, Shuffle, SkipBack, SkipForward, Volume1 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const formatTime = (seconds: number) => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.floor(seconds % 60);
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const PlaybackControls = () => {
	const navigate = useNavigate();
	const { currentSong, isPlaying, togglePlay, playNext, playPrevious, autoPlayNext, toggleAutoPlay } = usePlayerStore();

	const [volume, setVolume] = useState(75);
	const [showMobileVolume, setShowMobileVolume] = useState(false);
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

		const handleEnded = () => {
			usePlayerStore.setState({ isPlaying: false });
		};

		audio.addEventListener("ended", handleEnded);

		return () => {
			audio.removeEventListener("timeupdate", updateTime);
			audio.removeEventListener("loadedmetadata", updateDuration);
			audio.removeEventListener("ended", handleEnded);
		};
	}, [currentSong]);

	const handleSeek = (value: number[]) => {
		if (audioRef.current) {
			audioRef.current.currentTime = value[0];
		}
	};

	return (
		<footer className='h-20 sm:h-24 bg-zinc-900 border-t border-zinc-800 px-4 fixed bottom-16 md:bottom-0 left-0 right-0 z-50'>
			<div className='flex justify-between items-center h-full max-w-[1800px] mx-auto gap-4'>
				{/* currently playing song */}
				<div className='flex items-center gap-3 min-w-0 flex-1 sm:flex-none sm:min-w-[180px] sm:w-[30%]'>
					{currentSong && (
						<div 
							onClick={() => navigate(`/song/${currentSong._id}`)} 
							className='flex items-center gap-3 min-w-0 group hover:opacity-80 transition-opacity cursor-pointer'
						>
							<img
								src={currentSong.imageUrl}
								alt={currentSong.title}
								className='w-10 h-10 sm:w-14 sm:h-14 object-cover rounded-md flex-shrink-0 shadow-lg'
							/>
							<div className='min-w-0 overflow-hidden'>
								<div className='font-medium truncate text-sm sm:text-base group-hover:underline'>
									{currentSong.title}
								</div>
								<div className='text-xs sm:text-sm text-zinc-400 truncate group-hover:text-zinc-300'>
									{currentSong.artist}
								</div>
							</div>
						</div>
					)}
				</div>

				{/* player controls*/}
				<div className='flex flex-col items-center gap-1 sm:gap-2 flex-none sm:flex-1 sm:max-w-[45%]'>
					<div className='flex items-center gap-3 sm:gap-6'>
						<Button
							size='icon'
							variant='ghost'
							className='hidden md:inline-flex hover:text-white text-zinc-400'
						>
							<Shuffle className='h-4 w-4' />
						</Button>

						<Button
							size='icon'
							variant='ghost'
							className='hover:text-white text-zinc-400 h-8 w-8'
							onClick={playPrevious}
							disabled={!currentSong}
						>
							<SkipBack className='h-4 w-4' />
						</Button>

						<Button
							size='icon'
							className='bg-white hover:bg-white/80 text-black rounded-full h-8 w-8 sm:h-10 sm:w-10'
							onClick={togglePlay}
							disabled={!currentSong}
						>
							{isPlaying ? <Pause className='h-5 w-5' /> : <Play className='h-5 w-5' />}
						</Button>
						<Button
							size='icon'
							variant='ghost'
							className='hover:text-white text-zinc-400 h-8 w-8'
							onClick={playNext}
							disabled={!currentSong}
						>
							<SkipForward className='h-4 w-4' />
						</Button>
						<Button
							size='icon'
							variant='ghost'
							onClick={toggleAutoPlay}
							className={`hidden md:inline-flex hover:text-white ${
								autoPlayNext ? 'text-emerald-500' : 'text-zinc-400'
							}`}
							title={autoPlayNext ? 'Auto-play: ON' : 'Auto-play: OFF'}
						>
							<ListMusic className='h-4 w-4' />
						</Button>

						<div className="relative md:hidden">
							<Button
								size='icon'
								variant='ghost'
								className={cn(
									"hover:text-white text-zinc-400 h-8 w-8",
									showMobileVolume && "text-white bg-zinc-800"
								)}
								onClick={() => setShowMobileVolume(!showMobileVolume)}
							>
								<Volume1 className='h-4 w-4' />
							</Button>

							{showMobileVolume && (
								<div className='absolute bottom-full right-0 mb-4 bg-zinc-800 p-3 rounded-lg shadow-xl border border-zinc-700 w-32 animate-in fade-in slide-in-from-bottom-2'>
									<Slider
										value={[volume]}
										max={100}
										step={1}
										className='w-full cursor-pointer'
										onValueChange={(value) => {
											setVolume(value[0]);
											if (audioRef.current) {
												audioRef.current.volume = value[0] / 100;
											}
										}}
									/>
								</div>
							)}
						</div>
					</div>

					<div className='flex items-center gap-2 w-full'>
						<div className='text-[10px] sm:text-xs text-zinc-400 w-10 text-right'>{formatTime(currentTime)}</div>
						<Slider
							value={[currentTime]}
							max={duration || 100}
							step={1}
							className='w-full hover:cursor-grab active:cursor-grabbing'
							onValueChange={handleSeek}
						/>
						<div className='text-[10px] sm:text-xs text-zinc-400 w-10'>{formatTime(duration)}</div>
					</div>
				</div>
				{/* volume controls */}
				<div className='hidden md:flex items-center gap-4 min-w-[180px] w-[30%] justify-end'>
					<Button size='icon' variant='ghost' className='hover:text-white text-zinc-400'>
						<Mic2 className='h-4 w-4' />
					</Button>
					<Button size='icon' variant='ghost' className='hover:text-white text-zinc-400'>
						<ListMusic className='h-4 w-4' />
					</Button>
					<Button size='icon' variant='ghost' className='hover:text-white text-zinc-400'>
						<Laptop2 className='h-4 w-4' />
					</Button>

					<div className='flex items-center gap-2'>
						<Button size='icon' variant='ghost' className='hover:text-white text-zinc-400'>
							<Volume1 className='h-4 w-4' />
						</Button>

						<Slider
							value={[volume]}
							max={100}
							step={1}
							className='w-24 hover:cursor-grab active:cursor-grabbing'
							onValueChange={(value) => {
								setVolume(value[0]);
								if (audioRef.current) {
									audioRef.current.volume = value[0] / 100;
								}
							}}
						/>
					</div>
				</div>
			</div>
		</footer>
	);
};
