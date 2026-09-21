Build `WF-B1-P1C-DIRECT-EDITING-20260918` applies preset selections immediately (no Create button), enables woven overlaps for every newly selected preset and moves its toggle to Display, and removes the redundant Pattern Name editor. Editing reuses immutable geometry/history; certified previews never save revisions, and release commits once. Cancel/failure restores committed drawing. 67 focused tests and built-in/saved/stitch-preset browser routes with influences, spacing, Undo/Redo and reload pass. The earlier user-specific field failure was not reproduced in the available main workspace; its cause is not declared settled. Remain in Phase 1C correction review; 1D/1E remain. See docs/88-BUILD-1-PHASE-1C-DIRECT-EDITING.md. No publication.
Build `WF-B1-P1C-WORKFLOW-CLEANUP-20260918` simplifies the active Build 1 workflow: outline-only threads, a two-step Over / Under panel with advanced controls collapsed, direct saved-boundary reuse, and a My Saved Patterns source. The saved-object tree uses plain actions and explains Boundary → Pattern → Result. Multitab edits still fail closed with Reload Latest. All 59 focused checks, syntax/static checks, and an isolated managed-browser boundary → saved pattern → influence → edit → weaving-rule route pass. Phase 1D has not begun. See docs/87-BUILD-1-PHASE-1C-WORKFLOW-CLEANUP.md. No publication.
Build `WF-B1-P1C-MULTITAB-CAPACITY-GUARD-20260918` fixes the false Add Influence 10 MiB rejection caused by a stale browser tab. Every save now checks the authoritative IndexedDB head before encoding or backup admission; stale candidates remain unapplied and expose one Reload Latest action. Current compact usage is about 1.5 MiB with no orphaned data. Twenty-eight affected tests, three guard tests, syntax/static checks, and an isolated two-tab browser scenario pass. Phase 1D has not begun. See docs/86-BUILD-1-PHASE-1C-MULTITAB-CAPACITY-GUARD.md. No publication.
Build `WF-B1-P1C-LIVE-CONTROL-FEEDBACK-20260918` fixes Phase 1C controls that appeared inactive. Weave and influence edits now select the unambiguous visible result, show Preview/Calculating/Applied+Saved/Not Applied states, and keep carrier-only patterns visible. The rail presents family geometry and influence shape/response before secondary metadata. Family edits on influenced grids recalculate and save linked certified geometry. Fifty-one focused checks pass; managed-browser strength 80→75 and spacing 507→509 both changed derived SVG geometry and saved. Phase 1D has not begun. See docs/85-BUILD-1-PHASE-1C-LIVE-CONTROL-FEEDBACK.md. No publication.
Build `WF-B1-P1C-INTUITIVE-LINKED-EDITING-20260918` corrects the Phase 1C review build. Over / Under now asks which crossings to edit before choosing their behavior, uses plain labels, and explains precedence without internal terminology. Weave Pattern Angle is now Rotation. Family spacing, rotation, offset, and density edits render a complete woven preview and save the current pattern, preserved influences, certified result, crossing presentation, and influenced-grid lineage together. Forty-nine focused tests and managed-browser 0°→10°→0° rotation/recalculation verification pass; the review fixture is restored. Phase 1D has not begun. See docs/84-BUILD-1-PHASE-1C-INTUITIVE-LINKED-EDITING.md. No publication.
Build `WF-B1-P1C-FAMILY-RELATIONSHIPS-20260918` locally completes Build 1 Phase 1C. Over / Under can now edit the whole-pattern default, every family, or one exact family pair; pair rules save automatically, recompute crossings, survive reload/backup, support Undo/Redo, and show their effective precedence. Forty-nine focused tests, syntax/static checks, and managed-browser save/reload/Undo/Redo verification pass. Phase 1B visual acceptance was explicitly deferred by the user and does not block this work. Phase 1D seeded structured variation is next and has not begun. Build 1 remains incomplete. See docs/83-BUILD-1-PHASE-1C-FAMILY-RELATIONSHIPS.md. No publication.
## W2 visual refinements and direct editing - 2026-09-18

Build WF-W2-REFINED-20260918. User requested cleaner intersections/corners, per-family visual hierarchy and thickness, repaired crossing clicks, and typed entry beside every number slider. Implemented as the current W2 correction batch; no W3 or publication. Document78 records the changes and focused verification. 29 affected tests, static checks and changed-module syntax checks pass. Local mouse selection, swap/clear, per-family width/rank isolation, typed outline weight and spacing, invalid-entry rejection, Undo and reload verified. Last square sample: worker33.8ms/render1.9ms/total147.6ms; sampled development verification only. Existing correctness, geometry, storage, recovery and performance contracts remain.

Visual hierarchy is explicitly presentation-only: ranks1..8 scale family ink from100% to30% of its existing base opacity and do not set crossing priority. Thread Appearance now defaults to editing the selected family; linking remains available. Appearance v2 adds rank and outline edge weight, with strict validation, old-v1 compatibility, exact metadata save/backup/SVG and no new geometry payloads. Numeric entries commit on Enter/blur through existing slider handlers; limits and increments remain enforced. Crossing click now selects, then upper-thread dropdown/Swap/Use Pattern Rule Here edit it. Pointerup isolation fixes canvas redraw destroying a marker before click. Markers prioritize visible viewport crossings and remain capped at1000; ambiguity is not guessed away.

W2 refinement batch ready for user review. W2 remains incomplete: unresolved contacts/multiway and source correspondence, then continuous-field cross-row policy before W3 library. W4 bindings, W5 analysis, W6 points, W7 polylines remain deferred. Preview http://127.0.0.1:43831/?sp1=20260917 (refresh). No external host command requested.

## W2 preset and repeat controls - 2026-09-17

Build WF-W2-RULES-20260917. User authorized continuation of preset-driven over/under. New named line and stitch presets initialize interlacing automatically. Existing patterns retain their saved v1/off settings until a rule is explicitly applied. Over / Under now contains preset/priority/custom-repeat modes, default and family-pair over/under counts (1-8), repeat shift (0-15), inversion, restore preset, crossing reversal, and an explicit selected upper-thread dropdown naming role/run/cell or family/line. Counts distinguish assigned and unresolved events. Hidden legacy clearance is now actually hidden despite rail CSS. Selecting a saved interlaced pattern hides the underlying original grid instead of obscuring the occlusion effect.

