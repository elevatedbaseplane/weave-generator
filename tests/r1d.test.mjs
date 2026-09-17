import test from 'node:test';
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {createWorkspace,saveCarrierStudy,createWeaveStudy,addInfluence,duplicateInfluence,candidateInfluence,candidateVariation,removeInfluence,saveWeaveStudy,validateTrustedWorkspace,clone} from '../dist/document.mjs';
import {createRectangularCarrier} from '../dist/carrier.mjs';
import {deriveForWeave,digest,canonical} from '../dist/weave.mjs';
import {COMBINED_VERSIONS,COMBINED_LIMITS,deformCombinedPoint,signedVariation,validateCombinedGeneration} from '../dist/combined.mjs';
import {FAMILY_INFLUENCE_VERSIONS} from '../dist/influence.mjs';
import {packWorkspace,unpackWorkspace,portableText,parsePortable} from '../dist/storage-codec.mjs';

function setup(kind='attractor'){
 const w=createWorkspace(),p=w.projects[0];p.working.carrier=createRectangularCarrier('carrier-r1d');w.projects[0]=saveCarrierStudy(p,'SOURCE').project;w.projects[0]=createWeaveStudy(w.projects[0],w.projects[0].carrierStudies[0].latestRevisionId);w.projects[0]=addInfluence(w.projects[0],kind);return w;
}
function derive(p){const w=p.working.weave;return deriveForWeave(w,p.working.boundary,p.working.carrier,p.id);}

test('combined fields add from one base point and exact opposing fields cancel independent of order',()=>{
 let w=setup('attractor'),p=w.projects[0];p=addInfluence(p,'repeller');const [a,b]=p.working.weave.generation.influences;b.center={...a.center};b.radius=a.radius;b.families=clone(a.families);const point={x:a.center.x+a.radius/2,y:a.center.y};assert.deepEqual(deformCombinedPoint(point,p.working.weave.generation,'A'),point);const first=derive(p),reordered=clone(p);reordered.working.weave.generation.influences.reverse();const second=derive(reordered);assert.deepEqual(second,first);assert.equal(second.contentFingerprint,first.contentFingerprint);
});

test('mixed overlapping fields remain complete and family settings are independent',()=>{
 let p=setup('attractor').projects[0];p=addInfluence(p,'deflector');const ids=p.working.weave.generation.influences.map(f=>f.id);p=candidateInfluence(p,{influenceId:ids[0],family:'B',familySettings:{strength:0,tension:100}});p=candidateInfluence(p,{influenceId:ids[1],influence:{direction:90},family:'A',familySettings:{strength:80,tension:15}});const d=derive(p);assert.equal(d.complete,true);assert.equal(d.versions.study,COMBINED_VERSIONS.study);assert.equal(d.diagnostics.influenceCount,2);assert.ok(d.diagnostics.maxCertifiedError<=d.diagnostics.epsilon);
});

test('seeded per-strand variation is repeatable, family independent and bounded',()=>{
 let p=setup().projects[0];for(const f of p.working.weave.generation.influences)f.enabled=false;p=candidateVariation(p,{seed:1042,families:{A:{amount:100},B:{amount:0}}});const first=derive(p),again=derive(p);assert.deepEqual(again,first);const a=first.strands.filter(s=>s.family==='A').sort((x,y)=>x.k-y.k),b=first.strands.filter(s=>s.family==='B');for(let i=1;i<a.length;i++){const dx=a[i].origin.x-a[i-1].origin.x,dy=a[i].origin.y-a[i-1].origin.y;assert.ok(Math.hypot(dx,dy)>=p.working.carrier.families.A.spacing*.6-1e-9);}assert.ok(b.every(s=>Number.isInteger(s.origin.x/50)||Number.isInteger(s.origin.y/50)));const changed=candidateVariation(p,{seed:1043}),other=derive(changed);assert.notEqual(other.contentFingerprint,first.contentFingerprint);assert.equal(signedVariation(1042,'A',3),signedVariation(1042,'A',3));
});

test('zero variation and disabled fields route to exact identity geometry',()=>{
 const p=setup().projects[0];p.working.weave.generation.influences[0].enabled=false;const d=derive(p);assert.equal(d.versions.study,'weave-study-v1');assert.equal(d.diagnostics.approximationError,0);
});

test('add duplicate remove and eight-field limit preserve stable identities atomically',()=>{
 let p=setup().projects[0],first=p.working.weave.generation.influences[0].id;p=duplicateInfluence(p,first);assert.equal(p.working.weave.generation.influences.length,2);assert.equal(p.working.weave.generation.influences[0].id,first);assert.notEqual(p.working.weave.generation.influences[1].id,first);while(p.working.weave.generation.influences.length<COMBINED_LIMITS.influences)p=addInfluence(p,'deflector');const before=canonical(p.working.weave.generation);assert.throws(()=>addInfluence(p),/eight/);assert.equal(canonical(p.working.weave.generation),before);const removed=removeInfluence(p,first);assert.equal(removed.working.weave.generation.influences.some(f=>f.id===first),false);
});

