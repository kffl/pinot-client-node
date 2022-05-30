export type RespSchema = {
    columnDataTypes: string[];
    columnNames: string[];
};

export type ResultTable = {
    dataSchema: RespSchema;
    rows: (number | string)[][];
};

export type Exception = {
    errorCode: number;
    message: string;
};

export type PinotDataType =
    | "INT"
    | "LONG"
    | "FLOAT"
    | "DOUBLE"
    | "BIG_DECIMAL"
    | "BOOLEAN"
    | "TIMESTAMP"
    | "STRING"
    | "JSON"
    | "BYTES";

export type BrokerResponse = {
    resultTable: ResultTable;
    exceptions: Exception[];
    traceInfo: Record<string, string>;
    numServersQueries: number;
    numServersResponded: number;
    numSegmentsQueried: number;
    numSegmentsProcessed: number;
    numSegmentsMatched: number;
    numConsumingSegmentsQueried: number;
    numDocsScanned: number;
    numEntriesScannedPostFilter: number;
    numGroupsLimitReached: boolean;
    totalDocs: number;
    timeUsedMs: number;
    minConsumingFreshnessTimeMs: number;
};