New interlacing-v2 stores a bounded versioned rule alongside the existing input-bound overrides. V1 reads and meanings are unchanged. Rules are presentation metadata; no certified geometry, source IDs, certificate, fingerprint, compact geometry buffer, migration or evaluator changes. Tests prove zero new geometry payloads, preserved immutable old revisions and portable JSON roundtrip; current SVG uses the same rule resolver as the canvas. Local overrides are absolute upper-thread choices, take precedence over inversion, and deactivate on changed geometry as before.

Preset stitch rules use the existing reviewed stitch-intent templates and named source-run identities. Assignment requires a unique nonambiguous strict meeting for the two source runs and finite source parameters. No nearest-point matching, tolerance or tessellation ordinal guessing. Cross-row/unmatched, multiple meetings, contact and ambiguous cases remain unresolved. Generic line presets use a stable 1/1 design repeat. Custom repeats use the sum of source line indices (stitches: cell row + column), modulo over+under; the first alphabetical family is over during the over part. Pair overrides supersede the global default. This is an explicit lattice design repeat, not a promise of N consecutive visible crossings on an arbitrarily deformed curve. Same-family custom-repeat meetings remain unresolved; use authored preset rules or a local override. This distinction is displayed beside the controls.

18 distinct focused tests passed (12 existing affected crossing/worker/occlusion tests and 6 new rule tests). Coverage includes inversion, negative indices, pair-specific repeat, input-order and clipping independence, authored square cycle, both stitch recipes, unresolved repeated/cross-row meetings, bounded validation, unchanged legacy rules, exact geometry fingerprint, zero new geometry payloads, old revisions and portable/SVG settings. Static and changed-module syntax checks pass. Managed browser verifies legacy preservation, apply preset, invert/Undo, pair 2/2 reload, new preset auto-rules, explicit upper-thread choice and restore. New Herringbone Square has49 assigned /0 unresolved events. Last sample worker13.6ms, render2.7ms, total78.3ms passes maxima; not sustained checkpoint certification. Existing deformed Herringbone field has59 assigned /996 unresolved of1055; do not claim complete woven topology for it. Prior failure evidence and verification debt remain unchanged. No external host run or publication.

This bounded W2 control slice is ready for visual review, not full W2 completion. Remaining W2: incident/contact and multiway handling, complete generic source-anchor correspondence and uncertainty verification; then explicit cross-row design policy for continuous Herringbone without inventing traditional rules. Broader W2 completion verification remains due at its checkpoint. W3 complex curved library, W4 bindings, W5 analysis, W6 points and W7 polylines remain unstarted. Next scheduled implementation stays in W2 to resolve eligible crossing incidences/source correspondence before expanding W3.

Preview: http://127.0.0.1:43831/?sp1=20260917 (refresh). WEAVE PATTERN06 is the new Herringbone Square review example, outlined width8.5; WEAVE PATTERN03 contains the saved A/B2-over2-under example. No deployment.

## W2 continuous occlusion correction — 2026-09-17

Build WF-W2-CONTINUOUS-20260917 replaces the active gap-cutting view with full original ribbon paths and fragment-scoped SVG masks shaped by the upper ribbon. The lower edges terminate visually at the upper ribbon edge, without manufactured end-cap strokes or clearance gaps. Widths include rendered outline-edge thickness; masks follow the actual clipped upper fragment. Solid/outline styles, priorities and local overrides remain. No new fill-color controls are claimed. Outline interiors away from crossings remain transparent. Original finite source endpoints remain actual endpoints; this change does not join disconnected source stitches.

Legacy clearance settings remain readable in saved records but their control is hidden and the active renderer ignores that gap value. No migration, geometry, certificates, IDs or saved-byte rewrites. Screen and SVG use the same continuous mask composition; exports retain original source IDs and geometry metadata. Ambiguous meetings remain unresolved. Historical cut helper tests remain as historical coverage, but the application no longer calls the cutting view.

Initial browser render failures72.1ms and84.2ms exceeded50ms; both are preserved in docs/evidence/w2. Moved exact markup/mask preparation into the crossing worker and reused completed crossing results for appearance-only changes. Main thread inserts a detached prepared SVG group; cached document-space markup supports pan/zoom. No threshold changed. Final Herringbone1055-crossing sample: worker270.0ms, render34.6ms, total464.3ms. Priority change: worker112.1ms, render33.4ms, total324.2ms. Both pass400/50/750 maxima; these are focused samples, not sustained p95/full phase certification. Prior default200ms timing debt remains and these totals do not meet that default target.

12 focused tests pass, including continuous full-path preservation, mask reversal/stale overrides, concave separation, exact crossing behavior, source/backup preservation and latest-request/presentation reuse. A new test initially had an incorrectly escaped literal regex and reversed expected SVG Y order; corrected the expectations, not rendering. Static/syntax checks pass. Managed preview inspected at close zoom; no cut-end gaps. No host command or publication.

W2 corrective version ready for visual review. Next remains alternating design sequences and uniquely matched stitch-specific rules, plus remaining source-anchor/incident verification before full W2 completion. No W3/analysis/points/polylines started.

## W2 first interlacing slice — 2026-09-17

Build WF-W2-INTERLACE-20260917. User accepted W1 and authorized continuation. W2 first visible slice adds Over/Under: enable, family-on-top, crossing clearance, clickable reversal marks, reset and recalculate. Enabling on a carrier-only pattern creates/saves its identity weave without requiring an influence. Same-family ties use canonical thread order; these are explicitly design rules, not traditional stitch intent. Source/underlying layers are hidden by the existing Distorted Only preset when enabled. Width and outline settings remain intact.

