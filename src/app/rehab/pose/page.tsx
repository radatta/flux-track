"use client";
import { LivePoseEstimation } from "@/components/rehab/LivePostEstimation";
import { useParams } from "next/navigation";

export default function ExercisePage() {
  const { exercise: exerciseRaw } = useParams<{ exercise: string }>();
  const exercise = exerciseRaw || "head_tilt_right";

  return (
    <div className="flex flex-col items-center mt-8">
      <h1 className="text-2xl font-bold mb-2">
        {exercise.charAt(0).toUpperCase() + exercise.slice(1)} Exercise
      </h1>
      <LivePoseEstimation initialExercise={exercise} />
    </div>
  );
}
