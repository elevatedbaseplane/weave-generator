import {parentPort} from 'node:worker_threads';
globalThis.self={onmessage:null,postMessage:(value,transfer)=>parentPort.postMessage({...value,diagnosticWorkerHeap:process.memoryUsage()},transfer)};
await import('../../../dist/r1b-worker.mjs');
parentPort.on('message',data=>globalThis.self.onmessage({data}));
