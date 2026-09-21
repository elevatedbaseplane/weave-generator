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

## Deterministic dense setup repaired — 2026-09-17

Document65 identifies the new failure as prepareDenseViewport, after successful import/restore/selection. Raw19-44-59 evidence remains unchanged (SHA25616b4d6615434aeb5fe58c637ea9977fb6542bc24ae9e5e82ba44adfbb9ae3eed). Native wheel rounding yielded2.000000028858911 versus an unrealistic1e-12 wait around2. Verifier view setup now dispatches a double-precision DOM wheel event through the actual handler, immediately verifies unchanged anchor and exact native-pointer round trips, and reports separate stages plus DOM/view diagnostics. Measured drags remain native. Thirteen focused tests pass with actual production handlers in a VM, captured-failure replay, full post-import setup sequence and negative diagnostics; this is not a live-browser pass. All production hashes and14 inherited checks remain intact. One final bundled host-browser continuation is necessary; no unrelated proofs, SP1 or publication. See docs/65-R1-DETERMINISTIC-DENSE-SETUP.md.

## Dense pointer verifier precision repair — 2026-09-17

Preserved browser-2026-09-17T19-38-15-107Z.json and its hash in docs/evidence/r1-checkpoint-20260917/pointer-repair-review.json. The host completed two dense requests: worker165.1/179.5ms, total322.1/380.9ms, render19.7/20.5ms. It then failed an exact coordinate assertion because native pointer precision at fitted scale1.35 produced x0.999982 instead of1. Counts remained exactly29975/30393. This is a verifier input-generation defect, not a failed geometry/performance gate. scripts/r1-dense-pointer.cjs now uses a real wheel gesture to choose integral display scale2, checks float32 round-trip representability for both targets, and retains exact input/count/certificate assertions. Geometry, workload, application source and all thresholds remain unchanged. Nine focused pointer/contract/selection tests and verifier syntax pass. No unrelated proofs or repeated blocked Chrome launch. Fourteen prior checks and all raw failures remain preserved. One final bundled host command remains to finish the30-cycle workload; two cycles cannot certify p95. R1 remains unresolved; SP1 and further publication remain on hold.

## R1 checkpoint continuation blocked at browser launch — 2026-09-17

On the user's continue instruction, ran the existing bundled browser-only continuation inside Codex. Chrome launch failed with spawn EPERM before any new browser check. Preserved raw evidence: docs/evidence/r1-checkpoint-20260917/browser-2026-09-17T19-22-32-087Z.json. This is an environment launch failure, not a product or performance result. The14 inherited checks and prior exact-equivalence/worker results remain unchanged. No proofs reran, no implementation or publication occurred. One external execution of scripts/verify-r1-checkpoint-browser-only.ps1 is still required for this major-phase checkpoint. R1 stays unresolved, SP1 stays on hold, and the private site remains version4.

## Current private publication — 2026-09-17

At the user's explicit request before the remaining host check, the current R1 tool was published successfully to https://weave-foundation.notbrandon175.chatgpt.site (owner-private), Site version4, source c13fc6ad03dacf90a9cc4ec216cbc72d46eebaad, version ID appgprj_6aa83001d03481918d4a13e46c9612fb~appgver_217d30ea54908191b2abcf2adaa57ff2, deployment appgdep_6aac3b7ce1748191aa3c46c5681d1c34. Native deployment status succeeded at2026-09-17T19:12:06Z. Static and syntax checks passed. Windows lacked bash for the package wrapper; the same Sites prepare-site-build.cjs plus Windows tar produced the validated static-only archive. No application code changed during publishing. Browser data remains origin-local: localhost work requires portable backup/import to this site. R1 browser certification remains outstanding; publication is not acceptance and SP1 stays on hold.

## User-authorized private publication before R1 checkpoint — 2026-09-17

The user explicitly requested publishing the current tool before performing the outstanding bundled host-browser run. This supersedes the publication hold for this release only. Publish the current R1 prepared-evaluation repair to the existing owner-private Foundation site; retain the unresolved browser checkpoint and all failed evidence. Publication does not certify R1 and does not authorize SP1 or further features. No application source change is included in publication preparation. Network publication permission granted for this session.

## Approved request-local evaluator repair implemented — 2026-09-17

Document64 records the approved document63 repair. Only dist/combined.mjs changed: complete validation and influence sorting are reused within each derivation; public entry validation, numerical operations and outputs remain exact. Frozen17-fixture deep/canonical/hash/buffer/portable comparisons and24 rejection comparisons pass;15 focused behavior/selection checks and2 exact dense-contract checks pass. All40 production-worker outputs match the failed host geometry exactly. Before/after persistent median/p95/max276.040/313.366/323.236 →219.308/289.442/344.564ms; fresh median/max341.758/361.617 →270.301/281.072ms. All internal375/400ms gates pass; browser447.8ms failure remains preserved and R1 is not yet complete. Verifier replaces stale v2 segment proxy with exact v5 x0/x1 workload checks. A hash-bound applicability record preserves14 prior checks and allows only this approved source delta. One final bundled browser-only host command remains, including fresh default/pending smoke and30 dense cycles. No unrelated proofs, SP1 or publication. See docs/64-R1-PREPARED-EVALUATION-REPAIR.md.

## Exact failed-candidate worker review complete — 2026-09-17

Document63 records40 exact-equivalent evaluations (5warmup,30persistent,5fresh) of the unchanged failed host candidate. Warmed worker median/p95/max276.040/313.366/323.236ms; fresh median/max341.758/361.617ms. This supports cold-start overhead but does not erase or fully explain browser447.8ms failure. A source audit identifies59,912 repeated whole-generation validations plus repeated identical sorting per dense derivation. Recommend approved bounded request-local validation/order preparation, preserving every numeric operation and byte-level output; no implementation performed. Exact v2/v5 count audit also establishes that segments>30000 is a stale v2 fixture proxy; proposed versioned exact expectations preserve workload. See docs/63-R1-EXACT-CANDIDATE-WORKER-REVIEW.md for the approval scope and evidence. No host rerun, unrelated proof, architecture rewrite, SP1 or publication. R1 remains blocked on the actual worker gate.
## R1 actual host worker failure — 2026-09-17

