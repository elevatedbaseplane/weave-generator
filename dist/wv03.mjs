// WV-03 Relational Event Hierarchy. Specified anchors are copied from the handoff.
// Curves the handoff names but does not number are first-pass calibration values.
import {ANALYSIS_GRID,readAnalysisArtifact} from './analysis.mjs';
import {resolveAnalysisGeometry} from './weave-record.mjs';

export const WV03_CALIBRATION=Object.freeze({
 version:'wv-03-calibration-v1',
 logicVersion:'wv-03-logic-v1',
 highSalience:[[.2,0],[.35,.35],[.55,.7],[.75,1]],
 salienceSpread:[[.1,0],[.2,.35],[.35,.7],[.5,1]],
 levelSeparation:[[.1,0],[.2,.35],[.35,.7],[.5,1]],
 scarcity:[[.05,.4],[.1,.6],[.2,.85],[.3,1]],
 saturation:[[.45,1],[.55,.85],[.65,.65],[.75,.45]],
 recurringActivity:[[.1,0],[.3,.5],[.6,1]],
 conditionSeparation:[[.1,0],[.2,.35],[.35,.7],[.5,1]],
 quietBelow:.2,
 majorAbove:.6,
 activeSalience:.2,
 highSalienceLevel:.6,
 minLevelShare:.05,
 localRadiusFactor:1,
 regionalRadiusFactor:3,
 similarityTolerance:.15,
 epsilon:1e-9
});

