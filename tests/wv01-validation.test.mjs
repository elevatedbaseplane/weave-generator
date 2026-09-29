import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorkspace,finalizeSavedWeaveRecord} from '../dist/document.mjs';
import {createRectangularCarrier} from '../dist/carrier.mjs';
import {clearAnalysisCache} from '../dist/analysis.mjs';
import {assertQaCase,runQaCase} from '../dist/evaluation-qa.mjs';

const NOW='2026-09-27T12:00:00.000Z';
const family=(angle,spacing,density)=>({angleDegrees:angle,spacing,offset:0,density});

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
function withInfluence(saved,strengths){
 saved.entry.revisions[0].generation.influences=[{id:'influence-wv01',kind:'attractor',enabled:true,center:{x:0,y:0},radius:1000,direction:0,falloff:3,families:Object.fromEntries(Object.entries(strengths).map(([key,strength])=>[key,{strength,tension:100}]))}];
 return saved;
}
function wv01(name,families,expect,strengths){
 clearAnalysisCache();
 const saved=strengths?withInfluence(weave(name,families),strengths):weave(name,families);
 return assertQaCase(runQaCase(saved.project,saved.entry,{name,behavior:name,mode:'criterion',criterionId:'WV-01',evaluationId:`evaluation-${name}`,createdAt:NOW,expect:{'WV-01':expect}})).actual['WV-01'];
}

test('controlled geometries follow the WV-01 handoff',()=>{
 const duplicate=wv01('duplicate families',{A:family(0,50,100),B:family(0,50,100)},{status:'evaluated',componentAtMost:{familyDistinctness:.05},componentAtLeast:{relationalCoupling:.9},capEquals:{effectiveFamilyPresence:1},ratingAtMost:1.5});
 const uncoupled=wv01('distinct but uncoupled',{A:family(0,40,100),B:family(0,120,100)},{status:'evaluated',componentAtLeast:{familyDistinctness:.15},componentAtMost:{relationalCoupling:.05},capEquals:{effectiveFamilyPresence:1},ratingAtMost:1.5});
 const coherent=wv01('coherent distinct families',{A:family(0,50,100),B:family(90,50,100)},{status:'evaluated',componentAtLeast:{familyDistinctness:.4,relationalCoupling:.9},capEquals:{effectiveFamilyPresence:1},ratingAtLeast:3.5});
 const low=wv01('low-presence family',{A:family(0,50,100),B:family(90,50,10)},{status:'evaluated',capAtMost:{effectiveFamilyPresence:.7},ratingAtMost:coherent.rating});
 const parallel=wv01('parallel correspondence',{A:family(0,50,100),B:family(8,55,100)},{status:'evaluated',componentAtLeast:{relationalCoupling:.4},componentAtMost:{familyDistinctness:coherent.components.familyDistinctness},ratingAtLeast:2,ratingAtMost:3.5});
 const same=wv01('shared equal response',{A:family(0,50,100),B:family(90,50,100)},{status:'evaluated',componentAtLeast:{relationalCoupling:.9}},{A:50,B:50});
 const split=wv01('shared differentiated response',{A:family(0,50,100),B:family(90,50,100)},{status:'evaluated',componentAtLeast:{relationalCoupling:.9,familyDistinctness:same.components.familyDistinctness+.1}},{A:80,B:20});
 const four=wv01('four copied families',{A:family(0,50,100),B:family(90,50,100),C:family(0,50,100),D:family(90,50,100)},{status:'evaluated',ratingAtMost:coherent.rating,componentAtMost:{familyDistinctness:coherent.components.familyDistinctness}});
 assert.ok(uncoupled.components.familyDistinctness>duplicate.components.familyDistinctness);
 assert.ok(coherent.rating>uncoupled.rating);
 assert.ok(coherent.rating>duplicate.rating);
 assert.ok(low.safeguards.effectiveFamilyPresence<1);
 assert.ok(low.rating<=coherent.rating);
 assert.ok(parallel.components.relationalCoupling>uncoupled.components.relationalCoupling);
 assert.ok(split.components.familyDistinctness>same.components.familyDistinctness);
 assert.ok(four.rating<=coherent.rating);
});
