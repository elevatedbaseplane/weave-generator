import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {compatibilityBaselineTool} from '../dist/compatibility-baseline.mjs';
import {parsePortable,packWorkspace,portableText} from '../dist/storage-codec.mjs';
import {validateWorkspace} from '../dist/document.mjs';
import {refreshWeave,canonical} from '../dist/weave.mjs';
const dir=new URL('../docs/evidence/stability-phase0/',import.meta.url);
const hashes=JSON.parse(fs.readFileSync(new URL('fixture-sha256.json',dir),'utf8'));

test('diagnostic returns native text without mutating captured state',async()=>{
 const state={build:'fixture',root:'root',packed:{manifest:{activeProjectId:'a',projects:[{id:'a',name:'A'},{id:'b',name:'B'}]}}};
 const before=structuredClone(state),calls=[],tool=compatibilityBaselineTool(()=>state,async(packed,id)=>{assert.equal(packed,state.packed);calls.push(id);return{text:'exact-'+id};});
 assert.equal(tool.annotations.readOnlyHint,true);
 assert.deepEqual((await tool.execute({})).projects.map(p=>p.portableText),['exact-a','exact-b']);
 assert.deepEqual(calls,['a','b']);assert.deepEqual(state,before);
 for(const input of [null,[],{extra:1}])await assert.rejects(()=>tool.execute(input));
});
test('diagnostic rejects unsettled, blocked, changed and failed exports',async()=>{
 for(const flag of ['blocked','pending'])await assert.rejects(()=>compatibilityBaselineTool(()=>({[flag]:true}),()=>{throw Error('must not export');}).execute({}),/settled/);
 let root='one';const packed={manifest:{projects:[{id:'a'}]}};
 await assert.rejects(()=>compatibilityBaselineTool(()=>({root,packed}),async()=>{root='two';return{text:'x'};}).execute({}),/changed/);
 await assert.rejects(()=>compatibilityBaselineTool(()=>({root,packed}),async()=>{throw Error('export failed');}).execute({}),/export failed/);
});
for(const name of fs.readdirSync(dir).filter(n=>n.endsWith('.portable.json'))){
 test('frozen native fixture exact reload and regeneration: '+name,()=>{
  const text=fs.readFileSync(new URL(name,dir),'utf8'),ws=parsePortable(text);
  assert.equal(createHash('sha256').update(text).digest('hex'),hashes[name],'Frozen fixture changed');
  validateWorkspace(ws);assert.equal(portableText(packWorkspace(ws)),text);
  for(const p of ws.projects)for(const w of [p.working,...p.weaveStudies.flatMap(s=>s.revisions.map(r=>r.working))]){
   if(!w.weave)continue;
   assert.equal(canonical(refreshWeave(structuredClone(w),p.id).weave.derived),canonical(w.weave.derived));
  }
 });
}
test('five-workflow fixture retains independent decisions and exact reload/return',()=>{
 const load=name=>parsePortable(fs.readFileSync(new URL(name+'.portable.json',dir),'utf8')).projects[0];
 const before=load('workflow-before-reload'),reloaded=load('workflow-after-reload'),returned=load('workflow-after-boundary-return'),w=before.working;
 assert.equal(before.boundaries.length,1);assert.equal(before.carrierStudies.length,1);
 assert.deepEqual(w.carrier.families.A,{angleDegrees:10,density:100,offset:0,spacing:60});
 assert.deepEqual(w.carrier.families.B,{angleDegrees:90,density:100,offset:0,spacing:50});
 assert.equal(w.threadAppearance.families.A.width,5);assert.equal(w.threadAppearance.families.A.rank,3);
 assert.deepEqual(w.weave.generation.influences.map(f=>f.kind),['attractor','repeller','deflector']);
 const [a,,d]=w.weave.generation.influences;
 assert.equal(a.radius,180);assert.deepEqual(a.families,{A:{strength:70,tension:20},B:{strength:70,tension:0}});
 assert.deepEqual(d.center,{x:12.82007,y:-5.963138});
 assert.equal(w.interlacing.rule.over,2);assert.equal(w.interlacing.rule.under,1);
 assert.deepEqual(w.interlacing.rule.pairs,[{first:'A',second:'B',over:1,under:1,phase:0}]);
 assert.equal(w.interlacing.overrides.length,1);assert.equal(w.interlacing.overrides[0][1],true);
 assert.equal(w.interlacing.source,w.weave.derived.provenanceFingerprint);
 assert.deepEqual(reloaded,before);assert.deepEqual(returned.working,w);assert.equal(returned.boundaries.length,2);
});
