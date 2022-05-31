import fastify from "fastify";
import { ConnectionFactory } from "./connection-factory";

describe("ConnectionFactory", () => {
    let brokerTestServer;
    const brokerHandler = jest.fn();
    let controllerTestServer;
    const controllerHandler = jest.fn();

    beforeEach(async () => {
        brokerHandler.mockClear();
        controllerHandler.mockClear();
        brokerTestServer = fastify();
        brokerTestServer.post("/query/sql", (req, res) => {
            brokerHandler(req.body);
            const r = Buffer.from(
                `{"resultTable":{"dataSchema":{"columnNames":["league","hits"],"columnDataTypes":["STRING","DOUBLE"]},"rows":[["NL",1890198.0],["AL",1650039.0],["AA",88730.0],["NA",24549.0],["FL",21105.0],["PL",10523.0],["UA",7457.0]]},"exceptions":[],"numServersQueried":1,"numServersResponded":1,"numSegmentsQueried":1,"numSegmentsProcessed":1,"numSegmentsMatched":1,"numConsumingSegmentsQueried":0,"numDocsScanned":97889,"numEntriesScannedInFilter":0,"numEntriesScannedPostFilter":195778,"numGroupsLimitReached":false,"totalDocs":97889,"timeUsedMs":12,"offlineThreadCpuTimeNs":0,"realtimeThreadCpuTimeNs":0,"segmentStatistics":[],"traceInfo":{},"minConsumingFreshnessTimeMs":0,"numRowsResultSet":7}`
            );
            res.type("application/json").send(r);
        });
        await brokerTestServer.listen(8000, "0.0.0.0");

        controllerTestServer = fastify();
        controllerTestServer.get("/v2/brokers/tables", (req, res) => {
            controllerHandler();
            const r = Buffer.from(
                `{"baseballStats":[{"port":8000,"host":"localhost","instanceName":"Broker_172.17.0.2_8000"}]}`
            );
            res.type("application/json").send(r);
        });
        await controllerTestServer.listen(9000, "0.0.0.0");
    });

    afterEach(async () => {
        await brokerTestServer.close();
        await controllerTestServer.close();
    });

    describe("fromController method", () => {
        it("should query the controller API when initialized via fromController", async () => {
            const c = await ConnectionFactory.fromController("localhost:9000");
            c.close();
            expect(controllerHandler).toHaveBeenCalledTimes(1);
        });

        it("should allow for performing a query against a broker without errors", async () => {
            const c = await ConnectionFactory.fromController("localhost:9000");
            const r = await c.execute(
                "baseballStats",
                "select league, sum(hits) as hits from baseballStats group by league order by hits desc"
            );
            expect(brokerHandler).toHaveBeenCalledTimes(1);
            expect(brokerHandler).toHaveBeenCalledWith({
                sql: "select league, sum(hits) as hits from baseballStats group by league order by hits desc",
            });
            expect(r.exceptions).toHaveLength(0);
            expect(r.resultTable.dataSchema.columnDataTypes).toHaveLength(2);
            c.close();
        });

        it("should throw an error if the initial controller request fails", async () => {
            controllerHandler.mockImplementationOnce(() => {
                throw new Error("Server-side error");
            });
            await expect(ConnectionFactory.fromController("localhost:9000")).rejects.toThrowError("status code 500");
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
            expect(brokerHandler).toHaveBeenCalledTimes(1);
            expect(brokerHandler).toHaveBeenCalledWith({
                sql: "select league, sum(hits) as hits from baseballStats group by league order by hits desc",
            });
            expect(r.exceptions).toHaveLength(0);
            expect(r.resultTable.dataSchema.columnDataTypes).toHaveLength(2);
        });
    });
});