Crossing worker uses exact dyadic BigInt predicates on represented binary64 segments, X-sweep/AABB candidate filtering, all families, same-family/self pairs and separate fragments. Endpoint incidences remain contact-pair diagnostics; full incident topology at tessellation vertices is deferred. Overlap-pair references remain diagnostics, and affected strands are conservatively excluded from automatic precedence. Exact rational crossing locations group multiway events. This is represented-polyline weaving, not a certification of smooth-curve topology or mechanical contact. Source parameters are available from the existing reconstructed/worker trace for finite stitches; generic deformed multi-vertex paths still lack full source-parameter anchors. Overrides attach to exact input fingerprint plus canonical run/fragment/segment pairs; no across-edit correspondence is claimed. Geometry changes deactivate old overrides, preserved for Undo. This deliberately limited first slice does not declare document70 fully implemented.

Rendering subtracts display-only underpass intervals using upper/lower thread widths, angle and clearance, merging cuts within each original fragment. No saved centerline, certificate, source identity or compact payload is changed. Bounded versioned interlacing-v1 settings and up to1000 local overrides save with immutable working/field revisions using existing incremental metadata commits. Portable backup retains settings; prior absent settings mean off. SVG exports require current complete crossings and include woven presentation plus original certified metadata. Old binaries may reject new optional working metadata, without silently rewriting it.

Latest-request worker cancellation/stale result rejection, unavailable-worker fallback and explicit retry retain the valid drawing. Provisional2M pair/100k diagnostic-event limits fail closed, never truncate the computed result. Only the marker display is capped at1000, explicitly labeled. Worker400ms, render50ms and completion750ms maxima enforced for crossing application; sustained p95/full workload certification is not claimed. Existing R1 performance thresholds and debt remain, including the prior default-interaction misses.

15 focused tests pass: exact crossing/contact/overlap classifications, near-parallel disjoint inputs, self/multiway cases, gaps, exhaustive-oracle comparison, pair-order identities, input-bound overrides, presentation-only cuts, settings rejection, unchanged geometry and reused payloads, portable backup/SVG, latest/wrong-id rejection and worker/unavailable failure. W1 affected checks included. Browser verified Herringbone1055 crossing pairs,80 contact pairs,117 overlap pairs,416 conservatively ambiguous events at145.5ms worker (reload40.1ms); B priority and1 local override survive reload, Undo restores B after A edit. Carrier-only square grid produces81 crossings/no contacts or ambiguity at14.0ms worker. These are development samples, not full certification. No external command, publication, force analysis, points or polylines.

W2 remains incomplete: next implement explicit alternating design sequences and uniquely resolved researched stitch intent; finish incident/source-anchor/uncertainty handling and broader crossing verification before claiming full W2 completion. W3 richer curved library, W4 bindings, W5 force analysis, W6 points, W7 polylines remain. User review checkpoint now; keep existing failures/evidence. Preview http://127.0.0.1:43831/?sp1=20260917 (refresh).

## W1 thread appearance ready for review — 2026-09-17

Build WF-W1-THREADS-20260917. Thread Appearance panel provides width0.5–30 document units (default3), Solid/Outline, linked/per-family editing and reset. Source and derived paths use the same presentation; existing visibility and color/opacity remain. Transparent outline contours use bounded miter/bevel joins and independent closed fragment subpaths, clipped to the boundary. They are display geometry, not certified physical offsets or additional strands. No over/under claim.

Versioned optional thread-appearance-v1 metadata lives in working and saved pattern/field revisions; absent legacy metadata uses defaults without rewriting old records. Old app versions may reject new metadata; current app reads both. Geometry, certificates, identities and compact buffers are unchanged. Appearance-only commits reuse existing payloads/records and exact portable admission; new carrier metadata uses a bounded incremental manifest update. SVG exports include appearance and clipped outline/solid paths with original strand/fragment IDs and exact source metadata. Black SVG styling remains existing behavior; no texture/color export change.

12 focused tests pass: existing render parity plus linked isolation, strict settings rejection, old revision preservation, appearance backup roundtrip, zero new geometry payloads, carrier delta, admission rejection, transparent separated outlines, bounded joins, family-bounded dense output and production worker trace. Static and syntax checks pass. Managed browser verifies mixed A-outline/B-solid at8.5 units, Undo/Redo, reload, influence edit preservation and standalone pattern save. One field edit worker79.0ms/total203.1ms: retains default200ms timing debt, no phase-wide performance pass claimed. Earlier failures remain preserved. No host command or publication.

W1 implementation complete for development visual review; user acceptance outstanding. Next W2: integrated crossing computation with visible over/under rules and overrides, preserving document70 correctness requirements without a separate Analyze prerequisite. W3 library, W4 bindings, W5 analysis, W6 points and W7 polylines remain. Preview http://127.0.0.1:43831/?sp1=20260917 (refresh for current build).

## Active direction — weave-first, 2026-09-17

Document73 (docs/73-WEAVE-FIRST-DIRECTION-BRIEF.md) records the user-directed order: W1 thread width/outline → W2 integrated over/under → W3 complex preset library → W4 stitches/connection rules → W5 force/relationship analysis → W6 points → W7 polylines. It supersedes the standalone Analyze-first next action; necessary crossing computation remains an internal dependency with document70 correctness requirements. Current build WF-SP1-LINKED-20260917 unchanged. Planning only in this turn; next bounded implementation scope is W1. Preserve geometry/storage contracts, historical evidence and deferred host certification. No publication.

## SP1 linked response trial — 2026-09-17

Build WF-SP1-LINKED-20260917 adds default-linked strength/tension editing with an independent-role checkbox. Each edited property applies to all roles of the selected influence; other response properties and other influences remain unchanged. Checking alone never rewrites existing saved values. Editing scope is session UI state (defaults linked after reload), while resulting values use the unchanged atomic save/schema paths. No evaluator, geometry, certificate, identity, codec or migration change. Targeted render now refreshes Undo/Redo enabled state, fixing an observed stale disabled button.

