import * as v4 from "uuid/v4"
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

export function values<T>(map: { values(): IterableIterator<T> }) {
    return [...map.values()] as T[];
}

export const filterBy = <T>(arr: T[], filter: string, map: (x: T) => string) => {
    return arr.filter(x => {
        const v = map(x);
        return v.toLowerCase().includes(filter.toLowerCase());
    });
};

export const noop = () => { };
export const identity = <T>(x: T) => x;