import { types, getParent, hasParent } from 'mobx-state-tree'
import { values } from '../utils/utils';
import { modelTypes } from './index';
import { pouch } from '../utils/pouchdb-model';
import { IStore } from '../domain-state';
import { CodeBlockIO, ICodeBlockIO } from './code-block';
import { IPrimitiveTypes } from './types';

const socketType = types.enumeration('socketType', [
    'input',
    'output',
    'execInput',
    'execOutput',
]);

export type SocketTypeEnum = typeof socketType.Type;

export const socketTypes = (socketType as any).types.map((x: any) => x.value) as SocketTypeEnum[];

export const areSocketsCompatible = (s1: ISocket, s2: ISocket) => {
    if (s1.isInput === s2.isInput) return false;
    if (s1.isExec !== s2.isExec) return false;
    if (s1.code.type !== 'any' &&
        s2.code.type !== 'any' &&
        s1.code.type !== s2.code.type) return false;
    const [input, output] = s1.isInput ? [s1, s2] : [s2, s1];
    if (input.isExec && (input.arrows.length > 0 || output.arrows.length > 0)) return false;
    if (input.arrows.length > 0) return false;
    return true;
};

const typeColors: {[T in IPrimitiveTypes]: string} = {
    any: '#fff',
    number: 'green',
    string: 'red',
    boolean: '#1565C0',
    void: '#000'
};

export const Socket = pouch.model('Socket', {
    socketType,
    name: types.optional(types.string, ''),
    code: types.reference<ICodeBlockIO>(CodeBlockIO)
}).volatile(_self => ({
    value: null,
}))
    .views(self => ({
        get store(): null | IStore {
            if (!hasParent(self, 2)) return null;
            return getParent(self, 2);
        },
    }))
    .views(self => ({
        get box(): null | modelTypes['Box'] {
            if (!self.store) return null;
            return values(self.store.boxes).find(b => Boolean(b.sockets.find(s => s === self))) || null;
        },
    }))
    .views(self => ({
        get index() {
            if (!self.box) return 0;
            const { inputs, outputs, execInputs, execOutputs } = self.box;
            switch (self.socketType) {
                case 'input':
                    return execInputs.length + inputs.findIndex(s => s === self);
                case 'output':
                    return execOutputs.length + outputs.findIndex(s => s === self);
                case 'execInput':
                    return execInputs.findIndex(s => s === self);
                case 'execOutput':
                    return execOutputs.findIndex(s => s === self);
            }
            /* istanbul ignore next */
            return 0;
        },
    }))
    .views(self => ({
        get isExec() {
            return self.socketType === 'execInput' || self.socketType === 'execOutput';
        },
        get isInput() {
            return self.socketType === 'execInput' || self.socketType === 'input';
        },
        get arrows() {
            if (!self.box || !self.box.store) return [];
            return values(self.box.store.arrows).filter(a => a.input === self || a.output === self);
        },
        get x() {
            if (!self.box) return 0;
            if (self.socketType === 'input' || self.socketType === 'execInput') {
                return 18;
            } else {
                return self.box.width - 18;
            }
        },
        get y() {
            return 50 + self.index * 30;
        },

    }))
    .views(self => ({
        get absX() {
            if (!self.box) return 0;
            return self.x + self.box.x;
        },
        get absY() {
            if (!self.box) return 0;
            return self.y + self.box.y;
        },
        get color() {
            return typeColors[self.code.type] || '#fff';
        },
    }))
    .views(self => ({
        get fillColor() {
            switch (self.code.type) {
                case 'any':
                    if (self.arrows.length > 0) {
                        return self.arrows[0].color;
                    }
                default:
                    return self.color;
            }
        }
    }))
    .actions(self => {
        return {
            setName(name: string | null) {
                self.name = name || '';
            },
            isCompatibleWith(socket: typeof self) {
                return areSocketsCompatible(self as any, socket as any);
            },
            setValue(value: any) {
                /* istanbul ignore next */
                self.value = value;
            }
        }
    });

type ISocketType = typeof Socket.Type;
type ISocketSnapshotType = typeof Socket.SnapshotType;
export interface ISocket extends ISocketType { };
export interface ISocketSnapshot extends ISocketSnapshotType { };