import test from 'node:test';
import assert from 'node:assert/strict';
import {queryEvaluationRecords,readEvaluationSummary} from '../dist/weave-record.mjs';

function record(name,weaveId,createdAt,evaluation){
 return {name,weaveId,createdAt,evaluations:evaluation?[evaluation]:[]};
}

const records=[
 record('OLD WEAVE','weave-aaa', '2026-09-20T12:00:00.000Z'),
 record('WEAVE PATTERN 02','weave-bbb','2026-09-26T12:00:00.000Z',{overallScore:40}),
 record('FAILED SAMPLE','weave-ccc','2026-09-24T12:00:00.000Z',{status:'evaluation-failed'}),
 record('STALE SAMPLE','weave-ddd','2026-09-22T12:00:00.000Z',{status:'needs-reevaluation',overallScore:0}),
 record('ZERO SCORE','weave-eee','2026-09-21T12:00:00.000Z',{status:'evaluated',overallScore:0})
];

test('search, sort, and filter read stored metadata without changing records',()=>{
 const before=JSON.stringify(records);
 assert.deepEqual(queryEvaluationRecords(records,{search:'pattern'}).map(entry=>entry.name),['WEAVE PATTERN 02']);
 assert.deepEqual(queryEvaluationRecords(records,{search:'weave-ccc'}).map(entry=>entry.weaveId),['weave-ccc']);
 const numbered=[
  record('WEAVE PATTERN 01','weave-d86ab8ae-2c28-4958-b9c3-c54d2ce9a8a0','2026-09-26T12:00:00.000Z'),
  record('WEAVE PATTERN 02','weave-c46ca74e-2e89-4c16-b6aa-7276292f013a','2026-09-26T13:00:00.000Z')
 ];
 assert.deepEqual(queryEvaluationRecords(numbered,{search:'01'}).map(entry=>entry.name),['WEAVE PATTERN 01']);
 assert.deepEqual(queryEvaluationRecords(numbered,{search:'2f013a'}).map(entry=>entry.name),['WEAVE PATTERN 02']);
 assert.deepEqual(queryEvaluationRecords(records,{search:'missing'}),[]);
 assert.deepEqual(queryEvaluationRecords(records,{sort:'oldest'}).map(entry=>entry.weaveId),['weave-aaa','weave-eee','weave-ddd','weave-ccc','weave-bbb']);
 assert.deepEqual(queryEvaluationRecords(records,{sort:'name'}).map(entry=>entry.name),['FAILED SAMPLE','OLD WEAVE','STALE SAMPLE','WEAVE PATTERN 02','ZERO SCORE']);
 assert.deepEqual(queryEvaluationRecords(records,{sort:'status'}).map(entry=>entry.weaveId),['weave-aaa','weave-bbb','weave-eee','weave-ddd','weave-ccc']);
 assert.deepEqual(queryEvaluationRecords(records,{sort:'score'}).map(entry=>entry.weaveId),['weave-bbb','weave-ddd','weave-eee','weave-ccc','weave-aaa']);
 assert.deepEqual(queryEvaluationRecords(records,{filter:'evaluated'}).map(entry=>entry.weaveId),['weave-bbb','weave-eee']);
 assert.deepEqual(queryEvaluationRecords(records,{filter:'not-evaluated'}).map(entry=>entry.weaveId),['weave-aaa']);
 assert.deepEqual(queryEvaluationRecords(records,{filter:'needs-reevaluation'}).map(entry=>entry.weaveId),['weave-ddd']);
 assert.deepEqual(queryEvaluationRecords(records,{filter:'evaluation-failed'}).map(entry=>entry.weaveId),['weave-ccc']);
 assert.equal(JSON.stringify(records),before);
 assert.equal(readEvaluationSummary(records[0]).score,null);
 assert.equal(readEvaluationSummary(records[3]).score,0);
 assert.equal(readEvaluationSummary(records[2]).statusLabel,'EVALUATION FAILED');
});
