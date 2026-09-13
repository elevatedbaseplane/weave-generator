export const TAU=Math.PI*2;
const add=(a,b)=>({x:a.x+b.x,y:a.y+b.y});
const sub=(a,b)=>({x:a.x-b.x,y:a.y-b.y});
const mul=(a,k)=>({x:a.x*k,y:a.y*k});
const dot=(a,b)=>a.x*b.x+a.y*b.y;
const rot=a=>({x:-a.y,y:a.x});
const mod=a=>(a%TAU+TAU)%TAU;
export const samples={
  'Fold':[[190,160],[580,160],[645,565],[540,565],[430,360],[325,545],[210,555],[385,285]],
  'Notch':[[220,160],[590,160],[590,560],[220,560],[375,360]],
  'Triangle':[[410,155],[640,555],[180,555]]
};
export function anchorsFromPoints(points,convexRadius=34,concaveRadius=24){
 const clean=[];for(const point of points){const p=Array.isArray(point)?{x:Number(point[0]),y:Number(point[1])}:{x:Number(point.x),y:Number(point.y)};if(Number.isFinite(p.x)&&Number.isFinite(p.y)&&(!clean.length||Math.hypot(p.x-clean.at(-1).x,p.y-clean.at(-1).y)>1e-9))clean.push(p);}
 if(clean.length>1&&Math.hypot(clean[0].x-clean.at(-1).x,clean[0].y-clean.at(-1).y)<1e-9)clean.pop();
 if(clean.length<3)throw new Error('A polygon needs at least three unique points.');
 const pts=clean.map((p,i)=>({...p,id:i+1}));
 const area=pts.reduce((a,p,i)=>{const q=pts[(i+1)%pts.length];return a+p.x*q.y-q.x*p.y;},0);
 if(Math.abs(area)<1e-9)throw new Error('The polygon has no measurable area.');
 return pts.map((p,i)=>{const a=sub(p,pts[(i+pts.length-1)%pts.length]),b=sub(pts[(i+1)%pts.length],p);const convex=(a.x*b.y-a.y*b.x)*Math.sign(area)>0;return {...p,kind:convex?'convex':'concave',side:convex?Math.sign(area):-Math.sign(area),radius:convex?convexRadius:concaveRadius,locked:false,override:false,tangentParticipation:1,centerParticipation:1};});
}
export function makeAnchors(name='Fold'){
 return anchorsFromPoints(samples[name]);
}
export function bounds(points,pad=0){
 const xs=points.map(p=>p.x),ys=points.map(p=>p.y),minX=Math.min(...xs)-pad,minY=Math.min(...ys)-pad,maxX=Math.max(...xs)+pad,maxY=Math.max(...ys)+pad;
 return {minX,minY,maxX,maxY,width:maxX-minX||1,height:maxY-minY||1};
}
export function fitAnchors(anchors,box={x:115,y:110,width:590,height:500}){
 const b=bounds(anchors),scale=Math.min(box.width/b.width,box.height/b.height),tx=box.x+(box.width-b.width*scale)/2-b.minX*scale,ty=box.y+(box.height-b.height*scale)/2-b.minY*scale;
 return {anchors:anchors.map(a=>({...a,x:a.x*scale+tx,y:a.y*scale+ty,radius:a.radius*scale})),transform:{scale,tx,ty,bounds:b}};
}
// Directed common tangent. The circle's side specifies the arc traversal sign.
export function tangent(a,b){
 const d=sub(b,a),len=Math.hypot(d.x,d.y),q=a.side/b.side;
 if(len<1e-8)return null;
 const k=(a.radius-q*b.radius)/len;
 if(Math.abs(k)>=1-1e-9)return null;
 const u=mul(d,1/len),h=Math.sqrt(1-k*k);
 for(const z of [1,-1]){const n=add(mul(u,k),mul(rot(u),z*h));const p=add(a,mul(n,a.radius)),end=add(b,mul(n,q*b.radius));if(dot(sub(end,p),mul(rot(n),a.side))>0)return {a:p,b:end,n1:n,n2:mul(n,q),from:a.id,to:b.id};}
 return null;
}
export function solve(anchors){
 const edges=anchors.map((a,i)=>tangent(a,anchors[(i+1)%anchors.length]));
 const arcs=anchors.map((a,i)=>{const e=edges[(i+anchors.length-1)%anchors.length],f=edges[i];if(!e||!f)return null;const start=Math.atan2(e.n2.y,e.n2.x),end=Math.atan2(f.n1.y,f.n1.x),delta=a.side*mod(a.side*(end-start));return {center:a,start,delta,from:e.b,to:f.a,radius:a.radius,side:a.side};});
 const invalid=edges.flatMap((e,i)=>e?[]:[i]);
 const num=n=>Number(n.toFixed(5));
 const coord=p=>`${num(p.x)} ${num(p.y)}`;
 const arcPath=a=>a.radius<1e-8?`L ${coord(a.to)}`:`A ${num(a.radius)} ${num(a.radius)} 0 ${Math.abs(a.delta)>Math.PI?1:0} ${a.side>0?1:0} ${coord(a.to)}`;
 let path='';if(!invalid.length){path=`M ${coord(arcs[0].from)} `;for(let i=0;i<anchors.length;i++)path+=`${arcPath(arcs[i])} L ${coord(edges[i].b)} `;path+='Z';}
 const points=[];if(!invalid.length){arcs.forEach(a=>{const n=Math.max(2,Math.ceil(Math.abs(a.delta)*24));for(let i=0;i<=n;i++){const ang=a.start+a.delta*i/n;points.push({x:a.center.x+a.radius*Math.cos(ang),y:a.center.y+a.radius*Math.sin(ang)});}});}
 let crosses=false;const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
 for(let i=0;i<points.length&&!crosses;i++){const a=points[i],b=points[(i+1)%points.length];for(let j=i+2;j<points.length;j++){if(i===0&&j===points.length-1)continue;const c=points[j],d=points[(j+1)%points.length];if(cross(a,b,c)*cross(a,b,d)<-1e-6&&cross(c,d,a)*cross(c,d,b)<-1e-6){crosses=true;break;}}}
 return {edges,arcs,path,invalid,crosses,arcPaths:arcs.map(a=>a?`M ${coord(a.from)} ${arcPath(a)}`:'')};
}
export function seeded(seed){let h=2166136261;for(const c of String(seed)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return ()=>{h+=0x6D2B79F5;let t=h;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
export function randomize(base,seed,amount,mode='both'){
 const rng=seeded(seed),v=amount/100;
 return base.map(a=>{const rr=rng(),ss=rng();return a.locked?{...a}:{...a,radius:mode==='wrap'?a.radius:Math.max(0,Math.round(a.radius*(1+(rr*2-1)*v*.85))),side:mode==='radius'?a.side:(ss<v*.45?-a.side:a.side)};});
}
