# Weave Generator — manageable build batches

Proposed stitch-library direction — 2026-09-17: see [56 — Stitch preset research and development plan](56-STITCH-PRESET-RESEARCH-AND-PLAN.md). It covers the requested construction methods, evidence gaps, finite-path and lace geometry, and suggested insertions around R2A/R2B. Planning only; the existing schedule is not superseded until this proposal is accepted. R1D repair functionality is user-confirmed; broader R1 checkpoint verification remains.

**Builder instructions:** [14 — Builder execution checklists](14-BUILDER-CHECKLISTS.md) expands every entry into to-dos, decision gates, data obligations and concrete verification scenarios. Use this document for the schedule and 14 for execution preparation. Small related entries may be combined into one explicitly approved delivery under its sizing policy; the IDs are tracking units, not a mandatory release count.

2026-09-16. Planning only; all batches below are unstarted. This is the detailed breakdown of [12 — Phased development plan](12-PHASED-DEVELOPMENT-PLAN.md). It replaces that document's earlier two-batch suggestions where batch labels differ, while preserving its phase goals and acceptance requirements. Phase 2A remains frozen. A batch entry is not implementation or publication authorization.

## How to use this schedule

Each row is one bounded delivery with normally 3–5 additions and one observable exit. Feature count is a guide, not a claim of equal effort: topology and solver work use smaller, specialized batches. If a contract or implementation reveals too much work, split the row before authorizing it; do not rush to satisfy a fixed count.

R0 rows are Astra Medium planning batches. Later rows use Sol Medium only after Astra Medium has resolved the relevant rules and geometry. Late-stage rows are provisional scope envelopes, not settled algorithms; their contracts are prepared near implementation. No automatic delegation or model switching.

Dependencies identify the preceding delivered capability, not permission to start. R10 branches do not require completing R9, and R11/R12 do not require all of R10. Where multiple predecessors are listed, all apply. Later regional readings depending on bind/release or obstacles must additionally require those specific R10 batches before exposing the reading.

## Included in every implementation batch

These are part of delivery, not extra feature batches:

- Save/restore, undo, schema/algorithm versions, migration/recovery and source ancestry for every new durable object. Later named-library improvements never excuse unsaved early work.
- Complete supported geometry/analysis, declared workload limits and non-destructive failure; view toggles remain independent.
- Meaningful automated positive/negative/edge-case checks from the parent phase, plus exact source identity and updated verification records.
- 3–5 concrete visual acceptance steps written before implementation: demonstrate the main output; exercise an important counterexample/disable case; save/reload/undo; inspect independence/lineage; verify export or receiving behavior where relevant. Planning-only batches use reviewed examples/documents instead of fictional live tests.
- No placeholder controls for deferred behavior. A usable intermediate result is valid if its limitations are explicit.
- Explicit implementation approval; separate publication approval. Receiver modifications require explicit receiver scope as well.

The exit in each row supplies the batch's specific verification focus. Before build approval, expand it into exact fixtures and the 3–5 applicable visual steps; do not treat this schedule alone as a detailed algorithm contract.

## Main milestones

- **Editable weave:** through R2D.
- **Analytical drawing and intensity:** through R5C.
- **Complete field-to-part workflow:** through R8C.
- **Inherited radius behavior:** through R9C, only with authorized receiver integration.
- **Optional DXF:** R8D is not a prerequisite for the main workflow.
- **Advanced growth, spatial interpretation and internal studies:** choose R10–R12 branches as needed.

## R0 — Contracts — planning batches, not implementation

| Batch | Additions | Requires | Exit / verification focus |
| --- | --- | --- | --- |
| **R0A — Source and geometry contracts** | Review current model; define strand geometry/source parameters; settle clipping/tolerances; specify identity and algorithm versions. | Phase 2A | A reviewed input/output contract supports both generated and future manually edited paths. |
| **R0B — Editing and dependency contracts** | Define manual edits/exclusions/locks; map invalidation; specify revision/migration rules; distinguish over/under, connection and analytical conditions. | R0A | A field edit, source removal and locked-strand conflict each have a documented outcome. |
| **R0C — Examples and first build brief** | Specify four relational fixtures; inspect Tangent and draft geometry/metadata envelope; define workload and units policy; write R1A scope and acceptance tests. | R0B | R1A is specified; no later detector or synthesis algorithm is silently considered settled. |

## R1 — Fields and reproducible deformation

