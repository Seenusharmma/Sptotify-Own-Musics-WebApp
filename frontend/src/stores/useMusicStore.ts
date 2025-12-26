import { axiosInstance } from "@/lib/axios";
import axios from "axios";
import { Album, Song, Stats } from "@/types";
import toast from "react-hot-toast";
import { create } from "zustand";
import { idbStorage } from "@/lib/idb";
import { useSearchStore } from "./useSearchStore";

interface MusicStore {
	songs: Song[];
	albums: Album[];
	isLoading: boolean;
	error: string | null;
	currentAlbum: Album | null;
	featuredSongs: Song[];
	madeForYouSongs: Song[];
	trendingSongs: Song[];
	bollywoodSongs: Song[];
	punjabiSongs: Song[];
	hollywoodSongs: Song[];
	currentSongDetails: Song | null;
	stats: Stats;
	featuredPlaylists: Album[];
	likedSongs: Song[];
	downloadedSongs: Song[];
	recommendations: Song[];
	jioOriginals: Song[];
	trendingAlbums: Album[];
	arijitAlbums: Album[];
	radioSongs: Song[];
	toggleLike: (song: Song) => void;
	addDownload: (song: Song) => Promise<void>;
	removeDownload: (songId: string) => Promise<void>;
	isLiked: (songId: string) => boolean;
	isOffline: boolean;
	setIsOffline: (isOffline: boolean) => void;

	fetchAlbums: () => Promise<void>;
	fetchAlbumById: (id: string) => Promise<void>;
	fetchSongById: (id: string) => Promise<void>;
	fetchFeaturedSongs: () => Promise<void>;
	fetchMadeForYouSongs: () => Promise<void>;
	fetchTrendingSongs: () => Promise<void>;
	fetchBollywoodSongs: () => Promise<void>;
	fetchPunjabiSongs: () => Promise<void>;
	fetchHollywoodSongs: () => Promise<void>;
	fetchFeaturedPlaylists: () => Promise<void>;
	fetchJioOriginals: () => Promise<void>;
	fetchTrendingAlbums: () => Promise<void>;
	fetchArijitAlbums: () => Promise<void>;
	fetchRadioSongs: () => Promise<void>;
	fetchStats: () => Promise<void>;
	fetchSongs: () => Promise<void>;
	fetchRecommendations: (songId: string) => Promise<void>;
	deleteSong: (id: string) => Promise<void>;
	deleteAlbum: (id: string) => Promise<void>;
	fetchLikedSongs: () => Promise<void>;
	fetchPlayHistory: () => Promise<void>;
	updatePlayHistory: (songId: string) => Promise<void>;
	fetchFeaturedPlay: () => Promise<void>;
}

