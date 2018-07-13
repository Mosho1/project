import { types } from 'mobx-state-tree';

export const DraggedRect = types.model('DraggedRect', {
    startX: types.number,
    startY: types.number,
    endX: types.number,
    endY: types.number,
}).views(_self => {
    return {};
}).actions(self => {
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
export interface IDraggedRect extends IDraggedRectType {};