# R1B storage repair — capacity gate failed

2026-09-16. Document 24 was approved and its storage-repair batch authorized. Implementation stopped at the explicit capacity/backup-admission gate before IndexedDB or application integration. No geometry, numerical limit, browser test, backup ceiling or production module was changed.

## Completed work

Built an isolated exact binary64 coordinate/certificate codec with versioned manifest, content hashes, bounded offsets, lossless decoding, immutable record/payload deduplication and exact UTF-8 JSON admission. Four focused tests passed: Float64/certificate round trip, corrupt/overlapping/truncated payload rejection, representative dense revision backup round trip/deduplication and missing-reference/aggregate-overflow rejection.

The representative dense workspace plus one immutable revision fits a 1,602,745-byte portable file with a 745,680-byte numeric payload. Initial encoding/admission took 282.11 ms in Node for that saved-revision case. This is diagnostic timing, not a browser completion/responsiveness pass.

## Failed maximum-workload check

[capacity-gate.mjs](evidence/r1b-storage/capacity-gate.mjs) builds a simple 100-vertex polygon: 24 teeth connected by a bottom bar. The exact unchanged evaluator runs with A/B spacing 0.64, radius 1, strength 50 and center (250,5). This is an additional capacity fixture; the established dense browser fixture was not edited. It is actual generated geometry, not an unproven combination of independent maximum bounds.

The initial exploration at spacing 0.7 admitted 18,228 fragments and a 9,692,657-byte file; spacing 0.65 admitted 19,634 fragments and a 10,435,985-byte file. Spacing 0.64 approaches the approved 20,000-fragment cap and fails portable admission while remaining within numerical workload limits. These exploratory sizes came from terminal results; the rejected-v1 structured result is preserved in [capacity-gate-v1-failure.json](evidence/r1b-storage/capacity-gate-v1-failure.json). The later `capacity-gate.json` is the successful v2 rerun and does not replace this evidence.

| Final generated result | Value |
| --- | ---: |
| Expanded candidate lines | 1,564 / 2,000 |
| Reconstructed segments | 4,997 / 65,536 |
| Clipped output segments/certificates | 21,053 / 65,536 |
| Fragments | 19,946 / 20,000 |
| Segment-edge tests | 51,253 / 8,000,000 |
| Epsilon | 0.0005 |
| Maximum certified error | 0.0004994054698379544 |
| Complete result | true |
| Binary payload | 824,408 bytes |
| JSON derived manifest | 9,496,874 bytes |
| Base64 payload | 1,099,212 bytes |
| Manifest + base64 lower bound | 10,596,086 bytes |
| Portable ceiling | 10,485,760 bytes |
| Excess before workspace/envelope overhead | 110,326 bytes |

The codec correctly rejected with typed backup-capacity. Correct rejection is necessary for safety, but rejecting a single supported complete geometry fails document 24's capacity obligation. This is a codec-layout failure, not evidence that IndexedDB lacks capacity. No browser quota, migration, database transaction, 750 ms or all-R1B pass is claimed.

## Architectural review recommendation

Retain transactional IndexedDB and the 10 MiB self-contained JSON ceiling. Expand exact physical encoding to fragment identity and provenance, rather than leaving those repeated structures in JSON. The manifest is over 11 times the raw numeric payload here. Intern exact repeated identity strings in a bounded dictionary; store fragment t0/t1 and endpoint t values in Float64 buffers; store edge-index lists with bounded integer offset/count arrays; represent booleans and dictionary references compactly. Every field must decode exactly, including original fragment IDs and sorted edge arrays. Do not replace IDs with newly derived strings unless exact reconstruction is proven for every legacy case.

Prove a joint upper bound over actual admitted geometry, including longest permitted identities, fragment/edge metadata, record tables and binary-to-base64 expansion, then test generated near-limit shapes and mixed immutable revisions. Compression can be optional but cannot be the capacity proof. No reduction in geometry, certificates or workload and no quota/backup-limit increase is recommended.

This is a recommendation for review, not an implemented second codec. The user's explicit stop instruction applies once this capacity gate fails even though the next codec layout may be a bounded engineering change. Resume only after the review resolves that layout/proof and implementation is reauthorized.

## Preserved checkpoint

The prototype is archived as [storage-codec-prototype.mjs](evidence/r1b-storage/storage-codec-prototype.mjs), outside public dist/ and unreferenced by the application. Focused tests are in tests/storage-codec.test.mjs. The capacity script intentionally exits nonzero for the preserved failure. No IDB adapter, migration, application integration, publication or R1C was begun after the gate failed. Prior 52-test evidence remains applicable to its recorded production source.
