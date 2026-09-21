// Immutable declarative intent. Expressions describe source parameters, not screen locations.
export function stitchIntentRules(recipe){
 if(recipe==='herringbone-square')return ['T','R','B','L'].map((run,i,a)=>({first:{run,role:'foundation',cell:[0,0]},second:{run:a[(i+3)%4],role:'foundation',cell:[0,0]},firstParameter:{numerator:['extension',1,0],denominator:['extension',2,1]},secondParameter:{numerator:['extension',1,1],denominator:['extension',2,1]},over:'first'}));
 const rules=[];for(const role of ['A','B']){for(const column of [-1,0])rules.push({first:{run:'U',role,cell:[0,0]},second:{run:'D',role,cell:[0,column]},firstParameter:{numerator:['overlap',1,column===-1?0:2],denominator:['overlap',2,2]},secondParameter:'one-minus-first',over:'first'});rules.push({first:{run:'U',role,cell:[0,0]},second:{run:'D',role:role==='A'?'B':'A',cell:[0,role==='A'?-1:0]},firstParameter:{numerator:['overlap',1,1],denominator:['overlap',2,2]},secondParameter:'one-minus-first',over:'second'});}
 return rules;
}
