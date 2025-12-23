import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
	plugins: [
		react(),
		VitePWA({
			registerType: "autoUpdate",
			includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
			manifest: {
				name: "Spotify Clone",
				short_name: "Spotify",
				description: "A premium music streaming web application",
				theme_color: "#10b981",
				background_color: "#09090b",
				display: "standalone",
				icons: [
					{
						src: "pwa-icon-192.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "pwa-icon-512.png",
						sizes: "512x512",
						type: "image/png",
					},
					{
						src: "pwa-icon-512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "any maskable",
					},
				],
			},
		}),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	server: {
		port: 3000,
	},
});
