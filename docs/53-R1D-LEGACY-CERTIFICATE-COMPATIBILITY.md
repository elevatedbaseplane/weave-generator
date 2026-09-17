# R1D legacy certificate compatibility correction

Date: 2026-09-17  
Build: `WF-R1D-LEGACY-CERT-20260917`  
Status: locally complete; visual acceptance pending; unpublished

## Structured failure

The browser entered storage-blocked recovery mode during startup and Make Square reported: `Saving is paused because transactional storage could not be opened or validated.` This occurred before the Make Square commit path.

The preceding adjustable-Falloff change correctly treated omitted schema-5 Falloff as exponent 3 for point coordinates. Its generic interval-power loop, however, multiplied an outward-rounded interval by an interval representation of one before performing the original cubic multiplications. That extra rounding operation changed certificate bits for valid pre-Falloff schema-5 geometry. Startup certification compares complete stored geometry and certificates, so it correctly rejected the mismatch and protected the IndexedDB root.

## Correction

Omitted Falloff and explicit Falloff 3 now use the exact original cubic interval expression and the existing exponent-3 displacement and curvature bounds. Falloff 1, 2, 4, and 5 continue through the generalized conservative certified path. No saved data is cleared, rewritten, weakened, or migrated merely to pass validation.

A deterministic omitted-Falloff regression fixture now locks:

- content fingerprint `sha256-v1:e1c02a76d18e4ac1b71eccd99a80b12f2f1ec7124e886978cfbb577748f1fe3f`;
- 716 reconstructed segments; and
- maximum certified error `0.04954419342070219`.

The document-52 stale-tab Make Square retry and inline result remain present.

## Verification

- Complete focused R1 carrier/display/tree/UI/R1C/R1D/worker/storage/backup suite: **83/83 passed**.
- Legacy omitted-Falloff exact certificate fixture passed.
- Adjustable Falloff 1–5 certification and rejection checks passed.
- Syntax, static/private-output, and served-module identity checks passed.

Preview: `http://127.0.0.1:43830/?r1d-legacy-cert=20260917`

The previously blocked browser tab must be replaced or reloaded into this build because storage-blocked mode is deliberately sticky for the lifetime of a page. The new build should validate the existing root without clearing it and allow Make Square to commit.

R2A and publication remain closed.
