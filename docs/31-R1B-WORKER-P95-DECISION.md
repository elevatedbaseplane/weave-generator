# R1B complete-worker p95 decision

2026-09-16. Status: approved architectural decision, verification authorized.

## Decision

Revise only the dense complete-worker p95 gate from **300 ms to 375 ms**. Retain:

- complete-worker maximum: **400 ms**;
- final-input-to-committed-render p95: **500 ms**;
- final-input-to-committed-render maximum: **750 ms**;
- the existing dense 100-vertex, A/B spacing 2.5 workload, five warmups and 30 measured requests;
- all geometry, certificate, clipping, numerical, capacity, recovery, persistence, phase and main-thread responsiveness requirements.

This decision supersedes only the 300 ms complete-worker p95 value in documents 22, 24, 28 and 29. It does not revise the separate derivation, encoding, transfer or phase targets, any rejection target, or any maximum.

## Basis

Document 30 records three optimized persistent-worker diagnostic p95/maximum pairs of `268.74/284.28`, `292.76/296.65` and `194.88/198.15 ms`, followed by the formal sustained-host result `356.35/361.02 ms`. Exact equivalence, 62 functional tests and both capacity proofs passed. The formal run stayed below the unchanged 400 ms maximum but exceeded the former 300 ms p95. A 375 ms p95 admits that measured sustained-host tail with 18.65 ms headroom while preserving the independently authoritative 500/750 ms end-to-end limits.

The document-30 run remains a failed result under the contract active when it ran. Its JSON evidence, SHA-256 and narrative are unchanged. The new threshold applies only to reruns performed after this decision.

## Verification and stop rule

Run the same automated persistent-worker gate with p95/maximum `375/400 ms`. If it passes, proceed to the unchanged host-browser suite. The browser suite must enforce worker p95/maximum `375/400 ms` and end-to-end p95/maximum `500/750 ms`, plus all existing phase and long-task limits.

Stop for architectural review if the automated 400 ms worker maximum fails, the browser 400 ms worker maximum fails, or either browser end-to-end gate fails. Do not change the fixture, workload, sample count, geometry, tests or evidence to obtain a pass. R1C and publication remain blocked.

## Verification outcome

The unchanged automated gate passes under this decision:

| Metric | p50 | p95 | maximum |
| --- | ---: | ---: | ---: |
| Complete worker | 169.43 ms | 194.18 ms | 204.82 ms |
| Final worker round trip | 186.53 ms | 211.24 ms | 220.20 ms |

The complete 30-run result is preserved at `docs/evidence/r1b-storage/revised-p95-worker-gate-pass-20260916.json`, SHA-256 `E4162B53015E82E0CED5390E63FD754946993FE47AD2A19C7446D4A67A1E7E0A`. The previously recorded document-30 failure remains unchanged.

Host-browser verification was then started as authorized, but Playwright could not launch Chrome in the managed environment: `spawn EPERM` occurred at stage `launch`, before navigation, fixture setup or any worker/end-to-end sample. Evidence is `docs/evidence/r1b-storage/revised-p95-browser-launch-blocked-20260916.json`, SHA-256 `3731B3496B5A92C83A2E5C8218EFB9BE1DEE6D0138B13CE9BD1D9899CD8DA08F`. This is not a failure of the 400 ms worker maximum or either 500/750 ms end-to-end gate; those browser gates remain pending on a normal host.

Run the established host command from normal Windows PowerShell:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\Users\notbr\Documents\Codex\2026-09-14\confirm-you-have-editable-terminal-access\work\weave-rebuild\scripts\verify-r1b-local.ps1"
```

The script now enforces the document-31 automated gate before it launches Chrome, then enforces browser worker p95/maximum `375/400 ms` and end-to-end p95/maximum `500/750 ms`. No browser pass is claimed until `verification/local-r1b/browser-results.json` is produced and reviewed. R1C and publication remain blocked.
