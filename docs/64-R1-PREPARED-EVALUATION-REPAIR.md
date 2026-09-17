# R1 request-local evaluation repair

2026-09-17. User approved document 63. Implementation and focused internal verification complete; actual host-browser checkpoint remains open. No SP1 or publication.

## Change and identity

Only production file changed: `dist/combined.mjs`. Its SHA-256 changed from `6f15b9685d1a7c4c4563d8bbb60b9a8da879931dc2e42fcf06253905933b124e` to `0f13d6f3284fa713f81e150167ea4ad2d1e8c4c7d667c0813ed28d251a35b3a6`. Local repair identifier: R1-PREPARED-EVALUATION-20260917. The existing UI build label remains WF-R1D-ANCESTRY-REPAIR-20260917; the source hash distinguishes this repair.

The derivation validates boundary, carrier and complete generation at entry. Private identity, variation and endpoint helpers reuse that validation. One frozen sorted reference array per derivation supplies numerical endpoints, interval endpoints and fingerprint normalization. Independently called public helpers still validate their own inputs. References never escape into persisted geometry or get cached across requests. Original-order curvature/displacement accumulation, every floating-point and interval operation, endpoint recomputation and provenance ID sorting remain unchanged. The worker protocol, storage, clipping, rendering and thresholds are untouched.

## Measured before / after

Same exact failed browser candidate; five warmup requests, thirty measured persistent requests, five fresh workers. Sequential managed-host samples, not a controlled machine-wide load experiment or browser acceptance.

| Complete worker metric (ms) | Before | After |
| --- | ---: | ---: |
| Persistent median | 276.040 | 219.308 |
| Persistent p95 | 313.366 | 289.442 |
| Persistent maximum | 323.236 | 344.564 |
| Fresh median | 341.758 | 270.301 |
| Fresh maximum | 361.617 | 281.072 |
| Derive median, persistent | 233.049 | 176.350 |
| Encode median, persistent | 41.146 | 41.810 |

After warmup maximum242.537ms. All retained cold/warm samples pass400ms; measured persistent p95 passes375ms. Fresh n=5 is too small for a reliable tail estimate. The persistent maximum increased despite lower median/p95; no claim of universal acceleration or eliminated host-load sensitivity is made. The browser's447.8ms failure remains authoritative until a repaired browser run passes. End-to-end650/750ms, default200ms, render50ms, pending50ms and long-task requirements remain unchanged.

Evidence (all in `docs/evidence/r1-checkpoint-20260917/`): before `cold-worker-review-2026-09-17T18-47-21-648Z.json`; after `cold-worker-review-2026-09-17T19-04-10-057Z.json`. The after worker run checked40/40 canonical outputs, payload identities and all compact buffers against the original failed host's exact committed result.

## Exact equivalence and focused checks

Before modifying production, `scripts/r1-prepared-equivalence.mjs --freeze` recorded baseline outputs in `prepared-complete-baseline.json.gz` (an earlier14-fixture baseline is also retained). Seventeen fixtures cover exact dense x0/x1, omitted falloff, explicit1–5, repeller/deflector, eight mixed fields in reverse identity order, eight dynamic families, disabled/zero-strength/full-tension identity, seeded variation and concave clipping. After repair, deep and canonical equality, fingerprints, all four compact buffers and portable JSON match exactly; synchronous and asynchronous derivations match. Twenty-four invalid-input rejection results preserve error names/messages across derivation and independently callable point/variation entry points. Result: `prepared-equivalence-result.json`.

Focused R1D behavior and selection verifier tests:15/15 pass (`prepared-focused-tests.txt`). Exact dense assertion tests:2/2 pass, including intentional count, epsilon and carrier-workload mutations (`prepared-count-tests.txt`). Verifier/source-guard bootstrap and syntax checks pass (`prepared-verifier-check.json`). An initial isolated bootstrap harness omitted its process.env mock and failed before assertions; correcting the harness produced the recorded pass, with no product change. No unrelated migration, capacity or full regression proof reran.

## Verifier correction and evidence applicability

The obsolete v2 `segments > 30000` proxy is replaced by exact v5 checks on every alternating center fixture: x0 reconstructed/clipped29956/30374; x1 29975/30393. Both require424 candidates, epsilon.0125, complete output, a certificate bound within epsilon, and the exact boundary/carrier/generation workload (excluding remapped identity values). It does not lower a product requirement. New helper: `scripts/r1-dense-contract.cjs`.

The14 completed checks and17 historical cycles remain immutable. `prepared-repair-applicability.json` records the only permitted production hash change and binds equivalence/performance evidence. The continuation guard checks that manifest's fixed hash, all referenced evidence hashes and every prior production hash; it rejects any other application change. UI, scheduling, storage, recovery, backup and multi-tab implementations are unchanged; affected evaluator behavior and output compatibility were revalidated internally. A small fresh default add-influence/pending smoke is included before the remaining dense30-cycle browser test, so default timing is also measured on the repaired source. The original14 checks are preserved rather than unnecessarily repeated. Historical diagnostic failures are not relabeled as passing.

## Remaining checkpoint

One final bundled host-browser continuation is required because actual browser execution previously failed the worker maximum and managed Chrome launch is unavailable (previous spawn EPERM evidence). Run the existing `scripts/verify-r1-checkpoint-browser-only.ps1` command. It executes only the repaired default smoke, remaining dense workload and aggregate browser gates, preserving prior checks. It does not rerun unrelated proofs. Stop on any actual worker/browser gate failure. Only a passing result can close R1; SP1 and publication remain on hold.
