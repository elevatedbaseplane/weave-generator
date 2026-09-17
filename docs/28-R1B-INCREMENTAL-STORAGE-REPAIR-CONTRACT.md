# R1B incremental storage-preparation repair contract

2026-09-16. Status: document 31 revises only the complete-worker p95 from 300 to 375 ms, retaining the 400 ms worker maximum and 500/750 ms end-to-end limits. A subsequent normal-host run passed total completion at 205.9 ms but failed only the render phase at 74.9 ms. Document 32 corrects the targeted-render implementation and passes all automated gates; a normal-host browser rerun is required. The document-30 failure and later render failure remain preserved.

## Finding and recommendation

The failed request was atomically rejected before IndexedDB transaction start. It was not a geometry, codec-capacity, quota, recovery or test-race failure. Request 5 spent 278.8 ms in the certified evaluator, reached `SAVING` 559.7 ms after final input, then used the remaining 190.3 ms without completing current storage preparation. The deadline fired at 765.3 ms. Request 4 on the same host committed in 362.2 ms, so the failure is workload-sensitive repeated preparation rather than a fixed transaction delay.

The current hot path performs work whose identity is already known:

1. the evaluator worker hashes the new expanded result;
2. the main thread hashes that result again for response validation;
3. the storage worker validates the complete workspace, including unchanged libraries;
4. `packWorkspace` clones the complete workspace, encodes the result and hashes it a third time;
5. `packWorkspace` hashes unchanged immutable records and the new manifest;
6. portable admission base64-serializes every referenced payload, including unchanged payloads;
7. the transaction writes all referenced payloads and records again;
8. history stringifies both expanded states and clones the prior expanded geometry.

Adopt an **incremental certified payload and delta-snapshot commit**. The evaluator worker must encode and hash each new derived result exactly once. It returns the expanded result for the existing renderer plus the exact `derived-buffer-v2` payload with transferable buffers. The main thread validates the versioned response and its structural linkage without re-encoding or re-hashing expanded geometry. Persistence creates only a small manifest referencing the new payload and previously known immutable IDs, computes exact portable admission from cached byte contributions, writes only new content plus the snapshot/head delta, and records history as content-addressed committed-state handles.

## Measurement evidence

The reproducible diagnostic is `docs/evidence/r1b-storage/preparation-profile.mjs`; its output is `preparation-profile.json`. It uses the accepted 100-vertex alternating-radius boundary with A/B spacing 2.5, producing 398 strands, 840 fragments, 30,328 reconstructed segments and 30,510 certificates. Seven local Node runs measured:

| Current phase | p50 | p95/max | Interpretation |
| --- | ---: | ---: | --- |
| Result structured-clone round trip | 55.85 ms | 57.38 ms | Proxy for large worker-result transfer; browser telemetry remains authoritative. |
| Trusted whole-workspace validation | 8.69 ms | 15.89 ms | Rechecks unchanged document and carrier state. |
| Whole-workspace structured clone | 14.73 ms | 17.74 ms | Copies expanded current geometry. |
| One expanded-geometry SHA-256 | 73.13 ms | 114.66 ms | Currently repeated in worker, main validation and codec. |
| Compact codec encode, including its hash | 92.74 ms | 95.52 ms | Required once for new geometry, currently repeated after certification. |
| Full portable serialization/admission | 20.60 ms | 20.95 ms | Serializes payload bytes that are already content-addressed. |
| Current complete `packWorkspace` | 172.65 ms | 244.24 ms | Matches the host failure's 205.7 ms incomplete storage interval. |
| Current history record | 63.19 ms | 80.20 ms | Stringifies both expanded states and clones the prior state. |

The failed request never began an IndexedDB transaction and never performed history update or committed render, so those three browser phases cannot be recovered from document-27 timestamps. The repaired candidate must emit the phase telemetry below on every verification cycle; acceptance requires measured host values rather than inferred subtraction.

## 1. Certified worker output

Keep the approved evaluator and all numerical limits unchanged. After successful derivation, the same evaluator worker calls the existing strict `encodeDerived` exactly once. `encodeDerived` remains the authority for exact fragment shapes, Float64 preservation, certificates, IDs, provenance, limits and the `sha256-v1` payload ID. The worker must not call `digest(result)` separately; `payload.id` is the result canonical fingerprint produced by the single codec hash.

The success envelope adds:

```text
result                       complete expanded derived object for the renderer
payload                      complete derived-buffer-v2 envelope
resultCanonicalFingerprint   exactly payload.id
timing                       derive and encode phase timestamps/durations
```

The four payload buffers transfer to the main thread. Transfer must not detach any array used by `result`; the expanded result and compact tables are separate representations created during the one worker operation. The payload is new content for this request. Existing payloads never cross the worker boundary again.

Main-thread eligibility retains every request/session/build/board/study/base/candidate/version check from document 22. `baseCommittedFingerprint` becomes the already committed IndexedDB root rather than `digest(project().working)`. This removes two full hashes of unchanged committed geometry while strengthening the comparison against the transactional head.

