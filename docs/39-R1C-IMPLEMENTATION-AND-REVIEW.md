# R1C implementation and review

Date: 2026-09-16  
Build: `WF-R1C-20260916`  
Batch: R1C — Repeller and Directional Deflector  
Status: locally implemented and focused verification passed; visual acceptance pending

## Delivered behavior

- One stable influence can be switched among Attractor, Repeller, and Directional Deflector.
- Repeller uses the exact outward sign reversal of the approved attractor equation.
- Deflector uses the approved compact support and tension with a fixed authored direction and a maximum displacement of `0.2R`.
- All three types retain certified reconstruction, analytical clipping, complete A/B source enumeration, provenance, fragment certificates, and atomic latest-request worker commits.
- A `weave-study-v3`/`single-influence-v1` record stores kind and direction. Existing v1/v2 studies remain under their original contracts; editing a v2 influence promotes only working state.
- The Influence Field block is the first Weave control. It contains Add Influence, a type selector, sliders, explicit Enable/Disable, Reset, Remove, guide display, Source/Derived overlays, save, and the inline visual-check workflow.
- The canvas provides direct center and extent handles for every type and a direction line/handle for Deflector.
- Type changes and completed canvas gestures are undoable. Immutable saves, restore, reload, compact storage, and portable backup retain type, direction, geometry, identity, and lineage.
- Guide, source, and derived layers remain separate. Dense derived geometry remains bounded to one SVG path per visible family with separate subpaths per fragment.

Multiple influences and seeded variation remain R1D. R2 interactions, point extraction, crossings, and polyline composition were not started. No publication occurred.

## Verification

Focused verification passed on 2026-09-16:

- R1C equation, identity, validation, radial-order, certification, save/restore, compact-codec, and worker-protocol checks.
- R1C/R1B UI discoverability, slider, Enabled-action, dashed-layer, and build-identity checks.
- Bounded derived rendering and concave-gap checks.
- Touched carrier, weave, and storage compatibility checks.
- Module syntax checks for the influence evaluator, document model, worker, codec, weave dispatch, and application.

The run did not repeat exhaustive browser capacity, migration, recovery, or performance certification. R1C did not alter the accepted thresholds.

## Visual acceptance state

The local preview is `http://127.0.0.1:43830/?r1c=20260916`. Visual acceptance should start from a fresh board and follow the numbered checklist in the review response. Until that review passes, R1C is locally implemented but not product-accepted.

## Next scheduled action

After visual acceptance and “approved, keep working,” begin the R1D architecture gate for multiple simultaneous influences and seeded variation. Settle composition/order, identity, editing selection, guide visibility, and deterministic seed behavior before implementing the first R1D vertical slice.
