import { Logger } from "./logger.interface";

function NoOp(_msg: string) {}

export const dummyLogger: Logger = {
    fatal: NoOp,
    error: NoOp,
    warn: NoOp,
    info: NoOp,
    debug: NoOp,
    trace: NoOp,
    child: this,
};
