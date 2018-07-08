import { Socket, SocketTypeEnum, socketTypes, areSocketsCompatible } from '../socket';
import { mock, product } from '../../test-utils';
import { ObservableMap } from 'mobx';

test('box', () => {
    expect(Socket.create({ socketType: 'input' }).box).toBeNull();
});

test('isExec', () => {
    expect(Socket.create({ socketType: 'input' }).isExec).toBe(false);
    expect(Socket.create({ socketType: 'output' }).isExec).toBe(false);
    expect(Socket.create({ socketType: 'execInput' }).isExec).toBe(true);
    expect(Socket.create({ socketType: 'execOutput' }).isExec).toBe(true);
});

test('isInput', () => {
    expect(Socket.create({ socketType: 'input' }).isInput).toBe(true);
    expect(Socket.create({ socketType: 'output' }).isInput).toBe(false);
    expect(Socket.create({ socketType: 'execInput' }).isInput).toBe(true);
    expect(Socket.create({ socketType: 'execOutput' }).isInput).toBe(false);
});

describe('index', () => {
    let box: { inputs: any[], outputs: any[], execInputs: any[], execOutputs: any[] };
    beforeEach(() => {
        box = {
            inputs: [],
            outputs: [],
            execInputs: [],
            execOutputs: [],
        };
    });


    const lengths = [0, 1];
    const tests = product(socketTypes, lengths, lengths, lengths, lengths);

    test('no box', () => {
        const socket = Socket.create({ socketType: 'input' });
        expect(socket.index).toBe(0);
    });

    test('tests', () => {
        for (const test of tests) {
            const socket = Socket.create({ socketType: test[0] });
            box.inputs = Array(test[1]);
            box.outputs = Array(test[2]);
            box.execInputs = Array(test[3]);
            box.execOutputs = Array(test[4]);
            expect(mock(socket, { box }).index).toMatchSnapshot(test.join(','));
        }
    });
});

describe('arrows', () => {
    let box: { store: { arrows: ObservableMap } };
    beforeEach(() => {
        box = {
            store: { arrows: new ObservableMap },
        };
    });

    test('by input', () => {
        const socket = mock(Socket.create({ socketType: 'input' }), { box });
        expect(socket.arrows).toHaveLength(0);
        box.store.arrows.set('id', { input: socket });
        expect(socket.arrows).toHaveLength(1);
    });

    test('by output', () => {
        const socket = mock(Socket.create({ socketType: 'output' }), { box });
        expect(socket.arrows).toHaveLength(0);
        box.store.arrows.set('id', { input: socket });
        expect(socket.arrows).toHaveLength(1);
    });
});

describe('x/y', () => {
    const testData = [
        { box: { x: 0, y: 0, width: 0 }, index: 0 },
        { box: { x: -100, y: 100, width: 50 }, index: 0 },
        { box: { x: -100, y: 100, width: 50 }, index: 2 },
        { box: { x: 0, y: 100, width: 20 }, index: 3 },
        { box: { x: -500, y: 0, width: 100 }, index: 5 },
    ];

    const getTest = (socketType: SocketTypeEnum) => () => {
        for (const data of testData) {
            const socket = Socket.create({ socketType });
            const { x, y } = mock(socket, data);
            expect({ x, y }).toMatchSnapshot();
        }
    };

    for (const type of socketTypes) {
        test(type, getTest(type));
    }
});

test('setName', () => {
    const socket = Socket.create({ socketType: 'input' });
    socket.setName(null);
    expect(socket.name).toBe('');
    socket.setName('name');
    expect(socket.name).toBe('name');
});

test('areSocketsCompatible', () => {
    const tests = product(socketTypes, socketTypes, [0, 1], [0, 1]);
    for (const t of tests) {
        const [s1, s2, l1, l2] = t;
        expect(areSocketsCompatible(
            mock(Socket.create({ socketType: s1 }), { arrows: { length: l1 } }),
            mock(Socket.create({ socketType: s2 }), { arrows: { length: l2 } }),
        )).toMatchSnapshot(t.join(','));
    }
});