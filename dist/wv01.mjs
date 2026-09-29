// WV-01 Differentiated Field Coherence. Thresholds stay in one calibration object.
import {ANALYSIS_GRID,readAnalysisArtifact} from './analysis.mjs';
import {resolveAnalysisGeometry} from './weave-record.mjs';

export const WV01_CALIBRATION=Object.freeze({
 version:'wv-01-calibration-v1',
 logicVersion:'wv-01-logic-v1',
 directional:[[0,0],[5,.2],[15,.7],[30,1],[90,1]],
 spacing:[[1,0],[1.1,.2],[1.25,.5],[1.5,.8],[2,1]],
 density:[[0,0],[10,.25],[25,.6],[40,.85],[60,1]],
 influenceResponse:[[0,0],[15,.3],[35,.7],[60,1]],
 spacingCompatibility:[[1.1,1],[1.25,.75],[1.5,.4],[2,0]],
 parallelAngle:15,
 crossingAngle:30,
 presenceCapThreshold:.4,
 sharedStrength:10,
 sharedCoverage:.05,
 weights:{directional:.5,rhythmic:.35,influence:.15},
 rhythmicWeights:{spacing:.6,density:.4},
 presenceCaps:{none:1,quarter:.85,half:.7,more:.5}
});

function interpolate(value,anchors){
 if(value<=anchors[0][0])return anchors[0][1];
 if(value>=anchors.at(-1)[0])return anchors.at(-1)[1];
 for(let i=1;i<anchors.length;i++){
  const [x0,y0]=anchors[i-1],[x1,y1]=anchors[i];
  if(value<=x1)return y0+(y1-y0)*(value-x0)/(x1-x0);
 }
 return anchors.at(-1)[1];
}
function clamp01(value){return Math.min(1,Math.max(0,value));}
function pairKey(a,b){return [a,b].sort().join('|');}
function weighted(rows,read){
 let weight=0,sum=0;
 for(const row of rows){
  const value=read(row);
  if(!Number.isFinite(value)||!(row.presenceWeight>0))continue;
  weight+=row.presenceWeight;
  sum+=value*row.presenceWeight;
 }
 return weight>0?sum/weight:0;
}
function insidePolygon(point,polygon){
 let inside=false;
 for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
  const a=polygon[i],b=polygon[j];
  if((a.y>point.y)!==(b.y>point.y)&&(point.x<(b.x-a.x)*(point.y-a.y)/(b.y-a.y)+a.x))inside=!inside;
 }
 return inside;
}
export function influenceCoverage(boundary,center,radius,grid=ANALYSIS_GRID){
 if(!Array.isArray(boundary)||boundary.length<3||!(radius>0)||!center)return 0;
 let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
 for(const point of boundary){minX=Math.min(minX,point.x);minY=Math.min(minY,point.y);maxX=Math.max(maxX,point.x);maxY=Math.max(maxY,point.y);}
 const width=maxX-minX,height=maxY-minY;
 if(!(width>0)||!(height>0))return 0;
 let inside=0,covered=0;
 for(let row=0;row<grid;row++)for(let col=0;col<grid;col++){
  const point={x:minX+(col+.5)*width/grid,y:minY+(row+.5)*height/grid};
  if(!insidePolygon(point,boundary))continue;
  inside+=1;
  if(Math.hypot(point.x-center.x,point.y-center.y)<radius)covered+=1;
 }
 return inside?covered/inside:0;
}
function blank(status,explanation,warnings=[]){
 return {criterionId:'WV-01',status,normalizedScore:null,rating:null,components:{},submetrics:{},safeguards:{},evidenceRefs:[],explanation,warnings,versions:{logic:WV01_CALIBRATION.logicVersion,calibration:WV01_CALIBRATION.version}};
}

