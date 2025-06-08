"use client";

import Header from "./Header";
import LogEntryForm from "./LogEntryForm";
import { useUser } from "@/hooks/useUser";

export default function Dashboard() {
  const { user, loading } = useUser();

  if (loading) return <div>Loading...</div>;

  if (!user) return <></>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Header user={user!} />
      <LogEntryForm />
      {/* <DataVisualization logs={logs} />
      <RecentEntries logs={logs} /> */}
    </div>
  );
}
