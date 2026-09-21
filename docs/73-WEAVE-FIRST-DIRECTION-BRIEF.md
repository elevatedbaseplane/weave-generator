# 73 — Weave-first direction brief

2026-09-17. User-directed planning update. No implementation or publication in this batch. Current local baseline WF-SP1-LINKED-20260917; user reports linked controls working. R1 remains development-complete with preserved certification debt. SP1 foundations and recent fixes remain intact.

## Product intent

Build a weave generator whose threads visibly interlace, curve, bind and connect. Editable grids are foundations, not the final product. The supplied embroidery photographs are visual references for grouped strands, curved openings and short binding stitches, not proof of exact historical construction or physical mechanics.

The active delivery order below supersedes document70's standalone Analyze-first UI sequence and conflicting next-action entries in older records. Its source-anchor, robust intersection, completeness, ambiguity and non-destructive rendering requirements still apply. Crossing calculations needed for weaving run internally; a separate user-facing Analyze step is deferred.

## Delivery sequence

1. **W1 — Thread appearance.** Add adjustable thread width and Solid/Outline modes. Outline depicts the two edges of one thread, not two independent source strands. Preserve centerlines, IDs, clipping gaps and certificates. Match widths across roles by default; allow deliberate family/role customization. Keep outline interiors transparent except where explicit future over/under occlusion applies. Save appearance with the pattern through a versioned compatible record; preserve old records and establish explicit SVG appearance behavior. No physical ribbon-offset geometry or fabrication claim.
2. **W2 — Visible interlacing.** Integrate necessary robust crossing detection directly with over/under rendering. Provide authored preset rules where supported, explicit design rules such as alternating or family priority, and local crossing reversal. Show underpasses by presentation masks/gaps without cutting authoritative source paths. Rule provenance matters: an arbitrary alternation is not a researched stitch recipe. Stable source anchors support edits; ambiguous or disappeared crossings must not silently receive a different override. Multi-way contacts and overlaps need visible unresolved handling. Manual analysis is not a prerequisite to see weaving.
3. **W3 — Expanded weave library.** Build researched, recognizable constructions from the requested herringbone, lattice, Maltese, Persian-star and crossed-fly examples. Implement curved/laced geometry and its certification before claiming presets that require it. Deliver small groups of verified recipes with meaningful spacing, scale, orientation, grouping and influence controls, automatic saving and reference comparisons. Mark adaptations explicitly. Exact recipe order follows evidence and geometry dependencies, not generic grid substitutes.
4. **W4 — Stitches and connection rules.** Add explicit binding-thread geometry. First: a short bar joining two eligible nearby strands. Then cross/plus and wrap motifs where their construction is defined. Controls: eligible families/patterns, proximity reach, minimum binding spacing, size, width and orientation. Distinguish decorative motif, visual binding, and a constraint that actually pulls strands together. Default binding adds geometry without moving existing strands. Influence-associated motifs are optional, attached to the influence center. Proximity bindings attach to stable locations on participating strands, with duplicate suppression and explicit behavior when eligibility disappears. Cross-pattern scope must be explicit and use a common board coordinate frame; hidden layers do not silently change eligibility.
5. **W5 — Force and relationship analysis.** After interaction semantics exist, expose analysis of influence response, binding relationships and deformation. Geometric indicators can be offered with honest labels. Actual force, stress or tension estimates require a declared mechanical model, material properties, constraints and validation; current sliders are deformation controls, not physical force measurements. Do not imply physics from line thickness or a decorative stitch.
6. **W6 — Point derivation.** Extract deliberate, provenance-linked point sets from crossings, bindings, endpoints, extrema or supported analysis features. Provide filters, selection, saved sets and explicit stale-state behavior. Do not treat every tessellation vertex as a meaningful design point.
7. **W7 — Polyline composition.** Build editable paths from selected point sets and connection rules. Define ordering, branching, gaps, constraints, lineage, saving and export. Do not reuse the original prototype polyline algorithms without contract validation.

## First bounded implementation batch: W1

Thread width slider; Solid/Outline selector; linked appearance by default with per-family/role override; clear preview and source/derived layer behavior; save/reload/Undo and backup compatibility. Existing line color and opacity are retained unless deliberately edited. Width does not alter spacing, deformation or centerline geometry. Width is in document units, scales with zoom, and renders independently of computational epsilon. Use a modest visible default and bounded controls established against representative patterns during implementation; the user need not invent numerical tolerances. Existing records need a legacy appearance fallback rather than silent byte rewrites. Confirm a stroke-envelope clipping rule at implementation: recommended clip visible ink to the existing boundary, retaining fragment gaps. Thread overlap in W1 is ordinary drawing, not a claim of over/under weaving.

Focused automated checks: unchanged centerline/identity fingerprints; continuous/concave fragment separation; display modes and width defaults; per-role/link isolation; versioned appearance save, Undo, native backup roundtrip and old-record compatibility; boundary ink clipping and SVG mode parity. Broader storage certification only if the record change materially affects capacity/recovery. No repeated unrelated proofs.

Five visual checks for W1:
1. Open a saved pattern; change Thread Width. Lines visibly thicken without moving their centers or changing counts.
2. Select Outline. Each thread has two edges and an unfilled interior, with gaps retained.
3. Unlink appearance and change one role's width. Only that role changes; relinking is explicit about which values subsequent edits affect.
4. Move an attractor and zoom. Thread appearance follows the same deformed paths, with clipped edges and stable document-relative width.
5. Undo/Redo, reload and native backup/restore retain the chosen appearance and original editable pattern.

## Engineering gates retained

Certified geometry, complete workloads, exact identities/source parameters, worker latest-request and stale-result rejection, immutable revisions, transactional IndexedDB, compact encoding, atomic recovery, portable backups and 10MiB admission remain mandatory. Appearance and crossing rules must not silently change saved geometry. Existing failure evidence and timing targets remain recorded; document72's248.1ms default interaction sample is not a performance pass. Final host certification is deferred to publication or an actual host-only application defect; ordinary batches use internal focused checks and local visual previews.

Every meaningful batch ends with build ID, visible changes, completion/remaining scope, local preview, 3–5 tests and exact next action. Stable three-column UI, collapsible sections and real controls only. Publication always requires separate authorization.

## Decisions to settle when relevant

W2: exact bounded precedence/rule representation, ambiguous multi-way presentation and override correspondence. W3: each recipe's construction evidence and curved-source contract. W4: attachment lifetime, eligible neighborhoods, binding geometry, and opt-in mechanical constraints. W5: whether a real physical solver is desired and its validation basis. These are not blockers to preparing W1; do not ask the user for engineering tolerances. This brief does not claim any new capability implemented.
