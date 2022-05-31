import { BrokerSelector } from "./broker-selector.interface";
import { ControllerClientTransport } from "./controller-client-transport.interface";
import { extractBrokers } from "./controller-response";
import { Updatable } from "./scheduler.interface";

export class ControllerBasedBrokerSelector implements BrokerSelector, Updatable {
    private tableToBrokersMap: Record<string, string[]>;
    constructor(private readonly transport: ControllerClientTransport) {}
    public async setup() {
        this.tableToBrokersMap = extractBrokers(await this.transport.getTableToBrokerMapping());
    }
    public selectBroker(table: string) {
        const brokers = this.tableToBrokersMap[table];
        if (!brokers) {
            return "";
        }
        return brokers[Math.floor(Math.random() * brokers.length)];
    }
    public getBrokers() {
        const uniqueBrokers = new Set<string>();
        for (const [_, brokers] of Object.entries(this.tableToBrokersMap)) {
            brokers.forEach((b) => {
                uniqueBrokers.add(b);
            });
        }
        return Array.from(uniqueBrokers);
    }
    public async updateBrokers() {
        try {
            this.tableToBrokersMap = extractBrokers(await this.transport.getTableToBrokerMapping());
        } catch (e) {
            console.warn("An error occurred when refreshing broker list via controller API: " + e?.message);
        }
    }
}
