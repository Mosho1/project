import { types } from 'mobx-state-tree'
import { Socket, ISocket } from './socket';
import { calculateBezierPoints } from '../utils/utils';
import { pouch } from '../utils/pouchdb-model';

export const Arrow = pouch.model('Arrow', {
    input: types.reference<ISocket>(Socket),
    output: types.reference<ISocket>(Socket)
}).volatile(_ => ({
    onEmit: null as Function | null,
})).views(self => {
    return {
        get color() {
            return self.output.color;
        },
        get points() {
            return calculateBezierPoints(
                self.output.x,
                self.output.y,
                self.input.x,
                self.input.y,
            );
        },
        get isExec() {
            return self.input.isExec;
        }
    };
}).actions(self => ({
    setOnEmit(fn: Function | null) {
        self.onEmit = fn;
    }
}));

type IArrowType = typeof Arrow.Type;

export interface IArrow extends IArrowType {};