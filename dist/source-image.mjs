// Presentation-only reference picture. Document units, Y up. Never part of certified geometry.
export const SOURCE_IMAGE_MAX_EDGE=4096;
const CORNERS={nw:{x:-1,y:1},ne:{x:1,y:1},sw:{x:-1,y:-1},se:{x:1,y:-1}};
const OPPOSITE={nw:'se',ne:'sw',sw:'ne',se:'nw'};

export function imageRect(placement){
 return {left:placement.center.x-placement.width/2,right:placement.center.x+placement.width/2,bottom:placement.center.y-placement.height/2,top:placement.center.y+placement.height/2};
}

export function cornerPoint(placement,corner){
 const rect=imageRect(placement),sign=CORNERS[corner];
 if(!sign)throw Error('Unknown image corner.');
 return {x:sign.x<0?rect.left:rect.right,y:sign.y<0?rect.bottom:rect.top};
}

export function fitImagePlacement(view,screenWidth,screenHeight,pixelWidth,pixelHeight,padding=48){
 const aspect=pixelWidth/pixelHeight;
 if(!Number.isFinite(aspect)||aspect<=0)throw Error('The image size is invalid.');
 const availW=Math.max(1,(screenWidth-padding*2)/view.scale),availH=Math.max(1,(screenHeight-padding*2)/view.scale);
 const width=availW/availH>aspect?availH*aspect:availW,height=width/aspect;
 return {center:{x:view.cx,y:view.cy},width,height};
}

export function moveImage(placement,dx,dy){
 return {...placement,center:{x:placement.center.x+dx,y:placement.center.y+dy}};
}

export function resizeImageFromCorner(placement,corner,point,minSize=8){
 const anchor=cornerPoint(placement,OPPOSITE[corner]),origin=cornerPoint(placement,corner);
 const ox=origin.x-anchor.x,oy=origin.y-anchor.y,px=point.x-anchor.x,py=point.y-anchor.y,denom=ox*ox+oy*oy;
 const minScale=minSize/Math.max(placement.width,placement.height);
 const scale=Math.max(minScale,denom>0?(px*ox+py*oy)/denom:1);
 const width=placement.width*scale,height=placement.height*scale,next={x:anchor.x+ox*scale,y:anchor.y+oy*scale};
 return {...placement,width,height,center:{x:(anchor.x+next.x)/2,y:(anchor.y+next.y)/2}};
}

export function imageScreenRect(placement,view,screenWidth,screenHeight,project){
 const topLeft=project({x:placement.center.x-placement.width/2,y:placement.center.y+placement.height/2},view,screenWidth,screenHeight);
 return {x:topLeft.x,y:topLeft.y,width:placement.width*view.scale,height:placement.height*view.scale};
}

export function hitSourceImage(screenPoint,screenRect,handleRadius=12){
 const corners={nw:{x:screenRect.x,y:screenRect.y},ne:{x:screenRect.x+screenRect.width,y:screenRect.y},sw:{x:screenRect.x,y:screenRect.y+screenRect.height},se:{x:screenRect.x+screenRect.width,y:screenRect.y+screenRect.height}};
 for(const [corner,point] of Object.entries(corners))if(Math.hypot(screenPoint.x-point.x,screenPoint.y-point.y)<=handleRadius)return {kind:'resize',corner};
 const inside=screenPoint.x>=screenRect.x&&screenPoint.x<=screenRect.x+screenRect.width&&screenPoint.y>=screenRect.y&&screenPoint.y<=screenRect.y+screenRect.height;
 return inside?{kind:'move'}:null;
}

export async function prepareSourceImage(file){
 if(!file)throw Error('Choose an image file.');
 const type=String(file.type||'');
 if(type&&!type.startsWith('image/'))throw Error('Choose an image file.');
 let bitmap;
 try{bitmap=await createImageBitmap(file);}catch{throw Error('This file could not be read as an image.');}
 try{
  const scale=Math.min(1,SOURCE_IMAGE_MAX_EDGE/Math.max(bitmap.width,bitmap.height));
  const width=Math.max(1,Math.round(bitmap.width*scale)),height=Math.max(1,Math.round(bitmap.height*scale));
  const canvas=typeof OffscreenCanvas==='undefined'?Object.assign(document.createElement('canvas'),{width,height}):new OffscreenCanvas(width,height);
  canvas.getContext('2d').drawImage(bitmap,0,0,width,height);
  const blob=canvas.convertToBlob?await canvas.convertToBlob({type:'image/png'}):await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
  if(!blob)throw Error('The image could not be prepared.');
  return {blob,width,height,name:file.name||'IMAGE'};
 }finally{bitmap.close?.();}
}
