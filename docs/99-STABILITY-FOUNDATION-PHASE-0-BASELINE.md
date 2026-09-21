# Stability Foundation Phase 0 — freeze and baseline

Date: 2026-09-21 UTC (2026-09-20 local start).

Phase 0 only. Product build remains `WF-STABILITY-S4-BOUNDED-AUTOSAVE-20260918`; the additive diagnostic identifies itself as `stability-phase0-v1`. No canonical-document migration, editing rewrite, background autosave rewrite, UI redesign, feature expansion, or geometry change was made.

## Status and preservation

The local Phase 0 baseline is complete and verified for publication. The Sites installation temporarily disappeared during this task, then became available again before delivery. The hosting skill and publishing references have now been read; the native publication workflow has resumed for the existing project. See the terminal publication record in this evidence directory when delivery completes. Phase 1 has not started.

Existing source HEAD: `c13fc6ad03dacf90a9cc4ec216cbc72d46eebaad`, branch `foundation`. The extensive pre-existing dirty tree is retained. The initial status and SHA-256 of every existing distribution file are in `docs/evidence/stability-phase0/working-tree-before.txt` and `production-before.json`. Only `dist/app.mjs` changed among those files, by adding the read-only diagnostic registration; `dist/compatibility-baseline.mjs` is new. `production-delta.json` records this boundary. No reset, clean, replacement scaffold, or unrelated revert occurred.

Existing browser projects WEAVE STUDIES and CONTROL DIAGNOSTIC remained **byte-for-byte identical in native portable form** before and after testing. The separate STABILITY PHASE 0 BASELINE project is retained as a review fixture. The preview was returned to WEAVE STUDIES. The visible active project differs from the last persisted active-project selection until a later save, an existing distinction recorded in `preservation.json`.

## Visible and internal changes

No visible product capability or control changed. The new WebMCP diagnostic returns each saved project's existing native portable string and captured root. It rejects blocked/unsettled state and a changed root or packed object during capture. It calls the existing storage-worker export path and never commits or mutates a document.

Why native strings: the initial expanded WebMCP snapshot failed exact derived validation after transport. Native portable captures subsequently passed complete derivation validation and byte-identical repacking. Expanded snapshots are retained as **diagnostic evidence only**, not as portable fixtures or a substitute for geometry validation.

Added frozen compatibility fixtures, SHA-256 locks, regeneration/export/worker measurements, a focused regression runner, and behavior-based stale-test repairs. All fixtures, screenshots, reports, and raw diagnostics are outside `dist/`.

## Durable decisions and competing representations

