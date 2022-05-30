import { BrokerSelector } from "./broker-selector.interface";

export class SimpleBrokerSelector implements BrokerSelector {
    constructor(private readonly brokers: string[]) {
        if (this.brokers.length == 0) {
            throw new Error("There were no brokers provided for simple broker selector");
        }
    }
    public getBrokers() {
        return this.brokers;
    }
    public selectBroker(_: string) {
        return this.brokers[Math.floor(Math.random() * this.brokers.length)];
    }
    public close() {
        return Promise.resolve();
    }
}
