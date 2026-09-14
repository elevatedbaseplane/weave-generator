const CENTER={x:410,y:360};
const SPAN=1200;
const point=(x,y)=>`${Number(x.toFixed(3))} ${Number(y.toFixed(3))}`;

function parallelFamily(angle,spacing,offset){
  const normal={x:Math.cos(angle),y:Math.sin(angle)};
  const direction={x:-normal.y,y:normal.x};
  const paths=[];
  for(let i=-SPAN;i<=SPAN;i+=spacing){
    const distance=i+offset;
    const anchor={x:CENTER.x+normal.x*distance,y:CENTER.y+normal.y*distance};
    paths.push(`M${point(anchor.x-direction.x*SPAN,anchor.y-direction.y*SPAN)}L${point(anchor.x+direction.x*SPAN,anchor.y+direction.y*SPAN)}`);
  }
  return paths;
}

/** Returns document-coordinate SVG paths. Clipping stays a renderer concern. */
export function latticePaths({mode='rectangular',spacing=40,offset=0}={}){
  const safeSpacing=Math.max(1,Number(spacing)||40);
  const lineOffset=(Math.max(0,Math.min(100,Number(offset)||0))/100)*safeSpacing;
  if(mode==='radial'){
    const origin={x:CENTER.x+Math.max(0,Math.min(100,Number(offset)||0)),y:CENTER.y};
    return Array.from({length:18},(_,index)=>{
      const angle=index*Math.PI/9;
      return `M${point(origin.x,origin.y)}L${point(origin.x+Math.cos(angle)*SPAN,origin.y+Math.sin(angle)*SPAN)}`;
    });
  }
  const angles=mode==='triangular'?[0,Math.PI/3,(2*Math.PI)/3]:[0,Math.PI/2];
  return angles.flatMap(angle=>parallelFamily(angle,safeSpacing,lineOffset));
}
