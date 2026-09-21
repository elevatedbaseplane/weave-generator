import {resolveWeaveRules} from './weave-rules.mjs';
import {outlinePoints,threadStyle,threadPaths,threadStroke,threadOpacity} from './thread-appearance.mjs';

function distances(points){const ds=[0];for(let k=1;k<points.length;k++)ds.push(ds[k-1]+Math.hypot(points[k].x-points[k-1].x,points[k].y-points[k-1].y));return ds;}
function arcAt(points,j,t){const ds=distances(points);return{ds,value:ds[j]+t*(ds[j+1]-ds[j])};}
function sliceAt(points,j,t,reach){const {ds,value:c}=arcAt(points,j,t),lo=Math.max(0,c-reach),hi=Math.min(ds.at(-1),c+reach),at=d=>{let k=1;while(k<ds.length-1&&ds[k]<d)k++;const u=(d-ds[k-1])/(ds[k]-ds[k-1]||1);return{x:points[k-1].x+u*(points[k].x-points[k-1].x),y:points[k-1].y+u*(points[k].y-points[k-1].y)}};return[at(lo),...points.filter((p,k)=>ds[k]>lo&&ds[k]<hi),at(hi)];}
function clipPlane(points,value){const out=[];for(let i=0;i<points.length;i++){const a=points[(i+points.length-1)%points.length],b=points[i],av=value(a),bv=value(b),aIn=av>=-1e-9,bIn=bv>=-1e-9;if(aIn!==bIn){const t=av/(av-bv);out.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});}if(bIn)out.push(b);}return out;}
function clipToCrossingCell(points,center,tangent,before,after){let clipped=points;if(Number.isFinite(before))clipped=clipPlane(clipped,p=>(p.x-center.x)*tangent.x+(p.y-center.y)*tangent.y+before);if(Number.isFinite(after))clipped=clipPlane(clipped,p=>after-(p.x-center.x)*tangent.x-(p.y-center.y)*tangent.y);return clipped;}
const path=(points,transform)=>points.map((p,i)=>{const q=transform(p);return(i?'L':'M')+q.x+' '+q.y}).join(' ')+' Z';

// Each lower-thread mask is confined to the crossing's nearest-neighbor cell
// along that thread. Close crossings therefore cannot erase one another's local
// upper thread, and no broad repaint is needed to recover the visible weave.
function occlusionPlan(strands,result,settings,appearance,source,transform=p=>p){
 const masks=new Map();
 if(!settings?.enabled||!result?.complete)return masks;
 const assignments=resolveWeaveRules(strands,result,settings,source),active=[],positions=new Map();
 const addPosition=(key,value)=>{if(!positions.has(key))positions.set(key,[]);positions.get(key).push(value);};
 for(const ev of result.events){
  if(ev.ambiguous||!assignments.has(ev.id))continue;
  const aOver=assignments.get(ev.id),over=aOver?ev.a:ev.b,under=aOver?ev.b:ev.a,top=strands[over.si],bottom=strands[under.si],p=top.fragments[over.fi].points,q=bottom.fragments[under.fi].points;
  const dx=p[over.j+1].x-p[over.j].x,dy=p[over.j+1].y-p[over.j].y,ux=q[under.j+1].x-q[under.j].x,uy=q[under.j+1].y-q[under.j].y,topLength=Math.hypot(dx,dy),bottomLength=Math.hypot(ux,uy),den=topLength*bottomLength,sin=Math.abs(dx*uy-dy*ux)/den,cos=Math.abs(dx*ux+dy*uy)/den;
  if(!sin)continue;
  const overKey=over.si+'/'+over.fi,underKey=under.si+'/'+under.fi,overArc=arcAt(p,over.j,over.t).value,underArc=arcAt(q,under.j,under.t).value;
  addPosition(overKey,overArc);addPosition(underKey,underArc);
  active.push({over,under,p,q,top,bottom,bottomLength,cos,sin,underKey,underArc});
 }
 for(const list of positions.values())list.sort((a,b)=>a-b);
 for(const item of active){
  const {over,under,p,q,top,bottom,bottomLength,cos,sin,underKey,underArc}=item,ts=threadStyle(appearance,top.family||top.identity?.roleId),bs=threadStyle(appearance,bottom.family||bottom.identity?.roleId),topWidth=ts.width+(ts.mode==='outline'?threadStroke(ts):0),bottomWidth=bs.width+(bs.mode==='outline'?threadStroke(bs):0),reach=(bottomWidth/2+topWidth*cos/2)/sin+threadStroke(ts),sites=positions.get(underKey)||[],previous=[...sites].reverse().find(value=>value<underArc-1e-7),next=sites.find(value=>value>underArc+1e-7),before=previous===undefined?Infinity:(underArc-previous)/2,after=next===undefined?Infinity:(next-underArc)/2,center={x:q[under.j].x+(q[under.j+1].x-q[under.j].x)*under.t,y:q[under.j].y+(q[under.j+1].y-q[under.j].y)*under.t},tangent={x:(q[under.j+1].x-q[under.j].x)/bottomLength,y:(q[under.j+1].y-q[under.j].y)/bottomLength},polygon=clipToCrossingCell(outlinePoints(sliceAt(p,over.j,over.t,reach),ts.width),center,tangent,before,after);
  if(polygon.length<3)continue;
  if(!masks.has(underKey))masks.set(underKey,[]);
  masks.get(underKey).push({d:path(polygon,transform),edge:ts.mode==='outline'?threadStroke(ts):0});
 }
 return masks;
}

