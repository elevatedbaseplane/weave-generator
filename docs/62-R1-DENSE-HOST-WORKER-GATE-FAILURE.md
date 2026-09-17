# R1 checkpoint — actual browser worker maximum failure

2026-09-17. Execution stopped at the authoritative worker maximum. No implementation, threshold change, rerun, SP1 or publication.

Preserved raw report: `docs/evidence/r1-checkpoint-20260917/browser-2026-09-17T18-36-42-095Z.json`.
SHA-256: `C7510E738D9CAAD585B73C61B800274A41CEE40D58FDE44DB43FC7E9C5EC28CF`.
The report retains the original 14 completed checks and 17 cycles by reference to their unchanged evidence.

## What this run establishes

The repaired fixture found the selected influence center with matching identity and visible bounds. It dispatched the first dense edit and received a complete certified v5 result, which was committed transactionally. The failure is now measured inside the actual worker, not the previous missing-handle timeout.

| Measurement | Observed | Gate |
| --- | ---: | --- |
| Complete worker | 447.8 ms | FAIL: maximum 400 ms |
| Derive diagnostic | 389.8 ms | Diagnostic only |
| Encode diagnostic | 54.0 ms | Diagnostic only |
| End-to-end | 726.3 ms | Below maximum 750 ms for this request |
| Render | 32.4 ms | Below maximum 50 ms for this request |

Geometry reports complete=true, 424 candidates, 29,956 reconstructed segments, 30,374 clipped segments, 840 fragments, epsilon 0.0125 and maximum certified error 0.012497520333459737. This is not a corruption or completeness failure. Neither a 30-cycle p95 nor an overall long-task pass can be inferred: the suite stopped after the first dense edit.

## Focused review findings and limits

Source inspection shows `dispatchPending` constructs a new Worker per dispatched request and terminates it on completion. The automated persistent-worker benchmark reuses one worker after five warmup cycles. Both results are genuine, but their initialization/JIT conditions differ. The browser fixture also promotes the imported v2 study to v5 on editing, as intended by the current product. The earlier v5 persistent benchmark passed, so the host failure cannot be dismissed simply as an unsupported study version.

Cold worker execution and host scheduling are plausible contributors, not proven causes from a single sample. Do not raise the maximum, discard the cold edit, retry until a favorable result appears, change the dense workload or claim verifier inspection caused measured worker compute time.

An additional pending verifier audit item: its final `diagnostics.segments > 30000` assertion refers to reconstructed segments, while this complete result has 30,374 clipped segments and 29,956 reconstructed segments. Preserve the assertion and evidence until the exact fixture/version expectations are reviewed; do not quietly weaken it to obtain a pass. It did not cause the reported stop.

## Next bounded action

Internal performance review should use this exact saved candidate and unchanged production worker. Compare fresh-worker first-request and warmed persistent-worker behavior, separating derive, encode, transfer and startup. Check the current v5 fixture expectations against the historical dense workload. Identify a bounded repair only if evidence justifies it, preserving exact geometry/certificates, all existing limits and cancellation/stale-result/atomic-commit behavior. This is a focused execution-performance review, not reopening settled deformation or storage architecture.

No further host command is requested now. Resolve the internal review before any justified final bundled major-checkpoint run. R1 remains incomplete; SP1 and publication remain on hold.
