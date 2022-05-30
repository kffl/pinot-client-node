export interface BrokerSelector {
    selectBroker: (table: string) => string;
    getBrokers: () => string[];
    close: () => Promise<void>;
}
