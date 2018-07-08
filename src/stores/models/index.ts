import { Box, IBox } from './box';
import { Socket, ISocket } from './socket';
import { Arrow, ArrowType } from './arrow';
import { DraggedArrow, IDraggedArrow } from './dragged-arrow';

export const models = {
    Box,
    Socket,
    Arrow,
    DraggedArrow,
};

export type modelTypes = {
    Box: IBox,
    Socket: ISocket,
    Arrow: ArrowType,
    DraggedArrow: IDraggedArrow,
};