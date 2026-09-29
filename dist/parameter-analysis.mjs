// Research reads stored scores and settings. It never writes a rating.
import {criterionDefinition} from './evaluation.mjs';
import {CRITERION_IDS,EVALUATION_RUN_VERSION,listSavedGenerationSettings,readEvaluationSummary,readWeaveIdentity} from './weave-record.mjs';

export const ADVISORY_BOUNDARY='Parameter patterns guide exploration. They do not replace evaluation of resulting geometry.';
export const HIGH_RATING=3.75;
export const LOW_RATING=2.25;
const CORRELATION_SAMPLE=5;

const finite=value=>typeof value==='number'&&Number.isFinite(value)?value:null;
const shown=value=>Number.isFinite(value)?String(Math.round(value*100)/100):'—';
const groupKey=value=>String(Math.round(value*10000)/10000);

function libraryRevision(entry){
 const revisions=entry?.revisions;
 if(!Array.isArray(revisions)||!revisions.length)return null;
 return revisions.find(item=>item.id===entry.generatorRevisionId)||revisions.at(-1);
}
function versionedRun(entry){
 return [...(entry?.evaluations||[])].reverse().find(item=>item?.version===EVALUATION_RUN_VERSION)||null;
}
function sourceText(revision){
 const carrier=revision?.carrier;
 if(!carrier||typeof carrier!=='object')return '';
 return [carrier.kind,carrier.recipeId,carrier.generatorVersion,carrier.preset].filter(item=>typeof item==='string'&&item).join(' ');
}
function familyCount(revision){
 if(Array.isArray(revision?.strandIdentity?.families))return revision.strandIdentity.families.length;
 const families=revision?.carrier?.families;
 if(families&&typeof families==='object'&&!Array.isArray(families))return Object.keys(families).length;
 return null;
}
function parameterRows(revision){
 const listed=revision?listSavedGenerationSettings(revision):{rows:[],groups:[]};
 return [...(listed.rows||[]),...(listed.groups||[]).flatMap(group=>group.rows||[])].filter(row=>row?.parameterId&&Number.isFinite(row.raw)).map(row=>({id:row.parameterId,label:row.label,raw:row.raw}));
}
function criterionVersions(run,id,result){
 return {
  logic:run?.versions?.[`${id}-logic`]||result?.criterionLogicVersion||'',
  calibration:run?.versions?.[`${id}-calibration`]||result?.calibrationVersion||''
 };
}
function incompatible(run){
 if(!run?.criterionResults)return false;
 for(const id of CRITERION_IDS){
  const result=run.criterionResults[id];
  if(!result)continue;
  const versions=criterionVersions(run,id,result);
  const definition=criterionDefinition(id);
  if(versions.logic&&versions.logic!==definition.logicVersion)return true;
  if(versions.calibration&&versions.calibration!==definition.calibrationVersion)return true;
 }
 return false;
}
function neutralMetrics(result){
 const metrics=[];
 const source=result?.submetrics;
 if(!source||typeof source!=='object'||Array.isArray(source))return metrics;
 for(const [name,value] of Object.entries(source)){
  if(name==='rating'||name==='normalized'||name==='base')continue;
  const number=finite(value);
  if(number===null)continue;
  metrics.push({name,value:number});
  if(metrics.length>=8)break;
 }
 return metrics;
}
function familyProfiles(entry,revision,result){
 const stored=result?.submetrics?.families;
 if(!Array.isArray(stored))return [];
 const identity=revision?.strandIdentity?.families||[];
 const settings=revision?.generation?.parameters?.families||{};
 return stored.filter(family=>family&&typeof family.familyId==='string').map(family=>{
  const match=identity.find(item=>item.familyId===family.familyId);
  const key=match?.key||'';
  const familySettings=settings[key]||{};
  return {
   weaveId:readWeaveIdentity(entry)?.weaveId||'',
   familyId:family.familyId,
   key,
   consequence:finite(family.consequence),
   interstitial:finite(family.interstitial),
   directional:finite(family.directional),
   rhythmic:finite(family.rhythmic),
   events:finite(family.events),
   modulation:finite(family.modulation),
   spacing:finite(familySettings.spacing),
   angle:finite(familySettings.angleDegrees),
   offset:finite(familySettings.offset),
   density:finite(familySettings.density)
  };
 });
}
function datasetRow(entry){
 const identity=readWeaveIdentity(entry)||{};
 const revision=libraryRevision(entry);
 const run=versionedRun(entry);
 const summary=readEvaluationSummary(entry);
 const flags=[];
 if(!run||summary.status==='not-evaluated')flags.push('not-evaluated');
 if(summary.status==='evaluation-failed'||run?.status==='evaluation-failed')flags.push('failed');
 if(summary.status==='partial'||run?.status==='partial')flags.push('partial');
 if(summary.status==='needs-reevaluation')flags.push('stale');
 if(run&&incompatible(run))flags.push('incompatible');
 const criteria={};
 for(const id of CRITERION_IDS){
  const result=run?.criterionResults?.[id];
  const versions=criterionVersions(run,id,result);
  const safeguards={};
  for(const [name,value] of Object.entries(result?.safeguards||{}))if(finite(value)!==null)safeguards[name]=value;
  criteria[id]={
   status:result?.status||'not-evaluated',
   rating:finite(result?.rating),
   normalizedScore:finite(result?.normalizedScore),
   components:Object.fromEntries(Object.entries(result?.components||{}).filter(([,value])=>finite(value)!==null)),
   safeguards,
   capActive:Object.values(safeguards).some(value=>value<1),
   logicVersion:versions.logic,
   calibrationVersion:versions.calibration,
   metrics:neutralMetrics(result)
  };
 }
 return {
  weaveId:identity.weaveId||'',
  name:identity.name||identity.weaveId||'',
  included:!flags.length,
  flags,
  patternSource:sourceText(revision),
  familyCount:familyCount(revision),
  parameters:parameterRows(revision),
  criteria,
  familyProfiles:familyProfiles(entry,revision,run?.criterionResults?.['WV-05']),
  cohort:CRITERION_IDS.map(id=>{
   const item=criteria[id];
   return item.logicVersion||item.calibrationVersion?`${id} ${item.logicVersion||'—'} · ${item.calibrationVersion||'—'}`:'';
  }).filter(Boolean).join(' | ')
 };
}

