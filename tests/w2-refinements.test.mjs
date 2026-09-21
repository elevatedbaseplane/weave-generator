import test from 'node:test';import assert from 'node:assert/strict';
import {bindCrossingMarker,crossingSelectionRecord,selectedCrossingEvent,editCrossingOverride} from '../dist/crossing-controls.mjs';
import {parseSliderNumber,sliderEventNumber} from '../dist/numeric-inputs.mjs';
import {changeThreadAppearance,threadStyle,threadOpacity,threadStroke,validateThreadAppearance,outlinePoints} from '../dist/thread-appearance.mjs';
import {continuousWeaveSvg,weaveOcclusions} from '../dist/weave-occlusion.mjs';
import {findCrossings,defaultInterlacing} from '../dist/interlacing.mjs';import {square} from '../dist/boundary.mjs';
test('mouse pointerup never reaches canvas redraw before the crossing click; keyboard selects too',()=>{
 const mark={};let selected=0,redraw=0;bindCrossingMarker(mark,()=>selected++);
 for(const type of ['pointerdown','pointerup']){const e={stopped:false,stopPropagation(){this.stopped=true;}};mark['on'+type](e);if(!e.stopped)redraw++;}
 mark.onclick({stopPropagation(){}});assert.equal(redraw,0);assert.equal(selected,1);
 for(const key of ['Enter',' '])mark.onkeydown({key,preventDefault(){},stopPropagation(){}});assert.equal(selected,3);
});
test('typed numbers reject empty, nonfinite, out-of-range and off-step without clamping',()=>{
 assert.equal(parseSliderNumber('8.5',.5,30,.5),8.5);assert.equal(parseSliderNumber('-90',-180,180,1),-90);assert.equal(parseSliderNumber('0.15',.1,3,.05),.15);
 for(const value of ['','NaN','Infinity','31','0','2.3'])assert.throws(()=>parseSliderNumber(value,.5,30,.5));
});
test('typed slider events retain their captured value through a synchronous redraw',()=>{
 const range={value:'3'},event={detail:{sliderValue:1}};range.value='3';
 assert.equal(sliderEventNumber(event,range),1);assert.equal(sliderEventNumber({},range),3);
});
test('crossing selection is input-bound and swapping produces one explicit immutable override',()=>{
 const event={id:'cross-1',a:{si:0,fi:1,gi:2},b:{si:3,fi:4,gi:5}},source='geometry-1',selection=crossingSelectionRecord(source,event),settings={version:'interlacing-v1',enabled:true,topFamily:'A',clearance:1,source:'',overrides:[]};
 assert.equal(selectedCrossingEvent(selection,source,[event]),event);assert.equal(selectedCrossingEvent(selection,'geometry-2',[event]),null);assert.equal(selectedCrossingEvent({...selection,pair:'wrong'},source,[event]),null);
 const swapped=editCrossingOverride(settings,source,event.id,true,'swap',null);assert.deepEqual(swapped.overrides,[[event.id,false]]);assert.deepEqual(settings.overrides,[]);
 const chosen=editCrossingOverride(swapped,source,event.id,false,'choose',true);assert.deepEqual(chosen.overrides,[[event.id,true]]);
 const cleared=editCrossingOverride(chosen,source,event.id,true,'clear',null);assert.deepEqual(cleared.overrides,[]);assert.throws(()=>editCrossingOverride(settings,source,event.id,undefined,'swap',null));
});
test('per-family appearance upgrades explicitly and preserves old bytes and unrelated families',()=>{
 const old=changeThreadAppearance(undefined,['A','B'],'A',true,{width:8,mode:'outline'}),text=JSON.stringify(old),v=changeThreadAppearance(old,['A','B'],'B',false,{rank:4,edgeWidth:.5,width:6});
 assert.equal(v.version,'thread-appearance-v2');assert.equal(JSON.stringify(old),text);assert.equal(v.families.A.width,8);assert.equal(threadOpacity(v.families.A),1);assert.equal(threadOpacity(v.families.B),.7);assert.equal(threadStroke(v.families.B),.5);assert.equal(threadStroke({...v.families.B,width:1}),.25);
 for(const patch of [{rank:0},{rank:9},{rank:1.5},{edgeWidth:0},{edgeWidth:4}])assert.throws(()=>changeThreadAppearance(v,['A','B'],'A',false,patch));
 assert.throws(()=>validateThreadAppearance({...old,families:{A:{...old.families.A,rank:2}}}));
});
test('crossing masks use the same contour and round edge stroke as the actual upper thread',()=>{
 const strands=[{family:'A',strandId:'a',fragments:[{points:[{x:-10,y:0},{x:10,y:0}],t0:0,t1:1}]},{family:'B',strandId:'b',fragments:[{points:[{x:0,y:-10},{x:0,y:10}],t0:0,t1:1}]}],r=findCrossings(strands),settings={...defaultInterlacing(),enabled:true},a=changeThreadAppearance(undefined,['A','B'],'A',true,{width:4,mode:'outline',edgeWidth:.5,rank:3}),copy=JSON.stringify(strands),shapes=weaveOcclusions(strands,r,settings,a,'i');
 assert.equal(shapes.get('1/0')[0].edge,.5);assert.match(shapes.get('1/0')[0].d,/ 2 /);const svg=continuousWeaveSvg(strands,r,settings,a,'i',square());assert.match(svg,/fill="black" stroke="black" stroke-width="0.5" stroke-linejoin="round"/);assert.match(svg,/opacity="0.8"/);assert.equal(JSON.stringify(strands),copy);
});
test('sharp ribbon joins stay within a two-half-width miter limit',()=>{
 const points=[{x:0,y:0},{x:10,y:0},{x:1,y:5}],out=outlinePoints(points,4);assert.ok(out.length>6,'sharp turn uses bevel');for(const p of out)assert.ok(points.some(q=>Math.hypot(p.x-q.x,p.y-q.y)<=4+1e-12));
});
import {createWorkspace,saveCarrierStudy,createWeaveStudy,saveWeaveStudy} from '../dist/document.mjs';
import {createStitchSource} from '../dist/stitch-source.mjs';import {packWorkspace,prepareIncrementalRevisionWorkspace,portableText,parsePortable} from '../dist/storage-codec.mjs';import {digest,derivedSvg} from '../dist/weave.mjs';
test('hierarchy and outline weights persist with zero new geometry payloads and SVG parity',()=>{
 const ws=createWorkspace();let p=ws.projects[0];p.working.carrier=createStitchSource('herringbone-square','appearance');p=saveCarrierStudy(p,'P').project;p=createWeaveStudy(p,p.carrierStudies[0].latestRevisionId);p=saveWeaveStudy(p,'W',true).project;ws.projects[0]=p;const packed=packWorkspace(ws),hash=digest(p.working.weave.derived),old=JSON.stringify(p.weaveStudies[0].revisions[0]);p=structuredClone(p);p.working.threadAppearance=changeThreadAppearance(undefined,['foundation'],'foundation',false,{rank:5,width:7,edgeWidth:.5,mode:'outline'});p=saveWeaveStudy(p,'W',true).project;ws.projects[0]=p;const next=prepareIncrementalRevisionWorkspace(ws,packed);assert.equal(next.newPayloads.length,0);assert.equal(digest(p.working.weave.derived),hash);assert.equal(JSON.stringify(p.weaveStudies[0].revisions[0]),old);assert.deepEqual(parsePortable(portableText(next.packed)),ws);assert.match(derivedSvg(p.working,p.id,true),/opacity="0.6"/);
});
