import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createWorkspace,finalizeSavedWeaveRecord} from '../dist/document.mjs';
import {createRectangularCarrier} from '../dist/carrier.mjs';
import {clearAnalysisCache} from '../dist/analysis.mjs';
import {reevaluateWeave,evaluateWeave} from '../dist/evaluation.mjs';
import {readCriterionRecords,readEvaluationHistory,readEvaluationSummary} from '../dist/weave-record.mjs';

function savedWeave(){
 const ws=createWorkspace();
 let project=ws.projects[0];
 project.working.carrier=createRectangularCarrier();
 project=finalizeSavedWeaveRecord(project,'WEAVE A',{now:'2026-09-27T12:00:00.000Z',generatorVersion:'TEST-BUILD'}).project;
 return {project,entry:project.carrierStudies[0]};
}
function artifactId(entry,run,moduleName){
 for(const ref of run.artifacts){
  const body=(entry.analysisArtifacts||[]).find(item=>item.artifactId===ref.artifactId);
  if(body?.module===moduleName)return ref.artifactId;
 }
 return null;
}
function fullRun(entry){return entry.derivedAnalysis.runs.find(run=>run.outputs?.config?.subset==='FULL');}

test('a logic change rescores that criterion and keeps the other results',()=>{
 clearAnalysisCache();
 const {project,entry}=savedWeave();
 evaluateWeave(project,entry,{evaluationId:'evaluation-1',createdAt:'2026-09-27T12:05:00.000Z'});
 const runs=entry.derivedAnalysis.runs.length;
 const frozen=structuredClone(entry.evaluations[0]);
 entry.evaluations[0].versions['WV-03-logic']='wv-03-logic-v0';
 const untouched=reevaluateWeave(project,entry,{stale:true,evaluationId:'evaluation-none',createdAt:'2026-09-27T12:05:30.000Z'});
 assert.deepEqual(untouched.updated,['WV-03']);
 const result=untouched;
 assert.equal(result.reused,true);
 assert.equal(entry.derivedAnalysis.runs.length,runs);
 assert.equal(entry.evaluations.length,2);
 assert.equal(entry.evaluations[0].versions['WV-03-logic'],'wv-03-logic-v0');
 assert.equal(entry.evaluations[1].versions['WV-03-logic'],'wv-03-logic-v1');
 assert.equal(entry.evaluations[1].criterionResults['WV-01'].normalizedScore,frozen.criterionResults['WV-01'].normalizedScore);
 assert.equal(entry.evaluations[1].criterionResults['WV-04'].normalizedScore,frozen.criterionResults['WV-04'].normalizedScore);
 assert.equal(readEvaluationSummary(entry).status,'evaluated');
 assert.equal(readEvaluationSummary(entry).score,null);
 const history=readEvaluationHistory(entry);
 assert.equal(history[0].superseded,true);
 assert.equal(history[1].current,true);
 assert.equal(history[1].logicVersions['WV-03'],'wv-03-logic-v1');
 assert.deepEqual(entry.evaluations[0].criterionResults,frozen.criterionResults);
});

test('a stale analysis module is rebuilt without replacing the other modules',()=>{
 clearAnalysisCache();
 const {project,entry}=savedWeave();
 evaluateWeave(project,entry,{evaluationId:'evaluation-modules',createdAt:'2026-09-27T12:06:00.000Z'});
 const full=fullRun(entry);
 const presence=artifactId(entry,full,'presence');
 const events=artifactId(entry,full,'events');
 const frozen=structuredClone(entry.evaluations[0]);
 full.moduleVersions.events='relational-events-v0';
 full.outputs.modules.events.version='relational-events-v0';
 entry.evaluations[0].versions.events='relational-events-v0';
 const before=entry.derivedAnalysis.runs.length;
 const result=reevaluateWeave(project,entry,{stale:true,evaluationId:'evaluation-refreshed',createdAt:'2026-09-27T12:07:00.000Z'});
 assert.deepEqual(result.updated,['WV-03','WV-05']);
 assert.equal(result.reused,false);
 assert.equal(entry.derivedAnalysis.runs.length,before+1);
 assert.equal(entry.evaluations[0].criterionResults['WV-01'].normalizedScore,frozen.criterionResults['WV-01'].normalizedScore);
 assert.equal(entry.evaluations[1].criterionResults['WV-01'].normalizedScore,frozen.criterionResults['WV-01'].normalizedScore);
 assert.equal(entry.evaluations[1].criterionResults['WV-04'].normalizedScore,frozen.criterionResults['WV-04'].normalizedScore);
 const refreshed=entry.derivedAnalysis.runs.at(-1);
 assert.equal(artifactId(entry,refreshed,'presence'),presence);
 assert.notEqual(artifactId(entry,refreshed,'events'),events);
 assert.equal(full.moduleVersions.events,'relational-events-v0');
 assert.equal(readCriterionRecords(entry).find(item=>item.criterionId==='WV-03').status,'evaluated');
 assert.equal(readEvaluationSummary(entry).status,'evaluated');
});

test('one criterion can be rescored while the earlier evaluation stays stored',()=>{
 clearAnalysisCache();
 const {project,entry}=savedWeave();
 evaluateWeave(project,entry,{evaluationId:'evaluation-base',createdAt:'2026-09-27T12:08:00.000Z'});
 const frozen=structuredClone(entry.evaluations[0]);
 const runs=entry.derivedAnalysis.runs.length;
 const result=reevaluateWeave(project,entry,{criterionId:'WV-02',evaluationId:'evaluation-one',createdAt:'2026-09-27T12:09:00.000Z'});
 assert.deepEqual(result.updated,['WV-02']);
 assert.equal(result.reused,true);
 assert.equal(entry.derivedAnalysis.runs.length,runs);
 assert.equal(entry.evaluations.length,2);
 assert.deepEqual(entry.evaluations[0],frozen);
 assert.equal(entry.evaluations[1].criterionResults['WV-05'].normalizedScore,frozen.criterionResults['WV-05'].normalizedScore);
 assert.equal(reevaluateWeave(project,entry,{stale:true}).updated.length,0);
 assert.equal(entry.evaluations.length,2);
 const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
 const app=readFileSync(new URL('../dist/app.mjs',import.meta.url),'utf8');
 assert.match(html,/id="evaluation-detail-reevaluate-stale"/);
 assert.match(html,/id="evaluation-detail-history"/);
 assert.match(app,/reevaluateWeave/);
 assert.match(app,/readEvaluationHistory/);
});
