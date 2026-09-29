import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createWorkspace,saveCarrierStudy,validateTrustedWorkspace,serializeWorkspace,parseBackup} from '../dist/document.mjs';
import {createRectangularCarrier} from '../dist/carrier.mjs';
import {inspectGeneratorRecord,generatorRecordNote,compareRegeneratedGeometry} from '../dist/weave-record.mjs';

test('a complete saved weave has nothing missing',()=>{
 const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
 assert.match(html,/id="record-completeness"/);
 const ws=createWorkspace();
 let project=ws.projects[0];
 project.working.carrier=createRectangularCarrier();
 project=saveCarrierStudy(project,'WEAVE A',{generatorVersion:'TEST-BUILD'}).project;
 const revision=project.carrierStudies[0].revisions[0];
 const report=inspectGeneratorRecord(revision);
 assert.equal(report.applicable,true);
 assert.deepEqual(report.notices,[]);
 assert.equal(generatorRecordNote(revision),'');
});

test('incomplete and obsolete records stay loadable and name what is wrong',()=>{
 const ws=createWorkspace();
 let project=ws.projects[0];
 project.working.carrier=createRectangularCarrier();
 project.working.carrier.families.A.spacing=40;
 project=saveCarrierStudy(project,'OLD WEAVE',{generatorVersion:'OLD-BUILD'}).project;
 const revision=project.carrierStudies[0].revisions[0];
 const storedCarrier=structuredClone(revision.carrier);
 delete revision.generation.parameters.families.A.spacing;
 revision.generation.parameters.families.A.threadCount=3;
 delete revision.generation.settings.clipVersion;
 revision.generation.settings.generatorVersion='rect-v0';
 revision.generation.retired=true;
 const report=inspectGeneratorRecord(revision);
 const labels=report.notices.map(item=>item.label);
 assert.equal(report.applicable,false);
 assert.ok(labels.includes('Missing'));
 assert.ok(labels.includes('Legacy Parameter'));
 assert.ok(labels.includes('Unavailable'));
 assert.match(generatorRecordNote(revision),/MISSING · A SPACING/);
 assert.match(generatorRecordNote(revision),/LEGACY PARAMETER · A THREADCOUNT/);
 assert.match(generatorRecordNote(revision),/UNAVAILABLE · GENERATOR VERSION/);
 const compared=compareRegeneratedGeometry(revision);
 assert.equal(compared.status,'preserved');
 assert.deepEqual(revision.carrier,storedCarrier);
 ws.projects[0]=project;
 validateTrustedWorkspace(ws);
 const reloaded=parseBackup(serializeWorkspace(ws));
 const again=inspectGeneratorRecord(reloaded.projects[0].carrierStudies[0].revisions[0]);
 assert.equal(again.applicable,false);
 assert.ok(again.notices.some(item=>item.label==='Missing'));
});

test('a record with no generator snapshot is unavailable and still valid',()=>{
 const ws=createWorkspace();
 let project=ws.projects[0];
 project.working.carrier=createRectangularCarrier();
 project=saveCarrierStudy(project,'LEGACY',{generatorVersion:'TEST-BUILD'}).project;
 const revision=project.carrierStudies[0].revisions[0];
 delete revision.generation;
 const report=inspectGeneratorRecord(revision);
 assert.equal(report.applicable,false);
 assert.deepEqual(report.notices,[{label:'Unavailable',name:'GENERATOR SNAPSHOT'}]);
 ws.projects[0]=project;
 validateTrustedWorkspace(ws);
});
