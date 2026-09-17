# Weave Generator — phased development plan and checklist

**Execution detail:** [14 — Builder checklists](14-BUILDER-CHECKLISTS.md) specifies to-dos and verification scenarios for every batch in document 13, with a policy for safely combining small related deliveries. Feature count is not an effort estimate. The actual building chat must settle each decision gate and obtain implementation authorization.

**Detailed batch schedule:** [13 — Manageable build batches](13-BUILD-BATCHES.md) defines the current batch IDs, 3–5 additions per delivery, prerequisites and specific exits. It refines the phase checklist below; R0 is planning, R1A is the first possible implementation batch, and R8C completes the initial field-to-part workflow. Every batch remains unstarted and requires its own scope approval.

2026-09-16. Planning roadmap derived from the user's relational framework and practical guide. Future checkboxes are deliberately unchecked. A phase is a capability milestone, not one large implementation batch. Split it into the suggested small batches and authorize each separately. No code or publication is authorized by this plan.

## Direction and milestones

Build the simplest complete relational workflow before expanding the vocabulary or simulation. Preserve accepted Phase 1A/1B/2A and use R-prefixed phases to avoid renumbering release history.

| Phase | Capability | Dependency |
| --- | --- | --- |
| R0 | Shared contracts and representative examples | Accepted Phase 2A |
| R1 | Authored local fields and reproducible deformation | R0 |
| R2 | Basic weave interaction and persistent strand authorship | R1 |
| R3 | Small, complete relational analyzer | R2; reuse its crossing kernel |
| R4 | Stitch Interpreter and evidence inspection | R3 |
| R5 | Relational intensity and comparison baseline | R3; visualize through R4 |
| R6 | Significance, candidate extraction and Point Sets | R5, R4 |
| R7 | Relational synthesis and Polyline Sets | R6 and R0 exchange preflight |
| R8 | Verified geometry/metadata handoff and curated iterations | R7 |
| R9 | Receiver-aware radius guidance | R8; receiver changes separately scoped |
| R10 | Expanded interactions, fields and generators | R8; specific prior stages reused |
| R11 | Regional/spatial analysis and richer synthesis | R8; only needed R10 features |
| R12 | Secondary/internal weaves and larger-scale readings | R8 plus deliberately authored downstream boundary |

Milestone A (R2): controllable, editable basic weave. Milestone B (R5): an independently useful analytical drawing with measured intensity. Milestone C (R8): first complete field-to-synthesized-part workflow with geometry and metadata. Milestone D (R9): actual inherited radius behavior in a verified receiver. R10–R12 extend the system; they do not block Milestone C. The plan does not require all advanced spatial analysis before the first meaningful points or closed polylines.

## Architecture rules that every phase must preserve

- Authored carrier recipes and future strand overrides remain distinct from generated geometry. Retain the Phase 2A generator and its saved results; new algorithms get new versions.
- Use a shared strand output contract: family/source identity, ordered document geometry, source parameters, clipping provenance, version and completeness diagnostics. Do not require all future strands to remain single-valued functions of a rectangular axis.
- Keep geometry, over/under precedence, connectivity and analytical classifications distinct. Drawn crossing gaps cannot define analytical topology.
- Use stable source references, not rounded coordinates, global sort indices, DOM order or visible marker identity. Stability within a revision does not promise automatic correspondence after topology changes.
- Manual overrides are authored records. Invalidated references become unresolved; no silent nearest-point reassignment. Saved descendants never mutate when a source is edited.
- Keep raw measurements, categorical rule results, intensity components, significance weights, interpretations and symbol styles separate. A different design priority must not rewrite measurements.
- Every generated point and polyline connection retains provenance and reason. User-moved vertices preserve original source lineage plus their explicit modification; derived location claims must be marked stale when no longer true.
- Version metadata and coordinate/units conventions early, but implement only fields required by the current batch. Test unsupported versions and lossless unknown-data handling or explicit rejection rather than silent loss.
- Recompute only affected working descendants. Mark stale results clearly and exclude them from committed export until refreshed or deliberately exported as their saved original snapshot. Never silently mix source revisions.
- Full analysis is independent of viewport, visible layers and preview budgets. Define computational limits; reject or report incomplete preview honestly. Do not label a truncated analysis complete.
- Validate and benchmark before adding workers or replacing persistence. A future worker must return the same derivation contract and discard stale jobs. No backend/cloud migration is implicit.
- Add serialization, undo, backup, save/restore and a basic export representation when a durable object first appears; do not defer all persistence or interchange to R8.

