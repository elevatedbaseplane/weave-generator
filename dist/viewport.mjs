import {bounds} from './boundary.mjs';
// Uniform scale, Y-up model to Y-down screen; layout is never part of geometry.
export function fitView(points,width,height) {
  const b=bounds(points),spanX=Math.max(1,b.maxX-b.minX),spanY=Math.max(1,b.maxY-b.minY);
  return {cx:(b.minX+b.maxX)/2,cy:(b.minY+b.maxY)/2,scale:Math.max(1e-9,Math.min(Math.max(1,width-120)/spanX,Math.max(1,height-120)/spanY))};
}
export const toScreen=(p,view,width,height)=>({x:width/2+(p.x-view.cx)*view.scale,y:height/2-(p.y-view.cy)*view.scale});
export const toDocument=(p,view,width,height)=>({x:view.cx+(p.x-width/2)/view.scale,y:view.cy-(p.y-height/2)/view.scale});
export function zoomAt(view,factor,point,width,height) {
  const anchor=toDocument(point,view,width,height),scale=Math.max(1e-9,Math.min(1e7,view.scale*factor));
  return {scale,cx:anchor.x-(point.x-width/2)/scale,cy:anchor.y+(point.y-height/2)/scale};
}
