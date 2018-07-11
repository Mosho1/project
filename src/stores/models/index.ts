import { Box, IBox } from './box';
import { Socket, ISocket } from './socket';
import { Arrow, IArrow } from './arrow';
import { DraggedArrow, IDraggedArrow } from './dragged-arrow';
import { CodeBlock, ICodeBlock, ICodeBlockIO, CodeBlockIO } from './code-block';

export const models = {
    Box: Box,
    Socket,
    Arrow,
    DraggedArrow,
    CodeBlock,
    CodeBlockIO,
};

export type modelTypes = {
    Box: IBox,
    Socket: ISocket,
    Arrow: IArrow,
    DraggedArrow: IDraggedArrow,
    CodeBlock: ICodeBlock,
    CodeBlockIO: ICodeBlockIO,
};