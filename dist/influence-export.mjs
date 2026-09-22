const esc=value=>String(value).replace(/[&<>"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));
const number=value=>{if(!Number.isFinite(value))throw new Error('Influence radius export contains nonfinite data.');return String(value);};

export function influenceRadiiSvg(fields){
 if(!Array.isArray(fields)||!fields.length)throw new Error('The selected weave has no influence radii to export.');
 const circles=fields.map((field,index)=>{
  if(!field||typeof field.id!=='string'||!field.id)throw new Error(`Influence ${index+1} has no stable identity.`);
  if(!['attractor','repeller','deflector'].includes(field.kind))throw new Error(`Influence ${index+1} cannot export a radius.`);
  if(!field.center||!Number.isFinite(field.center.x)||!Number.isFinite(field.center.y)||!Number.isFinite(field.radius)||field.radius<=0)throw new Error(`Influence ${index+1} has an invalid circle radius.`);
  return{field,x:field.center.x,y:-field.center.y,r:field.radius};
 });
 const minX=Math.min(...circles.map(circle=>circle.x-circle.r)),maxX=Math.max(...circles.map(circle=>circle.x+circle.r)),minY=Math.min(...circles.map(circle=>circle.y-circle.r)),maxY=Math.max(...circles.map(circle=>circle.y+circle.r)),extent=Math.max(maxX-minX,maxY-minY),pad=Math.max(extent*.04,1),metadata={format:'weave-influence-radii-svg',version:1,geometry:'circles-only',coordinates:{units:'document-units',yAxis:'up',svgTransform:'negate-y'},influences:circles.map(({field})=>({id:field.id,kind:field.kind,center:field.center,radius:field.radius,enabled:field.enabled!==false}))};
 const body=circles.map(({field,x,y,r})=>'<circle data-influence-id="'+esc(field.id)+'" data-influence-kind="'+field.kind+'" data-influence-enabled="'+String(field.enabled!==false)+'" cx="'+number(x)+'" cy="'+number(y)+'" r="'+number(r)+'"/>').join('');
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+[minX-pad,minY-pad,maxX-minX+2*pad,maxY-minY+2*pad].map(number).join(' ')+'" data-weave-export="influence-radii" data-weave-coordinate-system="document-units;y-up;svg-y-negated"><metadata>'+esc(JSON.stringify(metadata))+'</metadata><g fill="none" stroke="black" stroke-width="1" vector-effect="non-scaling-stroke">'+body+'</g></svg>';
}
