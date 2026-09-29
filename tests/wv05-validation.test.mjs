import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorkspace,finalizeSavedWeaveRecord} from '../dist/document.mjs';
import {createRectangularCarrier} from '../dist/carrier.mjs';
import {clearAnalysisCache} from '../dist/analysis.mjs';
import {assertQaCase,runQaCase} from '../dist/evaluation-qa.mjs';

const NOW='2026-09-27T12:00:00.000Z';
const VERSIONS={logicVersion:'wv-05-logic-v1',calibrationVersion:'wv-05-calibration-v1'};
const family=(angle,spacing,density,offset=0)=>({angleDegrees:angle,spacing,offset,density});

function weave(name,families,influence){
 const ws=createWorkspace();
 let project=ws.projects[0];
 const carrier=createRectangularCarrier();
 carrier.generatorVersion='rect-v2';
 delete carrier.angleDegrees;
 carrier.families=families;
 project.working.carrier=carrier;
 project=finalizeSavedWeaveRecord(project,name,{now:NOW,generatorVersion:'TEST-BUILD'}).project;
 const entry=project.carrierStudies[0];
 if(influence)entry.revisions[0].generation.influences=[influence];
 return {project,entry};
}
function wv05(name,families,influence){
 clearAnalysisCache();
 const saved=weave(name,families,influence);
 const report=assertQaCase(runQaCase(saved.project,saved.entry,{name,behavior:name,mode:'criterion',criterionId:'WV-05',evaluationId:`evaluation-${name}`,createdAt:NOW,expect:{'WV-05':{status:'evaluated',...VERSIONS}}}));
 const result=saved.entry.evaluations.at(-1).criterionResults['WV-05'];
 const names=Object.fromEntries(saved.entry.revisions[0].strandIdentity.families.map(item=>[item.familyId,item.key]));
 const byKey=Object.fromEntries(result.submetrics.families.map(item=>[names[item.familyId],item]));
 const pair=(left,right)=>result.submetrics.pairs.find(item=>[names[item.familyA],names[item.familyB]].sort().join('')===[left,right].sort().join(''));
 return {...report.actual['WV-05'],submetrics:result.submetrics,byKey,pair};
}
const field={id:'field-wv05',kind:'attractor',enabled:true,center:{x:0,y:0},radius:180,direction:0,falloff:3,families:{A:{strength:80,tension:0},B:{strength:25,tension:0}}};

test('controlled families follow the WV-05 handoff',()=>{
 const cross=wv05('crossing families',{A:family(0,50,100),B:family(90,50,100)});
 const copy=wv05('duplicate family',{A:family(0,50,100),B:family(90,50,100),C:family(0,50,100)});
 const quiet=wv05('quiet crossing family',{A:family(0,50,100),B:family(90,50,12)});
 const thin=wv05('thin duplicate',{A:family(0,50,100),B:family(90,50,100),C:family(0,50,8)});
 const three=wv05('three copies',{A:family(0,55,100),B:family(90,55,100),C:family(0,55,100),D:family(0,55,100)});
 const parallel=wv05('same direction',{A:family(0,60,100,0),B:family(0,60,100,30)});
 const influenced=wv05('influenced families',{A:family(0,50,100),B:family(90,50,100)},field);
 for(const key of ['A','B']){
  assert.ok(cross.byKey[key].consequence>=.8);
  assert.equal(cross.byKey[key].modulation,null);
  for(const channel of ['directional','rhythmic','events','interstitial'])assert.ok(cross.byKey[key][channel]>=.5);
 }
 assert.equal(cross.safeguards.irrelevantFamily,1);
 assert.ok(cross.pair('A','B').shared>=.7);
 assert.ok(cross.rating>=3.5);
 assert.equal(copy.byKey.A.directional,0);
 assert.equal(copy.byKey.C.directional,0);
 assert.ok(copy.byKey.B.directional>=.4);
 assert.ok(copy.pair('C','A').redundancy>copy.pair('C','B').redundancy);
 assert.ok(copy.pair('C','A').redundancy>copy.pair('B','A').redundancy);
 assert.ok(copy.pair('C','A').redundancy>=.5);
 assert.ok(quiet.byKey.B.consequence>=.7);
 assert.equal(quiet.safeguards.irrelevantFamily,1);
 assert.ok(Math.abs(quiet.rating-cross.rating)<=.5);
 assert.ok(thin.byKey.C.consequence<thin.byKey.A.consequence);
 assert.ok(thin.byKey.C.consequence<thin.byKey.B.consequence);
 assert.ok(thin.pair('C','A').redundancy>thin.pair('C','B').redundancy);
 assert.equal(thin.safeguards.irrelevantFamily,1);
 for(const [left,right] of [['C','D'],['C','A'],['D','A']])assert.ok(three.pair(left,right).redundancy>=.7);
 for(const [left,right] of [['C','B'],['D','B'],['A','B']])assert.ok(three.pair(left,right).redundancy<=.2);
 assert.ok(three.rating<=cross.rating);
 assert.ok(parallel.byKey.A.directional<=.05&&parallel.byKey.B.directional<=.05);
 assert.ok(parallel.pair('A','B').redundancy>=.7);
 assert.ok(parallel.rating<=cross.rating);
 assert.ok(influenced.byKey.A.modulation>influenced.byKey.B.modulation);
 for(const key of ['A','B'])for(const channel of ['directional','rhythmic','events','interstitial','modulation'])assert.equal(Number.isFinite(influenced.byKey[key][channel]),true);
 assert.equal(influenced.safeguards.irrelevantFamily,1);
});
