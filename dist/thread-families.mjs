export const defaults = () => [
  { id: "a", visible: true, density: 100, tension: 40, direction: 0, offset: 0, smoothness: 100, irregularity: 0 },
  { id: "b", visible: true, density: 100, tension: 40, direction: 0, offset: 0, smoothness: 100, irregularity: 0 },
];

export function normalizeFamily(family, fallback) {
  return {
    ...fallback,
    ...family,
    density: Math.max(1, Math.min(100, Number(family?.density ?? fallback.density))),
    tension: Math.max(0, Math.min(100, Number(family?.tension ?? fallback.tension))),
    direction: Math.max(-180, Math.min(180, Number(family?.direction ?? fallback.direction))),
    offset: Math.max(-100, Math.min(100, Number(family?.offset ?? fallback.offset))),
    smoothness: Math.max(0, Math.min(100, Number(family?.smoothness ?? fallback.smoothness))),
    irregularity: Math.max(0, Math.min(100, Number(family?.irregularity ?? fallback.irregularity))),
    visible: family?.visible !== false,
  };
}

export function normalizeFamilies(families = []) {
  const fallbacks = defaults();
  return fallbacks.map((fallback) => normalizeFamily(families.find((family) => family.id === fallback.id), fallback));
}

export function select(paths, family, index) {
  if (!family.visible) return [];
  const members = paths.filter((_, pathIndex) => pathIndex % 2 === index);
  const step = Math.max(1, Math.ceil(100 / family.density));
  return members.filter((_, memberIndex) => memberIndex % step === 0);
}

function lineNumbers(path) {
  const values = (path.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
  return values.length === 4 ? values : null;
}

/** Rotate a selected family's straight source line, then stagger it perpendicular to itself. */
export function familySourcePath(path, family, center = { x: 410, y: 360 }) {
  const values = lineNumbers(path);
  if (!values) return path;
  const [x1, y1, x2, y2] = values;
  const radians = (Number(family.direction || 0) * Math.PI) / 180;
  const rotate = (x, y) => ({
    x: center.x + (x - center.x) * Math.cos(radians) - (y - center.y) * Math.sin(radians),
    y: center.y + (x - center.x) * Math.sin(radians) + (y - center.y) * Math.cos(radians),
  });
  let first = rotate(x1, y1), last = rotate(x2, y2);
  const dx = last.x - first.x, dy = last.y - first.y, length = Math.hypot(dx, dy) || 1;
  const stagger = Number(family.offset || 0);
  const shiftX = (-dy / length) * stagger, shiftY = (dx / length) * stagger;
  first = { x: first.x + shiftX, y: first.y + shiftY };
  last = { x: last.x + shiftX, y: last.y + shiftY };
  return `M${first.x.toFixed(3)} ${first.y.toFixed(3)}L${last.x.toFixed(3)} ${last.y.toFixed(3)}`;
}
