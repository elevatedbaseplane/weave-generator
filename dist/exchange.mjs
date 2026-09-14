import {validateBoundary,bounds} from './boundary.mjs';
const n=value=>Number(value.toFixed(8));
// One closed polygon per Tangent file. SVG is explicitly Y-down; DXF is Y-up.
export function boundarySvg(boundary) {
  const {points}=validateBoundary(boundary.points),b=bounds(points),pad=Math.max(b.maxX-b.minX,b.maxY-b.minY)*.05;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${n(b.minX-pad)} ${n(-b.maxY-pad)} ${n(b.maxX-b.minX+2*pad)} ${n(b.maxY-b.minY+2*pad)}" data-weave-coordinate-system="document-units;y-up;svg-y-negated"><polygon fill="none" stroke="black" stroke-width="1" points="${points.map(p=>`${n(p.x)},${n(-p.y)}`).join(' ')}"/></svg>`;
}
export function boundaryDxf(boundary) {
  const {points}=validateBoundary(boundary.points);
  const pairs=[[0,'SECTION'],[2,'HEADER'],[9,'$ACADVER'],[1,'AC1015'],[9,'$INSUNITS'],[70,0],[0,'ENDSEC'],[0,'SECTION'],[2,'ENTITIES'],[0,'LWPOLYLINE'],[8,'BOUNDARY'],[90,points.length],[70,1],...points.flatMap(p=>[[10,n(p.x)],[20,n(p.y)]]),[0,'ENDSEC'],[0,'EOF']];
  return pairs.map(([code,value])=>`${code}\n${value}\n`).join('');
}
