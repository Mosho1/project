import { v4 } from "node-uuid"
import { types } from 'mobx-state-tree';

/* istanbul ignore next */
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

/* istanbul ignore next */
export function randomUuid() {
    return v4()
}

export const optionalIdentifierType = types.optional<string, string>(types.identifier(), randomUuid) as any as string;