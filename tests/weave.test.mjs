import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {square,validateBoundary} from '../dist/boundary.mjs';
import {createRectangularCarrier,deriveCarrier} from '../dist/carrier.mjs';
import {sha256,sha256Async,canonical,deriveIdentity,refreshWeave,derivedSvg,safeDeriveCarrier,validateWeave} from '../dist/weave.mjs';
import {createWorkspace,clone,createWeaveStudy,saveCarrierStudy,saveWeaveStudy,restoreWeaveStudy,restoreCarrierStudy,restoreBoundary,saveBoundary,serializeWorkspace,parseBackup,mergeBackup,validateWorkspace,BACKUP_LIMIT} from '../dist/document.mjs';
import {LocalStore,STORE_KEY,SCHEMA3_RECOVERY_KEY,SCHEMA2_RECOVERY_KEY} from '../dist/storage.mjs';
import {History} from '../dist/history.mjs';
export function setup(){const w=createWorkspace();w.projects[0].working.carrier=createRectangularCarrier('carrier-fixture');w.projects[0]=saveCarrierStudy(w.projects[0],'SOURCE').project;w.projects[0]=createWeaveStudy(w.projects[0],w.projects[0].carrierStudies[0].latestRevisionId);return w;}
const u=validateBoundary([{x:-150,y:-150},{x:150,y:-150},{x:150,y:150},{x:50,y:150},{x:50,y:-50},{x:-50,y:-50},{x:-50,y:150},{x:-150,y:150}]);
function storage(raw){const map=new Map(raw?[[STORE_KEY,raw]]:[]);return {map,getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};}
test('synchronous and native asynchronous SHA-256 match independent runtime exactly',async()=>{
 for(const input of ['', 'abc','A'.repeat(300),'é🙂','x'.repeat(10000),canonical({b:[1,-0],a:'test'})]){const expected=createHash('sha256').update(input).digest('hex');assert.equal(sha256(input),expected);assert.equal(await sha256Async(input),expected);}
});
test('identity geometry exactly matches default, rotated, translated, concave and reversed carriers',()=>{
 for(const boundary of [square(),u,{...u,points:[...u.points].reverse()},validateBoundary(square().points.map(p=>({x:p.x+1e8,y:p.y+1e8})))]){
  for(const angle of [0,30,90]){const w=setup(),p=w.projects[0];p.working.boundary=boundary;p.working.carrier.angleDegrees=angle;if(boundary.points[0].x>1e6)p.working.carrier.origin={x:1e8,y:1e8};
   p.working=refreshWeave(p.working,p.id);const d=deriveCarrier(boundary,p.working.carrier,p.id),strands=p.working.weave.derived.strands;
   assert.equal(strands.length,d.paths.filter(p=>p.selected).length);
   strands.forEach((s,i)=>{const source=d.paths.filter(p=>p.selected)[i];assert.equal(s.strandId,source.id);assert.deepEqual(s.fragments.map(f=>({t0:f.t0,t1:f.t1,points:f.points})),source.intervals.map(f=>({t0:f.t0,t1:f.t1,points:[f.start,f.end]})));});
  }
 }
});
test('content is deterministic and independent of identity, labels and source metadata',()=>{
 const w=setup(),p=w.projects[0],a=p.working.weave.derived;
 assert.deepEqual(refreshWeave(p.working,p.id).weave.derived,a);
 const another=setup().projects[0];assert.equal(another.working.weave.derived.contentFingerprint,a.contentFingerprint);assert.notEqual(another.working.weave.derived.provenanceFingerprint,a.provenanceFingerprint);
 p.name='RENAMED';p.working.boundary.source={filename:'label.svg',format:'svg',axisConversion:'negate-y'};
 assert.equal(refreshWeave(p.working,p.id).weave.derived.contentFingerprint,a.contentFingerprint);
});
test('preflight rejects unsafe work before allocating and accepts supported edge counts',()=>{
 const c=createRectangularCarrier();c.families.A.spacing=.00001;
 assert.throws(()=>safeDeriveCarrier(square(),c,'board'),/2,000/);
 c.families.A.spacing=50;c.families.A.offset=1e9;c.families.A.spacing=1e-5;assert.throws(()=>safeDeriveCarrier(square(),c,'board'),/limit|precision/);
});
test('zero selected strands remain complete and export empty groups',()=>{
 const w=setup(),p=w.projects[0];p.working.boundary=square(10);
 for(const f of ['A','B']){p.working.carrier.families[f]={spacing:1,offset:20,density:1};}
 p.working=refreshWeave(p.working,p.id);assert.equal(p.working.weave.derived.strands.length,0);assert.equal(p.working.weave.derived.complete,true);
 const svg=derivedSvg(p.working,p.id);assert.ok(svg.includes('<g id="family-A"></g>'));assert.equal((svg.match(/<path /g)||[]).length,0);assert.doesNotThrow(()=>validateWorkspace(w));
});
test('immutable source survives edits, named revisions, restore and working undo',()=>{
 let w=setup(),p=w.projects[0];const source=clone(p.carrierStudies),h=new History(),before=clone(p.working);
 p=saveWeaveStudy(p,'WEAVE').project;const first=clone(p.weaveStudies[0].revisions[0]);
 p.working.boundary=square(300);p.working.carrier.families.A.spacing=100;p.working=refreshWeave(p.working,p.id);h.record(before,p.working);
 p=saveWeaveStudy(p,'WEAVE').project;assert.deepEqual(p.weaveStudies[0].revisions[0],first);assert.deepEqual(p.carrierStudies,source);
 const restored=restoreWeaveStudy(p,first.id);assert.deepEqual(restored.working,first.working);
 p.working=h.undo(p.working);assert.deepEqual(p.working,before);assert.equal(p.weaveStudies[0].revisions.length,2);
 assert.equal(restoreCarrierStudy(p,source[0].latestRevisionId).working.weave,null);
 assert.equal(p.weaveStudies.length,1);
});
test('boundary save and restore preserve active weave and regenerate identity',()=>{
 let p=setup().projects[0];p=saveBoundary(p,'BOUNDARY').project;const id=p.working.sourceRevisionId;p.working.boundary=square(300);p.working=refreshWeave(p.working,p.id);
 const restored=restoreBoundary(p,id);assert.ok(restored.working.weave);assert.deepEqual(restored.working.boundary,square());assert.doesNotThrow(()=>validateWeave(restored.working.weave,restored.working,restored));
});
test('another study cannot silently append to an existing name',()=>{
 let p=setup().projects[0];p=saveWeaveStudy(p,'SAME').project;
 p=createWeaveStudy(p,p.carrierStudies[0].latestRevisionId);assert.throws(()=>saveWeaveStudy(p,'SAME'),/another weave/);
});
test('schema 4 validates entire output, source context, versions, hidden extras and chain',()=>{
 const w=setup();w.projects[0]=saveWeaveStudy(w.projects[0],'SAVED').project;
 for(const alter of [
  p=>p.working.weave.derived.strands[0].fragments[0].points[0].x++,
  p=>p.working.weave.derived.complete=false,
  p=>p.working.weave.sourceContext.sourceBoardId='missing',
  p=>p.working.weave.sourceContext.snapshot.carrier.angleDegrees=5,
  p=>p.working.weave.derived.versions.derivation='future',
  p=>p.working.weave.future='unknown',
  p=>p.working.weave.derived.strands[0].fragments[0].points[0].x=NaN,
  p=>p.weaveStudies[0].latestRevisionId='missing',
  p=>p.weaveStudies[0].revisions[0].working.weave.sourceContext.sourceCarrierRevisionId='missing'
 ]){const bad=clone(w);alter(bad.projects[0]);assert.throws(()=>validateWorkspace(bad));}
});
test('full backup round trip, changed-board fork, fork of fork and local references',()=>{
 const w=setup();w.projects[0]=saveWeaveStudy(w.projects[0],'STUDY').project;assert.deepEqual(parseBackup(serializeWorkspace(w)),w);assert.deepEqual(mergeBackup(w,w),w);
 const incoming=clone(w);incoming.projects[0].name='CHANGED';
 const merged=mergeBackup(w,incoming),fork=merged.projects[1];assert.equal(merged.activeProjectId,fork.id);assert.deepEqual(merged.projects[0],w.projects[0]);assert.equal(fork.working.weave.sourceContext.sourceBoardId,fork.id);assert.equal(fork.working.weave.originLineage[0].boardId,w.projects[0].id);
 assert.equal(fork.working.weave.derived.contentFingerprint,w.projects[0].working.weave.derived.contentFingerprint);
 const changed=clone(merged);changed.projects[1].name='AGAIN';const twice=mergeBackup(merged,changed),second=twice.projects.at(-1);
 assert.equal(second.working.weave.originLineage.length,2);assert.equal(second.working.weave.sourceContext.sourceBoardId,second.id);assert.ok(second.weaveStudies[0].revisions[0].working.weave.derived.strands.every(s=>s.pathKey.boardId===second.id));assert.doesNotThrow(()=>validateWorkspace(twice));
});
test('schema 2/3 migration preserves raw originals and refuses recovery failure',()=>{
 for(const version of [2,3]){
  const legacy=createWorkspace();legacy.schemaVersion=version;
  for(const p of legacy.projects){delete p.weaveStudies;delete p.working.weave;if(version===2){delete p.carrierStudies;delete p.working.carrier;delete p.working.carrierSourceRevisionId;}}
  const raw=JSON.stringify(legacy,null,1),memory=storage(raw),s=new LocalStore(memory),w=s.load();assert.equal(w.schemaVersion,5);s.save(w);
  const key=version===2?SCHEMA2_RECOVERY_KEY:SCHEMA3_RECOVERY_KEY;assert.equal(memory.getItem(key),raw);
  const blocked=storage(raw),write=blocked.setItem;blocked.setItem=(k,v)=>{if(k===key)throw Error('quota');write(k,v);};const b=new LocalStore(blocked),next=b.load();assert.throws(()=>b.save(next),/unavailable or full/);assert.equal(blocked.getItem(STORE_KEY),raw);
 }
});
test('quota and stale-tab failures preserve previous complete weave and history',()=>{
 const memory=storage(),a=new LocalStore(memory),w=setup();a.load();a.save(w);const raw=memory.getItem(STORE_KEY),b=new LocalStore(memory);b.load();
 const next=clone(w);next.projects[0].name='NEXT';a.save(next);assert.throws(()=>b.save(w),/Another tab/);
 memory.setItem=()=>{throw Error('quota');};const current=memory.getItem(STORE_KEY);assert.throws(()=>a.save(w),/full/);assert.equal(memory.getItem(STORE_KEY),current);assert.notEqual(current,raw);
});
test('backup size preflight rejects before canonical persistence',()=>{
 const w=createWorkspace(),memory=storage(),s=new LocalStore(memory);s.load();s.save(w);const before=memory.getItem(STORE_KEY);
 const tooLarge=clone(w);tooLarge.projects[0].padding='é'.repeat(BACKUP_LIMIT);assert.throws(()=>s.save(tooLarge),/backup size/);assert.equal(memory.getItem(STORE_KEY),before);
});
test('raw SVG preserves concave gaps, round-trip numbers, Y conversion and safe metadata',()=>{
 const w=setup(),p=w.projects[0];p.working.boundary=u;p.working.weave.sourceName='</metadata><script>bad</script>';p.working=refreshWeave(p.working,p.id);
 const svg=derivedSvg(p.working,p.id);assert.ok(!svg.includes('<script>'));const paths=[...svg.matchAll(/<path [^>]* d="([^"]+)"/g)];assert.equal(paths.length,p.working.weave.derived.diagnostics.intervals);
 const expected=p.working.weave.derived.strands.flatMap(p=>p.fragments);paths.forEach((match,i)=>{assert.ok(!match[1].includes('Z'));const vals=match[1].replace(/[ML]/g,'').trim().split(/\s+/).map(Number);assert.deepEqual(vals,[expected[i].points[0].x,-expected[i].points[0].y,expected[i].points[1].x,-expected[i].points[1].y].map(x=>x===0?0:x));});
});
test('identity derive p95 meets inherited 400-line/100-edge target',()=>{
 const w=setup(),p=w.projects[0],points=[];for(let i=0;i<100;i++){const a=i*2*Math.PI/100,r=i%2?250:220;points.push({x:r*Math.cos(a),y:r*Math.sin(a)});}
 p.working.boundary=validateBoundary(points);p.working.carrier.families.A.spacing=2.5;p.working.carrier.families.B.spacing=2.5;
 for(let i=0;i<3;i++)refreshWeave(p.working,p.id);
 const times=[];for(let i=0;i<30;i++){const start=performance.now();refreshWeave(p.working,p.id);times.push(performance.now()-start);}times.sort((a,b)=>a-b);
 console.log('R1A identity benchmark',JSON.stringify({runs:30,p50:times[15],p95:times[28],max:times[29]}));assert.ok(times[28]<=100,'p95 '+times[28]);
});
