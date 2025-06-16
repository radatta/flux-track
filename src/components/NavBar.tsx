"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function NavBar() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    setSigningOut(false);
    router.push("/");
  };

  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
      <Link href="/" className="text-xl font-bold text-[#6B8EFF]">
        FluxTrack
      </Link>
      {loading ? null : user ? (
        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              {user.user_metadata?.avatar_url ? (
                <Avatar>
                  <AvatarImage src={user.user_metadata.avatar_url} />
                  <AvatarFallback>
                    {user.user_metadata?.full_name
                      ? user.user_metadata.full_name.split(" ")[0][0]
                      : user.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#6B8EFF] flex items-center justify-center text-white font-bold text-sm border border-gray-200 cursor-pointer">
                  {user.user_metadata?.full_name
                    ? user.user_metadata.full_name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()
                    : user.email?.[0]?.toUpperCase()}
                </div>
              )}
            </PopoverTrigger>
            <PopoverContent className="flex flex-col items-center w-64 p-5 bg-white rounded-xl shadow-lg">
              {user.user_metadata?.avatar_url ? (
                <div className="bg-[#F3F6FF] rounded-full p-1 mb-2">
                  <Avatar>
                    <AvatarImage src={user.user_metadata.avatar_url} />
                    <AvatarFallback>
                      {user.user_metadata?.full_name
                        ? user.user_metadata.full_name.split(" ")[0][0]
                        : user.email?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#6B8EFF] flex items-center justify-center text-white font-bold text-2xl mb-2">
                  {user.user_metadata?.full_name
                    ? user.user_metadata.full_name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()
                    : user.email?.[0]?.toUpperCase()}
                </div>
              )}
              <div className="text-center mb-2">
                <div className="font-semibold text-lg text-gray-900">
                  {user.user_metadata?.full_name || "No name"}
                </div>
                <div className="text-xs text-gray-500 mt-1">{user.email}</div>
              </div>
              <Separator className="my-3" />
              <Button
                variant="outline"
                onClick={handleSignOut}
                disabled={signingOut}
                className="w-full transition-colors hover:bg-[#F3F6FF]"
              >
                {signingOut ? "Signing out..." : "Sign Out"}
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/auth/signin">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/signup">Sign Up</Link>
          </Button>
        </div>
      )}
    </nav>
  );
}
