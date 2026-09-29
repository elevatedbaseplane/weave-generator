import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createEvaluationRun,appendEvaluationRun} from '../dist/weave-record.mjs';
import {evaluationDataset,parameterPattern,outcomeGroups,familyRolePattern,ADVISORY_BOUNDARY} from '../dist/parameter-analysis.mjs';

const base={components:{},safeguards:{},evidenceRefs:[],warnings:[]};
function scored(id,rating,normalized,components,safeguards,extra={}){
 return {...base,criterionId:id,status:'evaluated',normalizedScore:normalized,rating,components,safeguards,criterionLogicVersion:`${id.toLowerCase()}-logic-v1`,calibrationVersion:`${id.toLowerCase()}-calibration-v1`,...extra};
}
function record(name,spacing,rating,options={}){
 const entry={
  weaveId:`weave-${name}`,
  name,
  revisions:[{
   id:`revision-${name}`,
   carrier:{kind:'rectangular',generatorVersion:'rect-v2'},
   strandIdentity:{families:[{familyId:`${name}-a`,key:'A'},{familyId:`${name}-b`,key:'B'}]},
   generation:{parameters:{families:{A:{spacing,angleDegrees:0,offset:0,density:100},B:{spacing:spacing+10,angleDegrees:90,offset:0,density:80}}},settings:{},modes:{kind:'rectangular'},seed:spacing,domain:{closed:true,points:[{x:0,y:0}]}},
   geometryRef:options.geometryFingerprint?{geometryFingerprint:options.geometryFingerprint}:undefined
  }],
  derivedAnalysis:options.derivedAnalysis||{},
  evaluations:[],
  designerData:{},
  lineage:{}
 };
 const versions={'WV-01-logic':'wv-01-logic-v1','WV-01-calibration':'wv-01-calibration-v1',...options.versions};
 const result=scored('WV-01',rating,rating/5,{familyDistinctness:rating/5,relationalCoupling:0.9},{effectiveFamilyPresence:options.cap??1});
 if(options.families)result.criterionId='WV-01';
 const wv05=scored('WV-05',rating,rating/5,{familyConsequence:rating/5,complementaryInterdependence:0.5},{irrelevantFamily:1},{submetrics:{families:options.families||[{familyId:`${name}-a`,consequence:rating/5,interstitial:0.2,directional:0.5,rhythmic:0.5,events:0.4,modulation:null},{familyId:`${name}-b`,consequence:0.2,interstitial:0.8,directional:0.4,rhythmic:0.4,events:0.3,modulation:null}],nonRedundantComplementarity:0.4}});
 appendEvaluationRun(entry,createEvaluationRun({evaluationId:`evaluation-${name}`,analysisRunId:`analysis-${name}`,createdAt:'2026-09-27T12:00:00.000Z',status:options.status||'evaluated',criterionResults:{'WV-01':options.criterion||result,'WV-05':wv05},versions}));
 if(options.derivedAnalysis)entry.derivedAnalysis=options.derivedAnalysis;
 return entry;
}