| Decision or identity | Current durable fields | Other representations and dependency |
|---|---|---|
| Project/context | `schemaVersion`, `activeProjectId`, project `id`, `name`, `coordinateSystem` | `workspace`, `project()`, library selection and last packed manifest can differ in selected project; names are metadata. |
| Boundary | `working.boundary`, `sourceRevisionId`; boundary entries, revisions, latest pointers | Carrier revisions also embed boundary and `boundarySourceRevisionId`; weave source snapshots embed the carrier revision. Working vertex preview is transient. Boundary replacement invalidates all fitted geometry. |
| Applied/reusable weave | Carrier entry/revision IDs, `working.carrierSourceRevisionId`; weave `studyId`, `sourceName`, `originLineage`, `sourceContext` | User-facing pattern and hidden saved result are distinct records. `project-library.mjs` finds their relationship. `sourceContext.snapshot` duplicates an immutable carrier revision and is checked exactly. |
| Recipe/family geometry | Carrier ID, kind/generator version, recipe identity/version, parameters, family spacing/angle/offset/density, stitch roles | Carrier working state, saved carrier revisions and embedded source snapshot coexist. `deriveWorking` cache, carrier paths, `carrierPreview`, pattern-update candidate and worker candidate are replaceable. |
| Stable family identity | `familyCatalog.version`, entry permanent IDs, engine keys, labels, order, export inclusion | Catalog appears in working and saved snapshots; active family/isolation are UI state. Derived family index references existing geometry; rank never controls crossing precedence. |
| Influence and variation | Weave version/generation; field IDs, kind, enabled, center, radius, direction, falloff/version, per-family strength/tension; family variation and seed | `influenceGesture.base`, `transientProject`, pending working state and UI values compete with committed state. The release captures its explicit value; derived geometry is still persisted. |
| Appearance | `threadAppearance` version and per-family width/mode/rank/edgeWidth | `threadPreview`, grouped SVG paths and prepared crossing markup are presentation-only. Current renderer is outline-only even for retained legacy solid metadata. |
| Crossing decisions | `interlacing` version/enabled/topFamily/clearance/source/overrides; rule mode/recipe/inversion/repeat/phase/pairs | `selectedCrossing` is transient; overrides are bound to exact geometry fingerprint/event identities. Cache/job/failure keys combine geometry with appearance/rules. Detection uses represented paths, not smooth topology. |
| Display preferences | Separate browser view/display preference keys | Visibility, theme, pan/zoom, isolated family, selected influence and rule target are not a canonical weave document. Do not silently migrate these as durable weave fields. |
| Saved/recovery state | Compact manifest, immutable working records, typed geometry payloads, current/previous roots, historical roots, storage generation/transaction IDs | `workspace`, `store.lastPacked`, worker-produced payload, history root handles and portable encoding are separate representations. Current snapshots are compacted; carrier ancestry still grows. |

To reproduce a saved result today, retain its exact boundary, carrier recipe and version, project identity, weave study/source context and embedded source revision, generation and influence IDs/settings, and algorithm versions. Retain family catalog, appearance and input-bound crossing settings for presentation and export equivalence. Retain revision chains/latest pointers and origin lineage for exact compatibility and recovery. Geometry/certificates are currently stored and strictly verified, even though the future canonical model must treat them as derived. Do not discard them in Phase 0.

## Five protected workflows and dependency trace

| Workflow | UI → transforms → calculation → storage → render | Frozen baseline / focused protection |
|---|---|---|
| 1. Boundary and preset | Make Square → `saveBoundary`; preset input/change → `applyPresetSelection` → `saveCarrierStudy`/`createWeaveStudy` → `editWorking`/`persist` → storage worker encode/pack and transactional commit → full render/crossing preparation | Created 500-unit Boundary 01; selected Square grid directly; 18 strands, stable A/B identities, woven presentation. `project-library`, `workflow-cleanup`, fixture checks. |
| 2. Independent families | Numeric adapter/range handler → copied transient carrier → `preparePatternUpdate` → save source revision/`retargetWeaveSource` → `commitPatternCarrier`/`editWorking`; nonlinear state uses `requestWorking` → worker → compact admission/commit → `renderR1BState` | A spacing 50→60, angle 0→10; B stays spacing 50/90°. A width 3→5/rank 1→3 uses `commitThreadAppearance` and unchanged geometry. `family-architecture`, `thread-appearance`, `edit-draft`, `w2-refinements`. |
| 3. Influences | Add/type/radius/strength/tension/direct center → `candidateInfluence`, captured `influenceGestureBase`/snapshot → `requestWorking` → `dispatchPending` → production `r1b-worker` → payload validation → `prepareIncrementalWorkspace`/`commitDelta` → history and targeted rendering | Three fields: attractor/repeller/deflector. First radius 180, linked strength 70, independent A tension 20/B 0. Deflector center moved to (12.82007, −5.963138). `atomic-field-commit`, `influence-controls`, `edit-preview-worker`. |
| 4. Crossings | Whole/family/pair controls → validated rule adapters → `commitThreadAppearance` → metadata revision preparation/commit → `ensureCrossings` → crossing worker → paint-key/id checks → continuous ribbon renderer | Whole 2/1, A/B pair 1/1, one selected crossing swapped from B to A. 73 assigned, 0 unresolved/ambiguous. Override bound to fingerprint; exact saved metadata survives reload/return. `weave-rules`, `crossing-execution`, `w2-refinements`. |
| 5. Reload and return | `loadWorkspace` → read packed root → storage-worker unpack/recovery → `certifyWorkspace`; boundary/library selection → restore source + saved result → recertify → targeted/full render | Before/after reload portable strings identical (66,633 bytes). Create 400-unit Boundary 02; return to Boundary 01 and saved weave: entire working object exactly equal, including overrides and derived geometry. `stability-phase0`, migration/codec and multi-weave compaction checks. |

