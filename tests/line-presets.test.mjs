import test from 'node:test';import assert from 'node:assert/strict';
import {LINE_PRESETS,createLinePreset} from '../dist/line-presets.mjs';
import {createWorkspace,saveCarrierStudy,createWeaveStudy,addInfluence,saveWeaveStudy,validateTrustedWorkspace} from '../dist/document.mjs';
import {deriveForWeave} from '../dist/weave.mjs';
import {packWorkspace,unpackWorkspace,portableText,parsePortable} from '../dist/storage-codec.mjs';
for(const id of Object.keys(LINE_PRESETS))test(`${id}: editable independent pattern, clipped influence and exact backup`,()=>{
 const workspace=createWorkspace();let p=workspace.projects[0];p.working.carrier=createLinePreset(id,'fixture');
 assert.equal(Object.keys(p.working.carrier.families).length,LINE_PRESETS[id].angles.length);
 assert.deepEqual(Object.values(p.working.carrier.families).map(f=>f.angleDegrees),LINE_PRESETS[id].angles);
 p=saveCarrierStudy(p,'PRESET').project;p=createWeaveStudy(p,p.carrierStudies[0].latestRevisionId);assert.ok(p.working.weave.derived.strands.length>0);
 const saved=p.carrierStudies[0].revisions[0];const snapshot=structuredClone(saved);
 p=addInfluence(p,'attractor');p.working.weave.derived=deriveForWeave(p.working.weave,p.working.boundary,p.working.carrier,p.id);assert.ok(p.working.weave.derived.complete);assert.deepEqual(saved,snapshot);
 p=saveWeaveStudy(p,'FIELD',true).project;workspace.projects[0]=p;validateTrustedWorkspace(workspace);assert.deepEqual(parsePortable(portableText(packWorkspace(workspace))),workspace);
 const next=createLinePreset(id,'next');next.families.A.spacing=17;assert.equal(createLinePreset(id,'other').families.A.spacing,LINE_PRESETS[id].spacing);
});
test('unknown preset rejects rather than creating a misleading fallback',()=>assert.throws(()=>createLinePreset('unknown'),/Unknown/));