export function evaluationDataset(records){
 const rows=[...records].map(datasetRow);
 const included=rows.filter(row=>row.included);
 const cohorts=[...new Set(included.map(row=>row.cohort).filter(Boolean))];
 return {advisory:ADVISORY_BOUNDARY,rows,includedCount:included.length,excludedCount:rows.length-included.length,cohort:cohorts.length===1?cohorts[0]:cohorts.length?`${cohorts.length} COHORTS`:''};
}

function outcomeValue(row,criterionId,outcome){
 const criterion=row.criteria?.[criterionId];
 if(!criterion||criterion.status!=='evaluated')return null;
 if(outcome==='normalized')return criterion.normalizedScore;
 if(typeof outcome==='string'&&outcome.startsWith('component:'))return finite(criterion.components[outcome.slice(10)]);
 if(typeof outcome==='string'&&outcome.startsWith('safeguard:'))return finite(criterion.safeguards[outcome.slice(10)]);
 return criterion.rating;
}
function parameterValue(row,label){
 if(!label)return null;
 const found=row.parameters.find(item=>item.label===label);
 return found?found.raw:null;
}
function pearson(xs,ys){
 const count=xs.length;
 if(count<CORRELATION_SAMPLE)return null;
 const meanX=xs.reduce((sum,value)=>sum+value,0)/count;
 const meanY=ys.reduce((sum,value)=>sum+value,0)/count;
 let numerator=0,spreadX=0,spreadY=0;
 for(let index=0;index<count;index++){
  const dx=xs[index]-meanX,dy=ys[index]-meanY;
  numerator+=dx*dy;
  spreadX+=dx*dx;
  spreadY+=dy*dy;
 }
 if(spreadX===0||spreadY===0)return null;
 return numerator/Math.sqrt(spreadX*spreadY);
}
function summarizePoints(points,paired){
 const groups=new Map();
 for(const point of points){
  const key=paired?`${groupKey(point.x)} · ${groupKey(point.x2)}`:groupKey(point.x);
  if(!groups.has(key))groups.set(key,{label:key,values:[]});
  groups.get(key).values.push(point.y);
 }
 return [...groups.values()].map(group=>{
  const average=group.values.reduce((sum,value)=>sum+value,0)/group.values.length;
  return {label:group.label,sampleSize:group.values.length,average,min:Math.min(...group.values),max:Math.max(...group.values)};
 });
}

