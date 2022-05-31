import { BrokerResponse } from "./broker-response.types";
import { HttpPostFn, JsonBrokerClientTransport } from "./json-broker-client-transport";

describe("JsonBrokerClientTransport class", () => {
    it("should call the HttpPostFn", async () => {
        const mockHttpPostFn: HttpPostFn<BrokerResponse> = jest.fn().mockResolvedValueOnce({ data: {} });
        const transport = new JsonBrokerClientTransport(mockHttpPostFn);
        await transport.executeQuery("addr:8000", "query");
        expect(mockHttpPostFn).toHaveBeenCalledTimes(1);
        expect(mockHttpPostFn).toHaveBeenCalledWith(
            "http://addr:8000/query/sql",
            { sql: "query" },
            {
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                },
            }
        );
    });
});
