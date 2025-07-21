import { NamedKeypoints, ExerciseConfig, exerciseConfigs } from "./exerciseConfig";

// Configurable constants
export interface DetectionConfig {
    scoreThreshold: number;
    consecutiveFramesRequired: number;
    switchCooldownMs: number;
    minActivationConfidence: number;
    switchingThreshold: number;
}

// Default configuration - made more aggressive for better detection
let detectionConfig: DetectionConfig = {
    scoreThreshold: 0.3,
    consecutiveFramesRequired: 1, // Reduced from 3 to 1 for faster switching
    switchCooldownMs: 1000, // Reduced from 2000 to 1000ms
    minActivationConfidence: 0.5, // Reduced from 0.6 to 0.5
    switchingThreshold: 0.6, // Reduced from 0.75 to 0.6 for easier switching
};

// Export function to update configuration
export function updateDetectionConfig(newConfig: Partial<DetectionConfig>): void {
    detectionConfig = { ...detectionConfig, ...newConfig };
}

// Export function to get current configuration
export function getDetectionConfig(): DetectionConfig {
    return { ...detectionConfig };
}

export interface KeypointMetrics {
    // Distance calculations
    noseToRightEarDistance: number;
    noseToLeftEarDistance: number;

    // Angle/Position calculations  
    earYDifference: number; // right_ear.y - left_ear.y
    shoulderYDifference: number; // right_shoulder.y - left_shoulder.y
    noseToAvgEarY: number; // nose.y - (left_ear.y + right_ear.y) / 2

    // Ratios
    noseEarDistanceRatio: number; // leftDist / rightDist

    // Confidence scores for required keypoints
    keypointConfidences: Record<string, number>;
    availableKeypoints: Set<string>;
}

export interface ExerciseDetectionResult {
    exerciseKey: string;
    confidence: number;
    isPassing: boolean; // passes primaryCheck and secondaryChecks
    accuracy: number;
    feedback: string;
    config: ExerciseConfig;
}

export interface ExerciseSessionState {
    currentExercise: string | null;
    isLocked: boolean; // true when holding a pose
    lockStartTime: Date | null;
    consecutiveFrames: number; // frames where new exercise has higher confidence
    lastSwitchTime: number; // timestamp of last switch

    // Confidence history for smoothing (last 5 frames)
    confidenceHistory: Record<string, number[]>;
}

export function calculateKeypointMetrics(kps: NamedKeypoints): KeypointMetrics {
    // Initialize with safe defaults
    const metrics: KeypointMetrics = {
        noseToRightEarDistance: 0,
        noseToLeftEarDistance: 0,
        earYDifference: 0,
        shoulderYDifference: 0,
        noseToAvgEarY: 0,
        noseEarDistanceRatio: 1,
        keypointConfidences: {},
        availableKeypoints: new Set(),
    };

    // Collect keypoint confidences and available keypoints
    Object.entries(kps).forEach(([name, keypoint]) => {
        if (keypoint && keypoint.score !== undefined) {
            metrics.keypointConfidences[name] = keypoint.score;
            if (keypoint.score > detectionConfig.scoreThreshold) {
                metrics.availableKeypoints.add(name);
            }
        }
    });

    // Calculate distances if keypoints are available
    if (kps.nose && kps.right_ear && kps.left_ear) {
        metrics.noseToRightEarDistance = Math.hypot(
            kps.nose.x - kps.right_ear.x,
            kps.nose.y - kps.right_ear.y
        );

        metrics.noseToLeftEarDistance = Math.hypot(
            kps.nose.x - kps.left_ear.x,
            kps.nose.y - kps.left_ear.y
        );

        // Avoid division by zero
        if (metrics.noseToRightEarDistance > 0) {
            metrics.noseEarDistanceRatio = metrics.noseToLeftEarDistance / metrics.noseToRightEarDistance;
        }
    }

    // Calculate position differences
    if (kps.right_ear && kps.left_ear) {
        metrics.earYDifference = kps.right_ear.y - kps.left_ear.y;

        if (kps.nose) {
            const avgEarY = (kps.left_ear.y + kps.right_ear.y) / 2;
            metrics.noseToAvgEarY = kps.nose.y - avgEarY;
        }
    }

    if (kps.right_shoulder && kps.left_shoulder) {
        metrics.shoulderYDifference = Math.abs(kps.left_shoulder.y - kps.right_shoulder.y);
    }

    return metrics;
}

