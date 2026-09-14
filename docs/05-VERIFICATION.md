# Phase 1A verification

Build label: `WF-1A-20260914`. Date: 2026-09-14. Windows, Node v24.19.0, Codex in-app browser. Release identity and publication status are in 02-STATE-DECISIONS-AND-TESTS.md and release.json.

## Reused Phase 0 evidence (not needlessly repeated)

- Original Weave HEAD `44953adacf6b6a47fb93447be177cbd7710428f5`, main, matched Sites v39 source provenance and succeeded deployment.
- Actual ReadWrite file open succeeded without writing; app.mjs SHA-256 before and after `C4254CD577C83F31C596ACDBFF940E4A0C87497CD2F432FCB2407FF9BB931F22`.
- Original dirty state: app.mjs/index.html modified; point-extraction.mjs and its test untracked. 77 insertions / 33 deletions in tracked files.
- 18 package manifest entries verified; complete Git bundle verified; 22 ZIP files match baseline (21 CRLF-only text differences, one exact binary).
- Saved experimental patch matches current diff after line-ending normalization; both untracked preservation copies are exact.
- No original saved-browser data has been exported, migrated or cleared. Source archives do not back up browser studies.
- Tangent reference HEAD `a6cc3c2826b4e55f311b6a9e06b7d94c2ffe02a6` matches Sites v32 with succeeded deployment. Source checkout clean. Original live UI reached sign-in; authenticated production behavior was not verified.
- geometry.mjs, network.mjs, svg-io.mjs and dxf-io.mjs are identical between baseline Weave and current Tangent. Existing Tangent SVG/DXF tests passed (2 test files).

## Automated-pass

12 foundation tests in tests/foundation.test.mjs:

1. Exact square, concave boundary, explicit closure and vertex order.
2. Rejection of degenerate, crossing, touching, repeated/backtracking and nonfinite geometry.
3. Same-name revision chain: a dependent fixture still resolves original 500-unit source after a 200-unit revision.
4. A/B/C portable round trip with exact active revision and coordinates.
5. Invalid latest/source references, schema, units and active board rejection.
6. Backup import preserves existing boards; identical copies deduplicate, changed identities fork.
7. Working-document undo/redo and new-edit redo clearing; saved revisions retained.
8. Pointer transform inversion across aspect ratios; cursor-anchored zoom; immutable geometry.
9. Local storage round trip, previous-value recovery and concurrent-tab conflict detection.
10. Malformed stored data and quota failure never overwrite good storage.
11. Tangent baseline DXF parser preserves asymmetric vertex order and Y-up coordinates, $INSUNITS=0.
12. SVG explicitly negates Y and preserves dimensions/order.

Static asset checks passed: entrypoint, relative references, no private guide/book/archive in dist, rebuild-only destination. All public modules pass node --check. Initial check script used child-process spawning and hit EPERM; it was changed to static checks with separate shell-driven syntax checks. No production code workaround was needed.

## Browser-pass (local reference origin only)

- Initial grid and boundary hidden, control sections closed; reveal square works.
- Save A revision 1 at 500 units, then A revision 2 at 200 units. Model read-back: two revisions, old side 500, new side 200, latest points to revision 2.
- Save B and six-vertex asymmetric concave C. Reload: full workspace JSON equal, including sourceRevisionId and all saved entries.
- Restore A1, undo to C, redo to A1: exact working-state equality.
- Change Neo and collapse controls: source geometry unchanged. Neo visually green, with no CSS inversion.
- Resize to 390x844 and reload: same boundary coordinates, accessible collapsed-rail layout. Desktop checked at 1280x800 and default host size. Model fits adapt without mutating source data.
- Malformed backup JSON shows an error and leaves geometry unchanged. Changed same-identity backup creates a second board; original board JSON remains exact.
- Draw three vertices directly on canvas and finish: closed valid triangle. Drag one vertex, then undo once: exact pre-drag working boundary restored.
- WebMCP read_weave_foundation registered, read-back reflects actual UI state, invalid extra input rejected.
- Tangent v32 source served separately at loopback port 43829: imported generated asymmetric-boundary.svg through actual file picker. Read-back retained all six ordered vertices with Y negated exactly once; source unitsCode 0; geometry valid; visible orientation matched the Weave fixture.

## Limits / remaining acceptance

- Phase 1A user acceptance passed on the private live site. Phase 1B verification is recorded separately in 06-PHASE-1B-VERIFICATION.md.
- Tests do not certify extreme coordinate magnitudes, large architectural studies, prolonged interaction memory growth or dense geometry performance.
- SVG→Tangent import is verified; a complete receiving-tool export/import round trip is not yet certified.
- DXF parser read-back is verified; Tangent displays imported numeric Y directly, so on-screen orientation parity is not certified. SVG is the tested visual handoff path.
- Tangent/Overlap whole-polyline-set transfer, open polylines, rich metadata and receiver changes are not implemented.
- Browser saved data remains device/origin-local; JSON backup is required for transfer. Local QA boards were created only at the new loopback test origin; no original browser studies were edited.
- Private publication succeeded on 14 September 2026. Site version 1 records source commit `4d4e297dde6f7f88b87821a4ea0c95e6e1a92251`; deployment `appgdep_6aa8428302fc8191a12f1e14043a4be2` reached `succeeded` at `https://weave-foundation.notbrandon175.chatgpt.site`.
- Live verification confirmed title `Weave Generator — Foundation`, build `WF-1A-20260914`, schema 2, browser-local storage available, boundary/grid initially off, and the owner as the sole viewer with zero groups. Phase 1A user acceptance subsequently passed.
- The final viewport correction fills the available body height; final 1280x800 read-back reports bodyHeight/mainBottom/viewportHeight 800 and scrollWidth/clientWidth 1280. Earlier 390x844 visual and coordinate checks passed. No hidden overflow was observed in those checked layouts.

## Exact user acceptance actions

1. Open the rebuild. Grid/frame and boundary should initially be off on a fresh browser. Select SHOW BOUNDARY: a 500×500 square appears.
2. In BOUNDARY, save name A. Change SQUARE SIDE to 200, MAKE SQUARE, save A again. Boards should show A R02 LATEST and A R01. R01 restores area 250,000; R02 restores area 40,000.
3. Save a second name B. In VERTEX COORDINATES enter `-40,10 / 120,10 / 120,90 / 30,90 / 30,40 / -40,40`, one pair per line. APPLY, save C, FIT. Expect six vertices and area 9,300. Reload; C and both A revisions remain.
4. DRAW BOUNDARY, click three well-separated vertices, FINISH. Drag one vertex and UNDO once: the triangle returns exactly. Another UNDO restores the previous boundary. REDO reapplies the operation.
5. Change Light/Dark/Neo, toggle panels, resize, use PAN and FIT. Geometry coordinates in VERTEX COORDINATES must not change. Neo is green.
6. DOWNLOAD BACKUP. Import it into another browser/origin with the rebuild. Named entries, revisions and working coordinates return. Importing into the same workspace must preserve existing boards. Malformed JSON must show an error without changing them.
7. Restore C, open BOUNDARY EXCHANGE, download SVG. Import that one polygon into Tangent. Expect six anchors, the same shape orientation, and valid tangent geometry. Do not interpret this as multi-polyline or open-trace support.
