# R1B transactional storage implementation

2026-09-16. Build candidate `WF-R1B-IDB-20260916B`. The codec compatibility repair and automated/capacity verification pass, but the normal-host browser run failed the approved 750 ms end-to-end completion gate. R1B is stopped for architectural review. No publication or R1C work.

## Host completion gate — failed

The normal-host run passed fixture setup after the v1 compatibility repair and completed the preliminary cycles. Cold add committed in 67.5 ms, the coalesced edit in 87.6 ms, dense boundary in 84.7 ms, and dense A spacing in 362.2 ms. Dense B spacing request 5 then completed certified worker derivation in 278.8 ms and entered storage preparation, but the deadline abort fired at 765.3 ms with typed `completion-timeout`. No `committed` event exists for request 5; pending and active worker state both returned to null, so the atomic failure behavior held.

This is a product performance failure against the approved maximum, not the earlier fixture defect and not a test timeout to increase. The complete source evidence remains `verification/local-r1b/browser-failure-latest.json`, SHA-256 `D9BD3C89E5FC108885C2F1BF831CB2D9EE92CE3BE4B3E05FCEAAF4E5DF34CFC6`; a stable summary is stored at `docs/evidence/r1b-storage/host-completion-timeout-20260916.json`. Per documents 22, 24 and the user's stop instruction, further implementation and repeated runs require architectural review first.

The focused review is complete in [28](28-R1B-INCREMENTAL-STORAGE-REPAIR-CONTRACT.md). Its diagnostic profile confirms repeated geometry hashing, full repacking and expanded history copies dominate the avoidable path. Document 28 defines a single worker-side encode/hash for new geometry, content-addressed delta snapshots, exact additive backup admission, root-based history and phase-complete browser telemetry. It was approved; the stopped implementation outcome follows.

Document 28 was subsequently approved for implementation. Partial candidate `WF-R1B-DELTA-20260916` passed focused incremental payload/revision reuse and exact-ledger checks, but the defined sequential automated suite stopped on an unchanged dense evaluator p95/max failure of `576.15/650.54 ms` against `300/400 ms`. Evidence is preserved at `docs/evidence/r1b-storage/incremental-repair-sequential-gate-failure-20260916.json`. No browser run, publication or R1C work followed.

Document 29 preserves that failure and completes the requested process-isolation review. Three fresh-process combined derivation/encode runs all fail p95; four persistent browser-matching worker runs all fail p95 and three fail maximum. Benchmarking before and after the complete suite disproves prior allocations as the sole cause. No fresh-process gate exception is justified. Document 29 defines a bounded, exact-output worker hashing and allocation repair for separate approval; implementation remains stopped.

The document-29 repair was subsequently approved and implemented as `WF-R1B-OPT-20260916`. Exact baseline equivalence, 62 functional tests and capacity proofs pass, and three diagnostic persistent-worker runs pass 300/400 ms. The formal actual-wrapper gate then records p95/maximum `356.35/361.02 ms`; its p95 fails. Document 30 preserves all results and the structured failure. The stop remains in force and no browser run followed.

## V1 identity compatibility repair

The first normal-host run of `WF-R1B-IDB-20260916` reached Chrome but failed during fixture setup with `Invalid fragment keys.` No worker request or timing cycle began. The exact structured failure is preserved in `docs/evidence/r1b-storage/host-failure-v1-identity-codec.json`.

The cause was an implementation defect in `encodeDerived`: it required `segmentErrorBounds` on every fragment, although valid R1A `weave-study-v1` identity fragments intentionally have no certificate field. The repaired codec dispatches from `versions.study`. It requires the exact certificate-free v1 shape and zero certificate counts, and still requires the exact certified v2 shape and points-minus-one certificate counts. Decode applies the same rules and only materializes `segmentErrorBounds` for v2. Canonical expanded objects and their existing fingerprints are unchanged.

Three direct compatibility fixtures now cover: v1 working geometry, a v1 immutable saved revision, and a mixed workspace with a v1 saved revision plus v2 working and saved geometry. Each pack/unpack is deep-equal, retains the original digest, proves the v1 field stays absent, and proves v2 certificates remain present. Cross-version field mixtures retain strict rejection through exact-key and count validation.

## Compact capacity gate — passed

The settled codec is [26](26-R1B-COMPACT-CODEC-CONTRACT.md), `derived-buffer-v2`. It validates and reconstructs repeated strand/fragment identities, preserves every Float64 point, fragment/source parameter, endpoint provenance, edge index and certificate, and uses bounded Float64/Uint32/Int32/Uint16 tables. The application never imports the rejected v1 prototype.

