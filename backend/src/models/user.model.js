import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		fullName: {
			type: String,
			required: true,
		},
		imageUrl: {
			type: String,
			required: true,
		},
		clerkId: {
			type: String,
			required: true,
			unique: true,
		},
		likedSongs: [String],
		playHistory: [
			{
				song: {
					type: String,
				},
				playedAt: {
					type: Date,
					default: Date.now,
				},
			},
		],
		recentPlay: [String],
		featuredPlay: [String],
		searchHistory: [
			{
				query: String,
				searchedAt: {
					type: Date,
					default: Date.now,
				},
			},
		],
	},
	{ timestamps: true }
);

export const User = mongoose.model("User", userSchema);
