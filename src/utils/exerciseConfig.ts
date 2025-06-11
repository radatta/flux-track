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
    /** Primary pose check – should return true when the user is in the desired pose */
    primaryCheck: (kps: NamedKeypoints) => boolean;
    /** Optional secondary checks that invalidate the pose if any return true */
    secondaryChecks?: SecondaryCheck[];
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

export const exerciseConfigs: Record<string, ExerciseConfig> = {
    // Default head-tilt-right exercise (matches the original implementation)
    head_tilt_right: {
        requiredKeypoints: [
            "right_ear",
            "left_ear",
            "right_shoulder",
            "left_shoulder",
        ],
        keypointConnections: [
            ["right_ear", "left_ear", "y"],
            ["right_shoulder", "left_shoulder", "y"],
        ],
        primaryCheck: (kps) =>
            (kps["right_ear"].y - kps["left_ear"].y) > TILT_THRESHOLD,
        secondaryChecks: [
            {
                invalidCheck: (kps) =>
                    Math.abs(kps["left_shoulder"].y - kps["right_shoulder"].y) >
                    SHOULDER_LEVEL_THRESHOLD,
                message: "⬆️ Keep your shoulders level",
            },
        ],
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
        requiredKeypoints: [
            "left_ear",
            "right_ear",
            "left_shoulder",
            "right_shoulder",
        ],
        keypointConnections: [
            ["left_ear", "right_ear", "y"],
            ["left_shoulder", "right_shoulder", "y"],
        ],
        primaryCheck: (kps) =>
            (kps["left_ear"].y - kps["right_ear"].y) > TILT_THRESHOLD,
        secondaryChecks: [
            {
                invalidCheck: (kps) =>
                    Math.abs(kps["left_shoulder"].y - kps["right_shoulder"].y) >
                    SHOULDER_LEVEL_THRESHOLD,
                message: "⬆️ Keep your shoulders level",
            },
        ],
        instructions:
            "Tilt your head left (right ear lower than left ear) and hold for 10 seconds. Repeat as many reps as you like.",
        messages: {
            initialPrompt: "⬆️ Move into head tilt left position",
            holdPrompt: (secondsRemaining) =>
                `👉 Hold head tilt left: ${secondsRemaining}s left`,
            success: "✅ Good rep! Head tilt left held for 10s.",
        },
    },
}; 