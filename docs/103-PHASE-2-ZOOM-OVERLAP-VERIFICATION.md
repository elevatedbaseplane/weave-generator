# Phase 2 zoom overlap verification

Date: 2026-09-21

The user reported that above/below presentation disappeared after zooming the hosted Site. The hosted version is still `WF-STABILITY-PHASE1-CANONICAL-SOURCE-20260921`, before the document-101 woven-presentation correction.

The defect was reproduced on the hosted page after an influenced weave committed. Before viewport redraw, the completed renderer contained one continuous-weave group with SVG masks. After Fit/zoom, the layer contained three unmasked family paths, no continuous-weave group and no masks, even though the crossing status still reported 269 current assigned crossings. The saved geometry and crossing calculation remained valid.

Cause: the old commit path left `carrierPreview` populated. A later viewport redraw treated that stale flag as an active preview. The old `renderDerivedWeaveLayer` bypassed continuous weaving whenever its preview argument was true, replacing the masked presentation with raw family paths.

The local Phase 2 build already contains both required corrections from document 101:

- successful certified commits clear `carrierPreview` before later viewport redraws;
- preview redraws use `renderContinuousWeave`, retaining the current or last complete masked presentation while omitting only editable crossing marks.

Managed-browser verification on the local Phase 2 build recorded one continuous-weave group, 18 masks and zero raw fallback paths before zoom. After zooming from 189.4% to 2411.6%, the same one group and 18 masks remained, `data-woven-pending` stayed false and raw fallback paths remained zero. A focused regression executes the production redraw function with the preview flag set and locks the successful-commit preview cleanup.

No geometry, rule, appearance, storage or UI behavior changed in this verification batch. Phase 2 remains ready for review. Publishing the already verified correction remains blocked by this session's source-network policy; the hosted Site is unchanged.
