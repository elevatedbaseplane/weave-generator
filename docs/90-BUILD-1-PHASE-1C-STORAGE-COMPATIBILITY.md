# Build 1 Phase 1C — storage compatibility correction

Build: `WF-B1-P1C-STORAGE-EPOCH-20260918`

## Cause

The Field Forces rejection was not a real capacity failure in the current build. Multiple older local-preview tabs were open on the same origin, so they shared the same IndexedDB database while retaining older JavaScript and admission behavior. An old writer could report the portable-backup limit before reconciling the authoritative head written by a newer tab.

The measured committed workspace is 1,646,803 bytes of the unchanged 10,485,760-byte limit, leaving 8,838,957 bytes. It contains 32 referenced payloads, 78 referenced records, and no unreferenced payload or record bytes.

## Correction

- IndexedDB connection version 2 is a compatibility epoch only. Its database name and five object stores are unchanged.
- Opening the current build delivers `versionchange` to older live connections. Existing handlers close those connections and block further old-code writes.
- Field and non-field saves still compare the authoritative IndexedDB head before encoding or backup admission.
- Storage-open, storage-blocked, and concurrent-change errors expose the existing Reload Latest action.
- Cache keys on the application entry and storage module ensure the preview loads the current compatibility code.
- Schema-5 data, compact payload bytes, immutable revisions, recovery, atomic commits, geometry, clipping, and the 10 MiB limit are unchanged.

## Focused verification

- 18 focused Node tests passed, including exact codec round trips, incremental revision reuse, capacity rejection, preview cancellation, authoritative-head checks, and the storage compatibility epoch.
- Static entrypoint and local-asset validation passed after adding query-aware asset checking.
- Managed preview restored the existing workspace with one boundary, six weaves, and its saved field.
- `ADD INFLUENCE` committed successfully: 38.0 ms worker, 79.9 ms total, and the canvas changed from one field to two fields.
- The temporary influence was removed and committed successfully: 15.7 ms worker, 70.9 ms total, restoring one field.

Phase 1C remains the current review phase. Phase 1D has not begun. No publication occurred.
