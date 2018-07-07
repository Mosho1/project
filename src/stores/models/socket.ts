import { values } from 'mobx'
import { types, getParentOfType } from 'mobx-state-tree'
import { randomUuid } from '../utils/utils';
import { Store } from '../domain-state';
import { Box, BoxType } from './box';

export const Socket = types.model('Socket', {
    id: types.optional<string, string>(types.identifier(), randomUuid) as any as string,
    socketType: types.union(types.literal('input'), types.literal('output')),
    name: types.optional(types.string, '')
})
    .views(self => ({
        get box(): BoxType {
            return getParentOfType(self, Box);
        },
        get store(): typeof Store.Type {
            return getParentOfType(self, Store);
        } 
    }))
    .views(self => ({
        get index() {
            switch (self.socketType) {
                case 'input':
                    return self.box.leftSockets.findIndex(s => s === self);
                case 'output':
                    return self.box.rightSockets.findIndex(s => s === self);
            }
            return 0;
        },
        get arrows() {
            return values(self.store.arrows).filter(a => a.input === self || a.output === self);
        }
    }))
    .views(self => {
        return {
            get x() {
                if (self.socketType === 'input') {
                    return self.box.x + 18;
                } else {
                    return self.box.x + self.box.width - 18;
                }
            },
            get y() {
                return 50 + self.box.y + self.index * 30;
            }
        };
    })
    .actions(self => {
        return {
            setName(name: string | null) {
                self.name = name || '';
            }
        }
    });

export type SocketType = typeof Socket.Type;
    