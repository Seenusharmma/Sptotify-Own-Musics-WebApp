import { SignedOut, UserButton } from "@clerk/clerk-react";
import { LayoutDashboardIcon, Search } from "lucide-react";
import { Link } from "react-router-dom";
import SignInOAuthButtons from "./SignInOAuthButtons";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";

const Topbar = () => {
	const { isAdmin } = useAuthStore();
	console.log({ isAdmin });

	return (
		<div
			className='flex items-center justify-between p-4 sticky top-0 bg-zinc-900/75 
      backdrop-blur-md z-10
    '
		>
			<div className='flex gap-2 items-center'>
				<img src='/spotify.png' className='size-8' alt='Spotify logo' />
				<span className='hidden sm:inline'>Spotify</span>
			</div>
			<div className='flex items-center gap-4'>
				<Link
					to={"/search"}
					className={cn(
						buttonVariants({ variant: "outline" }),
						"hidden"
					)}
				>
					<Search className='size-5' />
				</Link>

				{isAdmin && (
					<Link to={"/admin"} className={cn(buttonVariants({ variant: "outline" }), "hidden md:flex")}>
						<LayoutDashboardIcon className='size-4  mr-2' />
						Admin Dashboard
					</Link>
				)}

				<SignedOut>
					<SignInOAuthButtons />
				</SignedOut>

				<div className="hidden md:block">
				<UserButton />
			</div>
			</div>
		</div>
	);
};
export default Topbar;
