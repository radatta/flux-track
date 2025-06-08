"use client";

import { HeaderSection } from "./Header";
import { LogEntryForm } from "./LogEntryForm";
import { TrendVisualization } from "./TrendCharts";
import { RecentEntriesTable } from "./RecentEntries";
import { z } from "zod";
import { publicLogsRowSchema } from "@/schemas";
import useSWR from "swr";

export const EntrySchema = z.object({
  id: z.string(),
  created_at: z.string(),
  mood: z.number(),
  energy: z.number(),
  ai_summary: z.string().nullable(),
});

export type Entry = z.infer<typeof EntrySchema>;

export const SentimentSchema = z.object({
  sentiment: z.enum(["positive", "neutral", "negative"]),
  confidence: z.number(),
});

export type Sentiment = z.infer<typeof SentimentSchema>;

export const TagSchema = z.object({
  tag: z.string(),
  confidence: z.number(),
});

export type Tag = z.infer<typeof TagSchema>;

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const { data, error } = useSWR("/api/log", fetcher);

  // Correct Zod validation handling
  const validation = data
    ? z.array(publicLogsRowSchema).safeParse(data.entries)
    : { success: false, data: [], error: null };

  if (!validation.success) {
    console.error("Data validation failed", validation.error?.errors);
    return null;
  }

  const validData = validation.success ? validation.data : [];
  const entries = validData;
  const averageMood = data?.average_mood || 0;
  const averageEnergy = data?.average_energy || 0;

  if (error) {
    console.error("Failed to fetch entries", error);
    return null;
  }

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
