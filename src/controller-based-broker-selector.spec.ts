import { mock, mockReset } from "jest-mock-extended";
import { ControllerBasedBrokerSelector } from "./controller-based-broker-selector";
import { ControllerClientTransport } from "./controller-client-transport.interface";
import { Logger } from "./logger.interface";

const tableMapping1 = {
    table1: [
        {
            port: 8000,
            host: "h1",
            instanceName: "Broker_h1_8000",
        },
    ],
};
const tableMapping2 = {
    table1: [
        {
            port: 8000,
            host: "h2",
            instanceName: "Broker_h2_8000",
        },
        {
            port: 8000,
            host: "h3",
            instanceName: "Broker_h3_8000",
        },
    ],
};

describe("ControllerBasedBrokerSelector class", () => {
    const mockTransport = mock<ControllerClientTransport>();
    afterEach(() => {
        mockReset(mockTransport);
    });

    describe("setup method", () => {
        it("should retrieve available brokers from the transport implementation", async () => {
            mockTransport.getTableToBrokerMapping.mockResolvedValue(tableMapping1);
            const s = new ControllerBasedBrokerSelector(mockTransport);
            await s.setup();
            expect(s.getBrokers()).toEqual(["h1:8000"]);
        });
    });
    describe("selectBroker method", () => {
        it("should select a random broker from the available ones", async () => {
            mockTransport.getTableToBrokerMapping.mockResolvedValue(tableMapping2);
            const s = new ControllerBasedBrokerSelector(mockTransport);
            await s.setup();
            expect(["h2:8000", "h3:8000"]).toContain(s.selectBroker("table1"));
        });
        it("should return an empty string if there are no brokers available for a given table", async () => {
            mockTransport.getTableToBrokerMapping.mockResolvedValue(tableMapping2);
            const s = new ControllerBasedBrokerSelector(mockTransport);
            await s.setup();
            expect(s.selectBroker("nope")).toEqual("");
        });
    });
    describe("updateBrokers method", () => {
        it("should update the broker cache", async () => {
            mockTransport.getTableToBrokerMapping.mockResolvedValueOnce(tableMapping1);
            const s = new ControllerBasedBrokerSelector(mockTransport);
            await s.setup();
            expect(s.getBrokers()).toEqual(["h1:8000"]);
            mockTransport.getTableToBrokerMapping.mockResolvedValueOnce(tableMapping2);
            await s.updateBrokers();
            expect(s.getBrokers()).toEqual(["h2:8000", "h3:8000"]);
        });
        it("should log an error if broker cache update fails", async () => {
            mockTransport.getTableToBrokerMapping.mockResolvedValueOnce(tableMapping1);
            const mockLogger = mock<Logger>();
            const s = new ControllerBasedBrokerSelector(mockTransport, mockLogger);
            await s.setup();
            expect(s.getBrokers()).toEqual(["h1:8000"]);
            mockTransport.getTableToBrokerMapping.mockRejectedValueOnce(new Error("fail"));
            await s.updateBrokers();
            expect(mockLogger.warn).toHaveBeenCalledTimes(1);
        });
    });
});