| Batch | Additions | Requires | Exit / verification focus |
| --- | --- | --- | --- |
| **R1A — Derived study foundation** | Create versioned derived-strand output from existing carriers; add Weave Study save/restore and recovery; separate source/derived display; export derived strands as SVG. | R0C | With no influence, derived geometry matches the accepted carrier and round-trips without changing it. |
| **R1B — One working attractor** | Add one attractor with position/extent/strength; evaluate its effect along complete paths; implement declared falloff/tension; reclip deformed geometry; support drag/undo/disable. Geometry contract 20 is approved; synchronous evidence 21 failed, and [worker proposal 22](22-R1B-WORKER-EXECUTION-PROPOSAL.md) awaits review. Planning only. | R1A | A field affects the middle of a long path, zero force restores the source, and concave clipping remains correct. |
| **R1C — Repeller and deflector** | Add repeller behavior; add directional deflector; show extents/directions; allow switching one active influence type. | R1B | Each influence has a distinct tested effect; rotated placement and restore preserve coordinates. |
| **R1D — Combined fields and controlled variation** | Support multiple influences under one settled combination rule; add optional seeded variation; add only justified smoothing controls; bound preview/commit workloads. | R1C | Same inputs reproduce results, overlap behavior is explained, and excessive work is rejected without losing the last state. |

## R2 — Weaving and basic strand editing

| Batch | Additions | Requires | Exit / verification focus |
| --- | --- | --- | --- |
| **R2A — Crossing model** | Detect complete supported intersections; distinguish endpoint/tangent/coincident cases; retain stable source locations; show a simple diagnostic crossing layer. | R1D | Sparse and dense fixtures match the complete model; display limits do not erase crossings. |
| **R2B — Over/under and rhythm** | Add precedence separate from connectivity; implement alternation; add over-two/under-one and phase; draw calibrated underpass notation. | R2A | Rhythms restore exactly; hidden gap notation does not change paths or create openings. |
| **R2C — Strand selection, exclusion and locks** | Select strands; exclude/restore without deleting ancestry; freeze chosen derived strands; diagnose lock/boundary or source conflicts. | R2B | Regeneration preserves intended locks/exclusions and reports conflicts rather than silently reattaching edits. |
| **R2D — Basic manual geometry** | Edit bounded control points; add manual A/B strands; retain overrides with source anchors; add FIELD/WEAVE navigation. | R2C | Manual/generated identities survive regeneration and backup; invalid edits are rejected atomically. |

## R3 — Relational analysis

| Batch | Additions | Requires | Exit / verification focus |
| --- | --- | --- | --- |
| **R3A — Measurement inspector** | Reuse crossing angle data; measure local direction/curvature; measure nearest spacing with declared neighborhoods; add source-linked measurement inspection. | R2D | Known geometric fixtures reproduce expected quantities independent of zoom and display sampling. |
| **R3B — Proximity and alignment conditions** | Define/test proximity classification; classify parallel alignment; retain point/interval support and rule metadata; add selectable analysis layers. | R3A | Uniform close parallels classify correctly without being mislabeled as convergence. |
| **R3C — Convergence and divergence** | Detect directional spacing change; distinguish convergence from static density; define event extents; explain qualifying and rejected examples. | R3B | A gradual approach/separation is detected; short or constant-spacing counterexamples are rejected. |
| **R3D — Density, rhythm and isolated conditions** | Measure normalized local density; detect rhythm transitions using actual interaction sequence; define an isolated-condition descriptor; add analysis completeness/stale diagnostics. | R3C | Mixed and low-interaction fixtures are represented; density is not silently treated as significance. |

## R4 — Stitch Interpreter

| Batch | Additions | Requires | Exit / verification focus |
| --- | --- | --- | --- |
| **R4A — Initial analytical vocabulary** | Assign symbols to implemented condition types; orient them to source evidence; define extent/repetition defaults; add legend and INTERPRET view. | R3D | The analytical drawing is readable, and no symbol placement changes weave geometry. |
| **R4B — Evidence and authored interpretations** | Select marks to highlight evidence; edit spatial readings; override/hide symbol assignments; adjust style independently of detection. | R4A | Measurements remain unchanged when the designer edits symbols or interpretations. |
| **R4C — Independent marking exports** | Export marks-only SVG; export combined named groups; attach JSON evidence; verify alignment and saved overrides. | R4B | Marks can be opened separately at the correct position; export excludes temporary UI handles. |

## R5 — Relational intensity

