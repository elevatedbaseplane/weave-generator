import fs from 'node:fs';
import {performance} from 'node:perf_hooks';
import {canonical,sha256} from '../../../dist/weave.mjs';
import {denseFixture,stats,heap} from './performance-fixture.mjs';
const derived=denseFixture().derive(),runs=[];
for(let i=-5;i<20;i++){
 const before=heap(),canonicalStart=performance.now(),text=canonical(derived),canonicalMs=performance.now()-canonicalStart;
 const jsStart=performance.now(),js=sha256(text),jsShaMs=performance.now()-jsStart;
 const bytesStart=performance.now(),encoded=new TextEncoder().encode(text),utf8Ms=performance.now()-bytesStart;
 const nativeStart=performance.now(),native=Buffer.from(await crypto.subtle.digest('SHA-256',encoded)).toString('hex'),nativeShaMs=performance.now()-nativeStart;
 if(js!==native)throw Error('Native digest mismatch');
 if(i>=0)runs.push({index:i,canonicalMs,jsShaMs,utf8Ms,nativeShaMs,canonicalBytes:encoded.byteLength,beforeHeap:before,afterHeap:heap()});
}
const field=k=>stats(runs.map(r=>r[k])),report={runs,summary:{canonical:field('canonicalMs'),jsSha:field('jsShaMs'),utf8:field('utf8Ms'),nativeSha:field('nativeShaMs')}};
fs.writeFileSync(new URL('./performance-hash-phases.json',import.meta.url),JSON.stringify(report,null,2));console.log(JSON.stringify(report.summary));