## R0 — settle contracts before the next feature build

Owner: Astra Medium. Documentation and read-only inspection first; executable experiments need a separately authorized batch.

- [ ] Review current source interfaces and receiver import behavior without editing either private site.
- [ ] Specify derived strand geometry, adaptive approximation/error bounds, clipping, stable source parameters and event identity. Keep future folded/manual paths possible.
- [ ] Define local field deformation first; defer progressive growth. Specify zero-strength behavior, tension 100 preserving the source, and whether any extra inertia control has a genuinely distinct effect.
- [ ] Define family-specific interaction semantics: cross-family crossing allowed initially; same-family avoidance is not silently introduced. Distinguish over/under from binding and collision from any intersection.
- [ ] Specify additive manual edits, exclusions, locks and regeneration conflicts before strand editing is implemented.
- [ ] Define the dependency/invalidation table and versioned study lineage from source through exported vertex.
- [ ] Write a minimal geometry-plus-JSON exchange example with coordinate convention, unspecified/declared units, ordered vertex IDs and source references. Inspect actual Tangent acceptance before choosing synthesis constraints.
- [ ] Choose four fixtures: regular crossing field; gradual convergence/divergence; mixed rhythm and proximity; meaningful isolated condition. Include negative examples. The old compressed-seam fixture may be one test, not the organizing workflow.
- [ ] Define parameter units, neighborhoods, boundary effects, numerical tolerances, supported workload and representative performance measurements for the next batch.
- [ ] Produce R1A's bounded implementation brief with automated checks and 3–5 visual acceptance steps.

Exit: no ambiguity about the next batch's inputs, outputs, invalidation or saved ancestry. Later formulas remain explicit open decisions with deadlines below; R0 must not become a speculative design of the entire tool.

## R1 — authored fields and deformation

Batches: R1A derived study foundation; R1B one attractor; R1C repeller/deflector; R1D combined influences and controlled variation. See the detailed schedule. Sol Medium after each contract is settled.

- [ ] Derive deformable strands from saved rectangular carriers without changing rect-v1.
- [ ] Implement one local influence evaluated along full paths, including influence in the middle of a long strand.
- [ ] Add position, extent, strength, falloff, enabled state and direction where meaningful; specify deterministic bounded combination when multiple influences are introduced.
- [ ] Add tension/smoothness only with distinct tested effects; preserve zero values and straight-source behavior at maximum tension.
- [ ] Clip derived geometry analytically after deformation; retain source lineage and separate concave fragments.
- [ ] Introduce seeded variation only as a versioned optional input; start with no randomness as a usable default.
- [ ] Add optional influence extents/direction display explaining authored inputs, distinct from later analytical intensity.
- [ ] Save Weave Study revisions, restore/undo, backup migration and explicit algorithm versions. Add raw derived-strand SVG export without symbols.
- [ ] Keep drag previews responsive; commit complete geometry and mark downstream results stale only on relevant edits.

Automated gate: zero/disabled/tension extremes, long-path response, rotation, concave clipping, seed repeatability, field-order policy, limits, migration/recovery and exact revision restoration.

Visual acceptance: place a field and inspect local deformation; rotate and drag without misalignment; disable/undo to recover geometry; restore and transfer two studies. Exit: authored causes have understandable, repeatable geometric effects.

## R2 — weave relationships and strand authorship

Batches: R2A crossing model; R2B over/under rhythm; R2C selection/exclusions/locks; R2D basic manual geometry. Advanced mutual response stays in R10.

