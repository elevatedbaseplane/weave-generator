import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorkspace,finalizeSavedWeaveRecord,serializeWorkspace,parseBackup,validateTrustedWorkspace} from '../dist/document.mjs';
import {createRectangularCarrier} from '../dist/carrier.mjs';
import {packWorkspace,unpackWorkspace} from '../dist/storage-codec.mjs';
import {readCriterionRecords} from '../dist/weave-record.mjs';
import {analyzeField,analyzeFieldSubset,analyzeWeave,clearAnalysisCache,generatorInfluenceDisplacement,readAnalysisArtifact,readAnalysisModules} from '../dist/analysis.mjs';

const SQUARE=[{x:0,y:0},{x:100,y:0},{x:100,y:100},{x:0,y:100}];
let serial=0;
function strand(id,familyId,points){return {strandId:id,familyId,fragments:[{points}]};}
function family(id,key,extra={}){return {familyId:id,key,spacing:40,angleDegrees:0,density:100,offset:0,retainedStrandCount:1,...extra};}
function makeField(overrides={}){
 return {weaveId:'weave-fixture',boundary:SQUARE,families:[],strands:[],influences:[],...overrides,geometryFingerprint:overrides.geometryFingerprint||`geometry-${++serial}`};
}
function forbidScores(value,seen=new Set()){
 if(!value||typeof value!=='object'||seen.has(value))return;
 seen.add(value);
 for(const key of Object.keys(value)){
  assert.equal(['rating','normalizedScore','WV01_rating','WV02_rating','WV03_rating','WV04_rating','WV05_rating'].includes(key),false);
  forbidScores(value[key],seen);
 }
}
function eventsOf(result,type){
 const artifact=result.artifacts.find(item=>item.module==='events');
 return (artifact?.evidence?.events||[]).filter(event=>!type||event.eventType===type);
}

test('influence displacement matches the generator function and is not a score',()=>{
 const attractor={id:'field-1',kind:'attractor',enabled:true,center:{x:0,y:0},radius:100,direction:0,falloff:3,families:{A:{strength:50,tension:0}}};
 const moved=generatorInfluenceDisplacement({x:10,y:0},[attractor],'A');
 const weight=(1-.01)**3;
 assert.ok(Math.abs(moved.x-(-.4*weight*10))<1e-9);
 assert.equal(moved.y,0);
 const repeller={...attractor,kind:'repeller'};
 assert.ok(generatorInfluenceDisplacement({x:10,y:0},[repeller],'A').x>0);
 assert.deepEqual(generatorInfluenceDisplacement({x:10,y:0},[{...attractor,enabled:false}],'A'),{x:0,y:0,parts:[{id:'field-1',x:0,y:0}]});
 assert.deepEqual(generatorInfluenceDisplacement({x:10,y:0},[{...attractor,families:{A:{strength:50,tension:100}}}],'A'),{x:0,y:0,parts:[{id:'field-1',x:0,y:0}]});
 assert.equal(generatorInfluenceDisplacement({x:500,y:0},[attractor],'A').x,0);
 const softer=generatorInfluenceDisplacement({x:10,y:0},[{...attractor,falloff:1}],'A');
 assert.notEqual(softer.x,moved.x);
});

