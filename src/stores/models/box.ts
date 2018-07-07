import { types, getParent, hasParent } from 'mobx-state-tree'
import { pouch } from '../utils/pouchdb-model';
import { Socket } from './socket';
import { Store } from '../domain-state';

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
        sockets: types.array(Socket),
    })
    .views(self => ({
        get store(): typeof Store.Type {
            return getParent(self, 2);
        },
        get leftSockets() {
            return self.sockets.filter(({ socketType }) => socketType === 'input');
        },
        get rightSockets() {
            return self.sockets.filter(({ socketType }) => socketType === 'output');
        },
    }))
    .views(self => ({
        get isSelected() {
            if (!hasParent(self)) return false
            return self.store.selection === self
        },
        get height() {
            return 50 + Math.max(self.leftSockets.length, self.rightSockets.length) * 30;
        }
    }))
    .actions(self => ({
        move(dx: number, dy: number) {
            self.x += dx;
            self.y += dy;
        },
        setProps(props: BoxEditableProps) {
            Object.assign(self, props);
        },
        addSocket(type: 'input' | 'output') {
            const socket = Socket.create({ socketType: type });
            self.sockets.push(socket);
        }
    }))

export type BoxType = typeof Box.Type;
