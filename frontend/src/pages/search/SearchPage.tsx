import { useState } from "react";
import Topbar from "@/components/Topbar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Play, Music2 } from "lucide-react";
import { useSearchStore } from "@/stores/useSearchStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Song } from "@/types";
import { useNavigate } from "react-router-dom";
import SearchBar from "./components/SearchBar";
import PopularSearches from "./components/PopularSearches";

const SearchPage = () => {
	const { searchMulti, searchResults, albumResults, artistResults, isLoading, error, addToRecentlyPlayed } = useSearchStore();
	const [searchQuery, setSearchQuery] = useState("");
	const { currentSong, isPlaying, setCurrentSong, togglePlay } = usePlayerStore();
	const navigate = useNavigate();

	const handleSearch = (query: string) => {
		if (query.trim()) {
			searchMulti(query);
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

	const hasResults = searchResults.length > 0 || albumResults.length > 0 || artistResults.length > 0;
	const hasSearched = searchQuery.trim().length > 0;

	// Top result logic (usually the first song or artist)
	const topResult = searchResults[0] || artistResults[0] || albumResults[0];

	return (
		<main className="rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-900 via-zinc-900 to-black">
			<Topbar />
			<ScrollArea className="h-[calc(100vh-180px)]">
				<div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
					<div className="mb-8">
						<SearchBar
							value={searchQuery}
							onChange={setSearchQuery}
							onSearch={handleSearch}
						/>
					</div>

					{isLoading && (
						<div className="flex flex-col justify-center items-center h-64">
							<Loader2 className="h-12 w-12 text-emerald-500 animate-spin mb-4" />
							<p className="text-zinc-400 text-sm">Searching millions of songs...</p>
						</div>
					)}

					{error && (
						<div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center mb-8">
							<p className="text-red-400">{error}</p>
						</div>
					)}

					{!isLoading && hasSearched && hasResults && (
						<div className="space-y-12">
							{/* Top Results Section */}
							<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
								{topResult && (
									<div className="lg:col-span-5">
										<h2 className="text-2xl font-bold text-white mb-4">Top Result</h2>
										<div className="bg-zinc-800/40 hover:bg-zinc-800/60 p-6 rounded-xl transition-all group relative backdrop-blur-sm border border-zinc-700/30">
											<div className="relative h-24 w-24 sm:h-32 sm:w-32 mb-4 overflow-hidden rounded-lg shadow-2xl">
												<img src={topResult.imageUrl} alt="" className="w-full h-full object-cover" />
												<button
													onClick={(e) => {
														e.stopPropagation();
														if ('title' in topResult) handlePlaySong(topResult as Song);
													}}
													className="absolute bottom-2 right-2 h-12 w-12 bg-emerald-500 rounded-full flex items-center justify-center
														shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all
														hover:bg-emerald-400 hover:scale-110"
												>
													<Play className="h-6 w-6 text-black fill-black ml-1" />
												</button>
											</div>
											<h3 className="text-3xl font-bold text-white mb-2">{ 'title' in topResult ? (topResult as any).title : (topResult as any).name }</h3>
											<p className="text-zinc-400 font-medium">
												{ 'artist' in topResult ? (topResult as any).artist : ((topResult as any).role || 'Artist') }
											</p>
										</div>
									</div>
								)}

								<div className="lg:col-span-7">
									<h2 className="text-2xl font-bold text-white mb-4">Songs</h2>
									<div className="space-y-1">
										{searchResults.slice(0, 4).map((song) => (
											<div
												key={song._id}
												className="flex items-center gap-4 p-2 rounded-md hover:bg-zinc-800/50 transition-colors group cursor-pointer"
												onClick={() => handlePlaySong(song)}
											>
												<div className="relative h-10 w-10 flex-shrink-0">
													<img src={song.imageUrl} alt="" className="w-full h-full object-cover rounded" />
													{currentSong?._id === song._id && isPlaying && (
														<div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded">
															<div className="flex gap-0.5 items-end h-3">
																<div className="w-0.5 bg-emerald-500 animate-bounce h-1" />
																<div className="w-0.5 bg-emerald-500 animate-bounce h-3 delay-75" />
																<div className="w-0.5 bg-emerald-500 animate-bounce h-2 delay-150" />
															</div>
														</div>
													)}
												</div>
												<div className="flex-1 min-w-0">
													<div className={`text-sm font-medium truncate ${currentSong?._id === song._id ? 'text-emerald-500' : 'text-white'}`}>
														{song.title}
													</div>
													<div className="text-xs text-zinc-400 truncate">{song.artist}</div>
												</div>
												<div className="text-xs text-zinc-500 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
													{Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
												</div>
											</div>
										))}
									</div>
								</div>
							</div>

							{/* Albums Section */}
							{albumResults.length > 0 && (
								<section>
									<h2 className="text-2xl font-bold text-white mb-6">Albums & Movies</h2>
									<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
										{albumResults.map((album) => (
											<div
												key={album._id}
												onClick={() => navigate(`/albums/${album._id}`)}
												className="bg-zinc-800/30 hover:bg-zinc-800/60 p-4 rounded-xl transition-all cursor-pointer group border border-zinc-700/20"
											>
												<div className="relative aspect-square mb-4 overflow-hidden rounded-lg shadow-lg">
													<img src={album.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
												</div>
												<h3 className="font-bold text-white truncate text-sm mb-1">{album.title}</h3>
												<p className="text-xs text-zinc-400 truncate">{album.artist}</p>
											</div>
										))}
									</div>
								</section>
							)}

							{/* Artists Section */}
							{artistResults.length > 0 && (
								<section>
									<h2 className="text-2xl font-bold text-white mb-6">Artists & Singers</h2>
									<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
										{artistResults.map((artist) => (
											<div
												key={artist._id}
												className="flex flex-col items-center text-center p-4 rounded-xl hover:bg-zinc-800/40 transition-colors cursor-pointer group"
												onClick={() => {
													setSearchQuery(artist.name);
													handleSearch(artist.name);
												}}
											>
												<div className="w-32 h-32 sm:w-40 sm:h-40 mb-4 rounded-full overflow-hidden shadow-2xl border-4 border-zinc-800 group-hover:border-zinc-700 transition-colors">
													<img src={artist.imageUrl} alt="" className="w-full h-full object-cover" />
												</div>
												<h3 className="font-bold text-white truncate text-base mb-1 w-full">{artist.name}</h3>
												<p className="text-xs text-zinc-500 uppercase tracking-widest">{artist.role || 'Artist'}</p>
											</div>
										))}
									</div>
								</section>
							)}
						</div>
					)}

					{!isLoading && hasSearched && !hasResults && (
						<div className="flex flex-col items-center justify-center h-64 text-center">
							<div className="h-24 w-24 bg-zinc-800/50 rounded-full flex items-center justify-center mb-6">
								<Music2 className="h-12 w-12 text-zinc-600" />
							</div>
							<h3 className="text-2xl font-bold text-white mb-3">No results found</h3>
							<p className="text-zinc-400 max-w-md">
								We couldn't find any songs, artists, or albums matching "{searchQuery}".
							</p>
						</div>
					)}

					{!hasSearched && !isLoading && (
						<div className="space-y-12">
							<PopularSearches onSearchClick={handlePopularSearchClick} />
							
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
								{/* Browse All Cards Placeholder if needed */}
							</div>
						</div>
					)}
				</div>
			</ScrollArea>
		</main>
	);
};

export default SearchPage;