function interpolate(value,anchors){
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
function median(values){
 if(!values.length)return null;
 const sorted=[...values].sort((a,b)=>a-b),mid=Math.floor(sorted.length/2);
 return sorted.length%2?sorted[mid]:(sorted[mid-1]+sorted[mid])/2;
}
function blank(status,explanation,warnings=[]){
 return {criterionId:'WV-03',status,normalizedScore:null,rating:null,components:{},submetrics:{},safeguards:{},evidenceRefs:[],explanation,warnings,versions:{logic:WV03_CALIBRATION.logicVersion,calibration:WV03_CALIBRATION.version}};
}
function connected(cells){
 const key=(cell)=>`${cell.col},${cell.row}`;
 const lookup=new Map(cells.map(cell=>[key(cell),cell]));
 const seen=new Set();
 const groups=[];
 for(const cell of cells){
  if(seen.has(key(cell)))continue;
  const group=[];
  const stack=[cell];
  seen.add(key(cell));
  while(stack.length){
   const current=stack.pop();
   group.push(current);
   for(const next of [[1,0],[-1,0],[0,1],[0,-1]]){
    const neighbor=lookup.get(`${current.col+next[0]},${current.row+next[1]}`);
    if(neighbor&&!seen.has(key(neighbor))){seen.add(key(neighbor));stack.push(neighbor);}
   }
  }
  groups.push(group);
 }
 return groups;
}
function largestShare(cells){
 if(!cells.length)return 0;
 return Math.max(...connected(cells).map(group=>group.length))/cells.length;
}
function regionExtent(group,cellSize){
 const cols=group.map(cell=>cell.col),rows=group.map(cell=>cell.row);
 return Math.max(Math.max(...cols)-Math.min(...cols),Math.max(...rows)-Math.min(...rows))*cellSize;
}

export function scoreWV03({eventSalience=[],samples=[],events=[],spacing=1,cellSize=1}={},calibration=WV03_CALIBRATION){
 const saliences=eventSalience.filter(Number.isFinite);
 const high=percentile(saliences,.85)??0;
 const low=percentile(saliences,.25)??0;
 const highScore=clamp01(interpolate(high,calibration.highSalience));
 const spreadScore=clamp01(interpolate(Math.max(0,high-low),calibration.salienceSpread));
 const salienceDifferentiation=clamp01(Math.sqrt(highScore*spreadScore));
 const total=Math.max(samples.length,1);
 const share=band=>samples.filter(sample=>band(sample.salience)).length/total;
 const quietShare=share(value=>value<calibration.quietBelow);
 const secondaryShare=share(value=>value>=calibration.quietBelow&&value<=calibration.majorAbove);
 const majorShare=share(value=>value>calibration.majorAbove);
 const present=[quietShare,secondaryShare,majorShare].filter(value=>value>=calibration.minLevelShare).length;
 const levelPresence=present/3;
 const admitted=share=>share>=calibration.minLevelShare;
 const majorValues=admitted(majorShare)?samples.filter(sample=>sample.salience>calibration.majorAbove).map(sample=>sample.salience):[];
 const secondaryValues=admitted(secondaryShare)?samples.filter(sample=>sample.salience>=calibration.quietBelow&&sample.salience<=calibration.majorAbove).map(sample=>sample.salience):[];
 const majorMedian=median(majorValues),secondaryMedian=median(secondaryValues);
 const separation=majorMedian===null||secondaryMedian===null?0:(majorMedian-secondaryMedian)/Math.max(majorMedian,calibration.epsilon);
 const separationScore=clamp01(interpolate(Math.max(0,separation),calibration.levelSeparation));
 const majorCells=admitted(majorShare)?samples.filter(sample=>sample.salience>calibration.majorAbove):[];
 const secondaryCells=admitted(secondaryShare)?samples.filter(sample=>sample.salience>=calibration.quietBelow&&sample.salience<=calibration.majorAbove):[];
 const shares=[largestShare(majorCells),largestShare(secondaryCells)].filter(value=>value>0);
 const legibility=shares.length?shares.reduce((sum,value)=>sum+value,0)/shares.length:0;
 const extents=[...connected(majorCells),...connected(secondaryCells)].map(group=>regionExtent(group,cellSize));
 const hasLocal=extents.some(extent=>extent<=calibration.localRadiusFactor*spacing);
 const hasRegional=extents.some(extent=>extent>=calibration.regionalRadiusFactor*spacing);
 const scaleScore=hasLocal&&hasRegional?1:hasLocal||hasRegional?0.5:0;
 const spatial=clamp01(Math.sqrt(Math.sqrt(levelPresence*separationScore*legibility*scaleScore)));
 const meaningful=events.filter(event=>event.salience>=calibration.activeSalience);
 const band=event=>`${event.eventType}|${event.signature||''}|${Math.round(event.salience/calibration.similarityTolerance)}`;
 const groups=new Map();
 for(const event of meaningful){
  const id=band(event);
  if(!groups.has(id))groups.set(id,[]);
  groups.get(id).push(event);
 }
 const recurring=[...groups.values()].filter(group=>group.length>=2);
 const activity=events=>events.reduce((sum,event)=>sum+event.salience,0);
 const totalActivity=activity(meaningful);
 const recurringShare=totalActivity>0?activity(recurring.flat())/totalActivity:0;
 const recurringScore=clamp01(interpolate(recurringShare,calibration.recurringActivity));
 const weights=recurring.map(group=>activity(group)).filter(value=>value>0);
 const weightTotal=weights.reduce((sum,value)=>sum+value,0);
 const evenness=weights.length<2?0:-weights.reduce((sum,value)=>{const p=value/weightTotal;return sum+p*Math.log(p);},0)/Math.log(weights.length);
 const centroids=recurring.map(group=>activity(group)/group.length);
 let centroidGap=0,gapCount=0;
 for(let i=0;i<centroids.length;i++)for(let j=i+1;j<centroids.length;j++){centroidGap+=Math.abs(centroids[i]-centroids[j]);gapCount+=1;}
 const differentiation=gapCount?clamp01(interpolate(centroidGap/gapCount,calibration.conditionSeparation)):0;
 const recurrence=clamp01(Math.cbrt(recurringScore*clamp01(evenness)*differentiation));
 const activeShare=samples.filter(sample=>sample.salience>=calibration.activeSalience).length/total;
 const highShare=samples.filter(sample=>sample.salience>=calibration.highSalienceLevel).length/total;
 const scarcity=interpolate(activeShare,calibration.scarcity);
 const saturation=interpolate(highShare,calibration.saturation);
 const viability=Math.min(scarcity,saturation);
 const base=Math.cbrt(salienceDifferentiation*spatial*recurrence);
 const normalized=Math.min(base,viability);
 const exactRating=1+4*normalized;
 const rating=Math.round(exactRating*10)/10;
 const explanation=`WV-03 scored ${rating.toFixed(1)}/5. Salience ${salienceDifferentiation.toFixed(2)}, hierarchy ${spatial.toFixed(2)}, recurrence ${recurrence.toFixed(2)}${base>viability+1e-9?`, limited by viability cap ${viability.toFixed(2)}`:''}.`;
 return {status:'evaluated',normalized,rating,exactRating,salienceDifferentiation,spatial,recurrence,viability,base,high,spread:Math.max(0,high-low),levelPresence,separationScore,legibility,scaleScore,recurringScore,evenness,differentiation,activeShare,highShare,explanation};
}

function insidePolygon(point,polygon){
 let inside=false;
 for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
  const a=polygon[i],b=polygon[j];
  if((a.y>point.y)!==(b.y>point.y)&&(point.x<(b.x-a.x)*(point.y-a.y)/(b.y-a.y)+a.x))inside=!inside;
 }
 return inside;
}
function fieldSamples(boundary,events,spacing,grid){
 let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
 for(const point of boundary){minX=Math.min(minX,point.x);minY=Math.min(minY,point.y);maxX=Math.max(maxX,point.x);maxY=Math.max(maxY,point.y);}
 const width=maxX-minX,height=maxY-minY,cellSize=width/grid;
 if(!(width>0)||!(height>0))return {samples:[],cellSize:1};
 const samples=[];
 for(let row=0;row<grid;row++)for(let col=0;col<grid;col++){
  const point={x:minX+(col+.5)*width/grid,y:minY+(row+.5)*height/grid,col,row};
  if(!insidePolygon(point,boundary))continue;
  const nearby=events.filter(event=>Math.hypot(event.location.x-point.x,event.location.y-point.y)<=spacing);
  const byType=new Map();
  for(const event of nearby)byType.set(event.eventType,Math.max(byType.get(event.eventType)||0,event.salience));
  const salience=1-[...byType.values()].reduce((product,value)=>product*(1-clamp01(value)),1);
  samples.push({col,row,salience:byType.size?salience:0});
 }
 return {samples,cellSize};
}
export function evaluateWV03(context={}){
 const measured=context.modules?.events;
 const reference=(context.artifacts||[]).find(item=>item.version==='relational-events-v1');
 if(measured?.status==='not_applicable')return blank('not-applicable','WV-03 has no relational-event field for this weave.');
 if(!reference||!measured||measured.status==='failed'||measured.status==='unavailable')return blank('evaluation-failed','WV-03 analysis evidence is missing.');
 try{
  const artifact=readAnalysisArtifact(context.entry,reference.artifactId);
  const events=artifact.evidence?.events||[];
  const run=(context.entry?.derivedAnalysis?.runs||[]).find(item=>item.analysisRunId===context.analysisRunId);
  const revision=(context.entry?.revisions||[]).find(item=>item.geometryRef?.geometryFingerprint===run?.geometryFingerprint);
  const spacing=context.modules?.rhythmic?.characteristicSpacing||median(events.map(event=>event.scale).filter(value=>value>0));
  if(!(spacing>0))return blank('evaluation-failed','WV-03 needs a characteristic spacing.');
  const boundary=resolveAnalysisGeometry(context.project,revision).boundary;
  const field=fieldSamples(boundary,events,spacing,ANALYSIS_GRID);
  const scored=scoreWV03({eventSalience:events.map(event=>event.salience),samples:field.samples,events:events.map(event=>({eventType:event.eventType,salience:event.salience,signature:(event.participatingFamilies||[]).slice().sort().join('|')})),spacing,cellSize:field.cellSize});
  return {criterionId:'WV-03',status:'evaluated',normalizedScore:scored.normalized,rating:scored.rating,components:{eventSalienceDifferentiation:scored.salienceDifferentiation,spatialScaleHierarchy:scored.spatial,recurrenceDifferentiation:scored.recurrence},submetrics:{highSalience:scored.high,salienceSpread:scored.spread,levelPresence:scored.levelPresence,separationScore:scored.separationScore,legibility:scored.legibility,scaleScore:scored.scaleScore,recurringScore:scored.recurringScore,recurrenceBalance:scored.evenness,conditionDifferentiation:scored.differentiation,activeCoverage:scored.activeShare,highCoverage:scored.highShare,base:scored.base,normalized:scored.normalized,rating:scored.exactRating,eventCount:events.length},safeguards:{eventViability:scored.viability},evidenceRefs:[reference.artifactId],explanation:scored.explanation,warnings:[],versions:{logic:WV03_CALIBRATION.logicVersion,calibration:WV03_CALIBRATION.version}};
 }catch(error){return blank('evaluation-failed',String(error.message||'WV-03 failed.').slice(0,200));}
}
