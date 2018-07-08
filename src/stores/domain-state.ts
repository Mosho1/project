import { values } from 'mobx'
import { types, getSnapshot, applySnapshot } from 'mobx-state-tree'
import { pouch } from './utils/pouchdb-model';
import { models, modelTypes } from './models/index';

export const Store = pouch.store('Store', {
    boxes: types.optional(types.map(models.Box), {}),
    arrows: types.optional(types.map(models.Arrow), {}),
    selection: types.maybe(types.reference(models.Box)),
    draggedArrow: types.maybe(models.DraggedArrow),
    draggedFromSocket: types.maybe(types.reference(models.Socket)),
})
    .actions(self => {
        const addBox = (name: string, x: number, y: number) => {
            const box = models.Box.create({ name, x, y, sockets: [] });
            box.addSocket('input');
            box.addSocket('output');
            box.addSocket('execInput');
            box.addSocket('execOutput');
            self.boxes.put(box);
            return box;
        };
        const setSelection = (selection: null | modelTypes['Box']) => {
            self.selection = selection;
            return self;
        };
        const deleteBox = (box: modelTypes['Box']) => {
            if (self.selection === box) {
                setSelection(null);
            }

            for (const socket of box.sockets) {
                deleteArrowsForSocket(socket);
            }
            self.boxes.delete(box._id);
        };
        const createBox = (name: string, x: number, y: number) => {
            const box = addBox(name, x, y)
            setSelection(box)
        };
        const startDragArrow = (socket: modelTypes['Socket']) => {
            const { x, y } = socket;
            self.draggedArrow = models.DraggedArrow.create({ startX: x, startY: y, endX: x, endY: y });
            self.draggedFromSocket = socket;
        };
        const moveDragArrow = (x: number, y: number) => {
            if (self.draggedArrow) {
                if (self.draggedFromSocket!.isInput) {
                    self.draggedArrow.start(x, y);
                } else {
                    self.draggedArrow.end(x, y);
                }
            }
        };
        const hasArrow = (from: modelTypes['Socket'], to?: modelTypes['Socket']) => {
            const input = from.isInput ? from : to;
            const output = from.isInput ? from : to;
            return Boolean(values(self.arrows).find(a => {
                return (!input || a.input === input) &&
                    (!output || a.output === output);
            }));
        };
        const addArrow = (input: modelTypes['Socket'], output: modelTypes['Socket']) => {
            let arrow: null | modelTypes['Arrow'] = null;
            if (input.isCompatibleWith(output) &&
                !hasArrow(input, output)) {
                arrow = models.Arrow.create({ input, output });
                self.arrows.put(arrow);
            }
            return arrow;
        };
        const endDragArrow = (socket?: modelTypes['Socket']) => {
            self.draggedArrow = null;
            if (self.draggedFromSocket && socket) {
                const input = socket.isInput ? socket : self.draggedFromSocket;
                const output = !socket.isInput ? socket : self.draggedFromSocket;
                addArrow(input, output);
            }
            self.draggedFromSocket = null;
        };
        const deleteArrowsForSocket = (socket: modelTypes['Socket']) => {
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
            hasArrow,
            setSelection,
            createBox,
            deleteBox,
            addArrow,
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

export type StoreType = typeof Store.Type;