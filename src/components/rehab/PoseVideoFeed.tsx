"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Play, Pause, RotateCcw } from "lucide-react";
import * as tf from "@tensorflow/tfjs";
import * as poseDetection from "@tensorflow-models/pose-detection";
import {
  drawKeypointConnections,
  drawKeypointsWithCoords,
  drawReferenceOverlay,
} from "@/utils/drawUtils";
import { exerciseConfigs } from "@/utils/exerciseConfig";
import type { NamedKeypoints } from "@/utils/exerciseConfig";
import { PoseData } from "./poseTypes";
import { ExerciseDetectionEngine } from "@/utils/exerciseDetection";
import useSound from "use-sound";

interface PoseVideoFeedProps {
  currentExercise: string;
  onPoseDataChange: (data: PoseData) => void;
  onSessionTimeChange: (time: number) => void;
  onExerciseChange?: (exercise: string) => void; // For auto-switching
  showReferenceOverlay?: boolean;
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
  onExerciseChange,
  showReferenceOverlay = true,
}: PoseVideoFeedProps) {
  const [mounted, setMounted] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [poseData, setPoseData] = useState<PoseData>({
    ...defaultPoseData,
  });
  const [sessionTime, setSessionTime] = useState(0);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [, setDetectedExercise] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [playStartPopSound] = useSound("/sounds/pop-start.mp3");
  const [playEndPopSound] = useSound("/sounds/pop-end.mp3");
  const [playSuccessSound] = useSound("/sounds/success.mp3");

  // Exercise detection engine
  const detectionEngineRef = useRef<ExerciseDetectionEngine | null>(null);

  // Initialize detection engine on mount only
  useEffect(() => {
    setMounted(true);
    const toConfigKey = (val: string) => val.replace(/-/g, "_");
    detectionEngineRef.current = new ExerciseDetectionEngine(
      toConfigKey(currentExercise)
    );

    // Cleanup camera stream on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []); // Only run on mount/unmount

  // Update detection engine when currentExercise changes externally (manual selection)
  useEffect(() => {
    if (detectionEngineRef.current) {
      const toConfigKey = (val: string) => val.replace(/-/g, "_");
      detectionEngineRef.current.forceExercise(toConfigKey(currentExercise));
    }
  }, [currentExercise]);

  // Log reps to server whenever repCount increases
  const prevRepRef = useRef(0);
  const lastRepAccuracyRef = useRef(0); // Store accuracy when rep completes
  useEffect(() => {
    if (!sessionId || !detectionEngineRef.current) return;
    if (poseData.repCount > prevRepRef.current) {
      // new rep detected - include the exercise that was performed
      const currentExercise = detectionEngineRef.current.getState().currentExercise;
      const fromConfigKey = (val: string) => val.replace(/_/g, "-");

      fetch("/api/rehab/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          repNumber: poseData.repCount,
          durationSeconds: 10, // default
          exerciseSlug: currentExercise ? fromConfigKey(currentExercise) : null,
          accuracy: Math.round(lastRepAccuracyRef.current),
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

  // Auto-create session when detection starts
  useEffect(() => {
    if (isActive && cameraPermission === true && !sessionId) {
      // Auto-create session when detection becomes active
      fetch("/api/rehab/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
        .then((res) => res.json())
        .then((data) => {
          setSessionId(data.id);
          prevRepRef.current = 0;
        })
        .catch((err) => console.error(err));
    }
  }, [isActive, cameraPermission, sessionId, currentExercise]);

  // Real pose-detection logic with auto-detection
  useEffect(() => {
    if (!isActive || cameraPermission !== true || !detectionEngineRef.current) return;

    let detector: poseDetection.PoseDetector | null = null;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let animationFrameId: number | null = null;
    let metadataHandler: (() => void) | null = null;
    let videoElement: HTMLVideoElement | null = null;

    let inPose = false;
    let poseStartTime: Date | null = null;
    let currentDetectedExercise: string | null = null;

    const fromConfigKey = (val: string) => val.replace(/_/g, "-");

    const setup = async () => {
      await tf.setBackend("webgl");
      await tf.ready();

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      videoElement = video;
      const setCanvasDims = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      };
      metadataHandler = setCanvasDims;
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

          // Draw connections for the current detected exercise
          if (DRAW_KEYPOINT_CONNECTIONS && currentDetectedExercise) {
            const config = exerciseConfigs[currentDetectedExercise];
            if (config) {
              drawKeypointConnections(
                ctx,
                keypoints,
                scaleX,
                scaleY,
                config.keypointConnections,
                SCORE_THRESHOLD
              );

              // Draw reference overlay if enabled and reference data exists
              if (
                showReferenceOverlay &&
                config.referenceKeypoints &&
                config.referenceConnections
              ) {
                drawReferenceOverlay(
                  ctx,
                  config.referenceKeypoints,
                  config.referenceConnections,
                  keypoints,
                  scaleX,
                  scaleY,
                  0.5,
                  SCORE_THRESHOLD
                );
              }
            }
          }
        }

        animationFrameId = requestAnimationFrame(render);
      };

      // Pose-analysis interval (1s) with auto-detection
      intervalId = setInterval(async () => {
        if (!detector || !video || !detectionEngineRef.current) return;

        const poses = await detector.estimatePoses(video);
        if (poses.length === 0) {
          // Play end sound if user was in pose but lost tracking
          if (inPose) {
            playEndPopSound();
          }
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

        // Use the detection engine to find the best exercise match
        const detectionResults = detectionEngineRef.current.detectAllExercises(kpMap);
        const bestMatch = detectionEngineRef.current.getBestMatch(detectionResults);

        if (!bestMatch) {
          // Play end sound if user was in pose but lost it
          if (inPose) {
            playEndPopSound();
          }
          inPose = false;
          poseStartTime = null;
          currentDetectedExercise = null;
          setPoseData((prev) => ({
            ...prev,
            isCorrect: false,
            feedback: "Position yourself clearly in the camera view",
            confidence: 0,
            accuracy: 0,
            holdTime: 0,
          }));
          return;
        }

        // Check if we should switch exercises
        const shouldSwitch = detectionEngineRef.current.shouldSwitchExercise(
          bestMatch,
          inPose
        );

        if (shouldSwitch) {
          currentDetectedExercise = bestMatch.exerciseKey;
          setDetectedExercise(bestMatch.exerciseKey);

          const newExerciseSlug = fromConfigKey(bestMatch.exerciseKey);

          // Notify parent component of exercise change
          if (onExerciseChange) {
            onExerciseChange(newExerciseSlug);
          }

          // Reset pose state when switching
          inPose = false;
          poseStartTime = null;
        }

        // Update detection engine state
        detectionEngineRef.current.updateState(
          bestMatch.exerciseKey,
          shouldSwitch,
          inPose
        );

        // Use the current detected exercise for pose evaluation
        const activeExercise =
          detectionEngineRef.current.getState().currentExercise || bestMatch.exerciseKey;
        const activeConfig = exerciseConfigs[activeExercise];
        currentDetectedExercise = activeExercise;

        if (!activeConfig) return;

        // Calculate confidence for display
        let confidence = 0;
        if (bestMatch.exerciseKey === activeExercise) {
          confidence = Math.round(bestMatch.confidence * 100);
        }

        // Evaluate the pose against the active exercise - check if the active exercise is being performed correctly
        const activeExerciseResult = detectionResults.find(
          (r) => r.exerciseKey === activeExercise
        );
        const isActiveExercisePassing = activeExerciseResult?.isPassing || false;

        if (isActiveExercisePassing) {
          if (!inPose) {
            inPose = true;
            poseStartTime = new Date();
          }

          if (poseStartTime) {
            const elapsed = Date.now() - poseStartTime.getTime();
            const holdSeconds = Math.floor(elapsed / 1000);

            if (elapsed >= HOLD_TARGET_MS) {
              // Store accuracy before rep count increases (for logging)
              lastRepAccuracyRef.current = activeExerciseResult?.accuracy || 0;
              setPoseData((prev) => ({
                ...prev,
                isCorrect: true,
                feedback: activeConfig.messages.success,
                confidence,
                accuracy: activeExerciseResult?.accuracy || 0,
                holdTime: 0,
                repCount: prev.repCount + 1,
              }));
              inPose = false;
              poseStartTime = null;
              playSuccessSound();
            } else {
              const secondsRemaining = 10 - holdSeconds;
              setPoseData((prev) => ({
                ...prev,
                isCorrect: true,
                feedback: activeConfig.messages.holdPrompt(secondsRemaining),
                confidence,
                accuracy: activeExerciseResult?.accuracy || 0,
                holdTime: holdSeconds,
              }));
              // Play pop sound only when first entering valid pose (first second of hold)
              if (holdSeconds === 1) {
                playStartPopSound();
              }
            }
          }
        } else {
          // Play end sound if user was in pose but broke form
          if (inPose) {
            playEndPopSound();
          }
          inPose = false;
          poseStartTime = null;
          setPoseData((prev) => ({
            ...prev,
            isCorrect: false,
            feedback: activeExerciseResult?.feedback || bestMatch.feedback,
            confidence,
            accuracy: activeExerciseResult?.accuracy || bestMatch.accuracy,
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
      if (detector) detector.dispose();
      if (videoElement && metadataHandler) {
        videoElement.removeEventListener("loadedmetadata", metadataHandler);
      }
    };
  }, [
    isActive,
    cameraPermission,
    onExerciseChange,
    playStartPopSound,
    playEndPopSound,
    playSuccessSound,
    showReferenceOverlay,
  ]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraPermission(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCameraPermission(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const toggleSession = () => {
    if (!isActive && cameraPermission === null) {
      startCamera();
    }

    // Stopping session
    if (isActive && sessionId) {
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
    // Note: Session creation is now handled automatically in useEffect above
  };

  const resetSession = () => {
    setSessionId(null);
    setIsActive(false);
    setSessionTime(0);
    prevRepRef.current = 0;
    setPoseData(defaultPoseData);
    stopCamera();
    setCameraPermission(null);
  };

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="lg:col-span-3">
      <Card className="bg-white border-[#6B8EFF]/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Camera className="h-5 w-5 text-[#6B8EFF]" />
              <span>Camera Feed</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={isActive ? "default" : "secondary"}>
                {isActive ? "Active" : "Inactive"}
              </Badge>
              {cameraPermission === true && (
                <Badge className="bg-green-100 text-green-700">Connected</Badge>
              )}
              {isActive && poseData.confidence > 0 && (
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  {Math.round(poseData.confidence)}% Confidence
                </Badge>
              )}
            </div>
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
