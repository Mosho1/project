import { values } from 'mobx'
import { types, getParent } from 'mobx-state-tree'
import { randomUuid } from '../utils/utils';
import { modelTypes } from './index';

const socketType = types.enumeration('socketType', [
    'input',
    'output',
    'execInput',
    'execOutput',
]);

export type SocketTypeEnum = typeof socketType.Type;

export const socketTypes = (socketType as any).types.map((x: any) => x.value) as SocketTypeEnum[];

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
        get box(): modelTypes['Box'] {
            return getParent(self, 2);
        },
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
    }))
    .views(self => ({
        get isExec() {
            return self.socketType === 'execInput' || self.socketType === 'execOutput';
        },
        get isInput() {
            return self.socketType === 'execInput' || self.socketType === 'input';
        },
        get arrows() {
            if (!self.box.store) return [];
            return values(self.box.store.arrows).filter(a => a.input === self || a.output === self);
        },
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
    }))
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
