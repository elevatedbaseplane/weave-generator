import {readWeaveSource,validateWeaveSource,materializeWeaveSource} from './weave-source.mjs';
import {continuousWeaveSvg} from './weave-occlusion.mjs';
import {presentationBleedStrands,threadPaths,threadStroke,threadOpacity} from './thread-appearance.mjs';
import {STITCH_SOURCE} from './stitch-source.mjs';
import {deriveStitch,emptyStitchGeneration,validateStitchGeneration,STITCH_VERSIONS} from './stitch.mjs';
import {deriveCarrier,validateCarrierRecipe,carrierTolerance,carrierInputFingerprint,CARRIER_LIMITS,familyNames,familyAxes} from './carrier.mjs';
import {validateBoundaryRecord,bounds} from './boundary.mjs';
import {deriveAttractor,validateGeneration,ATTRACTOR_VERSIONS} from './attractor.mjs';
import {deriveInfluence,validateGeneration as validateInfluenceGeneration,isIdentityGeneration,INFLUENCE_VERSIONS,FAMILY_INFLUENCE_VERSIONS} from './influence.mjs';
import {deriveCombined,validateCombinedGeneration,combinedIdentity,COMBINED_VERSIONS} from './combined.mjs';

export const WEAVE_VERSIONS=Object.freeze({source:'strand-source-v1',parameterization:'rect-distance-v1',derivation:'derived-identity-v1',study:'weave-study-v1'});
export function canonical(value){
  if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';
  if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';
  if(typeof value==='number'&&!Number.isFinite(value))throw new Error('Nonfinite geometry.');
  if(value===undefined)throw new Error('Missing data.');
  return JSON.stringify(value);
}
// Synchronous SHA-256 keeps validation and persistence in one atomic transaction.
const K=Uint32Array.from([0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2]);
const rotr=(x,n)=>(x>>>n)|(x<<(32-n));
export function sha256(text){
 const bytes=new TextEncoder().encode(text),size=Math.ceil((bytes.length+9)/64)*64,buffer=new Uint8Array(size);buffer.set(bytes);buffer[bytes.length]=128;
 const view=new DataView(buffer.buffer);view.setUint32(size-8,Math.floor(bytes.length/0x20000000));view.setUint32(size-4,(bytes.length*8)>>>0);
 const h=Uint32Array.from([0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19]),w=new Uint32Array(64);
 for(let offset=0;offset<size;offset+=64){
  for(let i=0;i<16;i++)w[i]=view.getUint32(offset+4*i);
  for(let i=16;i<64;i++){const a=w[i-15],b=w[i-2];w[i]=(w[i-16]+(rotr(a,7)^rotr(a,18)^(a>>>3))+w[i-7]+(rotr(b,17)^rotr(b,19)^(b>>>10)))>>>0;}
  let [a,b,c,d,e,f,g,j]=h;
  for(let i=0;i<64;i++){const t1=(j+(rotr(e,6)^rotr(e,11)^rotr(e,25))+((e&f)^(~e&g))+K[i]+w[i])>>>0,t2=((rotr(a,2)^rotr(a,13)^rotr(a,22))+((a&b)^(a&c)^(b&c)))>>>0;j=g;g=f;f=e;e=(d+t1)>>>0;d=c;c=b;b=a;a=(t1+t2)>>>0;}
  [a,b,c,d,e,f,g,j].forEach((x,i)=>h[i]=(h[i]+x)>>>0);
 }return [...h].map(x=>x.toString(16).padStart(8,'0')).join('');
}
export const digest=value=>'sha256-v1:'+sha256(canonical(value));
export async function sha256Async(text){const bytes=new TextEncoder().encode(text),hash=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('');}
export async function digestAsync(value){return'sha256-v1:'+await sha256Async(canonical(value));}
export function exactKeys(value,keys,label){
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!keys.includes(k))||keys.some(k=>!(k in value)))throw new Error('Unsupported or missing '+label+' data.');
}
export function preflightCarrier(boundary,carrier){
 validateBoundaryRecord(boundary);validateCarrierRecipe(carrier);
 const tau=carrierTolerance(boundary),b=bounds(boundary.points),center={x:(b.minX+b.maxX)/2,y:(b.minY+b.maxY)/2},o={x:carrier.origin.x-center.x,y:carrier.origin.y-center.y};
 let count=0;
 for(const family of familyNames(carrier)){
  const f=carrier.families[family],n=familyAxes(carrier,family).normal;
  if(f.spacing<=100*tau)throw new Error(family+' spacing is too small for this boundary scale.');
  const projections=boundary.points.map(p=>(p.x-center.x-o.x)*n.x+(p.y-center.y-o.y)*n.y),k0=Math.ceil((Math.min(...projections)-f.offset)/f.spacing-tau/f.spacing),k1=Math.floor((Math.max(...projections)-f.offset)/f.spacing+tau/f.spacing);
  if(!Number.isSafeInteger(k0)||!Number.isSafeInteger(k1))throw new Error('Carrier index exceeds supported precision.');
  count+=Math.max(0,k1-k0+1);
 }
 if(count>CARRIER_LIMITS.candidateLines)throw new Error('This carrier would exceed the 2,000 source-line limit.');
 if(count*boundary.points.length>CARRIER_LIMITS.lineEdgeTests)throw new Error('This carrier would exceed the line-edge test limit.');
 return count;
}
export function safeDeriveCarrier(boundary,carrier,boardId){if(carrier?.kind===STITCH_SOURCE){const d=deriveStitch(boundary,carrier,boardId,{sourceBoardId:boardId,sourceCarrierRevisionId:'source-view'},emptyStitchGeneration(carrier));return{inputFingerprint:carrierInputFingerprint(boundary,carrier),paths:d.strands.map(s=>({family:s.identity.roleId,selected:true,intervals:s.fragments.map(f=>({start:f.points[0],end:f.points.at(-1)}))})),diagnostics:{...d.diagnostics,counts:Object.fromEntries(carrier.roles.map(r=>[r,{available:d.diagnostics.counts[r],retained:d.diagnostics.counts[r]}]))}};}preflightCarrier(boundary,carrier);return deriveCarrier(boundary,carrier,boardId);}
export function deriveIdentity(boundary,carrier,boardId,context){
 const d=safeDeriveCarrier(boundary,carrier,boardId);
 const geometry=d.paths.filter(p=>p.selected).map(p=>{
  const t=boundary.points.map(q=>(q.x-p.origin.x)*p.direction.x+(q.y-p.origin.y)*p.direction.y);
  return {family:p.family,k:p.k,origin:p.origin,direction:p.direction,evaluationDomain:[Math.min(...t),Math.max(...t)],fragments:p.intervals.map(i=>({t0:i.t0,t1:i.t1,points:[i.start,i.end],startProvenance:i.startProvenance,endProvenance:i.endProvenance}))};
 });
 const recipe={...carrier};delete recipe.id;
 const contentFingerprint=digest({version:WEAVE_VERSIONS.derivation,canonicalVersion:'sorted-json-v1',boundary:boundary.points,recipe,geometry});
 const provenanceFingerprint=digest({contentFingerprint,sourceBoardId:context.sourceBoardId,sourceCarrierRevisionId:context.sourceCarrierRevisionId,carrierId:carrier.id});
 const strands=geometry.map(p=>{const strandId=boardId+':'+carrier.id+':'+p.family+':'+p.k;return {...p,strandId,pathKey:{boardId,carrierId:carrier.id,family:p.family,k:p.k},primitiveId:'axis',parameterKind:'signed-distance',fragments:p.fragments.map((f,index)=>({...f,fragmentId:provenanceFingerprint+':'+strandId+':'+index}))};});
  const families=familyNames(carrier),counts=Object.fromEntries(families.map(f=>[f,strands.filter(p=>p.family===f).length]));return JSON.parse(JSON.stringify({versions:{...WEAVE_VERSIONS},contentFingerprint,provenanceFingerprint,carrierFingerprint:d.inputFingerprint,referenceSpacing:Math.min(...families.map(f=>carrier.families[f].spacing)),strands,diagnostics:{tau:d.diagnostics.tau,candidateLines:d.diagnostics.candidateLines,lineEdgeTests:d.diagnostics.lineEdgeTests,intervals:strands.reduce((n,p)=>n+p.fragments.length,0),counts,approximationError:0},complete:true}));
}
export function refreshWeave(working,boardId){
 const source=readWeaveSource(working,boardId);
 return materializeWeaveSource(source,source.working.weave?deriveWeaveSource(source):null);
}
export function deriveForWeave(w,boundary,carrier,boardId){return deriveWeaveSource(readWeaveSource({boundary,sourceRevisionId:null,carrier,carrierSourceRevisionId:null,weave:w},boardId));}
export function deriveWeaveSource(source){
 validateWeaveSource(source);
 const {boundary,carrier,weave:w}=source.working,boardId=source.projectId;
 if(!w)throw Error('Canonical source has no applied weave.');
 const version=w.weaveVersion||WEAVE_VERSIONS.study;
 if(![WEAVE_VERSIONS.study,ATTRACTOR_VERSIONS.study,INFLUENCE_VERSIONS.study,FAMILY_INFLUENCE_VERSIONS.study,COMBINED_VERSIONS.study,STITCH_VERSIONS.study].includes(version))throw Error('Unsupported canonical weave algorithm version.');
 if(carrier?.kind===STITCH_SOURCE)return deriveStitch(boundary,carrier,boardId,w.sourceContext,w.generation||emptyStitchGeneration(carrier));
 if(version===ATTRACTOR_VERSIONS.study){validateGeneration(w.generation);const f=w.generation.attractor;if(f&&f.enabled&&f.strength>0&&w.generation.tension<100)return deriveAttractor(boundary,carrier,boardId,w.sourceContext,w.generation,digest)}
 if([INFLUENCE_VERSIONS.study,FAMILY_INFLUENCE_VERSIONS.study].includes(version)){validateInfluenceGeneration(w.generation);if(!isIdentityGeneration(w.generation))return deriveInfluence(boundary,carrier,boardId,w.sourceContext,w.generation,digest)}
 if(version===COMBINED_VERSIONS.study){validateCombinedGeneration(w.generation);if(!combinedIdentity(w.generation))return deriveCombined(boundary,carrier,boardId,w.sourceContext,w.generation,digest)}
 return deriveIdentity(boundary,carrier,boardId,w.sourceContext);
}
export function validateWeave(weave,working,project,verifyDerived=true){
 const v6=weave?.weaveVersion===STITCH_VERSIONS.study;
 const v2=weave?.weaveVersion===ATTRACTOR_VERSIONS.study,v3=weave?.weaveVersion===INFLUENCE_VERSIONS.study,v4=weave?.weaveVersion===FAMILY_INFLUENCE_VERSIONS.study,v5=weave?.weaveVersion===COMBINED_VERSIONS.study;exactKeys(weave,v2||v3||v4||v5||v6?['studyId','sourceName','sourceContext','originLineage','weaveVersion','generation','derived']:['studyId','sourceName','sourceContext','originLineage','derived'],'weave');if(v2)validateGeneration(weave.generation);if(v3||v4)validateInfluenceGeneration(weave.generation);if(v5)validateCombinedGeneration(weave.generation);if(v6)validateStitchGeneration(weave.generation,working.carrier.roles);
 if(typeof weave.studyId!=='string'||!weave.studyId||weave.studyId.length>120||typeof weave.sourceName!=='string'||weave.sourceName.length>80)throw new Error('Invalid weave identity.');
 const c=weave.sourceContext;
 exactKeys(c,['sourceBoardId','sourceCarrierRevisionId','parameterizationVersion','snapshot'],'source context');
 const found=project.carrierStudies.flatMap(e=>e.revisions).find(r=>r.id===c.sourceCarrierRevisionId);
 if(c.sourceBoardId!==project.id||c.parameterizationVersion!==(v6?STITCH_VERSIONS.parameterization:WEAVE_VERSIONS.parameterization)||!found||canonical(found)!==canonical(c.snapshot))throw new Error('Weave source snapshot or revision does not match.');
 if(working.carrier?.id!==c.snapshot.carrier.id)throw new Error('Weave carrier identity changed.');
 if(!Array.isArray(weave.originLineage)||weave.originLineage.length>100)throw new Error('Invalid origin lineage.');
 for(const origin of weave.originLineage){exactKeys(origin,['boardId','sourceCarrierRevisionId'],'origin');if(typeof origin.boardId!=='string'||!origin.boardId||origin.boardId.length>120||origin.sourceCarrierRevisionId!==c.sourceCarrierRevisionId)throw new Error('Invalid origin lineage.');}
 // Compare the complete expected output; rejects altered metadata, unknown versions and hidden geometry.
 if(verifyDerived&&canonical(weave.derived)!==canonical(deriveForWeave(weave,working.boundary,working.carrier,project.id)))throw new Error('Invalid or unsupported derived snapshot.');
 return weave;
}
export function rebaseWeave(working,oldBoardId,newBoardId){
 if(!working.weave)return;
 const w=working.weave;
 w.originLineage.push({boardId:oldBoardId,sourceCarrierRevisionId:w.sourceContext.sourceCarrierRevisionId});
 w.sourceContext.sourceBoardId=newBoardId;
 w.derived=deriveForWeave(w,working.boundary,working.carrier,newBoardId);
}
export function derivedSvg(working,boardId,trustedDerived=false,displayStrands=null){
 if(working.interlacing?.enabled&&!displayStrands)throw Error('Wait for complete interlacing before SVG export.');
 if(!working.weave)throw new Error('Create a Weave Study first.');
 const w=working.weave,expected=trustedDerived?w.derived:deriveForWeave(w,working.boundary,working.carrier,boardId);
 if(canonical(expected)!==canonical(w.derived))throw new Error('Export requires complete current derived geometry.');
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])),n=x=>{if(!Number.isFinite(x))throw new Error('Nonfinite export.');return String(x);},b=bounds(working.boundary.points),extent=Math.max(b.maxX-b.minX,b.maxY-b.minY),pad=extent*.12;
 const metadata={format:'weave-derived-svg',version:1,coordinates:{units:'document-units',yAxis:'up',svgTransform:'negate-y'},presentation:{openThreadEnds:true,boundaryContinuation:'tangent-to-source-v1',lengthRatio:.1},studyId:w.studyId,sourceName:w.sourceName,sourceContext:w.sourceContext,originLineage:w.originLineage,derived:w.derived,...(working.interlacing?{interlacing:working.interlacing}:{}),...(working.threadAppearance?{threadAppearance:working.threadAppearance}:{})};
 const visual=presentationBleedStrands(expected.strands,working.boundary),groups=working.interlacing?.enabled?continuousWeaveSvg(expected.strands,displayStrands,working.interlacing,working.threadAppearance,expected.provenanceFingerprint,working.boundary):visual.flatMap(p=>p.fragments.map(q=>{const record=threadPaths([{...p,fragments:[q]}],working.threadAppearance,v=>({x:v.x,y:-v.y}))[0];return '<path data-strand-id="'+esc(p.strandId||JSON.stringify(p.identity))+'" data-fragment-id="'+esc(q.fragmentId||JSON.stringify(q.fragmentReference))+'" opacity="'+threadOpacity(record)+'" stroke-width="'+threadStroke(record)+'" d="'+record.d+'"/>'})).join('');
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+[b.minX-pad,-b.maxY-pad,b.maxX-b.minX+2*pad,b.maxY-b.minY+2*pad].map(n).join(' ')+'" data-weave-coordinate-system="document-units;y-up;svg-y-negated"><metadata>'+esc(JSON.stringify(metadata))+'</metadata><g fill="none" stroke="black" stroke-linejoin="round" stroke-linecap="butt">'+groups+'</g></svg>';
}
