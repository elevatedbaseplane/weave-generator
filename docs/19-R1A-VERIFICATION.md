# R1A implementation and verification

Build: WF-R1A-20260916. Implementation source: `15fa7772f3e37c0840fd944f015a4d1fbd580828`. User approved reviewed R0 contracts as applicable to R1A and authorized only the exact R1A implementation, automated checks, local browser verification and records.

## Delivered locally

- Identity-derived Weave Studies created from explicitly selected saved Carrier Study revisions, with exact source snapshots, stable strand/source context, versioned content/provenance hashes, separate fragments and complete empty results.
- Independent Source/Derived overlays, counts, original/modified input indication and named saved revisions on the existing canvas.
- Workspace schema 4, exact schema-2/3 raw recovery, immutable Weave revision chains, working undo/restore, conflict/quota protection, serialized-backup limit preflight and validated imported-board reference rebasing with origin lineage.
- Raw derived SVG with complete A/B geometry independent of visibility, open paths per fragment, round-trip numbers, Y conversion and escaped source/provenance metadata.

No fields, interactions, manual editing, R1B or R2 implementation. No publication. Owner-private live Site remains accepted version 3 / WF-2A-20260914.

## Automated verification — passed

43 tests: retained foundation/carrier coverage with current-schema expectations updated, plus 15 new R1A tests. Covers independent SHA-256 vectors, exact default/rotated/concave/large-coordinate geometry, selection-empty output, source context, revision immutability, working undo, unsupported/corrupted snapshots, schema recovery failure, quota/concurrent clients, round-trip and fork-of-fork, backup size and raw SVG.

Node v24.19.0, Windows, Intel Core i7-13620H. Representative identity derivation: 30 warmed runs, p50 20.69 ms, p95 23.52 ms, maximum 24.87 ms, below the inherited 100 ms goal. These values are the successful test run; they are not UI timings.

Five-revision model/storage benchmark (303,099 backup code units, memory-backed LocalStore):
- Validation p95 5.43 ms.
- Save p95 5.86 ms.
- Backup serialization p95 5.76 ms.
- Parse/migration/validation p95 10.31 ms.
- Restore with validation p95 5.97 ms.

Browser localStorage quota/latency is not measured by the memory-backed benchmark. Raw reports are under ignored verification/local-r1a/.

All public modules pass syntax checks. Static entrypoint/assets, private-output exclusion and rebuild-only hosting target checks pass. Git diff whitespace check passes with existing LF/CRLF notices.

## Local browser verification — passed

The host-side isolated-browser run completed successfully for build `WF-R1A-20260916` with zero page errors. The recorded result is `PASS local browser R1A {"spacingGestureMs":15,"saveMs":38,"reloadMs":47}`. Evidence is in the ignored `verification/local-r1a/` directory: `browser-results.json`, desktop/light, concave/Neo and mobile/dark screenshots, exported derived SVG and transferred JSON backup.

Verified behaviors:

- exact schema-3 raw recovery before the first schema-4 write;
- create an identity weave with 9 A and 9 B paths from the saved default carrier;
- source/derived display toggles cause zero carrier or weave derivations;
- spacing and rotation update derived geometry, and two Undo actions recover the source;
- two immutable weave revisions restore exactly and survive reload;
- concave geometry retains separate fragments with no notch bridge;
- derived SVG exports complete hidden geometry, valid open paths, axes and metadata;
- JSON backup imports into an isolated empty browser context and restores both revisions;
- desktop Light, concave Neo and responsive mobile Dark layouts render without page errors or horizontal overflow.

The screenshots were visually reviewed. They show the expected source/derived grid overlay, the open concave U without a bridge, and the responsive mobile canvas. The mobile test intentionally keeps the side rails closed.

## Engineering implementation details

- Signed zero is canonicalized to JSON zero in new derived snapshots, preserving geometric values and exact JSON round-trip semantics.
- Preflight uses accepted candidate formulas before invoking the unchanged carrier kernel.
- New SHA-256 is synchronous to keep validation/persistence atomic; verified against Node crypto across Unicode and multiblock inputs.
- Existing backup file picker no longer uses an inconsistent byte-size gate; the authoritative parser retains its string-length threshold.
- New schemas reject unsupported weave fields/versions; snapshots are validated by recomputing the identity contract.
- Exact source rendering is cached independently of visibility; derived rendering reads stored complete output.

## Completed checkpoint and next gate

R1A implementation is complete and locally verified at source `15fa7772f3e37c0840fd944f015a4d1fbd580828`. The live private Site remains version 3 / `WF-2A-20260914`; R1A is not published or live-accepted. Publication requires new explicit authorization.

R1B attractor/approximation still requires architectural reasoning and its own bounded proposal. R2C lock clipping and R2D edit response remain deferred behavior decisions. The approved five live tests are retained in document 17 for a future separately authorized release.
