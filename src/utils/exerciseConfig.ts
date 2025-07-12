import * as poseDetection from "@tensorflow-models/pose-detection";

// Type alias for easier reference
export type NamedKeypoints = Record<string, poseDetection.Keypoint>;

export interface SecondaryCheck {
  /**
   * Returns true if the secondary check fails / is in an invalid state
   */
  invalidCheck: (kps: NamedKeypoints) => boolean;
  /**
   * Message to show when the secondary check fails
   */
  message: string;
}

export interface ExerciseConfig {
  /** List of keypoint names that must be present with sufficient score */
  requiredKeypoints: string[];
  /** List of keypoints to draw connections between */
  keypointConnections: [string, string, string][];
  /** Primary pose check - should return true when the user is in the desired pose */
  primaryCheck: (kps: NamedKeypoints) => boolean;
  /** Optional secondary checks that invalidate the pose if any return true */
  secondaryChecks?: SecondaryCheck[];
  /** Accuracy function to calculate the accuracy of the pose */
  accuracyFunction: (kps: NamedKeypoints) => number;
  /** Instruction text to render above the feedback panel */
  instructions: string;
  /** Feedback messages that can be customised per-exercise */
  messages: {
    /** Prompt shown when the user is not in the pose (step 3 in original logic) */
    initialPrompt: string;
    /** Function to generate the hold prompt each second */
    holdPrompt: (secondsRemaining: number) => string;
    /** Message shown once the rep is successfully completed */
    success: string;
  };
}

// Threshold constants specific to certain exercises
const TILT_THRESHOLD = 20;
const SHOULDER_LEVEL_THRESHOLD = 30;
const ROTATION_RATIO_THRESHOLD = 1.5;
// Threshold for neck flexion (chin toward chest) used in circumduction approximation
const FLEXION_THRESHOLD = 40;