| Batch | Additions | Requires | Exit / verification focus |
| --- | --- | --- | --- |
| **R5A — Individual component fields** | Define bounded event contributions; compute per-condition components; handle interval support without sample-count inflation; inspect numerical values. | R4C | Single-event/interval fixtures and resolution checks establish repeatable field values. |
| **R5B — Explicit combined intensity** | Add inspectable component weights; settle normalization/reference domains; report component contributions; keep authored forces separate from analytical response. | R5A | Combined scores are explainable, avoid hidden double counting, and retain comparable scales. |
| **R5C — Field display and comparison** | Add contours or hatch display; map intensity to supported stitch emphasis; synchronize saved-study views; persist shared comparison scales. | R5B | Switching representation does not change values; two studies are compared under the same scale. |

## R6 — Significance and point extraction

| Batch | Additions | Requires | Exit / verification focus |
| --- | --- | --- | --- |
| **R6A — Condition-derived candidates** | Extract crossing/convergence/transition candidates; retain extraction reasons and source positions; add candidate inspection; provide EXTRACT view. | R5C | Every generated candidate names its source condition and exact extraction rule. |
| **R6B — Intensity and isolated candidates** | Extract intensity extrema with plateau rules; nominate isolated anomalies; consolidate coincident candidates without losing reasons; define uniqueness components. | R6A | A plateau does not generate arbitrary dense points, and meaningful isolation remains eligible. |
| **R6C — Designer weighting and filtering** | Add relationship significance weights; expose score components; add threshold/type/family filters; apply deterministic spacing/count limits. | R6B | The same geometry yields different explainable priorities; scores do not recompute the weave. |
| **R6D — Point curation** | Add group/lasso selection and isolate; pin/exclude with explicit precedence; add/delete manual points; save named immutable Point Sets. | R6C | Pins/count conflicts are reported; hidden/manual/source-derived selections restore exactly. |

## R7 — Polyline synthesis

| Batch | Additions | Requires | Exit / verification focus |
| --- | --- | --- | --- |
| **R7A — Candidate relations** | Propose links with explicit source reasons; expose relation components; add link permission/exclusion; display required-point constraints. | R6D | Connections are justified beyond proximity; conflicting requirements are visible before generation. |
| **R7B — Manual closed composition and validity** | Compose an ordered outline from selected points; validate closure/area/self-intersection/containment; save basic Polyline Sets; test an actual outline in the Tangent test environment. | R7A | A valid authored outline round-trips; invalid closure is diagnosed without automatic geometric invention. |
| **R7C — Bounded automatic alternatives** | Implement one mixed-condition synthesis rule; add vertex/distance/direction controls; generate a few distinct ranked alternatives; enforce search budget and no-solution behavior. | R7B | Alternatives preserve selected relations and required points; results reproduce without arbitrary ordering effects. |
| **R7D — Curation and visual lineage** | Keep/delete/lock alternatives; edit vertices with authored provenance; link vertices back to conditions/strands/marks; show reverse condition-to-vertex lineage. | R7C | Editing updates validity and location claims; complete saved alternatives retain their original source. |

## R8 — Export and complete iteration

| Batch | Additions | Requires | Exit / verification focus |
| --- | --- | --- | --- |
| **R8A — Relational export package** | Consolidate selectable geometry layers; finalize versioned JSON metadata; bind geometry/order to metadata identity; create a readable package manifest. | R7D | Mismatched geometry/metadata is rejected and individual layers retain their correct coordinates. |
| **R8B — Verified Tangent geometry transfer** | Verify asymmetric generated outlines in Tangent; check scale/orientation/order/closure; document receiver limitations; add supported EXPORT controls. | R8A | Actual geometry import is verified without claiming metadata consumption or changing the private receiver. |
| **R8C — Portable iterations and comparison** | Compare Weave/Point/Polyline revisions; compare different weights on the same source; test full-lineage backup transfer; produce a concise reading sheet. | R8B | The complete study restores in another supported origin without modifying saved ancestors. |
| **R8D — Optional DXF adapter** | Map supported geometry layers to DXF; declare units/axes; verify vertex order and visual orientation in the receiver; report unsupported entity cases. | R8B | DXF parity is demonstrated for the scoped cases; no DWG or unsupported multi-shape claims. |

## R9 — Radius guidance and receiver integration

