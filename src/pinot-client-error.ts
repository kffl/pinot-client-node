export class PinotClientError extends Error {
    constructor(msg: string) {
        super(msg);
        this.name = "PinotClientError";
    }
}
