import { User } from "../models/user.model.js";

export const getUserPlaylists = async (req, res, next) => {
	try {
		const userId = req.auth.userId;
		const user = await User.findOne({ clerkId: userId });

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.status(200).json(user.likedSongs);
	} catch (error) {
		next(error);
	}
};

export const addToLikedSongs = async (req, res, next) => {
	try {
		const userId = req.auth.userId;
		const { songId } = req.body;

		// Use $addToSet to atomically add without duplicates and avoid race conditions
		// new: true retrieves the updated document
		const user = await User.findOneAndUpdate(
			{ clerkId: userId },
			{ $addToSet: { likedSongs: songId } },
			{ new: true }
		);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.status(200).json(user.likedSongs);
	} catch (error) {
		next(error);
	}
};

export const removeFromLikedSongs = async (req, res, next) => {
	try {
		const userId = req.auth.userId;
		const { songId } = req.params;

		// Use $pull to atomically remove the songId
		const user = await User.findOneAndUpdate(
			{ clerkId: userId },
			{ $pull: { likedSongs: songId } },
			{ new: true }
		);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.status(200).json(user.likedSongs);
	} catch (error) {
		next(error);
	}
};

export const getPlayHistory = async (req, res, next) => {
	try {
		const userId = req.auth.userId;
		const user = await User.findOne({ clerkId: userId });

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.status(200).json(user.playHistory);
	} catch (error) {
		next(error);
	}
};

export const getRecentPlay = async (req, res, next) => {
	try {
		const userId = req.auth.userId;
		const user = await User.findOne({ clerkId: userId });

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.status(200).json(user.recentPlay);
	} catch (error) {
		next(error);
	}
};

export const addToPlayHistory = async (req, res, next) => {
	try {
		const userId = req.auth.userId;
		const { songId } = req.body;

		const user = await User.findOne({ clerkId: userId });

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		user.playHistory.unshift({ song: songId });
		// Limit history to 50 items
		if (user.playHistory.length > 50) {
			user.playHistory.pop();
		}
		
		// Update recent play as well
		user.recentPlay = user.recentPlay.filter(id => id.toString() !== songId);
		user.recentPlay.unshift(songId);
		if (user.recentPlay.length > 10) user.recentPlay.pop();

		await user.save();
		res.status(200).json(user.playHistory);
	} catch (error) {
		next(error);
	}
};

export const getSearchHistory = async (req, res, next) => {
	try {
		const userId = req.auth.userId;
		const user = await User.findOne({ clerkId: userId });

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.status(200).json(user.searchHistory);
	} catch (error) {
		next(error);
	}
};

export const addToSearchHistory = async (req, res, next) => {
	try {
		const userId = req.auth.userId;
		const { query } = req.body;

		const user = await User.findOne({ clerkId: userId });

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		user.searchHistory.unshift({ query });
		if (user.searchHistory.length > 20) {
			user.searchHistory.pop();
		}
		await user.save();
		res.status(200).json(user.searchHistory);
	} catch (error) {
		next(error);
	}
};

export const clearSearchHistory = async (req, res, next) => {
	try {
		const userId = req.auth.userId;
		const user = await User.findOne({ clerkId: userId });

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		user.searchHistory = [];
		await user.save();
		res.status(200).json({ message: "Search history cleared" });
	} catch (error) {
		next(error);
	}
};

export const getFeaturedPlay = async (req, res, next) => {
	try {
		const userId = req.auth.userId;
		const user = await User.findOne({ clerkId: userId });

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.status(200).json(user.featuredPlay);
	} catch (error) {
		next(error);
	}
};
