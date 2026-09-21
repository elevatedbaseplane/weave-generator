// Crossing controls own the entire pointer lifecycle: the canvas must not redraw
// and replace the target between pointerup and click.
export function bindCrossingMarker(mark,select){
 for(const event of ['pointerdown','pointerup','pointercancel'])mark['on'+event]=e=>e.stopPropagation();
 mark.onclick=e=>{e.stopPropagation();select();};
 mark.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();select();}};
}

const endpoint=e=>`${e.si}/${e.fi}/${e.gi}`;
export function crossingSelectionRecord(source,event){
 if(typeof source!=='string'||!source||!event?.id||!event.a||!event.b)throw Error('Invalid crossing selection.');
 return Object.freeze({source,id:event.id,pair:[endpoint(event.a),endpoint(event.b)].sort().join('|')});
}
export function selectedCrossingEvent(selection,source,events){
 if(!selection||selection.source!==source)return null;
 const event=events.find(candidate=>candidate.id===selection.id&&!candidate.ambiguous);
 return event&&crossingSelectionRecord(source,event).pair===selection.pair?event:null;
}
export function editCrossingOverride(settings,source,eventId,currentUpper,action,chosenUpper){
 if(!settings||typeof source!=='string'||!source||typeof eventId!=='string'||!['swap','choose','clear'].includes(action))throw Error('Invalid crossing edit.');
 const next=structuredClone(settings),overrides=new Map(next.source===source?next.overrides:[]);
 if(action==='clear')overrides.delete(eventId);
 else {
  const upper=action==='swap'?(typeof currentUpper==='boolean'?!currentUpper:null):chosenUpper;
  if(typeof upper!=='boolean')throw Error(action==='swap'?'Choose an upper thread before swapping this unresolved crossing.':'Choose an upper thread.');
  overrides.set(eventId,upper);
 }
 next.source=source;next.overrides=[...overrides];return next;
}
