import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {influenceRadiiSvg} from '../dist/influence-export.mjs';

test('all influence radii export together as exact document-space circles',()=>{
 const fields=[{id:'field-1',kind:'attractor',center:{x:12.5,y:-8},radius:150,enabled:true},{id:'field-2',kind:'repeller',center:{x:-40,y:30},radius:25,enabled:false},{id:'field-3',kind:'deflector',center:{x:90,y:10},radius:60,direction:37,enabled:true}],svg=influenceRadiiSvg(fields);
 assert.match(svg,/data-weave-export="influence-radii"/);assert.match(svg,/weave-influence-radii-svg/);for(const kind of ['attractor','repeller','deflector'])assert.match(svg,new RegExp(`data-influence-kind="${kind}"`));assert.match(svg,/cx="12.5" cy="8" r="150"/);assert.match(svg,/cx="-40" cy="-30" r="25"/);assert.match(svg,/cx="90" cy="-10" r="60"/);assert.equal((svg.match(/<circle\b/g)||[]).length,3);assert.doesNotMatch(svg,/<line\b|<path\b|<rect\b|direction-handle|influence-direction/);
});

test('radius export validates every circle in the selected weave',()=>{
 assert.throws(()=>influenceRadiiSvg([]),/no influence radii/);assert.throws(()=>influenceRadiiSvg([{id:'x',kind:'deflector',center:{x:0,y:0},radius:0}]),/invalid circle radius/);assert.throws(()=>influenceRadiiSvg([{id:'x',kind:'other',center:{x:0,y:0},radius:5}]),/cannot export/);
});

test('export panel targets every influence in the selected weave and explains exclusions',()=>{
 const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8'),app=fs.readFileSync(new URL('../dist/app.mjs',import.meta.url),'utf8');assert.match(html,/id="export-influence-radius-svg"/);assert.match(html,/EXPORT ALL FIELD RADII SVG/);assert.match(html,/EVERY INFLUENCE BELONGING TO THE SELECTED WEAVE AS CIRCLES IN ONE SVG/);assert.match(html,/DEFLECTOR DIRECTION LINES ARE EXCLUDED/);assert.match(app,/influencesOf/);assert.match(app,/influenceRadiiSvg\(fields\)/);assert.doesNotMatch(app,/influenceRadiusSvg\(field\)/);
});
