import { types, getParent, hasParent } from 'mobx-state-tree'
import { optionalIdentifierType, values } from '../utils/utils';
import { modelTypes } from './index';

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
    const [input, output] = s1.isInput ? [s1, s2] : [s2, s1];
    if (input.isExec && (input.arrows.length > 0 || output.arrows.length > 0)) return false;
    if (input.arrows.length > 0) return false;
    return true;
};

export const Socket = types.model('Socket', {
    id: optionalIdentifierType,
    socketType,
    name: types.optional(types.string, '')
}).volatile(_self => ({
    value: null,
}))
    .views(self => ({
        get box(): null | modelTypes['Box'] {
            if (!hasParent(self, 2)) return null;
            return getParent(self, 2);
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
                return self.box.x + 18;
            } else {
                return self.box.x + self.box.width - 18;
            }
        },
        get y() {
            if (!self.box) return 0;
            return 50 + self.box.y + self.index * 30;
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
                self.value = value;
            }
        }
    });

type ISocketType = typeof Socket.Type;
export interface ISocket extends ISocketType { };