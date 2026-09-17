# R1B storage architectural review

Approval recorded 2026-09-16: user approved this architecture and authorized only the R1B storage-repair implementation and local verification, with mandatory stop on failed capacity, exact backup admission, migration or 750 ms gates. The first codec capacity check subsequently failed; see [25](25-R1B-STORAGE-CAPACITY-EVIDENCE.md). Implementation is halted for review, not complete. The proposed status in the original dated text below is historical.

2026-09-16. Proposed for approval; planning only. This supersedes the diagnostic uncertainty in document 23, not approved geometry contracts 20/22. No production code or browser test was changed for this review. R1A and the accepted private Phase 2A release remain preserved. R1C and publication remain closed.

## Recommendation and evidence

Use transactional IndexedDB as the sole authoritative store for the complete schema-5 logical workspace, immutable revisions, current and previous snapshot roots, and recoverable migration records. Use a separate versioned, exact binary storage encoding for derived payloads, with portable JSON expansion/encoding. Retain localStorage for small advisory metadata and untouched legacy recovery bytes. Do not keep two dense workspace copies in localStorage or dual-write authoritative state across APIs.

The structured host failure is preserved in [host-failure.json](evidence/r1b-storage/host-failure.json) with the original [log](evidence/r1b-storage/host-browser.log). Dense loop iteration 0, request 7, reached SAVING after worker success at 259.7 ms and failed with typed `commit` at 909 ms. Request 6 was superseded. Request 5 previously committed at 633.1 ms. This is an implementation failure, not merely a success-text observation race. The earlier claim that a subsequent passing run would prove the original failure was a race was too strong.

The catch in LocalStore discards the native exception and failing key. Quota exhaustion is strongly consistent with the reconstructed sizes, but SecurityError/storage denial and the exact failed setItem cannot be distinguished from these captured bytes. The evidence does not contain original workspace strings, all origin keys, browser quota or a quota probe. No exact host quota is claimed. The demonstrated facts are the successful request 5 storage state and failed request 7 attempt. No origin was cleared and no quota was increased or filled for this review.

## Exact measurement, with provenance limits

[measure.mjs](evidence/r1b-storage/measure.mjs) runs the existing evaluator and reproduces the browser script's operations, including original square Carrier Study, x=30, the parsed alternating 100-edge boundary, A then B spacing 2.5 and proposed x=0. It does not alter production code, implement a codec or write browser storage. [sizes.json](evidence/r1b-storage/sizes.json) records exact serialized sizes for this reconstruction. UUID content/date differs from the lost browser snapshots; generated widths match. Cross-runtime numeric serialization may differ. These are exact reconstructed sizes, not recovered original host bytes. Gzip sizes are empirical illustrations, not guaranteed codec bounds.

All values below are JSON UTF-8 bytes and UTF-16 code units (equal here because these fixtures are ASCII). UTF-16 byte allocation is twice the listed value; it is not an assertion about a browser's quota accounting or heap overhead.

| Item | Exact size |
| --- | ---: |
| Previous recovery before failed attempt: request 4 workspace | 1,376,046 |
| Committed request 5 workspace | 2,620,701 |
| Proposed request 7 replacement | 2,624,383 |
| Committed derived geometry, including certificates | 2,613,145 |
| Proposed derived geometry, including certificates | 2,616,828 |
| Proposed point arrays, nested standalone JSON | 1,454,898 |
| Proposed certificate arrays, nested standalone JSON | 613,985 |
| Certificate properties' actual contribution within fragments | 631,624 |
| History before failed attempt, hypothetical JSON | 1,598,301 |
| History if request 7 had committed, hypothetical JSON | 4,217,883 |
| History actually persisted | 0 |
| One proposed immutable dense saved revision | 2,623,440 |
| Workspace after that one save | 5,247,987 |
| Proposed replacement pretty JSON backup | 7,410,788 |
| Backup after one dense saved revision, pretty JSON | 16,311,854 |

The certificate and point rows are components of derived geometry, not additional copies. There are 30,510 output certificates, 31,350 points and 840 fragments in the replacement. Working-document size is 2,623,263; workspace/library overhead is 1,120 bytes before saving a weave revision. History is memory only, capped at 100 prior working documents; full deep clones and JSON equality still add main-thread cost. A 100-dense-entry illustration is about 262 MB of serialized text, not an exact JS heap measurement. Backup strings are ephemeral allocations rather than stored localStorage keys.

