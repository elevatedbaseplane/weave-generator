import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {createStitchSource,STITCH_RECIPES,STITCH_SOURCE} from '../dist/stitch-source.mjs';
const app=fs.readFileSync(new URL('../dist/app.mjs',import.meta.url),'utf8');
const code=app.slice(app.indexOf('const stitchControlSpec='),app.indexOf("$('stitch-continuous').onclick="));
test('actual control handlers display percentages and commit exact source ratios',async()=>{
 const nodes=new Map(),node=()=>({append(){},replaceChildren(){},setAttribute(){}}),source=createStitchSource('double-herringbone-field','test');let committed;
 const sandbox={$:id=>{if(!nodes.has(id))nodes.set(id,node());return nodes.get(id)},document:{createElement:node},element:(tag,cls,text)=>({...node(),textContent:text}),STITCH_SOURCE,STITCH_RECIPES,clone:structuredClone,transientProject:()=>({working:{carrier:source}}),attempt:fn=>fn(),pending:null,commitPatternCarrier:async recipe=>{committed=recipe},preparePatternUpdate:()=>{},requestWorking:()=>{},currentWeaveName:()=>''};
 const rows=[];sandbox.$('stitch-sliders').append=r=>rows.push(r);sandbox.element=(tag,cls,text)=>({...node(),textContent:text,append(...children){this.children=children}});
 vm.runInNewContext(code+';renderStitchControls(inputSource);',{...sandbox,inputSource:source});
 for(const [id,shown,next,expected]of [['stitch-rowStep',80,79,.79],['stitch-overlap',25,26,.26],['stitch-pitch',120,121,121]]){const input=rows.flatMap(r=>r.children).find(n=>n.id===id);assert.equal(Number(input.value),shown);input.value=String(next);await input.onchange();assert.equal(committed.parameters[id.slice(7)],expected);}
 assert.equal(source.parameters.rowStep,.8);
});
