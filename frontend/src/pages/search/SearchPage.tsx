import { useState } from "react";
import Topbar from "@/components/Topbar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Play, Pause, Music2 } from "lucide-react";
import { useSearchStore } from "@/stores/useSearchStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Song } from "@/types";
import { useNavigate } from "react-router-dom";
import SearchBar from "./components/SearchBar";
import PopularSearches from "./components/PopularSearches";

const SearchPage = () => {
	const { searchSongs, searchResults, isLoading, error, addToRecentlyPlayed } = useSearchStore();
	const [searchQuery, setSearchQuery] = useState("");
	const { currentSong, isPlaying, setCurrentSong, togglePlay } = usePlayerStore();
	const navigate = useNavigate();

	const handleSearch = (query: string) => {
		if (query.trim()) {
			searchSongs(query);
		}
	};

	const handlePlaySong = (song: Song) => {
		if (currentSong?._id === song._id) {
			togglePlay();
		} else {
			setCurrentSong(song);
			addToRecentlyPlayed(song);
		}
	};

	const handlePopularSearchClick = (query: string) => {
		setSearchQuery(query);
		handleSearch(query);
	};

	// Ensure searchResults is always an array
	const safeSearchResults = Array.isArray(searchResults) ? searchResults : [];
	const hasResults = safeSearchResults.length > 0;
	const hasSearched = searchQuery.trim().length > 0;

	return (
		<main className="rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-900 via-zinc-900 to-black">
			<Topbar />
			<ScrollArea className="h-[calc(100vh-180px)]">
				<div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
					{/* Search Bar */}
					<div className="mb-8">
						<SearchBar
							value={searchQuery}
							onChange={setSearchQuery}
							onSearch={handleSearch}
						/>
					</div>

					{/* Loading State */}
					{isLoading && (
						<div className="flex flex-col justify-center items-center h-64">
							<Loader2 className="h-12 w-12 text-emerald-500 animate-spin mb-4" />
							<p className="text-zinc-400 text-sm">Searching...</p>
						</div>
					)}

					{/* Error State */}
					{error && (
						<div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
							<p className="text-red-400">{error}</p>
						</div>
					)}

					{/* Search Results */}
					{!isLoading && hasSearched && hasResults && (
						<div>
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-2xl font-bold text-white">
									Search Results
									<span className="text-zinc-400 text-base font-normal ml-2">
										({safeSearchResults.length} songs)
									</span>
								</h2>
							</div>
							<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
								{safeSearchResults.map((song) => (
									<div
										key={song._id}
										className="group relative bg-zinc-800/40 hover:bg-zinc-800/60 p-4 rounded-lg
											transition-all duration-200 cursor-pointer backdrop-blur-sm"
										onClick={() => navigate(`/songs/${song._id}`)}
									>
										{/* Album Art */}
										<div className="relative aspect-square mb-4 overflow-hidden rounded-md shadow-lg">
											<img
												src={song.imageUrl}
												alt={song.title}
												className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
											/>
											{/* Play Button Overlay */}
											<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 
												transition-opacity duration-200 flex items-center justify-center">
												<button
													onClick={(e) => {
														e.stopPropagation();
														handlePlaySong(song);
													}}
													className="h-12 w-12 bg-emerald-500 rounded-full flex items-center justify-center
														shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-all
														hover:bg-emerald-400 hover:scale-110"
												>
													{currentSong?._id === song._id && isPlaying ? (
														<Pause className="h-5 w-5 text-black fill-black" />
													) : (
														<Play className="h-5 w-5 text-black fill-black ml-0.5" />
													)}
												</button>
											</div>
											{/* Currently Playing Indicator */}
											{currentSong?._id === song._id && (
												<div className="absolute top-2 right-2 bg-emerald-500 p-1.5 rounded-full">
													<Music2 className="h-3 w-3 text-black" />
												</div>
											)}
										</div>

										{/* Song Info */}
										<div className="space-y-1">
											<h3 className="font-semibold text-white text-sm truncate group-hover:text-emerald-400 transition-colors">
												{song.title}
											</h3>
											<p className="text-xs text-zinc-400 truncate">{song.artist}</p>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* No Results */}
					{!isLoading && hasSearched && !hasResults && (
						<div className="flex flex-col items-center justify-center h-64 text-center">
							<div className="h-20 w-20 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
								<Music2 className="h-10 w-10 text-zinc-600" />
							</div>
							<h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
							<p className="text-zinc-400 max-w-md">
								We couldn't find any songs matching "{searchQuery}". Try searching for something else.
							</p>
						</div>
					)}

					{/* Popular Searches - Show when no search */}
					{!hasSearched && !isLoading && (
						<div className="space-y-8">
							<PopularSearches onSearchClick={handlePopularSearchClick} />
							
							{/* Empty State */}
							<div className="flex flex-col items-center justify-center py-12 text-center">
								<div className="h-24 w-24 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 
									rounded-full flex items-center justify-center mb-6 backdrop-blur-sm">
									<Music2 className="h-12 w-12 text-emerald-500" />
								</div>
								<h3 className="text-2xl font-bold text-white mb-3">
									Find your favorite music
								</h3>
								<p className="text-zinc-400 max-w-md text-lg">
									Search for songs, artists, and albums from millions of tracks
								</p>
							</div>
						</div>
					)}
				</div>
			</ScrollArea>
		</main>
	);
};

export default SearchPage;
