import {readWeaveSource,weaveCalculationInput} from './weave-source.mjs';
import {copyProjectForEdit,copyWorkingForEdit} from './edit-draft.mjs';
import {validateWorkingEdit,WeaveEditGesture} from './weave-edit.mjs';
import {CompactAutosave} from './compact-autosave.mjs';
import {dependencyPlan,presentationPlan} from './dependency-plan.mjs';
const editGesture=new WeaveEditGesture();

import {boundaryEntryForRevision,weaveResultForPattern,patternsForBoundary,activeLibraryItems,adaptGenerationToBoundary,reusableWeaves,latestReusableRevision} from './project-library.mjs';
import {installNumericInputs,sliderEventNumber} from './numeric-inputs.mjs';
import {bindCrossingMarker,crossingSelectionRecord,selectedCrossingEvent,editCrossingOverride} from './crossing-controls.mjs';
import {defaultRule,resolveWeaveRules,effectiveWeaveRule,familyOf,namedRuleMode,applyNamedRuleMode,repeatSequence,seededVariationSequence,withStructuredVariation,familyRepeatRule,applyFamilyNamedRule,clearFamilyRule,pairRepeatRule,applyPairNamedRule,clearPairRule} from './weave-rules.mjs';
import {orderedFamilies,familyEntry,updateFamilyCatalog,indexDerivedFamilies,indexCrossingFamilies} from './family-domain.mjs';

import {defaultInterlacing,validateInterlacing} from './interlacing.mjs';

import {threadStyle,threadPaths,threadStroke,threadOpacity,changeThreadAppearance} from './thread-appearance.mjs';
import {FIELD_PRESENTATION_DEFAULT,effectiveFieldPresentation,changeFieldPresentation,presentationTailLayers} from './field-presentation.mjs';

import {influenceResponseChanges,influenceResponsesLinked} from './influence-controls.mjs';

import {LINE_PRESETS,createLinePreset} from './line-presets.mjs';

import {STITCH_SOURCE,STITCH_RECIPES,createStitchSource,changeHerringboneLayout} from './stitch-source.mjs';

import {STITCH_VERSIONS,stitchIdentity,validateStitchGeneration} from './stitch.mjs';

import {createWorkspace,createProject,activeProject,clone,saveBoundary,saveBoundaryAndUpdatePatterns,restoreBoundary,findRevision,saveCarrierStudy,restoreCarrierStudy,findCarrierRevision,createWeaveStudy,retargetWeaveSource,saveWeaveStudy,restoreWeaveStudy,findWeaveRevision,parseBackup,mergeBackup,addInfluence,duplicateInfluence,candidateInfluence,candidateVariation,removeInfluence,influenceOf,influencesOf,validateTrustedWorkspace,addWeaveFamily,removeWeaveFamily,renameLibraryItem,deleteLibraryItem,duplicateLibraryItem} from './document.mjs';

import {safeDeriveCarrier as deriveCarrier,refreshWeave,derivedSvg,canonical,digest} from './weave.mjs';

import {ATTRACTOR_VERSIONS,validateGeneration} from './attractor.mjs';

import {INFLUENCE_VERSIONS,FAMILY_INFLUENCE_VERSIONS,validateGeneration as validateInfluenceGeneration,familySettings,isIdentityGeneration} from './influence.mjs';

import {COMBINED_VERSIONS,COMBINED_LIMITS,validateCombinedGeneration,combinedIdentity} from './combined.mjs';

import {createRectangularCarrier,carrierInputFingerprint,familyNames,FAMILY_LIMIT} from './carrier.mjs';

import {square,validateBoundary,parseCoordinates,signedArea,bounds} from './boundary.mjs';

import {History} from './history.mjs';

import {IndexedStore,STORE_KEY,ADVISORY_KEY} from './storage.mjs?storage-epoch=20260918';

import {fitView,toScreen,toDocument,zoomAt} from './viewport.mjs';

import {boundarySvg,boundaryDxf} from './exchange.mjs';

import {parseSvgBoundary,svgImportSummary} from './svg-import.mjs';

import {prepareIncrementalWorkspace,validatePreparedPayload,projectPortableByteLength} from './storage-codec.mjs';

import {derivedFamilyPaths} from './weave-render.mjs';

import {applyDisplayPreset,displayPresetName} from './display.mjs';

let selectedCrossing=null,activeInterlaceTarget=null;
const pairTarget=(first,second)=>`pair:${encodeURIComponent(first)}:${encodeURIComponent(second)}`;
function parseInterlaceTarget(target,names){if(!target)return{kind:'default'};if(target.startsWith('pair:')){const parts=target.slice(5).split(':');if(parts.length===2){const first=decodeURIComponent(parts[0]),second=decodeURIComponent(parts[1]);if(first!==second&&names.includes(first)&&names.includes(second))return{kind:'pair',first,second};}}if(names.includes(target))return{kind:'family',family:target};return{kind:'default'};}
const $=id=>document.getElementById(id),BUILD='WF-B1-FIELD-PRESENTATION-20260921';$('build').textContent=BUILD;document.querySelector('.header-build b').textContent='PROJECT / BOUNDARY / WEAVE';

const attractorLayer=document.createElementNS('http://www.w3.org/2000/svg','g');attractorLayer.id='attractor-layer';$('canvas').insertBefore(attractorLayer,$('geometry'));

document.querySelector('footer').innerHTML='BUILD 1 · FIELD PRESENTATION<br>Family-aware recovery zones with deterministic open ends.';

const store=new IndexedStore(indexedDB,localStorage),VIEW_KEY='weave-foundation-view-v2';

let workspace,loadError='';

let libraryTemplateRevisionId=null;

const histories=new Map();

const workingRoots=new WeakMap();

const history=()=>{const id=workspace.activeProjectId;if(!histories.has(id))histories.set(id,new History());return histories.get(id);};

let view=null,width=1,height=1,tool='select',draft=[],selected=null,drag=null,vertexPreview=null,stagedSvg=null,carrierPreview=null,fieldPresentationPreview=null,carrierDerivationCount=0,weaveDerivationCount=0,fullRenderCount=0,targetedRenderCount=0;

let activePatternFamily='A',activeInfluenceFamily='A',activeInfluenceId=undefined;

const treeOpenState=new Map();

let pending=null,activeJob=null,workerSequence=0,workerTimer=0,workerUnavailable=false,enabledAction=false,influenceGesture=null,acceptedVersion=0;const sessionId=crypto.randomUUID(),workerEvents=[];

function workerEvent(type,data={}){workerEvents.push({type,at:performance.now(),...data});if(workerEvents.length>300)workerEvents.splice(0,workerEvents.length-300);}

function typedError(code,message){const error=Error(message);error.code=code;return error;}

const carrierCache=new Map();

const sourceTraces=new WeakMap();

function retainSourceTrace(result,payloadId,trace){if(result?.versions?.derivation!==STITCH_VERSIONS.derivation)return;if(!trace||trace.version!=='stitch-source-trace-v1'||trace.derivedFingerprint!==payloadId)throw typedError('source-trace','Source trace fingerprint does not match geometry.');sourceTraces.set(result,trace);}

let display={theme:'light',boundary:true,grid:true,sourceLattice:true,originalGrid:true,weaveSource:false,weaveDerived:true,attractor:true,isolatedFamilyId:null};

try{const saved=JSON.parse(localStorage.getItem(VIEW_KEY));if(['light','dark','neo'].includes(saved?.theme))display={...display,theme:saved.theme,boundary:saved.boundary===true,grid:saved.grid===true,sourceLattice:saved.sourceLattice===true,originalGrid:saved.originalGrid??(saved.familyA===true||saved.familyB===true),weaveSource:saved.weaveSource===true,weaveDerived:saved.weaveDerived===true,attractor:saved.attractor!==false,isolatedFamilyId:typeof saved.isolatedFamilyId==='string'?saved.isolatedFamilyId:null};}catch{}

const project=()=>activeProject(workspace);

const isCertifiedStudy=weave=>[ATTRACTOR_VERSIONS.study,INFLUENCE_VERSIONS.study,FAMILY_INFLUENCE_VERSIONS.study,COMBINED_VERSIONS.study,STITCH_VERSIONS.study].includes(weave?.weaveVersion);

const versionsForWeave=weave=>weave?.weaveVersion===STITCH_VERSIONS.study?STITCH_VERSIONS:weave?.weaveVersion===COMBINED_VERSIONS.study?COMBINED_VERSIONS:weave?.weaveVersion===FAMILY_INFLUENCE_VERSIONS.study?FAMILY_INFLUENCE_VERSIONS:weave?.weaveVersion===INFLUENCE_VERSIONS.study?INFLUENCE_VERSIONS:ATTRACTOR_VERSIONS;

const validateWeaveGeneration=weave=>(weave?.weaveVersion===STITCH_VERSIONS.study?validateStitchGeneration:weave?.weaveVersion===COMBINED_VERSIONS.study?validateCombinedGeneration:[INFLUENCE_VERSIONS.study,FAMILY_INFLUENCE_VERSIONS.study].includes(weave?.weaveVersion)?validateInfluenceGeneration:validateGeneration)(weave.generation);

const identityGeneration=weave=>weave?.weaveVersion===STITCH_VERSIONS.study?stitchIdentity(weave.generation):weave?.weaveVersion===COMBINED_VERSIONS.study?combinedIdentity(weave.generation):isIdentityGeneration(weave.generation);

function status(message,error=false){$('status').textContent=message;$('status').classList.toggle('error',error);}

function surfaceError(error){if($('field-section').open)setEditFeedback('field','error',`NOT APPLIED · ${error?.message||String(error)}`);if(['concurrent-change','storage-open','storage-blocked'].includes(error?.code)){$('reload-latest').hidden=false;$('project-section').open=true;}status(error?.message||String(error),true);}

function setEditFeedback(scope,state,text){const ids=scope==='pattern'?['pattern-edit-state','canvas-edit-state']:scope==='field'?['field-edit-state','canvas-edit-state']:['canvas-edit-state'];for(const id of ids){const node=$(id);if(!node)continue;node.dataset.state=state;node.textContent=text;}}

function resetEditFeedback(){const pattern=$('pattern-edit-state'),field=$('field-edit-state'),canvas=$('canvas-edit-state');if(pattern){pattern.dataset.state='ready';pattern.textContent='READY · CHANGES PREVIEW AND SAVE AUTOMATICALLY';}if(field){field.dataset.state='ready';field.textContent='READY · CHANGES CALCULATE AND SAVE AUTOMATICALLY';}if(canvas){canvas.dataset.state='ready';canvas.textContent='READY';}}

function focusDerivedEditing(showGuide=false){const hasResult=Boolean((pending?.working||project().working).weave),next=hasResult?applyDisplayPreset(display,'derived-only'):{...display,sourceLattice:false,originalGrid:true,weaveSource:false,weaveDerived:true};next.attractor=showGuide||display.attractor;const changed=JSON.stringify(next)!==JSON.stringify(display);display=next;if(changed)saveView();}

function renderProjectSummary(){const p=project(),savedBoundaries=p.boundaries.length,savedWeaves=p.carrierStudies.length;$('project-summary').textContent=`${p.name} · ${savedBoundaries} BOUNDAR${savedBoundaries===1?'Y':'IES'} · ${savedWeaves} WEAVE${savedWeaves===1?'':'S'}`;}

function storageDiagnostics(){const packed=store.lastPacked;if(!packed)return null;const activeProjectBytes=projectPortableByteLength(packed,packed.manifest.activeProjectId),encoder=new TextEncoder(),bytes=value=>encoder.encode(JSON.stringify(value)).byteLength,records=new Map(packed.records.map(record=>[record.id,record])),referencedRecords=new Set(),referencedPayloads=new Set();for(const owner of packed.manifest.projects){const current=owner.working?.weave?.derived?.payloadId;if(current)referencedPayloads.add(current);for(const study of owner.weaveStudies)for(const revision of study.revisions){const recordId=revision.working?.recordId;if(recordId)referencedRecords.add(recordId);}}for(const recordId of referencedRecords){const payloadId=records.get(recordId)?.value?.weave?.derived?.payloadId;if(payloadId)referencedPayloads.add(payloadId);}const payloads=packed.payloads.map(payload=>{const binary=Object.values(payload.byteLengths).reduce((sum,value)=>sum+value,0),portable=bytes({...payload,f64:null,u32:null,i32:null,u16:null})-16+Object.values(payload.byteLengths).reduce((sum,value)=>sum+2+4*Math.ceil(value/3),0);return{id:payload.id,codec:payload.codec,portable,binary,counts:payload.counts,referenced:referencedPayloads.has(payload.id)}});const recordSizes=packed.records.map(record=>({id:record.id,bytes:bytes(record),referenced:referencedRecords.has(record.id)}));return{backupBytes:activeProjectBytes,workspaceBytes:packed.backupBytes,scope:'active-project',limit:10*1024*1024,remaining:10*1024*1024-activeProjectBytes,manifestBytes:bytes(packed.manifest),records:{total:recordSizes.length,referenced:referencedRecords.size,bytes:recordSizes.reduce((sum,item)=>sum+item.bytes,0),unreferencedBytes:recordSizes.filter(item=>!item.referenced).reduce((sum,item)=>sum+item.bytes,0)},payloads:{total:payloads.length,referenced:referencedPayloads.size,portableBytes:payloads.reduce((sum,item)=>sum+item.portable,0),unreferencedBytes:payloads.filter(item=>!item.referenced).reduce((sum,item)=>sum+item.portable,0),largest:payloads.sort((a,b)=>b.portable-a.portable).slice(0,12)},projects:packed.manifest.projects.map(owner=>({name:owner.name,boundaries:owner.boundaries.length,patterns:owner.carrierStudies.length,grids:owner.weaveStudies.length,revisions:owner.weaveStudies.reduce((sum,study)=>sum+study.revisions.length,0),portableBytes:projectPortableByteLength(packed,owner.id)}))};}

function attempt(action){try{const result=action();if(result?.then)result.catch(surfaceError);}catch(error){surfaceError(error);}}

function storageTask(message,signal){return new Promise((resolve,reject)=>{const worker=new Worker(new URL('./storage-worker.mjs',import.meta.url),{type:'module'}),requestId=crypto.randomUUID(),abort=()=>{worker.terminate();reject(typedError('completion-timeout','Storage preparation exceeded the completion deadline.'))};if(signal?.aborted){abort();return}signal?.addEventListener('abort',abort,{once:true});worker.onerror=e=>{signal?.removeEventListener('abort',abort);worker.terminate();reject(typedError('storage-worker',e.message||'Storage worker failed.'))};worker.onmessage=e=>{if(e.data?.requestId!==requestId)return;signal?.removeEventListener('abort',abort);worker.terminate();if(e.data.type==='failure'){reject(typedError(e.data.error?.code||'storage-worker',e.data.error?.message||'Storage preparation failed.'));return}resolve(e.data)};worker.postMessage({...message,requestId});});}

async function prepareStorage(next,trusted=false,signal){return (await storageTask({type:'pack',workspace:next,trusted},signal)).packed;}

async function persistSnapshot(candidate,signal){const next=candidate.workspace,trusted=candidate.trusted===true;if(store.blocked)throw typedError('storage-blocked','Saving is paused: '+(loadError||'Transactional storage could not be opened or validated.'));await store.assertCurrent();const active=next.projects.find(item=>item.id===next.activeProjectId),derived=active?.working?.weave?.derived;if(store.lastPacked&&derived?.strands){const payload=candidate.payload||(await storageTask({type:'encode-derived',derived},signal)).payload;validatePreparedPayload(payload,derived);const prepared=prepareIncrementalWorkspace(next,store.lastPacked,payload);await store.commitDelta(prepared,signal);return prepared.packed;}const packed=await prepareStorage(next,trusted,signal);await store.commit(packed,signal);return packed;}
async function persist(next,trusted=false,signal){await autosave.settle();const packed=await persistSnapshot({workspace:next,trusted},signal);workspace=next;acceptedVersion++;return packed;}
function autosaveFeedback(event){const meta=event.item?.meta||{},settlementMs=Number.isFinite(meta.started)?performance.now()-meta.started:null;workerEvent(`autosave-${event.state}`,{autosaveSequence:event.item?.sequence||0,acceptedVersion,errorCode:event.error?.code||null,settlementMs});if(event.state==='saved'&&!event.queued&&event.item.sequence===autosave.sequence&&!pending&&!activeJob){if(meta.feedback)setEditFeedback(meta.feedback.scope,'applied',`APPLIED + SAVED · ${meta.feedback.label}`);status(meta.savedStatus||'LATEST ACCEPTED CHANGE SAVED.');}if(event.state==='failed'&&!event.queued&&event.item.sequence===autosave.sequence){const error=event.error;if(meta.feedback)setEditFeedback(meta.feedback.scope,'error',`APPLIED · BACKUP FAILED · ${error?.message||error}`);if(['concurrent-change','storage-open','storage-blocked'].includes(error?.code)){$('reload-latest').hidden=false;$('project-section').open=true;}status(`CHANGE APPLIED · BACKUP FAILED: ${error?.message||error}`,true);}}
const autosave=new CompactAutosave({delay:180,persist:async(candidate,item)=>{const packed=await persistSnapshot(candidate);if(item.sequence===autosave.sequence&&candidate.workspace===workspace)workingRoots.set(activeProject(candidate.workspace).working,store.head.currentRoot);return packed;},onState:autosaveFeedback});
function acceptWorkspace(next,{before=null,payload=null,feedback=null,savedStatus=null,recordHistory=true}={}){workspace=next;acceptedVersion++;if(before&&recordHistory)history().record(before,project().working);autosave.accept({workspace:next,payload},{feedback,savedStatus});}

function deriveWorking(working=project().working,boardId=project().id){if(!working.carrier)return null;const fingerprint=carrierInputFingerprint(working.boundary,working.carrier),cacheKey=boardId+':'+working.carrier.id+':'+fingerprint,cached=carrierCache.get(cacheKey);if(cached?.inputFingerprint===fingerprint)return cached;const derived=deriveCarrier(working.boundary,working.carrier,boardId);carrierCache.set(cacheKey,derived);if(carrierCache.size>12)carrierCache.delete(carrierCache.keys().next().value);carrierDerivationCount++;return derived;}

function cancelPending(message='PENDING CHANGE CANCELLED. LAST COMPLETE RESULT RESTORED.') {editGesture.clear();const feedback=pending?.feedback;clearTimeout(workerTimer);workerTimer=0;if(activeJob){workerEvent('cancelled',{seq:activeJob.seq,requestId:activeJob.requestId,reason:'user'});activeJob.controller?.abort();activeJob.worker.terminate();clearTimeout(activeJob.timeout);activeJob=null}pending=null;carrierPreview=null;renderR1BState(true);if(feedback)setEditFeedback(feedback.scope,'ready','READY · LAST SAVED RESULT RESTORED');status(message);}

function requestWorking(working,label,immediate=false,options={}){return updateWorking(working,label,{...options,preview:!immediate});}

