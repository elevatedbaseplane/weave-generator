# R1 exact-candidate execution review and bounded repair proposal

2026-09-17. Diagnostic work only; no production change or host rerun. The browser's 447.8 ms worker failure remains authoritative. R1, SP1 and publication remain on hold.

## Experiment

`scripts/r1-cold-worker-review.mjs` extracts the committed candidate from the original failed host report, verifies that its input fingerprint matches the dispatched event and invokes the unchanged production worker through the existing Node adapter. No IDs, parameters, geometry or workload are regenerated. Five initial warmup requests are retained; 30 subsequent persistent-worker requests and five separately created workers are measured sequentially. Validation of outputs occurs after request timing. No other proof suite runs concurrently. These finite samples characterize this managed host, not browser acceptance or general system-load behavior.

Every one of the 40 results reproduces the failed run's complete canonical derived value, payload identity and all four compact buffers byte-for-byte. Signed values, coordinates, certificates and provenance are included. Evidence: `docs/evidence/r1-checkpoint-20260917/cold-worker-review-2026-09-17T18-47-21-648Z.json`. First warmup worker time was 292.995 ms; none of the retained worker samples exceeded 400 ms. The separate host-browser failure is not superseded.

| Diagnostic | Warmed worker, 30 samples | Fresh worker, 5 samples |
| --- | ---: | ---: |
| Complete worker median | 276.040 ms | 341.758 ms |
| Complete worker p95 / maximum | 313.366 / 323.236 ms | 361.617 / 361.617 ms |
| Derive median | 233.049 ms | 288.521 ms |
| Encode median | 41.146 ms | 51.716 ms |
| Round trip median | 294.835 ms | 392.418 ms |
| Outside-worker median | 16.801 ms | 50.574 ms |

With only five fresh samples, the reported p95 is the observed maximum, not a reliable tail estimate. Outside-worker time combines launch/module loading, scheduling, request/result transfer and parent receipt; it is not a pure transfer measurement. Parent heap/CPU samples are recorded, but they cannot establish machine-wide load or browser GC behavior.

Conclusion: fresh execution adds measurable cost here and the old warmed benchmark does not reproduce every product request's execution conditions. It does not prove that worker creation alone caused the browser failure. The browser's derive389.8ms and encode54ms show derivation dominated that failed worker request. No evidence supports dismissing this as a verifier read or lifting the maximum.

## Bounded hot-path opportunity

Source inspection of combined.mjs shows each reconstructed segment evaluates two endpoints via `deformCombinedPoint`; every call validates the entire generation and allocates/sorts the same influence list. `enclosedPoint` independently copies/sorts that list again for certified endpoints. For the failed candidate's 29,956 reconstructed segments, ordinary endpoint evaluation alone performs 59,912 generation validations. Input is immutable for the request. These repeated checks are unnecessary inside an already validated derivation.

This identifies redundant work, not its measured percentage of CPU. Recommend a narrow request-local preparation optimization **before** changing worker lifetime/protocol. Reusing a persistent worker may help later requests but cannot by itself guarantee the first cold request and introduces cancellation/restart concerns that this repair need not touch.

## Proposed implementation contract — approval required

1. Keep public `deformCombinedPoint` validation and behavior unchanged for independent callers. At the derivation entry, fully validate once and prepare the exact existing influence order once. Pass a private immutable evaluation context to internal endpoint/enclosure routines.
2. Preserve every floating-point operation and accumulation order, all endpoint recomputation, interval outward-rounding calls, IDs, canonicalization, diagnostics and failure classes/messages. No algebraic rearrangement, changed bounds, cached mutable geometry, altered segmentation, or reduced certificates.
3. Reuse only request-local sorted references and validated settings. Retain both pending/result validation and generation validation at trust boundaries. Do not change workers, persistence, clipping, rendering, deadlines or latest-request cancellation.
4. Freeze pre-change outputs for the exact failed candidate, x=1, legacy omitted falloff, explicit falloff1–5, all influence types, mixed eight-field/family cases, disabled/identity, varied source and concave fixtures. Require deep/canonical equality, identical hashes, byte-identical compact buffers and portable JSON, and unchanged invalid-input failures after the change.
5. Run focused behavior/equivalence checks, then fresh and persistent production-worker gates on the exact dense candidate. Retain initial cold samples; do not exclude cold starts to obtain a pass. Stop with structured evidence on equivalence or authoritative performance failure. Only after internal gates pass, request one final bundled host checkpoint continuation. Preserve all previous 14 checks and their source/evidence applicability explicitly; a production change requires targeted revalidation of affected behavior, not uncritical reuse of old hashes.

This is a bounded execution optimization under settled geometry contracts. It does not reopen deformation mathematics or storage design and does not guarantee the browser gate will pass before measurement. Routine implementation may use Sol Medium after approval of this exact repair scope.

## Separate fixture-count audit

`dense-version-count-audit.json` checks the exact 100-vertex / spacing2.5 / radius150 / strength50 candidate at the two intended center positions:

| Version / x | Reconstructed | Clipped |
| --- | ---: | ---: |
| v2 / 0 | 30,328 | 30,510 |
| v5 / 0 | 29,956 | 30,374 |
| v2 / 1 | 30,345 | 30,528 |
| v5 / 1 | 29,975 | 30,393 |

All have 424 candidates, epsilon0.0125 and complete output. The existing end-of-suite `segments > 30000` is a v2-specific workload assertion and will reject the current accepted v5 algorithm even after timing succeeds. It did not cause the present stop. Recommend replacing that proxy with exact versioned input/diagnostic expectations (including both counts) for these two fixtures. That is a test correction supported by measured unchanged geometry, not authorization to reduce the workload. No verifier assertion was changed during this diagnostic turn.

## Current stop

Diagnosis complete. Next proposed action is the bounded optimization above plus the independently justified versioned fixture assertion correction. Do not rerun the host test yet. No production code changed; R1 is not certified, SP1 not begun, and nothing published.
