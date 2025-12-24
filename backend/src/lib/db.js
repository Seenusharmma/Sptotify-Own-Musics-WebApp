import mongoose from "mongoose";

export const connectDB = async () => {
	try {
        // If already connected, don't connect again
		if (mongoose.connection.readyState >= 1) return;
		
		const conn = await mongoose.connect(process.env.MONGODB_URI);
		console.log(`MongoDB Connected: ${conn.connection.host}`);
	} catch (error) {
		console.error(`Error: ${error.message}`);
        // process.exit(1); // Do not exit in serverless environment
	}
};
