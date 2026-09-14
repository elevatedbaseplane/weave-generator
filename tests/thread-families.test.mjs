import test from 'node:test';
import assert from 'node:assert/strict';
import { select } from '../dist/thread-families.mjs';
test('thread families select independent paths',()=>{const paths=['a','b','c','d'];assert.deepEqual(select(paths,{visible:true,density:10},0),['a','c']);assert.deepEqual(select(paths,{visible:false,density:10},1),[]);});
