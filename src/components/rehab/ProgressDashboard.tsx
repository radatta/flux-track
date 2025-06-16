"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Calendar,
  Target,
  Award,
  Download,
  Share2,
  Clock,
  CheckCircle,
  Flame,
  BarChart3,
} from "lucide-react";
import { useEffect, useState } from "react";

type WeeklyProgress = {
  day: string;
  sessions: number;
  duration: number;
  accuracy: number;
};
type MonthlyData = { month: string; totalSessions: number; avgAccuracy: number };
type RecentSession = {
  id: string;
  date: string;
  exercise: string;
  duration: string;
  reps: number;
  accuracy: number;
  feedback: string;
};
type Achievement = {
  title: string;
  description: string;
  earned: boolean;
  date?: string;
  progress?: number;
};

const chartConfig = {
  sessions: {
    label: "Sessions",
    color: "#6B8EFF",
  },
  duration: {
    label: "Duration (min)",
    color: "#FFB6C1",
  },
  accuracy: {
    label: "Accuracy (%)",
    color: "#A0D8FF",
  },
};

export function ProgressDashboard() {
  const [loading, setLoading] = useState(true);
  const [weeklyProgressData, setWeeklyProgressData] = useState<WeeklyProgress[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [avgAccuracy, setAvgAccuracy] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/rehab/dashboard");
        if (!res.ok) throw new Error("Failed to load dashboard");
        const data = await res.json();
        setWeeklyProgressData(data.weeklyProgressData);
        setMonthlyData(data.monthlyData);
        setRecentSessions(data.recentSessions);
        setAchievements(data.achievements);
        setCurrentStreak(data.currentStreak);
        setTotalSessions(data.totalSessions);
        setAvgAccuracy(data.avgAccuracy);
        setTotalDuration(data.totalDuration);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="text-center py-20">Loading...</div>;
  }

  // const getAccuracyColor = (accuracy: number) => {
  //   if (accuracy >= 90) return "text-green-600";
  //   if (accuracy >= 80) return "text-[#6B8EFF]";
  //   if (accuracy >= 70) return "text-yellow-600";
  //   return "text-red-600";
  // };

  const getAccuracyBadge = (accuracy: number) => {
    if (accuracy >= 90) return "bg-green-100 text-green-700";
    if (accuracy >= 80) return "bg-[#6B8EFF]/10 text-[#6B8EFF]";
    if (accuracy >= 70) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#2D3748] mb-2">Progress Dashboard</h1>
          <p className="text-[#2D3748]/70">
            Track your rehabilitation journey and achievements
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="border-[#6B8EFF]/20 hover:bg-[#6B8EFF]/10">
            <Share2 className="h-4 w-4 mr-2" />
            Share Progress
          </Button>
          <Button variant="outline" className="border-[#6B8EFF]/20 hover:bg-[#6B8EFF]/10">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white border-[#6B8EFF]/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#6B8EFF]/10 rounded-lg">
                <Flame className="h-6 w-6 text-[#6B8EFF]" />
              </div>
              <div>
                <p className="text-sm text-[#2D3748]/60">Current Streak</p>
                <p className="text-2xl font-bold text-[#2D3748]">{currentStreak} days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#6B8EFF]/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#A0D8FF]/20 rounded-lg">
                <BarChart3 className="h-6 w-6 text-[#6B8EFF]" />
              </div>
              <div>
                <p className="text-sm text-[#2D3748]/60">Total Sessions</p>
                <p className="text-2xl font-bold text-[#2D3748]">{totalSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#6B8EFF]/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#FFB6C1]/20 rounded-lg">
                <Target className="h-6 w-6 text-[#FFB6C1]" />
              </div>
              <div>
                <p className="text-sm text-[#2D3748]/60">Avg Accuracy</p>
                <p className="text-2xl font-bold text-[#2D3748]">{avgAccuracy}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#6B8EFF]/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-[#2D3748]/60">Total Time</p>
                <p className="text-2xl font-bold text-[#2D3748]">
                  {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weekly Progress Chart */}
        <Card className="bg-white border-[#6B8EFF]/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-[#6B8EFF]" />
              <span>Weekly Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyProgressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#6B8EFF20" />
                  <XAxis dataKey="day" stroke="#2D3748" fontSize={12} />
                  <YAxis stroke="#2D3748" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="sessions" fill="var(--color-sessions)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Monthly Accuracy Trend */}
        <Card className="bg-white border-[#6B8EFF]/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-[#6B8EFF]" />
              <span>Accuracy Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#6B8EFF20" />
                  <XAxis dataKey="month" stroke="#2D3748" fontSize={12} />
                  <YAxis domain={[70, 100]} stroke="#2D3748" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="avgAccuracy"
                    stroke="var(--color-accuracy)"
                    strokeWidth={3}
                    dot={{ fill: "var(--color-accuracy)", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sessions */}
        <div className="lg:col-span-2">
          <Card className="bg-white border-[#6B8EFF]/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-[#6B8EFF]" />
                <span>Recent Sessions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Exercise</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Reps</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>Feedback</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">
                        {new Date(session.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell>{session.exercise}</TableCell>
                      <TableCell>{session.duration}</TableCell>
                      <TableCell>{session.reps}</TableCell>
                      <TableCell>
                        <Badge className={getAccuracyBadge(session.accuracy)}>
                          {session.accuracy}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-[#2D3748]/70">
                        {session.feedback}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <Card className="bg-white border-[#6B8EFF]/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-[#6B8EFF]" />
              <span>Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {achievements.map((achievement, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div
                  className={`p-1 rounded-full ${achievement.earned ? "bg-green-100" : "bg-gray-100"}`}
                >
                  {achievement.earned ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[#2D3748]">
                    {achievement.title}
                  </p>
                  <p className="text-xs text-[#2D3748]/60 mb-1">
                    {achievement.description}
                  </p>
                  {achievement.earned ? (
                    <p className="text-xs text-green-600">
                      Earned {new Date(achievement.date!).toLocaleDateString()}
                    </p>
                  ) : (
                    <>
                      {achievement.progress !== undefined && (
                        <>
                          <Progress
                            value={(achievement.progress / 5) * 100}
                            className="h-1"
                          />
                          <p className="text-xs text-[#2D3748]/50">
                            {achievement.progress}/5 progress
                          </p>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
