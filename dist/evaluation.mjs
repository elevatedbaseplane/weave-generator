// Criterion registry, evaluator contract, and evaluation run.
// Individual criterion scores stay in later batches.
import {ANALYSIS_MODULE_VERSIONS,SUBSET_ANALYSIS_VERSION,analyzeWeave} from './analysis.mjs';
import {appendEvaluationRun,createEvaluationRun} from './weave-record.mjs';
import {evaluateWV01} from './wv01.mjs';
import {evaluateWV02} from './wv02.mjs';
import {evaluateWV03} from './wv03.mjs';
import {evaluateWV04} from './wv04.mjs';
import {evaluateWV05} from './wv05.mjs';
const STATUSES=['not-evaluated','evaluating','evaluated','needs-reevaluation','evaluation-failed','not-applicable','partial'];
const OUTPUT_KEYS=['criterionId','status','normalizedScore','rating','components','submetrics','safeguards','evidenceRefs','explanation','warnings','versions'];
const HEAVY=['points','fragments','strands','payload'];

const plainObject=value=>!!value&&typeof value==='object'&&!Array.isArray(value);

const DEFINITIONS=Object.freeze([
 {criterionId:'WV-01',name:'Differentiated Field Coherence',question:'Families and relational territories should remain distinguishable through direction, rhythm, spacing, density, continuity, or behavior, while recurring alignments, correspondences, proximities, interruptions, or other relationships allow the weave to be understood as one organized field.',logicVersion:'wv-01-logic-v1',calibrationVersion:'wv-01-calibration-v1',requiredAnalysis:['presence','directional','rhythmic'],conditionalAnalysis:[{module:'modulation',when:'families-share-an-enabled-influence'}],components:['familyDistinctness','relationalCoupling'],safeguards:['effectiveFamilyPresence'],evaluatorId:'WV01Evaluator'},
 {criterionId:'WV-02',name:'Calibrated Field Modulation',question:'Changes across the weave should appear calibrated rather than accidental. The field should contain recognizable differences between quieter and more active areas, compressed and open areas, or stable and deformed regions, while variation keeps the underlying order understandable.',logicVersion:'wv-02-logic-v1',calibrationVersion:'wv-02-calibration-v1',requiredAnalysis:['modulation'],conditionalAnalysis:[{module:'modulation',when:'no-enabled-influence'}],components:['effectiveModulation','spatialDifferentiation','fieldCoordination'],safeguards:['fieldRetention'],evaluatorId:'WV02Evaluator'},
 {criterionId:'WV-03',name:'Relational Event Hierarchy',question:'Relational events should vary in intensity, concentration, scale, and consequence, so some locations become more relationally charged than others while quieter areas keep those events legible.',logicVersion:'wv-03-logic-v1',calibrationVersion:'wv-03-calibration-v1',requiredAnalysis:['events'],conditionalAnalysis:[],components:['eventSalienceDifferentiation','spatialScaleHierarchy','recurrenceDifferentiation'],safeguards:['eventViability'],evaluatorId:'WV03Evaluator'},
 {criterionId:'WV-04',name:'Activated Interstitial Structure',question:'Spaces between strands should form a legible hierarchy of regions rather than repetitive gaps, unusable slivers, leftover areas, or excessively open areas with little relational definition, and those spaces should participate in the organization of the surrounding weave.',logicVersion:'wv-04-logic-v1',calibrationVersion:'wv-04-calibration-v1',requiredAnalysis:['interstitial'],conditionalAnalysis:[],components:['interstitialDifferentiation','interstitialContinuity'],safeguards:['degenerateInterstitial'],evaluatorId:'WV04Evaluator'},
 {criterionId:'WV-05',name:'Layered Family Interdependence',question:'Each important family should contribute something distinguishable to the overall field. Families may differ in response or intensity, but they should not exist merely as additional visual layers, and the complete field should depend on the coexistence of its principal systems.',logicVersion:'wv-05-logic-v1',calibrationVersion:'wv-05-calibration-v1',requiredAnalysis:['presence','directional','rhythmic','events','interstitial','subset'],conditionalAnalysis:[{module:'modulation',when:'no-active-influence'}],components:['familyConsequence','complementaryInterdependence'],safeguards:['irrelevantFamily'],evaluatorId:'WV05Evaluator'}
].map(item=>Object.freeze({...item,requiredAnalysis:Object.freeze([...item.requiredAnalysis]),conditionalAnalysis:Object.freeze(item.conditionalAnalysis.map(entry=>Object.freeze({...entry}))),components:Object.freeze([...item.components]),safeguards:Object.freeze([...item.safeguards])})));

