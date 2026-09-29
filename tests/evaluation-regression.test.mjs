import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorkspace,finalizeSavedWeaveRecord} from '../dist/document.mjs';
import {createRectangularCarrier} from '../dist/carrier.mjs';
import {clearAnalysisCache} from '../dist/analysis.mjs';
import {criterionDefinition,evaluateWeave} from '../dist/evaluation.mjs';
import {evaluateWV03} from '../dist/wv03.mjs';
import {evaluateWV05,scoreWV05} from '../dist/wv05.mjs';

const NOW='2026-09-27T12:00:00.000Z';
const VERSIONS={
 'WV-01':['wv-01-logic-v1','wv-01-calibration-v1'],
 'WV-02':['wv-02-logic-v1','wv-02-calibration-v1'],
 'WV-03':['wv-03-logic-v1','wv-03-calibration-v1'],
 'WV-04':['wv-04-logic-v1','wv-04-calibration-v1'],
 'WV-05':['wv-05-logic-v1','wv-05-calibration-v1']
};

test('criterion versions stay explicit',()=>{
 for(const [id,[logic,calibration]] of Object.entries(VERSIONS)){
  const definition=criterionDefinition(id);
  assert.equal(definition.logicVersion,logic);
  assert.equal(definition.calibrationVersion,calibration);
 }
});

test('a canonical crossing weave keeps its criterion envelope',()=>{
 clearAnalysisCache();
 const ws=createWorkspace();
 let project=ws.projects[0];
 const carrier=createRectangularCarrier();
 carrier.generatorVersion='rect-v2';
 delete carrier.angleDegrees;
 carrier.families={A:{angleDegrees:0,spacing:50,offset:0,density:100},B:{angleDegrees:90,spacing:50,offset:0,density:100}};
 project.working.carrier=carrier;
 project=finalizeSavedWeaveRecord(project,'CANONICAL',{now:NOW,generatorVersion:'TEST-BUILD'}).project;
 const entry=project.carrierStudies[0];
 const result=evaluateWeave(project,entry,{evaluationId:'evaluation-canonical',createdAt:NOW});
 assert.equal(Object.hasOwn(result.evaluation,'overallScore'),false);
 const ratings=Object.fromEntries(['WV-01','WV-02','WV-03','WV-04','WV-05'].map(id=>[id,result.evaluation.criterionResults[id]]));
 for(const id of Object.keys(VERSIONS)){
  assert.equal(ratings[id].status,'evaluated');
  assert.equal(ratings[id].criterionLogicVersion,VERSIONS[id][0]);
  assert.equal(ratings[id].calibrationVersion,VERSIONS[id][1]);
 }
 assert.ok(ratings['WV-01'].rating>=3.5&&ratings['WV-01'].rating<=4.8);
 assert.ok(ratings['WV-01'].components.relationalCoupling>=.9);
 assert.ok(ratings['WV-02'].rating<=1.5);
 assert.ok(ratings['WV-03'].rating<=1.5);
 assert.ok(ratings['WV-04'].rating<=1.5);
 assert.ok(ratings['WV-05'].rating>=3&&ratings['WV-05'].rating<=4.5);
 assert.equal(ratings['WV-05'].safeguards.irrelevantFamily,1);
});

test('missing analysis fails closed and an unavailable detector is not a zero',()=>{
 assert.equal(evaluateWV03({}).status,'evaluation-failed');
 assert.equal(evaluateWV03({}).rating,null);
 assert.equal(evaluateWV03({modules:{events:{status:'not_applicable'}}}).status,'not-applicable');
 assert.equal(evaluateWV03({modules:{events:{status:'not_applicable'}}}).normalizedScore,null);
 assert.equal(evaluateWV05({}).status,'evaluation-failed');
 assert.equal(evaluateWV05({}).rating,null);
 assert.equal(scoreWV05({families:[{familyId:'A',channels:{events:1}}]}).status,'not-applicable');
});
