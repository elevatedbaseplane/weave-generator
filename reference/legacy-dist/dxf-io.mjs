import {bounds,solve} from './geometry.mjs';
import {connectAnchors,networkTangents} from './network.mjs';

const n=value=>Number(Number(value).toFixed(8));
const pair=(code,value)=>`${code}\n${value}\n`;
const area=points=>Math.abs(points.reduce((sum,p,i)=>{const q=points[(i+1)%points.length];return sum+p.x*q.y-q.x*p.y;},0)/2);

export function largestPolygon(shapes){
 if(!shapes?.length)throw new Error('No closed polygon was found.');
 return shapes.reduce((best,shape)=>area(shape)>area(best)?shape:best);
}

export function parseDxfText(text){
 const raw=String(text).replace(/^\uFEFF/,'').split(/\r?\n/),pairs=[];
 for(let i=0;i+1<raw.length;i+=2){const code=Number(raw[i].trim());if(Number.isFinite(code))pairs.push({code,value:raw[i+1].trim()});}
 if(!pairs.some(p=>p.code===0&&p.value.toUpperCase()==='SECTION'))throw new Error('This is not an ASCII DXF file. Save it as ASCII DXF and try again.');
 const shapes=[],errors=[];let unitsCode=0;
 for(let i=0;i<pairs.length;i++){
  if(pairs[i].code===9&&pairs[i].value.toUpperCase()==='$INSUNITS'){
   const unit=pairs.slice(i+1,i+5).find(p=>p.code===70);if(unit)unitsCode=Number(unit.value)||0;
  }
  if(pairs[i].code!==0)continue;
  const type=pairs[i].value.toUpperCase();
  if(type==='LWPOLYLINE'){
   const entity=[];for(i++;i<pairs.length&&pairs[i].code!==0;i++)entity.push(pairs[i]);i--;
   const flags=Number(entity.find(p=>p.code===70)?.value||0),points=[];let current=null;
   for(const p of entity){if(p.code===10){current={x:Number(p.value),y:NaN};points.push(current);}else if(p.code===20&&current)current.y=Number(p.value);}
   if((flags&1)&&points.length>=3&&points.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)))shapes.push(points);else errors.push('Ignored an open or invalid LWPOLYLINE.');
  }else if(type==='POLYLINE'){
   const header=[];for(i++;i<pairs.length&&pairs[i].code!==0;i++)header.push(pairs[i]);
   const flags=Number(header.find(p=>p.code===70)?.value||0),points=[];
   while(i<pairs.length){
    const next=pairs[i].value.toUpperCase();if(pairs[i].code!==0||next==='SEQEND')break;
    if(next!=='VERTEX'){i++;continue;}
    const vertex=[];for(i++;i<pairs.length&&pairs[i].code!==0;i++)vertex.push(pairs[i]);
    const x=Number(vertex.find(p=>p.code===10)?.value),y=Number(vertex.find(p=>p.code===20)?.value);if(Number.isFinite(x)&&Number.isFinite(y))points.push({x,y});
   }
   if((flags&1)&&points.length>=3)shapes.push(points);else errors.push('Ignored an open or invalid POLYLINE.');
  }
 }
 if(!shapes.length)throw new Error(errors[0]||'No closed POLYLINE or LWPOLYLINE was found in this DXF.');
 return {shapes,errors,unitsCode};
}