Document 62 preserves browser-2026-09-17T18-36-42-095Z.json (SHA-256 C7510E738D9CAAD585B73C61B800274A41CEE40D58FDE44DB43FC7E9C5EC28CF). Selected-handle preparation succeeded. Dense center 0 committed complete certified v5 geometry but worker447.8ms exceeded the400ms maximum; total726.3ms and render32.4ms were below their maximums. No aggregate pass is claimed. Original14 checks remain preserved. Source creates a fresh worker per request whereas automated benchmarks warm a persistent worker; this is a review lead, not a proven root cause. Stop at the failed gate; do not rerun, modify implementation/thresholds, begin SP1 or publish. Next is bounded internal execution-performance review using the exact failed candidate; do not ask for another host run before that review.
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
Planning checkpoint — 2026-09-17: user confirms the R1D ancestry-repair features work. Broader R1 checkpoint certification remains outstanding. Document 56 (docs/56-STITCH-PRESET-RESEARCH-AND-PLAN.md) researches all eleven requested stitch labels and proposes finite-thread recipe sources, crossing/precedence support, certified lacing and staged library deliveries. This is a PROPOSED schedule insertion, not settled geometry or implementation authorization. Baseline remains WF-R1D-ANCESTRY-REPAIR-20260917; no application changes or publication. Next proposed work is the R1 checkpoint and SP0 recipe/source/crossing contract; substantial architecture remains before Sol implementation.

Current R1D repair — 2026-09-17: WF-R1D-ANCESTRY-REPAIR-20260917 fixes the incremental writer omitting updated carrier/boundary libraries and saved weave revisions while committing working geometry. Exact missing carrier ancestry is reconstructed from embedded source snapshots, using retained transaction manifests if needed, then fully certified and committed with the original root retained as previous. Missing/conflicting ancestry still fails closed. Prior UI fixes are retained. Focused codec/tree tests and 19 UI checks pass; host recovery confirmation remains pending. No R2A or publication.

Current blocker — 2026-09-17: user reports Make Square blocked again on EDIT-CLARITY. R1D is NOT accepted. Diagnostic build WF-R1D-STORAGE-DIAGNOSTIC-20260917 now displays the original startup validation error in the Boundary panel and preserves worker failure details instead of masking them. Underlying cause is not established from the generic screenshot. All prior visual/selection/spacing fixes remain; no saved data or validation rules changed. Obtain the detailed error from a freshly loaded preview before choosing a repair. No publication or R2A.

Latest local correction — 2026-09-17: `WF-R1D-EDIT-CLARITY-20260917` confines distortion fading to the undeformed Original Grid, keeps the last complete Derived result fully opaque during atomic replacement, highlights the active influence, supports workspace-wide deselection, and carries the latest field state through Pattern spacing recalculation and automatic save. Complete focused checks pass 89/89; the final UI/tree delta passes 27/27. Visual acceptance remains; R2A and publication remain closed. See document 54.

Current correction checkpoint — R1D legacy certificate compatibility repaired locally, 2026-09-17: build `WF-R1D-LEGACY-CERT-20260917` restores the exact original cubic interval operation for omitted/default Falloff 3. The generalized loop had added an outward-rounding step, so startup correctly rejected valid older schema-5 certificate bits and entered storage-blocked mode. No data is cleared or rewritten. An exact legacy fingerprint/segment/error fixture is locked; the complete focused R1 suite passes 83/83, with syntax, static, and served-module checks passing. Retest in a newly loaded tab at `http://127.0.0.1:43830/?r1d-legacy-cert=20260917`. R2A and publication remain closed. See document 53.
Current correction checkpoint — R1D Make Square commit repaired locally, 2026-09-17: build `WF-R1D-BOUNDARY-COMMIT-20260917` preserves atomic multi-tab conflict rejection while safely rebasing the independent new-Boundary command once onto the latest committed IndexedDB head. The Boundary panel now reports saving, sync/retry, success, or exact failure inline. Focused Boundary/carrier/tree/UI/storage/backup checks pass 45/45; syntax, static, and served-identity checks pass. Visual retest is required at `http://127.0.0.1:43830/?r1d-boundary-commit=20260917`. R2A and publication remain closed. See document 52.
Current correction checkpoint — R1D Pattern visibility, restore, and Falloff complete locally, 2026-09-16: build `WF-R1D-FLOW-RESTORE-20260916` removes redundant visible Boundary save controls, shows every newly created Pattern before a field exists, restores the latest saved field state when its Pattern is selected, and adds certified per-influence Falloff 1–5 while preserving omitted legacy values as exact Falloff 3. Focused carrier/display/tree/UI/geometry/worker/storage/backup checks pass 81/81; static and served-identity checks pass. Visual review is required at `http://127.0.0.1:43830/?r1d-flow-restore=20260916`. R2A and publication remain closed. See document 51.
# Current state, decisions and acceptance tests

Latest local correction — 2026-09-16: `WF-R1D-SIMPLE-FLOW-20260916` presents one current version per named object while preserving internal immutable recovery. Make Square and Create Weave Pattern now populate the tree immediately; Field Forces directly creates the first Influenced Grid; Pattern and Field edits preserve one another, recalculate through the worker, and save automatically. Same-name Boundary updates reclip attached Patterns. Original Grid replaces separate family style controls and fades under distortion. Focused checks pass 79/79; visual acceptance remains. R2A and publication remain closed. See document 50.

Latest local correction — 2026-09-16: build `WF-R1D-TREE-CLARITY-20260916` makes the saved hierarchy legible and fully collapsible without changing the saved model. Explicit object-type labels, revision/child counts, indentation, collapsible Boards, saved items, and Revision History groups are complete. Expansion choices persist across session rerenders. Focused checks pass 20/20 and static checks pass. Visual acceptance remains; R2A and publication remain closed. See document 49.

Latest local status — 2026-09-16: R1D build `WF-R1D-20260916` implements up to eight order-independent additive influences and deterministic per-family seeded spacing variation under v5 model/worker/derivation versions. Direct manipulation, influence selection, guides, add/duplicate/enable/reset/remove, Undo/Redo, save/reload, compact storage, migration and backup behavior are connected. Focused syntax and 48 checks pass; served identity and controls pass. Visual review and the broader R1 checkpoint remain. R2A and publication have not started. See document 46.

