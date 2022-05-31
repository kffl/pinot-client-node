export interface Updatable {
    updateBrokers: () => Promise<void>;
}

export interface Updater {
    stop: () => void;
}
