// WV-04 Activated Interstitial Structure. Specified anchors are copied from the handoff.
// Group-separation anchors and the feature tolerance are first-pass calibration values.
import {readAnalysisArtifact} from './analysis.mjs';

export const WV04_CALIBRATION=Object.freeze({
 version:'wv-04-calibration-v1',
 logicVersion:'wv-04-logic-v1',
 areaRatio:[[1.1,0],[1.3,.3],[1.75,.65],[2.5,1]],
 widthRatio:[[1.1,0],[1.3,.3],[1.75,.65],[2.5,1]],
 proportionSpread:[[.05,0],[.1,.35],[.2,.7],[.3,1]],
 recurringCoverage:[[.2,0],[.4,.4],[.6,.75],[.75,1]],
 secondaryCondition:[[.05,0],[.1,.4],[.2,.8],[.25,1]],
 groupSeparation:[[1,0],[1.5,.35],[2.5,.7],[4,1]],
 weaveDefinition:[[.2,0],[.35,.35],[.5,.7],[.65,1]],
 connectedArea:[[.1,0],[.25,.35],[.5,.7],[.7,1]],
 burden:[[.05,1],[.1,.85],[.2,.65],[.35,.4]],
 undefinedOpen:[[.2,1],[.35,.85],[.5,.65],[.7,.4]],
 sliverWidth:.15,
 sliverProportion:.2,
 microfragmentArea:.1,
 undefinedShare:.4,
 undefinedDefinition:.3,
 connectionThreshold:.15,
 featureTolerance:.35,
 epsilon:1e-9
});

function interpolate(value,anchors){
 if(!Number.isFinite(value))return anchors.at(-1)[1];
 if(value<=anchors[0][0])return anchors[0][1];
 if(value>=anchors.at(-1)[0])return anchors.at(-1)[1];
 return anchors.slice(1).reduce((score,[x1,y1],index)=>{
  const [x0,y0]=anchors[index];
  return value<=x1&&value>x0?y0+(y1-y0)*(value-x0)/(x1-x0):score;
 },anchors.at(-1)[1]);
}
function clamp01(value){return Math.min(1,Math.max(0,value));}
function finite(value){return Number.isFinite(value)?value:null;}
function percentile(values,p){
 if(!values.length)return null;
 const sorted=[...values].sort((a,b)=>a-b),index=(sorted.length-1)*p,lo=Math.floor(index),hi=Math.ceil(index);
 return sorted[lo]+(sorted[hi]-sorted[lo])*(index-lo);
}
function blank(status,explanation,warnings=[]){
 return {criterionId:'WV-04',status,normalizedScore:null,rating:null,components:{},submetrics:{},safeguards:{},evidenceRefs:[],explanation,warnings,versions:{logic:WV04_CALIBRATION.logicVersion,calibration:WV04_CALIBRATION.version}};
}
function feature(zone){
 return [Math.log(Math.max(zone.normalizedArea,WV04_CALIBRATION.epsilon)),zone.normalizedWidth,zone.widthToScale];
}
function distance(left,right){return Math.hypot(left[0]-right[0],left[1]-right[1],left[2]-right[2]);}
function grouped(zones,tolerance){
 const parent=zones.map((_,index)=>index);
 const find=index=>parent[index]===index?index:(parent[index]=find(parent[index]));
 const features=zones.map(feature);
 for(let i=0;i<zones.length;i++)for(let j=i+1;j<zones.length;j++)if(distance(features[i],features[j])<=tolerance)parent[find(i)]=find(j);
 const groups=new Map();
 zones.forEach((zone,index)=>{const root=find(index);if(!groups.has(root))groups.set(root,[]);groups.get(root).push({zone,feature:features[index]});});
 return [...groups.values()];
}
function meanPairwise(items,measure){
 if(items.length<2)return 0;
 let total=0,count=0;
 for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){total+=measure(items[i],items[j]);count+=1;}
 return count?total/count:0;
}

