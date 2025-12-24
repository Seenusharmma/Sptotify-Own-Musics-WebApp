import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
	addToLikedSongs,
	addToPlayHistory,
	addToSearchHistory,
	clearSearchHistory,
	getFeaturedPlay,
	getPlayHistory,
	getRecentPlay,
	getSearchHistory,
	getUserPlaylists,
	removeFromLikedSongs,
} from "../controllers/user.controller.js";

const router = Router();

router.get("/liked-songs", protectRoute, getUserPlaylists);
router.post("/liked-songs", protectRoute, addToLikedSongs);
router.delete("/liked-songs/:songId", protectRoute, removeFromLikedSongs);

router.get("/play-history", protectRoute, getPlayHistory);
router.get("/recent-play", protectRoute, getRecentPlay);
router.post("/play-history", protectRoute, addToPlayHistory);

router.get("/search-history", protectRoute, getSearchHistory);
router.post("/search-history", protectRoute, addToSearchHistory);
router.delete("/search-history", protectRoute, clearSearchHistory);

router.get("/featured-play", protectRoute, getFeaturedPlay);

export default router;
