import { modelTypes } from './models';
import { IExtendedObservableMap } from 'mobx-state-tree';
import { values } from './utils/utils';

export const runBox = (box: modelTypes['Box']): any => {

    const context = {
        values: box.valuesMap,
        emit(eventName: string) {
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

    return box.code.code.apply(context, args);

};

export const run = (boxes: IExtendedObservableMap<modelTypes['Box']>) => {
    const start = values(boxes).find(b => b.code.runOnStart);
    if (!start) {
        throw new Error('no start found');
    }

    runBox(start);
};
