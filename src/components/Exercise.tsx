"use client";

import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import * as poseDetection from "@tensorflow-models/pose-detection";
import { drawKeypointsWithCoords } from "@/utils/drawUtils";

const KEYPOINT_CONNECTIONS: [string, string, string][] = [
  ["right_shoulder", "right_ear", ""],
  ["left_shoulder", "left_ear", ""],
  ["left_shoulder", "right_shoulder", "y"],
  ["left_ear", "right_ear", "y"],
];

const SCORE_THRESHOLD = 0.3;
const TILT_THRESHOLD = 20;
const HOLD_TARGET_MS = 10000;
const DRAW_KEYPOINTS = true;

export function Exercise({ exercise }: { exercise: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [feedback, setFeedback] = useState<string>("Loading pose model...");
  const [poseReady, setPoseReady] = useState<boolean>(false);
  const [holdTime, setHoldTime] = useState<number>(0);
  const [repCount, setRepCount] = useState<number>(0);

  useEffect(() => {
    let detector: poseDetection.PoseDetector | null = null;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let animationFrameId: number | null = null;

    let inPose = false;
    let poseStartTime: Date | null = null;

    const setup = async () => {
      // 1. Set and await backend
      await tf.setBackend("webgl");
      await tf.ready();

      // 2. Set up video
      const video = videoRef.current;
      if (!video) return;
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      (video as HTMLVideoElement).srcObject = stream;
      await video.play();

      // 3. Load MoveNet
      detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet
      );
      setPoseReady(true);

      async function render() {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!detector || !video) return;
        const poses = await detector.estimatePoses(video);

        // Draw keypoints and connections with coordinates using utility
        if (poses.length > 0 && DRAW_KEYPOINTS) {
          const keypoints = poses[0].keypoints as poseDetection.Keypoint[];
          const scaleX = (canvas.width ?? 1) / video.videoWidth || 1;
          const scaleY = (canvas.height ?? 1) / video.videoHeight || 1;
          drawKeypointsWithCoords(
            ctx,
            keypoints,
            scaleX,
            scaleY,
            KEYPOINT_CONNECTIONS,
            SCORE_THRESHOLD
          );
        }

        animationFrameId = requestAnimationFrame(render);
      }

      // 4. Run pose estimation loop and hold detection
      intervalId = setInterval(async () => {
        if (!detector || !video) return;
        const poses = await detector.estimatePoses(video);
        if (poses.length > 0) {
          const keypoints = poses[0].keypoints;
          const rightEar = keypoints.find((kp) => kp.name === "right_ear");
          const leftEar = keypoints.find((kp) => kp.name === "left_ear");
          const rightSh = keypoints.find((kp) => kp.name === "right_shoulder");
          const leftSh = keypoints.find((kp) => kp.name === "left_shoulder");

          if (
            rightEar &&
            leftEar &&
            rightSh &&
            leftSh &&
            (rightEar.score ?? 0) > SCORE_THRESHOLD &&
            (leftEar.score ?? 0) > SCORE_THRESHOLD &&
            (rightSh.score ?? 0) > SCORE_THRESHOLD &&
            (leftSh.score ?? 0) > SCORE_THRESHOLD
          ) {
            const earYDiff = rightEar.y - leftEar.y;
            const shoulderYDiff = Math.abs(leftSh.y - rightSh.y);
            // Step 1: Detect head tilt right and check shoulder alignment
            if (earYDiff > TILT_THRESHOLD) {
              if (shoulderYDiff > 30) {
                inPose = false;
                poseStartTime = null;
                setHoldTime(0);
                setFeedback("⬆️ Keep your shoulders level");
              } else {
                if (!inPose) {
                  inPose = true;
                  poseStartTime = new Date();
                }
                if (poseStartTime) {
                  const elapsed = new Date().getTime() - poseStartTime.getTime();
                  setHoldTime(Math.floor(elapsed / 1000));
                  // Step 2: Hold for 10 seconds
                  if (elapsed >= HOLD_TARGET_MS) {
                    setFeedback("✅ Good rep! Head tilt right held for 10s.");
                    setRepCount((prev) => prev + 1);
                    inPose = false;
                    poseStartTime = null;
                    setHoldTime(0);
                  } else {
                    setFeedback(
                      `👉 Hold head tilt right: ${10 - Math.floor(elapsed / 1000)}s left`
                    );
                  }
                }
              }
            } else {
              // Step 3: Reset if user exits pose
              inPose = false;
              poseStartTime = null;
              setHoldTime(0);
              setFeedback("⬆️ Move into head tilt right position");
            }
          } else {
            inPose = false;
            poseStartTime = null;
            setHoldTime(0);
            setFeedback("Move into view of the camera");
          }
        } else {
          inPose = false;
          poseStartTime = null;
          setHoldTime(0);
          setFeedback("No pose detected");
        }
      }, 1000); // Fast interval for responsive feedback

      render();
    };

    setup();

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      const video = videoRef.current;
      if (video && video.srcObject) {
        (video.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center mt-8">
      <div style={{ position: "relative", width: 1000, height: 750 }}>
        <video
          ref={videoRef}
          width={1000}
          height={750}
          autoPlay
          muted
          style={{ position: "absolute", top: 0, left: 0 }}
        />
        <canvas
          ref={canvasRef}
          width={1000}
          height={750}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            pointerEvents: "none",
            border: "1px solid red",
          }}
        />
      </div>
      <p className="mb-2">
        <strong>Instructions:</strong> Tilt your head right (left ear lower than right
        ear) and hold for 10 seconds. Repeat as many reps as you like.
      </p>
      <div
        className="text-lg font-semibold p-2 rounded"
        style={{
          background: poseReady ? "#e5ffe5" : "#ffe5e5",
          color: poseReady ? "#1a7f37" : "#a71a1a",
          minWidth: 220,
          textAlign: "center",
        }}
      >
        {feedback}
      </div>
      <div className="mt-2 text-lg">
        <strong>Hold Time:</strong> {holdTime}s<br />
        <strong>Reps:</strong> {repCount}
      </div>
    </div>
  );
}
