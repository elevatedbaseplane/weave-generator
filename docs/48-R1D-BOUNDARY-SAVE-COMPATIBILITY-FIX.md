# R1D boundary-save compatibility fix

Date: 2026-09-16  
Build: `WF-R1D-PATTERN-TREE-FIX-20260916`  
Status: locally fixed; user retest required; unpublished

## Failure

After the dynamic-family extension, a browser containing accepted R1D geometry with nonzero A/B variation could fail certified workspace validation during startup. Startup then correctly marked transactional storage blocked. Because the storage block protects existing data, unrelated operations such as saving a Boundary also failed.

## Cause and repair

The generalized family seed function replaced the accepted A/B hash salts. This changed old derived geometry despite unchanged stored inputs. The repair restores the exact accepted A and B salts and uses the new deterministic family-name hash only for Families C through H. No stored data is cleared, rewritten, or weakened. Reloading the repaired build revalidates the existing IndexedDB snapshot and reopens normal transactional writes.

## Verification

- Exact A/B seed outputs are pinned as compatibility fixtures.
- Existing R1D geometry, persistent worker, and compact storage tests pass.
- New dynamic-family derivation, save, backup, nested duplication, and deletion tests pass.
- Focused compatibility/storage command passes 24/24.
- Browser launch from the managed shell remains blocked by the known host `spawn EPERM`; the running local preview is available for the required user retest.
