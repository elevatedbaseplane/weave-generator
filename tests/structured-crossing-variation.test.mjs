import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../dist/app.mjs',import.meta.url),'utf8');

test('Phase 1D exposes bounded seeded crossing controls and current build identity',()=>{
 assert.match(html,/WF-B1-P1D-SEEDED-VARIATION-20260921/);
 assert.match(app,/BUILD='WF-B1-P1D-SEEDED-VARIATION-20260921'/);
 assert.match(html,/<option value="seeded">SEEDED STRUCTURED VARIATION<\/option>/);
 assert.match(html,/id="interlace-seed"[^>]+min="0"[^>]+max="65535"/);
 assert.match(html,/id="interlace-balance"[^>]+min="10"[^>]+max="90"[^>]+step="5"/);
 assert.match(html,/id="interlace-max-run"[^>]+min="1"[^>]+max="8"/);
 assert.match(html,/id="interlace-new-seed"/);
});

test('seeded controls use the same autosaved interlacing update path',()=>{
 assert.match(app,/\['seed','balance','max-run'\]/);
 assert.match(app,/updateInterlacing\(false,true\)/);
 assert.match(app,/selectedMode==='seeded'\?'interlacing-v3'/);
 assert.match(app,/Seeded variation applies to the whole weave/);
});
