import { create } from "zustand";
import axios from "axios";
import { Album, Artist, Song } from "@/types";

interface SearchStore {
	searchResults: Song[];
	albumResults: Album[];
	artistResults: Artist[];
	suggestions: {
		songs: Song[];
		albums: Album[];
		artists: Artist[];
	};
	recentlyPlayed: Song[];
	searchHistory: string[];
	isLoading: boolean;
	isSuggestionsLoading: boolean;
	error: string | null;
	searchSongs: (query: string) => Promise<void>;
	searchMulti: (query: string) => Promise<void>;
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
	albumResults: [],
	artistResults: [],
	suggestions: {
		songs: [],
		albums: [],
		artists: [],
	},
	recentlyPlayed: getRecentlyPlayed(),
	searchHistory: getSearchHistory(),
	isLoading: false,
	isSuggestionsLoading: false,
	error: null,

	getSuggestions: async (query: string) => {
		if (!query.trim()) {
			set({ suggestions: { songs: [], albums: [], artists: [] } });
			return;
		}

		set({ isSuggestionsLoading: true });
		try {
			// Using the all search endpoint for suggestions
			const response = await axios.get(`https://jiosavan-api-with-playlist.vercel.app/api/search?query=${query}`);
			const data = response.data?.data;

			const songs = (data?.songs?.results || []).slice(0, 5).map((song: any) => ({
				_id: `jio-${song.id}`,
				title: song.title || song.name,
				artist: song.primaryArtists || song.description || '',
				albumId: null,
				imageUrl: song.image?.[song.image.length - 1]?.url || '',
				audioUrl: '',
				duration: 0,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}));

			const albums = (data?.albums?.results || []).slice(0, 3).map((album: any) => ({
				_id: `jio-album-${album.id}`,
				title: album.title || album.name,
				artist: album.artist || album.description || '',
				imageUrl: album.image?.[album.image.length - 1]?.url || '',
				releaseYear: new Date().getFullYear(),
				songs: [],
			}));

			const artists = (data?.artists?.results || []).slice(0, 3).map((artist: any) => ({
				_id: `jio-artist-${artist.id}`,
				name: artist.title || artist.name,
				imageUrl: artist.image?.[artist.image.length - 1]?.url || '',
				role: artist.description || 'Artist',
			}));

			set({
				suggestions: { songs, albums, artists },
				isSuggestionsLoading: false
			});
		} catch (error: any) {
			set({ isSuggestionsLoading: false, suggestions: { songs: [], albums: [], artists: [] } });
		}
	},

	searchMulti: async (query: string) => {
		if (!query.trim()) {
			set({ searchResults: [], albumResults: [], artistResults: [], error: null });
			return;
		}

		set({ isLoading: true, error: null });
		try {
			// Fetch both multi-category results and detailed song results
			const [allRes, songsRes] = await Promise.all([
				axios.get(`https://jiosavan-api-with-playlist.vercel.app/api/search?query=${query}`),
				axios.get(`https://jiosavan-api-with-playlist.vercel.app/api/search/songs?query=${query}`)
			]);

			const allData = allRes.data?.data;
			const songsData = songsRes.data?.data?.results;

			const decodedSongs: Song[] = Array.isArray(songsData) ? songsData.map((song: any) => ({
				_id: `jio-${song.id}`,
				title: song.name || song.title,
				artist: Array.isArray(song.artists?.primary)
					? song.artists.primary.map((a: any) => a.name).join(", ")
					: (song.primaryArtists || song.description || ''),
				albumId: null,
				imageUrl: song.image?.[song.image.length - 1]?.url || '',
				audioUrl: song.downloadUrl?.[song.downloadUrl.length - 1]?.url || '',
				duration: song.duration,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			})) : [];

			const decodedAlbums: Album[] = (allData?.albums?.results || []).map((album: any) => ({
				_id: `jio-album-${album.id}`,
				title: album.title || album.name,
				artist: album.artist || album.description || '',
				imageUrl: album.image?.[album.image.length - 1]?.url || '',
				releaseYear: new Date().getFullYear(),
				songs: [],
			}));

			const decodedArtists: Artist[] = (allData?.artists?.results || []).map((artist: any) => ({
				_id: `jio-artist-${artist.id}`,
				name: artist.title || artist.name,
				imageUrl: artist.image?.[artist.image.length - 1]?.url || '',
				role: artist.description || 'Artist',
			}));

			set({
				searchResults: decodedSongs,
				albumResults: decodedAlbums,
				artistResults: decodedArtists,
				isLoading: false,
				suggestions: { songs: [], albums: [], artists: [] }
			});

			if (query.trim()) {
				get().addToSearchHistory(query.trim());
			}
		} catch (error: any) {
			set({ error: "Failed to search", isLoading: false });
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

			set({ searchResults: mappedSongs, isLoading: false, suggestions: { songs: [], albums: [], artists: [] } });

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