export const useMusicStore = create<MusicStore>((set, get) => ({
	albums: [],
	songs: [],
	isLoading: false,
	error: null,
	currentAlbum: null,
	madeForYouSongs: [],
	featuredSongs: [],
	trendingSongs: [],
	bollywoodSongs: [],
	punjabiSongs: [],
	hollywoodSongs: [],
	featuredPlaylists: [],
	recommendations: [],
	jioOriginals: [],
	trendingAlbums: [],
	arijitAlbums: [],
	radioSongs: [],
	currentSongDetails: null,
	isOffline: !navigator.onLine,
	setIsOffline: (isOffline) => set((state) => ({
		isOffline,
		isLoading: isOffline ? false : state.isLoading
	})),
	stats: {
		totalSongs: 0,
		totalAlbums: 0,
		totalUsers: 0,
		totalArtists: 0,
	},

	fetchSongById: async (id) => {
		if (get().isOffline) return;
		set({ isLoading: true, error: null });
		try {
			if (id.startsWith("jio-")) {
				const actualId = id.replace("jio-", "");
				const response = await axios.get(`https://jiosavan-api-with-playlist.vercel.app/api/songs/${actualId}`);
				const songData = response.data.data[0];

				const mappedSong: Song = {
					_id: id,
					title: songData.name,
					artist: Array.isArray(songData.artists?.primary) ? songData.artists.primary.map((a: any) => a.name).join(", ") : '',
					albumId: null,
					imageUrl: songData.image?.[songData.image.length - 1]?.url || '',
					audioUrl: songData.downloadUrl?.[songData.downloadUrl.length - 1]?.url || '',
					duration: songData.duration,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				};
				set({ currentSongDetails: mappedSong });
			} else {
				const response = await axiosInstance.get(`/songs/${id}`);
				set({ currentSongDetails: response.data });
			}
		} catch (error: any) {
			set({ error: error.response?.data?.message || "Failed to fetch song details" });
		} finally {
			set({ isLoading: false });
		}
	},

	deleteSong: async (id) => {
		set({ isLoading: true, error: null });
		try {
			await axiosInstance.delete(`/admin/songs/${id}`);

			set((state) => ({
				songs: state.songs.filter((song) => song._id !== id),
			}));
			toast.success("Song deleted successfully");
		} catch (error: any) {
			console.log("Error in deleteSong", error);
			toast.error("Error deleting song");
		} finally {
			set({ isLoading: false });
		}
	},

	deleteAlbum: async (id) => {
		set({ isLoading: true, error: null });
		try {
			await axiosInstance.delete(`/admin/albums/${id}`);
			set((state) => ({
				albums: state.albums.filter((album) => album._id !== id),
				songs: state.songs.map((song) =>
					song.albumId === state.albums.find((a) => a._id === id)?.title ? { ...song, album: null } : song
				),
			}));
			toast.success("Album deleted successfully");
		} catch (error: any) {
			toast.error("Failed to delete album: " + error.message);
		} finally {
			set({ isLoading: false });
		}
	},

	fetchSongs: async () => {
		if (get().isOffline) return;
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs");
			set({ songs: response.data });
		} catch (error: any) {
			set({ error: error.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchRecommendations: async (songId: string) => {
		if (get().isOffline) return;
		set({ isLoading: true, error: null });
		try {
			const actualId = songId.startsWith("jio-") ? songId.replace("jio-", "") : songId;
			const response = await axios.get(`https://jiosavan-api-with-playlist.vercel.app/api/songs/${actualId}/suggestions`);
			const data = response.data?.data;

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

			set({ recommendations: mappedSongs });
		} catch (error: any) {
			set({ error: error.response?.data?.message || "Failed to fetch recommendations", recommendations: [] });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchStats: async () => {
		if (get().isOffline) return;
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/stats");
			set({ stats: response.data });
		} catch (error: any) {
			set({ error: error.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchAlbums: async () => {
		if (get().isOffline) return;
		set({ isLoading: true, error: null });

		try {
			const response = await axiosInstance.get("/albums");
			set({ albums: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchAlbumById: async (id) => {
		if (get().isOffline) return;
		set({ isLoading: true, error: null });
		try {
			if (id.startsWith("jio-playlist-") || id.startsWith("jio-album-")) {
				const isPlaylist = id.startsWith("jio-playlist-");
				const actualId = isPlaylist ? id.replace("jio-playlist-", "") : id.replace("jio-album-", "");
				const endpoint = isPlaylist ? "playlists" : "albums";
				const response = await axios.get(`https://jiosavan-api-with-playlist.vercel.app/api/${endpoint}?id=${actualId}`);
				const data = response.data?.data;

				if (!data) {
					throw new Error(`${isPlaylist ? "Playlist" : "Album"} not found`);
				}

				const mappedAlbum: Album = {
					_id: id,
					title: data.name,
					artist: isPlaylist ? 'Featured Playlist' : (Array.isArray(data.artists?.primary) ? data.artists.primary.map((a: any) => a.name).join(", ") : 'Various Artists'),
					imageUrl: data.image?.[data.image.length - 1]?.url || '',
					releaseYear: data.year || new Date().getFullYear(),
					songs: Array.isArray(data.songs) ? data.songs.map((song: any) => ({
						_id: `jio-${song.id}`,
						title: song.name,
						artist: Array.isArray(song.artists?.primary) ? song.artists.primary.map((a: any) => a.name).join(", ") : '',
						albumId: id,
						imageUrl: song.image?.[song.image.length - 1]?.url || '',
						audioUrl: song.downloadUrl?.[song.downloadUrl.length - 1]?.url || '',
						duration: song.duration,
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
					})) : []
				};
				set({ currentAlbum: mappedAlbum });
			} else {
				const response = await axiosInstance.get(`/albums/${id}`);
				set({ currentAlbum: response.data });
			}
		} catch (error: any) {
			set({ error: error.response?.data?.message || "Failed to fetch album/playlist details" });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchFeaturedSongs: async () => {
		if (get().isOffline) return;
		set({ isLoading: true, error: null });
		try {
			const response = await axios.get(`https://jiosavan-api-with-playlist.vercel.app/api/search/songs?query=new`);
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

			set({ featuredSongs: mappedSongs });
		} catch (error: any) {
			set({ error: error.response?.data?.message || "Failed to fetch featured songs", featuredSongs: [] });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchMadeForYouSongs: async () => {
		if (get().isOffline) return;
		set({ isLoading: true, error: null });
		try {
			// Fetching "most played" or popular songs
			const response = await axios.get(`https://jiosavan-api-with-playlist.vercel.app/api/search/songs?query=latest`);
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

			set({ madeForYouSongs: mappedSongs });
		} catch (error: any) {
			set({ error: error.response?.data?.message || "Failed to fetch made for you songs", madeForYouSongs: [] });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchTrendingSongs: async () => {
		if (get().isOffline) return;
		set({ isLoading: true, error: null });
		try {
			// Using a working instance to fetch trending/popular songs
			const response = await axios.get(`https://jiosavan-api-with-playlist.vercel.app/api/search/songs?query=trending`);
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

			set({ trendingSongs: mappedSongs });
		} catch (error: any) {
			set({ error: error.response?.data?.message || "Failed to fetch trending songs", trendingSongs: [] });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchBollywoodSongs: async () => {
		if (get().isOffline) return;
		set({ isLoading: true, error: null });
		try {
			const response = await axios.get(`https://jiosavan-api-with-playlist.vercel.app/api/search/songs?query=bollywood`);
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
			set({ bollywoodSongs: mappedSongs });
		} catch (error: any) {
			set({ error: error.response?.data?.message || "Failed to fetch bollywood songs", bollywoodSongs: [] });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchPunjabiSongs: async () => {
		if (get().isOffline) return;
		set({ isLoading: true, error: null });
		try {
			const response = await axios.get(`https://jiosavan-api-with-playlist.vercel.app/api/search/songs?query=punjabi`);
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
			set({ punjabiSongs: mappedSongs });
		} catch (error: any) {
			set({ error: error.response?.data?.message || "Failed to fetch punjabi songs", punjabiSongs: [] });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchHollywoodSongs: async () => {
		if (get().isOffline) return;
		set({ isLoading: true, error: null });
		try {
			const response = await axios.get(`https://jiosavan-api-with-playlist.vercel.app/api/search/songs?query=hollywood`);
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
			set({ hollywoodSongs: mappedSongs });
		} catch (error: any) {
			set({ error: error.response?.data?.message || "Failed to fetch hollywood songs", hollywoodSongs: [] });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchFeaturedPlaylists: async () => {
		if (get().isOffline) return;
		set({ isLoading: true, error: null });
		try {
			const response = await axios.get(`https://jiosavan-api-with-playlist.vercel.app/api/search/playlists?query=featured`);
			const data = response.data?.data?.results;

			const mappedPlaylists: Album[] = Array.isArray(data) ? data.map((playlist: any) => ({
				_id: `jio-playlist-${playlist.id}`,
				title: playlist.name,
				artist: 'Featured Playlist',
				imageUrl: playlist.image?.[playlist.image.length - 1]?.url || '',
				releaseYear: new Date().getFullYear(),
				songs: []
			})) : [];

			set({ featuredPlaylists: mappedPlaylists });
		} catch (error: any) {
			set({ error: error.response?.data?.message || "Failed to fetch featured playlists", featuredPlaylists: [] });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchJioOriginals: async () => {
		if (get().isOffline) return;
		set({ isLoading: true, error: null });
		try {
			const response = await axios.get(`https://jiosavan-api-with-playlist.vercel.app/api/search/songs?query=original`);
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

			set({ jioOriginals: mappedSongs });
		} catch (error: any) {
			set({ error: error.response?.data?.message || "Failed to fetch Originals", jioOriginals: [] });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchTrendingAlbums: async () => {
		if (get().isOffline) return;
		set({ isLoading: true, error: null });
		try {
			const response = await axios.get(`https://jiosavan-api-with-playlist.vercel.app/api/search/albums?query=trending`);
			const data = response.data?.data?.results;

			const mappedAlbums: Album[] = Array.isArray(data) ? data.map((album: any) => ({
				_id: `jio-album-${album.id}`,
				title: album.name,
				artist: Array.isArray(album.artists?.primary) ? album.artists.primary.map((a: any) => a.name).join(", ") : 'Various Artists',
				imageUrl: album.image?.[album.image.length - 1]?.url || '',
				releaseYear: album.year || new Date().getFullYear(),
				songs: []
			})) : [];

			set({ trendingAlbums: mappedAlbums });
		} catch (error: any) {
			set({ error: error.response?.data?.message || "Failed to fetch trending albums", trendingAlbums: [] });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchArijitAlbums: async () => {
		if (get().isOffline) return;
		set({ isLoading: true, error: null });
		try {
			const response = await axios.get(`https://jiosavan-api-with-playlist.vercel.app/api/search/albums?query=arijit singh`);
			const data = response.data?.data?.results;

			const mappedAlbums: Album[] = Array.isArray(data) ? data.map((album: any) => ({
				_id: `jio-album-${album.id}`,
				title: album.name,
				artist: Array.isArray(album.artists?.primary) ? album.artists.primary.map((a: any) => a.name).join(", ") : 'Arijit Singh',
				imageUrl: album.image?.[album.image.length - 1]?.url || '',
				releaseYear: album.year || new Date().getFullYear(),
				songs: []
			})) : [];

			set({ arijitAlbums: mappedAlbums });
		} catch (error: any) {
			set({ error: error.response?.data?.message || "Failed to fetch Arijit albums", arijitAlbums: [] });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchRadioSongs: async () => {
		if (get().isOffline) return;
		set({ isLoading: true, error: null });
		try {
			const response = await axios.get(`https://jiosavan-api-with-playlist.vercel.app/api/search/songs?query=90s bollywood hits`);
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

			set({ radioSongs: mappedSongs });
		} catch (error: any) {
			set({ error: error.response?.data?.message || "Failed to fetch Radio songs", radioSongs: [] });
		} finally {
			set({ isLoading: false });
		}
	},

	likedSongs: [],
	downloadedSongs: JSON.parse(localStorage.getItem('downloaded-songs') || '[]'),

	fetchLikedSongs: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/users/liked-songs");
			const likedIds: string[] = response.data;

			if (likedIds.length === 0) {
				set({ likedSongs: [] });
				return;
			}

			// Split IDs into jio and local
			const jioIds = likedIds.filter(id => id.startsWith("jio-")).map(id => id.replace("jio-", ""));
			const localIds = likedIds.filter(id => !id.startsWith("jio-"));

			let allSongs: Song[] = [];

			// Fetch Jio songs in bulk if any
			if (jioIds.length > 0) {
				const jioResponse = await axios.get(`https://jiosavan-api-with-playlist.vercel.app/api/songs/${jioIds.join(",")}`);
				const jioData = jioResponse.data.data;
				if (Array.isArray(jioData)) {
					allSongs = [...allSongs, ...jioData.map((songData: any) => ({
						_id: `jio-${songData.id}`,
						title: songData.name,
						artist: Array.isArray(songData.artists?.primary) ? songData.artists.primary.map((a: any) => a.name).join(", ") : '',
						albumId: null,
						imageUrl: songData.image?.[songData.image.length - 1]?.url || '',
						audioUrl: songData.downloadUrl?.[songData.downloadUrl.length - 1]?.url || '',
						duration: songData.duration,
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
					}))];
				}
			}

			// Fetch local songs one by one or implement bulk if backend supports it (currently one by one is easier as we have fetchSongById snippet)
			for (const id of localIds) {
				try {
					const localRes = await axiosInstance.get(`/songs/${id}`);
					allSongs.push(localRes.data);
				} catch (err) {
					console.error(`Failed to fetch local song ${id}`, err);
				}
			}

			set({ likedSongs: allSongs });
		} catch (error: any) {
			console.error("Error fetching liked songs", error);
			set({ error: error.message });
		} finally {
			set({ isLoading: false });
		}
	},

	toggleLike: async (song) => {
		const state = get();
		const isAlreadyLiked = state.likedSongs.some((s) => s._id === song._id);

		// Optimistic update
		const previousLikedSongs = state.likedSongs;

		if (isAlreadyLiked) {
			set({ likedSongs: state.likedSongs.filter((s) => s._id !== song._id) });
		} else {
			set({ likedSongs: [...state.likedSongs, song] });
		}

		try {
			if (isAlreadyLiked) {
				await axiosInstance.delete(`/users/liked-songs/${song._id}`);
				toast.success("Removed from Liked Songs");
			} else {
				await axiosInstance.post("/users/liked-songs", { songId: song._id });
				toast.success("Added to Liked Songs");
			}
		} catch (error: any) {
			// Revert state if failed
			set({ likedSongs: previousLikedSongs });
			toast.error("Failed to update liked songs");
			console.error("Error toggling like", error);
		}
	},

	fetchPlayHistory: async () => {
		try {
			await axiosInstance.get("/users/play-history");
			// History is an array of { song: string, playedAt: Date }
			// This is just IDs, we might want to fetch details similarly to likedSongs or leave it for the UI to handle
		} catch (error) {
			console.error("Error fetching play history", error);
		}
	},

	updatePlayHistory: async (songId: string) => {
		try {
			await axiosInstance.post("/users/play-history", { songId });
			// Sync the search store's recentlyPlayed
			useSearchStore.getState().fetchRecentlyPlayed();
		} catch (error) {
			console.error("Error updating play history", error);
		}
	},

	fetchFeaturedPlay: async () => {
		try {
			await axiosInstance.get("/users/featured-play");
			// Logic to handle featured play
		} catch (error) {
			console.error("Error fetching featured play", error);
		}
	},

	addDownload: async (song) => {
		const state = get();
		const isAlreadyDownloaded = state.downloadedSongs.some((s) => s._id === song._id);
		if (isAlreadyDownloaded) return;

		set({ isLoading: true });
		try {
			// Fetch and store audio blob
			const audioResponse = await axios.get(song.audioUrl, { responseType: 'blob' });
			const audioBlob = audioResponse.data;
			await idbStorage.put(`audio-${song._id}`, audioBlob);

			// Also trigger file download to disk for the user
			const url = window.URL.createObjectURL(audioBlob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `${song.title} - ${song.artist}.mp3`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);

			// Fetch and store image blob
			const imageResponse = await axios.get(song.imageUrl, { responseType: 'blob' });
			await idbStorage.put(`image-${song._id}`, imageResponse.data);

			const newDownloadedSongs = [...state.downloadedSongs, song];
			localStorage.setItem('downloaded-songs', JSON.stringify(newDownloadedSongs));
			set({ downloadedSongs: newDownloadedSongs });
			toast.success("Downloaded for offline playback");
		} catch (error) {
			console.error("Download failed:", error);
			toast.error("Failed to download song");
		} finally {
			set({ isLoading: false });
		}
	},

	removeDownload: async (songId) => {
		const state = get();
		try {
			await idbStorage.delete(`audio-${songId}`);
			await idbStorage.delete(`image-${songId}`);

			const newDownloadedSongs = state.downloadedSongs.filter((s) => s._id !== songId);
			localStorage.setItem('downloaded-songs', JSON.stringify(newDownloadedSongs));
			set({ downloadedSongs: newDownloadedSongs });
			toast.success("Removed from downloads");
		} catch (error) {
			console.error("Delete failed:", error);
			toast.error("Failed to remove download");
		}
	},

	isLiked: (songId: string) => {
		const state = get() as MusicStore;
		return state.likedSongs.some((s: Song) => s._id === songId);
	},
}));
