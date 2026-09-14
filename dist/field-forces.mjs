const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

/**
 * Deterministically offsets a canvas point by enabled influence fields.
 * Strength is deliberately bounded so threads remain legible and never fold
 * into a physical-textile simulation.
 */
export function displacePoint(point, fields = []) {
  return fields.filter(field => field.enabled !== false).reduce((result, field) => {
    const dx = result.x - Number(field.x || 410);
    const dy = result.y - Number(field.y || 360);
    const distance = Math.hypot(dx, dy) || 0.001;
    const radius = Math.max(1, Number(field.radius || 150));
    if (distance >= radius) return result;
    const falloff = Math.max(.25, Number(field.falloff || 1));
    const influence = Math.pow(1 - distance / radius, falloff) * (Number(field.strength || 50) / 100) * 38;
    let vx = dx / distance, vy = dy / distance;
    if (field.type === 'attractor') { vx *= -1; vy *= -1; }
    if (field.type === 'deflector') {
      const direction = (Number(field.direction || 0) * Math.PI) / 180;
      vx = Math.cos(direction); vy = Math.sin(direction);
    }
    return { x: result.x + vx * influence, y: result.y + vy * influence };
  }, { ...point });
}

export function deformLinePath(path, fields = []) {
  const numbers = (path.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
  if (numbers.length !== 4) return path;
  const start = displacePoint({ x: numbers[0], y: numbers[1] }, fields);
  const end = displacePoint({ x: numbers[2], y: numbers[3] }, fields);
  return `M${start.x.toFixed(3)} ${start.y.toFixed(3)}L${end.x.toFixed(3)} ${end.y.toFixed(3)}`;
}