Current planning status — 2026-09-16: the user accepted R1C by instructing development to continue. `WF-R1C-INFLUENCE-SAVE-20260916` is the local executable baseline. Document 45 defines the next R1D contract and records the remaining material behavior choice: order-independent additive overlap and deterministic per-strand spacing-offset variation are recommended. No R1D implementation, R2 work, or publication has begun.

Latest local status — 2026-09-16: build `WF-R1C-INFLUENCE-SAVE-20260916` corrects the Field Forces save discoverability defect. A primary action in the influence panel now calls the established immutable transactional Weave revision path and explicitly saves the field, both family settings, certified geometry and lineage. Focused checks pass 28/28; syntax and served identity pass. No geometry, schema, storage or performance contract changed. R1C visual acceptance remains pending; R1D, R2 and publication remain closed. See document 44.

Latest local status — 2026-09-16: R1C build `WF-R1C-FAMILY-CONTROLS-20260916` adds independent Family A/B Strength and Tension under `weave-study-v4` while preserving one shared influence identity, type, position, radius, direction, falloff and enabled state. Legacy v2/v3 studies remain valid and promote only working state on edit. The lower-right canvas now exposes synchronized Display presets and core layer switches. Focused geometry/state/worker/UI/render checks pass 28/28; compact storage/backup/exact-round-trip checks pass 10/10; syntax and served identity pass. Managed Chrome smoke is blocked before navigation by known `spawn EPERM`; visual acceptance remains pending. R1D, R2 and publication remain closed. See document 43.

Latest status — 2026-09-16: compact codec contract 26 and transactional repair are implemented locally in `WF-R1B-IDB-20260916`. Maximum capacity proof passes; 56 automated tests and static checks pass. Browser verification is pending normal-host execution after managed Chrome `spawn EPERM`; see [27](27-R1B-TRANSACTIONAL-STORAGE-IMPLEMENTATION.md). No publication or R1C.

Latest status — 2026-09-16: user approved storage review 24; initial implementation has STOPPED on backup capacity as required. Four focused codec tests passed, but complete geometry with 19,946 fragments requires at least 10,596,086 encoded bytes against 10,485,760. See [25](25-R1B-STORAGE-CAPACITY-EVIDENCE.md) and archived executable evidence. No production app integration, IDB browser capacity/migration/performance pass, publication or R1C is claimed. Earlier failure evidence and tests remain preserved.

Current status — 2026-09-16: R1B browser acceptance is FAILED. Structured request 7 evidence proves worker success (259.7 ms) followed by storage commit failure and total 909 ms. [Storage review 24](24-R1B-STORAGE-ARCHITECTURAL-REVIEW.md) preserves evidence and exact reconstructed sizes, recommends transactional IndexedDB with exact payloads and portable JSON, and defines migration/concurrency/recovery plus capacity and timing gates. Proposal only; approval and implementation authorization pending. No production/test code changed in this review; no publication or R1C. Earlier 52-test automated pass remains valid for its recorded source and does not establish browser acceptance.

## R1B implementation — host browser gate pending, 2026-09-16

The approved documents 20+22 are implemented locally as build candidate `WF-R1B-20260916`. All 51 automated tests and static/syntax checks pass. Latest dense certified-kernel results are p50 187.05 ms, p95 206.35 ms and max 207.03 ms, within the 300/400 ms worker-computation gate. See [23](23-R1B-IMPLEMENTATION-AND-VERIFICATION.md).

Full local verification is not yet claimed: the managed sandbox cannot launch Chrome (`spawn EPERM`). The prepared host runner must still establish pending <=50 ms, browser-worker p95/max <=300/400 ms, atomic completion p95/max <=500/750 ms, and no attributable main-thread task >=50 ms. No publication, R1C, Tangent or Overlap change occurred.

## R1B worker architectural review drafted — 2026-09-16

[22-R1B-WORKER-EXECUTION-PROPOSAL.md](22-R1B-WORKER-EXECUTION-PROPOSAL.md) proposes a dedicated latest-request module worker after evidence 21 measured optimized synchronous derivation p95 205.72 ms. It preserves document 20's equation, epsilon, interval certification, full workload, analytical clipping, complete output, persistence and atomic commits. Pending display retains and labels the last complete geometry while the authored guide follows the transient candidate. Exact request/base/input/version identities, coalescing, worker termination, stale-result rejection, async v2 load/import validation, undo, pending save/export restrictions and worker-unavailable behavior are specified.

Proposed supported-host gates separate UI from computation: input handlers p95 <=8 ms, pending visible p95 <=50 ms, no attributable main-thread task >=50 ms; dense worker evaluator p95 <=300 ms/max 400 ms; dense final request through atomic persistence p95 <=500 ms/max 750 ms. These are review recommendations, not test passes. Worker-local caches may optimize but cannot be necessary for cold correctness or acceptance.

Planning only. No executable source, test, browser, site, R1C, Tangent or Overlap change occurred. Verified R1A and the frozen private Phase 2A site remain unchanged. Approval and explicit renewed R1B implementation authorization are required before Sol Medium handoff.

## R1B stopped at representative performance gate — 2026-09-16

The user approved proposal 20 and authorized its exact implementation, with an explicit stop condition. The interval-certified prototype achieved maximum segment error 0.012499422899545623 against epsilon 0.0125 and analytical clipping completed. After a boundary-edge index reduced edge tests from about 3.0 million to 3,382, 30 warmed dense/100-edge derivations still measured p50 181.01 ms, p95 205.72 ms and maximum 206.20 ms, above the required p95 <=100 ms. The complete edit/derive path measured p95 244.91 ms.

Per the stop instruction, no accuracy, workload, completeness, atomicity or performance requirement was weakened. Prototype executable changes were removed; all 43 preserved R1A tests pass and executable content matches the verified R1A baseline. See [21](21-R1B-ARCHITECTURAL-REVIEW-EVIDENCE.md). No R1B build/browser pass/publication is claimed. R1C, Tangent and Overlap remain untouched. Architectural review is required before implementation resumes.

