import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {threadStyle,threadPaths,THREAD_DEFAULT} from '../dist/thread-appearance.mjs';

const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../dist/app.mjs',import.meta.url),'utf8');

test('thread appearance has one outline presentation and no ineffective style selector',()=>{
  assert.equal(THREAD_DEFAULT.mode,'outline');
  assert.doesNotMatch(html,/id="thread-mode"|>SOLID</);
  assert.match(html,/THREADS ALWAYS USE A CLEAN OUTLINE/);
  assert.equal(threadStyle({version:'thread-appearance-v1',families:{A:{width:4,mode:'solid'}}},'A').mode,'outline');
  const paths=threadPaths([{family:'A',fragments:[{points:[{x:0,y:0},{x:10,y:0}]}]}],undefined);
  assert.match(paths[0].d,/ Z$/);
});

test('projects, boundaries and saved weaves are direct workflow choices',()=>{
  assert.match(html,/id="board-list" class="library-list"/);
  assert.match(html,/id="boundary-list" class="library-list"/);
  assert.match(html,/id="weave-list" class="library-list"/);
  assert.match(html,/APPLY SELECTED WEAVE TO THIS BOUNDARY/);
  assert.match(html,/id="saved-pattern-presets" label="MY SAVED PATTERNS"/);
  assert.match(app,/option\.value='saved:'\+entry\.latestRevisionId/);
  assert.match(app,/CREATED FROM \$\{savedChoice\?'YOUR SAVED WEAVE':'PRESET'\}/);
  assert.match(app,/adaptGenerationToBoundary/);
});

test('over-under starts with the whole weave and hides advanced crossing editing',()=>{
  assert.match(html,/SHOW WOVEN OVERLAPS/);
  assert.match(html,/1 · WHERE SHOULD THIS RULE APPLY/);
  assert.match(html,/2 · CHOOSE THE WEAVING RHYTHM/);
  assert.match(html,/id="interlace-advanced" class="subsection"/);
  assert.match(app,/activeInterlaceTarget='';/);
  assert.match(app,/\['','THE WHOLE WEAVE'\]/);
});

test('newer-tab activity is surfaced before a field edit is attempted',()=>{
  assert.match(app,/event\.key!==ADVISORY_KEY/);
  assert.match(app,/ANOTHER TAB SAVED A NEWER WORKSPACE\. RELOAD LATEST BEFORE EDITING/);
  assert.match(app,/setEditFeedback\('field','error','PAUSED · ANOTHER TAB SAVED NEWER WORK'\)/);
});
