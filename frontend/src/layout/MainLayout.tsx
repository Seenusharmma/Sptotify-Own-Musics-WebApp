import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Outlet } from "react-router-dom";
import LeftSidebar from "./components/LeftSidebar";
import FriendsActivity from "./components/FriendsActivity";
import AudioPlayer from "./components/AudioPlayer";
import { PlaybackControls } from "./components/PlaybackControls";
import BottomNav from "./components/BottomNav";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useMusicStore } from "@/stores/useMusicStore";
import { useSearchStore } from "@/stores/useSearchStore";
import { useAuthStore } from "@/stores/useAuthStore";

const MainLayout = () => {
	const [isMobile, setIsMobile] = useState(false);
	const { isLoaded, user } = useUser();
	const { fetchLikedSongs } = useMusicStore();
	const { fetchSearchHistory, fetchRecentlyPlayed } = useSearchStore();
	const { checkAdminStatus } = useAuthStore();

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	useEffect(() => {
		if (isLoaded && user) {
			fetchLikedSongs();
			fetchSearchHistory();
			fetchRecentlyPlayed();
			checkAdminStatus();
		}
	}, [isLoaded, user, fetchLikedSongs, fetchSearchHistory, fetchRecentlyPlayed, checkAdminStatus]);

	return (
		<div className='h-screen bg-black text-white flex flex-col'>
			<ResizablePanelGroup direction='horizontal' className='flex-1 flex h-[calc(100vh-96px)] overflow-hidden p-2'>
				<AudioPlayer />
				{/* left sidebar */}
				{!isMobile && (
					<>
						<ResizablePanel defaultSize={20} minSize={10} maxSize={30}>
							<LeftSidebar />
						</ResizablePanel>
						<ResizableHandle className='w-2 bg-black rounded-lg transition-colors' />
					</>
				)}

				{/* Main content */}
				<ResizablePanel defaultSize={isMobile ? 100 : 60}>
					<div className='h-full pb-16 md:pb-0'>
						<Outlet />
					</div>
				</ResizablePanel>

				{!isMobile && (
					<>
						<ResizableHandle className='w-2 bg-black rounded-lg transition-colors' />

						{/* right sidebar */}
						<ResizablePanel defaultSize={20} minSize={0} maxSize={25} collapsedSize={0}>
							<FriendsActivity />
						</ResizablePanel>
					</>
				)}
			</ResizablePanelGroup>

			<PlaybackControls />
			<BottomNav />
		</div>
	);
};
export default MainLayout;