| Batch | Additions | Requires | Exit / verification focus |
| --- | --- | --- | --- |
| **R9A — Curvature-intention mapping** | Define study-selectable relational mapping; compute per-vertex preferences; expose contributing measurements; save mapping and overrides. | R8C | Two policies on one outline give explained differences without changing source analysis. |
| **R9B — Corner feasibility and units** | Resolve declared units/scale; evaluate actual ordered corner geometry; distinguish preferred/feasible values; diagnose straight/reflex/tight-corner limits. | R9A | Impossible requests remain visible; feasible suggestions follow the actual receiver contract. |
| **R9C — Authorized receiver consumption** | Add metadata import in a separately authorized receiver scope; apply supported radius suggestions; retain manual overrides and applied values; preserve/save lineage. | R9B | Actual Tangent behavior is verified; until receiver work is authorized, the feature remains suggestions-only. |

## R10 — Advanced generation — optional branches after the first complete workflow

| Batch | Additions | Requires | Exit / verification focus |
| --- | --- | --- | --- |
| **R10A — Bounded same-family avoidance** | Define neighborhood/interaction range; implement one avoidance response; specify deterministic update/stop rules; report convergence/failure diagnostics. | R8C | Avoidance behaves predictably within its supported workload and leaves old generators unchanged. |
| **R10B — Mutual alignment and crossing policy** | Add neighbor alignment response; add bounded attraction response; separate same/cross-family settings; define crossing-tolerance behavior. | R10A | Cross-family crossings remain controllable instead of being globally suppressed by avoidance. |
| **R10C — Compression and alignment fields** | Add explicit compression influence; add local alignment influence; extend existing composition policy; visualize their authored contribution. | R8C | Both fields have distinct measured effects and save under new recipe versions. |
| **R10D — Reference context and zone import** | Add positioned/scaled image underlay; import supported SVG zones; assign distinct context/influence roles; preserve transform and source provenance. | R8C | Context aligns with document geometry; pixels never become implicit obstacles or analysis. |
| **R10E — Void/obstacle behavior** | Define forbidden-region rules; implement one bounded obstacle-avoidance behavior; preserve clearance/boundary constraints; diagnose infeasible routes. | R10D | Supported paths avoid obstacles; impossible cases fail clearly rather than crossing silently. |
| **R10F — Basic field links** | Create linked field endpoints; implement one gradient/transition corridor; add explicit combination priority; inspect link influence. | R10C | A link has a distinct effect, with deterministic composition and independent source identity. |
| **R10G — Explicit bind and release** | Add connection records; create bounded bind geometry; define release of connection versus path interval; update affected analysis and exports. | R8C | Binding changes connectivity; release semantics are visible and do not rely on hidden markers. |
| **R10H — Bypass routing** | Define supported bypass anchors; implement one rerouting method; validate continuity/clearance; retain original and derived source relationships. | R10E | A bypass is actual routing with valid endpoints, not a symbol over unchanged geometry. |
| **R10I — Run and cross-connection operations** | Define eligible anchors; implement rhythmic runs; implement prescribed cross-connections; record operation-derived analysis and lineage. | R10G | Operations differ from untouched carriers and mere geometric crossing detection. |
| **R10J — Bridge and edge tie** | Define bridge attachment pairs; add bounded spanning geometry; add edge-specific ties/ports; validate boundary/connection rules. | R10G | A bridge retains its separation context; ties preserve authoritative boundary provenance. |
| **R10K — Loop and wrap** | Define supported return/offset geometry; implement a bounded loop; implement obstacle/edge wrap; validate extent/termination/self-contact. | R10H | Each operation has a valid geometry and explicit source relationship, or a clear unsupported-case result. |
| **R10L — Detailed manual editing** | Replace a selected strand section; refine control points; resolve source-anchor conflicts explicitly; preserve old/manual/new geometry lineage. | R8C | Section edits survive supported regeneration and never silently relocate to another strand. |
| **R10M — Independent directions and anchored origins** | Add a new independent-family-direction recipe; define edge/zone origins and destinations; validate clipping and identity; preserve rect-v1 compatibility. | R8C, R10D | New controls affect only new recipe versions; existing studies restore exactly. |
| **R10N — Triangular carrier mode** | Settle two-family interpretation; implement a versioned triangular basis; support its spacing/offset/density policy; test full downstream compatibility. | R10M | The mode has explicit A/B roles and feeds existing analysis without parity-based identity shortcuts. |
| **R10O — Radial carrier mode** | Settle radial A/B roles; handle center/seam singularities; implement its selection/offset policy; test downstream source parameters. | R10M | Radial identities and edge cases are explicit; old studies and detectors retain their semantics. |
| **R10P — Progressive-growth generator** | Compare growth against deformation on fixed examples; define seed/step/stop/collision rules; implement one bounded growth mode; emit the shared strand/provenance contract. | R10A | A new generator feeds existing analysis and preserves reproducibility without replacing earlier algorithms. |
| **R10Q — Measured performance intervention — conditional** | Profile representative dense studies; identify one proven bottleneck; implement only the warranted indexing/worker/storage change; verify stale-job or migration recovery. | R8C | Measured improvement preserves complete results and saved work; skip this batch if no intervention is justified. |