export function calculateExerciseConfidence(
    exerciseKey: string,
    metrics: KeypointMetrics
): number {
    const config = exerciseConfigs[exerciseKey];
    if (!config) return 0;

    // Check if required keypoints are available with sufficient confidence
    const keypointScore = config.requiredKeypoints.reduce((score, kpName) => {
        const confidence = metrics.keypointConfidences[kpName] || 0;
        return score + (confidence > detectionConfig.scoreThreshold ? confidence : 0);
    }, 0) / config.requiredKeypoints.length;

    if (keypointScore < detectionConfig.scoreThreshold) return 0;

    // Calculate pose-specific confidence based on how well the pose matches
    let poseConfidence = 0;

    switch (exerciseKey) {
        case 'head_tilt_right':
            // Higher confidence when right ear is significantly lower than left ear
            poseConfidence = Math.max(0, Math.min(1, (metrics.earYDifference - 10) / 30));
            break;

        case 'head_tilt_left':
            // Higher confidence when left ear is significantly lower than right ear  
            poseConfidence = Math.max(0, Math.min(1, (-metrics.earYDifference - 10) / 30));
            break;

        case 'neck_rotation_right':
            // Higher confidence when looking right (left distance > right distance)
            poseConfidence = Math.max(0, Math.min(1, (metrics.noseEarDistanceRatio - 1) / 1));
            break;

        case 'neck_rotation_left':
            // Higher confidence when looking left (right distance > left distance)
            const inverseRatio = 1 / Math.max(0.1, metrics.noseEarDistanceRatio);
            poseConfidence = Math.max(0, Math.min(1, (inverseRatio - 1) / 1));
            break;

        case 'neck_circumduction':
            // Higher confidence when nose is below ears (chin to chest)
            poseConfidence = Math.max(0, Math.min(1, (metrics.noseToAvgEarY - 20) / 40));
            break;

        default:
            poseConfidence = 0;
    }

    // Penalize if shoulders are not level (common secondary check)
    const shoulderPenalty = Math.min(0.3, metrics.shoulderYDifference / 100);

    // Combine scores: 70% pose confidence + 30% keypoint confidence - shoulder penalty
    return Math.max(0, poseConfidence * 0.7 + keypointScore * 0.3 - shoulderPenalty);
}

export class ExerciseDetectionEngine {
    private state: ExerciseSessionState;

    constructor(initialExercise?: string) {
        this.state = {
            currentExercise: initialExercise || null,
            isLocked: false,
            lockStartTime: null,
            consecutiveFrames: 0,
            lastSwitchTime: 0,
            confidenceHistory: {},
        };
    }

    public getState(): ExerciseSessionState {
        return { ...this.state };
    }

    public detectAllExercises(keypoints: NamedKeypoints): ExerciseDetectionResult[] {
        const metrics = calculateKeypointMetrics(keypoints);
        const exerciseKeys = Object.keys(exerciseConfigs);

        const results: ExerciseDetectionResult[] = exerciseKeys
            .map(exerciseKey => {
                const config = exerciseConfigs[exerciseKey];
                const confidence = calculateExerciseConfidence(exerciseKey, metrics);

                // Check if exercise requirements are met
                const requiredPresent = config.requiredKeypoints.every(
                    name => metrics.availableKeypoints.has(name)
                );

                const isPassing = requiredPresent &&
                    config.primaryCheck(keypoints) &&
                    !config.secondaryChecks?.some(sc => sc.invalidCheck(keypoints));

                let feedback = config.messages.initialPrompt;
                if (isPassing) {
                    feedback = config.messages.holdPrompt(10); // Default to 10 seconds
                } else if (!requiredPresent) {
                    feedback = "Position yourself in front of the camera";
                } else {
                    const failingSecondary = config.secondaryChecks?.find(sc => sc.invalidCheck(keypoints));
                    if (failingSecondary) {
                        feedback = failingSecondary.message;
                    }
                }

                return {
                    exerciseKey,
                    confidence,
                    isPassing,
                    accuracy: config.accuracyFunction(keypoints),
                    feedback,
                    config,
                };
            })
            .sort((a, b) => b.confidence - a.confidence); // Highest confidence first

        return results;
    }

    public getBestMatch(results: ExerciseDetectionResult[]): ExerciseDetectionResult | null {
        // Filter to only exercises with sufficient confidence
        const viableExercises = results.filter(r => r.confidence > detectionConfig.minActivationConfidence);

        if (viableExercises.length === 0) return null;

        return viableExercises[0]; // Already sorted by confidence
    }

    public shouldSwitchExercise(
        newResult: ExerciseDetectionResult | null,
        isHoldingPose: boolean = false
    ): boolean {
        const now = Date.now();

        // Never switch if currently holding a pose
        if (isHoldingPose || this.state.isLocked) {
            return false;
        }

        // Respect cooldown period
        if (now - this.state.lastSwitchTime < detectionConfig.switchCooldownMs) {
            return false;
        }

        // No viable exercise detected
        if (!newResult) {
            return false;
        }

        // No current exercise - switch to the best match
        if (!this.state.currentExercise) {
            return true;
        }

        // Same exercise - no switch needed
        if (newResult.exerciseKey === this.state.currentExercise) {
            this.state.consecutiveFrames = 0; // Reset counter
            return false;
        }

        // Different exercise - check if confidence is high enough and consistent
        if (newResult.confidence > detectionConfig.switchingThreshold) {
            this.state.consecutiveFrames++;

            if (this.state.consecutiveFrames >= detectionConfig.consecutiveFramesRequired) {
                return true;
            }
        } else {
            this.state.consecutiveFrames = 0; // Reset if confidence drops
        }

        return false;
    }

    public updateState(
        newExercise: string | null,
        switched: boolean,
        isHoldingPose: boolean
    ): void {
        if (switched && newExercise) {
            this.state.currentExercise = newExercise;
            this.state.lastSwitchTime = Date.now();
            this.state.consecutiveFrames = 0;
        }

        this.state.isLocked = isHoldingPose;
        if (isHoldingPose && !this.state.lockStartTime) {
            this.state.lockStartTime = new Date();
        } else if (!isHoldingPose) {
            this.state.lockStartTime = null;
        }
    }

    public forceExercise(exerciseKey: string): void {
        this.state.currentExercise = exerciseKey;
        this.state.lastSwitchTime = Date.now();
        this.state.consecutiveFrames = 0;
        this.state.isLocked = false;
        this.state.lockStartTime = null;
    }
} 