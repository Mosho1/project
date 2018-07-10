import { types, getEnv } from 'mobx-state-tree'
import { pouch } from './utils/pouchdb-model';
import { models, modelTypes } from './models/index';
import { ContextMenu } from './context-menu';
import { ICodeBlock } from './models/code-block';
import * as codeBlocks from './functions';
import { values } from './utils/utils';
import { run } from './run';

export const Store = pouch.store('Store', {
    boxes: types.optional(types.map(models.Box), {}),
    arrows: types.optional(types.map(models.Arrow), {}),
    codeBlocks: types.optional(types.map(models.CodeBlock), {}),
    selection: types.maybe(types.reference(models.Box)),
    draggedArrow: types.maybe(models.DraggedArrow),
    draggedFromSocket: types.maybe(types.reference(models.Socket)),
    contextMenu: types.maybe(ContextMenu)
})
    .views(self => ({
        get sortedCodeBlocks(): ICodeBlock[] {
            return values(self.codeBlocks).slice().sort((a, b) => a.name > b.name ? 1 : -1);
        }
    }))
    .actions(self => {
        const addBox = (name: string, x: number, y: number, code: ICodeBlock) => {
            const box = models.Box.create({ name, x, y, code });
            const { inputs, returns, execInputs, execOutputs } = code;
            for (const input of inputs) {
                box.addSocket('input', input.name);
            }
            if (returns && returns !== 'void') {
                box.addSocket('output');
            }
            for (const input of execInputs) {
                box.addSocket('execInput', input);
            }
            for (const output of execOutputs) {
                box.addSocket('execOutput', output);
            }
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
        const createBox = (name: string, x: number, y: number, code: ICodeBlock) => {
            const box = addBox(name, x, y, code);
            setSelection(box);
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
            const arrowsToDelete = [];
            for (const arrow of self.arrows.values()) {
                if (arrow.input === socket || arrow.output === socket) {
                    arrowsToDelete.push(arrow._id);
                }
            }
            for (const id of arrowsToDelete) {
                self.arrows.delete(id);
            }
        };
        const runCode = () => {
            return getEnv(self).run(self.boxes);
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
            deleteArrowsForSocket,
            runCode
        };
    })



/*
    The store that holds our domain: boxes and arrows
*/



const defaults: IStoreSnapshot = {
    boxes: {},
    arrows: {},
    contextMenu: {},
    codeBlocks: { ...codeBlocks },
    selection: null,
    draggedArrow: null,
    draggedFromSocket: null
};

/* istanbul ignore next */
export const getStore = (data?: IStoreSnapshot) => {
    return Store.create({ ...defaults, ...data }, { run });
}

type IStoreType = typeof Store.Type;
export interface IStore extends IStoreType { };
type IStoreSnapshotType = typeof Store.SnapshotType;
export interface IStoreSnapshot extends IStoreSnapshotType { };