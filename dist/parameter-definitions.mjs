// Shared parameter metadata for the generator and, later, the evaluation page.
// Control limits stay the limits already used by the sliders.
export const PARAMETER_TYPES = Object.freeze(['number', 'integer', 'boolean', 'enum']);

const optionalText = (spec, key) => {
 if (spec[key] === undefined) return;
 if (typeof spec[key] !== 'string' || !spec[key]) throw new Error(`Invalid ${key} for parameter ${spec.id}.`);
};

export function validateParameterDefinition(spec) {
 if (!spec || typeof spec !== 'object' || Array.isArray(spec)) throw new Error('Invalid parameter definition.');
 if (typeof spec.id !== 'string' || !spec.id || spec.id.length > 80) throw new Error('Invalid parameter id.');
 if (typeof spec.label !== 'string' || !spec.label) throw new Error(`Invalid label for parameter ${spec.id}.`);
 if (!PARAMETER_TYPES.includes(spec.type)) throw new Error(`Invalid type for parameter ${spec.id}.`);
 optionalText(spec, 'description');
 optionalText(spec, 'units');
 optionalText(spec, 'uiControlType');
 const definition = {id: spec.id, label: spec.label, type: spec.type};
 if (spec.description) definition.description = spec.description;
 if (spec.units) definition.units = spec.units;
 if (spec.uiControlType) definition.uiControlType = spec.uiControlType;
 if (spec.type === 'number' || spec.type === 'integer') {
  if (!Number.isFinite(spec.min) || !Number.isFinite(spec.max) || spec.min > spec.max) throw new Error(`Invalid range for parameter ${spec.id}.`);
  if (!Number.isFinite(spec.default) || spec.default < spec.min || spec.default > spec.max) throw new Error(`Invalid default for parameter ${spec.id}.`);
  if (spec.type === 'integer' && (!Number.isInteger(spec.min) || !Number.isInteger(spec.max) || !Number.isInteger(spec.default))) throw new Error(`Parameter ${spec.id} must use integers.`);
  if (spec.step !== undefined && (!Number.isFinite(spec.step) || spec.step <= 0)) throw new Error(`Invalid step for parameter ${spec.id}.`);
  definition.min = spec.min;
  definition.max = spec.max;
  definition.default = spec.default;
  if (spec.step !== undefined) definition.step = spec.step;
 } else if (spec.type === 'boolean') {
  if (typeof spec.default !== 'boolean') throw new Error(`Invalid default for parameter ${spec.id}.`);
  definition.default = spec.default;
 } else {
  if (!Array.isArray(spec.options) || spec.options.length < 2 || spec.options.some(option => typeof option !== 'string' || !option) || new Set(spec.options).size !== spec.options.length) throw new Error(`Invalid options for parameter ${spec.id}.`);
  if (!spec.options.includes(spec.default)) throw new Error(`Invalid default for parameter ${spec.id}.`);
  definition.options = Object.freeze([...spec.options]);
  definition.default = spec.default;
 }
 return Object.freeze(definition);
}

const definitions = Object.fromEntries([
 {id: 'family-spacing', label: 'SPACING', type: 'number', min: 1, max: 1000, step: 1, default: 50, units: 'document units', uiControlType: 'slider', description: 'Distance between strands in one family.'},
 {id: 'family-angle', label: 'ROTATION', type: 'number', min: -180, max: 180, step: 1, default: 0, units: 'degrees', uiControlType: 'slider', description: 'Direction of one family.'},
 {id: 'family-offset', label: 'OFFSET', type: 'number', min: -1000, max: 1000, step: 1, default: 0, units: 'document units', uiControlType: 'slider', description: 'Shift of one family from its origin.'},
 {id: 'family-density', label: 'DENSITY', type: 'integer', min: 1, max: 100, step: 1, default: 100, units: 'percent', uiControlType: 'slider', description: 'Share of family strands that are kept.'},
 {id: 'variation-family', label: 'ACTIVE FAMILY AMOUNT', type: 'integer', min: 0, max: 100, step: 1, default: 0, units: 'percent', uiControlType: 'slider', description: 'How far the active family spacing may vary.'},
 {id: 'variation-seed', label: 'SEED', type: 'integer', min: 0, max: 65535, step: 1, default: 1042, uiControlType: 'slider', description: 'Repeatable seed for family spacing variation.'},
 {id: 'attractor-enabled', label: 'ENABLED', type: 'boolean', default: true, uiControlType: 'checkbox', description: 'Whether the active influence affects the weave.'},
 {id: 'influence-type', label: 'ACTIVE INFLUENCE TYPE', type: 'enum', options: ['attractor', 'repeller', 'deflector'], default: 'attractor', uiControlType: 'select', description: 'Kind of the active influence.'},
 {id: 'influence-radius', label: 'RADIUS', type: 'number', min: 0.001, max: 1000000000, step: 0.001, default: 1, units: 'document units', uiControlType: 'slider', description: 'Reach of one influence.'},
 {id: 'influence-direction', label: 'DIRECTION', type: 'number', min: -180, max: 180, step: 1, default: 0, units: 'degrees', uiControlType: 'slider', description: 'Direction of a deflector.'},
 {id: 'influence-falloff', label: 'FALLOFF', type: 'integer', min: 1, max: 5, step: 1, default: 3, uiControlType: 'slider', description: 'How quickly one influence fades. This reproduces the generator function and is not a score.'},
 {id: 'influence-strength', label: 'STRENGTH', type: 'number', min: 0, max: 100, step: 1, default: 50, units: 'percent', uiControlType: 'slider', description: 'How strongly one family responds to an influence.'},
 {id: 'influence-tension', label: 'TENSION', type: 'number', min: 0, max: 100, step: 1, default: 0, units: 'percent', uiControlType: 'slider', description: 'How much one family resists an influence. This reproduces the generator function and is not a score.'},
 {id: 'influence-center-x', label: 'CENTER X', type: 'number', min: -1000000000, max: 1000000000, step: 0.001, default: 0, units: 'document units', uiControlType: 'slider', description: 'Horizontal center of one influence.'},
 {id: 'influence-center-y', label: 'CENTER Y', type: 'number', min: -1000000000, max: 1000000000, step: 0.001, default: 0, units: 'document units', uiControlType: 'slider', description: 'Vertical center of one influence.'}
].map(spec => [spec.id, validateParameterDefinition(spec)]));

