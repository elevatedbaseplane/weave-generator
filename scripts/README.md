# Scripts

Paths stay where they are. The preview server and several tests import modules in this folder by these filenames.

## Live development

Ordinary local work uses these three commands.

| File | Command | Role |
|---|---|---|
| `serve.mjs` | `npm run dev` or `node scripts/serve.mjs` | Serves `dist/` at http://127.0.0.1:43828. The first argument is an optional port. |
| `check.mjs` | `npm run check` or `node scripts/check.mjs` | Confirms the ChatGPT Sites target is this rebuild and that `dist/index.html` assets exist. |
| `fixtures.mjs` | `node scripts/fixtures.mjs` | Rewrites the three exchange samples in `fixtures/`. |

## Live support modules

These are imported by the preview server or by the current test suite. They are not everyday commands.

| File | Role |
|---|---|
| `phase0-preview.mjs` | Imported by `serve.mjs`. The diagnostic stays off unless `--phase0` is passed. When a custom port is also needed, pass the port first: `node scripts/serve.mjs 43828 --phase0`. |
| `compatibility-baseline.mjs` | Used by the Phase 0 preview diagnostic and by `tests/stability-phase0.test.mjs`. |
| `r1b-worker-node.mjs` | Node worker harness still used by current tests. |

## Historical checkpoint and verifier scripts

These remain because older records, and in a few cases the current tests, cite these paths. Ordinary development uses the live commands above.

Browser and host wrappers:

- `r1a-browser.cjs`
- `r1b-browser.cjs`
- `r1c-browser-smoke.cjs`
- `r1-checkpoint-browser.cjs`
- `verify-r1a-local.ps1`
- `verify-r1b-local.ps1`
- `verify-r1b-browser-only.ps1`
- `verify-r1-checkpoint-browser-only.ps1`

Performance and review tools:

- `r1a-storage-benchmark.mjs`
- `r1b-worker-performance.mjs`
- `r1-checkpoint-worker.mjs`
- `r1-cold-worker-review.mjs`
- `r1-prepared-equivalence.mjs`

Dense-checkpoint helpers still imported by tests:

- `r1-checkpoint-selection.cjs` — imported by `tests/r1-dense-setup.test.mjs` and `tests/r1-checkpoint-selection.test.mjs`
- `r1-dense-pointer.cjs` — imported by `tests/r1-dense-setup.test.mjs`
- `r1-dense-contract.cjs` — imported by `tests/r1-dense-contract.test.mjs`

Phase 0 evidence tools:

- `stability-phase0.mjs`
- `stability-phase0-checks.mjs`
- `stability-phase0-preservation.mjs`
