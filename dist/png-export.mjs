const ALLOWED_LONG_EDGES=new Set([4096,8192,16384]);
const TILE_ROWS=128;
const finite=value=>Number.isFinite(value);

export function lineFieldFrame(paths,longEdge=8192){
 if(!ALLOWED_LONG_EDGES.has(longEdge))throw new Error('Choose a supported PNG resolution.');
 let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity,maxStroke=0,count=0;
 for(const path of paths){
  const numbers=(path.d||'').match(/-?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/gi)?.map(Number)||[],stroke=Number(path.strokeWidth??1);
  if(numbers.length<4||numbers.length%2||!finite(stroke)||stroke<0)throw new Error('PNG source contains invalid line geometry.');
  const half=stroke/2;maxStroke=Math.max(maxStroke,stroke);
  for(let index=0;index<numbers.length;index+=2){const x=numbers[index],y=numbers[index+1];if(!finite(x)||!finite(y))throw new Error('PNG source contains nonfinite line geometry.');minX=Math.min(minX,x-half);minY=Math.min(minY,y-half);maxX=Math.max(maxX,x+half);maxY=Math.max(maxY,y+half);}
  count++;
 }
 if(!count||![minX,minY,maxX,maxY].every(finite)||maxX<=minX||maxY<=minY)throw new Error('PNG export has no visible weave lines.');
 const lineWidth=maxX-minX,lineHeight=maxY-minY,padding=Math.max(maxStroke*2,Math.max(lineWidth,lineHeight)*.035,2),viewWidth=lineWidth+2*padding,viewHeight=lineHeight+2*padding,scale=longEdge/Math.max(viewWidth,viewHeight),width=Math.max(1,Math.round(viewWidth*scale)),height=Math.max(1,Math.round(viewHeight*scale));
 return{minX,minY,maxX,maxY,padding,viewWidth,viewHeight,width,height,pathCount:count};
}

export function prepareTransparentPngSvg(svg,longEdge=8192,{family=null}={}){
 if(typeof svg!=='string'||!svg.includes('<svg'))throw new Error('PNG export requires SVG linework.');
 const documentNode=new DOMParser().parseFromString(svg,'image/svg+xml');
 if(documentNode.querySelector('parsererror'))throw new Error('PNG source SVG is invalid.');
 const root=documentNode.documentElement;
 if(family)for(const path of root.querySelectorAll('path[data-weave-family]'))if(path.getAttribute('data-weave-family')!==family)path.remove();
 const frame=lineFieldFrame([...root.querySelectorAll('path[data-weave-family]')].map(path=>({d:path.getAttribute('d'),strokeWidth:path.getAttribute('stroke-width')})),longEdge),{minX,minY,maxX,maxY,padding,viewWidth,viewHeight,width,height,pathCount}=frame;
 root.setAttribute('viewBox',[minX-padding,minY-padding,viewWidth,viewHeight].join(' '));root.setAttribute('width',String(width));root.setAttribute('height',String(height));root.setAttribute('preserveAspectRatio','none');root.setAttribute('data-weave-export','transparent-png-source');
 return{svg:new XMLSerializer().serializeToString(root),width,height,viewBox:{x:minX-padding,y:minY-padding,width:viewWidth,height:viewHeight},bounds:{minX,minY,maxX,maxY,padding},pathCount};
}

const crcTable=(()=>{const table=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;table[n]=c>>>0;}return table;})();
function crc32(bytes){let crc=0xffffffff;for(const byte of bytes)crc=crcTable[(crc^byte)&255]^(crc>>>8);return(crc^0xffffffff)>>>0;}
export function pngChunk(type,data){
 const typeBytes=new TextEncoder().encode(type),output=new Uint8Array(12+data.length),view=new DataView(output.buffer);view.setUint32(0,data.length);output.set(typeBytes,4);output.set(data,8);view.setUint32(8+data.length,crc32(output.subarray(4,8+data.length)));return output;
}
function tileSvg(prepared,startRow,rowCount){
 const documentNode=new DOMParser().parseFromString(prepared.svg,'image/svg+xml'),root=documentNode.documentElement,{x,y,width,height}=prepared.viewBox,tileY=y+startRow*height/prepared.height,tileHeight=rowCount*height/prepared.height;
 root.setAttribute('viewBox',[x,tileY,width,tileHeight].join(' '));root.setAttribute('width',String(prepared.width));root.setAttribute('height',String(rowCount));root.setAttribute('preserveAspectRatio','none');return new XMLSerializer().serializeToString(root);
}
async function rasterTile(prepared,startRow,rowCount){
 const canvas=document.createElement('canvas');canvas.width=prepared.width;canvas.height=rowCount;
 const context=canvas.getContext('2d',{alpha:true,colorSpace:'srgb',willReadFrequently:true});if(!context)throw new Error('This browser cannot create the transparent PNG canvas.');context.clearRect(0,0,canvas.width,canvas.height);
 const sourceUrl=URL.createObjectURL(new Blob([tileSvg(prepared,startRow,rowCount)],{type:'image/svg+xml'})),image=new Image();
 try{image.src=sourceUrl;if(image.decode)await image.decode();else await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(new Error('The vector linework could not be rasterized.'));});context.drawImage(image,0,0,canvas.width,canvas.height);return context.getImageData(0,0,canvas.width,canvas.height).data;}finally{URL.revokeObjectURL(sourceUrl);image.src='';canvas.width=1;canvas.height=1;}
}

export async function transparentWeavePng(svg,longEdge=8192,{family=null,onProgress=()=>{}}={}){
 if(typeof CompressionStream!=='function')throw new Error('This browser cannot encode the high-resolution PNG safely.');
 const prepared=prepareTransparentPngSvg(svg,longEdge,{family}),stream=new CompressionStream('deflate'),writer=stream.writable.getWriter(),compressed=[];
 const reading=(async()=>{const reader=stream.readable.getReader();for(;;){const{done,value}=await reader.read();if(done)break;compressed.push(value);}})();
 try{for(let start=0;start<prepared.height;start+=TILE_ROWS){const rows=Math.min(TILE_ROWS,prepared.height-start),pixels=await rasterTile(prepared,start,rows),stride=prepared.width*4,scanlines=new Uint8Array(rows*(stride+1));for(let row=0;row<rows;row++)scanlines.set(pixels.subarray(row*stride,(row+1)*stride),row*(stride+1)+1);await writer.write(scanlines);onProgress(Math.min(1,(start+rows)/prepared.height));await new Promise(resolve=>setTimeout(resolve,0));}await writer.close();await reading;}catch(error){await writer.abort(error).catch(()=>{});throw error;}
 const compressedLength=compressed.reduce((sum,part)=>sum+part.length,0),idat=new Uint8Array(compressedLength);let offset=0;for(const part of compressed){idat.set(part,offset);offset+=part.length;}
 const header=new Uint8Array(13),headerView=new DataView(header.buffer);headerView.setUint32(0,prepared.width);headerView.setUint32(4,prepared.height);header[8]=8;header[9]=6;
 const signature=Uint8Array.from([137,80,78,71,13,10,26,10]),blob=new Blob([signature,pngChunk('IHDR',header),pngChunk('IDAT',idat),pngChunk('IEND',new Uint8Array())],{type:'image/png'});
 return{blob,width:prepared.width,height:prepared.height,bounds:prepared.bounds,pathCount:prepared.pathCount};
}
