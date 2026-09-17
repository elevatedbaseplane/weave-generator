# R1C influence save correction

Date: 2026-09-16  
Build: `WF-R1C-INFLUENCE-SAVE-20260916`  
Status: accepted locally after user instruction to keep building

The immutable save capability already included the active attractor, repeller, or deflector inside its Weave Study revision, but its only visible action was in the separate Weave Study section. Field Forces instructed the user to save without offering a save control. This was a discoverability defect.

Field Forces now ends with **Save Influenced Weave Revision**. It calls the same transactional revision-save path as **Save Weave Revision**, using the current Weave Study name. The saved revision includes the field, both family settings, certified derived geometry, source lineage, and all existing recovery data. Both save controls disable while certified geometry is pending and both report the same explicit success status.

Focused R1C behavior, save/restore/compact round-trip, UI, display, and bounded-render checks pass 28/28. Syntax and served build identity pass. No geometry, schema, storage, backup, migration, capacity, or performance contract changed.

Preview: `http://127.0.0.1:43830/?r1c-influence-save=20260916`

R1C is the accepted local baseline. R1D planning is document 45; R2 and publication remain closed.