- [ ] Build a complete crossing kernel with endpoint/tangent/overlap diagnostics reusable by R3.
- [ ] Add deterministic over/under alternation and over-two/under-one examples; define phase anchoring without global crossing sort dependence.
- [ ] Draw underpass gaps as notation while retaining continuous analytical paths; store precedence separately.
- [ ] Add strand selection, non-destructive exclusion, geometry lock, and bounded control-point editing. Add manual strands assigned to A or B with distinct manual identity.
- [ ] Define locks as freezing that strand's derived geometry for the new study revision; changing its boundary must validate or report conflict, not silently violate the lock.
- [ ] Retain edits on regeneration through explicit source anchors; provide unresolved-edit diagnostics when the source no longer supports them.
- [ ] Preserve generation recipe plus edits, undo grouping, saved revision ancestry and exports. Full freehand redraw/segment replacement waits for R10.
- [ ] Introduce FIELD/WEAVE navigation on the existing canvas only when each has usable controls.

Automated gate: crossing edge cases, repeat/phase fixtures, disconnected clipped fragments, view independence, locked/manual strand persistence, invalid edits and unresolved anchors.

Visual acceptance: compare alternating and over-two/under-one; hide notation without changing geometry; edit/lock/exclude strands and regenerate; save/reload/undo with all authorship retained. Exit: explicit visible weaving and reliable basic editing.

## R3 — relational measurement and classification

Batches: R3A measurement inspector; R3B proximity/alignment; R3C convergence/divergence; R3D density/rhythm/isolation. Astra settles detector definitions; Sol implements them.

- [ ] Measure distances, crossing angles, local direction, curvature and spacing on authoritative geometry.
- [ ] Define neighborhoods in document space and distinguish reference-spacing normalization from neighborhood-relative contrast.
- [ ] Implement a small set of typed conditions with explicit qualifying rules, extent and source references.
- [ ] Support point, interval and region-support descriptors without pretending full cell topology exists.
- [ ] Treat convergence as changing relationships along a direction, not simply low spacing; treat parallel reinforcement as more than density.
- [ ] Keep collision/instability out of the interface until a testable definition exists.
- [ ] Add independent analysis layers and raw measurement inspection with reasons and completeness diagnostics.
- [ ] Preserve full supported analysis; add indexing/bounded workloads based on measured performance.
- [ ] Save rule versions and parameters with studies; provide typed analysis metadata independent of any future symbol choice.

Automated gate: positive/negative fixtures per detector, resampling tolerance, scale/rotation behavior, boundary effects, coincident geometry, stable IDs and preview independence.

Visual acceptance: isolate each condition layer; compare convergence with uniformly close parallel lines; inspect an angle/proximity measurement; change a field and confirm old analysis is marked stale then refreshed. Exit: every displayed condition has defensible evidence.

## R4 — Stitch Interpreter

- [ ] Choose a small coherent vocabulary for the implemented conditions; use the Atlas as conceptual reference rather than an eight-symbol implementation requirement.
- [ ] Define orientation, size, repetition and extent; distinguish analysis notation from geometric ties.
- [ ] Keep computed category, editable spatial reading and chosen symbol as separate values.
- [ ] Support accepting, changing or hiding a symbol assignment with an explicit override record; changing a label does not reclassify evidence.
- [ ] Add selectable evidence, source highlighting and a concise legend.
- [ ] Export markings alone and combined through named SVG groups; include a JSON evidence companion. Confirm editor behavior rather than promising universal layer compatibility.
- [ ] Save styles and overrides, independently of geometry and analysis settings.
- [ ] Add INTERPRET view and optional scale/context overlays progressively.

Automated gate: display changes do not change detection; overrides and source references round-trip; exported coordinates/orientation/extent align; hidden marks remain in analysis.

Visual acceptance: recognize several categories using the legend; select a mark to see evidence; override/hide it without changing measurements; open a marks-only export aligned with the weave. Exit: an independently useful analytical drawing.

## R5 — relational intensity

Batches: R5A component fields; R5B explicit composites; R5C display/comparison.

