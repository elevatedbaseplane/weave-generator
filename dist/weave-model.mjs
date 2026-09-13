// Weave Generator's durable, renderer-independent project model.
// Geometry and UI modules may consume this model, but never own it.
export const PROJECT_SCHEMA_VERSION = 1;

const clone = value => structuredClone(value);
const now = () => new Date().toISOString();
const cleanName = (value, fallback) => String(value ?? '').trim().toUpperCase() || fallback;
const makeId = (prefix, stamp = Date.now()) => `${prefix}-${stamp}-${Math.random().toString(36).slice(2, 8)}`;

export function createWeaveProject(name = 'WEAVE STUDIES', options = {}) {
  const createdAt = options.createdAt || now();
  return {
    schemaVersion: PROJECT_SCHEMA_VERSION,
    id: options.id || makeId('weave-project'),
    name: cleanName(name, 'WEAVE STUDIES'),
    createdAt,
    updatedAt: createdAt,
    coordinateSystem: {
      units: 'document-units',
      yAxis: 'up',
      origin: 'source',
      ...clone(options.coordinateSystem || {})
    },
    boundary: null,
    referenceContext: [],
    weavePatterns: [],
    pointSets: [],
    polylineSets: []
  };
}

function touch(project) { project.updatedAt = now(); return project; }
function requireId(value, label) { if (!value) throw new Error(`${label} is required.`); return value; }

export function createWeavePattern(input = {}) {
  const createdAt = input.createdAt || now();
  return {
    id: input.id || makeId('weave'),
    name: cleanName(input.name, 'WEAVE PATTERN'),
    parentWeaveId: input.parentWeaveId || null,
    createdAt,
    seed: String(input.seed ?? '1042'),
    boundaryId: input.boundaryId || null,
    lattice: clone(input.lattice || { mode: 'rectangular', spacing: 40, angle: 0, offset: 0, visible: true }),
    threadFamilies: clone(input.threadFamilies || []),
    influenceFields: clone(input.influenceFields || []),
    threads: clone(input.threads || []),
    diagnostics: clone(input.diagnostics || {}),
    locked: Boolean(input.locked),
    provenance: clone(input.provenance || {})
  };
}

export function createPointSet(input = {}) {
  requireId(input.sourceWeaveId, 'A source weave ID');
  const createdAt = input.createdAt || now();
  return {
    id: input.id || makeId('point-set'),
    name: cleanName(input.name, 'POINT SET'),
    sourceWeaveId: input.sourceWeaveId,
    createdAt,
    extractionSettings: clone(input.extractionSettings || {}),
    candidates: clone(input.candidates || []),
    selectedIds: [...(input.selectedIds || [])],
    excludedIds: [...(input.excludedIds || [])],
    pinnedIds: [...(input.pinnedIds || [])]
  };
}

export function createPolylineSet(input = {}) {
  requireId(input.sourcePointSetId, 'A source point-set ID');
  const createdAt = input.createdAt || now();
  return {
    id: input.id || makeId('polyline-set'),
    name: cleanName(input.name, 'POLYLINE SET'),
    sourcePointSetId: input.sourcePointSetId,
    createdAt,
    connectionSettings: clone(input.connectionSettings || {}),
    candidates: clone(input.candidates || []),
    keptIds: [...(input.keptIds || [])],
    deletedIds: [...(input.deletedIds || [])],
    lockedIds: [...(input.lockedIds || [])]
  };
}

export function addWeavePattern(project, input = {}) {
  const draft = clone(project);
  const pattern = createWeavePattern(input);
  if (pattern.parentWeaveId && !draft.weavePatterns.some(item => item.id === pattern.parentWeaveId)) throw new Error('Parent weave was not found.');
  draft.weavePatterns.push(pattern);
  return { project: touch(draft), pattern };
}

export function duplicateWeaveWithVariation(project, weaveId, variation = {}) {
  const source = project.weavePatterns.find(item => item.id === weaveId);
  if (!source) throw new Error('Weave pattern was not found.');
  return addWeavePattern(project, {
    ...clone(source),
    id: variation.id,
    name: variation.name || `${source.name} VARIATION`,
    parentWeaveId: source.id,
    createdAt: undefined,
    seed: String(variation.seed ?? source.seed),
    locked: false,
    provenance: { ...source.provenance, variationOf: source.id, variation: clone(variation) }
  });
}

export function addPointSet(project, input = {}) {
  const draft = clone(project);
  const pointSet = createPointSet(input);
  if (!draft.weavePatterns.some(item => item.id === pointSet.sourceWeaveId)) throw new Error('Point set must reference a saved weave pattern.');
  draft.pointSets.push(pointSet);
  return { project: touch(draft), pointSet };
}

export function addPolylineSet(project, input = {}) {
  const draft = clone(project);
  const polylineSet = createPolylineSet(input);
  if (!draft.pointSets.some(item => item.id === polylineSet.sourcePointSetId)) throw new Error('Polyline set must reference a saved point set.');
  draft.polylineSets.push(polylineSet);
  return { project: touch(draft), polylineSet };
}

export function tracePolylineLineage(project, polylineSetId) {
  const polylineSet = project.polylineSets.find(item => item.id === polylineSetId);
  if (!polylineSet) throw new Error('Polyline set was not found.');
  const pointSet = project.pointSets.find(item => item.id === polylineSet.sourcePointSetId);
  if (!pointSet) throw new Error('Polyline set has an invalid source point set.');
  const weave = project.weavePatterns.find(item => item.id === pointSet.sourceWeaveId);
  if (!weave) throw new Error('Point set has an invalid source weave.');
  return { weave, pointSet, polylineSet };
}

export function validateProject(project) {
  if (!project || project.schemaVersion !== PROJECT_SCHEMA_VERSION) return { valid: false, errors: ['Unsupported project schema.'] };
  const errors = [];
  const checkUnique = (items, label) => {
    const ids = new Set();
    for (const item of items) { if (!item.id || ids.has(item.id)) errors.push(`Duplicate or missing ${label} ID.`); ids.add(item.id); }
  };
  checkUnique(project.weavePatterns, 'weave'); checkUnique(project.pointSets, 'point-set'); checkUnique(project.polylineSets, 'polyline-set');
  for (const set of project.pointSets) if (!project.weavePatterns.some(item => item.id === set.sourceWeaveId)) errors.push(`Point set ${set.id} has no source weave.`);
  for (const set of project.polylineSets) if (!project.pointSets.some(item => item.id === set.sourcePointSetId)) errors.push(`Polyline set ${set.id} has no source point set.`);
  return { valid: errors.length === 0, errors };
}

export function serializeProject(project) {
  const checked = validateProject(project);
  if (!checked.valid) throw new Error(checked.errors.join(' '));
  return JSON.stringify(project, null, 2);
}

export function hydrateProject(serialized) {
  const project = typeof serialized === 'string' ? JSON.parse(serialized) : clone(serialized);
  const checked = validateProject(project);
  if (!checked.valid) throw new Error(checked.errors.join(' '));
  return project;
}
