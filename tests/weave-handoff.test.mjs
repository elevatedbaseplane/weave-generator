import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createWorkspace,saveCarrierStudy,duplicateLibraryItem,validateTrustedWorkspace} from '../dist/document.mjs';
import {createRectangularCarrier} from '../dist/carrier.mjs';
import {canonical,digest} from '../dist/weave.mjs';
import {appendAnalysisRun,appendEvaluationRun,createAnalysisRun,createEvaluationRun,readWeaveIdentity,readWeaveParent} from '../dist/weave-record.mjs';
import {HANDOFF_VERSION,buildWeaveHandoff,readHandoffSource,recordWeaveHandoff} from '../dist/weave-handoff.mjs';

const NOW='2026-09-27T12:00:00.000Z';

function slot(id,{status='not-evaluated',rating=null,normalizedScore=null,components={},safeguards={},evidenceRefs=[],explanation='',submetrics}={}){
 const number=id.slice(-1);
 const result={criterionId:id,status,normalizedScore,rating,components,safeguards,evidenceRefs,criterionLogicVersion:`wv-0${number}-logic-v1`,calibrationVersion:`wv-0${number}-calibration-v1`,warnings:[],explanation};
 if(submetrics)result.submetrics=submetrics;
 return result;
}

test('a handoff package carries source meaning and leaves the weave unchanged',()=>{
 const ws=createWorkspace();
 let project=ws.projects[0];
 project.working.carrier=createRectangularCarrier();
 project=saveCarrierStudy(project,'WEAVE',{now:NOW,generatorVersion:'TEST-BUILD'}).project;
 const parent=project.carrierStudies[0];
 project=duplicateLibraryItem(project,'pattern',parent.id,{recordsOnly:true});
 const child=project.carrierStudies[1];
 const revision=child.revisions[0];
 const weaveId=readWeaveIdentity(child).weaveId;
 const fingerprint=revision.geometryRef.geometryFingerprint;
 const reference=module=>({artifactId:`artifact-${module}`,version:`${module}-v1`,weaveId,geometryFingerprint:fingerprint,analysisRunId:'analysis-handoff'});
 const events=reference('events'),zones=reference('interstitial'),modulation=reference('modulation');
 appendAnalysisRun(child,createAnalysisRun({analysisRunId:'analysis-handoff',geometryFingerprint:fingerprint,status:'analyzed',moduleVersions:{events:'relational-events-v1',interstitial:'interstitial-v1',modulation:'modulation-v1'},outputs:{config:{subset:'FULL',grid:16},modules:{presence:{status:'complete',familyCount:2},directional:{status:'complete'},rhythmic:{status:'complete'},modulation:{status:'complete'},events:{status:'complete',crossingCount:1},interstitial:{status:'complete',zoneCount:1}}},artifacts:[events,zones,modulation],warnings:[]}));
 child.analysisArtifacts=[
  {...events,module:'events',evidence:{events:[{eventId:'crossing-1',eventType:'crossing',location:{x:1,y:2},participatingFamilies:['family-a','family-b'],participatingStrands:['strand-a','strand-b'],salience:0.8,detectorVersion:'relational-events-v1',magnitudes:[1,2,3]}]}},
  {...zones,module:'interstitial',evidence:{zones:[{zoneId:'zone-1',domainId:'domain-1',effectiveWidth:4,normalizedWidth:0.5,weaveDefinition:0.7,borderingFamilyIds:['family-a'],borderingStrandIds:['strand-a'],cellCount:12}],connections:[{connectionId:'connection-1',zoneIds:['zone-1']}]}},
  {...modulation,module:'modulation',evidence:{families:[{familyId:'family-a',key:'A',coverage:0.4,magnitudes:[9]}]}}
 ];
 appendEvaluationRun(child,createEvaluationRun({evaluationId:'evaluation-handoff',analysisRunId:'analysis-handoff',createdAt:NOW,status:'evaluated',criterionResults:{
  'WV-01':slot('WV-01',{status:'evaluated',rating:4.4,normalizedScore:0.88,components:{familyDistinctness:0.8},safeguards:{effectiveFamilyPresence:1},explanation:'Families stay distinct.',evidenceRefs:[events]}),
  'WV-02':slot('WV-02'),
  'WV-03':slot('WV-03',{status:'evaluated',rating:1,normalizedScore:0,components:{eventSalienceDifferentiation:0.1},safeguards:{eventViability:0.2},evidenceRefs:[events]}),
  'WV-04':slot('WV-04',{evidenceRefs:[zones]}),
  'WV-05':slot('WV-05',{status:'evaluated',rating:3.8,normalizedScore:0.76,components:{familyConsequence:0.7},safeguards:{irrelevantFamily:1},submetrics:{families:[{familyId:'family-a',consequence:0.2,interstitial:0.8}],pairs:[{left:'family-a',right:'family-b',dependency:0.6}]}})
 },versions:{'analysis-run':'analysis-run-v1'},warnings:[],history:[]}));
 const before=canonical({revisions:child.revisions,evaluations:child.evaluations,derivedAnalysis:child.derivedAnalysis,designerData:child.designerData,parent:canonical(parent)});
 const unchanged=JSON.stringify(child);
 const packageObject=buildWeaveHandoff(project,child,{handoffId:'handoff-test',createdAt:NOW});
 assert.equal(JSON.stringify(child),unchanged);
 assert.equal(packageObject.version,HANDOFF_VERSION);
 assert.equal(packageObject.identity.sourceWeaveId,weaveId);
 assert.equal(packageObject.identity.sourceRevisionId,revision.id);
 assert.equal(packageObject.generation.seed,revision.generation.seed);
 assert.equal(packageObject.generation.snapshot.parameters.families.A.spacing,revision.generation.parameters.families.A.spacing);
 assert.equal(packageObject.geometry.geometryFingerprint,fingerprint);
 assert.ok(packageObject.geometry.families.length>=2);
 assert.ok(packageObject.geometry.strands.length>=2);
 assert.equal(packageObject.geometry.centerlines.version,'analysis-geometry-v1');
 assert.ok(packageObject.geometry.centerlines.strands.length>=2);
 assert.equal(packageObject.analysis.analysisRunId,'analysis-handoff');
 assert.equal(packageObject.analysis.events.evidence.events[0].eventId,'crossing-1');
 assert.equal(packageObject.analysis.events.evidence.events[0].participatingStrands[0],'strand-a');
 assert.equal(packageObject.analysis.events.evidence.events[0].magnitudes,undefined);
 assert.equal(packageObject.analysis.interstitial.evidence.zones[0].zoneId,'zone-1');
 assert.equal(packageObject.analysis.interstitial.evidence.zones[0].cellCount,undefined);
 assert.equal(packageObject.analysis.modulation.evidence.families[0].key,'A');
 assert.equal(packageObject.analysis.familyContribution.families[0].consequence,0.2);
 assert.equal(packageObject.evaluation.criteria['WV-01'].rating,4.4);
 assert.equal(packageObject.evaluation.criteria['WV-01'].criterionLogicVersion,'wv-01-logic-v1');
 assert.equal(packageObject.evaluation.criteria['WV-02'].status,'not-evaluated');
 assert.equal(packageObject.evaluation.overallScore,undefined);
 assert.equal(packageObject.overallScore,undefined);
 assert.equal(packageObject.lineage.parent.weaveId,readWeaveIdentity(parent).weaveId);
 const recorded=recordWeaveHandoff(child,packageObject);
 assert.equal(recorded.artifactId,digest(packageObject));
 assert.equal(child.lineage.handoffs[0].handoffId,'handoff-test');
 assert.equal(child.lineage.downstream[0].kind,'interpreter');
 assert.equal(readWeaveParent(child).weaveId,readWeaveIdentity(parent).weaveId);
 packageObject.evaluation.criteria['WV-01'].rating=9;
 packageObject.geometry.centerlines.strands=[];
 assert.equal(child.evaluations.at(-1).criterionResults['WV-01'].rating,4.4);
 assert.equal(canonical({revisions:child.revisions,evaluations:child.evaluations,derivedAnalysis:child.derivedAnalysis,designerData:child.designerData,parent:canonical(parent)}),before);
 const recovered=readHandoffSource(packageObject);
 assert.equal(recovered.sourceWeaveId,weaveId);
 assert.equal(recovered.geometryFingerprint,fingerprint);
 assert.deepEqual(recovered.events,['crossing-1']);
 assert.deepEqual(recovered.zones,['zone-1']);
 assert.equal(recovered.parentWeaveId,readWeaveIdentity(parent).weaveId);
 assert.equal(recovered.ratings['WV-01'],9);
 ws.projects[0]=project;
 validateTrustedWorkspace(ws);
});

test('the evaluation page can send a package without scoring from it',()=>{
 const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
 const app=readFileSync(new URL('../dist/app.mjs',import.meta.url),'utf8');
 const source=readFileSync(new URL('../dist/weave-handoff.mjs',import.meta.url),'utf8');
 assert.match(html,/id="evaluation-detail-handoff"/);
 assert.match(html,/id="evaluation-detail-handoff-note"/);
 assert.match(html,/SEND TO INTERPRETER/);
 assert.match(app,/buildWeaveHandoff\(project\(\),entry\)/);
 assert.match(app,/PACKAGE DOWNLOADED. THIS WEAVE WAS NOT CHANGED/);
 const start=app.indexOf("evaluation-detail-handoff').onclick");
 const handler=app.slice(start,app.indexOf("evaluation-detail-compare-parent').onclick"));
 assert.ok(handler.indexOf('download(')>0&&handler.indexOf('download(')<handler.indexOf('persistLibraryProject'));
 assert.doesNotMatch(source,/evaluateWeave|appendEvaluationRun|scoreWV/);
});
