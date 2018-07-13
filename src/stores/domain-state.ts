import { types, applySnapshot, getSnapshot, detach, } from 'mobx-state-tree'
import { pouch } from './utils/pouchdb-model';
import { SocketTypeEnum, Socket, } from './models/socket';
import { Box, IBox } from './models/box';

export const Store = pouch.store('Store', {
    boxes: types.optional(types.map(Box), {}),
    sockets: types.optional(types.map(Socket), {}),
    selection: types.optional(types.array(types.reference<IBox>(Box)), []),
})
    .actions(self => {
        const addBox = (name: string, x: number, y: number) => {
            const box = Box.create({ name, x, y });
            addSocketToBox(box, 'input');
            addSocketToBox(box, 'output');
            self.boxes.put(box);
            return box;
        };
        const setSelection = (selection: IBox[]) => {
            self.selection.replace(selection);
            return self;
        };
        const deleteBox = (box: IBox) => {
            for (const socket of box.sockets) {
                detach(socket);
            }
            self.boxes.delete(box._id);
            // detach(box);
        };
        const deleteSelection = () => {
            const boxes = self.selection.slice(0);
            for (const box of boxes) {
                deleteBox(box);
            }
            setSelection([]);
        };
        const addSocketToBox = (box: IBox, type: SocketTypeEnum) => {
            const s = Socket.create({ socketType: type, name: 'name' });
            self.sockets.put(s);
            box.addSocket(s);
            return s;
        };
        return {
            addBox,
            setSelection,
            deleteSelection,
            deleteBox,
        };
    })



/*
    The store that holds our domain: boxes and arrows
*/

export const defaults: IStoreSnapshot = {
    boxes: {

    },
    selection: [],
};

/* istanbul ignore next */
export const getStore = (data?: IStoreSnapshot) => {
    const st = Store.create({ ...defaults, ...data });
    st.addBox('test', 50, 50);
    return st;
}

export const replaceStore = (newStore: IStore, oldStore: IStore) => {
    applySnapshot(newStore, { ...getSnapshot(oldStore)});
};

type IStoreType = typeof Store.Type;
export interface IStore extends IStoreType { };
type IStoreSnapshotType = typeof Store.SnapshotType;
export interface IStoreSnapshot extends IStoreSnapshotType { };
