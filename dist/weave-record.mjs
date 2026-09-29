// Persistent identity for one saved weave. Later batches attach generation,
// geometry, analysis, and evaluation without replacing this identity.
import {carrierInputFingerprint,deriveCarrier} from './carrier.mjs';
import {effectiveFamilyCatalog} from './family-domain.mjs';
import {PARAMETER_DEFINITIONS,presentParameter,savedParameterDefinition} from './parameter-definitions.mjs';
import {STITCH_SOURCE} from './stitch-source.mjs';
import {deriveStitch,emptyStitchGeneration} from './stitch.mjs';
import {canonical,digest,safeDeriveCarrier} from './weave.mjs';
import {criterionDefinition,evaluationDependencyReport} from './evaluation.mjs';
export const WEAVE_RECORD_VERSION=1;
export const DEFAULT_GENERATOR_VERSION='WF-WEAVE-FIELD-RADII-SVG-20260921';

export function createWeaveIdentity(name,{now=new Date().toISOString(),generatorVersion=DEFAULT_GENERATOR_VERSION}={}){
 if(typeof name!=='string'||!name.trim())throw new Error('A weave identity needs a name.');
 return {weaveId:`weave-${crypto.randomUUID()}`,name,createdAt:now,modifiedAt:now,generatorVersion,recordVersion:WEAVE_RECORD_VERSION};
}

const plainObject=value=>!!value&&typeof value==='object'&&!Array.isArray(value);

function ensureRecordContainers(entry){
 if(entry.derivedAnalysis===undefined)entry.derivedAnalysis={};
 if(entry.evaluations===undefined)entry.evaluations=[];
 if(entry.designerData===undefined)entry.designerData={};
 if(entry.lineage===undefined)entry.lineage={};
}

export function applyNewWeaveIdentity(entry,options={}){
 const identity=createWeaveIdentity(entry.name,options);
 entry.weaveId=identity.weaveId;
 entry.createdAt=identity.createdAt;
 entry.modifiedAt=identity.modifiedAt;
 entry.generatorVersion=identity.generatorVersion;
 entry.recordVersion=identity.recordVersion;
 ensureRecordContainers(entry);
 return entry;
}

export function retainWeaveIdentity(entry,options={}){
 const now=options.now||new Date().toISOString();
 if(typeof entry.weaveId!=='string'||!entry.weaveId){
  entry.weaveId=entry.id;
  entry.createdAt=entry.revisions?.[0]?.createdAt||now;
  entry.generatorVersion=options.generatorVersion||DEFAULT_GENERATOR_VERSION;
  entry.recordVersion=WEAVE_RECORD_VERSION;
 }
 entry.modifiedAt=now;
 ensureRecordContainers(entry);
 return entry;
}

export function readWeaveIdentity(entry){
 if(!entry)return null;
 if(typeof entry.weaveId==='string'&&entry.weaveId)return {weaveId:entry.weaveId,name:entry.name,createdAt:entry.createdAt,modifiedAt:entry.modifiedAt,generatorVersion:entry.generatorVersion,recordVersion:entry.recordVersion};
 const createdAt=entry.revisions?.[0]?.createdAt||null;
 return {weaveId:entry.id,name:entry.name,createdAt,modifiedAt:entry.revisions?.at?.(-1)?.createdAt||createdAt,generatorVersion:entry.revisions?.at?.(-1)?.carrier?.generatorVersion||null,recordVersion:null};
}

export function readWeaveParent(entry){
 const parent=entry?.lineage?.parent;
 if(!parent||typeof parent.weaveId!=='string'||!parent.weaveId)return null;
 return {weaveId:parent.weaveId,revisionId:typeof parent.revisionId==='string'?parent.revisionId:''};
}
const CURATION_FLAGS=['favorite','shortlist','advance','reject'];
export function curateDesignerData(current,change={}){
 const data=plainObject(current)?structuredClone(current):{};
 if(Object.hasOwn(change,'note')){
  const note=typeof change.note==='string'?change.note.trim().slice(0,240):'';
  if(note)data.note=note;else delete data.note;
 }
 for(const flag of CURATION_FLAGS){
  if(!Object.hasOwn(change,flag))continue;
  if(change[flag]===true)data[flag]=true;else delete data[flag];
 }
 if(data.advance===true&&data.reject===true){if(change.reject===true)delete data.advance;else delete data.reject;}
 return data;
}
export function readWeaveLineage(entry){
 const identity=readWeaveIdentity(entry);
 const handoffs=Array.isArray(entry?.lineage?.handoffs)?entry.lineage.handoffs:[];
 const downstream=Array.isArray(entry?.lineage?.downstream)?entry.lineage.downstream:[];
 return {generated:identity?.createdAt||'',saved:Array.isArray(entry?.revisions)&&entry.revisions.length>0,analyzed:readAnalysisStatus(entry).statusLabel,evaluated:readEvaluationSummary(entry).statusLabel,parent:readWeaveParent(entry),handoffs,downstream};
}

