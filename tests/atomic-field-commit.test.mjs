import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createWorkspace,saveCarrierStudy,createWeaveStudy,addInfluence,candidateInfluence,saveWeaveStudy,validateTrustedWorkspace} from '../dist/document.mjs';
import {createLinePreset} from '../dist/line-presets.mjs';
import {influenceResponseChanges} from '../dist/influence-controls.mjs';
import {refreshWeave,digest} from '../dist/weave.mjs';
import {packWorkspace,projectPortableByteLength,prepareIncrementalRevisionWorkspace,unpackWorkspace} from '../dist/storage-codec.mjs';

const app=fs.readFileSync(new URL('../dist/app.mjs',import.meta.url),'utf8');

function fixture(){
 let project=createWorkspace().projects[0];
 project.working.carrier=createLinePreset('triangular-grid','atomic-field');
 project=saveCarrierStudy(project,'PATTERN').project;
 project=createWeaveStudy(project,project.working.carrierSourceRevisionId);
 project=addInfluence(project,'attractor');
 project.working=refreshWeave(project.working,project.id);
 return saveWeaveStudy(project,'FIELD',true).project;
}

test('one influence gesture keeps one base and captures the release value explicitly',()=>{
 assert.match(app,/function influenceGestureBase\(id\)/);
 assert.match(app,/base:transientProject\(\)/);
 assert.match(app,/const value=sliderEventNumber\(event,range\)/);
 assert.match(app,/attractorChanges\(base,id,influenceControlSnapshot\(id,value\)\)/);
 assert.match(app,/influenceGesture=null;requestWorking\(next\.working,'INFLUENCE UPDATED AND SAVED\.'/);
 assert.doesNotMatch(app,/candidateInfluence\(transientProject\(\),attractorChanges\(id\)\)/);
});

test('family A preview and release candidates are identical and save without changing family B',()=>{
 const project=fixture(),field=project.working.weave.generation.influences[0],baseB=structuredClone(field.families.B);
 const change={influenceId:field.id,...influenceResponseChanges(field,'A',false,'attractor-strength',{strength:81,tension:0}),influence:{kind:field.kind,center:{...field.center},radius:field.radius,enabled:field.enabled,falloff:field.falloff,direction:field.direction}};
 const preview=candidateInfluence(project,change),release=candidateInfluence(project,change);
 assert.equal(digest(preview.working.weave.generation),digest(release.working.weave.generation));
 assert.equal(release.working.weave.generation.influences[0].families.A.strength,81);
 assert.deepEqual(release.working.weave.generation.influences[0].families.B,baseB);
 release.working=refreshWeave(release.working,release.id);
 const saved=saveWeaveStudy(release,'FIELD',true).project;
 assert.equal(saved.working.weave.generation.influences[0].families.A.strength,81);
 assert.equal(saved.working.weave.derived.provenanceFingerprint,release.working.weave.derived.provenanceFingerprint);
});

test('automatic save replaces hidden weave history and reduces portable project size',()=>{
 let project=fixture();
 for(const strength of [60,70,80,90]){
  const field=project.working.weave.generation.influences[0];
  project=candidateInfluence(project,{influenceId:field.id,family:'A',familySettings:{strength}});
  project.working=refreshWeave(project.working,project.id);
  project=saveWeaveStudy(project,'FIELD',true).project;
 }
 assert.equal(project.weaveStudies[0].revisions.length,5);
 const beforeWorkspace={schemaVersion:6,activeProjectId:project.id,projects:[project]},beforePacked=packWorkspace(beforeWorkspace),before=projectPortableByteLength(beforePacked,project.id);
 project=saveWeaveStudy(project,'FIELD',true,true).project;
 const afterWorkspace={schemaVersion:6,activeProjectId:project.id,projects:[project]};
 validateTrustedWorkspace(afterWorkspace);
 assert.equal(project.weaveStudies[0].revisions.length,1);
 assert.equal(project.weaveStudies[0].revisions[0].number,1);
 assert.equal(project.weaveStudies[0].revisions[0].parentRevisionId,null);
 assert.equal(project.working.weave.generation.influences[0].families.A.strength,90);
 assert.ok(projectPortableByteLength(packWorkspace(afterWorkspace),project.id)<before);
 const compacted=prepareIncrementalRevisionWorkspace(afterWorkspace,beforePacked).packed;
 assert.equal(compacted.manifest.projects[0].weaveStudies[0].revisions.length,1);
 assert.equal(compacted.records.length,1);
 assert.equal(compacted.payloads.length,1);
});

test('capacity admission runs after revision compaction has been applied',()=>{
 const codec=fs.readFileSync(new URL('../dist/storage-codec.mjs',import.meta.url),'utf8');
 const incremental=codec.slice(codec.indexOf('export function prepareIncrementalWorkspace'),codec.indexOf('export function prepareIncrementalRevisionWorkspace'));
 assert.doesNotMatch(incremental,/assertProjectPortable/);
 assert.match(incremental,/prepareIncrementalRevisionWorkspace\(workspace,packed\)/);
});

test('compacting multiple weaves preserves each weave own certified payload',()=>{
 let project=fixture();
 project=createWeaveStudy(project,project.working.carrierSourceRevisionId);
 project=addInfluence(project,'repeller');
 let secondField=project.working.weave.generation.influences[0];
 project=candidateInfluence(project,{influenceId:secondField.id,family:'A',familySettings:{strength:77}});
 project.working=refreshWeave(project.working,project.id);
 project=saveWeaveStudy(project,'FIELD 2',true).project;
 const expanded={schemaVersion:6,activeProjectId:project.id,projects:[project]},base=packWorkspace(expanded);
 project=saveWeaveStudy(project,'FIELD 2',true,true).project;
 const compactedWorkspace={schemaVersion:6,activeProjectId:project.id,projects:[project]},prepared=prepareIncrementalRevisionWorkspace(compactedWorkspace,base).packed,restored=unpackWorkspace(prepared);
 validateTrustedWorkspace(restored);
 assert.equal(restored.projects[0].weaveStudies.length,2);
 assert.ok(restored.projects[0].weaveStudies.every(study=>study.revisions.length===1));
 const fingerprints=restored.projects[0].weaveStudies.map(study=>study.revisions[0].working.weave.derived.provenanceFingerprint);
 assert.equal(new Set(fingerprints).size,2);
});
