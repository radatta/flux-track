"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { TrendingUp } from "lucide-react";
import { Entry } from "@/lib/db";

const chartConfig = {
  mood: {
    label: "Mood",
    color: "#6B8EFF",
  },
  energy: {
    label: "Energy",
    color: "#FFB6C1",
  },
};

export function TrendVisualization({ entries }: { entries: Entry[] }) {
  const sortedEntries = [...entries].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return (
    <Card className="bg-white border-[#6B8EFF]/20">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-[#2D3748]">
          <TrendingUp className="h-5 w-5 text-[#6B8EFF]" />
          <span>7-Day Trend</span>
        </CardTitle>
        <CardDescription>
          Your mood and energy patterns over the last week
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={sortedEntries}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#6B8EFF20" />
              <XAxis
                dataKey="created_at"
                stroke="#2D3748"
                fontSize={12}
                tickFormatter={(value) => format(new Date(value), "MMM d")}
              />
              <YAxis domain={[1, 10]} stroke="#2D3748" fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="var(--color-mood)"
                strokeWidth={3}
                dot={{ fill: "var(--color-mood)", strokeWidth: 2, r: 4 }}
                activeDot={{
                  r: 6,
                  stroke: "var(--color-mood)",
                  strokeWidth: 2,
                }}
              />
              <Line
                type="monotone"
                dataKey="energy"
                stroke="var(--color-energy)"
                strokeWidth={3}
                dot={{ fill: "var(--color-energy)", strokeWidth: 2, r: 4 }}
                activeDot={{
                  r: 6,
                  stroke: "var(--color-energy)",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