Four focused tests pass plus static and syntax checks. Managed browser: A/B strength81 survives reload; independent B60 leaves A82; Undo restores81 after linked80 and Redo restores80. Preview screenshots inspected. Recorded worker/total samples79.3/175.5ms,68.6/179.9ms and101.7/248.1ms. The last exceeds the default200ms target; retained as diagnostic, not a performance certification pass. No exhaustive proofs or external command requested. Strong deformation can still alter crossings; linked roles do not guarantee topology preservation. Existing unequal tensions require a linked tension edit to equalize. SP1 trial awaits user visual acceptance; R2A remains next, not begun. No publication.

## SP1 implementation complete for local review — 2026-09-17

WF-SP1-SOURCE-TRACE-20260917: exact transient per-vertex source parameters and worker reconstruction, version2 embedded stitch intent for new instances with unchanged legacy saved bytes, preloaded/reused idle worker, clear tree action layout, portable-v3 import routing and order-independent metadata validation.32 distinct focused tests pass. Production maximum codec layout fits10MiB reserve; mixed migration preserves legacy buffers.30-request eight-influence worker p95/max149.5/177.3ms. Managed-browser Herringbone170.8ms total; Square add146.7ms/edit114ms; fields, parameter edits, Undo/Redo, reload and native backup import verified. Diagnostic JSON had one-ULP transport changes and is not backup evidence; native export audit is exact. All earlier failures preserved. Document71 has scope/evidence. SP1 development implementation complete, awaiting user visual acceptance; release certification not claimed. User “approved, keep working” next authorizes R2A visible crossing diagnostics, then R2B authored over/under, then curved-lacing work per70. No publication or host command.
## Stitch-based priority and crossing readiness — 2026-09-17

User clarified that presets must follow the researched stitch constructions, not more generic grids. Document70 reconciles SP1 → R2A → R2B → curved-lacing delivery. Actual saved field audit:69 multi-vertex fragments/1547 interior vertices lack retained per-point source parameters; intent is currently an identifier, not explicit pair brackets. Plan optional exact transient source trace and versioned intent templates before automatic crossing/precedence matching. No tolerance guessing, inferred parameters or arbitrary over/under. Application build unchanged; SP1 gates remain, R1 development-complete, no publication/host command. See docs/70-STITCH-CROSSING-DELIVERY-CONTRACT.md.
## SP1 grid presets — 2026-09-17

WF-SP1-GRID-PRESETS-20260917 adds Square, Diamond and Triangular editable rect-v2 presets under current user authorization. Four focused influence/save/backup tests pass; triangular and square immediately visible in managed browser; triangular add-field31.1ms worker/124.3ms total. No geometry/storage contract changes, unrelated proofs, host command or publication. See docs/69-SP1-GRID-PRESETS.md. SP1 earlier finite-source timing/certification debt remains; R1 development-complete.
## SP1 clear-controls review — 2026-09-17

WF-SP1-CLEAR-CONTROLS-20260917 removes separated-band creation/layout choices, simplifies names and displays spacing/overlap percentages, and restores a1px half-opacity selected influence ring without glow. Legacy saved bands remain immutable/readable with one-way field conversion. Actual control-handler test and local DOM/style verification passed; no geometry/storage/worker changes or unrelated proofs. See docs/68-SP1-CLEAR-CONTROLS.md. SP1 timing/certification debt remains; R1 development-complete; no host run or publication.
## SP1 continuous-field review version — 2026-09-17

WF-SP1-FIELD-20260917 adds a separately identified continuous herringbone field adaptation, Layout selector, row-step slider and preserved separated-band option. Existing field survives layout conversion and atomic save in the managed browser.15 focused checks pass, including six byte-identical codec fixtures for redundant-hash removal. Layout edit before that optimization measured643.9ms total, worker368.3ms/render26.1ms: default200ms remains unresolved. SP1 remains development-only; no performance acceptance or new-format certification claimed. Details/evidence/remaining work: docs/67-SP1-CONTINUOUS-FIELD-CORRECTION.md. R1 remains development-complete with deferred host debt. No host command or publication.
## SP1 partial local preview — 2026-09-17

Build WF-SP1-FOUNDATIONS-20260917 implements the first two finite foundation presets and related controls/field/storage paths. 37 focused checks passed; managed-browser Double Herringbone creation and add-influence saved successfully. Default interaction measured416.6ms versus retained200ms target (worker164.7ms, render12.8ms). Stop condition in document60 remains in effect; implementation paused with raw snapshot and test output in docs/evidence/sp1. See document66 for actual coverage, remaining numerical/new-format migration/capacity/UI checks and next bounded timing repair. SP1 is not complete or accepted. R1 remains development-complete; host certification remains deferred debt, not a feature blocker. No PowerShell requested and no publication. Preview: http://127.0.0.1:43831/?sp1=20260917 (isolated test origin).
## R1 development-complete; SP1 implementation authorized — 2026-09-17

User decision: accept R1 as development-complete on preserved functional checks, exact geometry/equivalence, worker results, focused integration tests and completed browser evidence. The unfinished full host run is deferred verification debt from verifier-only failures and does not block feature development. Prior actual worker447.8ms failure remains preserved alongside the later repair and passing worker/dense samples; no full host certification is claimed. Stop requesting repeated external runs for harness problems. Complete final host certification once before the next publication, or earlier only for an actual host-only application defect. Geometry, storage, recovery, correctness and established product thresholds remain unchanged.

SP1 documents57–60 are now approved for implementation, superseding their prior approval/checkpoint blockers. Implement two editable foundation presets, real controls, influence integration, autosave, existing three-column/collapsible shell, focused internal checks and local preview with five tests. Ordinary feature batches do not require host PowerShell. Publication still requires separate authorization.

## R1 checkpoint selection verifier repaired — 2026-09-17

Document 61 diagnoses the selected-attractor timeout as a verifier ordering defect: selecting then clicking Fit triggers intentional workspace deselection. Board restore was also not awaited correctly. Production UI and source are unchanged. A dedicated helper waits for board restore, shows guides, fits, then selects and asserts identity/visibility. Four focused tests pass using the actual production deselection handler in a VM; verifier syntax checks pass. This is not a live browser pass. Original 14-check/17-cycle evidence retains SHA-256 3A881397AA06E5DF7168F95D0E98B38631524FEB864D9730CC50A65F54568E76. The single host wrapper now uses --resume-dense, guarded by evidence and production hashes, to finish only the unexecuted dense workload and aggregate gates. One bundled major-phase host run remains; no unrelated proof or full browser suite reran. R1 remains uncertified, SP1 and publication remain on hold. Ordinary feature batches require internal checks plus local preview, not routine PowerShell runs.
## Standing verification workflow — user decision, 2026-09-17

