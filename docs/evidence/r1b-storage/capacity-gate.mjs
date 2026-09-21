// Supported high-fragmentation geometry gate. Uses the unchanged numerical evaluator.
import fs from 'node:fs';
import {createWorkspace,saveCarrierStudy,createWeaveStudy,addAttractor} from '../../../dist/document.mjs';
import {createRectangularCarrier} from '../../../dist/carrier.mjs';
import {validateBoundary} from '../../../dist/boundary.mjs';
import {deriveAttractor} from '../../../dist/attractor.mjs';
import {digest} from '../../../dist/weave.mjs';
import {packWorkspace,encodeDerived,PORTABLE_LIMIT} from '../../../dist/storage-codec.mjs';
const w=createWorkspace();w.projects[0].working.carrier=createRectangularCarrier();w.projects[0]=saveCarrierStudy(w.projects[0],'SOURCE').project;w.projects[0]=createWeaveStudy(w.projects[0],w.projects[0].carrierStudies[0].latestRevisionId);w.projects[0]=addAttractor(w.projects[0]);
// 24 vertical teeth attached to a bottom bar: simple, positive area, exactly 100 vertices.
const points=[{x:0,y:0},{x:500,y:0},{x:500,y:500}];
for(let i=0;i<24;i++){const right=500-(i*2+1)*10,left=500-(i*2+2)*10;points.push({x:right,y:500},{x:right,y:10},{x:left,y:10},{x:left,y:500});}
points.push({x:0,y:500});
const p=w.projects[0];p.working.boundary=validateBoundary(points);p.working.carrier.families.A.spacing=.64;p.working.carrier.families.B.spacing=.64;p.working.carrierSourceRevisionId=null;
p.working.weave.generation.attractor.center={x:250,y:5};p.working.weave.generation.attractor.radius=1;
const report={fixture:'24-tooth comb',boundaryVertices:points.length,spacing:.64,geometryPassed:false,backupAdmissionPassed:false,portableLimit:PORTABLE_LIMIT};
try{const started=performance.now(),d=deriveAttractor(p.working.boundary,p.working.carrier,p.id,p.working.weave.sourceContext,p.working.weave.generation,digest);p.working.weave.derived=d;report.geometryMs=performance.now()-started;report.geometryPassed=true;report.diagnostics=d.diagnostics;const payload=encodeDerived(d);report.payloadDecodedBytes=Object.values(payload.byteLengths).reduce((a,b)=>a+b,0);report.metadataBytes=Buffer.byteLength(JSON.stringify({meta:payload.meta,dictionary:payload.dictionary,counts:payload.counts,byteLengths:payload.byteLengths}));try{const packed=packWorkspace(w);report.backupBytes=packed.backupBytes;report.backupAdmissionPassed=true;}catch(e){report.error={code:e.code,message:e.message};}}catch(e){report.error={code:e.code,message:e.message};}
fs.writeFileSync(new URL('./capacity-gate.json',import.meta.url),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
if(!report.geometryPassed||!report.backupAdmissionPassed)process.exitCode=1;
