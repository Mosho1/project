import { CodeBlock, ICodeBlockSnapshot } from "../code-block";

export const createTestCodeBlock = (args?: ICodeBlockSnapshot) => {
    return CodeBlock.create({
        name: 'test',
        code: (a: number, b: number) => a + b,
        inputs: [{ name: 'a', type: 'number' }, { name: 'b', type: 'number' }],
        returns: 'number',
        ...args
    });
};

test('', () => {
    const cb = CodeBlock.create({
        name: 'test',
        code: ((a: number, b: number) => a + b).toString()
    });
    cb;
});


