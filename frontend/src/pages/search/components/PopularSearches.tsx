import { Music, Radio, Disc3 } from "lucide-react";

interface PopularSearchesProps {
	onSearchClick: (query: string) => void;
}

const popularSearches = [
	{ query: "Bollywood", icon: Music, color: "from-pink-500 to-rose-500" },
	{ query: "Punjabi", icon: Radio, color: "from-orange-500 to-amber-500" },
	{ query: "Latest", icon: Disc3, color: "from-emerald-500 to-teal-500" },
	{ query: "Romantic", icon: Music, color: "from-red-500 to-pink-500" },
	{ query: "Party", icon: Radio, color: "from-purple-500 to-indigo-500" },
	{ query: "Trending", icon: Disc3, color: "from-blue-500 to-cyan-500" },
];

const PopularSearches = ({ onSearchClick }: PopularSearchesProps) => {
	return (
		<div className="space-y-4">
			<h2 className="text-2xl font-bold text-white">Browse All</h2>
			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
				{popularSearches.map((item) => {
					const Icon = item.icon;
					return (
						<button
							key={item.query}
							onClick={() => onSearchClick(item.query)}
							className={`relative overflow-hidden rounded-lg p-6 h-32
								bg-gradient-to-br ${item.color}
								hover:scale-105 transition-transform duration-200
								group cursor-pointer`}
						>
							<div className="relative z-10">
								<h3 className="text-xl font-bold text-white mb-2">{item.query}</h3>
							</div>
							<Icon className="absolute right-4 bottom-4 h-16 w-16 text-white/20 
								rotate-12 group-hover:rotate-0 transition-transform duration-200" />
						</button>
					);
				})}
			</div>
		</div>
	);
};

export default PopularSearches;
