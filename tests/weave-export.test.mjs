import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createWorkspace,saveBoundary,saveCarrierStudy,createWeaveStudy,saveWeaveStudy} from '../dist/document.mjs';
import {createLinePreset} from '../dist/line-presets.mjs';
import {changeThreadAppearance} from '../dist/thread-appearance.mjs';
import {changeFieldPresentation} from '../dist/field-presentation.mjs';
import {centerlineSvg,weavePdf} from '../dist/weave.mjs';

function fixture(){
 const ws=createWorkspace();let project=saveBoundary(ws.projects[0],'EXPORT BOUNDARY').project;
 project.working.carrier=createLinePreset('square-grid','structured-export');
 const pattern=saveCarrierStudy(project,'EXPORT PATTERN');project=createWeaveStudy(pattern.project,pattern.revisionId);
 project.working.threadAppearance=changeThreadAppearance(undefined,['A','B'],'A',false,{width:8,rank:5,edgeWidth:.5});
 project.working.threadAppearance=changeThreadAppearance(project.working.threadAppearance,['A','B'],'B',false,{width:4,rank:2,edgeWidth:1});
 project.working.fieldPresentation=changeFieldPresentation(undefined,{mode:'fray'});
 project=saveWeaveStudy(project,'EXPORT WEAVE',true).project;
 return project;
}

test('centerline SVG exports stable open strand geometry grouped by family',()=>{
 const project=fixture(),svg=centerlineSvg(project.working,project.id,true),bodyFragments=project.working.weave.derived.strands.reduce((count,strand)=>count+strand.fragments.length,0);
 assert.match(svg,/data-weave-export="centerlines"/);
 assert.match(svg,/weave-centerline-svg/);
 assert.match(svg,/<g id="family-A"/);
 assert.match(svg,/<g id="family-B"/);
 assert.ok((svg.match(/data-presentation-part="body"/g)||[]).length===bodyFragments);
 assert.ok((svg.match(/data-strand-id=/g)||[]).length>=bodyFragments);
 assert.match(svg,/data-thread-width="8" data-line-weight="0.5" opacity="0.6"/);
 assert.doesNotMatch(svg,/<mask|clip-path|\bZ\b/);
});

test('PDF drawing uses vector strokes only and preserves line weight opacity and chosen color',()=>{
 const project=fixture(),black=new TextDecoder().decode(weavePdf(project.working,project.id,'black',true)),white=new TextDecoder().decode(weavePdf(project.working,project.id,'white',true));
 for(const pdf of [black,white]){assert.ok(pdf.startsWith('%PDF-1.7'));assert.match(pdf,/\/Type \/Page\b/);assert.match(pdf,/\/ExtGState/);assert.match(pdf,/\/CA 0.6 \/ca 0.6/);assert.match(pdf,/0.5 w/);assert.match(pdf,/\nm\b| m\n/);assert.match(pdf,/\nl\b| l\n/);assert.match(pdf,/\nS\n/);const stream=pdf.slice(pdf.indexOf('stream\n')+7,pdf.indexOf('\nendstream'));assert.doesNotMatch(stream,/\bre\b|\bf\b|\bB\b/);}
 assert.match(black,/\n0 G\n/);assert.doesNotMatch(black,/\n1 G\n/);
 assert.match(white,/\n1 G\n/);assert.doesNotMatch(white,/\n0 G\n/);
});

test('export tool exposes SVG, background-free PDF and transparent high-resolution PNG choices',()=>{
 const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8'),app=fs.readFileSync(new URL('../dist/app.mjs',import.meta.url),'utf8');
 for(const id of ['weave-svg-mode','export-weave-svg','weave-pdf-color','export-weave-pdf','weave-png-layer','weave-png-color','weave-png-size','export-weave-png'])assert.match(html,new RegExp(`id="${id}"`));
 assert.match(html,/CENTERLINES · INTERPRETER HANDOFF/);assert.match(html,/FULL WEAVE · AS DRAWN/);assert.match(html,/BLACK LINES/);assert.match(html,/WHITE LINES/);assert.match(html,/NO PAINTED BACKGROUND/);assert.match(html,/<option value="8192" selected>/);assert.match(html,/<option value="16384">/);assert.match(html,/NEVER FROM THE SCREEN/);assert.match(html,/FULLY TRANSPARENT CANVAS/);
 assert.match(html,/SELECTED WEAVE · DISTORTED RESULT/);assert.match(html,/SELECTED WEAVE · SOURCE PATTERN/);assert.match(html,/AN ISOLATED FAMILY EXPORTS BY ITSELF/);
 assert.match(app,/centerlineSvg/);assert.match(app,/derivedSvg/);assert.match(app,/sourceLayerSvg/);assert.match(app,/isolatedFamilyKey\(current\)/);assert.match(app,/transparentWeavePng/);assert.doesNotMatch(html,/id="export-derived-svg"/);
});
