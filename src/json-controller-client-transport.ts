import { ControllerClientTransport } from "./controller-client-transport.interface";
import { ControllerResponse } from "./controller-response";
import { HttpClient } from "./http-client.interface";
import { PinotClientError } from "./pinot-client-error";
import { withProtocol } from "./url";

export class JsonControllerClientTransport implements ControllerClientTransport {
    constructor(
        private readonly controllerAddress: string,
        private readonly client: HttpClient,
        private readonly reqHeaders: Record<string, string>
    ) {}
    public async getTableToBrokerMapping() {
        try {
            const { data, status } = await this.client.get<ControllerResponse>(
                withProtocol(this.controllerAddress) + "/v2/brokers/tables?state=ONLINE",
                {
                    headers: {
                        ...this.reqHeaders,
                        "Content-Type": "application/json; charset=utf-8",
                    },
                }
            );
            if (status !== 200) {
                throw new PinotClientError("Controller responded with HTTP status code: " + status);
            }
            return data;
        } catch (e) {
            throw new PinotClientError("An error occurred when sending request to the controller: " + e.message);
        }
    }
}
