export interface BrokerSelector {
    selectBroker: (table: string) => string;
    getBrokers: () => string[];
}
