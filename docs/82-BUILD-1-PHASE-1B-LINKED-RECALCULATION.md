# Build 1 Phase 1B — family rules and linked recalculation correction

## Version and reported defects

Build `WF-B1-P1B-LINKED-RULES-20260918` corrects the Phase 1B review build after the user reported that named modes snapped back to the previous priority selection, crossing presets were applied too broadly, and influence or pattern changes did not visibly update the complete woven result.

## Correction

The snap-back came from a display-preset redraw that ran before the new interlacing rule finished its atomic save. That stale redraw repopulated the selector from the previously committed rule. The display update now occurs after the rule commit, so the chosen control state and canvas state change together.

Over / Under now starts with a family target. Each family can receive Alternating 1/1, Two Over/One Under, or Grouped N/M rules for all crossings involving that family. The Whole-Pattern Default remains an explicit option. Family rules are stored through the existing bounded pair-rule representation and override the whole-pattern default; the button “Use Whole-Pattern Default for This Family” removes those explicit relationships. Authored construction and legacy family-priority modes remain whole-pattern choices because their meanings are not reducible to a one-family repeat. Manual crossing overrides remain highest precedence.

The crossing failure cache is now keyed by the complete geometry-and-presentation request. An exact failed request remains failed closed, while a changed rule, thread appearance, influenced geometry, or pattern geometry creates a fresh request. Existing worker and commit code already recalculates certified derived geometry for influence and pattern changes; the repaired cache boundary now guarantees the matching crossing presentation is recalculated afterward. Pattern-spacing changes continue through the tested pattern-retarget path, which preserves influences and saves the new geometry and lineage atomically.

## Verification

Forty-seven focused tests pass across family-targeted rule translation, global-default preservation, pair precedence, exact portable representation, crossing failure/retry identity, latest-request rejection, influence response, pattern spacing after influences, ancestry, immutable storage, appearance, continuous occlusion, and geometry fingerprints. Changed modules pass syntax checks and the static entrypoint/reference/private-output check passes.

Managed-browser verification on the 81-crossing line fixture changed WARP from Grouped 2/2 to Alternating 1/1. The selector remained Alternating after save and the complete presentation recomputed in `3.1 ms`; switching back produced Grouped 2/2 and recomputed in `4.7 ms`. On a saved 49-crossing influenced fixture, changing attractor strength committed certified geometry in `235.4 ms` total and the following crossing presentation recomputed in `13.2 ms`. Strength and Over / Under were restored to their original values; the original WEAVE 04 review workspace was reopened with its WARP Grouped 2/2 rule, 81 assigned, 0 unresolved, and 0 local overrides.

## Status

Phase 1B implementation is locally complete. The user explicitly deferred its visual acceptance so Phase 1C could proceed; that review remains available and does not erase the preserved verification. Phase 1C is recorded separately in document 83. Nothing was published.

Local preview: `http://127.0.0.1:43831/?b1-p1b-linked=20260918`