## R11 — Spatial regions and expanded synthesis — independent extensions

| Batch | Additions | Requires | Exit / verification focus |
| --- | --- | --- | --- |
| **R11A — Closed-cell geometry** | Build scoped planar arrangement; extract valid closed cells; measure area/interior anchors; retain boundary/source provenance. | R8C | Known concave and touching cases yield valid cells or explicit unsupported diagnostics. |
| **R11B — Openings and adjacency** | Identify supported open-region cases; build region adjacency; measure opening widths; distinguish geometric and connected passage. | R11A | Underpass drawing gaps are not mistaken for openings; adjacency is inspectable. |
| **R11C — Regional readings** | Define a small pocket/corridor/void vocabulary; classify from measured evidence; add regional marks and editable readings; expose context. | R11B | A label can be explained and overridden without altering region measurements. |
| **R11D — Interfaces and branches** | Detect supported geometric/behavioral/influence interfaces; distinguish center/contact traces; build branch/end nodes; retain interface evidence. | R11B | Different interface types remain distinct; branches form explicit networks rather than arbitrary joins. |
| **R11E — Region-based extraction and synthesis** | Extract regional anchors/ports; add wrapping or banding relations one mode at a time; validate regional closed synthesis; extend source lineage. | R11C, R11D | A regional alternative is geometrically valid and explains how conditions contributed. |
| **R11F — Expanded Atlas and multi-scale readings** | Choose one or two evidence-supported Atlas entries; define scale-aware measures; expose contextual comparison; extend vocabulary/metadata. | R11C | Each added reading is supported by actual inputs; program/section claims are not inferred from anonymous lines. |
| **R11G — Overlap relational exchange** | Specify scoped region/interface payload; export provenance and readings; verify supported receiving behavior; compare residual-space results in an authorized test setup. | R11E | Transfer and interpretation limits are documented; private Overlap changes need separate permission. |

## R12 — Secondary/internal weaves

| Batch | Additions | Requires | Exit / verification focus |
| --- | --- | --- | --- |
| **R12A — A downstream boundary becomes a new study** | Import the selected boundary; establish parent lineage; set internal-study purpose/scale; preserve the original outer form. | R8C and an authored downstream boundary | The new study reopens independently and cannot overwrite its parent geometry. |
| **R12B — One authored internal reading** | Choose one organizational question; assign required roles/context; reuse field/analysis/selection instruments; label proposals versus evidence. | R12A | One bounded internal reading is useful and traceable without implying automatic architectural correctness. |
| **R12C — Internal alternatives and export** | Compare internal variants; export internal layers independently; preserve boundary/parent lineage; save a complete portable internal study. | R12B | Internal alternatives remain separate from the outer form and reproduce after transfer. |

## Scope safeguards and next action

Do not reinterpret the original compressed-seam C1–C3 sequence as this schedule. Its fixture can be reused where relevant; it is not the synthesis model.

The two R8 export claims remain separate: geometry received by Tangent versus metadata interpreted by Tangent. Rich consumption and actual radius behavior belong to R9C. R8D does not establish DWG, multi-polyline or open-trace support.

For specialized R10 operations, settle the input condition, geometry consequence, connectivity consequence, analysis effect and a counterexample before implementation. R11 regional modes each require their own supported topology cases. R12 starts with one authored internal question rather than bundling circulation, structure, furniture and section systems into one release.

Performance work R10Q is conditional and may be moved earlier if measurements show a blocker. Preserve its scope: solve one evidenced problem, not a speculative rewrite.

Next: **R0A — source and geometry contracts**, followed by R0B and R0C. The first implementation batch would be R1A, after those contracts and explicit authorization. No implementation, model switch, release or private-site change is authorized by recording this schedule.
