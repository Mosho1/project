import { ICodeBlockSnapshot } from './models/code-block';

/* istanbul ignore file */

type Emitter = {
    values: { [index: string]: any },
    emit: (name?: string) => void,
    dispose: Function,
    onBreak: boolean
};

export const functions: { [index: string]: ICodeBlockSnapshot } = {
    start: {
        name: 'start',
        id: 'start',
        runOnStart: true,
        code: function code(this: Emitter) {
            this.emit('');
        },
        execOutputs: [{}],
    },
    interval: {
        name: 'interval',
        id: 'interval',
        runOnStart: true,
        code: function code(this: Emitter) {
            const interval = Number(this.values.interval);
            const id = setInterval(() => {
                if (!this.onBreak) {
                    this.emit();
                }
            }, interval);
            this.dispose = () => clearInterval(id);
        },
        values: [
            { name: 'interval', type: 'number' },
        ],
        execOutputs: [{}],
    },
    add: {
        name: 'add',
        id: 'add',
        code: function code(a: number, b: number) {
            return a + b;
        },
        inputs: [
            { name: 'a', type: 'number' },
            { name: 'b', type: 'number' },
        ],
        returns: { type: 'number' }
    },
    log: {
        name: 'log',
        id: 'log',
        code: function code(value: any) {
            console.log(value);
        },
        inputs: [{ name: 'input', type: 'any' }],
        execInputs: [{}],
        returns: { type: 'void' }
    },
    number: {
        name: 'number',
        id: 'number',
        values: [
            { name: 'value', type: 'number' },
        ],
        code: function code(this: Emitter) {
            return Number(this.values.value);
        },
        returns: { type: 'number' }
    },
    string: {
        name: 'string',
        id: 'string',
        values: [
            { name: 'value', type: 'string' },
        ],
        code: function code(this: Emitter) {
            return this.values.value;
        },
        returns: { type: 'string' }
    },
    boolean: {
        name: 'boolean',
        id: 'boolean',
        values: [
            { name: 'value', type: 'boolean' },
        ],
        code: function code(this: Emitter) {
            return this.values.value;
        },
        returns: { type: 'boolean' }
    },
    concat: {
        name: 'concat',
        id: 'concat',
        inputs: [{ name: 'a', type: 'string' }, { name: 'b', type: 'string' }],
        returns: { type: 'string' },
        code: function code(a: string, b: string) {
            return a + b;
        }
    }
};

for (let k in functions) {
    const fn = functions[k];
    if (k !== fn.id) throw new Error('function id different from key');
    if (fn.inputs) fn.inputs = fn.inputs.map((x: any, i: number) => ({ ...x, id: `${k}/inputs/${i}` }))
    if (fn.execInputs) fn.execInputs = fn.execInputs.map((x: any, i: number) => ({ ...x, id: `${k}/execInputs/${i}` }))
    if (fn.execOutputs) fn.execOutputs = fn.execOutputs.map((x: any, i: number) => ({ ...x, id: `${k}/execOutputs/${i}` }))
    if (fn.returns) fn.returns.id = `${k}/returns`;
}



// import * as _ from 'lodash';

// for (let k in _) {
//     const name = `_.${k}`;
//     (functions as any)[name] = {
//         name,
//         id: name,
//         code: function code(this: Emitter, ...args: any[]) {
//             return require('lodash/' + k)(...args);
//         },
//         inputs: Array((_ as any)[k].length).fill(null).map((_, i) => ({name: i.toString(), type: 'number'})),
//         returns: {type: 'number'}
//     };
//     console.log((functions as any)[name].inputs);
// }
