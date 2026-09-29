// Shared derived analysis. These measurements describe the pinned centerlines.
// They are not WV-01–WV-05 ratings.
import {evaluationReadinessReport,migrateEvaluationProvenance,resolveAnalysisGeometry,appendAnalysisRun,createAnalysisRun} from './weave-record.mjs';
import {digest} from './weave.mjs';

export const ANALYSIS_GRID=40;
export const ANALYSIS_TOLERANCE_VERSION='analysis-tolerance-v1';
export const SUBSET_ANALYSIS_VERSION='counterfactual-signature-v1';
export const ANALYSIS_MODULE_VERSIONS=Object.freeze({
 presence:'family-presence-v1',
 directional:'directional-v1',
 rhythmic:'rhythmic-v1',
 modulation:'modulation-v1',
 events:'relational-events-v1',
 interstitial:'interstitial-v1'
});
const MODULE_ORDER=['presence','directional','rhythmic','modulation','events','interstitial'];
const MODULE_LABELS={presence:'FAMILY PRESENCE',directional:'DIRECTION',rhythmic:'RHYTHM',modulation:'MODULATION',events:'RELATIONAL EVENTS',interstitial:'INTERSTITIAL GEOMETRY'};
const MODULE_STATUS_LABELS={not_run:'NOT RUN',running:'RUNNING',complete:'COMPLETE',failed:'FAILED',unavailable:'UNAVAILABLE',not_applicable:'NOT APPLICABLE'};
const cache=new Map();

const clean=value=>Object.is(value,-0)?0:value;
const clamp=(value,lo,hi)=>Math.min(hi,Math.max(lo,value));
const axial=degrees=>{let angle=degrees%180;if(angle<0)angle+=180;return angle;};
const orientationDifference=(a,b)=>{const delta=Math.abs(axial(a)-axial(b));return Math.min(delta,180-delta);};

function median(values){
 if(!values.length)return null;
 const sorted=[...values].sort((a,b)=>a-b),mid=Math.floor(sorted.length/2);
 return sorted.length%2?sorted[mid]:(sorted[mid-1]+sorted[mid])/2;
}
function percentile(values,p){
 if(!values.length)return null;
 const sorted=[...values].sort((a,b)=>a-b),index=(sorted.length-1)*p,lo=Math.floor(index),hi=Math.ceil(index);
 return sorted[lo]+(sorted[hi]-sorted[lo])*(index-lo);
}
function polygonArea(points){
 let sum=0;
 for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];sum+=a.x*b.y-b.x*a.y;}
 return Math.abs(sum)/2;
}
function pointSegmentDistance(point,a,b){
 const dx=b.x-a.x,dy=b.y-a.y,length=dx*dx+dy*dy;
 if(length===0)return Math.hypot(point.x-a.x,point.y-a.y);
 const t=clamp(((point.x-a.x)*dx+(point.y-a.y)*dy)/length,0,1);
 return Math.hypot(point.x-(a.x+dx*t),point.y-(a.y+dy*t));
}
function insidePolygon(point,polygon){
 let inside=false;
 for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
  const a=polygon[i],b=polygon[j];
  if((a.y>point.y)!==(b.y>point.y)&&(point.x<(b.x-a.x)*(point.y-a.y)/(b.y-a.y)+a.x))inside=!inside;
 }
 return inside;
}
function segmentCrossing(a,b,c,d){
 const r={x:b.x-a.x,y:b.y-a.y},s={x:d.x-c.x,y:d.y-c.y},den=r.x*s.y-r.y*s.x;
 if(Math.abs(den)<1e-12)return null;
 const q={x:c.x-a.x,y:c.y-a.y},t=(q.x*s.y-q.y*s.x)/den,u=(q.x*r.y-q.y*r.x)/den;
 if(t<-1e-8||t>1+1e-8||u<-1e-8||u>1+1e-8)return null;
 return {x:a.x+r.x*t,y:a.y+r.y*t};
}
function properHit(a,b,c,d){
 const hit=segmentCrossing(a,b,c,d);
 if(!hit)return false;
 const dx=b.x-a.x,dy=b.y-a.y,len=dx*dx+dy*dy;
 if(len===0)return false;
 const t=((hit.x-a.x)*dx+(hit.y-a.y)*dy)/len;
 return t>1e-6&&t<1-1e-6;
}
function segmentAngle(a,b,c,d){
 let degrees=Math.abs(Math.atan2(b.y-a.y,b.x-a.x)-Math.atan2(d.y-c.y,d.x-c.x))*180/Math.PI;
 degrees%=180;
 return degrees>90?180-degrees:degrees;
}
function interpolate(value,anchors){
 if(value<=anchors[0][0])return anchors[0][1];
 if(value>=anchors.at(-1)[0])return anchors.at(-1)[1];
 for(let i=1;i<anchors.length;i++){
  const [x0,y0]=anchors[i-1],[x1,y1]=anchors[i];
  if(value<=x1)return y0+(y1-y0)*(value-x0)/(x1-x0);
 }
 return anchors.at(-1)[1];
}
function crossingLegibility(degrees){return interpolate(degrees,[[0,0],[5,.25],[10,.6],[20,1],[90,1]]);}
function shiftStrength(degrees){
 if(degrees<10)return 0;
 if(degrees<20)return .25+(degrees-10)/10*.2;
 if(degrees<40)return .45+(degrees-20)/20*.3;
 return Math.min(1,.75+(degrees-40)/20*.25);
}
function presenceValue(count,relative){
 if(count<2||!(relative>0))return 0;
 if(relative<=.15)return 0;
 if(relative<=.3)return (relative-.15)/.15*.5;
 if(relative<=.5)return .5+(relative-.3)/.2*.5;
 return 1;
}

