const esc=value=>String(value).replace(/[&<>"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));
const number=value=>{if(!Number.isFinite(value))throw new Error('Influence radius export contains nonfinite data.');return String(value);};

export function influenceRadiusSvg(field){
 if(!field||typeof field.id!=='string'||!field.id)throw new Error('Select an influence to export.');
 if(!['attractor','repeller','deflector'].includes(field.kind))throw new Error('The selected influence type cannot export a radius.');
 if(!field.center||!Number.isFinite(field.center.x)||!Number.isFinite(field.center.y)||!Number.isFinite(field.radius)||field.radius<=0)throw new Error('The selected influence has an invalid circle radius.');
 const x=field.center.x,y=-field.center.y,r=field.radius,pad=Math.max(r*.04,1),metadata={format:'weave-influence-radius-svg',version:1,geometry:'circle-only',coordinates:{units:'document-units',yAxis:'up',svgTransform:'negate-y'},influence:{id:field.id,kind:field.kind,center:field.center,radius:r}};
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+[x-r-pad,y-r-pad,2*(r+pad),2*(r+pad)].map(number).join(' ')+'" data-weave-export="influence-radius" data-weave-coordinate-system="document-units;y-up;svg-y-negated"><metadata>'+esc(JSON.stringify(metadata))+'</metadata><circle data-influence-id="'+esc(field.id)+'" data-influence-kind="'+field.kind+'" cx="'+number(x)+'" cy="'+number(y)+'" r="'+number(r)+'" fill="none" stroke="black" stroke-width="1" vector-effect="non-scaling-stroke"/></svg>';
}
