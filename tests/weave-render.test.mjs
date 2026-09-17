import test from 'node:test';
import assert from 'node:assert/strict';
import {derivedFamilyPaths} from '../dist/weave-render.mjs';

const fragment=(points)=>({points});
function visualSegments(strands,transform){const out={A:[],B:[]};for(const strand of strands)for(const part of strand.fragments)for(let i=1;i<part.points.length;i++)out[strand.family].push([transform(part.points[i-1]),transform(part.points[i])]);return out;}
function pathSegments(d){const tokens=d.match(/[ML]|-?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/gi)||[],segments=[];let i=0,current=null;while(i<tokens.length){const command=tokens[i++],point={x:Number(tokens[i++]),y:Number(tokens[i++])};if(command==='M')current=point;else{segments.push([current,point]);current=point;}}return segments;}

test('bounded derived SVG paths preserve exact visual segments, family order and fragment subpaths',()=>{
 const strands=[{family:'A',fragments:[fragment([{x:0,y:0},{x:1,y:2},{x:3,y:4}]),fragment([{x:9,y:8},{x:10,y:7}])]},{family:'B',fragments:[fragment([{x:-1,y:-2},{x:-3,y:-4}])]}],transform=p=>({x:p.x*2+5,y:11-p.y*3}),records=derivedFamilyPaths(strands,transform),legacy=visualSegments(strands,transform);
 assert.deepEqual(records.map(r=>r.family),['A','B']);assert.equal(records.length,2);assert.deepEqual(records.map(r=>[r.fragments,r.segments,r.points]),[[2,3,5],[1,1,2]]);assert.deepEqual(pathSegments(records[0].d),legacy.A);assert.deepEqual(pathSegments(records[1].d),legacy.B);assert.equal((records[0].d.match(/M/g)||[]).length,2);assert.equal((records[1].d.match(/M/g)||[]).length,1);
});

test('concave separated fragments retain their gap without a bridging SVG segment',()=>{
 const strands=[{family:'A',fragments:[fragment([{x:-4,y:1},{x:-1,y:1}]),fragment([{x:2,y:1},{x:5,y:1}])]}],record=derivedFamilyPaths(strands)[0];
 assert.equal(record.d,'M-4 1 L-1 1 M2 1 L5 1');assert.deepEqual(pathSegments(record.d),[[{x:-4,y:1},{x:-1,y:1}],[{x:2,y:1},{x:5,y:1}]]);assert.equal(record.segments,2);assert.equal(record.fragments,2);
});

test('dense segment count remains bounded to one DOM path per visible family',()=>{
 const fragments=Array.from({length:2000},(_,i)=>fragment([{x:i,y:0},{x:i+.5,y:1},{x:i+1,y:0}])),records=derivedFamilyPaths([{family:'A',fragments},{family:'B',fragments}]);
 assert.equal(records.length,2);assert.deepEqual(records.map(r=>[r.fragments,r.segments]),[[2000,4000],[2000,4000]]);assert.equal(records.reduce((n,r)=>n+(r.d.match(/M/g)||[]).length,0),4000);
});
