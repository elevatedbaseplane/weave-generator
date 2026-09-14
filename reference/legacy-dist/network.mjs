import {tangent} from './geometry.mjs';
// Interior-biased directed graph. Min-cost flow fills feasible degree caps.
export function networkTangents(anchors,connections,mode='shape'){
 const byId=new Map(anchors.map(a=>[a.id,a])),edges=[],invalid=[];
 for(const connection of connections){
  const a=byId.get(connection.from),original=byId.get(connection.to);
  const b=mode==='external'?{...original,side:a.side}:mode==='internal'?{...original,side:-a.side}:original;
  const line=tangent(a,b);
  if(line)edges.push(line);else invalid.push({from:a.id,to:b.id});
 }
 return {edges,invalid};
}
export function insidePolygon(p,polygon){
 let inside=false;
 for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
  const a=polygon[i],b=polygon[j];
  if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)inside=!inside;
 }
 return inside;
}
export function interiorShare(a,b,polygon){
 let count=0;
 for(let k=1;k<20;k++){const t=k/20;if(insidePolygon({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t},polygon))count++;}
 return count/19;
}
function crosses(a,b,c,d){
 const orient=(p,q,r)=>(q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x);
 const ab1=orient(a,b,c),ab2=orient(a,b,d),cd1=orient(c,d,a),cd2=orient(c,d,b);
 return ((ab1>1e-8&&ab2<-1e-8)||(ab1<-1e-8&&ab2>1e-8))&&((cd1>1e-8&&cd2<-1e-8)||(cd1<-1e-8&&cd2>1e-8));
}
export function connectAnchors(anchors, from=2, to=2, seed=0, routing='mixed',participationKey=null){
 const n=anchors.length, outLimit=Math.min(n-1,Math.max(1,Math.min(10,Math.round(from)))), inLimit=Math.min(n-1,Math.max(1,Math.min(10,Math.round(to))));
 let state=(Number(seed)>>>0)+0x6d2b79f5;
 const random=()=>{state+=0x6d2b79f5;let t=state;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};
 const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
 const source=2*n,sink=source+1,graph=Array.from({length:sink+1},()=>[]),candidates=[];
 function add(a,b,cap,cost=0){const e={to:b,cap,cost,rev:graph[b].length};graph[a].push(e);graph[b].push({to:a,cap:0,cost:-cost,rev:graph[a].length-1});return e;}
 const participation=i=>Math.max(0,Number(participationKey?anchors[i][participationKey]??1:1)),scaledCap=(limit,i)=>{const weight=participation(i);return weight===0?0:Math.min(n-1,Math.max(1,Math.round(limit*weight)));};
 for(const i of shuffle(Array.from({length:n},(_,i)=>i)))add(source,i,scaledCap(outLimit,i));
 const raw=[];let longest=1;
 for(let i=0;i<n;i++)for(const j of shuffle(Array.from({length:n},(_,j)=>j).filter(j=>j!==i))){const a=anchors[i],b=anchors[j],neighbor=(i+1)%n===j||(j+1)%n===i,length=Math.hypot(a.x-b.x,a.y-b.y);longest=Math.max(longest,length);raw.push({i,j,neighbor,length,inside:interiorShare(a,b,anchors)});}
 for(const candidate of raw)candidate.crossings=raw.reduce((count,other)=>candidate.i===other.i||candidate.i===other.j||candidate.j===other.i||candidate.j===other.j?count:count+(crosses(anchors[candidate.i],anchors[candidate.j],anchors[other.i],anchors[other.j])?1:0),0);
 for(const candidate of raw){const {i,j,neighbor,length,inside,crossings}=candidate,shortness=length/longest,exterior=1-inside;let cost;
  if(routing==='short')cost=10*shortness+12*exterior+(neighbor?1:0);
  else if(routing==='long')cost=10*(1-shortness)+12*exterior+(neighbor?4:0);
  else if(routing==='crossings')cost=30*exterior+(neighbor?10:0)-2*crossings;
  else if(routing==='avoid-neighbors')cost=20*exterior+(neighbor?60:0);
  else cost=(neighbor?6:12*exterior);
  candidates.push({i,j,edge:add(i,n+j,1,cost+random()*5)});
 }
 for(let i=0;i<n;i++)add(n+i,sink,scaledCap(inLimit,i));
 while(true){
  const parent=Array(graph.length).fill(null),dist=Array(graph.length).fill(Infinity),queue=[source],queued=Array(graph.length).fill(false);dist[source]=0;queued[source]=true;
  for(let k=0;k<queue.length;k++){const u=queue[k];queued[u]=false;for(let e=0;e<graph[u].length;e++){const v=graph[u][e];if(v.cap>0&&dist[u]+v.cost<dist[v.to]-1e-9){dist[v.to]=dist[u]+v.cost;parent[v.to]=[u,e];if(!queued[v.to]){queue.push(v.to);queued[v.to]=true;}}}}
  if(!parent[sink])break;
  for(let v=sink;v!==source;){const [u,k]=parent[v],e=graph[u][k];e.cap--;graph[v][e.rev].cap++;v=u;}
 }
 const outgoing=Array(n).fill(0),incoming=Array(n).fill(0);
 const edges=candidates.filter(c=>c.edge.cap===0).map(({i,j})=>{outgoing[i]++;incoming[j]++;return {from:anchors[i].id,to:anchors[j].id,a:{x:anchors[i].x,y:anchors[i].y},b:{x:anchors[j].x,y:anchors[j].y}};}).sort((a,b)=>a.from-b.from||a.to-b.to);
 return {edges,outgoing,incoming,outLimit,inLimit,participationKey};
}
