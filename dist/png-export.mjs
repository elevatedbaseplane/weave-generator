const ALLOWED_LONG_EDGES=new Set([4096,8192,16384]);
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

export function prepareTransparentPngSvg(svg,longEdge=8192){
 if(typeof svg!=='string'||!svg.includes('<svg'))throw new Error('PNG export requires SVG linework.');
 const documentNode=new DOMParser().parseFromString(svg,'image/svg+xml');
 if(documentNode.querySelector('parsererror'))throw new Error('PNG source SVG is invalid.');
 const root=documentNode.documentElement,frame=lineFieldFrame([...root.querySelectorAll('path[data-weave-family]')].map(path=>({d:path.getAttribute('d'),strokeWidth:path.getAttribute('stroke-width')})),longEdge),{minX,minY,maxX,maxY,padding,viewWidth,viewHeight,width,height,pathCount}=frame;
 root.setAttribute('viewBox',[minX-padding,minY-padding,viewWidth,viewHeight].join(' '));root.setAttribute('width',String(width));root.setAttribute('height',String(height));root.setAttribute('preserveAspectRatio','xMidYMid meet');root.setAttribute('data-weave-export','transparent-png-source');
 return{svg:new XMLSerializer().serializeToString(root),width,height,bounds:{minX,minY,maxX,maxY,padding},pathCount};
}

export async function transparentWeavePng(svg,longEdge=8192){
 const prepared=prepareTransparentPngSvg(svg,longEdge),canvas=document.createElement('canvas');canvas.width=prepared.width;canvas.height=prepared.height;
 const context=canvas.getContext('2d',{alpha:true,colorSpace:'srgb'});if(!context)throw new Error('This browser cannot create the transparent PNG canvas.');context.clearRect(0,0,canvas.width,canvas.height);
 const sourceUrl=URL.createObjectURL(new Blob([prepared.svg],{type:'image/svg+xml'})),image=new Image();
 try{image.src=sourceUrl;if(image.decode)await image.decode();else await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(new Error('The vector linework could not be rasterized.'));});context.drawImage(image,0,0,canvas.width,canvas.height);}finally{URL.revokeObjectURL(sourceUrl);}
 const blob=await new Promise((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('The transparent PNG could not be encoded.')),'image/png'));
 return{blob,width:prepared.width,height:prepared.height,bounds:prepared.bounds,pathCount:prepared.pathCount};
}