LocalStore writes recovery first, then canonical. The live value sums are:

1. Before attempt: committed + old previous = 3,996,747 code units.
2. After replacing previous with committed: 5,241,402.
3. After successful canonical replacement: 5,245,084.

Keys, view metadata and any schema-original copies add to these totals. Against a nominal 5,242,880-character allowance, stage 2 has only 1,478 characters remaining and stage 3 exceeds it by 2,204 before keys. This is a capacity explanation, not a measured exact browser allowance. An engine accounting differently must be measured separately. Sequential setItem calls also allow recovery to change even when canonical fails; they do not form a transaction. Existing string compare-and-swap is not an atomic multi-tab lock.

## Compact localStorage versus IndexedDB

Lossless gzip of the reconstructed committed/replacement JSON is 541,500/506,779 bytes. Base64 alone would make their sum 1,397,708 characters, plus envelope and keys. This demonstrates that this one pair is compressible. It does not prove support for incompressible inputs, arbitrary revision libraries, multiple boards, retained originals, or temporary write state. A codec must retain every binary64 coordinate, certificate and provenance field; rounded decimals or omitted certificates are forbidden.

At existing caps, 65,536 clipped segments and 20,000 fragments imply at most 85,536 points. Binary64 XY uses 1,368,576 bytes, certificates 524,288, and fragment t0/t1 320,000: 2,212,864 bytes before indices, provenance, identities and manifests. Two such numeric payloads already require 5,900,976 base64 characters. This is a conservative joint-capacity envelope, not proof all maxima are simultaneously reachable. A safe bound cannot assume compression savings or identical current/previous payloads. No finite storage can promise unlimited immutable saves; current code has no finite revision-count bound, only an aggregate backup admission limit.

Compact localStorage therefore has no demonstrated worst-case headroom for the full retained working set. It also leaves synchronous serialization, two-key recovery and concurrency problems. Reject it as authoritative schema-5 storage. Use exact compact payloads with IndexedDB to reduce copying and avoid rewriting unchanged ancestry; compression may be optional and must have an uncompressed fallback. Do not make successful compression a requirement for preserving certified geometry.

IndexedDB capacity is also not guaranteed. navigator.storage.estimate() is advisory, not a reservation. Admission succeeds only after the actual transaction completes on the supported host with current, previous, all saved roots and legacy recovery retained. No browser-capacity or 750 ms pass is established by this planning review. Browser-local remains the storage scope; portable external backups remain necessary for origin loss.

## Proposed storage contract

Keep logical schema 5, geometry versions, exact identities and fingerprints. Introduce independent `weave-idb-v1` physical storage and `derived-buffer-v1` payload encoding. Object stores:

- `heads`: workspace ID, monotonic generation, current root, previous root and last transaction ID.
- `snapshots`: immutable manifests of board working states and library roots.
- `records`: immutable source and saved revision records, including all ancestry/latest relationships.
- `payloads`: content-addressed complete geometry and certificates; exact Float64 buffers and bounded offset tables, with manifest, length, version and canonical logical-content hash. Shared physical storage never changes logical revision identity.
- `recovery`: exact legacy key/value bytes and provenance, migration marker, original digest and import provenance.

Every manifest reachable from current, previous or saved roots must reference complete existing records/payloads. Unchanged records are shared across snapshots; edits allocate new immutable records. No automatic deletion of saved revisions or legacy originals. Initially retain unreferenced records too; later garbage collection needs reachability proof over current/previous/saved roots and any live undo references. Do not introduce it as part of the first storage repair.

Validate and encode candidate data off-thread before opening a short readwrite transaction. Read the current generation inside the transaction, compare it to the expected committed base, insert new records, update previous/current roots and increment generation in that same transaction. Any mismatch aborts with `concurrent-change`. Record bounded backup size/identity metadata in the manifest. Do not await hashing, network or unrelated asynchronous work inside an active transaction. A put success is not a commit: only transaction completion permits the in-memory workspace, history and displayed geometry to advance together.

Use strict durability where supported and verify support on the target browser; unsupported durability semantics must be reported rather than represented as equivalent. Request persistent origin storage where available as an optional reliability improvement, never as a promise or required approval workaround. Storage-denied, quota, transaction-abort, version-blocked, corruption and deadline outcomes retain native names, stages and transaction IDs.