export const PARAMETER_DEFINITIONS = Object.freeze(definitions);
export const BOUND_PARAMETER_IDS = Object.freeze(['family-spacing', 'family-angle', 'family-offset', 'family-density', 'variation-family', 'variation-seed', 'attractor-enabled', 'influence-type']);

export function parameterDefinition(id) {
 const definition = PARAMETER_DEFINITIONS[id];
 if (!definition) throw new Error('Unknown generator parameter.');
 return definition;
}

// Saved snapshot fields that use a registry definition. A value stored under
// its parameter id is recognized directly, so a new definition needs no custom view.
export const SAVED_PARAMETER_KEYS = Object.freeze({
 spacing: 'family-spacing',
 angleDegrees: 'family-angle',
 offset: 'family-offset',
 density: 'family-density',
 amount: 'variation-family',
 seed: 'variation-seed',
 kind: 'influence-type',
 enabled: 'attractor-enabled',
 radius: 'influence-radius',
 direction: 'influence-direction',
 falloff: 'influence-falloff',
 strength: 'influence-strength',
 tension: 'influence-tension',
 centerX: 'influence-center-x',
 centerY: 'influence-center-y'
});

export function savedParameterDefinition(key, registry = PARAMETER_DEFINITIONS) {
 if (!key || !registry) return null;
 return registry[key] || registry[SAVED_PARAMETER_KEYS[key]] || null;
}

export function presentParameter(definition, value, scope = '') {
 if (!definition || typeof definition.label !== 'string' || !PARAMETER_TYPES.includes(definition.type)) throw new Error('Invalid parameter definition.');
 const label = scope ? `${scope} ${definition.label}` : definition.label;
 const row = {label, parameterId: definition.id, type: definition.type, readOnly: true};
 if (definition.type === 'boolean') {
  row.value = value === true ? 'ON' : value === false ? 'OFF' : '';
  row.control = 'boolean';
  return row;
 }
 if (definition.type === 'enum') {
  row.value = typeof value === 'string' ? value : '';
  row.control = 'enum';
  return row;
 }
 const raw = typeof value === 'number' && Number.isFinite(value) ? value : null;
 row.raw = raw;
 row.value = raw === null ? '' : String(Number.isInteger(raw) ? raw : Math.round(raw * 1e6) / 1e6);
 if (definition.type === 'number' && raw !== null) {
  row.min = definition.min;
  row.max = definition.max;
  if (definition.step !== undefined) row.step = definition.step;
  row.control = 'slider';
 } else row.control = 'number';
 return row;
}

function controlFor(doc, id) {
 return doc.getElementById(`${id}-range`) || doc.getElementById(id);
}

export function applyParameterControl(doc, id) {
 const definition = parameterDefinition(id);
 const control = controlFor(doc, id);
 if (!control) throw new Error(`Missing generator control for ${id}.`);
 if (!control.dataset) control.dataset = {};
 control.dataset.parameterId = definition.id;
 if (definition.default !== undefined) control.dataset.parameterDefault = String(definition.default);
 if (definition.type === 'number' || definition.type === 'integer') {
  control.min = String(definition.min);
  control.max = String(definition.max);
  if (definition.step !== undefined) control.step = String(definition.step);
  const span = control.closest?.('label')?.querySelector('span');
  if (span) span.textContent = definition.label;
 }
 if (definition.type === 'enum') {
  const label = doc.querySelector?.(`label[for="${id}"]`);
  if (label) label.textContent = definition.label;
 }
 return definition;
}

export function applyGeneratorParameterControls(doc) {
 for (const id of BOUND_PARAMETER_IDS) applyParameterControl(doc, id);
}
