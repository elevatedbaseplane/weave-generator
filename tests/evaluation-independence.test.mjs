import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorkspace,finalizeSavedWeaveRecord} from '../dist/document.mjs';
import {createRectangularCarrier} from '../dist/carrier.mjs';
import {clearAnalysisCache} from '../dist/analysis.mjs';
import {assertQaCase,runQaCase} from '../dist/evaluation-qa.mjs';

const NOW='2026-09-27T12:00:00.000Z';
const family=(angle,spacing,density,offset=0)=>({angleDegrees:angle,spacing,offset,density});
const scored={status:'evaluated'};

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
function study(name,families,influence){
 clearAnalysisCache();
 const saved=weave(name,families,influence);
 const report=assertQaCase(runQaCase(saved.project,saved.entry,{name,behavior:name,mode:'all',evaluationId:`evaluation-${name}`,createdAt:NOW,expect:{'WV-01':scored,'WV-02':scored,'WV-03':scored,'WV-04':scored,'WV-05':scored}}));
 const result=saved.entry.evaluations.at(-1).criterionResults;
 const names=Object.fromEntries(saved.entry.revisions[0].strandIdentity.families.map(item=>[item.familyId,item.key]));
 const byKey=Object.fromEntries(result['WV-05'].submetrics.families.map(item=>[names[item.familyId],item]));
 const counts=Object.fromEntries(saved.entry.revisions[0].strandIdentity.families.map(item=>[item.key,item.retainedStrandCount]));
 return {actual:report.actual,byKey,counts};
}

test('the five criteria do not reward the same evidence',()=>{
 const cross=study('crossing families',{A:family(0,50,100),B:family(90,50,100)});
 const same=study('same direction',{A:family(0,60,100,0),B:family(0,60,100,30)});
 const quiet=study('uneven presence',{A:family(0,50,100),B:family(90,50,12)});
 const field=study('uneven influence',{A:family(0,50,100),B:family(90,50,100)},{id:'field-independence',kind:'attractor',enabled:true,center:{x:0,y:0},radius:180,direction:0,falloff:3,families:{A:{strength:80,tension:0},B:{strength:20,tension:0}}});
 assert.ok(cross.actual['WV-01'].rating>=3.5);
 assert.ok(cross.actual['WV-01'].components.relationalCoupling>=.9);
 assert.ok(cross.actual['WV-03'].rating<=1.5);
 assert.ok(cross.actual['WV-04'].rating<=1.5);
 assert.ok(cross.actual['WV-05'].rating>cross.actual['WV-03'].rating);
 assert.ok(cross.actual['WV-05'].rating>cross.actual['WV-04'].rating);
 for(const key of ['A','B']){
  assert.ok(cross.byKey[key].events>=.7);
  assert.ok(cross.byKey[key].interstitial>=.8);
 }
 assert.ok(cross.actual['WV-05'].components.complementaryInterdependence<=.6);
 const sameDirection=same;
 assert.ok(sameDirection.actual['WV-01'].rating<=1.5);
 assert.ok(sameDirection.actual['WV-01'].components.familyDistinctness<=.05);
 assert.ok(sameDirection.actual['WV-05'].rating>=3);
 assert.ok(sameDirection.actual['WV-05'].rating>sameDirection.actual['WV-01'].rating);
 assert.ok(quiet.counts.B<quiet.counts.A);
 assert.ok(quiet.actual['WV-01'].rating>=4);
 assert.ok(quiet.actual['WV-05'].rating>=3.5);
 for(const key of ['A','B'])assert.ok(quiet.byKey[key].consequence>=.8);
 assert.ok(field.actual['WV-01'].rating>=3.5);
 assert.ok(field.actual['WV-02'].rating<=1.5);
 assert.ok(field.byKey.A.modulation>field.byKey.B.modulation);
 for(const key of ['A','B'])assert.ok(field.byKey[key].consequence>=.8);
});
