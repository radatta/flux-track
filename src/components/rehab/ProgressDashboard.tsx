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

// Mock data for charts and progress
const weeklyProgressData = [
  { day: "Mon", sessions: 2, duration: 25, accuracy: 85 },
  { day: "Tue", sessions: 1, duration: 15, accuracy: 78 },
  { day: "Wed", sessions: 3, duration: 35, accuracy: 92 },
  { day: "Thu", sessions: 2, duration: 20, accuracy: 88 },
  { day: "Fri", sessions: 1, duration: 12, accuracy: 75 },
  { day: "Sat", sessions: 4, duration: 45, accuracy: 95 },
  { day: "Sun", sessions: 2, duration: 30, accuracy: 90 },
];

const monthlyData = [
  { month: "Jan", totalSessions: 45, avgAccuracy: 82 },
  { month: "Feb", totalSessions: 52, avgAccuracy: 85 },
  { month: "Mar", totalSessions: 48, avgAccuracy: 88 },
  { month: "Apr", totalSessions: 61, avgAccuracy: 91 },
  { month: "May", totalSessions: 58, avgAccuracy: 89 },
  { month: "Jun", totalSessions: 65, avgAccuracy: 93 },
];

const recentSessions = [
  {
    id: 1,
    date: "2024-01-08",
    exercise: "Chin Tuck",
    duration: "15 min",
    reps: 12,
    accuracy: 92,
    feedback: "Excellent form",
  },
  {
    id: 2,
    date: "2024-01-08",
    exercise: "Head Tilt Right",
    duration: "10 min",
    reps: 8,
    accuracy: 88,
    feedback: "Good progress",
  },
  {
    id: 3,
    date: "2024-01-07",
    exercise: "Neck Rotation",
    duration: "20 min",
    reps: 15,
    accuracy: 85,
    feedback: "Keep practicing",
  },
  {
    id: 4,
    date: "2024-01-07",
    exercise: "Chin Tuck",
    duration: "12 min",
    reps: 10,
    accuracy: 78,
    feedback: "Focus on form",
  },
  {
    id: 5,
    date: "2024-01-06",
    exercise: "Shoulder Rolls",
    duration: "8 min",
    reps: 6,
    accuracy: 95,
    feedback: "Perfect execution",
  },
];

const achievements = [
  {
    title: "7-Day Streak",
    description: "Completed exercises for 7 consecutive days",
    earned: true,
    date: "2024-01-08",
  },
  {
    title: "Perfect Form",
    description: "Achieved 95%+ accuracy in a session",
    earned: true,
    date: "2024-01-06",
  },
  {
    title: "Consistency Champion",
    description: "30 sessions completed",
    earned: true,
    date: "2024-01-05",
  },
  {
    title: "Early Bird",
    description: "Complete 5 morning sessions",
    earned: false,
    progress: 3,
  },
  {
    title: "Marathon",
    description: "60-minute total session time in one day",
    earned: false,
    progress: 45,
  },
];

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
  const currentStreak = 7;
  const totalSessions = 156;
  const avgAccuracy = 89;
  const totalDuration = 2340; // minutes

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return "text-green-600";
    if (accuracy >= 80) return "text-[#6B8EFF]";
    if (accuracy >= 70) return "text-yellow-600";
    return "text-red-600";
  };

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
                    <div className="space-y-1">
                      <Progress
                        value={(achievement.progress! / 5) * 100}
                        className="h-1"
                      />
                      <p className="text-xs text-[#2D3748]/50">
                        {achievement.progress}/5 progress
                      </p>
                    </div>
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
