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

export function deformLinePath(path, fields = []) {
  if (!fields.some((field) => field.enabled !== false)) return path;
  const numbers = (path.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
  if (numbers.length !== 4) return path;
  const [x1, y1, x2, y2] = numbers;
  // The original endpoints live far beyond the work area. Sampling the full
  // line lets a force affect the portion that actually passes through it.
  const segments = 28;
  const points = Array.from({ length: segments + 1 }, (_, index) => {
    const t = index / segments;
    return displacePoint(
      { x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t },
      fields,
    );
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
