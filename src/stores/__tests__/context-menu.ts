import { ContextMenu } from "../context-menu";
import { Store } from '../domain-state';
import { createTestCodeBlock } from '../models/__tests__/code-block';
import { ICodeBlock } from '../models/code-block';

test('sortedCodeBlocks', () => {
    let codeBlocks: { [index: string]: ICodeBlock } = {};
    for (const name of ['zzz', 'ac', 'asef', 'ba', 'esv', 'cef', 'cef', 'ce3', 'dd', 'd']) {
        codeBlocks[name] = createTestCodeBlock({
            id: name,
            name
        });
    }

    const contextMenu = ContextMenu.create();
    Store.create({ codeBlocks, contextMenu });
    expect(contextMenu.sortedCodeBlocks).toMatchSnapshot();
});