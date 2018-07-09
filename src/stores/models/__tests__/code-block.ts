import { CodeBlock } from "../code-block";

test('', () => {
    const cb = CodeBlock.create({
        code: ((a: number, b: number) => a + b).toString()
    });
cb;
});

