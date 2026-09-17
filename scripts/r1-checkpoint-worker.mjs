import {Worker} from 'node:worker_threads';
import {mkdirSync,writeFileSync} from 'node:fs';
import {denseFixture,stats} from '../docs/evidence/r1b-storage/performance-fixture.mjs';
import {COMBINED_VERSIONS as V} from '../dist/combined.mjs';
import {digest} from '../dist/weave.mjs';
const dir=new URL('../docs/evidence/r1-checkpoint-20260917/',import.meta.url);mkdirSync(dir,{recursive:true});
const reports=[];
for(const kind of (process.argv.includes('--eight-only')?['current-eight-mixed']:['current-dense-single','current-eight-mixed'])){
 const fixture=denseFixture(),candidate=structuredClone(fixture.candidate);
 const amount=kind==='current-eight-mixed'?8:1;
 if(amount===8)for(const q of Object.values(candidate.carrier.families))q.spacing=50;
 candidate.generation={version:V.generation,variation:{version:V.variation,seed:1042,families:{A:{amount:0},B:{amount:0}}},influences:Array.from({length:amount},(_,i)=>({id:`checkpoint-field-${i}`,kind:['attractor','repeller','deflector'][i%3],center:{x:amount===1?0:(i%4-1.5)*40,y:amount===1?0:(Math.floor(i/4)-.5)*80},radius:150,enabled:true,falloffVersion:V.falloff,falloff:3,direction:((45*i+180)%360)-180,families:{A:{strength:50,tension:0},B:{strength:50,tension:0}}}))};
 const message={...fixture.message,protocolVersion:V.protocol,algorithmVersions:{...V},candidate,candidateInputFingerprint:digest(candidate)};
 const worker=new Worker(new URL('./r1b-worker-node.mjs',import.meta.url));let pending;
 worker.on('message',value=>{pending?.resolve(value);pending=null});worker.on('error',error=>pending?.reject(error));
 const report={kind,fixture:{vertices:100,spacing:amount===1?2.5:50,influences:amount},warmup:[],runs:[],passed:false};
 try{
  for(let i=-5;i<30;i++){
   const value=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Worker round trip exceeded 750 ms')),750);pending={resolve:v=>{clearTimeout(timer);resolve(v)},reject:e=>{clearTimeout(timer);reject(e)}};worker.postMessage({...message,requestSequence:i+6,requestId:`${kind}:${i+6}`})});
   if(value.type!=='success')throw Object.assign(Error(value.error?.message),{workerError:value.error});
   if(!value.result.complete||value.result.diagnostics.maxCertifiedError>value.result.diagnostics.epsilon)throw Error('Incomplete or uncertified geometry');
   report.diagnostics=value.result.diagnostics;(i<0?report.warmup:report.runs).push({i,workerMs:value.workerMs,...value.timing});
  }
  report.summary=stats(report.runs.map(r=>r.workerMs));report.passed=report.summary.p95Ms<=375&&report.summary.maxMs<=400;
  if(!report.passed)report.failure={message:'Authoritative complete-worker 375/400 ms gate failed'};
 }catch(error){report.failure={message:error.message,workerError:error.workerError??null};}finally{await worker.terminate();}
 reports.push(report);writeFileSync(new URL('current-worker-results.json',dir),JSON.stringify({passed:reports.every(r=>r.passed),reports},null,2));
 console.log(JSON.stringify({kind,passed:report.passed,summary:report.summary,failure:report.failure}));if(!report.passed){process.exitCode=1;break;}
}
