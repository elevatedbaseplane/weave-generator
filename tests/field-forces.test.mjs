import test from 'node:test';
import assert from 'node:assert/strict';
import {displacePoint, deformLinePath} from '../dist/field-forces.mjs';

test('attractor and repeller move a nearby point in opposite directions', () => {
  const point = {x: 500, y: 360};
  const base = {x:410, y:360, radius:200, strength:100, falloff:1};
  assert.ok(displacePoint(point, [{...base,type:'attractor'}]).x < point.x);
  assert.ok(displacePoint(point, [{...base,type:'repeller'}]).x > point.x);
});

test('disabled fields leave geometry untouched', () => {
  assert.deepEqual(displacePoint({x:500,y:360}, [{enabled:false,type:'repeller',x:410,y:360,radius:200,strength:100}]), {x:500,y:360});
  assert.equal(deformLinePath('M0 0L10 0', []), 'M0.000 0.000L10.000 0.000');
});
