import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createWorkspace,finalizeSavedWeaveRecord} from '../dist/document.mjs';
import {createRectangularCarrier} from '../dist/carrier.mjs';
import {clearAnalysisCache} from '../dist/analysis.mjs';
import {criterionDefinition} from '../dist/evaluation.mjs';
import {assertQaCase,checkQualitative,runQaCase} from '../dist/evaluation-qa.mjs';

const NOW='2026-09-27T12:00:00.000Z';

function savedWeave(name){
 const ws=createWorkspace();
 let project=ws.projects[0];
 project.working.carrier=createRectangularCarrier();
 project=finalizeSavedWeaveRecord(project,name,{now:NOW,generatorVersion:'TEST-BUILD'}).project;
 return {project,entry:project.carrierStudies[0]};
}

test('the harness runs analysis, one criterion, or every criterion without an overall score',()=>{
 clearAnalysisCache();
 const definition=criterionDefinition('WV-01');
 const analysis=savedWeave('ANALYSIS');
 const analyzed=assertQaCase(runQaCase(analysis.project,analysis.entry,{name:'analysis only',behavior:'Shared analysis completes before any criterion is scored.',mode:'analysis',expectAnalysisStatus:'analyzed'}));
 assert.equal(analyzed.analysisStatus,'analyzed');
 assert.equal(analysis.entry.evaluations.length,0);
 const one=savedWeave('ONE');
 const single=assertQaCase(runQaCase(one.project,one.entry,{name:'one criterion',behavior:'An orthogonal square stays coupled enough to score.',mode:'criterion',criterionId:'WV-01',evaluationId:'evaluation-qa-one',createdAt:NOW,expect:{'WV-01':{status:'evaluated',ratingAtLeast:3,componentAtLeast:{relationalCoupling:.5},capEquals:{effectiveFamilyPresence:1},logicVersion:definition.logicVersion,calibrationVersion:definition.calibrationVersion}}}));
 assert.deepEqual(Object.keys(one.entry.evaluations.at(-1).criterionResults),['WV-01']);
 assert.equal(Object.hasOwn(one.entry.evaluations.at(-1),'overallScore'),false);
 assert.equal(single.actual['WV-01'].logicVersion,definition.logicVersion);
 const all=savedWeave('ALL');
 const full=assertQaCase(runQaCase(all.project,all.entry,{name:'all criteria',behavior:'Every criterion returns a status for the same geometry.',mode:'all',evaluationId:'evaluation-qa-all',createdAt:NOW,expect:{'WV-01':{status:'evaluated'},'WV-02':{status:'evaluated'}}}));
 assert.deepEqual(Object.keys(full.actual).sort(),['WV-01','WV-02','WV-03','WV-04','WV-05']);
 assert.equal(Object.hasOwn(all.entry.evaluations.at(-1),'overallScore'),false);
 const missed=runQaCase(all.project,all.entry,{name:'too high',behavior:'A rating expectation can fail without changing the stored score.',mode:'criterion',criterionId:'WV-01',evaluationId:'evaluation-qa-miss',createdAt:NOW,expect:{'WV-01':{rating:9}}});
 assert.equal(missed.passed,false);
 assert.match(missed.failures[0],/WV-01: rating is/);
 assert.throws(()=>assertQaCase(missed),/too high/);
 assert.equal(checkQualitative({status:'evaluated',rating:4,components:{},safeguards:{}},{status:'not-applicable'}).length,1);
});

test('the harness stays outside the page',()=>{
 const source=readFileSync(new URL('../dist/evaluation-qa.mjs',import.meta.url),'utf8');
 assert.doesNotMatch(source,/app\.mjs|index\.html|overallScore\s*:/);
});
