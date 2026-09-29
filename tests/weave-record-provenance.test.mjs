import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorkspace,finalizeSavedWeaveRecord,createWeaveStudy,addInfluence,candidateVariation,saveWeaveStudy,serializeWorkspace,parseBackup} from '../dist/document.mjs';
import {createRectangularCarrier} from '../dist/carrier.mjs';
import {packWorkspace,unpackWorkspace} from '../dist/storage-codec.mjs';
import {refreshWeave} from '../dist/weave.mjs';
import {readEvaluationProvenance} from '../dist/weave-record.mjs';

test('evaluation identity and provenance survive save and reload',()=>{
 const ws=createWorkspace();
 let project=ws.projects[0];
 project.working.carrier=createRectangularCarrier();
 project.working.carrier.families.A.spacing=40;
 project=finalizeSavedWeaveRecord(project,'WEAVE A',{generatorVersion:'TEST-BUILD'}).project;
 delete project.working.familyCatalog;
 project.working.carrier=createRectangularCarrier();
 project.working.carrier.families.B.spacing=70;
 project=finalizeSavedWeaveRecord(project,'WEAVE B',{generatorVersion:'TEST-BUILD'}).project;
 project=createWeaveStudy(project,project.carrierStudies[1].latestRevisionId);
 project=addInfluence(project);
 project=candidateVariation(project,{seed:5150,family:'A',amount:25});
 project.working=refreshWeave(project.working,project.id);
 project=saveWeaveStudy(project,'FIELD',true).project;
 ws.projects[0]=project;
 const packed=unpackWorkspace(packWorkspace(ws));
 const portable=parseBackup(serializeWorkspace(packed));
 const restored=portable.projects[0];
 const before=project.carrierStudies.map(entry=>readEvaluationProvenance(entry,entry.revisions.at(-1)));
 const after=restored.carrierStudies.map(entry=>readEvaluationProvenance(entry,entry.revisions.at(-1)));
 assert.equal(before.length,2);
 assert.deepEqual(after,before);
 for(const provenance of after){
  assert.match(provenance.weaveId,/^weave-/);
  assert.ok(provenance.familyIds.length>=2);
  assert.ok(provenance.strandIds.length>=2);
  assert.ok(provenance.boundary.length>=3);
  assert.equal(provenance.geometryVersion,'analysis-geometry-v1');
  assert.equal(typeof provenance.geometryFingerprint,'string');
  assert.equal(provenance.generatorVersion,'TEST-BUILD');
 }
 assert.equal(after[0].seed,null);
 assert.equal(after[1].seed,5150);
 assert.notDeepEqual(after[0].familyIds,after[1].familyIds);
 assert.notDeepEqual(after[0].strandIds,after[1].strandIds);
 assert.notEqual(after[0].geometryFingerprint,after[1].geometryFingerprint);
});
