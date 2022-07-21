import fastify from "fastify";
import { mock } from "jest-mock-extended";
import { ConnectionFactory } from "./connection-factory";
import { HttpClient } from "./http-client.interface";

describe("ConnectionFactory", () => {
    let brokerTestServer;
    const brokerHandlerBody = jest.fn();
    const brokerHandlerHeaders = jest.fn();
    let controllerTestServer;
    const controllerHandlerHeaders = jest.fn();

    beforeAll(async () => {
        brokerTestServer = fastify({ forceCloseConnections: true });
        brokerTestServer.post("/query/sql", (req, res) => {
            brokerHandlerBody(req.body);
            brokerHandlerHeaders(req.headers);
            const r = Buffer.from(
                `{"resultTable":{"dataSchema":{"columnNames":["league","hits"],"columnDataTypes":["STRING","DOUBLE"]},"rows":[["NL",1890198.0],["AL",1650039.0],["AA",88730.0],["NA",24549.0],["FL",21105.0],["PL",10523.0],["UA",7457.0]]},"exceptions":[],"numServersQueried":1,"numServersResponded":1,"numSegmentsQueried":1,"numSegmentsProcessed":1,"numSegmentsMatched":1,"numConsumingSegmentsQueried":0,"numDocsScanned":97889,"numEntriesScannedInFilter":0,"numEntriesScannedPostFilter":195778,"numGroupsLimitReached":false,"totalDocs":97889,"timeUsedMs":12,"offlineThreadCpuTimeNs":0,"realtimeThreadCpuTimeNs":0,"segmentStatistics":[],"traceInfo":{},"minConsumingFreshnessTimeMs":0,"numRowsResultSet":7}`
            );
            res.type("application/json").send(r);
        });
        await brokerTestServer.listen(8000, "0.0.0.0");

        controllerTestServer = fastify({ forceCloseConnections: true });
        controllerTestServer.get("/v2/brokers/tables", (req, res) => {
            controllerHandlerHeaders(req.headers);
            const r = Buffer.from(
                `{"baseballStats":[{"port":8000,"host":"localhost","instanceName":"Broker_172.17.0.2_8000"}]}`
            );
            res.type("application/json").send(r);
        });
        await controllerTestServer.listen(9000, "0.0.0.0");
    });

    afterAll(async () => {
        await brokerTestServer.close();
        await controllerTestServer.close();
    });

    beforeEach(async () => {
        brokerHandlerBody.mockClear();
        brokerHandlerHeaders.mockClear();
        controllerHandlerHeaders.mockClear();
    });

    describe("fromController method", () => {
        it("should query the controller API when initialized via fromController", async () => {
            const c = await ConnectionFactory.fromController("localhost:9000");
            c.close();
            expect(controllerHandlerHeaders).toHaveBeenCalledTimes(1);
        });

        it("should query the controller API with extra HTTP headers when specified in the options", async () => {
            const c = await ConnectionFactory.fromController("localhost:9000", {
                controllerReqHeaders: {
                    key: "value",
                },
            });
            c.close();
            expect(controllerHandlerHeaders).toHaveBeenCalledTimes(1);
            expect(controllerHandlerHeaders.mock.calls[0][0]["key"]).toEqual("value");
        });

        it("should allow for performing a query against a broker without errors", async () => {
            const c = await ConnectionFactory.fromController("localhost:9000");
            const r = await c.execute(
                "baseballStats",
                "select league, sum(hits) as hits from baseballStats group by league order by hits desc"
            );
            expect(brokerHandlerBody).toHaveBeenCalledTimes(1);
            expect(brokerHandlerBody).toHaveBeenCalledWith({
                sql: "select league, sum(hits) as hits from baseballStats group by league order by hits desc",
            });
            expect(r.exceptions).toHaveLength(0);
            expect(r.resultTable.dataSchema.columnDataTypes).toHaveLength(2);
            c.close();
        });

        it("should throw an error if the initial controller request fails", async () => {
            controllerHandlerHeaders.mockImplementationOnce(() => {
                throw new Error("Server-side error");
            });
            await expect(ConnectionFactory.fromController("localhost:9000")).rejects.toThrowError("status code: 500");
        });

        it("should use a custom HttpClient when one is provided", async () => {
            const httpClient = mock<HttpClient>();
            httpClient.get.mockResolvedValueOnce({
                status: 200,
                data: { baseballStats: [{ port: 8000, host: "localhost", instanceName: "Broker_172.17.0.2_8000" }] },
            });
            httpClient.post.mockResolvedValueOnce({
                status: 200,
                data: {
                    resultTable: {
                        dataSchema: { columnNames: ["league", "hits"], columnDataTypes: ["STRING", "DOUBLE"] },
                        rows: [["NL", 1890198.0]],
                    },
                    exceptions: [],
                },
            });
            const c = await ConnectionFactory.fromController("localhost:9000", {
                customHttpClient: httpClient,
                brokerUpdateFreqMs: 10000,
            });
            await c.execute("baseballStats", "query");
            await c.close();
            expect(httpClient.get).toHaveBeenCalledTimes(1);
            expect(httpClient.post).toHaveBeenCalledTimes(1);
        });
    });
    describe("fromHostList method", () => {
        it("should throw an error if no brokers are provided", () => {
            expect(() => ConnectionFactory.fromHostList([])).toThrowError("no brokers");
        });
        it("should create a connection without errors and allow for executing queries", async () => {
            const c = ConnectionFactory.fromHostList(["localhost:8000"]);
            const r = await c.execute(
                "baseballStats",
                "select league, sum(hits) as hits from baseballStats group by league order by hits desc"
            );
            expect(brokerHandlerBody).toHaveBeenCalledTimes(1);
            expect(brokerHandlerBody).toHaveBeenCalledWith({
                sql: "select league, sum(hits) as hits from baseballStats group by league order by hits desc",
            });
            expect(r.exceptions).toHaveLength(0);
            expect(r.resultTable.dataSchema.columnDataTypes).toHaveLength(2);
        });
        it("should add HTTP headers to broker requests if specified", async () => {
            const c = ConnectionFactory.fromHostList(["localhost:8000"], {
                brokerReqHeaders: { "custom-header": "custom-value" },
            });
            const r = await c.execute(
                "baseballStats",
                "select league, sum(hits) as hits from baseballStats group by league order by hits desc"
            );
            expect(brokerHandlerHeaders).toHaveBeenCalledTimes(1);
            expect(brokerHandlerHeaders.mock.calls[0][0]["custom-header"]).toEqual("custom-value");
        });
        it("should use a custom HttpClient when one is provided", async () => {
            const httpClient = mock<HttpClient>();
            httpClient.post.mockResolvedValueOnce({
                status: 200,
                data: {
                    resultTable: {
                        dataSchema: { columnNames: ["league", "hits"], columnDataTypes: ["STRING", "DOUBLE"] },
                        rows: [["NL", 1890198.0]],
                    },
                    exceptions: [],
                },
            });
            const c = await ConnectionFactory.fromHostList(["localhost:9000"], {
                customHttpClient: httpClient,
            });
            await c.execute("baseballStats", "query");
            await c.close();
            expect(httpClient.get).toHaveBeenCalledTimes(0);
            expect(httpClient.post).toHaveBeenCalledTimes(1);
        });
    });
});
