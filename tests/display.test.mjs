import test from 'node:test';
import assert from 'node:assert/strict';
import {applyDisplayPreset,displayPresetName} from '../dist/display.mjs';

const base=()=>({theme:'light',boundary:true,grid:true,sourceLattice:true,originalGrid:true,weaveSource:true,weaveDerived:false,attractor:true});

test('distorted-only hides every underlying source layer without changing independent context',()=>{
  const original=base(),next=applyDisplayPreset(original,'derived-only');
  assert.deepEqual({sourceLattice:next.sourceLattice,originalGrid:next.originalGrid,weaveSource:next.weaveSource,weaveDerived:next.weaveDerived},{sourceLattice:false,originalGrid:false,weaveSource:false,weaveDerived:true});
  assert.equal(next.boundary,true);assert.equal(next.grid,true);assert.equal(next.attractor,true);assert.equal(next.theme,'light');assert.equal(original.sourceLattice,true);assert.equal(displayPresetName(next),'derived-only');
});

test('source comparison and carrier construction presets select only their real layers',()=>{
  const compare=applyDisplayPreset(base(),'compare');assert.equal(displayPresetName(compare),'compare');assert.equal(compare.originalGrid,true);assert.equal(compare.weaveSource,false);assert.equal(compare.weaveDerived,true);
  const construction=applyDisplayPreset(base(),'construction');assert.equal(displayPresetName(construction),'construction');assert.equal(construction.sourceLattice,true);assert.equal(construction.originalGrid,true);assert.equal(construction.weaveSource,false);assert.equal(construction.weaveDerived,false);
});

test('independent layer changes become custom and unknown presets fail atomically',()=>{
  const view=applyDisplayPreset(base(),'derived-only'),changed={...view,sourceLattice:true};assert.equal(displayPresetName(changed),'custom');assert.throws(()=>applyDisplayPreset(view,'future'),/Unknown display preset/);assert.equal(displayPresetName(view),'derived-only');
});
