import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorkspace,finalizeSavedWeaveRecord,createWeaveStudy,saveWeaveStudy,serializeWorkspace,parseBackup,validateTrustedWorkspace} from '../dist/document.mjs';
import {createRectangularCarrier} from '../dist/carrier.mjs';
import {packWorkspace,unpackWorkspace} from '../dist/storage-codec.mjs';
import {readEvaluationSummary,readCriterionRecords} from '../dist/weave-record.mjs';
import {clearAnalysisCache} from '../dist/analysis.mjs';
import {criterionDefinition,criterionEvaluator,evaluateWeave,listCriteria,registerCriterionEvaluator} from '../dist/evaluation.mjs';

function savedWeave(){
 const ws=createWorkspace();
 let project=ws.projects[0];
 project.working.carrier=createRectangularCarrier();
 project=finalizeSavedWeaveRecord(project,'WEAVE A',{now:'2026-09-27T12:00:00.000Z',generatorVersion:'TEST-BUILD'}).project;
 return {ws,project,entry:project.carrierStudies[0]};
}
function output(id,overrides={}){
 const definition=criterionDefinition(id);
 return {criterionId:id,status:'not-evaluated',normalizedScore:null,rating:null,components:{},submetrics:{},safeguards:{},evidenceRefs:[],explanation:'',warnings:[],versions:{logic:definition.logicVersion,calibration:definition.calibrationVersion},...overrides};
}
function restore(originals){for(const [id,evaluator] of originals)registerCriterionEvaluator(id,evaluator);}

test('one evaluation run keeps independent results and does not invent an overall score',()=>{
 clearAnalysisCache();
 const {ws,project,entry}=savedWeave();
 const geometry=JSON.stringify(entry.revisions[0].geometryRef);
 const first=evaluateWeave(project,entry,{evaluationId:'evaluation-1',createdAt:'2026-09-27T12:05:00.000Z'});
 assert.equal(first.analysisRun.status,'analyzed');
 assert.equal(first.evaluation.evaluationId,'evaluation-1');
 assert.equal(first.evaluation.analysisRunId,first.analysisRun.analysisRunId);
 assert.equal(first.evaluation.status,'evaluated');
 assert.equal(Object.hasOwn(first.evaluation,'overallScore'),false);
 assert.equal(entry.evaluations.length,1);
 assert.equal(entry.derivedAnalysis.runs.length,4);
 assert.deepEqual(readCriterionRecords(entry).map(item=>item.status),['evaluated','evaluated','evaluated','evaluated','evaluated']);
 assert.equal(Number.isFinite(readCriterionRecords(entry)[0].score),true);
 assert.equal(readEvaluationSummary(entry).score,null);
 assert.equal(first.evaluation.versions['WV-01-logic'],'wv-01-logic-v1');
 assert.equal(first.evaluation.versions['WV-05-calibration'],'wv-05-calibration-v1');
 assert.equal(JSON.stringify(entry.revisions[0].geometryRef),geometry);
 const frozen=structuredClone(entry.evaluations[0]);
 const second=evaluateWeave(project,entry,{evaluationId:'evaluation-2',createdAt:'2026-09-27T12:06:00.000Z'});
 assert.equal(entry.derivedAnalysis.runs.length,4);
 assert.equal(entry.evaluations.length,2);
 assert.deepEqual(entry.evaluations[0],frozen);
 assert.deepEqual(second.evaluation.history,['evaluation-1']);
 assert.equal(second.evaluation.analysisRunId,first.analysisRun.analysisRunId);
 ws.projects[0]=project;
 validateTrustedWorkspace(ws);
 const reloaded=unpackWorkspace(packWorkspace(parseBackup(serializeWorkspace(ws)))).projects[0].carrierStudies[0];
 assert.equal(reloaded.evaluations.length,2);
 assert.equal(reloaded.evaluations[1].criterionResults['WV-03'].normalizedScore,first.evaluation.criterionResults['WV-03'].normalizedScore);
 assert.equal(reloaded.evaluations[1].criterionResults['WV-04'].normalizedScore,first.evaluation.criterionResults['WV-04'].normalizedScore);
 assert.equal(reloaded.evaluations[1].criterionResults['WV-05'].normalizedScore,first.evaluation.criterionResults['WV-05'].normalizedScore);
 assert.equal(reloaded.evaluations[1].criterionResults['WV-01'].normalizedScore,first.evaluation.criterionResults['WV-01'].normalizedScore);
});

test('a criterion failure stays with that criterion',()=>{
 clearAnalysisCache();
 const {project,entry}=savedWeave();
 const originals=new Map(listCriteria().map(item=>[item.criterionId,criterionEvaluator(item.criterionId)]));
 registerCriterionEvaluator('WV-01',()=>{throw new Error('WV-01 stopped.');});
 registerCriterionEvaluator('WV-02',()=>output('WV-02',{status:'not-applicable',explanation:'No modulation.'}));
 registerCriterionEvaluator('WV-03',context=>output('WV-03',{status:'evaluated',normalizedScore:0.5,rating:3,components:{eventSalienceDifferentiation:0.5},evidenceRefs:[context.artifacts[0].artifactId],explanation:'Hierarchy measured.'}));
 registerCriterionEvaluator('WV-05',()=>output('WV-05',{status:'evaluated',normalizedScore:0.8,rating:4.2,components:{familyConsequence:0.8}}));
 try{
  const result=evaluateWeave(project,entry,{evaluationId:'evaluation-partial',createdAt:'2026-09-27T12:07:00.000Z'});
  const results=result.evaluation.criterionResults;
  assert.equal(result.evaluation.status,'partial');
  assert.equal(results['WV-01'].status,'evaluation-failed');
  assert.equal(results['WV-01'].normalizedScore,null);
  assert.match(results['WV-01'].warnings[0],/WV-01 stopped/);
  assert.equal(results['WV-02'].status,'not-applicable');
  assert.equal(results['WV-02'].normalizedScore,null);
  assert.equal(results['WV-03'].status,'evaluated');
  assert.equal(results['WV-03'].normalizedScore,0.5);
  assert.equal(results['WV-03'].evidenceRefs[0].analysisRunId,result.analysisRun.analysisRunId);
  assert.equal(results['WV-04'].status,'evaluated');
  assert.equal(Number.isFinite(results['WV-04'].normalizedScore),true);
  assert.equal(results['WV-05'].status,'partial');
  assert.equal(results['WV-05'].normalizedScore,null);
  assert.equal(readEvaluationSummary(entry).status,'partial');
  assert.equal(readEvaluationSummary(entry).score,null);
 }finally{restore(originals);}
});

