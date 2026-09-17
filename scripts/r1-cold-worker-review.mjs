// Read-only production diagnostic. Uses the exact failed host candidate, not a regenerated fixture.
import {Worker} from 'node:worker_threads';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {digest,canonical} from '../dist/weave.mjs';
import {encodeDerived} from '../dist/storage-codec.mjs';
import {COMBINED_VERSIONS as V} from '../dist/combined.mjs';
const dir=new URL('../docs/evidence/r1-checkpoint-20260917/',import.meta.url);
const raw=readFileSync(new URL('browser-2026-09-17T18-36-42-095Z.json',dir));
const sha=b=>createHash('sha256').update(b).digest('hex');
assert.equal(sha(raw),'c7510e738d9caad585b73c61b800274a41cee40d58fde44db43fc7e9c5ec28cf');
const host=JSON.parse(raw),p=host.final.workspace.projects.find(p=>p.id===host.final.workspace.activeProjectId),w=p.working.weave;
const candidate={boundary:p.working.boundary,carrier:p.working.carrier,sourceContext:w.sourceContext,generation:w.generation},fingerprint=digest(candidate);
assert.equal(fingerprint,host.final.workerTelemetry.events.find(e=>e.type==='dispatched').input);
const expectedCanonical=canonical(w.derived),expectedPayload=encodeDerived(w.derived);
const payloadHashes=payload=>Object.fromEntries(['f64','u32','i32','u16'].map(k=>[k,sha(Buffer.from(payload[k]))]));
const expectedHashes=payloadHashes(expectedPayload);
const stamp=new Date().toISOString().replace(/[:.]/g,'-');
const report={sourceSha256:sha(raw),candidateFingerprint:fingerprint,node:process.version,host:{workerMs:447.8,deriveMs:389.8,encodeMs:54,totalMs:726.3},protocol:V.protocol,warmup:[],persistent:[],fresh:[],equivalenceChecks:0,scope:'Node diagnostic only; cannot replace actual host browser failure',stopped:null};
const save=()=>writeFileSync(new URL(`cold-worker-review-${stamp}.json`,dir),JSON.stringify(report,null,2));
let seq=0;
async function cycle(worker,started){
 const cpu=process.cpuUsage(),heap=process.memoryUsage();
 const result=await new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>{cleanup();reject(Error('750 ms response deadline exceeded'))},750);
  const received=x=>{cleanup();resolve(x)},failed=e=>{cleanup();reject(e)};
  function cleanup(){clearTimeout(timer);worker.off('message',received);worker.off('error',failed)}
  worker.once('message',received);worker.once('error',failed);
  worker.postMessage({protocolVersion:V.protocol,workerBuildId:host.build,sessionId:'cold-review',requestSequence:++seq,requestId:`cold-review:${seq}`,boardId:p.id,weaveStudyId:w.studyId,baseCommittedFingerprint:'diagnostic',candidateInputFingerprint:fingerprint,algorithmVersions:{...V},candidate});
 });
 const received=performance.now(),roundTripMs=received-started;
 assert.equal(result.type,'success',JSON.stringify(result.error));
 // Outside the timed request: compare every geometry/certificate field and all compact buffers.
 assert.equal(canonical(result.result),expectedCanonical);assert.equal(result.payload.id,expectedPayload.id);assert.deepEqual(payloadHashes(result.payload),expectedHashes);report.equivalenceChecks++;
 return{workerMs:result.workerMs,deriveMs:result.timing.deriveMs,encodeMs:result.timing.encodeMs,roundTripMs,outsideWorkerMs:roundTripMs-result.workerMs,parentCpu:process.cpuUsage(cpu),heapBefore:heap.heapUsed,heapAfter:process.memoryUsage().heapUsed};
}
const summaries=()=>{for(const key of ['persistent','fresh']){const values=report[key];if(!values.length)continue;report[key+'Summary']=Object.fromEntries(['workerMs','deriveMs','encodeMs','roundTripMs','outsideWorkerMs'].map(k=>{const a=values.map(r=>r[k]).sort((a,b)=>a-b);return[k,{samples:a.length,p50:a[Math.floor(a.length*.5)],p95:a[Math.ceil(a.length*.95)-1],max:a.at(-1)}]}));}};
let worker;
try{
 worker=new Worker(new URL('./r1b-worker-node.mjs',import.meta.url));
 for(let i=0;i<5;i++){report.warmup.push(await cycle(worker,performance.now()));save();}
 for(let i=0;i<30;i++){const sample=await cycle(worker,performance.now());report.persistent.push(sample);save();if(sample.workerMs>400){report.stopped='Persistent worker maximum failed; no further performance sampling';break;}}
 await worker.terminate();worker=null;summaries();
 if(!report.stopped&&report.persistentSummary.workerMs.p95>375)report.stopped='Persistent p95 failed; no fresh-worker sampling';
 if(!report.stopped)for(let i=0;i<5;i++){
  const started=performance.now();worker=new Worker(new URL('./r1b-worker-node.mjs',import.meta.url));const sample=await cycle(worker,started);report.fresh.push(sample);await worker.terminate();worker=null;save();
  if(sample.workerMs>400){report.stopped='Fresh worker maximum failed; no further performance sampling';break;}
 }
}catch(error){report.stopped={message:error.message,stack:error.stack};}finally{if(worker)await worker.terminate();summaries();save();}
console.log(JSON.stringify({evidence:`cold-worker-review-${stamp}.json`,equivalenceChecks:report.equivalenceChecks,persistent:report.persistentSummary,fresh:report.freshSummary,stopped:report.stopped},null,2));