Ordinary feature batches: run all applicable checks available inside Codex, provide a usable local preview and a short visual acceptance checklist. Do not require the user to run PowerShell as routine batch acceptance. External host-browser execution is reserved for major phase checkpoints, pre-publication verification, or defects demonstrably reproducible only outside the managed environment. Bundle every required host check for that checkpoint into one command; preserve completed evidence and rerun only affected checks when justified. A managed-browser limitation alone does not turn every feature batch into a host-run requirement. Distinguish local visual acceptance from outstanding formal certification; do not silently waive numerical, integrity or performance gates. Publication still requires separate authorization.

Current R1 checkpoint host evidence is preserved unchanged at docs/evidence/r1-checkpoint-20260917/browser-2026-09-17T18-17-46-862Z.json, SHA-256 3A881397AA06E5DF7168F95D0E98B38631524FEB864D9730CC50A65F54568E76. Fourteen functional/storage/recovery/multi-tab checks are listed as completed and 17 cycles are recorded. The run then timed out locating .attractor-center.active before the dense loop; overall passed=false. The recorded stage remains authoritative tab edit and is stale relative to dense setup. Treat this as an unresolved verifier/selection setup failure, not proof of a geometry failure or a complete checkpoint pass. No rerun requested or performed in response to this workflow correction. Review and repair the verifier internally before any justified, bundled checkpoint rerun.
## SP0 reference verification / R1 checkpoint — 2026-09-17

User authorized finishing stitch references, updating test controls, R1 certification and the SP1 approval proposal. Document 59 closes the construction-image comparison gate for the two idealized foundations after actual source-image review. Automated checkpoint: 117/117 tests, exact equivalence, generated/maximum capacity and static checks pass; historical worker p95/max 184.919/191.137 ms, current dense 239.678/245.987 ms, eight mixed influences 94.119/96.447 ms pass. Invalid-direction test-fixture rejection is preserved separately; only the corrected eight-field case reran. New current-control browser verifier is syntax-checked but its attempted launch was blocked by spawn EPERM before any browser test. One browser-only host run remains via scripts/verify-r1-checkpoint-browser-only.ps1; do not claim R1 certified. Documents 57–58 and 60 define the pending SP1 scope. No production files changed (checked against saved hashes), no feature implementation or publication. Preserve all checkpoint evidence in docs/evidence/r1-checkpoint-20260917. Next: obtain and review browser-only host result; stop on authoritative failure, otherwise present SP1 approval/handoff.
## SP0 continuation checkpoint — 2026-09-17

Document 58 (`docs/58-SP0-CAPACITY-AND-CHECKPOINT-REVIEW.md`) records PASS for the independent finite-source storage-layout proof: two worst-case payload bounds plus 256 KiB metadata reserve total 10,249,232 bytes, below the unchanged 10 MiB ceiling; exact threshold and seven rejection checks pass. This is not a production codec, migration, browser-quota or performance pass. It also defines v3 table bounds and corrects finite-source support parameterization, role validation, search margin and square thread termination. Source-illustration comparison is still unavailable; current R1 browser verifiers have stale build/control expectations. R1 certification is not claimed. No production code/verifier/site changed; baseline WF-R1D-ANCESTRY-REPAIR-20260917 remains. Next evidence work: verify source illustrations and prepare a bounded current-build R1 checkpoint verifier; SP1 and publication remain unauthorized.

## SP0 planning checkpoint — 2026-09-17

User authorized starting SP0 only. Document 57 (`docs/57-SP0-STITCH-SOURCE-CONTRACT.md`) defines the proposed finite-run source, first two foundation recipes, identities, deformation/clipping, versioned persistence, crossing dependencies, SP1 scope and acceptance tests. Original diagrams and 24 passing normalized reference checks are in `docs/evidence/sp0/`. These checks do not certify production geometry, capacity, performance or historical authenticity. Source illustration comparison and bounded v3 codec/capacity proof remain open SP0 evidence gates. Broader R1 checkpoint certification is also outstanding. Do not describe SP1 as ready for implementation until these gates and contract approval are recorded. Baseline remains WF-R1D-ANCESTRY-REPAIR-20260917; no application changes or publication. Next work is architectural/evidence completion, not routine Sol implementation.
# Weave Generator — Master Guide

Proposed stitch-library direction — 2026-09-17: see [56 — Stitch preset research and development plan](56-STITCH-PRESET-RESEARCH-AND-PLAN.md). It covers the requested construction methods, evidence gaps, finite-path and lace geometry, and suggested insertions around R2A/R2B. Planning only; the existing schedule is not superseded until this proposal is accepted. R1D repair functionality is user-confirmed; broader R1 checkpoint verification remains.

Current R1D field-edit correction — 2026-09-17: build `WF-R1D-EDIT-CLARITY-20260917` preserves Derived line styling while fields move, makes influence selection and deselection explicit, and keeps the complete influenced result coherent when Pattern spacing changes. See document 54. R2A and publication remain closed.

Current R1D compatibility correction — 2026-09-17: build `WF-R1D-LEGACY-CERT-20260917` restores exact cubic interval-certificate behavior for omitted/default Falloff 3, allowing existing schema-5 IndexedDB roots to validate without clearing or rewriting data. See document 53. R2A and publication remain closed.

Current R1D commit correction — 2026-09-17: build `WF-R1D-BOUNDARY-COMMIT-20260917` safely retries the additive Make Square command once after refreshing a stale multi-tab IndexedDB head, retains atomic conflict rejection, and reports its result inline. See document 52. R2A and publication remain closed.

