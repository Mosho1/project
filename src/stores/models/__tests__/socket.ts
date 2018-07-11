import { Socket, SocketTypeEnum, socketTypes, areSocketsCompatible, ISocketSnapshot } from '../socket';
import { mock, product } from '../../test-utils';
import { ObservableMap } from 'mobx';
import { CodeBlockIO, typeNames } from '../code-block';

export const createTestSocket = (args?: ISocketSnapshot) => {
    const code = CodeBlockIO.create();
    return Socket.create({
        name: 'test',
        socketType: 'input',
        code,
        ...args
    });
};

test('box', () => {
    expect(createTestSocket({ socketType: 'input' }).box).toBeNull();
});

test('isExec', () => {
    expect(createTestSocket({ socketType: 'input' }).isExec).toBe(false);
    expect(createTestSocket({ socketType: 'output' }).isExec).toBe(false);
    expect(createTestSocket({ socketType: 'execInput' }).isExec).toBe(true);
    expect(createTestSocket({ socketType: 'execOutput' }).isExec).toBe(true);
});

test('isInput', () => {
    expect(createTestSocket({ socketType: 'input' }).isInput).toBe(true);
    expect(createTestSocket({ socketType: 'output' }).isInput).toBe(false);
    expect(createTestSocket({ socketType: 'execInput' }).isInput).toBe(true);
    expect(createTestSocket({ socketType: 'execOutput' }).isInput).toBe(false);
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
        const socket = createTestSocket({ socketType: 'input' });
        expect(socket.index).toBe(0);
    });

    test('tests', () => {
        for (const test of tests) {
            const socket = createTestSocket({ socketType: test[0] });
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
        const socket = mock(createTestSocket({ socketType: 'input' }), { box });
        expect(socket.arrows).toHaveLength(0);
        box.store.arrows.set('id', { input: socket });
        expect(socket.arrows).toHaveLength(1);
    });

    test('by output', () => {
        const socket = mock(createTestSocket({ socketType: 'output' }), { box });
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
            const socket = createTestSocket({ socketType });
            const { x, y } = mock(socket, data);
            expect({ x, y }).toMatchSnapshot();
        }
    };

    for (const type of socketTypes) {
        test(type, getTest(type));
    }
});

test('setName', () => {
    const socket = createTestSocket({ socketType: 'input' });
    socket.setName(null);
    expect(socket.name).toBe('');
    socket.setName('name');
    expect(socket.name).toBe('name');
});

test('areSocketsCompatible', () => {
    const tests = product(socketTypes, socketTypes, [0, 1], [0, 1], ['string', 'number', 'any'], ['string', 'number', 'any']);
    for (const t of tests) {
        const [s1, s2, l1, l2, t1, t2] = t;
        expect(areSocketsCompatible(
            mock(createTestSocket({ socketType: s1 }), { arrows: { length: l1 }, code: { type: t1 } }),
            mock(createTestSocket({ socketType: s2 }), { arrows: { length: l2 }, code: { type: t2 } }),
        )).toMatchSnapshot(t.join(','));
    }
});

test('color', () => {
    for (const type of typeNames) {
        expect(mock(createTestSocket(), { code: { type } } as any).color).toMatchSnapshot();
    }
});

describe('fillColor', () => {
    test('no arrows', () => {
        for (const type of typeNames) {
            const s = mock(createTestSocket(), { code: { type } } as any);
            expect(s.fillColor).toEqual(s.color);
        }
    });

    test('with arrow', () => {
        for (const type of typeNames) {
            const arrows = [{color: 'arrowColor'}];
            const s = mock(createTestSocket(), {arrows: arrows as any, code: { type } } as any);
            expect(s.fillColor).toEqual(type === 'any' ? arrows[0].color : s.color);
        }
    });
});