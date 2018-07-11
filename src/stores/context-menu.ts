import { types, hasParent, getParent } from 'mobx-state-tree'
import { IStore } from './domain-state';
import { modelTypes } from './models';
import { values, filterBy } from './utils/utils';

export const ContextMenu = types.model('ContextMenu', {
    position: types.optional(types.model({ left: types.number, top: types.number }), { left: 0, top: 0 }),
    isOpen: types.optional(types.boolean, false),
    filter: types.optional(types.string, '')
})
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
            return filterBy(self.sortedCodeBlocks, self.filter, b => b.name);
        }
    }))
    .actions(self => ({
        toggle(value?: boolean) {
            if (typeof value === 'boolean') self.isOpen = value;
            else self.isOpen = !self.isOpen;
            if (!self.isOpen) self.filter = '';
        },
        setFilter(value: string) {
            self.filter = value;
        },
        handleContextMenu(contextMenuElement: HTMLElement, event: MouseEvent) {
            if (!contextMenuElement) return;
            self.isOpen = true;

            const clickX = event.clientX;
            const clickY = event.clientY;
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
    }));

type IContextMenuType = typeof ContextMenu.Type;
export interface IContextMenu extends IContextMenuType { };