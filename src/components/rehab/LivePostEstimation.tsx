"use client";

import { useState, useEffect } from "react";
import PoseHeader from "./PoseHeader";
import PoseVideoFeed from "./PoseVideoFeed";
import PoseSidebar from "./PoseSidebar";
import type { PoseData } from "./poseTypes";
import { useSearchParams } from "next/navigation";

export function LivePoseEstimation() {
  const searchParams = useSearchParams();
  const exercise = searchParams.get("exercise") || "head-tilt-right";
  const [currentExercise, setCurrentExercise] = useState<string>(exercise);
  const [poseData, setPoseData] = useState<PoseData>({
    isCorrect: false,
    feedback: "Position yourself in front of the camera",
    confidence: 0,
    accuracy: 0,
    holdTime: 0,
    repCount: 0,
  });
  const [sessionTime, setSessionTime] = useState<number>(0);
  const [showReferenceOverlay, setShowReferenceOverlay] = useState<boolean>(true);

  const [exercises, setExercises] = useState<{ slug: string; name: string }[]>([]);

  // Fetch exercises list
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const res = await fetch("/api/rehab/exercise");
        if (!res.ok) throw new Error("Failed to load exercises");
        const data = (await res.json()) as { slug: string; name: string }[];
        setExercises(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchExercises();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FF] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PoseHeader
          currentExercise={currentExercise}
          onExerciseChange={setCurrentExercise}
          exercises={exercises}
          autoDetectionEnabled={true}
          showReferenceOverlay={showReferenceOverlay}
          onToggleReferenceOverlay={() => setShowReferenceOverlay((prev) => !prev)}
        />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <PoseVideoFeed
            currentExercise={currentExercise}
            onPoseDataChange={setPoseData}
            onSessionTimeChange={setSessionTime}
            onExerciseChange={setCurrentExercise}
            showReferenceOverlay={showReferenceOverlay}
          />
          <PoseSidebar poseData={poseData} sessionTime={sessionTime} />
        </div>
      </div>
    </div>
  );
}
