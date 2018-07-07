import { types } from 'mobx-state-tree'
import { Socket } from './socket';
import { calculateBezierPoints } from '../utils/utils';
import { pouch } from '../utils/pouchdb-model';



export const Arrow = pouch.model('Arrow', {
    input: types.reference(Socket),
    output: types.reference(Socket)
}).views(self => {
    return {
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
