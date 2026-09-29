import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorkspace,finalizeSavedWeaveRecord} from '../dist/document.mjs';
import {createRectangularCarrier} from '../dist/carrier.mjs';
import {clearAnalysisCache} from '../dist/analysis.mjs';
import {evaluateWeave} from '../dist/evaluation.mjs';
import {readAnalysisHistory,readCriterionProvenance,readCriterionRecords,readEvaluationHistory,readEvaluationSummary} from '../dist/weave-record.mjs';

function savedWeave(){
 const ws=createWorkspace();
 let project=ws.projects[0];
 project.working.carrier=createRectangularCarrier();
 project=finalizeSavedWeaveRecord(project,'WEAVE A',{now:'2026-09-27T12:00:00.000Z',generatorVersion:'TEST-BUILD'}).project;
 return {project,entry:project.carrierStudies[0]};
}
function statuses(entry){return Object.fromEntries(readCriterionRecords(entry).map(item=>[item.criterionId,item.status]));}
function reasons(entry,id){return readCriterionRecords(entry).find(item=>item.criterionId===id).reasons;}

test('each criterion states the geometry, analysis, logic, and calibration that produced it',()=>{
 clearAnalysisCache();
 const {project,entry}=savedWeave();
 const result=evaluateWeave(project,entry,{evaluationId:'evaluation-current',createdAt:'2026-09-27T12:05:00.000Z'});
 const provenance=readCriterionProvenance(entry);
 assert.equal(provenance.length,5);
 for(const item of provenance){
  assert.equal(item.evaluationId,'evaluation-current');
  assert.equal(item.generatorVersion,'TEST-BUILD');
  assert.equal(item.recordVersion,1);
  assert.equal(item.geometryVersion,'analysis-geometry-v1');
  assert.equal(item.geometryFingerprint,entry.revisions[0].geometryRef.geometryFingerprint);
  assert.equal(item.analysisRunId,result.analysisRun.analysisRunId);
  assert.equal(item.criterionLogicVersion,`wv-${item.criterionId.slice(3).toLowerCase()}-logic-v1`);
  assert.equal(item.calibrationVersion,`wv-${item.criterionId.slice(3).toLowerCase()}-calibration-v1`);
  assert.equal(item.analysisModules.events,'relational-events-v1');
  assert.equal(item.analysisModules.interstitial,'interstitial-v1');
  assert.equal(item.analysisModules.subset,'counterfactual-signature-v1');
 }
 assert.equal(readEvaluationSummary(entry).status,'evaluated');
});

test('later evaluations keep the earlier analysis and evaluation runs',()=>{
 clearAnalysisCache();
 const {project,entry}=savedWeave();
 evaluateWeave(project,entry,{evaluationId:'evaluation-1',createdAt:'2026-09-27T12:05:00.000Z'});
 const frozenEvaluation=structuredClone(entry.evaluations[0]);
 const frozenAnalysis=structuredClone(entry.derivedAnalysis.runs);
 evaluateWeave(project,entry,{evaluationId:'evaluation-2',createdAt:'2026-09-27T12:06:00.000Z'});
 assert.deepEqual(entry.evaluations[0],frozenEvaluation);
 assert.deepEqual(entry.derivedAnalysis.runs,frozenAnalysis);
 const history=readEvaluationHistory(entry);
 assert.equal(history.length,2);
 assert.equal(history[0].superseded,true);
 assert.equal(history[0].supersession,'Superseded by evaluation-2.');
 assert.equal(history[1].current,true);
 assert.equal(history[1].supersession,null);
 assert.equal(history[1].logicVersions['WV-03'],'wv-03-logic-v1');
 assert.equal(Number.isFinite(history[1].ratings['WV-01']),true);
 const analysis=readAnalysisHistory(entry);
 assert.equal(analysis.length,4);
 assert.equal(analysis.filter(item=>item.subset==='FULL'&&item.current).length,1);
 assert.equal(analysis.some(item=>item.subset==='EMPTY'&&item.current),true);
});

test('only the criteria that depend on a changed input need reevaluation',()=>{
 clearAnalysisCache();
 const {project,entry}=savedWeave();
 evaluateWeave(project,entry,{evaluationId:'evaluation-stale',createdAt:'2026-09-27T12:05:00.000Z'});
 const stored=structuredClone(entry.evaluations);
 const geometry=structuredClone(entry);
 geometry.revisions[0].geometryRef={...geometry.revisions[0].geometryRef,geometryFingerprint:'geometry-changed'};
 assert.deepEqual(statuses(geometry),{ 'WV-01':'needs-reevaluation','WV-02':'needs-reevaluation','WV-03':'needs-reevaluation','WV-04':'needs-reevaluation','WV-05':'needs-reevaluation' });
 assert.deepEqual(reasons(geometry,'WV-03'),['geometry_changed']);
 assert.match(readCriterionRecords(geometry)[0].notice,/Geometry changed/);
 assert.equal(readCriterionRecords(geometry)[0].showRating,true);
 assert.equal(readEvaluationSummary(geometry).status,'needs-reevaluation');
 assert.equal(readEvaluationSummary(geometry).score,null);

 const calibration=structuredClone(entry);
 calibration.evaluations.at(-1).versions['WV-01-calibration']='wv-01-calibration-v0';
 assert.equal(statuses(calibration)['WV-01'],'needs-reevaluation');
 assert.deepEqual(reasons(calibration,'WV-01'),['calibration_changed']);
 assert.equal(statuses(calibration)['WV-02'],'evaluated');
 assert.equal(statuses(calibration)['WV-03'],'evaluated');
 assert.equal(statuses(calibration)['WV-05'],'evaluated');

 const detector=structuredClone(entry);
 detector.evaluations.at(-1).versions.events='relational-events-v0';
 assert.equal(statuses(detector)['WV-01'],'evaluated');
 assert.equal(statuses(detector)['WV-02'],'evaluated');
 assert.equal(statuses(detector)['WV-03'],'needs-reevaluation');
 assert.equal(statuses(detector)['WV-04'],'evaluated');
 assert.equal(statuses(detector)['WV-05'],'needs-reevaluation');
 assert.deepEqual(reasons(detector,'WV-03'),['analysis_module_changed']);
 assert.deepEqual(reasons(detector,'WV-04'),[]);

 const interstitial=structuredClone(entry);
 interstitial.evaluations.at(-1).versions.interstitial='interstitial-v0';
 assert.equal(statuses(interstitial)['WV-03'],'evaluated');
 assert.equal(statuses(interstitial)['WV-04'],'needs-reevaluation');
 assert.equal(statuses(interstitial)['WV-05'],'needs-reevaluation');
 assert.deepEqual(reasons(interstitial,'WV-01'),[]);

 const logic=structuredClone(entry);
 logic.evaluations.at(-1).versions['WV-05-logic']='wv-05-logic-v0';
 assert.equal(statuses(logic)['WV-04'],'evaluated');
 assert.equal(statuses(logic)['WV-05'],'needs-reevaluation');
 assert.deepEqual(reasons(logic,'WV-05'),['criterion_logic_changed']);

 const missing=structuredClone(entry);
 const cited=missing.evaluations.at(-1).analysisRunId;
 missing.derivedAnalysis.runs=missing.derivedAnalysis.runs.filter(run=>run.analysisRunId!==cited);
 assert.equal(missing.derivedAnalysis.runs.length>0,true);
 assert.deepEqual(reasons(missing,'WV-02'),['missing_dependency']);
 assert.equal(statuses(missing)['WV-04'],'needs-reevaluation');
 assert.deepEqual(entry.evaluations,stored);
});