function queueWorkingCalculation(working,label,immediate=false,options={}){
 if(workerUnavailable)throw Error('Certified nonlinear computation is unavailable in this browser session.');validateWeaveGeneration(working.weave);const versions=versionsForWeave(working.weave),candidate=weaveCalculationInput(readWeaveSource(working,project().id)),input=digest(candidate),base=`${store.head?.currentRoot||'unsaved'}:${acceptedVersion}`,current=project().working?.weave?.derived?weaveCalculationInput(readWeaveSource(project().working,project().id)):null,plan=dependencyPlan(current,candidate),nextPending={previewOnly:!immediate,working:copyWorkingForEdit(working),candidate,input,base,acceptedVersion,label,versions,plan,phase:'QUEUED',started:performance.now(),projectUpdate:options.projectUpdate?copyProjectForEdit(options.projectUpdate):null,saveWeaveName:options.saveWeaveName||null,feedback:options.feedback||null};pending=nextPending;workerEvent('queued',{input,immediate,plan});clearTimeout(workerTimer);workerTimer=0;if(pending.feedback)setEditFeedback(pending.feedback.scope,'working',`UPDATING · ${pending.feedback.label}`);renderR1BState(false);status('UPDATING WEAVE — SHOWING THE LAST COMPLETE RESULT.');if(activeJob){if(immediate&&activeJob.input===input&&activeJob.base===base&&activeJob.request.previewOnly){Object.assign(activeJob.request,nextPending,{previewOnly:false,phase:'CERTIFYING',started:activeJob.request.started});pending=activeJob.request;workerEvent('promoted-preview',{requestId:activeJob.requestId,input});return;}const obsolete=activeJob;clearTimeout(obsolete.timeout);obsolete.worker.onmessage=null;obsolete.worker.onerror=null;obsolete.worker.terminate();activeJob=null;primeIdleDerivationWorker();workerEvent('cancelled-obsolete',{requestId:obsolete.requestId,input:obsolete.input,replacement:input});}if(plan.reuse.geometry){const totalMs=performance.now()-pending.started,feedback=pending.feedback;pending=null;carrierPreview=null;editGesture.clear();renderR1BState(true);if(feedback)setEditFeedback(feedback.scope,'applied',`UNCHANGED · ${feedback.label}`);status('SOURCE RETURNED TO THE CURRENT CERTIFIED RESULT.');workerEvent('reused-current',{input,totalMs,plan});return;}workerTimer=setTimeout(dispatchPending,immediate?0:40);
}

let idleDerivationWorker=null;

function primeIdleDerivationWorker(){if(idleDerivationWorker)return;try{const worker=new Worker(new URL('./r1b-worker.mjs',import.meta.url),{type:'module'});idleDerivationWorker=worker;worker.onerror=()=>{if(idleDerivationWorker===worker)idleDerivationWorker=null;worker.terminate();};}catch{}}

primeIdleDerivationWorker();

window.addEventListener('pagehide',()=>{void autosave.flush();idleDerivationWorker?.terminate();activeJob?.worker.terminate();});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')void autosave.flush();});

function dispatchPending(){workerTimer=0;if(!pending||activeJob)return;const p=pending,seq=++workerSequence,requestId=sessionId+':'+seq,worker=idleDerivationWorker||new Worker(new URL('./r1b-worker.mjs',import.meta.url),{type:'module'}),job={worker,request:p,requestId,seq,input:p.input,base:p.base,attempt:p.retried?1:0,started:performance.now()};idleDerivationWorker=null;activeJob=job;p.phase='CERTIFYING';workerEvent('dispatched',{seq,requestId,input:p.input,attempt:job.attempt,requestStarted:p.started,plan:p.plan});renderR1BState(false);status('UPDATING WEAVE — SHOWING THE LAST COMPLETE RESULT.');const message={protocolVersion:p.versions.protocol,workerBuildId:BUILD,sessionId,requestSequence:seq,requestId,boardId:project().id,weaveStudyId:p.working.weave.studyId,baseCommittedFingerprint:p.base,candidateInputFingerprint:p.input,algorithmVersions:{...p.versions},dependencyPlan:p.plan,candidate:p.candidate};

 const fail=(error,reuseWorker=false)=>{if(activeJob!==job)return;if(reuseWorker){worker.onmessage=null;worker.onerror=null;idleDerivationWorker=worker;}else{worker.terminate();primeIdleDerivationWorker();}clearTimeout(job.timeout);activeJob=null;const code=error?.code||'worker-failure',text=error?.message||'Worker failed.',totalMs=performance.now()-p.started;workerEvent('failed',{seq,requestId,code,message:text,totalMs,attempt:job.attempt});if(pending!==p){workerEvent('superseded-result',{seq,requestId,outcome:'failed'});setTimeout(dispatchPending,0);return}if(!p.retried&&(code==='worker-load'||code==='worker-crash')){p.retried=true;workerEvent('retrying',{seq,requestId,code});setTimeout(dispatchPending,0);return}if((code==='worker-load'||code==='worker-crash')&&p.retried)workerUnavailable=true;pending=null;carrierPreview=null;editGesture.clear();renderR1BState(true);if(p.feedback)setEditFeedback(p.feedback.scope,'error',`NOT APPLIED · ${text}`);if(code==='concurrent-change'){$('reload-latest').hidden=false;$('project-section').open=true;}status(`R1D ${code.toUpperCase()}: ${text}`,true)};

 worker.onerror=e=>fail(typedError('worker-load',e.message||'Certified worker failed to load.'));

 worker.onmessage=async e=>{

  if(activeJob!==job||e.data?.requestId!==requestId||e.data.requestSequence!==seq){workerEvent('stale-message',{seq,requestId});return}

  if(e.data.type==='failure'){fail(typedError(e.data.error?.code||'evaluator',e.data.error?.message||'Certified derivation failed.'),true);return}

  let deadlineTimer;

  try{

   const m=e.data,receivedEpoch=performance.timeOrigin+performance.now(),validationStarted=performance.now();if(pending!==p){clearTimeout(job.timeout);worker.onmessage=null;worker.onerror=null;idleDerivationWorker=worker;activeJob=null;workerEvent('superseded-result',{seq,requestId,outcome:'discarded'});setTimeout(dispatchPending,0);return}

   if(m.protocolVersion!==p.versions.protocol||m.workerBuildId!==BUILD||m.sessionId!==sessionId||m.boardId!==project().id||m.weaveStudyId!==p.working.weave.studyId||m.baseCommittedFingerprint!==p.base||m.candidateInputFingerprint!==p.input||p.acceptedVersion!==acceptedVersion||digest(p.candidate)!==p.input||m.resultCanonicalFingerprint!==m.payload?.id)throw typedError('result-validation','Stale or invalid certified worker result.');

   validatePreparedPayload(m.payload,m);retainSourceTrace(m.result,m.payload.id,m.sourceTrace);const validationMs=performance.now()-validationStarted;clearTimeout(job.timeout);
   if(p.previewOnly){worker.onmessage=null;worker.onerror=null;idleDerivationWorker=worker;activeJob=null;p.phase='PREVIEW';p.working={...p.working,weave:{...p.working.weave,derived:m.result}};carrierPreview=p.working;renderCanvas();if(p.feedback)setEditFeedback(p.feedback.scope,'working',`PREVIEW · ${p.feedback.label} · RELEASE TO SAVE`);workerEvent('previewed',{seq,requestId,workerMs:m.workerMs,totalMs:performance.now()-p.started});return;}
 p.phase='ACCEPTING';status('UPDATING WEAVE — APPLYING THE LATEST RESULT.');

   if(performance.now()-p.started>750)throw typedError('completion-timeout','Certified influence computation exceeded the 750 ms completion maximum.');

   const before=project().working,nextWorking={...p.working,weave:{...p.working.weave,derived:m.result}},updatedProject=p.projectUpdate?copyProjectForEdit(p.projectUpdate):copyProjectForEdit(project());updatedProject.working=nextWorking;const committedProject=p.saveWeaveName?saveWeaveStudy(updatedProject,p.saveWeaveName,true,true).project:updatedProject,nextWorkspace={...workspace,projects:workspace.projects.map(x=>x.id===workspace.activeProjectId?committedProject:x)};if(activeJob!==job||pending!==p)return;

   workspace=nextWorkspace;acceptedVersion++;carrierPreview=null;retainSourceTrace(project().working.weave.derived,m.payload.id,m.sourceTrace);const historyStarted=performance.now();history().recordImmutable(before);const historyMs=performance.now()-historyStarted;weaveDerivationCount++;worker.onmessage=null;worker.onerror=null;idleDerivationWorker=worker;activeJob=null;pending=null;const renderStarted=performance.now();if(p.projectUpdate&&p.working.carrier?.kind===STITCH_SOURCE){renderStitchControls(project().working.carrier);renderCanvas();}renderR1BState(true);if(p.projectUpdate){renderBoards();renderSavedChoices();if(before.carrier?.id!==nextWorking.carrier?.id){renderWeaveControls();renderCanvas();}}renderProjectSummary();if(p.feedback)setEditFeedback(p.feedback.scope,'applied',`APPLIED · BACKUP PENDING · ${p.feedback.label}`);status(`CERTIFIED CHANGE APPLIED · ${m.workerMs.toFixed(1)} MS WORKER · BACKUP PENDING.`);autosave.accept({workspace:nextWorkspace,payload:m.payload},{feedback:p.feedback,started:p.started,savedStatus:`CERTIFIED CHANGE SAVED · ${m.workerMs.toFixed(1)} MS WORKER.`});await new Promise(resolve=>requestAnimationFrame(()=>resolve()));const renderMs=performance.now()-renderStarted,totalMs=performance.now()-p.started,phases={dispatchMs:(m.timing?.receivedEpoch||performance.timeOrigin+job.started)-(performance.timeOrigin+p.started),deriveMs:m.timing?.deriveMs,encodeMs:m.timing?.encodeMs,transferMs:receivedEpoch-(m.timing?.postedEpoch||receivedEpoch),validationMs,historyMs,renderMs};

   workerEvent('accepted',{seq,requestId,workerMs:m.workerMs,totalMs,acceptedVersion,phases,plan:p.plan,reused:m.reused||[]});if(totalMs>750){workerEvent('performance-failed',{seq,requestId,totalMs,phases});status(`R1D COMPLETION-TIMEOUT: result applied at ${totalMs.toFixed(1)} ms, above 750 ms; backup remains pending.`,true);return}

  }catch(error){clearTimeout(deadlineTimer);if(!error.code)error.code='commit';fail(error)}

 };

 job.timeout=setTimeout(()=>fail(typedError('completion-timeout','Certified influence computation exceeded the 750 ms completion maximum.')),Math.max(0,750-(performance.now()-p.started)));worker.postMessage(message);

}

async function certifyWorking(working,boardId,validationWorker=null){const w=working.weave;if(!isCertifiedStudy(w))return;const f=influenceOf(w),versions=versionsForWeave(w),identity=w.weaveVersion===ATTRACTOR_VERSIONS.study?(!f?.enabled||f.strength===0||w.generation.tension===100):identityGeneration(w);if(identity&&w.weaveVersion!==STITCH_VERSIONS.study){const expected=refreshWeave(working,boardId).weave.derived;if(canonical(expected)!==canonical(w.derived))throw Error('Saved identity geometry failed validation.');return}const candidate=weaveCalculationInput(readWeaveSource(working,boardId)),input=digest(candidate),seq=++workerSequence,requestId=sessionId+':validate:'+seq;await new Promise((resolve,reject)=>{let worker=validationWorker,owned=false;try{if(!worker){worker=new Worker(new URL('./r1b-worker.mjs',import.meta.url),{type:'module'});owned=true}}catch(e){reject(e);return}const finish=(action,value)=>{clearTimeout(timer);worker.onmessage=null;worker.onerror=null;if(owned)worker.terminate();action(value)},timer=setTimeout(()=>{worker.terminate();reject(Error('Saved study validation exceeded 750 ms.'))},750);worker.onerror=e=>finish(reject,Error(e.message||'Saved study worker failed.'));worker.onmessage=e=>{const m=e.data;if(m.type==='failure')finish(reject,typedError(m.error?.code||'validation-worker',`Saved study worker failed: ${m.error?.message||'Unknown worker failure'}`));else if(m.type!=='success'||m.requestId!==requestId||m.candidateInputFingerprint!==input)finish(reject,typedError('validation-protocol','Saved study worker response did not match its validation request.'));else if(canonical(m.result)!==canonical(w.derived))finish(reject,typedError('validation-geometry',`Saved certified geometry failed validation (${w.weaveVersion}, study ${w.studyId}).`));else {try{retainSourceTrace(w.derived,m.payload.id,m.sourceTrace);finish(resolve)}catch(error){finish(reject,error)}}};worker.postMessage({protocolVersion:versions.protocol,workerBuildId:BUILD,sessionId,requestSequence:seq,requestId,boardId,weaveStudyId:w.studyId,baseCommittedFingerprint:'validation',candidateInputFingerprint:input,algorithmVersions:{...versions},candidate})});}

async function certifyWorkspace(value){validateTrustedWorkspace(value);let worker;try{worker=new Worker(new URL('./r1b-worker.mjs',import.meta.url),{type:'module'});for(const p of value.projects){await certifyWorking(p.working,p.id,worker);for(const entry of p.weaveStudies)for(const revision of entry.revisions)await certifyWorking(revision.working,p.id,worker)}return value}finally{worker?.terminate()}}

function editWorking(next,label,options={}){editGesture.clear();return updateWorking(next,label,options);}

function updateWorking(next,label,options={}){
 next=validateWorkingEdit(next,project().id);
 if(options.presentation)return savePresentationEdit(next,options.interlacePatch);
 if(isCertifiedStudy(next.weave)){queueWorkingCalculation(next,label,!options.preview,options);return;}
 if(next.carrier)deriveWorking(next);
 if(next.weave){next=refreshWeave(next,project().id);weaveDerivationCount++;}
 if(options.preview){carrierPreview=next;renderCanvas();if(options.feedback)setEditFeedback(options.feedback.scope,'working',`PREVIEW · ${options.feedback.label} · RELEASE TO SAVE`);return;}
 carrierPreview=null;const before=clone(project().working),changed=clone(workspace),updated=options.projectUpdate?clone(options.projectUpdate):clone(project());updated.working=clone(next);const committed=options.saveWeaveName?saveWeaveStudy(updated,options.saveWeaveName,isCertifiedStudy(next.weave),true).project:updated;changed.projects=changed.projects.map(p=>p.id===committed.id?committed:p);
 acceptWorkspace(changed,{before,feedback:options.feedback,savedStatus:label});render();if(options.feedback)setEditFeedback(options.feedback.scope,'applied',`APPLIED · BACKUP PENDING · ${options.feedback.label}`);status(`${label} BACKUP PENDING.`);return Promise.resolve();
}

async function setBoundary(boundary,label){const found=findRevision(project(),project().working.sourceRevisionId);if(!found){await editWorking({...clone(project().working),boundary},label);return}const base=clone(project());base.working.boundary=boundary;const result=saveBoundaryAndUpdatePatterns(base,found.entry.name),saveWeaveName=result.project.working.weave?currentWeaveName(result.project.working,result.project):null;await editWorking(result.project.working,`${label} SAVED AND ATTACHED PATTERNS UPDATED.`,{projectUpdate:result.project,saveWeaveName});}

function syncDisplayPresets(){const name=displayPresetName(display),labels={'derived-only':'DISTORTED ONLY','compare':'SOURCE + DISTORTED','construction':'CARRIER CONSTRUCTION',custom:'CUSTOM LAYER VIEW'};for(const [id,preset] of [['display-derived-only','derived-only'],['display-compare','compare'],['display-construction','construction']])$(id).classList.toggle('active',name===preset);document.querySelectorAll('[data-display-preset]').forEach(button=>button.classList.toggle('active',button.dataset.displayPreset===name));document.querySelectorAll('[data-display-key]').forEach(input=>input.checked=display[input.dataset.displayKey]===true);$('display-mode-status').textContent=labels[name];}

function saveView(){try{localStorage.setItem(VIEW_KEY,JSON.stringify(display));}catch{}document.body.dataset.theme=display.theme;document.querySelectorAll('[data-theme]').forEach(b=>b.classList.toggle('active',b.dataset.theme===display.theme));for(const [id,key] of [['boundary','boundary'],['grid','grid'],['source-lattice','sourceLattice'],['original-grid','originalGrid'],['weave-source','weaveSource'],['weave-derived','weaveDerived'],['attractor','attractor']]){const input=$(`show-${id}`);if(input)input.checked=display[key];}syncDisplayPresets();renderCanvas();}

function element(tag,className,text){const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;}

function readableNumber(value){return Number(value).toLocaleString(undefined,{maximumFractionDigits:3,useGrouping:false});}

function syncSlider(id,value,limits){const model=$(id),range=$(`${id}-range`),output=$(`${id}-value`);if(limits){range.min=limits.min;range.max=limits.max;range.step=limits.step;}model.value=value;if(document.activeElement!==range)range.value=value;if(output)output.value=readableNumber(value);}

function boundarySliderLimits(boundary){const b=bounds(boundary.points),extent=Math.max(b.maxX-b.minX,b.maxY-b.minY,1),pad=extent;return{x:{min:b.minX-pad,max:b.maxX+pad,step:extent/500},y:{min:b.minY-pad,max:b.maxY+pad,step:extent/500},radius:{min:Math.max(extent/500,0.001),max:extent*2,step:extent/500}};}

function renderVertexControls(boundary){const points=vertexPreview?.points||boundary.points;if(selected===null||selected<0||selected>=points.length)selected=0;const index=$('vertex-index-range');index.max=points.length;index.value=selected+1;$('vertex-index-value').value=`${selected+1} / ${points.length}`;const limits=boundarySliderLimits({points}),point=points[selected];for(const axis of ['x','y']){const control=$(`vertex-${axis}-range`),limit=limits[axis];control.min=limit.min;control.max=limit.max;control.step=limit.step;if(document.activeElement!==control)control.value=point[axis];$(`vertex-${axis}-value`).value=readableNumber(point[axis]);}}

function itemActions(type,item){const box=element('div','tree-actions');for(const [action,label] of [['rename','RENAME'],['duplicate','COPY'],['delete','DELETE']]){const b=element('button','tree-action',label);b.type='button';b.dataset.libraryAction=action;b.dataset.libraryType=type;b.dataset.libraryId=item.id;b.title=`${action} ${item.name}`;box.append(b);}return box;}

function setTreeOpen(details,key,fallback){details.dataset.treeKey=key;details.open=treeOpenState.has(key)?treeOpenState.get(key):fallback;return details;}

function treeIdentity(type){return type==='boundary'?'BOUNDARY':type==='pattern'?'WEAVE PATTERN':'INFLUENCED GRID';}

function treeEntry(entry,type,activeId,children=[]){const active=entry.latestRevisionId===activeId,details=setTreeOpen(element('details',`tree-node tree-${type}`),`${type}:${entry.id}`,children.length>0||active),summary=element('summary','tree-node-summary'),identity=element('div','tree-node-identity'),kind=element('b','tree-node-kind',treeIdentity(type)),label=element('button',`tree-node-label${active?' active':''}`,entry.name),count=element('div','tree-node-count',active?'OPEN NOW':children.length?`${children.length} SAVED RESULT${children.length===1?'':'S'}`:'SELECT TO OPEN');label.type='button';label.dataset[type==='boundary'?'revision':type==='pattern'?'carrierRevision':'weaveRevision']=entry.latestRevisionId;identity.append(kind,label,count);summary.append(identity,itemActions(type,entry));details.append(summary,...children);return details;}

