import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createRequire} from 'node:module';
const {assertDenseContract}=createRequire(import.meta.url)('../scripts/r1-dense-contract.cjs');
const baseline=JSON.parse(gunzipSync(readFileSync(new URL('../docs/evidence/r1-checkpoint-20260917/prepared-complete-baseline.json.gz',import.meta.url))));
const reference={...baseline.fixtures[0].p.working,generation:baseline.fixtures[0].p.working.weave.generation};
for(const x of [0,1])test('exact approved dense v5 center '+x,()=>{const f=baseline.fixtures[x],w=structuredClone(f.p.working);w.weave.derived=f.expected.derived;assertDenseContract(w,x,reference);for(const field of ['segments','clippedSegments','candidateLines','epsilon']){const bad=structuredClone(w);bad.weave.derived.diagnostics[field]++;assert.throws(()=>assertDenseContract(bad,x,reference));}const bad=structuredClone(w);bad.carrier.families.A.spacing++;assert.throws(()=>assertDenseContract(bad,x,reference));});
