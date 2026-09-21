import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {Worker} from 'node:worker_threads';
import {parsePortable,packWorkspace,portableText} from '../dist/storage-codec.mjs';
import {validateWorkspace} from '../dist/document.mjs';
import {refreshWeave,canonical,digest,derivedSvg} from '../dist/weave.mjs';
import {findCrossings} from '../dist/interlacing.mjs';
import {resolveWeaveRules} from '../dist/weave-rules.mjs';
import {COMBINED_VERSIONS} from '../dist/combined.mjs';
import {STITCH_VERSIONS} from '../dist/stitch.mjs';
import {ATTRACTOR_VERSIONS} from '../dist/attractor.mjs';
import {INFLUENCE_VERSIONS,FAMILY_INFLUENCE_VERSIONS} from '../dist/influence.mjs';

const directory=path.resolve('docs/evidence/stability-phase0');
const sha=value=>createHash('sha256').update(value).digest('hex');
const timed=fn=>{const start=performance.now(),value=fn();return {value,ms:performance.now()-start};};
const fixtures=fs.readdirSync(directory).filter(name=>name.endsWith('.portable.json')).sort();
const report={capturedAt:new Date().toISOString(),node:process.version,scope:'Phase 0 measured baseline; timings are diagnostic, not sustained browser certification',fixtures:[],failures:[]};
for(const name of fixtures){
 const text=fs.readFileSync(path.join(directory,name),'utf8'),load=timed(()=>parsePortable(text)),workspace=load.value;
 const validation=timed(()=>validateWorkspace(workspace)),packed=timed(()=>packWorkspace(workspace));
 assert.equal(portableText(packed.value),text,'Native portable bytes must remain identical');
 const entry={name,sha256:sha(text),bytes:Buffer.byteLength(text),loadDecodeMs:load.ms,fullValidationMs:validation.ms,packMs:packed.ms,projects:[]};
 for(const project of workspace.projects){
  const p={id:project.id,name:project.name,boundaries:project.boundaries.length,patterns:project.carrierStudies.length,weaves:project.weaveStudies.length,boundaryRevisions:project.boundaries.reduce((n,s)=>n+s.revisions.length,0),carrierRevisions:project.carrierStudies.reduce((n,s)=>n+s.revisions.length,0),weaveRevisions:project.weaveStudies.reduce((n,s)=>n+s.revisions.length,0),designs:[]};
  const designs=[{label:'working',working:project.working},...project.weaveStudies.flatMap(s=>s.revisions.map(r=>({label:s.name+'/'+r.id,working:r.working})))];
  for(const {label,working} of designs){
   if(!working.weave)continue;
   const regenerated=timed(()=>refreshWeave(structuredClone(working),project.id));
   assert.equal(canonical(regenerated.value.weave.derived),canonical(working.weave.derived),label+' regeneration');
   const crossings=timed(()=>findCrossings(working.weave.derived.strands));
   const rules=working.interlacing?.enabled?resolveWeaveRules(working.weave.derived.strands,crossings.value,working.interlacing,working.weave.derived.provenanceFingerprint):new Map();
   const svg=timed(()=>derivedSvg(working,project.id,true,crossings.value));
   p.designs.push({label,studyId:working.weave.studyId,sourceRevision:working.carrierSourceRevisionId,families:working.familyCatalog,carrier:working.carrier,generation:working.weave.generation,appearance:working.threadAppearance,interlacing:working.interlacing,geometrySha256:sha(canonical(working.weave.derived)),svgSha256:sha(svg.value),svgBytes:Buffer.byteLength(svg.value),strands:working.weave.derived.strands.length,crossings:crossings.value.counts,assigned:rules.size,generationMs:regenerated.ms,crossingMs:crossings.ms,svgPreparationMs:svg.ms});
  }
  entry.projects.push(p);
 }
 report.fixtures.push(entry);
}

// A bounded real production worker sample per distinct active generation version.
const worker=new Worker(new URL('./r1b-worker-node.mjs',import.meta.url));
report.workerSamples=[];
try{
 let sequence=0;
 for(const name of fixtures){
  const ws=parsePortable(fs.readFileSync(path.join(directory,name),'utf8'));
  for(const p of ws.projects){
   const w=p.working;if(!w.weave?.generation)continue;
   const versions=[COMBINED_VERSIONS,STITCH_VERSIONS,ATTRACTOR_VERSIONS,INFLUENCE_VERSIONS,FAMILY_INFLUENCE_VERSIONS].find(v=>v.study===w.weave.weaveVersion);
   if(!versions)continue;
   const candidate={boundary:w.boundary,carrier:w.carrier,sourceContext:w.weave.sourceContext,generation:w.weave.generation},requestId='phase0:'+ ++sequence;
   const message={protocolVersion:versions.protocol,workerBuildId:'phase0-baseline',sessionId:'phase0',requestSequence:sequence,requestId,boardId:p.id,weaveStudyId:w.weave.studyId,baseCommittedFingerprint:'phase0-root',candidateInputFingerprint:digest(candidate),algorithmVersions:{...versions},candidate};
   const started=performance.now(),result=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Worker diagnostic timed out')),5000);worker.once('message',m=>{clearTimeout(timer);resolve(m);});worker.once('error',reject);worker.postMessage(message);});
   assert.equal(result.type,'success',JSON.stringify(result.error));assert.equal(canonical(result.result),canonical(w.weave.derived));
   report.workerSamples.push({fixture:name,requestId,workerMs:result.workerMs,deriveMs:result.timing.deriveMs,encodeMs:result.timing.encodeMs,roundTripMs:performance.now()-started,exact:true,within400ms:result.workerMs<=400});
  }
 }
}finally{await worker.terminate();}
fs.writeFileSync(path.join(directory,'baseline-measurements.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({fixtures:report.fixtures.map(f=>({name:f.name,bytes:f.bytes,designs:f.projects.reduce((n,p)=>n+p.designs.length,0)})),workerSamples:report.workerSamples},null,2));