const byId=new Map(DEFINITIONS.map(item=>[item.criterionId,item]));

function unevaluatedResult(definition){
 return {
  criterionId:definition.criterionId,
  status:'not-evaluated',
  normalizedScore:null,
  rating:null,
  components:{},
  submetrics:{},
  safeguards:{},
  evidenceRefs:[],
  explanation:'',
  warnings:[],
  versions:{logic:definition.logicVersion,calibration:definition.calibrationVersion}
 };
}

const evaluators=new Map(DEFINITIONS.map(definition=>[definition.criterionId,function evaluateCriterion(){return unevaluatedResult(definition);}]));

export function listCriteria(){return DEFINITIONS.map(item=>({...item,evaluator:evaluators.get(item.criterionId)}));}
export function criterionDefinition(id){
 const found=byId.get(id);
 if(!found)throw new Error(`Unknown criterion ${id}.`);
 return found;
}
export function criterionEvaluator(id){
 criterionDefinition(id);
 return evaluators.get(id);
}
export function registerCriterionEvaluator(id,evaluator){
 criterionDefinition(id);
 if(typeof evaluator!=='function')throw new Error(`Criterion ${id} needs an evaluator.`);
 evaluators.set(id,evaluator);
}

function score(value,label,lo,hi){
 if(value===null)return;
 if(typeof value!=='number'||!Number.isFinite(value)||value<lo||value>hi)throw new Error(`Invalid ${label}.`);
}
function walk(value,depth=0){
 if(value===null||typeof value==='boolean'||typeof value==='string'||typeof value==='number'){
  if(typeof value==='string'&&value.length>2000)throw new Error('Invalid evaluator output.');
  if(typeof value==='number'&&!Number.isFinite(value))throw new Error('Invalid evaluator output.');
  return;
 }
 if(value===undefined||depth>4||typeof value!=='object')throw new Error('Invalid evaluator output.');
 if(Array.isArray(value)){
  if(value.length>40)throw new Error('Invalid evaluator output.');
  value.forEach(item=>walk(item,depth+1));
  return;
 }
 const keys=Object.keys(value);
 if(keys.length>40||keys.some(key=>HEAVY.includes(key)))throw new Error('Evaluator output must reference heavy geometry.');
 keys.forEach(key=>walk(value[key],depth+1));
}
export function validateEvaluatorOutput(result){
 if(!plainObject(result))throw new Error('Invalid evaluator output.');
 for(const key of OUTPUT_KEYS)if(!Object.hasOwn(result,key))throw new Error('Invalid evaluator output.');
 if(!byId.has(result.criterionId)||!STATUSES.includes(result.status))throw new Error('Invalid evaluator output.');
 score(result.normalizedScore,'normalized score',0,1);
 score(result.rating,'rating',1,5);
 if(['not-evaluated','not-applicable','evaluation-failed','evaluating'].includes(result.status)&&(result.normalizedScore!==null||result.rating!==null))throw new Error('Invalid evaluator output.');
 if(result.status==='evaluated'&&(result.normalizedScore===null||result.rating===null))throw new Error('Invalid evaluator output.');
 if(!plainObject(result.components)||!plainObject(result.submetrics)||!plainObject(result.safeguards))throw new Error('Invalid evaluator output.');
 walk(result.components);walk(result.submetrics);walk(result.safeguards);
 if(!Array.isArray(result.evidenceRefs)||result.evidenceRefs.length>40)throw new Error('Invalid evaluator output.');
 result.evidenceRefs.forEach(item=>{if(typeof item==='string'){if(!item||item.length>120)throw new Error('Invalid evaluator output.');return;}if(!plainObject(item))throw new Error('Invalid evaluator output.');walk(item);});
 if(typeof result.explanation!=='string'||result.explanation.length>2000)throw new Error('Invalid evaluator output.');
 if(!Array.isArray(result.warnings)||result.warnings.length>40||result.warnings.some(item=>typeof item!=='string'||item.length>200))throw new Error('Invalid evaluator output.');
 if(!plainObject(result.versions))throw new Error('Invalid evaluator output.');
 const definition=byId.get(result.criterionId);
 for(const [key,version] of Object.entries(result.versions))if(!key||key.length>80||typeof version!=='string'||!version||version.length>80)throw new Error('Invalid evaluator output.');
 if(result.versions.logic!==definition.logicVersion||result.versions.calibration!==definition.calibrationVersion)throw new Error('Invalid evaluator output.');
 return result;
}
export function runCriterionEvaluator(id,context){
 return validateEvaluatorOutput(criterionEvaluator(id)(context));
}

