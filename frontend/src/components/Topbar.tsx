import { SignedOut, UserButton } from "@clerk/clerk-react";
import { LayoutDashboardIcon, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SignInOAuthButtons from "./SignInOAuthButtons";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";

const Topbar = () => {
	const { isAdmin } = useAuthStore();

	return (
		<header className="sticky top-2 z-50">
			<div
				className="
					mx-3 md:mx-6
					flex items-center justify-between
					rounded-full
					bg-zinc-900/70
					backdrop-blur-xl
					border border-white/10
					px-5 py-3
					transition-all duration-300
					hover:bg-zinc-900/85
				"
			>
				{/* Logo + Brand (Animated) */}
				<motion.div
					className="flex items-center gap-2 cursor-pointer"
					initial={{ x: 80, opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					transition={{ duration: 0.8, ease: "easeOut" }}
				>
					<img
						src="/spotify.png"
						alt="Spotify logo"
						className="size-8"
					/>
					<span className="text-lg font-bold tracking-wide">
						Spotify
					</span>
				</motion.div>

				{/* Actions */}
				<div className="flex items-center gap-2 md:gap-4">

					{/* Admin */}
					{isAdmin && (
						<Link
							to="/admin"
							className={cn(
								buttonVariants({ variant: "secondary" }),
								"hidden md:flex items-center gap-2 font-medium"
							)}
						>
							<LayoutDashboardIcon className="size-4" />
							Admin
						</Link>
					)}

					{/* Auth */}
					<SignedOut>
						<SignInOAuthButtons />
					</SignedOut>

					{/* User */}
					<div className="hidden md:flex">
						<UserButton
							appearance={{
								elements: {
									avatarBox: "ring-2 ring-white/20",
								},
							}}
						/>
					</div>
				</div>
			</div>
		</header>
	);
};

export default Topbar;
