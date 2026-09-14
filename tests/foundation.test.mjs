import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {square,validateBoundary,validateBoundaryRecord,parseCoordinates,signedArea} from '../dist/boundary.mjs';
import {createWorkspace,createProject,activeProject,saveBoundary,restoreBoundary,findRevision,validateWorkspace,serializeWorkspace,parseBackup,mergeBackup,clone} from '../dist/document.mjs';
import {History} from '../dist/history.mjs';
import {fitView,toScreen,toDocument,zoomAt} from '../dist/viewport.mjs';
import {LocalStore,STORE_KEY,RECOVERY_KEY} from '../dist/storage.mjs';
import {boundarySvg,boundaryDxf} from '../dist/exchange.mjs';
import {parseDxfText} from '../reference/legacy-dist/dxf-io.mjs';
import {parsePointList} from '../reference/legacy-dist/svg-io.mjs';
import {parseSvgBoundary,parseTransform} from '../dist/svg-import.mjs';
const asymmetric=[{x:-40,y:10},{x:120,y:10},{x:120,y:90},{x:30,y:90},{x:30,y:40},{x:-40,y:40}];
const fixture=name=>fs.readFileSync(new URL(`fixtures/${name}.svg`,import.meta.url),'utf8');
test('square is exact, explicit closure and concave polygon preserve vertex order',()=>{
  assert.equal(signedArea(square(500).points),250000);
  assert.deepEqual(validateBoundary([...asymmetric,asymmetric[0]]),{closed:true,points:asymmetric});
  assert.deepEqual(parseCoordinates('-40,10\n120 10\n120,90\n30,90\n30,40\n-40,40').points,asymmetric);
});
test('invalid geometry rejects crossings, touches, doubles, nonfinite and degenerate inputs',()=>{
  for(const pts of [[],[{x:0,y:0},{x:1,y:1}], [{x:0,y:0},{x:1,y:1},{x:0,y:1},{x:1,y:0}], [{x:0,y:0},{x:1,y:0},{x:1,y:0},{x:0,y:1}], [{x:0,y:0},{x:2,y:0},{x:1,y:0},{x:0,y:1}], [{x:0,y:0},{x:1,y:0},{x:2,y:0}], [{x:0,y:0},{x:NaN,y:1},{x:1,y:0}]])assert.throws(()=>validateBoundary(pts));
  assert.throws(()=>square(0));assert.throws(()=>parseCoordinates('1 2 3\n4 5\n6 7'));
});
test('named saves advance latest without mutating prior source revisions',()=>{
  const original=createProject();let p=saveBoundary(original,'A').project;
  const first=clone(p.boundaries[0].revisions[0]),dependent={sourceRevisionId:first.id};
  p.working.boundary=square(200);p=saveBoundary(p,'A').project;
  assert.equal(original.boundaries.length,0);assert.equal(p.boundaries.length,1);assert.equal(p.boundaries[0].revisions.length,2);
  assert.deepEqual(findRevision(p,dependent.sourceRevisionId).revision,first);
  assert.equal(p.boundaries[0].latestRevisionId,p.boundaries[0].revisions[1].id);
  assert.deepEqual(restoreBoundary(p,first.id).working.boundary,square(500));
});
test('A/B/C and current revision survive portable backup, including asymmetric coordinates',()=>{
  let w=createWorkspace();for(const name of ['A','B','C']){activeProject(w).working.boundary=name==='C'?validateBoundary(asymmetric):square(name==='A'?500:200);w.projects[0]=saveBoundary(activeProject(w),name).project;}
  const restored=parseBackup(serializeWorkspace(w));assert.deepEqual(restored,w);
  for(const e of restored.projects[0].boundaries)assert.equal(restoreBoundary(restored.projects[0],e.latestRevisionId).working.boundary.closed,true);
});
test('broken latest, lineage, unsupported units, missing boards and schema fail validation',()=>{
  const base=createWorkspace();base.projects[0]=saveBoundary(activeProject(base),'A').project;
  for(const alter of [w=>w.schemaVersion=1,w=>w.activeProjectId='missing',w=>w.projects[0].coordinateSystem.units='mm',w=>w.projects[0].boundaries[0].latestRevisionId='missing',w=>w.projects[0].boundaries[0].revisions[0].parentRevisionId='missing',w=>w.projects[0].working.sourceRevisionId='missing']){const w=clone(base);alter(w);assert.throws(()=>validateWorkspace(w));}
  assert.throws(()=>parseBackup('{broken'));assert.throws(()=>parseBackup('{"projects":[]}'));
});
test('backup import preserves originals, deduplicates exact boards and forks changed identities',()=>{
  const w=createWorkspace(),incoming=clone(w);assert.deepEqual(mergeBackup(w,incoming),w);
  incoming.projects[0].working.boundary=validateBoundary(asymmetric);const result=mergeBackup(w,incoming);
  assert.equal(result.projects.length,2);assert.deepEqual(result.projects[0],w.projects[0]);assert.notEqual(result.activeProjectId,w.activeProjectId);assert.deepEqual(activeProject(result).working.boundary.points,asymmetric);
  const other=createWorkspace();assert.equal(mergeBackup(w,other).activeProjectId,other.activeProjectId);
});
test('undo groups document operations, clears redo on new edit, leaves saved library intact',()=>{
  const h=new History(),p=saveBoundary(createProject(),'A').project,a=clone(p.working),b={boundary:square(200),sourceRevisionId:a.sourceRevisionId};
  h.record(a,b);assert.deepEqual(h.undo(b),a);assert.deepEqual(h.redo(a),b);h.undo(b);h.record(a,{...a,boundary:square(100)});assert.equal(h.future.length,0);assert.equal(p.boundaries[0].revisions.length,1);
});
test('viewport transform inverts for all aspect ratios; zoom keeps cursor anchor; layout never mutates geometry',()=>{
  const original=clone(asymmetric);
  for(const [width,height] of [[1200,700],[360,600],[500,250]]){
    const view=fitView(asymmetric,width,height);
    for(const p of asymmetric){const back=toDocument(toScreen(p,view,width,height),view,width,height);assert.ok(Math.abs(back.x-p.x)<1e-9&&Math.abs(back.y-p.y)<1e-9);}
    const cursor={x:137,y:93},before=toDocument(cursor,view,width,height),after=toDocument(cursor,zoomAt(view,1.7,cursor,width,height),width,height);assert.ok(Math.hypot(before.x-after.x,before.y-after.y)<1e-9);
  }assert.deepEqual(asymmetric,original);
});
function fakeStorage(){const entries=new Map();return {entries,getItem:key=>entries.get(key)??null,setItem(key,value){entries.set(key,value);}};}
test('browser storage round trip retains previous recovery and rejects conflicting writes',()=>{
  const memory=fakeStorage(),store=new LocalStore(memory),w=store.load();store.save(w);const old=memory.getItem(STORE_KEY);w.projects[0]=saveBoundary(activeProject(w),'A').project;store.save(w);assert.equal(memory.getItem(RECOVERY_KEY),old);assert.deepEqual(new LocalStore(memory).load(),w);
  const other=new LocalStore(memory);other.load();store.save({...w,projects:[{...w.projects[0],name:'CHANGED'}]});assert.throws(()=>other.save(w),/Another tab/);
});
test('unreadable storage is never replaced; quota failure preserves committed workspace',()=>{
  const memory=fakeStorage();memory.setItem(STORE_KEY,'broken');const store=new LocalStore(memory);assert.throws(()=>store.load());assert.throws(()=>store.save(createWorkspace()));assert.equal(memory.getItem(STORE_KEY),'broken');assert.equal(store.raw(),'broken');
  const good=fakeStorage(),s=new LocalStore(good),w=s.load();s.save(w);const saved=good.getItem(STORE_KEY);good.setItem=()=>{throw new Error('Quota');};w.projects[0].name='EDITED';assert.throws(()=>s.save(w),/full/);assert.equal(good.getItem(STORE_KEY),saved);
});
test('Tangent baseline DXF parser preserves declared unit code, order, closure and Y-up geometry',()=>{
  const parsed=parseDxfText(boundaryDxf(validateBoundary(asymmetric)));assert.equal(parsed.unitsCode,0);assert.deepEqual(parsed.shapes,[asymmetric]);
});
test('SVG exchange explicitly negates Y and preserves asymmetric order and scale',()=>{
  const svg=boundarySvg(validateBoundary(asymmetric)),coords=svg.match(/points="([^"]+)"/)[1],parsed=parsePointList(coords);
  assert.deepEqual(parsed.map(p=>({x:p.x,y:-p.y})),asymmetric);assert.ok(svg.includes('svg-y-negated'));assert.equal(Math.abs(signedArea(parsed)),Math.abs(signedArea(asymmetric)));
});
test('SVG import preserves asymmetric order, scale, metadata and one explicit Y conversion',()=>{
  const boundary=parseSvgBoundary(fixture('asymmetric'),'asymmetric.svg');
  assert.deepEqual(boundary.points,asymmetric);
  assert.deepEqual(boundary.source,{filename:'asymmetric.svg',format:'svg',axisConversion:'negate-y',width:'160',height:'80',viewBox:'-40 -90 160 80'});
});
test('SVG import composes numeric group transforms before converting to Y-up',()=>{
  const boundary=parseSvgBoundary(fixture('transformed'),'transformed.svg');
  assert.deepEqual(boundary.points,[{x:100,y:-20},{x:100,y:-60},{x:80,y:-20}]);
  assert.deepEqual(parseTransform('translate(10 20) scale(2)'),[2,0,0,2,10,20]);
});
test('SVG import accepts straight rect, explicitly closed polyline and M/L/H/V/Z path forms',()=>{
  const wrap=content=>`<svg xmlns="http://www.w3.org/2000/svg">${content}</svg>`;
  assert.deepEqual(parseSvgBoundary(wrap('<rect x="1" y="2" width="10" height="20"/>')).points,[{x:1,y:-2},{x:11,y:-2},{x:11,y:-22},{x:1,y:-22}]);
  assert.equal(parseSvgBoundary(wrap('<polyline points="0,0 10,0 0,10 0,0"/>')).points.length,3);
  assert.deepEqual(parseSvgBoundary(wrap('<path d="M0 0 H20 V10 L0 10 Z"/>')).points,[{x:0,y:0},{x:20,y:0},{x:20,y:-10},{x:0,y:-10}]);
  assert.equal(parseSvgBoundary('<svg><title>Boundary preview</title><polygon points="0,0 20,0 0,20"/></svg>').points.length,3);
});
test('invalid SVG fixtures reject explicitly without changing an existing workspace',()=>{
  const original=createWorkspace(),before=clone(original);
  for(const [name,message] of [['open-path','Open SVG paths'],['curve','Only straight'],['multiple','exactly one'],['malformed','not valid XML'],['zero-area','double back|nonzero area'],['crossing','cross or touch']])assert.throws(()=>parseSvgBoundary(fixture(name),`${name}.svg`),new RegExp(message,'i'));
  assert.throws(()=>parseSvgBoundary('<svg transform="scale(2)"><polygon points="0,0 10,0 0,10"/></svg>'),/root SVG/);
  assert.throws(()=>parseSvgBoundary('<svg><circle cx="0" cy="0" r="2"/></svg>'),/Unsupported SVG geometry/);
  assert.throws(()=>parseSvgBoundary('<svg><rect width="10" height="10" rx="2"/></svg>'),/Rounded rectangles/);
  assert.throws(()=>parseSvgBoundary('<svg><polygon points="0,0 NaN,0 0,10"/></svg>'),/Invalid point list/);
  assert.throws(()=>parseSvgBoundary('<svg><g transform="perspective(2)"><polygon points="0,0 10,0 0,10"/></g></svg>'),/Unsupported SVG transform/);
  assert.throws(()=>parseSvgBoundary('<svg><path d="M0 0 L10 0 L0 10 Z M20 0 L30 0 L20 10 Z"/></svg>'),/exactly one/);
  assert.throws(()=>parseSvgBoundary('<svg></svg><polygon points="0,0 10,0 0,10"/>'),/not valid XML/);
  assert.deepEqual(original,before);
});
test('SVG source metadata survives revision save and schema-2 portable backup',()=>{
  let workspace=createWorkspace();activeProject(workspace).working.boundary=parseSvgBoundary(fixture('asymmetric'),'source-file.svg');workspace.projects[0]=saveBoundary(activeProject(workspace),'IMPORTED').project;
  const restored=parseBackup(serializeWorkspace(workspace));assert.deepEqual(restored,workspace);assert.deepEqual(restored.projects[0].boundaries[0].revisions[0].boundary.source,workspace.projects[0].working.boundary.source);
  const withoutSource=createWorkspace();assert.doesNotThrow(()=>validateWorkspace(withoutSource));
  const invalid=clone(workspace);invalid.projects[0].working.boundary.source.extra='markup';assert.throws(()=>validateWorkspace(invalid),/Unsupported boundary source/);
  assert.deepEqual(validateBoundaryRecord(workspace.projects[0].working.boundary),workspace.projects[0].working.boundary);
});
