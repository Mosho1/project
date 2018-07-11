import { Arrow } from "../arrow";
import { mock } from '../../test-utils';
import { createTestSocket } from './socket';


test('points', () => {
    const input = mock(createTestSocket({ socketType: 'input' }), { box: null });
    const output = mock(createTestSocket({ socketType: 'output' }), { box: null });
    const a = Arrow.create({ input, output });
    expect(a.points).toMatchSnapshot();
});

describe('isExec', () => {
    test('false', () => {
        const input = mock(createTestSocket({ socketType: 'input' }), { box: null });
        const output = mock(createTestSocket({ socketType: 'output' }), { box: null });
        const a = Arrow.create({ input, output });
        expect(a.isExec).toBe(false);
    });

    test('true', () => {
        const input = mock(createTestSocket({ socketType: 'execInput' }), { box: null });;
        const output = mock(createTestSocket({ socketType: 'execOutput' }), { box: null });
        const a = Arrow.create({ input, output });
        expect(a.isExec).toBe(true);
    });
});
