import test from 'node:test';import assert from 'node:assert/strict';
import {influenceResponseChanges as changes} from '../dist/influence-controls.mjs';
import {createWorkspace,saveCarrierStudy,createWeaveStudy,addInfluence,candidateInfluence} from '../dist/document.mjs';
import {createStitchSource} from '../dist/stitch-source.mjs';
test('linked and independent edits use existing immutable candidate path without clobbering other controls',()=>{
 let p=createWorkspace().projects[0];p.working.carrier=createStitchSource('double-herringbone-field','linked');p=saveCarrierStudy(p,'TEST').project;p=createWeaveStudy(p,p.carrierStudies[0].latestRevisionId);p=addInfluence(p,'attractor');
 const field=p.working.weave.generation.influences[0],before=structuredClone(p);
 const apply=(linked,changed,values)=>candidateInfluence(p,{influenceId:field.id,...changes(field,'A',linked,changed,values)});
 let q=apply(true,'attractor-strength',{strength:82,tension:99});
 for(const response of Object.values(q.working.weave.generation.influences[0].families)){assert.equal(response.strength,82);assert.equal(response.tension,field.families.A.tension);}
 q=apply(false,'attractor-strength',{strength:82});assert.equal(q.working.weave.generation.influences[0].families.A.strength,82);assert.deepEqual(q.working.weave.generation.influences[0].families.B,field.families.B);
 q=apply(true,'attractor-tension',{tension:30});for(const response of Object.values(q.working.weave.generation.influences[0].families))assert.equal(response.tension,30);
 for(const control of [undefined,'attractor-radius','attractor-falloff','influence-direction'])assert.deepEqual(changes(field,'A',true,control,{strength:82}),{});
 assert.deepEqual(p,before);
});

import vm from 'node:vm';import fs from 'node:fs';
test('targeted influence render refreshes Undo and Redo availability',()=>{const app=fs.readFileSync(new URL('../dist/app.mjs',import.meta.url),'utf8'),code=app.slice(app.indexOf('function renderR1BState('),app.indexOf('\n',app.indexOf('function renderR1BState('))),nodes={undo:{},redo:{}};const h={past:[{}],future:[]},scope={$:id=>nodes[id],history:()=>h,targetedRenderCount:0,renderInterlaceControls(){},renderThreadControls(){},renderDerivedWeaveLayer(){},renderAttractorControls(){},renderAttractorGuide(){},updateCanvasLegend(){}};vm.runInNewContext(code+';renderR1BState(true)',scope);assert.equal(nodes.undo.disabled,false);assert.equal(nodes.redo.disabled,true);h.past=[];h.future=[{}];vm.runInNewContext(code+';renderR1BState(true)',scope);assert.equal(nodes.undo.disabled,true);assert.equal(nodes.redo.disabled,false);});