// Same displacement as combined.mjs `contribution`, summed from the original
// point in influence-id order. Tension and falloff stay inside this function.
function contribution(point,field,response){
 if(!field.enabled||response.strength===0||response.tension===100)return {x:0,y:0};
 const dx=point.x-field.center.x,dy=point.y-field.center.y,s=(dx*dx+dy*dy)/(field.radius*field.radius);
 if(s>=1)return {x:0,y:0};
 const tension=response.tension/100,weight=(1-s)**(field.falloff??3)*(1+tension*s);
 if(field.kind==='deflector'){
  const angle=field.direction*Math.PI/180,scale=.2*field.radius*response.strength/100*(1-tension);
  return {x:scale*weight*Math.cos(angle),y:scale*weight*Math.sin(angle)};
 }
 const scale=(field.kind==='attractor'?-1:1)*.8*response.strength/100*(1-tension);
 return {x:scale*weight*dx,y:scale*weight*dy};
}
export function generatorInfluenceDisplacement(point,influences,familyKey){
 let x=0,y=0;
 const parts=[];
 for(const field of [...(influences||[])].sort((a,b)=>String(a.id).localeCompare(String(b.id)))){
  const response=field.families?.[familyKey],vector=response?contribution(point,field,response):{x:0,y:0};
  parts.push({id:field.id,x:vector.x,y:vector.y});
  x+=vector.x;y+=vector.y;
 }
 return {x:clean(x),y:clean(y),parts};
}

function boundsOf(points){
 const xs=points.map(point=>point.x),ys=points.map(point=>point.y);
 return {minX:Math.min(...xs),maxX:Math.max(...xs),minY:Math.min(...ys),maxY:Math.max(...ys)};
}
function sampleGrid(boundary,grid){
 if(!Array.isArray(boundary)||boundary.length<3)throw new Error('Analysis needs a boundary.');
 const bounds=boundsOf(boundary),width=bounds.maxX-bounds.minX,height=bounds.maxY-bounds.minY;
 if(!(width>0)||!(height>0))throw new Error('Analysis needs a boundary with area.');
 const samples=[];
 for(let row=0;row<grid;row++)for(let col=0;col<grid;col++){
  const point={x:bounds.minX+(col+.5)*width/grid,y:bounds.minY+(row+.5)*height/grid,row,col};
  if(insidePolygon(point,boundary))samples.push(point);
 }
 return {samples,bounds,cellWidth:width/grid,cellHeight:height/grid,grid};
}
function strandSegments(strand){
 const segments=[];
 for(const fragment of strand.fragments||[]){
  const points=fragment.points||[];
  for(let i=1;i<points.length;i++){
   const a=points[i-1],b=points[i];
   if(Math.hypot(b.x-a.x,b.y-a.y)>1e-9)segments.push({a,b,strand});
  }
 }
 return segments;
}
function polylineLength(points){
 let length=0;
 for(let i=1;i<points.length;i++)length+=Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y);
 return length;
}
function pointAlong(points,distance){
 let left=distance;
 for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i],span=Math.hypot(b.x-a.x,b.y-a.y);
  if(span>=left){const t=span?left/span:0;return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,tangent:Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI};}
  left-=span;
 }
 const a=points.at(-2),b=points.at(-1);
 return {x:b.x,y:b.y,tangent:Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI};
}
function strandPoints(strand){
 const points=[];
 for(const fragment of strand.fragments||[])for(const point of fragment.points||[]){
  if(!points.length||Math.hypot(point.x-points.at(-1).x,point.y-points.at(-1).y)>1e-9)points.push(point);
 }
 return points;
}
function nearestSegment(point,segments){
 let best=null;
 for(const segment of segments){
  const distance=pointSegmentDistance(point,segment.a,segment.b);
  if(!best||distance<best.distance)best={distance,segment};
 }
 return best;
}
function measuredSpacing(family,strands){
 if(!Number.isFinite(family.angleDegrees)||strands.length<2)return null;
 const angle=family.angleDegrees*Math.PI/180,normal={x:-Math.sin(angle),y:Math.cos(angle)};
 const places=strands.map(strand=>{
  const points=strandPoints(strand);
  const mid=points[Math.floor(points.length/2)]||points[0];
  return mid?mid.x*normal.x+mid.y*normal.y:null;
 }).filter(Number.isFinite).sort((a,b)=>a-b);
 const gaps=[];
 for(let i=1;i<places.length;i++)if(places[i]-places[i-1]>1e-6)gaps.push(places[i]-places[i-1]);
 return median(gaps);
}
function meanAxial(angles){
 if(!angles.length)return null;
 let x=0,y=0;
 for(const angle of angles){const radians=axial(angle)*Math.PI/90;x+=Math.cos(radians);y+=Math.sin(radians);}
 return axial(Math.atan2(y,x)*90/Math.PI);
}

function prepare(field,grid){
 const sampled=sampleGrid(field.boundary,grid);
 const strands=(field.strands||[]).map(strand=>({...strand,points:strandPoints(strand)})).filter(strand=>strand.points.length>1);
 const segments=strands.flatMap(strandSegments);
 const counts=new Map();
 for(const strand of strands)counts.set(strand.familyId,(counts.get(strand.familyId)||0)+1);
 const families=(field.families||[]).map(family=>{
  const members=strands.filter(strand=>strand.familyId===family.familyId);
  const angles=members.flatMap(strand=>strandSegments(strand).map(segment=>Math.atan2(segment.b.y-segment.a.y,segment.b.x-segment.a.x)*180/Math.PI));
  const spacing=Number.isFinite(family.spacing)?family.spacing:measuredSpacing(family,members);
  return {...family,retainedStrandCount:counts.get(family.familyId)||0,spacing,measuredAngle:meanAxial(angles),spacingSource:Number.isFinite(family.spacing)?'authored':'measured'};
 });
 const spacings=families.map(family=>family.spacing).filter(value=>Number.isFinite(value)&&value>0);
 return {...sampled,strands,segments,families,characteristicSpacing:median(spacings),characteristicLength:Math.sqrt(polygonArea(field.boundary)),area:polygonArea(field.boundary)};
}

