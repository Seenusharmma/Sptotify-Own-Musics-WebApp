import { create } from "zustand";
import axios from "axios";
import { Song } from "@/types";

interface SearchStore {
	searchResults: Song[];
	suggestions: Song[];
	recentlyPlayed: Song[];
	searchHistory: string[];
	isLoading: boolean;
	isSuggestionsLoading: boolean;
	error: string | null;
	searchSongs: (query: string) => Promise<void>;
	getSuggestions: (query: string) => Promise<void>;
	addToRecentlyPlayed: (song: Song) => void;
	addToSearchHistory: (query: string) => void;
	clearSearchHistory: () => void;
}

// Helper to safely parse localStorage
const getRecentlyPlayed = (): Song[] => {
	try {
		const stored = localStorage.getItem("recentlyPlayed");
		if (!stored) return [];
		const parsed = JSON.parse(stored);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
};

// Helper to get search history
const getSearchHistory = (): string[] => {
	try {
		const stored = localStorage.getItem("searchHistory");
		if (!stored) return [];
		const parsed = JSON.parse(stored);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
};

export const useSearchStore = create<SearchStore>((set, get) => ({
	searchResults: [],
	suggestions: [],
	recentlyPlayed: getRecentlyPlayed(),
	searchHistory: getSearchHistory(),
	isLoading: false,
	isSuggestionsLoading: false,
	error: null,

	getSuggestions: async (query: string) => {
		if (!query.trim()) {
			set({ suggestions: [] });
			return;
		}

		set({ isSuggestionsLoading: true });
		try {
			const response = await axios.get(`https://jiosavan-api-with-playlist.vercel.app/api/search/songs?query=${query}&limit=5`);
			const data = response.data?.data?.results;

			const mappedSongs: Song[] = Array.isArray(data) ? data.slice(0, 5).map((song: any) => ({
				_id: `jio-${song.id}`,
				title: song.name,
				artist: Array.isArray(song.artists?.primary) ? song.artists.primary.map((a: any) => a.name).join(", ") : '',
				albumId: null,
				imageUrl: song.image?.[song.image.length - 1]?.url || '',
				audioUrl: song.downloadUrl?.[song.downloadUrl.length - 1]?.url || '',
				duration: song.duration,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			})) : [];

			set({ suggestions: mappedSongs, isSuggestionsLoading: false });
		} catch (error: any) {
			set({ isSuggestionsLoading: false, suggestions: [] });
		}
	},

	searchSongs: async (query: string) => {
		if (!query.trim()) {
			set({ searchResults: [], error: null });
			return;
		}

		set({ isLoading: true, error: null });
		try {
			const response = await axios.get(`https://jiosavan-api-with-playlist.vercel.app/api/search/songs?query=${query}`);
			const data = response.data?.data?.results;

			const mappedSongs: Song[] = Array.isArray(data) ? data.map((song: any) => ({
				_id: `jio-${song.id}`,
				title: song.name,
				artist: Array.isArray(song.artists?.primary) ? song.artists.primary.map((a: any) => a.name).join(", ") : '',
				albumId: null,
				imageUrl: song.image?.[song.image.length - 1]?.url || '',
				audioUrl: song.downloadUrl?.[song.downloadUrl.length - 1]?.url || '',
				duration: song.duration,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			})) : [];

			set({ searchResults: mappedSongs, isLoading: false, suggestions: [] });

			// Add to search history
			if (query.trim()) {
				get().addToSearchHistory(query.trim());
			}
		} catch (error: any) {
			set({ error: error.response?.data?.message || "Failed to search songs", isLoading: false, searchResults: [] });
		}
	},

	addToRecentlyPlayed: (song: Song) => {
		const { recentlyPlayed } = get();
		const safeRecent = Array.isArray(recentlyPlayed) ? recentlyPlayed : [];
		const updatedRecent = [song, ...safeRecent.filter((s) => s._id !== song._id)].slice(0, 12);
		set({ recentlyPlayed: updatedRecent });
		try {
			localStorage.setItem("recentlyPlayed", JSON.stringify(updatedRecent));
		} catch (error) {
			console.error("Failed to save to localStorage:", error);
		}
	},

	addToSearchHistory: (query: string) => {
		const { searchHistory } = get();
		const safeHistory = Array.isArray(searchHistory) ? searchHistory : [];
		const updatedHistory = [query, ...safeHistory.filter((q) => q !== query)].slice(0, 10);
		set({ searchHistory: updatedHistory });
		try {
			localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
		} catch (error) {
			console.error("Failed to save search history:", error);
		}
	},

	clearSearchHistory: () => {
		set({ searchHistory: [] });
		try {
			localStorage.removeItem("searchHistory");
		} catch (error) {
			console.error("Failed to clear search history:", error);
		}
	},
}));