function header(unitsCode=0){
 return pair(0,'SECTION')+pair(2,'HEADER')+pair(9,'$ACADVER')+pair(1,'AC1009')+pair(9,'$INSUNITS')+pair(70,unitsCode)+pair(0,'ENDSEC')+pair(0,'SECTION')+pair(2,'ENTITIES');
}
const footer=()=>pair(0,'ENDSEC')+pair(0,'EOF');
const line=(a,b,layer)=>pair(0,'LINE')+pair(8,layer)+pair(10,n(a.x))+pair(20,n(a.y))+pair(30,0)+pair(11,n(b.x))+pair(21,n(b.y))+pair(31,0);
const circle=(a,layer)=>pair(0,'CIRCLE')+pair(8,layer)+pair(10,n(a.x))+pair(20,n(a.y))+pair(30,0)+pair(40,n(a.radius));
const point=(a,layer)=>pair(0,'POINT')+pair(8,layer)+pair(10,n(a.x))+pair(20,n(a.y))+pair(30,0);
const text=(a,value,size,layer)=>pair(0,'TEXT')+pair(8,layer)+pair(10,n(a.x+size*.7))+pair(20,n(a.y-size*.7))+pair(30,0)+pair(40,n(size))+pair(1,value);
const deg=r=>((r*180/Math.PI)%360+360)%360;
function arc(a,layer){
 let start=a.start,end=a.start+a.delta;if(a.delta<0)[start,end]=[end,start];
 return pair(0,'ARC')+pair(8,layer)+pair(10,n(a.center.x))+pair(20,n(a.center.y))+pair(30,0)+pair(40,n(a.radius))+pair(50,n(deg(start)))+pair(51,n(deg(end)));
}
function outlineEntities(anchors){
 const g=solve(anchors);if(!g.path)throw new Error('The current radii or wraps do not produce a complete shape.');
 return g.arcs.map((a,i)=>arc(a,'SHAPE')+line(g.edges[i].a,g.edges[i].b,'SHAPE')).join('');
}
function sourceEntities(anchors){return anchors.map((a,i)=>line(a,anchors[(i+1)%anchors.length],'SOURCE')).join('');}
function anchorMetadataEntities(anchors){const g=solve(anchors),size=Math.max(bounds(anchors).width,bounds(anchors).height)/80||1,radials=(g.arcs||[]).map(arc=>arc?line(arc.center,arc.from,'META DATA')+line(arc.center,arc.to,'META DATA'):'').join('');return anchors.map(a=>circle(a,'META DATA')+point(a,'ANCHOR POINT')+text(a,String(a.id).padStart(2,'0'),size,'META DATA')).join('')+radials;}
function orientForDxf(anchors,flipY){return flipY?anchors.map(anchor=>({...anchor,y:-anchor.y,side:-anchor.side})):anchors;}
export function shapeDxf(anchors,unitsCode=0,settings={},flipY=false){anchors=orientForDxf(anchors,flipY);let entities='';if(settings.showSource)entities+=sourceEntities(anchors);if(settings.showOutline??true)entities+=outlineEntities(anchors);if(settings.showAnchorMetadata??settings.showRadii)entities+=anchorMetadataEntities(anchors);if(!entities)throw new Error('Choose at least one export layer.');return header(unitsCode)+entities+footer();}
export function lineSystemDxf(anchors,settings,unitsCode=0,flipY=false){
 anchors=orientForDxf(anchors,flipY);
 const center=connectAnchors(anchors,settings.centerFrom,settings.centerTo,settings.centerSeed,settings.centerRouting||'mixed','centerParticipation'),tangentConnections=connectAnchors(anchors,settings.tangentFrom,settings.tangentTo,settings.tangentSeed,settings.tangentRouting||'mixed','tangentParticipation'),tangents=networkTangents(anchors,tangentConnections.edges,'shape');let entities='';
 if(settings.showSource)entities+=sourceEntities(anchors);
 if(settings.showCenters)entities+=[...new Map(center.edges.map(e=>[[e.from,e.to].sort((a,b)=>a-b).join(':'),e])).values()].map(e=>line(e.a,e.b,'CENTER')).join('');
 if(settings.showTangents)entities+=tangents.edges.map(e=>line(e.a,e.b,'TANGENT')).join('');
 if((settings.showAnchorMetadata??settings.showRadii)!==false)entities+=anchorMetadataEntities(anchors);
 if(settings.showOutline)entities+=outlineEntities(anchors);
 if(!entities)throw new Error('Choose at least one export layer.');return header(unitsCode)+entities+footer();
}
