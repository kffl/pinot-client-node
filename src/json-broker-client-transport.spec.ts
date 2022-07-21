import { mock, mockClear } from "jest-mock-extended";
import { HttpClient } from "./http-client.interface";
import { JsonBrokerClientTransport } from "./json-broker-client-transport";

describe("JsonBrokerClientTransport class", () => {
    const mockHttpClient = mock<HttpClient>();
    beforeEach(() => {
        mockClear(mockHttpClient);
    });
    it("should call the HttpClient post method", async () => {
        mockHttpClient.post.mockResolvedValueOnce({ data: {}, status: 200 });
        const transport = new JsonBrokerClientTransport(mockHttpClient, {});
        await transport.executeQuery("addr:8000", "query");
        expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
        expect(mockHttpClient.post).toHaveBeenCalledWith(
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
        mockHttpClient.post.mockResolvedValueOnce({ data: {}, status: 200 });
        const transport = new JsonBrokerClientTransport(mockHttpClient, { foo: "bar", boo: "baz" });
        await transport.executeQuery("addr:8000", "query");
        expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
        expect(mockHttpClient.post).toHaveBeenCalledWith(
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
        const response = { status: 500, data: { error: "description" } };
        mockHttpClient.post.mockResolvedValueOnce(response);
        const transport = new JsonBrokerClientTransport(mockHttpClient, {});
        await expect(transport.executeQuery("addr:8000", "query")).rejects.toThrowError("500");
    });
    it("should throw an error with message on other errors", async () => {
        const errWithMessage = new Error("sample message");
        mockHttpClient.post.mockRejectedValueOnce(errWithMessage);
        const transport = new JsonBrokerClientTransport(mockHttpClient, {});
        await expect(transport.executeQuery("addr:8000", "query")).rejects.toThrowError("sample message");
    });
});
