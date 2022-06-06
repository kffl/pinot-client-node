import { AxiosError } from "axios";
import { JsonBrokerClientTransport } from "./json-broker-client-transport";

describe("JsonBrokerClientTransport class", () => {
    const mockHttpPostFn = jest.fn();
    beforeEach(() => {
        mockHttpPostFn.mockClear();
    });
    it("should call the HttpPostFn", async () => {
        mockHttpPostFn.mockResolvedValueOnce({ data: {} });
        const transport = new JsonBrokerClientTransport(mockHttpPostFn, {});
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
    it("should add custom request headers", async () => {
        mockHttpPostFn.mockResolvedValueOnce({ data: {} });
        const transport = new JsonBrokerClientTransport(mockHttpPostFn, { foo: "bar", boo: "baz" });
        await transport.executeQuery("addr:8000", "query");
        expect(mockHttpPostFn).toHaveBeenCalledTimes(1);
        expect(mockHttpPostFn).toHaveBeenCalledWith(
            "http://addr:8000/query/sql",
            { sql: "query" },
            {
                headers: {
                    foo: "bar",
                    boo: "baz",
                    "Content-Type": "application/json; charset=utf-8",
                },
            }
        );
    });
    it("should throw an error with status code on HTTP error", async () => {
        const errWithResponse = new AxiosError("message");
        errWithResponse.response = { status: 500, data: {}, headers: {}, statusText: "", config: {} };
        mockHttpPostFn.mockRejectedValueOnce(errWithResponse);
        const transport = new JsonBrokerClientTransport(mockHttpPostFn, {});
        await expect(transport.executeQuery("addr:8000", "query")).rejects.toThrowError("500");
    });
    it("should throw an error with message on other errors", async () => {
        const errWithMessage = new AxiosError("sample message");
        mockHttpPostFn.mockRejectedValueOnce(errWithMessage);
        const transport = new JsonBrokerClientTransport(mockHttpPostFn, {});
        await expect(transport.executeQuery("addr:8000", "query")).rejects.toThrowError("sample message");
    });
});