- [ ] Define event contributions by support, falloff, amplitude and neighborhood scale; intervals and regions must not be counted as arbitrary collections of sampled events.
- [ ] Compute separate intensity components before offering a weighted composite. Keep authored force vectors distinct from analytical response values.
- [ ] Avoid double-counting correlated measurements such as proximity and density without showing that choice.
- [ ] Choose normalization/reference domains. Do not renormalize each drawing independently and then present its colors or values as directly comparable.
- [ ] Support bounded sampling with declared resolution, interpolation and approximation error; do not promise exact values everywhere from a coarse grid.
- [ ] Add contours, hatching/dots or stitch repetition as alternative displays of the same analytical values.
- [ ] Introduce saved comparison settings and matched views; comparison explains source/parameter differences and does not assume event correspondence across changed topology.
- [ ] Preserve component values and composite recipe in saved data and exports.

Automated gate: known single-event field, combined events, zero field, boundary policy, normalization, resolution convergence and invariance to rendering/sample-count changes.

Visual acceptance: inspect values around one event; compare component and combined fields; compare two studies on a common scale; switch visualization without changing values. Exit: intensity is measurable, inspectable and comparable.

## R6 — significance and point extraction

Batches: R6A condition candidates; R6B intensity/isolated candidates; R6C significance/filtering; R6D curation and named Point Sets. Candidate state persists from its first introduction.

- [ ] Define separate extraction rules for crossings, convergence, transitions, intensity extrema/plateaus and isolated anomalies; no generic sample-to-point conversion.
- [ ] Choose bounded uniqueness/neighborhood measures and separate them from intensity.
- [ ] Implement designer relationship weights and normalized significance components; avoid adding density twice through both intensity and an unexplained extra term.
- [ ] Add threshold, type/family/region filters, minimum spacing and candidate count; define deterministic tie-breaking.
- [ ] Define pin/exclusion/count precedence. Explicit exclusion wins over automatic selection; contradictory pin/exclude inputs require one clear user action. Pinned count overflow is reported rather than silently dropping pins.
- [ ] Add select/deselect, lasso, isolate, manual addition/deletion, pin/lock and forced inclusion. Keep manual points identifiable.
- [ ] Save all required candidate evidence and curation decisions in immutable Point Sets linked to exact sources; hiding markers must not alter the set.
- [ ] Add EXTRACT view and vertex-to-source groundwork for lineage. Changing study weights reuses measurements and preserves the source geometry.

Automated gate: scores/components, isolated high-significance example, plateau handling, deterministic spacing/ties, pin/exclusion rules, manual points, unresolved references and exact hidden-state restoration.

Visual acceptance: weight isolation over convergence on one unchanged weave; inspect a candidate's score; pin/exclude/add points then change threshold; restore two Point Sets with different design priorities. Exit: significance is designer-controlled and traceable.

## R7 — polyline synthesis

Batches: R7A candidate relations; R7B manual closed composition and validation; R7C automatic alternatives; R7D curation and visual lineage.

- [ ] Define an explicit candidate-relation model using direction, condition compatibility, shared context, proximity constraints and authored links. Each link has a reason and score components.
- [ ] Settle one synthesis mode that combines more than one kind of significant condition; do not default to arbitrary nearest triples, a hull or seam outlining.
- [ ] Define vertex-count bounds, preferred distance, directional continuity, closure search and deterministic alternative ranking; search must have a budget and a legitimate no-solution result.
- [ ] Distinguish crossing source strands from polygon self-intersection. Initial exportable closed results must be simple, contained and non-degenerate.
- [ ] Allow pin/required vertices, explicit relation exclusions and manual composition. Infeasible required vertices must be diagnosed, not dropped.
- [ ] Generate a small number of distinct alternatives with explained tradeoffs; optional randomness remains seeded.
- [ ] Add keep/delete/lock and manual vertex editing. Record movements and new relations; update analytical-location validity without erasing history.
- [ ] Save Polyline Sets with ordered point/vertex IDs, relation IDs, closure, source Point Set, generation settings and diagnostics.
- [ ] Add SYNTHESIZE view and bidirectional visual lineage from vertex to events/strands/marks and from a condition to contributing vertices.
- [ ] Exercise the R0 receiver fixture with actual generated output as soon as a valid outline exists, not only at the end of R8.

Automated gate: ordering invariance, deterministic alternatives, impossible constraints, budget exhaustion, duplicate/degenerate/self-crossing polygons, boundary/void constraints, manual edits and lineage persistence.