Preview calculations do not write revisions; release commits once. Current failure handling restores the committed drawing. Source inspection confirms persistence still precedes replacing `workspace` on accepted commits. Thus the future promise that backup failure cannot reverse a valid visible edit is **not yet implemented**; it belongs to Phases 2–3. The baseline must not assert that future behavior already exists.

## Frozen fixtures and measurements

Five native portable files are SHA-256 locked by `fixture-sha256.json`. Two are untouched real saved projects (including six distinct saved weaves, line/stitch sources and influenced data); three capture the test design before reload, after reload, and after boundary return. Eighteen working/revision snapshots across these files regenerate exactly (duplicates across reload snapshots are intentional, not eighteen independent designs). Every fixture repacks to its original native bytes. The runner records geometry and SVG hashes, source parameters, crossing counts, family metadata, generation/crossing/export preparation times and real worker samples.

| Project fixture | Portable bytes | Boundary / carrier / weave revisions | Decode / full validation / pack ms |
|---|---:|---:|---:|
| WEAVE STUDIES | 375,973 | 2 / 25 / 6 | 64.39 / 191.86 / 47.22 |
| CONTROL DIAGNOSTIC | 138,810 | 1 / 6 / 4 | 14.50 / 31.90 / 12.73 |
| Workflow before/after reload | 66,633 | 1 / 3 / 1 | 7.75–7.90 / 30.63–37.08 / 9.52–11.99 |
| Workflow after boundary return | 67,065 | 2 / 3 / 1 | 7.80 / 33.66 / 10.96 |

Initial complete workspace: 514,492 bytes, 10 referenced payloads and 10 records, zero unreferenced payload/record bytes. Active project headroom: 10,109,787 bytes under the unchanged 10,485,760-byte contract. Counts are current measurements, not the older 102-revision failure specimen.

Nine unique browser field commits in `browser-workflows.json`: worker 11.3–29.2 ms; rendering 7.8–13.8 ms; admission 11.5–24.0 ms; transaction 7.8–38.2 ms; total settlement 83.8–193.5 ms. The later boundary-return recertification measured worker 29.8 ms / total 72.4 ms. Five separate Node production-worker samples were exactly equivalent and measured 9.43–43.17 ms. Node decode/validation is not a browser reload latency measurement. These are bounded development samples, not sustained p95 or full-host certification.

Retain formal worker 375/400 ms, end-to-end 650/750 ms, render 50 ms, and default 200 ms contracts and historical failures. The newer near-150 ms target is not uniformly achieved: this run includes 193.5 ms. Some cross-context dispatch diagnostics are negative; treat those split-phase timestamps as clock/measurement debt, not negative execution time. Worker-local and total durations remain separately reported.

## Defect and stale-test audit

