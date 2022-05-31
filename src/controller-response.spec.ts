import { extractBrokers } from "./controller-response";

describe("extractBrokers function", () => {
    it("builds a table-to-broker map", () => {
        const r = {
            table1: [
                {
                    port: 8000,
                    host: "h1",
                    instanceName: "Broker_h1_8000",
                },
                {
                    port: 8000,
                    host: "h2",
                    instanceName: "Broker_h1_8000",
                },
            ],
            table2: [
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
        const expected = {
            table1: ["h1:8000", "h2:8000"],
            table2: ["h2:8000", "h3:8000"],
        };

        expect(extractBrokers(r)).toEqual(expected);
    });
});
