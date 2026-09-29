import {threadPaths,threadStroke} from './thread-appearance.mjs';

const finitePoint=point=>!!point&&Number.isFinite(point.x)&&Number.isFinite(point.y);

export function weaveAppearanceMarkup(strands,appearance,influences=[]){
 const points=[];
 for(const strand of strands||[])for(const fragment of strand.fragments||[])for(const point of fragment.points||[fragment.start,fragment.end].filter(finitePoint))if(finitePoint(point))points.push(point);
 const fields=(influences||[]).filter(field=>field&&field.enabled!==false&&finitePoint(field.center)&&Number.isFinite(field.radius)&&field.radius>0);
 for(const field of fields)points.push({x:field.center.x-field.radius,y:field.center.y-field.radius},{x:field.center.x+field.radius,y:field.center.y+field.radius});
 if(!points.length)return '';
 let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
 for(const point of points){minX=Math.min(minX,point.x);minY=Math.min(minY,point.y);maxX=Math.max(maxX,point.x);maxY=Math.max(maxY,point.y);}
 const width=maxX-minX||1,height=maxY-minY||1,scale=Math.min(48/width,34/height),ox=2+(48-width*scale)/2,oy=2+(34-height*scale)/2;
 const projectPoint=point=>({x:ox+(point.x-minX)*scale,y:oy+(maxY-point.y)*scale});
 const paths=threadPaths(strands||[],appearance,projectPoint).filter(record=>record.d).map(record=>{
  const family=/^[A-H]$/.test(record.family)?record.family:'';
  return `<path class="weave-preview-thread" data-weave-family="${family}" style="--preview-stroke:${(threadStroke(record)*scale).toFixed(3)}" d="${record.d}"/>`;
 }).join('');
 const rings=fields.map(field=>{const center=projectPoint(field.center);return `<circle class="weave-preview-influence" cx="${center.x.toFixed(2)}" cy="${center.y.toFixed(2)}" r="${(field.radius*scale).toFixed(2)}"/>`;}).join('');
 if(!paths&&!rings)return '';
 return `<svg viewBox="0 0 52 38" aria-label="Weave preview">${paths}${rings}</svg>`;
}
