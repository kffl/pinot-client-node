import { Connection } from "./connection";
import { SimpleBrokerSelector } from "./simple-broker-selector";
import { JsonBrokerClientTransport } from "./json-broker-client-transport";
import axios from "axios";

/**
 * Creates a connection to a Pinot cluster given its Controller URL.
 * The connection's query selector will periodically fetch table-to-broker mapping from via the Controller API.
 * @param controllerAddress Pinot Controller URL
 * @returns Connection object with a controller-based broker selector
 */
function fromController(controllerAddress: string): Promise<Connection> {
    return Promise.reject("Not implemented");
}

/**
 * Creates a connection to a Pinot cluster which sends queries randomly between the specified brokers.
 * @param brokerAddresses array of Pinot broker URLs
 * @returns Connection object with a simple (random) broker selector
 */
async function fromHostList(brokerAddresses: string[]): Promise<Connection> {
    const brokerSelector = new SimpleBrokerSelector(brokerAddresses);
    const transport = new JsonBrokerClientTransport(axios);
    return new Connection(brokerSelector, transport);
}

export const ConnectionFactory = {
    fromController,
    fromHostList,
};
