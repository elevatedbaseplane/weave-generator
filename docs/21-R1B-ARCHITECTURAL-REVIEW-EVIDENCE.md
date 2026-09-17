# R1B implementation gate — architectural review required

2026-09-16. The user approved document 20 and authorized exact R1B implementation and local verification, with an explicit stop condition if interval-certified approximation, analytical clipping or the representative performance target could not be achieved without weakening the contract.

## Outcome

Implementation stopped at the performance gate. No R1B code remains in the executable source, no R1B build is claimed, and nothing was published. R1A executable source remains the verified baseline at implementation `15fa7772f3e37c0840fd944f015a4d1fbd580828` / verification-record HEAD `f07a63f9d884110b2debfa9a1284205695e2755a`. Tangent and Overlap were not touched.

The approved formula, epsilon policy, interval endpoint enclosure, expanded source enumeration and analytical piecewise clipping were prototyped together on the required dense representative workload: a 100-edge alternating-radius boundary, both families at spacing 2.5, R=150, default strength/tension, 30 warmed derivations on the recorded Windows/Intel host.

Initial implementation:

- p50 356.34 ms, p95 365.17 ms, maximum 375.27 ms for the full edit/derive path.
- 424 expanded candidates, 30,345 reconstructed segments, 30,528 clipped segments and about 3,016,000 segment-edge tests.
- achieved maximum declared segment error 0.012499422899545623 against epsilon 0.0125.

A deterministic 32×32 boundary-edge index then preserved the clipping predicates while reducing edge tests to 3,382. Results after that in-contract optimization:

- complete edit/derive path: p50 223.14 ms, p95 244.91 ms, maximum 249.17 ms;
- derivation alone, 30 warmed runs: p50 181.01 ms, p95 205.72 ms, maximum 206.20 ms.

The inherited representative derivation target is p95 <=100 ms. The optimized result is 2.06 times that ceiling. Edge scanning is no longer the dominant cause; the certified 30,345-segment reconstruction, interval/error bookkeeping, output construction and hashing remain the material workload. No epsilon, workload, completeness, interval, clipping or target rule was relaxed. No worker or speculative storage change was introduced.

## Preserved baseline verification

After removing the prototype from executable source, all 43 preserved foundation/R1A tests passed. The retained R1A dense identity benchmark in this run reported p50 22.51 ms, p95 41.71 ms and maximum 42.87 ms. `git diff` shows no content difference under `dist/`, `tests/`, `scripts/` or package files from the verified R1A source; the remaining `dist/style.css` status is a line-ending worktree notice with the same Git object hash as HEAD.

No browser verification was run for R1B because the required model performance gate failed first. The earlier R1A host-browser evidence remains valid and unchanged.

## Architectural decision now required

Document 20 remains approved as the desired behavior, but its current conjunction of dense workload, epsilon, binary64 interval certification, synchronous complete preview and <=100 ms derivation is not implementation-ready on the representative host.

The next architectural review should choose and validate a materially different execution strategy, such as a staged/cached certified representation or separately authorized worker computation, while preserving the same committed accuracy and atomic state contract. Reducing epsilon accuracy, reducing the declared representative workload, returning incomplete committed geometry, or simply raising the 100 ms target would revise the approved contract and was not attempted. R1C, publication and further site changes remain closed.
