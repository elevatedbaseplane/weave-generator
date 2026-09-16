import {square,validateBoundaryRecord} from './boundary.mjs';
import {validateCarrierRecipe} from './carrier.mjs';
import {safeDeriveCarrier as deriveCarrier,refreshWeave,validateWeave,rebaseWeave,canonical,exactKeys,WEAVE_VERSIONS} from './weave.mjs';
export const SCHEMA_VERSION=4;
export const COORDINATES=Object.freeze({units:'document-units',yAxis:'up',origin:'document'});
export const clone=value=>structuredClone(value);
const id=prefix=>`${prefix}-${crypto.randomUUID()}`,cleanName=value=>String(value||'').trim().toUpperCase().slice(0,80);
export function createProject(name='WEAVE STUDIES'){return {id:id('project'),name:cleanName(name)||'WEAVE STUDIES',coordinateSystem:{...COORDINATES},working:{boundary:square(),sourceRevisionId:null,carrier:null,carrierSourceRevisionId:null,weave:null},boundaries:[],carrierStudies:[],weaveStudies:[]};}
export function createWorkspace(){const project=createProject();return {schemaVersion:SCHEMA_VERSION,activeProjectId:project.id,projects:[project]};}
export const activeProject=workspace=>workspace.projects.find(p=>p.id===workspace.activeProjectId);
export function findRevision(project,revisionId){for(const entry of project.boundaries){const revision=entry.revisions.find(r=>r.id===revisionId);if(revision)return {entry,revision};}return null;}
export function findCarrierRevision(project,revisionId){for(const entry of project.carrierStudies||[]){const revision=entry.revisions.find(r=>r.id===revisionId);if(revision)return {entry,revision};}return null;}
export function saveBoundary(project,name){name=cleanName(name);if(!name)throw new Error('Give this boundary a name.');const boundary=validateBoundaryRecord(project.working.boundary),draft=clone(project);let entry=draft.boundaries.find(e=>e.name===name);if(!entry){entry={id:id('boundary'),name,latestRevisionId:null,revisions:[]};draft.boundaries.push(entry);}const revision={id:id('revision'),number:entry.revisions.length+1,createdAt:new Date().toISOString(),parentRevisionId:entry.latestRevisionId,geometryVersion:'boundary-v1',boundary};entry.revisions.push(revision);entry.latestRevisionId=revision.id;draft.working={...draft.working,boundary:clone(boundary),sourceRevisionId:revision.id};return {project:draft,entryId:entry.id,revisionId:revision.id};}
export function restoreBoundary(project,revisionId){const found=findRevision(project,revisionId);if(!found)throw new Error('This boundary revision is missing.');const draft=clone(project);draft.working=refreshWeave({...draft.working,boundary:clone(found.revision.boundary),sourceRevisionId:revisionId},draft.id);return draft;}
export function saveCarrierStudy(project,name){name=cleanName(name);if(!name)throw new Error('Give this carrier study a name.');if(!project.working.carrier)throw new Error('Create a carrier before saving a study.');validateBoundaryRecord(project.working.boundary);validateCarrierRecipe(project.working.carrier);const draft=clone(project);let entry=draft.carrierStudies.find(e=>e.name===name);if(!entry){entry={id:id('carrier-study'),name,latestRevisionId:null,revisions:[]};draft.carrierStudies.push(entry);}const revision={id:id('carrier-revision'),number:entry.revisions.length+1,createdAt:new Date().toISOString(),parentRevisionId:entry.latestRevisionId,carrierVersion:'carrier-study-v1',boundary:clone(draft.working.boundary),boundarySourceRevisionId:draft.working.sourceRevisionId,carrier:clone(draft.working.carrier)};entry.revisions.push(revision);entry.latestRevisionId=revision.id;draft.working.carrierSourceRevisionId=revision.id;return {project:draft,entryId:entry.id,revisionId:revision.id};}
export function restoreCarrierStudy(project,revisionId){const found=findCarrierRevision(project,revisionId);if(!found)throw new Error('This carrier study revision is missing.');const draft=clone(project),r=found.revision;draft.working={boundary:clone(r.boundary),sourceRevisionId:r.boundarySourceRevisionId,carrier:clone(r.carrier),carrierSourceRevisionId:r.id,weave:null};return draft;}
const requireId=value=>{if(typeof value!=='string'||!value||value.length>120)throw new Error('Invalid document identity.');};
function unique(items,label){if(!Array.isArray(items))throw new Error(`Missing ${label}.`);const seen=new Set();for(const item of items){requireId(item?.id);if(seen.has(item.id))throw new Error(`Duplicate ${label} identity.`);seen.add(item.id);}}
function validateBoundaryChains(project){unique(project.boundaries,'boundary');const names=new Set(),revisionIds=new Set();for(const entry of project.boundaries){if(typeof entry.name!=='string'||!entry.name.trim()||entry.name.length>80||names.has(entry.name))throw new Error('Invalid or duplicate boundary name.');names.add(entry.name);unique(entry.revisions,'revision');if(!entry.revisions.length)throw new Error('A saved boundary needs a revision.');for(let i=0;i<entry.revisions.length;i++){const r=entry.revisions[i];if(revisionIds.has(r.id)||r.number!==i+1||r.parentRevisionId!==(i?entry.revisions[i-1].id:null)||r.geometryVersion!=='boundary-v1'||!Number.isFinite(Date.parse(r.createdAt))||r.boundary?.closed!==true)throw new Error('Invalid boundary revision chain.');validateBoundaryRecord(r.boundary);revisionIds.add(r.id);}if(entry.latestRevisionId!==entry.revisions.at(-1).id)throw new Error('The latest pointer must reference the newest revision.');}}
function validateCarrierChains(project){unique(project.carrierStudies,'carrier study');const names=new Set(),revisionIds=new Set();for(const entry of project.carrierStudies){if(typeof entry.name!=='string'||!entry.name.trim()||entry.name.length>80||names.has(entry.name))throw new Error('Invalid or duplicate carrier study name.');names.add(entry.name);unique(entry.revisions,'carrier revision');if(!entry.revisions.length)throw new Error('A saved carrier study needs a revision.');for(let i=0;i<entry.revisions.length;i++){const r=entry.revisions[i];if(revisionIds.has(r.id)||r.number!==i+1||r.parentRevisionId!==(i?entry.revisions[i-1].id:null)||r.carrierVersion!=='carrier-study-v1'||!Number.isFinite(Date.parse(r.createdAt)))throw new Error('Invalid carrier study revision chain.');validateBoundaryRecord(r.boundary);validateCarrierRecipe(r.carrier);if(r.boundarySourceRevisionId!==null&&!findRevision(project,r.boundarySourceRevisionId))throw new Error('A carrier study references a missing boundary revision.');revisionIds.add(r.id);}if(entry.latestRevisionId!==entry.revisions.at(-1).id)throw new Error('The latest carrier pointer must reference the newest revision.');}}
function validateProject(project,legacy=false,weaveEnabled=false){requireId(project.id);if(typeof project.name!=='string'||!project.name.trim()||project.name.length>80)throw new Error('Invalid board name.');const c=project.coordinateSystem;if(c?.units!==COORDINATES.units||c?.yAxis!=='up'||c?.origin!=='document')throw new Error('Unsupported coordinate system; no automatic rescaling is performed.');if(project.working?.boundary?.closed!==true)throw new Error('The working boundary must be closed.');validateBoundaryRecord(project.working.boundary);validateBoundaryChains(project);if(project.working.sourceRevisionId!==null&&!findRevision(project,project.working.sourceRevisionId))throw new Error('The working boundary references a missing revision.');if(!legacy){if(project.working.carrier!==null)deriveCarrier(project.working.boundary,project.working.carrier,project.id);validateCarrierChains(project);for(const entry of project.carrierStudies)for(const r of entry.revisions)deriveCarrier(r.boundary,r.carrier,project.id);if(project.working.carrierSourceRevisionId!==null&&!findCarrierRevision(project,project.working.carrierSourceRevisionId))throw new Error('The working carrier references a missing revision.');}if(weaveEnabled){exactKeys(project.working,['boundary','sourceRevisionId','carrier','carrierSourceRevisionId','weave'],'working document');validateWeaveChains(project);}}
function validateEnvelope(value,version){if(!value||value.schemaVersion!==version)throw new Error('Unsupported project format.');unique(value.projects,'project');if(!value.projects.length||value.projects.length>100)throw new Error('Use 1–100 boards per backup.');value.projects.forEach(p=>validateProject(p,version===2,version===4));if(!activeProject(value))throw new Error('The active board is missing.');return value;}
export function normalizeWorkspace(value){
 if(![2,3,4].includes(value?.schemaVersion))throw new Error('Unsupported project format.');
 validateEnvelope(value,value.schemaVersion);
 const next=clone(value);
 if(next.schemaVersion===2)for(const p of next.projects){p.working={...p.working,carrier:null,carrierSourceRevisionId:null};p.carrierStudies=[];}
 if(next.schemaVersion!==4)for(const p of next.projects){p.working={...p.working,weave:null};p.weaveStudies=[];}
 next.schemaVersion=4;return validateEnvelope(next,4);
}
export const validateWorkspace=value=>validateEnvelope(value,4);
export const BACKUP_LIMIT=10*1024*1024;
export function backupText(value){const text=JSON.stringify({format:'weave-foundation',version:1,workspace:value},null,2);if(text.length>BACKUP_LIMIT)throw new Error('This workspace exceeds the backup size limit. Keep the previous revision; use a separate board backup.');return text;}
export function serializeWorkspace(value){validateWorkspace(value);return backupText(value);}
export function parseBackup(text){if(text.length>BACKUP_LIMIT)throw new Error('This backup exceeds the 10 MB foundation limit.');let data;try{data=JSON.parse(text);}catch{throw new Error('This is not valid JSON. Existing work has not changed.');}if(data.format!=='weave-foundation'||data.version!==1)throw new Error('Choose a Weave Foundation backup.');return normalizeWorkspace(data.workspace);}
export function mergeBackup(current,incoming){
 current=normalizeWorkspace(current);incoming=normalizeWorkspace(incoming);const result=clone(current);
 for(const p of incoming.projects){
  const existing=result.projects.find(x=>x.id===p.id);
  if(existing&&canonical(existing)===canonical(p)){if(p.id===incoming.activeProjectId)result.activeProjectId=existing.id;continue;}
  const imported=clone(p);
  if(existing){
   const old=imported.id;imported.id=id('project');imported.name=cleanName(imported.name+' IMPORT');
   rebaseWeave(imported.working,old,imported.id);
   for(const entry of imported.weaveStudies)for(const revision of entry.revisions)rebaseWeave(revision.working,old,imported.id);
  }
  result.projects.push(imported);if(p.id===incoming.activeProjectId)result.activeProjectId=imported.id;
 }
 validateWorkspace(result);backupText(result);return result;
}