## R1B architectural proposal — review pending, 2026-09-16

User authorized planning only. [20-R1B-ATTRACTOR-PROPOSAL.md](20-R1B-ATTRACTOR-PROPOSAL.md) defines one smooth radial attractor, distinct strength/tension behavior, complete expanded source enumeration, a derived second-derivative approximation bound, floating-point enclosure requirements, versioned analytical clipping, controls, candidate work limits, schema-5/v1-v2 compatibility, immutable state/undo and automated fixtures plus five visual tests. The proposal explicitly limits its accuracy claim to the unclipped curve-to-polyline relationship; continuous-curve clipping topology is not certified. Defaults are engineering recommendations, not measured or approved behavior.

Reviewed current master/plan/schedule/checklists, R0 contracts, actual source and R1A evidence. R1A remains locally verified at implementation `15fa7772f3e37c0840fd944f015a4d1fbd580828`, verification-record HEAD `f07a63f9d884110b2debfa9a1284205695e2755a`; its 43 automated and nine host-browser passes are retained without rerunning unchanged application code. Browser evidence still reports 15/38/47 ms and no errors. The private Phase 2A version 3 / WF-2A-20260914 remains unchanged. No R1B code, executable experiment, browser operation, publication or new test pass is claimed.

Pending review: shared A/B deformation preserving full-plane crossing structure, compact fixed falloff, and tension as geometric resistance/profile control. Numerical enclosure implementation and nonlinear performance remain required validation evidence. Sol Medium handoff is only after approval is recorded and explicit R1B implementation authorization; then the specified batch follows established decisions, with architecture reopened for contradictory evidence. R1C/R1D/R2 are not authorized.

## R1A implementation complete and locally verified — 2026-09-16

Build `WF-R1A-20260916`, source `15fa7772f3e37c0840fd944f015a4d1fbd580828`, completed the exact authorized R1A scope. All 43 automated tests, syntax/static checks and local browser verification pass. Browser evidence reports spacing gesture 15 ms, save 38 ms, reload 47 ms, zero page errors, schema-3 recovery, 9/9 identity output, display independence, undo, immutable reload, concave gaps, hidden raw SVG export, isolated backup transfer and responsive themes. Screenshots were visually reviewed. See [19-R1A-VERIFICATION.md](19-R1A-VERIFICATION.md).

R1A is frozen locally. It has not been published or live-accepted; private Site version 3 remains `WF-2A-20260914`. Do not begin R1B. R1B nonlinear accuracy/field behavior and R2C/R2D design decisions retain their architectural gates and require new proposals and explicit authorization.

## R1A local implementation — browser verification pending (superseded)

Build WF-R1A-20260916 implements the authorized scope. [19-R1A-VERIFICATION.md](19-R1A-VERIFICATION.md) records 43 passing automated tests, syntax/static checks, identity p95 23.52 ms and separate five-revision model/storage measurements. Browser startup is blocked by Windows sandbox IPC/EPERM; the localhost server responds 200 but no browser pass is claimed. A host PowerShell runner was prepared and requested. R1A remains short of its full verification gate. No source release, publication or R1B start; private Site version 3 remains unchanged.

## R1A authorized — 2026-09-16

User approved revised R0 contracts as applicable to R1A and authorized the exact scope in 17/18, automated checks, local browser verification and records. R1A decisions are settled. Implementation is underway locally; publication and R1B are explicitly forbidden. R1B accuracy/field and R2C/R2D behavior gates remain deferred. Earlier approval-pending entries below are historical.

## R0 engineering review complete — 2026-09-16

[18-R0-REVIEW-AND-DECISIONS.md](18-R0-REVIEW-AND-DECISIONS.md) reviews authority, accepted Phase 2A contracts and actual source, and revises documents 15–17. Unsupported sampling guarantees and universal subdivision caps are withdrawn; exact R1A needs no approximation. Source-revision context, primitive split identity, candidate enumeration, collective invalidation, lock conflicts, raw schema migration, fork rebasing and basic SVG export are corrected. Later material behavior choices have R1B/R2C/R2D deadlines and do not block R1A.

Recommend package/scope approval, not yet granted. R1A: identity Weave Study from saved carrier, independent overlays, immutable schema-4 persistence/backup/undo, raw derived SVG. After recorded approval, implementation follows established decisions and is suitable for Sol Medium; explicit implementation and separate publication authorization remain required. R1B still requires architectural reasoning.

Read-only comparison found no dist/ or tests/ changes from accepted 002ae94dacade531deb6c88a1414fbe6367b8356; checkout HEAD is 2120620b8a5e2b45af920846753a0744eba4b671. Tangent reference is clean at a6cc3c2826b4e55f311b6a9e06b7d94c2ffe02a6; deployed parity was not queried. No application test, executable experiment, live check, code change, model switch or publication occurred. Existing evidence is preserved; pre-existing documentation edits remain uncommitted. Private Site version 3 / WF-2A-20260914 stays frozen.

## R0A–R0C planning package drafted — 2026-09-16

[15-R0A-SOURCE-GEOMETRY-CONTRACT.md](15-R0A-SOURCE-GEOMETRY-CONTRACT.md) now gives a concrete recommended default, consequences and required validation evidence for each previously open R0A decision. [16-R0B-EDITING-DEPENDENCY-CONTRACT.md](16-R0B-EDITING-DEPENDENCY-CONTRACT.md) defines proposed manual-edit, exclusion, lock, invalidation, revision, migration and undo behavior. [17-R0C-FIXTURES-EXCHANGE-R1A-BRIEF.md](17-R0C-FIXTURES-EXCHANGE-R1A-BRIEF.md) records the four relational fixtures, current Tangent build-04 source evidence, proposed geometry-plus-metadata envelope, units/workload policy and the bounded R1A implementation brief.

All new behavior remains a recommendation pending R0 package approval. No implementation, executable verification, browser operation, model switch, Site change or publication occurred. The accepted Phase 2A private baseline remains frozen at Site version 3, build `WF-2A-20260914`, source `002ae94dacade531deb6c88a1414fbe6367b8356`. R1A may return to Sol Medium only after the R0 decisions are approved or revised and recorded as settled, followed by explicit implementation authorization.

