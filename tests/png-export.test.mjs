import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {lineFieldFrame} from '../dist/png-export.mjs';
import {createWorkspace,saveBoundary,saveCarrierStudy,createWeaveStudy,saveWeaveStudy} from '../dist/document.mjs';
import {createLinePreset} from '../dist/line-presets.mjs';
import {derivedSvg} from '../dist/weave.mjs';

function fixture(){const ws=createWorkspace();let project=saveBoundary(ws.projects[0],'PNG BOUNDARY').project;project.working.carrier=createLinePreset('square-grid','png-export');const pattern=saveCarrierStudy(project,'PNG PATTERN');project=createWeaveStudy(pattern.project,pattern.revisionId);return saveWeaveStudy(project,'PNG WEAVE',true).project;}

test('line-field frame uses stroke-aware tight bounds, equal padding and requested long edge',()=>{
 const frame=lineFieldFrame([{d:'M10 20 L110 20',strokeWidth:'8'},{d:'M60 -30 L60 70',strokeWidth:'4'}],8192);
 assert.deepEqual([frame.minX,frame.minY,frame.maxX,frame.maxY],[6,-32,114,72]);assert.equal(frame.padding,16);assert.equal(frame.width,8192);assert.equal(frame.viewWidth,140);assert.equal(frame.viewHeight,136);assert.equal(frame.pathCount,2);
 const left=frame.minX-frame.padding,right=frame.maxX+frame.padding,top=frame.minY-frame.padding,bottom=frame.maxY+frame.padding;assert.equal((left+right)/2,(frame.minX+frame.maxX)/2);assert.equal((top+bottom)/2,(frame.minY+frame.maxY)/2);
});

test('line-field frame supports high-resolution outputs but rejects arbitrary or empty inputs',()=>{
 const paths=[{d:'M0 0 L200 100',strokeWidth:2}];assert.equal(lineFieldFrame(paths,4096).width,4096);assert.equal(lineFieldFrame(paths,8192).width,8192);assert.equal(lineFieldFrame(paths,16384).width,16384);assert.throws(()=>lineFieldFrame(paths,12000),/supported PNG resolution/);assert.throws(()=>lineFieldFrame([],8192),/no visible weave lines/);
});

test('black and white PNG vector sources change only visible line color and contain no background',()=>{
 const project=fixture(),black=derivedSvg(project.working,project.id,true,null,'black'),white=derivedSvg(project.working,project.id,true,null,'white');assert.match(black,/<g fill="none" stroke="black"/);assert.match(white,/<g fill="none" stroke="white"/);assert.doesNotMatch(black,/<rect/);assert.doesNotMatch(white,/<rect/);assert.equal(black.replace('stroke="black"','stroke="white"'),white);
});

test('PNG rasterizer uses a new alpha canvas and vector image without screen capture or background paint',()=>{
 const source=fs.readFileSync(new URL('../dist/png-export.mjs',import.meta.url),'utf8');assert.match(source,/document\.createElement\('canvas'\)/);assert.match(source,/getContext\('2d',\{alpha:true,colorSpace:'srgb'\}\)/);assert.match(source,/context\.clearRect/);assert.match(source,/context\.drawImage/);assert.match(source,/canvas\.toBlob/);assert.match(source,/image\/png/);assert.doesNotMatch(source,/fillRect|drawWindow|html2canvas|getDisplayMedia|toDataURL/);
});
