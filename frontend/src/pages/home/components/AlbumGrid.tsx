import { Album } from "@/types";
import SectionGridSkeleton from "./SectionGridSkeleton";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

type AlbumGridProps = {
	title: string;
	albums: Album[];
	isLoading: boolean;
};

const AlbumGrid = ({ albums, title, isLoading }: AlbumGridProps) => {
	const navigate = useNavigate();

	if (isLoading) return <SectionGridSkeleton />;

	const safeAlbums = Array.isArray(albums) ? albums : [];

	if (safeAlbums.length === 0) return null;

	return (
		<div className='mb-8'>
			<div className='flex items-center justify-between mb-4'>
				<h2 className='text-xl sm:text-2xl font-bold'>{title}</h2>
				<Button variant='link' className='text-sm text-zinc-400 hover:text-white'>
					Show all
				</Button>
			</div>

			<div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
				{safeAlbums.map((album) => (
					<div
						key={album._id}
						className='bg-zinc-800/40 p-4 rounded-md hover:bg-zinc-700/40 transition-all group cursor-pointer'
						onClick={() => navigate(`/albums/${album._id}`)}
					>
						<div className='relative mb-4'>
							<div className='aspect-square rounded-md shadow-lg overflow-hidden'>
								<img
									src={album.imageUrl}
									alt={album.title}
									className='w-full h-full object-cover transition-transform duration-300 
									group-hover:scale-105'
								/>
							</div>
						</div>
						<h3 className='font-medium mb-2 truncate'>{album.title}</h3>
						<p className='text-sm text-zinc-400 truncate'>{album.artist}</p>
					</div>
				))}
			</div>
		</div>
	);
};

export default AlbumGrid;
