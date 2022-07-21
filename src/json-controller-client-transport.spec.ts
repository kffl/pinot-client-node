import { mock, mockClear } from "jest-mock-extended";
import { HttpClient } from "./http-client.interface";
import { JsonControllerClientTransport } from "./json-controller-client-transport";

describe("JsonControllerClientTransport class", () => {
    const mockHttpClient = mock<HttpClient>();
    beforeEach(() => {
        mockClear(mockHttpClient);
    });
    it("should call the HttpClient get method", async () => {
        mockHttpClient.get.mockResolvedValueOnce({ data: {}, status: 200 });
        const transport = new JsonControllerClientTransport("controller:9000", mockHttpClient, {});
        const r = await transport.getTableToBrokerMapping();
        expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
        expect(mockHttpClient.get).toHaveBeenCalledWith("http://controller:9000/v2/brokers/tables?state=ONLINE", {
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
        });
        expect(r).toEqual({});
    });
    it("should add custom request headers", async () => {
        mockHttpClient.get.mockResolvedValueOnce({ data: {}, status: 200 });
        const transport = new JsonControllerClientTransport("controller:9000", mockHttpClient, { key: "val" });
        const r = await transport.getTableToBrokerMapping();
        expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
        expect(mockHttpClient.get).toHaveBeenCalledWith("http://controller:9000/v2/brokers/tables?state=ONLINE", {
            headers: {
                key: "val",
                "Content-Type": "application/json; charset=utf-8",
            },
        });
        expect(r).toEqual({});
    });
    it("should throw an error with status code on HTTP error", async () => {
        const response = { status: 503, data: {} };
        mockHttpClient.get.mockResolvedValueOnce(response);
        const transport = new JsonControllerClientTransport("addr:9000", mockHttpClient, {});
        await expect(transport.getTableToBrokerMapping()).rejects.toThrowError("503");
    });
    it("should throw an error with message on other errors", async () => {
        const errWithMessage = new Error("sample message");
        mockHttpClient.get.mockRejectedValueOnce(errWithMessage);
        const transport = new JsonControllerClientTransport("addr:9000", mockHttpClient, {});
        await expect(transport.getTableToBrokerMapping()).rejects.toThrowError("sample message");
    });
});
