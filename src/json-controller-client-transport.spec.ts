import { ControllerResponse } from "./controller-response";
import { HttpGetFn, JsonControllerClientTransport } from "./json-controller-client-transport";

describe("JsonControllerClientTransport class", () => {
    it("should call the HttpGetFn", async () => {
        const mockHttpGetFn: HttpGetFn<ControllerResponse> = jest.fn().mockResolvedValueOnce({ data: {} });
        const transport = new JsonControllerClientTransport("controller:9000", mockHttpGetFn);
        const r = await transport.getTableToBrokerMapping();
        expect(mockHttpGetFn).toHaveBeenCalledTimes(1);
        expect(mockHttpGetFn).toHaveBeenCalledWith("http://controller:9000/v2/brokers/tables?state=ONLINE", {
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
        });
        expect(r).toEqual({});
    });
});