export function findWeaveRevision(project,revisionId){for(const entry of project.weaveStudies||[]){const revision=entry.revisions.find(r=>r.id===revisionId);if(revision)return {entry,revision};}return null;}
export function createWeaveStudy(project,sourceRevisionId){
 const source=findCarrierRevision(project,sourceRevisionId);if(!source)throw new Error('Choose a saved Carrier Study revision.');
 const draft=restoreCarrierStudy(project,sourceRevisionId);
 draft.working.weave={studyId:id('weave-study'),sourceName:source.entry.name,sourceContext:{sourceBoardId:project.id,sourceCarrierRevisionId:sourceRevisionId,parameterizationVersion:WEAVE_VERSIONS.parameterization,snapshot:clone(source.revision)},originLineage:[],derived:null};
 draft.working=refreshWeave(draft.working,draft.id);return draft;
}
export function saveWeaveStudy(project,name){
 name=cleanName(name);if(!name)throw new Error('Give this weave study a name.');
 if(!project.working.weave)throw new Error('Create a Weave Study first.');
 validateWeave(project.working.weave,project.working,project);
 const draft=clone(project),studyId=draft.working.weave.studyId;
 let entry=draft.weaveStudies.find(e=>e.name===name);
 if(entry&&entry.id!==studyId)throw new Error('That name belongs to another weave. Choose a different name.');
 const named=draft.weaveStudies.find(e=>e.id===studyId);
 if(named&&named.name!==name)throw new Error('Save this study using its existing name: '+named.name);
 if(!entry){entry={id:studyId,name,latestRevisionId:null,revisions:[]};draft.weaveStudies.push(entry);}
 const revision={id:id('weave-revision'),number:entry.revisions.length+1,createdAt:new Date().toISOString(),parentRevisionId:entry.latestRevisionId,weaveVersion:'weave-study-v1',working:clone(draft.working)};
 entry.revisions.push(revision);entry.latestRevisionId=revision.id;return {project:draft,entryId:entry.id,revisionId:revision.id};
}
export function restoreWeaveStudy(project,revisionId){
 const found=findWeaveRevision(project,revisionId);if(!found)throw new Error('This weave revision is missing.');
 const next=clone(project);next.working=clone(found.revision.working);return next;
}
function validateWeaveWorking(working,project){
 exactKeys(working,['boundary','sourceRevisionId','carrier','carrierSourceRevisionId','weave'],'weave working snapshot');
 validateBoundaryRecord(working.boundary);
 if(working.sourceRevisionId!==null&&!findRevision(project,working.sourceRevisionId))throw new Error('Missing weave boundary ancestry.');
 if(working.carrierSourceRevisionId!==null&&!findCarrierRevision(project,working.carrierSourceRevisionId))throw new Error('Missing weave carrier ancestry.');
 if(!working.weave)throw new Error('Missing weave snapshot.');
 validateWeave(working.weave,working,project);
}
function validateWeaveChains(project){
 unique(project.weaveStudies,'weave study');
 const names=new Set(),ids=new Set();
 if(project.working.weave!==null)validateWeaveWorking(project.working,project);
 for(const entry of project.weaveStudies){
  exactKeys(entry,['id','name','latestRevisionId','revisions'],'weave library');
  if(typeof entry.name!=='string'||!entry.name.trim()||entry.name.length>80||names.has(entry.name))throw new Error('Invalid or duplicate weave name.');
  names.add(entry.name);unique(entry.revisions,'weave revision');
  if(!entry.revisions.length)throw new Error('Empty weave revision chain.');
  entry.revisions.forEach((r,i)=>{
   exactKeys(r,['id','number','createdAt','parentRevisionId','weaveVersion','working'],'weave revision');
   if(ids.has(r.id)||r.number!==i+1||r.parentRevisionId!==(i?entry.revisions[i-1].id:null)||r.weaveVersion!=='weave-study-v1'||!Number.isFinite(Date.parse(r.createdAt))||r.working?.weave?.studyId!==entry.id)throw new Error('Invalid weave revision chain.');
   ids.add(r.id);validateWeaveWorking(r.working,project);
  });
  if(entry.latestRevisionId!==entry.revisions.at(-1).id)throw new Error('Invalid latest weave pointer.');
 }
}