For an eligible local same-build worker response, main-thread validation must check exact envelope keys, versions, request identity, `payload.id === resultCanonicalFingerprint`, payload/meta/result fingerprints, diagnostics/count correspondence, buffer types/lengths, canonical monotone offsets, dictionary identities and declared bounds. It must not encode, decode or hash the expanded result again on the hot path. Browser structured clone and transferable-buffer delivery are the transport integrity boundary for this local module worker. Load, recovery, import and automated fixtures continue to run full `decodeDerived`, digest and independent recomputation checks.

Positive tests must prove `decodeDerived(payload)` is deep-equal to `result` for v1, v2, maximum geometry and mixed saved revisions. Negative tests must alter every linkage field, count, offset, buffer and fingerprint and prove atomic rejection before transaction start.

## 2. Incremental workspace manifest

Replace hot-path `packWorkspace(workspace)` with `prepareDelta(committedIndex, candidateMetadata, payload)`.

`committedIndex` is created only from a validated committed snapshot and contains:

```text
currentRoot
manifest without expanded derived geometry
recordId -> immutable record descriptor and exact portable byte contribution
payloadId -> immutable payload descriptor and exact portable byte contribution
snapshot recordIds and payloadIds
expanded current workspace object for display
```

The candidate pending state contains authored inputs only. It must not clone or carry the prior expanded derived result. On success, the new expanded working object uses structural sharing for unchanged boundary, carrier, source context and saved libraries, and attaches the new `result`. No code may mutate shared committed objects; document operations create replacements along the changed path.

`prepareDelta` performs only:

1. validate changed authored metadata and request linkage;
2. replace the current derived reference in a small cloned manifest with `payload.id`;
3. reuse all unchanged record and payload IDs from `committedIndex`;
4. add the new payload descriptor if its ID is absent;
5. hash the compact manifest/root, which contains references rather than expanded geometry;
6. compute exact portable admission from the ledger below;
7. produce `{snapshot, newRecords, newPayloads, root, backupBytes}`.

Ordinary attractor edits create no immutable saved-revision record. Saving a revision creates one compact record from the small working manifest and references an existing payload ID. An unchanged record or payload is never cloned, encoded, hashed, serialized, transferred or put to IndexedDB again.

## 3. Exact backup-admission ledger

The 10,485,760-byte portable ceiling remains an exact precommit gate. Replace full base64/JSON materialization during interactive commits with exact additive accounting:

- cache `JSON.stringify` UTF-8 byte length for every immutable record when first created;
- cache each payload's JSON metadata byte length plus exact padded base64 lengths `4 * ceil(bufferBytes / 3)` for its four buffers;
- compute the current manifest/root JSON bytes because that compact structure changed;
- include exact envelope field, bracket, quote and comma bytes according to portable envelope v2;
- deduplicate contributions by content ID exactly as export does.

The accounting function must be proven byte-for-byte against `Buffer.byteLength(portableText(packed))` for empty, v1, v2, mixed, actual comb, every synthetic maximum, two-maximum and Unicode/long-ID fixtures. A one-byte mismatch is a storage-format failure and blocks commit. Portable export remains self-contained JSON v2 and performs actual base64 serialization on explicit export, outside the interaction deadline. Export recomputes the actual byte count and rejects corruption if it differs from the committed ledger; it does not retroactively prune or alter work.

## 4. Transaction, recovery and concurrency

Add `commitDelta(delta, expectedHead, signal)` using the existing strict-durability transaction and stores. Within one transaction it must:

1. read and compare generation/current root with `expectedHead`;
2. insert only absent `newRecords` and `newPayloads` by content ID;
3. insert the complete new snapshot containing the compact manifest, complete referenced-ID sets and exact backup bytes;
4. advance generation, previous root, current root and transaction ID atomically.

If a returned payload ID already exists in the validated committed index, the new buffers are discarded and the existing immutable payload is reused without reading, comparing or writing its bytes on the hot path. SHA-256 identity plus the prior full load/recovery validation is the content-address invariant. Database load, migration and recovery continue to decode and verify every referenced payload; an ID/value mismatch there is corruption and blocks writes. Existing content is never overwritten. Stores remain append-only; no garbage collection or revision pruning enters this batch.

Current/previous recovery behavior is unchanged. The previous root always names the last complete committed snapshot. A deadline before transaction completion requests abort. If the strict transaction completes before abort is observed, its head is authoritative and a postcommit performance failure is reported as document 24 requires. Quota, durability, blocked database, stale tab, transaction abort and corruption remain typed atomic failures.

The current database can retain version 1 object stores. Snapshot records gain an explicit snapshot-format version and ledger fields. On first load of an old snapshot, the storage worker fully validates its current packed form, computes contributions once, writes the upgraded snapshot and migration marker in one strict transaction, and preserves original current/previous roots and legacy recovery. Migration is idempotent and failure leaves the old database authoritative and blocked from writes. Portable JSON version 2 and logical schema 5 do not change.

## 5. Constant-time history and targeted render

Replace expanded-state `History.record` for R1B commits with immutable committed-state handles:

```text
{ root, generation, expandedWorkspaceReference }
```

