import { Keypoint } from "@tensorflow-models/pose-detection";

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
                ctx.fillText(
                    `${kp.name} (${x.toFixed(0)}, ${y.toFixed(0)})`,
                    x + 8,
                    y + 8
                );
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
                ctx.fillText(
                    `${kp.name} (${x.toFixed(0)}, ${y.toFixed(0)})`,
                    x + 8,
                    y - 8
                );
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