Current R1D correction — 2026-09-16: build `WF-R1D-FLOW-RESTORE-20260916` makes automatic creation visible, restores a Pattern with its latest saved influence state, removes redundant Boundary save controls, and adds certified per-influence Falloff 1–5 with exact default compatibility. See document 51. R2A and publication remain closed.

## Current settled R1 product hierarchy — 2026-09-16

The saved product hierarchy is `Board → Boundary → Weave Pattern → Influenced Grid`. A Weave Pattern embeds two through eight line-family definitions; families are edited through right-rail tabs and do not appear as saved child nodes. Adding the first Field Force transparently creates the Influenced Grid, so there is no separate setup stage. The tree exposes one current version per named object; immutable revision history remains internal for lineage, recovery, migration, and backups. Creating objects and completing control gestures saves automatically. Same-name Boundary updates reclip attached Patterns, and opening an influenced alternative refreshes it to its Pattern's current source through the certified worker. Parent duplication still copies the full descendant subtree under new stable identities. See documents 47 and 50.

Version 3.2 · 2026-09-16 · Consolidated conceptual framework, simple creation workflow, and build plan.
R1D is implemented locally and awaiting visual acceptance plus the broader R1 checkpoint. Publication is not authorized.

This is the project's current master entry point. It incorporates the user's relational-field framework, practical workflow and reviewed build-batch breakdown. Use the linked detailed checklists to prepare each build; do not treat historical seam-first plans as current instructions.

## 1. Purpose

Weave Generator is the first analytical and generative field in the B.A.C. workflow. It is a relational field generator and analytical synthesis tool: controlled systems of lines produce relationships; the tool measures and visually encodes those relationships; the designer selects significant conditions and synthesizes them into geometry and metadata that influence later design.

The recurring logic is **field of interactions → legible relationships → selected significance → synthesized part → another field**. Lines are actors; relationships and collective organization are the subject. Generation is not designed toward a predetermined final outline.

The designer authors forces and constraints; the system reveals their consequences through controlled emergence. Analytical stitching gives those consequences a visible language. Point selection expresses design priorities, and closed-polyline synthesis compresses selected relationships into a geometric part. Tangent and Overlap develop that part without erasing its relational history. Later, a deliberately designed spatial boundary can host an internal weave using the same logic at another scale.

The computer measures and proposes; the designer selects, rejects, overrides and interprets. The same weave can produce several valid syntheses under different relationship weights. Reproducibility and designer agency are complementary requirements.

## 2. Current baseline and authority

Phase 1A, Phase 1B and Phase 2A are user-accepted. The frozen private baseline is Site version 3, build WF-2A-20260914, source 002ae94dacade531deb6c88a1414fbe6367b8356. It contains versioned boundaries, straight SVG boundary import, rectangular A/B carriers, analytical clipping, Carrier Studies, undo, browser-local saves and JSON backups. Fields, actual weaving, analysis, markings, point extraction and synthesis are future work. See [Phase 2A evidence](08-PHASE-2A-VERIFICATION.md).

Authority: current user instructions → this guide and [phased development plan](12-PHASED-DEVELOPMENT-PLAN.md) → [relational framework](11-RELATIONAL-FIELD-DIRECTION.md) → compatible supporting contracts → historical plans. The new practical guide is incorporated here and in the plan. No listed future feature is a delivered capability.

The seam-first plan in 09 and compressed-seam contract in 10 are historical/provisional examples, not the next build. Historical release evidence remains valid for its stated version. The former master and model checkpoint are retained under docs/archive/.

## 3. User workflow

| Workspace | Question | Output |
| --- | --- | --- |
| FIELD | What constraints and influences exist? | Boundary, carrier recipe and authored influence field |
| WEAVE | How do strands respond and interact? | Versioned derived strands, authored edits and interaction relationships |
| ANALYZE | What happened, and how strongly? | Measurements, typed conditions and relational intensity components |
| INTERPRET | How is it made visible and read spatially? | Stitch markings, legend and editable interpretations |
| EXTRACT | Which conditions matter for this study? | Weighted significance, candidates and curated Point Sets |
| SYNTHESIZE | How can selected relationships become a part? | Alternative validated closed polylines and recorded connection reasons |
| EXPORT | What should subsequent tools inherit? | Selected geometry, relational metadata and lineage |

These are connected views of one document, not separate applications or a rigid wizard. Introduce each view when usable. Users can inspect earlier stages and revise them; working descendants become stale until recomputed. Saved descendants retain their original source snapshots.

## 4. Goals and boundaries

- Generate reproducible variation using two source families, spacing, direction, density, seeded irregularity, deformation and authored influences. Preserve existing Phase 2A parameter meanings.
- Develop explicit over/under rhythm, binding, release and routing. Strand-to-strand response is planned; define same-family versus cross-family behavior before enabling avoidance or attraction.
- Retain recognizable source organization. Start with deformation of identifiable carriers; progressive strand growth is a separately evaluated later generator, not an implicit replacement.
- Support strand authorship through persistent exclusions, locks and manual geometry. Never silently discard edits during regeneration.
- Measure proximity, crossing angle, alignment, curvature, spacing change, density, repetition, convergence/divergence, clustering, isolation, interruption and continuity in bounded, progressively expanded sets.
- Represent condition strength through inspectable relational intensity components and gradients. Keep authored influence fields separate from derived analytical fields.
- Use analytical stitch markings as a coherent visual vocabulary. Type, orientation, size, repetition and extent may encode measured conditions; overrides change representation, not evidence. Markings are independently visible/exportable.
- Extract significant points through explicit rules and designer weighting. Significance is not intensity or confidence. Sparse/isolated conditions may matter as much as concentrated activity.
- Compose alternative closed polylines that synthesize selected relationships, not merely trace a seam. Retain open traces as useful optional outputs. Every automated connection needs a declared rationale.
- Preserve source ancestry and enable visual lineage from vertex to point, conditions, strands and authored context, and in the reverse direction.
- Export geometry plus versioned metadata. Develop intended radius behavior from relational evidence and designer interpretation, resolved against actual corners and receiving-tool feasibility.
- Support saved iterations and comparison of both field changes and changed design priorities on the same field.
- Later reuse a designed spatial boundary for a secondary/internal weave exploring internal organization. Architectural roles require authored context; they are not inferred from anonymous lines.

