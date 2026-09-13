import assert from 'node:assert/strict';
import test from 'node:test';
import {addPointSet, addPolylineSet, addWeavePattern, createWeaveProject, duplicateWeaveWithVariation, hydrateProject, serializeProject, tracePolylineLineage, validateProject} from '../dist/weave-model.mjs';

test('weave states preserve immutable source lineage', () => {
  let project = createWeaveProject('studio field', {id:'project-a', createdAt:'2026-09-13T00:00:00.000Z'});
  let result = addWeavePattern(project, {id:'weave-a', name:'base weave', seed:'81'}); project = result.project;
  const variation = duplicateWeaveWithVariation(project, 'weave-a', {id:'weave-b', seed:'82'}); project = variation.project;
  assert.equal(project.weavePatterns[0].seed, '81');
  assert.equal(variation.pattern.parentWeaveId, 'weave-a');
  result = addPointSet(project, {id:'points-a', sourceWeaveId:'weave-b', candidates:[{id:'point-1', type:'intersection', score:.9}]}); project = result.project;
  result = addPolylineSet(project, {id:'lines-a', sourcePointSetId:'points-a'}); project = result.project;
  assert.deepEqual(tracePolylineLineage(project, 'lines-a').weave.id, 'weave-b');
  assert.equal(validateProject(project).valid, true);
  assert.deepEqual(hydrateProject(serializeProject(project)), project);
});

test('weave states reject broken lineage', () => {
  const project = createWeaveProject();
  assert.throws(() => addPointSet(project, {sourceWeaveId:'missing'}), /saved weave/);
});
