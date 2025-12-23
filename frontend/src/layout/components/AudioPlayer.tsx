import { usePlayerStore } from "@/stores/usePlayerStore";
import { useEffect, useRef } from "react";
import { idbStorage } from "@/lib/idb";

const AudioPlayer = () => {
	const audioRef = useRef<HTMLAudioElement>(null);
	const prevSongRef = useRef<string | null>(null);

	const { currentSong, isPlaying, playNext, autoPlayNext } = usePlayerStore();

	// handle play/pause logic
	useEffect(() => {
		if (isPlaying) audioRef.current?.play().catch(() => {});
		else audioRef.current?.pause();
	}, [isPlaying]);

	// handle song ends - auto play next if enabled
	useEffect(() => {
		const audio = audioRef.current;

		const handleEnded = () => {
			if (autoPlayNext) {
				playNext();
			} else {
				usePlayerStore.setState({ isPlaying: false });
			}
		};

		audio?.addEventListener("ended", handleEnded);

		return () => audio?.removeEventListener("ended", handleEnded);
	}, [playNext, autoPlayNext]);

	// handle song changes and offline status
	useEffect(() => {
		if (!audioRef.current || !currentSong) return;

		const audio = audioRef.current;

		// Skip if this is the same song that's already loaded
		if (prevSongRef.current === currentSong._id) return;

		let blobUrl: string | null = null;

		const setupAudio = async () => {
			try {
				// Always check local storage first for better performance and offline support
				const localBlob = await idbStorage.get(`audio-${currentSong._id}`);
				
				if (localBlob) {
					blobUrl = URL.createObjectURL(localBlob);
					audio.src = blobUrl;
				} else {
					audio.src = currentSong.audioUrl;
				}
			} catch (error) {
				console.error("Failed to load local audio:", error);
				audio.src = currentSong.audioUrl;
			}

			// reset the playback position when the song changes
			audio.currentTime = 0;
			prevSongRef.current = currentSong._id;

			if (isPlaying) {
				audio.play().catch(err => console.error("Playback failed:", err));
			}
		};

		setupAudio();

		const handleError = () => {
			console.error("Audio error occurred. Network probably disconnected.");
		};
		audio.addEventListener("error", handleError);

		return () => {
			audio.removeEventListener("error", handleError);
			if (blobUrl) {
				URL.revokeObjectURL(blobUrl);
			}
		};
	}, [currentSong]);

	return <audio ref={audioRef} />;
};
export default AudioPlayer;