export function parameterPattern(dataset,{criterionId='WV-01',outcome='rating',parameter='',parameterB=''}={}){
 const points=[];
 for(const row of dataset.rows){
  if(!row.included)continue;
  const y=outcomeValue(row,criterionId,outcome);
  const x=parameterValue(row,parameter);
  if(y===null||x===null)continue;
  if(parameterB){
   const x2=parameterValue(row,parameterB);
   if(x2===null)continue;
   points.push({weaveId:row.weaveId,name:row.name,x,x2,y});
  }else points.push({weaveId:row.weaveId,name:row.name,x,y});
 }
 const correlation=parameterB?'':pearson(points.map(point=>point.x),points.map(point=>point.y));
 let correlationNote='This describes the saved sample. It does not score a weave.';
 if(parameterB)correlationNote='A two-setting table shows where the sample sits. It does not score a weave.';
 else if(points.length<CORRELATION_SAMPLE)correlationNote='The sample is too small for a correlation.';
 else if(correlation===null)correlationNote='These values do not vary enough for a correlation.';
 return {advisory:ADVISORY_BOUNDARY,criterionId,outcome,parameter,parameterB:parameterB||'',sampleSize:points.length,correlation,correlationNote,groups:summarizePoints(points,Boolean(parameterB))};
}

function parameterRanges(rows){
 const labels=[...new Set(rows.flatMap(row=>row.parameters.map(item=>item.label)))];
 return labels.map(label=>{
  const values=rows.map(row=>parameterValue(row,label)).filter(value=>value!==null);
  return {label,sampleSize:values.length,min:values.length?Math.min(...values):null,max:values.length?Math.max(...values):null};
 }).filter(item=>item.sampleSize);
}
function namedGroup(rows){
 return {sampleSize:rows.length,names:rows.map(row=>row.name),parameters:parameterRanges(rows)};
}

export function outcomeGroups(dataset,criterionId='WV-01'){
 const high=[],low=[],mid=[],capped=[];
 for(const row of dataset.rows){
  if(!row.included)continue;
  const criterion=row.criteria?.[criterionId];
  if(!criterion||criterion.status!=='evaluated'||criterion.rating===null)continue;
  if(criterion.rating>=HIGH_RATING)high.push(row);
  else if(criterion.rating<LOW_RATING)low.push(row);
  else mid.push(row);
  if(criterion.capActive)capped.push(row);
 }
 return {advisory:ADVISORY_BOUNDARY,criterionId,highMark:HIGH_RATING,lowMark:LOW_RATING,high:namedGroup(high),low:namedGroup(low),mid:namedGroup(mid),cap:namedGroup(capped)};
}

const FAMILY_PARAMETERS={SPACING:'spacing',ROTATION:'angle',OFFSET:'offset',DENSITY:'density'};
export function familyParameterKey(label){
 const name=String(label||'').trim().split(/\s+/).at(-1)?.toUpperCase()||'';
 return FAMILY_PARAMETERS[name]||'';
}
export function familyRolePattern(dataset,{parameter='',metric='consequence'}={}){
 const key=familyParameterKey(parameter);
 const parts=String(parameter||'').trim().split(/\s+/);
 const familyKey=parts.length>1?parts[0]:'';
 const profiles=dataset.rows.filter(row=>row.included).flatMap(row=>row.familyProfiles);
 const points=key?profiles.filter(profile=>(!familyKey||profile.key===familyKey)&&profile[key]!==null&&profile[metric]!==null):[];
 const groups=summarizePoints(points.map(profile=>({x:profile[key],y:profile[metric]})),false);
 const lowConsequence=profiles.filter(profile=>profile.consequence!==null&&profile.consequence<0.45).length;
 const strongInterstitial=profiles.filter(profile=>profile.interstitial!==null&&profile.interstitial>=0.75).length;
 return {advisory:ADVISORY_BOUNDARY,parameter,metric,sampleSize:points.length,familyCount:profiles.length,lowConsequence,strongInterstitial,groups};
}
