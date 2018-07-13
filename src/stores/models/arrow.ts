import { types } from 'mobx-state-tree'
import { Socket, ISocket } from './socket';
import { calculateBezierPoints } from '../utils/utils';
import { pouch } from '../utils/pouchdb-model';

export const Arrow = pouch.model('Arrow', {
    input: types.reference<ISocket>(Socket),
    output: types.reference<ISocket>(Socket)
}).views(self => {
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
});

type IArrowType = typeof Arrow.Type;
export interface IArrow extends IArrowType {};