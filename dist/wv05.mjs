// WV-05 Layered Family Interdependence. Family removal uses stored centerlines.
// Partition-change anchors are first-pass calibration values.
import {analyzeWeave,counterfactualSignature,readAnalysisArtifact} from './analysis.mjs';
import {resolveAnalysisGeometry} from './weave-record.mjs';

export const WV05_CALIBRATION=Object.freeze({
 version:'wv-05-calibration-v1',
 logicVersion:'wv-05-logic-v1',
 coverage:[[.03,0],[.1,.3],[.25,.65],[.45,1]],
 intensity:[[.05,0],[.15,.3],[.3,.65],[.5,1]],
 shared:[[.05,0],[.15,.35],[.3,.7],[.5,1]],
 partition:[[.05,0],[.15,.35],[.35,.7],[.55,1]],
 noise:.03,
 relevantPair:.15,
 lowConsequence:.3,
 primaryWeight:.7,
 breadthWeight:.3,
 typicalRedundancy:.65,
 worstRedundancy:.35,
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
function percentile(values,p){
 if(!values.length)return null;
 const sorted=[...values].sort((a,b)=>a-b),index=(sorted.length-1)*p,lo=Math.floor(index),hi=Math.ceil(index);
 return sorted[lo]+(sorted[hi]-sorted[lo])*(index-lo);
}
function blank(status,explanation,warnings=[]){
 return {criterionId:'WV-05',status,normalizedScore:null,rating:null,components:{},submetrics:{},safeguards:{},evidenceRefs:[],explanation,warnings,versions:{logic:WV05_CALIBRATION.logicVersion,calibration:WV05_CALIBRATION.version}};
}
function finiteChannels(channels={}){
 return Object.entries(channels).filter(([,value])=>Number.isFinite(value));
}
function irrelevantCap(share){
 if(share<=0)return 1;
 if(share<=.15)return .9;
 if(share<=.25)return .8;
 if(share<=.34)return .7;
 if(share<=.5)return .55;
 return .4;
}
function consequenceOf(channels,calibration){
 const values=finiteChannels(channels).map(([,value])=>clamp01(value));
 if(!values.length)return 0;
 const primary=Math.max(...values);
 const breadth=values.reduce((sum,value)=>sum+value,0)/values.length;
 return clamp01(calibration.primaryWeight*primary+calibration.breadthWeight*breadth);
}

export function scoreWV05({families=[],pairs=[]}={},calibration=WV05_CALIBRATION){
 if(families.length<2)return {status:'not-applicable',explanation:'WV-05 needs at least two active families.'};
 const profiles=families.map(family=>({familyId:family.familyId,channels:family.channels,consequence:consequenceOf(family.channels,calibration)}));
 const fieldConsequence=profiles.reduce((sum,family)=>sum+family.consequence,0)/profiles.length;
 const scoredPairs=pairs.map(pair=>{
  const channels=Object.entries(pair.channels||{}).filter(([,value])=>Number.isFinite(value?.both)).map(([name,value])=>({name,both:clamp01(value.both),redundancy:clamp01(value.redundancy),overlap:clamp01(value.overlap),left:clamp01(value.left),right:clamp01(value.right)}));
  const weight=channels.reduce((sum,channel)=>sum+(channel.both>0?channel.both:0),0);
  const redundancy=weight>0?channels.reduce((sum,channel)=>sum+(channel.both>0?channel.redundancy*channel.both:0),0)/weight:0;
  const pairConsequence=channels.reduce((max,channel)=>Math.max(max,channel.both),0);
  const joints=channels.map(channel=>clamp01(channel.overlap*Math.sqrt(channel.left*channel.right)));
  const primary=joints.length?Math.max(...joints):0;
  const breadth=joints.length?joints.reduce((sum,value)=>sum+value,0)/joints.length:0;
  return {familyA:pair.familyA,familyB:pair.familyB,redundancy:clamp01(redundancy),consequence:pairConsequence,shared:clamp01(calibration.primaryWeight*primary+calibration.breadthWeight*breadth),relevant:pairConsequence>=calibration.relevantPair};
 });
 const relevant=scoredPairs.filter(pair=>pair.relevant);
 const relevantWeight=relevant.reduce((sum,pair)=>sum+pair.consequence,0);
 const typical=relevantWeight>0?relevant.reduce((sum,pair)=>sum+pair.redundancy*pair.consequence,0)/relevantWeight:0;
 const worst=relevant.reduce((max,pair)=>Math.max(max,pair.redundancy),0);
 const burden=relevant.length?clamp01(calibration.typicalRedundancy*typical+calibration.worstRedundancy*worst):0;
 const nonRedundant=clamp01(1-burden);
 const familyShared=profiles.map(family=>{
  const related=scoredPairs.filter(pair=>pair.familyA===family.familyId||pair.familyB===family.familyId);
  return related.length?Math.max(...related.map(pair=>pair.shared)):0;
 });
 const rawShared=familyShared.reduce((sum,value)=>sum+value,0)/familyShared.length;
 const sharedScore=clamp01(interpolate(rawShared,calibration.shared));
 const complementary=clamp01(Math.sqrt(nonRedundant*sharedScore));
 const lowShare=profiles.filter(family=>family.consequence<calibration.lowConsequence).length/profiles.length;
 const cap=irrelevantCap(lowShare);
 const base=Math.sqrt(fieldConsequence*complementary);
 const normalized=Math.min(base,cap);
 const exactRating=1+4*normalized;
 const rating=Math.round(exactRating*10)/10;
 const explanation=`WV-05 scored ${rating.toFixed(1)}/5. Consequence ${fieldConsequence.toFixed(2)}, interdependence ${complementary.toFixed(2)}${base>cap+1e-9?`, limited by irrelevant-family cap ${cap.toFixed(2)}`:''}.`;
 return {status:'evaluated',normalized,rating,exactRating,fieldConsequence,complementary,nonRedundant,sharedScore,burden,cap,base,lowShare,profiles,pairs:scoredPairs,explanation};
}

function channelContribution(deltas,calibration){
 if(!deltas.length)return 0;
 const changed=deltas.filter(value=>value>calibration.noise);
 const coverage=changed.length/deltas.length;
 const intensity=percentile(changed,.75)??0;
 return clamp01(Math.sqrt(clamp01(interpolate(coverage,calibration.coverage))*clamp01(interpolate(intensity,calibration.intensity))));
}
function distributionDelta(left,right){
 const leftSum=left.reduce((sum,value)=>sum+value,0),rightSum=right.reduce((sum,value)=>sum+value,0);
 if(leftSum===0&&rightSum===0)return 0;
 if(leftSum===0||rightSum===0)return 1;
 let a=0,b=0;
 for(let i=0;i<left.length;i++){
  const mid=.5*(left[i]+right[i]);
  if(left[i]>0&&mid>0)a+=left[i]*Math.log2(left[i]/mid);
  if(right[i]>0&&mid>0)b+=right[i]*Math.log2(right[i]/mid);
 }
 return clamp01(.5*a+.5*b);
}
function mapDelta(full,minus,read){
 return full.samples.map((sample,index)=>clamp01(read(sample,minus.samples[index])));
}
function directionalDelta(full,minus){return mapDelta(full,minus,(sample,other)=>distributionDelta(sample.directional,other.directional));}
function rhythmDelta(full,minus){
 return mapDelta(full,minus,(sample,other)=>{
  const gaps=distributionDelta(sample.rhythm,other.rhythm);
  const regularity=sample.irregularity===null&&other.irregularity===null?0:clamp01(Math.abs((sample.irregularity??0)-(other.irregularity??0)));
  return 1-(1-gaps)*(1-regularity);
 });
}
function modulationDelta(full,minus){
 return mapDelta(full,minus,(sample,other)=>{
  const net=clamp01(Math.abs((sample.modulationNet??0)-(other.modulationNet??0)));
  const activity=clamp01(Math.abs((sample.modulationActivity??0)-(other.modulationActivity??0)));
  return 1-(1-net)*(1-activity);
 });
}
function eventDelta(full,minus){
 return mapDelta(full,minus,(sample,other)=>sample.events.reduce((sum,value,index)=>sum+Math.abs(value-other.events[index]),0)/sample.events.length);
}
function clearanceDelta(full,minus){return mapDelta(full,minus,(sample,other)=>Math.abs(sample.clearance-other.clearance));}
function partitionShare(full,minus){
 const changed=new Set();
 const group=labels=>{
  const groups=new Map();
  labels.forEach((label,index)=>{if(!groups.has(label))groups.set(label,[]);groups.get(label).push(index);});
  return [...groups.values()];
 };
 const fullLabels=full.samples.map(sample=>sample.domain),minusLabels=minus.samples.map(sample=>sample.domain);
 for(const indices of group(fullLabels))if(new Set(indices.map(index=>minusLabels[index])).size>1)indices.forEach(index=>changed.add(index));
 for(const indices of group(minusLabels))if(new Set(indices.map(index=>fullLabels[index])).size>1)indices.forEach(index=>changed.add(index));
 return changed.size/fullLabels.length;
}
function interstitialContribution(full,minus,calibration){
 const clearance=channelContribution(clearanceDelta(full,minus),calibration);
 const partition=clamp01(interpolate(partitionShare(full,minus),calibration.partition));
 return clamp01(1-(1-clearance)*(1-partition));
}
function excessContribution(left,right,both,calibration){
 const excess=left.map((value,index)=>Math.max(0,both[index]-(1-(1-value)*(1-right[index]))));
 return channelContribution(excess,calibration);
}
function overlapOf(left,right,calibration){
 let numerator=0,denominator=0;
 for(let i=0;i<left.length;i++){numerator+=Math.min(left[i],right[i]);denominator+=Math.max(left[i],right[i]);}
 return denominator>calibration.epsilon?numerator/denominator:0;
}
function authoredAngle(carrier,key){
 if(!carrier||carrier.kind==='stitch-recipe-v1')return null;
 if(carrier.generatorVersion==='rect-v1')return (carrier.angleDegrees||0)+(key==='B'?90:0);
 const angle=carrier.families?.[key]?.angleDegrees;
 return Number.isFinite(angle)?angle:null;
}
function fieldFor(project,revision,familyIds){
 const snapshot=resolveAnalysisGeometry(project,revision);
 const identity=revision.strandIdentity,allow=new Set(familyIds);
 const byStrand=new Map(identity.strands.map(strand=>[strand.strandId,strand.familyId]));
 return {boundary:snapshot.boundary,influences:revision.generation?.influences||[],families:identity.families.filter(family=>allow.has(family.familyId)).map(family=>{
  const source=revision.carrier?.families?.[family.key]||{};
  return {familyId:family.familyId,key:family.key,spacing:source.spacing,density:source.density,offset:source.offset,angleDegrees:authoredAngle(revision.carrier,family.key),retainedStrandCount:family.retainedStrandCount};
 }),strands:snapshot.strands.map(strand=>({...strand,familyId:byStrand.get(strand.strandId)})).filter(strand=>allow.has(strand.familyId))};
}
function sameSamples(full,other){return other?.status==='complete'&&other.sampleCount===full.sampleCount;}

export function evaluateWV05(context={}){
 const required=['directional','rhythmic','events','interstitial'];
 if(required.some(id=>context.modules?.[id]?.status!=='complete'))return blank('evaluation-failed','WV-05 analysis evidence is missing.');
 try{
  const presence=(context.artifacts||[]).find(item=>item.version==='family-presence-v1');
  if(!presence)return blank('evaluation-failed','WV-05 analysis evidence is missing.');
  const families=readAnalysisArtifact(context.entry,presence.artifactId).evidence?.families||[];
  const active=families.filter(family=>family.retainedStrandCount>0);
  if(active.length<2)return blank('not-applicable','WV-05 needs at least two active families.');
  const run=(context.entry?.derivedAnalysis?.runs||[]).find(item=>item.analysisRunId===context.analysisRunId);
  const revision=(context.entry?.revisions||[]).find(item=>item.geometryRef?.geometryFingerprint===run?.geometryFingerprint);
  if(!revision)return blank('evaluation-failed','WV-05 pinned geometry is missing.');
  const modulationApplies=(revision.generation?.influences||[]).some(item=>item.enabled!==false);
  if(modulationApplies&&context.modules?.modulation?.status!=='complete')return blank('evaluation-failed','WV-05 modulation evidence is missing.');
  const ids=active.map(family=>family.familyId);
  const full=counterfactualSignature(fieldFor(context.project,revision,ids));
  if(full.status!=='complete')return blank('evaluation-failed','WV-05 counterfactual field is unavailable.');
  const removed=new Map();
  const signatureFor=familyIds=>{
   const key=[...familyIds].sort().join('+');
   if(!removed.has(key))removed.set(key,counterfactualSignature(fieldFor(context.project,revision,familyIds),{spacing:full.spacing}));
   return removed.get(key);
  };
  for(const id of ids)analyzeWeave(context.project,context.entry,{familyIds:ids.filter(item=>item!==id)});
  for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++)analyzeWeave(context.project,context.entry,{familyIds:ids.filter(item=>item!==ids[i]&&item!==ids[j])});
  const singles=new Map();
  for(const id of ids){
   const minus=signatureFor(ids.filter(item=>item!==id));
   if(!sameSamples(full,minus))return blank('evaluation-failed','WV-05 family-removal field is unavailable.');
   const channels={directional:channelContribution(directionalDelta(full,minus),WV05_CALIBRATION),rhythmic:channelContribution(rhythmDelta(full,minus),WV05_CALIBRATION),events:channelContribution(eventDelta(full,minus),WV05_CALIBRATION),interstitial:interstitialContribution(full,minus,WV05_CALIBRATION)};
   if(modulationApplies)channels.modulation=channelContribution(modulationDelta(full,minus),WV05_CALIBRATION);
   singles.set(id,{minus,channels});
  }
  const pairs=[];
  for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){
   const both=signatureFor(ids.filter(item=>item!==ids[i]&&item!==ids[j]));
   if(!sameSamples(full,both))return blank('evaluation-failed','WV-05 pair-removal field is unavailable.');
   const left=singles.get(ids[i]),right=singles.get(ids[j]);
   const names=modulationApplies?['directional','rhythmic','events','interstitial','modulation']:['directional','rhythmic','events','interstitial'];
   const channels={};
   for(const name of names){
    const delta=name==='interstitial'?clearanceDelta:name==='directional'?directionalDelta:name==='rhythmic'?rhythmDelta:name==='events'?eventDelta:modulationDelta;
    const leftMap=delta(full,left.minus),rightMap=delta(full,right.minus),bothMap=delta(full,both);
    channels[name]={left:left.channels[name],right:right.channels[name],both:name==='interstitial'?interstitialContribution(full,both,WV05_CALIBRATION):channelContribution(bothMap,WV05_CALIBRATION),redundancy:excessContribution(leftMap,rightMap,bothMap,WV05_CALIBRATION),overlap:overlapOf(leftMap,rightMap,WV05_CALIBRATION)};
   }
   pairs.push({familyA:ids[i],familyB:ids[j],channels});
  }
  const scored=scoreWV05({families:ids.map(id=>({familyId:id,channels:singles.get(id).channels})),pairs});
  if(scored.status!=='evaluated')return blank(scored.status,scored.explanation);
  const evidence=[presence.artifactId];
  for(const version of ['directional-v1','rhythmic-v1','relational-events-v1','interstitial-v1',...(modulationApplies?['modulation-v1']:[])]){
   const found=(context.artifacts||[]).find(item=>item.version===version);
   if(found)evidence.push(found.artifactId);
  }
  return {criterionId:'WV-05',status:'evaluated',normalizedScore:scored.normalized,rating:scored.rating,components:{familyConsequence:scored.fieldConsequence,complementaryInterdependence:scored.complementary},submetrics:{nonRedundantComplementarity:scored.nonRedundant,sharedInterdependence:scored.sharedScore,redundancyBurden:scored.burden,lowConsequenceShare:scored.lowShare,base:scored.base,normalized:scored.normalized,rating:scored.exactRating,families:scored.profiles.map(family=>({familyId:family.familyId,consequence:family.consequence,directional:family.channels.directional,rhythmic:family.channels.rhythmic,events:family.channels.events,interstitial:family.channels.interstitial,modulation:Number.isFinite(family.channels.modulation)?family.channels.modulation:null})),pairs:scored.pairs.map(pair=>({familyA:pair.familyA,familyB:pair.familyB,redundancy:pair.redundancy,shared:pair.shared,consequence:pair.consequence}))},safeguards:{irrelevantFamily:scored.cap},evidenceRefs:evidence,explanation:scored.explanation,warnings:[],versions:{logic:WV05_CALIBRATION.logicVersion,calibration:WV05_CALIBRATION.version}};
 }catch(error){return blank('evaluation-failed',String(error.message||'WV-05 failed.').slice(0,200));}
}
