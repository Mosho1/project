/* istanbul ignore file */

type Emitter = { values: any, emit: (name: string) => void };

export const start = {
    name: 'start',
    id: 'start',
    runOnStart: true,
    code: function code(this: Emitter) {
        this.emit('');
    },
    execOutputs: ['']
};

export const add = {
    name: 'add',
    id: 'add',
    code: function code(a: number, b: number) {
        return a + b;
    },
    inputs: [
        { name: 'a', type: 'number' },
        { name: 'b', type: 'number' },
    ],
    returns: 'number'
};

export const log = {
    name: 'log',
    id: 'log',
    code: function code(value: any) {
        console.log(value);
    },
    inputs: [{ name: 'input', type: 'any' }],
    execInputs: [''],
    returns: 'void'
};

export const number = {
    name: 'number',
    id: 'number',
    values: [
        { name: 'value', type: 'number' },
    ],
    code: function code(this: Emitter) {
        return Number(this.values.value);
    },
    returns: 'number'
};


