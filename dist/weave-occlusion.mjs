import {resolveWeaveRules} from './weave-rules.mjs';
import {outlinePoints,threadStyle,threadPaths,threadStroke,threadOpacity} from './thread-appearance.mjs';
import {adaptiveContactReach,effectiveContactTension} from './contact-tension.mjs';

function distances(points){const ds=[0];for(let k=1;k<points.length;k++)ds.push(ds[k-1]+Math.hypot(points[k].x-points[k-1].x,points[k].y-points[k-1].y));return ds;}
function arcAt(points,j,t){const ds=distances(points);return ds[j]+t*(ds[j+1]-ds[j]);}
function sliceAt(points,j,t,reach){const ds=distances(points),c=ds[j]+t*(ds[j+1]-ds[j]),lo=Math.max(0,c-reach),hi=Math.min(ds.at(-1),c+reach),at=d=>{let k=1;while(k<ds.length-1&&ds[k]<d)k++;const u=(d-ds[k-1])/(ds[k]-ds[k-1]||1);return{x:points[k-1].x+u*(points[k].x-points[k-1].x),y:points[k-1].y+u*(points[k].y-points[k-1].y)}};return[at(lo),...points.filter((p,k)=>ds[k]>lo&&ds[k]<hi),at(hi)];}
const path=(points,transform)=>points.map((p,i)=>{const q=transform(p);return(i?'L':'M')+q.x+' '+q.y}).join(' ')+' Z';
const fragmentKey=side=>side.si+'/'+side.fi;
function localCurvature(points,j){const direction=(a,b)=>{const length=Math.hypot(b.x-a.x,b.y-a.y)||1;return{x:(b.x-a.x)/length,y:(b.y-a.y)/length}},current=direction(points[j],points[j+1]),values=[];if(j)values.push(direction(points[j-1],points[j]));if(j+2<points.length)values.push(direction(points[j+1],points[j+2]));return values.length?Math.max(...values.map(other=>(1-current.x*other.x-current.y*other.y)/2)):0;}

