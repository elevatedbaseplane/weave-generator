import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorkspace,saveCarrierStudy,finalizeSavedWeaveRecord,addWeaveFamily,createWeaveStudy,addInfluence,duplicateLibraryItem,serializeWorkspace,parseBackup,validateTrustedWorkspace} from '../dist/document.mjs';
import {createRectangularCarrier} from '../dist/carrier.mjs';
import {packWorkspace,unpackWorkspace} from '../dist/storage-codec.mjs';
import {refreshWeave} from '../dist/weave.mjs';
import {resolveSavedStrand} from '../dist/weave-record.mjs';

function multiFamilyProject(){
 const ws=createWorkspace();
 let project=ws.projects[0];
 project.working.carrier=createRectangularCarrier();
 project=addWeaveFamily(project).project;
 project.working.carrier.families.C.density=1;
 return {ws,project};
}

test('a saved multi-family weave keeps strand and family ids after reload',()=>{
 const setup=multiFamilyProject();
 let project=saveCarrierStudy(setup.project,'WEAVE',{generatorVersion:'TEST-BUILD'}).project;
 const revision=project.carrierStudies[0].revisions[0];
 const catalog=new Map(revision.familyCatalog.entries.map(entry=>[entry.key,entry.id]));
 assert.equal(revision.strandIdentity.families.length,3);
 assert.equal(new Set(revision.strandIdentity.families.map(family=>family.familyId)).size,3);
 const recorded={
  families:revision.strandIdentity.families.map(family=>({familyId:family.familyId,key:family.key,retainedStrandCount:family.retainedStrandCount})),
  strands:revision.strandIdentity.strands.map(strand=>({strandId:strand.strandId,familyId:strand.familyId}))
 };
 for(const family of recorded.families){
  assert.equal(family.familyId,catalog.get(family.key));
  assert.notEqual(family.familyId,family.key);
  assert.equal(revision.strandIdentity.strands.filter(strand=>strand.familyId===family.familyId).length,family.retainedStrandCount);
 }
 const quiet=recorded.families.find(family=>family.key==='C');
 const full=recorded.families.find(family=>family.key==='A');
 assert.ok(quiet.retainedStrandCount<full.retainedStrandCount);
 assert.ok(recorded.strands.length>1);
 for(const strand of recorded.strands){
  const family=recorded.families.find(item=>item.familyId===strand.familyId);
  assert.equal(strand.strandId,`${project.id}:${revision.carrier.id}:${family.key}:${strand.strandId.split(':').at(-1)}`);
  assert.ok(resolveSavedStrand(revision,strand.strandId));
  assert.equal(resolveSavedStrand(revision,strand.strandId).familyId,strand.familyId);
 }
 const shuffled=structuredClone(revision);
 shuffled.strandIdentity.strands.reverse();
 shuffled.strandIdentity.families.reverse();
 for(const strand of recorded.strands)assert.equal(resolveSavedStrand(shuffled,strand.strandId).familyId,strand.familyId);
 setup.ws.projects[0]=project;
 validateTrustedWorkspace(setup.ws);
 const packed=unpackWorkspace(packWorkspace(parseBackup(serializeWorkspace(setup.ws))));
 const reloaded=packed.projects[0].carrierStudies[0].revisions[0].strandIdentity;
 assert.deepEqual(reloaded.families.map(family=>({familyId:family.familyId,key:family.key,retainedStrandCount:family.retainedStrandCount})),recorded.families);
 assert.deepEqual(reloaded.strands,recorded.strands);
 for(const strand of reloaded.strands)assert.equal(resolveSavedStrand(packed.projects[0].carrierStudies[0].revisions[0],strand.strandId).key,revision.familyCatalog.entries.find(entry=>entry.id===strand.familyId).key);
});

test('certified strand ids stay unchanged and resolve to catalog families',()=>{
 const setup=multiFamilyProject();
 let project=saveCarrierStudy(setup.project,'WEAVE',{generatorVersion:'TEST-BUILD'}).project;
 project=createWeaveStudy(project,project.carrierStudies[0].latestRevisionId);
 project=addInfluence(project);
 project.working=refreshWeave(project.working,project.id);
 const before=project.working.weave.derived.strands.map(strand=>({strandId:strand.strandId,family:strand.family,k:strand.k,keys:Object.keys(strand).sort()}));
 project=saveCarrierStudy(project,'WEAVE',{generatorVersion:'TEST-BUILD'}).project;
 const revision=project.carrierStudies[0].revisions.at(-1);
 for(const strand of before){
  assert.deepEqual(strand.keys,['direction','evaluationDomain','family','fragments','k','origin','parameterKind','pathKey','primitiveId','strandId']);
  assert.equal(strand.strandId,`${project.id}:${revision.carrier.id}:${strand.family}:${strand.k}`);
  assert.equal(resolveSavedStrand(revision,strand.strandId).familyId,revision.familyCatalog.entries.find(entry=>entry.key===strand.family).id);
 }
 assert.equal(revision.strandIdentity.strands.length,before.length);
});

test('an older record without strand identity still loads, and a repeat save does not add a revision',()=>{
 const ws=createWorkspace();
 let project=ws.projects[0];
 project.working.carrier=createRectangularCarrier();
 const first=finalizeSavedWeaveRecord(project,'WEAVE',{now:'2026-09-27T12:00:00.000Z',generatorVersion:'TEST-BUILD'});
 assert.equal(first.created,true);
 assert.ok(first.project.carrierStudies[0].revisions[0].strandIdentity);
 const second=finalizeSavedWeaveRecord(first.project,'WEAVE',{now:'2026-09-27T13:00:00.000Z',generatorVersion:'TEST-BUILD'});
 assert.equal(second.created,false);
 assert.equal(second.project.carrierStudies[0].revisions.length,1);
 delete first.project.carrierStudies[0].revisions[0].strandIdentity;
 ws.projects[0]=first.project;
 validateTrustedWorkspace(ws);
 first.project.carrierStudies[0].revisions[0].strandIdentity={version:'strand-identity-v1',families:[],strands:[]};
 assert.throws(()=>validateTrustedWorkspace(ws),/Invalid strand identity/);
});

test('duplicating a weave keeps catalog family ids and rebuilds strand ids for the new carrier',()=>{
 const setup=multiFamilyProject();
 let project=saveCarrierStudy(setup.project,'WEAVE',{generatorVersion:'TEST-BUILD'}).project;
 const original=project.carrierStudies[0].revisions[0];
 project=duplicateLibraryItem(project,'pattern',project.carrierStudies[0].id,{recordsOnly:true});
 const copy=project.carrierStudies[1].revisions[0];
 assert.notEqual(copy.carrier.id,original.carrier.id);
 assert.deepEqual(copy.strandIdentity.families.map(family=>family.familyId).sort(),original.strandIdentity.families.map(family=>family.familyId).sort());
 assert.notDeepEqual(copy.strandIdentity.strands.map(strand=>strand.strandId).sort(),original.strandIdentity.strands.map(strand=>strand.strandId).sort());
 for(const strand of copy.strandIdentity.strands){
  const resolved=resolveSavedStrand(copy,strand.strandId);
  assert.equal(resolved.familyId,strand.familyId);
  assert.ok(strand.strandId.includes(`:${copy.carrier.id}:`));
 }
});
