import { Updater, Updatable } from "./updater.interface";

export class SelectorUpdaterPeriodic implements Updater {
    private timer: ReturnType<typeof setTimeout>;
    constructor(private readonly target: Updatable, private readonly frequency: number) {
        this.timer = setTimeout(this.performUpdate.bind(this), this.frequency);
    }
    private async performUpdate() {
        await this.target.updateBrokers();
        this.timer = setTimeout(this.performUpdate.bind(this), this.frequency);
    }
    public stop() {
        clearTimeout(this.timer);
    }
}
