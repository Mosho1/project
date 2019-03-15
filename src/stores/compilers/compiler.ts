
import { IExtendedObservableMap } from 'mobx-state-tree';

import { modelTypes } from '../models';

import { values } from 'mobx';

export interface Line {
    name?: string,
    box?: modelTypes['Box'],
    args?: string[],
    index?: number;
    numLines?: number;
}

export abstract class Compiler {
    start?: modelTypes['Box'];
    lines: Line[] = [];

    abstract compileLines(): string;

    constructor(boxes: IExtendedObservableMap<modelTypes['Box']>) {
        this.start = values(boxes).find(b => b.code.runOnStart);
    }

    variableCounter = 1;
    getNextVariableName() {
        return 'v' + this.variableCounter++;
    }

    isBlock(fnId: string) {
        return fnId === 'forLoop' || fnId === 'ifElse';
    }

    visited: { [index: string]: string } = {};

    visit(box?: null | modelTypes['Box']) {
        if (!box) return '';
        if (this.visited[box._id]) return this.visited[box._id];
        const inputArgs = box.inputs.map(i => this.visit(i.arrows[0].output.box));
        const name = this.getNextVariableName();
        this.visited[box._id] = name;

        if (box.execOutputs.length === 0) {
            this.lines.push({
                name,
                args: inputArgs,
                box,
            });
        }

        for (const [index, execOutput] of box.execOutputs.entries()) {
            this.lines.push({
                name,
                args: inputArgs,
                box,
                index
            });
            let numLines = this.lines.length;
            for (const arrow of execOutput.arrows) {
                this.visit(arrow.input.box);
            }
            if (this.isBlock(box.code.id)) {
                this.lines.push({ numLines: this.lines.length - numLines });
            }
        }

        return name;
    }

    compile() {
        if (!this.start) {
            throw new Error('no start found');
        }
        this.visit(this.start);
        return this.compileLines();
    }
}