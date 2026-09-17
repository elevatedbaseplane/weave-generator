# SP0 continuation — bounded storage proof and checkpoint audit

2026-09-17. Planning artifacts only. Baseline remains WF-R1D-ANCESTRY-REPAIR-20260917. Supplements and corrects document 57 where stated below. No production module, verifier, threshold or site changed.

## Completed evidence

`docs/evidence/sp0/finite-capacity-proof.mjs` is an independent planning experiment, not the new production codec. Its result is `finite-capacity-results.json`. It imports no application module and writes no browser/database state. It constructs tables at all declared aggregate maxima, checks table continuity, binary64 byte preservation (including signed zero and subnormal certificates), padded base64 round trip, deduplication, exact UTF-8 admission at 10 MiB and rejection one byte above. Seven malformed/over-capacity cases reject.

| Quantity | Bytes |
| --- | ---: |
| One maximum finite-path binary payload | 3,732,864 |
| Its padded-base64 data | 4,977,160 |
| Bounded JSON envelope allowance | 16,384 |
| One payload portable upper bound | 4,993,544 |
| Two distinct maximum payloads + 256 KiB aggregate metadata reserve | 10,249,232 |
| Headroom under 10,485,760-byte ceiling | 236,528 |
| Measured two-payload synthetic document with reserve | 10,218,539 |
| One new + one legacy maximum, using the same allowances | 10,238,564 |
| Current and previous, one distinct maximum each: raw payload union | 7,465,728 |

The reserve is a proof budget, not an additional product quota or an assertion that every arbitrarily large workspace fits. Actual serialized records, source snapshots, dictionaries, labels, crossing templates and manifests count at admission. Identical saved revisions add references; distinct geometry consumes its full payload. Three maximum distinct payloads reject atomically. One maximum new source and bounded metadata fit without reducing geometry or removing certificates.

This proves layout feasibility and byte accounting, not geometrical reachability of simultaneous maxima, semantic correctness of a production decoder, actual browser quota, schema migration, or timing. The synthetic maximum is intentionally a storage envelope rather than a claimed valid stitch. Real generated maximum-work fixtures and a complete production round trip remain SP1 verification obligations.

## Proposed v3 layout, frozen for implementation review

The logical new derived type uses structured identity, finite endpoints and directed u∈[0,1]. The portable envelope uses `derived-buffer-v3`; its fields are id, codec, meta, dictionary, counts, byteLengths, f64, u32, i32, u16. All exact-key and hash rules apply. Raw buffers are little-endian. No lossy conversion or numeric quantization.

| Table | Row/order | Maximum elements |
| --- | --- | ---: |
| f64 | Six per run: p0.x/y, p1.x/y, domain 0/1. Then per fragment: u0,u1,startProvenance.u,endProvenance.u; ordered points x/y; one certificate per segment. | 328,608 |
| u32 | Six per run: role index, run-key index, f64 offset, first fragment, fragment count, reserved zero. Eleven per fragment: parameter offset, point offset/count, certificate offset/count, start-edge offset/count, end-edge offset/count, two vertex flags, reserved zero. | 232,000 |
| i32 | Row and column per run. | 4,000 |
| u16 | Ordered unique start then end boundary edge indexes. | 80,000 |

Bounds: 2,000 runs; 20,000 fragments; 85,536 points; 65,536 certificates; at most two edge references per fragment endpoint, each below 1,000. Domain/fragment order must be valid and source parameters in [0,1]. Offsets are element offsets, canonical and contiguous with no overlaps, trailing bytes or dangling rows. A run with no surviving fragment may be absent from derived output but remains part of source candidate accounting. Dictionary uniqueness and table order are deterministic.

Dictionary has exactly board, pattern, recipe, recipeVersion, roles, runKeys. Board/pattern IDs retain the existing ≤120 UTF-16-unit / ≤480 UTF-8-byte rule; recipe is ASCII `[a-z][a-z0-9-]*`, length≤64; version is positive Uint32; role identifiers are 1–8 distinct ASCII tokens length≤32; run keys are 1–32 distinct ASCII tokens length≤32. Labels are separate authored metadata, never identity. Current recipes use two or four keys. Cell row/column must fit Int32; reject overflow rather than wrap. The full JSON payload with empty buffer strings must fit 16,384 UTF-8 bytes, including escaped dictionary strings, version identifiers, counts and bounded diagnostics. Unknown/unbounded diagnostic arrays cannot be added casually to that envelope.

The structured run identity is the document-57 tuple; do not generate colon-concatenated strings from unconstrained legacy identifiers. A fragment reference is `(derivedFingerprint, runIdentity, fragmentOrdinal)`, where the ordinal distinguishes output fragments only; it must never become the persisted source/crossing identity. Encode and decode preserve every stored field exactly. Source endpoints and certificates are independently represented even if a value could be recalculated. Newly derived identity fragments carry explicit zero certificates in stitch-derived-v1; legacy identity formats retain their absent-certificate semantics exactly.

Authored crossing intent is stored as bounded recipe templates, not 20,000 repeated textual crossing objects. Each template references role/run keys, neighbor-cell offsets, source-parameter bracket expressions and local precedence. Expressions are a versioned declarative whitelist of the reviewed recipe formulas, never executable imported JavaScript. Copies embed their exact template/version. Later R2 events are separate derived data requiring their own capacity proof; this layout does not claim room for an unlimited crossing graph.

Recipe source snapshot storage includes parameter values, transform, role definitions, backside transitions, templates and fields. For the first two built-ins use a 16 KiB per-source JSON schema bound, measured including labels and IDs; workspace records remain subject to actual total admission. This is feasible only for the bounded built-ins, not a promise that arbitrary future custom programs fit. SP1 must measure maximal valid instances, not use filler as evidence of semantic coverage.

