import { BrokerSelector } from "./broker-selector.interface";
import { BrokerClientTransport } from "./broker-client-transport.interface";
import { BrokerResponse } from "./broker-response.types";
import { PinotClientError } from "./pinot-client-error";

/**
 * A connection to Pinot, normally created via connectionFactory
 */
export class Connection {
    constructor(private readonly brokerSelector: BrokerSelector, private readonly transport: BrokerClientTransport) {}
    public close() {
        return this.brokerSelector.close();
    }
    /**
     * Get the list of available broker addresses
     * @returns The list of brokers using which the connection can execute queries
     */
    public getBrokerList() {
        return this.brokerSelector.getBrokers();
    }
    /**
     * Executes an SQL query against a given table
     * @throws PinotClientError
     */
    public async execute(table: string, query: string): Promise<BrokerResponse> {
        const brokerAddress = this.brokerSelector.selectBroker(table);
        if (brokerAddress === "") {
            throw new PinotClientError(`No broker for table ${table} was found`);
        }
        const r = await this.transport.executeQuery(brokerAddress, query);
        if (r.exceptions.length > 0) {
            throw new PinotClientError(
                "Some exceptions were returned by the broker:\n" +
                    r.exceptions.map((e) => `[CODE ${e.errorCode}] ${e.message}\n`).join()
            );
        }
        return r;
    }
}