test('a failed analysis module does not wipe the other criteria',()=>{
 clearAnalysisCache();
 const {project,entry}=savedWeave();
 const originals=new Map(listCriteria().map(item=>[item.criterionId,criterionEvaluator(item.criterionId)]));
 registerCriterionEvaluator('WV-01',()=>output('WV-01',{status:'evaluated',normalizedScore:0.25,rating:2,components:{familyDistinctness:0.25}}));
 registerCriterionEvaluator('WV-03',()=>output('WV-03',{status:'evaluated',normalizedScore:0.9,rating:4.6}));
 try{
  const result=evaluateWeave(project,entry,{force:true,replace:{events(){throw new Error('detector failed');}},evaluationId:'evaluation-module',createdAt:'2026-09-27T12:08:00.000Z'});
  assert.equal(result.analysisRun.status,'analysis-failed');
  assert.equal(result.evaluation.criterionResults['WV-01'].status,'evaluated');
  assert.equal(result.evaluation.criterionResults['WV-01'].normalizedScore,0.25);
  assert.equal(result.evaluation.criterionResults['WV-03'].status,'evaluation-failed');
  assert.equal(result.evaluation.criterionResults['WV-03'].normalizedScore,null);
  assert.equal(result.evaluation.status,'partial');
 }finally{restore(originals);}
});

test('a legacy pattern is pinned from its saved source and then scored',()=>{
 clearAnalysisCache();
 const {ws,project,entry}=savedWeave();
 const revision=entry.revisions[0];
 delete revision.strandIdentity;
 revision.geometryRef={revisionId:revision.id,carrierFingerprint:revision.geometryRef.carrierFingerprint,contentFingerprint:null};
 const legacy=structuredClone(revision);
 const result=evaluateWeave(project,entry,{evaluationId:'evaluation-legacy',createdAt:'2026-09-27T12:10:00.000Z'});
 assert.equal(result.analysisRun.status,'analyzed');
 assert.equal(result.evaluation.status,'evaluated');
 assert.deepEqual(revision,legacy);
 assert.equal(entry.revisions.length,2);
 assert.equal(entry.latestRevisionId,entry.revisions[1].id);
 assert.equal(entry.generatorRevisionId,entry.revisions[1].id);
 assert.equal(entry.revisions[1].parentRevisionId,revision.id);
 assert.equal(entry.revisions[1].geometryRef.revisionId,entry.revisions[1].id);
 assert.equal(entry.revisions[1].geometryRef.geometryVersion,'analysis-geometry-v1');
 assert.equal(entry.revisions[1].strandIdentity.version,'strand-identity-v1');
 assert.equal(readCriterionRecords(entry).every(item=>item.showRating),true);
 assert.equal(readEvaluationSummary(entry).score,null);
 ws.projects[0]=project;
 assert.doesNotThrow(()=>validateTrustedWorkspace(ws));
});

test('pinning a legacy pattern leaves the weave snapshot on the original revision',()=>{
 clearAnalysisCache();
 const {ws,project,entry}=savedWeave();
 const revision=entry.revisions[0];
 delete revision.strandIdentity;
 revision.geometryRef={revisionId:revision.id,carrierFingerprint:revision.geometryRef.carrierFingerprint,contentFingerprint:null};
 const studied=saveWeaveStudy(createWeaveStudy(project,revision.id),'FIELD',true).project;
 const snapshot=structuredClone(studied.weaveStudies[0].revisions[0].working.weave.sourceContext.snapshot);
 evaluateWeave(studied,studied.carrierStudies[0],{evaluationId:'evaluation-snapshot',createdAt:'2026-09-27T12:11:00.000Z'});
 assert.deepEqual(studied.carrierStudies[0].revisions[0],snapshot);
 assert.equal(studied.weaveStudies[0].revisions[0].working.weave.sourceContext.sourceCarrierRevisionId,revision.id);
 ws.projects[0]=studied;
 assert.doesNotThrow(()=>validateTrustedWorkspace(ws));
});

test('an unready weave is an evaluation failure without a zero score',()=>{
 clearAnalysisCache();
 const entry={weaveId:'weave-unready',revisions:[],derivedAnalysis:{},evaluations:[],designerData:{},lineage:{}};
 const result=evaluateWeave({id:'board'},entry,{evaluationId:'evaluation-unready',createdAt:'2026-09-27T12:09:00.000Z'});
 assert.equal(result.analysisRun.status,'analysis-unavailable');
 assert.equal(result.evaluation.status,'evaluation-failed');
 assert.equal(result.evaluation.analysisRunId,result.analysisRun.analysisRunId);
 assert.equal(Object.values(result.evaluation.criterionResults).every(item=>item.normalizedScore===null&&item.rating===null),true);
 assert.equal(readEvaluationSummary(entry).score,null);
});
