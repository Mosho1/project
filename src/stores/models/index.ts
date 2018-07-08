import { Box } from './box';
import { Socket } from './socket';
import { Arrow } from './arrow';
import { DraggedArrow } from './dragged-arrow';

export const models = {
    Box,
    Socket,
    Arrow,
    DraggedArrow,
};

export type modelTypes = {
    Box: typeof Box.Type,
    Socket: typeof Socket.Type,
    Arrow: typeof Arrow.Type,
    DraggedArrow: typeof DraggedArrow.Type,
};