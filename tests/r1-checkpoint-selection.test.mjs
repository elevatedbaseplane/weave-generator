import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const {prepareDenseSelection}=createRequire(import.meta.url)('../scripts/r1-checkpoint-selection.cjs');
const app=readFileSync(new URL('../dist/app.mjs',import.meta.url),'utf8');
function fixture({missing=false,wrongGuide=false}={}){
 let listener,restoring=false,restored=false,guides=false;const actions=[];
 const context=vm.createContext({renderAttractorControls(){},renderAttractorGuide(){},status(){},document:{querySelector(){return{addEventListener(type,fn){assert.equal(type,'pointerdown');listener=fn}}}}});
 const deselect=app.split('\n').find(l=>l.startsWith('function deselectActiveInfluence()'));
 const register=app.split('\n').find(l=>l.startsWith("document.querySelector('.workspace').addEventListener('pointerdown'"));
 assert.ok(deselect&&register,'Selection code moved: review the regression harness');
 vm.runInContext(`let activeInfluenceId='field-1';${deselect}\n${register}`,context);
 const active=()=>vm.runInContext('activeInfluenceId',context),select=()=>vm.runInContext("activeInfluenceId='field-1'",context);
 const workspaceClick=()=>listener({target:{closest:()=>null}});
 const item={async click(){assert.ok(restored,'Selection before asynchronous board restore');actions.push('select');select()},async getAttribute(key){return key==='data-influence-id'?'field-1':String(active()==='field-1')}};
 const handle={async count(){return guides&&active()==='field-1'?1:0},async isVisible(){return guides},async getAttribute(){return wrongGuide?'another-field':'field-1'},async boundingBox(){assert.equal(await this.count(),1);return{x:20,y:30,width:14,height:14}}};
 const page={locator(selector){
  if(selector.startsWith('[data-board='))return{async click(){actions.push('board');restoring=true}};
  if(selector==='#show-attractor')return{async check(){actions.push('guides');guides=true}};
  if(selector==='#fit')return{async click(){actions.push('fit');workspaceClick()}};
  if(selector==='#influence-list button')return{async all(){return missing?[]:[item]}};
  if(selector.startsWith('.attractor-center.active'))return handle;
  throw Error('Unexpected selector '+selector);
 },async waitForFunction(){assert.ok(restoring);actions.push('await-board');restoring=false;restored=true}};
 const options={async read(){assert.ok(restored,'Read before board commit');return{workspace:{activeProjectId:'board-1',projects:[{id:'board-1',working:{weave:{generation:{attractor:{id:'field-1'}}}}}]}}},async open(){actions.push('open')}};
 return{page,options,actions,active,select,workspaceClick,handle};
}
test('actual workspace handler reproduces the former select-then-Fit loss',()=>{
 const f=fixture();f.select();assert.equal(f.active(),'field-1');f.workspaceClick();assert.equal(f.active(),null);
});
test('dense preparation waits for restoration, reveals guides, fits then selects',async()=>{
 const f=fixture();const result=await prepareDenseSelection(f.page,'board-1',f.options);
 assert.equal(result.fieldId,'field-1');assert.equal(f.active(),'field-1');
 assert.deepEqual(f.actions,['board','await-board','open','guides','fit','select']);assert.equal(await f.handle.count(),1);
});
test('missing visible influence reports fixture error instead of locator timeout',async()=>{
 const f=fixture({missing:true});await assert.rejects(prepareDenseSelection(f.page,'board-1',f.options),/missing from the visible list/);
});
test('wrong selected canvas identity fails before dragging',async()=>{
 const f=fixture({wrongGuide:true});await assert.rejects(prepareDenseSelection(f.page,'board-1',f.options),/another influence/);
});
