# R1B sequential performance isolation review

2026-09-16. Status: review complete and bounded optimization attempted. Document 30 records the authorized implementation outcome: exact equivalence and other automated gates pass, but the formal persistent-worker run records p95/maximum `356.35/361.02 ms`, failing the unchanged 300 ms p95 requirement. The candidate is stopped. Do not begin browser verification, R1C or publication.

The original sequential failure remains preserved at `docs/evidence/r1b-storage/incremental-repair-sequential-gate-failure-20260916.json`. The earlier invalid parallel-contention experiment also remains preserved at `docs/evidence/r1b-storage/contended-benchmark-invalid-20260916.json`. Neither was overwritten or reclassified.

## Method

All measurements used the unchanged accepted dense fixture: 100 alternating-radius boundary vertices, A/B spacing 2.5, complete certified geometry, 398 strands, 840 fragments, 30,328 reconstructed segments and 30,510 certificates. Limits, implementation and fixture were unchanged. Node was v24.19.0 on Windows x64 with 16 logical CPUs on an Intel Core i7-13620H and roughly 25 GB free RAM.

`docs/evidence/r1b-storage/performance-probe.mjs` records every warmup and measured iteration, phase timing, process heap, RSS and CPU use. `performance-worker-node.mjs` additionally records the persistent worker heap. `suite-first-last-profile.mjs` measures the same kernel before and after the complete sequential functional suite. `hash-phase-probe.mjs` measures an exact-hash optimization boundary without changing production code.

Each ordinary probe used five warmup iterations followed by 30 measured iterations. The loaded probe used the same five warmups and 12 measured iterations while four worker threads continuously consumed CPU. Windows does not expose a useful `loadavg`; the burner count, process CPU, event-loop utilization and per-run timings are the recorded load indicators.

## Results

### Fresh isolated evaluator process

These are derivation and current compact encoding in a new Node process. `total` is their measured sum and therefore corresponds to the complete worker computation boundary more closely than derivation alone.

| Run | Derive p50 / p95 / max | Encode p50 / p95 / max | Total p50 / p95 / max |
| --- | --- | --- | --- |
| isolated 1 | 191.87 / 230.03 / 270.35 | 97.35 / 119.00 / 121.60 | 291.58 / 321.82 / 370.67 |
| isolated 2 | 209.73 / 318.24 / 337.73 | 97.26 / 154.95 / 174.67 | 306.50 / 447.87 / 492.92 |
| isolated 3 | 207.30 / 270.85 / 285.39 | 100.31 / 129.07 / 146.63 | 307.51 / 374.65 / 414.47 |

All three isolated totals fail the 300 ms p95 limit; two fail the 400 ms maximum. Fresh-process isolation is therefore insufficient.

Warmup is real but does not explain the measured failures. In isolated run 1, total warmups fell from 366.87 to 270.79 ms. Run 2 fell from 335.59 to 270.72 ms. Run 3 began at 415.43 ms but its last two warmups were 341.00 and 343.20 ms. The five excluded samples absorb cold startup; later measured spikes remain.

Process heap use cycled rather than growing monotonically, which is consistent with garbage collection pressure from repeated expanded geometry and table allocations. Across the three runs, measured heap-used ranges were 13.5–149.9 MB, 20.6–171.3 MB and 15.0–154.0 MB. RSS ranges were 246.3–306.9 MB, 246.1–316.6 MB and 256.0–311.9 MB.

### Complete suite with benchmark first and last

The complete sequential suite retained 61 passing tests and the existing dense performance test failed with p50/p95/max 292.82/375.96/403.85 ms. The surrounding benchmark was slower before the suite than after it:

| Position | Derive p50 / p95 / max | Encode p50 / p95 / max | Combined p50 / p95 / max |
| --- | --- | --- | --- |
| Before suite | 281.47 / 318.69 / 391.18 | 121.53 / 145.22 / 160.16 | 403.66 / 477.71 / 511.49 |
| After suite | 252.81 / 284.50 / 298.88 | 117.34 / 128.69 / 134.00 | 368.37 / 411.95 / 432.88 |

The after-suite process retained more memory: its measured heap range was 35.9–206.3 MB and RSS 317.6–378.6 MB, versus 30.4–191.3 MB and 257.9–331.4 MB before. Despite that, the after-suite benchmark improved. Prior suite allocations are not the sole cause, and the evidence does not support replacing the gate with a fresh-process-only gate.

### Worker process matching browser execution

The browser contract uses a long-lived worker, so the authoritative diagnostic keeps one Node worker alive across all warmup and measured requests. The separately preserved `performance-worker-fresh.json` intentionally started a new worker per request and measured startup/cold-JIT behavior; its 551.46/692.05 ms worker p95/max is informative but is not the browser-matching result.

