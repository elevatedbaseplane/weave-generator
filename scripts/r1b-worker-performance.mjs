import fs from 'node:fs';
import path from 'node:path';
import {Worker} from 'node:worker_threads';
import {denseFixture,stats} from '../docs/evidence/r1b-storage/performance-fixture.mjs';

const fixture=denseFixture(),worker=new Worker(new URL('./r1b-worker-node.mjs',import.meta.url)),warmup=[],runs=[];
let pending=null;
worker.on('message',message=>{pending?.resolve(message);pending=null});
worker.on('error',error=>{pending?.reject(error);pending=null});
async function cycle(index){const message={...fixture.message,requestSequence:index+1,requestId:`automated-worker-gate:${index+1}`},started=performance.now(),result=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{pending=null;reject(Error('Persistent worker exceeded 750 ms.'))},750);pending={resolve:value=>{clearTimeout(timer);resolve(value)},reject:error=>{clearTimeout(timer);reject(error)}};worker.postMessage(message)}),roundTripMs=performance.now()-started;if(result.type!=='success')throw Object.assign(Error(result.error?.message||'Persistent worker failed.'),{workerError:result.error});return{index,workerMs:result.workerMs,deriveMs:result.timing.deriveMs,encodeMs:result.timing.encodeMs,roundTripMs,transferMs:roundTripMs-result.workerMs};}
let failure=null;
try{for(let i=0;i<5;i++)warmup.push(await cycle(-5+i));for(let i=0;i<30;i++)runs.push(await cycle(i));}catch(error){failure={name:error.name,message:error.message,workerError:error.workerError??null};}finally{await worker.terminate();}
const summary=key=>stats(runs.map(run=>run[key])),report={contract:'r1b-persistent-worker-375-400',fixture:{boundaryVertices:100,spacing:2.5},warmup,runs,summary:runs.length===30?{worker:summary('workerMs'),derive:summary('deriveMs'),encode:summary('encodeMs'),roundTrip:summary('roundTripMs'),transfer:summary('transferMs')}:null,failure,passed:false};
report.passed=!failure&&runs.length===30&&report.summary.worker.p95Ms<=375&&report.summary.worker.maxMs<=400;
if(!report.passed&&!report.failure)report.failure={name:'PerformanceGateError',message:`Persistent worker p95/max ${report.summary.worker.p95Ms.toFixed(2)}/${report.summary.worker.maxMs.toFixed(2)} ms exceeds 375/400 ms.`,workerError:null};
const directory=path.resolve('verification/local-r1b');fs.mkdirSync(directory,{recursive:true});fs.writeFileSync(path.join(directory,'worker-performance.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.passed,worker:report.summary?.worker,failure:report.failure}));if(!report.passed)process.exitCode=1;
