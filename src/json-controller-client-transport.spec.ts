import { AxiosError } from "axios";
import { JsonControllerClientTransport } from "./json-controller-client-transport";

describe("JsonControllerClientTransport class", () => {
    const mockHttpGetFn = jest.fn();
    beforeEach(() => {
        mockHttpGetFn.mockClear();
    });
    it("should call the HttpGetFn", async () => {
        mockHttpGetFn.mockResolvedValueOnce({ data: {} });
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
    it("should throw an error with status code on HTTP error", async () => {
        const errWithResponse = new AxiosError("message");
        errWithResponse.response = { status: 503, data: {}, headers: {}, statusText: "", config: {} };
        mockHttpGetFn.mockRejectedValueOnce(errWithResponse);
        const transport = new JsonControllerClientTransport("addr:9000", mockHttpGetFn);
        await expect(transport.getTableToBrokerMapping()).rejects.toThrowError("503");
    });
    it("should throw an error with message on other errors", async () => {
        const errWithMessage = new AxiosError("sample message");
        mockHttpGetFn.mockRejectedValueOnce(errWithMessage);
        const transport = new JsonControllerClientTransport("addr:9000", mockHttpGetFn);
        await expect(transport.getTableToBrokerMapping()).rejects.toThrowError("sample message");
    });
});
