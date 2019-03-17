import { ICodeBlockSnapshot } from './models/code-block';
import { RuntimeContext } from './run';
/* istanbul ignore file */

const getMathFunc = (name: string, code: (a: number, b: number) => number) => {
    return {
        name,
        id: name,
        code,
        inputs: [
            { name: 'a', type: 'number' },
            { name: 'b', type: 'number' },
        ],
        returns: { type: 'number' }
    };
};

export const functions: { [index: string]: ICodeBlockSnapshot } = {
    start: {
        name: 'start',
        id: 'start',
        runOnStart: true,
        code: async function code(this: RuntimeContext) {
            await this.emit('');
        },
        execOutputs: [{}],
    },
    interval: {
        name: 'interval',
        id: 'interval',
        code: function code(this: RuntimeContext) {
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
        execInputs: [{}],
    },
    timeout: {
        name: 'timeout',
        id: 'timeout',
        code: function code(this: RuntimeContext, timeout = this.values.timeout) {
            const id = setTimeout(() => {
                if (!this.onBreak) {
                    this.emit();
                }
            }, timeout);
            this.dispose = () => clearTimeout(id);
        },
        values: [
            { name: 'timeout', type: 'number' },
        ],
        inputs: [
            { name: '', type: 'number' },
        ],
        execOutputs: [{}],
        execInputs: [{}],
    },
    add: getMathFunc('add', (a: number, b: number) => a + b),
    sub: getMathFunc('sub', (a: number, b: number) => a - b),
    mul: getMathFunc('mul', (a: number, b: number) => a * b),
    div: getMathFunc('div', (a: number, b: number) => a / b),
    mod: getMathFunc('mod', (a: number, b: number) => a % b),
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
    watch: {
        name: 'watch',
        id: 'watch',
        implicitExec: true,
        values: [
            { name: 'value', type: 'any' }
        ],
        code: function code(this: RuntimeContext, value: any) {
            this.setValue('value', value);
        },
        inputs: [{ name: '', type: 'any' }],
        returns: { type: 'void' }
    },
    number: {
        name: 'number',
        id: 'number',
        values: [
            { name: 'value', type: 'number' },
        ],
        code: function code(this: RuntimeContext) {
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
        code: function code(this: RuntimeContext) {
            return this.values.value;
        },
        returns: { type: 'string' }
    },
    boolean: {
        name: 'boolean',
        id: 'boolean',
        values: [
            { name: 'value', type: 'boolean', defaultValue: true },
        ],
        code: function code(this: RuntimeContext) {
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
    },
    ifElse: {
        name: 'ifElse',
        id: 'ifElse',
        inputs: [{ name: 'condition', type: 'boolean' }],
        code: async function code(this: RuntimeContext, condition: boolean) {
            if (condition) {
                await this.emit('true');
            } else {
                await this.emit('false');
            }
        },
        execInputs: [{}],
        execOutputs: [{ name: 'true' }, { name: 'false' }],
    },
    toString: {
        name: 'toString',
        id: 'toString',
        inputs: [{ type: 'any' }],
        code: (x: any) => x.toString(),
        returns: { type: 'string' }
    },
    Boolean: {
        name: 'Boolean',
        id: 'Boolean',
        inputs: [{ type: 'any' }],
        code: (x: any) => Boolean(x),
        returns: { type: 'boolean' }
    },
    parallel: {
        name: 'parallel',
        id: 'parallel',
        code: async function code(this: RuntimeContext) {
            await Promise.all([this.emit('1'), this.emit('2')]);
        },
        execInputs: [{}],
        execOutputs: [{ name: '1' }, { name: '2' }],
    },
    forLoop: {
        name: 'forLoop',
        id: 'forLoop',
        code: async function code(this: RuntimeContext, start: number, end: number, step: number) {
            for (let i = start; i <= end; i += step) {
                this.setOutput('index', i);
                await this.emit();
            }
        },
        inputs: [
            { name: 'start', type: 'number' },
            { name: 'end', type: 'number' },
            { name: 'step', type: 'number' },
        ],
        returns: { name: 'index', type: 'number' },
        execOutputs: [{}],
        execInputs: [{}],
    },
};

for (let k in functions) {
    const fn = functions[k];
    if (k !== fn.id) throw new Error('function id different from key');
    if (fn.inputs) fn.inputs = fn.inputs.map((x: any, i: number) => ({ ...x, id: `${k}/inputs/${i}` }))
    if (fn.values) fn.values = fn.values.map((x: any, i: number) => ({ ...x, id: `${k}/values/${i}` }))
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
//         code: function code(this: RuntimeContext, ...args: any[]) {
//             return require('lodash/' + k)(...args);
//         },
//         inputs: Array((_ as any)[k].length).fill(null).map((_, i) => ({name: i.toString(), type: 'number'})),
//         returns: {type: 'number'}
//     };
//     console.log((functions as any)[name].inputs);
// }
