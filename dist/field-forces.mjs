const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

/**
 * Deterministically offsets a canvas point by enabled influence fields.
 * Strength is deliberately bounded so threads remain legible and never fold
 * into a physical-textile simulation.
 */
export function displacePoint(point, fields = []) {
  return fields
    .filter((field) => field.enabled !== false)
    .reduce(
      (result, field) => {
        const dx = result.x - Number(field.x || 410);
        const dy = result.y - Number(field.y || 360);
        const distance = Math.hypot(dx, dy) || 0.001;
        const radius = Math.max(1, Number(field.radius || 150));
        if (distance >= radius) return result;
        const falloff = Math.max(0.25, Number(field.falloff || 1));
        const influence =
          Math.pow(1 - distance / radius, falloff) *
          (Number(field.strength || 50) / 100) *
          72;
        let vx = dx / distance,
          vy = dy / distance;
        if (field.type === "attractor") {
          vx *= -1;
          vy *= -1;
        }
        if (field.type === "deflector") {
          const direction = (Number(field.direction || 0) * Math.PI) / 180;
          vx = Math.cos(direction);
          vy = Math.sin(direction);
        }
        return { x: result.x + vx * influence, y: result.y + vy * influence };
      },
      { ...point },
    );
}

function seededUnit(seed, index) {
  let value = 2166136261;
  for (const character of `${seed}:${index}`) value = Math.imul(value ^ character.charCodeAt(0), 16777619);
  value += value << 13; value ^= value >>> 7; value += value << 3; value ^= value >>> 17; value += value << 5;
  return ((value >>> 0) / 4294967295) * 2 - 1;
}

export function deformLinePath(path, fields = [], options = {}) {
  if (!fields.some((field) => field.enabled !== false) && !Number(options.irregularity)) return path;
  const numbers = (path.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
  if (numbers.length !== 4) return path;
  const [x1, y1, x2, y2] = numbers;
  // The original endpoints live far beyond the work area. Sampling the full
  // line lets a force affect the portion that actually passes through it.
  const smoothness = clamp(Number(options.smoothness ?? 100), 0, 100);
  const segments = Math.round(8 + smoothness * 0.32);
  const irregularity = clamp(Number(options.irregularity ?? 0), 0, 100);
  const variation = (irregularity / 100) * 18;
  const points = Array.from({ length: segments + 1 }, (_, index) => {
    const t = index / segments;
    const displaced = displacePoint(
      { x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t },
      fields,
    );
    if (!variation || index === 0 || index === segments) return displaced;
    const dx = x2 - x1, dy = y2 - y1, length = Math.hypot(dx, dy) || 1;
    const envelope = Math.sin(Math.PI * t);
    const amount = seededUnit(options.seed ?? "1042", `${options.pathIndex ?? 0}:${index}`) * variation * envelope;
    return { x: displaced.x + (-dy / length) * amount, y: displaced.y + (dx / length) * amount };
  });
  if (points.length < 3)
    return `M${points.map((point) => `${point.x.toFixed(3)} ${point.y.toFixed(3)}`).join("L")}`;
  // Midpoint quadratic segments make the sampled force path continuously
  // readable instead of exposing the sampling as jagged corners.
  let result = `M${points[0].x.toFixed(3)} ${points[0].y.toFixed(3)}`;
  for (let index = 1; index < points.length - 1; index += 1) {
    const current = points[index],
      next = points[index + 1];
    result += `Q${current.x.toFixed(3)} ${current.y.toFixed(3)} ${((current.x + next.x) / 2).toFixed(3)} ${((current.y + next.y) / 2).toFixed(3)}`;
  }
  const last = points.at(-1);
  return `${result}T${last.x.toFixed(3)} ${last.y.toFixed(3)}`;
}
