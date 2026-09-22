import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {influenceRadiusSvg} from '../dist/influence-export.mjs';

test('each influence radius exports as one exact document-space circle',()=>{
 for(const kind of ['attractor','repeller','deflector']){
  const svg=influenceRadiusSvg({id:'field-1',kind,center:{x:12.5,y:-8},radius:150,direction:37,enabled:true});
  assert.match(svg,/data-weave-export="influence-radius"/);assert.match(svg,new RegExp(`data-influence-kind="${kind}"`));assert.match(svg,/cx="12.5" cy="8" r="150"/);assert.equal((svg.match(/<circle\b/g)||[]).length,1);assert.doesNotMatch(svg,/<line\b|<path\b|<rect\b|direction-handle|influence-direction/);
 }
});

test('radius export validates selected circle geometry',()=>{
 assert.throws(()=>influenceRadiusSvg(null),/Select an influence/);assert.throws(()=>influenceRadiusSvg({id:'x',kind:'deflector',center:{x:0,y:0},radius:0}),/invalid circle radius/);assert.throws(()=>influenceRadiusSvg({id:'x',kind:'other',center:{x:0,y:0},radius:5}),/cannot export/);
});

test('export panel targets only the selected influence and explains deflector exclusion',()=>{
 const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8'),app=fs.readFileSync(new URL('../dist/app.mjs',import.meta.url),'utf8');assert.match(html,/id="export-influence-radius-svg"/);assert.match(html,/EXPORTS THE SELECTED INFLUENCE AS ONE CIRCLE ONLY/);assert.match(html,/DEFLECTOR DIRECTION LINES ARE EXCLUDED/);assert.match(app,/influenceOf|influencesOf/);assert.match(app,/influenceRadiusSvg\(field\)/);assert.match(app,/activeInfluenceId/);
});
