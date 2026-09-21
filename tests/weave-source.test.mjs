import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {readWeaveSource,materializeWeaveSource,validateWeaveSource,weaveCalculationInput} from '../dist/weave-source.mjs';
import {deriveWeaveSource,refreshWeave,canonical,derivedSvg} from '../dist/weave.mjs';
import {parsePortable,packWorkspace,portableText} from '../dist/storage-codec.mjs';
import {validateWorkspace,createWorkspace,normalizeWorkspace} from '../dist/document.mjs';
const dir=new URL('../docs/evidence/stability-phase0/',import.meta.url);
const fixture=()=>parsePortable(fs.readFileSync(new URL('workflow-before-reload.portable.json',dir),'utf8'));

for(const name of fs.readdirSync(dir).filter(n=>n.endsWith('.portable.json'))){
 test('canonical read migration and regeneration preserve every saved revision: '+name,()=>{
  const text=fs.readFileSync(new URL(name,dir),'utf8'),workspace=parsePortable(text),before=structuredClone(workspace);
  for(const p of workspace.projects)for(const working of [p.working,...p.weaveStudies.flatMap(s=>s.revisions.map(r=>r.working))]){
   const source=readWeaveSource(working,p.id),roundTrip=JSON.parse(JSON.stringify(source));
   assert.equal('derived' in (source.working.weave||{}),false);
   const derived=source.working.weave?deriveWeaveSource(roundTrip):null;
   assert.deepEqual(materializeWeaveSource(roundTrip,derived),working);
   assert.deepEqual(source,readWeaveSource(materializeWeaveSource(source,derived),p.id));
  }
  assert.deepEqual(workspace,before);validateWorkspace(workspace);
  assert.equal(portableText(packWorkspace(workspace)),text);
 });
}
test('missing and malicious geometry caches cannot become source decisions',()=>{
 const p=fixture().projects[0],original=p.working.weave.derived,source=readWeaveSource(p.working,p.id);
 for(const cache of [null,{strands:[],complete:true},undefined]){
  const w=structuredClone(p.working);w.weave.derived=cache;
  assert.deepEqual(readWeaveSource(w,p.id),source);
  assert.deepEqual(refreshWeave(w,p.id).weave.derived,original);
 }
 const bad=structuredClone(source);bad.working.weave.derived=original;
 assert.throws(()=>deriveWeaveSource(bad),/source keys/);
 const corrupt=fixture();corrupt.projects[0].working.weave.derived={complete:true,strands:[]};
 assert.throws(()=>validateWorkspace(corrupt),/derived snapshot/);
});
test('current family recipe owns geometry; historical recipe is preserved as provenance',()=>{
 const p=fixture().projects[0],source=readWeaveSource(p.working,p.id),before=structuredClone(source);
 source.working.carrier.families.A.spacing=64;
 const calculated=deriveWeaveSource(source);
 assert.notEqual(canonical(calculated),canonical(p.working.weave.derived));
 assert.deepEqual(source.working.carrier.families.B,before.working.carrier.families.B);
 assert.deepEqual(source.working.weave.sourceContext,before.working.weave.sourceContext);
 assert.deepEqual(source.working.weave.generation,before.working.weave.generation);
 assert.deepEqual(source.working.familyCatalog,before.working.familyCatalog);
 assert.deepEqual(source.working.interlacing,before.working.interlacing);
 assert.equal(source.working.weave.studyId,p.working.weave.studyId);
 assert.equal(source.projectId,p.id);
});
test('appearance and crossing choices change source without changing geometry or worker inputs',()=>{
 const p=fixture().projects[0],source=readWeaveSource(p.working,p.id),candidate=weaveCalculationInput(source);
 source.working.threadAppearance.families.A.width=7;
 source.working.threadAppearance.families.A.rank=2;
 source.working.interlacing.overrides[0][1]=!source.working.interlacing.overrides[0][1];
 assert.deepEqual(deriveWeaveSource(source),p.working.weave.derived);
 assert.deepEqual(weaveCalculationInput(source),candidate);
 assert.notDeepEqual(source,readWeaveSource(p.working,p.id));
 candidate.carrier.families.A.spacing=200;
 assert.equal(source.working.carrier.families.A.spacing,60);
});
test('canonical validation rejects unknown versions, extra sources and identity loss',()=>{
 const p=fixture().projects[0];
 for(const change of [s=>s.version='future',s=>s.cache={},s=>s.projectId='other',s=>s.working.weave.weaveVersion='future',s=>s.working.weave.sourceContext.sourceCarrierRevisionId='missing',s=>s.working.weave.sourceContext.parameterizationVersion='future',s=>s.working.weave.generation.influences[0].radius=-1,s=>s.working.familyCatalog.entries[0].id='']){
  const source=readWeaveSource(p.working,p.id);change(source);assert.throws(()=>validateWeaveSource(source));
 }
});
test('empty documents and legacy schema migration remain read compatible',()=>{
 const ws=createWorkspace(),p=ws.projects[0];
 assert.deepEqual(materializeWeaveSource(readWeaveSource(p.working,p.id)),p.working);
 for(const schemaVersion of [4,5,6]){
  const legacy={...structuredClone(ws),schemaVersion},normalized=normalizeWorkspace(legacy);
  assert.equal(normalized.schemaVersion,6);
  assert.deepEqual(materializeWeaveSource(readWeaveSource(normalized.projects[0].working,p.id)),p.working);
 }
});
test('SVG export matches the same canonical geometry after cache regeneration',()=>{
 const p=fixture().projects[0],w=structuredClone(p.working);w.interlacing.enabled=false;
 const source=readWeaveSource(w,p.id),regenerated=materializeWeaveSource(source,deriveWeaveSource(source));
 const actual=derivedSvg(regenerated,p.id),expected=derivedSvg(w,p.id);
 // The compact decoder's property insertion order differs from regeneration;
 // XML geometry must be byte-identical and decoded metadata exactly equivalent.
 const metadata=svg=>JSON.parse(svg.match(/<metadata>(.*?)<\/metadata>/s)[1].replaceAll('&quot;','"').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&'));
 assert.deepEqual(metadata(actual),metadata(expected));
 assert.equal(actual.replace(/<metadata>.*?<\/metadata>/s,''),expected.replace(/<metadata>.*?<\/metadata>/s,''));
});
