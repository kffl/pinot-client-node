import { BrokerResponse } from "./broker-response.types";

export interface BrokerClientTransport {
    executeQuery: (brokerAddress: string, query: string) => Promise<BrokerResponse>;
}
