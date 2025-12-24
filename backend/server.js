import express from "express";
import dotenv from "dotenv";
import { clerkMiddleware } from "@clerk/express";
import fileUpload from "express-fileupload";
import path from "path";
import cors from "cors";
import os from "os";

import { connectDB } from "./src/lib/db.js";

import userRoutes from "./src/routes/user.route.js";
import adminRoutes from "./src/routes/admin.route.js";
import songRoutes from "./src/routes/song.route.js";
import albumRoutes from "./src/routes/album.route.js";
import statRoutes from "./src/routes/stat.route.js";
import authRoutes from "./src/routes/auth.route.js";

dotenv.config();

const app = express();
const __dirname = path.resolve();
const PORT = process.env.PORT || 5000;

app.use(cors(
    {
        origin: "https://sptotifyfreesongs.vercel.app",
        credentials: true
    }
));

app.use(express.json()); // to parse req.body
app.use(clerkMiddleware()); // this will add auth to req object

// Request logger
app.use((req, res, next) => {
	console.log(`${req.method} ${req.url}`);
	next();
});

app.use(
	fileUpload({
		useTempFiles: true,
		tempFileDir: path.join(os.tmpdir(), "temp"),
		createParentPath: true,
		limits: {
			fileSize: 10 * 1024 * 1024, // 10MB max file size
		},
	})
);

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/songs", songRoutes);
app.use("/albums", albumRoutes);
app.use("/stats", statRoutes);
app.use("/users", userRoutes);

app.get("/", (req, res) => {
    res.send("Backend is up and running!");
});

// error handler middleware
app.use((err, req, res, next) => {
	res.status(500).json({ message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message });
});

if (process.env.NODE_ENV !== "production") {
	app.listen(PORT, () => {
		console.log("Server is running on port " + PORT);
		connectDB();
	});
} else {
    // connectDB in production (Vercel)
    connectDB();
}

export default app;
