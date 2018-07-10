import { types } from 'mobx-state-tree';
import { optionalIdentifierType } from '../utils/utils';
const parseFunction = (value: string) => {
    const fn = eval(`(${value})`);
    if (typeof fn !== 'function') throw new Error(`${value} is not a valid function`);
    return fn;
};

const codeType = types.custom<string, Function>({
    name: 'CodeBlock',
    fromSnapshot(value: string) {
        return parseFunction(value);
    },
    toSnapshot(value: Function) {
        return value.toString();
    },
    getValidationMessage(value: string) {
        try {
            parseFunction(value);
            return '';
        } catch (e) {
            return `value "${value}" is Not a valid function ${e}`;
        }
    },
    isTargetType(value: any) {
        return value instanceof Function;
    }
});

export const editableTypes = types.enumeration('editableTypes', [
    'string',
    'number'
]);

export type IEditableTypes = typeof editableTypes.Type;

const primitiveTypes = types.union(editableTypes, types.enumeration('primitiveTypes', [
    'any',
    'void'
]));

const CodeBlockInput = types.model({
    name: types.string,
    type: primitiveTypes
});

export const CodeBlock = types.model('CodeBlock', {
    id: optionalIdentifierType,
    name: types.string,
    code: codeType,
    runOnStart: types.optional(types.boolean, false),
    // editableValue: types.maybe(editableTypes),
    inputs: types.optional(types.array(CodeBlockInput), []),
    returns: types.optional(primitiveTypes, 'void'),
    execInputs: types.optional(types.array(types.string), []),
    execOutputs: types.optional(types.array(types.string), []),
});

type ICodeBlockType = typeof CodeBlock.Type;

type ICodeBlockSnapshotType = typeof CodeBlock.SnapshotType;
export interface ICodeBlock extends ICodeBlockType { };
export interface ICodeBlockSnapshot extends ICodeBlockSnapshotType { };