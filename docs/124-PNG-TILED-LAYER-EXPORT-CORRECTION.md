# PNG tiled layer export correction

Date: 2026-09-21

Build: `WF-PNG-TILED-LAYER-EXPORT-20260921`

Published application commit: `6ae68cac5f298f277a3ba47e1c18eabdb84cdfdd`

Public Site version: 27

## Corrected behavior

The high-resolution PNG exporter no longer creates one full-sized RGBA canvas. It renders the selected vector layer in 128-row transparent strips, writes unfiltered RGBA scanlines through a streaming deflate encoder, and assembles a standards-compliant PNG with CRC-protected IHDR, IDAT, and IEND chunks. Peak raster memory is bounded by one strip instead of the complete output. Progress remains visible while the browser yields between strips.

Exchange + Backup now makes the PNG target explicit:

- **Selected Weave · Distorted Result** exports the current applied weave's deformed full appearance, including hierarchy, opacity, recovery ends, and over/under masks.
- **Selected Weave · Source Pattern** exports the immutable source-pattern snapshot associated with that applied weave.
- When one family is isolated in the weave display, PNG export includes only that family.

Export validation now borrows the already primed derivation worker and returns it to the idle pool. It no longer starts a cold worker for each export, which removes the reported `SAVED STUDY VALIDATION EXCEEDED 750 MS` path while retaining the unchanged 750 ms validation limit.

## Verification

- Governing current-contract matrix: **272 passed, 0 failed**.
- Focused PNG, SVG/PDF, worker, and build-identity suite: **22 passed, 0 failed**.
- Preserved Phase 0 diagnostic and frozen-fixture assertions: **8 passed**; the intentional original-production-byte lock remains excluded after product changes.
- Module syntax, static entrypoint, archive, and diff checks passed.
- Dense restored weave exported the distorted result at **8192 × 7842 px** and the source pattern at **4077 × 4096 px** without a crash or validation timeout.
- The same dense weave exported at **16384 × 15685 px** without allocating the one-gigabyte uncompressed image in browser memory.
- Downloaded PNG inspection confirmed RGBA output, fully transparent corner pixels, alpha values from 0 through 255, and zero non-black RGB pixels in visible black-line exports.
- Compact storage remained unblocked with 10,402,837 bytes available under the unchanged limit after verification.
- Public Site version 27 deployed successfully at `https://weave-foundation.notbrandon175.chatgpt.site/`.

The correction changes export execution and selection only. Certified geometry, crossing decisions, saved weave data, storage limits, and existing SVG/PDF formats are unchanged.
