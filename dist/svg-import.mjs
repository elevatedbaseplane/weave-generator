import {validateBoundary,bounds,EPSILON} from './boundary.mjs';

const NUMBER='[-+]?(?:\\d*\\.\\d+|\\d+\\.?)(?:[eE][-+]?\\d+)?';
const IDENTITY=[1,0,0,1,0,0];
const GEOMETRY=new Set(['polygon','polyline','path','rect','circle','ellipse','line']);
const ALLOWED=new Set(['svg','g','polygon','polyline','path','rect','title','desc','metadata']);
const multiply=(a,b)=>[
  a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],
  a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],
  a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]
];
const applyMatrix=(point,matrix)=>({x:matrix[0]*point.x+matrix[2]*point.y+matrix[4],y:matrix[1]*point.x+matrix[3]*point.y+matrix[5]});
const localName=name=>name.toLowerCase().split(':').at(-1);
const close=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)<=EPSILON;

function numbers(value,label){
  const text=String(value??''),matches=text.match(new RegExp(NUMBER,'g'))||[];
  const remainder=text.replace(new RegExp(NUMBER,'g'),'').replace(/[\s,]/g,'');
  if(remainder||matches.some(value=>!Number.isFinite(Number(value))))throw new Error(`Invalid ${label}.`);
  return matches.map(Number);
}

export function parsePointList(value){
  const values=numbers(value,'point list');
  if(values.length<6||values.length%2)throw new Error('Point list must contain at least three X/Y pairs.');
  return Array.from({length:values.length/2},(_,index)=>({x:values[index*2],y:values[index*2+1]}));
}

export function parseLinePath(value){
  const text=String(value??''),remaining=text.replace(new RegExp(NUMBER,'g'),'').replace(/[MmLlHhVvZz\s,]/g,'');
  if(remaining)throw new Error('Only straight M, L, H, V, and Z path commands are supported.');
  const tokens=text.match(new RegExp(`[MmLlHhVvZz]|${NUMBER}`,'g'))||[],shapes=[];let index=0,command='',x=0,y=0,current=[],closed=false;
  const finish=()=>{if(!closed)throw new Error('Open SVG paths are not boundary inputs. Close the path with Z.');if(current.length>1&&close(current[0],current.at(-1)))current.pop();if(current.length<3)throw new Error('An SVG boundary needs at least three vertices.');shapes.push(current);current=[];closed=false;};
  while(index<tokens.length){
    if(/^[A-Za-z]$/.test(tokens[index]))command=tokens[index++];
    if(!/[MmLlHhVvZz]/.test(command))throw new Error('Only straight M, L, H, V, and Z path commands are supported.');
    if(/[Zz]/.test(command)){closed=true;finish();command='';continue;}
    const relative=command===command.toLowerCase(),upper=command.toUpperCase();
    if(upper==='H'||upper==='V'){if(index>=tokens.length||/^[A-Za-z]$/.test(tokens[index]))throw new Error('Invalid straight SVG path command.');const value=Number(tokens[index++]);if(upper==='H')x=relative?x+value:value;else y=relative?y+value:value;current.push({x,y});continue;}
    if(index+1>=tokens.length||/^[A-Za-z]$/.test(tokens[index])||/^[A-Za-z]$/.test(tokens[index+1]))throw new Error('Invalid straight SVG path command.');
    const nextX=Number(tokens[index++]),nextY=Number(tokens[index++]);x=relative?x+nextX:nextX;y=relative?y+nextY:nextY;
    if(upper==='M'){if(current.length)finish();current=[{x,y}];closed=false;command=relative?'l':'L';}else current.push({x,y});
  }
  if(current.length)finish();
  if(!shapes.length)throw new Error('No closed straight SVG path was found.');
  return shapes;
}

export function parseTransform(value=''){
  const text=String(value).trim();if(!text)return [...IDENTITY];
  const expression=/(matrix|translate|scale|rotate|skewX|skewY)\s*\(([^)]*)\)/g;let result=[...IDENTITY],cursor=0,match;
  while((match=expression.exec(text))){
    if(text.slice(cursor,match.index).trim().replace(/^,/,'').trim())throw new Error('Unsupported SVG transform.');
    const values=numbers(match[2],'SVG transform'),type=match[1].toLowerCase();let next;
    if(type==='matrix'&&values.length===6)next=values;
    else if(type==='translate'&&(values.length===1||values.length===2))next=[1,0,0,1,values[0],values[1]??0];
    else if(type==='scale'&&(values.length===1||values.length===2))next=[values[0],0,0,values[1]??values[0],0,0];
    else if(type==='rotate'&&(values.length===1||values.length===3)){const cosine=Math.cos(values[0]*Math.PI/180),sine=Math.sin(values[0]*Math.PI/180),rotation=[cosine,sine,-sine,cosine,0,0];next=values.length===3?multiply(multiply([1,0,0,1,values[1],values[2]],rotation),[1,0,0,1,-values[1],-values[2]]):rotation;}
    else if(type==='skewx'&&values.length===1)next=[1,0,Math.tan(values[0]*Math.PI/180),1,0,0];
    else if(type==='skewy'&&values.length===1)next=[1,Math.tan(values[0]*Math.PI/180),0,1,0,0];
    else throw new Error('Invalid SVG transform.');
    if(next.some(value=>!Number.isFinite(value)))throw new Error('Invalid SVG transform.');
    result=multiply(result,next);cursor=expression.lastIndex;
  }
  if(!cursor||text.slice(cursor).trim())throw new Error('Unsupported SVG transform.');
  return result;
}

