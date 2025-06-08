"use client";

import { HeaderSection } from "./Header";
import { LogEntryForm } from "./LogEntryForm";
import { TrendVisualization } from "./TrendCharts";
import { RecentEntriesTable } from "./RecentEntries";
import { useEffect, useState } from "react";
import { z } from "zod";
import { publicLogsRowSchema } from "@/schemas";

// Define the Zod schema for an entry
export const EntrySchema = z.object({
  id: z.string(),
  created_at: z.string(),
  mood: z.number(),
  energy: z.number(),
  notes: z.string().nullable(),
});

// Use the Zod schema for type checking
export type Entry = z.infer<typeof EntrySchema>;

export default function DashboardPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [averageMood, setAverageMood] = useState(0);
  const [averageEnergy, setAverageEnergy] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/log");
        const data = await res.json();

        // Validate data using Zod schema
        const validation = z.array(publicLogsRowSchema).safeParse(data.entries);
        if (!validation.success) {
          console.error("Data validation failed", validation.error.errors);
          return;
        }

        const validData = validation.data;
        setEntries(validData);
        setAverageMood(data.average_mood);
        setAverageEnergy(data.average_energy);
      } catch (error) {
        console.error("Failed to fetch entries", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FF] p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <HeaderSection
          averageMood={averageMood}
          averageEnergy={averageEnergy}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Log Entry Form */}
          <div className="lg:col-span-1">
            <LogEntryForm />
          </div>

          {/* Trend Visualization */}
          <div className="lg:col-span-2">
            <TrendVisualization entries={entries} />
          </div>
        </div>

        {/* Recent Entries Table */}
        <RecentEntriesTable entries={entries} />
      </div>
    </div>
  );
}
