import { Box } from '../box';
import { mock, product } from '../../test-utils';
import { CodeBlock } from '../code-block';
import { createTestSocket } from './socket';

export const createTestBox = (args?: any) => {
    return Box.create({
        _id: 'boxId',
        code: CodeBlock.create({
            id: 'cbId',
            name: 'test',
            code: () => null
        }),
        ...args
    });
};

test('height', () => {
    const lengths = [0, 1, 2];
    const tests = product(lengths, lengths, lengths, lengths);
    for (const test of tests) {
        expect(mock(createTestBox(), {
            inputs: Array(test[0]),
            outputs: Array(test[1]),
            execInputs: Array(test[2]),
            execOutputs: Array(test[3]),
        }).height).toMatchSnapshot(test.join(','));
    }
});

test('isSelected', () => {
    // expect(mock(createTestBox(), {}).isSelected).toBe(false);
    // expect(mock(createTestBox(), { store: { selection: null } }).isSelected).toBe(false);
    // const box = createTestBox();
    // expect(mock(box, { store: { selection: box } }).isSelected).toBe(true);
});

test('inputs', () => {
    expect(createTestBox().inputs.length).toBe(0);
    expect(mock(createTestBox(), { sockets: [{ socketType: 'input' }] }).inputs.length).toBe(1);
});

test('outputs', () => {
    expect(createTestBox().outputs.length).toBe(0);
    expect(mock(createTestBox(), { sockets: [{ socketType: 'output' }] }).outputs.length).toBe(1);
});

test('execInputs', () => {
    expect(createTestBox().execInputs.length).toBe(0);
    expect(mock(createTestBox(), { sockets: [{ socketType: 'execInput' }] }).execInputs.length).toBe(1);
});

test('execOutputs', () => {
    expect(createTestBox().execOutputs.length).toBe(0);
    expect(mock(createTestBox(), { sockets: [{ socketType: 'execOutput' }] }).execOutputs.length).toBe(1);
});

test('move', () => {
    const box = createTestBox({ _id: 'test' });
    expect(box.move(1, 2)).toMatchSnapshot();
    expect(box.move(1, 2)).toMatchSnapshot();
});

test('addSocket', () => {
    const box = createTestBox();
    expect(box.sockets).toHaveProperty('length', 0);
    box.addSocket(createTestSocket({socketType: 'execInput'}));
    expect(box.sockets).toHaveProperty('length', 1);
    box.addSocket(createTestSocket({socketType: 'input'}));
    expect(box.sockets).toHaveProperty('length', 2);
    expect(box.inputs).toHaveProperty('length', 1);
    expect(box.outputs).toHaveProperty('length', 0);
    expect(box.execInputs).toHaveProperty('length', 1);
    expect(box.execOutputs).toHaveProperty('length', 0);
});