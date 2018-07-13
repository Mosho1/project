import { types, hasParent, getParent } from 'mobx-state-tree'
import { IStore } from './domain-state';
import { modelTypes } from './models';
import { values, filterBy } from './utils/utils';
import { codeType, ICodeBlock } from './models/code-block';

export const ContextMenu = types.model('ContextMenu', {
    position: types.optional(types.model({ left: types.number, top: types.number }), { left: 0, top: 0 }),
    isOpen: types.optional(types.boolean, false),
    filter: types.optional(types.string, ''),
    typeFilter: types.maybe(codeType)
}).volatile(_self => ({
    ref: null as null | HTMLElement
}))
    .views(self => ({
        get store(): null | IStore {
            if (!hasParent(self, 1)) return null;
            return getParent(self, 1);
        },
    }))
    .views(self => ({
        get sortedCodeBlocks(): modelTypes['CodeBlock'][] {
            return values(self.store!.codeBlocks).slice().sort((a, b) => a.name > b.name ? 1 : -1);
        }
    }))
    .views(self => ({
        get filteredCodeBlocks(): modelTypes['CodeBlock'][] {
            const filtered = filterBy(self.sortedCodeBlocks, self.filter, b => b.name);
            if (!self.typeFilter) return filtered;
            return filtered.filter(self.typeFilter as (codeBock: ICodeBlock) => boolean);
        }
    }))
    .actions(self => ({
        setRef(ref: null | HTMLElement) {
            self.ref = ref;
        },
        setFilter(value: string) {
            self.filter = value;
        },
        handleContextMenu(clientX: number, clientY: number, contextMenuElement = self.ref) {
            if (!contextMenuElement) return;
            self.isOpen = true;

            const clickX = clientX;
            const clickY = clientY;
            const screenW = window.innerWidth;
            const screenH = window.innerHeight;
            const rootW = contextMenuElement.offsetWidth;
            const rootH = contextMenuElement.offsetHeight;

            const right = (screenW - clickX) > rootW;
            const left = !right;
            const top = (screenH - clickY) > rootH;
            const bottom = !top;

            if (right) {
                self.position.left = clickX + 5;
            }

            if (left) {
                self.position.left = clickX - rootW - 5;
            }

            if (top) {
                self.position.top = clickY + 5;
            }

            if (bottom) {
                self.position.top = clickY - rootH - 5;
            }
        }
    })).actions(self => ({
        _toggle(value: boolean, typeFilter?: null | ((codeBock: ICodeBlock) => boolean)) {
            if (typeof value === 'boolean') self.isOpen = value;
            else self.isOpen = !self.isOpen;
            if (typeFilter) {
                self.typeFilter = typeFilter;
            }
            if (!self.isOpen) {
                self.filter = '';
                self.typeFilter = null;
            }
            return self.isOpen;
        },
    })).volatile(self => ({
        toggle(value: boolean, clientX = 0, clientY = 0, typeFilter?: null | ((codeBock: ICodeBlock) => boolean)) {
            if (self._toggle(value, typeFilter)) {
                self.handleContextMenu(clientX, clientY);
            }
        }
    }));

type IContextMenuType = typeof ContextMenu.Type;
export interface IContextMenu extends IContextMenuType { };