export function scoreWV01({families=[],pairs=[],influences=[]}={},calibration=WV01_CALIBRATION){
 const active=families.filter(family=>family.retainedStrandCount>0);
 if(active.length<2)return {status:'not-applicable',explanation:'WV-01 needs at least two active families.'};
 if(!pairs.length)return {status:'evaluation-failed',explanation:'Directional family pairs are missing.'};
 const presence=new Map(active.map(family=>[family.familyId,family.presence]));
 const scored=pairs.map(pair=>{
  const presenceA=presence.get(pair.familyA)??0,presenceB=presence.get(pair.familyB)??0;
  const directional=interpolate(pair.angleDifference,calibration.directional);
  const spacingScore=interpolate(pair.spacingRatio,calibration.spacing);
  const densityKnown=Number.isFinite(pair.densityDifference);
  const rhythmic=densityKnown?calibration.rhythmicWeights.spacing*spacingScore+calibration.rhythmicWeights.density*interpolate(pair.densityDifference,calibration.density):spacingScore;
  const shared=influences.filter(influence=>influence.enabled!==false&&influence.coverage>0&&Number.isFinite(influence.strengths?.[pair.familyA])&&Number.isFinite(influence.strengths?.[pair.familyB]));
  const influenceWeight=shared.reduce((sum,influence)=>sum+influence.coverage,0);
  const influence=influenceWeight>0?shared.reduce((sum,influence)=>sum+interpolate(Math.abs(influence.strengths[pair.familyA]-influence.strengths[pair.familyB]),calibration.influenceResponse)*influence.coverage,0)/influenceWeight:null;
  const weights=calibration.weights;
  const distinctness=influence===null?(weights.directional*directional+weights.rhythmic*rhythmic)/(weights.directional+weights.rhythmic):weights.directional*directional+weights.rhythmic*rhythmic+weights.influence*influence;
  const crossing=clamp01(Math.sin(pair.angleDifference*Math.PI/180)/Math.sin(calibration.crossingAngle*Math.PI/180));
  const parallel=pair.angleDifference<calibration.parallelAngle?(1-pair.angleDifference/calibration.parallelAngle)*interpolate(pair.spacingRatio,calibration.spacingCompatibility):0;
  const uses=(influence,id)=>influence.enabled!==false&&(influence.strengths?.[id]??0)>=calibration.sharedStrength;
  const union=influences.filter(influence=>uses(influence,pair.familyA)||uses(influence,pair.familyB));
  const unionWeight=union.reduce((sum,influence)=>sum+Math.max(0,influence.coverage||0),0);
  const sharedWeight=union.filter(influence=>uses(influence,pair.familyA)&&uses(influence,pair.familyB)&&(influence.coverage||0)>=calibration.sharedCoverage).reduce((sum,influence)=>sum+influence.coverage,0);
  const sharedCoupling=unionWeight>0?sharedWeight/unionWeight:0;
  const coupling=1-(1-crossing)*(1-parallel)*(1-sharedCoupling);
  return {familyA:pair.familyA,familyB:pair.familyB,angle:pair.angleDifference,spacingRatio:pair.spacingRatio,densityDifference:densityKnown?pair.densityDifference:null,presenceWeight:Math.sqrt(presenceA*presenceB),directional,rhythmic,influence,distinctness,crossing,parallel,shared:sharedCoupling,coupling};
 });
 const familyDistinctness=clamp01(weighted(scored,row=>row.distinctness));
 const relationalCoupling=clamp01(weighted(scored,row=>row.coupling));
 const weak=active.filter(family=>family.presence<calibration.presenceCapThreshold).length/active.length;
 const presenceCap=weak===0?calibration.presenceCaps.none:weak<=.25?calibration.presenceCaps.quarter:weak<=.5?calibration.presenceCaps.half:calibration.presenceCaps.more;
 const base=Math.sqrt(familyDistinctness*relationalCoupling);
 const normalized=Math.min(base,presenceCap);
 const exactRating=1+4*normalized;
 const rating=Math.round(exactRating*10)/10;
 const explanation=`WV-01 scored ${rating.toFixed(1)}/5. Distinctness ${familyDistinctness.toFixed(2)} and coupling ${relationalCoupling.toFixed(2)}${base>presenceCap+1e-9?`, limited by presence cap ${presenceCap.toFixed(2)}`:''}.`;
 return {status:'evaluated',normalized,rating,exactRating,familyDistinctness,relationalCoupling,presenceCap,base,explanation,pairs:scored,families:active.map(family=>({familyId:family.familyId,retainedStrandCount:family.retainedStrandCount,presence:family.presence}))};
}