export function formatWeaveCreatedDate(createdAt){
 const time=Date.parse(createdAt||'');
 if(!Number.isFinite(time))return '';
 const date=new Date(time);
 return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

export function shortWeaveId(weaveId){
 const text=String(weaveId||'');
 const body=text.startsWith('weave-')?text.slice(6):text.startsWith('carrier-study-')?text.slice('carrier-study-'.length):text;
 return body.slice(0,8).toUpperCase();
}

const pointCopy=point=>({x:point.x,y:point.y});
const familyCopy=family=>{
 const copy={spacing:family.spacing,offset:family.offset,density:family.density};
 if(Number.isFinite(family.angleDegrees))copy.angleDegrees=family.angleDegrees;
 return copy;
};

// Copied generator controls for one saved revision. Later edits to the live
// pattern must not alias this object.
export function captureGeneratorState(source){
 const carrier=source?.carrier,boundary=source?.boundary;
 if(!carrier||!boundary?.points)throw new Error('A generator snapshot needs a pattern and a boundary.');
 const stitch=carrier.kind==='stitch-recipe-v1';
 // Geometry uses no Math.random. The only stochastic input is the integer
 // strand-offset seed. Null means this save did not use that generator.
 const variation=source.weave?.generation?.variation??source.generation?.variation;
 const seed=Number.isInteger(variation?.seed)?variation.seed:Number.isInteger(source.generation?.seed)?source.generation.seed:null;
 const parameters=stitch?structuredClone(carrier.parameters):{families:Object.fromEntries(Object.entries(carrier.families).map(([name,family])=>[name,familyCopy(family)]))};
 if(!stitch&&carrier.generatorVersion==='rect-v1')parameters.angleDegrees=carrier.angleDegrees;
 if(variation?.families)parameters.variation={families:Object.fromEntries(Object.entries(variation.families).map(([name,value])=>[name,{amount:value.amount}]))};
 const settings=stitch?{origin:pointCopy(carrier.origin),recipeVersion:carrier.recipeVersion,roles:[...carrier.roles],runKeys:[...carrier.runKeys]}:{origin:pointCopy(carrier.origin),generatorVersion:carrier.generatorVersion,clipVersion:carrier.clipVersion,selectionVersion:carrier.selectionVersion};
 const modes=stitch?{kind:carrier.kind,recipeId:carrier.recipeId,constructionVersion:carrier.construction?.version??null,...(carrier.construction?.crossRowPolicy?{crossRowPolicy:carrier.construction.crossRowPolicy}:{})}:{kind:carrier.kind};
 const state={parameters,settings,modes,seed,domain:{closed:boundary.closed===true,points:boundary.points.map(pointCopy)}};
 const influences=influenceSnapshot(source.weave?.generation?.influences??source.generation?.influences);
 if(influences)state.influences=influences;
 return state;
}

function influenceSnapshot(fields){
 if(!Array.isArray(fields)||!fields.length)return null;
 return fields.map(field=>{
  const families={};
  for(const name of Object.keys(field.families||{}).sort())families[name]={strength:field.families[name].strength,tension:field.families[name].tension};
  return {id:field.id,kind:field.kind,enabled:field.enabled===true,center:pointCopy(field.center),radius:field.radius,direction:field.direction,falloff:field.falloff??3,families};
 });
}

export function applyGeneratorSnapshot(working,generation){
 validateGeneratorState(generation);
 const next=structuredClone(working);
 const carrier=next.carrier;
 if(!carrier||generation.modes.kind!==carrier.kind)throw new Error('Saved generator mode does not match this weave.');
 const stitch=carrier.kind==='stitch-recipe-v1';
 if(stitch){
  carrier.parameters=structuredClone(generation.parameters);
  if(generation.modes.recipeId)carrier.recipeId=generation.modes.recipeId;
  if(generation.settings.origin)carrier.origin=structuredClone(generation.settings.origin);
  if(generation.modes.crossRowPolicy)carrier.construction={...carrier.construction,version:generation.modes.constructionVersion??carrier.construction?.version??null,crossRowPolicy:generation.modes.crossRowPolicy};
 }else if(generation.parameters.families){
  for(const [name,family] of Object.entries(generation.parameters.families)){
   if(!carrier.families?.[name])continue;
   carrier.families[name].spacing=family.spacing;
   carrier.families[name].offset=family.offset;
   carrier.families[name].density=family.density;
   if(Number.isFinite(family.angleDegrees))carrier.families[name].angleDegrees=family.angleDegrees;else delete carrier.families[name].angleDegrees;
  }
  if(Number.isFinite(generation.parameters.angleDegrees))carrier.angleDegrees=generation.parameters.angleDegrees;
  if(generation.settings.origin)carrier.origin=structuredClone(generation.settings.origin);
  if(generation.settings.generatorVersion)carrier.generatorVersion=generation.settings.generatorVersion;
 }
 next.boundary={...next.boundary,closed:generation.domain.closed,points:generation.domain.points.map(point=>({x:point.x,y:point.y}))};
 if(Number.isInteger(generation.seed)&&next.weave?.generation?.variation){
  next.weave.generation.variation.seed=generation.seed;
  for(const [name,value] of Object.entries(generation.parameters.variation?.families||{}))if(next.weave.generation.variation.families?.[name])next.weave.generation.variation.families[name].amount=value.amount;
 }
 return next;
}

function validateInfluenceSnapshot(influences){
 if(!Array.isArray(influences)||!influences.length||influences.length>8)throw new Error('Invalid generator snapshot.');
 const seen=new Set();
 for(const field of influences){
  if(!plainObject(field))throw new Error('Invalid generator snapshot.');
  const keys=Object.keys(field);
  if(keys.length!==8||!['id','kind','enabled','center','radius','direction','falloff','families'].every(key=>Object.hasOwn(field,key)))throw new Error('Invalid generator snapshot.');
  if(typeof field.id!=='string'||!field.id||field.id.length>120||seen.has(field.id))throw new Error('Invalid generator snapshot.');
  seen.add(field.id);
  if(!['attractor','repeller','deflector'].includes(field.kind)||typeof field.enabled!=='boolean')throw new Error('Invalid generator snapshot.');
  if(!plainObject(field.center)||Object.keys(field.center).length!==2||![field.center.x,field.center.y].every(value=>Number.isFinite(value)&&Math.abs(value)<=1e9))throw new Error('Invalid generator snapshot.');
  if(!Number.isFinite(field.radius)||field.radius<=0||field.radius>1e9||!Number.isFinite(field.direction)||field.direction<-180||field.direction>180||!Number.isInteger(field.falloff)||field.falloff<1||field.falloff>5)throw new Error('Invalid generator snapshot.');
  if(!plainObject(field.families))throw new Error('Invalid generator snapshot.');
  const names=Object.keys(field.families);
  if(!names.length||names.length>8)throw new Error('Invalid generator snapshot.');
  for(const name of names){
   const value=field.families[name];
   if(typeof name!=='string'||!name||name.length>40||!plainObject(value)||Object.keys(value).length!==2)throw new Error('Invalid generator snapshot.');
   if(![value.strength,value.tension].every(item=>Number.isFinite(item)&&item>=0&&item<=100))throw new Error('Invalid generator snapshot.');
  }
 }
 return influences;
}

export function validateGeneratorState(state){
 if(!state||typeof state!=='object'||Array.isArray(state))throw new Error('Invalid generator snapshot.');
 const keys=Object.keys(state),required=['parameters','settings','modes','seed','domain'];
 if(!required.every(key=>Object.hasOwn(state,key))||keys.some(key=>!required.includes(key)&&key!=='influences'))throw new Error('Invalid generator snapshot.');
 if(state.seed!==null&&!Number.isInteger(state.seed))throw new Error('Invalid generator seed.');
 if(!state.parameters||typeof state.parameters!=='object'||!state.settings||typeof state.settings!=='object'||!state.modes||typeof state.modes.kind!=='string')throw new Error('Invalid generator snapshot.');
 if(typeof state.domain?.closed!=='boolean'||!Array.isArray(state.domain.points)||!state.domain.points.length)throw new Error('Invalid generator domain.');
 for(const point of state.domain.points)if(!Number.isFinite(point?.x)||!Number.isFinite(point?.y))throw new Error('Invalid generator domain.');
 if(Object.hasOwn(state,'influences'))validateInfluenceSnapshot(state.influences);
}

// Points at the geometry already stored for this revision. The carrier and
// boundary remain the source model. A certified result adds its fingerprint.
// Analysis geometry is the boundary plus centerlines. Display width, outlines,
// and over/under masks are not part of this fingerprint.
export const ANALYSIS_GEOMETRY_VERSION='analysis-geometry-v1';

function analysisPoints(points){
 return (points||[]).map(point=>({x:point.x,y:point.y}));
}

function centerlineSnapshot(boundary,strands){
 return {version:ANALYSIS_GEOMETRY_VERSION,boundary:analysisPoints(boundary.points),strands:[...strands].sort((a,b)=>a.strandId.localeCompare(b.strandId))};
}

function certifiedCenterlineStrands(derived){
 return derived.strands.map(strand=>({strandId:typeof strand.strandId==='string'&&strand.strandId?strand.strandId:canonical(strand.identity),fragments:(strand.fragments||[]).map(fragment=>({points:analysisPoints(fragment.points||[fragment.start,fragment.end])}))}));
}

function sourceCenterlineStrands(boardId,revision){
 const carrier=revision.carrier;
 if(carrier.kind===STITCH_SOURCE){
  const derived=deriveStitch(revision.boundary,carrier,boardId,{sourceBoardId:boardId,sourceCarrierRevisionId:revision.id||'analysis-geometry'},emptyStitchGeneration(carrier));
  return certifiedCenterlineStrands(derived);
 }
 const source=safeDeriveCarrier(revision.boundary,carrier,boardId);
 return source.paths.filter(path=>path.selected!==false).map(path=>({strandId:path.id||`${boardId}:${carrier.id}:${path.family}:${path.k}`,fragments:(path.intervals||[]).map(interval=>({points:analysisPoints([interval.start,interval.end])}))}));
}

export function captureGeometryRef(boardId,revision,derived){
 if(typeof boardId!=='string'||!boardId)throw new Error('Analysis geometry needs the board.');
 const carrierFingerprint=carrierInputFingerprint(revision.boundary,revision.carrier);
 const certified=derived?.complete===true&&typeof derived.contentFingerprint==='string'&&derived.carrierFingerprint===carrierFingerprint;
 const pinned=derivedBelongsToRevision(boardId,revision,derived);
 const strands=pinned?certifiedCenterlineStrands(derived):sourceCenterlineStrands(boardId,revision);
 return {revisionId:revision.id,carrierFingerprint,contentFingerprint:certified?derived.contentFingerprint:null,geometryVersion:ANALYSIS_GEOMETRY_VERSION,geometryFingerprint:digest(centerlineSnapshot(revision.boundary,strands)),artifactId:pinned?digest(derived):null};
}

function pinnedDerived(project,artifactId){
 const found=[];
 const consider=derived=>{if(derived?.strands&&digest(derived)===artifactId)found.push(derived);};
 consider(project?.working?.weave?.derived);
 for(const study of project?.weaveStudies||[])for(const revision of study.revisions||[])consider(revision.working?.weave?.derived);
 return found[0]||null;
}

// Reads the pinned centerline field. A missing certified result is not replaced
// with a new generator run.
export function resolveAnalysisGeometry(project,revision){
 const ref=revision?.geometryRef;
 if(!ref||ref.geometryVersion!==ANALYSIS_GEOMETRY_VERSION||typeof ref.geometryFingerprint!=='string')throw new Error('This weave has no pinned analysis geometry.');
 let strands;
 if(ref.artifactId){
  const derived=pinnedDerived(project,ref.artifactId);
  if(!derived)throw new Error('The saved analysis geometry is missing. It was not regenerated.');
  strands=certifiedCenterlineStrands(derived);
 }else strands=sourceCenterlineStrands(project.id,revision);
 const snapshot=centerlineSnapshot(revision.boundary,strands);
 if(digest(snapshot)!==ref.geometryFingerprint)throw new Error('The saved analysis geometry does not match its fingerprint.');
 return snapshot;
}

// Association only. Certified strandId values stay in their existing form.
export const STRAND_IDENTITY_VERSION='strand-identity-v1';

function familyKeyOf(strand){
 return strand?.family||strand?.identity?.roleId||null;
}

function derivedBelongsToRevision(boardId,revision,derived){
 if(!derived?.complete||!Array.isArray(derived.strands)||derived.payloadId)return false;
 const carrierId=revision.carrier.id;
 const keys=new Set(effectiveFamilyCatalog(revision.carrier,revision.familyCatalog).entries.map(entry=>entry.key));
 if(derived.strands.some(strand=>!keys.has(familyKeyOf(strand))))return false;
 if(revision.carrier.kind!==STITCH_SOURCE&&derived.carrierFingerprint!==carrierInputFingerprint(revision.boundary,revision.carrier))return false;
 if(!derived.strands.length)return revision.carrier.kind===STITCH_SOURCE?derived.dictionary?.pattern===carrierId:true;
 return derived.strands.every(strand=>{
  const key=familyKeyOf(strand);
  if(typeof strand.strandId==='string'&&strand.strandId)return strand.pathKey?.boardId===boardId&&strand.pathKey?.carrierId===carrierId&&strand.pathKey?.family===key&&strand.pathKey?.k===strand.k;
  return strand.identity?.patternId===carrierId&&strand.identity?.roleId===key;
 });
}

function certifiedStrandRows(derived){
 return derived.strands.map(strand=>({
  strandId:typeof strand.strandId==='string'&&strand.strandId?strand.strandId:canonical(strand.identity),
  familyKey:familyKeyOf(strand)
 }));
}

function sourceStrandRows(boardId,revision){
 const carrier=revision.carrier;
 if(carrier.kind===STITCH_SOURCE){
  const derived=deriveStitch(revision.boundary,carrier,boardId,{sourceBoardId:boardId,sourceCarrierRevisionId:revision.id||'strand-identity'},emptyStitchGeneration(carrier));
  return derived.strands.map(strand=>({strandId:canonical(strand.identity),familyKey:strand.identity.roleId}));
 }
 const source=safeDeriveCarrier(revision.boundary,carrier,boardId);
 return source.paths.filter(path=>path.selected!==false).map(path=>{
  const key=familyKeyOf(path);
  return {strandId:path.id||`${boardId}:${carrier.id}:${key}:${path.k}`,familyKey:key};
 });
}

function rectangularStrandId(strandId,carrierId,familyKey){
 const marker=`:${carrierId}:${familyKey}:`;
 const at=strandId.lastIndexOf(marker);
 if(at<1)return false;
 const prefix=strandId.slice(0,at),k=strandId.slice(at+marker.length);
 return prefix.length>0&&!prefix.includes(':')&&/^-?\d+$/.test(k);
}

function stitchStrandId(strandId,carrierId,familyKey){
 let identity;
 try{identity=JSON.parse(strandId);}catch{return false;}
 return !!identity&&identity.patternId===carrierId&&identity.roleId===familyKey&&Number.isInteger(identity.row)&&Number.isInteger(identity.column)&&typeof identity.runKey==='string';
}

export function validateStrandIdentity(revision){
 const identity=revision?.strandIdentity;
 if(!identity||identity.version!==STRAND_IDENTITY_VERSION||!Array.isArray(identity.families)||!Array.isArray(identity.strands))throw new Error('Invalid strand identity.');
 const catalog=effectiveFamilyCatalog(revision.carrier,revision.familyCatalog);
 if(identity.families.length!==catalog.entries.length)throw new Error('Invalid strand identity.');
 const byId=new Map(),seenFamilies=new Set();
 for(const family of identity.families){
  if(!family||typeof family.familyId!=='string'||!family.familyId||typeof family.key!=='string'||!Number.isInteger(family.retainedStrandCount)||family.retainedStrandCount<0)throw new Error('Invalid strand identity.');
  const entry=catalog.entries.find(item=>item.id===family.familyId&&item.key===family.key);
  if(!entry||seenFamilies.has(family.familyId))throw new Error('Invalid strand identity.');
  seenFamilies.add(family.familyId);
  byId.set(family.familyId,{...family,count:0});
 }
 const stitch=revision.carrier.kind===STITCH_SOURCE,seenStrands=new Set();
 for(const strand of identity.strands){
  if(!strand||typeof strand.strandId!=='string'||!strand.strandId||strand.strandId.length>500||seenStrands.has(strand.strandId))throw new Error('Invalid strand identity.');
  const family=byId.get(strand.familyId);
  if(!family)throw new Error('Invalid strand identity.');
  const shaped=stitch?stitchStrandId(strand.strandId,revision.carrier.id,family.key):rectangularStrandId(strand.strandId,revision.carrier.id,family.key);
  if(!shaped)throw new Error('Invalid strand identity.');
  seenStrands.add(strand.strandId);
  family.count+=1;
 }
 for(const family of byId.values())if(family.count!==family.retainedStrandCount)throw new Error('Invalid strand identity.');
 return identity;
}

export function captureStrandIdentity(boardId,revision,derived){
 if(typeof boardId!=='string'||!boardId)throw new Error('A saved strand identity needs the board.');
 if(!revision?.carrier||!revision.boundary)throw new Error('A saved strand identity needs the saved pattern.');
 const catalog=effectiveFamilyCatalog(revision.carrier,revision.familyCatalog);
 const byKey=new Map(catalog.entries.map(entry=>[entry.key,entry.id]));
 const rows=derivedBelongsToRevision(boardId,revision,derived)?certifiedStrandRows(derived):sourceStrandRows(boardId,revision);
 const counts=new Map(catalog.entries.map(entry=>[entry.id,0]));
 const strands=[];
 const seen=new Set();
 for(const row of rows){
  const familyId=byKey.get(row.familyKey);
  if(!familyId)throw new Error('A saved strand does not resolve to a family.');
  if(!row.strandId||seen.has(row.strandId))throw new Error('A saved strand needs a stable identity.');
  seen.add(row.strandId);
  counts.set(familyId,counts.get(familyId)+1);
  strands.push({strandId:row.strandId,familyId});
 }
 strands.sort((a,b)=>a.strandId.localeCompare(b.strandId));
 const families=catalog.entries.map(entry=>({familyId:entry.id,key:entry.key,retainedStrandCount:counts.get(entry.id)})).sort((a,b)=>a.familyId.localeCompare(b.familyId)||a.key.localeCompare(b.key));
 const identity={version:STRAND_IDENTITY_VERSION,families,strands};
 return validateStrandIdentity({...revision,strandIdentity:identity});
}

export function resolveSavedStrand(revision,strandId){
 const identity=revision?.strandIdentity;
 if(!identity||typeof strandId!=='string')return null;
 const strand=identity.strands.find(item=>item.strandId===strandId);
 if(!strand)return null;
 const family=identity.families.find(item=>item.familyId===strand.familyId);
 if(!family)return null;
 return {strandId:strand.strandId,familyId:family.familyId,key:family.key,retainedStrandCount:family.retainedStrandCount};
}

function sourceLines(derived){
 return derived.paths.filter(path=>path.selected!==false).map(path=>({family:path.family,k:path.k,intervals:(path.intervals||[]).map(interval=>({start:{x:interval.start.x,y:interval.start.y},end:{x:interval.end.x,y:interval.end.y}}))}));
}

function carrierFromGeneratorState(generation){
 if(generation.modes.kind!=='rectangular')return null;
 const carrier={id:'regenerated-carrier',kind:'rectangular',generatorVersion:generation.settings.generatorVersion,clipVersion:generation.settings.clipVersion,selectionVersion:generation.settings.selectionVersion,origin:{x:generation.settings.origin.x,y:generation.settings.origin.y},families:structuredClone(generation.parameters.families)};
 if(generation.settings.generatorVersion==='rect-v1')carrier.angleDegrees=generation.parameters.angleDegrees;
 return carrier;
}

const FAMILY_FIELDS=['spacing','offset','density','angleDegrees'];
const RECT_PARAMETER_KEYS=['families','angleDegrees','variation'];
const RECT_SETTINGS=['origin','generatorVersion','clipVersion','selectionVersion'];
const STITCH_SETTINGS=['origin','recipeVersion','roles','runKeys'];
const MODE_KEYS=['kind','recipeId','constructionVersion','crossRowPolicy'];
const KNOWN_RECT_GENERATORS=['rect-v1','rect-v2'];
const notice=(label,name)=>({label,name});

// Reads an old or partial generator snapshot without throwing. Complete
// snapshots return no notices. The stored carrier is left untouched.
export function inspectGeneratorRecord(revision){
 const notices=[],generation=revision?.generation;
 if(generation===undefined||!generation||typeof generation!=='object'||Array.isArray(generation))return {notices:[notice('Unavailable','GENERATOR SNAPSHOT')],applicable:false};
 for(const key of ['parameters','settings','modes','seed','domain'])if(!Object.hasOwn(generation,key))notices.push(notice('Missing',key.toUpperCase()));
 for(const key of Object.keys(generation))if(!['parameters','settings','modes','seed','domain','influences'].includes(key))notices.push(notice('Legacy Parameter',key.toUpperCase()));
 if(generation.influences!==undefined){try{validateInfluenceSnapshot(generation.influences);}catch{notices.push(notice('Unavailable','INFLUENCES'));}}
 if(!['parameters','settings','modes','seed','domain'].every(key=>Object.hasOwn(generation,key)))return {notices,applicable:false};
 if(generation.seed!==null&&!Number.isInteger(generation.seed))notices.push(notice('Unavailable','SEED'));
 const parameters=generation.parameters,modes=generation.modes,settings=generation.settings,stitch=modes?.kind==='stitch-recipe-v1';
 if(!parameters||typeof parameters!=='object'||Array.isArray(parameters))notices.push(notice('Unavailable','PARAMETERS'));
 else if(stitch){if(!Object.keys(parameters).length)notices.push(notice('Missing','STITCH PARAMETERS'));}
 else if(modes?.kind==='rectangular'){
  for(const key of Object.keys(parameters))if(!RECT_PARAMETER_KEYS.includes(key))notices.push(notice('Legacy Parameter',key.toUpperCase()));
  const families=parameters.families;
  if(!families||typeof families!=='object'||Array.isArray(families))notices.push(notice('Missing','FAMILIES'));
  else for(const [name,family] of Object.entries(families)){
   if(!family||typeof family!=='object'||Array.isArray(family)){notices.push(notice('Unavailable',`FAMILY ${name}`));continue;}
   for(const field of ['spacing','offset','density'])if(!Number.isFinite(family[field]))notices.push(notice('Missing',`${name} ${field.toUpperCase()}`));
   if(settings?.generatorVersion==='rect-v2'&&!Number.isFinite(family.angleDegrees))notices.push(notice('Missing',`${name} ROTATION`));
   for(const key of Object.keys(family))if(!FAMILY_FIELDS.includes(key))notices.push(notice('Legacy Parameter',`${name} ${key.toUpperCase()}`));
  }
  if(parameters.variation&&typeof parameters.variation==='object'&&!Array.isArray(parameters.variation))for(const key of Object.keys(parameters.variation))if(key!=='families')notices.push(notice('Legacy Parameter',`VARIATION ${key.toUpperCase()}`));
 }
 if(!settings||typeof settings!=='object'||Array.isArray(settings))notices.push(notice('Unavailable','SETTINGS'));
 else{
  for(const key of Object.keys(settings))if(!(stitch?STITCH_SETTINGS:RECT_SETTINGS).includes(key))notices.push(notice('Legacy Parameter',key.toUpperCase()));
  if(!Number.isFinite(settings.origin?.x)||!Number.isFinite(settings.origin?.y))notices.push(notice('Missing','ORIGIN'));
  if(!stitch&&!settings.generatorVersion)notices.push(notice('Missing','GENERATOR VERSION'));
  else if(!stitch&&!KNOWN_RECT_GENERATORS.includes(settings.generatorVersion))notices.push(notice('Unavailable','GENERATOR VERSION'));
  if(!stitch&&settings.clipVersion===undefined)notices.push(notice('Missing','CLIP VERSION'));
  if(!stitch&&settings.selectionVersion===undefined)notices.push(notice('Missing','SELECTION VERSION'));
  if(stitch&&settings.recipeVersion===undefined)notices.push(notice('Missing','RECIPE VERSION'));
 }
 if(!modes||typeof modes!=='object'||Array.isArray(modes)||typeof modes.kind!=='string'||!['rectangular','stitch-recipe-v1'].includes(modes.kind))notices.push(notice('Unavailable','MODE'));
 else for(const key of Object.keys(modes))if(!MODE_KEYS.includes(key))notices.push(notice('Legacy Parameter',key.toUpperCase()));
 const domain=generation.domain;
 if(!domain||typeof domain.closed!=='boolean'||!Array.isArray(domain.points)||!domain.points.length||domain.points.some(point=>!Number.isFinite(point?.x)||!Number.isFinite(point?.y)))notices.push(notice('Unavailable','DOMAIN'));
 return {notices,applicable:notices.length===0};
}

export function generatorRecordNote(revision){
 const {notices}=inspectGeneratorRecord(revision);
 return notices.map(item=>`${item.label.toUpperCase()} · ${item.name}`).join(' · ');
}

const GENERATION_LABELS={spacing:'SPACING',offset:'OFFSET',density:'DENSITY',angleDegrees:'ROTATION',amount:'AMOUNT',seed:'SEED',kind:'MODE',generatorVersion:'GENERATOR RECIPE',recipeVersion:'RECIPE VERSION',origin:'ORIGIN',clipVersion:'CLIP VERSION',selectionVersion:'SELECTION VERSION'};

function generationValue(value){
 if(typeof value==='number')return Number.isFinite(value)?String(Number.isInteger(value)?value:Math.round(value*1e6)/1e6):'';
 if(typeof value==='boolean')return value?'ON':'OFF';
 if(typeof value==='string')return value;
 if(value&&typeof value==='object'&&Number.isFinite(value.x)&&Number.isFinite(value.y))return `${value.x}, ${value.y}`;
 return '';
}

function pushParameter(rows,key,value,scope,registry){
 const definition=savedParameterDefinition(key,registry);
 if(!definition)return false;
 const row=presentParameter(definition,value,scope);
 if(row.value==='')return true;
 rows.push(row);
 return true;
}

// Rows for the saved snapshot. Known controls take their label, range, and
// presentation from the shared parameter registry. The values stay read-only.
export function listSavedGenerationSettings(revision,registry=PARAMETER_DEFINITIONS){
 const generation=revision?.generation,note=generatorRecordNote(revision),rows=[],groups=[];
 if(!generation||typeof generation!=='object'||Array.isArray(generation))return {rows,note,groups};
 const push=(label,value)=>{const text=generationValue(value);if(text!=='')rows.push({label,value:text});};
 const parameters=generation.parameters;
 if(parameters&&typeof parameters==='object'&&!Array.isArray(parameters)){
  if(parameters.families&&typeof parameters.families==='object'&&!Array.isArray(parameters.families))for(const [name,family] of Object.entries(parameters.families))if(family&&typeof family==='object'&&!Array.isArray(family))for(const [key,value] of Object.entries(family))if(!pushParameter(rows,key,value,name,registry))push(`${name} ${GENERATION_LABELS[key]||String(key).toUpperCase()}`,value);
  for(const [key,value] of Object.entries(parameters)){
   if(key==='families'||key==='variation')continue;
   if(value&&typeof value==='object'&&!Array.isArray(value)){for(const [child,childValue] of Object.entries(value))if(!pushParameter(rows,child,childValue,String(key).toUpperCase(),registry))push(`${String(key).toUpperCase()} ${GENERATION_LABELS[child]||String(child).toUpperCase()}`,childValue);}
   else if(Array.isArray(value))push(GENERATION_LABELS[key]||String(key).toUpperCase(),value.map(generationValue).filter(Boolean).join(', '));
   else if(!pushParameter(rows,key,value,'',registry))push(GENERATION_LABELS[key]||String(key).toUpperCase(),value);
  }
  const variation=parameters.variation?.families;
  if(variation&&typeof variation==='object'&&!Array.isArray(variation))for(const [name,value] of Object.entries(variation))if(!pushParameter(rows,'amount',value?.amount,name,registry))push(`${name} VARIATION`,value?.amount);
 }
 const seedDefinition=savedParameterDefinition('seed',registry);
 if(generation.seed===null)rows.push({label:seedDefinition?.label||'SEED',value:'NONE',parameterId:seedDefinition?.id,type:seedDefinition?.type||'integer',control:'number',readOnly:true});
 else if(!pushParameter(rows,'seed',generation.seed,'',registry))push('SEED',generation.seed);
 if(typeof generation.modes?.kind==='string')push('MODE',generation.modes.kind);
 const settings=generation.settings;
 if(settings&&typeof settings==='object'&&!Array.isArray(settings))for(const [key,value] of Object.entries(settings)){
  if(Array.isArray(value))push(GENERATION_LABELS[key]||String(key).toUpperCase(),value.map(generationValue).filter(Boolean).join(', '));
  else push(GENERATION_LABELS[key]||String(key).toUpperCase(),value);
 }
 if(Array.isArray(generation.influences))generation.influences.forEach((field,index)=>{
  const title=`INFLUENCE ${index+1}`,groupRows=[];
  for(const [key,value] of [['kind',field.kind],['enabled',field.enabled],['radius',field.radius],['direction',field.direction],['falloff',field.falloff],['centerX',field.center?.x],['centerY',field.center?.y]])pushParameter(groupRows,key,value,'',registry);
  for(const [name,value] of Object.entries(field.families||{})){pushParameter(groupRows,'strength',value?.strength,name,registry);pushParameter(groupRows,'tension',value?.tension,name,registry);}
  groups.push({title,rows:groupRows});
 });
 return {rows,note,groups};
}

// Developer check only. Compares lines rebuilt from the saved settings and seed
// with the lines already stored for this revision. A miss keeps the stored
// geometry; this function does not write it back.
export function compareRegeneratedGeometry(revision){
 if(!revision?.generation)return {status:'preserved',sourceMatch:false,certifiedMatch:null,reason:'This record has no generator snapshot. Stored geometry is preserved.',savedCarrierFingerprint:revision?.geometryRef?.carrierFingerprint??null,regeneratedCarrierFingerprint:null};
 const inspection=inspectGeneratorRecord(revision);
 if(!inspection.applicable)return {status:'preserved',sourceMatch:false,certifiedMatch:null,reason:`${generatorRecordNote(revision)}. Stored geometry is preserved.`,savedCarrierFingerprint:revision?.geometryRef?.carrierFingerprint??null,regeneratedCarrierFingerprint:null};
 validateGeneratorState(revision.generation);
 const savedCarrierFingerprint=revision.geometryRef?.carrierFingerprint??null,certified=typeof revision.geometryRef?.contentFingerprint==='string';
 const boundary={closed:revision.generation.domain.closed,points:revision.generation.domain.points.map(point=>({x:point.x,y:point.y}))};
 const rebuilt=carrierFromGeneratorState(revision.generation);
 if(!rebuilt)return {status:'preserved',sourceMatch:false,certifiedMatch:certified?false:null,reason:'This generator mode is not rebuilt from the saved settings. Stitch construction stays on the stored pattern, so that geometry is preserved.',savedCarrierFingerprint,regeneratedCarrierFingerprint:null};
 let regenerated,saved;
 try{regenerated=deriveCarrier(boundary,rebuilt,'regeneration');saved=deriveCarrier(structuredClone(revision.boundary),structuredClone(revision.carrier),'saved-geometry');}
 catch(error){return {status:'preserved',sourceMatch:false,certifiedMatch:certified?false:null,reason:`Regeneration did not run (${error.message}). Stored geometry is preserved.`,savedCarrierFingerprint,regeneratedCarrierFingerprint:null};}
 const sourceMatch=JSON.stringify(sourceLines(saved))===JSON.stringify(sourceLines(regenerated));
 const fingerprintMatch=regenerated.inputFingerprint===saved.inputFingerprint;
 if(!sourceMatch||!fingerprintMatch)return {status:'preserved',sourceMatch:false,certifiedMatch:certified?false:null,reason:'Saved settings did not reproduce the stored source lines. Stored geometry is preserved.',savedCarrierFingerprint:saved.inputFingerprint,regeneratedCarrierFingerprint:regenerated.inputFingerprint};
 if(certified)return {status:'preserved',sourceMatch:true,certifiedMatch:false,reason:'Source lines match the saved settings. The certified field result also depends on influences, which are not part of this snapshot, so that stored result is preserved.',savedCarrierFingerprint:saved.inputFingerprint,regeneratedCarrierFingerprint:regenerated.inputFingerprint};
 const seedNote=revision.generation.seed===null?'This record has no strand-offset seed.':'The strand-offset seed is stored and does not move these source lines by itself.';
 return {status:'match',sourceMatch:true,certifiedMatch:null,reason:`Saved settings reproduce the same source lines. ${seedNote}`,savedCarrierFingerprint:saved.inputFingerprint,regeneratedCarrierFingerprint:regenerated.inputFingerprint};
}

function evaluationRevision(entry){
 const revisions=entry?.revisions;
 if(!Array.isArray(revisions)||!revisions.length)return null;
 return revisions.find(revision=>revision.id===entry.generatorRevisionId)||revisions.at(-1);
}

// Regeneration is a diagnostic. Evaluation keeps using the pinned geometry.
export function separateStoredGeometry(project,revision){
 const saved=canonical(revision);
 const compared=compareRegeneratedGeometry(revision);
 if(canonical(revision)!==saved)throw new Error('Regeneration changed the stored weave.');
 let stored=null,unavailable=null;
 try{stored=resolveAnalysisGeometry(project,revision);}
 catch(error){unavailable=error.message;}
 return {
  evaluationTarget:stored?'stored':'unavailable',
  mismatch:compared.sourceMatch===false||compared.certifiedMatch===false,
  storedRecoverable:stored!==null,
  geometryVersion:revision?.geometryRef?.geometryVersion??null,
  geometryFingerprint:revision?.geometryRef?.geometryFingerprint??null,
  reason:compared.reason,
  unavailable
 };
}

export function readEvaluationProvenance(entry,revision=evaluationRevision(entry)){
 const identity=readWeaveIdentity(entry);
 return {
  weaveId:identity?.weaveId??null,
  familyIds:(revision?.strandIdentity?.families||[]).map(family=>family.familyId),
  strandIds:(revision?.strandIdentity?.strands||[]).map(strand=>strand.strandId),
  boundary:revision?.boundary?.points?.map(point=>({x:point.x,y:point.y}))??null,
  geometryVersion:revision?.geometryRef?.geometryVersion??null,
  geometryFingerprint:revision?.geometryRef?.geometryFingerprint??null,
  seed:revision?.generation&&Object.hasOwn(revision.generation,'seed')?revision.generation.seed:null,
  generatorVersion:identity?.generatorVersion??null
 };
}

function geometryAvailable(project,revision){
 try{resolveAnalysisGeometry(project,revision);return true;}catch{return false;}
}
function identityAvailable(revision){
 try{validateStrandIdentity(revision);return true;}catch{return false;}
}
function certifiedPin(revision){
 const ref=revision?.geometryRef;
 return typeof ref?.artifactId==='string'||typeof ref?.contentFingerprint==='string';
}
function geometryCanMigrate(project,revision){
 if(!revision?.boundary||!revision.carrier)return null;
 if(geometryAvailable(project,revision)||certifiedPin(revision)||revision.geometryRef?.geometryVersion===ANALYSIS_GEOMETRY_VERSION)return null;
 try{return captureGeometryRef(project.id,revision,null);}catch{return null;}
}
function identityCanMigrate(project,revision){
 if(!revision?.boundary||!revision.carrier||identityAvailable(revision)||revision.strandIdentity||certifiedPin(revision))return null;
 try{return captureStrandIdentity(project.id,revision,null);}catch{return null;}
}

// A legacy record is ready only when its stored geometry and family identity
// both resolve. Missing provenance is filled only from that stored source.
export function evaluationReadinessReport(project,entry){
 const revision=evaluationRevision(entry);
 if(!revision)return {readiness:'legacyPartial',reasons:['This record has no saved revision.']};
 const geometry=geometryAvailable(project,revision),identity=identityAvailable(revision);
 if(geometry&&identity)return {readiness:'ready',reasons:[]};
 const reasons=[];
 if(!geometry)reasons.push(revision.geometryRef?.geometryVersion?'The saved analysis geometry does not resolve.':'This record has no pinned analysis geometry.');
 if(!identity)reasons.push(revision.strandIdentity?'Saved family and strand identity does not resolve.':'This record has no family and strand identity.');
 const geometryRemains=!geometry&&!geometryCanMigrate(project,revision);
 const identityRemains=!identity&&!identityCanMigrate(project,revision);
 if(!geometryRemains&&!identityRemains)return {readiness:'needsMigration',reasons};
 if(geometryRemains&&!identityRemains&&identity)return {readiness:'missingGeometry',reasons};
 if(identityRemains&&!geometryRemains&&geometry)return {readiness:'missingFamilyIdentity',reasons};
 return {readiness:'legacyPartial',reasons};
}

export function migrateEvaluationProvenance(project,entry){
 const report=evaluationReadinessReport(project,entry);
 if(report.readiness!=='needsMigration')return {report,entry};
 const revision=evaluationRevision(entry);
 const geometry=geometryCanMigrate(project,revision),identity=identityCanMigrate(project,revision);
 const next=structuredClone(entry),target=evaluationRevision(next);
 if(geometry)target.geometryRef=geometry;
 if(identity)target.strandIdentity=identity;
 const after=evaluationReadinessReport(project,next);
 if(after.readiness!=='ready')return {report,entry};
 return {report:after,entry:next};
}

export function validateGeometryRef(revision){
 const ref=revision.geometryRef;
 if(!ref||typeof ref!=='object'||Array.isArray(ref))throw new Error('Invalid geometry reference.');
 const keys=Object.keys(ref);
 const legacy=keys.length===3&&['revisionId','carrierFingerprint','contentFingerprint'].every(key=>Object.hasOwn(ref,key));
 const pinned=keys.length===6&&['revisionId','carrierFingerprint','contentFingerprint','geometryVersion','geometryFingerprint','artifactId'].every(key=>Object.hasOwn(ref,key));
 if(!legacy&&!pinned)throw new Error('Invalid geometry reference.');
 if(ref.revisionId!==revision.id||typeof ref.carrierFingerprint!=='string'||!ref.carrierFingerprint)throw new Error('Invalid geometry reference.');
 if(ref.contentFingerprint!==null&&(typeof ref.contentFingerprint!=='string'||!ref.contentFingerprint))throw new Error('Invalid geometry reference.');
 if(pinned){
  if(ref.geometryVersion!==ANALYSIS_GEOMETRY_VERSION||typeof ref.geometryFingerprint!=='string'||!ref.geometryFingerprint)throw new Error('Invalid geometry reference.');
  if(ref.artifactId!==null&&(typeof ref.artifactId!=='string'||!ref.artifactId))throw new Error('Invalid geometry reference.');
 }
 if(carrierInputFingerprint(revision.boundary,revision.carrier)!==ref.carrierFingerprint)throw new Error('Geometry reference does not match this weave.');
}

const EVALUATION_STATUS_LABELS={
 'not-evaluated':'NOT EVALUATED',
 evaluating:'EVALUATING',
 evaluated:'EVALUATED',
 'needs-reevaluation':'NEEDS REEVALUATION',
 'evaluation-failed':'EVALUATION FAILED',
 'not-applicable':'NOT APPLICABLE',
 partial:'PARTIAL / INCOMPLETE EVIDENCE'
};
const EVALUATION_STATUS_ORDER=['not-evaluated','evaluating','evaluated','needs-reevaluation','evaluation-failed','not-applicable','partial'];

function latestStoredEvaluation(entry){
 const list=entry?.evaluations;
 if(!Array.isArray(list)||!list.length)return null;
 const latest=list.at(-1);
 return plainObject(latest)?latest:null;
}

function storedEvaluationStatus(value){
 const key=String(value??'').trim().toLowerCase().replace(/[\s_]+/g,'-');
 if(key==='failed')return 'evaluation-failed';
 return Object.hasOwn(EVALUATION_STATUS_LABELS,key)?key:null;
}

// Reads the latest stored evaluation only. A missing result stays unevaluated
// and has no score; it is never treated as zero.
export function readEvaluationSummary(entry){
 const latest=latestStoredEvaluation(entry);
 const explicit=storedEvaluationStatus(latest?.status);
 let status=explicit||(latest?'evaluated':'not-evaluated');
 if(evaluationDependencyReport(entry).stale)status='needs-reevaluation';
 const score=Number.isFinite(latest?.overallScore)?latest.overallScore:null;
 return {status,statusLabel:EVALUATION_STATUS_LABELS[status],score};
}
export function readCriterionProvenance(entry){
 const latest=[...entry?.evaluations||[]].reverse().find(item=>item?.version===EVALUATION_RUN_VERSION)||null;
 const run=(entry?.derivedAnalysis?.runs||[]).find(item=>item.analysisRunId===latest?.analysisRunId)||null;
 const revision=(entry?.revisions||[]).find(item=>item.geometryRef?.geometryFingerprint===run?.geometryFingerprint)||null;
 const identity=readWeaveIdentity(entry);
 const analysisModules={};
 for(const key of ['sampling','tolerance','subset','presence','directional','rhythmic','modulation','events','interstitial'])if(typeof latest?.versions?.[key]==='string')analysisModules[key]=latest.versions[key];
 return CRITERION_IDS.map(id=>{
  const result=latest?.criterionResults?.[id];
  return {criterionId:id,evaluationId:latest?.evaluationId??null,createdAt:latest?.createdAt??null,generatorVersion:identity?.generatorVersion??null,recordVersion:entry?.recordVersion??null,geometryVersion:revision?.geometryRef?.geometryVersion??null,geometryFingerprint:run?.geometryFingerprint??null,analysisRunId:latest?.analysisRunId??null,criterionLogicVersion:result?.criterionLogicVersion??latest?.versions?.[`${id}-logic`]??null,calibrationVersion:result?.calibrationVersion??latest?.versions?.[`${id}-calibration`]??null,analysisModules};
 });
}
export function readEvaluationHistory(entry){
 const runs=(entry?.evaluations||[]).filter(item=>item?.version===EVALUATION_RUN_VERSION);
 return runs.map((run,index)=>({evaluationId:run.evaluationId,createdAt:run.createdAt,status:run.status,analysisRunId:run.analysisRunId,ratings:Object.fromEntries(CRITERION_IDS.map(id=>[id,Number.isFinite(run.criterionResults?.[id]?.rating)?run.criterionResults[id].rating:null])),logicVersions:Object.fromEntries(CRITERION_IDS.map(id=>[id,run.versions?.[`${id}-logic`]||run.criterionResults?.[id]?.criterionLogicVersion||null])),calibrationVersions:Object.fromEntries(CRITERION_IDS.map(id=>[id,run.versions?.[`${id}-calibration`]||run.criterionResults?.[id]?.calibrationVersion||null])),current:index===runs.length-1,superseded:index!==runs.length-1,supersession:index===runs.length-1?null:`Superseded by ${runs[index+1].evaluationId}.`}));
}
export function readAnalysisHistory(entry){
 const runs=(entry?.derivedAnalysis?.runs||[]).filter(plainObject);
 const latest=new Map();
 runs.forEach((run,index)=>latest.set(`${run.geometryFingerprint}|${run.outputs?.config?.subset||'FULL'}`,index));
 return runs.map((run,index)=>{const key=`${run.geometryFingerprint}|${run.outputs?.config?.subset||'FULL'}`;return {analysisRunId:run.analysisRunId,geometryFingerprint:run.geometryFingerprint,status:run.status,subset:run.outputs?.config?.subset||null,moduleVersions:run.moduleVersions||{},current:latest.get(key)===index,superseded:latest.get(key)!==index};});
}

function libraryRevision(entry){
 const revisions=entry?.revisions;
 if(!Array.isArray(revisions)||!revisions.length)return null;
 return revisions.find(item=>item.id===entry.generatorRevisionId)||revisions.at(-1);
}
function boundNumber(value){
 if(value===''||value===null||value===undefined)return null;
 const number=Number(value);
 return Number.isFinite(number)?number:null;
}
function inRange(value,min,max){
 if(!Number.isFinite(value))return false;
 if(min!==null&&value<min)return false;
 if(max!==null&&value>max)return false;
 return true;
}
function rawCriteria(entry){
 const latest=[...(entry?.evaluations||[])].reverse().find(item=>item?.version===EVALUATION_RUN_VERSION);
 return latest?.criterionResults||{};
}
function familyCount(entry){
 const revision=libraryRevision(entry);
 const identity=revision?.strandIdentity?.families;
 if(Array.isArray(identity))return identity.length;
 const families=revision?.carrier?.families;
 if(families&&typeof families==='object'&&!Array.isArray(families))return Object.keys(families).length;
 return null;
}
function sourceText(entry){
 const carrier=libraryRevision(entry)?.carrier;
 if(!carrier||typeof carrier!=='object')return '';
 return [carrier.kind,carrier.recipeId,carrier.generatorVersion,carrier.preset].filter(item=>typeof item==='string').join(' ').toLowerCase();
}
function matchesResearch(row,options){
 const criterion=CRITERION_IDS.includes(options.criterion)?options.criterion:'';
 const stored=rawCriteria(row.entry);
 const record=criterion?row.criteria.find(item=>item.criterionId===criterion):null;
 if(criterion&&options.criterionStatus&&options.criterionStatus!=='all'&&record?.status!==options.criterionStatus)return false;
 const ratingMin=boundNumber(options.ratingMin),ratingMax=boundNumber(options.ratingMax);
 if(criterion&&(ratingMin!==null||ratingMax!==null)&&!inRange(record?.rating,ratingMin,ratingMax))return false;
 const component=typeof options.component==='string'?options.component:'';
 const componentMin=boundNumber(options.componentMin),componentMax=boundNumber(options.componentMax);
 if(component||componentMin!==null||componentMax!==null){
  const pool=criterion?[criterion]:CRITERION_IDS;
  const values=pool.flatMap(id=>{
   const components=stored[id]?.components||{};
   return (component?[components[component]]:Object.values(components)).filter(value=>Number.isFinite(value));
  });
  if(component&&!values.length)return false;
  if((componentMin!==null||componentMax!==null)&&!values.some(value=>inRange(value,componentMin,componentMax)))return false;
 }
 const safeguard=typeof options.safeguard==='string'?options.safeguard:'';
 if(safeguard||options.capActive===true){
  const pool=criterion?[criterion]:CRITERION_IDS;
  const values=pool.flatMap(id=>safeguard?[stored[id]?.safeguards?.[safeguard]]:Object.values(stored[id]?.safeguards||{})).filter(value=>Number.isFinite(value));
  if(options.capActive===true&&!values.some(value=>value<1))return false;
  if(safeguard&&!options.capActive&&!values.length)return false;
 }
 if(options.analysis&&options.analysis!=='all'&&row.analysis.status!==options.analysis)return false;
 const familyMin=boundNumber(options.familyMin),familyMax=boundNumber(options.familyMax);
 if(familyMin!==null||familyMax!==null){
  const count=familyCount(row.entry);
  if(!inRange(count,familyMin,familyMax))return false;
 }
 const source=String(options.source||'').trim().toLowerCase();
 if(source&&!sourceText(row.entry).includes(source))return false;
 const parameter=typeof options.parameter==='string'?options.parameter:'';
 const parameterMin=boundNumber(options.parameterMin),parameterMax=boundNumber(options.parameterMax);
 if(parameter&&(parameterMin!==null||parameterMax!==null)){
  const revision=libraryRevision(row.entry);
  const listed=revision?listSavedGenerationSettings(revision):{rows:[],groups:[]};
  const values=[...(listed.rows||[]),...(listed.groups||[]).flatMap(group=>group.rows||[])].filter(item=>item.parameterId===parameter&&Number.isFinite(item.raw)).map(item=>item.raw);
  if(!values.some(value=>inRange(value,parameterMin,parameterMax)))return false;
 }
 return true;
}
export function queryEvaluationRecords(records,{search='',sort='newest',filter='all',...options}={}){
 const query=String(search||'').trim().toLowerCase();
 const rows=[...records].map(entry=>({entry,identity:readWeaveIdentity(entry),summary:readEvaluationSummary(entry),criteria:readCriterionRecords(entry),analysis:readAnalysisStatus(entry)}));
 const visible=rows.filter(row=>{
  if(filter!=='all'&&row.summary.status!==filter)return false;
  if(!matchesResearch(row,options))return false;
  if(!query)return true;
  const name=String(row.identity?.name||'').toLowerCase();
  if(name.includes(query))return true;
  // Short text such as "01" is a name search. Weave IDs are hex, so those
  // characters match almost every record unless the query is a real ID fragment.
  if(query.length<4)return false;
  return String(row.identity?.weaveId||'').toLowerCase().includes(query);
 });
 const time=row=>{const parsed=Date.parse(row.identity?.createdAt||'');return Number.isFinite(parsed)?parsed:0;};
 const nameOf=row=>String(row.identity?.name||row.identity?.weaveId||'').toLowerCase();
 const idOf=row=>String(row.identity?.weaveId||'');
 const ratingOf=(row,id)=>{const found=row.criteria.find(item=>item.criterionId===id);return Number.isFinite(found?.rating)?found.rating:null;};
 visible.sort((a,b)=>{
  let delta=0;
  if(sort==='oldest')delta=time(a)-time(b);
  else if(sort==='name')delta=nameOf(a).localeCompare(nameOf(b));
  else if(sort==='status')delta=EVALUATION_STATUS_ORDER.indexOf(a.summary.status)-EVALUATION_STATUS_ORDER.indexOf(b.summary.status);
  else if(sort==='needs-reevaluation')delta=(a.summary.status==='needs-reevaluation'?0:1)-(b.summary.status==='needs-reevaluation'?0:1)||time(b)-time(a);
  else if(CRITERION_IDS.includes(sort)){
   const left=ratingOf(a,sort),right=ratingOf(b,sort);
   if(left===null&&right===null)delta=0;
   else if(left===null)delta=1;
   else if(right===null)delta=-1;
   else delta=right-left;
  }else if(sort==='score'){
   const left=a.summary.score,right=b.summary.score;
   if(left===null&&right===null)delta=0;
   else if(left===null)delta=1;
   else if(right===null)delta=-1;
   else delta=right-left;
  }else delta=time(b)-time(a);
  if(delta)return delta;
  const named=nameOf(a).localeCompare(nameOf(b));
  return named||idOf(a).localeCompare(idOf(b));
 });
 return visible.map(row=>row.entry);
}
function versionedEvaluation(entry){
 return [...(entry?.evaluations||[])].reverse().find(item=>item?.version===EVALUATION_RUN_VERSION)||null;
}
function comparisonSettings(entry){
 const revision=libraryRevision(entry);
 const listed=revision?listSavedGenerationSettings(revision):{rows:[],groups:[]};
 const rows=[];
 for(const row of listed.rows||[])if(row?.label)rows.push({key:row.parameterId||row.label,label:row.label,value:row.value||'—'});
 for(const group of listed.groups||[])for(const row of group.rows||[])if(row?.label)rows.push({key:`${group.title}|${row.parameterId||row.label}`,label:`${group.title} ${row.label}`,value:row.value||'—'});
 return rows;
}
function designerText(entry){
 const data=entry?.designerData;
 if(!data||typeof data!=='object'||Array.isArray(data))return '—';
 const parts=[];
 for(const [key,value] of Object.entries(data)){
  if(typeof value==='string'&&value&&value.length<=80)parts.push(`${key} ${value}`);
  else if(typeof value==='number'&&Number.isFinite(value))parts.push(`${key} ${value}`);
  else if(typeof value==='boolean')parts.push(`${key} ${value?'ON':'OFF'}`);
 }
 if(parts.length)return parts.join(' · ');
 const count=Object.keys(data).length;
 return count?`${count} SAVED`:'—';
}
function cellsDiffer(cells){return new Set(cells).size>1;}
function shownNumber(value){return Number.isFinite(value)?String(Math.round(value*100)/100):'—';}
export function compareEvaluationRecords(records){
 const columns=records.map(entry=>{
  const identity=readWeaveIdentity(entry)||{};
  const summary=readEvaluationSummary(entry);
  return {weaveId:identity.weaveId||'',name:identity.name||identity.weaveId||'',status:summary.statusLabel,criteria:readCriterionRecords(entry),run:versionedEvaluation(entry),settings:comparisonSettings(entry),designer:designerText(entry)};
 });
 const criteria=CRITERION_IDS.map(id=>{
  const cells=columns.map(column=>{
   const item=column.criteria.find(criterion=>criterion.criterionId===id);
   if(!item)return '—';
   return item.showRating?`${item.ratingText} / 5`:item.statusLabel;
  });
  return {id,label:`${id} ${criterionDefinition(id).name}`,cells,different:cellsDiffer(cells)};
 });
 const components=[],safeguards=[],evidence={};
 for(const id of CRITERION_IDS){
  const definition=criterionDefinition(id);
  for(const name of definition.components){
   const cells=columns.map(column=>shownNumber(column.run?.criterionResults?.[id]?.components?.[name]));
   components.push({id:`${id}:${name}`,label:`${id} ${metricLabel(name)}`,cells,different:cellsDiffer(cells)});
  }
  for(const name of definition.safeguards){
   const cells=columns.map(column=>{
    const value=column.run?.criterionResults?.[id]?.safeguards?.[name];
    if(!Number.isFinite(value))return '—';
    return value<1?`${shownNumber(value)} · CAP`:shownNumber(value);
   });
   safeguards.push({id:`${id}:${name}`,label:`${id} ${metricLabel(name)}`,cells,different:cellsDiffer(cells)});
  }
  evidence[id]=columns.map(column=>{
   const item=column.criteria.find(criterion=>criterion.criterionId===id);
   const lines=[item?.explanation,item?.notice,...(item?.evidence||[]).map(pair=>`${pair[0]} ${pair[1]}`)].filter(Boolean);
   return lines.join(' · ')||'—';
  });
 }
 const seen=new Set(),samples=[];
 for(const column of columns)for(const row of column.settings)if(!seen.has(row.key)){seen.add(row.key);samples.push(row);}
 const settings=samples.map(sample=>{
  const cells=columns.map(column=>column.settings.find(row=>row.key===sample.key)?.value||'—');
  return {id:sample.key,label:sample.label,cells,different:cellsDiffer(cells)};
 });
 const versions=CRITERION_IDS.map(id=>{
  const cells=columns.map(column=>{
   const result=column.run?.criterionResults?.[id];
   const logic=column.run?.versions?.[`${id}-logic`]||result?.criterionLogicVersion||'';
   const calibration=column.run?.versions?.[`${id}-calibration`]||result?.calibrationVersion||'';
   return logic||calibration?`${logic||'—'} · ${calibration||'—'}`:'—';
  });
  return {id,label:id,cells,different:cellsDiffer(cells)};
 });
 const designerCells=columns.map(column=>column.designer);
 const cohortMismatch=versions.some(row=>{const present=row.cells.filter(cell=>cell!=='—');return present.length>1&&new Set(present).size>1;});
 return {columns:columns.map(column=>({weaveId:column.weaveId,name:column.name,status:column.status})),criteria,components,safeguards,settings,versions,designer:{id:'designer',label:'DESIGNER',cells:designerCells,different:cellsDiffer(designerCells)},evidence,cohortWarning:cohortMismatch?'These weaves were scored with different criterion versions.':''};
}

export const DERIVED_ANALYSIS_VERSION='derived-analysis-v1';
export const EVALUATION_RUN_VERSION='evaluation-run-v1';
export const LINEAGE_VERSION='weave-lineage-v1';
export const CRITERION_IDS=['WV-01','WV-02','WV-03','WV-04','WV-05'];
const ANALYSIS_STATUS_LABELS={'not-analyzed':'NOT ANALYZED',analyzing:'ANALYZING',analyzed:'ANALYZED','analysis-failed':'ANALYSIS FAILED','analysis-unavailable':'ANALYSIS UNAVAILABLE'};
const READINESS_LABELS={ready:'READY',needsMigration:'NEEDS MIGRATION',missingGeometry:'MISSING GEOMETRY',missingFamilyIdentity:'MISSING FAMILY IDENTITY',legacyPartial:'LEGACY PARTIAL'};
const ANALYSIS_STATUSES=['not-analyzed','analyzing','analyzed','analysis-failed','analysis-unavailable'];

export function readAnalysisStatus(entry){
 const runs=entry?.derivedAnalysis?.runs,latest=Array.isArray(runs)?runs.at(-1):null;
 const status=ANALYSIS_STATUSES.includes(latest?.status)?latest.status:'not-analyzed';
 return {status,statusLabel:ANALYSIS_STATUS_LABELS[status]};
}

function metricLabel(key){return String(key).replace(/([a-z])([A-Z])/g,'$1 $2').replace(/[-_]/g,' ');}
function metricText(value){
 if(typeof value==='number'&&Number.isFinite(value))return String(Math.round(value*100)/100);
 if(typeof value==='string'&&value&&value.length<=80)return value;
 return null;
}
function metricLines(source,limit=24){
 const lines=[];
 if(!plainObject(source))return lines;
 for(const [key,value] of Object.entries(source)){
  const shown=metricText(value);
  if(shown!==null)lines.push([metricLabel(key),shown]);
  else if(Array.isArray(value)){
   lines.push([metricLabel(key),String(value.length)]);
   for(const item of value.slice(0,4)){
    if(!plainObject(item))continue;
    const bits=Object.entries(item).map(([name,part])=>{const text=metricText(part);return text===null?null:`${metricLabel(name)} ${text}`;}).filter(Boolean).slice(0,5);
    if(bits.length)lines.push([metricLabel(key),bits.join(' · ')]);
   }
  }
  if(lines.length>=limit)break;
 }
 return lines.slice(0,limit);
}
function componentValue(source,key){const value=source?.[key];return typeof value==='number'&&Number.isFinite(value)?value:null;}
function say(value,high,mid,low){if(value===null)return '';if(value>=0.75)return high;if(value>=0.45)return mid;return low;}
function capSentence(value,held,clear){if(value===null)return '';return value<1?held:clear;}
const CRITERION_REASONS={
 'WV-01':(components,safeguards)=>[say(componentValue(components,'familyDistinctness'),'The families are easy to tell apart.','The families are only partly different from each other.','The families are hard to tell apart.'),say(componentValue(components,'relationalCoupling'),'They still cross and work together.','They only partly cross and work together.','They barely cross or work together.'),capSentence(componentValue(safeguards,'effectiveFamilyPresence'),'A family is barely present, so the score was held down.','Every family is present enough that this did not hold the score down.')].filter(Boolean).join(' '),
 'WV-02':(components,safeguards)=>[say(componentValue(components,'effectiveModulation'),'The field forces actually bend the weave.','The field forces only partly bend the weave.','The field forces barely bend the weave.'),say(componentValue(components,'spatialDifferentiation'),'That bend changes from place to place.','That bend is similar across most of the field.','That bend is almost the same everywhere.'),say(componentValue(components,'fieldCoordination'),'The forces agree with each other.','The forces only partly agree.','The forces work against each other.'),capSentence(componentValue(safeguards,'fieldRetention'),'The strands lost too much of their original direction, so the score was held down.','The strands kept their original direction.')].filter(Boolean).join(' '),
 'WV-03':(components,safeguards)=>[say(componentValue(components,'eventSalienceDifferentiation'),'Some crossings stand out much more than others.','Crossings stand out only a little from each other.','The crossings all feel about the same.'),say(componentValue(components,'spatialScaleHierarchy'),'They form a clear large-to-small order.','The large-to-small order is only partly there.','There is no clear large-to-small order.'),say(componentValue(components,'recurrenceDifferentiation'),'That order repeats across the weave.','That order repeats only in places.','That order does not repeat.'),capSentence(componentValue(safeguards,'eventViability'),'Too few crossings were strong enough to count, so the score was held down.','Enough crossings were strong enough to count.')].filter(Boolean).join(' '),
 'WV-04':(components,safeguards)=>[say(componentValue(components,'interstitialDifferentiation'),'The gaps between strands differ from each other.','The gaps are only somewhat different.','The gaps are almost the same.'),say(componentValue(components,'interstitialContinuity'),'Those gaps stay connected.','Those gaps are only partly connected.','Those gaps break apart.'),capSentence(componentValue(safeguards,'degenerateInterstitial'),'The gaps were too thin or too broken, so the score was held down.','The gaps were solid enough that this did not hold the score down.')].filter(Boolean).join(' '),
 'WV-05':(components,safeguards)=>[say(componentValue(components,'familyConsequence'),'Taking one family away would change the others.','Taking one family away would change the others only a little.','Taking one family away would barely change the others.'),say(componentValue(components,'complementaryInterdependence'),'The families do different jobs that depend on each other.','The families only partly depend on each other.','The families do not depend on each other.'),capSentence(componentValue(safeguards,'irrelevantFamily'),'One family could be removed without much change, so the score was held down.','No family is sitting there without a job.')].filter(Boolean).join(' ')
};
function criterionReason(id,result){const write=CRITERION_REASONS[id];return write?write(result?.components,result?.safeguards):'';}
const CRITERION_NOTICES={'not-evaluated':'This criterion has not been scored.','evaluating':'Evaluation is running.','not-applicable':'This criterion does not apply. It has no rating.','evaluation-failed':'Scoring failed. This is not a low rating.','partial':'Scoring is incomplete. This is not a low rating.','needs-reevaluation':'This criterion needs to be scored again.'};

export function readCriterionRecords(entry){
 const latest=latestStoredEvaluation(entry);
 const results=latest?.version===EVALUATION_RUN_VERSION?latest.criterionResults:null;
 const dependency=evaluationDependencyReport(entry);
 return CRITERION_IDS.map(id=>{
  const result=results?.[id];
  let status=result&&CRITERION_STATUSES.includes(result.status)?result.status:'not-evaluated';
  const score=result&&Number.isFinite(result.normalizedScore)?result.normalizedScore:null;
  const rating=result&&Number.isFinite(result.rating)?result.rating:null;
  const warning=Array.isArray(result?.warnings)?result.warnings.find(item=>typeof item==='string'&&item)||'':'';
  const stale=dependency.criteria[id];
  const reasons=stale?.reasons||[];
  let notice=[CRITERION_NOTICES[status]||'',status==='evaluated'?'':warning].filter(Boolean).join(' ');
  if(reasons.length){status='needs-reevaluation';notice=[CRITERION_NOTICES['needs-reevaluation'],stale.reasonText].filter(Boolean).join(' ');}
  const showRating=(status==='evaluated'||status==='needs-reevaluation')&&rating!==null;
  return {criterionId:id,title:criterionDefinition(id).name,status,statusLabel:EVALUATION_STATUS_LABELS[status],score,rating,showRating,ratingText:showRating?rating.toFixed(1):'',explanation:typeof result?.explanation==='string'?result.explanation:'',reason:showRating?criterionReason(id,result):'',notice,reasons,components:metricLines(result?.components,8),safeguards:metricLines(result?.safeguards,6),evidence:metricLines(result?.submetrics,24)};
 });
}

export function readGeometryReadiness(project,entry){
 const report=evaluationReadinessReport(project,entry);
 return {readiness:report.readiness,label:READINESS_LABELS[report.readiness]||report.readiness,reasons:report.reasons};
}
const CRITERION_STATUSES=['not-evaluated','evaluating','evaluated','needs-reevaluation','evaluation-failed','not-applicable','partial'];

function recordId(value,label){
 if(typeof value!=='string'||!value||value.length>120)throw new Error(`Invalid ${label}.`);
 return value;
}
function textList(value,label){
 if(!Array.isArray(value)||value.length>40||value.some(item=>typeof item!=='string'||!item||item.length>200))throw new Error(`Invalid ${label}.`);
 return value;
}
function versionMap(value,label){
 if(!plainObject(value)||Object.keys(value).length>40)throw new Error(`Invalid ${label}.`);
 for(const [key,version] of Object.entries(value))if(!key||key.length>80||typeof version!=='string'||!version||version.length>80)throw new Error(`Invalid ${label}.`);
 return value;
}
function smallAnalysisValue(value,depth=0){
 if(value===null||typeof value==='boolean'||typeof value==='string'||typeof value==='number'){
  if(typeof value==='string'&&value.length>200)throw new Error('Invalid analysis output.');
  if(typeof value==='number'&&!Number.isFinite(value))throw new Error('Invalid analysis output.');
  return;
 }
 if(depth>4||!value||typeof value!=='object')throw new Error('Invalid analysis output.');
 if(Array.isArray(value)){
  if(value.length>40)throw new Error('Invalid analysis output.');
  value.forEach(item=>smallAnalysisValue(item,depth+1));
  return;
 }
 const keys=Object.keys(value);
 if(keys.length>40||keys.some(key=>['points','fragments','strands','payload'].includes(key)))throw new Error('Analysis outputs must reference heavy geometry.');
 keys.forEach(key=>smallAnalysisValue(value[key],depth+1));
}
function artifactReference(value){
 if(!plainObject(value))throw new Error('Invalid analysis artifact reference.');
 const keys=Object.keys(value);
 if(keys.length!==5||!['artifactId','version','weaveId','geometryFingerprint','analysisRunId'].every(key=>Object.hasOwn(value,key)))throw new Error('Invalid analysis artifact reference.');
 recordId(value.artifactId,'analysis artifact');
 recordId(value.version,'analysis artifact version');
 recordId(value.weaveId,'analysis artifact weave');
 recordId(value.geometryFingerprint,'analysis artifact geometry');
 recordId(value.analysisRunId,'analysis artifact run');
 return value;
}
function validateAnalysisRun(run){
 if(!plainObject(run))throw new Error('Invalid weave record containers.');
 const keys=Object.keys(run);
 if(keys.length!==7||!['analysisRunId','geometryFingerprint','status','moduleVersions','outputs','artifacts','warnings'].every(key=>Object.hasOwn(run,key)))throw new Error('Invalid weave record containers.');
 recordId(run.analysisRunId,'analysis run');
 recordId(run.geometryFingerprint,'analysis geometry');
 if(!ANALYSIS_STATUSES.includes(run.status))throw new Error('Invalid weave record containers.');
 versionMap(run.moduleVersions,'analysis module versions');
 if(!plainObject(run.outputs))throw new Error('Invalid weave record containers.');
 smallAnalysisValue(run.outputs);
 if(!Array.isArray(run.artifacts)||run.artifacts.length>40)throw new Error('Invalid weave record containers.');
 run.artifacts.forEach(artifactReference);
 textList(run.warnings,'analysis warnings');
 if(new Set(run.artifacts.map(item=>item.artifactId)).size!==run.artifacts.length)throw new Error('Invalid weave record containers.');
 return run;
}
function validateDerivedAnalysis(value){
 if(!plainObject(value))throw new Error('Invalid weave record containers.');
 if(!Object.keys(value).length)return value;
 if(value.version!==DERIVED_ANALYSIS_VERSION||!Array.isArray(value.runs)||Object.keys(value).length!==2)throw new Error('Invalid weave record containers.');
 if(value.runs.length>40)throw new Error('Invalid weave record containers.');
 const seen=new Set();
 for(const run of value.runs){
  validateAnalysisRun(run);
  if(seen.has(run.analysisRunId))throw new Error('Invalid weave record containers.');
  seen.add(run.analysisRunId);
 }
 return value;
}
function optionalScore(value,label){
 if(value===null)return;
 if(typeof value!=='number'||!Number.isFinite(value))throw new Error(`Invalid ${label}.`);
}
function validateCriterionResult(id,result){
 if(!CRITERION_IDS.includes(id)||!plainObject(result))throw new Error('Invalid weave record containers.');
 const required=['criterionId','status','normalizedScore','rating','components','safeguards','evidenceRefs','criterionLogicVersion','calibrationVersion','warnings'];
 const keys=Object.keys(result);
 if(!required.every(key=>Object.hasOwn(result,key))||keys.some(key=>!required.includes(key)&&key!=='submetrics'&&key!=='explanation'))throw new Error('Invalid weave record containers.');
 if(result.criterionId!==id||!CRITERION_STATUSES.includes(result.status))throw new Error('Invalid weave record containers.');
 optionalScore(result.normalizedScore,'criterion score');
 optionalScore(result.rating,'criterion rating');
 if(!plainObject(result.components)||!plainObject(result.safeguards))throw new Error('Invalid weave record containers.');
 smallAnalysisValue(result.components);
 smallAnalysisValue(result.safeguards);
 if(Object.hasOwn(result,'submetrics')){
  if(!plainObject(result.submetrics))throw new Error('Invalid weave record containers.');
  smallAnalysisValue(result.submetrics);
 }
 if(Object.hasOwn(result,'explanation')&&(typeof result.explanation!=='string'||result.explanation.length>200))throw new Error('Invalid weave record containers.');
 if(!Array.isArray(result.evidenceRefs)||result.evidenceRefs.length>40)throw new Error('Invalid weave record containers.');
 result.evidenceRefs.forEach(artifactReference);
 recordId(result.criterionLogicVersion,'criterion logic version');
 recordId(result.calibrationVersion,'calibration version');
 textList(result.warnings,'criterion warnings');
 return result;
}
function validateEvaluationRun(run){
 if(!plainObject(run)||run.version!==EVALUATION_RUN_VERSION)throw new Error('Invalid weave record containers.');
 const keys=Object.keys(run);
 if(keys.length!==9||!['version','evaluationId','analysisRunId','createdAt','status','criterionResults','versions','warnings','history'].every(key=>Object.hasOwn(run,key)))throw new Error('Invalid weave record containers.');
 recordId(run.evaluationId,'evaluation run');
 recordId(run.analysisRunId,'evaluation analysis run');
 if(!Number.isFinite(Date.parse(run.createdAt))||!CRITERION_STATUSES.includes(run.status))throw new Error('Invalid weave record containers.');
 if(!plainObject(run.criterionResults))throw new Error('Invalid weave record containers.');
 for(const [id,result] of Object.entries(run.criterionResults))validateCriterionResult(id,result);
 versionMap(run.versions,'evaluation versions');
 textList(run.warnings,'evaluation warnings');
 if(!Array.isArray(run.history)||run.history.length>40||run.history.some(id=>typeof id!=='string'||!id||id.length>120))throw new Error('Invalid weave record containers.');
 return run;
}
function validateLineage(value){
 if(!plainObject(value))throw new Error('Invalid weave record containers.');
 if(!Object.keys(value).length)return value;
 if(value.version!==LINEAGE_VERSION||Object.keys(value).length!==4)throw new Error('Invalid weave record containers.');
 if(value.parent!==null){
  if(!plainObject(value.parent)||Object.keys(value.parent).length!==2)throw new Error('Invalid weave record containers.');
  recordId(value.parent.weaveId,'lineage parent');
  recordId(value.parent.revisionId,'lineage parent revision');
 }
 if(!Array.isArray(value.downstream)||value.downstream.length>40||!Array.isArray(value.handoffs)||value.handoffs.length>40)throw new Error('Invalid weave record containers.');
 for(const item of value.downstream){
  if(!plainObject(item)||Object.keys(item).length!==2)throw new Error('Invalid weave record containers.');
  recordId(item.objectId,'downstream object');
  recordId(item.kind,'downstream kind');
 }
 for(const item of value.handoffs){
  if(!plainObject(item)||Object.keys(item).length!==3)throw new Error('Invalid weave record containers.');
  recordId(item.handoffId,'handoff');
  if(!Number.isFinite(Date.parse(item.createdAt)))throw new Error('Invalid weave record containers.');
  recordId(item.artifactId,'handoff artifact');
 }
 return value;
}
function validateRecordContainers(entry){
 validateDerivedAnalysis(entry.derivedAnalysis);
 if(entry.evaluations.some(item=>!plainObject(item)))throw new Error('Invalid weave record containers.');
 for(const item of entry.evaluations)if(item.version!==undefined)validateEvaluationRun(item);
 if(!plainObject(entry.designerData))throw new Error('Invalid weave record containers.');
 validateLineage(entry.lineage);
}

export function createAnalysisRun({analysisRunId,geometryFingerprint,status,moduleVersions={},outputs={},artifacts=[],warnings=[]}={}){
 return validateAnalysisRun({analysisRunId,geometryFingerprint,status,moduleVersions,outputs,artifacts,warnings});
}
export function appendAnalysisRun(entry,run){
 const validated=validateAnalysisRun(structuredClone(run));
 const base=!Object.keys(entry.derivedAnalysis||{}).length?{version:DERIVED_ANALYSIS_VERSION,runs:[]}:structuredClone(entry.derivedAnalysis);
 if(base.version!==DERIVED_ANALYSIS_VERSION||!Array.isArray(base.runs))throw new Error('Invalid weave record containers.');
 base.runs.push(validated);
 entry.derivedAnalysis=validateDerivedAnalysis(base);
 return entry;
}
export function createEvaluationRun({evaluationId,analysisRunId,createdAt,status='not-evaluated',criterionResults={},versions={},warnings=[],history=[]}={}){
 const run={version:EVALUATION_RUN_VERSION,evaluationId,analysisRunId,createdAt,status,criterionResults,versions,warnings,history};
 return validateEvaluationRun(structuredClone(run));
}
export function appendEvaluationRun(entry,run){
 if(!Array.isArray(entry.evaluations))throw new Error('Invalid weave record containers.');
 const next=structuredClone(run);
 if(!next.history?.length)next.history=entry.evaluations.filter(item=>item?.version===EVALUATION_RUN_VERSION).map(item=>item.evaluationId);
 entry.evaluations=[...entry.evaluations.map(item=>structuredClone(item)),validateEvaluationRun(next)];
 return entry;
}
export function createLineageRecord({parent=null,downstream=[],handoffs=[]}={}){
 return validateLineage({version:LINEAGE_VERSION,parent,downstream,handoffs});
}

export function validateStoredWeaveIdentity(entry){
 if(typeof entry.weaveId!=='string'||!entry.weaveId||entry.weaveId.length>120)throw new Error('Invalid weave identity.');
 if(!Number.isFinite(Date.parse(entry.createdAt))||!Number.isFinite(Date.parse(entry.modifiedAt)))throw new Error('Invalid weave identity timestamps.');
 if(typeof entry.generatorVersion!=='string'||!entry.generatorVersion||entry.generatorVersion.length>120)throw new Error('Invalid generator version.');
 if(entry.recordVersion!==WEAVE_RECORD_VERSION)throw new Error('Invalid weave record version.');
 const containers=['derivedAnalysis','evaluations','designerData','lineage'].filter(key=>entry[key]!==undefined);
 if(!containers.length)return;
 if(containers.length!==4||!plainObject(entry.derivedAnalysis)||!Array.isArray(entry.evaluations)||!plainObject(entry.designerData)||!plainObject(entry.lineage))throw new Error('Invalid weave record containers.');
 validateRecordContainers(entry);
}
