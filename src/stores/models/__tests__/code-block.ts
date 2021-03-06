import { CodeBlock, ICodeBlockSnapshot } from "../code-block";

export const createTestCodeBlock = (args?: ICodeBlockSnapshot) => {
    return CodeBlock.create({
        name: 'test',
        code: (a: number, b: number) => a + b,
        inputs: [{
            id: 'test/a', name: 'a', type: 'number'
        }, {
            id: 'test/b', name: 'b', type: 'number'
        }],
        returns: { id: 'test/returns', type: 'number' },
        ...args
    });
};

test('can create', () => {
    expect(() => CodeBlock.create({
        name: 'test',
        code: ((a: number, b: number) => a + b).toString()
    })).not.toThrow();

    expect(() => CodeBlock.create({
        name: 'test',
        code: ((a: number, b: number) => a + b)
    })).not.toThrow();
});

test('throws on invalid code', () => {
    expect(() => CodeBlock.create({
        name: 'test',
        code: null
    })).toThrow();

    expect(() => CodeBlock.create({
        name: 'test',
        code: ''
    })).toThrow();

    expect(() => CodeBlock.create({
        name: 'test',
        code: 'not a function'
    })).toThrow();
});


