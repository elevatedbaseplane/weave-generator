import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorkspace,saveCarrierStudy,createWeaveStudy,addInfluence,candidateVariation,saveWeaveStudy} from '../dist/document.mjs';
import {createRectangularCarrier} from '../dist/carrier.mjs';
import {createLinePreset} from '../dist/line-presets.mjs';
import {createStitchSource} from '../dist/stitch-source.mjs';
import {refreshWeave} from '../dist/weave.mjs';
import {compareRegeneratedGeometry} from '../dist/weave-record.mjs';

test('saved settings reproduce source lines for different rectangular records',()=>{
 const ws=createWorkspace();
 let project=ws.projects[0];
 const save=(name,carrier)=>{project.working.carrier=carrier;project=saveCarrierStudy(project,name,{generatorVersion:'TEST-BUILD'}).project;};
 const straight=createRectangularCarrier('straight');
 straight.families.A.spacing=40;
 straight.angleDegrees=12;
 save('STRAIGHT',straight);
 delete project.working.familyCatalog;
 const grid=createLinePreset('triangular-grid','grid');
 grid.families.A.spacing=80;
 save('GRID',grid);
 const reports=project.carrierStudies.map(entry=>compareRegeneratedGeometry(entry.revisions.at(-1)));
 assert.deepEqual(reports.map(report=>report.status),['match','match']);
 assert.equal(reports.every(report=>report.sourceMatch),true);
 assert.equal(reports[0].savedCarrierFingerprint===reports[0].regeneratedCarrierFingerprint,true);
 assert.notEqual(reports[0].regeneratedCarrierFingerprint,reports[1].regeneratedCarrierFingerprint);
 assert.match(reports[0].reason,/no strand-offset seed/);
 const untouched=structuredClone(project.carrierStudies[0].revisions[0]);
 compareRegeneratedGeometry(project.carrierStudies[0].revisions[0]);
 assert.deepEqual(project.carrierStudies[0].revisions[0],untouched);
});

test('a certified field result is preserved when the snapshot cannot rebuild it',()=>{
 const ws=createWorkspace();
 let project=ws.projects[0];
 project.working.carrier=createRectangularCarrier();
 project.working.carrier.families.A.spacing=55;
 project=saveCarrierStudy(project,'WEAVE',{generatorVersion:'TEST-BUILD'}).project;
 project=createWeaveStudy(project,project.carrierStudies[0].latestRevisionId);
 project=addInfluence(project);
 project=candidateVariation(project,{seed:5150,family:'A',amount:25});
 project.working=refreshWeave(project.working,project.id);
 project=saveWeaveStudy(project,'FIELD',true).project;
 const revision=project.carrierStudies[0].revisions.at(-1);
 const storedFingerprint=revision.geometryRef.contentFingerprint;
 const report=compareRegeneratedGeometry(revision);
 assert.equal(report.sourceMatch,true);
 assert.equal(report.certifiedMatch,false);
 assert.equal(report.status,'preserved');
 assert.match(report.reason,/influences/);
 assert.match(report.reason,/preserved/);
 assert.equal(revision.geometryRef.contentFingerprint,storedFingerprint);
 assert.equal(revision.generation.seed,5150);
});

test('a stitch record keeps its stored geometry when settings cannot rebuild the construction',()=>{
 const ws=createWorkspace();
 let project=ws.projects[0];
 project.working.carrier=createStitchSource('herringbone-square','stitch-a',2);
 project=saveCarrierStudy(project,'STITCH',{generatorVersion:'TEST-BUILD'}).project;
 const revision=project.carrierStudies[0].revisions[0];
 const stored=structuredClone(revision.carrier);
 const report=compareRegeneratedGeometry(revision);
 assert.equal(report.status,'preserved');
 assert.equal(report.sourceMatch,false);
 assert.match(report.reason,/Stitch construction/);
 assert.deepEqual(revision.carrier,stored);
});