Recording a successful commit pushes the prior handle and clears redo without stringify, clone or geometry hash. The referenced workspace is immutable by application discipline and mutation tests. Undo/redo commits an already existing snapshot root through the same generation compare-and-swap transaction, then swaps the in-memory handle; it does not re-encode geometry. History remains session-local and saved revision libraries remain durable and append-only.

After commit, update only controls/status and the derived SVG layer affected by the new working result. Rebuilding unchanged board and revision lists is outside this hot path. Render completion is measured through the next animation frame after DOM mutation. Geometry remains the exact expanded result; no sampling, certificate removal or alternate preview is allowed.

Document 32 implements this clause directly. R1B pending/commit rendering no longer enters the full renderer. Derived geometry uses at most one SVG path per family with one subpath per certified fragment; exact coordinates, order, gaps, visibility and family styling are retained. Full rendering remains required for operations that change the wider document or viewport.

## 6. Required phase telemetry

Every browser verification cycle must record monotonic phase boundaries with request ID:

```text
finalInput -> dispatch
worker receive -> derive complete
derive complete -> codec complete
worker post -> main receive                 worker-result transfer
main receive -> eligibility/structure valid
validation -> backup admission complete
transaction open -> complete/abort
history start -> complete
render start -> next-animation-frame complete
finalInput -> committed render              authoritative total
```

Worker and window timestamps use `performance.timeOrigin + performance.now()` and the verifier rejects incompatible origins or negative intervals. Transfer includes message materialization. IndexedDB timing starts before opening the readwrite transaction and ends only on `complete`/`abort`. The verifier also retains long-task observation; no attributable main-thread task may reach 50 ms.

Phase diagnostic targets for the accepted dense host fixture are below. The encode target includes its one required geometry hash; the measured current p95 is 95.52 ms, so the contract does not treat that hash as a free or separately deferred operation. The complete worker gate covers derivation plus encoding and remains the authoritative worker limit.

| Phase | p95 | maximum |
| --- | ---: | ---: |
| final input through dispatch/startup/request delivery | 60 ms | 100 ms |
| derivation before compact encode | 250 ms | 325 ms |
| worker compact encode including the single result hash | 100 ms | 125 ms |
| complete certified worker: derivation plus encode/hash | 375 ms | 400 ms |
| worker-result transfer/materialization | 75 ms | 100 ms |
| main eligibility and structural linkage | 25 ms | 40 ms |
| incremental manifest plus exact admission | 15 ms | 30 ms |
| strict IndexedDB delta transaction | 50 ms | 100 ms |
| history handle update | 1 ms | 5 ms |
| targeted render through next frame | 30 ms | 50 ms |

These diagnostics do not replace the approved authoritative gates: pending display remains at most 50 ms; complete certified worker p95/max is 375/400 ms under document 31; final-input-to-render p95/max remains 500/750 ms; and attributable main-thread tasks remain below 50 ms. A phase miss identifies the next review target even when the aggregate happens to pass. An aggregate miss stops the batch regardless of individual phases.

## 7. Alternatives considered

**Keep full packing but cache its last output:** rejected. It still must clone, encode, hash and serialize the new expanded result and rebuild a complete packed workspace. It removes little of the failed request's critical path.

**Keep a long-lived storage worker with an internal mutable cache:** rejected as the primary authority. It could reduce transfer, but worker loss, retry and multi-tab state would require a second recovery protocol and risk divergence from IndexedDB head identity. A worker may assist migration/export, while the committed root and immutable content stores remain authoritative.

**Stage persistence after rendering or outside the 750 ms gate:** rejected. It would display an uncommitted candidate and break the approved atomic commit/pending-state contract.

**Store only expanded JSON or omit certificates:** rejected by capacity, exactness and user constraints.

The recommended delta model aligns performance with the architecture already approved in document 24: immutable content is written once, snapshots reference it, and the head transaction is the only authority.

## 8. Bounded implementation and stop gates

The repair batch may change only the R1B worker response, compact preparation helpers, IndexedDB snapshot/delta commit, R1B history handles, targeted committed render, diagnostic telemetry and their tests/records. It must not change deformation mathematics, epsilon, clipping, geometry limits, logical schema 5, codec values, portable JSON semantics, UI controls, R1C features, Tangent or Overlap.

Required automated checks:

- exact worker `result`/payload deep equivalence and single-hash instrumentation;
- no encode/hash/clone/serialization call for unchanged payloads and records, asserted with counters;
- byte-exact admission ledger across all document-26 capacity fixtures;
- delta commit writes only new IDs and preserves current/previous recovery;
- stale-tab, quota, abort, collision, migration interruption and retry atomicity;
- constant-time history behavior and undo/redo by existing roots;
- all current v1/v2 compatibility, numerical and capacity tests;
- phase telemetry completeness and monotonicity.

Host browser verification retains the exact current dense fixture and 30-run loop. If exact admission, migration, recovery, any numerical/capacity check, any phase maximum, main-thread responsiveness, completion p95 or 750 ms maximum fails, stop and return with structured evidence. Do not raise a limit or add a fallback full repack to the interactive path.

The bounded batch ends after local verification and updated records. Publication and R1C require separate authorization.
