import { types, getParent, hasParent } from 'mobx-state-tree'
import { pouch } from '../utils/pouchdb-model';
import { Socket, ISocket } from './socket';
import { IStore } from '../domain-state';
import { CodeBlock, ICodeBlock } from './code-block';
import { checkRuntimeType } from './types';

interface BoxEditableProps {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    scaleX?: number;
    scaleY?: number;
}

const BoxValue = types.model('BoxValue', {
    name: '',
    value: types.frozen,
    validationMessage: ''
})
    .volatile(_self => ({
        width: 50,
    }))
    .views(self => ({
        get box(): IBox {
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
            return self.index * self.width + 10;
        },
        get y() {
            return 3 * self.box.height / 5;
        },
        get type() {
            return self.box.code.values[self.index].type;
        },
        get isValid() {
            return !self.validationMessage;
        }
    }))
    .actions(self => ({
        setValue(value: string | boolean) {
            try {
                checkRuntimeType(self.type, value);
                self.validationMessage = '';
            } catch (e) {
                self.validationMessage = e.message;
            } finally {
                self.value = value;
            }
        }
    }));

type IBoxValueType = typeof BoxValue.Type;
export interface IBoxValue extends IBoxValueType { };
type IBoxValueSnapshotType = typeof BoxValue.SnapshotType;
export interface IBoxValueSnapshot extends IBoxValueSnapshotType { };

export const Box = pouch.model('Box',
    {
        name: 'hal',
        x: 0,
        y: 0,
        values: types.optional(types.array<IBoxValueSnapshot, IBoxValue>(BoxValue), []),
        sockets: types.optional(types.array(types.reference<ISocket>(Socket)), []),
        code: types.reference<ICodeBlock>(CodeBlock),
        breakpoint: false
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
            return Boolean(self.store && self.store.selection.find(b => b === self));
        },
        get isBreaking() {
            return Boolean(self.store && self.store.breakPosition === self);
        },
        get height() {
            return 50 + Math.max(
                self.execInputs.length + self.inputs.length,
                self.execOutputs.length + self.outputs.length)
                * 30;
        },
        get isValid() {
            return self.values.every(v => v.isValid);
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
        addSocket(socket: ISocket) {
            self.sockets.push(socket);
            return socket;
        },
        setValue(key: string, value: any) {
            /* istanbul ignore next */
            self.valuesMap[key].setValue(value);
        },
        toggleBreakpoint(value?: boolean) {
            if (typeof value === 'boolean') self.breakpoint = value;
            else self.breakpoint = !self.breakpoint;
        }
    }));

type IBoxType = typeof Box.Type;
export interface IBox extends IBoxType { };

// export const Box = BoxModel as IModelType<Snapshot<IBox>, IBox>;