function parseAttributes(source){
  const attributes={};let cursor=0,match;const expression=/([:\w-]+)\s*=\s*("[^"]*"|'[^']*')/g;
  while((match=expression.exec(source))){if(source.slice(cursor,match.index).trim())throw new Error('The SVG contains a malformed attribute.');const name=localName(match[1]);if(name in attributes)throw new Error('The SVG contains a duplicate attribute.');attributes[name]=match[2].slice(1,-1);cursor=expression.lastIndex;}
  if(source.slice(cursor).trim())throw new Error('The SVG contains a malformed attribute.');return attributes;
}

function tokenizeSvg(text){
  if(typeof text!=='string'||!text.trim())throw new Error('Choose a non-empty SVG file.');
  if(/<!DOCTYPE|<!ENTITY/i.test(text))throw new Error('SVG declarations and entities are not supported.');
  const clean=text.replace(/<\?xml[\s\S]*?\?>/gi,'').replace(/<!--[\s\S]*?-->/g,''),tokens=[];const expression=/<([^<>]+)>/g;let cursor=0,match;
  while((match=expression.exec(clean))){if(!tokens.length&&clean.slice(cursor,match.index).trim())throw new Error('The SVG file is not valid XML.');tokens.push(match[1].trim());cursor=expression.lastIndex;}
  if(clean.slice(cursor).trim())throw new Error('The SVG file is not valid XML.');return tokens;
}

export function parseSvgBoundary(text,filename='boundary.svg'){
  const stack=[],shapes=[];let root=null,rootClosed=false;
  for(const raw of tokenizeSvg(text)){
    if(raw.startsWith('!')||raw.startsWith('?'))continue;
    if(rootClosed)throw new Error('The SVG file is not valid XML.');
    if(raw.startsWith('/')){const name=localName(raw.slice(1).trim()),open=stack.pop();if(!open||open.name!==name)throw new Error('The SVG file is not valid XML.');if(name==='svg')rootClosed=true;continue;}
    const selfClosing=/\/$/.test(raw),body=selfClosing?raw.slice(0,-1).trim():raw,nameMatch=body.match(/^([^\s]+)([\s\S]*)$/);if(!nameMatch)throw new Error('The SVG file is not valid XML.');
    const name=localName(nameMatch[1]),attributes=parseAttributes(nameMatch[2]);
    if(!root){if(name!=='svg')throw new Error('The file root must be an SVG element.');root={name,attributes};if(attributes.transform?.trim())throw new Error('Transforms on the root SVG element are not supported.');}
    else if(name==='svg')throw new Error('Nested SVG elements are not supported.');
    if(!ALLOWED.has(name)){if(GEOMETRY.has(name)||['image','use','text'].includes(name))throw new Error(`Unsupported SVG geometry: ${name}.`);throw new Error(`Unsupported SVG element: ${name}.`);}
    const parentMatrix=stack.at(-1)?.matrix??IDENTITY,matrix=name==='svg'?parentMatrix:multiply(parentMatrix,parseTransform(attributes.transform||''));let points=null;
    if(name==='polygon')points=parsePointList(attributes.points||'');
    if(name==='polyline'){points=parsePointList(attributes.points||'');if(!close(points[0],points.at(-1)))throw new Error('Open SVG polylines are not boundary inputs. Repeat the first point at the end.');points.pop();}
    if(name==='rect'){if(Number(attributes.rx||0)||Number(attributes.ry||0))throw new Error('Rounded rectangles must be converted to straight polygons.');const x=Number(attributes.x||0),y=Number(attributes.y||0),width=Number(attributes.width),height=Number(attributes.height);if(!Number.isFinite(x)||!Number.isFinite(y)||!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)throw new Error('The SVG rectangle needs positive numeric width and height.');points=[{x,y},{x:x+width,y},{x:x+width,y:y+height},{x,y:y+height}];}
    if(name==='path'){const paths=parseLinePath(attributes.d||'');if(paths.length!==1)throw new Error('Use exactly one closed SVG boundary.');points=paths[0];}
    if(points)shapes.push(points.map(point=>applyMatrix(point,matrix)));
    if(!selfClosing)stack.push({name,matrix});else if(name==='svg')rootClosed=true;
  }
  if(stack.length||!root||!rootClosed)throw new Error('The SVG file is not valid XML.');
  if(shapes.length!==1)throw new Error(shapes.length?'Use exactly one closed SVG boundary.':'No closed straight SVG boundary was found.');
  const converted=validateBoundary(shapes[0].map(point=>({x:Object.is(point.x,-0)?0:point.x,y:Object.is(-point.y,-0)?0:-point.y}))),source={filename:String(filename||'boundary.svg').slice(0,255),format:'svg',axisConversion:'negate-y'};
  for(const key of ['width','height','viewbox'])if(root.attributes[key]!==undefined)source[key==='viewbox'?'viewBox':key]=root.attributes[key];
  return {...converted,source};
}

export function svgImportSummary(boundary){const area=bounds(boundary.points);return {vertices:boundary.points.length,width:area.maxX-area.minX,height:area.maxY-area.minY,source:boundary.source};}
