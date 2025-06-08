"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Clock, FileText } from "lucide-react";
import { Entry } from "./page";
import Link from "next/link";

function getMoodColor(mood: number) {
  if (mood >= 8) return "bg-green-500";
  if (mood >= 6) return "bg-[#6B8EFF]";
  if (mood >= 4) return "bg-yellow-500";
  return "bg-red-500";
}

function getMoodLabel(mood: number) {
  if (mood >= 8) return "Great";
  if (mood >= 6) return "Good";
  if (mood >= 4) return "Okay";
  return "Low";
}

// function getEnergyColor(energy: number) {
//   if (energy >= 8) return "bg-[#FFB6C1]";
//   if (energy >= 6) return "bg-[#A0D8FF]";
//   if (energy >= 4) return "bg-yellow-400";
//   return "bg-gray-400";
// }

function truncateNotes(notes: string | null, maxLength = 50) {
  if (!notes) return "";
  if (notes.length <= maxLength) return notes;
  return notes.substring(0, maxLength) + "...";
}

export function RecentEntriesTable({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) {
    return (
      <Card className="bg-white border-[#6B8EFF]/20">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-[#6B8EFF]/50 mb-4" />
          <h3 className="text-lg font-semibold text-[#2D3748] mb-2">
            No entries yet
          </h3>
          <p className="text-[#2D3748]/60 text-center">
            Start logging your mood and energy to see your patterns here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-[#6B8EFF]/20">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-[#2D3748]">
          <Clock className="h-5 w-5 text-[#6B8EFF]" />
          <span>Recent Entries</span>
        </CardTitle>
        <CardDescription>Your latest mood and energy logs</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Mood</TableHead>
                <TableHead>Energy</TableHead>
                <TableHead>Summary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">
                    <Link href={`/log/${entry.id}`}>
                      {new Date(entry.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Badge
                        className={`${getMoodColor(
                          entry.mood
                        )} text-white hover:${getMoodColor(entry.mood)}/90`}
                      >
                        {entry.mood}
                      </Badge>
                      <span className="text-sm text-[#2D3748]/60">
                        {getMoodLabel(entry.mood)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Progress
                        value={entry.energy * 10}
                        className="w-16 h-2"
                      />
                      <span className="text-sm font-medium text-[#2D3748]">
                        {entry.energy}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <span className="text-sm text-[#2D3748]/70">
                      {truncateNotes(entry.ai_summary)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
