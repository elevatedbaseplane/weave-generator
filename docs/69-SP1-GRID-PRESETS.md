# SP1 grid preset extension — 2026-09-17

Build WF-SP1-GRID-PRESETS-20260917. User requested more presets and continued local work. This bounded extension adds Square grid (0/90 degrees, spacing50), Diamond grid (45/-45 degrees, spacing50), and Triangular grid (0/60/120 degrees, spacing60), alongside Custom line families and the existing foundations.

Each preset creates a fresh copied rect-v2 source, not shared mutable state. Existing family spacing/angle/offset/density controls, add/remove families, influence tools, variation, Undo/Redo, automatic saving and portable backup apply. No new geometry algorithm, storage schema or worker protocol. The patterns are geometric grids, not claims to implement researched laced stitches. No authored over/under decisions for triangular multi-way intersections; later R2 handles those explicitly.

Four focused tests pass: all presets have expected family orientations, independent parameter copies, visible identity geometry, complete influenced geometry, unchanged saved source snapshot and exact portable backup round trips; unknown preset rejects. Syntax passes. Initial test fixture mistakenly unpacked an already parsed workspace; corrected test API use, preserved setup failure output. No product validation weakened.

Managed browser: triangular preset immediately visible with A/B/C tabs, add-attractor committed31.1ms worker/124.3ms total, saved source/field; square preset immediately visible. Browser evidence grid-browser.json; grid-preset-tests.txt. These focused samples are not phase performance certification. Existing SP1 finite-source timing failure and certification debt remain unchanged, as does R1 development-complete status.

Preview http://127.0.0.1:43831/?sp1=20260917. Tests: choose Square and Create Weave Pattern; choose Diamond and Create; choose Triangular and Create; adjust selected Family C then add/drag influence; switch patterns and reload. All are created beneath the current saved boundary and save independently. No external host command or publication.

This preset addition is complete pending user visual review; SP1 phase remains incomplete (timing repair and finite-source/new-format exit checks from66–68). Next scheduled work remains that SP1 completion, then R2A crossing analysis. Curved lacing and over/under remain later; no R2 or SP2 implementation began.
