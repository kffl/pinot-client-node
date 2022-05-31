import { SimpleBrokerSelector } from "./simple-broker-selector";

describe("SimpleBrokerSelector class", () => {
    describe("constructor", () => {
        it("should throw an error if no brokers are provided", () => {
            expect(() => new SimpleBrokerSelector([])).toThrowError("no brokers provided");
        });
    });
    describe("getBrokers method", () => {
        it("returns the selector's brokers", () => {
            const selector = new SimpleBrokerSelector(["h1:8000", "h2:8000"]);
            expect(selector.getBrokers()).toEqual(["h1:8000", "h2:8000"]);
        });
    });
    describe("selectBroker method", () => {
        it("selects a random broker", () => {
            const selector = new SimpleBrokerSelector(["h1:8000", "h2:8000"]);
            expect(["h1:8000", "h2:8000"]).toContain(selector.selectBroker("table"));
        });
    });
});