test('orthogonal, parallel, shallow, sparse, duplicate, and shifted fixtures keep detector evidence',()=>{
 clearAnalysisCache();
 const horizontal=[20,40,60,80].map((y,index)=>strand(`h-${index}`,'family-a',[{x:0,y},{x:100,y}]));
 const vertical=[20,40,60,80].map((x,index)=>strand(`v-${index}`,'family-b',[{x,y:0},{x,y:100}]));
 const grid=analyzeField(makeField({families:[family('family-a','A',{spacing:20}),family('family-b','B',{spacing:20,angleDegrees:90})],strands:[...horizontal,...vertical]}));
 assert.equal(grid.status,'analyzed');
 assert.equal(grid.modules.events.status,'complete');
 assert.equal(grid.modules.events.crossingCount,16);
 assert.equal(eventsOf(grid,'crossing').every(event=>event.salience===1),true);
 assert.equal(grid.modules.presence.weakPresenceCount,0);
 assert.equal(grid.modules.directional.pairCount,1);
 assert.equal(grid.modules.interstitial.zoneCount>1,true);
 assert.equal(grid.modules.events.interruption,'unavailable');
 forbidScores(grid);

 const shallow=analyzeField(makeField({families:[family('family-a','A'),family('family-b','B',{angleDegrees:5})],strands:[strand('a','family-a',[{x:0,y:50},{x:100,y:50}]),strand('b','family-b',[{x:0,y:50-50*Math.tan(5*Math.PI/180)},{x:100,y:50+50*Math.tan(5*Math.PI/180)}])]}));
 const crossing=eventsOf(shallow,'crossing');
 assert.equal(crossing.length,1);
 assert.ok(Math.abs(crossing[0].salience-.25)<1e-9);

 const parallel=analyzeField(makeField({families:[family('family-a','A',{angleDegrees:0}),family('family-b','B',{angleDegrees:0})],strands:[strand('a','family-a',[{x:0,y:30},{x:100,y:30}]),strand('b','family-b',[{x:0,y:40},{x:100,y:40}])]}));
 assert.equal(parallel.modules.events.status,'complete');
 assert.equal(parallel.modules.events.crossingCount,0);
 assert.equal(parallel.modules.events.alignmentCount>=1,true);
 assert.equal(parallel.modules.directional.pairCount,1);
 const parallelPairs=parallel.artifacts.find(item=>item.module==='directional').evidence.pairs;
 assert.equal(parallelPairs[0].angleDifference,0);

 const sparse=analyzeField(makeField({families:[family('family-a','A'),family('family-b','B',{angleDegrees:90})],strands:[...[20,40,60,80,90].map((y,index)=>strand(`a-${index}`,'family-a',[{x:0,y},{x:100,y}])),strand('b','family-b',[{x:50,y:0},{x:50,y:100}])]}));
 const presence=sparse.artifacts.find(item=>item.module==='presence').evidence.families.find(row=>row.familyId==='family-b');
 assert.equal(presence.retainedStrandCount,1);
 assert.equal(presence.presence,0);

 const duplicate=analyzeField(makeField({families:[family('family-a','A'),family('family-b','B')],strands:[strand('a','family-a',[{x:0,y:20},{x:100,y:20}]),strand('b','family-b',[{x:0,y:70},{x:100,y:70}])]}));
 const ratios=duplicate.artifacts.find(item=>item.module==='rhythmic').evidence.pairs[0];
 assert.equal(ratios.spacingRatio,1);
 assert.equal(duplicate.artifacts.find(item=>item.module==='directional').evidence.pairs[0].angleDifference,0);

 const approaching=analyzeField(makeField({families:[family('family-a','A'),family('family-b','B',{angleDegrees:-14})],strands:[strand('a','family-a',[{x:0,y:50},{x:100,y:50}]),strand('b','family-b',[{x:0,y:80},{x:100,y:55}])]}));
 assert.equal(approaching.modules.events.convergenceCount>=1,true);
 const spreading=analyzeField(makeField({families:[family('family-a','A'),family('family-b','B',{angleDegrees:14})],strands:[strand('a','family-a',[{x:0,y:50},{x:100,y:50}]),strand('b','family-b',[{x:0,y:55},{x:100,y:80}])]}));
 assert.equal(spreading.modules.events.divergenceCount>=1,true);
 const kinked=analyzeField(makeField({families:[family('family-a','A'),family('family-b','B',{angleDegrees:90,spacing:40})],strands:[strand('a','family-a',[{x:0,y:50},{x:50,y:50},{x:100,y:80}]),strand('b','family-b',[{x:70,y:0},{x:70,y:100}])]}));
 assert.equal(kinked.modules.events.shiftCount>=1,true);
 const shift=eventsOf(kinked,'directional-shift')[0];
 assert.ok(shift.salience>0&&shift.salience<1);
});

