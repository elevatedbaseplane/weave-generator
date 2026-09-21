# Build 1 recovery-zone overlap correction

Date: 2026-09-21

Status: complete and published for owner-only review.

Build: `WF-B1-FIELD-OVERLAP-CORRECTION-20260921`

## Defect and result

The field-presentation build originally appended recovery paths after the certified woven body had been rendered. Those paths preserved thread appearance but did not receive crossing masks, so over/under disappeared once threads entered the recovery zone outside the working boundary.

Recovery extensions now receive a separate presentation-only crossing pass. The active whole-weave, family, family-pair and deterministic preset rules resolve their crossings through the existing rule engine, and the existing outline occlusion renderer masks the lower recovery thread. Recovery contours remain open and retain their deterministic family direction, end variation, straightening and Fray opacity layers.

## Preservation

The certified body crossing calculation and its cached result are unchanged and reused. Recovery crossings are calculated only from the derived presentation extensions and are returned alongside the body markup. They do not enter the certified geometry, provenance fingerprint, source trace, saved geometry payload, analytical metadata, crossing markers or manual crossing identities. Changing Field Extent + Ends invalidates only the presentation paint key.

SVG export performs the same presentation-only recovery crossing pass, uses distinct `recovery-occlusion-*` mask identities, and retains `data-boundary-continuation`, presentation-layer and recovery-part attributes. Non-interlaced exports preserve the prior unmasked presentation path behavior.

No stored schema or migration changed. Existing Phase 0 fixtures, saved weave identities, Undo/Redo, compact storage, worker ownership, the 750 ms completion maximum and all product behavior outside recovery-zone painting remain intact.

## Verification

Automated checks:

- governing current-contract matrix: 256 passed, 0 failed;
- preserved Phase 0 diagnostic and native-fixture subset: 8 passed, 0 failed;
- focused recovery test: a pair of crossing extensions produces one recovery occlusion mask and two open contours;
- changed-module syntax, static entrypoint/reference check and `git diff --check`: passed.

Managed local-browser verification used the preserved multi-family fixture. Recover produced 62 recovery fragments with 32 masked fragments and 32 recovery masks; Fray produced root and tip layers, 124 recovery fragments and 34 masked fragments. Both completed without pending or timeout states, and the accepted Recover setting was restored.

Private Site version 18 loaded build `WF-B1-FIELD-OVERLAP-CORRECTION-20260921` from commit `9d12debb702aee6bda92b0b550384fddf4c684f2`. After saved-work restoration, the dense five-family fixture contained 90 certified body paths and 180 open recovery fragments. Of those recovery fragments, 136 carried recovery-zone occlusion masks backed by 136 unique mask definitions. The body reported 1,479 represented and assigned crossings with zero unresolved crossings at 157.1 ms worker time. Zoom to 7,621.8 percent and Fit back to 167.8 percent retained all recovery masks with zero pending fallback, timeout, storage warning, browser warning or browser error.

## Scope

This is a correction to the completed field-presentation build. Contact constraints and adaptive tension remain the next established feature work and have not begun.

Delivery evidence is recorded in `docs/evidence/build1-field-overlap-correction/delivery.json`.
