import { types, getParent, hasParent } from 'mobx-state-tree'
import { pouch } from '../utils/pouchdb-model';
import { Socket, SocketTypeEnum } from './socket';
import { IStore } from '../domain-state';
import { CodeBlock } from './code-block';

interface BoxEditableProps {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    scaleX?: number;
    scaleY?: number;
}

export const Box = pouch.model('Box',
    {
        name: 'hal',
        x: 0,
        y: 0,
        width: 150,
        value: types.maybe(types.string),
        sockets: types.optional(types.array(Socket), []),
        code: types.reference(CodeBlock)
    })
    .views(self => ({
        get store(): IStore | null {
            if (!hasParent(self)) return null;
            return getParent(self, 2);
        },
        get inputs() {
            return self.sockets.filter(({ socketType }) => socketType === 'input');
        },
        get outputs() {
            return self.sockets.filter(({ socketType }) => socketType === 'output');
        },
        get execInputs() {
            return self.sockets.filter(({ socketType }) => socketType === 'execInput');
        },
        get execOutputs() {
            return self.sockets.filter(({ socketType }) => socketType === 'execOutput');
        },

    }))
    .views(self => ({
        get isSelected() {
            return Boolean(self.store && self.store.selection === self);
        },
        get height() {
            return 50 + Math.max(
                self.execInputs.length + self.inputs.length,
                self.execOutputs.length + self.outputs.length)
                * 30;
        }
    }))
    .actions(self => ({
        move(dx: number, dy: number) {
            self.x += dx;
            self.y += dy;
            return self;
        },
        setProps(props: BoxEditableProps) {
            /* istanbul ignore next */
            Object.assign(self, props);
        },
        addSocket(type: SocketTypeEnum, name = '') {
            const socket = Socket.create({ name: name, socketType: type });
            self.sockets.push(socket);
            return socket;
        },
        setValue(value: string) {
            self.value = value;
        }
    }));

type IBoxType = typeof Box.Type;
export interface IBox extends IBoxType { };
