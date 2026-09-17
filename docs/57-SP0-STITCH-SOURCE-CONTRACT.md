# SP0 — finite stitch recipe contract

2026-09-17 · SP0 planning authorized · proposal for approval, not implementation authorization.
Application baseline: WF-R1D-ANCESTRY-REPAIR-20260917. No application files changed. R1 checkpoint certification remains outstanding.

Continuation: [58 — Capacity and checkpoint review](58-SP0-CAPACITY-AND-CHECKPOINT-REVIEW.md) records the passing bounded storage-layout proof, exact v3 table proposal, source-adapter corrections and stale-verifier audit. Its corrections supersede the corresponding initial wording below. The source illustration comparison and R1 certification remain open.

## Outcome and delivery boundary

SP1 adds two editable **foundation** presets: Double Herringbone (alternating variation) and Herringbone Square. They appear immediately on creation, accept existing fields, and save automatically under their Boundary. Crossing notation follows in R2B, after R2A detection. A foundation must not be presented as a completed woven stitch before then.

The original research and later recipe phases remain in document 56. This document narrows its engineering recommendations. SP0 produces source definitions, original diagrams, reference checks and the implementation boundary; it does not certify production performance, storage capacity, or historical equivalence from text alone.

## Construction evidence and original coordinate models

[RSN variation](https://rsnstitchbank.org/stitch/double-herringbone-stitch-variation) distinguishes this construction from ordinary double herringbone and requires alternating precedence along interior diagonals. [Sarah's square tutorial](https://www.embroidery.rocksea.org/stitch/herringbone-stitch/herringbone-square-stitch/) specifies a cyclic closing pass. The models below are original normalized engineering constructions consistent with those textual invariants, not traced source illustrations. Direct retrieval of both construction images failed on this review. Comparing our drawings with the source illustrations remains a recipe-authenticity gate before freezing named SP1 recipes. The independent checker proves the stated geometric relationships only.

### Double Herringbone, alternating variation

For integer repeat i, row j, role A offset d=0 and B offset d=1, overlap o=1/4 by default:

| Run | Start | End | Next visible run (through hidden backside) |
| --- | --- | --- | --- |
| U(r,i) | (2i+d,0) | (2i+d+1+o,1) | D(r,i) |
| D(r,i) | (2i+d+1,1) | (2i+d+2+o,0) | U(r,i+1) |

Map coordinates by x scale s=repeatPitch/2, y scale bandHeight; translate each row by bandHeight+rowGap, then rotate and translate the whole pattern. U is over same-role D, under opposite-role D. Each interior U encounters O/U/O; each D encounters U/O/U. U(A,0) meets D(A,-1), D(B,-1), D(A,0) at u=1/10,1/2,9/10 at defaults. Boundaries truncate runs, never invent end caps joining thread endpoints.

Recommended controls: repeat pitch, band height, row gap, overlap 0.1–0.4, rotation. Offset between roles stays half a period in this version. Pitch changes the connected construction's horizontal dimensions; it is not an independent gap between disconnected motifs. This deliberately corrects the overly general size-versus-spacing wording in document 56. Roles retain equal visual weight and independent force response. Row gap must be positive; zero-gap contact requires future explicit contact handling.

### Herringbone Square

For extension e=1/8, four oriented surface runs:

| Run | Start | End | Over at crossing |
| --- | --- | --- | --- |
| T | (-e,1) | (1+e,1) | L |
| R | (1,1+e) | (1,-e) | T |
| B | (1+e,0) | (-e,0) | R |
| L | (0,-e) | (0,1+e) | B |

Visible sequence T→R→B→L; transitions between these runs are backside metadata, not visible geometry. The thread terminates after L; no final L→T connection is inferred. The final L is over B and under T. Every oriented run encounters over then under. Local precedence is cyclic; assigning a single z-order to each whole run is mathematically insufficient.

Controls: width, height, extension 0.05–0.25, horizontal and vertical gap, rotation. PitchX=(1+2e)width+gapX, similarly Y. Positive gaps prevent neighboring source motifs from introducing unintended crossings. Four runs share one foundation role, not four forced families. Source role counts 1–8 are valid for recipes; legacy rectangular-family validation stays unchanged.

All parameter domain bounds above are proposed construction choices, not accuracy tolerances. World dimensions must satisfy existing finite-coordinate and conditioning checks. Reject degenerate or unrepresentable constructions visibly; never clamp stored geometry silently.

## Source, identities and continuity

Add a discriminated `stitch-recipe-v1` source alongside existing rect-v1/rect-v2. A Pattern embeds recipeId, recipeVersion, copied parameter values, immutable source snapshot, stable roles, repeat origin, placement transform, field settings and authored crossing intent. Built-in recipes never remain mutable shared references.

Each visible run is `segment-v1 {p0,p1,u:[0,1]}`. Identity is the structured tuple `(patternId, recipeVersion, row, column, roleId, runKey)`; encode structured fields, never ambiguous concatenated labels. Clipped fragments retain the run ID and directed source parameter interval. Sampling, clipping order, selection and display toggles cannot change IDs. Resizing preserves IDs for retained cells; adding/removing cells changes membership only. Duplicating a Pattern creates a new pattern ID and rewrites internal references atomically.

Keep visible continuity, backside transitions, fabric anchors and geometric crossings separate. Coincident endpoints do not imply connection. Do not connect disjoint surface runs merely to make an SVG path continuous. Render every fragment with a new M command and equal default stroke styling.

## Deformation, candidate completeness and clipping

Evaluate existing additive field displacement from each common source point with the role's existing strength/tension semantics. Do not deform an already deformed result. Certify every finite source interval, using the existing interval bounds and failure behavior. Keep authoritative segments and certificates exact through storage.

Let D be a certified global displacement bound obtained from the actual approved field equations, including per-role factors. Compute it by interval enclosure over supports, sum individual norm bounds with outward rounding, and require a finite result. Enumerate all motif cells whose source bounds intersect boundaryBounds expanded by D. Inverse-transform that box conservatively before taking integer cell ranges. Do not enumerate only cells initially inside the boundary: external runs can move in. If no sound bound can be established, reject before mutation. Candidate limits include invisible/rejected candidates, not only survivors.

Use sRef as the minimum positive construction feature: herringbone min(pitch/2, height, o*pitch/2, rowGap); square min(width,height,e*width,e*height,gapX,gapY). Retain tau from document 18 and epsilon=min(sRef/200, minActiveRadius/2000, boundaryExtent/10000), omitting the radius term if there are no active fields. Require epsilon≥16tau. Straight identity runs need no invented certificates where their version permits none. Existing v1/v2 values and fingerprints remain untouched.

Clip the certified polyline analytically against the boundary, retaining every concave fragment and edge provenance. This is exact clipping of that representation, not exact clipping of the underlying deformed smooth curve. Use existing strict-interior and conditioning policy. Changes to boundary, recipe or field recertify from source, then atomically publish geometry plus dependencies.

Curves are not accepted by stitch-recipe-v1. SP2 requires a separate curve contract: bound q''=D²F(p)[p',p']+DF(p)p'' on every interval, certify source and composed approximation, define seam/support splitting and new storage capacity proof. A straight-source bound alone cannot certify lacing. This is an explicit later architectural gate, not permission to approximate lace by unchecked samples.

## Crossing intent and future R2 dependency

Store authored pair relations using two run identities, source-parameter brackets and local over-role/run selection. Undeformed reference parameters are exact rational recipe values. Canonical pair ordering prevents duplicates. No identities based on sorted crossing index, screen position, fragment index or tessellation ordinal.

R2A must distinguish proper transverse crossings, endpoint contacts, tangencies, overlaps and multi-way events, including same-role events. The certified polyline is the declared analytical representation; its epsilon alone proves neither smooth-curve topology nor historical crossing correspondence. R2B may apply intent only to a unique, certified matching event in the declared source brackets. Missing, extra or ambiguous events remain neutral and visibly unresolved. Never match by nearest screen distance. A topology-changing field remains saveable if geometry is valid; label it Modified interlacing. No topology-preserving solver is promised.

SP1 stores intent but does not calculate crossing counts or show usable analysis/notation controls. R2A/R2B must freeze event-matching refinement and crossing workload budgets before implementation. Thus SP0 does not pretend to settle the later crossing kernel.

## Persistence and compatibility boundary

Recommended new workspace schema **6**, source `stitch-recipe-v1`, derived discriminator `stitch-derived-v1`, and compact envelope `derived-buffer-v3`. These names are reserved by this proposal, not emitted yet. Keep existing schema-5 source and derived payloads byte-identical inside migrated records; route legacy objects through their existing codec. Never fake recipe runs as line axes/signed distances.

New derived records explicitly encode source run references, u intervals, points, certificates and edge provenance using bounded tables. No lossy quantization. Preserve float64 values and certificate presence semantics. IDs/reference tables are bounded by candidate counts; existing dictionary assumptions are not sufficient proof for the new codec. Keep old readers fail-closed on schema6, without overwriting their recovery state.

Migration is copy-on-write in the existing transactional IndexedDB system. Validate and hash dependencies, exact backup admission and complete candidate workspace before switching current/previous pointers in one transaction. The old current snapshot remains previous. Do not alter immutable saved revisions. Conflicting tabs reject stale commits. Reuse unchanged content-addressed payloads; no re-encoding old geometry. Reload, undo, redo and imports resolve all dependency records before exposing a state. Quota, missing records, worker or certification failure leaves current and previous intact and presents the typed failure.

10 MiB remains the exact UTF-8 portable JSON ceiling, checked on the actual export representation including dictionaries, metadata and all retained revisions. Capacity is workspace-dependent: never promise arbitrary numbers of maximum-sized revisions. Oversized additions reject atomically; do not silently prune history. A new codec must demonstrate maximum geometry plus current/previous storage and representative saved revisions before it is used. Backups are portable JSON, not opaque IndexedDB IDs.

## Workload, proof fixtures and performance

Preserve aggregate ceilings: 2,000 source runs/candidates, 65,536 certified segments, 20,000 fragments, 8,000,000 clipping edge tests, depth20 and existing codec point/certificate/provenance budgets. Count each finite visible run against the source budget. Counting repeat cells as a single strand would evade the contract. R2 pair budget is a separate future gate, not implied by these values.

SP1 fixtures: both defaults; 500 squares (2,000 runs); 500 double-herringbone cells (2,000 runs); eight active mixed influences and eight role slots in an explicit synthetic source; concave boundary splitting a run; wholly external source pulled inside; seam-adjacent cells; parameter extremes; huge translation and tiny dimensions; degenerate endpoints; reversed source parameter; invalid role/run references; cross-tab conflict; mixed legacy/new backup; boundary edit followed by reload. Maximum fixtures must preflight all aggregate budgets without silently removing cells.

Production gates remain complete-worker p95/max375/400ms, dense foreground end-to-end650/750ms, default200ms, render/pending50ms and existing application-attributable long-task rules. Measure complete source generation+certification+new encoding, not just an isolated evaluator. Include default and 30-cycle dense edits plus source-changing and field-only commits. If capacity or any authoritative gate fails, return with structured evidence. No performance/capacity pass is claimed by SP0's small reference checker.

## Exact SP1 implementation boundary and UI

After approval and the remaining gates below: implement versioned finite sources, the two verified foundation recipes, worker certification and clipping, exact new encoding/migration, and one discoverable preset picker inside Weave Pattern. Create Pattern creates and displays a new object under the selected Boundary. Recipe-specific sliders and role tabs update it live; no Save Weave Study or Influenced Grid prerequisite. Keep Field Forces, selection, guides, undo/redo, reset, automatic transactional save, backup and reload. Reset only resets the selected recipe/field values; it cannot delete the Boundary or other Patterns.

Automated checks cover source IDs/coordinates, zero-field equality, certificates and concave clipping, true incremental pack/reload ancestry, migration and exact backup admission, failure atomicity and authoritative worker/browser gates. Broader checks are justified here because the primitive and storage formats change. Isolated UI fixes afterward return to focused verification.

Five future local acceptance tests:
1. Select a Boundary; Weave Pattern → Preset → Double Herringbone (foundation) → Create Pattern. Repeated diagonal bands appear immediately, without adding a field.
2. Change Repeat Pitch then Band Height. Horizontal repeat and vertical height respond independently; adding an Attractor and changing pitch retains the field and visible full-opacity output.
3. Create Herringbone Square (foundation). Change Width, Height and Gap. Separate extended-square motifs remain visible; there are no drawn backside connectors. Foundation crossings are plain until R2B.
4. Field Forces → select/drag/disable an influence; use Undo and Redo. Output and guides follow; disabled returns to undeformed geometry and role controls affect only their roles.
5. Switch Patterns, return and reload; export/import a backup into a separate test workspace. Parameters, fields and geometry return. Existing line-family patterns still open unchanged.

## Decisions, remaining gates and handoff

Recommended approval: finite surface runs plus separate continuity/precedence; two explicitly named foundations first; schema6 with mixed legacy payload preservation; valid modified interlacing may save; curve and crossing semantics remain separately gated. No new product decision about numerical tolerances is needed from the user.

Before SP1 implementation: (1) compare the original diagrams against accessible construction illustrations or a reliable equivalent and resolve route mismatches; (2) complete the outstanding R1 checkpoint; (3) freeze the v3 bounded table layout and demonstrate exact capacity admission with a planning fixture; (4) approve this contract. These are engineering/research obligations, not requests for the user to invent the architecture. SP0 is therefore a **documented proposal with explicit open evidence gates**, not an unconditional ready-to-code sign-off.

Sol Medium can take implementation once these four gates are recorded as passed. The immediate next work still requires architectural reasoning for codec bounds and compatibility proof. New curve primitives and R2 event matching return to architectural review. No R2 commands, lacing, Tangent/Overlap changes or publication are authorized by starting SP0.