## Migration and recovery details

Reserve workspace schema6, portable format3 and storage marker weave-idb-v2. Reuse the existing database/object stores with a transactional head version transition; do not delete/reinitialize the database. Preserve prior schema5 root as previous. Old writers must compare current generation, current root and storage version before commit; version mismatch fails closed. Verify actual old-build behavior in a disposable database before migration is allowed. New format readers dispatch legacy records through the unchanged v2 decoder; old bytes and fingerprints stay unchanged.

Raw recovery is not automatically part of a portable export. A current export includes all current reachable saved revisions; previous recovery has its own complete root. A current/previous union may therefore exceed 10 MiB while each root independently meets portable admission. Two single-maximum roots require 7,465,728 raw geometry bytes plus records/indexes/IDB overhead; two roots each holding two distinct maxima can require twice that amount. Retained undo roots and unreachable records add storage. No finite portable ceiling proves browser quota for arbitrarily long editing histories.

SP1 must record actual database estimates/transaction results for the new layout, keep unchanged content shared, and handle quota failure without losing either root. Do not silently collect immutable revisions or undo state to make a proof pass. Current-root backup and separate previous-root recovery export remain possible. Transaction abort, stale tab, failed migration and missing dependencies must leave the last valid head intact.

## Source-review corrections to document 57

1. Square construction ends after the L surface run enters the fabric. There is no evidence for a mandatory final backside L→T connection. Store T→R→B→L backside transitions only and explicit open thread endpoints. The cyclic over/under relation is not a closed physical thread route.
2. Expand candidate search by an outward-rounded D+epsilon+tau, not D alone. Include transformed motif extents before integer bounds; condition and reject unsafe Int32 cell ranges.
3. Current `combined.mjs:rangesFor` assumes a unit source direction. Passing p1−p0 directly with u∈[0,1] is incorrect. For finite sources solve the general support equation `a u²+b u+c=0`, with a=d·d, b=2d·(p0−center), c=|p0−center|²−radius², using outward-certified root enclosures and clipping to [0,1]. Include tangency and endpoints. The interval curvature multiplier uses |d|², not the unit-direction assumption. Preserve the direct finite endpoint formula and include arithmetic error. Do not normalize and reconstitute endpoints in a way that changes them silently. Tests must include unequal run lengths, anisotropic scale and a support crossing very near each endpoint.
4. Existing combined-generation validation requires at least two letter-named families. New recipes need an explicit generation discriminator accepting 1–8 stable role IDs. Do not weaken legacy family validation or alias a single-role square to fake A/B families. The field equations remain unchanged. Strand-offset variation is hidden for finite recipes in SP1: independent run offsets would break their intended construction; legacy patterns retain variation unchanged. A later motif-variation contract would be separate.

These are bounded necessary source adapters, not permission to rewrite the existing engine or change old fingerprints.

## Construction evidence status

RSN text supports alternating interior diagonal precedence; Sarah's text supports the square's closing L-over-B / L-under-T relation. The existing 24 normalized fixtures establish these relationships in our coordinate models. They do not prove historical diagram equivalence. Direct source images again returned cache-miss failures. Browser navigation to Sarah's tutorial also timed out. A publisher's alternate image was discoverable but direct retrieval failed. No image was downloaded or incorporated into our assets, and no source-image comparison pass is claimed.

The source illustration comparison remains open. Do not release an unverified shape as the named traditional preset. Continue independent proof work, or use an accessible authorized source/illustration when available; do not ask the user to invent geometry. The reference URLs remain in documents 56/57; retrieval evidence is `docs/evidence/sp0/continuation-review.json`.

## R1 checkpoint audit — not executed

Read-only audit found:
- `scripts/r1b-browser.cjs` asserts WF-R1B-DELTA-20260916 and uses old save-carrier/create-weave/typed-coordinate prerequisites. It cannot certify the current simplified UI without a verifier update.
- `scripts/r1c-browser-smoke.cjs` asserts WF-R1D-20260916 and old Carrier/Weave Study headings. It is also stale.
- `scripts/r1b-worker-performance.mjs` exercises the historical R1B fixture. Keep it as the unchanged regression; add a distinct eight-influence/current-generation case rather than silently replace it.
- `scripts/verify-r1b-browser-only.ps1` removes the latest result before running. Archive evidence to a dated checkpoint directory before future execution; do not use that wrapper as-is for this audit.

Recommended next bounded checkpoint-preparation work: new current-build verifier and result directory, exact source/build hashes, new simplified Make Square→Create Pattern→Add Influence flow, eight influences and role/variation tests, boundary-descendant reload/ancestry recovery, legacy compatibility, backup and foreground conflict tests. Keep the original dense fixture, numerical limits and performance thresholds. Separate app windows from verifier full-state inspections. Then run the functional suite, unchanged equivalence/capacity regressions, persistent-worker gates and foreground browser gates once in order, preserving failures. Stop on an authoritative failure.

This turn does not run or modify those application verifiers and does not claim R1 certification. Preparing/running the checkpoint is a separate verification batch; it is not SP1 feature implementation.

## Recommendation and next action

The finite storage design passes SP0's conservative capacity feasibility gate. It is ready for implementation review, with production integration/migration/quota checks explicitly remaining. Construction-image verification and R1 checkpoint remain open. Do not switch to routine Sol SP1 implementation yet. Continue with the two open evidence gates, then seek approval for the exact SP1 contract. R2 crossing matching and SP2 curve certification remain architectural gates, and publication remains separately authorized.
