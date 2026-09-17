# Weave Generator foundation

Private rebuild. Start with [current master goals](docs/00-MASTER-GUIDE.md), [phased development checklist](docs/12-PHASED-DEVELOPMENT-PLAN.md), [current state](docs/02-STATE-DECISIONS-AND-TESTS.md), and [model/batch handoff](docs/04-SOL-CHECKPOINT.md).

For each phase's specific small deliveries, prerequisites and exits, use [manageable build batches](docs/13-BUILD-BATCHES.md). R1D is functionally complete locally in build `WF-R1D-EDIT-CLARITY-20260917`; visual review and the broader R1 phase checkpoint remain. These entries are not publication authorization.

For the building chat, [builder execution checklists](docs/14-BUILDER-CHECKLISTS.md) supplies each batch's tasks, data requirements, unresolved decision gates and verification scenarios. Related small entries may share one approved delivery; geometry/analysis/integration work stays bounded.

The current planning direction is FIELD → WEAVE → ANALYZE → INTERPRET → EXTRACT → SYNTHESIZE → EXPORT, with relational metadata and designer agency throughout. Phase 2A, R1B, and R1C are accepted local baselines. R1D multiple influences and seeded variation are implemented under document 45 and await visual review plus the R1 checkpoint; R2 has not started. No publication is authorized. Historical seam-first plans are not the next build instructions.

This checkout descends from Weave commit `44953adacf6b6a47fb93447be177cbd7710428f5`. Original files remain under `reference/` and in Git history. Original checkout, live site, experiments, and browser data are separate and must remain untouched.

Only `dist/` is public. Never package `docs/`, `reference/`, `fixtures/`, raw browser backups, the supplied book, or the external guide package as website assets.

- Preview: `node scripts/serve.mjs` (current loopback preview uses port 43830).
- Tests: `node --test --test-isolation=none tests/foundation.test.mjs`.
- Static checks: `node scripts/check.mjs`; run `node --check` individually for `dist/*.mjs` (this Windows sandbox disallows Node child-process spawning).
- Reproducible exchange fixtures: `node scripts/fixtures.mjs`.

The user explicitly selected browser-local saves plus portable JSON backups for this foundation. No cloud sync or legacy migration is implemented.
Current local build: `WF-R1D-EDIT-CLARITY-20260917`. Derived lines retain their color and opacity while fields move or calculate, the selected influence is highlighted and workspace clicks deselect it, and Pattern spacing edits preserve and recalculate the complete saved influence state. Exact legacy certificate compatibility and prior R1D corrections remain intact. Preview: `http://127.0.0.1:43830/?r1d-edit-clarity=20260917`. Publication is not authorized.
