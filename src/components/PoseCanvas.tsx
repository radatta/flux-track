"use client";

import { useEffect, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import * as poseDetection from "@tensorflow-models/pose-detection";
import { drawKeypointsWithCoords } from "@/utils/drawUtils";

interface PoseCanvasProps {
  KEYPOINT_CONNECTIONS: [string, string, string][];
  SCORE_THRESHOLD: number;
  width?: number;
  height?: number;
}

export default function PoseCanvas({
  KEYPOINT_CONNECTIONS,
  SCORE_THRESHOLD,
  width = 1000,
  height = 750,
}: PoseCanvasProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let detector: poseDetection.PoseDetector | null = null;
    let animationFrameId: number | null = null;

    const setup = async () => {
      // Set and await backend
      await tf.setBackend("webgl");
      await tf.ready();

      // Set up video
      const video = videoRef.current;
      if (!video) return;
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      await video.play();

      // Load MoveNet
      detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet
      );

      const scaleX = (canvasRef.current?.width ?? 1) / video.videoWidth || 1;
      const scaleY = (canvasRef.current?.height ?? 1) / video.videoHeight || 1;

      async function render() {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!detector || !video) return;
        const poses = await detector.estimatePoses(video);
        if (poses.length > 0) {
          const keypoints = poses[0].keypoints as poseDetection.Keypoint[];
          drawKeypointsWithCoords(ctx, keypoints, scaleX, scaleY, SCORE_THRESHOLD);
        }
        animationFrameId = requestAnimationFrame(render);
      }
      render();
    };
    setup();
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      const video = videoRef.current;
      if (video && video.srcObject) {
        (video.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
      }
    };
  }, [KEYPOINT_CONNECTIONS, SCORE_THRESHOLD]);

  return (
    <div style={{ position: "relative", width, height }}>
      <video
        ref={videoRef}
        width={width}
        height={height}
        autoPlay
        muted
        style={{ position: "absolute", top: 0, left: 0 }}
      />
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
          border: "1px solid red",
        }}
      />
    </div>
  );
}
