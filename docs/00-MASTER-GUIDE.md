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