// Pairwise weave rules can form a depth cycle when three or more crossings are
// closer than their visible ribbon footprints. Only those impossible local
// cycles receive a stable presentation order; ordinary assignments are untouched.
function coherentAssignments(strands,result,settings,appearance,source){
 const assignments=resolveWeaveRules(strands,result,settings,source),records=[],byFragment=new Map();
 const add=(key,item)=>{if(!byFragment.has(key))byFragment.set(key,[]);byFragment.get(key).push(item);};
 for(const ev of result.events){
  if(ev.ambiguous||!assignments.has(ev.id))continue;
  const a=strands[ev.a.si],b=strands[ev.b.si],ap=a.fragments[ev.a.fi].points,bp=b.fragments[ev.b.fi].points,adx=ap[ev.a.j+1].x-ap[ev.a.j].x,ady=ap[ev.a.j+1].y-ap[ev.a.j].y,bdx=bp[ev.b.j+1].x-bp[ev.b.j].x,bdy=bp[ev.b.j+1].y-bp[ev.b.j].y,den=Math.hypot(adx,ady)*Math.hypot(bdx,bdy),sin=Math.abs(adx*bdy-ady*bdx)/den,cos=Math.abs(adx*bdx+ady*bdy)/den;
  if(!sin)continue;
  const as=threadStyle(appearance,a.family||a.identity?.roleId),bs=threadStyle(appearance,b.family||b.identity?.roleId),aw=as.width+(as.mode==='outline'?threadStroke(as):0),bw=bs.width+(bs.mode==='outline'?threadStroke(bs):0),record={ev,aKey:fragmentKey(ev.a),bKey:fragmentKey(ev.b),aArc:arcAt(ap,ev.a.j,ev.a.t),bArc:arcAt(bp,ev.b.j,ev.b.t),aReach:(bw/2+aw*cos/2)/sin+threadStroke(bs),bReach:(aw/2+bw*cos/2)/sin+threadStroke(as),index:records.length};
  records.push(record);add(record.aKey,{index:record.index,arc:record.aArc,reach:record.aReach});add(record.bKey,{index:record.index,arc:record.bArc,reach:record.bReach});
 }
 const parent=records.map((_,i)=>i),find=i=>parent[i]===i?i:(parent[i]=find(parent[i])),join=(a,b)=>{a=find(a);b=find(b);if(a!==b)parent[b]=a;};
 for(const list of byFragment.values()){list.sort((a,b)=>a.arc-b.arc);for(let i=1;i<list.length;i++)if(list[i].arc-list[i-1].arc<=list[i].reach+list[i-1].reach)join(list[i].index,list[i-1].index);}
 const components=new Map();for(const record of records){const root=find(record.index);if(!components.has(root))components.set(root,[]);components.get(root).push(record);}
 const manual=new Set(settings.source===source?(settings.overrides||[]).map(([id])=>id):[]);
 for(const component of components.values()){
  if(component.length<3)continue;
  const nodes=[...new Set(component.flatMap(record=>[record.aKey,record.bKey]))].sort(),edges=component.map(record=>{const aOver=assignments.get(record.ev.id);return{record,over:aOver?record.aKey:record.bKey,under:aOver?record.bKey:record.aKey,weight:manual.has(record.ev.id)?1000:1};}),indegree=new Map(nodes.map(node=>[node,0])),outgoing=new Map(nodes.map(node=>[node,[]]));
  for(const edge of edges)if(edge.over!==edge.under){indegree.set(edge.under,indegree.get(edge.under)+1);outgoing.get(edge.over).push(edge.under);}
  const queue=nodes.filter(node=>indegree.get(node)===0),visited=[];while(queue.length){queue.sort();const node=queue.shift();visited.push(node);for(const next of outgoing.get(node)){indegree.set(next,indegree.get(next)-1);if(indegree.get(next)===0)queue.push(next);}}
  if(visited.length===nodes.length)continue;
  const score=new Map(nodes.map(node=>[node,0]));for(const edge of edges){score.set(edge.over,score.get(edge.over)+edge.weight);score.set(edge.under,score.get(edge.under)-edge.weight);}
  const order=[...nodes].sort((a,b)=>score.get(b)-score.get(a)||a.localeCompare(b)),rank=new Map(order.map((node,index)=>[node,index]));
  for(const {record} of edges)assignments.set(record.ev.id,rank.get(record.aKey)<rank.get(record.bKey));
 }
 return assignments;
}

