// A versioned package for a later tool. Building it does not score or reshape the weave.
import {digest} from './weave.mjs';
import {CRITERION_IDS,EVALUATION_RUN_VERSION,LINEAGE_VERSION,createLineageRecord,readWeaveIdentity,readWeaveParent,resolveAnalysisGeometry} from './weave-record.mjs';

export const HANDOFF_VERSION='weave-handoff-v1';

const finite=value=>typeof value==='number'&&Number.isFinite(value)?value:null;
function revisionOf(entry){
 const revisions=entry?.revisions;
 if(!Array.isArray(revisions)||!revisions.length)return null;
 return revisions.find(item=>item.id===entry.generatorRevisionId)||revisions.at(-1);
}
function versionedRun(entry){
 return [...(entry?.evaluations||[])].reverse().find(item=>item?.version===EVALUATION_RUN_VERSION)||null;
}
function analysisRun(entry){
 const runs=(entry?.derivedAnalysis?.runs||[]).filter(item=>item&&typeof item==='object');
 return [...runs].reverse().find(run=>run.outputs?.config?.subset==='FULL'||run.outputs?.config?.subset===undefined)||runs.at(-1)||null;
}
function compactEvent(event){
 if(!event||typeof event!=='object')return null;
 return {eventId:typeof event.eventId==='string'?event.eventId:'',eventType:typeof event.eventType==='string'?event.eventType:'',location:event.location&&Number.isFinite(event.location.x)&&Number.isFinite(event.location.y)?{x:event.location.x,y:event.location.y}:null,participatingFamilies:Array.isArray(event.participatingFamilies)?event.participatingFamilies.slice(0,8):[],participatingStrands:Array.isArray(event.participatingStrands)?event.participatingStrands.slice(0,8):[],salience:finite(event.salience),detectorVersion:typeof event.detectorVersion==='string'?event.detectorVersion:''};
}
function compactZone(zone){
 if(!zone||typeof zone!=='object')return null;
 const copy={...zone};
 delete copy.cellCount;
 return copy;
}
function moduleEvidence(entry,run,moduleName){
 const artifact=(entry?.analysisArtifacts||[]).find(item=>item.module===moduleName&&item.analysisRunId===run?.analysisRunId)||null;
 const evidence=artifact?.evidence;
 if(!evidence||typeof evidence!=='object')return {artifactId:artifact?.artifactId||null,evidence:null};
 const next=structuredClone(evidence);
 delete next.magnitudes;
 delete next.samples;
 if(Array.isArray(next.events))next.events=next.events.slice(0,400).map(compactEvent).filter(Boolean);
 if(Array.isArray(next.zones))next.zones=next.zones.map(compactZone).filter(Boolean);
 if(Array.isArray(next.families))next.families=next.families.map(family=>{if(!family||typeof family!=='object')return family;const row={...family};delete row.magnitudes;delete row.values;return row;});
 return {artifactId:artifact.artifactId,evidence:next};
}
function criterionPackage(run,id){
 const result=run?.criterionResults?.[id];
 return {criterionId:id,status:result?.status||'not-evaluated',rating:finite(result?.rating),normalizedScore:finite(result?.normalizedScore),components:result?.components||{},safeguards:result?.safeguards||{},explanation:typeof result?.explanation==='string'?result.explanation:'',evidenceRefs:Array.isArray(result?.evidenceRefs)?result.evidenceRefs:[],criterionLogicVersion:result?.criterionLogicVersion||run?.versions?.[`${id}-logic`]||'',calibrationVersion:result?.calibrationVersion||run?.versions?.[`${id}-calibration`]||''};
}

