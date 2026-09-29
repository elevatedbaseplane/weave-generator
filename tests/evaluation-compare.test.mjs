import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {compareEvaluationRecords,createEvaluationRun} from '../dist/weave-record.mjs';

function result(id,rating,components,safeguards,logic){
 return {criterionId:id,status:'evaluated',normalizedScore:rating,rating,components,safeguards,evidenceRefs:[],criterionLogicVersion:logic,calibrationVersion:'wv-calibration-v1',warnings:[]};
}
function record(name,weaveId,rating,spacing,logic,designer){
 const criterionResults={'WV-01':result('WV-01',rating,{familyDistinctness:rating/5},{effectiveFamilyPresence:rating>3?0.4:1},logic)};
 return {
  name,weaveId,createdAt:'2026-09-27T12:00:00.000Z',designerData:designer,
  revisions:[{id:'rev-1',carrier:{kind:'rectangular',generatorVersion:'rect-v1',families:{A:{},B:{}}},generation:{parameters:{families:{A:{spacing}}}}}],
  evaluations:[createEvaluationRun({evaluationId:`evaluation-${weaveId}`,analysisRunId:'analysis-run-1',createdAt:'2026-09-27T12:00:00.000Z',status:'evaluated',criterionResults,versions:{'WV-01-logic':logic,'WV-01-calibration':'wv-calibration-v1'}})]
 };
}

test('comparison keeps each criterion and marks real differences',()=>{
 const records=[
  record('ALPHA','weave-alpha',4.5,50,'wv-01-logic-v1',{note:'keep'}),
  record('BRAVO','weave-bravo',2,12,'wv-01-logic-v0',{})
 ];
 const before=JSON.stringify(records);
 const compared=compareEvaluationRecords(records);
 assert.deepEqual(compared.columns.map(column=>column.name),['ALPHA','BRAVO']);
 const wv01=compared.criteria.find(row=>row.id==='WV-01');
 assert.deepEqual(wv01.cells,['4.5 / 5','2.0 / 5']);
 assert.equal(wv01.different,true);
 const component=compared.components.find(row=>row.id==='WV-01:familyDistinctness');
 assert.equal(component.different,true);
 const cap=compared.safeguards.find(row=>row.id==='WV-01:effectiveFamilyPresence');
 assert.equal(cap.cells[0].includes('CAP'),true);
 assert.equal(cap.cells[1].includes('CAP'),false);
 const spacing=compared.settings.find(row=>row.cells.includes('50'));
 assert.deepEqual(spacing.cells,['50','12']);
 assert.equal(spacing.different,true);
 assert.equal(compared.versions.find(row=>row.id==='WV-01').different,true);
 assert.match(compared.cohortWarning,/different criterion versions/);
 assert.equal(compared.designer.different,true);
 assert.equal(JSON.stringify(records),before);
 const same=compareEvaluationRecords([records[0],record('ALPHA COPY','weave-copy',4.5,50,'wv-01-logic-v1',{note:'keep'})]);
 assert.equal(same.criteria.find(row=>row.id==='WV-01').different,false);
 assert.equal(same.settings.find(row=>row.cells.includes('50')).different,false);
 assert.equal(same.cohortWarning,'');
 assert.equal(compareEvaluationRecords([records[0],{name:'PLAIN',weaveId:'weave-plain',createdAt:'2026-09-20T12:00:00.000Z',evaluations:[]}]).cohortWarning,'');
 const several=compareEvaluationRecords([records[0],records[1],record('CHARLIE','weave-charlie',3,40,'wv-01-logic-v1',{})]);
 assert.equal(several.columns.length,3);
 assert.equal(several.criteria.find(row=>row.id==='WV-01').cells.length,3);
 assert.equal(several.criteria.find(row=>row.id==='WV-01').different,true);
});

test('the library can open a comparison page',()=>{
 const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
 const app=readFileSync(new URL('../dist/app.mjs',import.meta.url),'utf8');
 const css=readFileSync(new URL('../dist/style.css',import.meta.url),'utf8');
 assert.match(html,/id="evaluation-compare-open"/);
 assert.match(html,/id="evaluation-compare"/);
 assert.match(html,/<summary>MORE FILTERS<\/summary>/);
 assert.match(css,/summary::after\{content:'▾'\}/);
 assert.match(app,/compareEvaluationRecords/);
 assert.match(app,/showEvaluationCompare/);
});
