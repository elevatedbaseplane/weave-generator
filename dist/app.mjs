import {
  addWeavePattern,
  addPointSet,
  createWeaveProject,
  duplicateWeaveWithVariation,
  hydrateProject,
  serializeProject,
  validateProject,
} from "./weave-model.mjs";
import { latticePaths } from "./lattice-geometry.mjs";
import { deformLinePath } from "./field-forces.mjs";
import { defaults as familyDefaults, familySourcePath, normalizeFamilies, select as selectFamily } from "./thread-families.mjs";
import { buildInteractionMap, interactionDefaults, interactionSummary, pointsFromSvgPath } from "./interaction-grammar.mjs";

const $ = (id) => document.getElementById(id);
const STORE = "bac-weave-generator-projects-v1";
const clone = (value) => structuredClone(value);
const makeId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const defaultBoundary = () => ({
  id: "boundary-default",
  name: "DEFAULT SQUARE",
  type: "rect",
  points: [
    { x: -250, y: -250 },
    { x: 250, y: -250 },
    { x: 250, y: 250 },
    { x: -250, y: 250 },
  ],
  createdAt: new Date().toISOString(),
});

function freshProject(name = "WEAVE STUDIES") {
  const project = createWeaveProject(name);
  project.boundary = defaultBoundary();
  project.boundaries = [clone(project.boundary)];
  project.interactionSettings = interactionDefaults();
  project.interactionMap = [];
  return project;
}
function loadStore() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE));
    if (saved?.projects?.length) {
      saved.projects = saved.projects
        .map(hydrateProject)
        .map((p) => ({
          ...p,
      boundaries: p.boundaries?.length
            ? p.boundaries
            : [clone(p.boundary || defaultBoundary())],
          interactionSettings: { ...interactionDefaults(), ...(p.interactionSettings || {}) },
          interactionMap: p.interactionMap || [],
        }));
      return saved;
    }
  } catch {}
  const project = freshProject();
  return { activeProjectId: project.id, projects: [project] };
}
let store = loadStore(),
  families = familyDefaults(), activeFamily = "a",
  mode = localStorage.getItem("bac-weave-display-mode-v1") || "light",
  drawing = false,
  draft = [],
  fields = [
    {
      id: makeId("field"),
      name: "FIELD 01",
      type: "attractor",
      x: 410,
      y: 360,
      strength: 50,
      radius: 150,
      falloff: 1,
      direction: 0,
      enabled: true,
    },
  ],
  activeFieldId = null,
  draggingField = false,
  dragRenderPending = false,
  undoHistory = [],
  redoHistory = [],
  fieldEditStart = null,
  collapsedBoards = new Set();
