# Current state, decisions and acceptance tests

## Maintained foundation state — 2026-09-14

Latest user report: Phase 1B live acceptance passed. Current work is documentation-only: the Phase 2A carrier contract in 07-PHASE-2-CARRIER-PROPOSAL.md is explicitly approved as proposed and its decisions are settled. No Phase 2 implementation or publication is authorized. Future proposals include scope/build/remains/automated checks and 3–5 simple live tests; exhaustive rejection tests stay automated. Existing deployment evidence is retained, not rerun for this records-only update.

This section supersedes the historical starting record below. See [verification](05-VERIFICATION.md) and [Sol checkpoint / next batch](04-SOL-CHECKPOINT.md) for evidence and exact scope.

- Current rebuild checkout: `C:/Users/notbr/Documents/Codex/2026-09-14/confirm-you-have-editable-terminal-access/work/weave-rebuild`, branch `foundation`, derived from baseline `44953adacf6b6a47fb93447be177cbd7710428f5`.
- Rebuild Site created once: `appgprj_6aa83001d03481918d4a13e46c9612fb`, title Weave Generator — Foundation, slug weave-foundation. It is a separate owner-private destination. The original manifest was moved to reference/legacy-hosting.json; active .openai/hosting.json names only the rebuild.
- Build label: `WF-1B-20260914`. Phase 1A remains intact. Phase 1B adds staged import of exactly one closed straight SVG boundary, explicit transform/Y conversion, non-destructive rejection/Cancel, one-operation Apply, and optional source metadata preserved through revisions, reload and backup.
- Verification: 17 automated tests, public module syntax and static output checks pass; local browser checks pass as listed in 06-PHASE-1B-VERIFICATION.md. Phase 1A live acceptance passed by the user. Phase 1B live acceptance passed, as explicitly reported by the user.
- User decisions settled: preserve original site/data; raw legacy backups before migration; versioned named saves/latest pointer; separate owner-private rebuild; browser-local saves + JSON backups. No migration or cloud sync was performed.
- Raw legacy browser backup remains outstanding. This does not block an isolated rebuild namespace, and must block any future migration of original storage.
- Original unpublished experiments remain untouched in work/weave-generator and the external preservation package. The current foundation does not apply them.
- Latest completed task scope: Phase 1B straight-SVG boundary import only. No carrier or interaction implementation began.
- Phase 1B implementation commit: `e2bb9f844207a403b2fe7e52bbc7c9c1b69a018d`. Working branch remains foundation; rebuild remote targets only the private Foundation Site.
- Publication **succeeded privately**: Site version 2 records the exact Phase 1B commit; deployment `appgdep_6aa8490eb0b881918d8c202f518b346b` succeeded at `https://weave-foundation.notbrandon175.chatgpt.site`. Live readback confirmed build `WF-1B-20260914`, schema 2, storage available, visible import controls, sole viewer owner and zero groups. The original sites remain untouched.
- Package prepared and validated: `C:/Users/notbr/Documents/Codex/2026-09-14/confirm-you-have-editable-terminal-access/outputs/weave-foundation-1b.tar.gz`, SHA-256 `1055f9443611a096149ce7281b5e4e00a38b9924b67cee2ba1fd281cd3bc2d93`. Contains ten public files plus the rebuild manifest; all public files match the committed source byte-for-byte.
- Phase 1 foundation release checkpoint: **reached privately**. The Sol Medium checkpoint is reached. Bounded Phase 2A implementation follows established decisions, but the user explicitly instructed not to begin yet. Switch to Sol Medium and await a start instruction. Later modes and contract changes require architectural reasoning.
- The private Phase 1B release is available at `https://weave-foundation.notbrandon175.chatgpt.site`. Browser data remains origin-local and requires JSON backup for portability.
- User acceptance: Phase 1A passed; Phase 1B passed. Use the exact actions in 06-PHASE-1B-VERIFICATION.md.

## Archived starting record — retained for context, not current status

**Record date:** 14 September 2026. Update after each release. This is a starting record, not proof that future sessions have the same source or live version.

## 1. Verified source and deployment context

| Item | Record |
| --- | --- |
| Existing site | https://weave-generator.notbrandon175.chatgpt.site |
| Existing Sites project ID | `appgprj_6aa6ca6ed94c81919e8ce2d122d91b80` |
| Last Sites metadata checked in this conversation | Version 39; current user was owner; custom owner-only access. Not queried again during guide authoring. |
| Committed repository HEAD, rechecked during guide authoring | `44953adacf6b6a47fb93447be177cbd7710428f5` — Balance dense interaction sampling |
| Branch | `main` |
| Current local checkout | `C:/Users/notbr/Documents/Codex/2026-09-14/confirm-you-have-editable-terminal-access/work/weave-generator` |
| Source layout | Static files in `dist/`; `.openai/hosting.json` binds the existing site. |
| Source remote, without credentials | `https://git.chatgpt-team.site/9d7c4f37-d22b-4dda-a730-e5d0b3bcd285/appgprj_6aa6ca6ed94c81919e8ce2d122d91b80.git` |
| Original Tangent reference | https://tangent-systems.notbrandon175.chatgpt.site/ ; historical project ID `appgprj_6aa43e7745588191a0338eb9a8fc3b3f`. Its current source/import support has not been checked here. |

