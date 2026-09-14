import {createWorkspace,createProject,activeProject,clone,saveBoundary,restoreBoundary,findRevision,serializeWorkspace,parseBackup,mergeBackup} from './document.mjs';
import {square,validateBoundary,parseCoordinates,signedArea} from './boundary.mjs';
import {History} from './history.mjs';
import {LocalStore} from './storage.mjs';
import {fitView,toScreen,toDocument,zoomAt} from './viewport.mjs';
import {boundarySvg,boundaryDxf} from './exchange.mjs';
const $=id=>document.getElementById(id),BUILD='WF-1A-20260914';
const store=new LocalStore(localStorage);
let workspace,loadError='';
try{workspace=store.load();}catch(error){workspace=createWorkspace();loadError=error.message;}
const histories=new Map();
const history=()=>{const id=workspace.activeProjectId;if(!histories.has(id))histories.set(id,new History());return histories.get(id);};
let view=null,width=1,height=1,tool='select',draft=[],selected=null,drag=null;
let display={theme:'light',boundary:false,grid:false};
try{const saved=JSON.parse(localStorage.getItem('weave-foundation-view-v1'));if(['light','dark','neo'].includes(saved?.theme))display={theme:saved.theme,boundary:saved.boundary===true,grid:saved.grid===true};}catch{}
const project=()=>activeProject(workspace);
function status(message,error=false){$('status').textContent=message;$('status').classList.toggle('error',error);}
function attempt(action){try{action();}catch(error){status(error.message,true);}}
function persist(next){store.save(next);workspace=next;}
function editWorking(next,label){
  const before=clone(project().working),changed=clone(workspace);activeProject(changed).working=clone(next);
  persist(changed);history().record(before,next);render();status(label);
}
function setBoundary(boundary,label){editWorking({boundary,sourceRevisionId:project().working.sourceRevisionId},label);}
function saveView(){try{localStorage.setItem('weave-foundation-view-v1',JSON.stringify(display));}catch{}document.body.dataset.theme=display.theme;document.querySelectorAll('[data-theme]').forEach(b=>b.classList.toggle('active',b.dataset.theme===display.theme));$('show-boundary').checked=display.boundary;$('show-grid').checked=display.grid;renderCanvas();}
function element(tag,className,text){const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;}
function renderBoards(){
  const list=$('board-list');list.replaceChildren();
  for(const board of workspace.projects){
    const section=element('section','board'),button=element('button',`board-title${board.id===workspace.activeProjectId?' active':''}`,board.name);
    button.dataset.board=board.id;button.setAttribute('aria-label',`Open board ${board.name}`);section.append(button);
    if(board.id===workspace.activeProjectId){
      const content=element('div','board-content');
      if(!board.boundaries.length)content.append(element('p','micro','NO SAVED BOUNDARIES.'));
      for(const entry of board.boundaries){
        const group=element('div','saved-entry');group.append(element('div','saved-name',entry.name));
        for(const revision of [...entry.revisions].reverse()){
          const item=element('button',`revision${revision.id===board.working.sourceRevisionId?' active':''}`,`R${String(revision.number).padStart(2,'0')}${revision.id===entry.latestRevisionId?' · LATEST':''}`);
          item.dataset.revision=revision.id;item.setAttribute('aria-label',`Restore ${entry.name} revision ${revision.number}`);group.append(item);
        }content.append(group);
      }section.append(content);
    }list.append(section);
  }
}
function render(){
  renderBoards();const b=project().working.boundary;
  $('boundary-summary').textContent=`${b.points.length} VERTICES · AREA ${Math.abs(signedArea(b.points)).toLocaleString(undefined,{maximumFractionDigits:3})} U²`;
  $('coordinates').value=b.points.map(p=>`${p.x}, ${p.y}`).join('\n');
  $('undo').disabled=!history().past.length;$('redo').disabled=!history().future.length;
  const source=findRevision(project(),project().working.sourceRevisionId);
  const changed=!source||JSON.stringify(source.revision.boundary)!==JSON.stringify(b);
  $('drawing-title').textContent=`${project().name}${changed?' · UNSAVED CHANGES':''}`;renderCanvas();
}
function syncBoundaryName(){const found=findRevision(project(),project().working.sourceRevisionId);$('boundary-name').value=found?.entry.name||'BOUNDARY 01';}
function svgElement(tag,attributes){const el=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [key,value] of Object.entries(attributes))el.setAttribute(key,String(value));return el;}
function renderCanvas(){
  if(!view)return;
  const geometry=$('geometry'),preview=$('draft-layer');geometry.replaceChildren();preview.replaceChildren();
  const points=drag?.points||project().working.boundary.points;
  if(display.boundary){
    const screen=points.map(p=>toScreen(p,view,width,height));
    geometry.append(svgElement('polygon',{points:screen.map(p=>`${p.x},${p.y}`).join(' '),class:'boundary-path'}));
    if(tool==='select')screen.forEach((p,i)=>{const vertex=svgElement('circle',{cx:p.x,cy:p.y,r:selected===i?6:4,class:`vertex${selected===i?' selected':''}`,'data-vertex':i});geometry.append(vertex);});
  }
  if(draft.length){const screen=draft.map(p=>toScreen(p,view,width,height));preview.append(svgElement('polyline',{points:screen.map(p=>`${p.x},${p.y}`).join(' '),class:'draft-path'}));screen.forEach(p=>preview.append(svgElement('circle',{cx:p.x,cy:p.y,r:4,class:'vertex'})));}
  $('grid-layer').hidden=!display.grid;$('grid-layer').style.display=display.grid?'':'none';
  $('frame-layer').replaceChildren();if(display.grid)$('frame-layer').append(svgElement('rect',{x:40,y:50,width:Math.max(1,width-80),height:Math.max(1,height-100)}));
  $('empty-hint').hidden=display.boundary||tool==='draw';$('zoom-label').textContent=`${(view.scale*100).toFixed(1)}%`;
}
function fit(){view=fitView(project().working.boundary.points,width,height);renderCanvas();}
function setTool(next){tool=next;draft=[];selected=null;drag=null;['select','draw','pan'].forEach(name=>$(`${name}-tool`).classList.toggle('active',name===next));$('draw-actions').hidden=next!=='draw';if(next==='draw')$('boundary-section').open=true;renderCanvas();status(next==='draw'?'CLICK VERTICES. FINISH CLOSES THE BOUNDARY. ESC CANCELS.':next==='pan'?'DRAG TO PAN. SCROLL TO ZOOM.':'CLICK A VERTEX TO SELECT. DRAG TO EDIT.');}
function download(text,name,type='application/json'){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('board-list').addEventListener('click',event=>attempt(()=>{
  const board=event.target.closest('[data-board]'),revision=event.target.closest('[data-revision]');
  if(board){const next=clone(workspace);next.activeProjectId=board.dataset.board;persist(next);setTool('select');syncBoundaryName();render();fit();status('BOARD RESTORED.');}
  if(revision){const restored=restoreBoundary(project(),revision.dataset.revision);editWorking(restored.working,'BOUNDARY REVISION RESTORED.');const entry=project().boundaries.find(e=>e.revisions.some(r=>r.id===revision.dataset.revision));$('boundary-name').value=entry.name;selected=null;}
}));
$('new-board').onclick=()=>$('board-dialog').showModal();
$('board-form').onsubmit=event=>{event.preventDefault();attempt(()=>{const next=clone(workspace),board=createProject($('board-name').value);next.projects.push(board);next.activeProjectId=board.id;persist(next);$('board-dialog').close();setTool('select');render();fit();status('NEW BOARD CREATED.');});};
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());
$('make-square').onclick=()=>attempt(()=>{setBoundary(square(Number($('square-size').value)),'SQUARE CREATED.');setTool('select');display.boundary=true;saveView();fit();});
$('apply-coordinates').onclick=()=>attempt(()=>{setBoundary(parseCoordinates($('coordinates').value),'COORDINATES APPLIED.');display.boundary=true;saveView();selected=null;});
$('save-boundary').onclick=()=>attempt(()=>{const result=saveBoundary(project(),$('boundary-name').value),next=clone(workspace);next.projects=next.projects.map(p=>p.id===result.project.id?result.project:p);persist(next);render();status('REVISION SAVED. OLDER REVISIONS ARE UNCHANGED.');});
for(const name of ['select','draw','pan'])$(`${name}-tool`).onclick=()=>setTool(name);
$('cancel-drawing').onclick=()=>setTool('select');
$('finish-drawing').onclick=()=>attempt(()=>{setBoundary(validateBoundary(draft),'DRAWN BOUNDARY CREATED.');setTool('select');display.boundary=true;saveView();});
$('fit').onclick=fit;
for(const action of ['undo','redo'])$(action).onclick=()=>attempt(()=>{
  const h=history(),oldPast=clone(h.past),oldFuture=clone(h.future),next=clone(workspace);activeProject(next).working=h[action](project().working);
  try{persist(next);}catch(error){h.past=oldPast;h.future=oldFuture;throw error;}selected=null;render();status(action.toUpperCase()+' WORKING DOCUMENT. SAVED REVISIONS RETAINED.');
});
for(const layer of ['boundary','grid'])$(`show-${layer}`).onchange=event=>{display[layer]=event.target.checked;saveView();};
$('reveal-boundary').onclick=()=>{display.boundary=true;saveView();$('boundary-section').open=true;};
document.querySelectorAll('[data-theme]').forEach(b=>b.onclick=()=>{display.theme=b.dataset.theme;saveView();});
for(const rail of ['boards','controls'])$(`toggle-${rail}`).onclick=()=>{const hidden=$('shell').classList.toggle(`${rail}-hidden`);$(`toggle-${rail}`).textContent=`${rail.toUpperCase()} ${hidden?'+':'−'}`;$(`toggle-${rail}`).setAttribute('aria-expanded',String(!hidden));};
$('backup').onclick=()=>attempt(()=>download(serializeWorkspace(workspace),'weave-foundation-backup.json'));
$('raw-backup').onclick=()=>download(store.raw(),'weave-foundation-raw-recovery.json','text/plain');
$('import-backup').onclick=()=>{$('import-message').textContent='';$('backup-dialog').showModal();};
$('backup-file').onchange=async event=>{const file=event.target.files?.[0];if(!file)return;if(file.size>10*1024*1024){$('import-message').textContent='Use a backup smaller than 10 MB.';return;}$('backup-json').value=await file.text();};
$('confirm-import').onclick=()=>{try{const incoming=parseBackup($('backup-json').value),next=mergeBackup(workspace,incoming);persist(next);histories.clear();$('backup-dialog').close();setTool('select');render();fit();status('BACKUP IMPORTED. EXISTING BOARDS RETAINED.');}catch(error){$('import-message').textContent=error.message;}};
$('export-svg').onclick=()=>attempt(()=>download(boundarySvg(project().working.boundary),'weave-boundary.svg','image/svg+xml'));
$('export-dxf').onclick=()=>attempt(()=>download(boundaryDxf(project().working.boundary),'weave-boundary.dxf','application/dxf'));
const localPoint=event=>{const rect=$('canvas').getBoundingClientRect();return {x:event.clientX-rect.left,y:event.clientY-rect.top};};
$('canvas').onpointerdown=event=>{
  if(event.button!==0&&event.button!==1)return;
  const p=localPoint(event);
  if(tool==='draw'&&event.button===0){draft.push(toDocument(p,view,width,height));renderCanvas();return;}
  if(tool==='pan'||event.button===1){event.preventDefault();drag={type:'pan',start:p,view:clone(view)};}
  else if(event.target.dataset.vertex!==undefined){selected=Number(event.target.dataset.vertex);drag={type:'vertex',index:selected,points:clone(project().working.boundary.points)};renderCanvas();}
  else {selected=null;renderCanvas();}
  if(drag)$('canvas').setPointerCapture(event.pointerId);
};
$('canvas').onpointermove=event=>{
  const p=localPoint(event),doc=toDocument(p,view,width,height);$('pointer').textContent=`X ${doc.x.toFixed(2)} / Y ${doc.y.toFixed(2)}`;
  if(drag?.type==='pan'){view={...drag.view,cx:drag.view.cx-(p.x-drag.start.x)/drag.view.scale,cy:drag.view.cy+(p.y-drag.start.y)/drag.view.scale};renderCanvas();}
  else if(drag?.type==='vertex'){drag.points[drag.index]={x:Number(doc.x.toFixed(6)),y:Number(doc.y.toFixed(6))};renderCanvas();}
};
$('canvas').onpointerup=()=>{const completed=drag;drag=null;if(completed?.type==='vertex')attempt(()=>setBoundary(validateBoundary(completed.points),'VERTEX MOVED. ONE UNDO RESTORES THE DRAG.'));renderCanvas();};
$('canvas').onpointercancel=()=>{drag=null;renderCanvas();};
$('canvas').addEventListener('wheel',event=>{event.preventDefault();view=zoomAt(view,Math.exp(-event.deltaY*.001),localPoint(event),width,height);renderCanvas();},{passive:false});
document.addEventListener('keydown',event=>{if(event.target.closest('input,textarea,dialog'))return;if(event.key==='Escape'){setTool('select');return;}if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'){event.preventDefault();$(event.shiftKey?'redo':'undo').click();}if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='y'){event.preventDefault();$('redo').click();}});
new ResizeObserver(entries=>{const r=entries[0].contentRect;width=r.width;height=r.height;$('canvas').setAttribute('viewBox',`0 0 ${width} ${height}`);if(!view)fit();renderCanvas();}).observe($('drawing'));
// All sections start closed; geometry remains in the model while hidden.
document.querySelectorAll('#controls details').forEach(d=>d.open=false);
if(matchMedia('(max-width:760px)').matches){$('toggle-boards').click();$('toggle-controls').click();}
syncBoundaryName();render();saveView();status(store.lastRaw?'WORKSPACE RESTORED. SAVED REVISIONS ARE AVAILABLE IN BOARDS.':'SQUARE READY. SHOW BOUNDARY OR DRAW YOUR OWN.');if(loadError){status(loadError,true);$('raw-backup').hidden=false;}
if(document.modelContext?.registerTool){
  const lifecycle=new AbortController();
  const tool={name:'read_weave_foundation',description:'Read the working boundary, immutable saved revisions, display state and build identity without editing.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute(input){if(!input||typeof input!=='object'||Object.keys(input).length)throw new Error('No input properties are accepted.');return {build:BUILD,workspace:clone(workspace),display:clone(display),view:clone(view),storageBlocked:store.blocked};}};
  try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}
  window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
