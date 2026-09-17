# R1B targeted-render repair

2026-09-16. Status: targeted rendering passed the host timing cycles, the later host fixture defect is repaired, and the required automated rerun failed the worker limits. Architectural review is required before another host run. No R1C or publication.

## Failure retained

The document-31 normal-host run reached the application and committed dense A-spacing request 4 in 205.9 ms total. Worker computation was 94.1 ms and every measured phase passed except render: 74.9 ms exceeded the unchanged 50 ms render maximum. The commit was complete and the final status was successful. Structured evidence is preserved at `docs/evidence/r1b-storage/targeted-render-host-failure-20260916.json`, SHA-256 `8CBFB86B5B779B8EBFB0E4A2A9E0B7654D49AB12BDFE83097723E797217BBC60`.

The cause was the document-28 commit path calling the complete application `render()`. That rebuilt board and revision DOM, boundary controls, source selectors, carrier derivations and every SVG layer. The old derived renderer also created one SVG `<line>` for every certified segment.

## Implemented repair

The R1B pending, cancellation, failure and successful-commit paths now call a dedicated targeted renderer. A successful R1B commit updates only:

- the committed derived weave layer;
- attractor control values and pending/save/export state;
- the attractor guide;
- commit status.

It does not call the full renderer and does not rebuild board or revision lists, boundary DOM, carrier layers, source-lattice layers or the weave-source layer. Full rendering remains in place for board changes, boundary changes, carrier or identity operations, restore, undo/redo, saved revision changes, imports, viewport changes and other operations that change the wider document or view.

`dist/weave-render.mjs` converts certified derived strands into at most two SVG `<path>` records, one for family A and one for family B. Every fragment begins with its own `M` command, so concave clipping gaps cannot acquire a bridge. Points within a fragment retain exact order and use `L` commands with the same `toScreen` coordinates as the former line renderer. Family classes retain separate A/B styling and visibility. The paths are fill-free and expose exact fragment/segment counts for browser verification. DOM size is bounded by visible families rather than reconstructed segment count.

## Verification

The complete automated suite passes 65/65 tests. New tests prove:

- transformed SVG path segments are exactly equal and identically ordered to the former per-segment visual representation;
- every fragment maps to a separate subpath;
- a concave two-fragment fixture retains its gap with no connecting segment;
- 8,000 synthetic segments use two family path records rather than one DOM line per segment.

The browser suite now enables the dense derived overlay and checks that:

- the derived layer contains at most two `<path>` nodes;
- family class, fragment count, segment count, `M` count and `L` count match authoritative derived geometry;
- an attractor-only R1B request preserves the existing board, boundary, carrier and source-layer DOM node identities;
- the full-render counter does not advance while the targeted-render counter does.

All prior automated gates also pass:

- exact pre-optimization canonical/fingerprint/buffer/portable/failure equivalence;
- dense evaluator p50/p95/maximum `226.94/276.41/281.87 ms`;
- persistent complete-worker p50/p95/maximum `237.24/310.92/371.59 ms`, within document 31's `375/400 ms` limits;
- 24-tooth high-fragmentation capacity and exact synthetic maximum/two-maximum capacity proofs;
- static entrypoint, local-reference, private-output and rebuild-only target checks.

The persistent-worker result is preserved at `docs/evidence/r1b-storage/targeted-render-worker-gate-pass-20260916.json`, SHA-256 `0544F5CE27715D82643BA650D3AC769E1D071149ADB72876FD9786396A41E993`.

## Required host rerun

The first normal-host rerun completed all 30 dense cycles. Dense render time ranged from `19.8` to `23.7 ms` in the loop, with the two setup spacing cycles at `13.9` and `20.9 ms`; every recorded render stayed below `50 ms`. The run then failed at the multi-tab generation-conflict fixture. Reload had correctly collapsed the Weave `<details>` section, and the fixture attempted to fill its hidden `#attractor-x` input in both the authoritative and stale tabs. This was a fixture defect rather than an application, worker, storage or rendering failure. The exact failure is preserved at `docs/evidence/r1b-storage/targeted-render-host-multitab-fixture-failure-20260916.json`, SHA-256 `13BD2DEE8F500C0BC58B74934D8FB8D8F1146962AC202FAC9895643743EA46D4`.

The browser fixture now explicitly opens the restored Weave section in each tab before the conflict edits. No application code, geometry, persistence, workload or threshold changed.

The complete automated rerun required before requesting another host test then stopped at the dense evaluator gate. It recorded p50/p95/maximum `216.44/395.65/407.70 ms`, exceeding the unchanged p95/maximum limits of `375/400 ms`; 64 of 65 tests passed. The remaining equivalence, persistent-worker, capacity and static commands did not run after this mandatory stop. Evidence is preserved at `docs/evidence/r1b-storage/targeted-render-fixture-repair-automated-failure-20260916.json`, SHA-256 `AA9042B317860BB4501FE8AB26B01DCBCE65700EE1964BF0D7345F1638A5C511`.

## Host rerun remains blocked

Run from normal Windows PowerShell:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\Users\notbr\Documents\Codex\2026-09-14\confirm-you-have-editable-terminal-access\work\weave-rebuild\scripts\verify-r1b-local.ps1"
```

Do not run this command again until the new automated performance failure has been reviewed. The unchanged stop gates remain worker maximum 400 ms, render maximum 50 ms, complete p95 500 ms and complete maximum 750 ms. The complete-worker p95 remains 375 ms under document 31. Do not begin R1C or publish.
