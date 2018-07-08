import { types } from 'mobx-state-tree';
import { calculateBezierPoints } from '../utils/utils';

export const DraggedArrow = types.model('DraggedArrow', {
    startX: types.number,
    startY: types.number,
    endX: types.number,
    endY: types.number,
}).views(self => {
    return {
        get points() {
            return calculateBezierPoints(
                self.startX,
                self.startY,
                self.endX,
                self.endY,
            );
        }
    };
}).actions(self => {
    const start = (x: number, y: number) => {
        self.startX = x;
        self.startY = y;
        return self;
    };

    const end = (x: number, y: number) => {
        self.endX = x;
        self.endY = y;
        return self;
    };

    return {
        start, end
    };
});

type IDraggedArrowType = typeof DraggedArrow.Type;
export interface IDraggedArrow extends IDraggedArrowType {};