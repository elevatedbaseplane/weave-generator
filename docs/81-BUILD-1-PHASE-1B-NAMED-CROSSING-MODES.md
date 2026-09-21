# Build 1 Phase 1B — named crossing modes

## Version and scope

Build `WF-B1-P1B-NAMED-RULES-20260918` completes the local implementation of Build 1 Phase 1B. It preserves the accepted Phase 1A width/input and selected-crossing repair. Phase 1C family-relationship editing, Phase 1D seeded structured variation, Phase 1E precedence explanation/checkpoint, contact tension, analysis, points, polylines, and publication have not begun.

## Product behavior

The Over / Under panel now exposes five explicit crossing modes: Preset Construction, Alternating 1 Over / 1 Under, Two Over / One Under, Grouped Repeat N Over / M Under, and the preserved legacy Family Priority mode. Alternating and Two Over / One Under use fixed named sequences. Grouped Repeat exposes bounded over count, under count, and repeat phase controls. The panel shows the resulting sequence before and after saving and explains when an existing family-pair rule supersedes the global sequence.

The named controls are adapters over the existing validated `interlacing-v2` rule. They do not add a storage schema, migrate old workspaces, alter derived geometry, change crossing identities, or rewrite compact geometry payloads. Preset Construction reports an authored sequence only when a recipe exists; line patterns clearly report the deterministic alternating fallback. Manual crossing overrides remain above automatic rules.

## Verification

Thirty-three focused automated tests pass across named-mode mapping, immutability, portable JSON representation, repeat phase, rule resolution, selected crossing edits, worker lifecycle, continuous occlusion, appearance persistence, family architecture, exact geometry fingerprints, and compact-payload reuse. Changed modules pass syntax checks and the static entrypoint/reference/private-output check passes.

Managed-browser verification used the existing saved 81-crossing fixture. Alternating displayed and saved `OVER / UNDER`; Grouped Repeat defaulted to `2 / 2`, then accepted typed `3 / 1` with phase `1`; Preset Construction showed its fallback accurately. The fixture was restored to its original Two Over / One Under, phase `0` state. Reload restored that mode with 81 assigned, 0 unresolved, 0 ambiguous, and 0 local overrides. Focused worker samples were `4.2–7.9 ms`; no broad checkpoint performance certification was run or claimed.

## Review status and next batch

Phase 1B implementation is locally complete and awaiting user visual acceptance or corrections. Build 1 is not complete. After acceptance, the exact next scheduled batch is Phase 1C: a family-pair relationship editor with clear pair selection, pair-specific rule controls, effective-rule feedback, automatic save, Undo, reload, backup, and focused visual checks.

Local preview: `http://127.0.0.1:43831/?b1-p1b=20260918`