Executable proof:

- Actual document-25 fixture: 19,946 fragments, 21,053 certificates, exact complete geometry; portable backup reduced from the failed >10 MiB form to 3,391,217 bytes.
- Synthetic exact maximum: 2,000 strands, 20,000 fragments, 85,536 points, 65,536 certificates and 80,000 edge references; 3,724,864 decoded buffer bytes and 4,968,987-byte complete portable workspace.
- Two distinct synthetic maxima: 9,937,492 bytes, admitted under 10 MiB.
- Third distinct maximum: typed `backup-capacity`, rejected before output/commit.

Results are in `docs/evidence/r1b-storage/capacity-gate.json` and `codec-capacity-proof.json`. No compression, quota increase, certificate removal or geometry reduction is part of the proof.

## Implemented storage repair

- `derived-buffer-v2` production codec and portable JSON envelope v2, with legacy envelope v1 import retained.
- Dedicated storage worker for schema validation, encoding/admission, decoding, legacy migration and portable export away from the main thread.
- IndexedDB `weave-foundation-v1` with heads, snapshots, records, payloads and recovery stores.
- One strict-durability transaction inserts immutable records/payloads and advances current/previous roots plus monotonic generation. Transaction completion is the commit boundary.
- Content-addressed payload/revision sharing without logical mutation; no garbage collection or revision pruning.
- Exact legacy current/previous/schema-original byte preservation and idempotent migration marker. Legacy localStorage is not cleared or rewritten.
- Current-load corruption blocks writes; a previous root is separately decoded and worker-certified before the UI offers a portable recovery download.
- In-transaction generation/root comparison for stale-tab rejection; advisory localStorage metadata cannot invalidate a completed database commit.
- Typed storage-open, durability, quota, transaction-abort, concurrent-change, corruption, format, capacity and deadline failures.
- Full final-input-to-render 750 ms deadline covers geometry, storage preparation, transaction, history and render. Abort is attempted before transaction completion. A transaction that completes but misses the render gate remains authoritative and is reported as a performance failure.
- Portable v2 exports are self-contained and remain capped at 10 MiB. Import expands, validates, worker-certifies and commits atomically.

## Automated verification

Latest complete host-script automated run before the final explicit cross-version rejection fixture: 59 tests pass. Dense evaluator p50/p95/max: 218.20/283.50/300.31 ms, passing 300/400 ms. The final local run passes 60 tests. Codec tests cover the three v1/mixed compatibility paths, rejection of v1/v2 certificate-field mixing, exact special Float64 values, corrupt/truncated/overlapping data, identity/provenance reconstruction, dense revision deduplication, missing references and aggregate overflow. All prior R1A/R1B numerical, clipping, migration, immutability and atomic LocalStore regression tests remain green.

One preceding full run recorded p95 319.16 ms and failed the 300 ms worker gate; an isolated rerun passed at 213.98 ms and the subsequent complete run passed at 214.69 ms. This transient failure remains recorded and is not deleted. Host browser measurements govern the final worker and end-to-end gates.

Static entrypoint/local references/private-output checks, syntax checks, PowerShell parsing and `git diff --check` pass. No production source references the rejected `derived-buffer-v1` prototype.

## Browser suite — failed on normal host

The revised suite preserves the unchanged 30-run dense workload and asserts pending <=50 ms, worker p95/max <=300/400 ms, end-to-end p95/max <=500/750 ms and no attributable main-thread task >=50 ms. It additionally verifies:

- strict transactional initialization and monotonic generation;
- complete current and previous snapshots after reload;
- stale second-tab generation rejection without changing its in-memory working state;
- dense saved revision persistence and worker certification;
- portable JSON v2 below 10 MiB, fresh-context import and immutable revision recovery;
- exact legacy localStorage bytes retained in both localStorage and the IDB recovery store;
- migration completion marker and database discovery independent of advisory metadata.

After the compatibility repair, the complete normal-host verification script passed 60 automated tests, both capacity proofs and static checks. Worker-kernel p50/p95/max were 188.50/227.51/241.19 ms. The browser portion reached real application execution and produced the completion failure above. The previously observed managed-environment `spawn EPERM` is superseded for browser reachability by this host evidence.

R1B remains an implementation candidate with a failed browser completion gate. The failure returns the batch to architectural review. Publication and R1C remain forbidden.
