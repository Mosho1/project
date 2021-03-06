import {
    types,
    getEnv,
    applySnapshot,
    getSnapshot,
    detach,
    hasParent,
    getParent
} from 'mobx-state-tree'
import { pouch, MSTPouch } from './utils/pouchdb-model';
import { models, modelTypes } from './models/index';
import { ContextMenu } from './context-menu';
import { ICodeBlock, ICodeBlockIO } from './models/code-block';
import * as codeBlocks from './functions';
import { values } from './utils/utils';
import { run, stop } from './run';
import { SocketTypeEnum, areSocketsCompatible } from './models/socket';
import { observable } from 'mobx';
import { getConversionIfExists } from './models/types';

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
    },
    getAbsolutePosition(x: number, y: number) {
        return {
            x: x - self.position.x,
            y: y - self.position.y,
        }
    },
    getRelativePosition(x: number, y: number) {
        return {
            x: x + self.position.x,
            y: y + self.position.y,
        }
    }
}));

type IStageType = typeof Stage.Type;
export interface IStage extends IStageType { };

const UiStore = types.model('UiStore', {
    sidebar: types.model('Sidebar', {
        context: types.optional(
            types.enumeration('context', ['values', 'names']),
            'values'
        )
    }).actions(self => ({
        setContext(context: 'values' | 'names') {
            self.context = context;
        }
    })),
    programList: types.model('ProgramList', {
        isOpen: types.optional(types.boolean, false)
    }).actions(self => ({
        toggle(isOpen?: boolean) {
            if (typeof isOpen === 'undefined') {
                self.isOpen = !self.isOpen;
            } else {
                self.isOpen = isOpen;
            }
            if (self.isOpen) {
                const store = getParent(self, 2);
                store.getProgramList();
            }
        }
    }))
});

