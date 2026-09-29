import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorkspace,finalizeSavedWeaveRecord,validateTrustedWorkspace} from '../dist/document.mjs';
import {createRectangularCarrier} from '../dist/carrier.mjs';
import {clearAnalysisCache} from '../dist/analysis.mjs';
import {evaluateWeave} from '../dist/evaluation.mjs';
import {evaluateWV04,scoreWV04} from '../dist/wv04.mjs';

function zone(id,overrides){
 return {zoneId:id,area:100,normalizedArea:1,normalizedWidth:.8,widthToScale:.5,weaveDefinition:.8,territorialShare:.02,connectionIds:[],...overrides};
}
function repeat(count,make){return Array.from({length:count},(_,index)=>make(index));}
function hierarchy(){
 const narrow=repeat(4,index=>zone(`a-${index}`,{connectionIds:['link']}));
 const wide=repeat(4,index=>zone(`b-${index}`,{area:300,normalizedArea:3,normalizedWidth:1.6,widthToScale:.9,connectionIds:['link']}));
 const zones=[...narrow,...wide];
 return {zones,connections:[{connectionId:'link',zoneIds:zones.map(item=>item.zoneId),bottleneckWidth:2}],spacing:10};
}

test('uniform, fragmented, open, slivered, and hierarchical interstitial fields follow the WV-04 structure',()=>{
 const organized=scoreWV04(hierarchy());
 const uniform=scoreWV04({zones:repeat(8,index=>zone(`u-${index}`,{connectionIds:['link']})),connections:[{connectionId:'link',zoneIds:repeat(8,index=>`u-${index}`),bottleneckWidth:2}],spacing:10});
 assert.equal(uniform.geometric,0);
 assert.equal(uniform.rating,1);
 assert.ok(organized.normalized>uniform.normalized);
 const fragments=scoreWV04({zones:repeat(12,index=>zone(`m-${index}`,{area:2,normalizedArea:.02+index*.004,normalizedWidth:.2+index*.03,widthToScale:.3,territorialShare:.01})),connections:[],spacing:10});
 assert.equal(fragments.eligibleCount,0);
 assert.equal(fragments.rating,1);
 assert.ok(organized.normalized>fragments.normalized);
 const open=scoreWV04({...hierarchy(),zones:[...hierarchy().zones,zone('void',{area:400,normalizedArea:4,normalizedWidth:2,widthToScale:.7,weaveDefinition:.1,territorialShare:.75})]});
 assert.ok(open.cap<=.4);
 assert.ok(open.normalized<organized.normalized);
 const slivered=scoreWV04({...hierarchy(),zones:[...hierarchy().zones,...repeat(20,index=>zone(`s-${index}`,{area:5,normalizedArea:.5,normalizedWidth:.05,widthToScale:.05,territorialShare:.01}))]});
 assert.equal(slivered.geometric,organized.geometric);
 assert.ok(slivered.cap<organized.cap);
 assert.ok(slivered.normalized<organized.normalized);
 const disconnected=scoreWV04({...hierarchy(),connections:[{connectionId:'link',zoneIds:hierarchy().zones.map(item=>item.zoneId),bottleneckWidth:.5}]});
 assert.equal(disconnected.continuityScore,0);
 assert.ok(disconnected.normalized<organized.normalized);
 const empty=scoreWV04({zones:[],connections:[],spacing:10});
 assert.equal(empty.status,'evaluated');
 assert.equal(empty.rating,1);
});

test('a missing interstitial field fails WV-04 without a zero score',()=>{
 const missing=evaluateWV04({});
 assert.equal(missing.status,'evaluation-failed');
 assert.equal(missing.normalizedScore,null);
 assert.equal(missing.rating,null);
 const unavailable=evaluateWV04({modules:{interstitial:{status:'unavailable'}},artifacts:[{version:'interstitial-v1',artifactId:'gaps-1'}]});
 assert.equal(unavailable.status,'evaluation-failed');
 assert.equal(unavailable.normalizedScore,null);
 const skipped=evaluateWV04({modules:{interstitial:{status:'not_applicable'}}});
 assert.equal(skipped.status,'not-applicable');
 assert.equal(skipped.normalizedScore,null);
});

test('a saved weave stores a WV-04 score from the interstitial artifact without an overall score',()=>{
 clearAnalysisCache();
 const ws=createWorkspace();
 let project=ws.projects[0];
 project.working.carrier=createRectangularCarrier();
 project=finalizeSavedWeaveRecord(project,'WEAVE A',{now:'2026-09-27T12:00:00.000Z',generatorVersion:'TEST-BUILD'}).project;
 const entry=project.carrierStudies[0];
 const result=evaluateWeave(project,entry,{evaluationId:'evaluation-wv04',createdAt:'2026-09-27T12:13:00.000Z'});
 const scored=result.evaluation.criterionResults['WV-04'];
 const reference=result.analysisRun.artifacts.find(item=>item.version==='interstitial-v1');
 assert.equal(scored.status,'evaluated');
 assert.equal(Number.isFinite(scored.normalizedScore),true);
 assert.equal(scored.rating,Math.round((1+4*scored.normalizedScore)*10)/10);
 assert.equal(scored.evidenceRefs.length,1);
 assert.equal(scored.evidenceRefs[0].artifactId,reference.artifactId);
 assert.equal(result.evaluation.criterionResults['WV-05'].status,'evaluated');
 assert.equal(Object.hasOwn(result.evaluation,'overallScore'),false);
 assert.equal(scored.explanation.includes('WV-04 scored'),true);
 assert.equal(Object.hasOwn(scored.components,'interstitialDifferentiation'),true);
 assert.equal(Object.hasOwn(scored.safeguards,'degenerateInterstitial'),true);
 ws.projects[0]=project;
 validateTrustedWorkspace(ws);
});
