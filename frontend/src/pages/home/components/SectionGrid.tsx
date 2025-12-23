import { Song } from "@/types";
import SectionGridSkeleton from "./SectionGridSkeleton";
import { Button } from "@/components/ui/button";
import PlayButton from "./PlayButton";
import { useNavigate } from "react-router-dom";

type SectionGridProps = {
	title: string;
	songs: Song[];
	isLoading: boolean;
};
const SectionGrid = ({ songs, title, isLoading }: SectionGridProps) => {
	const navigate = useNavigate();

	if (isLoading) return <SectionGridSkeleton />;

	// Safety check: ensure songs is an array
	const safeSongs = Array.isArray(songs) ? songs : [];

	if (safeSongs.length === 0) return null;

	return (
		<div className='mb-8'>
			<div className='flex items-center justify-between mb-4'>
				<h2 className='text-xl sm:text-2xl font-bold'>{title}</h2>
				<Button variant='link' className='text-sm text-zinc-400 hover:text-white'>
					Show all
				</Button>
			</div>

			<div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
				{safeSongs.map((song) => (
					<div
						key={song._id}
						className='bg-zinc-800/40 p-4 rounded-md hover:bg-zinc-700/40 transition-all group cursor-pointer'
						onClick={() => navigate(`/song/${song._id}`)}
					>
						<div className='relative mb-4'>
							<div className='aspect-square rounded-md shadow-lg overflow-hidden'>
								<img
									src={song.imageUrl}
									alt={song.title}
									className='w-full h-full object-cover transition-transform duration-300 
									group-hover:scale-105'
								/>
							</div>
							<div
								className='absolute bottom-3 right-3'
								onClick={(e) => e.stopPropagation()} // Prevent navigation when clicking play button
							>
								<PlayButton song={song} />
							</div>
						</div>
						<h3 className='font-medium mb-2 truncate'>{song.title}</h3>
						<p className='text-sm text-zinc-400 truncate'>{song.artist}</p>
					</div>
				))}
			</div>
		</div>
	);
};
export default SectionGrid;
