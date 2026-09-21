# Build 1 Phase 1D — seeded structured crossing variation

Date: 2026-09-21

Build: `WF-B1-P1D-SEEDED-VARIATION-20260921`

## Status

Phase 1D is internally complete. It adds deterministic whole-weave crossing variation only. Phase 1E precedence display and the Build 1 checkpoint have not begun.

## Visible behavior

Over / Under now offers **Seeded Structured Variation** for the whole weave. Three bounded controls shape the result:

- **Seed** repeats the same crossing order from `0` through `65535`.
- **First Family Over** sets the target balance from `10%` through `90%` in five-point steps.
- **Maximum Run** prevents a same-side sequence longer than `1` through `8` crossings.

The panel previews twelve deterministic Over/Under decisions and provides **New Seed**. Seeded variation is intentionally unavailable for a selected family or family pair because those relationships use explicit repeat rules.

## Internal contract

Selecting the mode upgrades that weave's crossing metadata to bounded `interlacing-v3`. Existing `interlacing-v1` and `interlacing-v2` documents remain byte-compatible and are not migrated merely by loading them. Seeded decisions use stable source-lattice indices and a stable family-pair salt, so event enumeration, clipping, viewport changes and zoom cannot renumber the result.

Precedence remains:

1. a geometry-bound manual crossing override;
2. an exact family-pair rule;
3. the selected whole-weave mode, including seeded variation.

The mode changes presentation metadata only. Certified geometry, source identity, worker input, compact geometry payloads, migration limits, storage admission and the 750 ms computation maximum are unchanged.

## Verification

- Current-contract matrix: **246/246 passed**.
- Focused Phase 1D rule/UI/persistence suite: **18/18 passed**.
- Preserved Phase 0 diagnostics and frozen fixtures: **8/8 passed**.
- Syntax checks passed for `dist/app.mjs`, `dist/interlacing.mjs`, and `dist/weave-rules.mjs`.
- Static entrypoint/reference/private-output check passed.
- `git diff --check` passed.

The managed browser used a three-family, 31-path weave. It verified seed `43210`, balance `65`, maximum run `2`, the corresponding bounded sample, 31 retained woven masks, disabled seeded mode for a family pair, an A/B pair override above the global seeded rule, and exact rule persistence after reload. Compact storage remained unblocked. The working fixture was returned to preset behavior with no pair rule.

## Review

On the published build, open **Over / Under**, leave **Apply Rule To** on **The Whole Weave**, and choose **Seeded Structured Variation**. Change Seed, First Family Over, and Maximum Run; the sample and woven crossings should update and save. Reload the page and confirm the same three values return. Select one family pair and confirm seeded variation is unavailable there while Alternating and repeat rules remain available.

Phase 1E is next. It will make effective precedence explicit and complete the Build 1 crossing-control checkpoint without beginning contact physics.
