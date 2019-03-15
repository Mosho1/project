import { IExtendedObservableMap } from 'mobx-state-tree';

import { modelTypes } from '../models';

import _ from 'lodash';
import { Compiler, Line } from './compiler';
import {js} from 'js-beautify';

class JSCompiler extends Compiler {
    compileLine = (line: Line) => {
        const { numLines, name, box, args, index } = line;
        if (numLines != null) return '}';
        else if (box && args && name) {
            const compileArithmetic = (op: string) => `const ${line.name} = ${args.join(` ${op} `)};`;
            switch (box.code.id) {
                case 'number':
                case 'boolean':
                    return `const ${line.name} = ${_.values(box.valuesValueMap)[0]};`;
                case 'string':
                    return `const ${line.name} = "${_.values(box.valuesValueMap)[0]}";`;
                case 'add':
                case 'concat':
                    return compileArithmetic('+');
                case 'mul':
                    return compileArithmetic('*');
                case 'div':
                    return compileArithmetic('/');
                case 'mod':
                    return compileArithmetic('%');
                case 'log':
                    return `console.log(${args.join(', ')});`;
                case 'forLoop':
                    const start = args[0];
                    const end = args[1];
                    const step = args[2];
                    return `for (let ${name} = ${start}; ${name} <= ${end}; ${name} += ${step}) {`
                case 'ifElse':
                    if (index === 0)
                        return `if (${args[0]}) {`
                    else
                        return 'else {'
            }
        }
        return null;
    }

    compileLines() {
        return js(this.lines.map(this.compileLine).filter(Boolean).join('\n'));
    }
}

export function compileToJS(boxes: IExtendedObservableMap<modelTypes['Box']>) {
    return new JSCompiler(boxes).compile();
};

export default compileToJS;