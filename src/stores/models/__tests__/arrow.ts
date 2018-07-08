import { Arrow } from "../arrow";
import { Socket } from '../socket';
import { mock } from '../../test-utils';


test('points', () => {
    const input = mock(Socket.create({ socketType: 'input' }), { box: null });
    const output = mock(Socket.create({ socketType: 'output' }), { box: null });
    const a = Arrow.create({ input, output });
    expect(a.points).toMatchSnapshot();
});

describe('isExec', () => {
    test('false', () => {
        const input = mock(Socket.create({ socketType: 'input' }), { box: null });
        const output = mock(Socket.create({ socketType: 'output' }), { box: null });
        const a = Arrow.create({ input, output });
        expect(a.isExec).toBe(false);
    });

    test('true', () => {
        const input = mock(Socket.create({ socketType: 'execInput' }), { box: null });;
        const output = mock(Socket.create({ socketType: 'execOutput' }), { box: null });
        const a = Arrow.create({ input, output });
        expect(a.isExec).toBe(true);
    });
});
