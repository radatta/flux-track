import { type User } from "@supabase/supabase-js";

export default function Header({ user }: { user: User }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold">
        Welcome back, {user?.email?.split("@")[0]}!
      </h1>
      <div className="mt-2 flex gap-4">
        {/* <StatBadge label="Current Streak" value="3 days" />
        <StatBadge label="Avg Mood" value="7.2/10" /> */}
      </div>
    </div>
  );
}
