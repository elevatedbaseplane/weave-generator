import {anchorsFromPoints,bounds,solve} from './geometry.mjs';
import {connectAnchors,networkTangents} from './network.mjs';

const num='[-+]?(?:\\d*\\.\\d+|\\d+\\.?)(?:[eE][-+]?\\d+)?';
export function parsePointList(value){
 const n=(String(value).match(new RegExp(num,'g'))||[]).map(Number);
 if(n.length<6||n.length%2)throw new Error('Point list must contain at least three x/y pairs.');
 return Array.from({length:n.length/2},(_,i)=>({x:n[i*2],y:n[i*2+1]}));
}
export function parseLinePath(value){
 const remaining=String(value).replace(new RegExp(num,'g'),'').replace(/[\s,]/g,'');if([...remaining].some(c=>!/[MmLlHhVvZz]/.test(c)))throw new Error('Only straight M, L, H, V and Z path commands are supported.');
 const tokens=String(value).match(new RegExp(`[MmLlHhVvZz]|${num}`,'g'))||[],shapes=[];
 let i=0,cmd='',x=0,y=0,start=null,current=[];
 const finish=()=>{if(current.length>=3){if(Math.hypot(current[0].x-current.at(-1).x,current[0].y-current.at(-1).y)<1e-8)current.pop();shapes.push(current);}current=[];start=null;};
 while(i<tokens.length){
  if(/^[A-Za-z]$/.test(tokens[i]))cmd=tokens[i++];
  if(!/[MmLlHhVvZz]/.test(cmd))throw new Error('Only straight M, L, H, V and Z path commands are supported.');
  if(/[Zz]/.test(cmd)){finish();cmd='';continue;}
  const relative=cmd===cmd.toLowerCase(),upper=cmd.toUpperCase();
  if(upper==='H'){if(i>=tokens.length||/^[A-Za-z]$/.test(tokens[i]))throw new Error('Invalid horizontal path command.');x=relative?x+Number(tokens[i++]):Number(tokens[i++]);current.push({x,y});continue;}
  if(upper==='V'){if(i>=tokens.length||/^[A-Za-z]$/.test(tokens[i]))throw new Error('Invalid vertical path command.');y=relative?y+Number(tokens[i++]):Number(tokens[i++]);current.push({x,y});continue;}
  if(i+1>=tokens.length||/^[A-Za-z]$/.test(tokens[i])||/^[A-Za-z]$/.test(tokens[i+1]))throw new Error('Invalid line path command.');
  const nx=Number(tokens[i++]),ny=Number(tokens[i++]);x=relative?x+nx:nx;y=relative?y+ny:ny;
  if(upper==='M'){if(current.length)finish();start={x,y};current.push({x,y});cmd=relative?'l':'L';}else current.push({x,y});
 }
 if(current.length){if(start&&Math.hypot(current[0].x-current.at(-1).x,current[0].y-current.at(-1).y)<1e-8)finish();else throw new Error('Open SVG paths are not polygon inputs. Close the path with Z.');}
 return shapes;
}
const ident=[1,0,0,1,0,0];
const multiply=(a,b)=>[a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];
export function parseTransform(value=''){
 let out=ident;
 for(const m of String(value).matchAll(/(matrix|translate|scale|rotate|skewX|skewY)\s*\(([^)]*)\)/gi)){
  const v=(m[2].match(new RegExp(num,'g'))||[]).map(Number),type=m[1].toLowerCase();let next=ident;
  if(type==='matrix'&&v.length===6)next=v;
  else if(type==='translate')next=[1,0,0,1,v[0]||0,v[1]||0];
  else if(type==='scale')next=[v[0]??1,0,0,v[1]??v[0]??1,0,0];
  else if(type==='rotate'){const c=Math.cos((v[0]||0)*Math.PI/180),s=Math.sin((v[0]||0)*Math.PI/180),r=[c,s,-s,c,0,0];next=v.length>2?multiply(multiply([1,0,0,1,v[1],v[2]],r),[1,0,0,1,-v[1],-v[2]]):r;}
  else if(type==='skewx')next=[1,0,Math.tan((v[0]||0)*Math.PI/180),1,0,0];
  else if(type==='skewy')next=[1,Math.tan((v[0]||0)*Math.PI/180),0,1,0,0];
  out=multiply(out,next);
 }
 return out;
}
const apply=(p,m)=>({x:m[0]*p.x+m[2]*p.y+m[4],y:m[1]*p.x+m[3]*p.y+m[5]});
function elementTransform(el){const chain=[];for(let n=el;n&&n.tagName?.toLowerCase()!=='svg';n=n.parentElement)chain.unshift(parseTransform(n.getAttribute('transform')||''));return chain.reduce(multiply,ident);}
export function parseSvgText(text,Parser=globalThis.DOMParser){
 if(!Parser)throw new Error('SVG parsing requires a browser.');
 const doc=new Parser().parseFromString(text,'image/svg+xml');if(doc.querySelector('parsererror'))throw new Error('The SVG file is not valid XML.');
 const shapes=[],errors=[];
 for(const el of doc.querySelectorAll('polygon,polyline,path,rect'))try{
  const tag=el.tagName.toLowerCase();let sets=[];
  if(tag==='path')sets=parseLinePath(el.getAttribute('d')||'');
  else if(tag==='rect'){if(Number(el.getAttribute('rx')||0)||Number(el.getAttribute('ry')||0))throw new Error('Rounded rectangles must be converted to straight polylines.');const x=Number(el.getAttribute('x')||0),y=Number(el.getAttribute('y')||0),w=Number(el.getAttribute('width')),h=Number(el.getAttribute('height'));sets=[[{x,y},{x:x+w,y},{x:x+w,y:y+h},{x,y:y+h}]];}
  else {const p=parsePointList(el.getAttribute('points')||'');if(tag==='polyline'&&Math.hypot(p[0].x-p.at(-1).x,p[0].y-p.at(-1).y)>1e-8)throw new Error('Open polylines are ignored. Close the polyline before importing.');sets=[p];}
  const matrix=elementTransform(el);for(const points of sets)shapes.push(points.map(p=>apply(p,matrix)));
 }catch(error){errors.push(error.message);}
 if(!shapes.length)throw new Error(errors[0]||'No closed straight-line polygon was found.');
 return {shapes,errors};
}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const n=v=>Number(v.toFixed(6));
function documentSvg(content,points,name){const b=bounds(points),pad=Math.max(b.width,b.height)*.08||10,v=[n(b.minX-pad),n(b.minY-pad),n(b.width+pad*2),n(b.height+pad*2)];return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${v.join(' ')}" data-source="${esc(name)}"><g fill="none" stroke="black" stroke-width="${n(Math.max(b.width,b.height)/500)}" vector-effect="non-scaling-stroke">${content}</g></svg>`;}
function sourcePath(anchors){return `M ${anchors.map(a=>`${n(a.x)} ${n(a.y)}`).join(' L ')} Z`;}
function anchorMetadataSvg(anchors){const arcs=solve(anchors).arcs||[],radials=arcs.flatMap(arc=>arc?[`<path d="M ${n(arc.center.x)} ${n(arc.center.y)} L ${n(arc.from.x)} ${n(arc.from.y)}"/>`,`<path d="M ${n(arc.center.x)} ${n(arc.center.y)} L ${n(arc.to.x)} ${n(arc.to.y)}"/>`]:[]).join('');return `<g id="anchor-point" data-layer="ANCHOR POINT" fill="#000" stroke="none">${anchors.map(a=>`<circle cx="${n(a.x)}" cy="${n(a.y)}" r="2.5"/>`).join('')}</g><g id="meta-data" data-layer="META DATA"><g id="anchor-radii" stroke="#999">${anchors.map(a=>`<circle cx="${n(a.x)}" cy="${n(a.y)}" r="${n(a.radius)}"/>`).join('')}</g><g id="anchor-tangent-connectors" stroke="#999" stroke-dasharray="4 5">${radials}</g><g id="anchor-numbers" fill="#000" stroke="none">${anchors.map(a=>`<text x="${n(a.x+7)}" y="${n(a.y-7)}" font-size="10">${String(a.id).padStart(2,'0')}</text>`).join('')}</g></g>`;}
export function shapeSvg(anchors,name='tangent-shape',settings={}){
 const showOutline=settings.showOutline??true,showSource=settings.showSource??false,showMetadata=settings.showAnchorMetadata??settings.showRadii??false,parts=[];
 if(showSource)parts.push(`<path id="source-polygon" stroke="#999" d="${sourcePath(anchors)}"/>`);
 if(showOutline){const g=solve(anchors);if(!g.path)throw new Error('The current radii or wraps do not produce a complete shape.');parts.push(`<path id="interpreted-shape" d="${g.path}"/>`);}
 if(showMetadata)parts.push(anchorMetadataSvg(anchors));
 if(!parts.length)throw new Error('Choose at least one export layer.');return documentSvg(parts.join(''),anchors,name);
}
export function lineSystemSvg(anchors,settings,name='tangent-lines'){
 const centers=connectAnchors(anchors,settings.centerFrom,settings.centerTo,settings.centerSeed,settings.centerRouting||'mixed','centerParticipation'),tangentConnections=connectAnchors(anchors,settings.tangentFrom,settings.tangentTo,settings.tangentSeed,settings.tangentRouting||'mixed','tangentParticipation'),tangents=networkTangents(anchors,tangentConnections.edges,'shape'),parts=[];
 if(settings.showSource)parts.push(`<path id="source-polygon" stroke="#999" d="${sourcePath(anchors)}"/>`);
 if(settings.showCenters){const visible=[...new Map(centers.edges.map(e=>[[e.from,e.to].sort((a,b)=>a-b).join(':'),e])).values()];parts.push(`<g id="center-lines" stroke="#969d96" stroke-dasharray="4 6">${visible.map(e=>`<path d="M ${n(e.a.x)} ${n(e.a.y)} L ${n(e.b.x)} ${n(e.b.y)}"/>`).join('')}</g>`);}
 if(settings.showTangents){parts.push(`<g id="tangent-lines" stroke="#666">${tangents.edges.map(e=>`<path d="M ${n(e.a.x)} ${n(e.a.y)} L ${n(e.b.x)} ${n(e.b.y)}"/>`).join('')}</g>`);}
 if((settings.showAnchorMetadata??settings.showRadii)!==false)parts.push(anchorMetadataSvg(anchors));
 if(settings.showOutline){const g=solve(anchors);if(g.path)parts.push(`<path id="interpreted-shape" stroke="#111" d="${g.path}"/>`);}
 return documentSvg(parts.join(''),anchors,name);
}
