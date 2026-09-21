// SP0 planning proof. No production imports or database/browser writes.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
const LIMIT=10*1024*1024, ENVELOPE=16384, RESERVE=262144;
const counts={runs:2000,fragments:20000,points:85536,certificates:65536,edgeRefs:80000};
const lengths={f64:8*(6*counts.runs+4*counts.fragments+2*counts.points+counts.certificates),u32:4*(6*counts.runs+11*counts.fragments),i32:4*2*counts.runs,u16:2*counts.edgeRefs};
const hash=b=>createHash('sha256').update(b).digest('hex');
const byteLength=v=>Buffer.byteLength(JSON.stringify(v),'utf8');
function maximum(salt){
 const buffers=Object.fromEntries(Object.entries(lengths).map(([k,n])=>[k,Buffer.alloc(n)]));
 let fp=6*counts.runs,edge=0,extra=counts.certificates-counts.fragments;
 const u=(i,n)=>buffers.u32.writeUInt32LE(n,4*i),f=(i,n)=>buffers.f64.writeDoubleLE(n,8*i);
 for(let s=0;s<counts.runs;s++){
  // role, run-key, float offset, first fragment, fragment count, reserved
  [s%8,s%4,s*6,s*10,10,0].forEach((n,k)=>u(s*6+k,n));
  buffers.i32.writeInt32LE(s-1000,s*8);buffers.i32.writeInt32LE(-s,s*8+4);
  [s+salt,-s,s+1+salt,1-s,0,1].forEach((n,k)=>f(s*6+k,n));
 }
 for(let i=0;i<counts.fragments;i++){
  const C=1+(i===0?extra:0),P=C+1,param=fp;extra-=C-1;
  [.01,.99,.01,.99].forEach(n=>f(fp++,n));const point=fp;
  for(let p=0;p<P;p++){f(fp++,(p+salt)/Math.max(1,C));f(fp++,-p);}
  const cert=fp;for(let c=0;c<C;c++)f(fp++,c===0?Number.MIN_VALUE:1e-7);
  [param,point,P,cert,C,edge,2,edge+2,2,3,0].forEach((n,k)=>u(6*counts.runs+11*i+k,n));
  for(const n of [0,999,0,999])buffers.u16.writeUInt16LE(n,2*edge++);
 }
 assert.equal(fp*8,lengths.f64);assert.equal(edge*2,lengths.u16);assert.equal(extra,0);
 return {id:hash(Buffer.concat(Object.values(buffers))),codec:'derived-buffer-v3',counts,byteLengths:lengths,
  meta:{source:'stitch-recipe-v1',derived:'stitch-derived-v1',complete:true},
  dictionary:{board:'b'.repeat(120),pattern:'p'.repeat(120),recipe:'double-herringbone-alternating',recipeVersion:1,roles:Array.from({length:8},(_,i)=>`role-${i}`),runKeys:['U','D','T','L']},
  ...Object.fromEntries(Object.entries(buffers).map(([k,b])=>[k,b.toString('base64')]))};
}
function decode(p){
 assert.equal(p.codec,'derived-buffer-v3');assert.deepEqual(p.counts,counts);assert.deepEqual(p.byteLengths,lengths);
 const empty={...p,f64:'',u32:'',i32:'',u16:''};assert.ok(byteLength(empty)<=ENVELOPE);
 const b={};for(const [k,n]of Object.entries(lengths)){
  assert.equal(p[k].length,4*Math.ceil(n/3));b[k]=Buffer.from(p[k],'base64');assert.equal(b[k].length,n);assert.equal(b[k].toString('base64'),p[k]);
 }
 const u=i=>b.u32.readUInt32LE(4*i),f=i=>b.f64.readDoubleLE(8*i);
 let next=6*counts.runs,edge=0,points=0,certs=0;
 for(let s=0;s<counts.runs;s++){
  const i=s*6;assert.ok(u(i)<8&&u(i+1)<4);assert.equal(u(i+2),s*6);assert.equal(u(i+3),s*10);assert.equal(u(i+4),10);assert.equal(u(i+5),0);
  assert.equal(f(s*6+4),0);assert.equal(f(s*6+5),1);
 }
 for(let i=0;i<counts.fragments;i++){
  const r=6*counts.runs+11*i,po=u(r+1),P=u(r+2),co=u(r+3),C=u(r+4);
  assert.equal(u(r),next);assert.equal(po,next+4);assert.ok(P>=2);assert.equal(co,po+2*P);assert.equal(C,P-1);
  assert.equal(u(r+5),edge);assert.equal(u(r+6),2);assert.equal(u(r+7),edge+2);assert.equal(u(r+8),2);assert.equal(u(r+9),3);assert.equal(u(r+10),0);
  for(let e=0;e<4;e++)assert.equal(b.u16.readUInt16LE((edge+e)*2),e%2?999:0);
  next=co+C;edge+=4;points+=P;certs+=C;
 }
 assert.equal(next*8,b.f64.length);assert.equal(points,counts.points);assert.equal(certs,counts.certificates);assert.equal(edge,counts.edgeRefs);
 for(let i=0;i<b.f64.length;i+=8)assert.ok(Number.isFinite(b.f64.readDoubleLE(i)));
 assert.equal(hash(Buffer.concat(Object.values(b))),p.id);return b;
}
function document(payloads,reserve=0){
 const unique=[...new Map(payloads.map(p=>[p.id,p])).values()];
 return {format:'weave-foundation',version:3,storageVersion:'weave-idb-v2',
  manifest:{schema:6,current:payloads[0]?.id,savedRevisions:payloads.map(p=>({payloadId:p.id}))},
  records:[],payloads:unique,proofOnlyMetadataReserve:'x'.repeat(reserve)};
}
function admit(value){const text=JSON.stringify(value),bytes=Buffer.byteLength(text);if(bytes>LIMIT)throw Error('backup-capacity');return bytes;}
const a=maximum(0),b=maximum(1),c=maximum(2),decoded=decode(a);
for(const [k,value]of Object.entries(decoded))assert.equal(value.toString('base64'),a[k]);
// Binary64 signed zero and subnormal values survive; no decimal conversion.
assert.ok(Object.is(decoded.f64.readDoubleLE(8),-0));
const rejectChecks=[];
function rejects(name,fn){assert.throws(fn);rejectChecks.push(name);}
rejects('unknown codec',()=>decode({...a,codec:'derived-buffer-v99'}));
rejects('truncated base64',()=>decode({...a,f64:a.f64.slice(0,-4)}));
rejects('trailing buffer',()=>decode({...a,i32:a.i32+'AAAA'}));
const malformed=Buffer.from(a.u32,'base64');malformed.writeUInt32LE(1,(6*counts.runs)*4);
rejects('noncontiguous fragment offset',()=>decode({...a,u32:malformed.toString('base64')}));
rejects('oversized metadata',()=>decode({...a,meta:{padding:'x'.repeat(ENVELOPE)}}));
const base64Characters=Object.values(lengths).reduce((n,b)=>n+4*Math.ceil(b/3),0);
const payloadBound=base64Characters+ENVELOPE;
const twoPayloadBound=2*payloadBound+RESERVE;
assert.ok(twoPayloadBound<=LIMIT);
const single=admit(document([a],RESERVE)),two=admit(document([a,b],RESERVE)),dedup=admit(document([a,a],RESERVE));
assert.equal(document([a,a]).payloads.length,1);
assert.ok(dedup-single<256);rejects('three distinct maximum payloads',()=>admit(document([a,b,c],RESERVE)));
const exact=document([a]);const remaining=LIMIT-byteLength(exact);exact.proofOnlyMetadataReserve='x'.repeat(remaining);
assert.equal(admit(exact),LIMIT);exact.proofOnlyMetadataReserve+='x';rejects('one byte over ceiling',()=>admit(exact));
const old=JSON.parse(readFileSync(new URL('../r1b-storage/codec-capacity-proof.json',import.meta.url),'utf8'));
const legacyBound=old.base64Characters+ENVELOPE;
assert.ok(payloadBound+legacyBound+RESERVE<=LIMIT);
const report={status:'PASS',scope:'SP0 synthetic layout/binary round-trip and exact byte-admission proof; not a production codec, geometric-validity, migration, browser-quota or performance pass',
 counts,byteLengths:lengths,decodedBytes:Object.values(lengths).reduce((a,b)=>a+b,0),base64Characters,envelopeAllowance:ENVELOPE,payloadUpperBound:payloadBound,
 aggregateMetadataReserve:RESERVE,twoPayloadUpperBound:twoPayloadBound,headroom:LIMIT-twoPayloadBound,
 measuredSingleWithReserve:single,measuredTwoWithReserve:two,measuredDuplicateWithReserve:dedup,
 mixedLegacyNewUpperBound:payloadBound+legacyBound+RESERVE,exactThresholdPassed:true,rejectChecks,
 currentPreviousDecodedPayloadBytes:2*Object.values(lengths).reduce((a,b)=>a+b,0),portableLimit:LIMIT,
 notes:['Current and previous roots are separate recovery snapshots, not automatically both part of an exported workspace.',
 'Saved revisions sharing content add references only. Additional distinct geometry counts fully.',
 'Metadata reserve is a proof budget, not a claim about every possible workspace or an additional hard product quota.',
 'The proof-only reserve field is not part of the proposed production envelope.',
 'Browser storage overhead, retained undo roots and abandoned records have no universal quota guarantee; measure them at the checkpoint.']};
writeFileSync(new URL('finite-capacity-results.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