test('modulation, open space, slivers, resolution, and module failure stay separate from ratings',()=>{
 clearAnalysisCache();
 const base=makeField({families:[family('family-a','A',{spacing:20}),family('family-b','B',{spacing:20,angleDegrees:90})],strands:[strand('a','family-a',[{x:0,y:50},{x:100,y:50}]),strand('b','family-b',[{x:50,y:0},{x:50,y:100}])],influences:[{id:'field-1',kind:'attractor',enabled:true,center:{x:50,y:50},radius:80,direction:0,falloff:3,families:{A:{strength:80,tension:0},B:{strength:0,tension:0}}}]});
 const modulated=analyzeField(base);
 assert.equal(modulated.modules.modulation.status,'complete');
 assert.ok(modulated.modules.modulation.m75>0);
 assert.ok(modulated.modules.modulation.sampleCount>0);
 const familyRows=modulated.artifacts.find(item=>item.module==='modulation').evidence.families;
 assert.ok(familyRows.find(row=>row.key==='A').m75>0);
 assert.equal(familyRows.find(row=>row.key==='B').m75,0);
 const opposed=analyzeField(makeField({...base,influences:[base.influences[0],{...base.influences[0],id:'field-2',kind:'repeller'}]}));
 assert.ok(opposed.modules.modulation.overlapCount>0);
 assert.ok(opposed.modules.modulation.coordinationMedian<.2);
 forbidScores(opposed);

 const open=analyzeField(makeField({families:[family('family-a','A',{spacing:50})],strands:[strand('a','family-a',[{x:40,y:50},{x:60,y:50}])]}));
 assert.equal(open.modules.interstitial.openCount>=1,true);
 const sliver=analyzeField(makeField({families:[family('family-a','A',{spacing:40,angleDegrees:90}),family('family-b','B',{spacing:40,angleDegrees:90})],strands:[strand('a','family-a',[{x:40,y:0},{x:40,y:100}]),strand('b','family-b',[{x:43,y:0},{x:43,y:100}])]}),{grid:80});
 assert.equal(sliver.modules.interstitial.sliverCount>=1,true);
 const coarse=analyzeField(makeField({families:base.families,strands:base.strands}),{grid:20});
 const fine=analyzeField(makeField({families:base.families,strands:base.strands}),{grid:40});
 assert.equal(coarse.modules.events.crossingCount,fine.modules.events.crossingCount);
 assert.notEqual(coarse.modules.modulation.sampleCount,fine.modules.modulation.sampleCount);

 const triangle=analyzeField(makeField({boundary:[{x:0,y:0},{x:100,y:0},{x:50,y:80}],families:[family('family-a','A')],strands:[strand('a','family-a',[{x:10,y:10},{x:40,y:10}])]}));
 assert.ok(triangle.modules.modulation.sampleCount<1600);

 const failed=analyzeField(makeField({families:[family('family-a','A'),family('family-b','B',{angleDegrees:90})],strands:[strand('a','family-a',[{x:0,y:50},{x:100,y:50}]),strand('b','family-b',[{x:50,y:0},{x:50,y:100}])]}),{replace:{events(){throw new Error('detector failed');}}});
 assert.equal(failed.status,'analysis-failed');
 assert.equal(failed.modules.events.status,'failed');
 assert.equal(failed.modules.events.crossingCount,undefined);
 assert.equal(failed.modules.presence.status,'complete');
 assert.equal(failed.modules.modulation.status,'complete');
});