Visual acceptance: generate alternatives from one Point Set; inspect why a vertex and link were chosen; force an impossible combination and read the diagnostic; lock/edit/save/restore an outline and follow its source lineage. Exit: a meaningful authored synthesis, not merely valid geometry.

## R8 — portable relational package and complete iteration

- [ ] Consolidate prior stage exports into independently selectable boundary, carriers, derived weave, analysis marks, candidates, selected points and polylines.
- [ ] Finalize a versioned geometry-plus-JSON package with document units, axis convention, ordered IDs, source versions, measurements, intensity/significance components, overrides and synthesis reasons.
- [ ] Bind the companion metadata to the exact geometry/order by package identity and geometry fingerprint; reject mismatched pairs.
- [ ] Verify one closed polygon through actual Tangent import, including asymmetric orientation, scale, order, closure and receiving geometry. Use a test copy/origin without changing the private receiver.
- [ ] Clearly distinguish package export, receiver geometry support and receiver metadata consumption. A sidecar file alone does not make Tangent interpret it.
- [ ] Add a practical matched-view comparison of Weave, Point Set and Polyline Set iterations, including different weighting on identical geometry.
- [ ] Validate portable backup/import of the complete lineage and restoring stages without overwriting newer saved studies.
- [ ] Complete user-facing EXPORT view and a concise reading sheet/manifest stating what was measured, selected, authored and transferred.
- [ ] Add DXF parity only as a separate bounded adapter check; do not relabel DXF as DWG or claim open/multiple-shape support without receiver evidence.

Automated gate: package schema/version validation, exact geometry-metadata matching, coordinate/order conversion, ancestry completeness, unsupported versions and backup recovery.

Visual acceptance: export marks and geometry separately; inspect a vertex's package evidence; import the asymmetric generated outline in Tangent; restore a full study in another supported origin and compare it. Exit: Milestone C with honest receiver limitations documented.

## R9 — inherited radius behavior

Requires Astra geometry/mapping decisions; receiver edits require their own explicit scope and authorization.

- [ ] Define editable mappings from relational components and interpretations to intended curvature behavior; concentrated does not universally mean tight without a chosen study policy.
- [ ] Resolve preferences per ordered polyline corner, taking scale, angle, adjacent lengths and receiver constraints into account. Declare units before physical radius values.
- [ ] Preserve preferred, feasible/applied and manually overridden radius values with mapping version and reasons.
- [ ] Specify and implement receiver consumption only in an authorized receiver batch. Until then export suggestions with an unsupported-in-receiver label.
- [ ] Handle zero/straight/reflex/tight corners and invalid combinations without silently changing intended geometry.
- [ ] Verify actual receiver behavior and preserve the relational package through Tangent iterations as supported.

Automated gate: mapping monotonicity where promised, units, corner constraints, infeasible values, overrides and metadata round-trip.

Visual acceptance: compare two chosen radius policies on one outline; inspect intended versus applied values; override one corner; re-open and trace its origin. Exit: actual downstream influence verified, not merely suggested numbers in a file.

## R10 — richer generation and interaction

Independent sub-batches; do not attempt all together.

- [ ] Add bounded strand-to-strand avoidance, alignment/attraction and crossing tolerance, with explicit same-family/cross-family rules, update order, stopping criteria and deterministic solver behavior.
- [ ] Evaluate progressive-growth generation against carrier deformation as a new versioned mode; preserve old results and shared downstream contracts.
- [ ] Add compression, void/obstacle and alignment fields; then linked fields/territories with explicit blend/override/mask rules.
- [ ] Introduce bind, release and bypass, followed by run, cross-connection, loop, bridge, wrap and edge tie. Each requires geometry/connectivity/analysis effects and examples.
- [ ] Add full manual section redraw, control-point refinement and robust conflict resolution; preserve authored ancestry.
- [ ] Define triangular/radial A/B roles, independent directions, edge/zone origins and richer seeded irregularity without changing existing carriers.
- [ ] Add reference-image underlay and explicitly placed/scaled SVG zones with distinct boundary/obstacle/influence roles; plan-image pixels are not analytical geometry.
- [ ] Profile realistic dense interaction and editing workloads; introduce asynchronous processing/storage changes only when justified, with migrations and stale-job checks.

