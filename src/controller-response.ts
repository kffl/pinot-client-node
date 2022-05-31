type BrokerDto = {
    port: number;
    host: string;
    instanceName: string;
};

export type ControllerResponse = Record<string, BrokerDto[]>;

export function extractBrokers(r: ControllerResponse): Record<string, string[]> {
    const tableToBrokersMap: Record<string, string[]> = {};

    for (const [table, brokers] of Object.entries(r)) {
        tableToBrokersMap[table] = brokers.map((b) => `${b.host}:${b.port}`);
    }

    return tableToBrokersMap;
}
