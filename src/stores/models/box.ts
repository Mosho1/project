import { getParent, hasParent } from 'mobx-state-tree'
import { pouch } from '../utils/pouchdb-model';
import { IStore } from '../domain-state';

export const Box = pouch.model('Box',
    {
        name: 'hal',
        x: 0,
        y: 0,
        width: 100,
        height: 100
    })
    .views(self => ({
        get store(): IStore | null {
            if (!hasParent(self)) return null;
            return getParent(self, 2);
        },
    }))
    .views(self => ({
        get isSelected() {
            return Boolean(self.store && self.store.selection.find(b => b === self));
        },
    }));

type IBoxType = typeof Box.Type;
export interface IBox extends IBoxType { };
