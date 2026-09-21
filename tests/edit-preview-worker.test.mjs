import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const app=fs.readFileSync(new URL('../dist/app.mjs',import.meta.url),'utf8');
const dispatch=app.slice(app.indexOf('function dispatchPending()'),app.indexOf('async function certifyWorking(')).replaceAll('import.meta.url',JSON.stringify(new URL('../dist/app.mjs',import.meta.url).href));
test('a request based on an older accepted document never reaches background autosave',async()=>{
 const worker={postMessage(m){this.sent=m},terminate(){}},p={previewOnly:false,working:{weave:{studyId:'study'}},candidate:{},input:'input',base:'root:0',acceptedVersion:0,started:0,versions:{protocol:'protocol'}},owner={id:'board',working:{weave:{studyId:'study',derived:{old:true}}}};
 const context={pending:p,idleDerivationWorker:worker,activeJob:null,workerSequence:0,workerTimer:0,acceptedVersion:1,sessionId:'session',BUILD:'build',performance:{now:()=>1,timeOrigin:0},project:()=>owner,workspace:{activeProjectId:'board',projects:[owner]},copyProjectForEdit:structuredClone,store:{head:{currentRoot:'root'}},autosave:{accept(){throw Error('obsolete request must not reach autosave')}},editGesture:{clear(){}},workerEvent(){},renderR1BState(){},status(){},setTimeout:()=>1,clearTimeout(){},digest:()=> 'input',typedError:(code,message)=>Object.assign(Error(message),{code}),validatePreparedPayload(){},retainSourceTrace(){}};
 vm.createContext(context);vm.runInContext(dispatch+'\ndispatchPending();',context);
 await worker.onmessage({data:{...worker.sent,type:'success',resultCanonicalFingerprint:'payload',payload:{id:'payload'},result:{certified:true}}});
 assert.equal(context.pending,null);assert.equal(context.activeJob,null);assert.deepEqual(owner.working.weave.derived,{old:true});
});