activeFieldId = fields[0].id;
function active() {
  return (
    store.projects.find((project) => project.id === store.activeProjectId) ||
    store.projects[0]
  );
}
function save() {
  localStorage.setItem(STORE, JSON.stringify(store));
}
function summary(project = active()) {
  return `${String(project.weavePatterns.length).padStart(2, "0")} WEAVES · ${String(project.pointSets.length).padStart(2, "0")} POINT SETS · ${String(project.polylineSets.length).padStart(2, "0")} POLYLINE SETS`;
}
function renderPreview() {
  const project = active(),
    boundary = draft.length
      ? draft
      : project.boundary?.points || defaultBoundary().points,
    toCanvas = (p) => ({ x: 410 + p.x, y: 360 - p.y }),
    d = boundary.map(toCanvas),
    closed = d.length > 2 ? [...d, d[0]] : d,
    path = `M${closed.map((p) => `${p.x} ${p.y}`).join(" L")}`;
  $("boundary-clip-path").setAttribute("d", path);
  $("weave-preview").innerHTML =
    `<path d="${path}" fill="none" stroke="currentColor" stroke-width="1.5" vector-effect="non-scaling-stroke"/><g class="preview-corners">${d.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="3"/>`).join("")}</g>`;
  $("weave-preview").style.display = $("show-boundary").checked ? "" : "none";
}
function latticeState() {
  return {
    mode: $("lattice-mode").value,
    spacing: +$("lattice-spacing").value,
    angle: +$("lattice-angle").value,
    offset: +$("lattice-offset").value,
  };
}
function activeField() {
  return fields.find((field) => field.id === activeFieldId) || null;
}
function interactionSettings() {
  return (active().interactionSettings ||= interactionDefaults());
}
function setInteractionSettingsFromUi() {
  const settings = interactionSettings();
  settings.mode = $("interaction-mode").value;
  ["density", "period", "phase", "underpassGap", "bindWidth", "radius", "fieldResponse"].forEach((key) => {
    settings[key] = +($(`interaction-${key}`).value || 0);
  });
  settings.showCarrier = $("show-carrier-field").checked;
  settings.showCommands = $("show-weave-commands").checked;
  settings.showMarkers = $("show-crossing-markers").checked;
  settings.showZones = $("show-interaction-zones").checked;
  settings.showAnalysis = $("show-event-analysis").checked;
}
function renderInteractionControls() {
  const settings = interactionSettings();
  $("interaction-mode").value = settings.mode;
  ["density", "period", "phase", "underpassGap", "bindWidth", "radius", "fieldResponse"].forEach((key) => {
    $(`interaction-${key}`).value = settings[key];
    $(`interaction-${key}-value`).value = settings[key];
  });
  $("show-carrier-field").checked = settings.showCarrier !== false;
  $("show-weave-commands").checked = settings.showCommands !== false;
  $("show-crossing-markers").checked = Boolean(settings.showMarkers);
  $("show-interaction-zones").checked = Boolean(settings.showZones);
  $("show-event-analysis").checked = settings.showAnalysis !== false;
}
function renderFamilies() {
  const family = families.find((item) => item.id === activeFamily);
  ["density", "tension", "direction", "offset", "smoothness", "irregularity"].forEach((key) => {
    $(`family-${key}`).value = family[key];
    $(`family-${key}-value`).value = family[key];
  });
  $("family-visible").checked = family.visible;
  ["a", "b"].forEach((id) => $(`family-${id}`).classList.toggle("active", id === activeFamily));
}
function fieldSnapshot() {
  return { fields: clone(fields), activeFieldId, families: clone(families), activeFamily, seed: $("seed").value };
}
function beginFieldEdit() {
  if (!fieldEditStart) fieldEditStart = fieldSnapshot();
}
function finishFieldEdit() {
  if (!fieldEditStart) return;
  const after = fieldSnapshot();
  if (JSON.stringify(fieldEditStart) !== JSON.stringify(after)) {
    undoHistory.push(fieldEditStart);
    if (undoHistory.length > 80) undoHistory.shift();
    redoHistory = [];
  }
  fieldEditStart = null;
}
function restoreFieldSnapshot(snapshot, label) {
  fields = clone(snapshot.fields);
  activeFieldId = snapshot.activeFieldId;
  families = normalizeFamilies(snapshot.families || families);
  activeFamily = snapshot.activeFamily || activeFamily;
  $("seed").value = snapshot.seed ?? $("seed").value;
  render();
  $("status").textContent = label;
}
function undoFieldEdit() {
  const prior = undoHistory.pop();
  if (!prior) return;
  $("status").textContent = "NOTHING TO UNDO.";
  redoHistory.push(fieldSnapshot());
  restoreFieldSnapshot(prior, "UNDID FIELD CHANGE.");
}
function redoFieldEdit() {
  const next = redoHistory.pop();
  if (!next) return;
  $("status").textContent = "NOTHING TO REDO.";
  undoHistory.push(fieldSnapshot());
  restoreFieldSnapshot(next, "REDID FIELD CHANGE.");
}
function canvasPoint(event) {
  const point = $("canvas").createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  return point.matrixTransform($("canvas").getScreenCTM().inverse());
}
function inverseLatticeRotation(point) {
  const radians = -((latticeState().angle * Math.PI) / 180),
    dx = point.x - 410,
    dy = point.y - 360;
  return {
    x: 410 + dx * Math.cos(radians) - dy * Math.sin(radians),
    y: 360 + dx * Math.sin(radians) + dy * Math.cos(radians),
  };
}
function renderFields() {
  const list = $("field-list"),
    selected = activeField(),
    controls = [
      "field-type",
      "field-enabled",
      "field-strength",
      "field-strength-value",
      "field-radius",
      "field-radius-value",
      "field-falloff",
      "field-falloff-value",
      "field-direction",
      "field-direction-value",
      "remove-field",
    ];
  list.innerHTML = `<option value="">— NO FIELD SELECTED —</option>${fields.map((field, index) => `<option value="${field.id}">${String(index + 1).padStart(2, "0")} / ${field.type.toUpperCase()}</option>`).join("")}`;
  list.value = selected?.id || "";
  controls.forEach((id) => ($(id).disabled = !selected));
  if (!selected) return;
  for (const key of ["type", "strength", "radius", "falloff", "direction"]) {
    $(`field-${key}`).value = selected[key];
    const out = $(`field-${key}-value`);
    if (out) out.value = selected[key];
  }
  $("field-enabled").checked = selected.enabled !== false;
}
function renderLattice() {
  const lattice = latticeState(),
    paths = latticePaths(lattice),
    transformed = families.flatMap((family, familyIndex) =>
      selectFamily(paths, family, familyIndex).map((path, pathIndex) => {
        const source = familySourcePath(path, family);
        const d = family.tension >= 100 ? source : deformLinePath(source, fields.map((field) => ({ ...field, strength: field.strength * (1 - family.tension / 100) })), {
          // While a field is moving, use a responsive preview resolution.
          // The full saved geometry is regenerated on release.
          smoothness: draggingField ? Math.min(family.smoothness, 28) : family.smoothness,
          irregularity: family.irregularity,
          seed: $("seed").value,
          pathIndex: `${family.id}:${pathIndex}`,
        });
        return { d, familyId: family.id, pathIndex };
      }),
    ).filter((path) => typeof path.d === "string" && path.d.length > 1),
    transform = `rotate(${lattice.angle} 410 360)`;
  $("lattice-preview").innerHTML =
    `<g transform="${transform}" fill="none" stroke="#777" stroke-width="1.05">${paths.map((d) => `<path d="${d}"/>`).join("")}</g>`;
  $("lattice-preview").style.display = $("show-original-weave")?.checked ? "" : "none";
  // Keep an empty family result as an empty group. Rendering an invalid or
  // inherited path must never change the SVG viewport when visibility flips.
  $("thread-preview").replaceChildren();
  const threadGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  threadGroup.setAttribute("transform", transform);
  threadGroup.setAttribute("fill", "none");
  threadGroup.setAttribute("stroke", "currentColor");
  threadGroup.setAttribute("stroke-width", "1.2");
  threadGroup.setAttribute("stroke-linejoin", "round");
  threadGroup.setAttribute("stroke-linecap", "round");
  transformed.forEach((item, index) => { const path = document.createElementNS("http://www.w3.org/2000/svg", "path"); path.setAttribute("d", item.d); path.dataset.family = item.familyId; path.dataset.threadId = `${item.familyId}-${item.pathIndex}-${index}`; threadGroup.append(path); });
  $("thread-preview").append(threadGroup);
  const settings = interactionSettings();
  // During a drag, a reduced interaction map preserves direct visual feedback;
  // releasing the field immediately restores the complete precise map.
  const analysisEnabled = settings.showAnalysis !== false;
  const needsInteractionMap = settings.showCommands !== false || settings.showMarkers;
  const needsCandidates = $("show-candidates")?.checked !== false;
  if (analysisEnabled && needsInteractionMap) {
    renderInteractionMap({ preview: draggingField });
  } else {
    $("interaction-preview").replaceChildren();
    $("interaction-summary").textContent = draggingField ? "ANALYSIS PAUSED WHILE MOVING FIELD." : "COMMAND ANALYSIS HIDDEN.";
  }
  if (analysisEnabled && needsCandidates) renderCandidates();
  else $("candidate-preview").replaceChildren();
  if (analysisEnabled && settings.showZones) renderInteractionZones();
  else $("interaction-zone-preview").replaceChildren();
  $("field-preview").innerHTML =
    `<g transform="${transform}">${fields.map((field) => `<g class="field-marker ${field.id === activeFieldId ? "active" : ""}" data-field="${field.id}"><circle cx="${field.x}" cy="${field.y}" r="${field.id === activeFieldId ? field.radius : 0}"/><circle cx="${field.x}" cy="${field.y}" r="6"/><path d="M${field.x - 10} ${field.y}H${field.x + 10}M${field.x} ${field.y - 10}V${field.y + 10}"/></g>`).join("")}</g>`;
}
function renderInteractionMap({ preview = false } = {}) {
  const settings = interactionSettings();
  const paths = [...$("thread-preview").querySelectorAll("path")];
  const familyPaths = paths.map((path, index) => ({
    id: path.dataset.threadId || `path-${index}`,
    familyId: path.dataset.family || (index < paths.length / 2 ? "a" : "b"),
    points: pointsFromSvgPath(path, preview ? 28 : 12),
  }));
  const events = buildInteractionMap(familyPaths, { ...settings, maxEvents: preview ? 180 : 600 }, fields);
  active().interactionMap = events;
  $("thread-preview").style.display = settings.showCarrier === false ? "none" : "";
  const gap = settings.underpassGap / 2;
  const line = (event, direction, size) => {
    const magnitude = Math.hypot(direction.x, direction.y) || 1;
    const dx = direction.x / magnitude * size, dy = direction.y / magnitude * size;
    return `M${(event.x - dx).toFixed(2)} ${(event.y - dy).toFixed(2)}L${(event.x + dx).toFixed(2)} ${(event.y + dy).toFixed(2)}`;
  };
  const commandPaths = events.map((event) => {
    if (event.command === "OVER_A") return `<path class="interaction-cut" d="${line(event, event.localDirectionB, gap)}"/><path class="interaction-over" d="${line(event, event.localDirectionA, gap + 2)}"/>`;
    if (event.command === "OVER_B") return `<path class="interaction-cut" d="${line(event, event.localDirectionA, gap)}"/><path class="interaction-over" d="${line(event, event.localDirectionB, gap + 2)}"/>`;
    if (event.command === "BIND") { const normal = { x: event.localDirectionA.y - event.localDirectionB.y, y: event.localDirectionB.x - event.localDirectionA.x }; return `<path class="interaction-bind" d="${line(event, normal, settings.bindWidth / 2)}"/>`; }
    if (event.command === "GAP" || event.command === "RELEASE") return `<path class="interaction-cut" d="${line(event, event.localDirectionA, gap)}"/><path class="interaction-cut" d="${line(event, event.localDirectionB, gap)}"/>`;
    if (event.command === "BYPASS") return `<circle class="interaction-bypass" cx="${event.x}" cy="${event.y}" r="${Math.max(3, gap / 2)}"/>`;
    return "";
  }).join("");
  const transform = `rotate(${latticeState().angle} 410 360)`;
  $("interaction-preview").innerHTML = `<g transform="${transform}">${settings.showCommands === false ? "" : commandPaths}${settings.showMarkers ? `<g class="interaction-markers">${events.map((event) => `<circle cx="${event.x}" cy="${event.y}" r="2.2"/>`).join("")}</g>` : ""}</g>`;
  $("interaction-preview").style.display = "";
  const summary = interactionSummary(events);
  $("interaction-summary").textContent = `${preview ? "LIVE PREVIEW / " : ""}${String(summary.total).padStart(3, "0")} EVENTS / A:${String(summary.OVER_A || 0).padStart(2, "0")} B:${String(summary.OVER_B || 0).padStart(2, "0")} BIND:${String(summary.BIND || 0).padStart(2, "0")} GAP:${String((summary.GAP || 0) + (summary.RELEASE || 0)).padStart(2, "0")} BYPASS:${String(summary.BYPASS || 0).padStart(2, "0")}`;
}
function renderInteractionZones() {
  const transform = `rotate(${latticeState().angle} 410 360)`;
  $("interaction-zone-preview").innerHTML = `<g transform="${transform}">${fields.filter((field) => field.enabled !== false).map((field) => `<circle cx="${field.x}" cy="${field.y}" r="${field.radius}"/>`).join("")}</g>`;
}
function renderCandidates() {
  const layer = $("candidate-preview");
  if (!layer) return;
  const visible = $("show-candidates")?.checked !== false;
  const state = active().candidateState ||= { selectedIds: [], excludedIds: [], pinnedIds: [], spacing: 20, limit: 80 };
  $("candidate-spacing").value = $("candidate-spacing-value").value = state.spacing;
  $("candidate-limit").value = $("candidate-limit-value").value = state.limit;
  const candidates = [];
  [...$("thread-preview").querySelectorAll("path")].forEach((path, pathIndex) => {
    const length = path.getTotalLength();
    [0, .5, 1].forEach((t, sampleIndex) => { const point = path.getPointAtLength(length * t); candidates.push({ id: `sample-${pathIndex}-${sampleIndex}`, x: point.x, y: point.y, type: sampleIndex === 1 ? "SAMPLED" : "VERTEX" }); });
  });
  // Stable, compact intersection approximation: shared sample positions are
  // merged into one typed event; E2 will add filtering and selection.
  const unique = new Map();
  candidates.forEach((item) => { const key = `${Math.round(item.x / 8)}:${Math.round(item.y / 8)}`; if (!unique.has(key)) unique.set(key, item); });
  const filtered = [];
  [...unique.values()].forEach((item) => { if (state.excludedIds.includes(item.id)) return; if (filtered.length >= state.limit) return; if (filtered.every((other) => Math.hypot(other.x - item.x, other.y - item.y) >= state.spacing)) filtered.push(item); });
  layer.innerHTML = `<g>${filtered.map((item) => { const selected = state.selectedIds.includes(item.id), pinned = state.pinnedIds.includes(item.id); const show = !selected || $("show-selected")?.checked !== false; return show ? `<circle data-candidate="${item.id}" cx="${item.x.toFixed(2)}" cy="${item.y.toFixed(2)}" r="${selected ? 4.5 : 3}" fill="${pinned ? '#000' : selected ? '#777' : 'currentColor'}" stroke="${selected ? '#fff' : 'none'}" stroke-width="1.2"/>` : ""; }).join("")}</g>`;
  layer.style.display = visible ? "" : "none";
}
function previewPolylines() {
  const source = [...$("candidate-preview").querySelectorAll("[data-candidate]")].map((node) => ({ id: node.dataset.candidate, x: +node.getAttribute("cx"), y: +node.getAttribute("cy") }));
  const selected = active().candidateState?.selectedIds || [];
  const points = source.filter((point) => selected.includes(point.id));
  const max = +$("connector-distance").value || 140, loops = [];
  let rejected = 0;
  for (let index = 0; index + 2 < points.length; index += 3) { const trio = points.slice(index, index + 3); const area = Math.abs((trio[1].x-trio[0].x)*(trio[2].y-trio[0].y)-(trio[2].x-trio[0].x)*(trio[1].y-trio[0].y))/2; if (trio.every((a, i) => trio.every((b, j) => i === j || Math.hypot(a.x - b.x, a.y - b.y) <= max)) && area > 12) loops.push(trio); else rejected += 1; }
  $("polyline-preview").innerHTML = `<g fill="none" stroke="currentColor" stroke-width="1.5">${loops.map((loop) => `<path d="M${loop.map((p) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join("L")}Z"/>`).join("")}</g>`;
  $("status").textContent = loops.length ? `${loops.length} VALID CLOSED LOOPS / ${rejected} REJECTED AS DEGENERATE OR TOO DISTANT.` : "NO VALID CLOSED LOOPS / SELECT NEARBY, NON-COLLINEAR POINTS.";
}
function renderBoards() {
  const project = active();
  $("project-list").innerHTML = store.projects
    .map((p) => {
      const open = !collapsedBoards.has(p.id);
      return `<section class="board-node ${p.id === project.id ? "active" : ""}"><div class="board-node-heading"><button class="board-disclosure" data-board-toggle="${p.id}" aria-expanded="${open}">${open ? "−" : "+"}</button><button class="project-item ${p.id === project.id ? "active" : ""}" data-project="${p.id}">${p.name}<span>${String(p.weavePatterns.length).padStart(2, "0")}</span></button></div>${open ? `<div class="board-children"><div class="iteration-heading"><span>BOUNDARIES <small>${String(p.boundaries.length).padStart(2, "0")}</small></span></div>${p.boundaries.map((b, i) => `<div class="weave-row"><span>${String(i + 1).padStart(2, "0")}</span><button data-boundary="${b.id}">${b.name}</button><button class="small" data-delete-boundary="${b.id}">×</button></div>`).join("")}<div class="iteration-heading"><span>WEAVE PATTERN GRIDS <small>${String(p.weavePatterns.length).padStart(2, "0")}</small></span></div>${p.weavePatterns.length ? p.weavePatterns.map((w, i) => `<div class="weave-row ${w.id === p.activeWeaveId ? "active" : ""}"><span>${String(i + 1).padStart(2, "0")}</span><button data-weave="${w.id}">${w.name}</button><button class="small" data-delete-weave="${w.id}">×</button></div>`).join("") : '<p class="iteration-empty">NO SAVED WEAVE PATTERNS.</p>'}<div class="lineage-summary">POINT SETS ${String(p.pointSets.length).padStart(2, "0")}<br>POLYLINE SETS ${String(p.polylineSets.length).padStart(2, "0")}</div></div>` : ""}</section>`;
    })
    .join("");
}
function render() {
  const project = active(),
    pts = project.boundary?.points || defaultBoundary().points,
    b = {
      width: Math.round(
        Math.max(...pts.map((p) => p.x)) - Math.min(...pts.map((p) => p.x)),
      ),
      height: Math.round(
        Math.max(...pts.map((p) => p.y)) - Math.min(...pts.map((p) => p.y)),
      ),
    };
  $("project-label").textContent = project.name;
  $("project-name").value = project.name;
  $("boundary-name").value = project.boundary?.name || "UNSAVED BOUNDARY";
  $("boundary-kind").textContent = drawing
    ? "DRAWING"
    : project.boundary?.type?.toUpperCase() || "DEFAULT";
  $("boundary-size").textContent = `${b.width} × ${b.height}`;
  $("object-summary").textContent = summary(project);
  $("lineage-status").textContent =
    `WEAVE → POINTS → POLYLINES / ${validateProject(project).valid ? "LINEAGE VALID" : "LINEAGE ERROR"}`;
  renderBoards();
  renderFields();
  renderFamilies();
  renderInteractionControls();
  renderLattice();
  renderPreview();
}
function setMode(next) {
  mode = ["light", "dark", "neo"].includes(next) ? next : "light";
  document.body.classList.toggle("mode-dark", mode === "dark");
  document.body.classList.toggle("mode-neo", mode === "neo");
  document
    .querySelectorAll(".mode-tab")
    .forEach((button) =>
      button.classList.toggle("active", button.dataset.mode === mode),
    );
  localStorage.setItem("bac-weave-display-mode-v1", mode);
}
function saveBoundary() {
  const project = active(),
    points =
      draft.length >= 3
        ? draft
        : project.boundary?.points || defaultBoundary().points;
  project.boundary = {
    ...defaultBoundary(),
    id: makeId("boundary"),
    name: $("boundary-name").value.trim().toUpperCase() || "UNTITLED BOUNDARY",
    type: draft.length ? "drawn" : project.boundary?.type || "rect",
    points,
  };
  (project.boundaries ??= []).push(clone(project.boundary));
  draft = [];
  drawing = false;
  project.updatedAt = new Date().toISOString();
  save();
  render();
  $("status").textContent =
    `SAVED ${project.boundary.name} IN ${project.name}.`;
}
function saveWeave() {
  const project = active(),
    name = ($("pattern-name").value || "WEAVE PATTERN").trim().toUpperCase(),
    existing = project.weavePatterns.find((item) => item.name === name),
    base = clone(project);
  if (existing)
    base.weavePatterns = base.weavePatterns.filter(
      (item) => item.id !== existing.id,
    );
  const input = {
      id: existing?.id,
      name,
      seed: $("seed").value,
      boundaryId: project.boundary?.id || null,
      lattice: { ...latticeState(), visible: true },
      threadFamilies: clone(families),
      influenceFields: clone(fields),
      interactionSettings: clone(interactionSettings()),
      interactionMap: clone(project.interactionMap || []),
      threads: [],
      provenance: {
        release: "BUILD 03",
        createdFrom: "field-forces",
        replaces: existing?.id || null,
      },
    },
    result = addWeavePattern(base, input);
  store.projects = store.projects.map((p) =>
    p.id === project.id ? result.project : p,
  );
  store.projects.find((p) => p.id === project.id).activeWeaveId = result.pattern.id;
  save();
  render();
  $("status").textContent = existing
    ? `REPLACED ${result.pattern.name}.`
    : `ADDED ${result.pattern.name}.`;
}
function savePointSet() {
  const project = active(), sourceWeaveId = project.activeWeaveId;
  if (!sourceWeaveId) { $("status").textContent = "SELECT A SAVED WEAVE BEFORE SAVING A POINT SET."; return; }
  const state = project.candidateState || {}, candidates = [...$("candidate-preview").querySelectorAll("[data-candidate]")].map((node) => ({ id: node.dataset.candidate, x: +node.getAttribute("cx"), y: +node.getAttribute("cy") }));
  const result = addPointSet(project, { name: $("point-set-name").value, sourceWeaveId, extractionSettings: { spacing: state.spacing, limit: state.limit }, candidates, selectedIds: state.selectedIds || [], excludedIds: state.excludedIds || [], pinnedIds: state.pinnedIds || [] });
  store.projects = store.projects.map((item) => item.id === project.id ? result.project : item); save(); render(); $("status").textContent = `SAVED ${result.pointSet.name} / ${candidates.length} CANDIDATES.`;
}
function duplicateWeave() {
  const project = active(),
    source = project.weavePatterns.at(-1);
  if (!source) {
    $("status").textContent =
      "SAVE A WEAVE PATTERN BEFORE CREATING A VARIATION.";
    return;
  }
  const result = duplicateWeaveWithVariation(project, source.id, {
    name: `${source.name} VARIATION`,
    seed: $("seed").value || source.seed,
  });
  store.projects = store.projects.map((p) =>
    p.id === project.id ? result.project : p,
  );
  save();
  render();
  $("status").textContent =
    `DUPLICATED ${source.name} WITH PRESERVED ANCESTRY.`;
}

$("new-project").addEventListener("click", () => {
  const name = prompt("Board name", "WEAVE STUDIES");
  if (name === null) return;
  const project = freshProject(name);
  store.projects.push(project);
  store.activeProjectId = project.id;
  save();
  render();
});
$("rename-project").addEventListener("click", () => {
  $("project-name").focus();
  $("project-name").select();
});
$("project-name").addEventListener("change", (event) => {
  active().name = event.target.value.trim().toUpperCase() || active().name;
  active().updatedAt = new Date().toISOString();
  save();
  render();
});
$("project-list").addEventListener("click", (event) => {
  const deleteWeave = event.target.closest("[data-delete-weave]");
  if (deleteWeave) { const project = active(), id = deleteWeave.dataset.deleteWeave; project.weavePatterns = project.weavePatterns.filter((item) => item.id !== id); project.pointSets = project.pointSets.filter((item) => item.sourceWeaveId !== id); if (project.activeWeaveId === id) project.activeWeaveId = null; save(); render(); return; }
  const deleteBoundary = event.target.closest("[data-delete-boundary]");
  if (deleteBoundary) { const project = active(), id = deleteBoundary.dataset.deleteBoundary; if (project.boundaries.length < 2) { $("status").textContent = "KEEP AT LEAST ONE BOUNDARY."; return; } project.boundaries = project.boundaries.filter((item) => item.id !== id); if (project.boundary?.id === id) project.boundary = clone(project.boundaries[0]); save(); render(); return; }
  const toggle = event.target.closest("[data-board-toggle]");
  if (toggle) {
    const id = toggle.dataset.boardToggle;
    collapsedBoards.has(id)
      ? collapsedBoards.delete(id)
      : collapsedBoards.add(id);
    renderBoards();
    return;
  }
  const board = event.target.closest("[data-project]");
  if (board) {
    store.activeProjectId = board.dataset.project;
    collapsedBoards.delete(board.dataset.project);
    save();
    render();
    return;
  }
  const boundary = event.target.closest("[data-boundary]");
  if (boundary) {
    active().boundary = clone(
      active().boundaries.find((b) => b.id === boundary.dataset.boundary),
    );
    save();
    render();
    return;
  }
  const weave = event.target.closest("[data-weave]");
  if (weave) {
    const item = active().weavePatterns.find(
        (w) => w.id === weave.dataset.weave,
      ),
      l = item.lattice || {};
    active().activeWeaveId = item.id;
    active().interactionSettings = { ...interactionDefaults(), ...(item.interactionSettings || {}) };
    active().interactionMap = clone(item.interactionMap || []);
    save();
    $("pattern-name").value = item.name;
    $("seed").value = item.seed;
    fields = clone(item.influenceFields?.length ? item.influenceFields : []); families = normalizeFamilies(item.threadFamilies?.length ? item.threadFamilies : familyDefaults()); activeFamily = families[0].id;
    if (!fields.length)
      fields = [
        {
          id: makeId("field"),
          name: "FIELD 01",
          type: "attractor",
          x: 410,
          y: 360,
          strength: 50,
          radius: 150,
          falloff: 1,
          direction: 0,
          enabled: true,
        },
      ];
    activeFieldId = fields[0].id;
    for (const id of ["mode", "spacing", "angle", "offset"]) {
      $(`lattice-${id}`).value =
        l[id] ?? { mode: "rectangular", spacing: 40, angle: 0, offset: 0 }[id];
      if (id !== "mode")
        $(`lattice-${id}-value`).value = $(`lattice-${id}`).value;
    }
    render();
    $("status").textContent = `RESTORED ${item.name}.`;
  }
});
$("save-boundary")?.addEventListener("click", saveBoundary);
$("save-weave")?.addEventListener("click", saveWeave);
$("save-point-set")?.addEventListener("click", savePointSet);
$("duplicate-weave")?.addEventListener("click", duplicateWeave);
$("left-add-boundary").addEventListener("click", saveBoundary);
$("left-add-weave").addEventListener("click", saveWeave);
$("left-rename").addEventListener("click", () => {
  $("project-name").focus();
  $("project-name").select();
});
$("left-duplicate").addEventListener("click", () => {
  const source = active(),
    copy = freshProject(`${source.name} COPY`);
  copy.boundary = clone(source.boundary);
  copy.boundaries = clone(source.boundaries);
  copy.weavePatterns = clone(source.weavePatterns);
  store.projects.push(copy);
  store.activeProjectId = copy.id;
  save();
  render();
});
$("left-delete").addEventListener("click", () => {
  if (store.projects.length === 1) {
    $("status").textContent = "KEEP AT LEAST ONE BOARD.";
    return;
  }
  if (!confirm(`Delete ${active().name}?`)) return;
  store.projects = store.projects.filter(
    (project) => project.id !== active().id,
  );
  store.activeProjectId = store.projects[0].id;
  save();
  render();
});
$("use-square").addEventListener("click", () => {
  const project = active(),
    square = {
      ...defaultBoundary(),
      id: makeId("boundary"),
      name: "PERFECT SQUARE",
      type: "square",
    };
  project.boundary = square;
  (project.boundaries ??= []).push(clone(square));
  draft = [];
  drawing = false;
  save();
  render();
  $("status").textContent = "SAVED PERFECT SQUARE AS ACTIVE BOUNDARY.";
});
$("import-boundary").addEventListener("click", () =>
  $("boundary-file").click(),
);
$("boundary-file").addEventListener("change", async (e) => {
  const t = await e.target.files?.[0]?.text(),
    n = new DOMParser()
      .parseFromString(t || "", "image/svg+xml")
      .querySelector("polygon,polyline"),
    v = (n?.getAttribute("points") || "").trim().split(/[ ,]+/).map(Number);
  if (v.length < 6) {
    $("status").textContent = "IMPORT A CLOSED SVG POLYGON OR POLYLINE.";
    return;
  }
  let p = v.reduce(
      (a, x, i) => (i % 2 ? (a[a.length - 1].y = x) : a.push({ x, y: 0 }), a),
      [],
    ),
    xs = p.map((q) => q.x),
    ys = p.map((q) => q.y),
    s =
      500 /
      Math.max(
        Math.max(...xs) - Math.min(...xs),
        Math.max(...ys) - Math.min(...ys),
      );
  draft = p.map((q) => ({
    x: (q.x - (Math.max(...xs) + Math.min(...xs)) / 2) * s,
    y: (q.y - (Math.max(...ys) + Math.min(...ys)) / 2) * s,
  }));
  drawing = false;
  render();
  $("status").textContent = "SVG BOUNDARY FIT TO CANVAS. CLICK SAVE BOUNDARY.";
});
$("draw-boundary").addEventListener("click", () => {
  drawing = true;
  draft = [];
  $("status").textContent =
    "DRAW MODE: CLICK THREE OR MORE POINTS ON THE CANVAS, THEN SAVE BOUNDARY.";
  render();
});
$("clear-boundary").addEventListener("click", () => {
  draft = [];
  drawing = false;
  render();
});
$("canvas").addEventListener("pointerdown", (e) => {
  const marker = e.target.closest?.("[data-field]");
  if (marker && !drawing) {
    activeFieldId = marker.dataset.field;
    beginFieldEdit();
    draggingField = true;
    $("canvas").setPointerCapture?.(e.pointerId);
    render();
  }
});
$("canvas").addEventListener("pointermove", (e) => {
  if (!draggingField) return;
  const field = activeField();
  if (!field) return;
  const point = inverseLatticeRotation(canvasPoint(e));
  field.x = Math.max(0, Math.min(820, point.x));
  field.y = Math.max(0, Math.min(720, point.y));
  if (dragRenderPending) return;
  dragRenderPending = true;
  requestAnimationFrame(() => {
    dragRenderPending = false;
    if (draggingField) renderLattice();
  });
});
$("canvas").addEventListener("pointerup", () => {
  if (draggingField) {
    finishFieldEdit();
    draggingField = false;
    dragRenderPending = false;
    renderLattice();
    renderFields();
    $("status").textContent = "FIELD UPDATED / EVENT ANALYSIS REFRESHED.";
    return;
  }
  draggingField = false;
});
$("canvas").addEventListener("click", (e) => {
  if (drawing) {
    const point = canvasPoint(e),
      x = point.x - 410,
      y = 360 - point.y;
    draft.push({ x, y });
    renderPreview();
    $("status").textContent =
      `DRAW MODE: ${draft.length} POINTS. ADD MORE OR SAVE BOUNDARY.`;
    return;
  }
  if (!e.target.closest?.("[data-field]") && activeFieldId) {
    activeFieldId = null;
    render();
    $("status").textContent = "FIELD DESELECTED.";
  }
});
$("show-boundary").addEventListener("change", renderPreview);
$("show-grid").addEventListener("change", () => {
  $("grid-layer").style.display = $("show-grid").checked ? "" : "none";
  $("frame-layer").style.display = $("show-grid").checked ? "" : "none";
});
$("show-candidates")?.addEventListener("change", renderLattice);
$("preview-polylines")?.addEventListener("click", previewPolylines);
$("show-original-weave")?.addEventListener("change", () => { renderLattice(); });
$("interaction-mode")?.addEventListener("change", () => { setInteractionSettingsFromUi(); save(); renderLattice(); });
["density", "period", "phase", "underpassGap", "bindWidth", "radius", "fieldResponse"].forEach((key) => {
  const range = $(`interaction-${key}`), number = $(`interaction-${key}-value`);
  const apply = (value) => {
    const next = Math.max(+range.min, Math.min(+range.max, Number(value) || 0));
    range.value = next; number.value = next;
    setInteractionSettingsFromUi(); save(); renderLattice();
  };
  range?.addEventListener("input", () => apply(range.value));
  number?.addEventListener("change", () => apply(number.value));
});
["show-carrier-field", "show-weave-commands", "show-crossing-markers", "show-interaction-zones", "show-event-analysis"].forEach((id) => {
  $(id)?.addEventListener("change", () => { setInteractionSettingsFromUi(); save(); renderLattice(); });
});
$("canvas")?.addEventListener("click", (event) => { if (event.target.closest("[data-candidate], .field-marker")) return; const state = active().candidateState; if (state?.selectedIds?.length) { state.selectedIds = []; save(); renderCandidates(); } });
document.querySelectorAll("#control-rail details").forEach((section) => { section.open = false; });
$("show-selected")?.addEventListener("change", renderCandidates);
[["candidate-spacing", "candidate-spacing-value", "spacing"], ["candidate-limit", "candidate-limit-value", "limit"]].forEach(([rangeId, inputId, key]) => {
  const apply = (value) => { const range = $(rangeId); const next = Math.max(+range.min, Math.min(+range.max, Number(value) || 0)); active().candidateState ||= { selectedIds: [], excludedIds: [], pinnedIds: [], spacing: 20, limit: 80 }; active().candidateState[key] = next; $(rangeId).value = $(inputId).value = next; save(); renderCandidates(); };
  $(rangeId).addEventListener("input", () => apply($(rangeId).value)); $(inputId).addEventListener("change", () => apply($(inputId).value));
});
$("candidate-preview")?.addEventListener("click", (event) => { const id = event.target.dataset.candidate; if (!id) return; const state = active().candidateState ||= { selectedIds: [], excludedIds: [], pinnedIds: [], spacing: 20, limit: 80 }; const toggle = (list) => list.includes(id) ? list.filter((item) => item !== id) : [...list, id]; if (event.altKey) state.excludedIds = toggle(state.excludedIds); else if (event.shiftKey) state.pinnedIds = toggle(state.pinnedIds); else state.selectedIds = toggle(state.selectedIds); save(); renderCandidates(); });
$("select-all-candidates")?.addEventListener("click", () => { const state = active().candidateState ||= { selectedIds: [], excludedIds: [], pinnedIds: [], spacing: 20, limit: 80 }; state.selectedIds = [...$("candidate-preview").querySelectorAll("[data-candidate]")].map((node) => node.dataset.candidate); save(); renderCandidates(); });
$("deselect-all-candidates")?.addEventListener("click", () => { active().candidateState ||= { selectedIds: [], excludedIds: [], pinnedIds: [], spacing: 20, limit: 80 }; active().candidateState.selectedIds = []; save(); renderCandidates(); });
for (const id of [
  "lattice-mode",
  "lattice-spacing",
  "lattice-angle",
  "lattice-offset",
])
  $(id).addEventListener("input", () => {
    if (id !== "lattice-mode") $(`${id}-value`).value = $(id).value;
    renderLattice();
  });
for (const id of [
  "lattice-spacing-value",
  "lattice-angle-value",
  "lattice-offset-value",
])
  $(id).addEventListener("change", (e) => {
    const range = $(e.target.id.replace("-value", ""));
    const value = Math.max(
      +range.min,
      Math.min(+range.max, +e.target.value || 0),
    );
    range.value = value;
    e.target.value = value;
    renderLattice();
  });
$("field-list").addEventListener("change", (e) => {
  activeFieldId = e.target.value || null;
  render();
});
$("add-field").addEventListener("click", () => {
  beginFieldEdit();
  const n = fields.length + 1;
  const field = {
    id: makeId("field"),
    name: `FIELD ${String(n).padStart(2, "0")}`,
    type: "attractor",
    x: 410,
    y: 360,
    strength: 50,
    radius: 150,
    falloff: 1,
    direction: 0,
    enabled: true,
  };
  fields.push(field);
  activeFieldId = field.id;
  finishFieldEdit();
  render();
});
$("remove-field").addEventListener("click", () => {
  if (!activeField()) return;
  if (fields.length === 1) {
    $("status").textContent =
      "KEEP AT LEAST ONE FIELD; DISABLE IT TO SHOW THE BASE LATTICE.";
    return;
  }
  beginFieldEdit();
  fields = fields.filter((field) => field.id !== activeFieldId);
  activeFieldId = fields[0].id;
  finishFieldEdit();
  render();
});
for (const key of ["type", "strength", "radius", "falloff", "direction"]) {
  $(`field-${key}`).addEventListener("input", (e) => {
    const field = activeField();
    if (!field) return;
    beginFieldEdit();
    field[key] = key === "type" ? e.target.value : +e.target.value;
    const out = $(`field-${key}-value`);
    if (out) out.value = field[key];
    renderLattice();
  });
  $(`field-${key}`).addEventListener("change", finishFieldEdit);
  const out = $(`field-${key}-value`);
  if (out)
    out.addEventListener("change", (e) => {
      const range = $(`field-${key}`),
        field = activeField();
      if (!field) return;
      beginFieldEdit();
      const value = Math.max(
        +range.min,
        Math.min(+range.max, +e.target.value || 0),
      );
      range.value = value;
      e.target.value = value;
      field[key] = value;
      renderLattice();
      finishFieldEdit();
    });
}
$("field-enabled").addEventListener("change", (e) => {
  const field = activeField();
  if (!field) return;
  beginFieldEdit();
  field.enabled = e.target.checked;
  renderLattice();
  finishFieldEdit();
});
document.addEventListener("keydown", (event) => {
  if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "z")
    return;
  event.preventDefault();
  if (event.shiftKey) redoFieldEdit();
  else undoFieldEdit();
});
["a", "b"].forEach((id) => $("family-" + id).addEventListener("click", () => { activeFamily = id; renderFamilies(); }));
$("family-visible").addEventListener("change", (event) => { beginFieldEdit(); families.find((family) => family.id === activeFamily).visible = event.target.checked; renderLattice(); finishFieldEdit(); });
["density", "tension", "direction", "offset", "smoothness", "irregularity"].forEach((key) => {
  const range = $(`family-${key}`), number = $(`family-${key}-value`);
  const apply = (value) => {
    const next = Math.max(+range.min, Math.min(+range.max, Number(value) || 0));
    beginFieldEdit();
    families.find((family) => family.id === activeFamily)[key] = next;
    range.value = next; number.value = next;
    renderLattice();
  };
  range.addEventListener("input", () => apply(range.value));
  range.addEventListener("change", finishFieldEdit);
  number.addEventListener("change", () => { apply(number.value); finishFieldEdit(); });
});
$("seed").addEventListener("change", () => { beginFieldEdit(); $("seed").value = $("seed").value.trim() || "1042"; renderLattice(); finishFieldEdit(); });
$("regenerate-variation").addEventListener("click", () => {
  beginFieldEdit();
  const current = $("seed").value.trim() || "1042";
  const numeric = Number(current);
  $("seed").value = Number.isFinite(numeric) ? String((numeric * 1664525 + 1013904223) >>> 0) : `${current}-VAR`;
  renderLattice(); finishFieldEdit();
  $("status").textContent = "REGENERATED DETERMINISTIC VARIATION.";
});
document
  .querySelectorAll(".mode-tab")
  .forEach((button) =>
    button.addEventListener("click", () => setMode(button.dataset.mode)),
  );
$("toggle-projects").addEventListener("click", () => {
  const hidden = $("app-shell").classList.toggle("projects-hidden");
  $("toggle-projects").textContent = hidden ? "BOARDS +" : "BOARDS −";
});
$("toggle-controls").addEventListener("click", () => {
  const hidden = $("app-shell").classList.toggle("controls-hidden");
  $("toggle-controls").textContent = hidden ? "CONTROLS +" : "CONTROLS −";
});
setMode(mode);
render();
// A board remembers the saved weave the user was working from. Restore it only
// after the board list exists, using the same path as an explicit selection.
const restoredWeave = active().activeWeaveId;
if (restoredWeave && active().weavePatterns.some((item) => item.id === restoredWeave)) {
  document.querySelector(`[data-weave="${restoredWeave}"]`)?.click();
}
window.weaveState = {
  get project() {
    return clone(active());
  },
  serialize: () => serializeProject(active()),
};
