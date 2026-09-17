# R1B compact codec contract

Implementation status, 2026-09-16: capacity proof and v1/v2 codec compatibility checks passed. Build candidate `WF-R1B-IDB-20260916B` adds the required strict compatibility dispatch for pre-attractor `weave-study-v1` identity geometry after the preceding host candidate exposed a v2-only assumption. The subsequent normal-host browser run passed fixture setup but failed the separate 750 ms end-to-end completion gate during storage preparation. See [27](27-R1B-TRANSACTIONAL-STORAGE-IMPLEMENTATION.md). Architectural review is required; this does not authorize further implementation, publication or R1C.

2026-09-16. Approved implementation scope follows documents 20, 22, 24 and the stop evidence in 25. This contract fixes the physical encoding only. It does not change logical schema 5, geometry, identities, provenance, certificates, limits, the 10 MiB portable ceiling or any evaluator behavior.

## Format and exactness

`derived-buffer-v2` encodes either one complete `weave-study-v1` identity-derived value or one complete `weave-study-v2` certified-attractor value. The derived `versions.study` field is the mandatory format discriminator; other and missing values reject. Its logical identity is the existing `sha256-v1` digest of the fully expanded derived object. Decode must reproduce an object whose canonical serialization and digest exactly equal the input. All numbers use little-endian IEEE-754 binary64, including signed zero and subnormal values. NaN and infinities remain invalid. Integer tables use little-endian Uint32, Int32 and Uint16 only after exact range checks.

The two logical fragment shapes remain distinct. A v1 fragment has exactly `t0`, `t1`, `points`, `startProvenance`, `endProvenance` and `fragmentId`; it has no `segmentErrorBounds` field. A v2 fragment adds exactly `segmentErrorBounds`, whose length equals points minus one. Encoding a certificate field on v1, omitting it on v2, or mixing either shape with the other study version rejects. Decode never invents a v1 certificate or removes a v2 certificate. The v1 certificate count is canonically zero; v2 retains every certificate bit-for-bit.

The envelope has exactly these fields: `id`, `codec`, `meta`, `dictionary`, `counts`, `byteLengths`, `f64`, `u32`, `i32`, `u16`. IndexedDB stores the four buffers as ArrayBuffers. Portable JSON stores each buffer as strict padded base64 and declares its decoded byte length. Unknown, missing, duplicate, overlapping, out-of-order or trailing data rejects the entire payload.

`meta` is the complete derived object excluding `strands`. It retains versions, content/provenance/carrier fingerprints, reference spacing, diagnostics and `complete` without renaming or shortening logical fields. `dictionary` has exactly four UTF-8 strings in order: source board ID, carrier ID, `axis`, `signed-distance`. Board/carrier IDs are nonempty and at most 120 UTF-16 code units and 480 UTF-8 bytes each. The fixed entries must match exactly. No fragment ID is stored in the dictionary.

## Identity reconstruction

Every strand must have one shared dictionary board/carrier pair and:

```text
strandId = boardId + ':' + carrierId + ':' + family + ':' + decimal(k)
pathKey  = { boardId, carrierId, family, k }
primitiveId = 'axis'
parameterKind = 'signed-distance'
fragmentId = meta.provenanceFingerprint + ':' + strandId + ':' + decimal(fragment ordinal within strand)
```

Encode compares every original string and object to these exact expansions. Decode recreates them. A mismatch is `storage-format`; it is never normalized. Decimal integers use JavaScript's canonical base-10 `String(k)` and k must fit Int32. This preserves all valid generated IDs byte-for-byte and refuses altered legacy IDs. Schema migration still independently recomputes and certifies derived geometry before encoding.

## Tables and offsets

All offsets count elements, not bytes, and must be monotone, contiguous and canonical. Redundant values such as provenance `t` remain independently stored and compared; equality with fragment t0/t1 is not assumed by the codec.

The Float64 table contains, in order:

