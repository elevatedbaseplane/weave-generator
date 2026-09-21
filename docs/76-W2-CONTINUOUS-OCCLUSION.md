# Continuous ribbon rendering correction

## W2 continuous occlusion correction — 2026-09-17

Build WF-W2-CONTINUOUS-20260917 replaces the active gap-cutting view with full original ribbon paths and fragment-scoped SVG masks shaped by the upper ribbon. The lower edges terminate visually at the upper ribbon edge, without manufactured end-cap strokes or clearance gaps. Widths include rendered outline-edge thickness; masks follow the actual clipped upper fragment. Solid/outline styles, priorities and local overrides remain. No new fill-color controls are claimed. Outline interiors away from crossings remain transparent. Original finite source endpoints remain actual endpoints; this change does not join disconnected source stitches.

Legacy clearance settings remain readable in saved records but their control is hidden and the active renderer ignores that gap value. No migration, geometry, certificates, IDs or saved-byte rewrites. Screen and SVG use the same continuous mask composition; exports retain original source IDs and geometry metadata. Ambiguous meetings remain unresolved. Historical cut helper tests remain as historical coverage, but the application no longer calls the cutting view.

Initial browser render failures72.1ms and84.2ms exceeded50ms; both are preserved in docs/evidence/w2. Moved exact markup/mask preparation into the crossing worker and reused completed crossing results for appearance-only changes. Main thread inserts a detached prepared SVG group; cached document-space markup supports pan/zoom. No threshold changed. Final Herringbone1055-crossing sample: worker270.0ms, render34.6ms, total464.3ms. Priority change: worker112.1ms, render33.4ms, total324.2ms. Both pass400/50/750 maxima; these are focused samples, not sustained p95/full phase certification. Prior default200ms timing debt remains and these totals do not meet that default target.

12 focused tests pass, including continuous full-path preservation, mask reversal/stale overrides, concave separation, exact crossing behavior, source/backup preservation and latest-request/presentation reuse. A new test initially had an incorrectly escaped literal regex and reversed expected SVG Y order; corrected the expectations, not rendering. Static/syntax checks pass. Managed preview inspected at close zoom; no cut-end gaps. No host command or publication.

W2 corrective version ready for visual review. Next remains alternating design sequences and uniquely matched stitch-specific rules, plus remaining source-anchor/incident verification before full W2 completion. No W3/analysis/points/polylines started.

