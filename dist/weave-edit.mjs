import {readWeaveSource,materializeWeaveSource} from './weave-source.mjs';

// One source validation boundary for every editing adapter. Geometry is shared
// only as an immutable last-valid cache; calculation never consumes that cache.
export function validateWorkingEdit(working,projectId){
 return materializeWeaveSource(readWeaveSource(working,projectId),working.weave?.derived);
}

// A release of the same parameter must use the exact prepared preview, including
// its saved source revision IDs. A changed final value is prepared once from the
// gesture's original base, never from a render-mutated control or preview.
export class WeaveEditGesture {
 constructor(){this.current=null;}
 clear(){this.current=null;}
 capture(key,value,base,prepare,commit=false){
  let current=this.current;
  if(!current||current.key!==key)current={key,base:base(),value:null,prepared:null};
  const valueKey=JSON.stringify(value);
  if(current.value!==valueKey||!current.prepared){
   const prepared=prepare(current.base,structuredClone(value));
   prepared.project.working=validateWorkingEdit(prepared.project.working,prepared.project.id);
   current={...current,value:valueKey,prepared};
  }
  this.current=commit?null:current;
  return current.prepared;
 }
}