export function weaveOcclusions(strands,result,settings,appearance,source,transform=p=>p){return occlusionPlan(strands,result,settings,appearance,source,transform);}
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
export function continuousWeaveSvg(strands,result,settings,appearance,source,boundary,options={}){const masks=occlusionPlan(strands,result,settings,appearance,source,p=>({x:p.x,y:-p.y})),xs=boundary.points.map(p=>p.x),ys=boundary.points.map(p=>-p.y),extent=Math.max(Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys)),pad=Math.max(50,extent*.15),x=Math.min(...xs)-pad,y=Math.min(...ys)-pad,w=Math.max(...xs)-Math.min(...xs)+2*pad,h=Math.max(...ys)-Math.min(...ys)+2*pad,defs=[],paths=[],prefix=options.idPrefix||'occlusion-';for(let si=0;si<strands.length;si++){const s=strands[si],family=s.family||s.identity?.roleId;for(let fi=0;fi<s.fragments.length;fi++){const f=s.fragments[fi],key=si+'/'+fi,id=prefix+si+'-'+fi,r=threadPaths([{...s,fragments:[f]}],appearance,p=>({x:p.x,y:-p.y}))[0],opacity=threadOpacity(r)*(f.presentationOpacity??1),presentation=options.presentation?' data-boundary-continuation="true" data-presentation-layer="'+esc(f.presentationLayer||'recovery')+'" data-presentation-part="recovery"':'';if(masks.has(key)){const groups=new Map();for(const shape of masks.get(key)){if(!groups.has(shape.edge))groups.set(shape.edge,[]);groups.get(shape.edge).push(shape.d);}defs.push('<mask id="'+id+'" maskUnits="userSpaceOnUse" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'"><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="white"/>'+[...groups].map(([edge,maskPaths])=>'<path d="'+maskPaths.join(' ')+'" fill="black" stroke="black" stroke-width="'+edge+'" stroke-linejoin="round"/>').join('')+'</mask>');}paths.push('<path data-weave-family="'+esc(family)+'" data-strand-id="'+esc(s.strandId||JSON.stringify(s.identity))+'" data-fragment-id="'+esc(f.fragmentId||JSON.stringify(f.fragmentReference))+'" data-source-strand="'+si+'" data-source-fragment="'+fi+'"'+presentation+' opacity="'+opacity+'" d="'+r.d+'" stroke-width="'+threadStroke(r)+'"'+(masks.has(key)?' mask="url(#'+id+')"':'')+'/>');}}return '<defs>'+defs.join('')+'</defs>'+paths.join('');}
