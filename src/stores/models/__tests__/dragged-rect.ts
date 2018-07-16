import { DraggedRect, IDraggedRect } from "../dragged-rect";
import { product, mock } from '../../test-utils';
import { range } from 'lodash';

let a: IDraggedRect
beforeEach(() => {
    a = DraggedRect.create({ startX: 0, startY: 0, endX: 50, endY: 50 });
});

test('start/end/width/height', () => {
    const moves = product(range(-100, 100, 40), range(-100, 100, 40));
    for (const [i, [x, y]] of moves.entries()) {
        (i % 2 === 0 ? a.start : a.end)(x, y);
        const snapshotName = `${x},${y}`;
        expect(a).toMatchSnapshot(snapshotName);
        expect(a).toMatchSnapshot(snapshotName);
        expect(a.x).toMatchSnapshot(snapshotName);
        expect(a.y).toMatchSnapshot(snapshotName);
        expect(a.width).toMatchSnapshot(snapshotName);
        expect(a.height).toMatchSnapshot(snapshotName);
    }
});

test('absoluteCoords', () => {
    expect(a.absoluteCoords).toEqual({ x: 0, y: 0 });
    a.start(10, 10);
    expect(a.absoluteCoords).toEqual({ x: 10, y: 10 });
    let stage = { getAbsolutePosition: (x: any) => x } as any;
    spyOn(stage, 'getAbsolutePosition');
    mock(a, { stage });
    a.absoluteCoords;
    expect(stage.getAbsolutePosition).toHaveBeenCalledWith(10, 10);
    a.start(10, 10);
    a.absoluteCoords;
    expect(stage.getAbsolutePosition).toHaveBeenCalledWith(20, 20);
});

test('hasIntersection', () => {
    const rects = product(
        range(-50, 51, 50),
        range(-50, 51, 50),
        [50],
        [50]
    );

    const boxes = product(
        range(-150, 151, 150),
        range(-150, 151, 150),
        [100],
        [100]
    );

    for (const [a, b, c, d] of rects) {
        const rect = DraggedRect.create({ startX: a, startY: b, endX: c, endY: d });
        for (const [x, y, width, height] of boxes) {
            expect(rect.hasIntersection({ x, y, width, height } as any)).toMatchSnapshot()
        }
    }

});