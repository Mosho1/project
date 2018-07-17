import { modelTypes } from './models';
import { IExtendedObservableMap } from 'mobx-state-tree';
import { values, noop } from './utils/utils';
import { checkStaticType } from './models/types';

const disposers: Function[] = [];

const globalContext = {
    onBreak: false
};

interface callbacks {
    onBreakpoint?: (box: modelTypes['Box'], cb: Function) => void;
    onEmit?: (arrow: modelTypes['Arrow']) => void;
}
export const runBox = async (box: modelTypes['Box'], callbacks: callbacks): Promise<any> => {

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

            await Promise.all(execOutput.arrows.map(a => {
                if (callbacks.onEmit) {
                    callbacks.onEmit(a);
                }
                return runBox(a.input.box!, callbacks);
            }));
        }
    };

    const { onBreakpoint } = callbacks;
    if (box.breakpoint && onBreakpoint) {
        globalContext.onBreak = true;
        await new Promise(resolve => {
            onBreakpoint(box, resolve);
        });
        globalContext.onBreak = false;
    }

    let args = [];
    for (const input of box.inputs) {
        const arrow = input.arrows[0]
        const fromOutput = arrow.output;
        if (callbacks.onEmit) {
            callbacks.onEmit(arrow);
        }
        const value = await runBox(fromOutput.box!, callbacks);
        checkStaticType(fromOutput.code.type, value);
        args.push(value);
    }

    const ret = box.code.code.apply(context, args);

    if (context.dispose !== noop) {
        disposers.push(context.dispose);
    }

    return ret;
};

export const run = (boxes: IExtendedObservableMap<modelTypes['Box']>, callbacks: callbacks) => {
    const start = values(boxes).find(b => b.code.runOnStart);
    if (!start) {
        throw new Error('no start found');
    }

    return runBox(start, callbacks);
};

export const stop = () => {
    globalContext.onBreak = false;
    for (const fn of disposers) {
        fn();
    }
};
