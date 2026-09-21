# Stability Foundation Phase 1 — canonical source

Date: 2026-09-21. Build: `WF-STABILITY-PHASE1-CANONICAL-SOURCE-20260921`.

## Scope and ownership

Phase 0 was approved. Its final local-only cleanup was committed separately as `dbfc7c2` before Phase 1 source changes or publication. All Phase 0 fixtures and evidence remain unchanged. The diagnostic remains outside `dist/`, available only through the explicit local preview flag.

Phase 1 defines `canonical-weave-source-v1` in `dist/weave-source.mjs`. A source contains its version, stable project identity, and the working source decisions: boundary geometry/reference, current carrier recipe/reference, weave identity and algorithm version, generation/influences, provenance, family catalog, appearance, and crossing settings including fingerprint-bound manual overrides. Display settings already owned by the weave remain in appearance/interlacing. Browser-wide theme, viewport, and transient selection remain browser preferences.

The source has no `derived` member. Unknown source fields, unsupported algorithm/parameterization versions, invalid family metadata, invalid influences, and inconsistent source identities are rejected. Current boundary and carrier fields own geometry. The immutable source-context snapshot retains historical ancestry and its exact legacy identities; it is not used as the current editable recipe.

`readWeaveSource` is the lossless read-migration adapter from the current schema-6 working representation. It copies durable decisions and excludes cached geometry before validation. `materializeWeaveSource` reconstructs the compatibility envelope with separately supplied calculated geometry. No second source field is written beside legacy fields, and no destructive data rewrite occurs on load. The canonical version is a source-model version, not a new storage schema.

The existing schema-4/5/6 migrations, compact payload encoding, raw recovery, revision chains and capacity limits remain in place. Native backup bytes round-trip exactly. Geometry remains encoded in legacy payloads for compatibility and recovery, but full validation still rejects geometry that differs from canonical regeneration. Removing redundant persisted geometry belongs to the later persistence phase; this build does not claim that work is complete.

## Application integration

- `refreshWeave` rebuilds a compatibility view from canonical source and newly calculated geometry, ignoring old cached geometry.
- `deriveForWeave` adapts existing callers to `deriveWeaveSource`, retaining every established calculation algorithm and version.
- Full saved-document validation and untrusted SVG export use that same source derivation boundary.
- Interactive worker requests and reload certification construct their candidates through `weaveCalculationInput`, using exactly the canonical source values. Worker protocol, cancellation, release scheduling and persistence timing are unchanged.
- Appearance/crossing decisions remain durable source fields but are excluded from geometry worker inputs. Tests verify they cannot accidentally change generated paths.

The existing edit handlers continue using the compatibility view. Their consolidation and preview/commit orchestration are Phase 2, not included here. Background persistence is Phase 3. No new weave features or interface redesign were introduced.

## Verification

Focused checks: 78/78 passed, including 11 canonical-source tests. Eight additional frozen-fixture/diagnostic checks and the schema-4 raw-recovery check passed: 87 checks total. Static entrypoint, output exclusion, hosting target and syntax checks passed. Logs are in `docs/evidence/stability-phase1/`.

All five frozen portable files remain hash-identical. Every saved working/revision snapshot reconstructs exactly from canonical source; existing native portable encoding remains byte-identical. Tests cover malicious/missing geometry caches, source mutation isolation, family independence, stable identities, crossing overrides, unknown versions, empty projects, legacy migration, and SVG geometry/metadata equivalence. SVG path markup is byte-identical; decoded metadata is exactly equivalent (compact decoding and regeneration can have different JSON property insertion order).

The historical Phase 0 production-hash assertion remains unchanged and is scoped to cleanup commit `dbfc7c2`; it correctly does not apply to later approved application changes. Phase 1 runs its frozen data/workflow checks without pretending later source files still equal the Phase 0 application. No full legacy-suite or historical host certification is claimed.

## Local visual review

The separate `STABILITY PHASE 1 REVIEW` project exercises a 500-unit square, direct Square grid application, A spacing 60/rotation 10, A width 5/rank 3, two influences (attractor strength 70 and repeller), and a whole-weave 2-over/1-under rule. The saved workspace was identical across reload in the browser diagnostic; after creating Boundary 02 at 400 units and returning to Boundary 01's weave, the entire working state was identical. All three pre-existing projects were unchanged. Frozen native fixtures independently protect exact floating-point geometry. The old stale selection/context label was reproduced on return and remains documented. Browser evidence and screenshot are in `browser-review.json` and `browser-review.png`; diagnostics are comparison evidence, not replacement native portable fixtures.

Observed browser field commits included worker 15.5–25.4 ms and total 105.4–164.8 ms; return certification measured worker 36.7 ms and total 83.4 ms. These are development samples, not sustained p95 or full-host certification.

Exact user checks:

1. Open the local preview and select `STABILITY PHASE 1 REVIEW`, Boundary 01 and its saved weave.
2. Verify family A spacing 60/rotation 10/width 5/rank 3, while family B retains spacing 50/rotation 90.
3. Confirm both fields and the first field's strength 70; edit an influence and confirm Applied + Saved.
4. Confirm the whole-weave 2-over/1-under rhythm. The frozen Phase 0 fixture also retains its pair rule and manual override exactly.
5. Reload, switch to Boundary 02, and return to Boundary 01 and its saved weave. Confirm the same accepted drawing. The pre-existing stale context/selection label defect from Phase 0 remains separate from geometry restoration.

## Delivery

Phase 1 implementation and focused validation are complete. Publication status is recorded separately in this evidence directory after the native hosting operation; this report alone does not assert deployment success. Preserve the existing owner-only audience.

Ready for the next phase after this phase's review. Phase 2 has not started. Remaining known architectural work includes unified editing, background persistence, incremental performance and context refresh; the 10 MiB ceiling and historical verification debt remain unchanged.
