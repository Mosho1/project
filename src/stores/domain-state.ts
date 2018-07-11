import { types, getEnv, applySnapshot, getSnapshot, detach } from 'mobx-state-tree'
import { pouch } from './utils/pouchdb-model';
import { models, modelTypes } from './models/index';
import { ContextMenu } from './context-menu';
import { ICodeBlock, ICodeBlockIO } from './models/code-block';
import * as codeBlocks from './functions';
import { values } from './utils/utils';
import { run } from './run';
import { SocketTypeEnum } from './models/socket';

export const Store = pouch.store('Store', {
    boxes: types.optional(types.map(models.Box), {}),
    sockets: types.optional(types.map(models.Socket), {}),
    arrows: types.optional(types.map(models.Arrow), {}),
    codeBlocks: types.optional(types.map(models.CodeBlock), {}),
    selection: types.optional(types.array(types.reference(models.Box)), []),
    draggedArrow: types.maybe(models.DraggedArrow),
    draggedFromSocket: types.maybe(types.reference(models.Socket)),
    contextMenu: types.maybe(ContextMenu)
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
        const setSelection = (selection: modelTypes['Box'][]) => {
            self.selection.replace(selection);
            return self;
        };
        const addToSelection = (selection: modelTypes['Box'][]) => {
            self.selection.push(...selection);
            return self;
        };
        const deleteBox = (box: modelTypes['Box']) => {
            self.selection.remove(box);

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
            const [input, output] = from.isInput ? [from, to] : [to, from];
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
                const [input, output] = socket.isInput ? [socket, self.draggedFromSocket] : [self.draggedFromSocket, socket];
                addArrow(input, output);
            }
            self.draggedFromSocket = null;
        };
        const deleteArrowsForSocket = (socket: modelTypes['Socket']) => {
            for (const arrow of self.arrows.values()) {
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

        return {
            addBox,
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
            deleteArrowsForSocket,
            runCode,
            addSocketToBox
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
