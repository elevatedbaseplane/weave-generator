# Transparent high-resolution PNG export

Date: 2026-09-21

Build: `WF-TRANSPARENT-PNG-EXPORT-20260921`

Published application commit: `8a59c5e41f217b6c75f93e3b14fc61a9e8f544c8`

Public Site version: 26

## Export behavior

Exchange + Backup now provides a **Transparent PNG** export for the full weave appearance. It uses the accepted certified vector linework rather than the visible canvas or a screenshot. The exported image therefore excludes the interface, canvas background, grid, frame, boundary, and influence guides.

The user can choose:

- black or white linework;
- 4096 pixels on the longest edge;
- 8192 pixels on the longest edge, selected by default;
- 16384 pixels on the longest edge for maximum output.

The exporter measures every visible weave path and includes half of its saved stroke width when finding the line-field bound. It adds equal padding on all sides, preserves aspect ratio, and uses an `xMidYMid` frame. The resulting drawing is centered within a tightly fitted transparent canvas instead of inheriting the working boundary's rectangular view box.

Rasterization starts from the existing full-weave SVG presentation. It therefore retains family hierarchy and opacity, saved outline weights, exposed recovery/fray ends, and active over/under masks. White or black is assigned to the visible root line group before rasterization; the black and white geometry inside SVG masks remains unchanged.

The raster stage creates a new alpha-enabled canvas, clears it to transparent, draws the isolated SVG linework, and encodes directly to `image/png`. It never fills a background and does not read pixels from the product canvas or the screen. The 16384 option has a correspondingly high browser-memory cost; 8192 is the verified ultra-quality default.

## Verification

- Current-contract matrix: **269 passed, 0 failed**.
- Focused PNG/SVG/PDF, appearance, field-presentation, crossing, and build-identity suite: **27 passed, 0 failed**.
- Preserved Phase 0 workflow and fixture checks: **8 passed, 0 failed**.
- Module syntax, static entrypoint, archive, and diff checks passed.
- The restored Phase 6 browser fixture exported black linework at **8192 × 7842 px** and white linework at **4096 × 3921 px** without warnings or errors.
- Both files identify as RGBA PNG. Their four corner pixels are fully transparent and their alpha channels cover the full 0–255 range.
- Pixel inspection found every visible and partially transparent antialiasing pixel in the black PNG had RGB `0,0,0`; every such pixel in the white PNG had RGB `255,255,255`. No background-colored matte or edge residue was present.
- The hosted version exposes black/white choices, 4096/8192/16384 output sizes, 8192 as the default, and the `WF-TRANSPARENT-PNG-EXPORT-20260921` identity without browser warnings or errors.
- Public Site version 26 deployment succeeded at `https://weave-foundation.notbrandon175.chatgpt.site/`.

The build changes export presentation only. Certified geometry, source identities, crossing decisions, saved documents, compact storage, and project behavior are unchanged.
