# W2 crossing-control repair

## Version and scope

Build `WF-W2-CROSSING-CONTROLS-20260918` implements only the approved Build 1 repair. It does not begin automated crossing modes, the family relationship matrix, W3 presets, connections, force analysis, points, polylines, or publication.

## Typed appearance controls

Paired number inputs now attach their validated number to both synthetic slider events. Thread Width, Outline Line Weight, and Visual Hierarchy consume that captured number instead of rereading a range element that a synchronous preview or save redraw may already have restored from committed state. The range is restored to the captured value before the change event as an additional safeguard. Slider gestures continue through their existing handlers. Bounds, increments, strict rejection, automatic saving, immutable revisions, and presentation-only geometry remain unchanged.

## Selected crossing edits

A selected crossing is now an immutable record containing the exact derived-geometry fingerprint, exact event ID, and canonical pair of fragment-segment endpoints. A swap proceeds only if that record still matches a current nonambiguous event and the current rule resolver assigns an upper thread. It writes one explicit opposite upper-thread override. An unresolved crossing requires an explicit upper-thread choice; the Swap action is disabled and explains why. The selected crossing remains selected after saving and displays the current upper thread. Geometry changes, stale worker results, ambiguous events, and unresolved contacts cannot inherit the edit.

## Verification

Thirty affected automated tests pass across numeric validation, appearance persistence, immutable storage reuse, family architecture, crossing rules, crossing worker lifecycle, and continuous occlusion. Static entrypoint and reference checks pass; changed JavaScript modules pass syntax checks. Existing tests prove unchanged certified geometry fingerprints and zero new geometry payloads for appearance/rule edits.

Managed-browser verification used an existing 81-crossing saved square fixture. Typed Thread Width `1` and Outline Line Weight `0.5` each remained visible after automatic save. Selecting `A / LINE 4` with `B / LINE 3` reported B upper; Swap changed it to A upper, retained selection, and recorded exactly one local override. Undo restored the rule assignment and zero overrides, then restored outline weight `1` and width `6`, leaving the fixture as found. Worker samples during this focused check were `3.6–13.9 ms`; no broad performance certification was run or claimed.

## Visual review

1. Open Thread Appearance, choose one family, type `1` in Thread Width, and press Enter. The value and drawing remain at `1` after the saved status appears.
2. Select Outline, type a valid Outline Line Weight such as `0.5`, and press Enter. It remains saved; invalid or off-step values are rejected without changing the drawing.
3. Open Over / Under and enable Show Clickable Crossings. Click an assigned marker. The panel names both threads and the current upper thread.
4. Choose Swap Selected Crossing. The visual overlap reverses, the selection remains visible, and the local-override count increases by one. Undo restores the original overlap.
5. Click an unresolved crossing if one exists. Swap is unavailable until an upper thread is explicitly chosen; no arbitrary assignment is invented.

Build 1 is locally complete. The next approved plan item is Build 2: named automated crossing rules and deterministic seeded structured variation. It has not begun.
