# Stitch preset research and development plan

Date: 2026-09-17
Status: researched proposal; no implementation or publication authorization.
Baseline: WF-R1D-ANCESTRY-REPAIR-20260917. The user reports the features now work. This is user confirmation of the repaired workflow, not a substitute for the outstanding broader R1 checkpoint.

## 1. Product outcome

Choose a stitch in Weave Pattern, create it within the selected Boundary, adjust spacing and construction parameters, then manipulate it with the existing Field Forces. Each Pattern embeds its own recipe, thread roles, parameters, and influence settings. No additional mandatory Influenced Grid creation step. Preserve the Board → Boundary → Pattern hierarchy, current automatic saving, undo/redo, independent display layers, and stable three-column UI.

These are parameterized constructions, not raster stamps or extra angled line families. A stitch combines visible thread paths, repeat placement, thread continuity, and local crossing precedence. Fabric entry/exit and holding stitches are distinct from ordinary over/under crossings. The initial scope is a 2D geometric interpretation, not cloth mechanics, thread tightening, or machine embroidery instructions.

## 2. Construction research: all requested names

The descriptions below are concise paraphrases of construction sources. Proposed software controls and representations are engineering recommendations, not claims made by the sources. Eleven requested labels are retained; potential aliases are not counted as independently verified stitches.

