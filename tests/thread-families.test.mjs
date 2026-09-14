import test from 'node:test';
import assert from 'node:assert/strict';
import { defaults, familySourcePath, normalizeFamilies, select } from '../dist/thread-families.mjs';
test('thread families select independent paths',()=>{const paths=['a','b','c','d'];assert.deepEqual(select(paths,{visible:true,density:100},0),['a','c']);assert.deepEqual(select(paths,{visible:false,density:100},1),[]);});

test('family source direction and offset affect only its source basis', () => {
  const base = 'M0 360L820 360';
  assert.notEqual(familySourcePath(base, { direction: 30, offset: 0 }), base);
  assert.notEqual(familySourcePath(base, { direction: 0, offset: 40 }), base);
});

test('legacy family data hydrates to complete D3 defaults', () => {
  const [family] = normalizeFamilies([{ id: 'a', density: 55, tension: 20 }]);
  assert.equal(family.direction, 0);
  assert.equal(family.smoothness, 100);
  assert.equal(family.irregularity, 0);
  assert.equal(defaults().length, 2);
});
