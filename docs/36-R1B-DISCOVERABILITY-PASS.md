# R1B discoverability pass

Date: 2026-09-16  
Build: `WF-R1B-DISC-20260916`  
Status: implemented locally; not published

## Vertical slice

The existing Attractor Field now exposes the minimum complete feature path without reorganizing the application:

- **Find:** the bordered Attractor Field remains the first control after a Weave Study is created, with a primary Add Attractor action.
- **Control:** sliders, live values, Enabled, guide visibility and pending cancellation remain together.
- **View:** a visible state label reports Ready to Add, Active, Disabled or Calculating; the workflow points to Source and Derived overlays immediately below.
- **Save:** the four-step cue ends at the existing Save Weave Revision action.
- **Reset:** Reset Defaults restores boundary-center placement, radius `0.3E`, strength `50`, tension `0`, Enabled on and guide visibility without changing the field identity.
- **Test:** an inline Quick Visual Check gives a short representative scenario.

The panel retains the established layout and component language. Final styling and panel reorganization remain phase-checkpoint work.

## Verification

- UI/discoverability checks: 6/6 pass.
- Focused carrier, weave, certified-attractor and bounded-render regressions: 38/38 pass.
- App syntax and static/private-output checks: pass.
- Served preview contains the workflow cue, state label, Reset Defaults and Quick Visual Check under build `WF-R1B-DISC-20260916`.
- Preview: `http://127.0.0.1:43830/?r1b-discoverability=20260916`.

## Short visual checklist

1. Create or open a Weave Study. Confirm Attractor Field shows `1 ADD · 2 ADJUST · 3 COMPARE · 4 SAVE` and state `READY TO ADD`.
2. Add an attractor. Confirm state becomes Active, sliders and guide control appear, and moving Center X changes the derived weave.
3. Disable and re-enable it. Confirm state and geometry switch between Disabled/straight and Active/deformed.
4. Change center, radius, strength and tension, then choose Reset Defaults. Confirm center returns to the boundary center, radius to 30% of the larger boundary extent, strength to 50 and tension to 0.
5. Open Quick Visual Check, compare Source and Derived, then save a Weave revision and restore it.

No R1C/R1D implementation or publication occurred.
