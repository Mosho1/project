import { v4 } from "node-uuid"

export const calculateBezierPoints = (startX: number, startY: number, endX: number, endY: number) => {
    const dist = endX - startX;
    const distAbs = Math.abs(dist);
    const minDist = Math.max(100, distAbs);
    return [
        startX,
        startY,
        startX + minDist / 2,
        startY,
        dist >= minDist ? startX + minDist / 2 : endX - minDist / 2,
        endY,
        endX,
        endY,
    ]
};

export function randomUuid() {
    return v4()
}
