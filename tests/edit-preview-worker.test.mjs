import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const app=fs.readFileSync(new URL('../dist/app.mjs',import.meta.url),'utf8');
const dispatch=app.slice(app.indexOf('function dispatchPending()'),app.indexOf('async function certifyWorking(')).replaceAll('import.meta.url',JSON.stringify(new URL('../dist/app.mjs',import.meta.url).href));
test('canceling a preview aborts its transaction and restores committed geometry',()=>{
 let aborted=false,terminated=false,redraw=false;
 const context={activeJob:{seq:1,requestId:'request',controller:{abort(){aborted=true}},worker:{terminate(){terminated=true}},timeout:1},pending:{feedback:{scope:'field'}},carrierPreview:{unsaved:true},workerTimer:1,clearTimeout(){},workerEvent(){},renderR1BState(value){redraw=value},setEditFeedback(){},status(){}};
 vm.createContext(context);vm.runInContext(app.slice(app.indexOf('function cancelPending('),app.indexOf('function requestWorking('))+'\ncancelPending();',context);
 assert.ok(aborted&&terminated&&redraw);assert.equal(context.pending,null);assert.equal(context.carrierPreview,null);
});
test('the actual worker preview branch validates results but never writes storage or revision history',async()=>{
 const events=[],worker={postMessage(message){this.sent=message},terminate(){}},owner={id:'board',working:{weave:{studyId:'study',derived:{old:true}}}},p={previewOnly:true,working:{weave:{studyId:'study'}},input:'input',base:'root',started:0,candidate:{},versions:{protocol:'protocol'},feedback:{scope:'field',label:'STRENGTH 80'}};
 const context={pending:p,idleDerivationWorker:worker,activeJob:null,workerSequence:0,sessionId:'session',BUILD:'build',performance:{now:()=>1,timeOrigin:0},project:()=>owner,store:{head:{currentRoot:'root'}},workerEvent:(type,data)=>events.push({type,...data}),renderR1BState(){},status(){},setTimeout:()=>1,clearTimeout(){},digest:()=> 'input',typedError:(code,message)=>Object.assign(Error(message),{code}),validatePreparedPayload(){context.validated++},retainSourceTrace(){},renderCanvas(){context.rendered++},setEditFeedback(){},validated:0,rendered:0};
 vm.createContext(context);vm.runInContext(dispatch+'\ndispatchPending();',context);
 const message={...worker.sent,type:'success',resultCanonicalFingerprint:'payload',payload:{id:'payload'},result:{certified:true},workerMs:1};
 await worker.onmessage({data:message});
 assert.equal(context.validated,1);assert.equal(context.rendered,1);
 assert.equal(context.pending.phase,'PREVIEW');assert.equal(context.carrierPreview.weave.derived.certified,true);
 assert.deepEqual(owner.working.weave.derived,{old:true});assert.equal(context.activeJob,null);assert.equal(events.at(-1).type,'previewed');
});
test('rapid controls keep one worker active and dispatch only the newest queued state',async()=>{
 const requestSource=app.slice(app.indexOf('function requestWorking('),app.indexOf('let idleDerivationWorker'));
 assert.doesNotMatch(requestSource,/reason:'superseded'/);
 assert.match(requestSource,/queued-latest/);
 const events=[],scheduled=[],worker={postMessage(message){this.sent=message},terminate(){this.terminated=true}},owner={id:'board',working:{weave:{studyId:'study',derived:{old:true}}}},first={previewOnly:true,working:{weave:{studyId:'study'}},input:'first',base:'root',started:0,candidate:{first:true},versions:{protocol:'protocol'},feedback:{scope:'field',label:'STRENGTH 20'}},latest={previewOnly:false,working:{weave:{studyId:'study'}},input:'latest',base:'root',started:1,candidate:{latest:true},versions:{protocol:'protocol'},feedback:{scope:'field',label:'STRENGTH 80'}};
 const context={pending:first,idleDerivationWorker:worker,activeJob:null,workerTimer:0,workerSequence:0,sessionId:'session',BUILD:'build',performance:{now:()=>2,timeOrigin:0},project:()=>owner,store:{head:{currentRoot:'root'}},workerEvent:(type,data)=>events.push({type,...data}),renderR1BState(){},status(){},setTimeout(fn){scheduled.push(fn);return scheduled.length},clearTimeout(){},digest:value=>value.first?'first':'latest',typedError:(code,message)=>Object.assign(Error(message),{code}),validatePreparedPayload(){throw Error('superseded result must not validate')},retainSourceTrace(){},renderCanvas(){}};
 vm.createContext(context);vm.runInContext(dispatch+'\ndispatchPending();',context);context.pending=latest;await worker.onmessage({data:{...worker.sent,type:'success',resultCanonicalFingerprint:'old',payload:{id:'old'},result:{}}});
 assert.equal(worker.terminated,undefined);assert.equal(context.activeJob,null);assert.equal(context.pending,latest);assert.equal(events.at(-1).type,'superseded-result');assert.equal(scheduled.length,2);
});
