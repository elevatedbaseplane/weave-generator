import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorkspace,finalizeSavedWeaveRecord,createWeaveStudy,candidateVariation,saveWeaveStudy} from '../dist/document.mjs';
import {createRectangularCarrier} from '../dist/carrier.mjs';
import {square} from '../dist/boundary.mjs';
import {clearAnalysisCache} from '../dist/analysis.mjs';
import {refreshWeave} from '../dist/weave.mjs';
import {evaluateWeave} from '../dist/evaluation.mjs';

const NOW='2026-09-27T12:00:00.000Z';
const family=(angle,spacing,density,offset=0)=>({angleDegrees:angle,spacing,offset,density});
const close=(label,left,right,limit)=>assert.ok(Math.abs(left-right)<=limit,`${label} moved from ${right} to ${left}.`);

function pattern(name,families,options={}){
 const ws=createWorkspace();
 let project=ws.projects[0];
 if(options.boundary)project.working.boundary=options.boundary;
 const carrier=options.carrier||createRectangularCarrier();
 if(!options.carrier){
  carrier.generatorVersion='rect-v2';
  delete carrier.angleDegrees;
  carrier.families=families;
 }
 project.working.carrier=carrier;
 project=finalizeSavedWeaveRecord(project,name,{now:NOW,generatorVersion:'TEST-BUILD'}).project;
 const entry=project.carrierStudies[0];
 if(options.influences)entry.revisions[0].generation.influences=options.influences;
 return {project,entry};
}
function varied(amount){
 const saved=pattern('varied',{A:family(0,50,100),B:family(90,50,100)});
 let project=createWeaveStudy(saved.project,saved.entry.latestRevisionId);
 project=candidateVariation(project,{families:{A:{amount},B:{amount}}});
 project.working=refreshWeave(project.working,project.id);
 project=saveWeaveStudy(project,'FIELD',true).project;
 const entry=project.carrierStudies[0];
 delete entry.generatorRevisionId;
 return {project,entry};
}
function score(saved,ids,grid){
 clearAnalysisCache();
 const result=evaluateWeave(saved.project,saved.entry,{criterionIds:ids,evaluationId:`evaluation-${ids.join('-')}-${grid||'default'}`,createdAt:NOW,grid});
 assert.equal(Object.hasOwn(result.evaluation,'overallScore'),false);
 return Object.fromEntries(ids.map(id=>[id,result.evaluation.criterionResults[id].rating]));
}
function attractor(id,center,radius,strength){
 return {id,kind:'attractor',enabled:true,center,radius,direction:0,falloff:3,families:{A:{strength,tension:0},B:{strength,tension:0}}};
}
function copies(count){
 const names='ABCDEFGH';
 return Object.fromEntries(Array.from({length:count},(_,index)=>[names[index],family(index%2?90:0,50,100)]));
}

test('small parameter changes stay near the same scores',()=>{
 const base=score(pattern('base',{A:family(0,50,100),B:family(90,50,100)}),['WV-01','WV-03','WV-04']);
 close('spacing',score(pattern('spacing',{A:family(0,55,100),B:family(90,55,100)}),['WV-01','WV-03','WV-04'])['WV-01'],base['WV-01'],1);
 close('rotation',score(pattern('rotation',{A:family(0,50,100),B:family(93,50,100)}),['WV-01','WV-03'])['WV-01'],base['WV-01'],1);
 close('offset',score(pattern('offset',{A:family(0,50,100,8),B:family(90,50,100)}),['WV-01','WV-03','WV-04'])['WV-03'],base['WV-03'],1);
 close('density',score(pattern('density',{A:family(0,50,85),B:family(90,50,85)}),['WV-01','WV-05'])['WV-01'],base['WV-01'],1);
 const still=score(varied(0),['WV-01','WV-03']);
 const nudged=score(varied(12),['WV-01','WV-03']);
 close('variation',nudged['WV-01'],still['WV-01'],1);
 close('variation events',nudged['WV-03'],still['WV-03'],1);
});

test('a small influence nudge does not rewrite modulation',()=>{
 const field=attractor('local',{x:40,y:0},220,60);
 const base=score(pattern('local',{A:family(0,50,100),B:family(90,50,100)},{influences:[field]}),['WV-02'])['WV-02'];
 close('center',score(pattern('center',{A:family(0,50,100),B:family(90,50,100)},{influences:[attractor('local',{x:55,y:0},220,60)]}),['WV-02'])['WV-02'],base,1);
 close('radius',score(pattern('radius',{A:family(0,50,100),B:family(90,50,100)},{influences:[attractor('local',{x:40,y:0},240,60)]}),['WV-02'])['WV-02'],base,1);
 close('strength',score(pattern('strength',{A:family(0,50,100),B:family(90,50,100)},{influences:[attractor('local',{x:40,y:0},220,68)]}),['WV-02'])['WV-02'],base,1);
 const heavy=score(pattern('heavy',{A:family(0,50,100),B:family(90,50,100)},{influences:[attractor('a',{x:-40,y:0},180,50),attractor('b',{x:40,y:0},180,50),{...attractor('c',{x:0,y:-40},180,50),kind:'repeller',id:'c'},{...attractor('d',{x:0,y:40},180,50),kind:'repeller',id:'d'}]}),['WV-02'])['WV-02'];
 assert.ok(heavy<=base,`more influences scored ${heavy}, above the single field ${base}.`);
});

test('family count, density, boundary scale, and resolution do not add a hidden bonus',()=>{
 const two=score(pattern('two',copies(2)),['WV-01'])['WV-01'];
 const four=score(pattern('four',copies(4)),['WV-01'])['WV-01'];
 const eight=score(pattern('eight',copies(8)),['WV-01'])['WV-01'];
 assert.ok(four<=two,`four copied families scored ${four}, above two families ${two}.`);
 assert.ok(eight<=two,`eight copied families scored ${eight}, above two families ${two}.`);
 const dense=score(pattern('dense',{A:family(0,50,100),B:family(90,50,100)}),['WV-01'])['WV-01'];
 const sparse=score(pattern('sparse',{A:family(0,50,30),B:family(90,50,30)}),['WV-01'])['WV-01'];
 assert.ok(dense<=sparse+1,`density raised the score from ${sparse} to ${dense}.`);
 const small=score(pattern('small',{A:family(0,25,100),B:family(90,25,100)},{boundary:square(250)}),['WV-01','WV-04']);
 const large=score(pattern('large',{A:family(0,100,100),B:family(90,100,100)},{boundary:square(1000)}),['WV-01','WV-04']);
 close('boundary WV-01',large['WV-01'],small['WV-01'],1);
 close('boundary WV-04',large['WV-04'],small['WV-04'],1);
 const custom=score(pattern('custom',{A:family(0,50,100),B:family(90,50,100)}),['WV-01'])['WV-01'];
 const foundation=score(pattern('foundation',null,{carrier:createRectangularCarrier()}),['WV-01'])['WV-01'];
 close('foundation',foundation,custom,1);
 const saved=pattern('resolution',{A:family(0,50,100),B:family(90,50,100)});
 const coarse=score(saved,['WV-01','WV-03','WV-04'],20);
 const fine=score(saved,['WV-01','WV-03','WV-04'],80);
 close('grid WV-01',fine['WV-01'],coarse['WV-01'],.5);
 close('grid WV-03',fine['WV-03'],coarse['WV-03'],.5);
 close('grid WV-04',fine['WV-04'],coarse['WV-04'],.5);
});
