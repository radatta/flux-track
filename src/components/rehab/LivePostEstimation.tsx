"use client";

import { useState } from "react";
import PoseHeader from "./PoseHeader";
import PoseVideoFeed from "./PoseVideoFeed";
import PoseSidebar from "./PoseSidebar";
import type { PoseData } from "./poseTypes";

export function LivePoseEstimation({
  initialExercise = "head_tilt_right",
}: {
  initialExercise?: string;
}) {
  const [currentExercise, setCurrentExercise] = useState<string>(
    initialExercise.replace(/_/g, "-")
  );
  const [poseData, setPoseData] = useState<PoseData>({
    isCorrect: false,
    feedback: "Position yourself in front of the camera",
    confidence: 0,
    holdTime: 0,
    repCount: 0,
  });
  const [sessionTime, setSessionTime] = useState<number>(0);

  return (
    <div className="min-h-screen bg-[#F8F9FF] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PoseHeader
          currentExercise={currentExercise}
          onExerciseChange={setCurrentExercise}
        />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <PoseVideoFeed
            currentExercise={currentExercise}
            onPoseDataChange={setPoseData}
            onSessionTimeChange={setSessionTime}
          />
          <PoseSidebar poseData={poseData} sessionTime={sessionTime} />
        </div>
      </div>
    </div>
  );
}
