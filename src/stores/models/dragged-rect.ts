import { types, hasParent, getParent } from 'mobx-state-tree';
import { IBox } from './box';
import { IStore, IStage } from '../domain-state';

export const DraggedRect = types.model('DraggedRect', {
    startX: types.number,
    startY: types.number,
    endX: types.number,
    endY: types.number,
}).views(self => ({
    get store(): null | IStore {
        if (!hasParent(self, 1)) return null;
        return getParent(self, 1);
    },
    get width() {
        return self.endX - self.startX;
    },
    get height() {
        return self.endY - self.startY;
    },
})).views(self => ({
    get stage(): null | IStage {
        if (!self.store) return null;
        return self.store.stage;
    }
})).views(self => ({
    get absoluteCoords(): { x: number, y: number } {
        if (!self.stage) return { x: self.startX, y: self.startY };
        return self.stage.getAbsolutePosition(
            self.startX,
            self.startY
        );
    }
})).views(self => ({
    get x() {
        return self.width > 0 ? self.absoluteCoords.x : self.absoluteCoords.x + self.width;
    },
    get y() {
        return self.height > 0 ? self.absoluteCoords.y : self.absoluteCoords.y + self.height;
    },
})).views(self => ({
    hasIntersection({ x, y, width, height }: IBox) {
        return !(self.x > x + width ||
            self.x + Math.abs(self.width) < x ||
            self.y > y + height ||
            self.y + Math.abs(self.height) < y);
    }
})).actions(self => {
    const start = (x: number, y: number) => {
        self.startX += x;
        self.startY += y;
        return self;
    };

    const end = (x: number, y: number) => {
        self.endX += x;
        self.endY += y;
        return self;
    };

    return {
        start, end
    };
});

type IDraggedRectType = typeof DraggedRect.Type;
export interface IDraggedRect extends IDraggedRectType { };