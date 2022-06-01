import { Connection } from "./connection";
import { SimpleBrokerSelector } from "./simple-broker-selector";
import { JsonBrokerClientTransport } from "./json-broker-client-transport";
import axios from "axios";
import { JsonControllerClientTransport } from "./json-controller-client-transport";
import { ControllerBasedBrokerSelector } from "./controller-based-broker-selector";
import { SelectorUpdaterPeriodic } from "./selector-updater-periodic";
import { Logger } from "./logger.interface";
import { dummyLogger } from "./dummy-logger";

/**
 * Creates a connection to a Pinot cluster given its Controller URL.
 * The connection's query selector will periodically fetch table-to-broker mapping from via the Controller API.
 * @param controllerAddress Pinot Controller URL
 * @returns Connection object with a controller-based broker selector
 * @throws PinotClientError when the first request to the Controller API fails.
 */
async function fromController(controllerAddress: string, logger: Logger = dummyLogger): Promise<Connection> {
    const controllerTransport = new JsonControllerClientTransport(controllerAddress, axios.get);
    const brokerSelector = new ControllerBasedBrokerSelector(controllerTransport, logger);
    await brokerSelector.setup();
    const updater = new SelectorUpdaterPeriodic(brokerSelector, 1000, logger);
    const brokerTransport = new JsonBrokerClientTransport(axios.post);
    return new Connection(brokerSelector, brokerTransport, logger, updater);
}

/**
 * Creates a connection to a Pinot cluster which sends queries randomly between the specified brokers.
 * @param brokerAddresses array of Pinot broker URLs
 * @returns Connection object with a simple (random) broker selector
 */
function fromHostList(brokerAddresses: string[], logger: Logger = dummyLogger): Connection {
    const brokerSelector = new SimpleBrokerSelector(brokerAddresses);
    const transport = new JsonBrokerClientTransport(axios.post);
    return new Connection(brokerSelector, transport, logger);
}

export const ConnectionFactory = {
    fromController,
    fromHostList,
};
