import {validateBoundaryRecord} from './boundary.mjs';

export const CARRIER_LIMITS=Object.freeze({candidateLines:2000,intervals:20000,lineEdgeTests:2000000});
const clone=value=>structuredClone(value);
const cross=(a,b)=>a.x*b.y-a.y*b.x;
const sub=(a,b)=>({x:a.x-b.x,y:a.y-b.y});
const dot=(a,b)=>a.x*b.x+a.y*b.y;
const point=(p0,d,t)=>({x:p0.x+d.x*t,y:p0.y+d.y*t});
const mod=(n,m)=>((n%m)+m)%m;

export function createRectangularCarrier(carrierId=`carrier-${crypto.randomUUID()}`){
  return {id:carrierId,kind:'rectangular',generatorVersion:'rect-v1',clipVersion:'polygon-line-v1',selectionVersion:'density-v1',origin:{x:0,y:0},angleDegrees:0,families:{A:{spacing:50,offset:0,density:100},B:{spacing:50,offset:0,density:100}}};
}

export function validateCarrierRecipe(value){
  if(!value||typeof value.id!=='string'||!value.id||value.id.length>120||value.kind!=='rectangular'||value.generatorVersion!=='rect-v1'||value.clipVersion!=='polygon-line-v1'||value.selectionVersion!=='density-v1')throw new Error('Invalid rectangular carrier recipe.');
  if(!Number.isFinite(value.origin?.x)||!Number.isFinite(value.origin?.y)||Math.abs(value.origin.x)>1e9||Math.abs(value.origin.y)>1e9)throw new Error('Invalid carrier origin.');
  if(!Number.isFinite(value.angleDegrees)||value.angleDegrees < -180||value.angleDegrees > 180)throw new Error('Carrier rotation must be between −180° and 180°.');
  for(const family of ['A','B']){
    const f=value.families?.[family];
    if(!Number.isFinite(f?.spacing)||f.spacing<=0||f.spacing>1e9)throw new Error(`${family} spacing must be greater than zero.`);
    if(!Number.isFinite(f.offset)||Math.abs(f.offset)>1e9)throw new Error(`${family} offset is outside the supported range.`);
    if(!Number.isInteger(f.density)||f.density<1||f.density>100)throw new Error(`${family} density must be an integer from 1 to 100.`);
  }
  return value;
}

export const densityRetains=(k,density)=>(37*mod(k,100))%100<density;

export function carrierTolerance(boundary){
  const pts=boundary.points,maxAbs=Math.max(1,...pts.flatMap(p=>[Math.abs(p.x),Math.abs(p.y)]));
  const xs=pts.map(p=>p.x),ys=pts.map(p=>p.y),extent=Math.max(Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys));
  return Math.max(1e-8,64*Number.EPSILON*Math.max(1,maxAbs,extent));
}

