import {
  addWeavePattern,
  createWeaveProject,
  duplicateWeaveWithVariation,
  hydrateProject,
  serializeProject,
  validateProject,
} from "./weave-model.mjs";
import { latticePaths } from "./lattice-geometry.mjs";
import { deformLinePath } from "./field-forces.mjs";
import { defaults as familyDefaults, familySourcePath, normalizeFamilies, select as selectFamily } from "./thread-families.mjs";

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
        if (family.tension >= 100) return source;
        return deformLinePath(source, fields.map((field) => ({ ...field, strength: field.strength * (1 - family.tension / 100) })), {
          smoothness: family.smoothness,
          irregularity: family.irregularity,
          seed: $("seed").value,
          pathIndex: `${family.id}:${pathIndex}`,
        });
      }),
    ).filter((path) => typeof path === "string" && path.length > 1),
    transform = `rotate(${lattice.angle} 410 360)`;
  $("lattice-preview").innerHTML =
    `<g transform="${transform}" fill="none" stroke="#777" stroke-width="1.05">${paths.map((d) => `<path d="${d}"/>`).join("")}</g>`;
  $("lattice-preview").style.display = $("show-grid").checked ? "" : "none";
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
  transformed.forEach((d) => { const path = document.createElementNS("http://www.w3.org/2000/svg", "path"); path.setAttribute("d", d); threadGroup.append(path); });
  $("thread-preview").append(threadGroup);
  renderCandidates();
  $("field-preview").innerHTML =
    `<g transform="${transform}">${fields.map((field) => `<g class="field-marker ${field.id === activeFieldId ? "active" : ""}" data-field="${field.id}"><circle cx="${field.x}" cy="${field.y}" r="${field.radius}"/><circle cx="${field.x}" cy="${field.y}" r="6"/><path d="M${field.x - 10} ${field.y}H${field.x + 10}M${field.x} ${field.y - 10}V${field.y + 10}"/></g>`).join("")}</g>`;
}
function renderCandidates() {
  const layer = $("candidate-preview");
  if (!layer) return;
  const visible = $("show-candidates")?.checked !== false;
  const candidates = [];
  [...$("thread-preview").querySelectorAll("path")].forEach((path, pathIndex) => {
    const length = path.getTotalLength();
    [0, .5, 1].forEach((t, sampleIndex) => { const point = path.getPointAtLength(length * t); candidates.push({ id: `sample-${pathIndex}-${sampleIndex}`, x: point.x, y: point.y, type: sampleIndex === 1 ? "SAMPLED" : "VERTEX" }); });
  });
  // Stable, compact intersection approximation: shared sample positions are
  // merged into one typed event; E2 will add filtering and selection.
  const unique = new Map();
  candidates.forEach((item) => { const key = `${Math.round(item.x / 8)}:${Math.round(item.y / 8)}`; if (!unique.has(key)) unique.set(key, item); });
  layer.innerHTML = `<g fill="currentColor">${[...unique.values()].map((item) => `<circle data-candidate="${item.id}" cx="${item.x.toFixed(2)}" cy="${item.y.toFixed(2)}" r="3"/>`).join("")}</g>`;
  layer.style.display = visible ? "" : "none";
}
function renderBoards() {
  const project = active();
  $("project-list").innerHTML = store.projects
    .map((p) => {
      const open = !collapsedBoards.has(p.id);
      return `<section class="board-node ${p.id === project.id ? "active" : ""}"><div class="board-node-heading"><button class="board-disclosure" data-board-toggle="${p.id}" aria-expanded="${open}">${open ? "−" : "+"}</button><button class="project-item ${p.id === project.id ? "active" : ""}" data-project="${p.id}">${p.name}<span>${String(p.weavePatterns.length).padStart(2, "0")}</span></button></div>${open ? `<div class="board-children"><div class="iteration-heading"><span>BOUNDARIES <small>${String(p.boundaries.length).padStart(2, "0")}</small></span></div>${p.boundaries.map((b, i) => `<div class="weave-row"><span>${String(i + 1).padStart(2, "0")}</span><button data-boundary="${b.id}">${b.name}</button><small>${b.type.toUpperCase()} · ${b.points.length} POINTS</small></div>`).join("")}<div class="iteration-heading"><span>WEAVE PATTERN GRIDS <small>${String(p.weavePatterns.length).padStart(2, "0")}</small></span></div>${p.weavePatterns.length ? p.weavePatterns.map((w, i) => `<div class="weave-row ${w.id === p.activeWeaveId ? "active" : ""}"><span>${String(i + 1).padStart(2, "0")}</span><button data-weave="${w.id}">${w.name}</button><small>SEED ${w.seed}</small></div>`).join("") : '<p class="iteration-empty">NO SAVED WEAVE PATTERNS.</p>'}<div class="lineage-summary">POINT SETS ${String(p.pointSets.length).padStart(2, "0")}<br>POLYLINE SETS ${String(p.polylineSets.length).padStart(2, "0")}</div></div>` : ""}</section>`;
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
  save();
  render();
  $("status").textContent = existing
    ? `REPLACED ${result.pattern.name}.`
    : `ADDED ${result.pattern.name}.`;
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
  renderLattice();
  renderFields();
});
$("canvas").addEventListener("pointerup", () => {
  if (draggingField) finishFieldEdit();
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
  $("lattice-preview").style.display = $("show-grid").checked ? "" : "none";
});
$("show-candidates")?.addEventListener("change", renderCandidates);
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
