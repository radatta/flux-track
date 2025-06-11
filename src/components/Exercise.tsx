"use client";

import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import * as poseDetection from "@tensorflow-models/pose-detection";
import { drawKeypointConnections, drawKeypointsWithCoords } from "@/utils/drawUtils";
import { exerciseConfigs } from "@/utils/exerciseConfig";
import type { NamedKeypoints } from "@/utils/exerciseConfig";

const SCORE_THRESHOLD = 0.3;
const HOLD_TARGET_MS = 10000;
const DRAW_KEYPOINTS = false;
const DRAW_KEYPOINT_CONNECTIONS = true;

export function Exercise({ exercise }: { exercise: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [feedback, setFeedback] = useState<string>("Loading pose model...");
  const [poseReady, setPoseReady] = useState<boolean>(false);
  const [holdTime, setHoldTime] = useState<number>(0);
  const [repCount, setRepCount] = useState<number>(0);

  useEffect(() => {
    // Resolve configuration for the requested exercise (fallback to head_tilt_right)
    const config = exerciseConfigs[exercise] ?? exerciseConfigs["head_tilt_right"];

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
        if (poses.length > 0 && (DRAW_KEYPOINTS || DRAW_KEYPOINT_CONNECTIONS)) {
          const keypoints = poses[0].keypoints as poseDetection.Keypoint[];
          const scaleX = (canvas.width ?? 1) / video.videoWidth || 1;
          const scaleY = (canvas.height ?? 1) / video.videoHeight || 1;
          if (DRAW_KEYPOINTS) {
            drawKeypointsWithCoords(ctx, keypoints, scaleX, scaleY, SCORE_THRESHOLD);
          }
          if (DRAW_KEYPOINT_CONNECTIONS) {
            drawKeypointConnections(
              ctx,
              keypoints,
              scaleX,
              scaleY,
              config.keypointConnections,
              SCORE_THRESHOLD
            );
          }
        }

        animationFrameId = requestAnimationFrame(render);
      }

      // 4. Run pose estimation loop and hold detection
      intervalId = setInterval(async () => {
        if (!config) return; // Safety (although config is always defined above)
        if (!detector || !video) return;
        const poses = await detector.estimatePoses(video);
        if (poses.length > 0) {
          const keypoints = poses[0].keypoints;

          // Convert keypoints array to a name -> keypoint map for easier access
          const kpMap: NamedKeypoints = {};
          keypoints.forEach((kp) => {
            if (kp.name) kpMap[kp.name] = kp as poseDetection.Keypoint;
          });

          // Helper to ensure required keypoints are visible and confident
          const requiredPresent = config.requiredKeypoints.every(
            (name) => (kpMap[name]?.score ?? 0) > SCORE_THRESHOLD
          );

          if (requiredPresent) {
            // Step 1: Primary pose validation
            if (config.primaryCheck(kpMap)) {
              // Run secondary invalidation checks (if any)
              const failingSecondary = config.secondaryChecks?.find((sc) =>
                sc.invalidCheck(kpMap)
              );

              if (failingSecondary) {
                // Secondary check failed – prompt user and reset pose state
                inPose = false;
                poseStartTime = null;
                setHoldTime(0);
                setFeedback(failingSecondary.message);
              } else {
                // User is correctly in pose – handle hold logic
                if (!inPose) {
                  inPose = true;
                  poseStartTime = new Date();
                }

                if (poseStartTime) {
                  const elapsed = new Date().getTime() - poseStartTime.getTime();
                  setHoldTime(Math.floor(elapsed / 1000));

                  if (elapsed >= HOLD_TARGET_MS) {
                    // Rep complete
                    setFeedback(config.messages.success);
                    setRepCount((prev) => prev + 1);
                    inPose = false;
                    poseStartTime = null;
                    setHoldTime(0);
                  } else {
                    const secondsRemaining = 10 - Math.floor(elapsed / 1000);
                    setFeedback(config.messages.holdPrompt(secondsRemaining));
                  }
                }
              }
            } else {
              // Step 3: Not in primary pose – reset
              inPose = false;
              poseStartTime = null;
              setHoldTime(0);
              setFeedback(config.messages.initialPrompt);
            }
          } else {
            // Required keypoints not visible/confident
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
  }, [exercise]);

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
        <strong>Instructions:</strong>{" "}
        {exerciseConfigs[exercise]?.instructions ??
          exerciseConfigs["head_tilt_right"].instructions}
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
