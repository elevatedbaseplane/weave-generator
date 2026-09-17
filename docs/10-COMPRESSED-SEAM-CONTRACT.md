# First example contract — compressed seam

**Provisional example only — 2026-09-16:** [11 — Relational field direction](11-RELATIONAL-FIELD-DIRECTION.md) supersedes this document as the organizing direction. The numerical defaults and C1–C3 sequence below are retained for possible reuse, not a current Sol implementation handoff. Reassess this example against relational intensity, significant-point selection and polyline synthesis before choosing the next build.

Status: settled planning specification for a bounded first example, not implementation approval. Thresholds below are initial versioned design defaults, not empirical architectural truths. They may be revised explicitly after the example is evaluated. Governing direction: 09-REVISED-MASTER-DIRECTION.md.

## 1. Outcome and exclusions

The designer compresses neighboring parallel threads over an interval. The system measures the resulting reduced spacing, marks qualifying intervals, and explains them. The designer may select an interval, retain its endpoints, trace its center, and deliberately construct a closed band from its two supporting threads.

The condition is named SUSTAINED_COMPRESSION; its default editable reading is “seam candidate.” It does not establish binding, enclosure, movement, privacy, or an actual architectural seam. Threads in the same family can qualify without crossing. A and B crossings do not become connected junctions.

First scope: one compression influence acting on one selected family of an accepted rectangular Carrier Study. No combined fields, foldbacks, source-path crossings within that family, branch merging, generic cell detection, over/under assignment, smoothing solver, or automatic radius transfer. Show this explicitly as a carrier-analysis study until actual weave grammar exists.

## 2. Authored influence and exact deformation

Derive a new versioned study from the immutable Carrier Study; do not edit rect-v1 or its saved revisions. Use its family direction u and normal n. Coordinates are s = dot(P-origin,u), t = dot(P-origin,n). The selected family's undeformed source paths have constant t; the other family remains geometrically unchanged.

Controls: selected family; longitudinal center s0; normal center c; half-length L > 0; normal half-width R > 0; compression strength q in [0,0.75]; enabled state. All dimensions use document units, with no inferred real-world scale.

Define w(s) = max(0, 1-abs(s-s0)/L). Define g(t) = (t-c)*max(0,1-abs(t-c)/R). The derived path is:

    P'(s,t) = origin + u*s + n*(t - q*w(s)*g(t))

Only the selected family changes. Evaluate the piecewise-linear source at s0-L, s0, s0+L and the required boundary range; analytically clip the resulting segments against the authoritative boundary. Deform full sources before clipping. No screen mask or old clipped fragment may define the result. Do not smooth corners in this version. This compact influence deliberately allows compensating expansion near its normal edges; the inspector and tests must distinguish that from compression.

Disabled or q=0 reproduces the source geometry. The specified q range preserves normal source order, so same-family paths cannot cross. Rotation uses the source family basis rather than screen axes. Influence edits are undoable, one drag per action; geometry is recomputed deterministically and committed only on successful validation. Invalid or over-budget edits retain the last complete state.

## 3. Observation and rule

Consider pairs of retained source paths consecutive in signed source index order, separately for the selected family. Missing density-selected paths are not invented; the reference spacing for a pair is d0 = abs(k2-k1)*familySpacing, not always one lattice slot.

At matching longitudinal coordinate s, measure d(s) as the positive separation along n between derived paths. It is a defined directional gap, not a nearest-Euclidean-distance claim. Report d(s), d0, ratio r(s)=d(s)/d0, interval length and family identity. Local-neighborhood ratios are postponed; do not quietly mix them into this rule.

Qualifying defaults: r(s) <= 0.60 continuously for longitudinal length >= d0. Threshold crossings are interpolated exactly on the piecewise-linear gap. Equality qualifies. Use a separately versioned numerical tolerance based on the existing clipping scale policy; do not replace these semantic thresholds with floating-point epsilon.

An event is a maximal qualifying interval. Both supporting paths and every connector between them must lie inside the boundary over the entire interval. Partition the ruled band at intersections with the polygon boundary and classify the complete band; endpoint/midpoint-only checks do not certify concave cases. Split at missing geometry or boundary interruptions, then apply the length test to each surviving interval. Do not bridge a notch. Exact band clipping/topology must be tested before C2 is called complete.

