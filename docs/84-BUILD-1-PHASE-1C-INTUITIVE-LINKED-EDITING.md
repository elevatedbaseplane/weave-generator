# Build 1 Phase 1C correction — intuitive linked editing

## Version and reported problems

Build `WF-B1-P1C-INTUITIVE-LINKED-EDITING-20260918` corrects the Phase 1C review build after the user reported that Over / Under exposed the crossing behavior before its scope and that spacing or rotation edits did not visibly update an existing weave.

## Interface correction

Over / Under now follows the edit sequence directly. Step 1 chooses which crossings are edited: the all-families default, every crossing involving one family, or one exact pair. Step 2 chooses the over/under pattern. Option labels describe their effects rather than internal representation. Grouped controls now read **Consecutive Over**, **Consecutive Under**, and **Start Position**. The precedence explanation uses plain language and the selected target appears above the behavior selector.

The Weave Pattern control previously named Angle is now Rotation. Its help text states that spacing, rotation, offset, and density rebuild the current weave and its influences automatically. The visible pattern name is synchronized from the active saved source instead of retaining a stale input label.

## Linked family-edit correction

The prior undistorted live-preview branch deliberately removed the weave object and showed only a carrier preview. That made family edits appear inactive whenever the display was showing the woven result instead of the original carrier. It now derives a complete temporary woven result and renders its threads during the gesture. The over/under presentation is restored from a fresh crossing calculation after the final save.

For influenced patterns, the latest coalesced certified request now includes the saved influenced-grid name. A completed spacing, rotation, offset, or density calculation therefore updates the current pattern, preserved influence definitions, certified derived geometry, and the saved influenced-grid revision together. Pending certified geometry still shows the last complete result until the worker commits, preserving the accepted atomic-display contract.

## Verification

Forty-nine focused tests pass across exact pair rules, crossing execution, continuous occlusion, thread appearance, family architecture, pattern lineage, active-influence preservation, spacing changes after influences, immutable storage, and portable backup. Syntax and static entrypoint/reference/private-output checks pass.

Managed-browser verification changed Warp rotation from 0° to 10°. Source and derived strand counts changed from 18 to 20, retained Warp strands changed from 9 to 11, and crossings recomputed from 81 to 89 with every crossing assigned. Restoring 0° returned source and derived counts to 18 and crossings to 81. The saved review fixture is restored to its original settings.

## Status

Phase 1C remains locally complete and awaits review of this correction. Phase 1D has not begun. Build 1 remains incomplete. Nothing was published.

Local preview: `http://127.0.0.1:43831/?b1-p1c-intuitive=20260918`
