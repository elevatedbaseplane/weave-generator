import assert from "node:assert/strict";
import { buildInteractionMap, interactionDefaults } from "../dist/interaction-grammar.mjs";

const paths = [
  { id: "a-0", familyId: "a", points: [{ x: 0, y: 10 }, { x: 20, y: 10 }] },
  { id: "b-0", familyId: "b", points: [{ x: 10, y: 0 }, { x: 10, y: 20 }] },
];

const alternating = buildInteractionMap(paths, interactionDefaults());
assert.equal(alternating.length, 1);
assert.equal(alternating[0].type, "crossing");
assert.equal(alternating[0].command, "OVER_A");
assert.equal(alternating[0].familyAPathId, "a-0");
assert.equal(alternating[0].familyBPathId, "b-0");

const fieldResponsive = buildInteractionMap(paths, { ...interactionDefaults(), mode: "field-responsive" }, [{ id: "repel", type: "repeller", x: 10, y: 10, radius: 30, strength: 80, enabled: true }]);
assert.equal(fieldResponsive[0].command, "GAP");
assert.deepEqual(fieldResponsive[0].fieldIds, ["repel"]);

console.log("interaction grammar tests passed");
