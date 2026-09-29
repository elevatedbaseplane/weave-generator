import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorkspace,finalizeSavedWeaveRecord,validateTrustedWorkspace} from '../dist/document.mjs';
import {createRectangularCarrier} from '../dist/carrier.mjs';
import {clearAnalysisCache,readAnalysisArtifact} from '../dist/analysis.mjs';
import {evaluateWeave} from '../dist/evaluation.mjs';
import {evaluateWV03,scoreWV03} from '../dist/wv03.mjs';

function grid(paint){
 const samples=[];
 for(let row=0;row<10;row++)for(let col=0;col<10;col++)samples.push({col,row,salience:paint(col,row)});
 return samples;
}
function hierarchy(){
 return {
  eventSalience:[...Array(8).fill(.85),...Array(8).fill(.35),...Array(4).fill(.05)],
  samples:grid((col,row)=>row<2&&col<4?.9:row>6&&col<3?.4:0),
  events:[
   ...Array.from({length:6},()=>({eventType:'crossing',salience:.85,signature:'a|b'})),
   ...Array.from({length:4},()=>({eventType:'alignment',salience:.4,signature:'a|b'}))
  ],
  spacing:10,
  cellSize:10
 };
}

test('event-poor, saturated, hierarchical, repeated, and noisy fields follow the WV-03 structure',()=>{
 const poor=scoreWV03({eventSalience:[.05,.08],samples:grid(()=>0),events:[{eventType:'crossing',salience:.05,signature:'a|b'}],spacing:10,cellSize:10});
 assert.equal(poor.rating,1);
 assert.equal(poor.normalized,0);
 const saturated=scoreWV03({eventSalience:Array(40).fill(.9),samples:grid(()=>.9),events:Array.from({length:30},()=>({eventType:'crossing',salience:.9,signature:'a|b'})),spacing:10,cellSize:10});
 assert.equal(saturated.salienceDifferentiation,0);
 assert.equal(saturated.rating,1);
 assert.ok(saturated.viability<1);
 const organized=scoreWV03(hierarchy());
 assert.ok(organized.normalized>poor.normalized);
 assert.ok(organized.normalized>saturated.normalized);
 assert.ok(organized.salienceDifferentiation>saturated.salienceDifferentiation);
 assert.ok(organized.spatial>saturated.spatial);
 const repeated=scoreWV03(hierarchy());
 const noisy=scoreWV03({...hierarchy(),events:Array.from({length:12},(_,index)=>({eventType:`event-${index}`,salience:.3+index*.04,signature:`f${index}`}))});
 assert.equal(noisy.recurrence,0);
 assert.ok(repeated.recurrence>noisy.recurrence);
 assert.ok(repeated.normalized>noisy.normalized);
 const empty=scoreWV03({eventSalience:[],samples:grid(()=>0),events:[],spacing:10,cellSize:10});
 assert.equal(empty.status,'evaluated');
 assert.equal(empty.rating,1);
});

test('a handful of samples does not count as a secondary region',()=>{
 const samples=grid(()=>0);
 for(let index=0;index<8;index++)samples[index].salience=.95;
 samples[8].salience=.4;
 const scored=scoreWV03({eventSalience:[.95,.4],samples,events:[],spacing:10,cellSize:10});
 assert.equal(scored.separationScore,0);
 assert.equal(scored.spatial,0);
 assert.equal(scored.rating,1);
});

test('a missing event field fails WV-03 and an unavailable detector is not scored as zero',()=>{
 const missing=evaluateWV03({});
 assert.equal(missing.status,'evaluation-failed');
 assert.equal(missing.normalizedScore,null);
 assert.equal(missing.rating,null);
 const unavailable=evaluateWV03({modules:{events:{status:'unavailable'}},artifacts:[{version:'relational-events-v1',artifactId:'events-1'}]});
 assert.equal(unavailable.status,'evaluation-failed');
 assert.equal(unavailable.normalizedScore,null);
 const skipped=evaluateWV03({modules:{events:{status:'not_applicable'}}});
 assert.equal(skipped.status,'not-applicable');
 assert.equal(skipped.normalizedScore,null);
});

test('a saved weave stores a WV-03 score from the event artifact without an overall score',()=>{
 clearAnalysisCache();
 const ws=createWorkspace();
 let project=ws.projects[0];
 project.working.carrier=createRectangularCarrier();
 project=finalizeSavedWeaveRecord(project,'WEAVE A',{now:'2026-09-27T12:00:00.000Z',generatorVersion:'TEST-BUILD'}).project;
 const entry=project.carrierStudies[0];
 const result=evaluateWeave(project,entry,{evaluationId:'evaluation-wv03',createdAt:'2026-09-27T12:12:00.000Z'});
 const scored=result.evaluation.criterionResults['WV-03'];
 const reference=result.analysisRun.artifacts.find(item=>item.version==='relational-events-v1');
 const artifact=readAnalysisArtifact(entry,reference.artifactId);
 assert.equal(result.analysisRun.outputs.modules.events.interruption,'unavailable');
 assert.equal(artifact.evidence.interruption.status,'unavailable');
 assert.equal(scored.status,'evaluated');
 assert.equal(Number.isFinite(scored.normalizedScore),true);
 assert.equal(scored.rating,Math.round((1+4*scored.normalizedScore)*10)/10);
 assert.equal(scored.evidenceRefs.length,1);
 assert.equal(scored.evidenceRefs[0].artifactId,reference.artifactId);
 assert.equal(result.evaluation.criterionResults['WV-04'].status,'evaluated');
 assert.equal(result.evaluation.criterionResults['WV-05'].status,'evaluated');
 assert.equal(Object.hasOwn(result.evaluation,'overallScore'),false);
 assert.equal(scored.explanation.includes('WV-03 scored'),true);
 assert.equal(Object.hasOwn(scored.components,'eventSalienceDifferentiation'),true);
 assert.equal(Object.hasOwn(scored.safeguards,'eventViability'),true);
 ws.projects[0]=project;
 validateTrustedWorkspace(ws);
});
