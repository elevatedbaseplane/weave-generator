import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createWorkspace,finalizeSavedWeaveRecord} from '../dist/document.mjs';
import {createRectangularCarrier} from '../dist/carrier.mjs';
import {clearAnalysisCache} from '../dist/analysis.mjs';
import {evaluateSelectedWeaves} from '../dist/evaluation.mjs';
import {readEvaluationSummary} from '../dist/weave-record.mjs';

function savedWeave(){
 const ws=createWorkspace();
 let project=ws.projects[0];
 project.working.carrier=createRectangularCarrier();
 project=finalizeSavedWeaveRecord(project,'WEAVE A',{now:'2026-09-27T12:00:00.000Z',generatorVersion:'TEST-BUILD'}).project;
 return {project,entry:project.carrierStudies[0]};
}

test('one failed weave does not undo a weave that scored in the same batch',()=>{
 clearAnalysisCache();
 const {project,entry}=savedWeave();
 const broken=structuredClone(entry);
 broken.id='carrier-study-broken';
 broken.weaveId='weave-broken';
 broken.name='BROKEN';
 broken.evaluations='bad';
 const before=structuredClone(broken);
 const result=evaluateSelectedWeaves(project,[entry,broken]);
 assert.deepEqual(result.updated,[entry.weaveId]);
 assert.equal(result.failed.length,1);
 assert.equal(result.failed[0].weaveId,'weave-broken');
 assert.equal(entry.evaluations.length>=1,true);
 assert.equal(Object.hasOwn(entry.evaluations.at(-1),'overallScore'),false);
 assert.equal(readEvaluationSummary(entry).score,null);
 assert.deepEqual(broken,before);
 const length=entry.evaluations.length;
 const quiet=evaluateSelectedWeaves(project,[entry],{outdated:true});
 assert.deepEqual(quiet.skipped,[entry.weaveId]);
 assert.deepEqual(quiet.updated,[]);
 assert.equal(entry.evaluations.length,length);
 entry.evaluations.at(-1).versions['WV-01-logic']='wv-01-logic-v0';
 const refreshed=evaluateSelectedWeaves(project,[entry],{outdated:true});
 assert.deepEqual(refreshed.updated,[entry.weaveId]);
 assert.equal(entry.evaluations.length,length+1);
 assert.equal(entry.evaluations.at(-1).versions['WV-01-logic'],'wv-01-logic-v1');
 assert.equal(entry.evaluations[0].versions['WV-01-logic'],'wv-01-logic-v0');
 const plain={weaveId:'weave-plain',name:'PLAIN',evaluations:[]};
 assert.deepEqual(evaluateSelectedWeaves(project,[plain],{outdated:true}).skipped,['weave-plain']);
 assert.deepEqual(plain.evaluations,[]);
});

test('selected evaluation actions are on the library and the comparison',()=>{
 const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
 const app=readFileSync(new URL('../dist/app.mjs',import.meta.url),'utf8');
 assert.match(html,/id="evaluation-evaluate-selected"/);
 assert.match(html,/id="evaluation-reevaluate-outdated"/);
 assert.match(html,/id="evaluation-compare-current"/);
 assert.match(app,/evaluateSelectedWeaves/);
 assert.match(html,/id="evaluation-message"/);
 assert.match(app,/function evaluationNotice/);
 assert.match(app,/runSelectedEvaluation\(true\)/);
});
