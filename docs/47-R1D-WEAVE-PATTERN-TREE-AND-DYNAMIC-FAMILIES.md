# R1D Weave Pattern tree and dynamic families

Date: 2026-09-16  
Build: `WF-R1D-PATTERN-TREE-FIX-20260916`  
Status: locally implemented; visual acceptance pending; unpublished

## Settled product model

The saved hierarchy is now `Board → Boundary → Weave Pattern → Influenced Grid`.

- A Weave Pattern owns its embedded family collection. Families appear as editing tabs in the right rail and are not separate saved tree nodes.
- A pattern supports two through eight consecutively identified families. Each family independently stores angle, spacing, offset, and density.
- An Influenced Grid is a saved set of attractor, repeller, and deflector settings plus certified derived geometry and lineage to one immutable Weave Pattern revision.
- Global influence controls own type, enabled state, center, radius, falloff, and deflector direction. The center is manipulated only on the canvas. Family tabs own strength, tension, and deterministic variation amount.
- Boards, Boundaries, Weave Patterns, and Influenced Grids expose rename, duplicate, and delete actions. Duplicating a parent copies its saved descendants using new stable identities. Deleting a parent removes its descendants from the same saved tree.

## Compatibility and geometry

Legacy `rect-v1` A/B recipes remain readable and retain their exact perpendicular interpretation. Editing one family or adding a third promotes only the working recipe to `rect-v2`, where every family has an explicit angle. Existing weave-study-v1 through v5 records remain readable. The combined certified evaluator now derives every family present in the source pattern while retaining the existing limits, analytical clipping, interval certificates, additive influence equation, and atomic worker commit path.

The compact geometry codec keeps its original A/B representation byte-compatible. Payloads containing additional families add a bounded family dictionary; strand identities, fragment IDs, provenance, certificates, coordinates, and fingerprints round-trip exactly.

## Interface correction

- Carrier is labeled Weave Pattern.
- Weave Study is labeled Influenced Grid.
- The left rail renders the saved nesting rather than three unrelated libraries.
- Center X and Center Y inputs were removed.
- Neo uses neutral primary text, green as an accent, and distinct colors for additional families.
- The existing lower-right Display control remains synchronized with the right-rail Display section.

## Verification

Focused command:

`node --test --test-isolation=none tests/carrier.test.mjs tests/r1d.test.mjs tests/pattern-tree.test.mjs tests/storage-codec.test.mjs tests/r1b-ui.test.mjs tests/display.test.mjs tests/weave-render.test.mjs`

Result: 54/54 passed. Static entrypoint and private-output checks pass. `git diff --check` reports only existing line-ending notices. Served preview identity and required controls are present at `http://127.0.0.1:43830/?r1d-pattern-tree-fix=20260916`.

## Remaining checkpoint work

Visual acceptance remains required for the dynamic family tabs, four-family canvas output, nested tree actions, family-specific influence response, direct manipulation, saving/reload, display controls, and Neo palette. Broader R1 certification remains the next phase checkpoint after visual corrections. R2A and publication remain closed.
