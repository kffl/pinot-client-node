export interface Updatable {
    updateBrokers: () => Promise<void>;
}

export interface Scheduler {
    stop: () => void;
}
