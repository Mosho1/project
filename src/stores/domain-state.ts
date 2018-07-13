import { types } from 'mobx-state-tree'
import { pouch } from './utils/pouchdb-model';
import { Box, IBox } from './models/box';

export const Store = pouch.store('Store', {
    boxes: types.optional(types.map(Box), {}),
    selection: types.optional(types.array(types.reference<IBox>(Box)), []),
})
    .actions(self => {
        const addBox = (name: string, x: number, y: number) => {
            const box = Box.create({ name, x, y });
            self.boxes.put(box);
            return box;
        };
        const setSelection = (selection: IBox[]) => {
            self.selection.replace(selection);
            return self;
        };
        const deleteBox = (box: IBox) => {
            self.boxes.delete(box._id);
        };
        const deleteSelection = () => {
            const boxes = self.selection.slice(0);
            for (const box of boxes) {
                deleteBox(box);
            }
            setSelection([]);
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

type IStoreType = typeof Store.Type;
export interface IStore extends IStoreType { };
type IStoreSnapshotType = typeof Store.SnapshotType;
export interface IStoreSnapshot extends IStoreSnapshotType { };
