import { Box } from '../box';
import { mock, product } from '../../test-utils';

test('height', () => {
    const lengths = [0, 1, 2];
    const tests = product(lengths, lengths, lengths, lengths);
    for (const test of tests) {
        expect(mock(Box.create(), {
            inputs: Array(test[0]),
            outputs: Array(test[1]),
            execInputs: Array(test[2]),
            execOutputs: Array(test[3]),
        }).height).toMatchSnapshot(test.join(','));
    }
});

test('isSelected', () => {
    expect(mock(Box.create(), {}).isSelected).toBe(false);
    expect(mock(Box.create(), { store: { selection: null } }).isSelected).toBe(false);
    const box = Box.create();
    expect(mock(box, { store: { selection: box } }).isSelected).toBe(true);
});

test('inputs', () => {
    expect(Box.create().inputs.length).toBe(0);
    expect(mock(Box.create(), { sockets: [{ socketType: 'input' }] }).inputs.length).toBe(1);
});

test('outputs', () => {
    expect(Box.create().outputs.length).toBe(0);
    expect(mock(Box.create(), { sockets: [{ socketType: 'output' }] }).outputs.length).toBe(1);
});

test('execInputs', () => {
    expect(Box.create().execInputs.length).toBe(0);
    expect(mock(Box.create(), { sockets: [{ socketType: 'execInput' }] }).execInputs.length).toBe(1);
});

test('execOutputs', () => {
    expect(Box.create().execOutputs.length).toBe(0);
    expect(mock(Box.create(), { sockets: [{ socketType: 'execOutput' }] }).execOutputs.length).toBe(1);
});

test('move', () => {
    const box = Box.create({ _id: 'test' });
    expect(box.move(1, 2)).toMatchSnapshot();
    expect(box.move(1, 2)).toMatchSnapshot();
});

test('addSocket', () => {
    const box = Box.create();
    expect(box.sockets).toHaveProperty('length', 0);
    box.addSocket('execInput')
    expect(box.sockets).toHaveProperty('length', 1);
    box.addSocket('input')
    expect(box.sockets).toHaveProperty('length', 2);
    expect(box.inputs).toHaveProperty('length', 1);
    expect(box.outputs).toHaveProperty('length', 0);
    expect(box.execInputs).toHaveProperty('length', 1);
    expect(box.execOutputs).toHaveProperty('length', 0);
});