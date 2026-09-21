# SP1 continuous-field appearance correction — 2026-09-17

Build WF-SP1-FIELD-20260917. Local development preview only; no publication. User rejected separated bands as the intended field appearance and authorized continuation. This supersedes the separated-band-only UI scope, while retaining the existing band construction unchanged.

## Reference and product distinction

RSN https://rsnstitchbank.org/stitch/double-herringbone-stitch-variation describes two interlocking herringbone rows with alternating crossing precedence, used as a border/foundation. It does not establish our area-filling placement as a traditional stitch. Sarah's square reference https://www.embroidery.rocksea.org/stitch/herringbone-stitch/herringbone-square-stitch/ describes an isolated square with local cyclic weaving. Keep these distinctions visible.

Add a separately identified `double-herringbone-field` recipe, version1, explicitly labeled continuous field adaptation. It reuses each band's four finite surface runs exactly, places row j at j*height*rowStep, default rowStep0.8 with range0.55–0.9. Adjacent row extents overlap, removing the blank horizontal strips. This is visual area filling, not a declaration of one continuous thread. No backside joins, merged coincident endpoints or synthetic line connectors are introduced. Cross-row events have unresolved over/under intent; future R2 must not inherit traditional band's authored crossing precedence for them.

Existing `double-herringbone` parameters, row placement and IDs remain unchanged. Explicit Layout conversion preserves source ID, origin, pitch, height, overlap, rotation and existing field roles/settings. The target layout uses its own default row-spacing parameter. Conversion participates in the existing immutable save/Undo history. Reset and normal sliders retain current layout. New picker lists the field adaptation before separated bands; choosing a preset still explicitly creates an independent pattern.

Reference spacing for the field is min(pitch/2,height,overlap*pitch/2,height*(1-rowStep)); this is a construction scale, not an assertion about minimum crossing-event separation. Candidate enumeration uses the new row pitch, same outward search and unchanged aggregate source/segment/fragment budgets. No accuracy or workload threshold changes.

## Focused checks and actual browser evidence

15 focused tests pass (field-final-tests-20260917.txt): preserved legacy source tests, field row extent/no-extra-run tests, brute-force cell membership check, candidate overflow, finite influence/certificate exact round trip, and six frozen pre-optimization compact payload fixtures tested through sync and async encoders. Before/after serialized payload files have equal SHA256 7aa4eb29f312d092e7653424fff7fa900311eb49e26ffa4472c70c36d4c08982.

The compact encoder previously computed the full geometry digest again solely for envelope-size admission. It now reuses its already computed identical digest. Validation and the envelope check remain. This is a bounded redundant-work removal, not a worker-protocol change or a completed performance repair.

Managed browser changed the existing saved Double Herringbone + attractor to field layout: 236 retained runs instead of118; visually no blank horizontal bands; active field retained; commit succeeded, storage generation5. Raw snapshot: evidence/sp1/field-browser-before-hash-reuse.json. This observation preceded the hash-reuse update.

That change recorded worker368.3ms, total643.9ms, render26.1ms. Dispatch187.3ms, derive240.5ms, encode97.2ms, transfer8.3ms are diagnostics. Total remains above default200ms target, despite passing750 maximum and worker400/render50 maxima. No p95 certification is claimed. Earlier416.6ms evidence remains unchanged. Further feature expansion pauses; bounded timing analysis/repair and new-source certification remain needed. No external host command is requested.

## Review and next work

Preview http://127.0.0.1:43831/?sp1=20260917. Expand Weave Pattern, use Layout → Continuous Field, adjust Row Step / Height, compare Separated Bands, manipulate existing fields and reload to review persistence. Default row-step spacing is an explicit design adaptation subject to visual acceptance. The original Square remains isolated; no unreviewed continuous square construction was substituted.

SP1 remains incomplete under document66: timing, numerical review, new-format migration/capacity/recovery certification and remaining visual scenarios. R1 remains development-complete; its full host certification remains deferred until publication or an actual host-only defect. Do not start R2 or publish. After SP1 completion, next scheduled batch is R2A crossing detection/diagnostics, then R2B over/under notation.

Final managed-browser reload with the hash-reuse build restored double-herringbone-field, rowStep0.8 and one influence with storageBlocked=false. Full snapshot: evidence/sp1/field-reload.json. The preview is left in Distorted Only view with Weave Pattern expanded. Hash reuse has exact-byte verification; no subsequent performance pass is claimed.
