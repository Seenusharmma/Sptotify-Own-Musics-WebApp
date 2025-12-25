import { Search as SearchIcon, X, Clock, Mic } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSearchStore } from "@/stores/useSearchStore";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface SearchBarProps {
	value: string;
	onChange: (value: string) => void;
	onSearch: (query: string) => void;
}

const SearchBar = ({ value, onChange, onSearch }: SearchBarProps) => {
	const { suggestions, searchHistory, getSuggestions, isSuggestionsLoading, clearSearchHistory } = useSearchStore();
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(-1);
	const [isListening, setIsListening] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const navigate = useNavigate();

	// Get suggestions as user types
	useEffect(() => {
		const timer = setTimeout(() => {
			if (value.trim()) {
				getSuggestions(value);
			}
		}, 300);
		return () => clearTimeout(timer);
	}, [value, getSuggestions]);

    const recognitionRef = useRef<any>(null);

    const handleVoiceSearch = () => {
		if (isListening) return;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Your browser does not support voice search.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        
        recognition.lang = "en-US";
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
             setIsListening(true);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            onChange(transcript);
            onSearch(transcript);
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
            if (event.error === 'not-allowed') {
                alert("Microphone access denied. Please allow microphone access in your browser settings.");
            } else if (event.error === 'no-speech') {
                alert("No speech was detected. Please try again.");
            } else {
                 alert(`Voice search error: ${event.error}`);
            }
        };
        
        recognition.onend = () => {
            setIsListening(false);
        };

        try {
            recognition.start();
        } catch (error) {
            console.error("Error starting recognition:", error);
            setIsListening(false);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

	// Flat list of suggestions for keyboard navigation
	const flatSuggestions = [
		...suggestions.songs.map(s => ({ ...s, type: 'song' })),
		...suggestions.albums.map(a => ({ ...a, type: 'album' })),
		...suggestions.artists.map(ar => ({ ...ar, type: 'artist' }))
	];

	// Handle keyboard navigation
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (!showSuggestions) return;

		const items = value.trim() ? flatSuggestions : searchHistory.map(h => ({ title: h, _id: h, type: 'history' }));
		
		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				setSelectedIndex(prev => (prev < items.length - 1 ? prev + 1 : prev));
				break;
			case "ArrowUp":
				e.preventDefault();
				setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
				break;
			case "Enter":
				e.preventDefault();
				if (selectedIndex >= 0 && items[selectedIndex]) {
					const item = items[selectedIndex] as any;
					if (value.trim()) {
						if (item.type === 'song') navigate(`/song/${item._id}`);
						else if (item.type === 'album') navigate(`/albums/${item._id}`);
						// Artists could go to a search or a specific artist page if we have one
						else if (item.type === 'artist') {
							onChange(item.name);
							onSearch(item.name);
						}
					} else {
						handleHistoryClick(item.title);
					}
					setShowSuggestions(false);
				} else if (value.trim()) {
					onSearch(value);
					setShowSuggestions(false);
				}
				break;
			case "Escape":
				setShowSuggestions(false);
				inputRef.current?.blur();
				break;
		}
	};

	const handleSuggestionClick = (item: any) => {
		if (item.type === 'song') navigate(`/song/${item._id}`);
		else if (item.type === 'album') navigate(`/albums/${item._id}`);
		else if (item.type === 'artist') {
			onChange(item.name);
			onSearch(item.name);
		}
		setShowSuggestions(false);
	};

	const handleHistoryClick = (query: string) => {
		onChange(query);
		onSearch(query);
		setShowSuggestions(false);
	};

	const showHistory = !value.trim() && searchHistory.length > 0 && showSuggestions;
	const hasAnySuggestions = suggestions.songs.length > 0 || suggestions.albums.length > 0 || suggestions.artists.length > 0;
	const showSuggestionsList = value.trim() && hasAnySuggestions && showSuggestions;

	return (
		<div className="relative">
			<div className="relative">
				<SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 pointer-events-none" />
				<Input
					ref={inputRef}
					placeholder={isListening ? "Listening..." : "What do you want to listen to?"}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					onFocus={() => setShowSuggestions(true)}
					onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
					onKeyDown={handleKeyDown}
					className={`pl-12 pr-12 h-14 bg-zinc-800/50 border-none text-base rounded-full 
						focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:bg-zinc-800
						transition-all duration-200 ${isListening ? "ring-2 ring-emerald-500 animate-pulse" : ""}`}
				/>
				{value ? (
					<button
						onClick={() => {
							onChange("");
							inputRef.current?.focus();
						}}
						className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 
							flex items-center justify-center rounded-full bg-zinc-700 hover:bg-zinc-600
							transition-colors"
					>
						<X className="h-4 w-4" />
					</button>
				) : (
                    <button
						onClick={handleVoiceSearch}
						className={`absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 
							flex items-center justify-center rounded-full hover:bg-zinc-700
							transition-colors ${isListening ? "text-emerald-500 bg-zinc-700" : "text-zinc-400"}`}
					>
						<Mic className="h-5 w-5" />
					</button>
                )}
			</div>

			{/* Suggestions Dropdown */}
			{(showHistory || showSuggestionsList) && (
				<div className="absolute top-full mt-2 w-full bg-zinc-800 rounded-lg shadow-2xl 
					border border-zinc-700 overflow-hidden z-50 backdrop-blur-xl max-h-[450px] overflow-y-auto">
					
					{/* Search History */}
					{showHistory && (
						<div className="p-2">
							<div className="flex items-center justify-between px-3 py-2">
								<span className="text-sm font-semibold text-zinc-400">Recent Searches</span>
								<button
									onClick={clearSearchHistory}
									className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors"
								>
									Clear All
								</button>
							</div>
							{searchHistory.map((query, index) => (
								<button
									key={index}
									onClick={() => handleHistoryClick(query)}
									className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md
										hover:bg-zinc-700/50 transition-colors text-left
										${selectedIndex === index ? 'bg-zinc-700/50' : ''}`}
								>
									<Clock className="h-4 w-4 text-zinc-400" />
									<span className="text-sm text-zinc-200">{query}</span>
								</button>
							))}
						</div>
					)}

					{/* Suggestions */}
					{showSuggestionsList && (
						<div className="p-2 space-y-4">
							{isSuggestionsLoading ? (
								<div className="px-3 py-6 text-center text-sm text-zinc-400">
									Loading suggestions...
								</div>
							) : (
								<>
									{/* Songs Section */}
									{suggestions.songs.length > 0 && (
										<div>
											<div className="px-3 py-1 mb-1">
												<span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Songs</span>
											</div>
											{suggestions.songs.map((song, index) => (
												<button
													key={song._id}
													onClick={() => handleSuggestionClick({ ...song, type: 'song' })}
													className={`w-full flex items-center gap-3 px-3 py-2 rounded-md
														hover:bg-zinc-700/30 transition-colors
														${selectedIndex === index ? 'bg-zinc-700/50' : ''}`}
												>
													<img src={song.imageUrl} alt="" className="h-10 w-10 rounded object-cover" />
													<div className="flex-1 min-w-0 text-left">
														<div className="text-sm font-medium text-white truncate">{song.title}</div>
														<div className="text-xs text-zinc-400 truncate">{song.artist}</div>
													</div>
												</button>
											))}
										</div>
									)}

									{/* Albums Section */}
									{suggestions.albums.length > 0 && (
										<div>
											<div className="px-3 py-1 mb-1 border-t border-zinc-700/30 pt-3">
												<span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Albums / Movies</span>
											</div>
											{suggestions.albums.map((album, index) => (
												<button
													key={album._id}
													onClick={() => handleSuggestionClick({ ...album, type: 'album' })}
													className={`w-full flex items-center gap-3 px-3 py-2 rounded-md
														hover:bg-zinc-700/30 transition-colors
														${selectedIndex === (suggestions.songs.length + index) ? 'bg-zinc-700/50' : ''}`}
												>
													<img src={album.imageUrl} alt="" className="h-10 w-10 rounded object-cover shadow-sm" />
													<div className="flex-1 min-w-0 text-left">
														<div className="text-sm font-medium text-white truncate">{album.title}</div>
														<div className="text-xs text-zinc-400 truncate">{album.artist}</div>
													</div>
												</button>
											))}
										</div>
									)}

									{/* Artists Section */}
									{suggestions.artists.length > 0 && (
										<div>
											<div className="px-3 py-1 mb-1 border-t border-zinc-700/30 pt-3">
												<span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Artists / Singers</span>
											</div>
											{suggestions.artists.map((artist, index) => (
												<button
													key={artist._id}
													onClick={() => handleSuggestionClick({ ...artist, type: 'artist' })}
													className={`w-full flex items-center gap-3 px-3 py-2 rounded-md
														hover:bg-zinc-700/30 transition-colors
														${selectedIndex === (suggestions.songs.length + suggestions.albums.length + index) ? 'bg-zinc-700/50' : ''}`}
												>
													<img src={artist.imageUrl} alt="" className="h-10 w-10 rounded-full object-cover shadow-sm" />
													<div className="flex-1 min-w-0 text-left">
														<div className="text-sm font-medium text-white truncate">{artist.name}</div>
														<div className="text-xs text-zinc-400 truncate">{artist.role}</div>
													</div>
												</button>
											))}
										</div>
									)}
								</>
							)}
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default SearchBar;
