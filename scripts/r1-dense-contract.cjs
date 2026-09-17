const assert=require('node:assert/strict');
// Exact approved v5 results; the historical v2 >30,000 proxy is not applicable.
function assertDenseContract(working,x,reference){
 const {boundary,carrier,weave}=working,g=weave.generation,expected=structuredClone(reference);
 expected.generation.influences[0].center.x=x;
 const shape=c=>{const {id,...recipe}=c;return recipe};
 const fields=g=>({...g,influences:g.influences.map(({id,...f})=>f)});
 assert.deepEqual(boundary.points,expected.boundary.points,'Dense boundary changed');
 assert.deepEqual(shape(carrier),shape(expected.carrier),'Dense carrier workload changed');
 assert.deepEqual(fields(g),fields(expected.generation),'Dense influence workload changed');
 const d=weave.derived;
 assert.equal(d.versions.study,'weave-study-v5');assert.equal(d.complete,true);assert.equal(d.diagnostics.complete,true);
 assert.equal(d.diagnostics.candidateLines,424);assert.equal(d.diagnostics.epsilon,.0125);
 assert.equal(d.diagnostics.segments,x===0?29956:29975);
 assert.equal(d.diagnostics.clippedSegments,x===0?30374:30393);
 assert.ok(d.diagnostics.maxCertifiedError<=d.diagnostics.epsilon);
}
module.exports={assertDenseContract};