function libraryRow({name,kind,count='',active=false,dataset={},thumbnail=''}){const button=element('button',`library-row${active?' active':''}`);button.type='button';for(const [key,value] of Object.entries(dataset))button.dataset[key]=value;const mark=element('span','library-select',active?'■':'□'),preview=element('span','library-thumb');preview.innerHTML=thumbnail||'<span aria-hidden="true">◇</span>';const copy=element('span','library-row-copy'),title=element('b','',name),meta=element('small','',kind);copy.append(title,meta);button.append(mark,preview,copy,element('span','library-count',String(count)));return button;}

function boundaryThumbnail(entry){const points=entry.revisions.at(-1).boundary.points,b=bounds(points),width=b.maxX-b.minX||1,height=b.maxY-b.minY||1,coords=points.map(point=>`${4+(point.x-b.minX)/width*44},${34-(point.y-b.minY)/height*30}`).join(' ');return `<svg viewBox="0 0 52 38" aria-hidden="true"><polygon points="${coords}"/></svg>`;}

function weaveThumbnail(pattern){const revision=pattern.revisions.at(-1),families=familyNames(revision.carrier),lines=families.slice(0,4).map((_,index)=>{const y=8+index*7;return `<path d="M3 ${y+8} L20 ${y-3} L49 ${y+8}"/>`;}).join('');return `<svg viewBox="0 0 52 38" aria-hidden="true">${lines}</svg>`;}

function renderBoards(){const p=project(),selection=activeLibraryItems(p),projects=$('board-list'),boundaries=$('boundary-list'),weaves=$('weave-list'),templates=$('library-template-list'),patterns=patternsForBoundary(p,selection.boundary),library=reusableWeaves(p);libraryTemplateRevisionId=latestReusableRevision(p,libraryTemplateRevisionId)||selection.pattern?.latestRevisionId||null;projects.replaceChildren(...workspace.projects.map(board=>libraryRow({name:board.name,kind:'PROJECT',count:board.boundaries.length,active:board.id===workspace.activeProjectId,dataset:{board:board.id}})));boundaries.replaceChildren(...p.boundaries.map(entry=>libraryRow({name:entry.name,kind:'BOUNDARY',count:patternsForBoundary(p,entry).length,active:entry.id===selection.boundary?.id,dataset:{revision:entry.latestRevisionId},thumbnail:boundaryThumbnail(entry)})));weaves.replaceChildren(...patterns.map(entry=>libraryRow({name:entry.name,kind:weaveResultForPattern(p,entry)?'APPLIED WEAVE · FIELD FORCES SAVED':'APPLIED WEAVE',count:familyNames(entry.revisions.at(-1).carrier).length,active:entry.id===selection.pattern?.id,dataset:{carrierRevision:entry.latestRevisionId},thumbnail:weaveThumbnail(entry)})));templates.replaceChildren(...library.map(({pattern,boundaryName})=>libraryRow({name:pattern.name,kind:`REUSABLE · FROM ${boundaryName}`,count:familyNames(pattern.revisions.at(-1).carrier).length,active:pattern.latestRevisionId===libraryTemplateRevisionId,dataset:{templateRevision:pattern.latestRevisionId},thumbnail:weaveThumbnail(pattern)})));$('library-project-name').textContent=p.name;$('library-boundary-count').textContent=String(p.boundaries.length).padStart(2,'0');$('library-weave-count').textContent=String(patterns.length).padStart(2,'0');$('library-template-count').textContent=String(library.length).padStart(2,'0');$('library-apply-weave').disabled=!libraryTemplateRevisionId||!selection.boundary;$('context-project').textContent=p.name;$('context-boundary').textContent=selection.boundary?.name||'CHOOSE BOUNDARY';$('context-weave').textContent=selection.pattern?.name||'CHOOSE WEAVE';}

function renderSavedChoices(){const p=project(),boundarySelect=$('saved-boundary'),priorBoundary=boundarySelect.value;$('saved-boundary-picker').hidden=!p.boundaries.length;boundarySelect.replaceChildren(...p.boundaries.map(entry=>{const option=document.createElement('option');option.value=entry.latestRevisionId;option.textContent=entry.name;return option;}));boundarySelect.value=[...boundarySelect.options].some(option=>option.value===priorBoundary)?priorBoundary:p.working.sourceRevisionId||p.boundaries[0]?.latestRevisionId||'';const group=$('saved-pattern-presets'),priorPattern=$('stitch-preset').value;group.replaceChildren(...p.carrierStudies.map(entry=>{const option=document.createElement('option');option.value='saved:'+entry.latestRevisionId;option.textContent=entry.name;return option;}));if([...$('stitch-preset').options].some(option=>option.value===priorPattern))$('stitch-preset').value=priorPattern;}

function render(){

  fullRenderCount++;if(!pending)resetEditFeedback();threadPreview=null;fieldPresentationPreview=null;renderInterlaceControls();renderThreadControls();renderBoards();renderSavedChoices();renderWeaveControls();const b=project().working.boundary;

  const p=project();renderProjectSummary();

  $('boundary-summary').textContent=`${b.points.length} VERTICES · AREA ${Math.abs(signedArea(b.points)).toLocaleString(undefined,{maximumFractionDigits:3})} U²`;

  $('boundary-source').hidden=!b.source;$('boundary-source').textContent=b.source?`SOURCE ${b.source.filename} · SVG · Y NEGATED${b.source.viewBox?` · VIEWBOX ${b.source.viewBox}`:''}`:'';

  $('coordinates').value=b.points.map(p=>`${p.x}, ${p.y}`).join('\n');

  renderVertexControls(b);

  $('undo').disabled=!history().past.length;$('redo').disabled=!history().future.length;

  const source=findRevision(project(),project().working.sourceRevisionId),carrierSource=findCarrierRevision(project(),project().working.carrierSourceRevisionId);

  if(carrierSource)$('carrier-name').value=carrierSource.entry.name;

  const changed=carrierSource?JSON.stringify({boundary:carrierSource.revision.boundary,carrier:carrierSource.revision.carrier})!==JSON.stringify({boundary:b,carrier:project().working.carrier}):(!source||JSON.stringify(source.revision.boundary)!==JSON.stringify(b)||project().working.carrier!==null);

  $('drawing-title').textContent=`${project().name}${changed?' · UNSAVED CHANGES':''}`;renderCanvas();

  const carrier=project().working.carrier;$('carrier-controls').hidden=!carrier||carrier.kind===STITCH_SOURCE;renderStitchControls(carrier);ensureFamilyIdentityControls();

  if(carrier&&carrier.kind!==STITCH_SOURCE){const names=familyEntries().map(entry=>entry.key);if(!names.includes(activePatternFamily))activePatternFamily=names[0];renderPatternFamilyTabs(carrier);const f=carrier.families[activePatternFamily],angle=carrier.generatorVersion==='rect-v1'?carrier.angleDegrees+(activePatternFamily==='B'?90:0):f.angleDegrees;for(const [id,value] of [['family-spacing',f.spacing],['family-angle',angle],['family-offset',f.offset],['family-density',f.density]])syncSlider(id,value);const d=deriveWorking();$('carrier-counts').textContent=names.map(n=>`${familyLabel(n)} ${d.diagnostics.counts[n].retained}/${d.diagnostics.counts[n].available} RETAINED`).join(' · ');$('add-pattern-family').disabled=names.length>=FAMILY_LIMIT;$('remove-pattern-family').disabled=names.length<=2;}

  updateCanvasLegend();

}



function updateCanvasLegend(){const p=project(),w=p.working.weave,fields=influencesOf(pending?.working.weave||w),carrier=p.working.carrier?deriveWorking():null,source=carrier?carrier.paths.filter(path=>path.selected).length:0,derived=w?Object.values(w.derived.diagnostics.counts).reduce((a,b)=>a+b,0):0;$('legend-source-count').textContent=String(source);$('legend-derived-count').textContent=String(derived);$('legend-guide-state').textContent=fields.length&&display.attractor?`${fields.length} FIELD${fields.length===1?'':'S'}`:'OFF';}



function familyEntries(working=project().working){return working.carrier?orderedFamilies(working.carrier,working.familyCatalog):[];}
function familyLabel(key,working=project().working){return familyEntries(working).find(entry=>entry.key===key)?.label||key;}
function isolatedFamilyKey(working=project().working){return familyEntries(working).find(entry=>entry.id===display.isolatedFamilyId)?.key||null;}

function ensureFamilyIdentityControls(){if($('family-identity'))return;const controls=$('carrier-controls'),counts=$('carrier-counts'),details=element('details','subsection family-identity');details.id='family-identity';const heading=element('summary','', 'FAMILY DETAILS');heading.append(element('span','','+'));const box=element('div','section-body'),label=document.createElement('label');label.htmlFor='family-label';label.textContent='FAMILY NAME';const input=document.createElement('input');input.id='family-label';input.maxLength=40;const identity=element('p','micro');identity.id='family-id';const actions=element('div','feature-actions');for(const [id,text]of [['family-move-left','MOVE LEFT'],['family-move-right','MOVE RIGHT']]){const button=element('button','',text);button.id=id;actions.append(button);}const exportLabel=element('label','check'),exportBox=document.createElement('input');exportBox.id='family-export';exportBox.type='checkbox';exportLabel.append(exportBox,document.createTextNode(' INCLUDE IN FUTURE FAMILY EXPORTS'));const isolate=element('button','','ISOLATE THIS FAMILY');isolate.id='family-isolate';isolate.setAttribute('aria-pressed','false');const summary=element('p','micro');summary.id='family-export-summary';box.append(label,input,identity,actions,exportLabel,isolate,summary);details.append(heading,box);counts.insertAdjacentElement('afterend',details);input.onchange=()=>attempt(()=>commitFamilyMetadata({label:input.value},'FAMILY RENAMED AND SAVED.'));exportBox.onchange=()=>attempt(()=>commitFamilyMetadata({includeInExport:exportBox.checked},'FAMILY EXPORT SETTING SAVED.'));$('family-move-left').onclick=()=>attempt(()=>commitFamilyMetadata({move:-1},'FAMILY ORDER UPDATED AND SAVED.'));$('family-move-right').onclick=()=>attempt(()=>commitFamilyMetadata({move:1},'FAMILY ORDER UPDATED AND SAVED.'));isolate.onclick=()=>{const entry=familyEntry(project().working.carrier,project().working.familyCatalog,activePatternFamily);display.isolatedFamilyId=display.isolatedFamilyId===entry.id?null:entry.id;saveView();render();status(display.isolatedFamilyId?`${entry.label} ISOLATED. GEOMETRY UNCHANGED.`:'ALL FAMILIES SHOWN.');};}

function renderFamilyTabs(containerId,names,active,onSelect){const box=$(containerId),labels=new Map(familyEntries().map(entry=>[entry.key,entry.label]));box.replaceChildren();for(const name of names){const button=element('button',name===active?'active':'',labels.get(name)||(project().working.carrier?.kind===STITCH_SOURCE?`ROLE ${name}`:`FAMILY ${name}`));button.type='button';button.dataset.family=name;button.title=`ENGINE KEY ${name}`;button.onclick=()=>onSelect(name);box.append(button);}}

function renderPatternFamilyTabs(carrier){const entries=familyEntries(),names=entries.map(entry=>entry.key);renderFamilyTabs('pattern-family-tabs',names,activePatternFamily,name=>{activePatternFamily=name;render();status(`EDITING ${familyLabel(name)}.`);});const entry=entries.find(item=>item.key===activePatternFamily);if(!entry)return;$('family-label').value=entry.label;$('family-id').textContent=`PERMANENT ID ${entry.id} · ENGINE KEY ${entry.key}`;$('family-export').checked=entry.includeInExport;const index=indexDerivedFamilies(project().working),view=index.families.find(item=>item.id===entry.id);$('family-export-summary').textContent=view?.strandCount?`EXPORT-READY VIEW · ${view.strandCount} STRANDS · ${view.fragmentCount} FRAGMENTS · ${view.segmentCount} SEGMENTS`:'EXPORT-READY VIEW · SAVES WITH THIS FAMILY';$('family-move-left').disabled=entry.order===0;$('family-move-right').disabled=entry.order===entries.length-1;const isolated=display.isolatedFamilyId===entry.id;$('family-isolate').textContent=isolated?'SHOW ALL FAMILIES':'ISOLATE THIS FAMILY';$('family-isolate').setAttribute('aria-pressed',String(isolated));}

function syncAttractorField(working,field){const limits=boundarySliderLimits(working.boundary),names=familyNames(working.carrier);if(!names.includes(activeInfluenceFamily))activeInfluenceFamily=names[0];renderFamilyTabs('influence-family-tabs',names,activeInfluenceFamily,name=>{activeInfluenceFamily=name;renderAttractorControls();status(`EDITING FAMILY ${name} INFLUENCE RESPONSE.`);});const q=working.weave.weaveVersion===ATTRACTOR_VERSIONS.study?{strength:field.strength,tension:working.weave.generation.tension}:[COMBINED_VERSIONS.study,STITCH_VERSIONS.study].includes(working.weave.weaveVersion)?field.families[activeInfluenceFamily]:familySettings(working.weave.generation,activeInfluenceFamily);syncSlider('attractor-radius',field.radius,limits.radius);syncSlider('attractor-strength',q.strength);syncSlider('attractor-tension',q.tension);syncSlider('attractor-falloff',field.falloff??3);syncSlider('influence-direction',field.direction??0);$('influence-type').value=field.kind;$('direction-control').hidden=field.kind!=='deflector';$('family-control-label').textContent=`EDITING FAMILY ${activeInfluenceFamily}`;$('link-influence-roles').checked=influenceResponsesLinked(field);$('attractor-enabled').checked=field.enabled;$('toggle-attractor-enabled').textContent=field.enabled?'DISABLE INFLUENCE':'ENABLE INFLUENCE';$('toggle-attractor-enabled').setAttribute('aria-pressed',String(field.enabled));}

function syncAttractorState(field,count=0){$('attractor-state').textContent=!field?(count?`${count} FIELD${count===1?'':'S'} · NONE SELECTED`:'READY TO ADD'):pending?'CALCULATING':`${field.enabled?'ACTIVE':'DISABLED'} ${field.kind.toUpperCase()}`;}

function renderInfluenceList(weave){const fields=influencesOf(weave),list=$('influence-list');list.replaceChildren();$('influence-count').textContent=`${fields.length} / ${COMBINED_LIMITS.influences}`;for(let i=0;i<fields.length;i++){const f=fields[i],button=element('button',`influence-item${f.id===activeInfluenceId?' active':''}${f.enabled?'':' disabled'}`);button.dataset.influenceId=f.id;button.setAttribute('role','option');button.setAttribute('aria-selected',String(f.id===activeInfluenceId));button.append(element('span','field-dot'),element('span','',`${i+1}. ${f.kind.toUpperCase()}`),element('span','micro',f.enabled?'ON':'OFF'));button.onclick=()=>{activeInfluenceId=f.id;renderAttractorControls();renderAttractorGuide();status(`ACTIVE ${f.kind.toUpperCase()} SELECTED.`);};list.append(button);}$('add-another-influence').disabled=fields.length>=COMBINED_LIMITS.influences;$('duplicate-influence').disabled=!fields.length||fields.length>=COMBINED_LIMITS.influences;}

function syncVariation(weave){const combined=weave?.weaveVersion===COMBINED_VERSIONS.study,g=combined?weave.generation:null;syncSlider('variation-family',g?.variation.families[activeInfluenceFamily]?.amount??0);syncSlider('variation-seed',g?.variation.seed??1042);document.querySelector('.variation-controls').hidden=!combined;}

function renderWeaveControls(){

 const p=project(),w=p.working.weave,displayWorking=pending?.working||p.working,displayWeave=displayWorking.weave,patternReady=Boolean(p.working.carrier&&p.working.carrierSourceRevisionId);

 $('field-section').hidden=!patternReady;

 $('display-derived-only').disabled=!w;$('display-compare').disabled=!w;$('display-construction').disabled=!p.working.carrier;

 if(w){

  const source=w.sourceContext.snapshot;

  const changed=canonical({boundary:source.boundary,carrier:source.carrier})!==canonical({boundary:p.working.boundary,carrier:p.working.carrier});

   $('weave-summary').textContent='SOURCE '+w.sourceName+' · P'+source.number+(changed?' · MODIFIED INPUT':' · ORIGINAL INPUT')+' · '+Object.entries(w.derived.diagnostics.counts).map(([n,c])=>`${n} ${c}`).join(' / ');

  const entry=p.weaveStudies.find(e=>e.id===w.studyId);if(entry)$('weave-name').value=entry.name;

  deriveWorking(source,p.id); // Prime source display data independently of visibility.

  const fields=influencesOf(displayWeave);if(activeInfluenceId===undefined||(activeInfluenceId!==null&&!fields.some(f=>f.id===activeInfluenceId)))activeInfluenceId=fields[0]?.id||null;const field=activeInfluenceId===null?null:influenceOf(displayWeave,activeInfluenceId);$('add-attractor').hidden=fields.length>0;$('attractor-prompt').hidden=fields.length>0;$('attractor-settings').hidden=!fields.length;$('cancel-attractor').hidden=!pending;

  renderInfluenceList(displayWeave);syncVariation(displayWeave);syncAttractorState(field,fields.length);if(field)syncAttractorField(displayWorking,field);syncInfluenceEditingAvailability(field,fields.length);

  for(const id of ['save-weave','save-influence','export-derived-svg']){const button=$(id);if(button)button.disabled=!!pending;}

 }else{activeInfluenceId=undefined;$('add-attractor').hidden=false;$('attractor-prompt').hidden=false;$('attractor-settings').hidden=true;syncAttractorState(null);}

}

function familyClass(name){return `carrier-family family-${name.toLowerCase()}`;}