One app controller owns a pending commit token. Before starting the transaction, stale worker requests are rejected as in 22. While the short atomic transaction resolves, queue latest new inputs without labeling them committed. Attempt abort on cancellation while still abortable; if the transaction already completed, acknowledge its authoritative state before applying cancellation or later edits. Do not claim a committed transaction was canceled. Undo pointers change only following completion; undo/redo uses complete immutable snapshots, does not rederive geometry and does not mutate saved ancestry. Retain the existing 100-entry session undo behavior using references rather than duplicate whole-workspace JSON; session history need not become a persistent feature.

IndexedDB serialization of overlapping readwrite transactions plus the in-transaction generation check provides concurrency control. BroadcastChannel is notification only. On another tab's commit, reject stale pending candidates and offer reload/reconciliation; never silently merge different geometry. On versionchange close connections; blocked upgrades show a read-only message, not destructive reset.

## Migration and recovery

On every startup inspect the IndexedDB manifest first; localStorage's pointer is advisory and may be absent/stale. If a valid completed IDB migration exists, it is authoritative. Never silently fall back to an older localStorage snapshot when a newer database is inaccessible or corrupt.

For legacy schemas 2–5: read and retain exact current, previous and schema-original strings; bound/parse them, apply existing logical migrations and worker-certify v2 states before activation. Create converted manifests and exact recovery records in one migration transaction, with the source digest and `migrationComplete` marker. Preserve original localStorage bytes unchanged. If interrupted before completion, reopen legacy state and retry idempotently; after completion, discover IDB even if advisory localStorage metadata failed to write. Where a legacy tab writes during migration, recheck the source digest before activation, block on divergence and retain both versions for explicit reconciliation. Old code cannot be made to obey a new lock: migration requires other legacy tabs to be closed and detects later legacy-key divergence rather than overwriting either branch.

LocalStorage retains view preferences, optional small database locator/commit metadata and existing raw originals. These cannot participate atomically with IDB. Failure to update advisory metadata must not turn a successful IDB transaction into a false rollback. Do not write a dense new recovery copy to localStorage. Full current/previous recovery lives transactionally in IDB and is downloadable as portable JSON. If the requirement were two full new dense snapshots in localStorage, this architecture could not satisfy it.

On aborted writes, leave authoritative heads, in-memory committed state and history unchanged. On corruption, stop writes; preserve raw database records for recovery download and explicitly validate the previous root before offering recovery. On denied/unavailable IDB do not silently fall back to localStorage for v2 writes. Existing recoverable data remains downloadable. No empty-workspace initialization over known data. Origin eviction can remove both APIs; no same-origin recovery architecture survives that without an external backup.

## Portable backups and capacity admission

Retain imports of legacy JSON backup envelope v1 with schemas 2–5 and their numerical recomputation checks. The current pretty serializer independently breaks a single dense save at 16,311,854 characters. IDB alone does not fix it.

Propose JSON envelope v2: exact versioned manifest plus deduplicated immutable records and base64 binary payloads, with explicit byte lengths, hashes and codec versions. Decoding reconstructs the unchanged logical schema-5 workspace and all certificates, saved revisions and ancestry. It is a self-contained JSON file, never a database pointer. UTF-8 JSON compact serialization is sufficient for small legacy-compatible exports; the new reader must support both envelopes. Older applications will correctly reject v2; do not pretend bidirectional legacy-reader compatibility. Verify all references, decoded bounds and numeric versions before an atomic import. Preserve changed-board fork semantics.

Keep the existing 10 MiB portable-file admission ceiling; do not increase it to conceal failure. Make byte/code-unit accounting explicit, retaining old-reader bounds for legacy v1. Deduplication lets working and identical saved geometry share one physical payload while preserving both logical snapshots. Compute exact prospective backup size before admitting each commit/save/import, without serializing the whole workspace on the UI thread. No commit may leave a workspace that cannot produce its complete portable backup. At aggregate capacity, reject the proposed save with all prior data intact; never prune revisions or reduce the current geometry workload. This is an aggregate document limit already present, not a new lower geometry cap. Prove the maximum supported single geometry plus metadata fits the new package; if not, return to review before implementing a different backup cap or multipart scheme.

