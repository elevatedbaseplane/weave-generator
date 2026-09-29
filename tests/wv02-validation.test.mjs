import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorkspace,finalizeSavedWeaveRecord} from '../dist/document.mjs';
import {createRectangularCarrier} from '../dist/carrier.mjs';
import {clearAnalysisCache} from '../dist/analysis.mjs';
import {assertQaCase,runQaCase} from '../dist/evaluation-qa.mjs';

const NOW='2026-09-27T12:00:00.000Z';
const VERSIONS={logicVersion:'wv-02-logic-v1',calibrationVersion:'wv-02-calibration-v1'};

function weave(name){
 const ws=createWorkspace();
 let project=ws.projects[0];
 project.working.carrier=createRectangularCarrier();
 project=finalizeSavedWeaveRecord(project,name,{now:NOW,generatorVersion:'TEST-BUILD'}).project;
 return {project,entry:project.carrierStudies[0]};
}
function influence(id,kind,center,radius,direction,strength){
 return {id,kind,enabled:true,center,radius,direction,falloff:3,families:{A:{strength,tension:0},B:{strength,tension:0}}};
}
function wv02(name,influences,expect,grid){
 clearAnalysisCache();
 const saved=weave(name);
 if(influences)saved.entry.revisions[0].generation.influences=influences;
 const report=assertQaCase(runQaCase(saved.project,saved.entry,{name,behavior:name,mode:'criterion',criterionId:'WV-02',evaluationId:`evaluation-${name}`,createdAt:NOW,grid,expect:{'WV-02':{status:'evaluated',...VERSIONS,...expect}}}));
 const submetrics=saved.entry.evaluations.at(-1).criterionResults['WV-02'].submetrics;
 return {...report.actual['WV-02'],submetrics};
}

test('controlled fields follow the WV-02 handoff',()=>{
 const none=wv02('no influence',null,{componentAtMost:{effectiveModulation:.05},componentAtLeast:{fieldCoordination:.9},capEquals:{fieldRetention:1},ratingAtMost:1.5});
 const weak=wv02('weak modulation',[influence('weak','attractor',{x:0,y:0},120,0,8)],{componentAtMost:{effectiveModulation:.05},capEquals:{fieldRetention:1},ratingAtMost:1.5});
 const narrow=wv02('strong narrow field',[influence('narrow','attractor',{x:0,y:0},120,0,95)],{componentAtMost:{effectiveModulation:.05},ratingAtMost:1.5});
 const local=wv02('calibrated local modulation',[influence('local','attractor',{x:40,y:0},220,0,60)],{componentAtLeast:{effectiveModulation:.7,spatialDifferentiation:.8,fieldCoordination:.9},capEquals:{fieldRetention:1},ratingAtLeast:4});
 const tight=wv02('small coverage',[influence('tight','attractor',{x:40,y:0},70,0,60)],{ratingAtMost:1.5});
 const broad=wv02('broad uniform deformation',[influence('broad','deflector',{x:0,y:0},2000,0,30)],{componentAtMost:{effectiveModulation:.05,spatialDifferentiation:.2},ratingAtMost:1.5});
 const coordinated=wv02('coordinated overlap',[influence('left','deflector',{x:-40,y:0},180,20,40),influence('right','deflector',{x:40,y:0},180,20,40)],{componentAtLeast:{fieldCoordination:.9},ratingAtLeast:2});
 const conflicting=wv02('conflicting overlap',[influence('east','deflector',{x:-40,y:0},180,0,50),influence('west','deflector',{x:40,y:0},180,180,50)],{ratingAtMost:1.5});
 const coarse=wv02('grid 20',[influence('grid','attractor',{x:40,y:0},220,0,60)],{ratingAtLeast:4},20);
 const fine=wv02('grid 80',[influence('grid','attractor',{x:40,y:0},220,0,60)],{ratingAtLeast:4},80);
 assert.ok(local.rating>weak.rating);
 assert.ok(local.rating>narrow.rating);
 assert.ok(local.rating>tight.rating);
 assert.ok(local.rating>broad.rating);
 assert.ok(broad.submetrics.m75>local.submetrics.m75);
 assert.ok(local.submetrics.coverage>tight.submetrics.coverage);
 assert.ok(coordinated.rating>conflicting.rating);
 assert.ok(coordinated.components.fieldCoordination>=conflicting.components.fieldCoordination);
 assert.ok(local.submetrics.orientationRetention>=.9);
 assert.equal(none.safeguards.fieldRetention,1);
 assert.ok(Math.abs(coarse.rating-fine.rating)<=.2);
 assert.ok(Math.abs(coarse.rating-local.rating)<=.2);
});
