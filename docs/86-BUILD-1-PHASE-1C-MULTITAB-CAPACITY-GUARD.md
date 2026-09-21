# Build 1 Phase 1C correction — multi-tab capacity guard

## Version and scope

Build `WF-B1-P1C-MULTITAB-CAPACITY-GUARD-20260918` fixes the reported Add Influence failure that displayed `This complete workspace exceeds the 10 MiB portable backup limit`. This remains a bounded Phase 1C reliability correction. Phase 1D has not begun and nothing was published.

## Diagnosis

The current committed workspace measured 1,540,539 bytes against the 10,485,760-byte portable-backup ceiling, leaving 8,945,221 bytes available. All 29 compact geometry payloads and all 75 immutable records were referenced. The failure was therefore not a real capacity rejection and there was no orphaned data to clear.

The application could reach backup admission with an old tab's in-memory workspace and compact index. IndexedDB would later have rejected the commit through its compare-and-swap guard, but capacity accounting ran first and could produce a misleading capacity result from the stale combination. A fresh authoritative tab reproduced Add Influence successfully.

## Correction

Every ordinary save now compares its loaded IndexedDB head with the authoritative head before packing. Certified worker commits perform the same comparison before incremental encoding and portable-backup admission. Generation, current root, and storage version must all match.

If another tab saved first, the candidate edit remains unapplied and the interface reports `Another tab saved a newer workspace. Reload this tab to continue from the latest saved version.` Project / Study opens and exposes one `Reload latest saved workspace` action. The established transaction compare-and-swap remains in place as the final atomic guard. Geometry, certificates, compact payloads, revision identities, recovery, backup admission, and the 10 MiB limit are unchanged.

A read-only capacity diagnostic reports the committed compact index without returning geometry. It exists to distinguish real admission failures from stale-tab failures.

## Verification

An isolated managed-browser two-tab scenario loaded the same committed generation in both tabs. The peer tab changed Family A spacing from 50 to 51 and saved. Add Influence in the stale tab was rejected before admission with the explicit concurrent-change message; `Reload latest saved workspace` was visible and the field state remained `NOT APPLIED`. After using the reload action, the newer workspace loaded and Add Influence committed successfully in 16.7 ms worker / 52.9 ms total. No capacity message appeared.

Twenty-eight affected storage, influence, R1D, stitch-field, and compact-codec tests passed. Three focused multi-tab guard tests pass. Module syntax checks and the repository static check pass.

## Status

Phase 1C remains locally complete and awaits visual acceptance of this correction. Phase 1D seeded structured variation remains next. Build 1 remains incomplete.

Local preview: `http://127.0.0.1:43831/?b1-p1c-multitab-capacity-guard=20260918`