Validation must measure the union of current, previous, saved records, originals and the replacement's new objects, including browser transaction overhead. The available host evidence cannot demonstrate this IDB capacity yet. Test on an isolated origin/profile with the actual representative data and bounded capacity fixtures; do not clear the user's data or fill their origin to exhaustion. Record native failures and exact serialized/encoded lengths; estimate() does not replace successful transactions. One file backup is an external artifact, not another permanently stored full JSON copy in the browser.

## Performance and unresolved proof obligations

Retain all 22 gates: worker p95/max 300/400 ms, dense final input through transaction completion and committed render p95/max 500/750 ms, default p95 200 ms, input p95 8 ms, pending/cancel 50 ms and no attributable main-thread task >=50 ms. Include final handler preparation, debounce where applicable, startup, worker, transfer, validation, encoding, persistence and render. Current instrumentation starts after some hashing/cloning, excludes final render, and starts its 750 ms timer at dispatch. It therefore undermeasures the contract. In request 7, 185.1 ms elapsed from recorded request start to dispatch, 798.1 ms to SAVING and 909 ms to failure. SAVING-to-failure alone took 111 ms; that is a timed interval, not a captured Long Task observation.

IDB must not simply receive the current multi-megabyte deep-cloned object graph on the main thread. Encode/validate/hashes and backup-size accounting in worker; transfer bounded buffers, retain exact manifest checks and prepare new immutable records once. Main thread owns transaction authorization and visibility. Measure structured cloning into IDB and render cost independently. If that cannot meet 50/750 ms, return to architectural review; moving the transaction to another worker is not silently authorized here.

Deadline starts at final user event and covers persistence/render. A timer is not real-time cancellation and cannot undo a transaction already committed. Abort before deadline while still possible; on abort preserve prior state. If completion wins the race but arrives after the gate, report the actual durable state plus a performance failure and stop verification. Never falsely display the old state as authoritative or attempt an unsafe compensating rollback. Neither IDB nor compression is claimed to guarantee 750 ms. Passing representative performance remains an implementation acceptance condition.

## Exact next batch if approved

Implement only the R1B storage repair: physical IDB adapter and transaction protocol; exact payload codec; JSON v2 backup/import with legacy compatibility; recoverable migration and advisory metadata; asynchronous save/restore/undo/import integration; full deadline and typed storage telemetry; required automated and host verification. Preserve the approved evaluator, epsilon, clipping, certificate values, limits and immutable source semantics. Do not change the existing fixture or its performance assertions to pass.

Automated checks: exact codec round trips including all Float64 values relevant to valid geometry and every certificate; malformed/oversized manifests and payloads; canonical equality; shared immutable revision/fork lineage; exact backup bounds; schema2–5 migration interruption at every transaction boundary; unavailable/denied/quota/abort cases; native error retention; multi-tab generation conflicts; legacy-tab divergence; corrupted current and valid previous recovery; advisory-key failure after DB success; deadline/commit races; canceled/stale/duplicate worker output; undo/history atomicity. Measure dense and maximum admitted payloads with current+previous+saved roots and originals retained. Run the unchanged 30-run dense workload and all prior regression gates; capture actual transaction stages and render timing. Additional diagnostics must not erase failed runs.

Five simple live tests after a separately authorized implementation and verification:

1. Open existing legacy saved work; compare geometry/revisions, reload, and confirm migration preserves them.
2. Change dense attractor position twice; see pending display then complete geometry; reload and confirm the final state.
3. Save A, change the field, save B, and reopen both; each retains its original geometry and certificates as verified automatically.
4. Export JSON, import into an isolated fresh workspace, and reopen A/B with matching settings and geometry.
5. Make an edit, Undo/Redo, reload, and confirm the final committed state; automated tests cover storage rejection and crash recovery.

Remain afterward: completion of any still-failing R1B gate, publication only by separate approval, R1C and all later phases. The next batch follows this architecture only after approval; it can return to Sol Medium then. Exact codec layout, reference bookkeeping and transaction plumbing are bounded engineering choices. Capacity, migration correctness and 750 ms remain empirical proof obligations; inability to satisfy them reopens architectural reasoning. No user-invented tolerances are needed.

## Standards consulted

The [WHATWG Storage Standard](https://storage.spec.whatwg.org/) defines storage endpoints, estimates and persistence; estimates are not guaranteed free space. The [IndexedDB specification](https://www.w3.org/TR/IndexedDB/) defines atomic transactions, scheduling, completion and durability modes. These support selecting a transactional store; neither promises an application-specific quota or completion latency. Browser-specific capacity must be demonstrated locally.
