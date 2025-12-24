import { create } from "zustand";
import axios from "axios";
import { axiosInstance } from "@/lib/axios";
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
	fetchRecentlyPlayed: () => Promise<void>;
	fetchSearchHistory: () => Promise<void>;
	addToSearchHistory: (query: string) => void;
	clearSearchHistory: () => void;
}


export const useSearchStore = create<SearchStore>((set, get) => ({
	searchResults: [],
	albumResults: [],
	artistResults: [],
	suggestions: {
		songs: [],
		albums: [],
		artists: [],
	},
	recentlyPlayed: [],
	searchHistory: [],
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

	addToRecentlyPlayed: async (song: Song) => {
		const { recentlyPlayed } = get();
		const updatedRecent = [song, ...recentlyPlayed.filter((s) => s._id !== song._id)].slice(0, 12);
		set({ recentlyPlayed: updatedRecent });

		try {
			// We already have updatePlayHistory in useMusicStore which updates the backend
			// But for search store's recentlyPlayed, we can just ensure it's synced if needed
			// Actually, updatePlayHistory in useMusicStore already updates recentPlay in the DB.
			// So we just need to ensure the frontend reflects it.
		} catch (error) {
			console.error("Failed to sync recently played:", error);
		}
	},

	fetchRecentlyPlayed: async () => {
		try {
			const response = await axiosInstance.get("/users/recent-play");
			const recentIds: string[] = response.data;

			if (recentIds.length === 0) {
				set({ recentlyPlayed: [] });
				return;
			}

			// Similar logic to fetchLikedSongs to get song details
			const jioIds = recentIds.filter(id => id.startsWith("jio-")).map(id => id.replace("jio-", ""));
			const localIds = recentIds.filter(id => !id.startsWith("jio-"));

			let allSongs: Song[] = [];

			if (jioIds.length > 0) {
				const jioResponse = await axios.get(`https://jiosavan-api-with-playlist.vercel.app/api/songs/${jioIds.join(",")}`);
				const jioData = jioResponse.data.data;
				if (Array.isArray(jioData)) {
					const mapped = jioData.map((songData: any) => ({
						_id: `jio-${songData.id}`,
						title: songData.name,
						artist: Array.isArray(songData.artists?.primary) ? songData.artists.primary.map((a: any) => a.name).join(", ") : '',
						albumId: null,
						imageUrl: songData.image?.[songData.image.length - 1]?.url || '',
						audioUrl: songData.downloadUrl?.[songData.downloadUrl.length - 1]?.url || '',
						duration: songData.duration,
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
					}));
					// Maintain the order of recentIds
					allSongs = [...allSongs, ...mapped];
				}
			}

			for (const id of localIds) {
				try {
					const localRes = await axiosInstance.get(`/songs/${id}`);
					allSongs.push(localRes.data);
				} catch (err) {
					console.error(`Failed to fetch local song ${id}`, err);
				}
			}

			// Sort allSongs according to the order in recentIds
			const orderedSongs = recentIds.map(id => allSongs.find(s => s._id === id)).filter(Boolean) as Song[];

			set({ recentlyPlayed: orderedSongs });
		} catch (error) {
			console.error("Failed to fetch recently played", error);
		}
	},

	fetchSearchHistory: async () => {
		try {
			const response = await axiosInstance.get("/users/search-history");
			// Map [{query, searchedAt}] to [query]
			const history = response.data.map((item: any) => item.query);
			set({ searchHistory: history });
		} catch (error) {
			console.error("Failed to fetch search history", error);
		}
	},

	addToSearchHistory: async (query: string) => {
		const { searchHistory } = get();
		const updatedHistory = [query, ...searchHistory.filter((q) => q !== query)].slice(0, 10);
		set({ searchHistory: updatedHistory });
		try {
			await axiosInstance.post("/users/search-history", { query });
		} catch (error) {
			console.error("Failed to add to search history", error);
		}
	},

	clearSearchHistory: async () => {
		set({ searchHistory: [] });
		try {
			await axiosInstance.delete("/users/search-history");
		} catch (error) {
			console.error("Failed to clear search history", error);
		}
	},
}));
