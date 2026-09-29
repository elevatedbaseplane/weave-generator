import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('the header can open Evaluation and return to the Generator',()=>{
 const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
 const app=readFileSync(new URL('../dist/app.mjs',import.meta.url),'utf8');
 assert.match(html,/<button id="open-evaluation" type="button">EVALUATION<\/button>/);
 assert.match(html,/<button id="open-generator" type="button" hidden>GENERATOR<\/button>/);
 assert.match(html,/<button id="evaluation-back" type="button">GENERATOR<\/button>/);
 assert.match(html,/id="evaluation-library"/);
 assert.match(html,/id="evaluation-search"/);
 assert.match(html,/id="evaluation-sort"/);
 assert.match(html,/id="evaluation-filter"/);
 assert.match(html,/NOT EVALUATED/);
 assert.match(app,/queryEvaluationRecords/);
 assert.match(app,/evaluationSelectedIds/);
 assert.match(html,/id="evaluation-selected"/);
 assert.match(app,/OPEN IN GENERATOR/);
 assert.match(app,/function setWorkspaceView\(view\)/);
 assert.doesNotMatch(app,/setWorkspaceView[\s\S]{0,400}persist\(/);
});