test('family subsets cache counterfactual geometry without regenerating it',()=>{
 clearAnalysisCache();
 const strands=[strand('a1','family-a',[{x:0,y:30},{x:100,y:30}]),strand('a2','family-a',[{x:0,y:70},{x:100,y:70}]),strand('b1','family-b',[{x:30,y:0},{x:30,y:100}]),strand('c1','family-c',[{x:10,y:0},{x:90,y:100}])];
 const field=makeField({families:[family('family-a','A'),family('family-b','B',{angleDegrees:90}),family('family-c','C',{angleDegrees:45})],strands});
 const full=analyzeField(field);
 const withoutC=analyzeFieldSubset(field,['family-a','family-b']);
 const again=analyzeFieldSubset(field,['family-a','family-b']);
 assert.equal(again.cached,true);
 assert.equal(withoutC.modules.events.crossingCount,again.modules.events.crossingCount);
 assert.ok(full.modules.events.crossingCount>withoutC.modules.events.crossingCount);
 const one=analyzeFieldSubset(field,['family-a']);
 assert.equal(one.modules.events.crossingCount,0);
 assert.equal(one.modules.events.status,'complete');
 const empty=analyzeFieldSubset(field,[]);
 assert.equal(empty.modules.events.status,'not_applicable');
 assert.equal(empty.modules.events.crossingCount,undefined);
 assert.equal(JSON.stringify(field.strands),JSON.stringify(strands));
});

test('a saved weave analysis is pinned, persisted, and does not score criteria',()=>{
 clearAnalysisCache();
 const ws=createWorkspace();
 let project=ws.projects[0];
 project.working.carrier=createRectangularCarrier();
 project=finalizeSavedWeaveRecord(project,'WEAVE A',{now:'2026-09-27T12:00:00.000Z',generatorVersion:'TEST-BUILD'}).project;
 const entry=project.carrierStudies[0];
 const geometry=JSON.stringify(entry.revisions[0].geometryRef);
 const first=analyzeWeave(project,entry);
 assert.equal(first.cached,false);
 assert.equal(first.run.status,'analyzed');
 assert.equal(first.run.geometryFingerprint,entry.revisions[0].geometryRef.geometryFingerprint);
 assert.ok(first.run.outputs.modules.events.crossingCount>0);
 assert.equal(JSON.stringify(entry.revisions[0].geometryRef),geometry);
 assert.equal(entry.evaluations.length,0);
 assert.equal(readCriterionRecords(entry).every(item=>item.status==='not-evaluated'&&item.score===null),true);
 const repeat=analyzeWeave(project,entry);
 assert.equal(repeat.cached,true);
 assert.equal(entry.derivedAnalysis.runs.length,1);
 const frozen=structuredClone(entry.derivedAnalysis.runs[0]);
 analyzeWeave(project,entry,{force:true});
 assert.deepEqual(entry.derivedAnalysis.runs[0],frozen);
 assert.equal(entry.derivedAnalysis.runs.length,2);
 const familyIds=entry.revisions[0].strandIdentity.families.map(family=>family.familyId);
 const subset=analyzeWeave(project,entry,{familyIds:[familyIds[0]]});
 assert.equal(subset.run.outputs.modules.events.crossingCount,0);
 assert.equal(typeof subset.run.outputs.modules.events.crossingDelta,'number');
 ws.projects[0]=project;
 validateTrustedWorkspace(ws);
 const reloaded=unpackWorkspace(packWorkspace(parseBackup(serializeWorkspace(ws)))).projects[0].carrierStudies[0];
 const artifactId=reloaded.derivedAnalysis.runs[0].artifacts.find(item=>item.version==='relational-events-v1').artifactId;
 const artifact=readAnalysisArtifact(reloaded,artifactId);
 assert.equal(artifact.geometryFingerprint,reloaded.derivedAnalysis.runs[0].geometryFingerprint);
 assert.equal(artifact.analysisRunId,reloaded.derivedAnalysis.runs[0].analysisRunId);
 assert.ok(artifact.evidence.events.length>0);
 assert.equal(readAnalysisModules(reloaded).every(item=>item.status==='complete'&&!item.statusLabel.includes('SCORE')),true);
 const unready={weaveId:'weave-unready',revisions:[],derivedAnalysis:{},evaluations:[],designerData:{},lineage:{}};
 const unavailable=analyzeWeave({id:'board'},unready);
 assert.equal(unavailable.run.status,'analysis-unavailable');
 assert.deepEqual(unavailable.run.outputs.modules,{});
 assert.equal(unready.evaluations.length,0);
});
