# Sol Medium checkpoint

## Checkpoint definition

The architectural checkpoint is the verified Phase 1A working foundation: one document model, explicit transforms, validated boundary operations, immutable named revisions, undo/redo, local persistence recovery, portable backup/import, and a tested one-polygon exchange contract. Freeze this before adding carrier features.

The release checkpoint additionally requires an exact pushed source commit, a successful deployment to the rebuild site, and a recorded build identity. If network/approval policy blocks publication, the architectural checkpoint can be reached locally while the release checkpoint remains pending. Do not call that a completed release.

**Current checkpoint outcome:** architectural and release checkpoints reached at implementation commit `4d4e297dde6f7f88b87821a4ea0c95e6e1a92251`; 12 tests plus local browser checks pass, and private Site version 1 deployed successfully at `https://weave-foundation.notbrandon175.chatgpt.site`. Live read-back confirmed build `WF-1A-20260914`, schema 2, browser-local storage available, boundary/grid initially off, and owner-only access. It is suitable to switch to Sol Medium for the next bounded established-decision batch. Do not start Phase 1B until it is authorized. No model setting was changed by this task.

**Immediate bounded continuation (no new feature code):** perform the exact user acceptance actions against private Site version 1. Keep the deployed provenance fixed at `4d4e297dde6f7f88b87821a4ea0c95e6e1a92251`; documentation-only record updates are not part of that deployed source. Do not rotate the Site ID or begin Phase 1B without authorization.

Use **GPT-5.6 Sol / Medium** after the checks below are recorded. This is a project-specific judgment based on bounded work, explicit contracts and regression coverage, not a guarantee of model performance. Official documentation confirms Medium support: https://developers.openai.com/api/docs/models/gpt-5.6-sol . Do not switch automatically; the user asked to identify the checkpoint.

## Settled foundation choices

- Original Weave site, source, experiments and saved browser studies remain unchanged.
- Isolated rebuild checkout is derived from the verified baseline. Reference modules are retained outside dist.
- Rebuild destination is a separate owner-private Site: `appgprj_6aa83001d03481918d4a13e46c9612fb`.
- User explicitly selected browser-local saves plus JSON backups. No cross-device durability is claimed.
- Schema 2 workspace contains named boards; each has one working boundary and a library of immutable named boundary revisions. References are project-scoped.
- Same-name save appends a revision and advances latest. Existing revisions are never replaced. No destructive delete UI is exposed yet.
- The working boundary has a sourceRevisionId indicating its starting revision. Unsaved edits retain that ancestry and show an unsaved indicator.
- Undo/redo is session-local, per board, and applies to working-document changes (create/edit/restore boundary). A drag is one action. Save appends an immutable checkpoint and is not undone by deleting history. Redo is cleared by a new edit.
- Coordinates are Y-up, document-origin, unspecified document-units. No physical scale is silently assumed. Fit/pan/zoom and rail resizing never mutate coordinates.
- Boundaries are one simple closed polygon, 3–1000 vertices, finite values within ±1e9, no holes/self-crossings/self-touches/backtracking. Input may repeat its closing vertex; stored authored operations canonicalize it away. EPSILON is 1e-8 in document space; extreme-scale numerical behavior is not certified.
- View state uses explicit tokens, not CSS inversion. Grid/frame and boundary initially off, panels' sections initially closed. Source-lattice control is deferred until a source lattice exists; no inert switch is exposed.
- Local save uses a separate rebuild key, previous-value recovery, and conflict detection against another tab. Unreadable data blocks writes. An unsuccessful commit never replaces the current in-memory document. Backup imports retain old boards; exact identities deduplicate, changed identities become additional imported boards.
- Backup import limit is 10 MB / 100 boards. These are protective foundation limits, not architectural workload claims.
- Boundary SVG negates Y explicitly. Boundary DXF preserves Y-up and declares $INSUNITS=0. One closed polygon per Tangent handoff. SVG UI import into Tangent is verified; DXF parser compatibility is verified, but Tangent display orientation is not certified.

## Next bounded batch: Phase 1B — straight SVG boundary import

**Classification: follows established decisions. Substantial architectural reasoning is not required for this batch. Sol Medium is appropriate once the current release gate is resolved.**

Implement only:

1. An SVG boundary file picker, with a staged preview, source filename, vertex count, dimensions and clear validation outcome before Apply.
2. Accept one closed straight polygon: polygon, non-rounded rect, explicitly closed polyline, or path using M/L/H/V/Z. Support numeric affine group/element transforms already represented by the retained parser. Reject curves, multiple polygons, holes, invalid numbers and unsupported/root transforms explicitly. Do not silently choose the largest polygon or discard unsupported geometry.
3. Convert SVG Y-down to document Y-up exactly once. Preserve numeric coordinates and vertex order. Read width/height/viewBox as source metadata; do not infer millimeters or silently rescale. Explicit Fit changes the camera only.
4. Apply is one undoable working-document operation, using the existing validator, persistence, revision-save and backup paths. Cancel/failure leaves document and saved library unchanged.
5. Preserve an optional `boundary.source` record with filename, format `svg`, axisConversion `negate-y`, and original width/height/viewBox strings. Extend validation and saveBoundary copying for that optional record. Existing schema-2 backups without it remain supported; do not invent a migration for an additive optional field. Do not persist SVG markup/scripts or embed the source SVG in the DOM.
6. Regression fixtures: asymmetric concave polygon, translated/scaled/rotated group, open path, curve, multiple polygons, malformed XML, zero-area and crossing polygon. Validate backup/restore of metadata as well as coordinates.

Exit: accepted fixture visibly matches Weave's exported asymmetric SVG; correct axis conversion/order/scale; cancel and rejection are non-destructive; one undo restores previous boundary; revision ancestry and backup round trip pass; test and deploy only to the rebuild Site; update the state and release records.

Excluded: DXF/DWG boundary import, reference-image underlay, physical unit conversion, carrier generation, families, field deformation, stitches, interstitial analysis, point extraction, relations, polyline generation, legacy-board migration and downstream tool edits.

## Questions that remain architectural

Do not silently solve these while doing 1B:

- Phase 2: explicit A/B path roles (especially triangular/radial), density semantics, analytic concave clipping, stable path IDs and numerical tolerances.
- Phases 3/4: field zero/tension semantics, measured workloads, sampling tolerance, complete event identity, connectivity vs precedence, analysis/display separation and invalidation.
- Phases 5/6: topology, interstitial readings, advanced stitch behavior and field combination rules.
- Later: event/pin regeneration and orphans, relation scoring, polyline constraints, rich Tangent/Overlap semantics, physical units and native DWG.
- Legacy browser data still needs raw origin-specific backups before any migration. No migration is needed for an isolated new rebuild namespace.

Return to higher architectural reasoning for these decisions or if new evidence invalidates the documented contracts. Later questions must not block preservation or routine 1B implementation.

## Handoff instruction

Read the current state and verification record. Resolve any pending publication step first, without rebuilding or changing verified source unnecessarily. Then implement Phase 1B only if authorized. Preserve the entire expanded roadmap and all original work. Report intended/delivered/remaining/exact user tests, and distinguish local checks, deployed checks and user acceptance.