function clip(text){return String(text??'').slice(0,200);}
function note(text){return clip(text)||'Evaluation failed.';}
function recordSafe(value,depth=0){
 if(value===null||typeof value==='boolean'||typeof value==='number')return typeof value!=='number'||Number.isFinite(value);
 if(typeof value==='string')return value.length<=200;
 if(depth>4||!value||typeof value!=='object')return false;
 if(Array.isArray(value))return value.length<=40&&value.every(item=>recordSafe(item,depth+1));
 const keys=Object.keys(value);
 return keys.length<=40&&keys.every(key=>!HEAVY.includes(key)&&recordSafe(value[key],depth+1));
}
function failedCriterion(definition,message){
 return {criterionId:definition.criterionId,status:'evaluation-failed',normalizedScore:null,rating:null,components:{},submetrics:{},safeguards:{},evidenceRefs:[],criterionLogicVersion:definition.logicVersion,calibrationVersion:definition.calibrationVersion,warnings:[note(message)],explanation:''};
}
function moduleReady(modules,id){
 if(id==='subset')return false;
 const status=modules?.[id]?.status;
 return status==='complete'||status==='not_applicable';
}
function guardCriterion(definition,output,modules,subsetReady){
 const missing=definition.requiredAnalysis.filter(id=>id==='subset'? !subsetReady:!moduleReady(modules,id));
 if(!missing.length)return output;
 const warnings=[...output.warnings,note(`Required analysis is unavailable: ${missing.join(', ')}.`)] .slice(0,40);
 if(output.status!=='evaluated')return {...output,warnings};
 const subsetOnly=missing.length===1&&missing[0]==='subset';
 return {...output,status:subsetOnly?'partial':'evaluation-failed',normalizedScore:null,rating:null,warnings};
}
function storedCriterion(definition,output,artifacts){
 const byId=new Map((artifacts||[]).map(item=>[item.artifactId,item]));
 const evidenceRefs=[],warnings=[...output.warnings];
 for(const ref of output.evidenceRefs){
  const id=typeof ref==='string'?ref:ref?.artifactId;
  const found=byId.get(id);
  if(found)evidenceRefs.push(structuredClone(found));
  else warnings.push('EVIDENCE REFERENCE IS NOT IN THIS ANALYSIS RUN.');
 }
 let status=output.status,normalizedScore=output.normalizedScore,rating=output.rating;
 if(output.evidenceRefs.length&&!evidenceRefs.length&&status==='evaluated'){status='partial';normalizedScore=null;rating=null;}
 const componentsSafe=recordSafe(output.components),submetricsSafe=recordSafe(output.submetrics),safeguardsSafe=recordSafe(output.safeguards);
 const components=componentsSafe?structuredClone(output.components):{};
 const submetrics=submetricsSafe?structuredClone(output.submetrics):{};
 const safeguards=safeguardsSafe?structuredClone(output.safeguards):{};
 if((!componentsSafe||!submetricsSafe||!safeguardsSafe)&&status==='evaluated'){status='evaluation-failed';normalizedScore=null;rating=null;warnings.push('CRITERION EVIDENCE COULD NOT BE STORED.');}
 return {criterionId:definition.criterionId,status,normalizedScore,rating,components,submetrics,safeguards,evidenceRefs,criterionLogicVersion:definition.logicVersion,calibrationVersion:definition.calibrationVersion,warnings:warnings.map(note).slice(0,40),explanation:clip(output.explanation)};
}
function aggregateStatus(results,analysisStatus){
 const statuses=results.map(item=>item.status);
 if(analysisStatus==='analysis-unavailable')return 'evaluation-failed';
 if(statuses.every(status=>status==='not-evaluated'))return analysisStatus==='analysis-failed'?'partial':'not-evaluated';
 if(statuses.every(status=>status==='not-applicable'))return 'not-applicable';
 if(statuses.every(status=>status==='evaluation-failed'))return 'evaluation-failed';
 if(statuses.every(status=>status==='evaluated'||status==='not-applicable'))return 'evaluated';
 return 'partial';
}
const STALE_REASON_ORDER=['geometry_changed','analysis_module_changed','criterion_logic_changed','calibration_changed','missing_dependency'];
const STALE_REASON_TEXT={geometry_changed:'Geometry changed.',analysis_module_changed:'Analysis changed.',criterion_logic_changed:'Criterion logic changed.',calibration_changed:'Calibration changed.',missing_dependency:'A required dependency is missing.'};
function pinnedRevision(entry){
 const revisions=entry?.revisions;
 if(!Array.isArray(revisions)||!revisions.length)return null;
 return revisions.find(revision=>revision.id===entry.generatorRevisionId)||revisions.at(-1);
}
// Stored runs stay unchanged. A criterion is stale only when this record
// names a dependency and that dependency no longer matches.
export function evaluationDependencyReport(entry){
 const criteria=Object.fromEntries(DEFINITIONS.map(item=>[item.criterionId,{reasons:[],reasonText:''}]));
 const list=Array.isArray(entry?.evaluations)?entry.evaluations:[];
 const latest=[...list].reverse().find(item=>item?.version==='evaluation-run-v1');
 if(!latest?.versions?.['analysis-run'])return {stale:false,criteria};
 const runs=Array.isArray(entry?.derivedAnalysis?.runs)?entry.derivedAnalysis.runs:[];
 const analysisRun=runs.find(run=>run?.analysisRunId===latest.analysisRunId)||null;
 const missingRun=runs.length>0&&!analysisRun;
 const currentFingerprint=pinnedRevision(entry)?.geometryRef?.geometryFingerprint;
 const geometryChanged=!!analysisRun&&typeof currentFingerprint==='string'&&!!currentFingerprint&&analysisRun.geometryFingerprint!==currentFingerprint;
 for(const definition of DEFINITIONS){
  const result=latest.criterionResults?.[definition.criterionId];
  if(!result||result.status==='not-evaluated')continue;
  const found=[];
  if(geometryChanged)found.push('geometry_changed');
  if(missingRun)found.push('missing_dependency');
  const logic=latest.versions[`${definition.criterionId}-logic`];
  if(typeof logic==='string'&&logic!==definition.logicVersion)found.push('criterion_logic_changed');
  const calibration=latest.versions[`${definition.criterionId}-calibration`];
  if(typeof calibration==='string'&&calibration!==definition.calibrationVersion)found.push('calibration_changed');
  for(const moduleId of definition.requiredAnalysis){
   if(moduleId==='subset'){
    const stored=latest.versions.subset;
    if(typeof stored==='string'&&stored!==SUBSET_ANALYSIS_VERSION)found.push('analysis_module_changed');
    continue;
   }
   const stored=latest.versions[moduleId];
   if(typeof stored==='string'&&stored!==ANALYSIS_MODULE_VERSIONS[moduleId])found.push('analysis_module_changed');
  }
  for(const conditional of definition.conditionalAnalysis){
   if(definition.requiredAnalysis.includes(conditional.module))continue;
   const stored=latest.versions[conditional.module];
   if(typeof stored!=='string'||stored===ANALYSIS_MODULE_VERSIONS[conditional.module])continue;
   if((result.evidenceRefs||[]).some(ref=>ref?.version===stored))found.push('analysis_module_changed');
  }
  const reasons=STALE_REASON_ORDER.filter(reason=>found.includes(reason));
  criteria[definition.criterionId]={reasons,reasonText:reasons.map(reason=>STALE_REASON_TEXT[reason]).join(' ')};
 }
 return {stale:Object.values(criteria).some(item=>item.reasons.length),criteria};
}
function analysisContext(project,entry,run){
 const modules=structuredClone(run.outputs?.modules||{});
 const artifacts=structuredClone(run.artifacts||[]);
 const fingerprint=run.geometryFingerprint;
 const subsetReady=(entry.derivedAnalysis?.runs||[]).some(item=>item.status==='analyzed'&&item.geometryFingerprint===fingerprint&&item.outputs?.config?.subset&&item.outputs.config.subset!=='FULL');
 return {project,entry,analysisRunId:run.analysisRunId,analysisStatus:run.status,modules,artifacts,subsetReady,fingerprint};
}
function scoreDefinition(definition,context){
 try{
  const output=validateEvaluatorOutput(evaluators.get(definition.criterionId)({...context,criterionId:definition.criterionId}));
  const subsetReadyNow=(context.entry.derivedAnalysis?.runs||[]).some(item=>item.status==='analyzed'&&item.geometryFingerprint===context.fingerprint&&item.outputs?.config?.subset&&item.outputs.config.subset!=='FULL');
  const guarded=guardCriterion(definition,output,context.modules,definition.requiredAnalysis.includes('subset')?subsetReadyNow:true);
  if(guarded.criterionId!==definition.criterionId)return failedCriterion(definition,'Criterion evaluator returned the wrong criterion.');
  return storedCriterion(definition,guarded,context.artifacts);
 }catch(error){return failedCriterion(definition,error.message);}
}
function storeEvaluation(entry,run,results,versions,warnings,options){
 const evaluationId=options.evaluationId||`evaluation-${crypto.randomUUID()}`;
 const stored=createEvaluationRun({evaluationId,analysisRunId:run.analysisRunId,createdAt:options.createdAt||new Date().toISOString(),status:aggregateStatus(results,run.status),criterionResults:Object.fromEntries(results.map(item=>[item.criterionId,item])),versions,warnings});
 if(Object.hasOwn(stored,'overallScore'))throw new Error('Evaluation runs do not store an overall score.');
 appendEvaluationRun(entry,stored);
 return {entry,evaluation:entry.evaluations.at(-1),analysisRun:run};
}
export function evaluateWeave(project,entry,options={}){
 if(!entry||typeof entry!=='object')throw new Error('This weave record is missing.');
 const analysis=analyzeWeave(project,entry,options);
 const run=analysis.run;
 const context=analysisContext(project,entry,run);
 const requested=Array.isArray(options.criterionIds)?[...new Set(options.criterionIds)]:null;
 if(requested&&!requested.length)throw new Error('Choose at least one criterion.');
 if(requested)requested.forEach(id=>criterionDefinition(id));
 const selected=requested?DEFINITIONS.filter(definition=>requested.includes(definition.criterionId)):DEFINITIONS;
 const results=selected.map(definition=>scoreDefinition(definition,context));
 const versions={'analysis-run':run.analysisRunId};
 if(!requested||requested.includes('WV-05'))versions.subset=SUBSET_ANALYSIS_VERSION;
 for(const definition of selected){versions[`${definition.criterionId}-logic`]=definition.logicVersion;versions[`${definition.criterionId}-calibration`]=definition.calibrationVersion;}
 for(const [key,version] of Object.entries(run.moduleVersions||{}))if(typeof version==='string'&&version)versions[key]=version;
 const warnings=(run.warnings||[]).map(note).slice(0,40);
 return storeEvaluation(entry,run,results,versions,warnings,options);
}
export function reevaluateWeave(project,entry,options={}){
 if(!entry||typeof entry!=='object')throw new Error('This weave record is missing.');
 if(options.force||(!options.stale&&!options.criterionId&&!options.criterionIds))return evaluateWeave(project,entry,options);
 const report=evaluationDependencyReport(entry);
 const requested=options.criterionId?[options.criterionId]:options.criterionIds;
 const targets=requested?[...new Set(requested)] : DEFINITIONS.map(item=>item.criterionId).filter(id=>report.criteria[id].reasons.length);
 if(requested)targets.forEach(id=>criterionDefinition(id));
 const latest=[...(entry.evaluations||[])].reverse().find(item=>item?.version==='evaluation-run-v1')||null;
 if(!latest)return evaluateWeave(project,entry,options);
 if(!targets.length){
  const analysisRun=(entry.derivedAnalysis?.runs||[]).find(run=>run.analysisRunId===latest.analysisRunId)||null;
  return {entry,evaluation:latest,analysisRun,reused:true,updated:[]};
 }
 let full=false;
 const refresh=new Set();
 for(const id of targets){
  const reasons=report.criteria[id]?.reasons||[];
  if(!latest.criterionResults?.[id]||reasons.includes('geometry_changed')||reasons.includes('missing_dependency'))full=true;
  if(!reasons.includes('analysis_module_changed'))continue;
  const definition=criterionDefinition(id);
  for(const moduleId of [...definition.requiredAnalysis,...definition.conditionalAnalysis.map(item=>item.module)]){
   if(moduleId!=='subset'&&latest.versions?.[moduleId]!==ANALYSIS_MODULE_VERSIONS[moduleId])refresh.add(moduleId);
  }
 }
 let analysis;
 if(full)analysis=analyzeWeave(project,entry,options);
 else if(refresh.size)analysis=analyzeWeave(project,entry,{grid:options.grid,modules:[...refresh]});
 else analysis={run:(entry.derivedAnalysis?.runs||[]).find(run=>run.analysisRunId===latest.analysisRunId)||null,cached:true};
 if(!analysis?.run)analysis=analyzeWeave(project,entry,options);
 const context=analysisContext(project,entry,analysis.run);
 const results=DEFINITIONS.map(definition=>targets.includes(definition.criterionId)?scoreDefinition(definition,context):latest.criterionResults?.[definition.criterionId]?structuredClone(latest.criterionResults[definition.criterionId]):scoreDefinition(definition,context));
 const versions=structuredClone(latest.versions||{});
 versions['analysis-run']=analysis.run.analysisRunId;
 if(targets.includes('WV-05'))versions.subset=SUBSET_ANALYSIS_VERSION;
 for(const id of targets){const definition=criterionDefinition(id);versions[`${id}-logic`]=definition.logicVersion;versions[`${id}-calibration`]=definition.calibrationVersion;}
 for(const key of full?Object.keys(analysis.run.moduleVersions||{}):refresh)if(typeof analysis.run.moduleVersions?.[key]==='string')versions[key]=analysis.run.moduleVersions[key];
 const stored=storeEvaluation(entry,analysis.run,results,versions,(analysis.run.warnings||[]).map(note).slice(0,40),options);
 return {...stored,reused:analysis.cached===true,updated:[...targets]};
}
function evaluationSnapshot(entry){
 return {evaluations:structuredClone(entry.evaluations),derivedAnalysis:structuredClone(entry.derivedAnalysis),analysisArtifacts:entry.analysisArtifacts===undefined?undefined:structuredClone(entry.analysisArtifacts)};
}
function restoreEvaluationSnapshot(entry,snapshot){
 if(snapshot.evaluations===undefined)delete entry.evaluations;else entry.evaluations=snapshot.evaluations;
 if(snapshot.derivedAnalysis===undefined)delete entry.derivedAnalysis;else entry.derivedAnalysis=snapshot.derivedAnalysis;
 if(snapshot.analysisArtifacts===undefined)delete entry.analysisArtifacts;else entry.analysisArtifacts=snapshot.analysisArtifacts;
}
function hasVersionedEvaluation(entry){
 return Array.isArray(entry?.evaluations)&&entry.evaluations.some(item=>item?.version==='evaluation-run-v1');
}
export function evaluateSelectedWeaves(project,entries,options={}){
 const updated=[],failed=[],skipped=[];
 for(const entry of entries||[]){
  const label=entry?.weaveId||entry?.name||'weave';
  if(options.outdated&&!hasVersionedEvaluation(entry)){skipped.push(label);continue;}
  if(options.outdated&&!evaluationDependencyReport(entry).stale){skipped.push(label);continue;}
  const snapshot=evaluationSnapshot(entry);
  try{
   const result=options.outdated?reevaluateWeave(project,entry,{...options,stale:true}):evaluateWeave(project,entry,options);
   if(options.outdated&&!result.updated.length)skipped.push(label);
   else updated.push(label);
  }catch(error){
   restoreEvaluationSnapshot(entry,snapshot);
   failed.push({weaveId:label,message:error?.message||String(error)});
  }
 }
 return {updated,failed,skipped};
}
registerCriterionEvaluator('WV-01',evaluateWV01);
registerCriterionEvaluator('WV-02',evaluateWV02);
registerCriterionEvaluator('WV-03',evaluateWV03);
registerCriterionEvaluator('WV-04',evaluateWV04);
registerCriterionEvaluator('WV-05',evaluateWV05);
