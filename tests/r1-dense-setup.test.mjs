import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {zoomAt,toDocument} from '../dist/viewport.mjs';
const require=createRequire(import.meta.url),{prepareDenseSelection}=require('../scripts/r1-checkpoint-selection.cjs'),{prepareDenseViewport,densePointer}=require('../scripts/r1-dense-pointer.cjs');
const app=readFileSync(new URL('../dist/app.mjs',import.meta.url),'utf8'),html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
const line=prefix=>{const value=app.split('\n').find(l=>l.startsWith(prefix));assert.ok(value,'Production handler moved: '+prefix);return value;};
function fixture({width=775,height=799,missing=false,hidden=false,restoreFails=false,noWheel=false}={}){
 const events=[],nodes={},rect={left:200,top:100,width,height},board={id:'board-1',working:{weave:{generation:{influences:[{id:'field-1',kind:'attractor',center:{x:0,y:0}}]}}}},geometryBefore=JSON.stringify(board);
 let pendingRestore=false,guide=false,active=null,status='',wheel,workspaceDown,commits=[];
 const canvas={viewBox:{baseVal:{width,height}},getBoundingClientRect:()=>rect,addEventListener(type,fn){assert.equal(type,'wheel');wheel=fn;},dispatchEvent(e){if(!noWheel)wheel(e);return true;}};
 const sandbox={zoomAt,toDocument,Math,Number,JSON,WheelEvent:class{constructor(type,options){Object.assign(this,options);this.type=type;}preventDefault(){}},renderCanvas(){events.push('render');},renderAttractorControls(){},renderAttractorGuide(){},focusDerivedEditing(){},status(s){status=s;},document:{querySelector:s=>s==='.workspace'?{addEventListener:(_,fn)=>workspaceDown=fn}:s==='#status'?{textContent:status}:null},$:id=>id==='canvas'?canvas:nodes[id],attempt:fn=>fn(),transientProject:()=>board,candidateInfluence:(_,changes)=>({working:{changes}}),weaveSaveOptions:()=>({}),requestWorking:(w,_,final)=>commits.push({w,final}),influenceParameterEdit:(_key,influence,final)=>commits.push({w:{changes:{influence}},final})};
 const ctx=vm.createContext(sandbox);
 vm.runInContext(`let view={cx:0,cy:0,scale:1.35},width=${width},height=${height},activeInfluenceId=null,drag=null,pending=null;${line('const localPoint=')}\n${line('function deselectActiveInfluence()')}\n${line("document.querySelector('.workspace').addEventListener('pointerdown'")}\n${line("$('canvas').addEventListener('wheel'")}\n${line("$('canvas').onpointerup=")}`,ctx);
 const currentView=()=>JSON.parse(vm.runInContext('JSON.stringify(view)',ctx));
 const evalIn=(fn,arg,element)=>{ctx.__arg=arg;ctx.__element=element;return vm.runInContext(`(${fn.toString()})(__element,__arg)`,ctx);};
 const selected=()=>vm.runInContext('activeInfluenceId',ctx);
 const handle={async count(){return guide&&selected()==='field-1'?1:0},async isVisible(){return !hidden},async getAttribute(){return 'field-1'},async boundingBox(){return{x:580,y:490,width:14,height:14}}};
 const item={async click(){events.push('select');vm.runInContext("activeInfluenceId='field-1'",ctx);active='field-1';status='ACTIVE ATTRACTOR SELECTED.';},async getAttribute(k){return k==='data-influence-id'?'field-1':String(selected()==='field-1')}};
 const page={locator(s){
  if(s==='[data-board="board-1"]')return{async click(){events.push('board');pendingRestore=true;}};
  if(s==='#show-attractor')return{async check(){events.push('guides');guide=true;}};
  if(s==='#fit')return{async click(){events.push('fit');workspaceDown({target:{closest:()=>null}});vm.runInContext('view={cx:0,cy:0,scale:1.35}',ctx);}};
  if(s==='#influence-list button')return{async all(){return missing?[]:[item]}};
  if(s.startsWith('.attractor-center.active'))return handle;
  if(s==='#canvas')return{async evaluate(fn,arg){return evalIn(fn,arg,canvas);},async boundingBox(){return{x:rect.left,y:rect.top,width,height}}};
  throw Error('Unexpected selector '+s);
 },async waitForFunction(fn,arg,options){assert.equal(options.timeout,10000);events.push('await restore');if(pendingRestore&&!restoreFails){pendingRestore=false;status='BOARD RESTORED.';}ctx.__waitArg=arg;assert.ok(vm.runInContext(`(${fn.toString()})(__waitArg)`,ctx),'Board restoration never reached expected state');}};
 const read=async()=>({workspace:{activeProjectId:pendingRestore?'old-board':board.id,projects:[board]},view:currentView()});
 const open=async(_,selector)=>{assert.equal(selector,'#field-section');events.push('open');};
 return{page,read,open,events,currentView,board,geometryBefore,commits,selected,ctx,canvas,rect};
}
test('complete restore → guides → Fit → selection → viewport → exact native endpoints uses production handlers',async()=>{
 for(const [width,height]of [[775,799],[775.5,799.5],[776,800]]){
  const f=fixture({width,height}),steps=[];
  const selection=await prepareDenseSelection(f.page,'board-1',{read:f.read,open:f.open,step:s=>steps.push(s)});
  const viewport=await prepareDenseViewport(f.page,f.read);
  assert.equal(selection.fieldId,'field-1');assert.equal(f.selected(),'field-1');assert.deepEqual(f.currentView(),{cx:0,cy:0,scale:2});
  assert.equal(JSON.stringify(f.board),f.geometryBefore,'Setup must not edit geometry');
  assert.deepEqual(f.events.slice(0,6),['board','await restore','open','guides','fit','select']);
  assert.equal(steps.length,3);
  for(const x of [0,1]){
   const p=densePointer(viewport.after,viewport.box,x);
   vm.runInContext("drag={type:'attractor',handle:'center',field:{id:'field-1'}}",f.ctx);
   f.canvas.onpointerup({clientX:Math.fround(p.x),clientY:Math.fround(p.y),target:{closest:()=>null}});
   assert.deepEqual(JSON.parse(JSON.stringify(f.commits.at(-1).w.changes.influence.center)),{x,y:0});assert.equal(f.commits.at(-1).final,true);
  }
 }
});
test('captured host wheel scale drift explains old wait without implying failed selection',()=>{
 const raw=JSON.parse(readFileSync(new URL('../docs/evidence/r1-checkpoint-20260917/browser-2026-09-17T19-44-59-213Z.json',import.meta.url)));
 assert.ok(raw.denseSelection.fieldId);assert.equal(raw.finalStatus,'ACTIVE ATTRACTOR SELECTED.');assert.match(raw.error.stack,/prepareDenseViewport/);
 const nativeDelta=Math.fround(-Math.log(2/1.35)/.001),actual=1.35*Math.exp(-nativeDelta*.001);
 assert.equal(actual,raw.final.view.scale);assert.ok(Math.abs(actual-2)>1e-12);
});
test('missing, hidden and unrestored fixtures fail before viewport or measurement',async()=>{
 for(const options of [{missing:true},{hidden:true},{restoreFails:true}]){const f=fixture(options);await assert.rejects(prepareDenseSelection(f.page,'board-1',{read:f.read,open:f.open}));assert.equal(f.commits.length,0);}
});
test('missing wheel handler reports viewport evidence immediately instead of waiting30seconds',async()=>{
 const f=fixture({noWheel:true});await prepareDenseSelection(f.page,'board-1',{read:f.read,open:f.open});
 await assert.rejects(prepareDenseViewport(f.page,f.read),e=>{assert.ok(e.setupDiagnostics);assert.equal(e.setupDiagnostics.after.scale,1.35);assert.equal(e.setupDiagnostics.targetScale,2);return true;});
});
test('static selectors and expected restore transition are present in actual application source',()=>{
 for(const id of ['canvas','status','field-section','show-attractor','fit','influence-list'])assert.match(html,new RegExp(`id="${id}"`));
 for(const text of ['data-board','data-influence-id','aria-selected','BOARD RESTORED.','attractor-center'])assert.ok(app.includes(text),text);
});