| Persistent worker run | Worker p50 | Worker p95 | Worker max | Transfer p95 / max |
| --- | ---: | ---: | ---: | ---: |
| 1 | 309.25 | 351.78 | 354.93 | 19.81 / 22.99 |
| 2 | 314.98 | 466.62 | 531.37 | 28.33 / 33.75 |
| 3 | 407.51 | 509.04 | 524.29 | 25.58 / 25.62 |
| heap-instrumented | 330.61 | 381.78 | 433.28 | 21.14 / 23.38 |

Every persistent-worker run fails p95; three of four fail maximum. Transfer is small enough that the failure is inside derivation plus encoding. The heap-instrumented run recorded worker heap used cycling from 38.6 to 79.1 MB and parent heap from 15.5 to 46.1 MB. Its five worker warmups were 349.44, 370.86, 366.10, 295.97 and 285.32 ms; measured failures remain after warmup.

### System-load sensitivity

With four CPU burner workers, derivation p50/p95 rose to 334.33/381.46 ms, encoding to 155.13/231.10 ms, and combined computation to 496.98/562.03 ms. Combined mean rose from 294.35–320.20 ms in the three isolated ordinary runs to 494.02 ms under controlled contention. Heap again cycled, while event-loop utilization rose to 0.81. Host scheduling materially affects the tail, but ordinary unloaded runs already fail the gate; load sensitivity does not excuse or redefine the thresholds.

All individual values, warmups, heaps and system snapshots are retained in:

- `performance-isolated-1.json`, `performance-isolated-2.json`, `performance-isolated-3.json`
- `performance-suite-first-last.json`
- `performance-worker-fresh.json`
- `performance-worker-persistent-1.json`, `-2.json`, `-3.json`, and `-heap.json`
- `performance-loaded-4cpu.json`

## Finding

The approved condition for a fresh-process-only performance gate is false. Isolated combined computation fails, and the persistent worker that matches browser execution fails consistently. The functional suite must remain intact, and no fresh-process exception is defined.

The failure has two bounded, allocation-heavy causes outside the settled geometry mathematics:

1. `encodeDerived` executes `structuredClone(derived)` before deleting `strands`, cloning the entire expanded geometry merely to retain small metadata. It also grows ordinary JavaScript number arrays and then copies them into four typed arrays.
2. The worker computes exact canonical SHA-256 fingerprints with the JavaScript SHA loop. A direct probe over the same 2,582,472 canonical UTF-8 bytes measured canonicalization p50/p95 28.68/32.39 ms and JavaScript SHA p50/p95 41.44/42.54 ms. Native Web Crypto produced the identical digest in 2.49/3.40 ms after a 1.25/1.69 ms UTF-8 encoding step. The result identity can therefore remain byte-for-byte unchanged while removing about 38 ms from each large SHA phase.

Derivation also performs a large content fingerprint and a full-result JSON stringify/parse copy. Those operations create large transient strings and objects before the codec repeats a full-result canonical hash and full-geometry clone. This matches the observed heap cycling and tail variability.

## Bounded optimization contract for review

No implementation is authorized by this document. A subsequent approved repair may change only the worker's result-construction, exact hashing and compact-table allocation path:

1. Split worker derivation into the same numerical geometry/certificate production followed by asynchronous identity finalization. Hash the exact existing canonical UTF-8 bytes with `crypto.subtle.digest('SHA-256', ...)`. Keep the `sha256-v1:` identifier, canonical ordering and every existing fingerprint value exactly unchanged. Small provenance hashes may use the same path for consistency.
2. Remove the full-result JSON stringify/parse copy by constructing the same final plain-data object directly. A before/after deep equality check, canonical-text equality and fingerprint equality are mandatory for every fixture.
3. In `encodeDerived`, destructure `strands` before cloning metadata so strands are never cloned into `meta`. Perform a strict counting/validation pass, allocate exact-size Float64/Uint32/Int32/Uint16 arrays, and fill them directly. Do not change table order, field widths, bounds, validation or portable bytes.
4. Reuse the exact canonical text or bytes produced for the final payload identity within that request. Do not canonicalize, encode, clone, hash or serialize unchanged geometry. Do not cache mutable expanded geometry across requests.

The repair remains bounded by exact equivalence. Tests must compare the current stopped candidate and optimized path for v1 identity, v2 dense, saved-revision, mixed v1/v2, negative-zero/minimum-value, maximum-capacity and rejection fixtures. They must prove deep-equal expanded results, identical canonical text and all fingerprints, byte-identical compact buffers and portable JSON, unchanged certificates/provenance, and the same typed failures.

After functional equivalence passes, retain the complete functional suite and run the browser-matching persistent-worker benchmark with five warmups and 30 measured dense requests. The existing p95/maximum gates remain 300/400 ms, and all phase, 500/750 ms, numerical, capacity and recovery gates remain unchanged. Record CPU/load and heap with the result. Any failure returns to review; it does not permit a fresh-process exception, threshold change, fixture reduction or browser run.

The bounded optimization was subsequently approved and implemented as candidate `WF-R1B-OPT-20260916`. Document 30 records exact equivalence, three passing diagnostic runs, and the authoritative formal gate failure. Browser verification remains blocked. R1C and publication remain blocked.