1. **Actual current UI defect, reproduced:** after boundary change and asynchronous saved-weave restore, geometry and working data are exact, but the library selection/context can still say CHOOSE WEAVE and show an unselected weave row; the boundary action status still names Boundary 02. `boundary-return.png` and `browser-returned.json` preserve this. Targeted restoration does not refresh all library/context surfaces. Do not repair it in Phase 0; track for unified refresh/workflow work.
2. **Architectural behavior still present:** persistence admission/commit is on the visible-edit acceptance path; bounded snapshot pruning does not establish the future background-persistence contract. Existing real capacity/snap-back history remains relevant, though not reproduced on these small fixtures.
3. **Storage growth remains scoped:** named result snapshots compact, but source carrier revisions total 25 in the main project and grew to 3 for the test pattern. Do not claim all ancestry is bounded.
4. **Reviewed stale schema assertion:** `r1b.test.mjs` expected schema 5; focused execution failed `6 !== 5`. Current production `SCHEMA_VERSION` and migration emit 6. Updated only that expectation/name and strengthened write-once raw recovery by saving a second changed project and verifying the original raw recovery bytes remain intact.
5. **Reviewed stale build-name assertion:** multitab guard test accepted build strings only through S1/S2, rejecting S4. Replaced that string allowlist with execution of the real `surfaceError` adapter for concurrent-change/storage-open/storage-blocked and a separate backup-capacity case. All existing freshness, reload-action, IDB epoch and writer-close assertions remain.
6. **Harness/transport debt:** expanded diagnostic transport is not exact geometry; use native text fixtures. Node child-process launch initially failed EPERM before checks; the same focused runner passed with runtime approval inside Codex. Browser drag reported an error after dispatch, but subsequent actual committed state proved the move succeeded; no repeated drag was used to invent a pass.
7. **Historical debt retained:** R1's incomplete 30-cycle host checkpoint, prior worker/render/default-interaction misses, and unresolved smooth/source/contact/cross-row crossing limitations remain unchanged. No full legacy-suite or full-host certification is claimed.

## Checks and replay

Final result: **75/75 focused tests plus 1/1 reviewed schema-recovery test pass (76 total)**. Static/private-output/rebuild-target checks and changed-module syntax checks pass. No full legacy-suite pass is asserted.

- `node scripts/stability-phase0.mjs`: exact native parse/repack, full saved-geometry regeneration, crossing and SVG preparation measurements, production worker equivalence. Fixture bytes are versioned inputs, not regenerated expected values.
- `node scripts/stability-phase0-checks.mjs`: focused current contracts, diagnostic failure behavior, frozen fixture hashes, exact workflow/reload/return assertions, reviewed schema recovery case, static output/target checks, and changed-module syntax. Results and raw output are in `focused-checks.json` and `focused-check-*.txt`.
- All source preservation and browser evidence lives in `docs/evidence/stability-phase0/`. Do not put it in the static archive.

## Exact user visual tests

Use the local preview `http://127.0.0.1:43831/?phase0=20260921`. A retained STABILITY PHASE 0 BASELINE project contains the completed test design.

1. In a new test project, Make Square at 500, select Square grid. Expect one saved weave immediately and visible outlined threads.
2. Set family A spacing 60 and rotation 10; set its thread width 5 and hierarchy 3. Expect changes to remain after Enter/release; B remains spacing 50 and rotation 90.
3. Add three influences. Set the first radius 180 and linked strength 70; unlink and set A tension 20. Make the second a repeller and third a deflector; drag the deflector center. Expect three retained fields and B tension 0 on the first.
4. Set whole-weave 2/1, then A/B pair 1/1. Show clickable crossings, select an eligible mark, Swap. Expect one local override and the opposite upper thread.
5. Reload, create a 400-unit second boundary, return to the first and select its weave. Expect exact accepted design and override restoration. The documented stale selection/status labels may remain until a full render; report that separately from geometry loss.

## Delivery and next step

The local baseline can now detect regressions; no user-facing feature was removed. At source freeze, remaining delivery work is exact source commit/push/package and terminal deployment verification. The restored Sites plugin is available. Preserve the current audience and attach the terminal result to the local evidence after publication.

Existing destination verified at task start: `appgprj_6aa83001d03481918d4a13e46c9612fb`, owner-only custom audience, version 4, `https://weave-foundation.notbrandon175.chatgpt.site`. This URL still denotes the previous publication, not this local Phase 0 update.

After Phase 0 delivery/review, Phase 1 is the canonical weave document with read-compatible migration and exact fixture validation. It requires the next phase authorization; do not start it as part of this task.
