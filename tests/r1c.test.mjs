import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorkspace,saveCarrierStudy,createWeaveStudy,addInfluence,candidateInfluence,saveWeaveStudy,restoreWeaveStudy,validateTrustedWorkspace,clone} from '../dist/document.mjs';
import {createRectangularCarrier} from '../dist/carrier.mjs';
import {deriveInfluence,deformPoint,INFLUENCE_VERSIONS,FAMILY_INFLUENCE_VERSIONS} from '../dist/influence.mjs';
import {digest,deriveForWeave} from '../dist/weave.mjs';
import {COMBINED_VERSIONS} from '../dist/combined.mjs';
import {packWorkspace,unpackWorkspace} from '../dist/storage-codec.mjs';
import {History} from '../dist/history.mjs';
import {Worker} from 'node:worker_threads';

function setup(kind='attractor'){
  const w=createWorkspace(),p=w.projects[0];
  p.working.carrier=createRectangularCarrier('carrier-r1c');
  w.projects[0]=saveCarrierStudy(p,'SOURCE').project;
  w.projects[0]=createWeaveStudy(w.projects[0],w.projects[0].carrierStudies[0].latestRevisionId);
  const working=w.projects[0].working,pts=working.boundary.points,minX=Math.min(...pts.map(q=>q.x)),maxX=Math.max(...pts.map(q=>q.x)),minY=Math.min(...pts.map(q=>q.y)),maxY=Math.max(...pts.map(q=>q.y)),extent=Math.max(maxX-minX,maxY-minY);
  working.weave.weaveVersion=FAMILY_INFLUENCE_VERSIONS.study;working.weave.generation={version:FAMILY_INFLUENCE_VERSIONS.generation,families:{A:{strength:50,tension:0},B:{strength:50,tension:0}},influence:{id:'field-r1c',kind,center:{x:(minX+maxX)/2,y:(minY+maxY)/2},radius:.3*extent,enabled:true,falloffVersion:FAMILY_INFLUENCE_VERSIONS.falloff,direction:0}};
  return w;
}
function derive(p){return deriveInfluence(p.working.boundary,p.working.carrier,p.id,p.working.weave.sourceContext,p.working.weave.generation,digest);}

test('attractor repeller and deflector equations have exact approved directions',()=>{
  const base={version:INFLUENCE_VERSIONS.generation,tension:0,influence:{id:'field',kind:'attractor',center:{x:0,y:0},radius:100,strength:50,enabled:true,falloffVersion:INFLUENCE_VERSIONS.falloff,direction:0}};
  assert.deepEqual(deformPoint({x:0,y:50},base),{x:0,y:41.5625});
  base.influence.kind='repeller';assert.deepEqual(deformPoint({x:0,y:50},base),{x:0,y:58.4375});
  base.influence.kind='deflector';assert.deepEqual(deformPoint({x:0,y:50},base),{x:4.21875,y:50});
  base.influence.direction=90;const up=deformPoint({x:0,y:50},base);assert.ok(Math.abs(up.x)<1e-12);assert.equal(up.y,54.21875);
  base.tension=100;assert.deepEqual(deformPoint({x:20,y:50},base),{x:20,y:50});
});

test('all R1C influence types produce certified complete clipped geometry',()=>{
  for(const kind of ['attractor','repeller','deflector']){const w=setup(kind),p=w.projects[0],d=derive(p);assert.equal(d.complete,true);assert.equal(d.versions.study,FAMILY_INFLUENCE_VERSIONS.study);assert.ok(d.diagnostics.maxCertifiedError<=d.diagnostics.epsilon);assert.equal(d.diagnostics.counts.A,9);assert.equal(d.diagnostics.counts.B,9);}
});

test('identity and validation limits remain atomic for every influence kind',()=>{
  for(const kind of ['attractor','repeller','deflector']){const w=setup(kind),p=w.projects[0],generation=p.working.weave.generation,point={x:125,y:210};generation.influence.enabled=false;assert.deepEqual(deformPoint(point,generation,'A'),point);generation.influence.enabled=true;generation.families.A.strength=0;assert.deepEqual(deformPoint(point,generation,'A'),point);generation.families.A.strength=50;generation.families.A.tension=100;assert.deepEqual(deformPoint(point,generation,'A'),point);}
  const w=setup('deflector'),generation=w.projects[0].working.weave.generation;generation.influence.direction=181;assert.throws(()=>deformPoint({x:0,y:0},generation),/direction/);generation.influence.direction=0;generation.influence.radius=0;assert.throws(()=>deformPoint({x:0,y:0},generation),/radius/);
});

