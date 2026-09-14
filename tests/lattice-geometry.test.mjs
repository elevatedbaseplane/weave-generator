import assert from 'node:assert/strict';
import test from 'node:test';
import {latticePaths} from '../dist/lattice-geometry.mjs';

test('each base lattice mode produces paths',()=>{
  assert.ok(latticePaths({mode:'rectangular',spacing:40}).length>0);
  assert.ok(latticePaths({mode:'triangular',spacing:40}).length>0);
  assert.equal(latticePaths({mode:'radial',spacing:40}).length,18);
});

test('offset produces a deterministic changed lattice',()=>{
  assert.notDeepEqual(latticePaths({mode:'rectangular',spacing:40,offset:0}),latticePaths({mode:'rectangular',spacing:40,offset:50}));
  assert.notDeepEqual(latticePaths({mode:'triangular',spacing:40,offset:0}),latticePaths({mode:'triangular',spacing:40,offset:50}));
  assert.notDeepEqual(latticePaths({mode:'radial',spacing:40,offset:0}),latticePaths({mode:'radial',spacing:40,offset:50}));
});