// Masks hide underlying ink at the actual upper ribbon edge. They create no cap,
// detached fragment or geometry mutation.
export function weaveOcclusions(strands,result,settings,appearance,source,transform=p=>p){
 const masks=new Map();if(!settings?.enabled||!result?.complete)return masks;
 const assignments=coherentAssignments(strands,result,settings,appearance,source),contact=effectiveContactTension(settings),records=[],byUnder=new Map();
 for(const ev of result.events){
  if(ev.ambiguous||!assignments.has(ev.id))continue;
  const aOver=assignments.get(ev.id),over=aOver?ev.a:ev.b,under=aOver?ev.b:ev.a,top=strands[over.si],bottom=strands[under.si],p=top.fragments[over.fi].points,q=bottom.fragments[under.fi].points,dx=p[over.j+1].x-p[over.j].x,dy=p[over.j+1].y-p[over.j].y,ux=q[under.j+1].x-q[under.j].x,uy=q[under.j+1].y-q[under.j].y,den=Math.hypot(dx,dy)*Math.hypot(ux,uy),sin=Math.abs(dx*uy-dy*ux)/den,cos=Math.abs(dx*ux+dy*uy)/den;
  if(!sin)continue;
  const ts=threadStyle(appearance,top.family||top.identity?.roleId),bs=threadStyle(appearance,bottom.family||bottom.identity?.roleId),topWidth=ts.width+(ts.mode==='outline'?threadStroke(ts):0),bottomWidth=bs.width+(bs.mode==='outline'?threadStroke(bs):0),baseReach=(bottomWidth/2+topWidth*cos/2)/sin+threadStroke(ts),key=fragmentKey(under),record={over,under,p,q,ts,key,arc:arcAt(q,under.j,under.t),baseReach,topWidth,sin,curvature:localCurvature(q,under.j)};
  records.push(record);if(!byUnder.has(key))byUnder.set(key,[]);byUnder.get(key).push(record);
 }
 for(const list of byUnder.values()){list.sort((a,b)=>a.arc-b.arc);for(let index=0;index<list.length;index++){const before=index?list[index].arc-list[index-1].arc:Infinity,after=index+1<list.length?list[index+1].arc-list[index].arc:Infinity;list[index].nearest=Math.min(before,after);list[index].neighborCount=Number(Number.isFinite(before))+Number(Number.isFinite(after));}}
 for(const record of records){
  const reach=adaptiveContactReach(record.baseReach,record.topWidth,{nearest:record.nearest,neighborCount:record.neighborCount,sin:record.sin,curvature:record.curvature},contact),polygon=outlinePoints(sliceAt(record.p,record.over.j,record.over.t,reach),record.ts.width);
  if(!masks.has(record.key))masks.set(record.key,[]);masks.get(record.key).push({d:path(polygon,transform),edge:record.ts.mode==='outline'?threadStroke(record.ts):0});
 }
 return masks;
}

const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
export function continuousWeaveSvg(strands,result,settings,appearance,source,boundary,options={}){const masks=weaveOcclusions(strands,result,settings,appearance,source,p=>({x:p.x,y:-p.y})),xs=boundary.points.map(p=>p.x),ys=boundary.points.map(p=>-p.y),extent=Math.max(Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys)),pad=Math.max(50,extent*.15),x=Math.min(...xs)-pad,y=Math.min(...ys)-pad,w=Math.max(...xs)-Math.min(...xs)+2*pad,h=Math.max(...ys)-Math.min(...ys)+2*pad,defs=[],paths=[],prefix=options.idPrefix||'occlusion-';for(let si=0;si<strands.length;si++){const s=strands[si],family=s.family||s.identity?.roleId;for(let fi=0;fi<s.fragments.length;fi++){const f=s.fragments[fi],key=si+'/'+fi,id=prefix+si+'-'+fi,r=threadPaths([{...s,fragments:[f]}],appearance,p=>({x:p.x,y:-p.y}))[0],opacity=threadOpacity(r)*(f.presentationOpacity??1),presentation=options.presentation?' data-boundary-continuation="true" data-presentation-layer="'+esc(f.presentationLayer||'recovery')+'" data-presentation-part="recovery"':'';if(masks.has(key)){const groups=new Map();for(const shape of masks.get(key)){if(!groups.has(shape.edge))groups.set(shape.edge,[]);groups.get(shape.edge).push(shape.d);}defs.push('<mask id="'+id+'" maskUnits="userSpaceOnUse" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'"><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="white"/>'+[...groups].map(([edge,maskPaths])=>'<path d="'+maskPaths.join(' ')+'" fill="black" stroke="black" stroke-width="'+edge+'" stroke-linejoin="round"/>').join('')+'</mask>');}paths.push('<path data-weave-family="'+esc(family)+'" data-strand-id="'+esc(s.strandId||JSON.stringify(s.identity))+'" data-fragment-id="'+esc(f.fragmentId||JSON.stringify(f.fragmentReference))+'" data-source-strand="'+si+'" data-source-fragment="'+fi+'"'+presentation+' opacity="'+opacity+'" d="'+r.d+'" stroke-width="'+threadStroke(r)+'"'+(masks.has(key)?' mask="url(#'+id+')"':'')+'/>');}}return '<defs>'+defs.join('')+'</defs>'+paths.join('');}
