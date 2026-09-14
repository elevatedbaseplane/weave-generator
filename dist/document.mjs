import {square,validateBoundary} from './boundary.mjs';
export const SCHEMA_VERSION=2;
export const COORDINATES=Object.freeze({units:'document-units',yAxis:'up',origin:'document'});
export const clone=value=>structuredClone(value);
const id=prefix=>`${prefix}-${crypto.randomUUID()}`;
const cleanName=value=>String(value||'').trim().toUpperCase().slice(0,80);
export function createProject(name='WEAVE STUDIES') {
  return {id:id('project'),name:cleanName(name)||'WEAVE STUDIES',coordinateSystem:{...COORDINATES},working:{boundary:square(),sourceRevisionId:null},boundaries:[]};
}
export function createWorkspace() {
  const project=createProject();
  return {schemaVersion:SCHEMA_VERSION,activeProjectId:project.id,projects:[project]};
}
export const activeProject=workspace=>workspace.projects.find(p=>p.id===workspace.activeProjectId);
export function findRevision(project,revisionId) {
  for(const entry of project.boundaries) {const revision=entry.revisions.find(r=>r.id===revisionId);if(revision)return {entry,revision};}
  return null;
}
export function saveBoundary(project,name) {
  name=cleanName(name);
  if(!name) throw new Error('Give this boundary a name.');
  const boundary=validateBoundary(project.working.boundary.points),draft=clone(project);
  let entry=draft.boundaries.find(e=>e.name===name);
  if(!entry){entry={id:id('boundary'),name,latestRevisionId:null,revisions:[]};draft.boundaries.push(entry);}
  const revision={id:id('revision'),number:entry.revisions.length+1,createdAt:new Date().toISOString(),parentRevisionId:entry.latestRevisionId,geometryVersion:'boundary-v1',boundary};
  entry.revisions.push(revision);entry.latestRevisionId=revision.id;
  draft.working={boundary:clone(boundary),sourceRevisionId:revision.id};
  return {project:draft,entryId:entry.id,revisionId:revision.id};
}
export function restoreBoundary(project,revisionId) {
  const found=findRevision(project,revisionId);
  if(!found) throw new Error('This boundary revision is missing.');
  const draft=clone(project);
  draft.working={boundary:clone(found.revision.boundary),sourceRevisionId:revisionId};
  return draft;
}
const requireId=value=>{if(typeof value!=='string'||!value||value.length>120)throw new Error('Invalid document identity.');};
function unique(items,label) {
  if(!Array.isArray(items))throw new Error(`Missing ${label}.`);
  const seen=new Set();for(const item of items){requireId(item?.id);if(seen.has(item.id))throw new Error(`Duplicate ${label} identity.`);seen.add(item.id);}
}
function validateProject(project) {
  if(typeof project.name!=='string'||!project.name.trim()||project.name.length>80)throw new Error('Invalid board name.');
  if(JSON.stringify(project.coordinateSystem)!==JSON.stringify(COORDINATES)) {
    const c=project.coordinateSystem;
    if(c?.units!==COORDINATES.units||c?.yAxis!=='up'||c?.origin!=='document')throw new Error('Unsupported coordinate system; no automatic rescaling is performed.');
  }
  if(project.working?.boundary?.closed!==true)throw new Error('The working boundary must be closed.');
  validateBoundary(project.working.boundary.points);
  unique(project.boundaries,'boundary');
  const names=new Set(),revisionIds=new Set();
  for(const entry of project.boundaries) {
    if(typeof entry.name!=='string'||!entry.name.trim()||entry.name.length>80||names.has(entry.name))throw new Error('Invalid or duplicate boundary name.');
    names.add(entry.name);unique(entry.revisions,'revision');
    if(!entry.revisions.length)throw new Error('A saved boundary needs a revision.');
    for(let i=0;i<entry.revisions.length;i++) {
      const r=entry.revisions[i];
      if(revisionIds.has(r.id)||r.number!==i+1||r.parentRevisionId!==(i?entry.revisions[i-1].id:null)||r.geometryVersion!=='boundary-v1'||!Number.isFinite(Date.parse(r.createdAt))||r.boundary?.closed!==true)throw new Error('Invalid boundary revision chain.');
      validateBoundary(r.boundary.points);revisionIds.add(r.id);
    }
    if(entry.latestRevisionId!==entry.revisions.at(-1).id)throw new Error('The latest pointer must reference the newest revision.');
  }
  if(project.working.sourceRevisionId!==null&&!findRevision(project,project.working.sourceRevisionId))throw new Error('The working boundary references a missing revision.');
}
export function validateWorkspace(value) {
  if(!value||value.schemaVersion!==SCHEMA_VERSION)throw new Error('Unsupported project format. Legacy boards need a raw backup and a separate migration.');
  unique(value.projects,'project');
  if(!value.projects.length||value.projects.length>100)throw new Error('Use 1–100 boards per backup.');
  value.projects.forEach(validateProject);
  if(!activeProject(value))throw new Error('The active board is missing.');
  return value;
}
export function serializeWorkspace(value) {validateWorkspace(value);return JSON.stringify({format:'weave-foundation',version:1,workspace:value},null,2);}
export function parseBackup(text) {
  if(text.length>10*1024*1024)throw new Error('This backup exceeds the 10 MB foundation limit.');
  let data;try{data=JSON.parse(text);}catch{throw new Error('This is not valid JSON. Existing work has not changed.');}
  if(data.format!=='weave-foundation'||data.version!==1)throw new Error('Choose a Weave Foundation backup. Legacy data is not migrated automatically.');
  return clone(validateWorkspace(data.workspace));
}
export function mergeBackup(current,incoming) {
  validateWorkspace(current);validateWorkspace(incoming);
  const result=clone(current);
  for(const project of incoming.projects) {
    const existing=result.projects.find(p=>p.id===project.id);
    if(existing&&JSON.stringify(existing)===JSON.stringify(project))continue;
    const imported=clone(project);
    if(existing){imported.id=id('project');imported.name=cleanName(`${imported.name} IMPORT`);}
    result.projects.push(imported);
    if(project.id===incoming.activeProjectId)result.activeProjectId=imported.id;
  }
  if(!current.projects.some(p=>p.id===incoming.activeProjectId))result.activeProjectId=result.projects.find(p=>p.id===incoming.activeProjectId)?.id||result.activeProjectId;
  else if(JSON.stringify(current.projects.find(p=>p.id===incoming.activeProjectId))===JSON.stringify(activeProject(incoming)))result.activeProjectId=incoming.activeProjectId;
  return validateWorkspace(result);
}
