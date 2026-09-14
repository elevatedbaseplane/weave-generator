// Document-space geometry. No viewport or DOM dependencies.
export const EPSILON = 1e-8;
const cross = (a, b, c) => (b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
const near = (a, b) => Math.hypot(a.x-b.x,a.y-b.y) <= EPSILON;
function onSegment(a,b,p) {
  return Math.abs(cross(a,b,p)) <= EPSILON && p.x >= Math.min(a.x,b.x)-EPSILON && p.x <= Math.max(a.x,b.x)+EPSILON && p.y >= Math.min(a.y,b.y)-EPSILON && p.y <= Math.max(a.y,b.y)+EPSILON;
}
function intersects(a,b,c,d) {
  const abC=cross(a,b,c),abD=cross(a,b,d),cdA=cross(c,d,a),cdB=cross(c,d,b);
  return (abC*abD<0 && cdA*cdB<0) || onSegment(a,b,c) || onSegment(a,b,d) || onSegment(c,d,a) || onSegment(c,d,b);
}
export function signedArea(points) {
  return points.reduce((sum,p,i)=>{const q=points[(i+1)%points.length];return sum+p.x*q.y-q.x*p.y;},0)/2;
}
export function validateBoundary(input) {
  if(!Array.isArray(input) || input.length>1001) throw new Error('Use one polygon with 3–1000 vertices.');
  const points=input.map(p=>{
    if(!p || !Number.isFinite(p.x) || !Number.isFinite(p.y) || Math.max(Math.abs(p.x),Math.abs(p.y))>1e9) throw new Error('Every vertex needs finite X and Y coordinates within ±1,000,000,000.');
    return {x:p.x,y:p.y};
  });
  if(points.length>1 && near(points[0],points.at(-1))) points.pop();
  if(points.length<3) throw new Error('A boundary needs at least three distinct vertices.');
  for(let i=0;i<points.length;i++) {
    const a=points[i],b=points[(i+1)%points.length],c=points[(i+2)%points.length];
    if(near(a,b)) throw new Error('Remove repeated adjacent vertices.');
    if(Math.abs(cross(a,b,c))<=EPSILON && ((a.x-b.x)*(c.x-b.x)+(a.y-b.y)*(c.y-b.y))>EPSILON) throw new Error('Boundary edges must not double back.');
    for(let j=i+1;j<points.length;j++) {
      if(j===i+1 || (i===0 && j===points.length-1)) continue;
      if(intersects(a,b,points[j],points[(j+1)%points.length])) throw new Error('Boundary edges must not cross or touch themselves.');
    }
  }
  if(Math.abs(signedArea(points))<=EPSILON) throw new Error('A boundary must enclose a nonzero area.');
  return {closed:true,points};
}
export function validateBoundarySource(source) {
  if(source===undefined)return undefined;
  if(!source||typeof source!=='object'||Array.isArray(source))throw new Error('Invalid boundary source metadata.');
  const allowed=new Set(['filename','format','axisConversion','width','height','viewBox']);
  if(Object.keys(source).some(key=>!allowed.has(key)))throw new Error('Unsupported boundary source metadata.');
  if(typeof source.filename!=='string'||!source.filename||source.filename.length>255||source.format!=='svg'||source.axisConversion!=='negate-y')throw new Error('Invalid boundary source metadata.');
  const result={filename:source.filename,format:'svg',axisConversion:'negate-y'};
  for(const key of ['width','height','viewBox'])if(source[key]!==undefined){if(typeof source[key]!=='string'||source[key].length>255)throw new Error('Invalid boundary source metadata.');result[key]=source[key];}
  return result;
}
export function validateBoundaryRecord(boundary) {
  if(!boundary||boundary.closed!==true)throw new Error('The boundary must be closed.');
  const result=validateBoundary(boundary.points),source=validateBoundarySource(boundary.source);
  if(source)result.source=source;
  return result;
}
export function square(size=500) {
  if(!Number.isFinite(size)||size<=0||size>1e9) throw new Error('Square side must be greater than zero and at most 1,000,000,000.');
  const h=size/2;
  return validateBoundary([{x:-h,y:-h},{x:h,y:-h},{x:h,y:h},{x:-h,y:h}]);
}
export function bounds(points) {
  const xs=points.map(p=>p.x),ys=points.map(p=>p.y);
  return {minX:Math.min(...xs),maxX:Math.max(...xs),minY:Math.min(...ys),maxY:Math.max(...ys)};
}
export function parseCoordinates(text) {
  return validateBoundary(text.trim().split(/\n/).filter(line=>line.trim()).map(line=>{
    const values=line.trim().split(/[\s,]+/);
    if(values.length!==2) throw new Error('Enter one X, Y pair per line.');
    return {x:Number(values[0]),y:Number(values[1])};
  }));
}