## R0A planning started — 2026-09-16

[15-R0A-SOURCE-GEOMETRY-CONTRACT.md](15-R0A-SOURCE-GEOMETRY-CONTRACT.md) records the first draft source/geometry contract after reviewing the accepted Phase 2A model and the current R0–R12 authority. It preserves `rect-v1`, strict analytical clipping, source path identities and the frozen private baseline. Five R0A decisions remain open: committed derived representation, numeric approximation error, first manual primitive set, evaluation domain outside the boundary and strict cross-revision correspondence. This is documentation-only planning; no application code, tests, model switch, Site operation or publication was performed. R0B, R0C and R1A remain blocked.

## Master framework and build-plan consolidation — 2026-09-16

At the user's request, [00-MASTER-GUIDE.md](00-MASTER-GUIDE.md) is updated to version 3.1 with the new conceptual framework, designer agency, complete R0–R12 batch summary, milestones, builder completion rules and explicit reading order. Documents 12–14 remain the detailed phase, schedule and execution references. The next task is R0A planning; unresolved numerical contracts are not represented as implementation-ready. Documentation only: accepted Phase 2A, application code, private sites and publication status are unchanged.

## Current builder guidance — 2026-09-16

The user requested advice on batch size and specific to-dos for the building chat. [14-BUILDER-CHECKLISTS.md](14-BUILDER-CHECKLISTS.md) now expands all 63 entries with explicit tasks, prerequisites, decision gates, durable-data obligations and batch-specific verification scenarios. It permits proposing combined deliveries for small related entries without losing their exits; 3–5 features is a guideline, not a quota or mandatory release boundary. R10M now explicitly depends on R10D for zone-origin support.

No batch was executed or authorized by this update. Future formulas, tolerances and complex algorithms remain decision gates, not fabricated settled contracts. Only documentation changed; Phase 2A, private sites and saved user data remain untouched. Next remains R0 planning, followed by an explicitly authorized bounded implementation.

## Current batch breakdown — 2026-09-16

The user requested manageable implementation batches for every phase. [13-BUILD-BATCHES.md](13-BUILD-BATCHES.md) now defines 63 bounded entries: 3 R0 planning batches and 60 future build/integration batches, including optional and conditional extensions. These are scope envelopes, not 63 authorized releases or fixed effort estimates. Most have four additions; all carry dependencies and observable exits, plus the shared save/undo/lineage/verification requirements. The core workflow ends at R8C; R8D DXF is optional. R9C requires separately authorized receiver work; R10–R12 are selectable later branches.

R0A is next. No R0 decisions were executed and no implementation, tests, deployment or model switch occurred in this documentation update. Phase 2A remains frozen. The phase plan and handoff use the new batch IDs; previous two-batch suggestions are superseded. Implementation and publication still require separate authorization.

## Current goals and phased roadmap — 2026-09-16

The user authorized updating project goals and creating a comprehensive simple-to-complex development plan. [00-MASTER-GUIDE.md](00-MASTER-GUIDE.md) is now a consolidated version 3 guide; [12-PHASED-DEVELOPMENT-PLAN.md](12-PHASED-DEVELOPMENT-PLAN.md) is the authoritative R0–R12 checklist. It incorporates the relational framework and practical seven-workspace workflow, explicit strand authorship, separate intensity/significance, relational weighting, synthesis alternatives, geometry-plus-metadata exchange and visual lineage. The former master and model handoff are archived; earlier planning entries below are history, not current instructions.

Actual implementation remains frozen at accepted Phase 2A / private Site version 3 / WF-2A-20260914 / commit 002ae94dacade531deb6c88a1414fbe6367b8356. Nothing from R0–R12 has been implemented or tested. Changes in this task are documentation only. No private-site changes, receiver changes, model switching, delegation, source commit or publication performed.

Next: R0 shared contracts and a bounded R1A proposal. The plan's approach starts with deformation of identifiable carriers; progressive growth, rich mutual interaction and general region topology come later. Metadata and identity contracts begin early, while actual radius consumption has its own receiver gate. Every batch needs automated checks, 3–5 visual acceptance tests and updated records. Implementation and publication each require explicit authorization. Tests described in the plan are future acceptance criteria, not reported passes.

## Historical planning and release entries

## Current conceptual update — 2026-09-16

The user's new Detailed Goals and Conceptual Framework takes precedence. [11-RELATIONAL-FIELD-DIRECTION.md](11-RELATIONAL-FIELD-DIRECTION.md) blends it with compatible prior decisions. Core changes: relational/collective analysis, measurable intensity, significant-point selection, closed-polyline synthesis beyond tracing, downstream relational/radius information, and eventual secondary/internal weaves. The previous compressed-seam example and C1–C3 sequence are provisional reference material, no longer the current implementation handoff. Specifics are to be worked through next. Documentation only; no application, site, model or release changes. Phase 2A remains frozen, with separate implementation/publication authorization gates.

## Current planning checkpoint — 2026-09-15

Phase 2A is implemented and user-accepted at private Site version 3, build `WF-2A-20260914`, source `002ae94dacade531deb6c88a1414fbe6367b8356`; evidence is in [08-PHASE-2A-VERIFICATION.md](08-PHASE-2A-VERIFICATION.md). This corrects the stale Phase 1B/current-state wording below without rewriting historical evidence.

The user requested that the revised direction be pinned and the first example's contracts settled. [09-REVISED-MASTER-DIRECTION.md](09-REVISED-MASTER-DIRECTION.md) is now the planning entry point; [10-COMPRESSED-SEAM-CONTRACT.md](10-COMPRESSED-SEAM-CONTRACT.md) specifies the first bounded example. New detector thresholds and visual defaults are documented design decisions for evaluation, not user-tested results. Documentation only: no application code, tests, site, or release changed; no implementation or publication authorized. No model switch or delegation performed. Original data and downstream tools remain unchanged.

Settled direction: analytical markings report conditions independently of weave operations; interpretations remain editable; first extraction follows seams/interfaces; broader curated points and deliberate closed forms remain core goals. First example uses controlled compression, an open center trace, and an explicit supporting-thread band outline; automatic radii and rich downstream metadata remain later contracts.

