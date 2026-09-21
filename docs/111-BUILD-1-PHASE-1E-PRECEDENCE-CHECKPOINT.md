# Build 1 Phase 1E — crossing precedence checkpoint

Date: 2026-09-21

Build: `WF-B1-P1E-PRECEDENCE-20260921`

## Status

Phase 1E is complete. This checkpoint completes Build 1. Contact constraints and adaptive tension remain a separate later build and have not begun.

## Visible behavior

When clickable crossings are enabled and a crossing is selected, the Over / Under panel now names the rule that produced the visible upper thread. It reports one of:

- **Manual Crossing Override**;
- **Family-Pair Rule**, including the pair and repeat;
- **Pattern Preset**; or
- **Whole Weave**, including the selected mode.

The panel also states the complete precedence order: manual crossing, family pair, then pattern preset or whole weave. Inversion is identified when it affects a non-manual rule.

## Internal contract

The explanation is derived from the exact assignment map already used by the renderer. It does not calculate a second visual answer or add another source of crossing state. A geometry-bound manual override wins first, an exact family-pair rule wins next, and the pattern preset or whole-weave rule supplies the remaining assignment.

This phase changes presentation and inspection only. It does not change certified geometry, crossing identities, rule persistence, source identity, compact payloads, migrations, storage admission, recovery, worker ownership, computation limits, or export.

## Verification

- Current-contract matrix: **248/248 passed**.
- Focused rule/UI/renderer suite: **39/39 passed**.
- Preserved Phase 0 diagnostics and frozen fixtures: **8/8 passed**.
- Syntax checks passed for `dist/app.mjs` and `dist/weave-rules.mjs`.
- Static entrypoint/reference/private-output check passed.
- `git diff --check` passed.

The managed browser used the preserved three-family Phase 6 fixture with 31 derived paths and 181 resolved crossings. It verified the existing manual override label, a normal whole-weave Alternating 1 / 1 label, and a temporary A/B 2-over/1-under family-pair label. The woven view retained all 31 masks with zero unresolved crossings. The temporary pair rule was removed afterward; the fixture again uses its whole-weave rule, retains its one existing local override, and storage remains unblocked.

## Review

Open **Over / Under**, expand **Individual Crossings + Advanced**, and enable **Show Clickable Crossings**. Select an ordinary crossing and confirm the panel identifies its controlling whole-weave or pattern rule. Add a family-pair rule and confirm a crossing for that pair identifies the pair rule. Swap one selected crossing and confirm it identifies the manual override. Zoom, Fit, and reload should retain the woven masks and the saved rule.

Build 1 is complete.
