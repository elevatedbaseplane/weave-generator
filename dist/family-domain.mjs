import {familyNames} from './carrier.mjs';

export const FAMILY_CATALOG_VERSION='family-catalog-v1';

const cleanLabel=(value,key)=>String(value||`FAMILY ${key}`).trim().slice(0,40);
const hash=value=>{let h=2166136261;for(const c of String(value)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return (h>>>0).toString(36)};
const legacyId=(carrier,key)=>`family-legacy-${hash(`${carrier?.id||'carrier'}|${key}`)}-${key.toLowerCase()}`;
const newId=()=>`family-${crypto.randomUUID()}`;

export function validateFamilyCatalog(catalog,carrier){
 if(catalog===undefined)return undefined;
 if(!catalog||catalog.version!==FAMILY_CATALOG_VERSION||!Array.isArray(catalog.entries))throw Error('Invalid family catalog.');
 const keys=familyNames(carrier),ids=new Set(),seenKeys=new Set(),orders=new Set();
 if(catalog.entries.length!==keys.length)throw Error('The family catalog must describe every current family exactly once.');
 for(const entry of catalog.entries){
  if(!entry||typeof entry.id!=='string'||!entry.id||entry.id.length>120||typeof entry.key!=='string'||!keys.includes(entry.key)||seenKeys.has(entry.key)||ids.has(entry.id))throw Error('Invalid family identity.');
  if(typeof entry.label!=='string'||!entry.label.trim()||entry.label.length>40||/[\u0000-\u001f]/.test(entry.label))throw Error('Invalid family label.');
  if(!Number.isInteger(entry.order)||entry.order<0||entry.order>=keys.length||orders.has(entry.order)||typeof entry.includeInExport!=='boolean')throw Error('Invalid family order or export setting.');
  ids.add(entry.id);seenKeys.add(entry.key);orders.add(entry.order);
 }
 return catalog;
}

export function effectiveFamilyCatalog(carrier,catalog){
 if(!carrier)return {version:FAMILY_CATALOG_VERSION,entries:[]};
 if(catalog!==undefined)return structuredClone(validateFamilyCatalog(catalog,carrier));
 return {version:FAMILY_CATALOG_VERSION,entries:familyNames(carrier).map((key,order)=>({id:legacyId(carrier,key),key,label:carrier.kind==='stitch-source-v1'?`ROLE ${key}`:`FAMILY ${key}`,order,includeInExport:true}))};
}

export function materializeFamilyCatalog(carrier,catalog){
 const result=effectiveFamilyCatalog(carrier,catalog);
 if(catalog===undefined)result.entries=result.entries.map(entry=>({...entry,id:newId()}));
 return result;
}

export function duplicateFamilyCatalog(carrier,catalog){const copy=effectiveFamilyCatalog(carrier,catalog);copy.entries=copy.entries.map(entry=>({...entry,id:newId()}));return copy;}

export const orderedFamilies=(carrier,catalog)=>effectiveFamilyCatalog(carrier,catalog).entries.sort((a,b)=>a.order-b.order);
export const familyEntry=(carrier,catalog,key)=>effectiveFamilyCatalog(carrier,catalog).entries.find(entry=>entry.key===key)||null;

export function addCatalogFamily(carrier,catalog,key,copyKey=null){
 const current=catalog===undefined?effectiveFamilyCatalog(carrier):structuredClone(catalog),keys=familyNames(carrier),existing=current.entries.filter(entry=>keys.includes(entry.key)&&entry.key!==key),source=existing.find(entry=>entry.key===copyKey),entry={id:newId(),key,label:source?`${source.label} COPY`.slice(0,40):`FAMILY ${key}`,order:existing.length,includeInExport:source?.includeInExport??true};
 const next={version:FAMILY_CATALOG_VERSION,entries:[...existing,entry]};validateFamilyCatalog(next,carrier);return next;
}

export function removeCatalogFamily(carrier,catalog,key){
 const source=catalog===undefined?effectiveFamilyCatalog(carrier):structuredClone(catalog),entries=source.entries.filter(entry=>entry.key!==key).sort((a,b)=>a.order-b.order).map((entry,order)=>({...entry,order})),next={version:FAMILY_CATALOG_VERSION,entries};validateFamilyCatalog(next,carrier);return next;
}

export function updateFamilyCatalog(carrier,catalog,key,patch){
 const next=materializeFamilyCatalog(carrier,catalog),entry=next.entries.find(item=>item.key===key);if(!entry)throw Error('Choose an available family.');
 if(patch.label!==undefined)entry.label=cleanLabel(patch.label,key);
 if(patch.includeInExport!==undefined)entry.includeInExport=Boolean(patch.includeInExport);
 if(patch.move){const ordered=next.entries.sort((a,b)=>a.order-b.order),index=ordered.findIndex(item=>item.key===key),target=Math.max(0,Math.min(ordered.length-1,index+patch.move));if(target!==index){const [moved]=ordered.splice(index,1);ordered.splice(target,0,moved);ordered.forEach((item,order)=>item.order=order);}}
 validateFamilyCatalog(next,carrier);return next;
}

export function indexDerivedFamilies(working){
 const carrier=working?.carrier,catalog=effectiveFamilyCatalog(carrier,working?.familyCatalog),derived=working?.weave?.derived,strands=derived?.strands||[];
 const families=catalog.entries.sort((a,b)=>a.order-b.order).map(entry=>{const strandIndexes=[];let fragments=0,segments=0;for(let i=0;i<strands.length;i++){const strand=strands[i],key=strand.family||strand.identity?.roleId;if(key!==entry.key)continue;strandIndexes.push(i);for(const fragment of strand.fragments||[]){fragments++;segments+=Math.max(0,(fragment.points?.length||0)-1);}}return{...entry,strandIndexes,strandCount:strandIndexes.length,fragmentCount:fragments,segmentCount:segments};});
 return {version:'derived-family-index-v1',provenanceFingerprint:derived?.provenanceFingerprint||null,families};
}

export function indexCrossingFamilies(working,crossings){
 const index=indexDerivedFamilies(working),byKey=new Map(index.families.map(entry=>[entry.key,entry.id])),strands=working?.weave?.derived?.strands||[];
 return (crossings?.events||[]).map(event=>({...event,familyIds:[event.a,event.b].map(ref=>{const strand=strands[ref.si];return byKey.get(strand?.family||strand?.identity?.roleId)||null})}));
}