The old `/workspace/sites/weave-generator` path was absent on this Windows host. Source recovery succeeded directly through Sites: identify the existing project, obtain a short-lived source credential, and clone its returned remote/branch. The user did not need to download the source manually. Reuse the existing project ID for recovery; never create a replacement just because a checkout is missing.

Environment-specific recovery notes: bundled Git's HTTPS helper required the explicit bundled `mingw64/bin` exec path. After network permission was granted, Git's `openssl` TLS backend worked where `schannel` failed. These are observed fixes, not commands to apply blindly everywhere. Credentials were used per command, not stored in the remote. Request network access through the available permission tool when required; do not disable TLS verification.

## 2. Unfinished experiments in this conversation

After recovering source, this chat started point-extraction changes, then paused when the user requested a foundational reassessment. These experiments predate full reconciliation of the expanded interaction-first goals. **Do not deploy or treat them as an approved foundation.**

Dirty files rechecked during guide authoring:

```text
 M dist/app.mjs
 M dist/index.html
?? dist/point-extraction.mjs
?? tests/point-extraction.test.mjs
```

Experimental changes: crossing-derived points from the existing capped event map, document-coordinate conversion, boundary filtering, pin/filter behavior, saved Point Set restoration, and same-name save changed to a new variation. The latter was done before the historical replacement request was fully reconciled. Review it against decision D1 below.

Evidence limits: syntax check passed earlier; the 12 then-existing tests passed with `node --test --test-isolation=none tests/*.test.mjs` because this host blocked the test runner's default child-process spawning. A new point-extraction test file was added afterward and was not run before the pause. Local browser checks demonstrated one point-set save with hidden markers and restoration on refresh. They did not establish complete correctness, dense/rotated behavior, all themes, or production readiness. There was no deployment from this chat.

The package includes a committed source archive and Git bundle separately from the experimental diff/untracked files. These are preservation copies, not a new release. Browser-saved boards are not included: they live in each browser origin's storage. The localhost preview is not evidence of the live site's stored studies.

## 3. Reconciled maturity

| Area | Current evidence and consequence |
| --- | --- |
| Tangent-derived shell, boundaries, lattice, fields | Implemented; useful references. User confirmations cover some earlier behaviors, not a comprehensive current regression pass. |
| Family controls and deterministic deformation | Implemented, with unit coverage; semantic family assignment and state integration need redesign. |
| Interaction grammar | Implemented but incomplete/unreliable as a final model; dense cap and sampled geometry limit downstream use. |
| Dense event balancing | Synthetic spread tested in historical chat 4; not proof of complete interactions or satisfactory spatial reading. |
| Visibility, restoration, drag | Repeated partial fixes; crossing-marker workspace shift and embedded/new-tab discrepancies remained user-reported. |
| Point extraction in committed source | End/midpoint samples; selection and saving present but insufficient for the expanded goal. |
| Polyline preview | Consecutive triples with elementary rejection; explicitly a placeholder, not the desired connector. |
| Field links, interstices, relation graph | Planned, not established working. |
| Export/Tangent/Overlap integration | No verified end-to-end Weave export artifact in the reports; vendor files do not prove integration. |

## 4. Decision register

Current user statements retain all expanded goals, require simple foundational layers, allow internal implementation changes, require separate weave/point/polyline export with polyline handoff to Tangent, and require live publication/reporting for each completed batch.

| ID | Conflict or unknown | Recommended resolution | Decide by |
| --- | --- | --- | --- |
| D1 | Chat 2 explicitly requested same-name replacement; ancestry requirements prohibit silent source mutation. | Versioned named saves with a latest pointer; old dependents retain their source revision. Confirm visible behavior. | Phase 1 persistence design. |
| D2 | Old grid toggle hid grid/frame/source lattice together; later instructions separated them. | Separate grid/frame, boundary, source-lattice visibility, initially off; selecting fields cannot change them. | Phase 1 UI. |
| D3 | User valued live response; full live analysis caused lag. | Live carrier during drag, expensive analysis hidden/deferred until release; only add live analysis if measured stable. | Phase 3/4. |
| D4 | Triangular/radial modes plus exactly two families; legacy parity assignment is provisional. | Explicit family/path roles per mode, illustrated with small fixtures. | Phase 2. |
| D5 | Preserve original site versus publish every new batch. | Publish rebuild batches to a separate owner-private development site; retain original. This is recommended, not yet approved or created. | Before first rebuild deployment. |
| D6 | Existing saved boards may matter; migration preference unknown. | Preserve raw backups first; decide supported migration versus read-only legacy reference. No silent discard. | Before schema replacement. |
| D7 | Units, scale, exact Tangent import contract and DWG expectation unresolved. | Inspect Tangent and test a sample; propose SVG/DXF plus versioned metadata first; keep native DWG separately scoped. | Contract in Phase 1; verify before export claims. |
| D8 | Advanced stitches/field links/spatial tags are desired but not algorithmically defined. | Write a behavior card and synthetic example per operation; ask only about materially ambiguous outcomes. | Before the relevant Phase 5/6 batch. |
| D9 | Architectural performance scale and expected density unknown. | Use existing dense failure cases plus measured synthetic cases; agree a supported workload without guessed promises. | Phase 3/4 performance gates. |
| D10 | Rich Tangent/Overlap metadata and Reading Sheet were proposals in reports; user now retains expanded goals. | Preserve roadmap scope; first deliver correct portable outputs. Do not modify downstream tools without a scoped request. | Phase 9/integration work. |

