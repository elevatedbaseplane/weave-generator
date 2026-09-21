# SP1 clear controls and quiet guides — 2026-09-17

Build WF-SP1-CLEAR-CONTROLS-20260917. User requests continuous herringbone only, clearer names and restoration of a lightweight attractor extent. This is an isolated UI correction; no source geometry, certification, codec, worker or persistence implementation changed.

Removed separated bands from the preset picker and removed the layout selector. New herringbone creation is continuous field only. Existing immutable legacy band records remain readable without silent geometry mutation; a one-way Use Continuous Field action appears only on those old records. No control converts a field back to bands. Square remains its separately defined foundation, not silently replaced by an unverified field recipe.

Names: Repeat Pitch → Horizontal Spacing; Band Height → Pattern Height; Row Step/Height → Row Spacing (%); Overlap → Stitch Overlap (%). Percent controls display/store80↔0.8 and25↔0.25, without changing saved numerical values. Context explains that reducing row spacing overlaps neighboring rows and creates additional intersections. These intersections have no over/under interpretation yet and can look cluttered; source geometry is intentionally unchanged in this UI batch.

Attractor ring now1px, selected opacity0.5, no drop shadow; inactive remains subdued. Radius still depicts the exact force extent. Center selection marker remains discoverable and existing drag/extent hit targets remain.

Focused actual-handler test passed: percentage controls commit exact ratios and horizontal spacing remains world units, without mutating prior source. Syntax passed. Managed browser restored existing field+attractor, verified picker and labels, and computed guide style1px/0.5/filter:none/radius118.55625. No unrelated proofs or external host run.

Preview http://127.0.0.1:43831/?sp1=20260917 (refresh). Five review checks: (1) no Separated Bands choice; (2) Horizontal Spacing changes horizontal repeats; (3) Row Spacing80% shows the stored0.8 ratio and lower values pack rows more closely; (4) selected attractor guide stays thin/light while radius and movement remain meaningful; (5) reload retains settings and field.

SP1 still incomplete: document66/67 timing and new-format numerical/storage certification remain unresolved. R1 stays development-complete. Next bounded work remains SP1 timing repair and remaining exit checks, followed by R2A only after this batch is reviewed/completed. No publication.
