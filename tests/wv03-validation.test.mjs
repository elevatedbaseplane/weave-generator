import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorkspace,finalizeSavedWeaveRecord} from '../dist/document.mjs';
import {createRectangularCarrier} from '../dist/carrier.mjs';
import {clearAnalysisCache,readAnalysisArtifact} from '../dist/analysis.mjs';
import {assertQaCase,runQaCase} from '../dist/evaluation-qa.mjs';

const NOW='2026-09-27T12:00:00.000Z';
const VERSIONS={logicVersion:'wv-03-logic-v1',calibrationVersion:'wv-03-calibration-v1'};
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
function wv03(name,families,expect){
 clearAnalysisCache();
 const saved=weave(name,families);
 const report=assertQaCase(runQaCase(saved.project,saved.entry,{name,behavior:name,mode:'criterion',criterionId:'WV-03',evaluationId:`evaluation-${name}`,createdAt:NOW,expect:{'WV-03':{status:'evaluated',...VERSIONS,...expect}}}));
 const result=saved.entry.evaluations.at(-1).criterionResults['WV-03'];
 const artifact=readAnalysisArtifact(saved.entry,result.evidenceRefs[0].artifactId);
 const run=saved.entry.derivedAnalysis.runs.at(-1);
 return {...report.actual['WV-03'],submetrics:result.submetrics,types:[...new Set(artifact.evidence.events.map(event=>event.eventType))],warnings:run.warnings,detected:run.outputs.modules.events};
}

test('controlled fields follow the WV-03 handoff',()=>{
 const parallel=wv03('parallel alignments',{A:family(0,80,100,0),B:family(0,80,100,40)},{componentAtMost:{eventSalienceDifferentiation:.05,spatialScaleHierarchy:.05,recurrenceDifferentiation:.05},ratingAtMost:1.5});
 const saturated=wv03('uniform crossings',{A:family(0,50,100),B:family(90,50,100)},{capAtMost:{eventViability:.5},ratingAtMost:1.5});
 const sparse=wv03('few identical crossings',{A:family(0,80,20),B:family(90,80,20)},{ratingAtMost:1.5});
 const unphased=wv03('shallow pair',{A:family(0,60,100,0),B:family(6,60,100,0)},{ratingAtMost:1.5});
 const phased=wv03('phased hierarchy',{A:family(0,60,100,8),B:family(6,60,100,0)},{componentAtLeast:{eventSalienceDifferentiation:.7,spatialScaleHierarchy:.6,recurrenceDifferentiation:.6},ratingAtLeast:4});
 const shifted=wv03('wider phase',{A:family(0,60,100,20),B:family(6,60,100,0)},{componentAtLeast:{spatialScaleHierarchy:.6},ratingAtLeast:4});
 const near=wv03('four degree pair',{A:family(0,60,100),B:family(4,60,100)},{ratingAtMost:1.5});
 const wider=wv03('ten degree pair',{A:family(0,60,100),B:family(10,60,100)},{ratingAtMost:1.5});
 const fragmented=wv03('one off crossings',{A:family(0,220,15),B:family(18,220,15),C:family(47,220,15),D:family(80,220,15)},{componentAtMost:{recurrenceDifferentiation:.05},ratingAtMost:1.5});
 const dense=wv03('dense uniform field',{A:family(0,30,100),B:family(90,30,100)},{capAtMost:{eventViability:.5},ratingAtMost:1.5});
 assert.deepEqual(parallel.types,['alignment']);
 assert.ok(phased.types.includes('crossing')&&phased.types.includes('alignment')&&phased.types.includes('convergence'));
 assert.ok(phased.types.length>parallel.types.length);
 assert.ok(phased.rating>saturated.rating);
 assert.ok(phased.rating>sparse.rating);
 assert.ok(phased.rating>unphased.rating);
 assert.ok(phased.rating>fragmented.rating);
 assert.ok(phased.components.recurrenceDifferentiation>fragmented.components.recurrenceDifferentiation);
 assert.ok(Math.abs(phased.rating-shifted.rating)<=.3);
 assert.ok(Math.abs(near.rating-wider.rating)<=.2);
 assert.ok(saturated.submetrics.highCoverage>=.9);
 assert.ok(sparse.submetrics.eventCount<=12);
 assert.ok(dense.rating<=saturated.rating+1e-9);
 const detected=dense.detected.crossingCount+dense.detected.convergenceCount+dense.detected.divergenceCount+dense.detected.alignmentCount+dense.detected.shiftCount;
 if(detected>dense.submetrics.eventCount)assert.ok(dense.warnings.some(warning=>warning.includes('400')));
});
