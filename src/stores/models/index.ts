import { Box, IBox } from './box';
import { Socket, ISocket } from './socket';
import { Arrow, IArrow } from './arrow';
import { DraggedArrow, IDraggedArrow } from './dragged-arrow';
import { DraggedRect, IDraggedRect } from './dragged-rect';
import { CodeBlock, ICodeBlock, ICodeBlockIO, CodeBlockIO } from './code-block';

export const models = {
    Box,
    Socket,
    Arrow,
    DraggedArrow,
    DraggedRect,
    CodeBlock,
    CodeBlockIO,
};

export type modelTypes = {
    Box: IBox,
    Socket: ISocket,
    Arrow: IArrow,
    DraggedArrow: IDraggedArrow,
    DraggedRect: IDraggedRect,
    CodeBlock: ICodeBlock,
    CodeBlockIO: ICodeBlockIO,
};