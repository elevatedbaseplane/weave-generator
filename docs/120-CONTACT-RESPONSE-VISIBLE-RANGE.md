# Contact response visible-range correction

Date: 2026-09-21

Build: `WF-CONTACT-TENSION-RESPONSE-20260921`

Published application commit: `b4686161cc3cd54f2266975fd59d2f8e50ab5cf7`

Public Site version: 23

## Defect

The contact sliders could move while the response checkbox was off. When enabled, the original restraint cap also reduced many dense crossings to zero added clearance, while high base-tension values produced a subpixel change.

## Correction

- Moving either slider now enables the response automatically.
- Enabling the checkbox from the untouched 100% baseline begins at a visible 40% base tension.
- The response curve now gives ordinary slider values a visible range.
- Added clearance remains bounded by half the nearest restraint spacing.
- Adaptive response still tightens crowded, acute or curved spans.
- Certified geometry, crossing assignments and the disabled baseline remain unchanged.

## Verification

- Focused contact and crossing suites: 29 passed, 0 failed.
- Current-contract matrix: 262 passed, 0 failed.
- Preserved Phase 0 fixtures: 8 passed, 0 failed.
- Local browser fixture at 85% base and 60% adaptive: all 89 eligible mask paths changed; browser warnings and errors: none.
- Reset restored the disabled 100% baseline.
- Public Site version 23 deployment succeeded.
