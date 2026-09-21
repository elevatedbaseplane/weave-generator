# SP1 source tracking and local implementation checkpoint

2026-09-17 — WF-SP1-SOURCE-TRACE-20260917. User-authorized document70 implementation. No publication or external host run.

## Implemented

Finite derivation can now collect every clipped output vertex's directed source parameter before fragment merging. The separate stitch-source-trace-v1 object contains immutable run identities, one parameter list per fragment, complete input/algorithm fingerprint and exact derived fingerprint. It is excluded from geometry canonical text, derived payloads, saved records and portable JSON. Normal derivation remains unchanged. Reconstruction recomputes in the worker and rejects unless its geometry/certificates exactly match the saved revision. The transient WeakMap does not keep deleted revisions alive; absent traces can be reconstructed on demand. Runtime cache/analysis readiness is not a new saved geometry format.

Production workers emit trace alongside finite geometry. Existing protocol/session/request/root/candidate guards still reject stale results. On successful atomic commit the trace is associated with the actual committed derived object. Saved-study validation reconstructs even identity finite studies. Legacy geometry and payload paths remain unchanged. One idle derivation worker is preloaded and reused after success; superseded/cancelled active workers still terminate, errors keep existing retry behavior, and page exit terminates workers.

New foundation instances embed construction version2 with bounded declarative source-run intent rules and symbolic source-parameter expressions. Existing version1 records are not rewritten. Herringbone within-row rules and Square cyclic precedence are explicit; continuous-field cross-row intent remains unresolved, not invented. Rules are validated exactly and retained in backup. No crossing or over/under rendering was added early.

Both editable foundations remain in the picker with existing controls, field manipulation, automatic saves, Undo/Redo and reset. Nested saved-object actions now occupy a separate row so they cannot cover the pattern-name button. Thin selected influence guide and continuous-only herringbone choice remain.

## Compatibility defects found and repaired

The UI imported only portable version2 through the storage worker, misrouting version3 to the older JSON reader. Versions2 and3 now use the existing versioned compact reader. During actual browser import, valid version2 construction metadata rejected after key reordering. Comparison now uses order-independent structural canonicalization while preserving every key/value and rejecting unknown/changed intent. Failure text was Invalid stitch construction metadata; the failed import did not modify current data. Regression fixtures cover both construction versions and all three finite recipe IDs with reordered keys and unknown-field rejection. No migration or numerical tolerance was weakened.

## Evidence and limits

31 focused checks passed before the import-order regression addition; the subsequent12-test affected subset passed including that new case (32 distinct focused tests overall). Trace tests cover exact coordinates/certificates/canonical compact bytes, interior parameters, reconstruction mismatch rejection, concave fragments and sampled certificate regressions. Sampling is regression evidence, not the analytical certification mechanism. Six frozen payload fixtures remain byte-identical. Persistent production-worker trace protocol test passes. Static entrypoint/output checks pass.

Production codec max-table test passes:2,000 runs,20,000 fragments,85,536 points,65,536 certificates,80,000 edge refs; binary3,732,864bytes; two portable payload envelopes plus256KiB reserve10,219,360bytes under10,485,760. This is codec capacity, not permission to admit arbitrary workspaces; actual portable admission remains authoritative. Trace adds no backup bytes. Schema5 migration reuses original payload and record objects; mixed legacy/finite version2 construction backups round-trip; over-capacity migration rejects without changing source manifest/root.

30 measured persistent production-worker requests after3warmup,8mixed influences: p95149.5399ms, max177.3484ms, within375/400. This is the SP1 field fixture, not a rerun or replacement of R1's preserved dense fixture. Setup initially used an invalid210-degree direction; corrected to the approved range before measurement, without changing product validation.

Managed browser: existing herringbone field reopened and committed with236 traced runs, worker112.5ms/total170.8ms/render12.5ms. New version2 Square created, width80→81 edited before adding a field, field added (worker53.2/total146.7ms), width81→82 after field (worker27.4/total114ms/render10.2ms), trace56runs. Undo/Redo returned the working states; reload restored square+field. Raw snapshots source-trace-browser.json and square-trace-browser.json. Earlier416.6/643.9ms failures remain preserved; the new worker reuse/default samples address the observed cold-start cost but are not universal latency guarantees.

## Review boundary

Source-position implementation and the two-foundation development slice are ready for local visual acceptance. No full host certification is claimed; R1's previously deferred certification remains due before publication, along with release-level recovery/concurrency/performance coverage. Ordinary feature batches continue with focused checks. Do not mark these development samples as exhaustive certification of every permitted parameter combination.

Next after user acceptance: R2A complete crossing detection with visible crossing/contact/overlap diagnostics, exact source references and stale-analysis behavior from70. Then R2B authored local over/under notation, then separately certified curved lacing. Continuous-field cross-row crossings stay neutral until a justified rule is defined. No generic grid additions substitute for researched stitches.

## Five visual tests

1. In Weave Pattern → Preset choose Double Herringbone — continuous field adaptation, Create Weave Pattern. Expect immediate continuous field; adjust Horizontal Spacing/Pattern Height/Row Spacing.
2. Field Forces → Add Influence; move/select the guide, change Strength/Radius and disable/re-enable. Expect local distortion, light guide and restored undeformed result when disabled.
3. Create Herringbone Square — foundation. Change Width/Height/Gap X/Gap Y. Expect separate extended-square foundations without backside connectors or over/under gaps.
4. Add a field to Square, then change Width again. Expect saved deformation to remain attached. Undo/Redo restores edits.
5. Reload/switch saved patterns. Expect values/fields restored. Exchange + Backup supports new portable format3 and legacy format2; source traces reconstruct rather than inflating backups.

## Final native-backup result and disposition

Native browser export (version3/v2 storage) was downloaded and imported using the real Exchange + Backup UI: BACKUP IMPORTED. EXISTING BOARDS RETAINED. SHA2563bc92969c02586fb415361140f9121049ec845c0cc634892a0d59d41d7e75dc8. Native backup's every saved derived revision exactly recomputes in the independent Node audit (native-import-geometry-audit.json is []). The earlier backup reconstructed from diagnostic-tool JSON fails at one-ULP differences; preserve import-geometry-audit.json. Diagnostic JSON transport is not an authoritative binary backup and must not be used as a frozen geometry source. No geometry validation was relaxed to admit it.

SP1 is now implementation-complete at the development review level, pending user visual acceptance. No additional SP1 feature work is planned unless that review reveals a defect. Release/host certification is not claimed or waived. On “approved, keep working”, start R2A visible crossing diagnostics under70, not another generic proposal or grid batch. Remaining later stages: R2B stitch-specific precedence, then curved lacing per its numerical contract. Current review build stays WF-SP1-SOURCE-TRACE-20260917.
