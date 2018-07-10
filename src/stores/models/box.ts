import { types, getParent, hasParent } from 'mobx-state-tree'
import { pouch } from '../utils/pouchdb-model';
import { Socket } from './socket';
import { IStore } from '../domain-state';
import { CodeBlock } from './code-block';
import { modelTypes } from './index';

interface BoxEditableProps {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    scaleX?: number;
    scaleY?: number;
}

const BoxValue = types.model('BoxValue', {
    name: types.string,
    value: types.string,
})
    .volatile(_self => ({
        width: 50,
    }))
    .views(self => ({
        get box(): modelTypes['Box'] {
            if (!hasParent(self, 2)) return null as any;
            return getParent(self, 2);
        },
    }))
    .views(self => ({
        get index() {
            return self.box.values.findIndex(v => v === self);
        }
    }))
    .views(self => ({
        get x() {
            return self.box.x + self.index * self.width + 10;
        },
        get y() {
            return self.box.y + 3 * self.box.height / 5;
        },
    }));

type IBoxValueType = typeof BoxValue.Type;
export interface IBoxValue extends IBoxValueType { };

export const Box = pouch.model('Box',
    {
        name: 'hal',
        x: 0,
        y: 0,
        values: types.optional(types.array(BoxValue), []),
        sockets: types.optional(types.array(types.reference(Socket)), []),
        code: types.reference(CodeBlock)
    })
    .volatile(_self => ({
        width: 150,
    }))
    .views(self => ({
        get store(): IStore | null {
            if (!hasParent(self)) return null;
            return getParent(self, 2);
        },
        get valuesMap() {
            return self.values.reduce((acc, cur) => {
                acc[cur.name] = cur;
                return acc;
            }, {} as { [index: string]: typeof BoxValue.Type });
        },
        get valuesValueMap() {
            return self.values.reduce((acc, cur) => {
                acc[cur.name] = cur.value;
                return acc;
            }, {} as { [index: string]: string });
        },
        get inputs() {
            return self.sockets.filter(({ socketType }) => socketType === 'input');
        },
        get outputs() {
            return self.sockets.filter(({ socketType }) => socketType === 'output');
        },
        get execInputs() {
            return self.sockets.filter(({ socketType }) => socketType === 'execInput');
        },
        get execOutputs() {
            return self.sockets.filter(({ socketType }) => socketType === 'execOutput');
        },

    }))
    .views(self => ({
        get isSelected() {
            return Boolean(self.store && self.store.selection === self);
        },
        get height() {
            return 50 + Math.max(
                self.execInputs.length + self.inputs.length,
                self.execOutputs.length + self.outputs.length)
                * 30;
        }
    }))
    .actions(self => ({
        move(dx: number, dy: number) {
            self.x += dx;
            self.y += dy;
            return self;
        },
        setProps(props: BoxEditableProps) {
            /* istanbul ignore next */
            Object.assign(self, props);
        },
        addSocket(socket: modelTypes['Socket']) {
            self.sockets.push(socket);
            return socket;
        },
        setValue(key: string, value: string) {
            /* istanbul ignore next */
            self.valuesMap[key].value = value;
        }
    }));

type IBoxType = typeof Box.Type;
export interface IBox extends IBoxType { };
