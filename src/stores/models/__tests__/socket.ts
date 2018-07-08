import { Socket, SocketTypeEnum, socketTypes, areSocketsCompatible } from '../socket';
import { mock, product } from '../../test-utils';
import { ObservableMap } from 'mobx';

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

    test('input', () => {
        const socket = Socket.create({ socketType: 'input' });
        box.inputs = [socket];
        expect(mock(socket, { box }).index).toBe(0);
    });

    test('input with execInput', () => {
        const socket = Socket.create({ socketType: 'input' });
        box.inputs = [socket];
        box.execInputs = [null];
        expect(mock(socket, { box }).index).toBe(1);
    });

    test('input with output', () => {
        const socket = Socket.create({ socketType: 'input' });
        box.inputs = [socket];
        box.outputs = [null];
        expect(mock(socket, { box }).index).toBe(0);
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
            mock(Socket.create({ socketType: s1 }), {arrows: {length: l1}}),
            mock(Socket.create({ socketType: s2 }), {arrows: {length: l2}}),
        )).toMatchSnapshot(t.join(','));
    }
});