| Requested stitch | Construction evidence | Proposed generator and controls | Evidence status / fixture needed |
| --- | --- | --- | --- |
| Laced herringbone | A herringbone foundation receives a second thread routed around successive crossed intersections. RSN describes the pass sequence. [RSN](https://rsnstitchbank.org/stitch/laced-herringbone-stitch) | Two-rail foundation plus an ordered lacing route; repeat pitch, band height, overlap, lacing clearance and handedness. | Construction established. Transcribe one complete repeat and end treatment into a crossing table before coding. Do not confuse with square filling. |
| Double herringbone | Two interlocking herringbone rows. RSN documents an ordinary version and a different fully alternating foundation variation. [ordinary](https://rsnstitchbank.org/stitch/double-herringbone-stitch), [variation](https://rsnstitchbank.org/stitch/double-herringbone-stitch-variation) | Two offset sets of finite diagonal surface runs. Controls: horizontal pitch, band height, second-pass offset, row gap, orientation. Recommend the fully interlaced variation as the first preset, with the variant named explicitly. | Strong. Verify each diagonal's ordered over/under sequence, including the repeat seam. |
| Interlaced double herringbone | A double-herringbone foundation carries interlacing across the upper portion and a return route below, including passes relative to the working lace itself. [RSN interlaced band](https://rsnstitchbank.org/stitch/interlaced-herringbone-band) | Foundation plus outward/return lace routes, with self-crossing identities. Controls: foundation dimensions and bounded lace clearance. | Strong related construction; use the explicit RSN band variant, not a claim of equivalence to every historical insertion variant. |
| Laced herringbone filling, square foundation | The requested description is explicitly present in the Arts and Designs glossary: square foundation, then surface over/under weaving. [glossary L](https://www.artsanddesigns.com/glossary/L) | A square motif with a separately defined lace route; motif width/height, X/Y repeat gap, orientation. | Text verified; enlarged diagram could not be retrieved through browsing. Exact route remains gated. Do not substitute stacked herringbone bands or automatically equate it with Laced Herringbone Square. |
| Twisted lattice band | A specified double-herringbone variation receives upper and mirrored lower lacing. [RSN](https://rsnstitchbank.org/stitch/twisted-lattice-band) | Reuse the correct foundation variant; two mirrored lace paths. Band height, pitch, cross overlap and lace clearance. | Strong. Compare upper/lower sequences and end transitions; distinguish from similarly named couching stitches. |
| Herringbone square | Directional herringbone legs form a square; the closing leg passes relative to earlier legs to lock the cyclic construction. [Sarah's tutorial](https://www.embroidery.rocksea.org/stitch/herringbone-stitch/herringbone-square-stitch/) | Finite square foundation, explicitly ordered closing crossings; motif aspect, corner extension, repeat gap, rotation. | Strong. Closure must match the first leg, not simply draw a square outline. |
| Interlaced Maltese stitch | Sarah's picture dictionary uses the short label Interlaced Maltese alongside Interlaced Maltese Cross in its navigation. [dictionary](https://www.embroidery.rocksea.org/reference/picture-dictionary/) | Recommend a search alias of the verified cross recipe until a distinct construction is demonstrated. | Naming is provisional, not evidence for a separate preset. Preserve the requested label as an alias candidate. |
| Interlaced Maltese cross embroidery | A multi-square herringbone skeleton is interlaced through its intersections. Sarah documents the foundation on a 3×3 guide; Bhavani provides a labeled filling sequence returning to its start. [foundation](https://www.embroidery.rocksea.org/stitch/herringbone-stitch/maltese-cross/), [interlacing](https://kutchwork-tutorial.blogspot.com/2006/06/lesson-ii-part-ii.html) | Connected motif ports and a routed lace path, rather than five unrelated stamps. Motif size, arm proportions within validated bounds, repeat gap and lace clearance. | Construction sources located. Reconcile their orientation/labels in one original reference diagram before implementing. Do not substitute a Rhodes-style stitch sharing the Maltese name. |
| Persian star stitch | Sarah identifies Persian Star Filling but its public page directs readers to the book rather than giving the construction. [page](https://www.embroidery.rocksea.org/stitch/herringbone-stitch/persian-star-filling/) A separate author's reconstructed tutorial laces the sides of a herringbone square. [Queenie's worked reconstruction](https://queeniepatch.blogspot.com/2025/11/sunday-stitch-school-lesson-344-persian.html) | Candidate square-based star route, not an invented radial-spoke star. Motif dimensions, repeat spacing, lace inset. | Provisional. The latter is an author's reconstruction, not verification of Sarah's route. Require diagram comparison before calling it the canonical preset. |
| Laced Persian star filling | The glossary lists a square-foundation woven filling related to Laced Star Filling. [glossary L](https://www.artsanddesigns.com/glossary/L) | Square foundation plus its specific star-lacing route. Share placement engine with other square motifs, not their crossing tables. | Text verified, enlarged diagram unavailable. Relationship to Persian Star remains unresolved; retain separate candidate labels until compared. |
| Crossed fly filling | Rows of short-anchored V-shaped fly stitches alternate with mirrored rows; holding stitches overlap to produce a diamond trellis. [RSN](https://rsnstitchbank.org/stitch/fly-stitch-filling), [worked tutorial](https://practicalembroidery.eu/crossed-fly-stitch-filling/) | Finite V paths plus short holding paths and explicit anchor relations. Diamond width/height, repeat spacing and holding length. | Strong. A bare diagonal lattice is an incorrect negative fixture; shared fabric holes are not automatically thread junctions. |

No source images or tutorial prose are copied into application assets. Preset thumbnails should be original renders of our recipes, with source links in documentation. Exact per-crossing tables and normalized coordinate diagrams are deliverables of the recipe-contract batch; this report does not pretend they have already been transcribed or verified.

## 3. Actual source constraints

Reviewed current master, batch schedule, builder checklist, R0A source contract, current checkpoint and actual combined evaluator / storage codec.

- `combined.mjs` generates source lines from family axes. A finite zigzag, lace curve, or holding stitch is not an existing carrier option.
- `storage-codec.mjs` reconstructs `primitiveId: axis`, signed-distance parameters and line-derived strand IDs. It cannot honestly encode arbitrary ordered primitives by relabeling them as A/B/C families.
- R0A anticipated bounded segments and stable source locations, but deferred curve primitives. Those deferred contracts must now be resolved explicitly.
- The recent ancestry defect demonstrated that geometry, new source revisions and saved influenced revisions must enter the same transaction. Every preset integration fixture must reload the real packed result, not just validate an in-memory object.
- Keep the existing evaluator and codec readers unchanged for legacy versions. Add a discriminated recipe/source type and new source/derivation/codec versions; select any enclosing schema increment in the detailed compatibility contract. Do not overwrite legacy fingerprints.

## 4. Recommended recipe architecture

Proposed conceptual record (field names are not yet implementation API): preset ID and recipe version; construction variant and source citations; embedded normalized template; parameter values; semantic thread-role IDs; ordered strand runs/primitives; repeat cell indices; anchor relations; authored crossing-intent table; placement transform; influence recipe; source lineage and algorithm versions.

Thread roles are Foundation 1, Foundation 2, Lacing, Return Lacing or Holding as applicable. They map to stable editable family/role IDs, independent of their current direction. Do not create a new family for every segment or force every stitch into A/B. Retain equal default styling, with optional role colors for inspection.

For repeat cell `(i,j)`, propose `P = origin + R(angle) × (diag(width,height) × q(u) + (i*pitchX,j*pitchY))`. Band and area recipes declare which neighboring ports genuinely continue; independent motifs never gain connecting lines merely because they tile. Repeat indices remain stable as pitch changes. Geometry/parameter change increments the immutable revision, not surviving strand IDs. Shrinking a repeat field removes cells without renumbering remaining cells.

Use finite line segments for foundations. Rounded lace turns should use explicitly versioned cubic Bézier primitives with an interval-certified evaluator, not a fixed sampled approximation. Store stable `(patternId, cellI, cellJ, roleId, runId, primitiveId, u)` source references. A physical thread can contain multiple visible runs separated by backside transitions; no visible connector is drawn across such transitions.

Save an embedded recipe version in each Pattern. Built-in presets are immutable; creation makes an independent instance. A custom preset copies construction and controls, with optional normalized influence positions/radii and seed. By default omit boundary geometry and absolute canvas placement so reuse on a different Boundary is predictable. Changing a library entry never retroactively changes existing Patterns.

## 5. Deformation, clipping and crossing rules

1. Construct complete repeated source paths over a conservative boundary region expanded by certified displacement bounds and motif extent. Otherwise an attractor could pull an omitted outside motif into the Boundary.
2. Apply the approved order-independent sum of influences from each source point. Default all roles to the same response; retain independent role Strength/Tension as an advanced control. This does not guarantee topology preservation, even with common response.
3. For curved sources prove the composition bound: `q'' = D²F(p)[p',p'] + DF(p)p''`. Reusing the straight-source curvature bound alone is insufficient. Handle primitive endpoints, closed seams and field-support boundaries explicitly. Retain certified completeness and the approved accuracy requirement; define the stitch reference scale conservatively from validated motif spacing/feature size in the detailed contract.
4. Clip the certified derived representation analytically to the polygon under the existing strict-interior policy. Keep every concave-separated fragment and its source parameters. Do not claim that polyline clipping is exact clipping of the underlying smooth curve.
5. R2A detects intersections on declared authoritative geometry, including same-role and self-intersections, repeat neighbors, shared endpoints, tangencies, overlaps and multi-way contacts. Approximation epsilon is not a crossing tolerance or proof of smooth-curve topology. Use interval refinement to classify smooth-curve ambiguity, or report it unresolved; never invent a crossing from close render samples.
6. Authored precedence is attached to primitive-pair source intervals, not sorted crossing numbers. R2B resolves that intent to actual detected events. Surviving events retain their intent; additional, missing or ambiguous events are flagged. Underpass gaps are display notation only and cannot become holes in stored paths.
7. Recommend allowing valid deformed geometry to save with a visible `Modified interlacing` status when topology differs. Preserve unresolved intent and show neutral crossings; never claim an unchanged traditional stitch. A geometry/certification/storage failure still rejects atomically. Do not add an automatic topology-preserving solver in this scope.

The recommended default is a planar design tool with honest crossing diagnostics. Physical thread tension, knots, cloth penetration simulation and collision solving remain outside this proposal. Existing Tension means the approved deformation parameter, not physical thread tension.

## 6. Proposed delivery order

These are proposed additions/splits to the schedule, not authorization or a claim that R2 gates are already settled.

| Batch | What becomes usable | Verification and exit | Still deferred |
| --- | --- | --- | --- |
| R1 checkpoint | Freeze the working repaired baseline and record user acceptance. | Broader geometry, persistence, recovery and production-path timing checks appropriate to the actual changed storage path. Preserve previous evidence. | New presets. |
| SP0 — Recipe and geometry contract | Planning package with original coordinate diagrams, thread routes and crossing tables for Double Herringbone and Herringbone Square; compatibility/limits proof design. | Resolve finite-path encoding, certified curve path, clipping scope, crossing ambiguity and performance fixtures; review source-route tables. | All implementation. |
| SP1 — Finite stitch source slice | Preset picker, editable Double Herringbone foundation and Herringbone Square sources, repeat controls, existing fields, automatic save/undo/reset/backup. Label as foundation until weaving exists. | Source IDs, endpoints, field certification, clipping, actual incremental-save/reload and mixed-version backups. | Lace curves and over/under notation. |
| R2A — Crossing model | Visible crossing diagnostics for existing families and new finite paths, including self and multi-family cases. | Exact segment fixtures, ambiguity cases, counts independent of zoom/visibility, no lost boundary fragments. | Over/under rendering. |
| R2B — Weaving plus first complete presets | Double Herringbone and Herringbone Square with authored local precedence, calibrated notation, and separate general weave rhythm controls. | Ordered crossing fixture tables, seam/closure checks, deformed unresolved-event behavior and save/restore. | Curved lace and remaining library. |
| SP2 — Certified lace slice | Versioned rounded lace source support and complete Laced Herringbone with lace controls and attractors. | Curved-source composition proof, exact source routes, new codec/backup/capacity and production timing checks. | Other lace recipes. |
| SP3a — Interlaced band | Interlaced Double Herringbone variant using foundation and return-lace roles. | Self-crossings, return route and repeated seams; 3–5 visual tests. | Twisted band and square fills. |
| SP3b — Twisted band | Twisted Lattice Band with its documented foundation variation. | Mirrored upper/lower lace and correct foundation sequence. | Motif fills. |
| SP4a — Square and star fills | Laced Herringbone Filling and verified Persian variants, one bounded recipe delivery at a time. | Exact diagrams resolved before each variant; closure, spacing and topology tests. | Unverified names never become usable placeholders. |
| SP4b — Maltese | Verified Interlaced Maltese Cross, alias search and tiling. | Connected motif ports, full lace circuit, no false cross-center junction. | Any distinct unverified Maltese variant. |
| SP4c — Crossed Fly | Mirrored fly rows and holding geometry with controls. | Anchor relations remain distinct from connectivity and ordinary crossings. | Cloth mechanics. |
| SP5 — Custom preset library | Save/reuse independent custom recipes; optional normalized fields; local JSON backup/restore. | No shared mutation; library deletion leaves instances intact; versioned import and exact reload. | Cloud sharing. |

R2C strand selection/exclusions/locks and R2D manual geometry remain on the roadmap. Approving this insertion would prioritize the stitch library before those authoring batches; it does not quietly authorize R3–R12 or downstream Tangent/Overlap changes. If the user prefers manual editing first, SP3 onward can follow R2D without changing the underlying model.

Every visible batch includes discoverable controls, source/derived comparison, save/reset/undo behavior, local preview, short review report, and 3–5 manual scenarios. No active placeholders. Development-mode checks apply during isolated recipe/UI work; broader certification is justified when adding primitives/codec/storage/crossing algorithms or reaching a phase checkpoint.

## 7. Controls and simple workflow

Within Weave Pattern: Preset (thumbnail + construction variant) → Create Pattern → size/spacing/orientation → role tabs → stitch-specific controls. Selecting a new preset creates a new Pattern by default, protecting the current work. An explicit replacement action, if later added, needs its own undoable semantics.

Separate motif dimensions from repeat pitch: changing pitch spreads motifs; changing size changes the motif. Show only meaningful controls. Overlap or lace clearance must remain in the validated construction domain, with an explicit status when a custom setting changes interlacing. Preset reset restores recipe defaults without deleting the Boundary or unrelated Patterns. Field Forces retains direct dragging and existing shared radius/falloff plus role-specific strength/tension. Display remains at the bottom right with Original Grid/source, Derived, Guides, crossing analysis and weaving notation independent.

## 8. Automated fixtures and acceptance

Before a preset is labeled complete, require a hand-reviewed normalized repeat with a primitive table and ordered crossing expectations. Test single motif, adjacent repeats and repeat seam, non-square scaling, rotation/reflection, zero-field exact source, multiple fields, topology-change cases, concave clipping and motifs entering from outside the Boundary. Negative fixtures include a visually similar grid with wrong thread continuity, a wrong closing over/under, duplicate shared-endpoint crossings and fabricated connections at fabric anchors.

Persistence checks must exercise creation → add field → drag → spacing change → real incremental pack → reload → select saved Pattern → undo/redo → portable backup round trip. Preserve old schema-5 payloads and certificate bits; use a new bounded dictionary/primitive encoding for new types. Retain 10 MiB exact admission and atomic previous/current recovery. No geometry, source revisions or crossing intent may be saved without its dependent records.

Existing production timing limits remain reference gates: worker p95/max 375/400 ms, dense end-to-end 650/750 ms, default target 200 ms, render/pending 50 ms, and application-attributable long-task limits. No claim that these cover new stitch workloads yet. SP0 must define representative multi-primitive/role fixtures within existing aggregate geometry budgets and a bounded crossing-pair work budget; benchmark before authorizing release. If the extended source cannot meet the approved requirements, return with evidence rather than silently reducing fidelity or raising thresholds.

Five visual acceptance scenarios for the first complete preset release (future tests, not current controls):

1. From the selected Boundary, open Weave Pattern → Preset → Double Herringbone (interlaced foundation) → Create Pattern. A repeated band is visible immediately; inspect an interior crossing for alternating precedence.
2. Change Repeat Spacing and Band Height separately. Spacing changes repeat placement; height changes the band. Original Grid and Derived comparison remains aligned.
3. Field Forces → Add Attractor; drag it, adjust one role's Strength, then disable it. Deformation updates at normal opacity; disabling returns the source. If intended crossings change, the status identifies modified interlacing.
4. Undo/Redo, select another Pattern, return, then reload. The same parameters, fields and crossing intent return without pressing Save.
5. Display → Weaving Notation off/on. Gaps disappear/reappear without changing analytical paths. Download/import a backup in a separate test workspace and confirm the Pattern returns.

For each later recipe, replace the first test with its distinctive route/closure/anchor behavior; keep the remaining tests short. Exhaustive rejection cases stay automated.

## 9. Decisions and next bounded action

Recommended defaults: explicitly named construction variants; planar visible runs with separate backside/anchor metadata; built-in immutable recipes copied into Patterns; clipped edge motifs; common field response initially, independent role response available; save geometrically valid modified interlacing with clear diagnostics; no automatic physical/topology solver; alias uncertain names rather than invent extra stitches.

Unresolved engineering work belongs in SP0: exact normalized primitive and crossing tables, certified rounded-source bounds, source-to-crossing matching under deformation, storage version allocation and maximum-workload proof. Persian and square-filling diagrams need further verification before their individual recipe batches. The user does not need to invent numerical tolerances.

Exact next proposed action: complete the R1 checkpoint and prepare SP0's first two recipe diagrams plus finite-source/crossing/codec contract. This still needs substantial architectural reasoning. Return to Sol Medium for SP1 only after those semantics, accuracy rules, fixtures, limits and migration behavior are approved and frozen. Subsequent recipe batches can use Sol Medium when their reviewed route tables fit the settled engine. A new curve primitive or unresolved topology behavior returns to architectural review.

No implementation, site modification or publication was performed for this research plan.
