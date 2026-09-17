# SP0 reference verification and R1 checkpoint

2026-09-17. User authorized reference verification, updating obsolete test controls, completing the R1 checkpoint and presenting SP1 for approval. No application feature work or publication authorized.

## Construction comparison: complete

Direct HTTPS retrieval through Node succeeded after web-viewer cache misses and Windows TLS-provider failures. No TLS validation was disabled. These private review images are outside dist and are not preset artwork:

- [RSN Double Herringbone variation](https://rsnstitchbank.org/stitch/double-herringbone-stitch-variation): reviewed stages 5 and 8, especially the completed two-color diagonal arrangement. Private evidence: `docs/evidence/sp0/double-reference-review.png` and `double-complete-reference.png`.
- [Sarah's Herringbone Square](https://www.embroidery.rocksea.org/stitch/herringbone-stitch/herringbone-square-stitch/): reviewed stages 1, 2 and finished stage 3. Private evidence: `square-start-reference.jpg`, `square-reference-review.jpg`, `square-complete-reference.jpg` in the same folder.

The double-herringbone model has two interleaved offset passes, repeated upper/lower crosses and three alternating encounters along each interior diagonal. The reference's open band ends are not closed into loops. The square is the same four extended crossing runs up to rotation; its closing run is over the third run and under the first. Endpoint labels map A–B→T, C–D→R, E–F→B, G–H→L, under a suitable rotation of our normalized drawing. The final H endpoint terminates the visible route; the previously corrected absence of a mandatory final backside connection is retained.

Conclusion: the original coordinate models are suitable idealized 2D foundations for these explicitly named variants. Their normalized proportions are editable engineering defaults, not a pixel trace or a claim to reproduce physical thread thickness/tension. The existing 24 reference fixtures remain applicable; no coordinate change required and no redundant rerun performed. Over/under notation remains future R2B behavior. SP0's construction-illustration evidence gate is now closed.

## Automated checkpoint results

Preserved evidence directory: `docs/evidence/r1-checkpoint-20260917/`.

| Check | Result |
| --- | --- |
| Complete existing automated suite | PASS, 117/117 |
| Historical persistent worker, unchanged dense fixture | PASS, p95 184.919 ms / max 191.137 ms |
| Current v5 dense single influence, same 100-vertex boundary and 2.5 spacing | PASS, p95 239.678 ms / max 245.987 ms |
| Additional v5 eight mixed influences, 100-vertex boundary / 50 spacing | PASS, p95 94.119 ms / max 96.447 ms |
| Historical exact canonical/payload/portable equivalence | PASS |
| Existing generated near-limit capacity fixture | PASS |
| Existing synthetic maximum capacity fixture | PASS |
| Static output checks | PASS |
| New verifier syntax | PASS |
| Browser checkpoint | BLOCKED at Chrome process launch: spawn EPERM; zero browser checks executed |

Eight mixed influences supplement rather than replace the established dense workload. The first eight-field fixture supplied angles above 180 and was correctly rejected. That verifier-input mistake is preserved in `worker-fixture-invalid-direction.json/.log`; corrected angles use the equivalent [-180,180] representation. Only the affected eight-field case was rerun. The passing current dense single result is retained in that archived report and log; the successful eight-field result is `current-worker-results.json`. No geometry or limit was changed.

Legacy equivalence/capacity scripts write fixed result paths. Their previous result bytes were preserved and restored; new reports/logs are copied into this checkpoint directory. The prior evidence was not replaced by this run.

## Browser verifier update and remaining work

New `scripts/r1-checkpoint-browser.cjs` uses the actual Make Square → Create Weave Pattern → Field Forces workflow and visible range controls. Legacy verifiers remain preserved. The new verifier checks immediate pattern visibility, enabled-state round trip, coalesced edits, pending Undo, influence types/direction/falloff, post-field spacing, eight-field cap, seeded variation, Undo/Redo, exact reload, portable import/export, read-only previous-root recovery in a disposable corrupted database, exact-byte legacy recovery, foreground tab conflicts and 30 dense center edits.

The unchanged dense geometry enters via the real portable importer because the current UI no longer exposes the old hidden coordinate and fractional-spacing text inputs. User browser data is never cleared or used: all cases run in isolated temporary browser contexts. The full-state inspector runs outside completed interaction windows; raw long-task entries and inspection intervals are retained. Any ≥50 ms task overlapping an application window fails, including contaminated overlap with the verifier. Phase timings remain diagnostics. Existing worker375/400, dense650/750, default200, render/pending50 and long-task gates remain unchanged.

The script is syntax-checked but has not executed against a browser here. Its first attempted launch was blocked by the host environment; it is not a functional pass, application failure or proof of test correctness. Run the browser-only wrapper once in normal host PowerShell; it neither repeats automated proofs nor changes production code. It writes timestamped JSON/logs and deletes no evidence. Stop at any actual authoritative failure and review it before rerunning.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\Users\notbr\Documents\Codex\2026-09-14\confirm-you-have-editable-terminal-access\work\weave-rebuild\scripts\verify-r1-checkpoint-browser-only.ps1"
```

R1 remains uncertified until the browser checkpoint passes. Do not mark SP1 implementation ready or switch to routine implementation based on the automated passes alone. The SP1 proposal is document 60; implementation approval and the browser result are still required.
