import test from 'node:test';
import assert from 'node:assert/strict';
import {curateDesignerData,readWeaveLineage,createEvaluationRun,appendEvaluationRun} from '../dist/weave-record.mjs';

test('designer curation stays out of the score',()=>{
 const entry={revisions:[{id:'revision-1'}],evaluations:[],designerData:{note:'KEEP'},lineage:{},derivedAnalysis:{}};
 const before=JSON.stringify({evaluations:entry.evaluations,revisions:entry.revisions,lineage:entry.lineage});
 entry.designerData=curateDesignerData(entry.designerData,{favorite:true,advance:true,reject:true,note:'  hold this  '});
 assert.equal(entry.designerData.note,'hold this');
 assert.equal(entry.designerData.favorite,true);
 assert.equal(entry.designerData.reject,true);
 assert.equal(entry.designerData.advance,undefined);
 entry.designerData=curateDesignerData(entry.designerData,{advance:true});
 assert.equal(entry.designerData.advance,true);
 assert.equal(entry.designerData.reject,undefined);
 entry.designerData=curateDesignerData(entry.designerData,{note:''});
 assert.equal(entry.designerData.note,undefined);
 assert.equal(JSON.stringify({evaluations:entry.evaluations,revisions:entry.revisions,lineage:entry.lineage}),before);
 appendEvaluationRun(entry,createEvaluationRun({evaluationId:'evaluation-curation',analysisRunId:'analysis-curation',createdAt:'2026-09-28T00:00:00.000Z',status:'evaluated',criterionResults:{}}));
 const chain=readWeaveLineage(entry);
 assert.equal(chain.saved,true);
 assert.equal(chain.evaluated,'EVALUATED');
 assert.equal(chain.parent,null);
 assert.deepEqual(chain.handoffs,[]);
});
