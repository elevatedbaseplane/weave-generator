# R1B bounded optimization outcome

2026-09-16. Status: implementation candidate stopped at the required automated persistent-worker gate. No browser verification, R1C or publication followed.

The user approved document 29's exact-output optimization scope with a mandatory stop if equivalence or the unchanged 300/400 ms worker gate failed. Candidate `WF-R1B-OPT-20260916` implements only that scope:

- worker-only asynchronous SHA-256 uses native Web Crypto over the unchanged sorted canonical UTF-8 bytes and retains every `sha256-v1` value;
- worker derivation defers identity finalization, removes the full-result JSON stringify/parse copy, and explicitly normalizes generated negative zero where the old copy did;
- compact encoding clones metadata without cloning strands, validates/counts before allocation, allocates exact typed-array lengths and fills the established table order directly;
- asynchronous encoding finishes the exact payload identity before allocating tables, reducing peak overlap without changing synchronous failure ordering;
- the evaluator worker awaits the exact asynchronous derivation and codec paths. Request and result envelopes, transfer buffers, geometry and limits are unchanged.

## Exact equivalence — passed

Before implementation, `optimization-equivalence.mjs baseline` captured a 36,731,181-byte uncompressed baseline in `optimization-equivalence-baseline.json.gz` (5,523,972 compressed bytes, SHA-256 `A2376509A5478D7CF2AF6B9D7B2C9833633930D8882046CB4C262CFD12123984`). The post-change gate passes:

- v1 identity, dense certified v2, negative-zero/`Number.MIN_VALUE`, and exact maximum derived fixtures;
- v1, v2, saved-revision, mixed-v1/v2, and maximum portable workspaces;
- identical canonical text and content/provenance/carrier/payload fingerprints;
- byte-identical Float64/Uint32/Int32/Uint16 compact buffers and portable JSON;
- unchanged typed failures for v1 certificate injection, missing v2 certificates, corrupt buffer length, and 10 MiB overflow;
- asynchronous dense worker derivation deep-equal to the baseline and asynchronous payload byte-equal to the baseline.

The result is recorded in `docs/evidence/r1b-storage/optimization-equivalence-result.json`.

## Other automated gates before the stop

The complete sequential suite passed 62/62 tests. Its unchanged dense synchronous evaluator recorded p50/p95/max `177.05/262.84/291.33 ms`. The high-fragmentation 24-tooth fixture retained 19,946 fragments, 21,053 certificates and a 3,391,217-byte portable backup. The synthetic exact maximum and two-maximum capacity proof passed with byte-exact admission; a third maximum retained the typed capacity rejection. Static entrypoint, local-reference, private-output and rebuild-target checks passed.

Three post-optimization diagnostic persistent-worker runs passed 300/400 ms with worker p95/max values:

- `268.74/284.28 ms`;
- `292.76/296.65 ms`;
- `194.88/198.15 ms`.

These diagnostics demonstrated the intended improvement but did not replace the formal gate.

## Automated persistent-worker gate — failed

The formal gate uses the actual Node wrapper for the browser worker, five warmups, 30 sequential measured requests and the unchanged accepted dense fixture. It recorded:

| Metric | p50 | p95 | maximum |
| --- | ---: | ---: | ---: |
| Complete worker | 227.71 ms | 356.35 ms | 361.02 ms |

The maximum passes 400 ms, but p95 fails the unchanged 300 ms requirement. This establishes that the candidate improves ordinary runtime substantially but does not meet the gate consistently under observed host scheduling/allocation conditions. A fresh-process exception, threshold change or selective passing rerun is not permitted.

Complete warmups, all 30 per-run derivation/encoding/worker/transfer timings and the typed gate failure are preserved at `docs/evidence/r1b-storage/bounded-optimization-worker-gate-failure-20260916.json`, SHA-256 `0299E94C0BE59B7E64B5778C6841C61D1B65140847A07F8A3E292C8AAED05FCF`. The formal command is `node scripts/r1b-worker-performance.mjs`; it writes `verification/local-r1b/worker-performance.json` and exits nonzero on either limit.

Per the approved stop rule, no browser command was run after this failure. The candidate requires architectural review before any further optimization or verification. All 500/750 ms completion, capacity, recovery, numerical, geometry and certificate gates remain unchanged. R1C and publication remain blocked.