function familyPresence(field,context){
 const counts=context.families.map(family=>family.retainedStrandCount);
 const middle=median(counts.filter(count=>count>0));
 const rows=context.families.map(family=>{
  const relative=middle>0?family.retainedStrandCount/middle:null;
  return {familyId:family.familyId,key:family.key,retainedStrandCount:family.retainedStrandCount,relativeCount:relative,presence:presenceValue(family.retainedStrandCount,relative)};
 });
 return {summary:{familyCount:rows.length,weakPresenceCount:rows.filter(row=>row.presence<.4).length},detail:{families:rows,weightBasis:'retained-strand-count'}};
}
function directionalEvidence(field,context){
 const histogram=Array.from({length:18},()=>0);
 for(const segment of context.segments){
  const bin=Math.min(17,Math.floor(axial(Math.atan2(segment.b.y-segment.a.y,segment.b.x-segment.a.x)*180/Math.PI)/10));
  histogram[bin]+=1;
 }
 const pairs=[];
 for(let i=0;i<context.families.length;i++)for(let j=i+1;j<context.families.length;j++){
  const a=context.families[i],b=context.families[j];
  const aAngle=Number.isFinite(a.angleDegrees)?a.angleDegrees:a.measuredAngle,bAngle=Number.isFinite(b.angleDegrees)?b.angleDegrees:b.measuredAngle;
  if(!Number.isFinite(aAngle)||!Number.isFinite(bAngle))continue;
  pairs.push({familyA:a.familyId,familyB:b.familyId,angleDifference:orientationDifference(aAngle,bAngle)});
 }
 return {summary:{familyCount:context.families.length,pairCount:pairs.length},detail:{histogram,pairs,families:context.families.map(family=>({familyId:family.familyId,retainedStrandCount:family.retainedStrandCount,authoredAngle:family.angleDegrees??null,measuredAngle:family.measuredAngle}))}};
}
function rhythmicEvidence(field,context){
 const pairs=[];
 for(let i=0;i<context.families.length;i++)for(let j=i+1;j<context.families.length;j++){
  const a=context.families[i],b=context.families[j];
  if(!(a.spacing>0)||!(b.spacing>0))continue;
  pairs.push({familyA:a.familyId,familyB:b.familyId,spacingRatio:Math.max(a.spacing,b.spacing)/Math.min(a.spacing,b.spacing),densityDifference:Number.isFinite(a.density)&&Number.isFinite(b.density)?Math.abs(a.density-b.density):null,phaseA:Number.isFinite(a.offset)?((a.offset/a.spacing)%1+1)%1:null,phaseB:Number.isFinite(b.offset)?((b.offset/b.spacing)%1+1)%1:null});
 }
 const gaps=context.families.map(family=>family.spacing).filter(value=>value>0);
 const gapMean=gaps.reduce((sum,value)=>sum+value,0)/(gaps.length||1);
 const deviation=Math.sqrt(gaps.reduce((sum,value)=>sum+(value-gapMean)**2,0)/(gaps.length||1));
 return {summary:{characteristicSpacing:context.characteristicSpacing,characteristicLength:context.characteristicLength,gapRegularity:gaps.length>1?clamp(1-deviation/gapMean,0,1):null},detail:{families:context.families.map(family=>({familyId:family.familyId,spacing:family.spacing,spacingSource:family.spacingSource,density:family.density??null})),pairs}};
}
function modulationEvidence(field,context){
 if(!context.samples.length)return {status:'unavailable',summary:{},detail:{reason:'The sampling grid has no points inside the boundary.'}};
 const influences=field.influences||[];
 const rows=context.families.map(family=>{
  const magnitudes=[],overlap=[];
  let retention=0,retentionCount=0;
  for(const sample of context.samples){
   const moved=generatorInfluenceDisplacement(sample,influences,family.key);
   const spacing=family.spacing>0?family.spacing:context.characteristicSpacing;
   magnitudes.push(spacing>0?Math.hypot(moved.x,moved.y)/spacing:null);
   const active=moved.parts.filter(part=>Math.hypot(part.x,part.y)>1e-9);
   if(active.length>1){const net=Math.hypot(moved.x,moved.y),total=active.reduce((sum,part)=>sum+Math.hypot(part.x,part.y),0);if(total>0)overlap.push(net/total);}
   const nearest=nearestSegment(sample,context.segments.filter(segment=>segment.strand.familyId===family.familyId));
   if(nearest&&Number.isFinite(family.angleDegrees)&&nearest.distance<=2*(spacing||context.characteristicSpacing||nearest.distance)){
    const post=Math.atan2(nearest.segment.b.y-nearest.segment.a.y,nearest.segment.b.x-nearest.segment.a.x)*180/Math.PI;
    retention+=Math.abs(Math.cos((post-family.angleDegrees)*Math.PI/180));
    retentionCount+=1;
   }
  }
  const finite=magnitudes.filter(Number.isFinite);
  const p10=percentile(finite,.1),p90=percentile(finite,.9);
  return {
   familyId:family.familyId,
   key:family.key,
   sampleCount:finite.length,
   m75:percentile(finite,.75),
   coverage:finite.length?finite.filter(value=>value>=.05).length/finite.length:null,
   p10,p90,
   contrast:Number.isFinite(p90)?(p90-p10)/Math.max(p90,1e-9):null,
   overlapCount:overlap.length,
   coordinationMedian:overlap.length?median(overlap):null,
   orientationRetention:retentionCount?retention/retentionCount:null,
   magnitudes:finite
  };
 });
 const finite=rows.flatMap(row=>row.magnitudes);
 const overlap=rows.reduce((sum,row)=>sum+row.overlapCount,0);
 const coordination=median(rows.map(row=>row.coordinationMedian).filter(Number.isFinite));
 const orientation=median(rows.map(row=>row.orientationRetention).filter(Number.isFinite));
 const p10=percentile(finite,.1),p90=percentile(finite,.9);
 return {summary:{sampleCount:context.samples.length,observationCount:finite.length,m75:percentile(finite,.75),coverage:finite.length?finite.filter(value=>value>=.05).length/finite.length:null,contrast:Number.isFinite(p90)?(p90-p10)/Math.max(p90,1e-9):null,overlapCount:overlap,coordinationMedian:coordination,orientationRetention:orientation},detail:{grid:context.grid,families:rows.map(({magnitudes,...row})=>row),magnitudes:rows.map(row=>({familyId:row.familyId,values:row.magnitudes})),influences:influences.map(influence=>({id:influence.id,kind:influence.kind,enabled:influence.enabled===true}))}};
}
function distanceToStrand(point,strand){
 return Math.min(...strandSegments(strand).map(segment=>pointSegmentDistance(point,segment.a,segment.b)));
}
function relationalEvents(field,context){
 const spacing=context.characteristicSpacing;
 if(!(spacing>0)||!context.strands.length)return {status:'unavailable',summary:{},detail:{reason:'Event detection needs retained strands and a characteristic spacing.'}};
 const events=[];
 const segments=context.segments;
 for(let i=0;i<segments.length;i++)for(let j=i+1;j<segments.length;j++){
  const a=segments[i],b=segments[j];
  if(a.strand.familyId===b.strand.familyId||a.strand.strandId===b.strand.strandId)continue;
  const point=segmentCrossing(a.a,a.b,b.a,b.b);
  if(!point)continue;
  const angle=segmentAngle(a.a,a.b,b.a,b.b),strength=crossingLegibility(angle);
  events.push({eventType:'crossing',location:point,participatingFamilies:[a.strand.familyId,b.strand.familyId],participatingStrands:[a.strand.strandId,b.strand.strandId],geometricStrength:strength,salience:strength,persistence:1,scale:spacing,crossingAngle:angle});
 }
 const ordered=[...context.strands].sort((a,b)=>a.strandId.localeCompare(b.strandId));
 for(let i=0;i<ordered.length;i++)for(let j=i+1;j<ordered.length;j++){
  const a=ordered[i],b=ordered[j];
  if(a.familyId===b.familyId)continue;
  const length=polylineLength(a.points);
  if(!(length>0))continue;
  const step=Math.max(spacing/4,length/12),samples=[];
  for(let distance=0;distance<=length;distance+=step){
   const at=pointAlong(a.points,Math.min(distance,length));
   samples.push({...at,distance,separation:distanceToStrand(at,b)});
  }
  let run=[];
  const flush=()=>{
   if(run.length<2){run=[];return;}
   const before=run[0].separation,after=run.at(-1).separation,span=run.at(-1).distance-run[0].distance;
   const ratio=Math.abs(before-after)/spacing;
   if(ratio>=.15&&span>0){
    const change=clamp((ratio-.15)/.45,0,1),persistence=clamp(span/(1.5*spacing),0,1),salience=change*persistence;
    events.push({eventType:after<before?'convergence':'divergence',location:{x:run[Math.floor(run.length/2)].x,y:run[Math.floor(run.length/2)].y},participatingFamilies:[a.familyId,b.familyId],participatingStrands:[a.strandId,b.strandId],geometricStrength:change,salience,persistence,scale:spacing,distanceChangeRatio:ratio});
   }
   const angle=median(run.map(sample=>{const nearest=nearestSegment(sample,strandSegments(b));return nearest?orientationDifference(sample.tangent,Math.atan2(nearest.segment.b.y-nearest.segment.a.y,nearest.segment.b.x-nearest.segment.a.x)*180/Math.PI):null;}).filter(Number.isFinite));
   const proximity=median(run.map(sample=>sample.separation))/spacing;
   if(Number.isFinite(angle)&&angle<15&&proximity<.75&&span>=.75*spacing){
    const angular=interpolate(angle,[[0,1],[5,.7],[10,.4],[15,0]]),near=interpolate(proximity,[[.1,1],[.25,.7],[.5,.3],[.75,0]]),persistence=clamp(span/(.75*spacing),0,1);
    events.push({eventType:'alignment',location:{x:run[Math.floor(run.length/2)].x,y:run[Math.floor(run.length/2)].y},participatingFamilies:[a.familyId,b.familyId],participatingStrands:[a.strandId,b.strandId],geometricStrength:angular*near,salience:angular*near*persistence,persistence,scale:spacing,relativeAngle:angle,normalizedDistance:proximity});
   }
   run=[];
  };
  for(const sample of samples){
   if(sample.separation<=1.5*spacing)run.push(sample);else flush();
  }
  flush();
 }
 for(const strand of ordered){
  const length=polylineLength(strand.points),shiftSamples=[];
  for(let distance=0;distance+spacing<=length;distance+=spacing/2){
   const start=pointAlong(strand.points,distance),end=pointAlong(strand.points,distance+spacing);
   const change=orientationDifference(start.tangent,end.tangent);
   if(change>=10)shiftSamples.push({change,location:pointAlong(strand.points,distance+spacing/2)});
  }
  if(!shiftSamples.length)continue;
  const chosen=shiftSamples.sort((left,right)=>right.change-left.change)[0];
  const near=context.strands.some(other=>other.familyId!==strand.familyId&&distanceToStrand(chosen.location,other)<=1.5*spacing);
  const strength=shiftStrength(chosen.change),contextFactor=near?1:.5;
  events.push({eventType:'directional-shift',location:{x:chosen.location.x,y:chosen.location.y},participatingFamilies:[strand.familyId],participatingStrands:[strand.strandId],geometricStrength:strength,salience:strength*contextFactor,persistence:1,scale:spacing,directionChange:chosen.change,relationalContext:contextFactor});
 }
 const unique=[];
 for(const event of events.sort((a,b)=>a.eventType.localeCompare(b.eventType)||a.location.x-b.location.x||a.location.y-b.location.y||a.participatingStrands[0].localeCompare(b.participatingStrands[0]))){
  event.location={x:clean(event.location.x),y:clean(event.location.y)};
  event.eventId=`${event.eventType}-${unique.length+1}`;
  event.detectorVersion=ANALYSIS_MODULE_VERSIONS.events;
  unique.push(event);
 }
 const warnings=unique.length>400?['RELATIONAL EVENT LIST STORED THE 400 STRONGEST EVENTS. COUNTS INCLUDE THE REST.']:[];
 const stored=[...unique].sort((a,b)=>b.salience-a.salience).slice(0,400);
 const count=type=>unique.filter(event=>event.eventType===type).length;
 return {warnings,summary:{crossingCount:count('crossing'),convergenceCount:count('convergence'),divergenceCount:count('divergence'),alignmentCount:count('alignment'),shiftCount:count('directional-shift'),interruption:'unavailable'},detail:{interruption:{status:'unavailable',reason:'No reliable interruption detector is available for this geometry.'},events:stored,salienceP25:percentile(unique.map(event=>event.salience),.25),salienceP85:percentile(unique.map(event=>event.salience),.85)}};
}
function connected(cells,neighbors){
 const index=new Map(cells.map((cell,position)=>[cell,position]));
 const parent=cells.map((_,position)=>position);
 const find=position=>parent[position]===position?position:(parent[position]=find(parent[position]));
 cells.forEach((cell,position)=>{for(const next of neighbors(cell)){const other=index.get(next);if(other!==undefined&&other>position)parent[find(position)]=find(other);}});
 const groups=new Map();
 cells.forEach((cell,index)=>{const root=find(index);if(!groups.has(root))groups.set(root,[]);groups.get(root).push(cell);});
 return [...groups.values()];
}
function interstitialEvidence(field,context){
 if(!context.samples.length||!(context.characteristicSpacing>0))return {status:'unavailable',summary:{},detail:{reason:'Interstitial measurement needs samples inside the boundary and a characteristic spacing.'}};
 const index=new Map(context.samples.map(sample=>[`${sample.row}:${sample.col}`,sample]));
 const neighbors=sample=>[[1,0],[-1,0],[0,1],[0,-1]].map(([x,y])=>index.get(`${sample.row+y}:${sample.col+x}`)).filter(Boolean);
 const blocked=(a,b)=>context.segments.some(segment=>properHit(a,b,segment.a,segment.b));
 const domains=connected(context.samples,sample=>neighbors(sample).filter(next=>!blocked(sample,next)));
 const widthOf=sample=>{
  const strand=context.segments.length?Math.min(...context.segments.map(segment=>pointSegmentDistance(sample,segment.a,segment.b))):Infinity;
  let boundary=Infinity;
  for(let i=0;i<field.boundary.length;i++)boundary=Math.min(boundary,pointSegmentDistance(sample,field.boundary[i],field.boundary[(i+1)%field.boundary.length]));
  return 2*Math.min(strand,boundary);
 };
 const cellArea=context.cellWidth*context.cellHeight,spacing=context.characteristicSpacing,zones=[],connections=[];
 domains.sort((a,b)=>a[0].row-b[0].row||a[0].col-b[0].col);
 for(const domain of domains){
  const widths=domain.map(widthOf),effective=percentile(widths,.5),bottleneck=percentile(widths,.1);
  let parts=[domain];
  if(Number.isFinite(bottleneck)&&bottleneck<=.5*effective){
   const neck=new Set(domain.filter(sample=>widthOf(sample)<=bottleneck+1e-9));
   const remain=domain.filter(sample=>!neck.has(sample));
   const split=connected(remain,sample=>neighbors(sample).filter(next=>remain.includes(next)&&!blocked(sample,next)));
   if(split.filter(part=>part.length*cellArea>=.1*spacing*spacing).length>=2)parts=split.filter(part=>part.length*cellArea>=.1*spacing*spacing);
  }
  const domainId=`domain-${zones.length+1}`;
  const made=[];
  for(const part of parts){
   const local=part.map(widthOf),zoneEffective=percentile(local,.5),zoneBottleneck=percentile(local,.1),area=part.length*cellArea;
   const normalizedWidth=zoneEffective/spacing,normalizedArea=area/(spacing*spacing),widthToScale=area>0?zoneEffective/Math.sqrt(area):null;
   let strandPerimeter=0,boundaryPerimeter=0;
   const strandIds=new Set(),familyIds=new Set();
   for(const sample of part){
    const nearest=nearestSegment(sample,context.segments);
    if(nearest){strandIds.add(nearest.segment.strand.strandId);familyIds.add(nearest.segment.strand.familyId);}
    for(const [x,y,length] of [[1,0,context.cellHeight],[-1,0,context.cellHeight],[0,1,context.cellWidth],[0,-1,context.cellWidth]]){
     const next=index.get(`${sample.row+y}:${sample.col+x}`);
     if(next&&part.includes(next))continue;
     if(!next||!insidePolygon({x:sample.x+x*context.cellWidth,y:sample.y+y*context.cellHeight},field.boundary))boundaryPerimeter+=length;
     else strandPerimeter+=length;
    }
   }
   const perimeter=strandPerimeter+boundaryPerimeter,weaveDefinition=perimeter>0?strandPerimeter/perimeter:null,territorialShare=context.area>0?area/context.area:null;
   const flags=[];
   if(normalizedWidth<.15&&widthToScale<.2)flags.push('sliver');
   if(normalizedArea<.1)flags.push('microfragment');
   if(territorialShare>=.4&&weaveDefinition<=.3)flags.push('undefined-open');
   made.push({zoneId:`zone-${zones.length+made.length+1}`,domainId,area,normalizedArea,perimeter,strandDefinedPerimeter:strandPerimeter,boundaryDefinedPerimeter:boundaryPerimeter,effectiveWidth:zoneEffective,normalizedWidth,bottleneckWidth:zoneBottleneck,widthToScale,weaveDefinition,territorialShare,borderingStrandIds:[...strandIds].sort(),borderingFamilyIds:[...familyIds].sort(),degenerateFlags:flags,connectionIds:[],cellCount:part.length});
  }
  if(made.length>1){
   const link={connectionId:`connection-${connections.length+1}`,zoneIds:made.map(zone=>zone.zoneId),bottleneckWidth:bottleneck};
   connections.push(link);
   for(const zone of made)zone.connectionIds.push(link.connectionId);
  }
  zones.push(...made);
 }
 return {summary:{domainCount:domains.length,zoneCount:zones.length,sliverCount:zones.filter(zone=>zone.degenerateFlags.includes('sliver')).length,microfragmentCount:zones.filter(zone=>zone.degenerateFlags.includes('microfragment')).length,openCount:zones.filter(zone=>zone.degenerateFlags.includes('undefined-open')).length,connectionCount:connections.length},detail:{zones,connections,spacing,grid:context.grid}};
}

