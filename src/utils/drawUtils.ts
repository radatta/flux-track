import { Keypoint } from "@tensorflow-models/pose-detection";
import { ReferenceKeypoint } from "./exerciseConfig";

export function drawKeypointsWithCoords(
  ctx: CanvasRenderingContext2D,
  keypoints: Keypoint[],
  scaleX: number,
  scaleY: number,
  SCORE_THRESHOLD: number
) {
  ctx.font = "16px monospace";
  ctx.textBaseline = "top";
  keypoints.forEach((kp: Keypoint) => {
    if (kp.score && kp.score > SCORE_THRESHOLD) {
      // Draw circle
      const x = kp.x * scaleX;
      const y = kp.y * scaleY;
      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fill();

      // Draw coordinates
      ctx.font = "16px monospace";
      ctx.textBaseline = "top";

      if (kp.name && kp.name.startsWith("right_")) {
        ctx.textAlign = "right";
        ctx.fillStyle = "red";
        ctx.fillText(`${kp.name} (${x.toFixed(0)}, ${y.toFixed(0)})`, x + 8, y + 8);
      } else if (kp.name && kp.name.startsWith("left_")) {
        ctx.textAlign = "left";
        ctx.fillStyle = "red";
        ctx.fillText(
          `${kp.name} (${x.toFixed(0)}, ${y.toFixed(0)})`,
          x - 8, // 10px from left edge
          y - 8
        );
      } else {
        ctx.textAlign = "left";
        ctx.fillStyle = "red";
        ctx.fillText(`${kp.name} (${x.toFixed(0)}, ${y.toFixed(0)})`, x + 8, y - 8);
      }
    }
  });
}

export function drawKeypointConnections(
  ctx: CanvasRenderingContext2D,
  keypoints: Keypoint[],
  scaleX: number,
  scaleY: number,
  KEYPOINT_CONNECTIONS: [string, string, string][],
  SCORE_THRESHOLD: number
) {
  // Draw lines for connections
  ctx.font = "16px monospace";
  ctx.textBaseline = "top";

  ctx.strokeStyle = "blue";
  ctx.lineWidth = 3;
  KEYPOINT_CONNECTIONS.forEach(([a, b, axis]) => {
    const kpA = keypoints.find((kp) => kp.name === a);
    const kpB = keypoints.find((kp) => kp.name === b);
    if (
      kpA &&
      kpB &&
      kpA.score &&
      kpB.score &&
      kpA.score > SCORE_THRESHOLD &&
      kpB.score > SCORE_THRESHOLD
    ) {
      ctx.beginPath();
      ctx.moveTo(kpA.x * scaleX, kpA.y * scaleY);
      ctx.lineTo(kpB.x * scaleX, kpB.y * scaleY);
      ctx.stroke();

      // Annotate the distance between the specified axis if axis is not empty
      if (!axis || axis === "") return;

      let dist = 0;
      if (axis === "x") {
        dist = kpA.x - kpB.x;
      } else if (axis === "y") {
        dist = kpA.y - kpB.y;
      }
      // Draw the distance annotation at the midpoint
      const midX = ((kpA.x + kpB.x) / 2) * scaleX;
      const midY = ((kpA.y + kpB.y) / 2) * scaleY;
      ctx.save();
      ctx.font = "bold 18px monospace";
      ctx.fillStyle = "red";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(`${axis}: ${dist.toFixed(0)}`, midX, midY - 10);
      ctx.restore();
    }
  });
}

/**
 * Draws a strong visual guide for the secondary check: keeping shoulders level.
 * Only shows when shoulders are NOT level (needs adjustment).
 */
export function drawReferenceOverlay(
  ctx: CanvasRenderingContext2D,
  _referenceKeypoints: ReferenceKeypoint[],
  _referenceConnections: [string, string][],
  userKeypoints: Keypoint[],
  scaleX: number,
  scaleY: number,
  _opacity?: number,
  scoreThreshold: number = 0.3
): void {
  // Get user's shoulder keypoints
  const getKp = (name: string) =>
    userKeypoints.find(
      (kp) => kp.name === name && kp.score && kp.score > scoreThreshold
    );

  const userLeftShoulder = getKp("left_shoulder");
  const userRightShoulder = getKp("right_shoulder");

  if (!userLeftShoulder || !userRightShoulder) return;

  // Check if shoulders are unlevel (needs adjustment)
  // Threshold matches SHOULDER_LEVEL_THRESHOLD in exerciseConfig.ts
  const shoulderYDiff = Math.abs(userLeftShoulder.y - userRightShoulder.y);
  const SHOULDER_LEVEL_THRESHOLD = 30;

  // Only show the guide if shoulders need adjustment
  if (shoulderYDiff <= SHOULDER_LEVEL_THRESHOLD) return;

  // Calculate the level shoulder position (midpoint Y)
  const shoulderMidY = (userLeftShoulder.y + userRightShoulder.y) / 2;
  const leftX = userLeftShoulder.x * scaleX;
  const rightX = userRightShoulder.x * scaleX;
  const levelY = shoulderMidY * scaleY;

  // Extend the line beyond shoulders for visibility
  const padding = 40;

  ctx.save();

  // Draw the "KEEP LEVEL" reference line - BOLD and BRIGHT
  ctx.strokeStyle = "#00E5CC"; // Bright teal
  ctx.lineWidth = 5;
  ctx.setLineDash([15, 8]);

  ctx.beginPath();
  ctx.moveTo(leftX - padding, levelY);
  ctx.lineTo(rightX + padding, levelY);
  ctx.stroke();

  // Draw endpoint markers (circles at each end)
  ctx.setLineDash([]);
  ctx.fillStyle = "#00E5CC";

  ctx.beginPath();
  ctx.arc(leftX - padding, levelY, 8, 0, 2 * Math.PI);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(rightX + padding, levelY, 8, 0, 2 * Math.PI);
  ctx.fill();

  // Add a label
  ctx.font = "bold 16px sans-serif";
  ctx.fillStyle = "#00E5CC";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText("KEEP SHOULDERS LEVEL", (leftX + rightX) / 2, levelY - 15);

  ctx.restore();
}
