import { User } from "../models/user.model.js";

export const authCallback = async (req, res, next) => {
	try {
		const { id, firstName, lastName, imageUrl } = req.body;

		// check if user already exists
		const user = await User.findOne({ clerkId: id });

		if (!user) {
			// signup
			try {
				await User.create({
					clerkId: id,
					fullName: `${firstName || ""} ${lastName || ""}`.trim(),
					imageUrl,
				});
			} catch (createError) {
				// If error is duplicate key, it means user was created in parallel, which is fine
				if (createError.code === 11000) {
					console.log("User already exists (race condition detected), skipping creation.");
					return res.status(200).json({ success: true });
				}
				throw createError;
			}
		}

		res.status(200).json({ success: true });
	} catch (error) {
		console.log("Error in auth callback", error);
		next(error);
	}
};