function normalizedHistogram(bins){
 const total=bins.reduce((sum,value)=>sum+value,0);
 return total>0?bins.map(value=>value/total):bins.map(()=>0);
}
function domainLabels(context){
 const index=new Map(context.samples.map(sample=>[`${sample.row}:${sample.col}`,sample]));
 const neighbors=sample=>[[1,0],[-1,0],[0,1],[0,-1]].map(([x,y])=>index.get(`${sample.row+y}:${sample.col+x}`)).filter(Boolean);
 const blocked=(a,b)=>context.segments.some(segment=>properHit(a,b,segment.a,segment.b));
 const domains=connected(context.samples,sample=>neighbors(sample).filter(next=>!blocked(sample,next)));
 const labels=new Map();
 domains.forEach((domain,id)=>domain.forEach(sample=>labels.set(`${sample.row}:${sample.col}`,id)));
 return context.samples.map(sample=>labels.get(`${sample.row}:${sample.col}`)??0);
}
export function counterfactualSignature(field,options={}){
 const grid=options.grid||ANALYSIS_GRID;
 let context;
 try{context=prepare(field,grid);}
 catch(error){return {status:'unavailable',reason:String(error.message||'Analysis geometry is unavailable.')};}
 const spacing=options.spacing>0?options.spacing:context.characteristicSpacing;
 if(!context.samples.length||!(spacing>0))return {status:'unavailable',reason:'Counterfactual analysis needs samples and a characteristic spacing.'};
 const radius=(options.radiusFactor||1.5)*spacing;
 const boundary=field.boundary;
 const families=context.families.filter(family=>family.retainedStrandCount>0);
 const influences=(field.influences||[]).filter(item=>item.enabled!==false);
 const modulationActive=influences.length>0;
 let eventRecords=[];
 if(context.strands.length){
  const evidence=relationalEvents(field,context);
  if(evidence.status==='failed'||evidence.status==='unavailable')return {status:'unavailable',reason:evidence.detail?.reason||'Event analysis is unavailable.'};
  eventRecords=evidence.detail?.events||[];
 }
 const domains=domainLabels(context);
 const eventTypes=['crossing','convergence','divergence','alignment','directional-shift'];
 const samples=context.samples.map((sample,index)=>{
  const directionalFamilies=new Map();
  const nearest=new Map();
  for(const segment of context.segments){
   const distance=pointSegmentDistance(sample,segment.a,segment.b);
   if(distance>radius)continue;
   const familyId=segment.strand.familyId;
   const bins=directionalFamilies.get(familyId)||Array(12).fill(0);
   const angle=axial(Math.atan2(segment.b.y-segment.a.y,segment.b.x-segment.a.x)*180/Math.PI);
   bins[Math.min(11,Math.floor(angle/15))]+=1;
   directionalFamilies.set(familyId,bins);
   if(!nearest.has(familyId)||distance<nearest.get(familyId))nearest.set(familyId,distance);
  }
  const directional=Array(12).fill(0);
  for(const bins of directionalFamilies.values())normalizedHistogram(bins).forEach((value,bin)=>{directional[bin]+=value;});
  const rhythm=Array(6).fill(0);
  const gaps=[...nearest.values()].map(distance=>distance/spacing);
  for(const scale of gaps)rhythm[scale<0.5?0:scale<1?1:scale<1.5?2:scale<2?3:scale<3?4:5]+=1;
  const irregularity=gaps.length>1?median(gaps.map(gap=>Math.abs(gap-median(gaps))))/Math.max(median(gaps),1e-9):null;
  let modulationNet=null,modulationActivity=null;
  if(modulationActive){
   const vectors=families.map(family=>{
    const moved=generatorInfluenceDisplacement(sample,influences,family.key);
    const scale=family.spacing>0?family.spacing:spacing;
    return {x:moved.x/scale,y:moved.y/scale,magnitude:clamp(Math.hypot(moved.x,moved.y)/scale,0,1)};
   });
   modulationNet=clamp(Math.hypot(vectors.reduce((sum,item)=>sum+item.x,0),vectors.reduce((sum,item)=>sum+item.y,0)),0,1);
   modulationActivity=1-vectors.reduce((product,item)=>product*(1-item.magnitude),1);
  }
  const nearby=eventRecords.filter(event=>Math.hypot(event.location.x-sample.x,event.location.y-sample.y)<=radius);
  const events=eventTypes.map(type=>{
   const matching=nearby.filter(event=>event.eventType===type);
   return matching.length?1-matching.reduce((product,event)=>product*(1-clamp(event.salience,0,1)),1):0;
  });
  const strandDistance=context.segments.length?Math.min(...context.segments.map(segment=>pointSegmentDistance(sample,segment.a,segment.b))):Infinity;
  let boundaryDistance=Infinity;
  for(let i=0;i<boundary.length;i++)boundaryDistance=Math.min(boundaryDistance,pointSegmentDistance(sample,boundary[i],boundary[(i+1)%boundary.length]));
  return {directional:normalizedHistogram(directional),rhythm:normalizedHistogram(rhythm),irregularity,modulationNet,modulationActivity,events,clearance:clamp(Math.min(strandDistance,boundaryDistance)/(2*spacing),0,1),domain:domains[index]};
 });
 return {status:'complete',modulationActive,spacing,sampleCount:samples.length,samples};
}