Next action: review the pinned direction and first-example contract. C1–C3 are separately authorized future batches, each with automated verification, 3–5 visual tests and updated records. Sol Medium implements specified behavior after authorization; Astra Medium resolves new semantics or contradictory evidence. Publication requires separate authorization.

## Maintained foundation state — 2026-09-14

Latest user report: Phase 1B live acceptance passed. Current work is documentation-only: the Phase 2A carrier contract in 07-PHASE-2-CARRIER-PROPOSAL.md is explicitly approved as proposed and its decisions are settled. No Phase 2 implementation or publication is authorized. Future proposals include scope/build/remains/automated checks and 3–5 simple live tests; exhaustive rejection tests stay automated. Existing deployment evidence is retained, not rerun for this records-only update.

This section supersedes the historical starting record below. See [verification](05-VERIFICATION.md) and [Sol checkpoint / next batch](04-SOL-CHECKPOINT.md) for evidence and exact scope.

- Current rebuild checkout: `C:/Users/notbr/Documents/Codex/2026-09-14/confirm-you-have-editable-terminal-access/work/weave-rebuild`, branch `foundation`, derived from baseline `44953adacf6b6a47fb93447be177cbd7710428f5`.
- Rebuild Site created once: `appgprj_6aa83001d03481918d4a13e46c9612fb`, title Weave Generator — Foundation, slug weave-foundation. It is a separate owner-private destination. The original manifest was moved to reference/legacy-hosting.json; active .openai/hosting.json names only the rebuild.
- Build label: `WF-1B-20260914`. Phase 1A remains intact. Phase 1B adds staged import of exactly one closed straight SVG boundary, explicit transform/Y conversion, non-destructive rejection/Cancel, one-operation Apply, and optional source metadata preserved through revisions, reload and backup.
- Verification: 17 automated tests, public module syntax and static output checks pass; local browser checks pass as listed in 06-PHASE-1B-VERIFICATION.md. Phase 1A live acceptance passed by the user. Phase 1B live acceptance passed, as explicitly reported by the user.
- User decisions settled: preserve original site/data; raw legacy backups before migration; versioned named saves/latest pointer; separate owner-private rebuild; browser-local saves + JSON backups. No migration or cloud sync was performed.
- Raw legacy browser backup remains outstanding. This does not block an isolated rebuild namespace, and must block any future migration of original storage.
- Original unpublished experiments remain untouched in work/weave-generator and the external preservation package. The current foundation does not apply them.
- Latest completed task scope: Phase 1B straight-SVG boundary import only. No carrier or interaction implementation began.
- Phase 1B implementation commit: `e2bb9f844207a403b2fe7e52bbc7c9c1b69a018d`. Working branch remains foundation; rebuild remote targets only the private Foundation Site.
- Publication **succeeded privately**: Site version 2 records the exact Phase 1B commit; deployment `appgdep_6aa8490eb0b881918d8c202f518b346b` succeeded at `https://weave-foundation.notbrandon175.chatgpt.site`. Live readback confirmed build `WF-1B-20260914`, schema 2, storage available, visible import controls, sole viewer owner and zero groups. The original sites remain untouched.
- Package prepared and validated: `C:/Users/notbr/Documents/Codex/2026-09-14/confirm-you-have-editable-terminal-access/outputs/weave-foundation-1b.tar.gz`, SHA-256 `1055f9443611a096149ce7281b5e4e00a38b9924b67cee2ba1fd281cd3bc2d93`. Contains ten public files plus the rebuild manifest; all public files match the committed source byte-for-byte.
- Phase 1 foundation release checkpoint: **reached privately**. The Sol Medium checkpoint is reached. Bounded Phase 2A implementation follows established decisions, but the user explicitly instructed not to begin yet. Switch to Sol Medium and await a start instruction. Later modes and contract changes require architectural reasoning.
- The private Phase 1B release is available at `https://weave-foundation.notbrandon175.chatgpt.site`. Browser data remains origin-local and requires JSON backup for portability.
- User acceptance: Phase 1A passed; Phase 1B passed. Use the exact actions in 06-PHASE-1B-VERIFICATION.md.

## Archived starting record — retained for context, not current status

**Record date:** 14 September 2026. Update after each release. This is a starting record, not proof that future sessions have the same source or live version.

## 1. Verified source and deployment context

| Item | Record |
| --- | --- |
| Existing site | https://weave-generator.notbrandon175.chatgpt.site |
| Existing Sites project ID | `appgprj_6aa6ca6ed94c81919e8ce2d122d91b80` |
| Last Sites metadata checked in this conversation | Version 39; current user was owner; custom owner-only access. Not queried again during guide authoring. |
| Committed repository HEAD, rechecked during guide authoring | `44953adacf6b6a47fb93447be177cbd7710428f5` — Balance dense interaction sampling |
| Branch | `main` |
| Current local checkout | `C:/Users/notbr/Documents/Codex/2026-09-14/confirm-you-have-editable-terminal-access/work/weave-generator` |
| Source layout | Static files in `dist/`; `.openai/hosting.json` binds the existing site. |
| Source remote, without credentials | `https://git.chatgpt-team.site/9d7c4f37-d22b-4dda-a730-e5d0b3bcd285/appgprj_6aa6ca6ed94c81919e8ce2d122d91b80.git` |
| Original Tangent reference | https://tangent-systems.notbrandon175.chatgpt.site/ ; historical project ID `appgprj_6aa43e7745588191a0338eb9a8fc3b3f`. Its current source/import support has not been checked here. |

The old `/workspace/sites/weave-generator` path was absent on this Windows host. Source recovery succeeded directly through Sites: identify the existing project, obtain a short-lived source credential, and clone its returned remote/branch. The user did not need to download the source manually. Reuse the existing project ID for recovery; never create a replacement just because a checkout is missing.

Environment-specific recovery notes: bundled Git's HTTPS helper required the explicit bundled `mingw64/bin` exec path. After network permission was granted, Git's `openssl` TLS backend worked where `schannel` failed. These are observed fixes, not commands to apply blindly everywhere. Credentials were used per command, not stored in the remote. Request network access through the available permission tool when required; do not disable TLS verification.

