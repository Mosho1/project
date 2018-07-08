import { DraggedArrow, IDraggedArrow } from "../dragged-arrow";

let a: IDraggedArrow
beforeEach(() => {
    a = DraggedArrow.create({ startX: 0, startY: 0, endX: 50, endY: 50 });
});

test('points', () => {
    expect(a.points).toMatchSnapshot();
});

test('start', () => {
    expect(a.start(1, 2)).toMatchSnapshot();
    expect(a.start(3, 4)).toMatchSnapshot();
});

test('end', () => {
    expect(a.end(1, 2)).toMatchSnapshot();
    expect(a.end(3, 4)).toMatchSnapshot();
});
