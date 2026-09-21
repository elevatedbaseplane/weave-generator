// Rejected capacity prototype; not imported by the application or public output.
import {digest,canonical} from '../../../dist/weave.mjs';

export const STORAGE_VERSION='weave-idb-v1',CODEC_VERSION='derived-buffer-v1',PORTABLE_LIMIT=10*1024*1024;
const MAX_VALUES=262144,MAX_FRAGMENTS=20000;
const bytes=text=>new TextEncoder().encode(text).byteLength;
function reject(message){throw Object.assign(Error(message),{code:'storage-format'});}
function keys(v,list){if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).length!==list.length||list.some(k=>!Object.hasOwn(v,k)))reject('Invalid storage record keys.');}
function integer(v,max){if(!Number.isSafeInteger(v)||v<0||v>max)reject('Invalid storage array bound.');return v;}
function toBase64(buffer){const a=new Uint8Array(buffer);let s='';for(let i=0;i<a.length;i+=8192)s+=String.fromCharCode(...a.subarray(i,i+8192));return btoa(s);}
function fromBase64(s,length){if(typeof s!=='string'||s.length!==4*Math.ceil(length/3)||!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(s))reject('Invalid binary backup encoding.');const raw=atob(s);if(raw.length!==length)reject('Invalid binary backup length.');return Uint8Array.from(raw,c=>c.charCodeAt(0)).buffer;}

// Only arrays of coordinates and certificates change physical representation.
// All metadata/provenance and every binary64 value remain exact.
export function encodeDerived(derived){
 const manifest=structuredClone(derived),values=[];let fragments=0;
 for(const strand of manifest.strands)for(const f of strand.fragments){
  if(++fragments>MAX_FRAGMENTS)reject('Too many encoded fragments.');
  const offset=values.length,count=f.points.length;
  for(const p of f.points){keys(p,['x','y']);values.push(p.x,p.y);}
  f.points={offset,count};
  if(Object.hasOwn(f,'segmentErrorBounds')){const offset=values.length,count=f.segmentErrorBounds.length;if(count!==f.points.count-1)reject('Certificate count mismatch.');values.push(...f.segmentErrorBounds);f.segmentErrorBounds={offset,count};}
 }
 if(values.length>MAX_VALUES||values.some(n=>!Number.isFinite(n)))reject('Invalid encoded geometry values.');
 const buffer=new ArrayBuffer(values.length*8),view=new DataView(buffer);values.forEach((n,i)=>view.setFloat64(i*8,n,true));
 return {id:digest(derived),codec:CODEC_VERSION,byteLength:buffer.byteLength,manifest,buffer};
}
export function decodeDerived(payload){
 keys(payload,['id','codec','byteLength','manifest','buffer']);
 if(payload.codec!==CODEC_VERSION||!(payload.buffer instanceof ArrayBuffer)||payload.byteLength!==payload.buffer.byteLength||payload.byteLength%8)reject('Unsupported geometry payload.');
 const count=integer(payload.byteLength/8,MAX_VALUES),view=new DataView(payload.buffer),d=structuredClone(payload.manifest);let cursor=0,fragments=0;
 const take=(ref,width)=>{keys(ref,['offset','count']);integer(ref.count,MAX_VALUES);if(ref.offset!==cursor||cursor+ref.count*width>count)reject('Invalid geometry offset.');const out=[];for(let i=0;i<ref.count*width;i++){const n=view.getFloat64(cursor++*8,true);if(!Number.isFinite(n))reject('Nonfinite stored geometry.');out.push(n);}return out;};
 if(!Array.isArray(d.strands)||d.strands.length>2000)reject('Invalid stored strands.');
 for(const strand of d.strands){if(!Array.isArray(strand.fragments))reject('Invalid stored fragments.');for(const f of strand.fragments){if(++fragments>MAX_FRAGMENTS)reject('Too many stored fragments.');const values=take(f.points,2);f.points=[];for(let i=0;i<values.length;i+=2)f.points.push({x:values[i],y:values[i+1]});if(Object.hasOwn(f,'segmentErrorBounds')){f.segmentErrorBounds=take(f.segmentErrorBounds,1);if(f.segmentErrorBounds.length!==f.points.length-1)reject('Stored certificate count mismatch.');}}}
 if(cursor!==count||digest(d)!==payload.id)reject('Stored geometry fingerprint mismatch.');return d;
}

export function packWorkspace(workspace){
 const manifest=structuredClone(workspace),payloads=new Map(),records=new Map();
 function working(w){if(!w.weave?.derived)return w;const p=encodeDerived(w.weave.derived);payloads.set(p.id,p);w.weave.derived={payloadId:p.id};return w;}
 for(const p of manifest.projects){p.working=working(p.working);for(const study of p.weaveStudies)for(const revision of study.revisions){const record=working(revision.working),id=digest(record);records.set(id,{id,value:record});revision.working={recordId:id};}}
 const root=digest(manifest),packed={version:STORAGE_VERSION,root,manifest,records:[...records.values()],payloads:[...payloads.values()]};
 const text=portableText(packed);return {...packed,backupBytes:bytes(text)};
}
export function unpackWorkspace(packed){
 if(packed.version!==STORAGE_VERSION||digest(packed.manifest)!==packed.root)reject('Invalid workspace manifest.');
 const records=new Map(),payloads=new Map();
 for(const r of packed.records){keys(r,['id','value']);if(records.has(r.id)||digest(r.value)!==r.id)reject('Invalid immutable record.');records.set(r.id,r.value);}
 for(const p of packed.payloads){if(payloads.has(p.id))reject('Duplicate geometry payload.');payloads.set(p.id,decodeDerived(p));}
 const manifest=structuredClone(packed.manifest);
 function working(w){if(w.weave?.derived){keys(w.weave.derived,['payloadId']);const d=payloads.get(w.weave.derived.payloadId);if(!d)reject('Missing geometry payload.');w.weave.derived=structuredClone(d);}return w;}
 for(const p of manifest.projects){p.working=working(p.working);for(const study of p.weaveStudies)for(const r of study.revisions){keys(r.working,['recordId']);const value=records.get(r.working.recordId);if(!value)reject('Missing revision record.');r.working=working(structuredClone(value));}}
 return manifest;
}
export function portableText(packed){
 const payloads=packed.payloads.map(p=>({...p,buffer:toBase64(p.buffer)}));
 const text=JSON.stringify({format:'weave-foundation',version:2,storageVersion:STORAGE_VERSION,root:packed.root,manifest:packed.manifest,records:packed.records,payloads});
 if(bytes(text)>PORTABLE_LIMIT||text.length>PORTABLE_LIMIT)throw Object.assign(Error('This complete workspace exceeds the 10 MiB portable backup limit. Previous work is unchanged.'),{code:'backup-capacity'});
 return text;
}
export function parsePortable(text){
 if(typeof text!=='string'||text.length>PORTABLE_LIMIT||bytes(text)>PORTABLE_LIMIT)reject('Backup exceeds the 10 MiB limit.');
 const v=JSON.parse(text);keys(v,['format','version','storageVersion','root','manifest','records','payloads']);
 if(v.format!=='weave-foundation'||v.version!==2||v.storageVersion!==STORAGE_VERSION||!Array.isArray(v.records)||!Array.isArray(v.payloads))reject('Unsupported portable backup.');
 const payloads=v.payloads.map(p=>{integer(p.byteLength,MAX_VALUES*8);return {...p,buffer:fromBase64(p.buffer,p.byteLength)};});
 return unpackWorkspace({version:v.storageVersion,root:v.root,manifest:v.manifest,records:v.records,payloads});
}
