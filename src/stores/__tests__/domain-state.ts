// import { getSnapshot, applyAction } from "mobx-state-tree"
import { Store, IStore } from '../domain-state';
import { product } from '../test-utils';
import { models } from '../models';
import { socketTypes } from '../models/socket';

let store: IStore;
beforeEach(() => {
    store = Store.create();
});

test('addBox', () => {
    const box = store.addBox('test', 0, 0);
    expect(store.boxes.get(box._id)).toBe(box);
});

test('setSelection', () => {
    expect(store.setSelection(null).selection).toBeNull();
    const box = models.Box.create();
    expect(store.setSelection(box).selection).toBe(box);
});

test('deleteBox', () => {
    const b1 = store.addBox('test', 0, 0);
    const b2 = store.addBox('test2', 50, 50);
    expect(store.boxes).toHaveProperty('size', 2);
    store.addArrow(b1.outputs[0], b2.inputs[0]);
    store.addArrow(b1.execInputs[0], b2.execOutputs[0]);
    expect(store.arrows).toHaveProperty('size', 2);
    store.deleteBox(b1);
    expect(store.arrows).toHaveProperty('size', 0);
    expect(store.boxes).toHaveProperty('size', 1);
    store.deleteBox(b2);
    expect(store.boxes).toHaveProperty('size', 0);
});

test('addArrow', () => {
    const tests = product(socketTypes, socketTypes);

    for (const test of tests) {
        const [t1, t2] = test;
        const box = models.Box.create();
        const s1 = box.addSocket(t1);
        const s2 = box.addSocket(t2);
        expect(store.addArrow(s1, s2) !== null).toMatchSnapshot(test.join(','));
    }
});
