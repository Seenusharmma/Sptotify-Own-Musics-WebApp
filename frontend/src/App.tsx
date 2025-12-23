import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import AuthCallbackPage from "./pages/auth-callback/AuthCallbackPage";
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import MainLayout from "./layout/MainLayout";
import ChatPage from "./pages/chat/ChatPage";
import AlbumPage from "./pages/album/AlbumPage";
import AdminPage from "./pages/admin/AdminPage";

import { Toaster } from "react-hot-toast";
import NotFoundPage from "./pages/404/NotFoundPage";
import SearchPage from "./pages/search/SearchPage";
import SongPage from "./pages/song/SongPage";
import ProfilePage from "./pages/profile/ProfilePage";
import LikedSongsPage from "./pages/liked-songs/LikedSongsPage";
import LibraryPage from "./pages/library/LibraryPage";
import DownloadedSongsPage from "./pages/downloaded-songs/DownloadedSongsPage";

function App() {
	return (
		<>
			<Routes>
				<Route
					path='/sso-callback'
					element={<AuthenticateWithRedirectCallback signUpForceRedirectUrl={"/auth-callback"} />}
				/>
				<Route path='/auth-callback' element={<AuthCallbackPage />} />
				<Route path='/admin' element={<AdminPage />} />

				<Route element={<MainLayout />}>
					<Route path='/' element={<HomePage />} />
					<Route path='/chat' element={<ChatPage />} />
					<Route path='/search' element={<SearchPage />} />
					<Route path='/song/:songId' element={<SongPage />} />
					<Route path='/albums/:albumId' element={<AlbumPage />} />
					<Route path='/profile' element={<ProfilePage />} />
					<Route path='/liked-songs' element={<LikedSongsPage />} />
					<Route path='/downloaded-songs' element={<DownloadedSongsPage />} />
					<Route path='/library' element={<LibraryPage />} />
					<Route path='*' element={<NotFoundPage />} />
				</Route>
			</Routes>
			<Toaster />
		</>
	);
}

export default App;