Tangent develops formal character; Overlap arranges/tests forms and residual spaces. Neither rich receiver metadata nor automatic radius interpretation currently exists as a verified integration.

## 5. Essential distinctions

A weave operation changes geometry or relationships; an analysis stitch describes them. A crossing is not automatically a junction. A visual underpass gap is not an opening. A measured condition is not its architectural interpretation.

Intensity describes expressed relational activity. Significance records study priorities. Confidence, if introduced, must describe justified measurement reliability rather than borrowing the significance score. Units and reference scales must be declared; unspecified document units are not millimeters.

A polyline is an authored synthesis with geometry constraints and relational reasons. It need not follow the weave literally. It must not become an arbitrary triangle group, nearest-point chain or unexamined convex hull.

## 6. Principles protecting later development

Keep authored inputs, derived geometry, interactions, measurements, markings, point selections, connection relations, output snapshots and view state separate. Renderers consume the model; they do not define it. Use common coordinate/geometry conventions and small tested contracts, not speculative infrastructure for every future feature.

Keep generators and detector versions explicit; preserve source identities, immutable saved ancestry and recoverable migrations. Future generator types consume/produce agreed geometry and provenance; they must not reinterpret old studies.

Use a one-way derivation dependency chain with selective invalidation. Changing notation does not regenerate strands; changing significance weights does not recompute geometry; moving a field invalidates downstream working results. Preview limits never truncate committed analysis invisibly.

Define exchange metadata early and test a minimal receiving-tool fixture before a full synthesis implementation. Add richer capabilities only after measurement and compatibility evidence. Do not replace storage or introduce workers solely in anticipation of hypothetical scale.

These rules reduce avoidable rework; they do not guarantee zero future changes. New evidence may require versioned migrations or revised contracts.

## 7. Development and delivery

### Local build review workflow

After every local build version or meaningful feature update, stop and provide one concise review report with:

1. build/version identifier and current phase/batch;
2. visible changes plus material behavior, saving, layer, export, reliability or future-development changes;
3. completed and remaining work in the current batch, later batches in the phase and whether the phase is complete;
4. exact numbered local-preview tests naming each control, expected result, relevant edge cases and known deferred limitations;
5. the exact next scheduled implementation action if approved.

Visible work always includes a usable local preview and discoverable prerequisites. A correction stays within the current batch: implement it, run focused affected checks, refresh the preview and issue another review report.

“Approved, keep working” authorizes development to finish the current batch, then begin the next scheduled batch, then the next phase when the current phase is complete. Use Sol Medium for behavior already settled by contract. Pause only for a material unresolved product decision, geometry contract, data-integrity risk or required user choice. This phrase never authorizes publication, deployment, private-site changes or release; those always require separate explicit authorization.

Build vertical feature slices. Each feature includes functional controls, visible output, relevant layers, save/reset/Undo behavior, focused automated checks and visual acceptance scenarios. Preserve the stable UI foundation. Defer final visual polish and major panel reorganization to phase checkpoints. During ordinary feature batches use development-mode focused verification; reserve exhaustive performance, capacity, migration, recovery and full-regression certification for changes affecting those systems and meaningful phase checkpoints.

The authoritative phase checklist, milestones, architecture decisions and tests are in [12 — Phased development plan](12-PHASED-DEVELOPMENT-PLAN.md). [13 — Manageable build batches](13-BUILD-BATCHES.md) breaks every phase into bounded additions, dependencies and exits. Its batch IDs supersede earlier informal batch suggestions. New phases use R0–R12, preserving historical Phase 1A/1B/2A labels.

[14 — Builder execution checklists](14-BUILDER-CHECKLISTS.md) provides each batch's exact scope tasks, decision gates, data obligations and verification scenarios. Size deliveries around complete testable behavior, not a fixed feature count; combine small related entries only through an explicit combined scope. Complex algorithms still require their own settled contracts.

### Build sequence at a glance

| Phase | Batch breakdown | Completion outcome |
| --- | --- | --- |
| R0 — Contracts | A: geometry/identity; B: editing/dependencies; C: fixtures/exchange/first brief | Shared rules and the first build scope are ready for review; planning only. |
| R1 — Fields | A: derived studies; B: attractor; C: repeller/deflector; D: combined influences/variation | Reproducible authored deformation with saved ancestry. |
| R2 — Weave | A: crossings; B: over/under rhythm; C: selection/exclusions/locks; D: manual geometry | An editable basic weave. |
| R3 — Analysis | A: measurements; B: proximity/alignment; C: convergence/divergence; D: density/rhythm/isolation | Conditions with inspectable evidence. |
| R4 — Interpreter | A: vocabulary; B: evidence/overrides; C: marking exports | An independently usable analytical drawing. |
| R5 — Intensity | A: components; B: explicit composites; C: display/comparison | Measured condition strength on comparable scales. |
| R6 — Points | A: condition candidates; B: intensity/isolation candidates; C: significance/filtering; D: curation | Meaningful, designer-curated Point Sets. |
| R7 — Synthesis | A: candidate relations; B: manual closed composition; C: automatic alternatives; D: curation/lineage | Validated geometric parts with explained relationships. |
| R8 — Exchange | A: relational package; B: Tangent geometry verification; C: portable comparison; D: optional DXF | First complete field-to-part workflow at R8C. |
| R9 — Radius behavior | A: curvature intentions; B: feasibility/units; C: separately authorized receiver integration | Verified inherited radius behavior, not just exported suggestions. |
| R10 — Advanced generation | A–Q: separately scoped mutual response, fields/zones, operations, editing, carrier modes, growth and conditional optimization | Selectable extensions using the same downstream contracts. |
| R11 — Spatial analysis | A: cells; B: openings/adjacency; C: readings; D: interfaces; E: regional synthesis; F: Atlas/context; G: Overlap exchange | Richer regional relationships and geometric synthesis. |
| R12 — Internal weave | A: new boundary/parent lineage; B: one internal reading; C: alternatives/export | A second application inside a deliberately authored spatial boundary. |

