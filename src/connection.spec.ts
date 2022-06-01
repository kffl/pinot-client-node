import { BrokerClientTransport } from "./broker-client-transport.interface";
import { BrokerSelector } from "./broker-selector.interface";
import { Connection } from "./connection";
import { mock, mockReset } from "jest-mock-extended";
import { BrokerResponse } from "./broker-response.types";
import { Updater } from "./updater.interface";
import { dummyLogger } from "./dummy-logger";

const brokers = ["host1:8000", "host2:8000"];

describe("Connection class", () => {
    const mockSelector = mock<BrokerSelector>();
    const mockTransport = mock<BrokerClientTransport>();
    beforeEach(() => {
        mockReset(mockSelector);
        mockReset(mockTransport);
    });

    describe("getBrokerList method", () => {
        it("lists the brokers via getBrokerList", () => {
            mockSelector.getBrokers.mockReturnValue(brokers);
            const c = new Connection(mockSelector, mockTransport, dummyLogger);
            expect(c.getBrokerList()).toEqual(brokers);
        });
    });
    describe("close method", () => {
        it("closes the selector updater", async () => {
            const mockUpdater = mock<Updater>();
            const c = new Connection(mockSelector, mockTransport, dummyLogger, mockUpdater);
            c.close();
            expect(mockUpdater.stop).toHaveBeenCalledTimes(1);
        });
    });
    describe("execute method", () => {
        it("throws an error when there is no broker available for a given table", async () => {
            mockSelector.selectBroker.mockReturnValue("");
            const c = new Connection(mockSelector, mockTransport, dummyLogger);
            await expect(c.execute("myTable", "query")).rejects.toThrowError("No broker for table myTable was found");
        });
        it("throws an error when broker exceptions are thrown", async () => {
            mockTransport.executeQuery.mockResolvedValue({
                exceptions: [
                    { errorCode: 150, message: "Some message" },
                    { errorCode: 120, message: "Another message" },
                ],
            } as BrokerResponse);
            const c = new Connection(mockSelector, mockTransport, dummyLogger);
            await expect(c.execute("myTable", "query")).rejects.toThrowError("exceptions");
        });
    });
});
