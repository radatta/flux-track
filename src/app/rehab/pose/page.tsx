import { LivePoseEstimation } from "@/components/rehab/LivePostEstimation";
import { Suspense } from "react";

export default function ExercisePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LivePoseEstimation />
    </Suspense>
  );
}