The schedule contains 63 tracking entries: three planning batches and 60 future implementation/integration entries, including optional and conditional work. This is not a requirement for 63 releases. R10–R12 are later branches, not prerequisites for the first complete workflow. Their precise dependencies are recorded in document 13; do not assume every earlier letter or phase must be built before an independent branch.

### Builder handoff and completion rules

Before editing, inspect current code and prerequisite evidence, settle the selected entry's outstanding formulas/thresholds and geometry rules, then present the bounded scope and acceptance tests. Do not implement an unresolved detector or synthesis rule merely because a checklist names it.

Every delivery includes its applicable data validation, saving/restoring, undo, source lineage, failure behavior, automated checks, 3–5 visual acceptance steps and updated records. Later phases extend those capabilities rather than repairing deliberately incomplete early persistence. Keep numerical geometry work and receiver integration bounded even when they expose few controls.

The first implementation is R1A only after R0A–R0C contracts and explicit authorization. Geometry plus metadata export in R8 does not establish that Tangent interprets the metadata; that is a separate R9C integration gate.

Astra Medium resolves geometry, semantics, contracts and conflicting evidence. Sol Medium implements bounded batches whose contracts are settled. No automatic model switching or delegation. Every implementation batch requires a scope proposal and explicit authorization, automated checks, 3–5 visual acceptance tests and updated source/verification records. Publication requires separate explicit authorization.

After R1B, ordinary feature batches use development-mode verification: focused automated checks for behavior changed by the batch, several representative visual acceptance scenarios, and a usable local preview after every batch. Exhaustive migration, capacity, recovery and performance certification runs at meaningful phase checkpoints and whenever a batch changes those systems or their contracts. A prior certified result remains applicable when the relevant source and deployment have not changed. This workflow does not relax geometry correctness, atomic failure or saved-state requirements; it avoids rerunning unrelated certification for an isolated feature change. Publication always requires separate explicit authorization.

Keep the established Tangent-derived shell, stable canvas, independent display controls, collapsed panels, and Light/Dark/Neo design language. Do not redesign the interface gratuitously or expose inert controls. Original sites, source, experiments and browser data remain untouched. Only dist/ is public; guides and raw source references remain outside it.

## 8. Deferred scope

Advanced linked-field simulation, complete cell topology, all Atlas patterns, triangular/radial and progressive-growth generators, rich receiver editing and secondary/internal weave belong to later bounded phases. Native DWG is a separate compatibility question.

Literal textile physics, automatic architectural judgment, AI interpretation as a dependency, automatic 3D/building generation, unlimited unrelated source families and live cross-tool synchronization are not initial goals.

## 9. Next action and reading order

Next: **R0A — source and geometry contracts**, then R0B and R0C. A combined R0 planning engagement is possible; it does not authorize implementation. Phase 2A remains unchanged.

1. This master guide — conceptual goals, boundaries and sequence.
2. [12 — Phased plan](12-PHASED-DEVELOPMENT-PLAN.md) — complete capability checklist and phase gates.
3. [13 — Build batches](13-BUILD-BATCHES.md) — individual scopes, dependencies and exits.
4. [14 — Builder checklists](14-BUILDER-CHECKLISTS.md) — execution to-dos, decision gates, data obligations and verification scenarios.
5. [02 — Current state](02-STATE-DECISIONS-AND-TESTS.md), [04 — Model handoff](04-SOL-CHECKPOINT.md), and the selected batch's settled contract — actual readiness and authorization.






## Current family foundation - 2026-09-18

Build `WF-FAMILY-FOUNDATION-20260918` establishes stable per-family identity and export-ready organization around the accepted geometry/storage architecture. See document 79. The next bounded batch is per-family post-influence SVG/DXF export with explicit units and provenance. It follows settled architecture. Richer W3 presets remain after that bounded export foundation; W4 connections, W5 analysis, W6 points and W7 polylines remain in sequence. No publication is authorized.
## W2 crossing-control repair - 2026-09-18

Build `WF-W2-CROSSING-CONTROLS-20260918` completes approved Build 1 only. Typed Thread Width, Outline Line Weight and Visual Hierarchy now consume the validated value captured before synchronous redraw, eliminating snap-back. Selected crossings are immutable records bound to exact geometry, event and segment-pair identity; Swap writes the explicit opposite upper-thread override, retains selection and reports the resulting upper thread. Unresolved crossings require an explicit choice instead of an arbitrary swap. Thirty affected tests, syntax and static checks pass. Managed browser verified width `1`, outline `0.5`, assigned crossing swap, one override and Undo restoration on an 81-crossing fixture; all temporary edits were undone. Document 80 contains evidence and five visual tests. Build 2 automation has not begun; no publication.
## Build 1 Phase 1B named crossing modes — 2026-09-18

Build `WF-B1-P1B-NAMED-RULES-20260918` locally completes Phase 1B. Named preset, 1/1, 2/1, grouped N/M, and legacy priority controls now map onto existing validated `interlacing-v2`, show their effective sequence, save automatically, and survive reload without changing geometry or compact bytes. Thirty-three focused tests and managed-browser save/reload verification pass. Phase 1B awaits user visual acceptance; Build 1 is incomplete. Phase 1C family relationships is next and has not begun. See [document 81](81-BUILD-1-PHASE-1B-NAMED-CROSSING-MODES.md). No publication.
## Build 1 Phase 1B linked-recalculation correction — 2026-09-18

Build `WF-B1-P1B-LINKED-RULES-20260918` supersedes the initial Phase1B review build. Named repeat modes now save without stale selector redraw, target one family by default, retain an explicit Whole-Pattern Default, and force a fresh crossing presentation after any relevant rule, appearance, influence, or pattern change. Forty-seven focused tests and managed-browser family-rule plus attractor-to-crossing recalculation checks pass. Phase1B awaits user visual acceptance; Phase1C has not begun. See [document 82](82-BUILD-1-PHASE-1B-LINKED-RECALCULATION.md). No publication.
