import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import fs from 'node:fs';const app=fs.readFileSync(new URL('../dist/app.mjs',import.meta.url),'utf8'),code=app.slice(app.indexOf('function ensureCrossings('),app.indexOf('function renderCrossingMarks(')).replace("new URL('./crossing-worker.mjs',import.meta.url)","'worker'");
function setup(){const workers=[],w={interlacing:{enabled:true},weave:{derived:{provenanceFingerprint:'a'}}},node={setAttribute(){}};let clock=0;const scope={crossingJob:null,crossingCache:null,crossingFailure:null,crossingSequence:0,threadPreview:null,carrierPreview:null,pending:null,lastWovenPresentation:null,sourceTraces:new WeakMap(),project:()=>({id:'board',working:w}),$:()=>node,performance:{now:()=>++clock},workerEvent(){},setTimeout:fn=>fn,clearTimeout(){},renderDerivedWeaveLayer(){},Worker:class{constructor(){workers.push(this)}terminate(){this.terminated=true}postMessage(m){this.message=m}}};vm.createContext(scope);vm.runInContext(app.slice(app.indexOf('function displayedWeaveWorking('),app.indexOf('function renderInterlaceControls('))+code,scope);return{scope,w,workers,node};}
test('latest crossing request rejects stale and wrong-id messages without modifying geometry',()=>{const {scope,w,workers}=setup();scope.ensureCrossings(w);w.weave.derived={provenanceFingerprint:'b'};scope.ensureCrossings(w);assert.equal(workers[0].terminated,true);workers[0].onmessage({data:{id:1,result:{complete:true},workerMs:1}});assert.equal(scope.crossingCache,null);workers[1].onmessage({data:{id:99,result:{complete:true},workerMs:1}});assert.equal(scope.crossingCache,null);workers[1].onmessage({data:{id:2,result:{complete:true},workerMs:1}});assert.equal(scope.crossingCache.key,'b');assert.equal(w.weave.derived.provenanceFingerprint,'b');});
test('worker maximum and unavailable worker fail closed with original geometry retained',()=>{const {scope,w,workers}=setup();scope.ensureCrossings(w);workers[0].onmessage({data:{id:1,result:{complete:true},workerMs:401}});assert.equal(scope.crossingCache,null);assert.match(scope.crossingFailure.message,/maximum/);assert.equal(w.weave.derived.provenanceFingerprint,'a');const other=setup();other.scope.Worker=class{constructor(){throw Error('unavailable')}};other.scope.ensureCrossings(other.w);assert.match(other.scope.crossingFailure.message,/unavailable/);});

test('appearance-only requests reuse completed crossings and replace stale presentation',()=>{const {scope,w,workers}=setup(),result={complete:true};scope.crossingCache={key:'a',paintKey:'old',result,markup:'old'};w.threadAppearance={version:'thread-appearance-v1',families:{A:{width:8,mode:'outline'}}};scope.ensureCrossings(w);assert.equal(workers[0].message.knownResult,result);assert.equal(workers[0].message.appearance,w.threadAppearance);workers[0].onmessage({data:{id:1,result,markup:'new',workerMs:2}});assert.equal(scope.crossingCache.markup,'new');assert.match(scope.crossingCache.paintKey,/outline/);});
test('a failed presentation blocks only its exact request and retries after rules change',()=>{const {scope,w,workers}=setup();scope.ensureCrossings(w);workers[0].onmessage({data:{id:1,result:{complete:true},workerMs:401}});assert.equal(workers.length,1);scope.ensureCrossings(w);assert.equal(workers.length,1);w.interlacing={enabled:true,version:'changed'};scope.ensureCrossings(w);assert.equal(workers.length,2);assert.equal(workers[1].message.settings.version,'changed');});

test('crossings for the visible preview are accepted independently of committed geometry',()=>{
 const {scope,w,workers}=setup();scope.carrierPreview={...w,weave:{derived:{provenanceFingerprint:'preview'}}};
 scope.ensureCrossings(scope.carrierPreview);
 workers[0].onmessage({data:{id:1,result:{complete:true},markup:'woven preview',workerMs:2}});
 assert.equal(scope.crossingCache.key,'preview');assert.equal(scope.crossingFailure,null);
 assert.equal(scope.lastWovenPresentation.markup,'woven preview');
 assert.equal(w.weave.derived.provenanceFingerprint,'a');
});
test('obsolete appearance completion is discarded without poisoning the new presentation',()=>{
 const {scope,w,workers}=setup();scope.ensureCrossings(w);w.threadAppearance={new:true};
 workers[0].onmessage({data:{id:1,result:{complete:true},markup:'obsolete',workerMs:2}});
 assert.equal(scope.crossingCache,null);assert.equal(scope.crossingFailure,null);assert.equal(scope.crossingJob,null);
 scope.ensureCrossings(w);assert.equal(workers.length,2);
});
test('pending woven redraw retains the last complete weave instead of exposing unoccluded lines',()=>{
 const {scope,w}=setup(),groups=[];let raw=0;scope.ensureCrossings=()=>{};
 Object.assign(scope,{width:100,height:100,view:{cx:0,cy:0,scale:1},svgElement:(_,attrs)=>({attrs,style:{},append(){},querySelectorAll:()=>[]}),isolatedFamilyKey:()=>null,presentationBleedStrands:strands=>strands,presentationTailStrands:()=>[],threadPaths:()=>[],renderThreadLayer:()=>raw++});
 vm.runInContext(app.slice(app.indexOf('function renderContinuousWeave('),app.indexOf('function renderDerivedWeaveLayer(')),scope);
 scope.lastWovenPresentation={identity:scope.wovenPresentationIdentity(w),markup:'last complete'};
 scope.renderContinuousWeave({append:g=>groups.push(g)},w);
 assert.equal(raw,0);assert.equal(groups[0].innerHTML,'last complete');assert.equal(groups[0].attrs['data-woven-pending'],'true');
 w.boundary={different:true};scope.renderContinuousWeave({append:g=>groups.push(g)},w);assert.equal(groups.length,1,'never show another boundary’s old weave');
 w.interlacing.enabled=false;scope.renderContinuousWeave({append:g=>groups.push(g)},w);assert.equal(raw,1);
});
test('zoom redraw keeps the woven renderer even while a carrier preview flag exists',()=>{
 const layer={replaceChildren(){},classList:{toggle(){} }},working={weave:{derived:{provenanceFingerprint:'preview'}}};let woven=0,marks=0;
 const scope={working,pending:null,display:{weaveDerived:true},displayedWeaveWorking:()=>working,$:id=>{assert.equal(id,'weave-derived-layer');return layer;},renderContinuousWeave(_,value){assert.equal(value,working);woven++;},renderCrossingMarks(){marks++;}};
 vm.createContext(scope);vm.runInContext(app.slice(app.indexOf('function renderDerivedWeaveLayer('),app.indexOf('function renderAttractorGuide('))+'\nrenderDerivedWeaveLayer(working,true);',scope);
 assert.equal(woven,1,'viewport redraw must preserve woven masks');assert.equal(marks,0,'preview redraw can still omit editable marks');
 const commit=app.slice(app.indexOf("p.phase='ACCEPTING'"),app.indexOf("workerEvent('accepted'"));
 assert.match(commit,/workspace=nextWorkspace;acceptedVersion\+\+;carrierPreview=null;/,'successful calculation must clear the preview flag before later zoom/pan redraws');
});
