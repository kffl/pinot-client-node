import { Connection } from "./connection";
import { SimpleBrokerSelector } from "./simple-broker-selector";
import { JsonBrokerClientTransport } from "./json-broker-client-transport";
import axios from "axios";
import { JsonControllerClientTransport } from "./json-controller-client-transport";
import { ControllerBasedBrokerSelector } from "./controller-based-broker-selector";
import { SelectorUpdaterPeriodic } from "./selector-updater-periodic";
import { Logger } from "./logger.interface";
import { dummyLogger } from "./dummy-logger";

type FromHostListOptions = {
    /**
     * Logger instance conforming to the standard Log4j interface w/ .child() method (i.e. pino, winston or log4js)
     */
    logger: Logger;
    /**
     * Additional HTTP headers to include in broker query API requests
     */
    brokerReqHeaders: Record<string, string>;
};

const fromHostListDefaultOptions: FromHostListOptions = {
    logger: dummyLogger,
    brokerReqHeaders: {},
};

export type FromControllerOptions = FromHostListOptions & {
    /**
     * Additional HTTP headers to include in controller API requests
     */
    controllerReqHeaders: Record<string, string>;
    /**
     * Wait time in milliseconds between table-to-broker mapping refreshes
     * @default 1000
     */
    brokerUpdateFreqMs: number;
};

const fromControllerDefaultOptions: FromControllerOptions = {
    logger: dummyLogger,
    brokerReqHeaders: {},
    controllerReqHeaders: {},
    brokerUpdateFreqMs: 1000,
};

/**
 * Creates a connection to a Pinot cluster given its Controller URL.
 * The connection's query selector will periodically fetch table-to-broker mapping from via the Controller API.
 * @param controllerAddress Pinot Controller URL
 * @returns Connection object with a controller-based broker selector
 * @throws PinotClientError when the first request to the Controller API fails.
 */
async function fromController(
    controllerAddress: string,
    options: Partial<FromControllerOptions> = {}
): Promise<Connection> {
    const actualOptions = Object.assign({}, fromControllerDefaultOptions, options);
    const controllerTransport = new JsonControllerClientTransport(
        controllerAddress,
        axios.get,
        actualOptions.controllerReqHeaders
    );
    const brokerSelector = new ControllerBasedBrokerSelector(controllerTransport, actualOptions.logger);
    await brokerSelector.setup();
    const updater = new SelectorUpdaterPeriodic(brokerSelector, actualOptions.brokerUpdateFreqMs, actualOptions.logger);
    const brokerTransport = new JsonBrokerClientTransport(axios.post, actualOptions.brokerReqHeaders);
    return new Connection(brokerSelector, brokerTransport, actualOptions.logger, updater);
}

/**
 * Creates a connection to a Pinot cluster which sends queries randomly between the specified brokers.
 * @param brokerAddresses array of Pinot broker URLs
 * @returns Connection object with a simple (random) broker selector
 */
function fromHostList(brokerAddresses: string[], options: Partial<FromHostListOptions> = {}): Connection {
    const actualOptions = Object.assign({}, fromHostListDefaultOptions, options);
    const brokerSelector = new SimpleBrokerSelector(brokerAddresses);
    const transport = new JsonBrokerClientTransport(axios.post, actualOptions.brokerReqHeaders);
    return new Connection(brokerSelector, transport, actualOptions.logger);
}

export const ConnectionFactory = {
    fromController,
    fromHostList,
};