const RUNNERS={presence:familyPresence,directional:directionalEvidence,rhythmic:rhythmicEvidence,modulation:modulationEvidence,events:relationalEvents,interstitial:interstitialEvidence};

function influenceSignature(influences){
 return digest((influences||[]).map(field=>({id:field.id,kind:field.kind,enabled:field.enabled===true,center:field.center,radius:field.radius,direction:field.direction,falloff:field.falloff??3,families:field.families})).sort((a,b)=>String(a.id).localeCompare(String(b.id))));
}
function cacheKey(field,grid){
 return [field.geometryFingerprint||'',field.subsetKey||'FULL',grid,influenceSignature(field.influences),ANALYSIS_TOLERANCE_VERSION,...MODULE_ORDER.map(name=>ANALYSIS_MODULE_VERSIONS[name])].join('|');
}
function emptyModules(status){
 return Object.fromEntries(MODULE_ORDER.map(name=>[name,{status,version:ANALYSIS_MODULE_VERSIONS[name]}]));
}
export function analyzeField(field,options={}){
 const grid=options.grid||ANALYSIS_GRID,subset=field.subsetKey||'FULL';
 const key=cacheKey({...field,subsetKey:subset},grid);
 if(!options.force&&!options.replace&&cache.has(key))return {...cache.get(key),cached:true};
 const influence=influenceSignature(field.influences);
 if(subset==='EMPTY')return {status:'analyzed',grid,subset,influence,modules:emptyModules('not_applicable'),artifacts:[],warnings:['This family subset has no families.'],cached:false};
 let context;
 try{context=prepare(field,grid);}
 catch(error){
  return {status:'analysis-failed',grid,subset,influence,modules:emptyModules('failed'),artifacts:[],warnings:[`ANALYSIS FAILED: ${error.message}`.slice(0,200)],cached:false};
 }
 const runners={...RUNNERS,...options.replace},modules={},artifacts=[],warnings=[];
 const only=options.only?new Set(options.only):null;
 for(const name of MODULE_ORDER){
  if(only&&!only.has(name))continue;
  try{
   const evidence=runners[name](field,context)||{};
   const status=evidence.status||'complete';
   modules[name]={status,version:ANALYSIS_MODULE_VERSIONS[name],...(status==='complete'?evidence.summary:{})};
   artifacts.push({module:name,version:ANALYSIS_MODULE_VERSIONS[name],evidence:evidence.detail||{status}});
   for(const warning of evidence.warnings||[])warnings.push(String(warning).slice(0,200));
  }catch(error){
   modules[name]={status:'failed',version:ANALYSIS_MODULE_VERSIONS[name]};
   artifacts.push({module:name,version:ANALYSIS_MODULE_VERSIONS[name],evidence:{status:'failed'}});
   warnings.push(`${name.toUpperCase()} FAILED: ${error.message}`.slice(0,200));
  }
 }
 const result={status:Object.values(modules).some(module=>module.status==='failed')?'analysis-failed':'analyzed',grid,subset,influence,modules,artifacts,warnings,cached:false};
 if(result.status==='analyzed'&&!options.replace&&!only)cache.set(key,result);
 return result;
}
export function analyzeFieldSubset(field,activeFamilyIds,options={}){
 const ids=[...new Set(activeFamilyIds||[])].sort();
 if(!ids.length)return analyzeField({...field,families:[],strands:[],subsetKey:'EMPTY'},options);
 const allow=new Set(ids);
 return analyzeField({...field,families:(field.families||[]).filter(family=>allow.has(family.familyId)),strands:(field.strands||[]).filter(strand=>allow.has(strand.familyId)),subsetKey:ids.join('+')},options);
}
export function clearAnalysisCache(){cache.clear();}

