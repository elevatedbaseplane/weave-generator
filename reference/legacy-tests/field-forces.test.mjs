import test from "node:test";
import assert from "node:assert/strict";
import { displacePoint, deformLinePath } from "../dist/field-forces.mjs";

test("attractor and repeller move a nearby point in opposite directions", () => {
  const point = { x: 500, y: 360 };
  const base = { x: 410, y: 360, radius: 200, strength: 100, falloff: 1 };
  assert.ok(displacePoint(point, [{ ...base, type: "attractor" }]).x < point.x);
  assert.ok(displacePoint(point, [{ ...base, type: "repeller" }]).x > point.x);
});

test("disabled fields leave geometry untouched", () => {
  assert.deepEqual(
    displacePoint({ x: 500, y: 360 }, [
      {
        enabled: false,
        type: "repeller",
        x: 410,
        y: 360,
        radius: 200,
        strength: 100,
      },
    ]),
    { x: 500, y: 360 },
  );
  assert.equal(deformLinePath("M0 0L10 0", []), "M0 0L10 0");
});

test("a field bends the part of a long lattice line that passes through it", () => {
  const path = deformLinePath("M0 360L820 360", [
    {
      type: "deflector",
      x: 410,
      y: 360,
      radius: 180,
      strength: 100,
      direction: 90,
    },
  ]);
  assert.match(path, /410\.000 432\.000/);
});

test("seeded irregularity is repeatable and changes with its seed", () => {
  const options = { irregularity: 40, smoothness: 75, seed: "1042", pathIndex: "a:0" };
  const first = deformLinePath("M0 360L820 360", [], options);
  assert.equal(first, deformLinePath("M0 360L820 360", [], options));
  assert.notEqual(first, deformLinePath("M0 360L820 360", [], { ...options, seed: "1043" }));
});
