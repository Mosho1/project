import { types } from 'mobx-state-tree';
import { optionalIdentifierType } from '../utils/utils';

const parseFunction = (value: string) => {
    const fn = eval(`(${value})`);
    if (typeof fn !== 'function') throw new Error(`${value} is not a valid function`);
    return fn;
};

export const codeType = types.custom<string, Function>({
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

const nonEditableTypes = types.enumeration('nonEditableTypes', [
    'any',
    'void'
]);

export const typeNames = ['string', 'number', 'any', 'void'];

export const primitiveTypes = types.union(editableTypes, nonEditableTypes);

export const CodeBlockIO = types.model('CodeBlockIO', {
    id: optionalIdentifierType,
    name: types.optional(types.string, ''),
    type: types.optional(primitiveTypes, 'any'),
    defaultValue: types.maybe(types.string)
});

export const CodeBlock = types.model('CodeBlock', {
    id: optionalIdentifierType,
    name: types.string,
    code: codeType,
    runOnStart: types.optional(types.boolean, false),
    values: types.optional(types.array(CodeBlockIO), []),
    inputs: types.optional(types.array(CodeBlockIO), []),
    returns: types.maybe(types.refinement(CodeBlockIO, io => io.type !== 'any') as typeof CodeBlockIO),
    execInputs: types.optional(types.array(CodeBlockIO), []),
    execOutputs: types.optional(types.array(CodeBlockIO), []),
});

type ICodeBlockType = typeof CodeBlock.Type;

type ICodeBlockSnapshotType = typeof CodeBlock.SnapshotType;
export interface ICodeBlock extends ICodeBlockType { };
export interface ICodeBlockSnapshot extends ICodeBlockSnapshotType { };

type ICodeBlockIOType = typeof CodeBlockIO.Type;

type ICodeBlockIOSnapshotType = typeof CodeBlockIO.SnapshotType;
export interface ICodeBlockIO extends ICodeBlockIOType { };
export interface ICodeBlockIOSnapshot extends ICodeBlockIOSnapshotType { };