// WV-02 Calibrated Field Modulation. Thresholds stay in one calibration object.
import {readAnalysisArtifact} from './analysis.mjs';

export const WV02_CALIBRATION=Object.freeze({
 version:'wv-02-calibration-v1',
 logicVersion:'wv-02-logic-v1',
 effective:[[.05,0],[.1,.35],[.2,.75],[.3,1],[.6,1],[.8,.8],[1,.6],[1.5,.2],[2,0]],
 coverage:[[.05,0],[.15,.4],[.3,.8],[.45,1]],
 contrast:[[.1,0],[.2,.35],[.35,.7],[.5,1]],
 coordination:[[.2,0],[.35,.4],[.5,.7],[.7,1]],
 retention:[[.3,0],[.4,.3],[.55,.6],[.7,.85],[.8,1]],
 retentionFloor:.3,
 retentionSpan:.7
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
function blank(status,explanation,warnings=[]){
 return {criterionId:'WV-02',status,normalizedScore:null,rating:null,components:{},submetrics:{},safeguards:{},evidenceRefs:[],explanation,warnings,versions:{logic:WV02_CALIBRATION.logicVersion,calibration:WV02_CALIBRATION.version}};
}

export function scoreWV02(measurements={},calibration=WV02_CALIBRATION){
 if(!Number.isFinite(measurements.m75)||!Number.isFinite(measurements.coverage)||!Number.isFinite(measurements.contrast))return {status:'evaluation-failed',explanation:'The modulation map is missing.'};
 if(!Number.isFinite(measurements.orientationRetention))return {status:'evaluation-failed',explanation:'Orientation retention is missing.'};
 const overlap=measurements.overlapCount||0;
 if(overlap>0&&!Number.isFinite(measurements.coordinationMedian))return {status:'evaluation-failed',explanation:'Influence coordination is missing.'};
 const effective=clamp01(interpolate(measurements.m75,calibration.effective));
 const coverageScore=clamp01(interpolate(measurements.coverage,calibration.coverage));
 const contrastScore=clamp01(interpolate(measurements.contrast,calibration.contrast));
 const spatial=clamp01(Math.sqrt(coverageScore*contrastScore));
 const coordination=overlap>0?clamp01(interpolate(measurements.coordinationMedian,calibration.coordination)):1;
 const retentionScore=clamp01(interpolate(measurements.orientationRetention,calibration.retention));
 const retentionCap=calibration.retentionFloor+calibration.retentionSpan*retentionScore;
 const base=Math.cbrt(effective*spatial*coordination);
 const normalized=Math.min(base,retentionCap);
 const exactRating=1+4*normalized;
 const rating=Math.round(exactRating*10)/10;
 const explanation=`WV-02 scored ${rating.toFixed(1)}/5. Modulation ${effective.toFixed(2)}, differentiation ${spatial.toFixed(2)}, coordination ${coordination.toFixed(2)}${base>retentionCap+1e-9?`, limited by retention cap ${retentionCap.toFixed(2)}`:''}.`;
 return {status:'evaluated',normalized,rating,exactRating,effective,spatial,coordination,coverageScore,contrastScore,retentionScore,retentionCap,base,explanation};
}

function savedInfluences(entry,analysisRunId){
 const run=(entry?.derivedAnalysis?.runs||[]).find(item=>item.analysisRunId===analysisRunId);
 const revision=(entry?.revisions||[]).find(item=>item.geometryRef?.geometryFingerprint===run?.geometryFingerprint);
 return (revision?.generation?.influences||[]).filter(item=>item.enabled!==false).map(item=>({id:item.id,kind:item.kind,enabled:true,strengths:Object.fromEntries(Object.entries(item.families||{}).map(([key,value])=>[key,Number.isFinite(value?.strength)?value.strength:null]))}));
}
export function evaluateWV02(context={}){
 const measured=context.modules?.modulation;
 const reference=(context.artifacts||[]).find(item=>item.version==='modulation-v1');
 if(measured?.status==='not_applicable')return blank('not-applicable','WV-02 has no modulation map for this weave.');
 if(!reference||!measured||measured.status==='failed'||measured.status==='unavailable')return blank('evaluation-failed','WV-02 analysis evidence is missing.');
 try{
  const artifact=readAnalysisArtifact(context.entry,reference.artifactId);
  const scored=scoreWV02({m75:measured.m75,coverage:measured.coverage,contrast:measured.contrast,coordinationMedian:measured.coordinationMedian,overlapCount:measured.overlapCount,orientationRetention:measured.orientationRetention});
  if(scored.status!=='evaluated')return blank(scored.status,scored.explanation);
  const finite=value=>Number.isFinite(value)?value:null;
  const families=(artifact.evidence?.families||[]).map(family=>({familyId:family.familyId,m75:finite(family.m75),coverage:finite(family.coverage),p10:finite(family.p10),p90:finite(family.p90),contrast:finite(family.contrast)}));
  return {criterionId:'WV-02',status:'evaluated',normalizedScore:scored.normalized,rating:scored.rating,components:{effectiveModulation:scored.effective,spatialDifferentiation:scored.spatial,fieldCoordination:scored.coordination},submetrics:{m75:measured.m75,coverage:measured.coverage,coverageScore:scored.coverageScore,contrast:measured.contrast,contrastScore:scored.contrastScore,overlapCount:measured.overlapCount||0,coordinationMedian:Number.isFinite(measured.coordinationMedian)?measured.coordinationMedian:null,orientationRetention:measured.orientationRetention,retentionScore:scored.retentionScore,base:scored.base,normalized:scored.normalized,rating:scored.exactRating,families,influences:savedInfluences(context.entry,context.analysisRunId)},safeguards:{fieldRetention:scored.retentionCap},evidenceRefs:[reference.artifactId],explanation:scored.explanation,warnings:[],versions:{logic:WV02_CALIBRATION.logicVersion,calibration:WV02_CALIBRATION.version}};
 }catch(error){return blank('evaluation-failed',String(error.message||'WV-02 failed.').slice(0,200));}
}
