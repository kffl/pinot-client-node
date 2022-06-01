export interface Logger {
    fatal(msg: string);
    error(msg: string);
    warn(msg: string);
    info(msg: string);
    debug(msg: string);
    trace(msg: string);
    child(options: object): Logger;
}
