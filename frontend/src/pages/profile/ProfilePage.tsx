import { useUser, useClerk } from "@clerk/clerk-react";
import Topbar from "@/components/Topbar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Mail,
  User as UserIcon,
  Calendar,
  Shield,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const ProfilePage = () => {
  const { user } = useUser();
  const { signOut } = useClerk();

  if (!user) {
    return (
      <main className="h-full bg-gradient-to-b from-zinc-900 to-black">
        <Topbar />
        <div className="flex items-center justify-center h-[calc(100vh-120px)]">
          <p className="text-sm text-zinc-400">Loading profile…</p>
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
      value: new Date(user.createdAt || new Date()).toLocaleDateString(
        "en-US",
        { month: "long", year: "numeric" }
      ),
    },
    {
      icon: Shield,
      label: "User ID",
      value: user.id,
    },
  ];

  return (
    <main className="h-full bg-gradient-to-b from-zinc-900 via-zinc-900 to-black">
      <Topbar />

      <ScrollArea className="h-[calc(100vh-120px)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-8">
          {/* HEADER */}
          <section className="flex flex-col items-center text-center border-b border-zinc-800 pb-6">
            <div className="relative">
              <img
                src={user.imageUrl}
                alt={user.fullName || "Profile"}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border border-zinc-700"
              />
            </div>

            <h1 className="mt-4 text-xl sm:text-2xl font-semibold text-white">
              {user.fullName || "User"}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400">
              @{user.username || user.firstName?.toLowerCase() || "user"}
            </p>
          </section>

          {/* ACCOUNT INFO */}
          <section className="space-y-4">
            <h2 className="text-sm sm:text-base font-semibold text-zinc-200 uppercase tracking-wide">
              Account Information
            </h2>

            <div className="grid gap-3">
              {profileDetails.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-md border border-zinc-800 bg-zinc-900/40 px-4 py-3"
                  >
                    <div className="p-2 rounded-md bg-zinc-800">
                      <Icon className="w-4 h-4 text-zinc-300" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs text-zinc-400">
                        {item.label}
                      </p>
                      <p className="text-sm text-white break-words">
                        {item.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ACTIONS */}
          <section className="space-y-3 pt-2">
            <h2 className="text-sm sm:text-base font-semibold text-zinc-200 uppercase tracking-wide">
              Account Actions
            </h2>

            <Button
              onClick={() => signOut()}
              variant="outline"
              className="
                w-full h-11 justify-start gap-3
                border-zinc-800 bg-zinc-900/40
                text-zinc-200 hover:text-red-400
                hover:border-red-500/40 hover:bg-red-500/10
                transition
              "
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Sign Out</span>
            </Button>
          </section>

          {/* MOBILE SAFE SPACE */}
          <div className="h-6 md:hidden" />
        </div>
      </ScrollArea>
    </main>
  );
};

export default ProfilePage;