Every event retains interval endpoints, gap profile, minimum gap and location, source pair, rule parameters/version, geometry version, and source revision. Preserve complete supported analysis; display limits cannot discard events. Unsupported/ambiguous topology is an explicit diagnostic, not a fabricated seam.

For bounded v1, reject rather than truncate if more than 2,000 candidate source paths, 20,000 derived segments, 2,000,000 segment-edge tests, 2,000,000 band-edge tests, or 20,000 analysis intervals would be required. Existing Phase 2A limits also remain in force. These are initial safety caps, not performance promises; record timings on sparse and dense fixtures.

## 4. Identity, interpretation, and persistence

Identical source revision, recipe and algorithm versions reproduce geometry and event IDs. An event key includes the source pair, source revision/recipe identity, rule version, and canonical interval descriptor; never use its global display/sort index. Hiding or restyling marks cannot change IDs.

Selections and pins refer to the exact source snapshot. Reanalysis after an upstream geometric edit creates a new result; retain old saved results and show old selections as belonging to their old source. No automatic nearest-point reattachment. Cross-revision event matching is postponed.

Store authored influence, rule parameters, editable readings and curation in a versioned study with immutable source ancestry. Save complete committed point/trace outputs when those become available. Preserve schema-2/3 backups and existing revision libraries through explicit migration and recovery. Choose the new schema number during C1 preflight; do not add durable fields that an older client can silently discard.

Interpretation edits never change qualifying geometry. “Seam candidate,” “buffer,” or an authored label are readings; underlying SUSTAINED_COMPRESSION evidence remains visible.

## 5. Visual contract and marking exports

Keep source carrier, derived carrier, influence construction, analysis marks, extracted points and traces independently switchable. The analysis mark is paired short strokes facing inward across the band, repeated along its center trace and oriented with the local connector. It must not resemble a literal tie spanning the two threads. The legend calls it compression analysis.

Default repeat spacing is 0.5*d0; stroke size is 0.10*d0, with a visible user style multiplier. Start placement at the event's entry endpoint with a half-step inset. Appearance edits affect only notation. On selection, highlight the source pair and interval, show a gap measurement at the minimum, and report the rule, measured values and reading. Do not put every value on the default drawing.

C2 exports: analysis-only SVG and combined SVG with explicitly named groups for included layers. Use document-space symbol geometry; preserve a viewBox covering the source boundary; negate Y exactly once. SVG groups are the layer representation—do not promise identical layer behavior in every editor. Exclude UI handles and temporary selection highlights. Annotations remain distinguishable from authoritative derived threads; include condition IDs in the analysis SVG and provide a versioned JSON companion for full evidence. No SVG importer expansion is required here.

## 6. Point extraction and trace

For each chosen event, center M(s) is the midpoint of its two supporting paths at matching s. Extract entry and exit points plus all interior non-collinear vertices of that piecewise-linear center. Merge coincident consecutive vertices within numerical tolerance; preserve source reasons if roles coincide. A straight compressed interval produces two points, not an invented middle corner.

Record roles ENTRY, EXIT and TURN, event ID, source parameters, coordinates and measurements. The minimum-gap location remains an inspectable measurement marker; it is not automatically a polyline vertex. C3 supports selecting/deselecting events and pinning/excluding their derived points. Excluding a required endpoint/turn prevents that event's complete trace; it must not silently shortcut the omitted condition. Broader manual point composition remains later scope.

Relations connect consecutive retained vertices along the same complete event center. Trace rationale is “follows this compression interval.” Different source pairs remain distinct even if close. No nearest-neighbor seam merging, branch invention or automatic closure in this example.

## 7. Explicit closed band and downstream geometry

An explicit “Create band outline” action follows supporting thread 1 from entry to exit, crosses to thread 2 at exit, follows thread 2 back to entry, and closes across at entry. Keep all necessary thread vertices. The two end caps are recorded as authored closure relations, not detected binds or natural boundaries.

This produces a selected spatial band, not a claim of enclosed or protected space. Validate finite coordinates, simple closure, positive area, no self-contact/intersection, no duplicated/zero-length edges and complete boundary containment. If it fails, keep the open trace and show the reason; do not repair by inventing a different outline. Do not use arbitrary offset widths: this first outline's width comes directly from its supporting threads.

