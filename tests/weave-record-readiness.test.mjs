import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorkspace,finalizeSavedWeaveRecord,saveCarrierStudy,createWeaveStudy,addInfluence,saveWeaveStudy,validateTrustedWorkspace} from '../dist/document.mjs';
import {createRectangularCarrier} from '../dist/carrier.mjs';
import {refreshWeave} from '../dist/weave.mjs';
import {evaluationReadinessReport,migrateEvaluationProvenance,resolveAnalysisGeometry} from '../dist/weave-record.mjs';

function savedProject(name='WEAVE'){
 const ws=createWorkspace();
 const project=ws.projects[0];
 project.working.carrier=createRectangularCarrier();
 return {ws,project:finalizeSavedWeaveRecord(project,name,{generatorVersion:'TEST-BUILD'}).project};
}

test('a current record is evaluation ready and a legacy source can be migrated',()=>{
 const {ws,project}=savedProject();
 const entry=project.carrierStudies[0];
 const snapshot=resolveAnalysisGeometry(project,entry.revisions[0]);
 assert.deepEqual(evaluationReadinessReport(project,entry),{readiness:'ready',reasons:[]});
 delete entry.revisions[0].strandIdentity;
 entry.revisions[0].geometryRef={revisionId:entry.revisions[0].id,carrierFingerprint:entry.revisions[0].geometryRef.carrierFingerprint,contentFingerprint:null};
 const pending=evaluationReadinessReport(project,entry);
 assert.equal(pending.readiness,'needsMigration');
 assert.match(pending.reasons.join(' '),/geometry/);
 assert.match(pending.reasons.join(' '),/identity/);
 const original=structuredClone(entry);
 const migrated=migrateEvaluationProvenance(project,entry);
 assert.equal(migrated.report.readiness,'ready');
 assert.deepEqual(entry,original);
 assert.deepEqual(resolveAnalysisGeometry(project,migrated.entry.revisions[0]),snapshot);
 ws.projects[0]=project;
 assert.doesNotThrow(()=>validateTrustedWorkspace(ws));
 assert.notEqual(evaluationReadinessReport(project,entry).readiness,'ready');
});

test('missing certified geometry or family identity is not marked ready',()=>{
 const ws=createWorkspace();
 let project=ws.projects[0];
 project.working.carrier=createRectangularCarrier();
 project=saveCarrierStudy(project,'WEAVE',{generatorVersion:'TEST-BUILD'}).project;
 project=createWeaveStudy(project,project.carrierStudies[0].latestRevisionId);
 project=addInfluence(project);
 project.working=refreshWeave(project.working,project.id);
 project=saveWeaveStudy(project,'FIELD',true).project;
 const entry=project.carrierStudies[0];
 const savedIdentity=structuredClone(entry.revisions.at(-1).strandIdentity);
 delete entry.revisions.at(-1).strandIdentity;
 const missingIdentity=evaluationReadinessReport(project,entry);
 assert.equal(missingIdentity.readiness,'missingFamilyIdentity');
 assert.match(missingIdentity.reasons.join(' '),/identity/);
 assert.equal(migrateEvaluationProvenance(project,entry).entry,entry);
 const broken=structuredClone(project);
 const brokenEntry=broken.carrierStudies[0];
 brokenEntry.revisions.at(-1).strandIdentity=savedIdentity;
 brokenEntry.revisions.at(-1).geometryRef.geometryFingerprint='not-the-saved-field';
 const missingGeometry=evaluationReadinessReport(broken,brokenEntry);
 assert.equal(missingGeometry.readiness,'missingGeometry');
 assert.match(missingGeometry.reasons.join(' '),/does not resolve/);
 delete brokenEntry.revisions.at(-1).strandIdentity;
 broken.weaveStudies=[];
 broken.working.weave.derived=null;
 const partial=evaluationReadinessReport(broken,brokenEntry);
 assert.equal(partial.readiness,'legacyPartial');
 assert.match(partial.reasons.join(' '),/geometry/);
 assert.match(partial.reasons.join(' '),/identity/);
 assert.notEqual(partial.readiness,'ready');
 ws.projects[0]=project;
 assert.doesNotThrow(()=>validateTrustedWorkspace(ws));
 const legacy=structuredClone(project);
 delete legacy.carrierStudies[0].revisions.at(-1).generation;
 delete legacy.carrierStudies[0].revisions.at(-1).strandIdentity;
 legacy.carrierStudies[0].revisions.at(-1).geometryRef={revisionId:legacy.carrierStudies[0].revisions.at(-1).id,carrierFingerprint:legacy.carrierStudies[0].revisions.at(-1).geometryRef.carrierFingerprint,contentFingerprint:legacy.carrierStudies[0].revisions.at(-1).geometryRef.contentFingerprint};
 const loaded=evaluationReadinessReport(legacy,legacy.carrierStudies[0]);
 assert.notEqual(loaded.readiness,'ready');
 ws.projects[0]=legacy;
 assert.doesNotThrow(()=>validateTrustedWorkspace(ws));
});
