# Stability Slice 1 — Project Commits

Build: `WF-STABILITY-S1-PROJECT-COMMITS-20260918`

## Problem

Ordinary weave and influence edits were admitted against a newly serialized portable backup of the complete workspace. A large unrelated project could therefore block preset selection or field-force creation in the active project. The same path also encoded all committed geometry before the user saw the selected preset.

## Implemented

- Portable capacity is enforced against the active project during normal commits.
- Project export writes one self-contained project with only its referenced immutable records and compact geometry payloads.
- Existing schema-5/schema-6 readers, immutable IDs, exact geometry bytes, migrations, atomic commits, stale-tab checks, and recovery history remain intact.
- Derived geometry for ordinary weave edits is encoded once in the storage worker and committed incrementally.
- A selected preset is rendered before its asynchronous save begins.
- A new preset does not create an empty saved field-result object; the first influence creates that result.
- New field results always receive a fresh project-wide name instead of reusing stale hidden form state.
- Storage diagnostics report active-project portable bytes separately from complete IndexedDB workspace bytes.

## Verification

- Focused automated suite: 31 passed, 0 failed.
- Static site check: passed.
- Local browser: Triangular Grid applied immediately to a new boundary with three visible families.
- Local browser: first influence committed successfully with certified geometry; measured `28.2 ms` worker and `73.5 ms` total.
- Browser storage diagnostic: active project `1,595,620` bytes; complete workspace `1,742,922` bytes; storage unblocked.

## Remaining stability work

Project/library metadata mutations still use the compatible full-pack fallback. A later slice can move those small mutations to project-head deltas and reduce broad rerenders, without changing geometry or persistence contracts.
