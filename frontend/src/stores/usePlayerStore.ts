import { create } from "zustand";
import { Song } from "@/types";
import { useChatStore } from "./useChatStore";

interface PlayerStore {
	currentSong: Song | null;
	isPlaying: boolean;
	queue: Song[];
	originalQueue: Song[];
	currentIndex: number;
	autoPlayNext: boolean;
	isShuffled: boolean;
	isRepeating: boolean;

	initializeQueue: (songs: Song[]) => void;
	playAlbum: (songs: Song[], startIndex?: number) => void;
	setCurrentSong: (song: Song | null) => void;
	togglePlay: () => void;
	toggleShuffle: () => void;
	playNext: () => Promise<void>;
	playPrevious: () => void;
	toggleAutoPlay: () => void;
	toggleRepeat: () => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
	currentSong: null,
	isPlaying: false,
	queue: [],
	originalQueue: [], // Store the original order for un-shuffling
	currentIndex: -1,
	autoPlayNext: true,
	isShuffled: false,
	isRepeating: false,

	initializeQueue: (songs: Song[]) => {
		set({
			queue: songs,
			originalQueue: [...songs],
			currentSong: get().currentSong || songs[0],
			currentIndex: get().currentIndex === -1 ? 0 : get().currentIndex,
		});
	},

	playAlbum: (songs: Song[], startIndex = 0) => {
		if (songs.length === 0) return;

		const song = songs[startIndex];

		const socket = useChatStore.getState().socket;
		if (socket.auth) {
			socket.emit("update_activity", {
				userId: socket.auth.userId,
				activity: `Playing ${song.title} by ${song.artist}`,
			});
		}

		set({
			queue: [...songs],
			originalQueue: [...songs],
			currentSong: song,
			currentIndex: startIndex,
			isPlaying: true,
			isShuffled: false, // Reset shuffle when playing a new album
		});
	},

	setCurrentSong: (song: Song | null) => {
		if (!song) return;

		const socket = useChatStore.getState().socket;
		if (socket.auth) {
			socket.emit("update_activity", {
				userId: socket.auth.userId,
				activity: `Playing ${song.title} by ${song.artist}`,
			});
		}

		const songIndex = get().queue.findIndex((s) => s._id === song._id);

		if (songIndex !== -1) {
			set({
				currentSong: song,
				isPlaying: true,
				currentIndex: songIndex,
			});
		} else {
			// If song is not in queue, start a new queue with this song
			set({
				queue: [song],
				currentSong: song,
				isPlaying: true,
				currentIndex: 0,
			});
		}
	},

	togglePlay: () => {
		const willStartPlaying = !get().isPlaying;

		const currentSong = get().currentSong;
		const socket = useChatStore.getState().socket;
		if (socket.auth) {
			socket.emit("update_activity", {
				userId: socket.auth.userId,
				activity:
					willStartPlaying && currentSong ? `Playing ${currentSong.title} by ${currentSong.artist}` : "Idle",
			});
		}

		set({
			isPlaying: willStartPlaying,
		});
	},

	toggleShuffle: () => {
		const { isShuffled, queue, originalQueue, currentSong } = get();
		const newIsShuffled = !isShuffled;

		if (newIsShuffled) {
			// Shuffling: Keep current song at its position or just shuffle around it
			const currentSongId = currentSong?._id;
			const otherSongs = queue.filter((s) => s._id !== currentSongId);
			const shuffled = [...otherSongs].sort(() => Math.random() - 0.5);

			const newQueue = currentSong ? [currentSong, ...shuffled] : shuffled;
			set({
				isShuffled: true,
				queue: newQueue,
				currentIndex: 0,
			});
		} else {
			// Un-shuffling: Restore original order
			const songIndex = originalQueue.findIndex((s) => s._id === currentSong?._id);
			set({
				isShuffled: false,
				queue: [...originalQueue],
				currentIndex: songIndex !== -1 ? songIndex : 0,
			});
		}
	},

	playNext: async () => {
		const { currentIndex, queue, autoPlayNext, currentSong } = get();
		const nextIndex = currentIndex + 1;

		// if there is a next song to play, let's play it
		if (nextIndex < queue.length) {
			const nextSong = queue[nextIndex];

			const socket = useChatStore.getState().socket;
			if (socket.auth) {
				socket.emit("update_activity", {
					userId: socket.auth.userId,
					activity: `Playing ${nextSong.title} by ${nextSong.artist}`,
				});
			}

			set({
				currentSong: nextSong,
				currentIndex: nextIndex,
				isPlaying: true,
			});
		} else {
			// no next song
			if (autoPlayNext && currentSong) {
				// Fetch recommendations
				try {
					// Dynamic import to avoid circular dependency issues if any
					const { useMusicStore } = await import("./useMusicStore");
					await useMusicStore.getState().fetchRecommendations(currentSong._id);
					const recommendations = useMusicStore.getState().recommendations;

					if (recommendations.length > 0) {
						const newQueue = [...queue, ...recommendations];
						const nextSong = newQueue[nextIndex];

						const socket = useChatStore.getState().socket;
						if (socket.auth) {
							socket.emit("update_activity", {
								userId: socket.auth.userId,
								activity: `Playing ${nextSong.title} by ${nextSong.artist}`,
							});
						}

						set({
							queue: newQueue,
							currentSong: nextSong,
							currentIndex: nextIndex,
							isPlaying: true,
						});
						return;
					}
				} catch (error) {
					console.error("Failed to fetch autoplay recommendations", error);
				}
			}

			// if autoplay failed or is disabled
			set({ isPlaying: false });

			const socket = useChatStore.getState().socket;
			if (socket.auth) {
				socket.emit("update_activity", {
					userId: socket.auth.userId,
					activity: `Idle`,
				});
			}
		}
	},
	playPrevious: () => {
		const { currentIndex, queue } = get();
		const prevIndex = currentIndex - 1;

		// theres a prev song
		if (prevIndex >= 0) {
			const prevSong = queue[prevIndex];

			const socket = useChatStore.getState().socket;
			if (socket.auth) {
				socket.emit("update_activity", {
					userId: socket.auth.userId,
					activity: `Playing ${prevSong.title} by ${prevSong.artist}`,
				});
			}

			set({
				currentSong: prevSong,
				currentIndex: prevIndex,
				isPlaying: true,
			});
		} else {
			// no prev song
			set({ isPlaying: false });

			const socket = useChatStore.getState().socket;
			if (socket.auth) {
				socket.emit("update_activity", {
					userId: socket.auth.userId,
					activity: `Idle`,
				});
			}
		}
	},

	toggleAutoPlay: () => {
		set({ autoPlayNext: !get().autoPlayNext });
	},

	toggleRepeat: () => {
		set({ isRepeating: !get().isRepeating });
	},
}));
