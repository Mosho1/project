import { modelTypes } from './models';
import { IExtendedObservableMap } from 'mobx-state-tree';
import { values } from './utils/utils';

const disposers: Function[] = [];

const noop = () => { };

const globalContext = {
    onBreak: false
};
export const runBox = async (box: modelTypes['Box'], onBreakpoint?: (box: modelTypes['Box'], cb: Function) => void): Promise<any> => {

    const context = {
        get onBreak() {
            return globalContext.onBreak;
        },
        values: box.valuesValueMap,
        dispose: noop,
        async emit(eventName = '') {
            const execOutput = box.execOutputs.find(x => x.name === eventName);
            if (!execOutput) {
                throw new Error(`no execOutput found for event: ${eventName}`);
            }
            for (const a of execOutput.arrows) {
                await runBox(a.input.box!, onBreakpoint);
            }
        }
    };

    if (box.breakpoint && onBreakpoint) {
        globalContext.onBreak = true;
        await new Promise(resolve => {
            onBreakpoint(box, resolve);
        });
        globalContext.onBreak = false;
    }

    let args = [];
    for (const input of box.inputs) {
        const fromOutput = input.arrows[0].output;
        args.push(await runBox(fromOutput.box!, onBreakpoint));
    }

    const ret = box.code.code.apply(context, args);

    if (context.dispose !== noop) {
        disposers.push(context.dispose);
    }

    return ret;
};

export const run = (boxes: IExtendedObservableMap<modelTypes['Box']>, onBreakpoint?: (box: modelTypes['Box'], cb: Function) => void) => {
    const start = values(boxes).find(b => b.code.runOnStart);
    if (!start) {
        throw new Error('no start found');
    }

    return runBox(start, onBreakpoint);
};

export const stop = () => {
    globalContext.onBreak = false;
    for (const fn of disposers) {
        fn();
    }
};
