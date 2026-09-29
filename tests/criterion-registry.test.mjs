import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ANALYSIS_MODULE_VERSIONS} from '../dist/analysis.mjs';
import {listCriteria,criterionDefinition,criterionEvaluator,registerCriterionEvaluator,runCriterionEvaluator,validateEvaluatorOutput} from '../dist/evaluation.mjs';
import {readCriterionRecords} from '../dist/weave-record.mjs';

const MODULES=new Set([...Object.keys(ANALYSIS_MODULE_VERSIONS),'subset']);

test('five criteria are registered with separate dependencies and evaluators',()=>{
 const listed=listCriteria();
 assert.deepEqual(listed.map(item=>item.criterionId),['WV-01','WV-02','WV-03','WV-04','WV-05']);
 const questions=new Set(),components=listed.map(item=>item.components.join('|'));
 assert.equal(new Set(components).size,5);
 for(const item of listed){
  assert.equal(item.name.length>0,true);
  assert.equal(item.question.length>20,true);
  questions.add(item.question);
  assert.equal(item.logicVersion,`${item.criterionId.toLowerCase()}-logic-v1`);
  assert.equal(item.calibrationVersion,`${item.criterionId.toLowerCase()}-calibration-v1`);
  assert.equal(item.requiredAnalysis.length>0,true);
  assert.equal(item.requiredAnalysis.every(id=>MODULES.has(id)),true);
  assert.equal(item.conditionalAnalysis.every(entry=>MODULES.has(entry.module)&&entry.when),true);
  assert.equal(typeof item.evaluator,'function');
  assert.equal(criterionEvaluator(item.criterionId),item.evaluator);
  const result=runCriterionEvaluator(item.criterionId,{});
  assert.equal(result.normalizedScore,null);
  assert.equal(result.rating,null);
  assert.equal(result.versions.logic,item.logicVersion);
  if(item.criterionId==='WV-01'||item.criterionId==='WV-02'||item.criterionId==='WV-03'||item.criterionId==='WV-04'||item.criterionId==='WV-05')assert.equal(result.status,'evaluation-failed');
  else{assert.equal(result.status,'not-evaluated');assert.deepEqual(result.components,{});}
 }
 assert.equal(questions.size,5);
 const wv01=criterionDefinition('WV-01'),wv05=criterionDefinition('WV-05');
 assert.deepEqual(wv01.requiredAnalysis,['presence','directional','rhythmic']);
 assert.deepEqual(wv01.conditionalAnalysis,[{module:'modulation',when:'families-share-an-enabled-influence'}]);
 assert.deepEqual(criterionDefinition('WV-02').requiredAnalysis,['modulation']);
 assert.deepEqual(criterionDefinition('WV-03').requiredAnalysis,['events']);
 assert.deepEqual(criterionDefinition('WV-04').requiredAnalysis,['interstitial']);
 assert.deepEqual(wv05.requiredAnalysis,['presence','directional','rhythmic','events','interstitial','subset']);
 assert.equal(wv05.conditionalAnalysis[0].module,'modulation');
});

test('evaluator output accepts different component keys and rejects a false score',()=>{
 const original=criterionEvaluator('WV-01'),base=runCriterionEvaluator('WV-01');
 const distinct={...base,components:{familyDistinctness:0.2,relationalCoupling:0.4},submetrics:{spacingRatio:1.5}};
 const contribution={...runCriterionEvaluator('WV-05'),components:{familyConsequence:0.1},safeguards:{irrelevantFamily:0.3},submetrics:{pairRedundancy:0.2}};
 assert.doesNotThrow(()=>validateEvaluatorOutput(distinct));
 assert.doesNotThrow(()=>validateEvaluatorOutput(contribution));
 assert.throws(()=>validateEvaluatorOutput({...base,status:'evaluation-failed',normalizedScore:0,rating:1}),/Invalid evaluator output/);
 assert.throws(()=>validateEvaluatorOutput({...base,status:'evaluated',normalizedScore:null,rating:null}),/Invalid evaluator output/);
 assert.throws(()=>validateEvaluatorOutput({...distinct,components:{points:[]}}),/heavy geometry/);
 const replacement=()=>({...base,status:'not-applicable',explanation:'One family.'});
 registerCriterionEvaluator('WV-01',replacement);
 try{assert.equal(runCriterionEvaluator('WV-01').status,'not-applicable');}
 finally{registerCriterionEvaluator('WV-01',original);}
});

test('criterion labels come from the registry',()=>{
 const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
 const app=readFileSync(new URL('../dist/app.mjs',import.meta.url),'utf8');
 assert.match(app,/listCriteria/);
 assert.doesNotMatch(html,/DIFFERENTIATED FIELD COHERENCE|CALIBRATED FIELD MODULATION|RELATIONAL EVENT HIERARCHY|ACTIVATED INTERSTITIAL STRUCTURE|LAYERED FAMILY INTERDEPENDENCE/);
 const entry={};
 assert.deepEqual(readCriterionRecords(entry).map(item=>item.title),listCriteria().map(item=>item.name));
});
