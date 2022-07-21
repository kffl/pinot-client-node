import { ControllerClientTransport } from "./controller-client-transport.interface";
import { ControllerResponse } from "./controller-response";
import { PinotClientError } from "./pinot-client-error";
import { withProtocol } from "./url";

export type HttpGetFn = <T>(
    url: string,
    options: {
        headers: Record<string, string>;
    }
) => Promise<{ data: T; status: number }>;

export class JsonControllerClientTransport implements ControllerClientTransport {
    constructor(
        private readonly controllerAddress: string,
        private readonly httpGet: HttpGetFn,
        private readonly reqHeaders: Record<string, string>
    ) {}
    public async getTableToBrokerMapping() {
        try {
            const { data, status } = await this.httpGet<ControllerResponse>(
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
