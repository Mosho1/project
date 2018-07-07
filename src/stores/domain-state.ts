import { values } from 'mobx'
import { types, getSnapshot, applySnapshot } from 'mobx-state-tree'
import { pouch } from './utils/pouchdb-model';
import { Box, BoxType } from './models/box';
import { Arrow } from './models/arrow';
import { DraggedArrow } from './models/dragged-arrow';
import { Socket, SocketType } from './models/socket';


export const Store = pouch.store('Store', {
    boxes: types.map(Box),
    arrows: types.map(Arrow),
    // sockets: types.map(Socket),
    selection: types.maybe(types.reference(Box)),
    draggedArrow: types.maybe(DraggedArrow),
    draggedFromSocket: types.maybe(types.reference(Socket)),
})
    .actions(self => {
        const addBox = (name: string, x: number, y: number) => {
            const box = Box.create({ name, x, y, sockets: [] });
            box.addSocket('input');
            box.addSocket('output');
            box.addSocket('execInput');
            box.addSocket('execOutput');
            self.boxes.put(box);
            return box;
        };
        const addArrow = (input: string, output: string) => {
            self.arrows.put(Arrow.create({ input, output }));
        };
        const setSelection = (selection: null | typeof Box.Type) => {
            self.selection = selection;
        };
        const deleteBox = (box: BoxType) => {
            if (self.selection === box) {
                setSelection(null);
            }
            for (const socket of box.sockets.values()) {
                deleteArrowsForSocket(socket);
            }
            self.boxes.delete(box._id);
        };
        const createBox = (name: string, x: number, y: number) => {
            const box = addBox(name, x, y)
            setSelection(box)
        };
        const startDragArrow = (socket: SocketType) => {
            const { x, y } = socket;
            self.draggedArrow = DraggedArrow.create({ startX: x, startY: y, endX: x, endY: y });
            self.draggedFromSocket = socket;
        };
        const moveDragArrow = (x: number, y: number) => {
            if (self.draggedArrow) {
                if (self.draggedFromSocket!.socketType === 'input') {
                    self.draggedArrow.start(x, y);
                } else {
                    self.draggedArrow.end(x, y);
                }
            }
        };
        const hasArrow = (from: SocketType, to?: SocketType) => {
            const input = from.socketType === 'input' ? from : to;
            const output = from.socketType === 'output' ? from : to;
            return Boolean(values(self.arrows).find(a => {
                return (!input || a.input === input) &&
                    (!output || a.output === output);
            }));
        };
        const endDragArrow = (socket?: SocketType) => {
            self.draggedArrow = null;
            if (self.draggedFromSocket &&
                socket &&
                socket.isCompatibleWith(self.draggedFromSocket) &&
                !hasArrow(self.draggedFromSocket, socket)) {
                const input = socket.isInput ? socket : self.draggedFromSocket;
                const output = !socket.isInput ? socket : self.draggedFromSocket;
                if (input.arrows.length === 0) {
                    self.arrows.put(Arrow.create({ input, output }));
                }
            }
            self.draggedFromSocket = null;
        };
        const deleteArrowsForSocket = (socket: SocketType) => {
            const arrowsToDelete = [];
            for (const arrow of self.arrows.values()) {
                if (arrow.input === socket || arrow.output === socket) {
                    arrowsToDelete.push(arrow._id)
                }
            }
            for (const id of arrowsToDelete) {
                self.arrows.delete(id);
            }
        };

        return {
            addBox,
            addArrow,
            hasArrow,
            setSelection,
            createBox,
            deleteBox,
            startDragArrow,
            moveDragArrow,
            endDragArrow,
            deleteArrowsForSocket
        };
    })



/*
    The store that holds our domain: boxes and arrows
*/

const defaults: typeof Store.SnapshotType = {
    boxes: {},
    arrows: {},
    // sockets: {},
    selection: null,
    draggedArrow: null,
    draggedFromSocket: null
};

const getStore = (data: typeof Store.SnapshotType) => Store.create(data);

export const store = getStore(defaults);

(window as any)['store'] = store;

/**
    Save / Restore the state of the store while self module is hot reloaded
*/
if (module.hot) {
    if (module.hot.data && module.hot.data.store) {
        applySnapshot(store, module.hot.data.store)
    }
    module.hot.dispose(data => {
        data.store = getSnapshot(store)
    })
}