No current choice requires the user to invent an algorithm. The builder should recommend behavior with examples. Later phase questions should not block a protected foundation unnecessarily.

## 5. Historical traps → required regressions

| Failure | Test and expected result |
| --- | --- |
| Saved boundaries missing or replacing each other | Save A/B/C, refresh, select each. Each remains independently available and exactly closed. |
| Imported geometry invisible or silently rescaled | Import known asymmetric geometry with declared units; verify documented fit/orientation and downstream round trip. |
| Boundary clip only cosmetic | On concave boundary, inspect analysis/export coordinates as well as screen clipping. No unintended out-of-bound output. |
| Same-name save mutates ancestry | Derive points from revision A, update named weave to B. A's dependent points retain A. |
| Family visibility shifts/blackens canvas | Toggle A/B individually and together repeatedly; camera, boundary and remaining geometry do not move. |
| Field response absent from long lines | A field intersecting the middle of a long path deforms it even with distant endpoints. |
| Drag/rotation mismatch | Rotate lattice, drag marker; marker, extent and deformation remain aligned with the cursor. |
| Tension/zero values incorrect | Tension 100 retains the straight family basis; zero field strength has no effect. |
| Seed/save mismatch | Reopen identical source revision and seed; carrier and committed derived results agree under the same algorithm version. |
| Hidden grid reappears | Turn off grid/frame/source lattice; select, drag, undo fields. Hidden layers stay hidden. |
| Commands/markers conflated | Independently toggle each layer on sparse and dense cases; circles and commands are distinguishable; toggles do not recompute source geometry. |
| Scan-order event cap | Dense fixtures show spatially fair preview distribution; full model/export counts do not depend on preview budget. |
| Endpoint/near-crossing loss | Test exact endpoint contact, tangency, overlapping segments, near misses, and tolerance boundaries with stated expected event types. |
| Drag analysis overload | Repeated dense drags remain responsive; final analysis is committed on release without stale job results. |
| Embedded/new-tab mismatch | Open the same build and import the same test document in both contexts. Compare state/version before blaming caching. |
| Neo color inversion | Light/Dark/Neo retain coordinates, weights and behavior; required Neo marks are visibly green, not blue. |
| Empty canvas selection leakage | Empty click deselects the intended objects; candidate click/pin does not trigger unintended field/point reset. |
| Saved points depend on DOM | Hide candidates/selected markers, save, reload. Source candidate data and decisions remain intact. |
| Arbitrary triangle connector | Input ordering changes do not arbitrarily redefine meaningful relations; each generated trace explains its rule. |
| Runtime accumulation | Repeated toggle/drag/restore cycles do not increase element/listener counts unexpectedly or produce increasing lag. |
| Premature completion claims | Distinguish syntax, unit, browser, deployment and user acceptance results. Report any untested behavior. |

## 6. Minimum examples and acceptance status

Create reproducible fixtures, not only screenshots: square, asymmetric concave boundary, rotated sparse carrier, dense carrier, localized attractor/repeller, bind seam, release opening, bridge, and a closed/open polyline exchange sample. Keep both expected geometry and a brief visual explanation. Use representative user studies when supplied.

Labels for every acceptance entry: **planned / implemented-unverified / automated-pass / browser-pass / user-accepted / failed**. Record build identity, test document, environment and result. A test can pass at one level without passing the others.

## 7. Release record template

```text
Batch / phase:
Intended deliverables:
Delivered behavior:
Source commit and branch:
Live URL / deployment ID / verified status:
Automated checks actually run:
Browser checks and exact fixture:
User tests: steps → expected result:
Known failures / unverified areas:
Remaining in batch and phase:
Next dependency:
Dirty/unpublished work:
Decision register changes:
```

Detailed source reports are preserved in `references/`. The user identified report 4 as Weave Generator 4 even though its internal title says “3?”. Preserve that attribution discrepancy; do not merge it with the distinct chat-3 conceptual report.