## 2. Unfinished experiments in this conversation

After recovering source, this chat started point-extraction changes, then paused when the user requested a foundational reassessment. These experiments predate full reconciliation of the expanded interaction-first goals. **Do not deploy or treat them as an approved foundation.**

Dirty files rechecked during guide authoring:

```text
 M dist/app.mjs
 M dist/index.html
?? dist/point-extraction.mjs
?? tests/point-extraction.test.mjs
```

Experimental changes: crossing-derived points from the existing capped event map, document-coordinate conversion, boundary filtering, pin/filter behavior, saved Point Set restoration, and same-name save changed to a new variation. The latter was done before the historical replacement request was fully reconciled. Review it against decision D1 below.

Evidence limits: syntax check passed earlier; the 12 then-existing tests passed with `node --test --test-isolation=none tests/*.test.mjs` because this host blocked the test runner's default child-process spawning. A new point-extraction test file was added afterward and was not run before the pause. Local browser checks demonstrated one point-set save with hidden markers and restoration on refresh. They did not establish complete correctness, dense/rotated behavior, all themes, or production readiness. There was no deployment from this chat.

The package includes a committed source archive and Git bundle separately from the experimental diff/untracked files. These are preservation copies, not a new release. Browser-saved boards are not included: they live in each browser origin's storage. The localhost preview is not evidence of the live site's stored studies.

## 3. Reconciled maturity

| Area | Current evidence and consequence |
| --- | --- |
| Tangent-derived shell, boundaries, lattice, fields | Implemented; useful references. User confirmations cover some earlier behaviors, not a comprehensive current regression pass. |
| Family controls and deterministic deformation | Implemented, with unit coverage; semantic family assignment and state integration need redesign. |
| Interaction grammar | Implemented but incomplete/unreliable as a final model; dense cap and sampled geometry limit downstream use. |
| Dense event balancing | Synthetic spread tested in historical chat 4; not proof of complete interactions or satisfactory spatial reading. |
| Visibility, restoration, drag | Repeated partial fixes; crossing-marker workspace shift and embedded/new-tab discrepancies remained user-reported. |
| Point extraction in committed source | End/midpoint samples; selection and saving present but insufficient for the expanded goal. |
| Polyline preview | Consecutive triples with elementary rejection; explicitly a placeholder, not the desired connector. |
| Field links, interstices, relation graph | Planned, not established working. |
| Export/Tangent/Overlap integration | No verified end-to-end Weave export artifact in the reports; vendor files do not prove integration. |

## 4. Decision register

Current user statements retain all expanded goals, require simple foundational layers, allow internal implementation changes, require separate weave/point/polyline export with polyline handoff to Tangent, and require live publication/reporting for each completed batch.

| ID | Conflict or unknown | Recommended resolution | Decide by |
| --- | --- | --- | --- |
| D1 | Chat 2 explicitly requested same-name replacement; ancestry requirements prohibit silent source mutation. | Versioned named saves with a latest pointer; old dependents retain their source revision. Confirm visible behavior. | Phase 1 persistence design. |
| D2 | Old grid toggle hid grid/frame/source lattice together; later instructions separated them. | Separate grid/frame, boundary, source-lattice visibility, initially off; selecting fields cannot change them. | Phase 1 UI. |
| D3 | User valued live response; full live analysis caused lag. | Live carrier during drag, expensive analysis hidden/deferred until release; only add live analysis if measured stable. | Phase 3/4. |
| D4 | Triangular/radial modes plus exactly two families; legacy parity assignment is provisional. | Explicit family/path roles per mode, illustrated with small fixtures. | Phase 2. |
| D5 | Preserve original site versus publish every new batch. | Publish rebuild batches to a separate owner-private development site; retain original. This is recommended, not yet approved or created. | Before first rebuild deployment. |
| D6 | Existing saved boards may matter; migration preference unknown. | Preserve raw backups first; decide supported migration versus read-only legacy reference. No silent discard. | Before schema replacement. |
| D7 | Units, scale, exact Tangent import contract and DWG expectation unresolved. | Inspect Tangent and test a sample; propose SVG/DXF plus versioned metadata first; keep native DWG separately scoped. | Contract in Phase 1; verify before export claims. |
| D8 | Advanced stitches/field links/spatial tags are desired but not algorithmically defined. | Write a behavior card and synthetic example per operation; ask only about materially ambiguous outcomes. | Before the relevant Phase 5/6 batch. |
| D9 | Architectural performance scale and expected density unknown. | Use existing dense failure cases plus measured synthetic cases; agree a supported workload without guessed promises. | Phase 3/4 performance gates. |
| D10 | Rich Tangent/Overlap metadata and Reading Sheet were proposals in reports; user now retains expanded goals. | Preserve roadmap scope; first deliver correct portable outputs. Do not modify downstream tools without a scoped request. | Phase 9/integration work. |

No current choice requires the user to invent an algorithm. The builder should recommend behavior with examples. Later phase questions should not block a protected foundation unnecessarily.

## 5. Historical traps → required regressions

