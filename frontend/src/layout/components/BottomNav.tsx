import { Home, Library, Search, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const BottomNav = () => {
	const location = useLocation();

	const navItems = [
		{ path: "/", icon: Home, label: "Home" },
		{ path: "/search", icon: Search, label: "Search" },
		{ path: "/library", icon: Library, label: "Library" },
		{ path: "/profile", icon: User, label: "Profile" },
	];

	return (
		<nav className='fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 md:hidden z-40 rounded-3xl overflow-hidden pb-2'>
			<div className='flex justify-around items-center h-16'>
				{navItems.map((item) => {
					const Icon = item.icon;
					const isActive = location.pathname === item.path;

					return (
						<Link
							key={item.path}
							to={item.path}
							className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
								isActive ? "text-white" : "text-zinc-400"
							}`}
						>
							<Icon className={`h-6 w-6 ${isActive ? "fill-current" : ""}`} />
							<span className='text-[10px] mt-1 font-medium'>{item.label}</span>
						</Link>
					);
				})}
			</div>
		</nav>
	);
};

export default BottomNav;