1. per strand: origin x/y, direction x/y, evaluation-domain t0/t1;
2. per fragment: t0, t1, start provenance t, end provenance t;
3. per fragment: every point x/y in logical order;
4. for v2 only, per fragment: every segment error certificate in logical order. V1 advances through no certificate elements and records a zero count.

The Uint32 table contains a fixed 6-word strand row and 11-word fragment row. Strand row: family code, Float64 offset, fragment offset, fragment count, board dictionary index, carrier dictionary index. Fragment row: Float64 parameter offset, point Float64 offset, point count, certificate Float64 offset, certificate count, start-edge Uint16 offset/count, end-edge Uint16 offset/count, vertex flags bitfield, reserved zero. Family codes are 0=A and 1=B. Flags bit 0/1 are start/end vertex contact; all other bits reject.

The Int32 table contains exactly one k per strand. The Uint16 table concatenates start then end edge indexes for each fragment. Each list has 0–2 strictly increasing unique indexes, each below the validated boundary's 1,000-edge limit. Decode preserves the exact arrays. The codec accepts only the approved clipped output invariant; violation returns to numerical/format review rather than widening storage silently.

## Bounds

The payload rejects before allocation when any bound fails:

| Field | Maximum |
| --- | ---: |
| strands | 2,000 |
| fragments | 20,000 |
| points | 85,536 (`65,536 segments + 20,000 fragments`) |
| certificates | 65,536 |
| Float64 elements | 328,608 (`6S + 4F + 2P + C`) |
| Uint32 elements | 232,000 (`6S + 11F`) |
| Int32 elements | 2,000 |
| Uint16 edge references | 80,000 (`4F`) |
| decoded buffer bytes | 3,724,864 |
| dictionary entries | exactly 4 |
| aggregate dictionary UTF-8 | 980 bytes |
| payload ID/fingerprint | existing validated `sha256-v1:` form |

Counts must also match derived diagnostics: fragment count equals intervals and family strand counts equal diagnostics counts for both versions. For v1, aggregate and per-fragment certificate counts are zero and the certificate property remains absent. For v2, certificate count equals `clippedSegments` and each fragment has certificates equal to points minus one. Every fragment has at least two points. Logical validation/recomputation remains authoritative beyond these structural checks.

## Capacity proof

For one maximum payload, the four buffers use at most 3,724,864 decoded bytes. Padded base64 uses exactly `4 * ceil(bytes/3)` per buffer, at most 4,966,492 characters in aggregate. The compact envelope, meta, dictionary, counts and byte-length JSON is measured from a maximally long valid metadata fixture and must remain at most 16,384 UTF-8 bytes. Thus one maximum derived payload is bounded by 4,982,876 bytes.

Portable envelope v2 content-addresses payloads and immutable working records. Identical current/saved derived content is stored once. The admission proof is per complete portable document, not per snapshot: every distinct payload, record and manifest counts exactly. A single maximum supported geometry plus the bounded workspace/record envelope must fit 10,485,760 bytes without compression. Multiple distinct maximum payloads may exceed the document ceiling and must be rejected atomically before their save/commit; no revision is pruned. This preserves the existing aggregate backup admission contract rather than promising unlimited saves.

The executable capacity proof must cover:

- the actual 19,946-fragment failure fixture from document 25;
- a synthetic table at every approved maximum, with longest IDs, two edge references at every endpoint and worst-case base64 padding;
- exact expanded-object round trip for generated fixtures;
- duplicate working/saved payload deduplication;
- aggregate admission at the exact threshold: two distinct synthetic maxima fit, while a third rejects without partial output;
- malformed offsets, counts, dictionaries, IDs, edges, base64 and trailing bytes.

If actual or synthetic single-payload backup exceeds 10 MiB, stop. Only after these checks pass may the `derived-buffer-v2` codec move into public implementation and the remaining document-24 IndexedDB work proceed.