| Failure | Test and expected result |
| --- | --- |
| Saved boundaries missing or replacing each other | Save A/B/C, refresh, select each. Each remains independently available and exactly closed. |
| Imported geometry invisible or silently rescaled | Import known asymmetric geometry with declared units; verify documented fit/orientation and downstream round trip. |
| Boundary clip only cosmetic | On concave boundary, inspect analysis/export coordinates as well as screen clipping. No unintended out-of-bound output. |
| Same-name save mutates ancestry | Derive points from revision A, update named weave to B. A's dependent points retain A. |
| Family visibility shifts/blackens canvas | Toggle A/B individually and together repeatedly; camera, boundary and remaining geometry do not move. |
| Field response absent from long lines | A field intersecting the middle of a long path deforms it even with distant endpoints. |
| Drag/rotation mismatch | Rotate lattice, drag marker; marker, extent and deformation remain aligned with the cursor. |
| Tension/zero values incorrect | Tension 100 retains the straight family basis; zero field strength has no effect. |
| Seed/save mismatch | Reopen identical source revision and seed; carrier and committed derived results agree under the same algorithm version. |
| Hidden grid reappears | Turn off grid/frame/source lattice; select, drag, undo fields. Hidden layers stay hidden. |
| Commands/markers conflated | Independently toggle each layer on sparse and dense cases; circles and commands are distinguishable; toggles do not recompute source geometry. |
| Scan-order event cap | Dense fixtures show spatially fair preview distribution; full model/export counts do not depend on preview budget. |
| Endpoint/near-crossing loss | Test exact endpoint contact, tangency, overlapping segments, near misses, and tolerance boundaries with stated expected event types. |
| Drag analysis overload | Repeated dense drags remain responsive; final analysis is committed on release without stale job results. |
| Embedded/new-tab mismatch | Open the same build and import the same test document in both contexts. Compare state/version before blaming caching. |
| Neo color inversion | Light/Dark/Neo retain coordinates, weights and behavior; required Neo marks are visibly green, not blue. |
| Empty canvas selection leakage | Empty click deselects the intended objects; candidate click/pin does not trigger unintended field/point reset. |
| Saved points depend on DOM | Hide candidates/selected markers, save, reload. Source candidate data and decisions remain intact. |
| Arbitrary triangle connector | Input ordering changes do not arbitrarily redefine meaningful relations; each generated trace explains its rule. |
| Runtime accumulation | Repeated toggle/drag/restore cycles do not increase element/listener counts unexpectedly or produce increasing lag. |
| Premature completion claims | Distinguish syntax, unit, browser, deployment and user acceptance results. Report any untested behavior. |

## 6. Minimum examples and acceptance status

Create reproducible fixtures, not only screenshots: square, asymmetric concave boundary, rotated sparse carrier, dense carrier, localized attractor/repeller, bind seam, release opening, bridge, and a closed/open polyline exchange sample. Keep both expected geometry and a brief visual explanation. Use representative user studies when supplied.

Labels for every acceptance entry: **planned / implemented-unverified / automated-pass / browser-pass / user-accepted / failed**. Record build identity, test document, environment and result. A test can pass at one level without passing the others.

## 7. Release record template

```text
Batch / phase:
Intended deliverables:
Delivered behavior:
Source commit and branch:
Live URL / deployment ID / verified status:
Automated checks actually run:
Browser checks and exact fixture:
User tests: steps → expected result:
Known failures / unverified areas:
Remaining in batch and phase:
Next dependency:
Dirty/unpublished work:
Decision register changes:
```

Detailed source reports are preserved in `references/`. The user identified report 4 as Weave Generator 4 even though its internal title says “3?”. Preserve that attribution discrepancy; do not merge it with the distinct chat-3 conceptual report.
Latest local status — 2026-09-16: build `WF-R1D-PATTERN-TREE-FIX-20260916` implements the approved saved hierarchy and dynamic-family correction. A Weave Pattern embeds 2–8 independently configured families; Influenced Grids nest beneath their source pattern and store the influence set plus certified result. Rename/duplicate/delete and cascading parent duplication are implemented. Legacy A/B data remains readable and dynamic-family compact backups round-trip exactly. Focused checks pass 54/54. Visual acceptance and broader R1 checkpoint certification remain; R2A and publication remain closed. See document 47.
Latest correction — 2026-09-16: `WF-R1D-PATTERN-TREE-FIX-20260916` restores byte-for-byte accepted A/B variation hashing after the dynamic-family extension caused existing certified R1D workspaces to fail startup validation and block all writes, including Boundary saves. C–H use the new deterministic hash. No data clearing or contract weakening occurred. Focused checks pass 24/24; user retest remains. See document 48.






## Settled family architecture - 2026-09-18

- A Weave Pattern owns an ordered catalog of 2-8 families. Every entry has a permanent ID, bounded engine key, editable label, display/export order, and export inclusion setting.
- Family labels/order are metadata and never alter certified geometry. Over/under priority remains a separate explicit rule.
- Deleting a family never renumbers survivors. Reusing a vacated bounded key creates a new permanent identity.
- Certified derived geometry stays one atomic content-addressed compact payload. `derived-family-index-v1` and crossing-family references provide separate family organization without cloning or re-encoding unchanged coordinates.
- Legacy saved bytes remain valid and unmodified until an explicit save materializes the optional catalog.
- Focused result: 45/45 affected tests plus managed-browser rename, reorder, isolate/show-all and reload. Exact derived canonical text, payload ID, and Float64 compact bytes remain unchanged for family metadata edits.
## W2 crossing-control repair - 2026-09-18

Build `WF-W2-CROSSING-CONTROLS-20260918` completes approved Build 1 only. Captured-value numeric commits fix Thread Width and Outline Line Weight snap-back without new model paths. Crossing selection now binds exact geometry/event/pair identity; assigned swaps persist as one explicit override, remain selected, and Undo correctly restores the pattern rule. Unresolved crossings require explicit assignment. Thirty affected tests and managed-browser checks pass. See document 80. Build 2 and publication remain unstarted.
## Build 1 Phase 1B named crossing modes — 2026-09-18

Build `WF-B1-P1B-NAMED-RULES-20260918` locally completes Phase 1B. Five named modes and live sequence feedback use the existing `interlacing-v2` representation and retain manual-override precedence. Thirty-three focused tests plus syntax/static checks pass. Managed-browser save/reload passes on 81 assigned crossings with 0 unresolved, ambiguous, or local overrides after restoring the original 2/1 phase 0 fixture. Awaiting user visual acceptance. Build 1 remains incomplete; Phase 1C has not begun. See [document 81](81-BUILD-1-PHASE-1B-NAMED-CROSSING-MODES.md). No publication.
## Build 1 Phase 1B linked-recalculation correction — 2026-09-18

Build `WF-B1-P1B-LINKED-RULES-20260918` corrects selector snap-back, adds family-targeted repeat rules with an explicit Whole-Pattern Default, and ties crossing retry identity to geometry plus presentation. Forty-seven focused tests pass. Managed browser verifies family-rule save/repaint and certified attractor geometry followed by complete crossing recalculation; original review state restored. Phase1B awaits visual acceptance; later Build1 phases remain unstarted. See [document 82](82-BUILD-1-PHASE-1B-LINKED-RECALCULATION.md). No publication.