function revisionFor(entry,analysisRunId){
 const run=(entry?.derivedAnalysis?.runs||[]).find(item=>item.analysisRunId===analysisRunId);
 const revisions=entry?.revisions||[];
 return revisions.find(revision=>revision.geometryRef?.geometryFingerprint&&revision.geometryRef.geometryFingerprint===run?.geometryFingerprint)||revisions.find(revision=>revision.id===entry?.generatorRevisionId)||revisions.at(-1)||null;
}
function evidenceFor(entry,artifacts,version){
 const reference=(artifacts||[]).find(item=>item.version===version);
 if(!reference)return null;
 return readAnalysisArtifact(entry,reference.artifactId);
}
export function evaluateWV01(context={}){
 const artifacts=context.artifacts||[];
 const refs=artifacts.filter(item=>['family-presence-v1','directional-v1','rhythmic-v1'].includes(item.version)).map(item=>item.artifactId);
 try{
  const presence=evidenceFor(context.entry,artifacts,'family-presence-v1');
  const directional=evidenceFor(context.entry,artifacts,'directional-v1');
  const rhythmic=evidenceFor(context.entry,artifacts,'rhythmic-v1');
  if(!presence||!directional||!rhythmic)return blank('evaluation-failed','WV-01 analysis evidence is missing.');
  const rhythm=new Map((rhythmic.evidence?.pairs||[]).map(pair=>[pairKey(pair.familyA,pair.familyB),pair]));
  const pairs=(directional.evidence?.pairs||[]).map(pair=>{
   const match=rhythm.get(pairKey(pair.familyA,pair.familyB));
   return {familyA:pair.familyA,familyB:pair.familyB,angleDifference:pair.angleDifference,spacingRatio:match?.spacingRatio,densityDifference:match?.densityDifference??null};
  }).filter(pair=>pair.spacingRatio>0);
  const revision=revisionFor(context.entry,context.analysisRunId);
  const keys=new Map((presence.evidence?.families||[]).map(family=>[family.familyId,family.key]));
  let influences=[];
  const warnings=[];
  const saved=(revision?.generation?.influences||[]).filter(influence=>influence.enabled!==false);
  if(saved.length){
   try{
    const boundary=resolveAnalysisGeometry(context.project,revision).boundary;
    influences=saved.map(influence=>({id:influence.id,enabled:true,coverage:influenceCoverage(boundary,influence.center,influence.radius),strengths:Object.fromEntries((presence.evidence?.families||[]).map(family=>[family.familyId,influence.families?.[keys.get(family.familyId)]?.strength]))}));
   }catch(error){warnings.push(String(error.message||'Influence coverage could not be measured.').slice(0,200));}
  }
  const scored=scoreWV01({families:presence.evidence?.families||[],pairs,influences});
  if(scored.status!=='evaluated')return blank(scored.status,scored.explanation,warnings);
  return {criterionId:'WV-01',status:'evaluated',normalizedScore:scored.normalized,rating:scored.rating,components:{familyDistinctness:scored.familyDistinctness,relationalCoupling:scored.relationalCoupling},submetrics:{base:scored.base,normalized:scored.normalized,rating:scored.exactRating,pairs:scored.pairs,families:scored.families},safeguards:{effectiveFamilyPresence:scored.presenceCap},evidenceRefs:refs,explanation:scored.explanation,warnings,versions:{logic:WV01_CALIBRATION.logicVersion,calibration:WV01_CALIBRATION.version}};
 }catch(error){return blank('evaluation-failed',String(error.message||'WV-01 failed.').slice(0,200));}
}
