import { modelTypes } from './models';
import { IExtendedObservableMap } from 'mobx-state-tree';
import { values } from './utils/utils';

const disposers: Function[] = [];
const noop = () => {};

export const runBox = (box: modelTypes['Box']): any => {

    const context = {
        values: box.valuesValueMap,
        dispose: noop,
        emit(eventName = '') {
            const execOutput = box.execOutputs.find(x => x.name === eventName);
            if (!execOutput) {
                throw new Error(`no execOutput found for event: ${eventName}`);
            }
            for (const a of execOutput.arrows) {
                runBox(a.input.box!);
            }
        }
    };

    let args = [];
    for (const input of box.inputs) {
        const fromOutput = input.arrows[0].output;
        args.push(runBox(fromOutput.box!));
    }

    const ret = box.code.code.apply(context, args);

    if (context.dispose !== noop) {
        disposers.push(context.dispose);
    }

    return ret;
};

export const run = (boxes: IExtendedObservableMap<modelTypes['Box']>) => {
    const start = values(boxes).find(b => b.code.runOnStart);
    if (!start) {
        throw new Error('no start found');
    }

    runBox(start);
};

export const stop = () => {
    for (const fn of disposers) {
        fn();
    }
};