function canonical(value){
  if(Array.isArray(value))return `[${value.map(canonical).join(',')}]`;
  if(value&&typeof value==='object')return `{${Object.keys(value).sort().map(k=>`${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`;
  return JSON.stringify(value);
}
function fnv64(text){let h=14695981039346656037n;for(let i=0;i<text.length;i++){h^=BigInt(text.charCodeAt(i));h=BigInt.asUintN(64,h*1099511628211n);}return h.toString(16).padStart(16,'0');}
export function carrierInputFingerprint(boundary,carrier){
  validateBoundaryRecord(boundary);validateCarrierRecipe(carrier);
  return `carrier-${fnv64(canonical({points:boundary.points,closed:true,carrier:{kind:carrier.kind,generatorVersion:carrier.generatorVersion,clipVersion:carrier.clipVersion,selectionVersion:carrier.selectionVersion,origin:carrier.origin,angleDegrees:carrier.angleDegrees,families:carrier.families}}))}`;
}

function onSegment(p,a,b,tau){
  const e=sub(b,a),len=Math.hypot(e.x,e.y);if(!len)return false;
  return Math.abs(cross(sub(p,a),e))/len<=tau&&dot(sub(p,a),sub(p,b))<=tau*tau;
}
function insideStrict(p,points,tau){
  for(let i=0;i<points.length;i++)if(onSegment(p,points[i],points[(i+1)%points.length],tau))return false;
  let inside=false;
  for(let i=0,j=points.length-1;i<points.length;j=i++){
    const a=points[i],b=points[j];
    if(((a.y>p.y)!==(b.y>p.y))&&(p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x))inside=!inside;
  }
  return inside;
}
function mergeCuts(cuts,tau){
  cuts.sort((a,b)=>a.t-b.t);const out=[];
  for(const cut of cuts){const last=out.at(-1);if(last&&Math.abs(last.t-cut.t)<=tau){last.t=(last.t+cut.t)/2;last.edges.push(...cut.edges);last.vertexContact ||= cut.vertexContact;}else out.push({t:cut.t,edges:[...cut.edges],vertexContact:cut.vertexContact});}
  return out;
}
function clipLine(points,p0,d,tau){
  const cuts=[],contacts=[];
  for(let i=0;i<points.length;i++){
    const a=points[i],b=points[(i+1)%points.length],e=sub(b,a),den=cross(d,e),edgeLength=Math.hypot(e.x,e.y),q=sub(a,p0);
    if(Math.abs(den)<=64*Number.EPSILON*Math.max(1,edgeLength)){
      if(Math.abs(cross(q,d))<=tau){contacts.push({type:'collinear-overlap',edgeIndex:i});cuts.push({t:dot(q,d),edges:[i],vertexContact:true},{t:dot(sub(b,p0),d),edges:[i],vertexContact:true});}
      continue;
    }
    const t=cross(q,e)/den,s=cross(q,d)/den,stau=tau/Math.max(1,edgeLength);
    if(s>=-stau&&s<=1+stau)cuts.push({t,edges:[i],vertexContact:s<=stau||s>=1-stau});
  }
  const merged=mergeCuts(cuts,tau),intervals=[];
  for(let i=0;i<merged.length-1;i++){
    const lo=merged[i],hi=merged[i+1];if(hi.t-lo.t<=tau)continue;
    const mid=point(p0,d,(lo.t+hi.t)/2);if(!insideStrict(mid,points,tau))continue;
    intervals.push({t0:lo.t,t1:hi.t,start:point(p0,d,lo.t),end:point(p0,d,hi.t),startProvenance:{edgeIndexes:[...new Set(lo.edges)].sort((a,b)=>a-b),vertexContact:lo.vertexContact,t:lo.t},endProvenance:{edgeIndexes:[...new Set(hi.edges)].sort((a,b)=>a-b),vertexContact:hi.vertexContact,t:hi.t}});
  }
  return {intervals,contacts};
}

export function deriveCarrier(boundary,carrier,boardId){
  boundary=validateBoundaryRecord(boundary);carrier=validateCarrierRecipe(carrier);
  if(typeof boardId!=='string'||!boardId)throw new Error('A board identity is required for carrier paths.');
  const tau=carrierTolerance(boundary),documentPoints=boundary.points,xs=documentPoints.map(p=>p.x),ys=documentPoints.map(p=>p.y),center={x:(Math.min(...xs)+Math.max(...xs))/2,y:(Math.min(...ys)+Math.max(...ys))/2},points=documentPoints.map(p=>sub(p,center)),localOrigin=sub(carrier.origin,center);
  for(const family of ['A','B'])if(carrier.families[family].spacing<=100*tau)throw new Error(`${family} spacing is too small for this boundary scale.`);
  const rad=carrier.angleDegrees*Math.PI/180,u={x:Math.cos(rad),y:Math.sin(rad)},v={x:-Math.sin(rad),y:Math.cos(rad)};
  const defs={A:{direction:u,normal:v},B:{direction:v,normal:{x:-u.x,y:-u.y}}};
  const specs=[],candidateCounts={A:0,B:0};
  for(const family of ['A','B']){
    const {direction,normal}=defs[family],f=carrier.families[family];
    const projections=points.map(p=>dot(sub(p,localOrigin),normal)),min=Math.min(...projections),max=Math.max(...projections),indexTolerance=tau/f.spacing;
    const k0=Math.ceil((min-f.offset)/f.spacing-indexTolerance),k1=Math.floor((max-f.offset)/f.spacing+indexTolerance);candidateCounts[family]=Math.max(0,k1-k0+1);
    for(let k=k0;k<=k1;k++){const signed=k*f.spacing+f.offset;specs.push({family,k,direction,normal,p0:{x:localOrigin.x+normal.x*signed,y:localOrigin.y+normal.y*signed}});}
  }
  if(specs.length>CARRIER_LIMITS.candidateLines)throw new Error('This carrier would exceed the 2,000 source-line limit.');
  if(specs.length*points.length>CARRIER_LIMITS.lineEdgeTests)throw new Error('This carrier would exceed the line-edge test limit.');
  const fingerprint=carrierInputFingerprint(boundary,carrier),paths=[],contacts=[];let intervalCount=0;
  for(const spec of specs){
    const clipped=clipLine(points,spec.p0,spec.direction,tau);contacts.push(...clipped.contacts.map(c=>({...c,family:spec.family,k:spec.k})));
    if(!clipped.intervals.length)continue;
    intervalCount+=clipped.intervals.length;if(intervalCount>CARRIER_LIMITS.intervals)throw new Error('This carrier would exceed the 20,000 clipped-interval limit.');
    const key={boardId,carrierId:carrier.id,family:spec.family,k:spec.k},id=`${boardId}:${carrier.id}:${spec.family}:${spec.k}`;
    const intervals=clipped.intervals.map((item,index)=>({...item,start:{x:item.start.x+center.x,y:item.start.y+center.y},end:{x:item.end.x+center.x,y:item.end.y+center.y},index,fragmentKey:`${fingerprint}:${id}:${index}`}));
    paths.push({id,pathKey:key,family:spec.family,k:spec.k,origin:{x:spec.p0.x+center.x,y:spec.p0.y+center.y},direction:clone(spec.direction),selected:densityRetains(spec.k,carrier.families[spec.family].density),intervals});
  }
  paths.sort((a,b)=>a.family.localeCompare(b.family)||a.k-b.k);
  const counts={};for(const family of ['A','B']){const available=paths.filter(p=>p.family===family).length,retained=paths.filter(p=>p.family===family&&p.selected).length;counts[family]={retained,available,candidates:candidateCounts[family]};}
  return {inputFingerprint:fingerprint,versions:{generator:carrier.generatorVersion,clip:carrier.clipVersion,selection:carrier.selectionVersion},paths,diagnostics:{tau,counts,candidateLines:specs.length,intervals:intervalCount,lineEdgeTests:specs.length*points.length,contacts,complete:true},complete:true};
}
