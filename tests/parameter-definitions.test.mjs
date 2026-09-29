import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parameterDefinition, validateParameterDefinition, applyParameterControl, BOUND_PARAMETER_IDS} from '../dist/parameter-definitions.mjs';

const html = fs.readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const app = fs.readFileSync(new URL('../dist/app.mjs', import.meta.url), 'utf8');

function control(id, labelText) {
 const span = {textContent: labelText};
 const label = {textContent: labelText, querySelector: selector => selector === 'span' ? span : null};
 const range = {id: `${id}-range`, min: '', max: '', step: '', dataset: {}, closest: () => label};
 const direct = {id, dataset: {}};
 const nodes = {[`${id}-range`]: range, [id]: direct};
 return {doc: {getElementById: key => nodes[key] || null, querySelector: selector => selector === `label[for="${id}"]` ? label : null}, range, span, label, direct};
}

test('generator controls and the parameter registry share stable ids', () => {
 assert.match(app, /applyGeneratorParameterControls\(document\)/);
 for (const id of ['family-spacing', 'family-angle', 'family-offset', 'family-density', 'variation-family', 'variation-seed']) {
  const definition = parameterDefinition(id);
  assert.equal(definition.id, id);
  assert.ok(BOUND_PARAMETER_IDS.includes(id));
  assert.match(html, new RegExp(`id="${id}-range"`));
  const fake = control(id, 'OLD');
  const applied = applyParameterControl(fake.doc, id);
  assert.equal(applied.id, id);
  assert.equal(fake.range.dataset.parameterId, id);
  assert.equal(fake.range.min, String(definition.min));
  assert.equal(fake.range.max, String(definition.max));
  assert.equal(fake.range.dataset.parameterDefault, String(definition.default));
  assert.equal(fake.span.textContent, definition.label);
 }
 const enabled = parameterDefinition('attractor-enabled');
 assert.equal(enabled.type, 'boolean');
 assert.equal(enabled.default, true);
 assert.match(html, /id="attractor-enabled"/);
 const kind = parameterDefinition('influence-type');
 assert.equal(kind.type, 'enum');
 assert.deepEqual(kind.options, ['attractor', 'repeller', 'deflector']);
 assert.match(html, /id="influence-type"/);
 const select = control('influence-type', 'ACTIVE INFLUENCE TYPE');
 select.doc.getElementById = key => key === 'influence-type' ? select.direct : null;
 applyParameterControl(select.doc, 'influence-type');
 assert.equal(select.direct.dataset.parameterId, 'influence-type');
 assert.equal(select.label.textContent, kind.label);
});

test('parameter definitions reject an unknown type and a default outside the range', () => {
 assert.throws(() => validateParameterDefinition({id: 'bad', label: 'BAD', type: 'text', default: 1}), /Invalid type/);
 assert.throws(() => validateParameterDefinition({id: 'wide', label: 'WIDE', type: 'number', min: 0, max: 1, default: 2}), /Invalid default/);
 assert.throws(() => parameterDefinition('not-a-parameter'), /Unknown generator parameter/);
});
