import test from 'node:test';
import assert from 'node:assert/strict';
import '../dist/weave.mjs';
import {square} from '../dist/boundary.mjs';
import {createStitchSource,changeHerringboneLayout,stitchCell,stitchCandidates,validateStitchSource} from '../dist/stitch-source.mjs';
import {deriveStitch,emptyStitchGeneration} from '../dist/stitch.mjs';
import {encodeStitch,decodeStitch} from '../dist/stitch-codec.mjs';
import {derivedFamilyPaths} from '../dist/weave-render.mjs';
test('field adaptation overlaps row extents without adding backside connectors; bands stay exact',()=>{
 const b=createStitchSource('double-herringbone','p'),snapshot=structuredClone(b),f=changeHerringboneLayout(b,'field');
 assert.deepEqual(b,snapshot);assert.equal(f.id,b.id);assert.deepEqual(stitchCell(f,0,0),stitchCell(b,0,0));
 assert.equal(stitchCell(b,1,0)[0].p0.y,90);
 for(const rowStep of [.55,.8,.9]){f.parameters.rowStep=rowStep;const current=stitchCell(f,0,0),next=stitchCell(f,1,0);assert.equal(current.length,4);assert.ok(next[0].p0.y<current[0].p1.y);assert.ok(next[0].p0.y>0);}
 assert.deepEqual(changeHerringboneLayout(f,'bands'),b);
 for(const bad of [0,.54,.91,NaN]){f.parameters.rowStep=bad;assert.throws(()=>validateStitchSource(f));}
});
test('field candidates include every cell intersecting the test boundary and still enforce workload',()=>{
 const f=createStitchSource('double-herringbone-field','p'),b=square(),runs=stitchCandidates(b,f),set=new Set(runs.map(r=>JSON.stringify(r.identity)));
 for(let row=-8;row<=8;row++)for(let col=-8;col<=8;col++)for(const r of stitchCell(f,row,col)){const minX=Math.min(r.p0.x,r.p1.x),maxX=Math.max(r.p0.x,r.p1.x),minY=Math.min(r.p0.y,r.p1.y),maxY=Math.max(r.p0.y,r.p1.y);if(maxX>=-250&&minX<=250&&maxY>=-250&&minY<=250)assert.ok(set.has(JSON.stringify(r.identity)));}
 f.parameters.pitch=1;assert.throws(()=>stitchCandidates(b,f),/2,000/);
});
test('field identity and active influence compact round trip preserve coordinates, certificates and references',()=>{
 const f=createStitchSource('double-herringbone-field','p'),g=emptyStitchGeneration(f);
 for(const enabled of [false,true]){g.influences=[{id:'f',kind:'attractor',center:{x:10,y:20},radius:100,enabled,falloffVersion:'smooth-local-v1',falloff:3,direction:0,families:{A:{strength:50,tension:0},B:{strength:50,tension:0}}}];const d=deriveStitch(square(),f,'b',{sourceBoardId:'b',sourceCarrierRevisionId:'r'},g);assert.deepEqual(decodeStitch(encodeStitch(d)),d);assert.equal(d.dictionary.recipe,'double-herringbone-field');assert.ok(d.diagnostics.maxCertifiedError<=d.diagnostics.epsilon);}
});
