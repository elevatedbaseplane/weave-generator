# R1D incremental ancestry repair

Current R1D repair — 2026-09-17: WF-R1D-ANCESTRY-REPAIR-20260917 fixes the incremental writer omitting updated carrier/boundary libraries and saved weave revisions while committing working geometry. Exact missing carrier ancestry is reconstructed from embedded source snapshots, using retained transaction manifests if needed, then fully certified and committed with the original root retained as previous. Missing/conflicting ancestry still fails closed. Prior UI fixes are retained. Focused codec/tree tests and 19 UI checks pass; host recovery confirmation remains pending. No R2A or publication.

The user screenshot records both current and previous roots failing with `The working carrier references a missing revision.` A regression now reproduces loss of library metadata in the former incremental packing path. Incremental saves retain new library metadata and saved influence revision records together with the new payload, while reusing unchanged certified payloads and records. Preview drag requests also retain their pending project metadata. Recovery does not clear storage or modify geometry, certificates, source snapshots, or IDs. Exact missing records are reinserted only into an unambiguous contiguous parent chain. Startup fully validates and certifies the repaired workspace before its transactional commit.

Preview: http://127.0.0.1:43830/?r1d-ancestry-repair=20260917

Visual tests: Make Square adds a saved Boundary; Create Weave Pattern displays lines; add/move an influence and change spacing; reload and confirm restoration; make another square. R1D remains pending user review and the R1 checkpoint.
