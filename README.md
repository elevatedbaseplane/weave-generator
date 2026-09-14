# Weave Generator foundation

Private rebuild. Start with `docs/00-MASTER-GUIDE.md`, then `docs/02-STATE-DECISIONS-AND-TESTS.md` and `docs/04-SOL-CHECKPOINT.md`.

This checkout descends from Weave commit `44953adacf6b6a47fb93447be177cbd7710428f5`. Original files remain under `reference/` and in Git history. Original checkout, live site, experiments, and browser data are separate and must remain untouched.

Only `dist/` is public. Never package `docs/`, `reference/`, `fixtures/`, raw browser backups, the supplied book, or the external guide package as website assets.

- Preview: `node scripts/serve.mjs` (loopback port 43828).
- Tests: `node --test --test-isolation=none tests/foundation.test.mjs`.
- Static checks: `node scripts/check.mjs`; run `node --check` individually for `dist/*.mjs` (this Windows sandbox disallows Node child-process spawning).
- Reproducible exchange fixtures: `node scripts/fixtures.mjs`.

The user explicitly selected browser-local saves plus portable JSON backups for this foundation. No cloud sync or legacy migration is implemented.
