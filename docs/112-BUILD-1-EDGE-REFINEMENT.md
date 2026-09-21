# Build 1 — edge refinement

Date: 2026-09-21

Build: `WF-B1-EDGE-REFINEMENT-20260921`

## Status

The visual edge refinement requested after Build 1 is complete and verified. It does not begin contact constraints, adaptive tension, or any later feature phase.

## Visible behavior

Derived weave threads no longer finish as closed rectangular ribbons. Each outline is drawn as two open contour paths. A certified fragment that meets the working boundary receives a presentation-only continuation equal to 10% of the boundary's larger extent. The continuation begins on the fragment's local tangent and blends toward the authored source direction when that direction is available.

The square or irregular boundary remains available as a drawing reference, but it no longer acts as a hard mask for the derived weave. Source and construction layers remain clipped to the authoritative boundary. Over/under occlusion masks still use the original certified strands, so the continuation cannot change crossing identity or assignment.

The crossing worker produces only the certified woven body. Boundary continuations are appended on the main presentation layer after the worker result is accepted, keeping the edge treatment outside the unchanged 750 ms certified-completion gate. The initial version-13 publication placed continuation work inside the crossing worker and the dense five-family Site fixture exceeded that gate. Version 12 was immediately restored before this separation was implemented and reverified.

SVG presentation exports use the same open-edge continuation and record it as `presentation.openThreadEnds`, `presentation.boundaryContinuation`, and `presentation.lengthRatio`. The complete certified geometry remains embedded unchanged in export metadata.

## Preserved contracts

- No canonical source, derived geometry, certificate, crossing identity, rule, saved revision, compact payload, migration, storage, recovery, worker, or workload limit changed.
- The continuation is created only while rendering or exporting. It is never written back into the working document.
- Existing Phase 0 fixtures and canonical regeneration remain exact.
- Build 1 crossing precedence, seeded variation, family rules, influences, hierarchy, zoom behavior, and latest-request rendering remain in place.

## Verification

- Governing current-contract matrix: **249/249 passed**.
- Focused appearance, occlusion, crossing execution, precedence, workflow, and hierarchy suite: **33/33 passed**.
- Preserved Phase 0 diagnostic and frozen-fixture checks: **8/8 passed**.
- Changed-module syntax checks and static entrypoint/reference/private-output check passed.
- `git diff --check` passed.

The full historical suite was also sampled. Its remaining failures are the already audited Phase 0 production-byte lock and obsolete historical UI/schema/SVG harnesses excluded by the governing matrix; no new current-contract failure remained.

## Managed-browser evidence

The preserved three-family Phase 6 fixture restored with 31 source paths, 31 derived paths, three fields, and storage unblocked. At Fit, the derived layer contained 31 woven body paths and three family-grouped boundary-continuation paths, with zero closed visible paths, no boundary clip, and no pending fallback. After zooming to 131.3%, the weave remained visible with no browser warning or error.

Evidence is recorded in `docs/evidence/build1-edge-refinement/browser-verification.json`.

## Review

Open the current weave and inspect all four boundary edges. Threads that meet an edge should continue beyond it as open contours, with deformed strands settling toward their source direction. Zoom and Fit should keep the same open edges and woven overlap masks. The boundary remains visible when enabled, but it should read as a reference rather than a rectangular crop.

Contact constraints and adaptive tension remain the next planned build and have not begun.
