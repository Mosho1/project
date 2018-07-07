import { values } from 'mobx'
import { types, getParentOfType } from 'mobx-state-tree'
import { randomUuid } from '../utils/utils';
import { Store } from '../domain-state';
import { Box, BoxType } from './box';

const socketType = types.enumeration('socketType', [
    'input',
    'output',
    'execInput',
    'execOutput'
]);

export type SocketTypeEnum = typeof socketType.Type;

export const areSocketsCompatible = (s1: SocketType, s2: SocketType) => {
    if (s1.isInput === s2.isInput) return false;
    if (s1.isExec !== s2.isExec) return false;
    const [input, output] = s1.isInput ? [s1, s2] : [s2, s1];
    if (input.isExec && (input.arrows.length > 0 || output.arrows.length > 0)) return false;
    if (input.arrows.length > 0) return false;
    return true;
};

export const Socket = types.model('Socket', {
    id: types.optional<string, string>(types.identifier(), randomUuid) as any as string,
    socketType,
    name: types.optional(types.string, '')
})
    .views(self => ({
        get box(): BoxType {
            return getParentOfType(self, Box);
        },
        get store(): typeof Store.Type {
            return getParentOfType(self, Store);
        },
        get isExec() {
            return self.socketType === 'execInput' || self.socketType === 'execOutput';
        },
        get isInput() {
            return self.socketType === 'execInput' || self.socketType === 'input';
        }
    }))
    .views(self => ({
        get index() {
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
            return 0;
        },
        get arrows() {
            return values(self.store.arrows).filter(a => a.input === self || a.output === self);
        }
    }))
    .views(self => {
        return {
            get x() {
                if (self.socketType === 'input' || self.socketType === 'execInput') {
                    return self.box.x + 18;
                } else {
                    return self.box.x + self.box.width - 18;
                }
            },
            get y() {
                return 50 + self.box.y + self.index * 30;
            }
        };
    })
    .actions(self => {
        return {
            setName(name: string | null) {
                self.name = name || '';
            },
            isCompatibleWith(socket: typeof self) {
                return areSocketsCompatible(self as any, socket as any);
            }
        }
    });

export type SocketType = typeof Socket.Type;
export type SocketSnapshotType = typeof Socket.SnapshotType;
