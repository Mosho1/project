import { IExtendedObservableMap } from 'mobx-state-tree';

import { modelTypes } from '../models';

import _ from 'lodash';
import { Compiler, Line } from './compiler';

class PythonCompiler extends Compiler {
    indent = 0;
    getLine = (box: modelTypes['Box'], args: string[], name: string, index?: number) => {
        const compileArithmetic = (op: string) => `${name} = ${args.join(` ${op} `)}`;
        switch (box.code.id) {
            case 'number':
                return `${name} = ${_.values(box.valuesValueMap)[0]}`;
            case 'boolean':
                return `${name} = ${_.values(box.valuesValueMap)[0] ? 'True' : 'False'}`;
            case 'string':
                return `${name} = "${_.values(box.valuesValueMap)[0]}"`;
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
                return `print(${args.join(', ')})`;
            case 'forLoop':
                const start = args[0];
                const end = args[1];
                const step = args[2];
                return `for ${name} in range(${start}, ${end}, ${step}):`
            case 'ifElse':
                if (index === 0)
                    return `if ${args[0]}:`
                else
                    return 'else:'
        }
    };

    getIndent = () => Array(this.indent*2).fill('').join(' ') 

    compileLine = (line: Line) => {
        const { name, box, args, index, numLines } = line;
        let compiledLine = null;
        if (numLines != null) {
            compiledLine = this.getIndent() + (numLines === 0 ? 'pass' : '');
            this.indent--;
        } else if (box && args && name) {
            compiledLine = this.getLine(box, args, name, index);
            if (!compiledLine) return null;
            compiledLine = this.getIndent() + compiledLine;
            if (this.isBlock(box.code.id)) {
                this.indent++;    
            }
        }
        return compiledLine;
    }

    compileLines() {
        console.log(this.lines)
        return this.lines.map(this.compileLine).filter(Boolean).join('\n');
    }
}

export function compileToPython(boxes: IExtendedObservableMap<modelTypes['Box']>) {
    return new PythonCompiler(boxes).compile();
};

export default compileToPython;