test('failed newest calculation retains committed geometry and clears its edit gesture',async()=>{
 const worker={postMessage(m){this.sent=m},terminate(){}},owner={id:'board',working:{weave:{studyId:'study',derived:{old:true}}}},p={working:{weave:{studyId:'study'}},candidate:{},input:'input',base:'root',started:0,versions:{protocol:'protocol'}};let cleared=false;
 const context={pending:p,idleDerivationWorker:worker,activeJob:null,workerSequence:0,sessionId:'session',BUILD:'build',performance:{now:()=>1},project:()=>owner,workerEvent(){},renderR1BState(){},status(){},setTimeout:()=>1,clearTimeout(){},typedError:(code,message)=>Object.assign(Error(message),{code}),editGesture:{clear(){cleared=true}}};
 vm.createContext(context);vm.runInContext(dispatch+'\ndispatchPending();',context);
 await worker.onmessage({data:{...worker.sent,type:'failure',error:{code:'evaluator',message:'Rejected candidate'}}});
 assert.equal(context.pending,null);assert.equal(context.carrierPreview,null);assert.equal(cleared,true);assert.deepEqual(owner.working.weave.derived,{old:true});
});
test('canceling a preview aborts its transaction and restores committed geometry',()=>{
 let aborted=false,terminated=false,redraw=false;
 const context={editGesture:{clear(){}},activeJob:{seq:1,requestId:'request',controller:{abort(){aborted=true}},worker:{terminate(){terminated=true}},timeout:1},pending:{feedback:{scope:'field'}},carrierPreview:{unsaved:true},workerTimer:1,clearTimeout(){},workerEvent(){},renderR1BState(value){redraw=value},setEditFeedback(){},status(){}};
 vm.createContext(context);vm.runInContext(app.slice(app.indexOf('function cancelPending('),app.indexOf('function requestWorking('))+'\ncancelPending();',context);
 assert.ok(aborted&&terminated&&redraw);assert.equal(context.pending,null);assert.equal(context.carrierPreview,null);
});
test('the actual worker preview branch validates results but never writes storage or revision history',async()=>{
 const events=[],worker={postMessage(message){this.sent=message},terminate(){}},owner={id:'board',working:{weave:{studyId:'study',derived:{old:true}}}},p={previewOnly:true,working:{weave:{studyId:'study'}},input:'input',base:'root:0',acceptedVersion:0,started:0,candidate:{},versions:{protocol:'protocol'},feedback:{scope:'field',label:'STRENGTH 80'}};
 const context={pending:p,idleDerivationWorker:worker,activeJob:null,workerSequence:0,acceptedVersion:0,sessionId:'session',BUILD:'build',performance:{now:()=>1,timeOrigin:0},project:()=>owner,store:{head:{currentRoot:'root'}},editGesture:{clear(){}},workerEvent:(type,data)=>events.push({type,...data}),renderR1BState(){},status(){},setTimeout:()=>1,clearTimeout(){},digest:()=> 'input',typedError:(code,message)=>Object.assign(Error(message),{code}),validatePreparedPayload(){context.validated++},retainSourceTrace(){},renderCanvas(){context.rendered++},setEditFeedback(){},validated:0,rendered:0};
 vm.createContext(context);vm.runInContext(dispatch+'\ndispatchPending();',context);
 const message={...worker.sent,type:'success',resultCanonicalFingerprint:'payload',payload:{id:'payload'},result:{certified:true},workerMs:1};
 await worker.onmessage({data:message});
 assert.equal(context.validated,1);assert.equal(context.rendered,1);
 assert.equal(context.pending.phase,'PREVIEW');assert.equal(context.carrierPreview.weave.derived.certified,true);
 assert.deepEqual(owner.working.weave.derived,{old:true});assert.equal(context.activeJob,null);assert.equal(events.at(-1).type,'previewed');
});
test('rapid controls cancel obsolete work and schedule only the newest state',()=>{
 const queue=app.slice(app.indexOf('function queueWorkingCalculation('),app.indexOf('let idleDerivationWorker')),events=[],scheduled=[],obsolete={timeout:7,requestId:'old',input:'old',worker:{terminate(){this.terminated=true}}},owner={id:'board',working:{weave:{derived:{old:true}}}},working={weave:{studyId:'study'}};
 const context={workerUnavailable:false,activeJob:obsolete,pending:null,workerTimer:0,acceptedVersion:1,store:{head:{currentRoot:'root'}},performance:{now:()=>5},project:()=>owner,validateWeaveGeneration(){},versionsForWeave:()=>({protocol:'p'}),readWeaveSource:x=>x,weaveCalculationInput:x=>x,digest:()=> 'latest',dependencyPlan:()=>({version:'dependency-plan-v1',families:['A'],stages:['geometry'],reuse:{geometry:false,crossings:false,presentation:false},reasons:['family-geometry']}),copyWorkingForEdit:structuredClone,copyProjectForEdit:structuredClone,workerEvent:(type,data)=>events.push({type,...data}),clearTimeout(){},setTimeout(fn){scheduled.push(fn);return scheduled.length},renderR1BState(){},status(){},setEditFeedback(){},dispatchPending(){}};
 vm.createContext(context);vm.runInContext(queue+'\nqueueWorkingCalculation(working,"latest",true);',Object.assign(context,{working}));
 assert.equal(obsolete.worker.terminated,true);assert.equal(context.activeJob,null);assert.equal(context.pending.input,'latest');assert.equal(events.at(-1).type,'cancelled-obsolete');assert.equal(scheduled.length,1);
});
test('returning to the current canonical source reuses its certified result without dispatch',()=>{
 const queue=app.slice(app.indexOf('function queueWorkingCalculation('),app.indexOf('let idleDerivationWorker')),events=[],scheduled=[],owner={id:'board',working:{weave:{derived:{old:true}}}},working={weave:{studyId:'study'}};
 const context={workerUnavailable:false,activeJob:null,pending:null,carrierPreview:{preview:true},workerTimer:0,acceptedVersion:1,store:{head:{currentRoot:'root'}},performance:{now:()=>5},project:()=>owner,validateWeaveGeneration(){},versionsForWeave:()=>({protocol:'p'}),readWeaveSource:x=>x,weaveCalculationInput:x=>x,digest:()=> 'same',dependencyPlan:()=>({version:'dependency-plan-v1',families:[],stages:[],reuse:{geometry:true,crossings:true,presentation:true},reasons:[]}),copyWorkingForEdit:structuredClone,copyProjectForEdit:structuredClone,workerEvent:(type,data)=>events.push({type,...data}),clearTimeout(){},setTimeout(fn){scheduled.push(fn);return scheduled.length},renderR1BState(){},status(){},setEditFeedback(){},editGesture:{clear(){context.cleared=true}},dispatchPending(){}};
 vm.createContext(context);vm.runInContext(queue+'\nqueueWorkingCalculation(working,"same",true);',Object.assign(context,{working}));
 assert.equal(context.pending,null);assert.equal(context.carrierPreview,null);assert.equal(context.cleared,true);assert.equal(scheduled.length,0);assert.equal(events.at(-1).type,'reused-current');
});
