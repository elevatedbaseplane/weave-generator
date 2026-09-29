import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorkspace,finalizeSavedWeaveRecord} from '../dist/document.mjs';
import {createRectangularCarrier} from '../dist/carrier.mjs';
import {clearAnalysisCache} from '../dist/analysis.mjs';
import {assertQaCase,runQaCase} from '../dist/evaluation-qa.mjs';

const NOW='2026-09-27T12:00:00.000Z';
const VERSIONS={logicVersion:'wv-04-logic-v1',calibrationVersion:'wv-04-calibration-v1'};
const family=(angle,spacing,density,offset=0)=>({angleDegrees:angle,spacing,offset,density});

function weave(name,families){
 const ws=createWorkspace();
 let project=ws.projects[0];
 const carrier=createRectangularCarrier();
 carrier.generatorVersion='rect-v2';
 delete carrier.angleDegrees;
 carrier.families=families;
 project.working.carrier=carrier;
 project=finalizeSavedWeaveRecord(project,name,{now:NOW,generatorVersion:'TEST-BUILD'}).project;
 return {project,entry:project.carrierStudies[0]};
}
function wv04(name,families,expect,grid){
 clearAnalysisCache();
 const saved=weave(name,families);
 const report=assertQaCase(runQaCase(saved.project,saved.entry,{name,behavior:name,mode:'criterion',criterionId:'WV-04',evaluationId:`evaluation-${name}`,createdAt:NOW,grid,expect:{'WV-04':{status:'evaluated',...VERSIONS,...expect}}}));
 const result=saved.entry.evaluations.at(-1).criterionResults['WV-04'];
 const gap=saved.entry.derivedAnalysis.runs.at(-1).outputs.modules.interstitial;
 return {...report.actual['WV-04'],submetrics:result.submetrics,gap};
}

test('controlled gaps follow the WV-04 handoff',()=>{
 const uniform=wv04('uniform gaps',{A:family(0,50,100),B:family(90,50,100)},{componentAtMost:{interstitialDifferentiation:.05,interstitialContinuity:.05},capEquals:{degenerateInterstitial:1},ratingAtMost:1.5});
 const mixed=wv04('uneven gaps',{A:family(0,50,100),B:family(90,50,35)},{componentAtLeast:{interstitialDifferentiation:.4},componentAtMost:{interstitialContinuity:.05},ratingAtMost:1.5});
 const acute=wv04('acute slivers',{A:family(0,70,100),B:family(3,70,100)},{capAtMost:{degenerateInterstitial:.7},ratingAtMost:1.5});
 const open=wv04('boundary open field',{A:family(0,600,100,230),B:family(90,600,100,900)},{capAtMost:{degenerateInterstitial:.45},componentAtMost:{interstitialContinuity:.05},ratingAtMost:1.5});
 const coarse=wv04('grid 20',{A:family(0,50,100),B:family(90,50,35)},{ratingAtMost:1.5},20);
 const fine=wv04('grid 80',{A:family(0,50,100),B:family(90,50,35)},{ratingAtMost:1.5},80);
 assert.equal(uniform.gap.sliverCount,0);
 assert.equal(uniform.gap.openCount,0);
 assert.equal(uniform.gap.connectionCount,0);
 assert.ok(uniform.submetrics.fieldWeaveDefinition>=.8);
 assert.ok(mixed.components.interstitialDifferentiation>uniform.components.interstitialDifferentiation);
 assert.ok(mixed.rating<=uniform.rating);
 assert.equal(mixed.gap.connectionCount,0);
 assert.ok(acute.gap.sliverCount>0);
 assert.ok(acute.gap.microfragmentCount>0);
 assert.ok(acute.safeguards.degenerateInterstitial<uniform.safeguards.degenerateInterstitial);
 assert.ok(acute.rating<=uniform.rating);
 assert.ok(open.gap.openCount>=1);
 assert.ok(open.submetrics.undefinedOpenShare>=.7);
 assert.ok(open.submetrics.fieldWeaveDefinition<=.35);
 assert.ok(open.safeguards.degenerateInterstitial<uniform.safeguards.degenerateInterstitial);
 assert.equal(coarse.rating,fine.rating);
 assert.ok(Math.abs(coarse.components.interstitialDifferentiation-fine.components.interstitialDifferentiation)<=.05);
});