export function buildWeaveHandoff(project,entry,{handoffId=`handoff-${crypto.randomUUID()}`,createdAt=new Date().toISOString()}={}){
 if(!entry)throw new Error('This weave record is missing.');
 const identity=readWeaveIdentity(entry)||{};
 const revision=revisionOf(entry);
 if(!revision)throw new Error('This weave record is missing.');
 const run=analysisRun(entry);
 const evaluation=versionedRun(entry);
 const parent=readWeaveParent(entry);
 let centerlines=null,geometryNote='';
 try{centerlines=resolveAnalysisGeometry(project,revision);}
 catch(error){geometryNote=error.message;}
 const carrier=revision.carrier||{};
 const events=moduleEvidence(entry,run,'events');
 const interstitial=moduleEvidence(entry,run,'interstitial');
 const modulation=moduleEvidence(entry,run,'modulation');
 const presence=moduleEvidence(entry,run,'presence');
 const directional=moduleEvidence(entry,run,'directional');
 const rhythmic=moduleEvidence(entry,run,'rhythmic');
 const contribution=evaluation?.criterionResults?.['WV-05']?.submetrics||{};
 return {version:HANDOFF_VERSION,handoffId,createdAt,identity:{sourceWeaveId:identity.weaveId||'',sourceRevisionId:revision.id,name:identity.name||'',recordVersion:identity.recordVersion??null,generatorVersion:identity.generatorVersion||''},generation:{snapshot:revision.generation?structuredClone(revision.generation):null,seed:revision.generation&&Object.hasOwn(revision.generation,'seed')?revision.generation.seed:null,patternSource:[carrier.kind,carrier.recipeId,carrier.generatorVersion,carrier.preset].filter(item=>typeof item==='string'&&item).join(' ')},geometry:{boundary:Array.isArray(revision.boundary?.points)?revision.boundary.points.map(point=>({x:point.x,y:point.y})):null,geometryVersion:revision.geometryRef?.geometryVersion||'',geometryFingerprint:revision.geometryRef?.geometryFingerprint||'',artifactId:revision.geometryRef?.artifactId??null,families:Array.isArray(revision.strandIdentity?.families)?structuredClone(revision.strandIdentity.families):[],strands:Array.isArray(revision.strandIdentity?.strands)?structuredClone(revision.strandIdentity.strands):[],centerlines,geometryNote},analysis:{analysisRunId:run?.analysisRunId||'',status:run?.status||'not-analyzed',moduleVersions:run?.moduleVersions||{},presence,directional,rhythmic,modulation,events,interstitial,familyContribution:{families:Array.isArray(contribution.families)?structuredClone(contribution.families):[],pairs:Array.isArray(contribution.pairs)?structuredClone(contribution.pairs):[]},artifactRefs:Array.isArray(run?.artifacts)?structuredClone(run.artifacts):[]},evaluation:{criteria:Object.fromEntries(CRITERION_IDS.map(id=>[id,criterionPackage(evaluation,id)]))},lineage:{parent:parent?{weaveId:parent.weaveId,revisionId:parent.revisionId}:null,handoffId}};
}

export function recordWeaveHandoff(entry,packageObject){
 if(packageObject?.version!==HANDOFF_VERSION||typeof packageObject.handoffId!=='string'||!packageObject.handoffId)throw new Error('This is not a weave handoff package.');
 const current=entry.lineage?.version===LINEAGE_VERSION?structuredClone(entry.lineage):{version:LINEAGE_VERSION,parent:null,downstream:[],handoffs:[]};
 if(current.handoffs.length>=40||current.downstream.length>=40)throw new Error('This weave already has the maximum number of handoffs.');
 const artifactId=digest(packageObject);
 current.handoffs.push({handoffId:packageObject.handoffId,createdAt:packageObject.createdAt,artifactId});
 current.downstream.push({objectId:packageObject.handoffId,kind:'interpreter'});
 entry.lineage=createLineageRecord(current);
 return {handoffId:packageObject.handoffId,artifactId};
}

export function readHandoffSource(packageObject){
 if(packageObject?.version!==HANDOFF_VERSION)throw new Error('This is not a weave handoff package.');
 if(Object.hasOwn(packageObject,'overallScore')||Object.hasOwn(packageObject.evaluation||{},'overallScore'))throw new Error('A handoff package does not carry an overall score.');
 return {sourceWeaveId:packageObject.identity?.sourceWeaveId||'',seed:packageObject.generation?.seed??null,geometryFingerprint:packageObject.geometry?.geometryFingerprint||'',familyIds:(packageObject.geometry?.families||[]).map(family=>family.familyId),strandIds:(packageObject.geometry?.strands||[]).map(strand=>strand.strandId),analysisRunId:packageObject.analysis?.analysisRunId||'',ratings:Object.fromEntries(CRITERION_IDS.map(id=>[id,packageObject.evaluation?.criteria?.[id]?.rating??null])),logicVersions:Object.fromEntries(CRITERION_IDS.map(id=>[id,packageObject.evaluation?.criteria?.[id]?.criterionLogicVersion||''])),parentWeaveId:packageObject.lineage?.parent?.weaveId||null,events:(packageObject.analysis?.events?.evidence?.events||[]).map(event=>event.eventId),zones:(packageObject.analysis?.interstitial?.evidence?.zones||[]).map(zone=>zone.zoneId)};
}
