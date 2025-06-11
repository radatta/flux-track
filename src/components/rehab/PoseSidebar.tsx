"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { PoseData } from "./poseTypes";

interface PoseSidebarProps {
  poseData: PoseData;
  sessionTime: number;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export default function PoseSidebar({ poseData, sessionTime }: PoseSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Real-time Feedback */}
      <Card className="bg-white border-[#6B8EFF]/20">
        <CardHeader>
          <CardTitle className="text-lg">Real-time Feedback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            {poseData.isCorrect ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            )}
            <span className="text-sm font-medium">
              {poseData.isCorrect ? "Good Form" : "Needs Adjustment"}
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-[#2D3748]/70">{poseData.feedback}</p>
            <div className="text-xs text-[#2D3748]/50">
              Hold time: {poseData.holdTime}s
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Stats */}
      <Card className="bg-white border-[#6B8EFF]/20">
        <CardHeader>
          <CardTitle className="text-lg">Session Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#6B8EFF]">
                {formatTime(sessionTime)}
              </div>
              <div className="text-xs text-[#2D3748]/60">Duration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#FFB6C1]">{poseData.repCount}</div>
              <div className="text-xs text-[#2D3748]/60">Reps</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Accuracy</span>
              <span>{poseData.confidence.toFixed(1)}%</span>
            </div>
            <Progress value={poseData.confidence} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Exercise Instructions */}
      <Card className="bg-white border-[#6B8EFF]/20">
        <CardHeader>
          <CardTitle className="text-lg">Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {/* TODO: Pull dynamic instructions per exercise if desired */}
            <p>1. Sit or stand with good posture</p>
            <p>2. Keep shoulders relaxed</p>
            <p>3. Slowly pull chin back</p>
            <p>4. Hold for 3-5 seconds</p>
            <p>5. Return to start position</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
