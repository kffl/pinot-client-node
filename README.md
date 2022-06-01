# Node.js client library for Apache Pinot :wine_glass:

[![CI Workflow](https://github.com/kffl/pinot-client-node/actions/workflows/ci.yml/badge.svg)](https://github.com/kffl/pinot-client-node/actions/workflows/ci.yml)
[![NPM version](https://img.shields.io/npm/v/pinot-client.svg?style=flat)](https://www.npmjs.com/package/pinot-client)
[![NPM downloads](https://img.shields.io/npm/dm/pinot-client.svg?style=flat)](https://www.npmjs.com/package/pinot-client)
[![Known Vulnerabilities](https://snyk.io/test/github/kffl/pinot-client-node/badge.svg)](https://snyk.io/test/github/kffl/pinot-client-node)

JavaScript client library for connecting to and querying Apache Pinot :wine_glass:, a realtime distributed OLAP datastore.

## Features

-   Implements a controller-based broker selector that periodically updates the table-to-broker mapping via the controller API.
-   Provides TypeScript definitions of broker responses (Pinot query results).
-   Has 100% test coverage.

## Quick start

Start a development Pinot cluster with `baseballStats` demo data:

```bash
docker run \
    -p 9000:9000 -p 8000:8000 \
    apachepinot/pinot:0.9.3 QuickStart \
    -type batch
```

### Installation

```
npm install pinot-client
```

or

```
yarn add pinot-client
```

### Creating a connection to a Pinot cluster

With a simple broker selector (that chooses randomly between the provided brokers upon each query):

```typescript
import { ConnectionFactory } from "pinot-client";

const connection = ConnectionFactory.fromHostList(["localhost:8000"]);
```

With a controller-based broker selector (that maintains a periodically updated table-to-broker mapping obtained via controller API):

```typescript
import { ConnectionFactory } from "pinot-client";

const connection = await ConnectionFactory.fromController("localhost:9000");
```

### Querying Pinot

```typescript
const r = await connection.execute(
    "baseballStats", // table name
    "select league, sum(hits) as hits from baseballStats group by league order by hits desc" // SQL query
);

console.log(`Scanned ${r.numDocsScanned} docs in ${r.timeUsedMs}ms`);
console.log("Results:");
console.log(r.resultTable.dataSchema.columnNames.join("\t"));
r.resultTable.rows.forEach((row) => {
    console.log(row.join("\t"));
});
```

Output:

```
Scanned 97889 in 8ms
league  hits
NL      1890198
AL      1650039
AA      88730
NA      24549
FL      21105
PL      10523
UA      7457
```

## Usage

### `fromHostList()` and `fromController()` options

`ConnectionFactory#fromHostList()` may optionally take as a second parameter an object with the following keys:

-   `logger`: a logger instance conforming to the standard Log4j interface w/ .child() method (i.e. pino, winston or log4js)
-   `brokerReqHeaders`: additional HTTP headers (object key: value) to include in broker query API requests

additionally, `ConnectionFactory#fromController()` options may include two additional keys:

-   `controllerReqHeaders`: additional HTTP headers (object key: value) to include in controller API requests
-   `brokerUpdateFreqMs`: wait time in milliseconds between table-to-broker mapping refreshes

Example usage:

```typescript
const options = {
    brokerReqHeaders: {
        Authorization: "Basic asdf123",
    },
    controllerReqHeaders: {
        Authorization: "Basic xyz123",
    },
    brokerUpdateFreqMs: 500,
};

const connection = await ConnectionFactory.fromController("localhost:9000", options);
```

### Using a custom logger

```typescript
// let's use pino (not to be confused with pinot) as an example logger
import * as pino from "pino";

const pinoInstance = pino({ level: "debug" });
const childLogger = pinoInstance.child({ lib: "pinot-client" });

const options = {
    logger: childLogger,
};

const connection = await ConnectionFactory.fromController("localhost:9000", options);
```
