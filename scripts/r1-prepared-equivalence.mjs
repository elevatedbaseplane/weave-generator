// Freeze with the pre-repair source, verify with the optimized source. Never overwrite evidence.
import {readFileSync,writeFileSync} from 'node:fs';
import {gzipSync,gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {deriveForWeave,digest,canonical} from '../dist/weave.mjs';
import {deriveCombined,deriveCombinedAsync,deformCombinedPoint,variationOffset} from '../dist/combined.mjs';
import {encodeDerived,packWorkspace,portableText} from '../dist/storage-codec.mjs';
const dir=new URL('../docs/evidence/r1-checkpoint-20260917/',import.meta.url),file=new URL('prepared-complete-baseline.json.gz',dir),freeze=process.argv.includes('--freeze');
const sha=x=>createHash('sha256').update(x).digest('hex'),source=readFileSync(new URL('../dist/combined.mjs',import.meta.url));
function fixtures(){
 const host=JSON.parse(readFileSync(new URL('browser-2026-09-17T18-36-42-095Z.json',dir))),p=host.final.workspace.projects.find(p=>p.id===host.final.workspace.activeProjectId),base={id:p.id,working:structuredClone(p.working)},out=[];
 function add(name,edit=()=>{}){const p=structuredClone(base);edit(p.working);out.push({name,p});}
 add('exact-host-x0');add('exact-host-x1',w=>w.weave.generation.influences[0].center.x=1);
 // Smaller variants retain the same numerical algorithms without repeating the dense performance proof.
 base.working.carrier.families.A.spacing=50;base.working.carrier.families.B.spacing=50;
 add('legacy-omitted',w=>delete w.weave.generation.influences[0].falloff);
 for(let n=1;n<=5;n++)add('falloff-'+n,w=>w.weave.generation.influences[0].falloff=n);
 for(const kind of ['repeller','deflector'])add(kind,w=>{w.weave.generation.influences[0].kind=kind;w.weave.generation.influences[0].direction=37;});
 add('disabled-identity',w=>w.weave.generation.influences[0].enabled=false);
 add('variation',w=>{w.weave.generation.variation.seed=4294967295;w.weave.generation.variation.families.A.amount=83;w.weave.generation.variation.families.B.amount=27;});
 add('concave',w=>w.boundary.points=[{x:-250,y:-250},{x:250,y:-250},{x:250,y:250},{x:80,y:250},{x:80,y:-80},{x:-80,y:-80},{x:-80,y:250},{x:-250,y:250}]);
 add('eight-mixed',w=>{const g=w.weave.generation;g.influences=Array.from({length:8},(_,i)=>({...structuredClone(g.influences[0]),id:'field-'+(7-i),kind:['attractor','repeller','deflector'][i%3],center:{x:i*9,y:-i*7},direction:i*20,falloff:i%5+1}));});
 add('eight-families',w=>{const g=w.weave.generation;w.carrier.generatorVersion='rect-v2';w.carrier.families={};g.variation.families={};for(let i=0;i<8;i++){const n=String.fromCharCode(65+i);w.carrier.families[n]={angleDegrees:i*20,spacing:70+i,offset:i,density:80};g.variation.families[n]={amount:i*5};g.influences[0].families[n]={strength:50,tension:i*10};}});
 add('zero-strength',w=>{for(const f of Object.values(w.weave.generation.influences[0].families))f.strength=0;});
 add('full-tension',w=>{for(const f of Object.values(w.weave.generation.influences[0].families))f.tension=100;});
 return out;
}
function failures(p){const g=p.working.weave.generation,out=[];for(const [name,edit]of [['duplicate',g=>g.influences.push(structuredClone(g.influences[0]))],['seed',g=>g.variation.seed=-1],['unknown',g=>g.extra=true],['falloff',g=>g.influences[0].falloff=6],['radius',g=>g.influences[0].radius=0],['direction',g=>g.influences[0].direction=181],['amount',g=>g.variation.families.A.amount=101],['limit',g=>g.influences=Array.from({length:9},(_,i)=>({...g.influences[0],id:String(i)}))]]){const bad=structuredClone(g);edit(bad);for(const [entry,run]of [['derive',()=>deriveCombined(p.working.boundary,p.working.carrier,p.id,p.working.weave.sourceContext,bad,digest)],['point',()=>deformCombinedPoint({x:0,y:0},bad)],['variation',()=>variationOffset(bad,'A',1,50)]]){try{run();throw Error('Expected rejection')}catch(e){assert.notEqual(e.message,'Expected rejection');out.push({name,entry,error:{name:e.name,message:e.message}})}}}return out;}
async function output(p){const w=p.working,d=deriveForWeave(w.weave,w.boundary,w.carrier,p.id);if(d.versions.study==='weave-study-v5')assert.deepEqual(await deriveCombinedAsync(w.boundary,w.carrier,p.id,w.weave.sourceContext,w.weave.generation),d);const payload=encodeDerived(d),buffers=Object.fromEntries(['f64','u32','i32','u16'].map(k=>[k,Buffer.from(payload[k]).toString('base64')]));const workspace={projects:[{id:p.id,working:{...w,weave:{...w.weave,derived:d}},weaveStudies:[]}],activeProjectId:p.id};return{derived:d,canonical:canonical(d),fingerprint:digest(d),payload:{...payload,...buffers},portable:portableText(packWorkspace(workspace))};}
const baseline=freeze?{sourceSha256:sha(source),fixtures:fixtures()}:JSON.parse(gunzipSync(readFileSync(file)));
let checks=0;for(const f of baseline.fixtures){const actual=await output(f.p);if(freeze)f.expected=actual;else assert.deepEqual(actual,f.expected,f.name);checks++;}
const errors=failures(baseline.fixtures[2].p);if(freeze){baseline.errors=errors;writeFileSync(file,gzipSync(JSON.stringify(baseline)),{flag:'wx'});}else{assert.deepEqual(errors,baseline.errors);writeFileSync(new URL('prepared-equivalence-result.json',dir),JSON.stringify({passed:true,fixtures:checks,failureChecks:errors.length,baselineSha256:sha(readFileSync(file)),beforeSourceSha256:baseline.sourceSha256,afterSourceSha256:sha(source),checks:'Deep/canonical equality, fingerprints, four compact buffers, portable JSON, sync/async and public rejection equivalence'},null,2));}
console.log(JSON.stringify({freeze,fixtures:checks,failureChecks:errors.length,passed:true}));
