import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorkspace,saveCarrierStudy,renameLibraryItem,duplicateLibraryItem,serializeWorkspace,parseBackup,validateTrustedWorkspace} from '../dist/document.mjs';
import {createRectangularCarrier} from '../dist/carrier.mjs';
import {packWorkspace,unpackWorkspace} from '../dist/storage-codec.mjs';
import {readWeaveIdentity,WEAVE_RECORD_VERSION,formatWeaveCreatedDate} from '../dist/weave-record.mjs';

const FIRST='2026-09-26T12:00:00.000Z',LATER='2026-09-26T13:00:00.000Z';

function saved(name,spacing,identity){
 const ws=createWorkspace();
 let project=ws.projects[0];
 project.working.carrier=createRectangularCarrier();
 project.working.carrier.families.A.spacing=spacing;
 project=saveCarrierStudy(project,name,identity).project;
 ws.projects[0]=project;
 return ws;
}

test('a saved weave keeps one weaveId across resave, reload, and a second weave',()=>{
 const ws=saved('WEAVE A',40,{now:FIRST,generatorVersion:'TEST-BUILD'});
 const first=ws.projects[0].carrierStudies[0];
 assert.match(first.weaveId,/^weave-/);
 assert.notEqual(first.weaveId,first.id);
 assert.equal(first.name,'WEAVE A');
 assert.equal(first.createdAt,FIRST);
 assert.equal(first.modifiedAt,FIRST);
 assert.equal(first.generatorVersion,'TEST-BUILD');
 assert.equal(first.recordVersion,WEAVE_RECORD_VERSION);
 ws.projects[0].working.carrier.families.A.spacing=80;
 const resaved=saveCarrierStudy(ws.projects[0],'WEAVE A',{now:LATER,generatorVersion:'NEWER-BUILD'}).project;
 assert.equal(resaved.carrierStudies[0].weaveId,first.weaveId);
 assert.equal(resaved.carrierStudies[0].createdAt,FIRST);
 assert.equal(resaved.carrierStudies[0].modifiedAt,LATER);
 assert.equal(resaved.carrierStudies[0].generatorVersion,'TEST-BUILD');
 resaved.working.carrier.families.A.spacing=55;
 const both=saveCarrierStudy(resaved,'WEAVE B',{now:LATER,generatorVersion:'TEST-BUILD'}).project;
 assert.equal(both.carrierStudies[0].weaveId,first.weaveId);
 assert.notEqual(both.carrierStudies[1].weaveId,first.weaveId);
 assert.equal(both.carrierStudies[0].revisions[0].carrier.families.A.spacing,40);
 both.working.carrier.families.B.spacing=12;
 assert.equal(both.carrierStudies[0].weaveId,first.weaveId);
 assert.equal(both.carrierStudies[0].revisions[0].carrier.families.B.spacing,50);
 const reloaded=parseBackup(serializeWorkspace({...ws,projects:[both]}));
 validateTrustedWorkspace(reloaded);
 assert.equal(reloaded.projects[0].carrierStudies[0].weaveId,first.weaveId);
 assert.equal(reloaded.projects[0].carrierStudies[1].weaveId,both.carrierStudies[1].weaveId);
 const packed=unpackWorkspace(packWorkspace(reloaded));
 assert.equal(packed.projects[0].carrierStudies[0].weaveId,first.weaveId);
 assert.deepEqual(readWeaveIdentity(packed.projects[0].carrierStudies[1]),{
  weaveId:both.carrierStudies[1].weaveId,name:'WEAVE B',createdAt:LATER,modifiedAt:LATER,generatorVersion:'TEST-BUILD',recordVersion:WEAVE_RECORD_VERSION
 });
});

test('an older saved weave receives its existing id once and keeps it',()=>{
 const ws=saved('LEGACY',50,{now:FIRST,generatorVersion:'TEST-BUILD'});
 const entry=ws.projects[0].carrierStudies[0];
 delete entry.weaveId;delete entry.createdAt;delete entry.modifiedAt;delete entry.generatorVersion;delete entry.recordVersion;
 validateTrustedWorkspace(ws);
 assert.equal(readWeaveIdentity(entry).weaveId,entry.id);
 const promoted=saveCarrierStudy(ws.projects[0],'LEGACY',{now:LATER,generatorVersion:'TEST-BUILD'}).project;
 assert.equal(promoted.carrierStudies[0].weaveId,entry.id);
 assert.equal(promoted.carrierStudies[0].createdAt,FIRST);
 const renamed=renameLibraryItem(promoted,'pattern',promoted.carrierStudies[0].id,'LEGACY RENAMED');
 assert.equal(renamed.carrierStudies[0].weaveId,entry.id);
 assert.equal(renamed.carrierStudies[0].name,'LEGACY RENAMED');
 const copied=duplicateLibraryItem(renamed,'pattern',renamed.carrierStudies[0].id);
 assert.notEqual(copied.carrierStudies[1].weaveId,entry.id);
 assert.match(copied.carrierStudies[1].weaveId,/^weave-/);
 assert.equal(copied.carrierStudies[0].weaveId,entry.id);
});

test('duplicate weave identities are rejected',()=>{
 const ws=saved('WEAVE A',40,{now:FIRST,generatorVersion:'TEST-BUILD'});
 ws.projects[0].working.carrier.families.A.spacing=70;
 const both=saveCarrierStudy(ws.projects[0],'WEAVE B',{now:LATER,generatorVersion:'TEST-BUILD'}).project;
 both.carrierStudies[1].weaveId=both.carrierStudies[0].weaveId;
 ws.projects[0]=both;
 assert.throws(()=>validateTrustedWorkspace(ws),/Duplicate weave identity/);
});

test('a saved weave date is a local calendar day',()=>{
 assert.equal(formatWeaveCreatedDate(FIRST),formatWeaveCreatedDate(new Date(Date.parse(FIRST)).toISOString()));
 assert.equal(formatWeaveCreatedDate(''),'');
 const shown=formatWeaveCreatedDate(FIRST);
 assert.match(shown,/^\d{4}-\d{2}-\d{2}$/);
});
