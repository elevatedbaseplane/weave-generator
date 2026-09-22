import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../dist/app.mjs',import.meta.url),'utf8');

test('edge refinement preserves bounded seeded crossing controls and current build identity',()=>{
 assert.match(html,/WF-PNG-TILED-LAYER-EXPORT-20260921/);
 assert.match(app,/BUILD='WF-PNG-TILED-LAYER-EXPORT-20260921'/);
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

test('selected crossings expose the effective rule and complete precedence order',()=>{
 assert.match(html,/id="interlace-precedence"[^>]*>RULE ORDER · MANUAL CROSSING · FAMILY PAIR · PATTERN PRESET OR WHOLE WEAVE/);
 assert.match(html,/id="interlace-rule-source"[^>]+aria-live="polite"/);
 assert.match(app,/effectiveWeaveRule\(/);
 assert.match(app,/manual:'MANUAL CROSSING OVERRIDE'/);
 assert.match(app,/return'CONTROLLING RULE · '\+mode/);
 assert.match(app,/CONTROLLING RULE · FAMILY-PAIR RULE/);
 assert.match(app,/CONTROLLING RULE · PATTERN PRESET/);
 assert.match(app,/CONTROLLING RULE · WHOLE WEAVE/);
});

test('contact tension controls use the existing presentation autosave path',()=>{
 assert.match(html,/id="contact-tension-enabled"/);
 assert.match(html,/id="contact-tension-base"[^>]+min="0"[^>]+max="100"/);
 assert.match(html,/id="contact-tension-adaptive"[^>]+min="0"[^>]+max="100"/);
 assert.match(app,/version='interlacing-v4'/);
 assert.match(app,/commitThreadAppearance\(null,v\)/);
 assert.match(app,/contact-tension-enabled'\)\.checked=true/);
});
