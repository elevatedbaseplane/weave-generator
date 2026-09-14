// Derived, deterministic weave interaction map. Source carrier paths remain untouched.
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const length = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);
const cross = (a, b) => a.x * b.y - a.y * b.x;
const subtract = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });

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

export function pointsFromSvgPath(path, step = 8) {
  const total = path.getTotalLength();
  const count = Math.max(2, Math.ceil(total / step));
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
  const raw = [];
  aPaths.forEach((aPath) => bPaths.forEach((bPath) => {
    const aPoints = aPath.points, bPoints = bPath.points;
    for (let ai = 0; ai < aPoints.length - 1; ai += 1) for (let bi = 0; bi < bPoints.length - 1; bi += 1) {
      const found = segmentIntersection(aPoints[ai], aPoints[ai + 1], bPoints[bi], bPoints[bi + 1]);
      if (found) raw.push({ ...found, familyAPathId: aPath.id, familyBPathId: bPath.id });
    }
  }));
  const deduped = [];
  raw.sort((left, right) => left.x - right.x || left.y - right.y).forEach((item) => {
    if (!deduped.some((other) => Math.hypot(item.x - other.x, item.y - other.y) < 3)) deduped.push(item);
  });
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
