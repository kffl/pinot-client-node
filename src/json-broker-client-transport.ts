import { BrokerClientTransport } from "./broker-client-transport.interface";
import { BrokerResponse } from "./broker-response.types";
import { PinotClientError } from "./pinot-client-error";

export interface HttpClient<T> {
    post: (
        url: string,
        data: object,
        options: {
            headers: Record<string, string>;
        }
    ) => Promise<{ data: T; status: number }>;
}

export class JsonBrokerClientTransport implements BrokerClientTransport {
    constructor(private readonly httpClient: HttpClient<BrokerResponse>) {}
    public async executeQuery(brokerAddress: string, query: string) {
        try {
            const { data } = await this.httpClient.post(
                brokerAddress + "/query/sql",
                { sql: query },
                {
                    headers: {
                        "Content-Type": "application/json; charset=utf-8",
                    },
                }
            );
            return data;
        } catch (e) {
            if (e?.message) {
                throw new PinotClientError("An error occurred when sending request to the broker: " + e.message);
            }
            if (e?.response) {
                throw new PinotClientError("Broker responded with HTTP status code: " + e.response?.status);
            }
            if (e?.message) {
                throw new PinotClientError(
                    "An unknown error occurred when sending request to the broker: " + e.message
                );
            }
        }
    }
}
