import { BrokerClientTransport } from "./broker-client-transport.interface";
import { BrokerResponse } from "./broker-response.types";
import { PinotClientError } from "./pinot-client-error";
import { withProtocol } from "./url";

export type HttpPostFn = <T>(
    url: string,
    data: object,
    options: {
        headers: Record<string, string>;
    }
) => Promise<{ data: T; status: number }>;

export class JsonBrokerClientTransport implements BrokerClientTransport {
    constructor(private readonly httpPost: HttpPostFn, private readonly reqHeaders: Record<string, string>) {}
    public async executeQuery(brokerAddress: string, query: string) {
        try {
            const url = withProtocol(brokerAddress) + "/query/sql";
            const body = { sql: query };
            const { data, status } = await this.httpPost<BrokerResponse>(url, body, {
                headers: {
                    ...this.reqHeaders,
                    "Content-Type": "application/json; charset=utf-8",
                },
            });
            if (status !== 200) {
                throw new PinotClientError("Broker responded with HTTP status code: " + status);
            }
            return data;
        } catch (e) {
            throw new PinotClientError("An error occurred when sending request to the broker: " + e.message);
        }
    }
}
