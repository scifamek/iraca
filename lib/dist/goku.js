"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
console.log('Llego algo ', worker_threads_1.workerData);
const { usecase, params } = worker_threads_1.workerData;
worker_threads_1.parentPort?.postMessage(params);
//# sourceMappingURL=goku.js.map