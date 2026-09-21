import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CompactAutosave} from '../dist/compact-autosave.mjs';
import {RECOVERY_ROOT_LIMIT,recoveryRootsToKeep} from '../dist/storage.mjs';

const tick=()=>new Promise(resolve=>setTimeout(resolve,0));

test('rapid accepted edits persist only the newest compact candidate after debounce',async()=>{
 const timers=[],saved=[],states=[],autosave=new CompactAutosave({delay:20,persist:async value=>saved.push(value),onState:event=>states.push(event.state),setTimer:fn=>{timers.push(fn);return timers.length-1;},clearTimer:id=>{timers[id]=null;}});
 autosave.accept({value:1});autosave.accept({value:2});autosave.accept({value:3});
 assert.deepEqual(saved,[],'visible acceptance does not wait for storage');
 for(const timer of timers.splice(0))if(timer)timer();await tick();
 assert.deepEqual(saved,[{value:3}]);assert.equal(autosave.state().savedSequence,3);assert.ok(states.includes('pending'));assert.ok(states.includes('saved'));
});

test('backup failure is reported without replacing the accepted visible document',async()=>{
 let visible={value:1},failure;const autosave=new CompactAutosave({delay:0,persist:async()=>{throw Object.assign(Error('portable capacity'),{code:'backup-capacity'});},onState:event=>{if(event.state==='failed')failure=event.error;}});
 visible={value:2};autosave.accept(visible);await autosave.flush();
 assert.deepEqual(visible,{value:2});assert.equal(failure.code,'backup-capacity');assert.equal(autosave.state().failed,true);assert.equal(autosave.state().savedSequence,0);
});

test('an edit accepted during a save is persisted afterward as the final state',async()=>{
 let release;const saved=[],first=new Promise(resolve=>{release=resolve}),autosave=new CompactAutosave({delay:0,persist:async value=>{saved.push(value);if(value===1)await first;}});
 autosave.accept(1);await tick();autosave.accept(2);release();await autosave.flush();
 assert.deepEqual(saved,[1,2]);assert.equal(autosave.state().savedSequence,2);
});

test('settling for an explicit operation discards a queued follow-up timer',async()=>{
 let release;const first=new Promise(resolve=>{release=resolve}),autosave=new CompactAutosave({delay:0,persist:async value=>{if(value===1)await first;}});
 autosave.accept(1);await tick();autosave.accept(2);const settling=autosave.settle();release();await settling;
 assert.deepEqual(autosave.state(),{sequence:2,savedSequence:1,pending:false,saving:false,failed:false,timer:false});
});

test('recovery roots retain current and previous while bounding hidden snapshots',()=>{
 const snapshots=Array.from({length:20},(_,index)=>({root:`r${index}`,manifest:{projects:[{boundaries:[],carrierStudies:[],weaveStudies:[{revisions:[{createdAt:new Date(2026,0,index+1).toISOString()}]}]}]}})),keep=recoveryRootsToKeep(snapshots,'r0','r1');
 assert.ok(keep.has('r0'));assert.ok(keep.has('r1'));assert.ok(keep.size<=RECOVERY_ROOT_LIMIT+2);assert.ok(keep.has('r19'));assert.equal(keep.has('r2'),false);
});

test('production edit paths accept in memory before scheduling compact autosave',()=>{
 const app=fs.readFileSync(new URL('../dist/app.mjs',import.meta.url),'utf8'),worker=app.slice(app.indexOf("p.phase='ACCEPTING'"),app.indexOf("workerEvent('accepted'")),ordinary=app.slice(app.indexOf('function updateWorking('),app.indexOf('async function setBoundary('));
 assert.match(worker,/workspace=nextWorkspace;acceptedVersion\+\+/);assert.match(worker,/autosave\.accept\(\{workspace:nextWorkspace,payload:m\.payload\}/);assert.doesNotMatch(worker,/store\.commit|prepareIncrementalWorkspace/);
 assert.match(ordinary,/acceptWorkspace\(changed/);assert.doesNotMatch(ordinary,/return persist\(changed\)/);
});