Save the outline with ordered vertex roles, supporting event/source references and closure-cap provenance. Export one selected valid outline as SVG, with one Y conversion, without marks or extra polygons in the Tangent geometry file. Full evidence and readings travel in a separate JSON companion. DXF parity and multi-outline transfer are later gates.

Tangent receiving behavior must be inspected and tested in C3 using a copy/test origin without changing the private Tangent site. Verify vertex order, dimensions, orientation, closure and valid receiving geometry. A receiving limitation does not authorize changing Tangent. Open center traces can be saved/exported as open SVG geometry, but are not advertised as supported Tangent inputs.

No automatic radius is sent or applied in v1. Preserve gap/width and point roles so a later curvature policy can be tested against actual corner angles, edge lengths, geometric feasibility and receiver capabilities. The first handoff is geometry plus traceable intent, not a certified rich metadata integration.

## 8. Exact reference fixture and counterexamples

Use a 500 x 500 square centered at the origin, default horizontal A/vertical B, spacing 50, density 100. Compress A with s0=0, c=25, L=150, R=100, q=2/3. The A paths at t=0 and t=50 have g=-18.75 and +18.75; their gap is 50-25*w(s). Thus the minimum gap is 25 at s=0, r=0.5; the r<=0.6 interval is [-30,30], length 60, exceeding d0=50.

Expected: one qualifying event for this pair; center trace (-30,25) to (30,25); no invented central turn. At entry/exit the supporting coordinates are t=10 and t=40, and at s=0 they are t=12.5 and t=37.5. The outline preserves these support vertices and has area 1650 square document units. All interpretations remain editable.

Counterexamples: q=0 gives no compression event; L=100 gives a qualifying gap interval only 40 units long and therefore no sustained event; normal-edge expansion receives no compression mark; a concave notch interrupts or invalidates the band even when visible source fragments appear close. Pair selection with reduced density uses the actual undeformed pair gap.

## 9. Verification and batch gates

Automated checks: exact fixture coordinates, ratios, interval and area; threshold equality; zero/disabled behavior; short interval rejection; expansion rejection; negative indices and density gaps; rotated fixture equivariance; concave containment and splitting; determinism; view/export independence; limits and atomic rejection; saved ancestry; backup migration/recovery; stale source handling; point roles; missing-point refusal; outline validity; SVG axis/order parity. Do not claim that a passing detector verifies architectural meaning.

Visual acceptance, staged by batch (no tests are claimed run):

1. C1: Apply the fixture influence; A narrows around y=25, B stays fixed. Disable and undo restore exact source geometry.
2. C1: Save two studies; restore/reload and JSON backup transfer preserve boundary, source and influence.
3. C2: The fixture has the expected marked interval. Selecting it explains ratio 0.5 minimum and 60-unit length; shorten L to 100 and the sustained mark disappears.
4. C2/C3: Toggle and export marks independently; create the two-point center trace and explicit six-vertex band outline. Selecting a cap identifies it as an authored closure.
5. C3: Import only the outline into the tested Tangent environment; compare orientation, dimensions, vertex order and closure, and report whether receiving geometry is valid.

C1–C3 each require their own scope proposal, applicable automated checks, 3–5 simple visual tests, exact source records and explicit implementation permission. Publication has a separate permission gate. Sol Medium handles the specified work; unsupported numerical topology, source incompatibility or required scope changes return to Astra Medium for decision. This contract does not authorize a release.

Minimum visual checklist per batch:

| Batch | Three acceptance actions |
| --- | --- |
| C1 | Apply/disable/undo the exact deformation; rotate the source and confirm the influence follows its family basis; save/reload and transfer two study revisions without changing their source carriers. |
| C2 | Inspect the qualifying fixture and its measurements; shorten L and disable q to check both counterexamples; export marks alone and combined, verifying visibility independence and alignment on re-opening the SVG. |
| C3 | Select an event and create its two-endpoint trace, then exclude an endpoint and confirm no shortcut is generated; create/save/restore the six-vertex band with labeled caps; verify the one-outline Tangent import against the source. |