function analysisRevision(entry){
 const revisions=entry?.revisions;
 if(!Array.isArray(revisions)||!revisions.length)return null;
 return revisions.find(revision=>revision.id===entry.generatorRevisionId)||revisions.at(-1);
}
function pinStoredProvenance(project,entry){
 const report=evaluationReadinessReport(project,entry);
 if(report.readiness!=='needsMigration')return report;
 const migrated=migrateEvaluationProvenance(project,entry);
 if(migrated.report.readiness!=='ready'||migrated.entry===entry)return report;
 const pinned=migrated.entry.revisions.find(revision=>revision.id===migrated.entry.generatorRevisionId)||migrated.entry.revisions.at(-1);
 const source=analysisRevision(entry);
 const revision=structuredClone(source);
 revision.id=`carrier-revision-${crypto.randomUUID()}`;
 revision.number=entry.revisions.length+1;
 revision.createdAt=new Date().toISOString();
 revision.parentRevisionId=entry.revisions.at(-1).id;
 revision.geometryRef=structuredClone(pinned.geometryRef);
 revision.geometryRef.revisionId=revision.id;
 revision.strandIdentity=structuredClone(pinned.strandIdentity);
 entry.revisions.push(revision);
 entry.latestRevisionId=revision.id;
 entry.generatorRevisionId=revision.id;
 return evaluationReadinessReport(project,entry);
}
function ensureContainers(entry){
 if(entry.derivedAnalysis===undefined)entry.derivedAnalysis={};
 if(entry.evaluations===undefined)entry.evaluations=[];
 if(entry.designerData===undefined)entry.designerData={};
 if(entry.lineage===undefined)entry.lineage={};
}
function fieldFromRecord(project,entry,revision,familyIds){
 const snapshot=resolveAnalysisGeometry(project,revision);
 const identity=revision.strandIdentity,byStrand=new Map(identity.strands.map(strand=>[strand.strandId,strand.familyId]));
 const warnings=[];
 const strands=[];
 for(const strand of snapshot.strands){
  const familyId=byStrand.get(strand.strandId);
  if(!familyId){warnings.push('A pinned strand had no family identity and was left out of analysis.');continue;}
  strands.push({...strand,familyId});
 }
 const allow=familyIds?new Set(familyIds):null;
 const families=identity.families.filter(family=>!allow||allow.has(family.familyId)).map(family=>{
  const source=revision.carrier?.families?.[family.key]||{};
  return {familyId:family.familyId,key:family.key,spacing:source.spacing,density:source.density,offset:source.offset,angleDegrees:authoredAngle(revision.carrier,family.key),retainedStrandCount:family.retainedStrandCount};
 });
 return {warnings,field:{weaveId:entry.weaveId,geometryFingerprint:revision.geometryRef.geometryFingerprint,boundary:snapshot.boundary,families,strands:strands.filter(strand=>!allow||allow.has(strand.familyId)),influences:revision.generation?.influences||[],subsetKey:subsetName(familyIds)}};
}
function subsetName(familyIds){
 if(!Array.isArray(familyIds))return 'FULL';
 return familyIds.length?[...familyIds].sort().join('+'):'EMPTY';
}
function authoredAngle(carrier,key){
 if(!carrier||carrier.kind==='stitch-recipe-v1')return null;
 if(carrier.generatorVersion==='rect-v1')return (carrier.angleDegrees||0)+(key==='B'?90:0);
 const angle=carrier.families?.[key]?.angleDegrees;
 return Number.isFinite(angle)?angle:null;
}
function modulesCurrent(run){
 return MODULE_ORDER.every(name=>run.moduleVersions?.[name]===ANALYSIS_MODULE_VERSIONS[name]);
}
function matchingRun(entry,fingerprint,subset,grid,influence,currentOnly){
 const runs=entry?.derivedAnalysis?.runs;
 if(!Array.isArray(runs))return null;
 return [...runs].reverse().find(run=>run.geometryFingerprint===fingerprint&&run.status==='analyzed'&&run.outputs?.config?.subset===subset&&run.outputs?.config?.grid===grid&&run.outputs?.config?.influence===influence&&(!currentOnly||modulesCurrent(run))&&(subset==='FULL'||typeof run.moduleVersions?.subset!=='string'||run.moduleVersions.subset===SUBSET_ANALYSIS_VERSION))||null;
}
function storedRun(entry,fingerprint,subset,grid,influence){
 return matchingRun(entry,fingerprint,subset,grid,influence,true);
}
function artifactForModule(entry,run,moduleName){
 for(const ref of run?.artifacts||[]){
  const body=(entry.analysisArtifacts||[]).find(item=>item.artifactId===ref.artifactId);
  if(body?.module===moduleName)return ref;
 }
 return null;
}
function commitRun(entry,fingerprint,status,result){
 ensureContainers(entry);
 const analysisRunId=`analysis-${crypto.randomUUID()}`;
 const artifacts=[];
 if(!Array.isArray(entry.analysisArtifacts))entry.analysisArtifacts=[];
 for(const artifact of result?.artifacts||[]){
  if(artifact.artifactId&&artifact.evidence===undefined){artifacts.push(structuredClone(artifact));continue;}
  const body={version:artifact.version,weaveId:entry.weaveId||'weave-unknown',geometryFingerprint:fingerprint,analysisRunId,module:artifact.module,evidence:artifact.evidence};
  const artifactId=digest(body);
  const reference={artifactId,version:artifact.version,weaveId:body.weaveId,geometryFingerprint:fingerprint,analysisRunId};
  artifacts.push(reference);
  if(!entry.analysisArtifacts.some(item=>item.artifactId===artifactId))entry.analysisArtifacts.push({artifactId,...body});
 }
 const grid=result?.grid||ANALYSIS_GRID,subset=result?.subset||'FULL',influence=result?.influence||influenceSignature([]);
 const moduleVersions={sampling:`field-sampling-${grid}-v1`,tolerance:ANALYSIS_TOLERANCE_VERSION};
 if(subset!=='FULL')moduleVersions.subset=SUBSET_ANALYSIS_VERSION;
 for(const name of MODULE_ORDER)moduleVersions[name]=result?.modules?.[name]?.version||ANALYSIS_MODULE_VERSIONS[name];
 const run=createAnalysisRun({analysisRunId,geometryFingerprint:fingerprint,status,moduleVersions,outputs:{config:{grid,subset,sampling:`field-sampling-${grid}-v1`,tolerance:ANALYSIS_TOLERANCE_VERSION,influence},modules:result?.modules||{}},artifacts,warnings:result?.warnings||[]});
 appendAnalysisRun(entry,run);
 return run;
}
export function analyzeWeave(project,entry,options={}){
 const report=pinStoredProvenance(project,entry),revision=analysisRevision(entry);
 const subset=subsetName(options.familyIds);
 if(report.readiness!=='ready'){
  const run=commitRun(entry,'unavailable','analysis-unavailable',{grid:options.grid||ANALYSIS_GRID,subset,artifacts:[],modules:{},warnings:[report.reasons[0]||'This weave is not ready for analysis.']});
  return {entry,run,cached:false,readiness:report.readiness};
 }
 const fingerprint=revision.geometryRef.geometryFingerprint,influence=influenceSignature(revision.generation?.influences||[]),grid=options.grid||ANALYSIS_GRID;
 const existing=!options.force&&storedRun(entry,fingerprint,subset,grid,influence);
 if(existing)return {entry,run:existing,cached:true,readiness:'ready'};
 if(Array.isArray(options.modules)&&!options.force){
  const donor=matchingRun(entry,fingerprint,subset,grid,influence,false);
  if(donor){
   const requested=[...new Set(options.modules)].filter(name=>MODULE_ORDER.includes(name));
   const needed=requested.filter(name=>donor.outputs?.modules?.[name]?.version!==ANALYSIS_MODULE_VERSIONS[name]||!artifactForModule(entry,donor,name));
   if(!needed.length)return {entry,run:donor,cached:true,readiness:'ready'};
   let donorField;
   try{donorField=fieldFromRecord(project,entry,revision,options.familyIds||null);}
   catch(error){
    const run=commitRun(entry,fingerprint,'analysis-failed',{grid,subset,artifacts:[],modules:emptyModules('failed'),warnings:[`ANALYSIS FAILED: ${error.message}`.slice(0,200)]});
    return {entry,run,cached:false,readiness:'ready'};
   }
   const partial=analyzeField(donorField.field,{grid,force:true,only:needed});
   const modules={},artifacts=[];
   for(const name of MODULE_ORDER){
    if(partial.modules[name]){
     modules[name]=partial.modules[name];
     const fresh=(partial.artifacts||[]).find(item=>item.module===name);
     if(fresh)artifacts.push(fresh);
    }else if(donor.outputs?.modules?.[name]){
     modules[name]=structuredClone(donor.outputs.modules[name]);
     const reused=artifactForModule(entry,donor,name);
     if(reused)artifacts.push(structuredClone(reused));
    }
   }
   const status=Object.values(modules).some(module=>module.status==='failed')?'analysis-failed':'analyzed';
   const run=commitRun(entry,fingerprint,status,{grid,subset,influence,modules,artifacts,warnings:[...donorField.warnings,...(partial.warnings||[])].slice(0,40)});
   return {entry,run,cached:false,readiness:'ready',refreshed:needed};
  }
 }
 let built;
 try{built=fieldFromRecord(project,entry,revision,options.familyIds||null);}
 catch(error){
  const run=commitRun(entry,fingerprint,'analysis-failed',{grid:options.grid||ANALYSIS_GRID,subset,artifacts:[],modules:emptyModules('failed'),warnings:[`ANALYSIS FAILED: ${error.message}`.slice(0,200)]});
  return {entry,run,cached:false,readiness:'ready'};
 }
 const result=analyzeField(built.field,{...options,force:true});
 const committed={...result,modules:structuredClone(result.modules),warnings:[...built.warnings,...result.warnings].slice(0,40)};
 const full=!options.familyIds?null:storedRun(entry,fingerprint,'FULL',options.grid||ANALYSIS_GRID,influence);
 if(full?.outputs?.modules?.events&&committed.modules.events?.status==='complete')committed.modules.events.crossingDelta=committed.modules.events.crossingCount-full.outputs.modules.events.crossingCount;
 const run=commitRun(entry,fingerprint,committed.status,committed);
 return {entry,run,result,cached:false,readiness:'ready'};
}
export function readAnalysisArtifact(entry,artifactId){
 const found=(entry?.analysisArtifacts||[]).find(item=>item.artifactId===artifactId);
 if(!found)throw new Error('The analysis artifact is missing.');
 return found;
}
export function readAnalysisModules(entry){
 const modules=entry?.derivedAnalysis?.runs?.at(-1)?.outputs?.modules;
 if(!modules)return [];
 return MODULE_ORDER.filter(id=>modules[id]).map(id=>({id,label:MODULE_LABELS[id],status:modules[id].status,statusLabel:MODULE_STATUS_LABELS[modules[id].status]||String(modules[id].status).toUpperCase()}));
}
