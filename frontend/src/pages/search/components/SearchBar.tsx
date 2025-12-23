import { Search as SearchIcon, X, Clock, TrendingUp } from "lucide-react";
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

	// Handle keyboard navigation
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (!showSuggestions) return;

		const items = value.trim() ? suggestions : searchHistory.map(h => ({ title: h, _id: h }));
		
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
					if (value.trim()) {
						// It's a suggestion
						const song = suggestions[selectedIndex];
						navigate(`/songs/${song._id}`);
					} else {
						// It's a history item
						const query = searchHistory[selectedIndex];
						onChange(query);
						onSearch(query);
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

	const handleSuggestionClick = (songId: string) => {
		navigate(`/songs/${songId}`);
		setShowSuggestions(false);
	};

	const handleHistoryClick = (query: string) => {
		onChange(query);
		onSearch(query);
		setShowSuggestions(false);
	};

	const showHistory = !value.trim() && searchHistory.length > 0 && showSuggestions;
	const showSuggestionsList = value.trim() && suggestions.length > 0 && showSuggestions;

	return (
		<div className="relative">
			<div className="relative">
				<SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 pointer-events-none" />
				<Input
					ref={inputRef}
					placeholder="What do you want to listen to?"
					value={value}
					onChange={(e) => onChange(e.target.value)}
					onFocus={() => setShowSuggestions(true)}
					onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
					onKeyDown={handleKeyDown}
					className="pl-12 pr-12 h-14 bg-zinc-800/50 border-none text-base rounded-full 
						focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:bg-zinc-800
						transition-all duration-200"
				/>
				{value && (
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
				)}
			</div>

			{/* Suggestions Dropdown */}
			{(showHistory || showSuggestionsList) && (
				<div className="absolute top-full mt-2 w-full bg-zinc-800 rounded-lg shadow-2xl 
					border border-zinc-700 overflow-hidden z-50 backdrop-blur-xl">
					
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
						<div className="p-2">
							{isSuggestionsLoading ? (
								<div className="px-3 py-6 text-center text-sm text-zinc-400">
									Loading suggestions...
								</div>
							) : (
								<>
									<div className="px-3 py-2">
										<span className="text-sm font-semibold text-zinc-400">Suggestions</span>
									</div>
									{suggestions.map((song, index) => (
										<button
											key={song._id}
											onClick={() => handleSuggestionClick(song._id)}
											className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md
												hover:bg-zinc-700/50 transition-colors
												${selectedIndex === index ? 'bg-zinc-700/50' : ''}`}
										>
											<img
												src={song.imageUrl}
												alt={song.title}
												className="h-10 w-10 rounded object-cover"
											/>
											<div className="flex-1 min-w-0 text-left">
												<div className="text-sm font-medium text-white truncate">
													{song.title}
												</div>
												<div className="text-xs text-zinc-400 truncate">
													{song.artist}
												</div>
											</div>
											<TrendingUp className="h-4 w-4 text-zinc-500" />
										</button>
									))}
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