export function scoreWV04({zones=[],connections=[],spacing=1}={},calibration=WV04_CALIBRATION){
 const sliver=zone=>zone.normalizedWidth<calibration.sliverWidth&&zone.widthToScale<calibration.sliverProportion;
 const micro=zone=>zone.normalizedArea<calibration.microfragmentArea;
 const open=zone=>zone.territorialShare>=calibration.undefinedShare&&zone.weaveDefinition<=calibration.undefinedDefinition;
 const eligible=zones.filter(zone=>!sliver(zone)&&!micro(zone));
 const eligibleArea=eligible.reduce((sum,zone)=>sum+zone.area,0);
 const totalArea=zones.reduce((sum,zone)=>sum+zone.area,0);
 const ratio=(high,low)=>high===null||low===null?null:low<=calibration.epsilon?(high<=calibration.epsilon?1:Infinity):high/low;
 const areaRatio=ratio(percentile(eligible.map(zone=>zone.normalizedArea),.8),percentile(eligible.map(zone=>zone.normalizedArea),.2));
 const widthRatio=ratio(percentile(eligible.map(zone=>zone.normalizedWidth),.8),percentile(eligible.map(zone=>zone.normalizedWidth),.2));
 const proportionHigh=percentile(eligible.map(zone=>zone.widthToScale),.8),proportionLow=percentile(eligible.map(zone=>zone.widthToScale),.2);
 const proportionSpread=proportionHigh===null||proportionLow===null?null:Math.max(0,proportionHigh-proportionLow);
 const areaScore=eligible.length<2?0:clamp01(interpolate(areaRatio??1,calibration.areaRatio));
 const widthScore=eligible.length<2?0:clamp01(interpolate(widthRatio??1,calibration.widthRatio));
 const proportionScore=eligible.length<2||proportionSpread===null?0:clamp01(interpolate(proportionSpread,calibration.proportionSpread));
 const primary=Math.max(areaScore,widthScore,proportionScore);
 const mean=(areaScore+widthScore+proportionScore)/3;
 const geometric=clamp01(.7*primary+.3*mean);
 const clusters=grouped(eligible,calibration.featureTolerance);
 const recurring=clusters.filter(group=>group.length>=2);
 const areaOf=group=>group.reduce((sum,item)=>sum+item.zone.area,0);
 const recurringArea=recurring.reduce((sum,group)=>sum+areaOf(group),0);
 const recurringCoverage=eligibleArea>0?recurringArea/eligibleArea:0;
 const recurringScore=clamp01(interpolate(recurringCoverage,calibration.recurringCoverage));
 const ranked=[...recurring].sort((left,right)=>areaOf(right)-areaOf(left));
 const secondaryShare=eligibleArea>0&&ranked[1]?areaOf(ranked[1])/eligibleArea:0;
 const secondaryScore=clamp01(interpolate(secondaryShare,calibration.secondaryCondition));
 const centroids=recurring.map(group=>[0,1,2].map(axis=>group.reduce((sum,item)=>sum+item.feature[axis],0)/group.length));
 const between=centroids.length<2?0:meanPairwise(centroids,(left,right)=>distance(left,right));
 const within=recurring.length?recurring.reduce((sum,group)=>sum+meanPairwise(group,(left,right)=>distance(left.feature,right.feature)),0)/recurring.length:0;
 const separation=centroids.length<2?0:within<=calibration.epsilon?(between>calibration.epsilon?Infinity:0):between/within;
 const separationScore=clamp01(interpolate(separation,calibration.groupSeparation));
 const hierarchy=clamp01(Math.cbrt(recurringScore*secondaryScore*separationScore));
 const differentiation=clamp01(Math.sqrt(geometric*hierarchy));
 const fieldDefinition=eligibleArea>0?eligible.reduce((sum,zone)=>sum+zone.weaveDefinition*zone.area,0)/eligibleArea:0;
 const definitionScore=clamp01(interpolate(fieldDefinition,calibration.weaveDefinition));
 const eligibleIds=new Set(eligible.map(zone=>zone.zoneId));
 const links=new Map((connections||[]).map(connection=>[connection.connectionId,connection]));
 const connected=new Set();
 for(const connection of connections||[]){
  const width=connection.bottleneckWidth/spacing;
  const ends=(connection.zoneIds||[]).filter(id=>eligibleIds.has(id));
  if(width>=calibration.connectionThreshold&&ends.length>=2)ends.forEach(id=>connected.add(id));
 }
 for(const zone of eligible)for(const id of zone.connectionIds||[]){
  const connection=links.get(id);
  if(!connection)continue;
  const width=connection.bottleneckWidth/spacing;
  const ends=(connection.zoneIds||[]).filter(zoneId=>eligibleIds.has(zoneId));
  if(width>=calibration.connectionThreshold&&ends.length>=2&&ends.includes(zone.zoneId))connected.add(zone.zoneId);
 }
 const connectedArea=eligible.filter(zone=>connected.has(zone.zoneId)).reduce((sum,zone)=>sum+zone.area,0);
 const connectedShare=eligibleArea>0?connectedArea/eligibleArea:0;
 const continuityScore=clamp01(interpolate(connectedShare,calibration.connectedArea));
 const definitionContinuity=clamp01(Math.sqrt(definitionScore*continuityScore));
 const share=(selected,count)=>count?selected/count:0;
 const sliverZones=zones.filter(sliver),microZones=zones.filter(micro),openZones=zones.filter(open);
 const sliverArea=totalArea>0?sliverZones.reduce((sum,zone)=>sum+zone.area,0)/totalArea:0;
 const sliverCount=share(sliverZones.length,zones.length);
 const sliverBurden=.7*sliverArea+.3*sliverCount;
 const microArea=totalArea>0?microZones.reduce((sum,zone)=>sum+zone.area,0)/totalArea:0;
 const microCount=share(microZones.length,zones.length);
 const microBurden=.5*microArea+.5*microCount;
 const openShare=openZones.reduce((sum,zone)=>sum+(Number.isFinite(zone.territorialShare)?zone.territorialShare:0),0);
 const sliverCap=interpolate(sliverBurden,calibration.burden);
 const microCap=interpolate(microBurden,calibration.burden);
 const openCap=interpolate(openShare,calibration.undefinedOpen);
 const cap=Math.min(sliverCap,microCap,openCap);
 const base=Math.sqrt(differentiation*definitionContinuity);
 const normalized=Math.min(base,cap);
 const exactRating=1+4*normalized;
 const rating=Math.round(exactRating*10)/10;
 const explanation=`WV-04 scored ${rating.toFixed(1)}/5. Differentiation ${differentiation.toFixed(2)}, continuity ${definitionContinuity.toFixed(2)}${base>cap+1e-9?`, limited by degenerate cap ${cap.toFixed(2)}`:''}.`;
 return {status:'evaluated',normalized,rating,exactRating,differentiation,definitionContinuity,geometric,hierarchy,continuityScore,cap,base,eligibleCount:eligible.length,areaRatio:finite(areaRatio),areaScore,widthRatio:finite(widthRatio),widthScore,proportionSpread:finite(proportionSpread),proportionScore,primary,mean,recurringCoverage,recurringScore,secondaryShare,secondaryScore,groupSeparation:finite(separation),separationScore,fieldDefinition,definitionScore,connectedShare,sliverArea,sliverCount,sliverBurden,sliverCap,microArea,microCount,microBurden,microCap,openShare,openCap,explanation};
}
function measuredZone(zone){
 const keys=['area','normalizedArea','normalizedWidth','widthToScale','weaveDefinition','territorialShare'];
 return keys.every(key=>Number.isFinite(zone?.[key]));
}
export function evaluateWV04(context={}){
 const measured=context.modules?.interstitial;
 const reference=(context.artifacts||[]).find(item=>item.version==='interstitial-v1');
 if(measured?.status==='not_applicable')return blank('not-applicable','WV-04 has no interstitial field for this weave.');
 if(!reference||!measured||measured.status==='failed'||measured.status==='unavailable')return blank('evaluation-failed','WV-04 analysis evidence is missing.');
 try{
  const artifact=readAnalysisArtifact(context.entry,reference.artifactId);
  const zones=artifact.evidence?.zones;
  const spacing=artifact.evidence?.spacing;
  if(!Array.isArray(zones)||!(spacing>0))return blank('evaluation-failed','WV-04 interstitial measurements are missing.');
  if(zones.some(zone=>!measuredZone(zone)))return blank('evaluation-failed','WV-04 zone measurement is missing.');
  const scored=scoreWV04({zones,connections:artifact.evidence?.connections||[],spacing});
  return {criterionId:'WV-04',status:'evaluated',normalizedScore:scored.normalized,rating:scored.rating,components:{interstitialDifferentiation:scored.differentiation,interstitialContinuity:scored.definitionContinuity},submetrics:{areaRatio:scored.areaRatio,areaScore:scored.areaScore,widthRatio:scored.widthRatio,widthScore:scored.widthScore,proportionSpread:scored.proportionSpread,proportionScore:scored.proportionScore,primaryDifference:scored.primary,meanDifference:scored.mean,geometricDifferentiation:scored.geometric,recurringCoverage:scored.recurringCoverage,recurringCoverageScore:scored.recurringScore,secondaryShare:scored.secondaryShare,secondaryScore:scored.secondaryScore,groupSeparation:scored.groupSeparation,groupSeparationScore:scored.separationScore,hierarchyLegibility:scored.hierarchy,fieldWeaveDefinition:scored.fieldDefinition,weaveDefinitionScore:scored.definitionScore,connectedAreaShare:scored.connectedShare,continuityScore:scored.continuityScore,sliverAreaShare:scored.sliverArea,sliverCountShare:scored.sliverCount,sliverBurden:scored.sliverBurden,sliverCap:scored.sliverCap,microfragmentAreaShare:scored.microArea,microfragmentCountShare:scored.microCount,microfragmentBurden:scored.microBurden,microfragmentCap:scored.microCap,undefinedOpenShare:scored.openShare,undefinedOpenCap:scored.openCap,base:scored.base,normalized:scored.normalized,rating:scored.exactRating,eligibleCount:scored.eligibleCount,zoneCount:zones.length},safeguards:{degenerateInterstitial:scored.cap},evidenceRefs:[reference.artifactId],explanation:scored.explanation,warnings:[],versions:{logic:WV04_CALIBRATION.logicVersion,calibration:WV04_CALIBRATION.version}};
 }catch(error){return blank('evaluation-failed',String(error.message||'WV-04 failed.').slice(0,200));}
}
