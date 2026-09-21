import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {parsePortable,packWorkspace,prepareIncrementalRevisionWorkspace} from '../dist/storage-codec.mjs';
import {saveWeaveStudy} from '../dist/document.mjs';
import {changeThreadAppearance} from '../dist/thread-appearance.mjs';
const storage=fs.readFileSync(new URL('../dist/storage.mjs',import.meta.url),'utf8');
test('3 to 6 to 3 reuses retained immutable content after active snapshot compaction',()=>{
 let ws=parsePortable(fs.readFileSync(new URL('../docs/evidence/stability-phase0/workflow-before-reload.portable.json',import.meta.url),'utf8')),packed=packWorkspace(ws);
 const maps={records:new Map(packed.records.map(r=>[r.id,r])),payloads:new Map(packed.payloads.map(r=>[r.id,r])),snapshots:new Map()};
 const tx={objectStore:name=>({put(value){maps[name].set(value.id||value.root,structuredClone(value));},add(value){if(maps[name].has(value.id))throw Error('Key already exists');maps[name].set(value.id,structuredClone(value));}})};
 const scope={};vm.createContext(scope);vm.runInContext(storage.slice(storage.indexOf('function packedSnapshot('),storage.indexOf('export class IndexedStore')),scope);
 const original=structuredClone([...maps.records.values()]);let reused=false;
 for(const rank of [6,3,6,3]){
  const p=structuredClone(ws.projects[0]);p.working.threadAppearance=changeThreadAppearance(p.working.threadAppearance,['A','B'],'A',false,{rank});
  ws={...ws,projects:[saveWeaveStudy(p,p.weaveStudies.find(s=>s.id===p.working.weave.studyId).name,true,true).project]};
  const prepared=prepareIncrementalRevisionWorkspace(ws,packed);
  reused ||= prepared.newRecords.some(r=>maps.records.has(r.id));
  scope.putDelta(tx,prepared);packed=prepared.packed;
  assert.equal(ws.projects[0].working.threadAppearance.families.A.rank,rank);
 }
 assert.ok(reused,'test must encounter a content record absent from the active root but retained in recovery');
 for(const r of original)assert.deepEqual(maps.records.get(r.id),r);
 // Returning to an earlier geometry similarly reuses a retained payload.
 scope.putDelta(tx,{packed,newRecords:[],newPayloads:[packed.payloads[0]]});
 assert.deepEqual(maps.payloads.get(packed.payloads[0].id),packed.payloads[0]);
});
