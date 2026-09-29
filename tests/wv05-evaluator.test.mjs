import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorkspace,finalizeSavedWeaveRecord,validateTrustedWorkspace} from '../dist/document.mjs';
import {createRectangularCarrier} from '../dist/carrier.mjs';
import {clearAnalysisCache} from '../dist/analysis.mjs';
import {evaluateWeave} from '../dist/evaluation.mjs';
import {evaluateWV05,scoreWV05} from '../dist/wv05.mjs';

const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-12,`${actual} is not ${expected}`);
function role(value,overrides={}){return {directional:value,rhythmic:value,events:value,interstitial:value,...overrides};}
function link(left,right,both,redundancy,overlap){
 const channel={left,right,both,redundancy,overlap};
 return {directional:channel,rhythmic:channel,events:channel,interstitial:channel};
}

test('duplicate, decorative, specialized, disjoint, and shared families follow the WV-05 structure',()=>{
 const shared=scoreWV05({families:[{familyId:'A',channels:role(.7)},{familyId:'B',channels:role(.7)}],pairs:[{familyA:'A',familyB:'B',channels:link(.7,.7,.75,0,.8)}]});
 const duplicate=scoreWV05({families:[{familyId:'A',channels:role(.15)},{familyId:'B',channels:role(.15)}],pairs:[{familyA:'A',familyB:'B',channels:link(.15,.15,.9,.8,.9)}]});
 const disjoint=scoreWV05({families:[{familyId:'A',channels:role(.8)},{familyId:'B',channels:role(.8)}],pairs:[{familyA:'A',familyB:'B',channels:link(.8,.8,.85,.05,0)}]});
 const decorative=scoreWV05({families:[{familyId:'A',channels:role(.9)},{familyId:'B',channels:role(.1)}],pairs:[{familyA:'A',familyB:'B',channels:link(.9,.1,.9,0,1)}]});
 const specialized=scoreWV05({families:[{familyId:'A',channels:{directional:.05,rhythmic:.05,events:.05,interstitial:.9}},{familyId:'B',channels:role(.7)}],pairs:[{familyA:'A',familyB:'B',channels:link(.7,.7,.75,0,.6)}]});
 const omitted=scoreWV05({families:[{familyId:'A',channels:role(.8)},{familyId:'B',channels:role(.8)}],pairs:[{familyA:'A',familyB:'B',channels:link(.8,.8,.8,0,.6)}]});
 const countedAsZero=scoreWV05({families:[{familyId:'A',channels:role(.8,{modulation:0})},{familyId:'B',channels:role(.8,{modulation:0})}],pairs:[{familyA:'A',familyB:'B',channels:{...link(.8,.8,.8,0,.6),modulation:{left:.8,right:.8,both:.8,redundancy:0,overlap:.6}}}]});
 assert.ok(shared.normalized>duplicate.normalized);
 assert.ok(shared.normalized>disjoint.normalized);
 assert.ok(duplicate.burden>shared.burden);
 assert.equal(disjoint.sharedScore,0);
 assert.equal(decorative.cap,.55);
 assert.ok(decorative.normalized<=decorative.cap);
 assert.ok(decorative.normalized<shared.normalized);
 assert.ok(specialized.profiles[0].consequence>.3);
 near(specialized.profiles[0].consequence,.7*.9+.3*((.05*3+.9)/4));
 assert.ok(omitted.profiles[0].consequence>countedAsZero.profiles[0].consequence);
 const single=scoreWV05({families:[{familyId:'A',channels:role(.5)}],pairs:[]});
 assert.equal(single.status,'not-applicable');
});

test('a missing family field fails WV-05 without a zero score',()=>{
 const missing=evaluateWV05({});
 assert.equal(missing.status,'evaluation-failed');
 assert.equal(missing.normalizedScore,null);
 assert.equal(missing.rating,null);
});

test('a saved weave stores a WV-05 score from family-removal states without an overall score',()=>{
 clearAnalysisCache();
 const ws=createWorkspace();
 let project=ws.projects[0];
 project.working.carrier=createRectangularCarrier();
 project=finalizeSavedWeaveRecord(project,'WEAVE A',{now:'2026-09-27T12:00:00.000Z',generatorVersion:'TEST-BUILD'}).project;
 const entry=project.carrierStudies[0];
 const result=evaluateWeave(project,entry,{evaluationId:'evaluation-wv05',createdAt:'2026-09-27T12:14:00.000Z'});
 const scored=result.evaluation.criterionResults['WV-05'];
 assert.equal(scored.status,'evaluated');
 assert.equal(Number.isFinite(scored.normalizedScore),true);
 assert.equal(scored.rating,Math.round((1+4*scored.normalizedScore)*10)/10);
 assert.equal(scored.evidenceRefs.length>=4,true);
 assert.equal(scored.submetrics.families.length,2);
 assert.equal(scored.submetrics.families.every(family=>family.modulation===null),true);
 assert.equal(entry.derivedAnalysis.runs.length,4);
 assert.equal(Object.hasOwn(result.evaluation,'overallScore'),false);
 assert.equal(scored.explanation.includes('WV-05 scored'),true);
 assert.equal(Object.hasOwn(scored.components,'familyConsequence'),true);
 assert.equal(Object.hasOwn(scored.safeguards,'irrelevantFamily'),true);
 ws.projects[0]=project;
 validateTrustedWorkspace(ws);
});
