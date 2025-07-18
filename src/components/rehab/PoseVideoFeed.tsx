"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Play, Pause, RotateCcw } from "lucide-react";
import * as tf from "@tensorflow/tfjs";
import * as poseDetection from "@tensorflow-models/pose-detection";
import { drawKeypointConnections, drawKeypointsWithCoords } from "@/utils/drawUtils";
import { exerciseConfigs } from "@/utils/exerciseConfig";
import type { NamedKeypoints } from "@/utils/exerciseConfig";
import { PoseData } from "./poseTypes";
import useSound from "use-sound";

interface PoseVideoFeedProps {
  currentExercise: string;
  onPoseDataChange: (data: PoseData) => void;
  onSessionTimeChange: (time: number) => void;
}

// Constants mirroring original logic
const SCORE_THRESHOLD = 0.3;
const HOLD_TARGET_MS = 10000;
const DRAW_KEYPOINTS = false;
const DRAW_KEYPOINT_CONNECTIONS = true;

const defaultPoseData: PoseData = {
  isCorrect: false,
  feedback: "Position yourself in front of the camera",
  confidence: 0,
  accuracy: 0,
  holdTime: 0,
  repCount: 0,
};

export default function PoseVideoFeed({
  currentExercise,
  onPoseDataChange,
  onSessionTimeChange,
}: PoseVideoFeedProps) {
  const [mounted, setMounted] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [poseData, setPoseData] = useState<PoseData>({
    ...defaultPoseData,
  });
  const [sessionTime, setSessionTime] = useState(0);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playPopSound] = useSound("/sounds/pop.mp3");
  const [playKachingSound] = useSound("/sounds/kaching.mp3");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Log reps to server whenever repCount increases
  const prevRepRef = useRef(0);
  useEffect(() => {
    if (!sessionId) return;
    if (poseData.repCount > prevRepRef.current) {
      // new rep detected
      fetch("/api/rehab/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          repNumber: poseData.repCount,
          durationSeconds: 10, // default
        }),
      }).catch((err) => console.error(err));
      prevRepRef.current = poseData.repCount;
    }
  }, [poseData.repCount, sessionId]);

  // Propagate updates to parent whenever poseData or sessionTime changes
  useEffect(() => onPoseDataChange(poseData), [onPoseDataChange, poseData]);
  useEffect(() => onSessionTimeChange(sessionTime), [onSessionTimeChange, sessionTime]);

  // Increment session timer while active
  useEffect(() => {
    if (!isActive) return;
    const timer = setInterval(() => setSessionTime((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [isActive]);

  const toConfigKey = (val: string) => val.replace(/-/g, "_");

  // Real pose-detection logic
  useEffect(() => {
    if (!isActive || cameraPermission !== true) return;

    const configKey = toConfigKey(currentExercise);
    const config = exerciseConfigs[configKey] ?? exerciseConfigs["head_tilt_right"];

    let detector: poseDetection.PoseDetector | null = null;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let animationFrameId: number | null = null;

    let inPose = false;
    let poseStartTime: Date | null = null;

    const setup = async () => {
      await tf.setBackend("webgl");
      await tf.ready();

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      const setCanvasDims = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      };
      video.addEventListener("loadedmetadata", setCanvasDims);
      setCanvasDims();

      detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet
      );

      const render = async () => {
        if (!detector || !video || !canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const poses = await detector.estimatePoses(video);

        if (poses.length > 0 && (DRAW_KEYPOINTS || DRAW_KEYPOINT_CONNECTIONS)) {
          const keypoints = poses[0].keypoints as poseDetection.Keypoint[];
          const scaleX = canvas.width / video.videoWidth || 1;
          const scaleY = canvas.height / video.videoHeight || 1;

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
      };

      // Pose-analysis interval (1s)
      intervalId = setInterval(async () => {
        if (!detector || !video) return;
        const poses = await detector.estimatePoses(video);
        if (poses.length === 0) {
          inPose = false;
          poseStartTime = null;
          setPoseData((prev) => ({
            ...prev,
            isCorrect: false,
            feedback: "No pose detected",
            holdTime: 0,
          }));
          return;
        }

        const keypoints = poses[0].keypoints;
        const kpMap: NamedKeypoints = {};
        keypoints.forEach((kp) => {
          if (kp.name) kpMap[kp.name] = kp as poseDetection.Keypoint;
        });

        const requiredPresent = config.requiredKeypoints.every(
          (name) => (kpMap[name]?.score ?? 0) > SCORE_THRESHOLD
        );

        let confidence = 0;
        if (requiredPresent) {
          const scores = config.requiredKeypoints.map((n) => kpMap[n]?.score ?? 0);
          confidence = (scores.reduce((sum, s) => sum + s, 0) / scores.length) * 100;
        }

        if (requiredPresent && config.primaryCheck(kpMap)) {
          const failingSecondary = config.secondaryChecks?.find((sc) =>
            sc.invalidCheck(kpMap)
          );

          if (failingSecondary) {
            inPose = false;
            poseStartTime = null;
            setPoseData((prev) => ({
              ...prev,
              isCorrect: false,
              feedback: failingSecondary.message,
              confidence,
              accuracy: config.accuracyFunction(kpMap),
              holdTime: 0,
            }));
          } else {
            if (!inPose) {
              inPose = true;
              poseStartTime = new Date();
            }

            if (poseStartTime) {
              const elapsed = Date.now() - poseStartTime.getTime();
              const holdSeconds = Math.floor(elapsed / 1000);

              if (elapsed >= HOLD_TARGET_MS) {
                setPoseData((prev) => ({
                  ...prev,
                  isCorrect: true,
                  feedback: config.messages.success,
                  confidence,
                  accuracy: config.accuracyFunction(kpMap),
                  holdTime: 0,
                  repCount: prev.repCount + 1,
                }));
                inPose = false;
                poseStartTime = null;
                playKachingSound();
              } else {
                const secondsRemaining = 10 - holdSeconds;
                setPoseData((prev) => ({
                  ...prev,
                  isCorrect: true,
                  feedback: config.messages.holdPrompt(secondsRemaining),
                  confidence,
                  accuracy: config.accuracyFunction(kpMap),
                  holdTime: holdSeconds,
                }));
                // Play pop sound only when first entering valid pose (first second of hold)
                if (holdSeconds === 1) {
                  playPopSound();
                }
              }
            }
          }
        } else {
          inPose = false;
          poseStartTime = null;
          setPoseData((prev) => ({
            ...prev,
            isCorrect: false,
            feedback: config.messages.initialPrompt,
            confidence,
            accuracy: config.accuracyFunction(kpMap),
            holdTime: 0,
          }));
        }
      }, 1000);

      render();
    };

    setup();

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isActive, currentExercise, cameraPermission]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraPermission(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCameraPermission(false);
    }
  };

  const toggleSession = () => {
    if (!isActive && cameraPermission === null) {
      startCamera();
    }

    // Starting session
    if (!isActive) {
      // Start new session on server
      fetch("/api/rehab/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseSlug: currentExercise }),
      })
        .then((res) => res.json())
        .then((data) => {
          setSessionId(data.id);
          prevRepRef.current = 0;
        })
        .catch((err) => console.error(err));
    } else if (sessionId) {
      // Stopping session -> mark complete
      fetch("/api/rehab/session/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      }).catch((err) => console.error(err));
      setSessionId(null);
      setSessionTime(0);
      prevRepRef.current = 0;
      setPoseData(defaultPoseData);
    }

    setIsActive(!isActive);
  };

  const resetSession = () => {
    setSessionId(null);
    setIsActive(false);
    setSessionTime(0);
    prevRepRef.current = 0;
    setPoseData(defaultPoseData);
  };

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="lg:col-span-3">
      <Card className="bg-white border-[#6B8EFF]/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5 text-[#6B8EFF]" />
            <span>Camera Feed</span>
            {cameraPermission === true && (
              <Badge className="bg-green-100 text-green-700">Connected</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
            {cameraPermission === false ? (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <div className="text-center">
                  <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Camera access denied</p>
                  <p className="text-sm opacity-75">
                    Please enable camera permissions to continue
                  </p>
                </div>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                />
              </>
            )}
          </div>

          {/* Session Controls */}
          <div className="flex items-center justify-center space-x-4 mt-4">
            <Button
              onClick={toggleSession}
              className={
                isActive
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-[#6B8EFF] hover:bg-[#6B8EFF]/90"
              }
              size="lg"
            >
              {isActive ? (
                <>
                  <Pause className="h-5 w-5 mr-2" />
                  Stop Session
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Start Session
                </>
              )}
            </Button>
            <Button
              onClick={resetSession}
              variant="outline"
              size="lg"
              className="border-[#6B8EFF]/20"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
