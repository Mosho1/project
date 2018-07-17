import { types, typecheck, ISimpleType } from 'mobx-state-tree';
import { noop, identity } from '../utils/utils';

export const editableTypes = types.enumeration('editableTypes', [
    'string',
    'number',
    'boolean'
]);

export type IEditableTypes = typeof editableTypes.Type;

const nonEditableTypes = types.enumeration('nonEditableTypes', [
    'any',
    'void'
]);

export const primitiveTypes = types.union(editableTypes, nonEditableTypes);
export type IPrimitiveTypes = typeof primitiveTypes.Type;
export const typeNames: IPrimitiveTypes[] = ['string', 'number', 'boolean', 'any', 'void'];

export const mstTypes: { [T in IPrimitiveTypes]: ISimpleType<any> } = {
    any: types.frozen,
    void: types.null,
    string: types.string,
    number: types.number,
    boolean: types.boolean
};

class TypeError extends Error { }

const staticTypeCheckers: { [T in IPrimitiveTypes]: (value: any) => void } = {
    any: noop,
    void: noop,
    string: (value) => typecheck(types.string, value),
    number: (value) => typecheck(types.number, value),
    boolean: (value) => typecheck(types.boolean, value),
};

export const checkStaticType = (type: IPrimitiveTypes, value: any) => {
    const checker = staticTypeCheckers[type];
    if (!checker) return;
    checker(value);
};

const runtimeTypeCheckers: { [T in IPrimitiveTypes]: (value: string | boolean) => any } = {
    string: noop,
    number(value) {
        const parsed = Number(value);
        if (Number.isNaN(parsed)) {
            throw new TypeError(`expected a number, got '${typeof value}'`);
        }
        return parsed;
    },
    boolean(value) {
        if (typeof value !== 'boolean') {
            throw new TypeError(`expected a boolean, got '${typeof value}'`);
        }
        return value;
    },
    any: noop,
    void: noop
};


export const checkRuntimeType = (type: IPrimitiveTypes, value: any) => {
    return (runtimeTypeCheckers[type] || identity)(value);
};

export const getConversionIfExists = (_fromType: IPrimitiveTypes, toType: IPrimitiveTypes) => {
    if (toType === 'string') return 'toString';
    return null;
};