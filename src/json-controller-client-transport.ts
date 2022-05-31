import { ControllerClientTransport } from "./controller-client-transport.interface";
import { ControllerResponse } from "./controller-response";
import { PinotClientError } from "./pinot-client-error";
import { withProtocol } from "./url";

export type HttpGetFn<T> = (
    url: string,
    options: {
        headers: Record<string, string>;
    }
) => Promise<{ data: T; status: number }>;

export class JsonControllerClientTransport implements ControllerClientTransport {
    constructor(private readonly controllerAddress: string, private readonly httpGet: HttpGetFn<ControllerResponse>) {}
    public async getTableToBrokerMapping() {
        try {
            const { data } = await this.httpGet(
                withProtocol(this.controllerAddress) + "/v2/brokers/tables?state=ONLINE",
                {
                    headers: {
                        "Content-Type": "application/json; charset=utf-8",
                    },
                }
            );
            return data;
        } catch (e) {
            if (e.response) {
                throw new PinotClientError("Controller responded with HTTP status code: " + e.response.status);
            } else {
                throw new PinotClientError("An error occurred when sending request to the controller: " + e.message);
            }
        }
    }
}
