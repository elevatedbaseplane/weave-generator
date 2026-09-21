// Planning measurement only: existing evaluator, no browser writes or production changes.
import fs from 'node:fs';
import {gzipSync} from 'node:zlib';
import {createWorkspace,saveCarrierStudy,createWeaveStudy,addAttractor,candidateAttractor,clone,saveWeaveStudy} from '../../../dist/document.mjs';
import {createRectangularCarrier} from '../../../dist/carrier.mjs';
import {parseCoordinates} from '../../../dist/boundary.mjs';
import {deriveAttractor} from '../../../dist/attractor.mjs';
import {digest,refreshWeave} from '../../../dist/weave.mjs';
const sizeText=t=>({codeUnits:t.length,utf8Bytes:Buffer.byteLength(t),utf16Bytes:2*t.length,gzipBytes:gzipSync(t).length});
const size=v=>sizeText(JSON.stringify(v));
let w=createWorkspace(),past=[];
const steps=[];
function capture(label){steps.push({label,workspace:clone(w)});}
function edit(fn,nonlinear=false){const before=clone(w.projects[0].working);fn();const p=w.projects[0];if(nonlinear)p.working.weave.derived=deriveAttractor(p.working.boundary,p.working.carrier,p.id,p.working.weave.sourceContext,p.working.weave.generation,digest);else if(p.working.weave)p.working=refreshWeave(p.working,p.id);past.push(before);}
edit(()=>w.projects[0].working.carrier=createRectangularCarrier());
w.projects[0]=saveCarrierStudy(w.projects[0],'SOURCE').project;
edit(()=>w.projects[0]=createWeaveStudy(w.projects[0],w.projects[0].carrierStudies[0].latestRevisionId));
edit(()=>w.projects[0]=addAttractor(w.projects[0]),true);
edit(()=>w.projects[0]=candidateAttractor(w.projects[0],{attractor:{center:{x:30,y:0}}}),true);
const pts=[];for(let i=0;i<100;i++){const a=i*2*Math.PI/100,r=i%2?250:220;pts.push(`${r*Math.cos(a)},${r*Math.sin(a)}`)}
edit(()=>w.projects[0].working.boundary=parseCoordinates(pts.join('\n')),true);
edit(()=>{w.projects[0].working.carrier.families.A.spacing=2.5;w.projects[0].working.carrierSourceRevisionId=null},true);capture('request4 previous recovery before request7');
edit(()=>w.projects[0].working.carrier.families.B.spacing=2.5,true);capture('request5 committed before request7');
const historyBefore=size({past,future:[]});
edit(()=>w.projects[0]=candidateAttractor(w.projects[0],{attractor:{center:{x:0,y:0}}}),true);capture('request7 proposed replacement');
const output={method:'Reconstructed exact fixture operations using existing modules. Original browser bytes/IDs/date/quota not captured. UUID lengths and timestamp widths match; numbers may vary by runtime. gzip is empirical only, not a worst-case bound.',states:steps.map(({label,workspace})=>{const d=workspace.projects[0].working.weave.derived,fragments=d.strands.flatMap(s=>s.fragments),cert=fragments.map(f=>f.segmentErrorBounds),points=fragments.map(f=>f.points);return{label,workspace:size(workspace),working:size(workspace.projects[0].working),derived:size(d),pointArrays:size(points),certificateArrays:size(cert),certificatePropertyBytes:fragments.reduce((n,f)=>n+Buffer.byteLength(',"segmentErrorBounds":'+JSON.stringify(f.segmentErrorBounds)),0),fragments:fragments.length,pointCount:points.reduce((n,p)=>n+p.length,0),certificateCount:cert.flat().length,diagnostics:d.diagnostics,backup:sizeText(JSON.stringify({format:'weave-foundation',version:1,workspace},null,2)),compactJsonBackup:size({format:'weave-foundation',version:1,workspace})}}),history:{persistedBytes:0,beforeFailedAttempt:historyBefore,ifAttemptHadCommitted:size({past,future:[]})}};
const [prev,current,next]=output.states;output.localStorageValueTotals={beforeAttempt:current.workspace.codeUnits+prev.workspace.codeUnits,afterPreviousWriteBeforeReplacement:2*current.workspace.codeUnits,successfulReplacement:current.workspace.codeUnits+next.workspace.codeUnits};
const saved=clone(w);saved.projects[0]=saveWeaveStudy(saved.projects[0],'R1B FIELD',true).project;output.oneSavedRevision={workspace:size(saved),revision:size(saved.projects[0].weaveStudies[0].revisions[0]),backup:sizeText(JSON.stringify({format:'weave-foundation',version:1,workspace:saved},null,2))};
output.worstCaseNumericPayload={segments:65536,fragments:20000,maxPoints:85536,xyFloat64Bytes:85536*16,certificateFloat64Bytes:65536*8,fragmentEndpointsFloat64Bytes:20000*16,numericSubtotal:85536*16+65536*8+20000*16,note:'Conservative joint-capacity envelope, not a generated reachable fixture; excludes identities, offsets, provenance, manifests and saved studies.'};
fs.writeFileSync(new URL('./sizes.json',import.meta.url),JSON.stringify(output,null,2));
console.log(JSON.stringify(output,null,2));