export const Store = pouch.store('Store', {
    name: types.optional(types.string, pouch.dbName),
    boxes: types.optional(types.map(models.Box), {}),
    sockets: types.optional(types.map(models.Socket), {}),
    arrows: types.optional(types.map(models.Arrow), {}),
    codeBlocks: types.optional(types.map(models.CodeBlock), {}),
    selection: types.optional(types.array(types.reference<modelTypes['Box']>(models.Box)), []),
    draggedArrow: types.maybe(models.DraggedArrow),
    draggedRect: types.maybe(models.DraggedRect),
    draggedFromSocket: types.maybe(types.reference<modelTypes['Socket']>(models.Socket)),
    contextMenu: types.maybe(ContextMenu),
    ui: UiStore,
    programList: types.array(types.string),
    stage: types.optional(Stage, {}),
}).volatile(_ => ({
    running: false,
    breakpointCallback: null as Function | null,
    breakPosition: null as modelTypes['Box'] | null
}))
    .views(self => ({
        get isValid() {
            return values(self.boxes).every(b => b.isValid);
        }
    }))
    .actions(self => ({
        setDraggedFromSocket(socket: modelTypes['Socket'] | null) {
            self.draggedFromSocket = socket;
        },
        setBreakpoint(box: modelTypes['Box'], cb: Function) {
            self.breakpointCallback = cb;
            self.breakPosition = box;
        },
        continueAfterBreakpoint() {
            self.breakpointCallback = null;
            self.breakPosition = null;
        },
        deleteDraggedArrow() {
            self.draggedArrow = null;
        },
        setProgramList(programList: string[]) {
            self.programList = observable(programList.slice().sort());
        }
    }))
    .actions((self) => {
        const getProgramList = async () => {
            self.setProgramList(await MSTPouch.allDbs());
        };
        const addBox = (name: string, x: number, y: number, code: ICodeBlock) => {
            const { inputs, returns, execInputs, execOutputs, values } = code;
            const boxValues = values.map(v => ({ name: v.name, value: v.defaultValue || '' }));
            const box = models.Box.create({ name, code, values: boxValues, ...self.stage.getAbsolutePosition(x - 75, y - 60) });
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
        const addBoxAndArrowIfDragged = (name: string, code: ICodeBlock, x: number, y: number) => {
            if (self.draggedArrow) {
                const { endX, endY } = self.draggedArrow;
                const pos = self.stage.getRelativePosition(endX, endY);
                x = pos.x;
                y = pos.y;
            }
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
        const addBoxForConversion = (from: modelTypes['Socket'], to: modelTypes['Socket']) => {
            const [input, output] = from.isInput ? [from, to] : [to, from];
            const conversion = getConversionIfExists(output.code.type, input.code.type);
            if (conversion) {
                const code = self.codeBlocks.get(conversion);
                if (code) {
                    const x = (from.absX + to.absX) / 2;
                    const y = (from.absY + to.absY) / 2;
                    const b = addBox(conversion, x, y, code);
                    b.move(b.width/2, b.height/2);
                    addArrow(input, b.outputs[0]);
                    addArrow(b.inputs[0], output);
                }
                return true;
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
            const { absX, absY } = socket;
            if (socket.isInput && socket.arrows.length > 0) return;
            self.draggedArrow = models.DraggedArrow.create({
                startX: absX,
                startY: absY,
                endX: absX,
                endY: absY,
                fromInput: socket.isInput
            });
            self.setDraggedFromSocket(socket);
        };

        const moveDragArrow = (x: number, y: number) => {
            if (self.draggedArrow) {
                self.draggedArrow.end(x, y);
            }
        };
        const endDragArrow = (
            socket?: modelTypes['Socket'] | null,
            clientX = self.draggedArrow!.endX,
            clientY = self.draggedArrow!.endY,
        ) => {
            if (!self.draggedFromSocket) return;
            if (socket) {
                self.draggedArrow = null;
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

                setTimeout(() => self.contextMenu!.toggle(true, clientX, clientY, typeFilter, self.deleteDraggedArrow));
            }
        };
        const startDragRect = (x: number, y: number) => {
            self.draggedRect = models.DraggedRect.create({ startX: x, startY: y, endX: x, endY: y });
        };
        const moveDragRect = (x: number, y: number) => {
            if (!self.draggedRect) return;
            self.draggedRect.end(x, y);
        };
        const endDragRect = () => {
            if (!self.draggedRect) return;
            const selection = observable<modelTypes['Box']>([]);
            for (const box of values(self.boxes)) {
                if (self.draggedRect.hasIntersection(box)) {
                    selection.push(box);
                }
            }
            self.selection = selection;
            self.draggedRect = null;
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
            } else {
                addBoxForConversion(input, output);
            }
        };
        const addArrowFromDraggedSocket = (socket: modelTypes['Socket']) => {
            if (!self.draggedFromSocket) return;
            const [input, output] = socket.isInput ? [socket, self.draggedFromSocket] : [self.draggedFromSocket, socket];
            self.setDraggedFromSocket(null);
            return addArrow(input, output);
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

        const onBreakpoint: (box: modelTypes['Box'], cb: Function) => void = (box, resume) =>
            self.setBreakpoint(box, resume);

        const onEmit: (arrow: modelTypes['Arrow']) => void =
            (arrow) => arrow.onEmit && arrow.onEmit();

        const runCode = (onBreakpointCallback = onBreakpoint, onEmitCallback = onEmit) => {
            if (self.running) {
                if (self.breakpointCallback) {
                    self.breakpointCallback();
                    self.continueAfterBreakpoint();
                }
            } else {
                self.running = true;
                const env = getEnv<{ run: typeof run }>(self);
                env.run(self.boxes, {
                    onBreakpoint: onBreakpointCallback,
                    onEmit: onEmitCallback
                });
            }
        };

        const stopCode = () => {
            self.running = false;
            self.continueAfterBreakpoint();
            return getEnv(self).stop();
        };

        const addSocketToBox = (box: modelTypes['Box'], type: SocketTypeEnum, code: ICodeBlockIO) => {
            const s = models.Socket.create({ socketType: type, name: code.name, code });
            self.sockets.put(s);
            box.addSocket(s);
            return s;
        };
        const moveBoxOrSelection = (box: modelTypes['Box'], dx: number, dy: number) => {
            if (self.selection.length > 0 && self.selection.indexOf(box) > -1) {
                for (const box of self.selection) {
                    box.move(dx, dy);
                }
            } else {
                box.move(dx, dy);
            }
        };

        return {
            getProgramList,
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
            startDragRect,
            moveDragRect,
            endDragRect,
            deleteArrowsForSocket,
            runCode,
            stopCode,
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
    draggedFromSocket: null,
    ui: {
        sidebar: {
            context: 'values'
        },
        programList: {
            isOpen: false
        }
    },
    programList: []
};

/* istanbul ignore next */
export const getStore = (data?: IStoreSnapshot) => {
    return Store.create({ ...defaults, ...data }, { run, stop });
}

export const replaceStore = (newStore: IStore, oldStore: IStore) => {
    applySnapshot(newStore, { ...getSnapshot(oldStore), codeBlocks: { ...codeBlocks.functions } });
};

type IStoreType = typeof Store.Type;
export interface IStore extends IStoreType { };
type IStoreSnapshotType = typeof Store.SnapshotType;
export interface IStoreSnapshot extends IStoreSnapshotType { };