function drawWeaveLayer(id,paths,source=false){

 const layer=$(id);

 for(const p of paths)for(const f of (p.fragments||p.intervals)){

   const points=f.points||[f.start,f.end];for(let i=0;i<points.length-1;i++){const a=toScreen(points[i],view,width,height),b=toScreen(points[i+1],view,width,height);layer.append(svgElement('line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,class:source?'weave-source':familyClass(p.family)}));}

 }

}



function renderThreadLayer(layer,strands,appearance,source=false){const isolated=isolatedFamilyKey();for(const record of threadPaths(strands,appearance,p=>toScreen(p,view,width,height))){if(isolated&&record.family!==isolated)continue;const path=svgElement('path',{d:record.d,class:source?'weave-source':familyClass(record.family)+' weave-derived-path','data-weave-family':record.family,'data-fragments':record.fragments,'data-segments':record.segments});path.style.strokeWidth=String(threadStroke(record)*view.scale);path.style.setProperty('--thread-opacity',String(threadOpacity(record)));path.style.fill='none';path.style.strokeDasharray='none';path.style.strokeLinejoin='round';layer.append(path);}}

function appendPresentationTails(layer,w,appearance,transform,scaled=false){const settings=fieldPresentationPreview||w.fieldPresentation,isolated=isolatedFamilyKey(w);for(const [layerIndex,presentation] of presentationTailLayers(w.weave.derived.strands,w.boundary,settings).entries())for(const record of threadPaths(presentation.strands,appearance,transform)){if(isolated&&record.family!==isolated)continue;const opacity=threadOpacity(record)*presentation.opacity,path=svgElement('path',{d:record.d,class:familyClass(record.family)+' weave-derived-path','data-weave-family':record.family,'data-boundary-continuation':'true','data-presentation-layer':layerIndex,opacity,'stroke-width':threadStroke(record)*(scaled?view.scale:1)});path.style.setProperty('--thread-opacity',String(opacity));path.style.fill='none';path.style.strokeDasharray='none';path.style.strokeLinejoin='round';layer.append(path);}}

function updateThreadClip(){let defs=$('thread-defs');if(!defs){defs=svgElement('defs',{id:'thread-defs'});$('canvas').prepend(defs);}defs.replaceChildren();const clip=svgElement('clipPath',{id:'thread-boundary-clip',clipPathUnits:'userSpaceOnUse'});clip.append(svgElement('polygon',{points:project().working.boundary.points.map(p=>{const q=toScreen(p,view,width,height);return q.x+','+q.y}).join(' ')}));defs.append(clip);for(const id of ['family-a-layer','family-b-layer','weave-source-layer'])$(id).setAttribute('clip-path','url(#thread-boundary-clip)');$('weave-derived-layer').removeAttribute('clip-path');}



function renderContinuousWeave(layer,w){
 ensureCrossings(w);const appearance=threadPreview||w.threadAppearance;
 if(!w.interlacing?.enabled){renderThreadLayer(layer,w.weave.derived.strands,appearance);appendPresentationTails(layer,w,appearance,p=>toScreen(p,view,width,height),true);return;}
 const current=crossingCache?.paintKey===crossingPaintKey(w),previous=lastWovenPresentation?.identity===wovenPresentationIdentity(w);
 if(!current&&!previous)return;
 const group=svgElement('g',{transform:'translate('+(width/2-view.cx*view.scale)+' '+(height/2+view.cy*view.scale)+') scale('+view.scale+')',fill:'none',stroke:'var(--muted)','stroke-linejoin':'round',opacity:.82,'data-continuous-weave':'true','data-woven-pending':String(!current)});
 group.innerHTML=current?crossingCache.markup:lastWovenPresentation.markup;
 appendPresentationTails(group,w,appearance,p=>({x:p.x,y:-p.y}));
 const isolated=isolatedFamilyKey(w);if(isolated)for(const path of group.querySelectorAll('[data-weave-family]'))path.style.display=path.dataset.weaveFamily===isolated?'':'none';layer.append(group);
}

function renderDerivedWeaveLayer(working=displayedWeaveWorking(),preview=false){const layer=$('weave-derived-layer');layer.replaceChildren();if(working.weave&&display.weaveDerived)renderContinuousWeave(layer,working);if(!preview)renderCrossingMarks(layer,working);layer.classList.toggle('pending-result',!!pending);}

function renderAttractorGuide(){const layer=$('attractor-layer');layer.replaceChildren();const weave=pending?.working.weave||project().working.weave,fields=influencesOf(weave);if(display.attractor)for(const guide of fields){const active=guide.id===activeInfluenceId,c=toScreen(guide.center,view,width,height),r=guide.radius*view.scale,common=(pending&&active?' pending':'')+(active?' active':' inactive'),base={'data-influence-id':guide.id};layer.append(svgElement('circle',{...base,cx:c.x,cy:c.y,r,class:`attractor-ring ${guide.kind}${common}`,...(active?{'data-attractor-handle':'radius'}:{})}),svgElement('circle',{...base,cx:c.x,cy:c.y,r:active?7:5,class:`attractor-center ${guide.kind}${common}`,...(active?{'data-attractor-handle':'center'}:{})}));if(guide.kind==='deflector'){const a=guide.direction*Math.PI/180,end={x:c.x+Math.cos(a)*r*.72,y:c.y-Math.sin(a)*r*.72};layer.append(svgElement('line',{...base,x1:c.x,y1:c.y,x2:end.x,y2:end.y,class:`influence-direction${common}`}),svgElement('circle',{...base,cx:end.x,cy:end.y,r:active?7:5,class:`direction-handle${common}`,...(active?{'data-attractor-handle':'direction'}:{})}));}}}

function syncInfluenceEditingAvailability(field,count){const disabled=!field;for(const id of ['influence-type','attractor-radius-range','attractor-strength-range','attractor-tension-range','attractor-falloff-range','influence-direction-range','toggle-attractor-enabled','reset-attractor','remove-attractor']){const control=$(id);if(control)control.disabled=disabled;}$('duplicate-influence').disabled=disabled||count>=COMBINED_LIMITS.influences;}

function renderAttractorControls(){const displayWorking=pending?.working||project().working,displayWeave=displayWorking.weave,fields=influencesOf(displayWeave);if(activeInfluenceId===undefined||(activeInfluenceId!==null&&!fields.some(f=>f.id===activeInfluenceId)))activeInfluenceId=fields[0]?.id||null;const field=activeInfluenceId===null?null:influenceOf(displayWeave,activeInfluenceId);$('add-attractor').hidden=fields.length>0;$('attractor-prompt').hidden=fields.length>0;$('attractor-settings').hidden=!fields.length;$('cancel-attractor').hidden=!pending;renderInfluenceList(displayWeave);syncVariation(displayWeave);syncAttractorState(field,fields.length);if(field)syncAttractorField(displayWorking,field);syncInfluenceEditingAvailability(field,fields.length);for(const id of ['save-weave','save-influence','export-derived-svg']){const button=$(id);if(button)button.disabled=!!pending;}}

function renderR1BState(redrawDerived){$('undo').disabled=!history().past.length;$('redo').disabled=!history().future.length;targetedRenderCount++;renderInterlaceControls();renderThreadControls();if(redrawDerived)renderDerivedWeaveLayer();else $('weave-derived-layer').classList.toggle('pending-result',!!pending);renderAttractorControls();renderAttractorGuide();updateCanvasLegend();}



function syncBoundaryName(){const found=findRevision(project(),project().working.sourceRevisionId);$('boundary-name').value=found?.entry.name||'BOUNDARY 01';}

function syncCarrierName(){const found=findCarrierRevision(project(),project().working.carrierSourceRevisionId);$('carrier-name').value=found?.entry.name||'WEAVE PATTERN 01';}

function nextLibraryName(items,prefix){let n=items.length+1,name;do{name=`${prefix} ${String(n++).padStart(2,'0')}`}while(items.some(x=>x.name===name));return name;}

function currentPatternName(owner=project()){return findCarrierRevision(owner,owner.working.carrierSourceRevisionId)?.entry.name||$('carrier-name').value||nextLibraryName(owner.carrierStudies,'WEAVE PATTERN');}

function currentWeaveName(working=project().working,owner=project()){return owner.weaveStudies.find(x=>x.id===working.weave?.studyId)?.name||nextLibraryName(owner.weaveStudies,'INFLUENCED GRID');}

function weaveSaveOptions(owner=transientProject(),feedbackLabel='FIELD CHANGE'){return{projectUpdate:owner,saveWeaveName:currentWeaveName(owner.working,owner),feedback:{scope:'field',label:feedbackLabel}};}

function preparePatternUpdate(carrier,sourceProject=project()){let base=copyProjectForEdit(sourceProject);base.working.carrier=clone(carrier);if(!base.working.sourceRevisionId)base=saveBoundary(base,$('boundary-name').value||nextLibraryName(base.boundaries,'BOUNDARY')).project;const saved=saveCarrierStudy(base,currentPatternName(base));let updated=saved.project;if(base.working.weave)updated=retargetWeaveSource(updated,saved.revisionId);return{project:updated,revisionId:saved.revisionId};}

async function commitPatternCarrier(carrier,label,sourceProject=project(),feedbackLabel='WEAVE PATTERN'){const prepared=preparePatternUpdate(carrier,sourceProject),updated=prepared.project,saveWeaveName=updated.working.weave?currentWeaveName(updated.working,updated):null;$('carrier-name').value=findCarrierRevision(updated,prepared.revisionId).entry.name;await editWorking(updated.working,label,{projectUpdate:updated,saveWeaveName,feedback:{scope:'pattern',label:feedbackLabel}});}

async function commitFamilyMetadata(patch,label){if(pending||threadSaving)throw Error('Wait for the current change to finish.');const base=clone(project());base.working.familyCatalog=updateFamilyCatalog(base.working.carrier,base.working.familyCatalog,activePatternFamily,patch);const prepared=preparePatternUpdate(base.working.carrier,base),updated=prepared.project,saveWeaveName=updated.working.weave?currentWeaveName(updated.working,updated):null;await editWorking(updated.working,label,{projectUpdate:updated,saveWeaveName});}

function hasVisibleDistortion(weave){if(!weave)return false;if(weave.weaveVersion===STITCH_VERSIONS.study)return !stitchIdentity(weave.generation);if(weave.weaveVersion===COMBINED_VERSIONS.study){if(Object.values(weave.generation.variation.families).some(x=>x.amount>0))return true;return weave.generation.influences.some(f=>f.enabled&&Object.values(f.families).some(x=>x.strength>0&&x.tension<100));}const field=influenceOf(weave);if(!field?.enabled)return false;if(weave.weaveVersion===ATTRACTOR_VERSIONS.study)return field.strength>0&&weave.generation.tension<100;return !identityGeneration(weave);}

function svgElement(tag,attributes){const el=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [key,value] of Object.entries(attributes))el.setAttribute(key,String(value));return el;}

function renderCanvas(){

  if(!view)return;updateThreadClip();

  const geometry=$('geometry'),preview=$('draft-layer');geometry.replaceChildren();preview.replaceChildren();

  for(const id of ['source-lattice-layer','family-a-layer','family-b-layer','weave-source-layer'])$(id).replaceChildren();

  const working=carrierPreview||pending?.working||project().working,derived=working.carrier?deriveWorking(working):null;

  if(derived){for(const path of derived.paths){for(const interval of path.intervals){const a=toScreen(interval.start,view,width,height),b=toScreen(interval.end,view,width,height),attrs={x1:a.x,y1:a.y,x2:b.x,y2:b.y};if(display.sourceLattice)$('source-lattice-layer').append(svgElement('line',{...attrs,class:'carrier-source'}));const primary=path.family==='A';}}}

  if(derived&&display.originalGrid)renderThreadLayer($('family-a-layer'),derived.paths.filter(p=>p.selected).map(p=>({family:p.family||p.identity?.roleId,fragments:p.intervals.map(f=>({points:[f.start,f.end]}))})),threadPreview||working.threadAppearance);

  const weave=working.weave;

  $('canvas').classList.toggle('distortion-active',hasVisibleDistortion(weave));

  if(weave&&display.weaveSource)renderThreadLayer($('weave-source-layer'),deriveWorking(weave.sourceContext.snapshot).paths.filter(p=>p.selected).map(p=>({family:p.family||p.identity?.roleId,fragments:p.intervals.map(f=>({points:[f.start,f.end]}))})),threadPreview||working.threadAppearance,true);renderDerivedWeaveLayer(working.weave&&!working.weave.derived?project().working:working,Boolean(carrierPreview));renderAttractorGuide();

  const points=drag?.points||vertexPreview?.points||project().working.boundary.points,presentation=effectiveFieldPresentation(fieldPresentationPreview||working.fieldPresentation);

  if(display.boundary){

    const screen=points.map(p=>toScreen(p,view,width,height));

    geometry.append(svgElement('polygon',{points:screen.map(p=>`${p.x},${p.y}`).join(' '),class:`boundary-path boundary-${presentation.boundaryEmphasis}`,'data-boundary-emphasis':presentation.boundaryEmphasis}));

    if(tool==='select')screen.forEach((p,i)=>{const vertex=svgElement('circle',{cx:p.x,cy:p.y,r:selected===i?6:4,class:`vertex${selected===i?' selected':''}`,'data-vertex':i});geometry.append(vertex);});

  }

  if(draft.length){const screen=draft.map(p=>toScreen(p,view,width,height));preview.append(svgElement('polyline',{points:screen.map(p=>`${p.x},${p.y}`).join(' '),class:'draft-path'}));screen.forEach(p=>preview.append(svgElement('circle',{cx:p.x,cy:p.y,r:4,class:'vertex'})));}

  $('grid-layer').hidden=!display.grid;$('grid-layer').style.display=display.grid?'':'none';

  $('frame-layer').replaceChildren();if(display.grid)$('frame-layer').append(svgElement('rect',{x:40,y:50,width:Math.max(1,width-80),height:Math.max(1,height-100)}));

  $('empty-hint').hidden=display.boundary||display.sourceLattice||display.originalGrid||(weave&&(display.weaveSource||display.weaveDerived))||tool==='draw';$('zoom-label').textContent=`${(view.scale*100).toFixed(1)}%`;

}

function fit(){view=fitView(project().working.boundary.points,width,height);renderCanvas();}

function setTool(next){tool=next;draft=[];selected=null;drag=null;vertexPreview=null;['select','draw','pan'].forEach(name=>$(`${name}-tool`).classList.toggle('active',name===next));$('draw-actions').hidden=next!=='draw';if(next==='draw')$('boundary-section').open=true;renderCanvas();status(next==='draw'?'CLICK VERTICES. FINISH CLOSES THE BOUNDARY. ESC CANCELS.':next==='pan'?'DRAG TO PAN. SCROLL TO ZOOM.':'CLICK A VERTEX TO SELECT. DRAG TO EDIT.');}

function download(text,name,type='application/json'){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}

function clearSvgStage(){stagedSvg=null;$('import-svg').value='';$('svg-import-stage').hidden=true;$('svg-import-preview').hidden=false;$('svg-import-preview').replaceChildren();$('svg-import-facts').replaceChildren();$('svg-import-message').textContent='';}

function stageFact(label,value){const term=element('dt','',label),detail=element('dd','',value);$('svg-import-facts').append(term,detail);}

function showSvgStage(file,boundary,error=''){

  const stage=$('svg-import-stage'),preview=$('svg-import-preview');stage.hidden=false;preview.replaceChildren();$('svg-import-facts').replaceChildren();$('svg-import-name').textContent=file.name;$('svg-import-message').textContent=error;

  $('svg-import-result').textContent=error?'REJECTED':'VALID';$('svg-import-result').classList.toggle('error',Boolean(error));$('apply-svg-import').disabled=Boolean(error);preview.hidden=Boolean(error);

  if(error){stagedSvg=null;stageFact('FILE',file.name);return;}

  const summary=svgImportSummary(boundary),b=bounds(boundary.points),pad=Math.max(summary.width,summary.height)*.08||10;

  preview.setAttribute('viewBox',`${b.minX-pad} ${-b.maxY-pad} ${summary.width+pad*2} ${summary.height+pad*2}`);

  preview.append(svgElement('polygon',{points:boundary.points.map(point=>`${point.x},${-point.y}`).join(' '),class:'import-preview-path'}));

  stageFact('VERTICES',String(summary.vertices));stageFact('BOUNDARY SIZE',`${summary.width} × ${summary.height}`);stageFact('SVG WIDTH',boundary.source.width??'UNSPECIFIED');stageFact('SVG HEIGHT',boundary.source.height??'UNSPECIFIED');stageFact('VIEWBOX',boundary.source.viewBox??'UNSPECIFIED');

  stagedSvg={boundary:clone(boundary),filename:file.name};

}

async function initializeStorage(){

 try{const packed=await store.readPacked();if(packed){store.lastPacked=packed;let loaded;try{loaded=await storageTask({type:'unpack',packed});}catch(error){if(!error.message.includes('Exact recovery ancestry is incomplete'))throw error;loaded=await storageTask({type:'unpack',packed,recoveryManifests:await store.recoveryManifests()});}workspace=loaded.workspace;await certifyWorkspace(workspace);if(loaded.migratedPacked&&!loaded.recoveredAncestry)await store.commit(loaded.migratedPacked);if(loaded.recoveredAncestry){const repaired=await prepareStorage(workspace,true);await store.commit(repaired);}return}const raw=localStorage.getItem(STORE_KEY),entries=store.legacyEntries();if(raw!==null){store.lastRaw=raw;const migrated=await storageTask({type:'legacy',raw});await certifyWorkspace(migrated.workspace);if(localStorage.getItem(STORE_KEY)!==raw)throw typedError('concurrent-change','Another legacy tab changed the workspace during migration. Close other tabs and reload.');await store.initialize(migrated.packed,entries,digest(raw));workspace=migrated.workspace;return}workspace=createWorkspace();const fresh=await prepareStorage(workspace);await store.initialize(fresh);}

 catch(error){store.blocked=true;loadError=error.message;workspace=createWorkspace();try{const previous=await store.readPreviousPacked();if(previous){const recovered=(await storageTask({type:'unpack',packed:previous})).workspace;await certifyWorkspace(recovered);store.recoveryPacked=previous;workspace=recovered;loadError+=' A validated previous snapshot is available for recovery download.';}}catch(recoveryError){loadError+=` Previous recovery also failed validation: ${recoveryError.message}`;}if(!store.recoveryPacked)for(const root of await store.historicalRoots()){try{const historical=await store.readRoot(root,'historical recovery'),recovered=(await storageTask({type:'unpack',packed:historical})).workspace;await certifyWorkspace(recovered);store.blocked=false;await store.switchRoot(root);store.recoveryPacked=historical;workspace=recovered;loadError='RECOVERED THE NEWEST VALID HISTORICAL SNAPSHOT AFTER TWO INVALID STORAGE ROOTS.';break}catch{}}}

}

await initializeStorage();

$('board-list').addEventListener('toggle',event=>{const details=event.target;if(details instanceof HTMLDetailsElement&&details.dataset.treeKey)treeOpenState.set(details.dataset.treeKey,details.open);},true);

const libraryClick=event=>attempt(async()=>{

  const action=event.target.closest('[data-library-action]');if(action){event.preventDefault();event.stopPropagation();const type=action.dataset.libraryType,itemId=action.dataset.libraryId;if(type==='board'){const entry=workspace.projects.find(x=>x.id===itemId);if(!entry)throw Error('Board is missing.');let next=clone(workspace);if(action.dataset.libraryAction==='rename'){const name=prompt('Rename board',entry.name);if(name===null)return;const clean=name.trim().toUpperCase().slice(0,80);if(!clean)throw Error('Give this board a name.');next.projects.find(x=>x.id===itemId).name=clean;}else if(action.dataset.libraryAction==='duplicate'){const incoming={schemaVersion:workspace.schemaVersion,activeProjectId:itemId,projects:[{...clone(entry),name:entry.name+' COPY'}]};next=mergeBackup(workspace,incoming,true,true);}else{if(next.projects.length===1)throw Error('Keep at least one board.');if(!confirm(`Delete ${entry.name} and its complete saved tree?`))return;next.projects=next.projects.filter(x=>x.id!==itemId);if(next.activeProjectId===itemId)next.activeProjectId=next.projects[0].id;}await persist(next,true);histories.clear();render();status(`BOARD ${action.dataset.libraryAction.toUpperCase()} COMPLETE.`);return;}const entry=(type==='boundary'?project().boundaries:type==='pattern'?project().carrierStudies:project().weaveStudies).find(x=>x.id===itemId);if(!entry)throw Error('Saved item is missing.');let updated;if(action.dataset.libraryAction==='rename'){const name=prompt(`Rename ${type}`,entry.name);if(name===null)return;updated=renameLibraryItem(project(),type,itemId,name);}else if(action.dataset.libraryAction==='duplicate')updated=duplicateLibraryItem(project(),type,itemId);else{if(!confirm(`Delete ${entry.name}${type==='boundary'?' and every nested Weave Pattern and Influenced Grid':type==='pattern'?' and every nested Influenced Grid':''}?`))return;updated=deleteLibraryItem(project(),type,itemId);}const next=clone(workspace);next.projects=next.projects.map(p=>p.id===updated.id?updated:p);await persist(next,true);render();status(`${type.toUpperCase()} ${action.dataset.libraryAction.toUpperCase()} COMPLETE.`);return;}

  const board=event.target.closest('[data-board]'),revision=event.target.closest('[data-revision]'),carrierRevision=event.target.closest('[data-carrier-revision]'),templateRevision=event.target.closest('[data-template-revision]'),weaveRevision=event.target.closest('[data-weave-revision]');

  if(templateRevision){event.preventDefault();event.stopPropagation();libraryTemplateRevisionId=templateRevision.dataset.templateRevision;renderBoards();status('REUSABLE WEAVE SELECTED. CHOOSE A BOUNDARY, THEN USE IT ON THAT BOUNDARY.');return;}

  if(board){event.preventDefault();event.stopPropagation();treeOpenState.set(`board:${board.dataset.board}`,true);const next=clone(workspace);next.activeProjectId=board.dataset.board;await persist(next);setTool('select');syncBoundaryName();render();fit();status('BOARD RESTORED.');}

  if(revision){event.preventDefault();event.stopPropagation();if(pending)cancelPending('OPENING BOUNDARY.');const found=findRevision(project(),revision.dataset.revision);if(!found)throw Error('This boundary is missing.');const updated=clone(project());updated.working={boundary:clone(found.revision.boundary),sourceRevisionId:revision.dataset.revision,carrier:null,carrierSourceRevisionId:null,weave:null};delete updated.working.familyCatalog;delete updated.working.threadAppearance;delete updated.working.interlacing;delete updated.working.fieldPresentation;await editWorking(updated.working,'BOUNDARY OPENED. SELECT NEW OR APPLY THE PREVIOUSLY SELECTED WEAVE.',{projectUpdate:updated});$('boundary-name').value=found.entry.name;display.boundary=true;display.originalGrid=false;display.weaveSource=false;display.weaveDerived=false;display.attractor=false;saveView();selected=null;fit();}

  if(weaveRevision){event.preventDefault();event.stopPropagation();const found=findWeaveRevision(project(),weaveRevision.dataset.weaveRevision),restored=restoreWeaveStudy(project(),weaveRevision.dataset.weaveRevision),sourceId=restored.working.weave.sourceContext.sourceCarrierRevisionId,pattern=restored.carrierStudies.find(x=>x.revisions.some(r=>r.id===sourceId));$('weave-name').value=found.entry.name;if(pattern&&pattern.latestRevisionId!==sourceId){const updated=retargetWeaveSource(restored,pattern.latestRevisionId);await editWorking(updated.working,'INFLUENCED GRID OPENED AND UPDATED TO THE CURRENT PATTERN.',{projectUpdate:updated,saveWeaveName:found.entry.name});}else await editWorking(restored.working,'INFLUENCED GRID OPENED.');$('field-section').open=true;selected=null;}

  if(carrierRevision){event.preventDefault();event.stopPropagation();const revisionId=carrierRevision.dataset.carrierRevision;libraryTemplateRevisionId=revisionId;const found=findCarrierRevision(project(),revisionId),patternIds=new Set(found.entry.revisions.map(r=>r.id)),children=project().weaveStudies.filter(entry=>entry.revisions.some(r=>patternIds.has(r.working.weave.sourceContext.sourceCarrierRevisionId))).sort((a,b)=>String(a.revisions.at(-1).createdAt).localeCompare(String(b.revisions.at(-1).createdAt))),child=children.at(-1);display.originalGrid=true;display.weaveDerived=Boolean(child);display.attractor=Boolean(child);saveView();if(child){const restored=restoreWeaveStudy(project(),child.latestRevisionId),sourceId=restored.working.weave.sourceContext.sourceCarrierRevisionId;if(restored.working.interlacing?.enabled){display=applyDisplayPreset(display,'derived-only');saveView();}if(sourceId!==revisionId){const updated=retargetWeaveSource(restored,revisionId);await editWorking(updated.working,'WEAVE AND SAVED FIELD FORCES OPENED AND UPDATED.',{projectUpdate:updated,saveWeaveName:child.name});}else await editWorking(restored.working,'WEAVE AND SAVED FIELD FORCES OPENED.');$('weave-name').value=child.name;$('field-section').open=true;}else{const restored=restoreCarrierStudy(project(),revisionId);await editWorking(restored.working,'WEAVE OPENED FOR EDITING.');}syncBoundaryName();syncCarrierName();selected=null;fit();}

});

for(const id of ['board-list','boundary-list','weave-list','library-template-list'])$(id).addEventListener('click',libraryClick);

$('new-board').onclick=()=>$('board-dialog').showModal();

$('board-form').onsubmit=event=>{event.preventDefault();attempt(async()=>{const next=clone(workspace),board=createProject($('board-name').value);next.projects.push(board);next.activeProjectId=board.id;await persist(next);$('board-dialog').close();setTool('select');render();fit();status('NEW BOARD CREATED.');});};

$('library-new-project').onclick=$('new-board').onclick;
$('library-rename-project').onclick=()=>attempt(async()=>{const entry=project(),name=prompt('Rename project',entry.name);if(name===null)return;const clean=name.trim().toUpperCase().slice(0,80);if(!clean)throw Error('Give this project a name.');const next=clone(workspace);next.projects.find(item=>item.id===entry.id).name=clean;await persist(next,true);render();status('PROJECT RENAMED.');});
$('library-delete-project').onclick=()=>attempt(async()=>{if(workspace.projects.length===1)throw Error('Keep at least one project.');if(!confirm(`Delete ${project().name} and all of its boundaries and weaves?`))return;const next=clone(workspace);next.projects=next.projects.filter(item=>item.id!==workspace.activeProjectId);next.activeProjectId=next.projects[0].id;await persist(next,true);histories.clear();libraryTemplateRevisionId=null;render();fit();status('PROJECT DELETED.');});

async function persistLibraryProject(updated,message){const next=clone(workspace);next.projects=next.projects.map(item=>item.id===updated.id?updated:item);await persist(next,true);render();status(message);}

$('library-new-boundary').onclick=()=>attempt(createSquareBoundary);
$('library-new-weave').onclick=()=>{if(!project().working.sourceRevisionId){status('SELECT OR CREATE A BOUNDARY FIRST.',true);return}$('carrier-section').open=true;$('stitch-preset').focus();status('CHOOSE A PRESET OR MY SAVED WEAVE. IT APPLIES IMMEDIATELY.');};

for(const [id,type,action] of [['library-rename-boundary','boundary','rename'],['library-duplicate-boundary','boundary','duplicate'],['library-delete-boundary','boundary','delete'],['library-rename-weave','pattern','rename'],['library-duplicate-weave','pattern','duplicate'],['library-delete-weave','pattern','delete']])$(id).onclick=()=>attempt(async()=>{const selection=activeLibraryItems(project()),entry=type==='boundary'?selection.boundary:selection.pattern;if(!entry)throw Error(`Select a ${type==='boundary'?'boundary':'weave'} first.`);let updated;if(action==='rename'){const name=prompt(`Rename ${type==='boundary'?'boundary':'weave'}`,entry.name);if(name===null)return;updated=renameLibraryItem(project(),type,entry.id,name);}else if(action==='duplicate')updated=duplicateLibraryItem(project(),type,entry.id);else{if(!confirm(`Delete ${entry.name}${type==='boundary'?' and its attached weaves':''}?`))return;updated=deleteLibraryItem(project(),type,entry.id);if(type==='pattern')libraryTemplateRevisionId=null;}await persistLibraryProject(updated,`${type==='boundary'?'BOUNDARY':'WEAVE'} ${action.toUpperCase()} COMPLETE.`);});

$('library-apply-weave').onclick=()=>attempt(async()=>{if(!libraryTemplateRevisionId)throw Error('Select a weave first, then select its destination boundary.');if(!findCarrierRevision(project(),libraryTemplateRevisionId))throw Error('The selected weave is not available in this project.');$('stitch-preset').value='saved:'+libraryTemplateRevisionId;$('stitch-preset').dispatchEvent(new Event('change'));});

document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());

$('square-size-range').oninput=event=>{syncSlider('square-size',Number(event.target.value));};

async function reloadLatestForBoundaryCreate(boardId){const packed=await store.readPacked();if(!packed)throw typedError('storage-state','The latest committed workspace could not be found.');store.lastPacked=packed;const latest=(await storageTask({type:'unpack',packed})).workspace;validateTrustedWorkspace(latest);if(!latest.projects.some(p=>p.id===boardId))throw typedError('concurrent-change','This Board was removed in another tab. Reload and choose an available Board.');latest.activeProjectId=boardId;workspace=latest;histories.clear();}

async function createSquareBoundary(){const boardId=workspace.activeProjectId,size=Number($('square-size').value),notice=$('boundary-action-status');notice.textContent='SAVING NEW BOUNDARY…';for(let attemptNumber=0;attemptNumber<2;attemptNumber++){const before=clone(project().working),base=clone(project()),name=nextLibraryName(base.boundaries,'BOUNDARY');base.working={boundary:square(size),sourceRevisionId:null,carrier:null,carrierSourceRevisionId:null,weave:null};const saved=saveBoundary(base,name),next=clone(workspace);next.projects=next.projects.map(p=>p.id===saved.project.id?saved.project:p);try{await persist(next);history().record(before,saved.project.working);$('boundary-name').value=name;setTool('select');display.boundary=true;saveView();fit();render();notice.textContent=`${name} SAVED. CREATE WEAVE PATTERN IS READY.`;status(`${name} CREATED AND SAVED${attemptNumber?' AFTER SYNCING THE LATEST TAB':''}.`);return;}catch(error){if(error.code!=='concurrent-change'||attemptNumber>0){notice.textContent=`SAVE FAILED: ${error.message}`;throw error;}notice.textContent='A NEWER TAB WAS FOUND. SYNCING AND RETRYING SAFELY…';await reloadLatestForBoundaryCreate(boardId);}}}

$('make-square').onclick=()=>attempt(createSquareBoundary);

$('open-saved-boundary').onclick=()=>attempt(async()=>{const revisionId=$('saved-boundary').value,found=findRevision(project(),revisionId);if(!found)throw Error('Choose a saved boundary.');const updated=clone(project());updated.working={boundary:clone(found.revision.boundary),sourceRevisionId:revisionId,carrier:null,carrierSourceRevisionId:null,weave:null};await editWorking(updated.working,`${found.entry.name} OPENED. CHOOSE A PRESET OR A SAVED PATTERN NEXT.`,{projectUpdate:updated});$('boundary-name').value=found.entry.name;display.boundary=true;display.originalGrid=false;display.weaveSource=false;display.weaveDerived=false;display.attractor=false;saveView();selected=null;fit();$('carrier-section').open=true;});

$('apply-coordinates').onclick=()=>attempt(async()=>{await setBoundary(parseCoordinates($('coordinates').value),'COORDINATES APPLIED.');display.boundary=true;saveView();selected=null;});

$('vertex-index-range').oninput=event=>{selected=Number(event.target.value)-1;vertexPreview=null;renderVertexControls(project().working.boundary);renderCanvas();};

for(const axis of ['x','y']){const control=$(`vertex-${axis}-range`);control.oninput=event=>{const points=clone(vertexPreview?.points||project().working.boundary.points);if(selected===null)selected=0;points[selected][axis]=sliderEventNumber(event,control);vertexPreview={points};$(`vertex-${axis}-value`).value=readableNumber(event.target.value);renderCanvas();};control.onchange=()=>attempt(async()=>{if(!vertexPreview)return;const points=clone(vertexPreview.points);vertexPreview=null;await setBoundary(validateBoundary(points),'VERTEX UPDATED. ONE UNDO RESTORES THE SLIDER MOVE.');renderVertexControls(project().working.boundary);});}

$('save-boundary').onclick=()=>attempt(async()=>{const weaveName=project().working.weave?currentWeaveName():null,result=saveBoundaryAndUpdatePatterns(project(),$('boundary-name').value);if(result.weaveNeedsRefresh)await editWorking(result.project.working,'BOUNDARY AND ATTACHED PATTERN UPDATED.',{projectUpdate:result.project,saveWeaveName:weaveName});else{const next=clone(workspace);next.projects=next.projects.map(p=>p.id===result.project.id?result.project:p);await persist(next);render();status(result.updatedPatternIds.length?'BOUNDARY REPLACED; ATTACHED WEAVE PATTERNS RECLIPPED.':'BOUNDARY SAVED.');}});

const stitchControlSpec={rowStep:['ROW SPACING (%)',.55,.9,.01],pitch:['HORIZONTAL SPACING',40,300,1],height:['HEIGHT',20,240,1],rowGap:['ROW GAP',10,200,1],overlap:['STITCH OVERLAP (%)',.1,.4,.01],rotation:['ROTATION',-180,180,1],width:['WIDTH',20,240,1],gapX:['GAP X',10,200,1],gapY:['GAP Y',10,200,1],extension:['EXTENSION',.05,.25,.005]};

function renderStitchControls(source){const box=$('stitch-controls');box.hidden=source?.kind!==STITCH_SOURCE;if(box.hidden)return;$('stitch-title').textContent=STITCH_RECIPES[source.recipeId].label;$('stitch-continuous').hidden=source.recipeId!=='double-herringbone';$('stitch-layout-help').textContent=source.recipeId==='double-herringbone-field'?'CONTINUOUS FIELD. ROW SPACING IS A PERCENTAGE OF PATTERN HEIGHT: LOWER VALUES OVERLAP MORE. CONTROL THREAD ORDER IN OVER / UNDER.':source.recipeId==='double-herringbone'?'SAVED LEGACY PATTERN. USE CONTINUOUS FIELD TO UPDATE ITS LAYOUT.':'SQUARE FOUNDATION WITH PRESET OVER / UNDER RULES.';$('stitch-sliders').replaceChildren();for(const [key,value]of Object.entries(source.parameters)){const [label,min,max,step]=stitchControlSpec[key],row=element('label','slider-label'),title=element('span','',key==='height'&&source.recipeId.startsWith('double-herringbone')?'PATTERN HEIGHT':label),scale=['rowStep','overlap'].includes(key)?100:1,out=element('output','',String(Number((value*scale).toFixed(6)))),input=document.createElement('input');input.id=`stitch-${key}`;input.type='range';input.min=Math.min(min,value)*scale;input.max=Math.max(max,value)*scale;input.step=step*scale;input.value=value*scale;input.setAttribute('aria-label',title.textContent);row.append(title,out,input);const apply=(event,commit)=>attempt(()=>{const raw=sliderEventNumber(event,input);out.value=String(raw);focusDerivedEditing(false);return patternParameterEdit('stitch:'+key,raw/scale,commit,(recipe,value)=>{recipe.parameters[key]=value;return recipe;},`${title.textContent} ${raw}`);});input.oninput=event=>apply(event,false);input.onchange=event=>apply(event,true);$('stitch-sliders').append(row);}}

$('stitch-continuous').onclick=()=>attempt(async()=>{const base=transientProject(),recipe=changeHerringboneLayout(base.working.carrier,'field');if(pending)cancelPending('CHANGING FOUNDATION LAYOUT.');await commitPatternCarrier(recipe,'FOUNDATION LAYOUT UPDATED AND SAVED.',base);});

$('reset-stitch').onclick=()=>attempt(async()=>{const base=transientProject(),source=base.working.carrier;if(source?.kind!==STITCH_SOURCE)return;const recipe=clone(source);recipe.parameters=clone(STITCH_RECIPES[source.recipeId].defaults);if(pending)cancelPending('RESETTING FOUNDATION.');await commitPatternCarrier(recipe,'FOUNDATION PARAMETERS RESET AND SAVED.',base);});



let applyingPreset=false;
const applyPresetSelection=event=>{const select=event.currentTarget,choice=select.value;if(applyingPreset||!choice)return;applyingPreset=true;select.disabled=true;$('preset-apply-state').textContent='APPLYING PRESET · BUILDING AND SAVING WEAVE…';attempt(async()=>{try{if(pending)cancelPending('APPLYING SELECTED PRESET.');await store.assertCurrent();
 let base=clone(project());if(!base.working.sourceRevisionId){const boundaryName=$('boundary-name').value||nextLibraryName(base.boundaries,'BOUNDARY');base=saveBoundary(base,boundaryName).project;$('boundary-name').value=boundaryName;}
 const savedChoice=choice.startsWith('saved:'),source=savedChoice?findCarrierRevision(base,choice.slice(6)):null,sourceResult=savedChoice&&source?weaveResultForPattern(base,source.entry):null;
 if(savedChoice&&!source)throw Error('That saved Weave Pattern is no longer available.');
 const carrier=savedChoice?clone(source.revision.carrier):choice==='lines'?createRectangularCarrier():LINE_PRESETS[choice]?createLinePreset(choice):createStitchSource(choice,undefined,2);carrier.id='carrier-'+crypto.randomUUID();
 base.working={...base.working,carrier,carrierSourceRevisionId:null,weave:null};
 if(savedChoice&&source.revision.familyCatalog)base.working.familyCatalog=clone(source.revision.familyCatalog);else delete base.working.familyCatalog;
 if(savedChoice&&source.revision.threadAppearance)base.working.threadAppearance=clone(source.revision.threadAppearance);else delete base.working.threadAppearance;
 if(savedChoice&&source.revision.fieldPresentation)base.working.fieldPresentation=clone(source.revision.fieldPresentation);else delete base.working.fieldPresentation;
 delete base.working.interlacing;
 const name=nextLibraryName(base.carrierStudies,savedChoice?source.entry.name+' COPY':'WEAVE PATTERN'),saved=saveCarrierStudy(base,name),instantWeave=true;
 if(instantWeave){saved.project=createWeaveStudy(saved.project,saved.revisionId);saved.project.working.interlacing={...defaultInterlacing(),version:'interlacing-v2',enabled:true,rule:defaultRule(carrier.recipeId||'')};if(sourceResult){const sourceWorking=sourceResult.revisions.at(-1).working,created=saved.project.working.weave,sourceBounds=bounds(sourceWorking.boundary.points),targetBounds=bounds(saved.project.working.boundary.points);saved.project.working.weave={...clone(sourceWorking.weave),studyId:created.studyId,sourceName:created.sourceName,sourceContext:created.sourceContext,generation:adaptGenerationToBoundary(sourceWorking.weave.generation,sourceBounds,targetBounds),derived:created.derived};if(sourceWorking.threadAppearance)saved.project.working.threadAppearance=clone(sourceWorking.threadAppearance);if(sourceWorking.fieldPresentation)saved.project.working.fieldPresentation=clone(sourceWorking.fieldPresentation);if(sourceWorking.interlacing)saved.project.working.interlacing=clone(sourceWorking.interlacing);}}
 $('carrier-name').value=name;display.originalGrid=true;display.weaveSource=false;display.weaveDerived=!!saved.project.working.weave;display.attractor=Boolean(sourceResult);if(saved.project.working.interlacing?.enabled)display=applyDisplayPreset(display,'derived-only');saveView();carrierPreview=saved.project.working;renderCanvas();$('preset-apply-state').textContent=`PREVIEW · ${name} · SAVING…`;await new Promise(resolve=>requestAnimationFrame(resolve));await editWorking(saved.project.working,`${name} CREATED FROM ${savedChoice?'YOUR SAVED WEAVE':'PRESET'}, FIT TO THIS BOUNDARY, SHOWN, AND SAVED.`,{projectUpdate:saved.project,saveWeaveName:sourceResult?nextLibraryName(base.weaveStudies,'WEAVE RESULT'):null});libraryTemplateRevisionId=saved.revisionId;$('carrier-section').open=true;$('field-section').open=true;$('preset-apply-state').textContent=`APPLIED + SAVED · ${name}`;
 }catch(error){$('preset-apply-state').textContent=`NOT APPLIED · ${error.message}`;throw error;}finally{applyingPreset=false;select.disabled=false;select.value='';}});};
$('stitch-preset').oninput=applyPresetSelection;
$('stitch-preset').onchange=applyPresetSelection;

$('save-carrier').onclick=()=>attempt(()=>commitPatternCarrier(project().working.carrier,'WEAVE PATTERN UPDATED AUTOMATICALLY.'));

async function saveCurrentWeaveRevision(){const trusted=isCertifiedStudy(project().working.weave),result=saveWeaveStudy(project(),$('weave-name').value,trusted,true),next={...workspace,projects:workspace.projects.map(p=>p.id===result.project.id?result.project:p)},savedStatus='INFLUENCED GRID SAVED. INFLUENCES, FAMILY RESPONSES, GEOMETRY, AND LINEAGE RETAINED.';workspace=next;acceptedVersion++;autosave.accept({workspace:next,trusted},{savedStatus});render();status(`${savedStatus} BACKUP PENDING.`);}

$('save-weave').onclick=()=>attempt(saveCurrentWeaveRevision);$('save-influence').onclick=()=>attempt(saveCurrentWeaveRevision);





let crossingJob=null,crossingCache=null,crossingFailure=null,crossingSequence=0,lastWovenPresentation=null,primedCrossingWorker=null;

function primeCrossingWorker(){if(primedCrossingWorker)return;try{const worker=new Worker(new URL('./crossing-worker.mjs',import.meta.url),{type:'module'});primedCrossingWorker=worker;worker.onerror=()=>{if(primedCrossingWorker===worker){primedCrossingWorker=null;worker.terminate();}};}catch{primedCrossingWorker=null;}}

primeCrossingWorker();
function displayedWeaveWorking(){const w=carrierPreview||pending?.working||project().working;return w.weave&&!w.weave.derived?project().working:w;}
function crossingPaintKey(w){return w.weave?.derived?.provenanceFingerprint+JSON.stringify([w.interlacing,threadPreview||w.threadAppearance]);}
function wovenPresentationIdentity(w){return JSON.stringify([project().id,w.weave?.studyId,w.boundary]);}

function renderInterlaceControls(){const w=project().working,names=w.carrier?familyEntries(w).map(entry=>entry.key):[],v=w.interlacing||defaultInterlacing();$('interlace-controls').hidden=!names.length;$('interlace-prerequisite').hidden=!!names.length;$('interlace-enabled').checked=v.enabled;$('interlace-family').replaceChildren(...names.map(name=>{const o=document.createElement('option');o.value=name;o.textContent=familyLabel(name,w);return o}));$('interlace-family').value=names.includes(v.topFamily)?v.topFamily:names[0]||'';renderRuleControls(v,names,w.carrier);$('interlace-gap').value=v.clearance;$('interlace-gap-value').value=v.clearance;for(const id of ['interlace-enabled','interlace-family','interlace-gap','interlace-reset','interlace-upper','interlace-swap','interlace-clear'])$(id).disabled=!!pending||threadSaving;if(pending)$('interlace-status').textContent='GEOMETRY PENDING — SHOWING LAST COMMITTED WEAVE';}

function renderRuleControls(v,names,carrier){
 const rule=v.rule||{...defaultRule(carrier?.recipeId||''),mode:'priority'},current=parseInterlaceTarget(activeInterlaceTarget,names);
 if(activeInterlaceTarget===null||current.kind==='default'&&activeInterlaceTarget)activeInterlaceTarget='';
 const pairs=[];for(let i=0;i<names.length;i++)for(let j=i+1;j<names.length;j++)pairs.push([pairTarget(names[i],names[j]),`ONLY ${familyLabel(names[i])} WITH ${familyLabel(names[j])}`]);
 const targetOptions=[['','THE WHOLE WEAVE'],...names.map(name=>[name,`CROSSINGS INVOLVING ${familyLabel(name)}`]),...pairs];$('interlace-target').replaceChildren(...targetOptions.map(([value,text])=>{const option=document.createElement('option');option.value=value;option.textContent=text;return option;}));if(!targetOptions.some(([value])=>value===activeInterlaceTarget))activeInterlaceTarget='';$('interlace-target').value=activeInterlaceTarget;
 const target=parseInterlaceTarget(activeInterlaceTarget,names),targetValues=target.kind==='family'?familyRepeatRule(rule,target.family,names):target.kind==='pair'?pairRepeatRule(rule,target.first,target.second):null,inherited=target.kind!=='default'&&!targetValues,mode=targetValues?(targetValues.over===1&&targetValues.under===1?'alternating':targetValues.over===2&&targetValues.under===1?'two-over-one':'grouped'):namedRuleMode(rule),values=targetValues||rule;

 $('interlace-rule').value=mode;for(const option of $('interlace-rule').options)option.disabled=names.length<2||(target.kind!=='default'&&['preset','seeded','priority'].includes(option.value));$('interlace-invert').checked=rule.inverted;$('interlace-invert').parentElement.hidden=target.kind!=='default';$('interlace-preset').hidden=target.kind!=='default';$('interlace-clear-family').hidden=target.kind==='default'||!targetValues;
 $('interlace-clear-family').textContent=target.kind==='pair'?'USE ALL-FAMILIES DEFAULT FOR THIS PAIR':'REMOVE THIS FAMILY’S SPECIAL RULES';

 for(const k of ['over','under','phase']){$('interlace-'+k).value=values[k];$('interlace-'+k+'-value').value=values[k];}const structured=withStructuredVariation(rule);for(const k of ['seed','balance','max-run']){const key=k==='max-run'?'maxRun':k;$('interlace-'+k).value=structured[key];$('interlace-'+k+'-value').value=structured[key];}

 $('interlace-repeat-controls').hidden=!['alternating','two-over-one','grouped'].includes(mode);$('interlace-seeded-controls').hidden=mode!=='seeded'||target.kind!=='default';$('interlace-family').parentElement.hidden=mode!=='priority'||target.kind!=='default';$('interlace-over-row').hidden=mode!=='grouped';$('interlace-under-row').hidden=mode!=='grouped';

 const descriptions={preset:rule.recipe?'USES THE WEAVING RHYTHM SAVED WITH THIS PATTERN. UNCLEAR MEETINGS STAY UNWOVEN.':'NO PRESET RHYTHM IS SAVED, SO THIS ALTERNATES OVER AND UNDER.',alternating:'ONE OVER, THEN ONE UNDER.', 'two-over-one':'TWO OVER, THEN ONE UNDER.',grouped:'SET HOW MANY CROSSINGS STAY OVER AND UNDER BEFORE REPEATING.',seeded:'A REPEATABLE SEED VARIES THE ORDER WHILE BALANCE AND MAXIMUM RUN KEEP IT CONTROLLED.',priority:'THE CHOSEN FAMILY STAYS ABOVE THE OTHERS.'};
 const targetLabel=target.kind==='family'?`CROSSINGS INVOLVING ${familyLabel(target.family)}`:target.kind==='pair'?`${familyLabel(target.first)} WITH ${familyLabel(target.second)}`:'THE WHOLE WEAVE';
 const inheritance=target.kind==='family'?`${familyLabel(target.family)} CURRENTLY USES THE WHOLE-WEAVE RULE. `:target.kind==='pair'?`THIS PAIR CURRENTLY USES THE WHOLE-WEAVE RULE. `:'';
 $('interlace-rule-help').textContent=(inherited?inheritance:'')+descriptions[mode]+(target.kind==='default'&&rule.pairs.length?' PAIR-SPECIFIC RULES STILL WIN WHERE THEY EXIST.':'');
 if(['alternating','two-over-one','grouped'].includes(mode)){$('interlace-sequence').textContent='SEQUENCE · '+repeatSequence(values.over,values.under,values.phase).join(' · ')+' · '+targetLabel;}
 else if(mode==='seeded'){$('interlace-sequence').textContent='SEEDED SAMPLE · '+seededVariationSequence(structured.seed,structured.balance,structured.maxRun,12).map(value=>value?'OVER':'UNDER').join(' · ')+' · '+targetLabel;}
 else $('interlace-sequence').textContent=mode==='preset'?(rule.recipe?'SEQUENCE · AUTHORED BY PRESET':'SEQUENCE · FALLBACK · OVER · UNDER'):mode==='priority'?'SEQUENCE · SELECTED FAMILY ALWAYS ABOVE':'SEQUENCE · NOT APPLICABLE';

 $('interlace-effective').textContent=target.kind==='default'?'START WITH ONE RULE FOR THE WHOLE WEAVE. CHOOSE A FAMILY OR PAIR ABOVE ONLY WHEN IT NEEDS A DIFFERENT RHYTHM.':'THIS SPECIAL RULE REPLACES THE WHOLE-WEAVE RULE ONLY FOR THE SELECTED CROSSINGS.';

 for(const id of ['rule','target','over','under','phase','seed','balance','max-run','new-seed','invert','preset','clear-family'])$('interlace-'+id).disabled=!!pending||threadSaving;

}

async function editSelectedCrossing(action){const w=project().working,key=w.weave?.derived.provenanceFingerprint;if(pending||threadSaving||crossingCache?.key!==key||crossingJob)throw Error('Select a current crossing and wait for the current change.');const e=selectedCrossingEvent(selectedCrossing,key,crossingCache.result.events);if(!e)throw Error('This crossing is no longer editable.');const before=resolveWeaveRules(w.weave.derived.strands,crossingCache.result,w.interlacing,key).get(e.id),choice=$('interlace-upper').value===''?null:$('interlace-upper').value==='true',v=editCrossingOverride(w.interlacing,key,e.id,before,action,choice);validateInterlacing(v);selectedCrossing=crossingSelectionRecord(key,e);await commitThreadAppearance(null,v);}
$('interlace-upper').onchange=()=>attempt(()=>editSelectedCrossing('choose'));
$('interlace-swap').onclick=()=>attempt(()=>editSelectedCrossing('swap'));
$('interlace-clear').onclick=()=>attempt(()=>editSelectedCrossing('clear'));

$('interlace-target').onchange=()=>{activeInterlaceTarget=$('interlace-target').value;renderInterlaceControls();};

function previewRuleSequence(){const mode=$('interlace-rule').value;if(mode==='seeded'){$('interlace-sequence').textContent='SEEDED SAMPLE · '+seededVariationSequence(Number($('interlace-seed').value),Number($('interlace-balance').value),Number($('interlace-max-run').value),12).map(value=>value?'OVER':'UNDER').join(' · ');return}if(!['alternating','two-over-one','grouped'].includes(mode))return;const values=mode==='alternating'?{over:1,under:1}:mode==='two-over-one'?{over:2,under:1}:{over:Number($('interlace-over').value),under:Number($('interlace-under').value)};$('interlace-sequence').textContent='SEQUENCE · '+repeatSequence(values.over,values.under,Number($('interlace-phase').value)).join(' · ');}
for(const k of ['over','under','phase']){$('interlace-'+k).oninput=()=>{$('interlace-'+k+'-value').value=$('interlace-'+k).value;previewRuleSequence();};$('interlace-'+k).onchange=()=>attempt(()=>updateInterlacing(false,true));}
for(const k of ['seed','balance','max-run']){$('interlace-'+k).oninput=()=>{$('interlace-'+k+'-value').value=$('interlace-'+k).value;previewRuleSequence();};$('interlace-'+k).onchange=()=>attempt(()=>updateInterlacing(false,true));}
$('interlace-new-seed').onclick=()=>attempt(()=>{const next=(Math.imul(Number($('interlace-seed').value),1664525)+1013904223)>>>0;$('interlace-seed').value=next%65536;$('interlace-seed-value').value=next%65536;return updateInterlacing(false,true);});

$('interlace-rule').onchange=()=>attempt(()=>updateInterlacing(false,true));$('interlace-invert').onchange=()=>attempt(()=>updateInterlacing(false,true));

$('interlace-preset').onclick=()=>attempt(()=>updateInterlacing(false,true,true));
$('interlace-clear-family').onclick=()=>attempt(()=>updateInterlacing(false,true,false,true));

function ensureCrossings(w){
 if(!w.interlacing?.enabled||!w.weave?.derived)return;
 const key=w.weave.derived.provenanceFingerprint,paintKey=crossingPaintKey(w);
 if(crossingCache?.paintKey===paintKey||crossingJob?.paintKey===paintKey||crossingFailure?.paintKey===paintKey)return;
 if(crossingJob){crossingJob.worker.terminate();clearTimeout(crossingJob.timer);crossingJob=null;}
 let worker;try{worker=primedCrossingWorker||new Worker(new URL('./crossing-worker.mjs',import.meta.url),{type:'module'});primedCrossingWorker=null;}catch(error){crossingFailure={key,paintKey,message:'Crossing worker unavailable: '+error.message};return;}
 const id=++crossingSequence,started=performance.now(),identity=wovenPresentationIdentity(w);crossingJob={worker,key,id,paintKey};
 $('interlace-status').textContent='UPDATING WOVEN VIEW — KEEPING LAST COMPLETE PRESENTATION';
 const fail=message=>{if(crossingJob?.id!==id)return;clearTimeout(crossingJob.timer);worker.terminate();crossingJob=null;crossingFailure={key,paintKey,message};primeCrossingWorker();renderDerivedWeaveLayer();};
 crossingJob.timer=setTimeout(()=>fail('750 ms completion deadline exceeded.'),750);worker.onerror=e=>fail(e.message||'Worker unavailable.');
 worker.onmessage=e=>{
  if(crossingJob?.id!==id||e.data.id!==id)return;
  const current=displayedWeaveWorking();
  if(crossingPaintKey(current)!==paintKey||wovenPresentationIdentity(current)!==identity){clearTimeout(crossingJob.timer);worker.terminate();crossingJob=null;renderDerivedWeaveLayer();return;}
  if(e.data.error)return fail(e.data.error);
  if(e.data.workerMs>400)return fail('Worker maximum exceeded: '+e.data.workerMs.toFixed(1)+' ms');
  clearTimeout(crossingJob.timer);worker.terminate();crossingJob=null;primeCrossingWorker();
  crossingCache={key,paintKey,markup:e.data.markup,result:e.data.result,workerMs:e.data.workerMs};crossingFailure=null;
  const renderStart=performance.now();renderDerivedWeaveLayer();const renderMs=performance.now()-renderStart,totalMs=performance.now()-started;
  $('weave-derived-layer').setAttribute('data-crossing-render-ms',String(renderMs));$('weave-derived-layer').setAttribute('data-crossing-total-ms',String(totalMs));
  if(renderMs>50||totalMs>750){crossingCache=null;crossingFailure={key,paintKey,message:'Render/completion gate failed: '+renderMs.toFixed(1)+' / '+totalMs.toFixed(1)+' ms'};renderDerivedWeaveLayer();}
  else {lastWovenPresentation={identity,markup:e.data.markup};workerEvent('crossings-presented',{workerMs:e.data.workerMs,renderMs,totalMs,timing:e.data.timing,reused:e.data.reused||[]});}
 };
 worker.postMessage({id,settings:w.interlacing,appearance:threadPreview||w.threadAppearance,knownResult:crossingCache?.key===key?crossingCache.result:null,derived:w.weave.derived,trace:sourceTraces.get(w.weave.derived),candidate:{boundary:w.boundary,source:w.carrier,board:project().id,context:w.weave.sourceContext,generation:w.weave.generation}});
}

function effectiveRuleText(detail,w){const mode={priority:'KEEP ONE FAMILY ABOVE',preset:'PATTERN PRESET',alternating:'ALTERNATING 1 / 1','two-over-one':'REPEAT 2 OVER / 1 UNDER',grouped:'CUSTOM REPEAT',seeded:'SEEDED STRUCTURED VARIATION',manual:'MANUAL CROSSING OVERRIDE'}[detail.mode],suffix=detail.inverted?' · INVERTED':'';if(detail.kind==='manual')return'CONTROLLING RULE · '+mode;if(detail.kind==='pair'){const x=detail.relationship;return`CONTROLLING RULE · FAMILY-PAIR RULE · ${familyLabel(x.first,w)} WITH ${familyLabel(x.second,w)} · ${mode}${suffix}`;}if(detail.kind==='preset')return'CONTROLLING RULE · PATTERN PRESET'+(detail.assigned?'':' · NO AUTHORED ORDER FOR THIS MEETING')+suffix;return'CONTROLLING RULE · WHOLE WEAVE · '+mode+suffix;}
function renderCrossingMarks(layer,w){if(!w.weave||!w.interlacing?.enabled){$('interlace-status').textContent='OFF';return;}const key=w.weave.derived.provenanceFingerprint,paintKey=key+JSON.stringify([w.interlacing,threadPreview||w.threadAppearance]);if(crossingFailure?.paintKey===paintKey){$('interlace-status').textContent='INTERLACING UNAVAILABLE: '+crossingFailure.message;return;}if(crossingCache?.paintKey!==paintKey||crossingJob){$('interlace-status').textContent='UPDATING WOVEN VIEW — KEEPING LAST COMPLETE PRESENTATION';return;}const r=crossingCache.result,stale=w.interlacing.overrides.length&&w.interlacing.source!==key;$('interlace-status').textContent=r.counts.crossings+' CROSSINGS · '+r.counts.contacts+' CONTACT PAIRS · '+r.counts.overlaps+' OVERLAP PAIRS · '+r.counts.multiway+' AMBIGUOUS · '+crossingCache.workerMs.toFixed(1)+' MS WORKER'+(stale?' · PREVIOUS OVERRIDES INACTIVE':'')+' · '+(stale?0:w.interlacing.overrides.length)+' LOCAL OVERRIDES · REPRESENTED PATHS';const assignments=resolveWeaveRules(w.weave.derived.strands,r,w.interlacing,key);$('interlace-status').textContent+='  |  '+assignments.size+' ASSIGNED  |  '+(r.events.length-assignments.size)+' UNRESOLVED';const chosen=selectedCrossingEvent(selectedCrossing,key,r.events);$('interlace-choice').hidden=!chosen;$('interlace-local-actions').hidden=!chosen;if(chosen){const description=s=>s.identity?s.identity.roleId+' / '+s.identity.runKey+' / ROW '+s.identity.row+' COL '+s.identity.column:familyOf(s)+' / LINE '+s.k;const a=description(w.weave.derived.strands[chosen.a.si]),b=description(w.weave.derived.strands[chosen.b.si]),assigned=assignments.has(chosen.id),detail=effectiveWeaveRule(w.weave.derived.strands,r,w.interlacing,key,chosen,assignments);$('interlace-selected').textContent='SELECTED: '+a+' WITH '+b+(assigned?' · UPPER: '+(assignments.get(chosen.id)?a:b):' · UNASSIGNED');$('interlace-rule-source').textContent=effectiveRuleText(detail,w);$('interlace-upper').replaceChildren(...[['','UNASSIGNED - CHOOSE UPPER THREAD'],[true,a],[false,b]].map(([value,text])=>{const o=document.createElement('option');o.value=String(value);o.textContent=text;return o;}));$('interlace-upper').value=assigned?String(assignments.get(chosen.id)):'';$('interlace-swap').disabled=!!pending||threadSaving||!assigned;$('interlace-swap').title=assigned?'Reverse this crossing.':'Choose an upper thread before swapping.';}else{$('interlace-selected').textContent='CLICK A MARK TO SELECT IT. CHOOSE ITS UPPER THREAD OR USE SWAP BELOW.';$('interlace-rule-source').textContent='SELECT A CROSSING TO SEE WHICH RULE CONTROLS IT.';}if(!$('interlace-marks').checked)return;const events=r.events.filter(e=>!e.ambiguous).map(e=>({e,q:toScreen(e,view,width,height)})).filter(({q})=>q.x>=0&&q.x<=width&&q.y>=0&&q.y<=height);if(events.length>1000)$('interlace-status').textContent+=' | FIRST 1000 VISIBLE MARKS SHOWN';for(const {e,q} of events.slice(0,1000)){const active=chosen?.id===e.id,mark=svgElement('circle',{cx:q.x,cy:q.y,r:active?8:6,fill:active?'var(--accent)':'var(--paper)',stroke:'var(--ink)','stroke-width':active?2:1,'data-crossing':e.id,tabindex:0,role:'button','aria-label':'Select crossing','aria-pressed':String(active),style:'cursor:pointer;pointer-events:all'});bindCrossingMarker(mark,()=>{if(pending||threadSaving)return;selectedCrossing=crossingSelectionRecord(key,e);renderDerivedWeaveLayer();$('interlace-section').open=true;});layer.append(mark);}}


async function updateInterlacing(reset=false,ruleEdit=false,preset=false,clearTarget=false){if(pending||threadSaving)throw Error('Wait for the pending save.');const w=project().working,v=clone(w.interlacing||defaultInterlacing()),names=familyNames(w.carrier),target=parseInterlaceTarget(activeInterlaceTarget,names);v.enabled=$('interlace-enabled').checked;v.topFamily=$('interlace-family').value;v.clearance=Number($('interlace-gap').value);if(ruleEdit){const selectedMode=$('interlace-rule').value;v.version=v.version==='interlacing-v3'||selectedMode==='seeded'?'interlacing-v3':'interlacing-v2';v.rule=clone(v.rule||{...defaultRule(w.carrier?.recipeId||''),mode:'priority'});if(v.version==='interlacing-v3')v.rule=withStructuredVariation(v.rule);if(clearTarget){v.rule=target.kind==='pair'?clearPairRule(v.rule,target.first,target.second):clearFamilyRule(v.rule,target.family,names);}else if(preset){v.rule=defaultRule(w.carrier?.recipeId||'');if(v.version==='interlacing-v3')v.rule=withStructuredVariation(v.rule);v.enabled=true;v.overrides=[];v.source='';activeInterlaceTarget='';}else if(target.kind!=='default'){if(selectedMode==='seeded')throw Error('Seeded variation applies to the whole weave; pair and family rules remain explicit.');const current=target.kind==='pair'?pairRepeatRule(v.rule,target.first,target.second):familyRepeatRule(v.rule,target.family,names),currentMode=current?(current.over===1&&current.under===1?'alternating':current.over===2&&current.under===1?'two-over-one':'grouped'):null,freshGrouped=selectedMode==='grouped'&&currentMode!=='grouped',values={over:selectedMode==='alternating'?1:selectedMode==='two-over-one'?2:freshGrouped?2:Number($('interlace-over').value),under:selectedMode==='alternating'||selectedMode==='two-over-one'?1:freshGrouped?2:Number($('interlace-under').value),phase:['alternating','two-over-one'].includes(selectedMode)||freshGrouped?0:Number($('interlace-phase').value)};v.rule=target.kind==='pair'?applyPairNamedRule(v.rule,target.first,target.second,selectedMode,values):applyFamilyNamedRule(v.rule,target.family,names,selectedMode,values);}else {const priorMode=namedRuleMode(v.rule);v.rule=applyNamedRuleMode(v.rule,selectedMode);v.rule.inverted=$('interlace-invert').checked;const mode=namedRuleMode(v.rule),freshGrouped=selectedMode==='grouped'&&priorMode!=='grouped',values={over:mode==='alternating'?1:mode==='two-over-one'?2:freshGrouped?v.rule.over:Number($('interlace-over').value),under:mode==='alternating'||mode==='two-over-one'?1:freshGrouped?v.rule.under:Number($('interlace-under').value),phase:Number($('interlace-phase').value)};if(v.rule.mode==='repeat')Object.assign(v.rule,values);if(v.rule.mode==='seeded')Object.assign(v.rule,{seed:Number($('interlace-seed').value),balance:Number($('interlace-balance').value),maxRun:Number($('interlace-max-run').value)});}}if(reset){v.overrides=[];v.source='';}validateInterlacing(v);if(v.enabled)display=applyDisplayPreset(display,'derived-only');if(!w.weave){let base=createWeaveStudy(project(),w.carrierSourceRevisionId);base.working.interlacing=v;await editWorking(base.working,'INTERLACING CREATED AND SAVED.',{projectUpdate:base,saveWeaveName:nextLibraryName(base.weaveStudies,'WEAVE')});}else await commitThreadAppearance(null,v);if(v.enabled)saveView();}

$('interlace-enabled').onchange=()=>attempt(()=>updateInterlacing());$('interlace-family').onchange=()=>attempt(()=>updateInterlacing());$('interlace-gap').oninput=()=>{$('interlace-gap-value').value=$('interlace-gap').value;};$('interlace-gap').onchange=()=>attempt(()=>updateInterlacing());$('interlace-marks').onchange=()=>renderDerivedWeaveLayer();$('interlace-reset').onclick=()=>attempt(()=>updateInterlacing(true));$('interlace-retry').onclick=()=>attempt(()=>{if(pending)throw Error('Wait for geometry to finish.');if(crossingJob){crossingJob.worker.terminate();clearTimeout(crossingJob.timer);crossingJob=null;}crossingCache=null;crossingFailure=null;renderDerivedWeaveLayer();});



let threadPreview=null,threadSaving=false;

function renderFieldPresentationControls(){const settings=effectiveFieldPresentation(fieldPresentationPreview||project().working.fieldPresentation),disabled=threadSaving||!!pending;$('field-edge-mode').value=settings.mode;$('field-recovery').value=Math.round(settings.recoveryLength*100);$('field-recovery-value').value=Math.round(settings.recoveryLength*100)+'%';$('field-variation').value=Math.round(settings.endVariation*100);$('field-variation-value').value=Math.round(settings.endVariation*100)+'%';$('field-relaxation').value=Math.round(settings.relaxation*100);$('field-relaxation-value').value=Math.round(settings.relaxation*100)+'%';$('field-boundary-emphasis').value=settings.boundaryEmphasis;$('field-presentation-status').textContent=settings.mode.toUpperCase()+' · '+Math.round(settings.recoveryLength*100)+'% EXTENT · '+Math.round(settings.endVariation*100)+'% VARIATION';for(const id of ['field-edge-mode','field-recovery','field-variation','field-relaxation','field-boundary-emphasis','field-presentation-reset'])$(id).disabled=disabled;}

function renderThreadControls(){const w=project().working,names=w.carrier?familyEntries(w).map(entry=>entry.key):[];$('thread-controls').hidden=!names.length;$('thread-prerequisite').hidden=!!names.length;const selected=$('thread-family').value;$('thread-family').replaceChildren(...names.map(name=>{const o=document.createElement('option');o.value=name;o.textContent=familyLabel(name,w);return o}));$('thread-family').value=names.includes(selected)?selected:names[0]||'';if(names.length){const q=threadStyle(w.threadAppearance,$('thread-family').value);$('thread-width').value=q.width;$('thread-width-value').value=q.width;$('thread-rank').value=q.rank||1;$('thread-rank-value').value=q.rank||1;$('thread-edge').value=q.edgeWidth??1;$('thread-edge-value').value=q.edgeWidth??1;$('thread-edge-row').hidden=false;}renderFieldPresentationControls();for(const id of ['thread-width','thread-rank','thread-edge','thread-reset','thread-family','thread-linked'])$(id).disabled=threadSaving||!!pending;}

function appearanceFromControls(patch){return changeThreadAppearance(project().working.threadAppearance,familyNames(project().working.carrier),$('thread-family').value,$('thread-linked').checked,patch);}

function commitThreadAppearance(appearance,interlacePatch=null){const next=copyWorkingForEdit(project().working);if(appearance)next.threadAppearance=appearance;if(interlacePatch)next.interlacing=interlacePatch;return updateWorking(next,'APPEARANCE UPDATED.',{presentation:true,interlacePatch});}
function previewFieldPresentation(patch,commit=false){const value=changeFieldPresentation(project().working.fieldPresentation,patch);if(!commit){fieldPresentationPreview=value;renderThreadControls();renderCanvas();return;}const next=copyWorkingForEdit(project().working);next.fieldPresentation=value;fieldPresentationPreview=null;return updateWorking(next,'FIELD PRESENTATION UPDATED.',{presentation:true});}
async function savePresentationEdit(working,interlacePatch=null){if(pending||threadSaving)throw Error('Wait for the current change to finish.');const started=performance.now(),plan=presentationPlan(interlacePatch?'crossing-rules':'appearance'),fieldChanged=JSON.stringify(working.fieldPresentation)!==JSON.stringify(project().working.fieldPresentation);threadPreview=null;fieldPresentationPreview=null;threadSaving=true;renderThreadControls();try{const before=project().working,base=copyProjectForEdit(project());base.working=working;const saved=base.working.weave?saveWeaveStudy(base,currentWeaveName(base.working,base),true,true).project:saveCarrierStudy(base,currentPatternName(base)).project,next={...workspace,projects:workspace.projects.map(p=>p.id===saved.id?saved:p)},savedStatus=interlacePatch?'INTERLACING RULE SAVED. GEOMETRY UNCHANGED.':fieldChanged?'FIELD PRESENTATION SAVED. GEOMETRY UNCHANGED.':'THREAD APPEARANCE SAVED. GEOMETRY UNCHANGED.';workspace=next;acceptedVersion++;history().recordImmutable(before);autosave.accept({workspace:next},{savedStatus,started});status(`${savedStatus} BACKUP PENDING.`);}finally{threadSaving=false;render();workerEvent('presentation-applied',{totalMs:performance.now()-started,plan});}}

function appearanceParameterEdit(id,key,event,commit){
 if(pending||threadSaving)throw Error('Wait for the current change to finish.');
 const value=sliderEventNumber(event,$(id)),family=$('thread-family').value,linked=$('thread-linked').checked;$(id+'-value').value=value;
 const prepared=editGesture.capture(JSON.stringify([project().id,project().working.carrier?.id,id,family,linked]),value,()=>copyProjectForEdit(project()),(base,raw)=>{base=copyProjectForEdit(base);base.working.threadAppearance=changeThreadAppearance(base.working.threadAppearance,familyNames(base.working.carrier),family,linked,{[key]:raw});return{project:base};},commit);
 threadPreview=prepared.project.working.threadAppearance;
 if(commit)return commitThreadAppearance(threadPreview);renderCanvas();
}
for(const [id,key] of [['thread-rank','rank'],['thread-edge','edgeWidth'],['thread-width','width']]){
 $(id).oninput=event=>attempt(()=>appearanceParameterEdit(id,key,event,false));
 $(id).onchange=event=>attempt(()=>appearanceParameterEdit(id,key,event,true));
}
$('thread-family').onchange=()=>{editGesture.clear();threadPreview=null;renderThreadControls();renderCanvas();};

$('thread-reset').onclick=()=>attempt(()=>commitThreadAppearance(appearanceFromControls({width:3,mode:'outline',rank:1,edgeWidth:1})));
$('field-edge-mode').onchange=event=>attempt(()=>previewFieldPresentation({mode:event.target.value},true));
$('field-boundary-emphasis').onchange=event=>attempt(()=>previewFieldPresentation({boundaryEmphasis:event.target.value},true));
for(const [id,key] of [['field-recovery','recoveryLength'],['field-variation','endVariation'],['field-relaxation','relaxation']]){const control=$(id);control.oninput=event=>attempt(()=>{const value=sliderEventNumber(event,control)/100;$(`${id}-value`).value=Math.round(value*100)+'%';return previewFieldPresentation({[key]:value});});control.onchange=event=>attempt(()=>previewFieldPresentation({[key]:sliderEventNumber(event,control)/100},true));}
$('field-presentation-reset').onclick=()=>attempt(()=>previewFieldPresentation({...FIELD_PRESENTATION_DEFAULT},true));



$('export-derived-svg').onclick=async()=>{try{if(pending)throw Error('Wait for certified geometry or cancel the pending change.');const trusted=isCertifiedStudy(project().working.weave);if(trusted){status('VALIDATING CERTIFIED GEOMETRY FOR EXPORT…');await certifyWorking(project().working,project().id)}const current=project().working;if(current.interlacing?.enabled&&crossingCache?.key!==current.weave.derived.provenanceFingerprint)throw Error('Wait for complete interlacing before export.');download(derivedSvg(current,project().id,trusted,current.interlacing?.enabled?crossingCache.result:null),'weave-derived.svg','image/svg+xml');status('CERTIFIED DERIVED SVG EXPORTED.');}catch(error){status(error.message,true)}};

const transientProject=()=>{const p=copyProjectForEdit(pending?.projectUpdate||project());if(pending)p.working=copyWorkingForEdit(pending.working);return p;};

async function addField(kind='attractor'){await store.assertCurrent();let base=transientProject(),name;if(!base.working.weave){if(!base.working.carrierSourceRevisionId)throw Error('Create a Weave Pattern first.');base=createWeaveStudy(base,base.working.carrierSourceRevisionId);name=nextLibraryName(base.weaveStudies,'INFLUENCED GRID');$('weave-name').value=name;}else name=currentWeaveName(base.working);const next=addInfluence(base,kind),field=next.working.weave.generation.influences.at(-1);if(pending)cancelPending('PENDING CHANGE REPLACED BY ADD.');activeInfluenceId=field.id;focusDerivedEditing(true);requestWorking(next.working,'INFLUENCE ADDED AND SAVED.',true,{projectUpdate:next,saveWeaveName:name,feedback:{scope:'field',label:'INFLUENCE ADDED'}});$('field-section').open=true;}

$('add-attractor').onclick=()=>attempt(()=>addField());$('add-another-influence').onclick=()=>attempt(()=>addField());

$('duplicate-influence').onclick=()=>attempt(()=>{const base=transientProject();if(activeInfluenceId===null||!influenceOf(base.working.weave,activeInfluenceId))throw Error('Select an influence to duplicate.');const next=duplicateInfluence(base,activeInfluenceId),field=next.working.weave.generation.influences.at(-1);if(pending)cancelPending('PENDING CHANGE REPLACED BY DUPLICATE.');activeInfluenceId=field.id;focusDerivedEditing(true);requestWorking(next.working,'ACTIVE INFLUENCE DUPLICATED AND SAVED.',true,weaveSaveOptions(next,'INFLUENCE DUPLICATED'));});

$('remove-attractor').onclick=()=>attempt(async()=>{if(activeInfluenceId===null)throw Error('Select an influence to remove.');if(pending)cancelPending();const next=removeInfluence(project(),activeInfluenceId),fields=influencesOf(next.working.weave);activeInfluenceId=fields[0]?.id||null;await editWorking(next.working,'INFLUENCE REMOVED AND SAVED.',weaveSaveOptions(next));});

$('reset-attractor').onclick=()=>attempt(()=>{const base=transientProject(),field=activeInfluenceId===null?null:influenceOf(base.working.weave,activeInfluenceId);if(!field)throw Error('Select an influence to reset.');const b=bounds(base.working.boundary.points),extent=Math.max(b.maxX-b.minX,b.maxY-b.minY),families=Object.fromEntries(familyNames(base.working.carrier).map(n=>[n,{strength:50,tension:0}])),changes={influenceId:activeInfluenceId,families,influence:{kind:field.kind,center:{x:(b.minX+b.maxX)/2,y:(b.minY+b.maxY)/2},radius:.3*extent,enabled:true,falloff:3,direction:0}};if(pending)cancelPending('PENDING CHANGE REPLACED BY RESET.');const next=candidateInfluence(base,changes);focusDerivedEditing(true);requestWorking(next.working,'ACTIVE INFLUENCE RESET AND SAVED.',true,weaveSaveOptions(next,'INFLUENCE RESET'));});

$('cancel-attractor').onclick=()=>cancelPending();$('show-attractor').onchange=e=>{display.attractor=e.target.checked;saveView();};

function influenceControlSnapshot(changed,value){const values={strength:Number($('attractor-strength').value),tension:Number($('attractor-tension').value),radius:Number($('attractor-radius').value),falloff:Number($('attractor-falloff').value),direction:Number($('influence-direction').value)};if(changed==='attractor-strength')values.strength=value;else if(changed==='attractor-tension')values.tension=value;else if(changed==='attractor-radius')values.radius=value;else if(changed==='attractor-falloff')values.falloff=value;else if(changed==='influence-direction')values.direction=value;return values;}

function attractorChanges(base,changed,values){const field=activeInfluenceId===null?null:influenceOf(base.working.weave,activeInfluenceId);if(!field)throw Error('Select an influence to edit.');return{influenceId:activeInfluenceId,...influenceResponseChanges(field,activeInfluenceFamily,$('link-influence-roles').checked,changed,values),influence:{kind:$('influence-type').value,center:{...field.center},radius:values.radius,enabled:$('attractor-enabled').checked,falloff:values.falloff,direction:values.direction}}}

function influenceParameterEdit(key,value,commit,prepare,feedback){
 const prepared=editGesture.capture(JSON.stringify([project().id,project().working.weave?.studyId,key]),value,transientProject,(base,raw)=>({project:candidateInfluence(base,prepare(base,raw))}),commit),next=prepared.project;
 return updateWorking(next.working,'INFLUENCE UPDATED AND SAVED.',{...weaveSaveOptions(next,feedback),preview:!commit});
}
for(const [id,key] of [['attractor-radius','radius'],['attractor-strength','strength'],['attractor-tension','tension'],['attractor-falloff','falloff'],['influence-direction','direction']]){
 const range=$(`${id}-range`),apply=(event,commit)=>attempt(()=>{const value=sliderEventNumber(event,range),influenceId=activeInfluenceId,family=activeInfluenceFamily,linked=$('link-influence-roles').checked;syncSlider(id,value);focusDerivedEditing(true);return influenceParameterEdit([id,influenceId,family,linked],value,commit,(base,raw)=>{const field=influenceOf(base.working.weave,influenceId);if(!field)throw Error('Select an influence to edit.');return{influenceId,...(['strength','tension'].includes(key)?influenceResponseChanges(field,family,linked,id,{[key]:raw}):{influence:{[key]:raw}})};},`${key.toUpperCase()} ${value}`);});
 range.addEventListener('input',event=>apply(event,false));range.addEventListener('change',event=>apply(event,true));
}


$('influence-type').onchange=()=>attempt(()=>{focusDerivedEditing(true);const base=transientProject(),next=candidateInfluence(base,attractorChanges(base,undefined,influenceControlSnapshot()));requestWorking(next.working,'INFLUENCE TYPE CHANGED AND SAVED.',true,weaveSaveOptions(next,`TYPE ${$('influence-type').value.toUpperCase()}`));});

$('toggle-attractor-enabled').onclick=()=>attempt(async()=>{if(enabledAction)return;enabledAction=true;const button=$('toggle-attractor-enabled');button.disabled=true;try{const base=transientProject(),field=activeInfluenceId===null?null:influenceOf(base.working.weave,activeInfluenceId);if(!field)throw Error('Select an influence first.');const desired=!field.enabled;$('attractor-enabled').checked=desired;const changes=attractorChanges(base,undefined,influenceControlSnapshot());changes.influence.enabled=desired;if(pending)cancelPending('PENDING CHANGE REPLACED BY ENABLED STATE.');const next=candidateInfluence(base,changes);focusDerivedEditing(true);await editWorking(next.working,desired?'INFLUENCE ENABLED AND SAVED.':'INFLUENCE DISABLED AND SAVED.',weaveSaveOptions(next,desired?'INFLUENCE ENABLED':'INFLUENCE DISABLED'));}finally{enabledAction=false;button.disabled=false;}});

$('variation-family-range').addEventListener('input',event=>syncSlider('variation-family',Number(event.target.value)));$('variation-family-range').addEventListener('change',event=>attempt(()=>{const base=transientProject(),next=candidateVariation(base,{family:activeInfluenceFamily,amount:Number(event.target.value)});requestWorking(next.working,`FAMILY ${activeInfluenceFamily} VARIATION UPDATED AND SAVED.`,true,weaveSaveOptions(next));}));

$('variation-seed-range').addEventListener('input',event=>syncSlider('variation-seed',Number(event.target.value)));$('variation-seed-range').addEventListener('change',event=>attempt(()=>{const next=candidateVariation(transientProject(),{seed:Number(event.target.value)});requestWorking(next.working,'VARIATION SEED UPDATED AND SAVED.',true,weaveSaveOptions(next));}));

$('new-variation-seed').onclick=()=>attempt(()=>{const base=transientProject(),seed=(Math.imul(base.working.weave.generation.variation.seed,1664525)+1013904223)>>>0,next=candidateVariation(base,{seed:seed%65536});requestWorking(next.working,'NEW REPEATABLE VARIATION SEED SAVED.',true,weaveSaveOptions(next));});

$('reset-variation').onclick=()=>attempt(async()=>{if(pending)cancelPending('PENDING CHANGE REPLACED BY VARIATION RESET.');const families=Object.fromEntries(familyNames(project().working.carrier).map(n=>[n,{amount:0}])),next=candidateVariation(project(),{seed:1042,families});await editWorking(next.working,'VARIATION RESET AND SAVED.',weaveSaveOptions(next));});

function patternParameterEdit(key,value,commit,change,feedback){
 const prepared=editGesture.capture(JSON.stringify([project().id,project().working.carrier?.id,key]),value,transientProject,(base,raw)=>preparePatternUpdate(change(clone(base.working.carrier),raw),base),commit),owner=prepared.project;
 return updateWorking(owner.working,'WEAVE PATTERN UPDATED AND SAVED.',{preview:!commit,projectUpdate:owner,saveWeaveName:owner.working.weave?currentWeaveName(owner.working,owner):null,feedback:{scope:'pattern',label:feedback}});
}
for(const [id,key] of [['family-spacing','spacing'],['family-angle','angleDegrees'],['family-offset','offset'],['family-density','density']]){
 const range=$(`${id}-range`);
 const apply=(event,commit)=>attempt(()=>{const value=sliderEventNumber(event,range),family=activePatternFamily;syncSlider(id,value);focusDerivedEditing(false);return patternParameterEdit(id+':'+family,value,commit,(carrier,raw)=>{if(carrier.generatorVersion==='rect-v1'){const angle=carrier.angleDegrees;carrier.generatorVersion='rect-v2';carrier.families.A.angleDegrees=angle;carrier.families.B.angleDegrees=angle+90;delete carrier.angleDegrees;}carrier.families[family][key]=raw;return carrier;},`${familyLabel(family)} ${key.toUpperCase()} ${value}`);});
 range.addEventListener('input',event=>apply(event,false));range.addEventListener('change',event=>apply(event,true));
}


$('add-pattern-family').onclick=()=>attempt(async()=>{const result=addWeaveFamily(project());activePatternFamily=result.family;await commitPatternCarrier(result.project.working.carrier,`FAMILY ${result.family} ADDED AND SAVED.`,result.project);});

$('duplicate-pattern-family').onclick=()=>attempt(async()=>{const source=activePatternFamily,result=addWeaveFamily(project(),source);activePatternFamily=result.family;await commitPatternCarrier(result.project.working.carrier,`FAMILY ${result.family} DUPLICATED FROM FAMILY ${source} AND SAVED.`,result.project);});

$('remove-pattern-family').onclick=()=>attempt(async()=>{const prior=activePatternFamily,next=removeWeaveFamily(project(),prior);activePatternFamily=orderedFamilies(next.working.carrier,next.working.familyCatalog)[0].key;if(!familyEntries(next.working).some(entry=>entry.id===display.isolatedFamilyId))display.isolatedFamilyId=null;await commitPatternCarrier(next.working.carrier,`FAMILY ${prior} DELETED; PATTERN UPDATED AND SAVED.`,next);});

for(const name of ['select','draw','pan'])$(`${name}-tool`).onclick=()=>setTool(name);

$('cancel-drawing').onclick=()=>setTool('select');

$('finish-drawing').onclick=()=>attempt(async()=>{await setBoundary(validateBoundary(draft),'DRAWN BOUNDARY CREATED.');setTool('select');display.boundary=true;saveView();});

$('fit').onclick=fit;

for(const action of ['undo','redo'])$(action).onclick=()=>attempt(async()=>{

  if(pending){cancelPending();return;}

  const h=history(),current=project().working,next=clone(workspace);activeProject(next).working=h[action](current);workspace=next;acceptedVersion++;autosave.accept({workspace:next},{savedStatus:`${action.toUpperCase()} SAVED.`});status(`${action.toUpperCase()} APPLIED · BACKUP PENDING.`);





  selected=null;render();status(action.toUpperCase()+' APPLIED · BACKUP PENDING. SAVED REVISIONS RETAINED.');

});

for(const [id,key] of [['boundary','boundary'],['grid','grid'],['source-lattice','sourceLattice'],['original-grid','originalGrid'],['weave-source','weaveSource'],['weave-derived','weaveDerived']])$(`show-${id}`).onchange=event=>{display[key]=event.target.checked;saveView();status(`${event.target.nextSibling?.textContent?.trim()||id} ${event.target.checked?'SHOWN':'HIDDEN'}.`);};

for(const [id,preset,label] of [['display-derived-only','derived-only','DISTORTED WEAVE ONLY'],['display-compare','compare','SOURCE AND DISTORTED WEAVE'],['display-construction','construction','CARRIER CONSTRUCTION']])$(id).onclick=()=>{display=applyDisplayPreset(display,preset);saveView();status(`${label} DISPLAYED. VIEW STATE DOES NOT CHANGE GEOMETRY.`);};

document.querySelectorAll('[data-display-preset]').forEach(button=>button.onclick=()=>{display=applyDisplayPreset(display,button.dataset.displayPreset);saveView();status(`${button.textContent.trim()} DISPLAYED.`);});document.querySelectorAll('[data-display-key]').forEach(input=>input.onchange=()=>{display[input.dataset.displayKey]=input.checked;saveView();status(`${input.parentElement.textContent.trim()} ${input.checked?'SHOWN':'HIDDEN'}.`);});

$('reveal-boundary').onclick=()=>{display.boundary=true;saveView();$('boundary-section').open=true;};

document.querySelectorAll('[data-theme]').forEach(b=>b.onclick=()=>{display.theme=b.dataset.theme;saveView();});

for(const rail of ['boards','controls'])$(`toggle-${rail}`).onclick=()=>{const hidden=$('shell').classList.toggle(`${rail}-hidden`),label=rail==='boards'?'LIBRARY':'CONTROLS';$(`toggle-${rail}`).textContent=`${label} ${hidden?'+':'−'}`;$(`toggle-${rail}`).setAttribute('aria-expanded',String(!hidden));};

$('backup').onclick=()=>attempt(async()=>{const active=project(),name=active.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'weave-project',text=(await storageTask({type:'export',packed:store.lastPacked,projectId:active.id})).text;download(text,`${name}-backup.json`);status(`${active.name} PROJECT BACKUP EXPORTED · ${(projectPortableByteLength(store.lastPacked,active.id)/1024).toFixed(1)} KIB.`);});

$('reload-latest').onclick=()=>location.reload();

window.addEventListener('storage',event=>{if(event.key!==ADVISORY_KEY||!event.newValue||!store.head)return;try{const latest=JSON.parse(event.newValue);if(latest.generation===store.head.generation&&latest.currentRoot===store.head.currentRoot)return;$('reload-latest').hidden=false;$('project-section').open=true;setEditFeedback('field','error','PAUSED · ANOTHER TAB SAVED NEWER WORK');status('ANOTHER TAB SAVED A NEWER WORKSPACE. RELOAD LATEST BEFORE EDITING.',true);}catch{}});

$('raw-backup').onclick=()=>attempt(async()=>{if(store.recoveryPacked)download((await storageTask({type:'export',packed:store.recoveryPacked})).text,'weave-foundation-previous-recovery.json');else download(store.raw(),'weave-foundation-raw-recovery.json','text/plain');});

$('import-backup').onclick=()=>{$('import-message').textContent='';$('backup-dialog').showModal();};

$('backup-file').onchange=async event=>{const file=event.target.files?.[0];if(!file)return;$('backup-json').value=await file.text();};

$('confirm-import').onclick=async()=>{try{$('confirm-import').disabled=true;$('import-message').textContent='VALIDATING SAVED STUDIES…';const text=$('backup-json').value,header=JSON.parse(text),decoded=[2,3].includes(header?.version)?(await storageTask({type:'portable',text})).workspace:parseBackup(text),incoming=await certifyWorkspace(decoded),next=mergeBackup(workspace,incoming,true,true);await persist(next,true);histories.clear();$('backup-dialog').close();setTool('select');render();fit();status('BACKUP IMPORTED. EXISTING BOARDS RETAINED.');}catch(error){$('import-message').textContent=error.message;}finally{$('confirm-import').disabled=false;}};

$('import-svg').onchange=async event=>{const file=event.target.files?.[0];if(!file){clearSvgStage();return;}try{const boundary=parseSvgBoundary(await file.text(),file.name);showSvgStage(file,boundary);status('SVG VALIDATED. REVIEW THE STAGED BOUNDARY BEFORE APPLY.');}catch(error){showSvgStage(file,null,error.message);status(error.message,true);}};

$('cancel-svg-import').onclick=()=>{clearSvgStage();status('SVG IMPORT CANCELLED. THE WORKING BOUNDARY IS UNCHANGED.');};

$('apply-svg-import').onclick=()=>attempt(async()=>{if(!stagedSvg)throw new Error('Choose and validate an SVG boundary first.');const filename=stagedSvg.filename;await setBoundary(stagedSvg.boundary,`SVG BOUNDARY APPLIED FROM ${filename}. ONE UNDO RESTORES THE PRIOR BOUNDARY.`);clearSvgStage();display.boundary=true;saveView();selected=null;fit();});

$('export-svg').onclick=()=>attempt(()=>download(boundarySvg(project().working.boundary),'weave-boundary.svg','image/svg+xml'));

$('export-dxf').onclick=()=>attempt(()=>download(boundaryDxf(project().working.boundary),'weave-boundary.dxf','application/dxf'));

const localPoint=event=>{const rect=$('canvas').getBoundingClientRect();return {x:event.clientX-rect.left,y:event.clientY-rect.top};};

function deselectActiveInfluence(){if(activeInfluenceId===null||activeInfluenceId===undefined)return;activeInfluenceId=null;renderAttractorControls();renderAttractorGuide();status('INFLUENCE DESELECTED. SELECT A GUIDE OR LIST ITEM TO EDIT IT.');}

document.querySelector('.workspace').addEventListener('pointerdown',event=>{if(!event.target.closest('[data-influence-id]'))deselectActiveInfluence();});

$('canvas').onpointerdown=event=>{

  if(event.button!==0&&event.button!==1)return;

  const p=localPoint(event),influenceId=event.target.dataset.influenceId;

  if(influenceId){const field=influenceOf(pending?.working.weave||project().working.weave,influenceId);if(field){activeInfluenceId=field.id;renderAttractorControls();renderAttractorGuide();status(`ACTIVE ${field.kind.toUpperCase()} SELECTED.`);}}

  else deselectActiveInfluence();

  if(tool==='draw'&&event.button===0){draft.push(toDocument(p,view,width,height));renderCanvas();return;}

  if(tool==='pan'||event.button===1){event.preventDefault();drag={type:'pan',start:p,view:clone(view)};}

  else if(event.target.dataset.attractorHandle){const fieldId=event.target.dataset.influenceId||activeInfluenceId,field=influenceOf(pending?.working.weave||project().working.weave,fieldId);if(field){activeInfluenceId=field.id;drag={type:'attractor',handle:event.target.dataset.attractorHandle,field:clone(field)};}}

  else if(event.target.dataset.vertex!==undefined){selected=Number(event.target.dataset.vertex);vertexPreview=null;drag={type:'vertex',index:selected,points:clone(project().working.boundary.points)};renderVertexControls(project().working.boundary);renderCanvas();}

  else {selected=null;renderCanvas();}

  if(drag)$('canvas').setPointerCapture(event.pointerId);

};

$('canvas').onpointermove=event=>{

  const p=localPoint(event),doc=toDocument(p,view,width,height);$('pointer').textContent=`X ${doc.x.toFixed(2)} / Y ${doc.y.toFixed(2)}`;

  if(drag?.type==='pan'){view={...drag.view,cx:drag.view.cx-(p.x-drag.start.x)/drag.view.scale,cy:drag.view.cy+(p.y-drag.start.y)/drag.view.scale};renderCanvas();}

  else if(drag?.type==='vertex'){drag.points[drag.index]={x:Number(doc.x.toFixed(6)),y:Number(doc.y.toFixed(6))};renderCanvas();}

  else if(drag?.type==='attractor'){const influence=drag.handle==='center'?{center:{x:Number(doc.x.toFixed(6)),y:Number(doc.y.toFixed(6))}}:drag.handle==='direction'?{direction:Number((Math.atan2(doc.y-drag.field.center.y,doc.x-drag.field.center.x)*180/Math.PI).toFixed(3))}:{radius:Math.hypot(doc.x-drag.field.center.x,doc.y-drag.field.center.y)};attempt(()=>{focusDerivedEditing(true);return influenceParameterEdit(['canvas',drag.field.id,drag.handle],influence,false,(_base,raw)=>({influenceId:drag.field.id,influence:raw}),`DIRECT ${drag.handle.toUpperCase()} MOVE`)});}

};

$('canvas').onpointerup=event=>{if(event.target.closest('[data-crossing]'))return;const completed=drag;drag=null;if(completed?.type==='vertex')attempt(async()=>{await setBoundary(validateBoundary(completed.points),'VERTEX MOVED. ONE UNDO RESTORES THE DRAG.');renderVertexControls(project().working.boundary);});if(completed?.type==='attractor')attempt(()=>{const doc=toDocument(localPoint(event),view,width,height),influence=completed.handle==='center'?{center:{x:Number(doc.x.toFixed(6)),y:Number(doc.y.toFixed(6))}}:completed.handle==='direction'?{direction:Number((Math.atan2(doc.y-completed.field.center.y,doc.x-completed.field.center.x)*180/Math.PI).toFixed(3))}:{radius:Math.hypot(doc.x-completed.field.center.x,doc.y-completed.field.center.y)};focusDerivedEditing(true);return influenceParameterEdit(['canvas',completed.field.id,completed.handle],influence,true,(_base,raw)=>({influenceId:completed.field.id,influence:raw}),`DIRECT ${completed.handle.toUpperCase()} MOVE`)});renderCanvas();};

$('canvas').onpointercancel=()=>{drag=null;if(pending)cancelPending();else renderCanvas();};

$('canvas').addEventListener('wheel',event=>{event.preventDefault();view=zoomAt(view,Math.exp(-event.deltaY*.001),localPoint(event),width,height);renderCanvas();},{passive:false});

document.addEventListener('keydown',event=>{if(event.key==='Escape'&&pending){cancelPending();return;}if(event.target.closest('input,textarea,dialog'))return;if(event.key==='Escape'){setTool('select');return;}if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'){event.preventDefault();$(event.shiftKey?'redo':'undo').click();}if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='y'){event.preventDefault();$('redo').click();}});

new ResizeObserver(entries=>{const r=entries[0].contentRect;width=r.width;height=r.height;$('canvas').setAttribute('viewBox',`0 0 ${width} ${height}`);if(!view)fit();renderCanvas();}).observe($('drawing'));

// Keep the workflow visible while every editing section remains opt-in.

document.querySelectorAll('#controls > details').forEach(d=>d.open=d.id==='project-section');

if(matchMedia('(max-width:760px)').matches){$('toggle-boards').click();$('toggle-controls').click();}

syncBoundaryName();render();saveView();if(loadError){$('boundary-action-status').textContent='SAVING PAUSED: '+loadError;status(loadError,true);$('raw-backup').hidden=!(store.lastRaw||store.recoveryPacked);if(store.recoveryPacked)$('raw-backup').textContent='DOWNLOAD VALIDATED PREVIOUS ↓';}else status(store.head?.generation>1||store.lastRaw?'WORKSPACE RESTORED. SAVED REVISIONS ARE AVAILABLE IN BOARDS.':'SQUARE READY. SHOW BOUNDARY OR DRAW YOUR OWN.');

if(document.modelContext?.registerTool){

  const lifecycle=new AbortController();

  const tool={name:'read_weave_foundation',description:'Read the working boundary and carrier, immutable saved revisions, display state and build identity without editing.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute(input){if(!input||typeof input!=='object'||Object.keys(input).length)throw new Error('No input properties are accepted.');const derived=deriveWorking();return {build:BUILD,sourceTrace:sourceTraces.has(project().working.weave?.derived)?{version:'stitch-source-trace-v1',runs:sourceTraces.get(project().working.weave.derived).runs.length}:null,workspace:clone(workspace),display:clone(display),view:clone(view),carrier:derived?{inputFingerprint:derived.inputFingerprint,counts:clone(derived.diagnostics.counts),paths:clone(derived.paths),complete:derived.complete}:null,carrierDerivationCount,weaveDerivationCount,renderTelemetry:{full:fullRenderCount,targeted:targetedRenderCount},storageBlocked:store.blocked,autosave:autosave.state(),storage:store.head?{version:store.head.storageVersion,generation:store.head.generation,currentRoot:store.head.currentRoot,previousRoot:store.head.previousRoot,lastTransactionId:store.head.lastTransactionId,migrationComplete:store.head.migrationComplete}:null,workerTelemetry:{sequence:workerSequence,pending:pending?{phase:pending.phase,input:pending.input,started:pending.started,retried:pending.retried===true}:null,active:activeJob?{seq:activeJob.seq,requestId:activeJob.requestId,input:activeJob.input,attempt:activeJob.attempt}:null,events:clone(workerEvents)}};}};

  const storageTool={name:'read_weave_storage_capacity',description:'Read compact portable-backup capacity accounting without returning workspace geometry.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute(input){if(!input||typeof input!=='object'||Object.keys(input).length)throw new Error('No input properties are accepted.');return{build:BUILD,storageBlocked:store.blocked,capacity:storageDiagnostics()};}};

  try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}
  try{Promise.resolve(document.modelContext.registerTool(storageTool,{signal:lifecycle.signal})).catch(()=>{});}catch{}

  window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});

}




installNumericInputs(document.getElementById('controls'));
