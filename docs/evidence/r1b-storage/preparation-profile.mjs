// Diagnostic-only phase profile for the accepted dense R1B fixture. It does not alter runtime behavior.
import fs from 'node:fs';
import {Worker} from 'node:worker_threads';
import {createWorkspace,saveCarrierStudy,createWeaveStudy,addAttractor,validateTrustedWorkspace,clone} from '../../../dist/document.mjs';
import {createRectangularCarrier} from '../../../dist/carrier.mjs';
import {validateBoundary} from '../../../dist/boundary.mjs';
import {deriveAttractor} from '../../../dist/attractor.mjs';
import {digest} from '../../../dist/weave.mjs';
import {encodeDerived,packWorkspace,portableText} from '../../../dist/storage-codec.mjs';
import {History} from '../../../dist/history.mjs';

const runs=7,stats=values=>{const a=[...values].sort((x,y)=>x-y);return{runs:a.length,minMs:a[0],p50Ms:a[Math.floor(a.length*.5)],p95Ms:a[Math.min(a.length-1,Math.ceil(a.length*.95)-1)],maxMs:a.at(-1)}};
const measure=(fn,n=runs)=>{const values=[];let value;for(let i=0;i<n;i++){const started=performance.now();value=fn();values.push(performance.now()-started)}return{value,stats:stats(values)}};
const points=[];for(let i=0;i<100;i++){const a=i*2*Math.PI/100,r=i%2?250:220;points.push({x:r*Math.cos(a),y:r*Math.sin(a)})}
const workspace=createWorkspace();let project=workspace.projects[0];project.working.carrier=createRectangularCarrier();project=saveCarrierStudy(project,'SOURCE').project;project=createWeaveStudy(project,project.carrierStudies[0].latestRevisionId);project=addAttractor(project);project.working.boundary=validateBoundary(points);project.working.carrier.families.A.spacing=2.5;project.working.carrier.families.B.spacing=2.5;project.working.carrierSourceRevisionId=null;workspace.projects[0]=project;
const derived=deriveAttractor(project.working.boundary,project.working.carrier,project.id,project.working.weave.sourceContext,project.working.weave.generation,digest);project.working.weave.derived=derived;
const transferTimes=[];for(let i=0;i<runs;i++){const worker=new Worker("const{parentPort}=require('node:worker_threads');parentPort.on('message',v=>parentPort.postMessage(v))",{eval:true}),started=performance.now();await new Promise((resolve,reject)=>{worker.once('message',resolve);worker.once('error',reject);worker.postMessage(derived)});transferTimes.push(performance.now()-started);await worker.terminate()}
const validation=measure(()=>validateTrustedWorkspace(workspace));
const cloneWorkspace=measure(()=>structuredClone(workspace));
const geometryHash=measure(()=>digest(derived));
const codec=measure(()=>encodeDerived(derived));
const packed=packWorkspace(workspace);
const admission=measure(()=>portableText(packed));
const fullPreparation=measure(()=>packWorkspace(workspace));
const before=clone(project.working),after=clone(project.working);after.weave.generation.attractor.center.x+=1;
const history=measure(()=>{const h=new History();h.record(before,after);return h});
const report={
 fixture:'100-vertex alternating-radius boundary; A/B spacing 2.5',
 geometry:{strands:derived.strands.length,fragments:derived.diagnostics.intervals,segments:derived.diagnostics.segments,certificates:derived.diagnostics.clippedSegments},
 phases:{
  workerResultStructuredCloneRoundTrip:stats(transferTimes),
  trustedWorkspaceValidation:validation.stats,
  workspaceStructuredClone:cloneWorkspace.stats,
  derivedGeometryHash:geometryHash.stats,
  compactCodecEncoding:codec.stats,
  fullPortableSerializationAdmission:admission.stats,
  currentPackWorkspaceTotal:fullPreparation.stats,
  currentHistoryRecord:history.stats,
  indexedDbTransaction:{measured:false,reason:'The failed request timed out before transaction start; browser-only instrumentation is required.'},
  render:{measured:false,reason:'The failed request did not reach committed render; browser-only instrumentation is required.'}
 },
 payload:{id:codec.value.id,byteLengths:codec.value.byteLengths,backupBytes:packed.backupBytes},
 interpretation:'Diagnostic timings are local Node measurements. Browser host evidence remains authoritative for the 750 ms gate.'
};
fs.writeFileSync(new URL('./preparation-profile.json',import.meta.url),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
