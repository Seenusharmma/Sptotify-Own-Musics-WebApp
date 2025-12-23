import { useUser } from "@clerk/clerk-react";
import Topbar from "@/components/Topbar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mail, User as UserIcon, Calendar, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClerk } from "@clerk/clerk-react";

const ProfilePage = () => {
	const { user } = useUser();
	const { signOut } = useClerk();

	if (!user) {
		return (
			<main className="h-full rounded-md overflow-hidden bg-gradient-to-b from-zinc-900 to-black">
				<Topbar />
				<div className="flex items-center justify-center h-[calc(100vh-180px)]">
					<p className="text-zinc-400">Loading profile...</p>
				</div>
			</main>
		);
	}

	const profileDetails = [
		{
			icon: UserIcon,
			label: "Full Name",
			value: user.fullName || "Not provided",
		},
		{
			icon: Mail,
			label: "Email",
			value: user.primaryEmailAddress?.emailAddress || "Not provided",
		},
		{
			icon: Calendar,
			label: "Member Since",
			value: new Date(user.createdAt || new Date()).toLocaleDateString("en-US", {
				month: "long",
				year: "numeric",
			}),
		},
		{
			icon: Shield,
			label: "User ID",
			value: user.id,
		},
	];

	return (
		<main className="h-full rounded-md overflow-hidden bg-gradient-to-b from-zinc-900 via-zinc-900 to-black">
			<Topbar />
			<ScrollArea className="h-[calc(100vh-180px)]">
				<div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
					{/* Profile Header */}
					<div className="flex flex-col items-center text-center mb-8 pb-8 border-b border-zinc-800">
						{/* Profile Image */}
						<div className="relative mb-6">
							<div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-emerald-500 shadow-xl">
								<img
									src={user.imageUrl}
									alt={user.fullName || "Profile"}
									className="w-full h-full object-cover"
								/>
							</div>
							<div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-2">
								<UserIcon className="h-5 w-5 text-black" />
							</div>
						</div>

						{/* Name and Username */}
						<h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
							{user.fullName || "User"}
						</h1>
						<p className="text-base sm:text-lg text-zinc-400">
							@{user.username || user.firstName?.toLowerCase() || "user"}
						</p>
					</div>

					{/* Profile Details */}
					<div className="space-y-4 mb-8">
						<h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
							Account Information
						</h2>
						
						<div className="grid gap-4">
							{profileDetails.map((detail, index) => {
								const Icon = detail.icon;
								return (
									<div
										key={index}
										className="bg-zinc-800/40 backdrop-blur-sm rounded-lg p-4 hover:bg-zinc-800/60 transition-colors"
									>
										<div className="flex items-start gap-4">
											<div className="bg-emerald-500/10 p-3 rounded-lg">
												<Icon className="h-5 w-5 text-emerald-500" />
											</div>
											<div className="flex-1 min-w-0">
												<p className="text-sm text-zinc-400 mb-1">{detail.label}</p>
												<p className="text-base font-medium text-white break-words">
													{detail.value}
												</p>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>

					{/* Actions */}
					<div className="space-y-4 pb-8">
						<h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
							Account Actions
						</h2>
						
						<Button
							onClick={() => signOut()}
							variant="outline"
							className="w-full justify-start gap-3 h-14 bg-zinc-800/40 hover:bg-red-500/10 
								border-zinc-700 hover:border-red-500/50 text-white hover:text-red-400 transition-all"
						>
							<LogOut className="h-5 w-5" />
							<span className="font-medium">Sign Out</span>
						</Button>
					</div>

					{/* Mobile-specific footer spacing */}
					<div className="h-4 md:hidden" />
				</div>
			</ScrollArea>
		</main>
	);
};

export default ProfilePage;
