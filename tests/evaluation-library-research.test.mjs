import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createEvaluationRun,queryEvaluationRecords} from '../dist/weave-record.mjs';

function result(id,status,rating,components={},safeguards={}){
 return {criterionId:id,status,normalizedScore:rating,rating,components,safeguards,evidenceRefs:[],criterionLogicVersion:'wv-logic-v1',calibrationVersion:'wv-calibration-v1',warnings:[]};
}
function revision({families,source,spacing}){
 return {id:'rev-1',carrier:{kind:'rectangular',recipeId:'square',generatorVersion:source,families:Object.fromEntries(families.map(name=>[name,{}]))},generation:{parameters:{families:{A:{spacing}}}}};
}
function scored(name,weaveId,createdAt,ratings,extra={}){
 const criterionResults={
  'WV-01':result('WV-01','evaluated',ratings.wv01,{familyDistinctness:ratings.distinct},{effectiveFamilyPresence:ratings.cap}),
  'WV-03':result('WV-03',ratings.wv03Status,ratings.wv03)
 };
 return {
  name,weaveId,createdAt,
  revisions:[revision({families:extra.families||['A','B'],source:extra.source||'rect-v1',spacing:extra.spacing??50})],
  derivedAnalysis:extra.analysis?{version:'derived-analysis-v1',runs:[{status:extra.analysis}]}:{},
  evaluations:[createEvaluationRun({evaluationId:`evaluation-${weaveId}`,analysisRunId:'analysis-run-1',createdAt,status:'evaluated',criterionResults})]
 };
}

const alpha=scored('ALPHA','weave-alpha','2026-09-27T12:00:00.000Z',{wv01:4.5,distinct:0.9,cap:0.4,wv03:1.2,wv03Status:'evaluated'},{families:['A','B','C'],source:'rect-v1',spacing:50,analysis:'analyzed'});
const bravo=scored('BRAVO','weave-bravo','2026-09-26T12:00:00.000Z',{wv01:2,distinct:0.2,cap:1,wv03:null,wv03Status:'not-applicable'},{families:['A'],source:'stitch-v1',spacing:12,analysis:'analysis-failed'});
const charlie={name:'CHARLIE',weaveId:'weave-charlie',createdAt:'2026-09-20T12:00:00.000Z',evaluations:[]};
const delta={name:'DELTA',weaveId:'weave-delta',createdAt:'2026-09-25T12:00:00.000Z',evaluations:[{status:'needs-reevaluation'}]};
const records=[alpha,bravo,charlie,delta];
const ids=rows=>rows.map(entry=>entry.weaveId);

test('criterion ratings and research filters sort the library without an overall score',()=>{
 const before=JSON.stringify(records);
 assert.deepEqual(ids(queryEvaluationRecords(records,{sort:'WV-01'})),['weave-alpha','weave-bravo','weave-charlie','weave-delta']);
 assert.deepEqual(ids(queryEvaluationRecords(records,{sort:'WV-03'})),['weave-alpha','weave-bravo','weave-charlie','weave-delta']);
 assert.deepEqual(ids(queryEvaluationRecords(records,{sort:'needs-reevaluation'})),['weave-delta','weave-alpha','weave-bravo','weave-charlie']);
 assert.deepEqual(ids(queryEvaluationRecords(records,{criterion:'WV-01',ratingMin:4,ratingMax:5})),['weave-alpha']);
 assert.deepEqual(ids(queryEvaluationRecords(records,{criterion:'WV-03',criterionStatus:'not-applicable'})),['weave-bravo']);
 assert.deepEqual(ids(queryEvaluationRecords(records,{component:'familyDistinctness',componentMin:0.5})),['weave-alpha']);
 assert.deepEqual(ids(queryEvaluationRecords(records,{capActive:true})),['weave-alpha']);
 assert.deepEqual(ids(queryEvaluationRecords(records,{safeguard:'effectiveFamilyPresence'})),['weave-alpha','weave-bravo']);
 assert.deepEqual(ids(queryEvaluationRecords(records,{analysis:'analyzed'})),['weave-alpha']);
 assert.deepEqual(ids(queryEvaluationRecords(records,{analysis:'analysis-failed'})),['weave-bravo']);
 assert.deepEqual(ids(queryEvaluationRecords(records,{familyMin:2})),['weave-alpha']);
 assert.deepEqual(ids(queryEvaluationRecords(records,{source:'rect-v1'})),['weave-alpha']);
 assert.deepEqual(ids(queryEvaluationRecords(records,{parameter:'family-spacing',parameterMin:40,parameterMax:60})),['weave-alpha']);
 assert.deepEqual(ids(queryEvaluationRecords(records)),['weave-alpha','weave-bravo','weave-delta','weave-charlie']);
 assert.equal(JSON.stringify(records),before);
});

test('the library exposes criterion sorts and collapsed research filters',()=>{
 const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
 const app=readFileSync(new URL('../dist/app.mjs',import.meta.url),'utf8');
 for(const id of ['WV-01','WV-02','WV-03','WV-04','WV-05'])assert.match(html,new RegExp(`value="${id}">${id} RATING`));
 assert.match(html,/value="needs-reevaluation">NEEDS REEVALUATION/);
 assert.match(html,/id="evaluation-advanced"/);
 assert.match(html,/<summary>MORE FILTERS<\/summary>/);
 assert.match(html,/value="family-spacing">SPACING/);
 assert.match(app,/function evaluationLibraryQuery/);
 assert.match(app,/evaluation-ratings/);
 assert.match(app,/\$\('evaluation-advanced'\)\.hidden=open\|\|compare/);
});