test('invalid combined records reject duplicate IDs seed and variation without mutation',()=>{
 const p=setup().projects[0],g=clone(p.working.weave.generation),before=canonical(g);g.influences.push(clone(g.influences[0]));assert.throws(()=>validateCombinedGeneration(g),/Invalid combined influence record/);assert.equal(canonical(p.working.weave.generation),before);const badSeed=clone(p.working.weave.generation);badSeed.variation.seed=-1;assert.throws(()=>validateCombinedGeneration(badSeed),/seeded variation/);const badAmount=clone(p.working.weave.generation);badAmount.variation.families.A.amount=101;assert.throws(()=>validateCombinedGeneration(badAmount),/Variation amounts/);
});

test('falloff is adjustable from one through five while legacy omitted falloff remains exact',()=>{
 const p=setup().projects[0],field=p.working.weave.generation.influences[0],sample={x:field.center.x+field.radius/2,y:field.center.y};
 const legacy=clone(p.working.weave.generation);delete legacy.influences[0].falloff;validateCombinedGeneration(legacy);
 const defaultPoint=deformCombinedPoint(sample,p.working.weave.generation,'A');assert.deepEqual(deformCombinedPoint(sample,legacy,'A'),defaultPoint);
 const wide=clone(p.working.weave.generation);wide.influences[0].falloff=1;const steep=clone(p.working.weave.generation);steep.influences[0].falloff=5;
 assert.notDeepEqual(deformCombinedPoint(sample,wide,'A'),deformCombinedPoint(sample,steep,'A'));
 for(const value of [0,6,1.5]){const bad=clone(p.working.weave.generation);bad.influences[0].falloff=value;assert.throws(()=>validateCombinedGeneration(bad),/falloff/);}
 const wideProject=clone(p);wideProject.working.weave.generation=wide;const steepProject=clone(p);steepProject.working.weave.generation=steep;
 for(const candidate of [wideProject,steepProject]){const result=derive(candidate);assert.equal(result.complete,true);assert.ok(result.diagnostics.maxCertifiedError<=result.diagnostics.epsilon);}
});

test('legacy schema-5 omitted falloff preserves its exact cubic certificate fixture',()=>{
 const p=setup().projects[0];delete p.working.weave.generation.influences[0].falloff;const result=derive(p);
 assert.equal(result.contentFingerprint,'sha256-v1:e1c02a76d18e4ac1b71eccd99a80b12f2f1ec7124e886978cfbb577748f1fe3f');
 assert.equal(result.diagnostics.segments,716);assert.equal(result.diagnostics.maxCertifiedError,0.04954419342070219);
});

test('editing a v4 working study promotes it to v5 without rewriting identity or values',()=>{
 const p=setup().projects[0],f=clone(p.working.weave.generation.influences[0]),id=f.id;p.working.weave.weaveVersion=FAMILY_INFLUENCE_VERSIONS.study;p.working.weave.generation={version:FAMILY_INFLUENCE_VERSIONS.generation,families:clone(f.families),influence:{id:f.id,kind:f.kind,center:f.center,radius:f.radius,enabled:f.enabled,falloffVersion:f.falloffVersion,direction:f.direction}};const promoted=candidateVariation(p,{family:'A',amount:25}).working.weave;assert.equal(promoted.weaveVersion,COMBINED_VERSIONS.study);assert.equal(promoted.generation.influences[0].id,id);assert.deepEqual(promoted.generation.influences[0].families,f.families);assert.equal(promoted.generation.variation.families.A.amount,25);assert.equal(promoted.generation.variation.families.B.amount,0);
});

test('v5 immutable revisions compact storage and portable backup round trip exactly',()=>{
 let w=setup(),p=w.projects[0];p=addInfluence(p,'repeller');p=candidateVariation(p,{seed:77,families:{A:{amount:35},B:{amount:12}}});p.working.weave.derived=derive(p);p=saveWeaveStudy(p,'R1D FIELD',true).project;w.projects[0]=p;validateTrustedWorkspace(w);const packed=packWorkspace(w),round=unpackWorkspace(packed);assert.deepEqual(round,w);assert.deepEqual(parsePortable(portableText(packed)),w);assert.equal(round.projects[0].weaveStudies[0].revisions[0].weaveVersion,COMBINED_VERSIONS.study);
});

test('persistent worker accepts R1D protocol and returns certified compact geometry',async()=>{
 let p=setup('deflector').projects[0];p=addInfluence(p,'repeller');const candidate={boundary:clone(p.working.boundary),carrier:clone(p.working.carrier),sourceContext:clone(p.working.weave.sourceContext),generation:clone(p.working.weave.generation)},input=digest(candidate),requestId='r1d-worker-test:1',worker=new Worker(new URL('../scripts/r1b-worker-node.mjs',import.meta.url));const result=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('R1D worker fixture timed out.')),2000);worker.once('error',reject);worker.once('message',m=>{clearTimeout(timer);resolve(m)});worker.postMessage({protocolVersion:COMBINED_VERSIONS.protocol,workerBuildId:'WF-R1D-20260916',sessionId:'test',requestSequence:1,requestId,boardId:p.id,weaveStudyId:p.working.weave.studyId,baseCommittedFingerprint:'root',candidateInputFingerprint:input,algorithmVersions:{...COMBINED_VERSIONS},candidate});});await worker.terminate();assert.equal(result.type,'success',result.error?.message);assert.equal(result.result.versions.study,COMBINED_VERSIONS.study);assert.equal(result.resultCanonicalFingerprint,result.payload.id);
});