test('maximum repeller remains radially ordered across its complete support',()=>{
  const generation={version:INFLUENCE_VERSIONS.generation,tension:0,influence:{id:'field',kind:'repeller',center:{x:0,y:0},radius:100,strength:100,enabled:true,falloffVersion:INFLUENCE_VERSIONS.falloff,direction:0}};
  let prior=deformPoint({x:0,y:0},generation).x;
  for(let radius=.01;radius<=100;radius+=.01){const current=deformPoint({x:radius,y:0},generation).x;assert.ok(current>prior,`radial order failed at ${radius}`);prior=current;}
});

test('type switch is one undoable working change and keeps stable influence identity',()=>{
  const w=setup(),p=w.projects[0],before=clone(p.working),id=before.weave.generation.influence.id,next=candidateInfluence(p,{influence:{kind:'repeller'}}).working;next.weave.derived=deriveForWeave(next.weave,next.boundary,next.carrier,p.id);const h=new History();h.record(before,next);assert.equal(next.weave.generation.influences[0].id,id);assert.equal(h.undo(next).weave.generation.influence.kind,'attractor');assert.equal(h.redo(before).weave.generation.influences[0].kind,'repeller');
});

test('family influence revisions save restore and compact round trip exactly',()=>{
  const w=setup('attractor'),p=w.projects[0];p.working.weave.derived=derive(p);let saved=saveWeaveStudy(p,'FIELD',true).project;const first=clone(saved.weaveStudies[0].revisions[0]);saved=candidateInfluence(saved,{influence:{kind:'deflector',direction:35}});saved.working.weave.derived=deriveForWeave(saved.working.weave,saved.working.boundary,saved.working.carrier,saved.id);saved=saveWeaveStudy(saved,'FIELD',true).project;validateTrustedWorkspace({...w,projects:[saved]});const round=unpackWorkspace(packWorkspace({...w,projects:[saved]}));assert.deepEqual(round.projects[0].weaveStudies[0].revisions[0],first);assert.equal(round.projects[0].working.weave.generation.influences[0].kind,'deflector');assert.equal(round.projects[0].working.weave.generation.influences[0].direction,35);const restored=restoreWeaveStudy(round.projects[0],first.id);assert.equal(restored.working.weave.generation.influence.kind,'attractor');
});

test('persistent worker accepts the R1C protocol and returns certified compact geometry',async()=>{
  const w=setup('deflector'),p=w.projects[0],candidate={boundary:clone(p.working.boundary),carrier:clone(p.working.carrier),sourceContext:clone(p.working.weave.sourceContext),generation:clone(p.working.weave.generation)},input=digest(candidate),requestId='r1c-worker-test:1';
  const worker=new Worker(new URL('../scripts/r1b-worker-node.mjs',import.meta.url));
  const result=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('R1C worker fixture timed out.')),2000);worker.once('error',reject);worker.once('message',message=>{clearTimeout(timer);resolve(message)});worker.postMessage({protocolVersion:FAMILY_INFLUENCE_VERSIONS.protocol,workerBuildId:'WF-R1C-FAMILY-CONTROLS-20260916',sessionId:'test',requestSequence:1,requestId,boardId:p.id,weaveStudyId:p.working.weave.studyId,baseCommittedFingerprint:'test-root',candidateInputFingerprint:input,algorithmVersions:{...FAMILY_INFLUENCE_VERSIONS},candidate});});
  await worker.terminate();
  assert.equal(result.type,'success');assert.equal(result.requestId,requestId);assert.equal(result.result.complete,true);assert.equal(result.result.versions.study,FAMILY_INFLUENCE_VERSIONS.study);assert.equal(result.resultCanonicalFingerprint,result.payload.id);
});

test('family A and B strength and tension deform independently under one shared influence',()=>{
  const w=setup('attractor'),p=w.projects[0],g=p.working.weave.generation;
  const point={x:g.influence.center.x,y:g.influence.center.y+g.influence.radius/2};
  g.families.A={strength:100,tension:0};g.families.B={strength:0,tension:100};assert.notDeepEqual(deformPoint(point,g,'A'),point);assert.deepEqual(deformPoint(point,g,'B'),point);const d=derive(p);assert.equal(d.complete,true);assert.equal(d.versions.study,'weave-study-v4');
});

test('editing a legacy v3 study promotes working state without changing identity or family values',()=>{
  const w=setup(),p=w.projects[0],id=p.working.weave.generation.influence.id;p.working.weave.weaveVersion=INFLUENCE_VERSIONS.study;p.working.weave.generation={version:INFLUENCE_VERSIONS.generation,tension:35,influence:{...p.working.weave.generation.influence,strength:62}};const promoted=candidateInfluence(p,{family:'B',familySettings:{strength:20,tension:80}}).working.weave;assert.equal(promoted.weaveVersion,COMBINED_VERSIONS.study);assert.equal(promoted.generation.influences[0].id,id);assert.deepEqual(promoted.generation.influences[0].families.A,{strength:62,tension:35});assert.deepEqual(promoted.generation.influences[0].families.B,{strength:20,tension:80});
});
