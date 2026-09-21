# Stability slice 3 — atomic field commit

The family-specific influence controls now treat one slider gesture as one edit transaction. The first input captures one stable project base. Every live preview and the release save apply the latest captured number to that same base.

This removes the former release path that independently rebuilt the final candidate from a second transient project snapshot. It preserves the existing certified geometry, storage format, revision identity, and family-specific influence schema.

Focused acceptance:

- Family A strength previews and saves the same generation input.
- An unlinked Family A edit leaves Family B unchanged.
- The saved revision retains the final strength and its certified geometry fingerprint.
- A real local slider drag remains changed after release and after reload.

## Follow-up: bounded autosave

The reported release snap was ultimately reproduced as a rejected storage transaction: preview geometry was valid, but saving one more hidden immutable weave revision exceeded the project’s 10 MiB portable-backup ceiling. The failure correctly restored the last committed geometry, which looked like a slider snap-back. Adding another influence failed for the same reason.

Automatic saves now replace the current snapshot of each named weave and compact older hidden weave revision chains to one latest snapshot. The transactional store still retains its previous root for recovery, and in-memory Undo remains independent. Final portable-capacity admission now runs after this compaction is represented in the candidate manifest.

Publishing the unchanged application to ChatGPT Sites would not remove the ceiling because the 10 MiB check is an explicit application portability contract rather than a localhost storage quota.
