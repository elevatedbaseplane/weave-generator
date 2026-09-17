# R1C vertical feature proposal

> **Superseded scope note, 2026-09-16:** The user subsequently authorized one complete R1C batch containing both Repeller and Directional Deflector. Build `WF-R1C-20260916` implements that expanded scope under the settled addendum at the end of this document. The earlier A/B split below is preserved as planning history and is no longer the active batch boundary.

Date: 2026-09-16  
Status: superseded proposal history; complete authorized R1C contract is recorded by the note and settled addendum

## Recommended batch split

Deliver R1C as two bounded vertical slices instead of combining two new behaviors in one batch:

1. **R1C-A — one repeller:** complete equation, certification, UI, guide, save/restore/reset, migration, export and visual verification.
2. **R1C-B — one directional deflector:** complete direction equation and arrow guide under a separately reviewed contract after R1C-A is accepted.

This keeps the existing one-active-influence limit. Multiple influences and their order/combination rule remain R1D. The split preserves the user's requested feature workflow while avoiding a broad panel redesign.

## Exact R1C-A behavior

Retain R1B definitions for source `P(t)`, center `C`, support radius `R`, strength `S`, tension `H`, `T=H/100`, amplitude `a` and smooth-local falloff `w(s,T)`:

```text
a = 0.8 * (S / 100) * (1 - T)
s = dot(P(t)-C, P(t)-C) / R²
w(s,T) = (1-s)³ * (1+T*s)  for 0 <= s < 1; otherwise 0

Attractor: Q(t) = P(t) + a*w(s,T)*(C-P(t))
Repeller:  Q(t) = P(t) + a*w(s,T)*(P(t)-C)
```

The repeller reverses the approved radial displacement without introducing a second falloff or a force simulation. Absent/disabled, strength `0`, or tension `100` remains exact identity. Both A/B families use the same document-space map. The support is compact and C2 at the ring. Implementation must prove a conservative second-derivative/error bound for the repeller and verify the radial derivative stays positive over the full accepted parameter range; failure returns to architectural review.

Use the existing interval-certified reconstruction, expanded source enumeration, analytical polygon clipping, provenance, limits and per-segment certificates. Update only the sign-dependent displacement and derivative enclosure. Preserve the settled persistent-worker `375/400 ms`, foreground dense `650/750 ms`, render `50 ms`, pending and long-task gates at the next affected checkpoint.

## Identity and migration

Do not reinterpret saved v2 attractors. Introduce:

```text
weaveVersion: 'weave-study-v3'
generation: {
  version: 'single-influence-v1',
  tension,
  influence: {
    id,
    kind: 'attractor' | 'repeller',
    center,
    radius,
    strength,
    enabled,
    falloffVersion: 'smooth-local-v1'
  }
}
```

Existing v1 identity and v2 attractor working/saved revisions remain byte-identical under their original validators and codecs. Switching an active v2 attractor to Repeller promotes only the working snapshot to v3 and retains the field identity and authored center/radius/strength/tension. Switching back remains v3; it never rewrites the old v2 save. Compact storage and portable JSON must round-trip mixed v1/v2/v3 working states and immutable revisions exactly.

## Minimum complete UI

- **Find:** the existing Attractor Field becomes **Influence Field**, first inside Weave Study, with a two-choice Attract/Repel selector.
- **Control:** retain center, radius, strength, tension, enabled and guide sliders/controls. Switching type is one undoable committed action.
- **View:** the guide identifies inward versus outward behavior at the same support ring; the state label names Active Attractor or Active Repeller. Source/Derived overlays remain immediately below.
- **Save:** the existing Save Weave Revision saves the exact type and settings; restore updates selector, guide and geometry.
- **Reset:** Reset Defaults restores the selected type's defaults without changing its stable influence ID. Remove returns identity.
- **Test:** inline Quick Visual Check changes to a type-aware comparison.

No new global navigation or panel rearrangement is included.

## Automated checks

- Exact attractor regression and exact repeller sign fixture at off-axis midpoint.
- Identity for disabled/zero/max-tension and exact type-switch undo/redo.
- Certified error, source-domain completeness, concave-gap clipping and transformed/rotated fixtures for repeller.
- Mixed v1/v2/v3 validation, compact codec, immutable save/restore, reload, backup/import, recovery and stale-tab behavior.
- Targeted-render DOM bounds and unchanged Source/Derived display semantics.
- Development-mode focused performance measurement; full checkpoint certification only because schema, codec and evaluator behavior change.

## Four visual acceptance tests

1. Create a default Weave Study, add the field, and switch Attract to Repel. Nearby strands bend toward the center and then away from it; distant strands remain unchanged.
2. Move the center and radius with Repel selected. The outward deformation follows the guide ring; Undo restores the complete gesture.
3. Raise Strength and Tension, disable/re-enable, then Reset Defaults. Pull direction, identity states, readouts and status remain consistent.
4. Save one Attractor revision and one Repeller revision, reload and restore each. Type, guide, settings, exact geometry and Derived SVG return correctly.

## Remaining design gate

R1C-A follows the approved R1B falloff, tension, certification, clipping, worker and storage decisions. Its only material visible choice is whether Repeller is the exact sign-reversal above. Approval of this document settles that choice and authorizes a bounded R1C-A implementation only if stated explicitly. Directional Deflector remains R1C-B planning; multiple fields remain R1D.

## Settled R1C addendum

The complete authorized R1C scope retains the Repeller equation above and adds a Directional Deflector with authored angle `theta`, unit direction `D=(cos(theta), sin(theta))`, and bounded amplitude:

```text
b = 0.2 * R * (S / 100) * (1 - T)
Deflector: Q(t) = P(t) + b*w(s,T)*D
```

The maximum deflector displacement is `0.2R`. Direction is stored in document coordinates as degrees from -180 through 180. Disabled, strength zero, or tension 100 is exact identity for every type. All three types retain the approved interval certification, epsilon, complete workload, analytical clipping, provenance, certificates, latest-request worker behavior, atomic commit, and storage contracts.

The v3 influence kind is `attractor | repeller | deflector` and includes a required `direction` field. Type changes retain the stable influence ID and are one undoable change. Existing v1/v2 records remain governed by their original validators; only an edited working v2 state is promoted.

The Influence Field UI includes all three types, direct center and extent handles, and a Deflector direction line/handle. Multiple simultaneous influences and seeded variation remain R1D. R2 interactions, point extraction, and polyline composition remain deferred.
