import { types, getEnv, applySnapshot, getSnapshot, detach, hasParent, getParent } from 'mobx-state-tree'
import { pouch } from './utils/pouchdb-model';
import { models, modelTypes } from './models/index';
import { ContextMenu } from './context-menu';
import { ICodeBlock, ICodeBlockIO } from './models/code-block';
import * as codeBlocks from './functions';
import { values } from './utils/utils';
import { run } from './run';
import { SocketTypeEnum, areSocketsCompatible } from './models/socket';

const Position = types.model('Position', {
    x: types.number,
    y: types.number
});

const Stage = types.model('Stage', {
    scale: types.optional(types.number, 1),
    position: types.optional(Position, { x: 0, y: 0 })
}).views(self => ({
    get store(): null | IStore {
        if (!hasParent(self, 1)) return null;
        return getParent(self, 1);
    },
})).actions(self => ({
    move(dx: number, dy: number) {
        self.position.x += dx;
        self.position.y += dy;
        return self;
    },
    setScale(scale: number) {
        self.scale = scale;
    },
    handleScale(e: WheelEvent) {
        const mousePointTo = {
            x: e.clientX / self.scale - self.position.x / self.scale,
            y: e.clientY / self.scale - self.position.y / self.scale,
        };

        const scaleBy = e.ctrlKey ? 1.3 : 1.1;

        const newScale = e.deltaY < 0 ? self.scale * scaleBy : self.scale / scaleBy;

        if (newScale > 3 || newScale < 0.4) return;

        self.scale = newScale;

        self.position = {
            x: -(mousePointTo.x - e.clientX / newScale) * newScale,
            y: -(mousePointTo.y - e.clientY / newScale) * newScale
        }
    }
}));

