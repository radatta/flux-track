"use client";

import PoseCanvas from "@/components/PoseCanvas";

const KEYPOINT_CONNECTIONS: [string, string, string][] = [
  ["right_shoulder", "right_ear", ""],
  ["left_shoulder", "left_ear", ""],
  ["left_shoulder", "right_shoulder", "y"],
  ["left_ear", "right_ear", "y"],
];

const SCORE_THRESHOLD = 0.3;

export default function CanvasPage() {
  return (
    <div className="flex flex-col items-center mt-8">
      <h1 className="text-2xl font-bold mb-2">Rehab Canvas</h1>
      <PoseCanvas
        width={1000}
        height={750}
        KEYPOINT_CONNECTIONS={KEYPOINT_CONNECTIONS}
        SCORE_THRESHOLD={SCORE_THRESHOLD}
      />
    </div>
  );
}
