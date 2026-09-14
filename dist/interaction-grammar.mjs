// Derived, deterministic weave interaction map. Source carrier paths remain untouched.
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const cross = (a, b) => a.x * b.y - a.y * b.x;
const subtract = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
const CELL_SIZE = 32;
const MAX_EVENTS = 600;

export const interactionDefaults = () => ({
  mode: "alternating",
  density: 100,
  period: 2,
  phase: 0,
  underpassGap: 14,
  bindWidth: 16,
  radius: 12,
  fieldResponse: 0,
  showCarrier: true,
  showCommands: true,
  showMarkers: false,
  showZones: false,
  showAnalysis: true,
  liveAnalysis: false,
});

function segmentIntersection(a, b, c, d) {
  const r = subtract(b, a), s = subtract(d, c);
  const denominator = cross(r, s);
  if (Math.abs(denominator) < 0.00001) return null;
  const ca = subtract(c, a);
  const t = cross(ca, s) / denominator, u = cross(ca, r) / denominator;
  if (t <= 0.001 || t >= 0.999 || u <= 0.001 || u >= 0.999) return null;
  return { x: a.x + t * r.x, y: a.y + t * r.y, t, u, aDirection: r, bDirection: s };
}

export function pointsFromSvgPath(path, step = 12) {
  const total = path.getTotalLength();
  // A display path can be extremely long. The interaction map needs a stable
  // approximation, not every renderer sample, so it is deliberately bounded.
  const count = clamp(Math.ceil(total / step), 2, 80);
  return Array.from({ length: count + 1 }, (_, index) => {
    const point = path.getPointAtLength((total * index) / count);
    return { x: point.x, y: point.y };
  });
}

function commandFor(eventIndex, event, settings, fields = []) {
  const periodIndex = (eventIndex + settings.phase) % Math.max(1, settings.period);
  let command;
  if (settings.mode === "a-dominant") command = "OVER_A";
  else if (settings.mode === "b-dominant") command = "OVER_B";
  else if (settings.mode === "directional") {
    command = Math.abs(event.aDirection.y) >= Math.abs(event.bDirection.y) ? "OVER_A" : "OVER_B";
  } else if (settings.mode === "field-responsive") {
    const influence = fields.reduce((highest, field) => {
      const distance = Math.hypot(event.x - field.x, event.y - field.y);
      const amount = field.enabled === false ? 0 : Math.max(0, 1 - distance / Math.max(1, field.radius || 1)) * (field.strength || 0);
      return amount > highest.amount ? { field, amount } : highest;
    }, { field: null, amount: 0 });
    if (influence.field?.type === "repeller") command = "GAP";
    else if (influence.field?.type === "deflector") command = "BYPASS";
    else if (influence.field?.type === "attractor" && influence.amount > 15) command = "BIND";
    else command = periodIndex % 2 ? "OVER_B" : "OVER_A";
  } else command = periodIndex % 2 ? "OVER_B" : "OVER_A";
  return { command, periodIndex };
}

export function buildInteractionMap(familyPaths, settingsInput = {}, fields = []) {
  const settings = { ...interactionDefaults(), ...settingsInput };
  const aPaths = familyPaths.filter((item) => item.familyId === "a");
  const bPaths = familyPaths.filter((item) => item.familyId === "b");
  const bSegments = [];
  const cells = new Map();
  const key = (x, y) => `${x}:${y}`;
  const register = (segment, index) => {
    const minX = Math.floor(Math.min(segment.a.x, segment.b.x) / CELL_SIZE), maxX = Math.floor(Math.max(segment.a.x, segment.b.x) / CELL_SIZE);
    const minY = Math.floor(Math.min(segment.a.y, segment.b.y) / CELL_SIZE), maxY = Math.floor(Math.max(segment.a.y, segment.b.y) / CELL_SIZE);
    for (let x = minX; x <= maxX; x += 1) for (let y = minY; y <= maxY; y += 1) {
      const cell = cells.get(key(x, y)) || [];
      cell.push(index); cells.set(key(x, y), cell);
    }
  };
  bPaths.forEach((path) => path.points.slice(0, -1).forEach((point, index) => {
    const segment = { a: point, b: path.points[index + 1], pathId: path.id };
    bSegments.push(segment); register(segment, bSegments.length - 1);
  }));
  const rawByPlace = new Map();
  aPaths.forEach((aPath) => aPath.points.slice(0, -1).forEach((point, ai) => {
    const a = point, b = aPath.points[ai + 1];
    const minX = Math.floor(Math.min(a.x, b.x) / CELL_SIZE), maxX = Math.floor(Math.max(a.x, b.x) / CELL_SIZE);
    const minY = Math.floor(Math.min(a.y, b.y) / CELL_SIZE), maxY = Math.floor(Math.max(a.y, b.y) / CELL_SIZE);
    const candidates = new Set();
    for (let x = minX; x <= maxX; x += 1) for (let y = minY; y <= maxY; y += 1) (cells.get(key(x, y)) || []).forEach((index) => candidates.add(index));
    candidates.forEach((index) => {
      const segment = bSegments[index], found = segmentIntersection(a, b, segment.a, segment.b);
      if (!found) return;
      const item = { ...found, familyAPathId: aPath.id, familyBPathId: segment.pathId };
      const place = `${Math.round(item.x / 3)}:${Math.round(item.y / 3)}`;
      if (!rawByPlace.has(place)) rawByPlace.set(place, item);
    });
  }));
  const deduped = [...rawByPlace.values()].sort((left, right) => left.x - right.x || left.y - right.y).slice(0, MAX_EVENTS);
  return deduped.map((event, index) => {
    const assigned = commandFor(index, event, settings, fields);
    const eligible = ((index * 37 + settings.phase * 17) % 100) < clamp(settings.density, 0, 100);
    return {
      id: `crossing-${event.familyAPathId}-${event.familyBPathId}-${index}`,
      type: "crossing",
      familyAPathId: event.familyAPathId,
      familyBPathId: event.familyBPathId,
      x: event.x, y: event.y,
      command: eligible ? assigned.command : "RELEASE",
      periodIndex: assigned.periodIndex,
      fieldIds: fields.filter((field) => field.enabled !== false && Math.hypot(event.x - field.x, event.y - field.y) <= field.radius).map((field) => field.id),
      localDirectionA: event.aDirection,
      localDirectionB: event.bDirection,
      interactionScore: eligible ? 100 : 0,
    };
  });
}

export function interactionSummary(events) {
  return events.reduce((summary, event) => {
    summary[event.command] = (summary[event.command] || 0) + 1;
    return summary;
  }, { total: events.length });
}