export const Store = pouch.store('Store', {
    boxes: types.optional(types.map(models.Box), {}),
    sockets: types.optional(types.map(models.Socket), {}),
    arrows: types.optional(types.map(models.Arrow), {}),
    codeBlocks: types.optional(types.map(models.CodeBlock), {}),
    selection: types.optional(types.array(types.reference<modelTypes['Box']>(models.Box)), []),
    draggedArrow: types.maybe(models.DraggedArrow),
    draggedFromSocket: types.maybe(types.reference<modelTypes['Socket']>(models.Socket)),
    contextMenu: types.maybe(ContextMenu),
    stage: types.optional(Stage, {})
})
    .actions(self => {
        const addBox = (name: string, x: number, y: number, code: ICodeBlock) => {
            const { inputs, returns, execInputs, execOutputs, values } = code;
            const boxValues = values.map(v => ({ name: v.name, value: v.defaultValue || '' }));
            const box = models.Box.create({ name, x, y, code, values: boxValues });
            for (const input of inputs) {
                addSocketToBox(box, 'input', input);
            }
            if (returns && returns.type !== 'void') {
                addSocketToBox(box, 'output', returns);
            }
            for (const input of execInputs) {
                addSocketToBox(box, 'execInput', input);
            }
            for (const output of execOutputs) {
                addSocketToBox(box, 'execOutput', output);
            }
            self.boxes.put(box);
            return box;
        };
        const addBoxAndArrowIfDragged = (name: string, x: number, y: number, code: ICodeBlock) => {
            const b = addBox(name, x, y, code);
            if (self.draggedFromSocket) {
                for (const socket of b.sockets) {
                    if (areSocketsCompatible(socket, self.draggedFromSocket)) {
                        const a = addArrowFromDraggedSocket(socket);
                        if (a !== null) return true;
                    }
                }
            }
            return false;
        };
        const setSelection = (selection: modelTypes['Box'][]) => {
            self.selection.replace(selection);
            return self;
        };
        const addToSelection = (selection: modelTypes['Box'][]) => {
            self.selection.push(...selection);
            return self;
        };
        const deleteBox = (box: modelTypes['Box']) => {
            // self.selection.remove(box);
            for (const socket of box.sockets) {
                deleteArrowsForSocket(socket);
            }

            for (const socket of box.sockets) {
                detach(socket);
            }

            detach(box);
        };
        const deleteSelection = () => {
            const boxes = self.selection.slice(0);
            for (const box of boxes) {
                deleteBox(box);
            }
            setSelection([]);
        };
        const createBox = (name: string, x: number, y: number, code: ICodeBlock) => {
            const box = addBox(name, x, y, code);
            // setSelection(box);
            return box;
        };
        const startDragArrow = (socket: modelTypes['Socket']) => {
            const { x, y } = socket;
            if (socket.isInput && socket.arrows.length > 0) return;
            self.draggedArrow = models.DraggedArrow.create({ startX: x, startY: y, endX: x, endY: y });
            setDraggedFromSocket(socket);
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
            const [input, output] = from.isInput ? [from, to] : [to, from];
            return Boolean(values(self.arrows).find(a => {
                return (!input || a.input === input) &&
                    (!output || a.output === output);
            }));
        };
        const addArrow = (input: modelTypes['Socket'], output: modelTypes['Socket']) => {
            if (input.isCompatibleWith(output) &&
                !hasArrow(input, output)) {
                let arrow: null | modelTypes['Arrow'] = null;
                arrow = models.Arrow.create({ input, output });
                self.arrows.put(arrow);
                return arrow;
            }

            return null;

        };
        const addArrowFromDraggedSocket = (socket: modelTypes['Socket']) => {
            if (!self.draggedFromSocket) return;
            const [input, output] = socket.isInput ? [socket, self.draggedFromSocket] : [self.draggedFromSocket, socket];
            setDraggedFromSocket(null);
            return addArrow(input, output);
        };
        const setDraggedFromSocket = (socket: modelTypes['Socket'] | null) => {
            self.draggedFromSocket = socket;
        };
        const endDragArrow = (
            socket?: modelTypes['Socket'] | null,
            clientX = self.draggedArrow!.endX,
            clientY = self.draggedArrow!.endY,
        ) => {
            self.draggedArrow = null;
            if (!self.draggedFromSocket) return;
            if (socket) {
                addArrowFromDraggedSocket(socket);
            } else if (self.contextMenu) {
                const { isInput, isExec, code } = self.draggedFromSocket;
                let typeFilter: null | ((code: ICodeBlock) => boolean) = null;
                if (isExec) {
                    if (isInput) {
                        typeFilter = (c) => c.execOutputs.some(i => i.type === code.type);
                    } else {
                        typeFilter = (c) => c.execInputs.some(i => i.type === code.type);
                    }
                } else {
                    switch (code.type) {
                        case 'number':
                        case 'string':
                            if (isInput) {
                                typeFilter = (c) => c.returns ? c.returns.type === 'any' || c.returns.type === code.type : false;
                            } else {
                                typeFilter = (c) => c.inputs.some(i => i.type === 'any' || i.type === code.type);
                            }
                    }
                }
                setTimeout(() => self.contextMenu!.toggle(true, clientX, clientY, typeFilter));
            }
        };
        const deleteArrowsForSocket = (socket: modelTypes['Socket']) => {
            for (const arrow of values(self.arrows)) {
                if (arrow.input === socket || arrow.output === socket) {
                    detach(arrow);
                    // arrowsToDelete.push(arrow._id);
                }
            }
            // for (const id of arrowsToDelete) {
            //     self.arrows.delete(id);
            // }
        };
        const runCode = () => {
            return getEnv(self).run(self.boxes);
        };
        const addSocketToBox = (box: modelTypes['Box'], type: SocketTypeEnum, code: ICodeBlockIO) => {
            const s = models.Socket.create({ socketType: type, name: code.name, code });
            self.sockets.put(s);
            box.addSocket(s);
            return s;
        };
        const moveBoxOrSelection = (box: modelTypes['Box'], dx: number, dy: number) => {
            if (self.selection.length > 0) {
                for (const box of self.selection) {
                    box.move(dx, dy);
                }
            } else {
                box.move(dx, dy);
            }
        };

        return {
            addBox,
            addBoxAndArrowIfDragged,
            hasArrow,
            setSelection,
            addToSelection,
            createBox,
            deleteSelection,
            deleteBox,
            addArrow,
            startDragArrow,
            moveDragArrow,
            endDragArrow,
            setDraggedFromSocket,
            deleteArrowsForSocket,
            runCode,
            addSocketToBox,
            moveBoxOrSelection,
        };
    })



/*
    The store that holds our domain: boxes and arrows
*/

export const defaults: IStoreSnapshot = {
    boxes: {},
    arrows: {},
    contextMenu: {},
    codeBlocks: { ...codeBlocks.functions },
    selection: [],
    draggedArrow: null,
    draggedFromSocket: null
};

/* istanbul ignore next */
export const getStore = (data?: IStoreSnapshot) => {
    return Store.create({ ...defaults, ...data }, { run });
}

export const replaceStore = (newStore: IStore, oldStore: IStore) => {
    applySnapshot(newStore, { ...getSnapshot(oldStore), codeBlocks: { ...codeBlocks.functions } });
};

type IStoreType = typeof Store.Type;
export interface IStore extends IStoreType { };
type IStoreSnapshotType = typeof Store.SnapshotType;
export interface IStoreSnapshot extends IStoreSnapshotType { };
