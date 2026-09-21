import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {WeaveEditGesture,validateWorkingEdit} from '../dist/weave-edit.mjs';
import {copyProjectForEdit} from '../dist/edit-draft.mjs';
import {candidateInfluence,saveCarrierStudy,retargetWeaveSource,saveWeaveStudy} from '../dist/document.mjs';
import {parsePortable,portableText,packWorkspace} from '../dist/storage-codec.mjs';
import {refreshWeave} from '../dist/weave.mjs';
const fixture=()=>parsePortable(fs.readFileSync(new URL('../docs/evidence/stability-phase0/workflow-before-reload.portable.json',import.meta.url),'utf8'));
const app=fs.readFileSync(new URL('../dist/app.mjs',import.meta.url),'utf8');

test('release reuses exact prepared family source and ancestry even if transient controls changed',()=>{
 const p=fixture().projects[0],before=structuredClone(p),gesture=new WeaveEditGesture();let calls=0;
 const prepare=(base,spacing)=>{calls++;base=copyProjectForEdit(base);base.working.carrier.families.A.spacing=spacing;const saved=saveCarrierStudy(base,'EDIT TEST');return{project:retargetWeaveSource(saved.project,saved.revisionId)};};
 const preview=gesture.capture('A-spacing',64,()=>p,prepare);
 const release=gesture.capture('A-spacing',64,()=>{throw Error('release must not reacquire a transient base');},()=>{throw Error('release must not prepare another revision');},true);
 assert.equal(preview,release);assert.equal(calls,1);assert.equal(gesture.current,null);
 assert.deepEqual(release.project.working.carrier.families.B,before.working.carrier.families.B);
 assert.deepEqual(release.project.working.weave.generation,before.working.weave.generation);
 assert.deepEqual(release.project.working.interlacing,before.working.interlacing);
 const calculated=refreshWeave(preview.project.working,p.id),committed=refreshWeave(release.project.working,p.id);
 assert.deepEqual(committed,calculated);
 const saved=saveWeaveStudy({...release.project,working:committed},p.weaveStudies.find(x=>x.id===p.working.weave.studyId).name,true,true).project;
 const reloaded=parsePortable(portableText(packWorkspace({schemaVersion:6,activeProjectId:saved.id,projects:[saved]}))).projects[0];
 assert.deepEqual(reloaded.working,committed);assert.deepEqual(refreshWeave(reloaded.working,p.id),committed);assert.deepEqual(p,before);
});

test('changed release value prepares once from the original gesture base and survives reload',()=>{
 const p=fixture().projects[0],gesture=new WeaveEditGesture(),id=p.working.weave.generation.influences[0].id,bases=[];
 const prepare=(base,strength)=>{bases.push(base);return{project:candidateInfluence(base,{influenceId:id,family:'A',familySettings:{strength}})};};
 gesture.capture('strength',65,()=>p,prepare);
 const release=gesture.capture('strength',67,()=>{throw Error('must retain gesture base');},prepare,true);
 assert.equal(bases.length,2);assert.ok(bases.every(base=>base===p));assert.equal(release.project.working.weave.generation.influences[0].families.A.strength,67);
 assert.deepEqual(release.project.working.weave.generation.influences[0].families.B,p.working.weave.generation.influences[0].families.B);
 const working=refreshWeave(release.project.working,p.id),saved=saveWeaveStudy({...release.project,working},p.weaveStudies.find(x=>x.id===p.working.weave.studyId).name,true,true).project;
 const reload=parsePortable(portableText(packWorkspace({schemaVersion:6,activeProjectId:p.id,projects:[saved]}))).projects[0];
 assert.deepEqual(reload.working,working);
});

test('invalid preview retains the previous valid candidate; cancellation and target changes discard it',()=>{
 const p=fixture().projects[0],gesture=new WeaveEditGesture(),prepare=(base,spacing)=>{base=copyProjectForEdit(base);base.working.carrier.families.A.spacing=spacing;return{project:base};};
 const valid=gesture.capture('A',64,()=>p,prepare);
 assert.throws(()=>gesture.capture('A',-5,()=>p,prepare));
 assert.equal(gesture.capture('A',64,()=>p,prepare,true),valid);
 const first=gesture.capture('A',64,()=>p,prepare);gesture.clear();assert.notEqual(gesture.capture('A',64,()=>p,prepare),first);
 assert.notEqual(gesture.capture('B',64,()=>p,prepare),first);
});

test('validated edit copies source decisions but shares immutable cached geometry',()=>{
 const p=fixture().projects[0],next=validateWorkingEdit(p.working,p.id);
 assert.notEqual(next,p.working);assert.notEqual(next.carrier,p.working.carrier);assert.equal(next.weave.derived,p.working.weave.derived);
 assert.throws(()=>validateWorkingEdit({...next,anotherSource:{}},p.id),/source keys/);
});

test('actual influence adapter commits its preview without rebuilding from controls',()=>{
 const p=fixture().projects[0],field=p.working.weave.generation.influences[0],requests=[];
 const context={editGesture:new WeaveEditGesture(),project:()=>p,transientProject:()=>p,candidateInfluence,weaveSaveOptions:owner=>({projectUpdate:owner}),updateWorking:(working,label,options)=>requests.push({working,options}),JSON};
 vm.createContext(context);vm.runInContext(app.slice(app.indexOf('function influenceParameterEdit('),app.indexOf("for(const [id,key] of [['attractor-radius'")),context);
 const prepare=(base,raw)=>({influenceId:field.id,family:'A',familySettings:{strength:raw}});
 context.influenceParameterEdit('A-strength',71,false,prepare,'STRENGTH 71');
 context.influenceParameterEdit('A-strength',71,true,()=>{throw Error('must reuse preview');},'STRENGTH 71');
 assert.equal(requests[0].working,requests[1].working);assert.equal(requests[0].options.preview,true);assert.equal(requests[1].options.preview,false);
});

test('all certified edits use the same calculation path for preview and release, including identity',()=>{
 const p=fixture().projects[0],requests=[],context={project:()=>p,validateWorkingEdit,isCertifiedStudy:()=>true,queueWorkingCalculation:(...args)=>requests.push(args)};
 vm.createContext(context);vm.runInContext(app.slice(app.indexOf('function updateWorking('),app.indexOf('async function setBoundary(')),context);
 context.updateWorking(p.working,'PREVIEW',{preview:true});context.updateWorking(p.working,'COMMIT');
 assert.deepEqual(requests[0][0],requests[1][0]);assert.equal(requests[0][2],false);assert.equal(requests[1][2],true);
});