Gate per sub-batch: prove its new behavior in positive/negative cases, old-study compatibility, deterministic editing, dense workload bounds and at least three simple visual tests. Exit is per capability, not a requirement to implement this entire phase before R11/R12.

## R11 — regions, context and expanded synthesis

- [ ] Add validated cell/opening/adjacency analysis incrementally; distinguish geometry, topology and spatial interpretation.
- [ ] Develop pockets, corridors, seams, voids, bridges, thresholds and porosity using measured contextual rules.
- [ ] Add geometric, behavioral and influence-based interfaces with distinct evidence; support center traces, region-contact traces and branching networks.
- [ ] Expand Atlas-inspired readings only when inputs support them; do not infer program, floor levels or circulation from unassigned linework.
- [ ] Extend point extraction and synthesis to regional anchors, wrapping, banding, boundary ports and interface relationships.
- [ ] Add richer multi-scale/contextual exploration and study comparisons without pretending stable cross-revision correspondence is solved automatically.
- [ ] Define richer Overlap exchanges and residual-space comparisons in separately authorized downstream work.

Gate: known closed/open/concave regions, topology-changing operations, valid interior anchors, traceable new points, no accidental reclassification of drawing gaps as openings; visual pocket/opening/interface comparisons. General planar-region topology is not required retroactively by R3–R8.

## R12 — secondary/internal weave

- [ ] Import a deliberately selected downstream spatial boundary as a new study with parent lineage; do not regenerate or overwrite the original study.
- [ ] Reuse field, analysis, interpretation and synthesis instruments with a declared internal-organization purpose.
- [ ] Add authored roles and scales before proposing circulation, partition, occupation, furniture, visibility, structure or sectional readings.
- [ ] Distinguish an internal organizational suggestion from a building-design or performance claim.
- [ ] Compare internal alternatives and export their geometry/metadata independently of the outer form.

Gate: outer boundary and parent source remain unchanged, declared units/roles persist, internal points and proposals retain evidence, and a saved internal study can be reopened independently. Automatic 3D design and bidirectional live synchronization remain outside this phase.

## Decision deadlines

| Decision | Must be settled before |
| --- | --- |
| Source geometry, identity, saved edits, invalidation and basic exchange envelope | R1 implementation |
| Field composition, tension and approximation tolerance | Relevant R1 batch |
| Crossing precedence, phase anchors and manual-lock semantics | R2 |
| Detector meanings, support scales and numerical limits | Each R3 detector |
| Symbol/interpretation override behavior | R4 |
| Intensity contributions, normalization and comparison scale | R5 |
| Significance components, candidate rules, spacing/pin precedence | R6 |
| Synthesis meaning, relation constraints, closure and no-solution behavior | R7 |
| Exact supported receiver/package contract | Initial preflight R0; certify with real results R8 |
| Radius mapping, units and receiver feasibility | R9 |
| Mutual influence/growth, regions and internal spatial roles | Their R10–R12 sub-batches |

## Batch completion checklist

- [ ] Present scope, dependencies, exclusions, automated checks and 3–5 plain-language visual tests.
- [ ] Obtain explicit implementation authorization; assign Sol Medium only when semantic decisions are settled.
- [ ] Implement the bounded behavior and meaningful regression checks; do not add future controls without functioning outputs.
- [ ] Check save/restore, migration/recovery, undo, lineage, display independence and workload for affected objects.
- [ ] Record source/build identity and actual test evidence; separate planned, automated-pass, browser-pass, deployed and user-accepted status.
- [ ] Report incomplete or unsupported behavior and next dependency. Update master/state/contract records.
- [ ] Publish only with separate explicit authorization, only to the designated rebuild; verify the deployed build if published.

## Immediate next action

R0: prepare a concise shared contract and R1A scope using representative relational examples. No implementation is ready merely because this roadmap exists. The earlier compression fixture may inform tests, but its C1–C3 sequence and numerical defaults do not govern this plan.
