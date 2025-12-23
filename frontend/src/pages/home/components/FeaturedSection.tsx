import { useMusicStore } from "@/stores/useMusicStore";
import FeaturedGridSkeleton from "@/components/skeletons/FeaturedGridSkeleton";
import PlayButton from "./PlayButton";
import { useNavigate } from "react-router-dom";

const FeaturedSection = () => {
	const { isLoading, featuredSongs, error } = useMusicStore();
	const navigate = useNavigate();

	if (isLoading) return <FeaturedGridSkeleton />;

	if (error) return <p className='text-red-500 mb-4 text-lg'>{error}</p>;

	// Safety check: ensure featuredSongs is an array
	const safeFeaturedSongs = Array.isArray(featuredSongs) ? featuredSongs : [];

	if (safeFeaturedSongs.length === 0) return null;

	return (
		<div className='grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8'>
			{safeFeaturedSongs.map((song) => (
				<div
					key={song._id}
					className='flex items-center bg-zinc-800/50 rounded-md overflow-hidden
         hover:bg-zinc-700/50 transition-colors group cursor-pointer relative'
					onClick={() => navigate(`/song/${song._id}`)}
				>
					<img
						src={song.imageUrl}
						alt={song.title}
						className='w-16 sm:w-20 h-16 sm:h-20 object-cover flex-shrink-0'
					/>
					<div className='flex-1 p-4'>
						<p className='font-medium truncate'>{song.title}</p>
						<p className='text-sm text-zinc-400 truncate'>{song.artist}</p>
					</div>
					<div onClick={(e) => e.stopPropagation()}>
						<PlayButton song={song} />
					</div>
				</div>
			))}
		</div>
	);
};
export default FeaturedSection;
