import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorkspace,saveCarrierStudy,createWeaveStudy,addInfluence,candidateVariation,saveWeaveStudy,serializeWorkspace,parseBackup,validateTrustedWorkspace} from '../dist/document.mjs';
import {createRectangularCarrier} from '../dist/carrier.mjs';
import {packWorkspace,unpackWorkspace} from '../dist/storage-codec.mjs';
import {refreshWeave} from '../dist/weave.mjs';
import {carrierInputFingerprint} from '../dist/carrier.mjs';

test('three saved weaves keep separate geometry references',()=>{
 const ws=createWorkspace();
 let project=ws.projects[0];
 const save=(name,spacing,angle)=>{
  project.working.carrier=createRectangularCarrier();
  project.working.carrier.families.A.spacing=spacing;
  project.working.carrier.angleDegrees=angle;
  project=saveCarrierStudy(project,name,{generatorVersion:'TEST-BUILD'}).project;
 };
 save('WEAVE A',40,0);
 save('WEAVE B',80,15);
 save('WEAVE C',120,-30);
 const refs=project.carrierStudies.map(entry=>entry.revisions.at(-1).geometryRef);
 assert.equal(new Set(refs.map(ref=>ref.carrierFingerprint)).size,3);
 assert.equal(new Set(refs.map(ref=>ref.revisionId)).size,3);
 for(const entry of project.carrierStudies){
  const revision=entry.revisions.at(-1);
  assert.equal(revision.geometryRef.revisionId,revision.id);
  assert.equal(revision.geometryRef.contentFingerprint,null);
  assert.equal(revision.geometryRef.carrierFingerprint,carrierInputFingerprint(revision.boundary,revision.carrier));
 }
 const stored=project.carrierStudies[0].revisions[0].geometryRef.carrierFingerprint;
 project.working.carrier.families.A.spacing=7;
 assert.equal(project.carrierStudies[0].revisions[0].geometryRef.carrierFingerprint,stored);
 ws.projects[0]=project;
 validateTrustedWorkspace(ws);
 const reloaded=unpackWorkspace(packWorkspace(parseBackup(serializeWorkspace(ws))));
 assert.deepEqual(reloaded.projects[0].carrierStudies.map(entry=>entry.revisions[0].geometryRef),refs);
});

test('a certified weave result is referenced without replacing the saved carrier',()=>{
 const ws=createWorkspace();
 let project=ws.projects[0];
 project.working.carrier=createRectangularCarrier();
 project.working.carrier.families.A.spacing=55;
 project=saveCarrierStudy(project,'WEAVE',{generatorVersion:'TEST-BUILD'}).project;
 const sourceRef=project.carrierStudies[0].revisions[0].geometryRef.carrierFingerprint;
 project=createWeaveStudy(project,project.carrierStudies[0].latestRevisionId);
 project=addInfluence(project);
 project=candidateVariation(project,{seed:5150,family:'A',amount:25});
 project.working=refreshWeave(project.working,project.id);
 project=saveWeaveStudy(project,'FIELD',true).project;
 const latest=project.carrierStudies[0].revisions.at(-1);
 assert.equal(project.carrierStudies[0].revisions[0].geometryRef.carrierFingerprint,sourceRef);
 assert.equal(latest.geometryRef.contentFingerprint,project.working.weave.derived.contentFingerprint);
 assert.notEqual(latest.geometryRef.contentFingerprint,null);
 assert.equal(latest.geometryRef.carrierFingerprint,carrierInputFingerprint(latest.boundary,latest.carrier));
 assert.equal(latest.carrier.families.A.spacing,55);
 ws.projects[0]=project;
 validateTrustedWorkspace(ws);
});
