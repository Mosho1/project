// import { getSnapshot, applyAction } from "mobx-state-tree"
import { Store, IStore } from '../domain-state';
import { product, mock } from '../test-utils';
import { socketTypes } from '../models/socket';
import { createTestCodeBlock } from '../models/__tests__/code-block';
import { createTestBox } from '../models/__tests__/box';
import { ICodeBlock } from '../models/code-block';

let store: IStore;
beforeEach(() => {
    store = Store.create();
});

test('addBox', () => {
    const cb = createTestCodeBlock();
    const box = store.addBox('test', 0, 0, cb);
    expect(store.boxes.get(box._id)).toBe(box);
});

test('setSelection', () => {
    expect(store.setSelection(null).selection).toBeNull();
    const box = createTestBox();
    expect(store.setSelection(box).selection).toBe(box);
});

test('createBox', () => {
    const cb = createTestCodeBlock();
    const b = store.createBox('test', 0, 0, cb);
    expect(store.selection).toBe(b);
});

test('deleteBox', () => {
    const cb = createTestCodeBlock({
        execOutputs: [''],
        execInputs: [''],
        returns: 'number'
    });
    const b1 = store.addBox('test', 0, 0, cb);
    const b2 = store.addBox('test2', 50, 50, cb);
    expect(store.boxes).toHaveProperty('size', 2);
    store.addArrow(b1.outputs[0], b2.inputs[0]);
    store.addArrow(b1.execInputs[0], b2.execOutputs[0]);
    expect(store.arrows).toHaveProperty('size', 2);
    store.setSelection(b1);
    store.deleteBox(b1);
    expect(store.selection).toBeNull();
    expect(store.arrows).toHaveProperty('size', 0);
    expect(store.boxes).toHaveProperty('size', 1);
    store.deleteBox(b2);
    expect(store.boxes).toHaveProperty('size', 0);
});

test('addArrow', () => {
    const tests = product(socketTypes, socketTypes);

    for (const test of tests) {
        const [t1, t2] = test;
        const box = createTestBox();
        const s1 = box.addSocket(t1);
        const s2 = box.addSocket(t2);
        expect(store.addArrow(s1, s2) !== null).toMatchSnapshot(test.join(','));
    }
});

test('hasArrow', () => {
    const tests = product(socketTypes, socketTypes);

    for (const test of tests) {
        const [t1, t2] = test;
        const box = createTestBox();
        const s1 = box.addSocket(t1);
        const s2 = box.addSocket(t2);
        store.addArrow(s1, s2);
        expect(store.hasArrow(s1, s2)).toMatchSnapshot(test.join(','));
    }
});

test('startDragArrow', () => {
    const box = createTestBox({ x: 10, y: 10 });
    const socket = box.addSocket('input');
    store.startDragArrow(socket);
    expect(store.draggedArrow).toMatchObject({
        startX: socket.x,
        startY: socket.y,
        endX: socket.x,
        endY: socket.y,
    });
    expect(store.draggedFromSocket).toBe(socket);
});

test('moveDragArrow', () => {
    const draggedArrow = { start: () => null, end: () => null };
    const draggedFromSocket = { isInput: false };
    spyOn(draggedArrow, 'start');
    spyOn(draggedArrow, 'end');
    mock(store, { draggedArrow, draggedFromSocket });
    store.moveDragArrow(1, 2);
    draggedFromSocket.isInput = true;
    store.moveDragArrow(3, 4);
    expect(draggedArrow.end).toHaveBeenCalledWith(1, 2);
    expect(draggedArrow.start).toHaveBeenCalledWith(3, 4);
});

test('endDragArrow', () => {
    const cb = createTestCodeBlock();
    const b1 = store.addBox('test', 0, 0, cb);
    const s1 = b1.addSocket('input');

    const b2 = store.addBox('test', 0, 0, cb);
    const s2 = b2.addSocket('output');

    mock(store, { draggedArrow: {}, draggedFromSocket: s1 });
    store.endDragArrow(s2);

    expect(store.hasArrow(s1, s2)).toBe(true);
    expect(store.draggedArrow).toBeNull();
});

test('runCode', () => {
    const obj = {run: () => null};
    spyOn(obj, 'run');
    store = Store.create({}, obj);
    store.runCode();
    expect(obj.run).toHaveBeenCalledWith(store.boxes);
});

test('sortedCodeBlocks', () => {
    let codeBlocks: {[index: string]: ICodeBlock} = {};
    for (const name of ['zzz','ac','asef','ba','esv','cef','cef','ce3','dd','d']) {
        codeBlocks[name] = createTestCodeBlock({
            id: name,
            name
        });
    }
    store = Store.create({codeBlocks})
    expect(store.sortedCodeBlocks).toMatchSnapshot();
});