export const exerciseConfigs: Record<string, ExerciseConfig> = {
  // Default head-tilt-right exercise (matches the original implementation)
  head_tilt_right: {
    requiredKeypoints: ["right_ear", "left_ear", "right_shoulder", "left_shoulder"],
    keypointConnections: [
      ["right_ear", "left_ear", "y"],
      ["right_shoulder", "left_shoulder", "y"],
    ],
    primaryCheck: (kps) => kps["right_ear"].y - kps["left_ear"].y > TILT_THRESHOLD,
    secondaryChecks: [
      {
        invalidCheck: (kps) =>
          Math.abs(kps["left_shoulder"].y - kps["right_shoulder"].y) >
          SHOULDER_LEVEL_THRESHOLD,
        message: "⬆️ Keep your shoulders level",
      },
    ],
    accuracyFunction: (kps) => {
      const tilt = Math.abs(kps["right_ear"].y - kps["left_ear"].y);
      const shoulderLevel = Math.abs(kps["left_shoulder"].y - kps["right_shoulder"].y);
      const tiltScore = Math.min(1, (tilt - 20) / 50);
      const shoulderPenalty = Math.min(1, shoulderLevel / 30);
      return Math.max(0, tiltScore * 100 - shoulderPenalty * 50);
    },
    instructions:
      "Tilt your head right (left ear lower than right ear) and hold for 10 seconds. Repeat as many reps as you like.",
    messages: {
      initialPrompt: "⬆️ Move into head tilt right position",
      holdPrompt: (secondsRemaining) =>
        `👉 Hold head tilt right: ${secondsRemaining}s left`,
      success: "✅ Good rep! Head tilt right held for 10s.",
    },
  },
  head_tilt_left: {
    requiredKeypoints: ["left_ear", "right_ear", "left_shoulder", "right_shoulder"],
    keypointConnections: [
      ["left_ear", "right_ear", "y"],
      ["left_shoulder", "right_shoulder", "y"],
    ],
    primaryCheck: (kps) => kps["left_ear"].y - kps["right_ear"].y > TILT_THRESHOLD,
    secondaryChecks: [
      {
        invalidCheck: (kps) =>
          Math.abs(kps["left_shoulder"].y - kps["right_shoulder"].y) >
          SHOULDER_LEVEL_THRESHOLD,
        message: "⬆️ Keep your shoulders level",
      },
    ],
    accuracyFunction: (kps) => {
      const tilt = Math.abs(kps["left_ear"].y - kps["right_ear"].y);
      const shoulderLevel = Math.abs(kps["left_shoulder"].y - kps["right_shoulder"].y);
      const tiltScore = Math.min(1, (tilt - 20) / 50);
      const shoulderPenalty = Math.min(1, shoulderLevel / 30);
      return Math.max(0, tiltScore * 100 - shoulderPenalty * 50);
    },
    instructions:
      "Tilt your head left (right ear lower than left ear) and hold for 10 seconds. Repeat as many reps as you like.",
    messages: {
      initialPrompt: "⬆️ Move into head tilt left position",
      holdPrompt: (secondsRemaining) =>
        `👉 Hold head tilt left: ${secondsRemaining}s left`,
      success: "✅ Good rep! Head tilt left held for 10s.",
    },
  },
  /**
   * Neck rotation to the right (looking towards your right shoulder)
   * Slug suggestion: "neck-rotation-right" → becomes "neck_rotation_right" via toConfigKey()
   */
  neck_rotation_right: {
    requiredKeypoints: [
      "nose",
      "right_ear",
      "left_ear",
      "left_shoulder",
      "right_shoulder",
    ],
    keypointConnections: [
      ["nose", "right_ear", "x"],
      ["left_shoulder", "right_shoulder", "y"],
    ],
    primaryCheck: (kps) => {
      const rightDist = Math.hypot(
        kps["nose"].x - kps["right_ear"].x,
        kps["nose"].y - kps["right_ear"].y
      );
      const leftDist = Math.hypot(
        kps["nose"].x - kps["left_ear"].x,
        kps["nose"].y - kps["left_ear"].y
      );
      return leftDist / rightDist > ROTATION_RATIO_THRESHOLD;
    },
    secondaryChecks: [
      {
        invalidCheck: (kps) =>
          Math.abs(kps["left_shoulder"].y - kps["right_shoulder"].y) >
          SHOULDER_LEVEL_THRESHOLD,
        message: "⬆️ Keep your shoulders level",
      },
    ],
    accuracyFunction: (kps) => {
      const rightDist = Math.hypot(
        kps["nose"].x - kps["right_ear"].x,
        kps["nose"].y - kps["right_ear"].y
      );
      const leftDist = Math.hypot(
        kps["nose"].x - kps["left_ear"].x,
        kps["nose"].y - kps["left_ear"].y
      );
      const ratio = leftDist / rightDist;
      const rotationScore = Math.min(1, (ratio - 1) / (ROTATION_RATIO_THRESHOLD - 1));
      const shoulderLevel = Math.abs(kps["left_shoulder"].y - kps["right_shoulder"].y);
      const shoulderPenalty = Math.min(1, shoulderLevel / SHOULDER_LEVEL_THRESHOLD);
      return Math.max(0, rotationScore * 100 - shoulderPenalty * 50);
    },
    instructions:
      "Rotate your head to the right (look over your right shoulder) and hold for 10 seconds. Repeat as many reps as you like.",
    messages: {
      initialPrompt: "⬆️ Turn your head right",
      holdPrompt: (secondsRemaining) =>
        `👉 Hold head rotation right: ${secondsRemaining}s left`,
      success: "✅ Good rep! Head rotation right held for 10s.",
    },
  },
  /**
   * Neck rotation to the left (looking towards your left shoulder)
   * Slug suggestion: "neck-rotation-left" → becomes "neck_rotation_left" via toConfigKey()
   */
  neck_rotation_left: {
    requiredKeypoints: [
      "nose",
      "right_ear",
      "left_ear",
      "left_shoulder",
      "right_shoulder",
    ],
    keypointConnections: [
      ["nose", "left_ear", "x"],
      ["left_shoulder", "right_shoulder", "y"],
    ],
    primaryCheck: (kps) => {
      const rightDist = Math.hypot(
        kps["nose"].x - kps["right_ear"].x,
        kps["nose"].y - kps["right_ear"].y
      );
      const leftDist = Math.hypot(
        kps["nose"].x - kps["left_ear"].x,
        kps["nose"].y - kps["left_ear"].y
      );
      return rightDist / leftDist > ROTATION_RATIO_THRESHOLD;
    },
    secondaryChecks: [
      {
        invalidCheck: (kps) =>
          Math.abs(kps["left_shoulder"].y - kps["right_shoulder"].y) >
          SHOULDER_LEVEL_THRESHOLD,
        message: "⬆️ Keep your shoulders level",
      },
    ],
    accuracyFunction: (kps) => {
      const rightDist = Math.hypot(
        kps["nose"].x - kps["right_ear"].x,
        kps["nose"].y - kps["right_ear"].y
      );
      const leftDist = Math.hypot(
        kps["nose"].x - kps["left_ear"].x,
        kps["nose"].y - kps["left_ear"].y
      );
      const ratio = rightDist / leftDist;
      const rotationScore = Math.min(1, (ratio - 1) / (ROTATION_RATIO_THRESHOLD - 1));
      const shoulderLevel = Math.abs(kps["left_shoulder"].y - kps["right_shoulder"].y);
      const shoulderPenalty = Math.min(1, shoulderLevel / SHOULDER_LEVEL_THRESHOLD);
      return Math.max(0, rotationScore * 100 - shoulderPenalty * 50);
    },
    instructions:
      "Rotate your head to the left (look over your left shoulder) and hold for 10 seconds. Repeat as many reps as you like.",
    messages: {
      initialPrompt: "⬆️ Turn your head left",
      holdPrompt: (secondsRemaining) =>
        `👉 Hold head rotation left: ${secondsRemaining}s left`,
      success: "✅ Good rep! Head rotation left held for 10s.",
    },
  },
  /**
   * Neck circumduction (full circular motion). For simplicity we approximate by
   * detecting a sustained neck flexion (chin to chest) for 10 s, which forms
   * the lower part of the circular movement.
   * Slug suggestion: "neck-circumduction" → becomes "neck_circumduction".
   */
  neck_circumduction: {
    requiredKeypoints: [
      "nose",
      "left_ear",
      "right_ear",
      "left_shoulder",
      "right_shoulder",
    ],
    keypointConnections: [
      ["nose", "left_ear", "y"],
      ["nose", "right_ear", "y"],
      ["left_shoulder", "right_shoulder", "y"],
    ],
    primaryCheck: (kps) => {
      const avgEarY = (kps["left_ear"].y + kps["right_ear"].y) / 2;
      return kps["nose"].y - avgEarY > FLEXION_THRESHOLD;
    },
    secondaryChecks: [
      {
        invalidCheck: (kps) =>
          Math.abs(kps["left_shoulder"].y - kps["right_shoulder"].y) >
          SHOULDER_LEVEL_THRESHOLD,
        message: "⬆️ Keep your shoulders level",
      },
    ],
    accuracyFunction: (kps) => {
      const avgEarY = (kps["left_ear"].y + kps["right_ear"].y) / 2;
      const flexion = kps["nose"].y - avgEarY; // how far nose is below ears
      const flexionScore = Math.min(1, (flexion - FLEXION_THRESHOLD) / 50);
      const shoulderLevel = Math.abs(kps["left_shoulder"].y - kps["right_shoulder"].y);
      const shoulderPenalty = Math.min(1, shoulderLevel / SHOULDER_LEVEL_THRESHOLD);
      return Math.max(0, flexionScore * 100 - shoulderPenalty * 50);
    },
    instructions:
      "Slowly roll your head in a circle, bringing your chin towards your chest and holding that flexed position for 10 seconds.",
    messages: {
      initialPrompt: "⬆️ Lower your chin towards your chest",
      holdPrompt: (secondsRemaining) =>
        `👉 Hold chin to chest: ${secondsRemaining}s left`,
      success: "✅ Good rep! Chin to chest held for 10s.",
    },
  },
};
