import { dummyLogger } from "./dummy-logger";
import { Logger } from "./logger.interface";
import { Updater, Updatable } from "./updater.interface";

export class SelectorUpdaterPeriodic implements Updater {
    private timer: ReturnType<typeof setTimeout>;
    constructor(
        private readonly target: Updatable,
        private readonly frequency: number,
        private readonly logger: Logger = dummyLogger
    ) {
        this.logger.debug("Initializing periodic broker selector updater");
        this.timer = setTimeout(this.performUpdate.bind(this), this.frequency);
    }
    private async performUpdate() {
        this.logger.debug("Updating table-to-broker mapping");
        await this.target.updateBrokers();
        this.timer = setTimeout(this.performUpdate.bind(this), this.frequency);
    }
    public stop() {
        this.logger.debug("Stopping periodic broker selector updater");
        clearTimeout(this.timer);
    }
}