test('the research dataset keeps current evaluated weaves and leaves the records unchanged',()=>{
 const current=record('CURRENT',40,4.4);
 const failed=record('FAILED',50,1,{status:'evaluation-failed'});
 const partial=record('PARTIAL',60,2,{status:'partial'});
 const old=record('OLD',70,3,{versions:{'WV-01-logic':'wv-01-logic-v0','WV-01-calibration':'wv-01-calibration-v1'}});
 const stale=record('STALE',80,4,{geometryFingerprint:'new',versions:{'analysis-run':'analysis-STALE','WV-01-logic':'wv-01-logic-v1','WV-01-calibration':'wv-01-calibration-v1'},derivedAnalysis:{runs:[{analysisRunId:'analysis-STALE',geometryFingerprint:'old'}]}});
 const before=JSON.stringify([current,failed,partial,old,stale]);
 const dataset=evaluationDataset([current,failed,partial,old,stale]);
 assert.equal(JSON.stringify([current,failed,partial,old,stale]),before);
 assert.equal(dataset.advisory,ADVISORY_BOUNDARY);
 assert.equal(dataset.includedCount,1);
 assert.equal(dataset.rows.find(row=>row.name==='CURRENT').included,true);
 assert.deepEqual(dataset.rows.find(row=>row.name==='FAILED').flags,['failed']);
 assert.ok(dataset.rows.find(row=>row.name==='PARTIAL').flags.includes('partial'));
 assert.ok(dataset.rows.find(row=>row.name==='OLD').flags.includes('incompatible'));
 assert.ok(dataset.rows.find(row=>row.name==='STALE').flags.includes('stale'));
 const kept=dataset.rows.find(row=>row.name==='CURRENT');
 assert.equal(kept.parameters.find(item=>item.label==='A SPACING').raw,40);
 assert.equal(kept.criteria['WV-01'].rating,4.4);
 assert.ok(Math.abs(kept.criteria['WV-01'].normalizedScore-4.4/5)<1e-12);
 assert.ok(Math.abs(kept.criteria['WV-01'].components.familyDistinctness-4.4/5)<1e-12);
 assert.equal(kept.familyCount,2);
 assert.match(kept.patternSource,/rectangular/);
 assert.equal(kept.familyProfiles[0].spacing,40);
 assert.equal(kept.criteria['WV-05'].metrics.find(item=>item.name==='nonRedundantComplementarity').value,0.4);
});

test('parameter patterns stay per criterion and do not assign a score',()=>{
 const records=[1,2,3,4,5].map(step=>record(`WEAVE ${step}`,step*10,step));
 const dataset=evaluationDataset(records);
 const single=parameterPattern(dataset,{criterionId:'WV-01',outcome:'rating',parameter:'A SPACING'});
 assert.equal(single.sampleSize,5);
 assert.equal(single.groups.length,5);
 assert.ok(single.correlation>0.99);
 assert.match(single.correlationNote,/does not score a weave/);
 assert.equal(single.predictedRating,undefined);
 const pair=parameterPattern(dataset,{criterionId:'WV-01',outcome:'component:familyDistinctness',parameter:'A SPACING',parameterB:'A DENSITY'});
 assert.equal(pair.sampleSize,5);
 assert.match(pair.correlationNote,/does not score a weave/);
 assert.equal(pair.correlation,'');
 const tiny=parameterPattern(evaluationDataset(records.slice(0,2)),{criterionId:'WV-04',outcome:'rating',parameter:'A SPACING'});
 assert.equal(tiny.sampleSize,0);
 assert.match(tiny.correlationNote,/too small/);
 const groups=outcomeGroups(dataset,'WV-01');
 assert.equal(groups.high.sampleSize,2);
 assert.equal(groups.low.sampleSize,2);
 assert.ok(groups.high.names.includes('WEAVE 5'));
 assert.ok(groups.low.names.includes('WEAVE 1'));
 const roles=familyRolePattern(dataset,{parameter:'A SPACING',metric:'consequence'});
 assert.equal(roles.sampleSize,5);
 assert.equal(roles.familyCount,10);
 assert.ok(roles.strongInterstitial>=1);
 assert.equal(roles.advisory,ADVISORY_BOUNDARY);
});

test('the research panel states the advisory boundary',()=>{
 const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
 const app=readFileSync(new URL('../dist/app.mjs',import.meta.url),'utf8');
 const source=readFileSync(new URL('../dist/parameter-analysis.mjs',import.meta.url),'utf8');
 assert.match(html,/id="evaluation-research"/);
 assert.match(html,/Parameter patterns guide exploration/);
 assert.match(app,/evaluationDataset/);
 assert.match(app,/ADVISORY_BOUNDARY/);
 assert.match(app,/scored weaves/);
 assert.match(app,/VERSIONS/);
 assert.doesNotMatch(source,/evaluateWeave|appendEvaluationRun|scoreWV/);
});
