import { ControllerResponse } from "./controller-response";

export interface ControllerClientTransport {
    getTableToBrokerMapping: () => Promise<ControllerResponse>;
}
