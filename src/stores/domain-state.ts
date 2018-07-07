import { toJS, runInAction, values } from 'mobx'
import { onPatch, types, getSnapshot, applySnapshot, getParent, hasParent, addMiddleware, onAction, onSnapshot, resolvePath } from 'mobx-state-tree'
import PouchDB from 'pouchdb';
import { MSTPouch } from './pouchdb-model';

const pouch = new MSTPouch();

export const Socket = pouch.model('Socket', {

});

interface BoxEditableProps {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    scaleX?: number;
    scaleY?: number;
}

export const Box = pouch.model('Box', {
    name: 'hal',
    x: 0,
    y: 0,
    width: 150,
    height: 70,
    leftSockets: types.array(Socket),
    rightSockets: types.array(Socket)
})
    .views(self => ({
        get isSelected() {
            if (!hasParent(self)) return false
            return getParent(self, 2).selection === self
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
    }))

export const Arrow = pouch.model('Arrow', {
    from: types.reference(Box),
    to: types.reference(Box)
});

const calculateBezierPoints = ({ startX, startY, endX, endY }: {[index: string]: number}) => {
    return [
        startX,
        startY,
        startX + (endX - startX) / 2,
        startY,
        startX + (endX - startX) / 2,
        endY,
        endX,
        endY,
    ]
};

const DraggedArrow = types.model('DraggedArrow', {
    startX: types.number,
    startY: types.number,
    endX: types.number,
    endY: types.number,
}).views(self => {
    return {
        get points() {
            return calculateBezierPoints(self);
        }
    };
}).actions(self => {
    const start = (x: number, y: number) => {
        self.startX = x;
        self.startY = y;
    };

    const end = (x: number, y: number) => {
        self.endX = x;
        self.endY = y;
    };

    return {
        start, end
    };
});

export const Store = pouch.store('Store', {
    boxes: types.map(Box),
    arrows: types.map(Arrow),
    selection: types.maybe(types.reference(Box)),
    draggedArrow: types.maybe(DraggedArrow)
})
    .actions(self => {
        const addBox = (name: string, x: number, y: number) => {
            const leftSockets = [Socket.create()];
            const rightSockets = [Socket.create()];
            const box = Box.create({ name, x, y, leftSockets, rightSockets })
            self.boxes.put(box)
            return box
        };
        const addArrow = (from: string, to: string) => {
            self.arrows.put(Arrow.create({ from, to }));
        };
        const setSelection = (selection: null | typeof Box.Type) => {
            self.selection = selection;
        };
        const deleteBox = (id: string) => {
            const arrowsToDelete = [];
            for (const arrow of self.arrows.values()) {
                if (arrow.from._id === id || arrow.to._id === id) {
                    arrowsToDelete.push(arrow._id);
                }
            }
            for (const id of arrowsToDelete) {
                self.arrows.delete(id);
            }
            self.boxes.delete(id);
        };
        const createBox = (name: string, x: number, y: number, source: null | typeof Box.Type) => {
            const box = addBox(name, x, y)
            setSelection(box)
            if (source) addArrow(source._id, box._id)
        };
        const startDragArrow = (x: number, y: number) => {
            self.draggedArrow = DraggedArrow.create({ startX: x, startY: y, endX: x + 10, endY: y });
        };
        const moveDragArrow = (x: number, y: number) => {
            if (self.draggedArrow) {
                self.draggedArrow.end(x, y);
            }
        };
        const endDragArrow = () => {
            self.draggedArrow = null;
        };

        return {
            addBox,
            addArrow,
            setSelection,
            createBox,
            deleteBox,
            startDragArrow,
            moveDragArrow,
            endDragArrow
        };
    })



/*
    The store that holds our domain: boxes and arrows
*/

const defaults = {
    boxes: {},
    arrows: {},
    selection: null
};

const getStore = (data: typeof Store.SnapshotType) => Store.create(data);

export const store = getStore(defaults);

//window['store'] = store;

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

export type BoxType = typeof Box.Type;