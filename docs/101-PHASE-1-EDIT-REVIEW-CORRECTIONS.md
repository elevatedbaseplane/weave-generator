# Phase 1 review corrections — repeated settings and woven previews

Build `WF-STABILITY-P1-EDIT-REVIEW-FIX-20260921`. Phase 2 has not started.

## Reproduced failures

Family A hierarchy 3 → 6 saved, but 6 → 3 produced `Transactional storage commit failed: Key already exists in the object store.` Active-root compaction had dropped the earlier content-addressed record from its index while recovery still retained it in IndexedDB. The delta writer used insert-only `add`, so returning to an earlier setting failed and restored the last saved value. This could affect other repeated settings and geometry too.

Woven rendering had three related defects: preview rendering bypassed crossing calculation entirely; crossing completions were checked against committed geometry even when the visible geometry was a preview; and a successful field commit left `carrierPreview` pointing to the old preview. Subsequent canvas redraws could therefore replace the completed woven view with plain overlapping outlines. While crossing work was pending, the renderer also explicitly fell back to unoccluded threads.

## Corrections

- Content-addressed delta records and payloads use idempotent writes, as the full packed writer already does. Existing content can be reused across compacted roots. Transactional freshness checks and atomic head updates remain unchanged.
- Preview and committed geometry both use woven rendering. Crossing responses must match the currently displayed geometry, appearance, rules, project, weave and boundary; obsolete responses are discarded without recording a failure for the newer request.
- Successful field commits clear the transient preview before subsequent redraws.
- During crossing calculation, retain the last complete woven presentation for the same project/weave/boundary. Do not substitute unoccluded outlines. A new weave without an accepted presentation waits for its first result. Genuine worker/render deadline failures remain reported; thresholds are unchanged.

## Verification

56 focused checks pass, including a repeated 3 → 6 → 3 storage regression with retained recovery records, existing stale-worker and timing-limit checks, visible-preview crossing acceptance, obsolete appearance rejection, and last-complete woven rendering. Canonical fixtures, family rules, appearance and atomic field commits remain covered. Static/syntax checks pass.

In the actual local browser, reproduced the duplicate-key failure before the fix. Afterwards, hierarchy 6 → 3 and native slider 3 → 4 → 3 saved successfully. Family A attractor strength 29 → 30 → 29 saved, and the completed layer remained woven (`data-woven-pending=false`). The entire final working object matched the pre-test object exactly, including all four families, three influences and crossing rules. Evidence: `docs/evidence/phase1-review-fixes/`.

For user review: move family A hierarchy to 6 and back; drag influence or family controls, release, then pan or change appearance. The accepted hierarchy should persist, and the canvas should retain its last complete over/under view while calculating the new one. Geometry and appearance remain separate from crossing order.

Publication status is recorded separately after the native Sites operation. Phase 0 evidence remains unchanged and diagnostics remain local-only.
