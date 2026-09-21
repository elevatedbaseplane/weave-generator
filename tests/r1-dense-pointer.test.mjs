import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {densePointer,prepareDenseViewport}=createRequire(import.meta.url)('../scripts/r1-dense-pointer.cjs');
const box={x:200,y:100,width:775,height:800};
test('native fractional screen rounding reproduces the host mismatch',()=>{
 const client=box.x+box.width/2+1.35;
 assert.equal(Number(((Math.fround(client)-box.x-box.width/2)/1.35).toFixed(6)),.999982);
 assert.throws(()=>densePointer({cx:0,cy:0,scale:1.35},box,1),/not exactly representable/);
});
test('integral zoom preserves both exact model targets through native rounding',()=>{
 for(const scale of [1,2,3,4])for(const x of [0,1])assert.doesNotThrow(()=>densePointer({cx:0,cy:0,scale},box,x));
});
