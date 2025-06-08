"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Heart,
  Zap,
  FileText,
  Tag,
  TrendingUp,
  Smile,
  Meh,
  Frown,
} from "lucide-react";
import { publicLogsRowSchema } from "@/schemas";
import { z } from "zod";
import { useEffect, useState } from "react";
import { getLogById } from "@/lib/db";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Sentiment } from "@/lib/db";

function getMoodIcon(mood: number) {
  if (mood >= 8) return <Smile className="h-6 w-6" />;
  if (mood >= 6) return <Meh className="h-6 w-6" />;
  return <Frown className="h-6 w-6" />;
}

function getMoodColor(mood: number) {
  if (mood >= 8) return "text-green-600 bg-green-50";
  if (mood >= 6) return "text-[#6B8EFF] bg-[#6B8EFF]/10";
  if (mood >= 4) return "text-yellow-600 bg-yellow-50";
  return "text-red-600 bg-red-50";
}

function getMoodLabel(mood: number) {
  if (mood >= 9) return "Excellent";
  if (mood >= 8) return "Great";
  if (mood >= 7) return "Good";
  if (mood >= 6) return "Okay";
  if (mood >= 5) return "Fair";
  if (mood >= 4) return "Poor";
  if (mood >= 3) return "Bad";
  if (mood >= 2) return "Very Bad";
  return "Terrible";
}

function getEnergyLabel(energy: number) {
  if (energy >= 9) return "Very High";
  if (energy >= 8) return "High";
  if (energy >= 7) return "Good";
  if (energy >= 6) return "Moderate";
  if (energy >= 5) return "Fair";
  if (energy >= 4) return "Low";
  if (energy >= 3) return "Very Low";
  if (energy >= 2) return "Exhausted";
  return "Depleted";
}

export default function LogDetailView() {
  const { id } = useParams();
  const supabase = createClient();
  const [log, setLog] = useState<z.infer<typeof publicLogsRowSchema> | null>(
    null
  );

  useEffect(() => {
    const fetchLog = async () => {
      const log = await getLogById(supabase, id as string);
      setLog(log);
    };
    fetchLog();
  }, [id, supabase]);

  if (!log) {
    return <div>Loading...</div>;
  }

  const formattedDate = new Date(log.created_at).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = new Date(log.created_at).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-[#F8F9FF] p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center space-x-4">
          <Button
            asChild
            variant="outline"
            className="border-[#6B8EFF]/20 hover:bg-[#6B8EFF]/10"
          >
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Date and Time Card */}
            <Card className="bg-white border-[#6B8EFF]/20">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-[#6B8EFF]/10 rounded-lg">
                    <Calendar className="h-6 w-6 text-[#6B8EFF]" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-[#2D3748]">
                      {formattedDate}
                    </h1>
                    <div className="flex items-center space-x-2 text-[#2D3748]/60">
                      <Clock className="h-4 w-4" />
                      <span>Logged at {formattedTime}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Notes Card */}
            <Card className="bg-white border-[#6B8EFF]/20">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-[#6B8EFF]" />
                  <h2 className="text-xl font-semibold text-[#2D3748]">
                    Notes
                  </h2>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-[#2D3748]/80 leading-relaxed text-lg">
                  {log.notes}
                </p>
              </CardContent>
            </Card>

            {/* AI Summary Card */}
            <Card className="bg-white border-[#6B8EFF]/20">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-[#6B8EFF]" />
                  <h2 className="text-xl font-semibold text-[#2D3748]">
                    AI Summary
                  </h2>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-[#2D3748]/80 leading-relaxed text-lg">
                  {log.ai_summary}
                </p>
              </CardContent>
            </Card>

            {/* Tags Card */}
            {log.tags && log.tags.length > 0 && (
              <Card className="bg-white border-[#6B8EFF]/20">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Tag className="h-5 w-5 text-[#6B8EFF]" />
                    <h2 className="text-xl font-semibold text-[#2D3748]">
                      Tags
                    </h2>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {log.tags?.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-[#A0D8FF]/20 text-[#6B8EFF] hover:bg-[#A0D8FF]/30"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Mood and Energy */}
          <div className="space-y-6">
            {/* Mood Card */}
            <Card className="bg-white border-[#6B8EFF]/20">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-[#6B8EFF]" />
                  <h2 className="text-xl font-semibold text-[#2D3748]">Mood</h2>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${getMoodColor(log.mood)} mb-3`}
                  >
                    {getMoodIcon(log.mood)}
                  </div>
                  <div className="text-4xl font-bold text-[#2D3748] mb-1">
                    {log.mood}/10
                  </div>
                  <div className="text-lg text-[#2D3748]/70">
                    {getMoodLabel(log.mood)}
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-[#2D3748]/60">
                    <span>Mood Level</span>
                    <span>{log.mood}/10</span>
                  </div>
                  <Progress value={log.mood * 10} className="h-3" />
                </div>
              </CardContent>
            </Card>

            {/* Energy Card */}
            <Card className="bg-white border-[#6B8EFF]/20">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-[#FFB6C1]" />
                  <h2 className="text-xl font-semibold text-[#2D3748]">
                    Energy
                  </h2>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FFB6C1]/20 text-[#FFB6C1] mb-3">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div className="text-4xl font-bold text-[#2D3748] mb-1">
                    {log.energy}/10
                  </div>
                  <div className="text-lg text-[#2D3748]/70">
                    {getEnergyLabel(log.energy)}
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-[#2D3748]/60">
                    <span>Energy Level</span>
                    <span>{log.energy}/10</span>
                  </div>
                  <Progress value={log.energy * 10} className="h-3" />
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats Card */}
            <Card className="bg-gradient-to-br from-[#6B8EFF]/10 to-[#A0D8FF]/10 border-[#6B8EFF]/20">
              <CardContent className="p-6">
                <h3 className="font-semibold text-[#2D3748] mb-4">
                  Quick Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[#2D3748]/70">Overall Score</span>
                    <span className="font-semibold text-[#2D3748]">
                      {((log.mood + log.energy) / 2).toFixed(1)}/10
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#2D3748]/70">Sentiment</span>
                    <span className="font-semibold text-[#2D3748]">
                      {(log.sentiment as Sentiment)?.sentiment}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#2D3748]/70">Tags</span>
                    <span className="font-semibold text-[#2D3748]">
                      {log.tags?.length || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
