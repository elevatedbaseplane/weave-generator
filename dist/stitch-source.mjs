import {stitchIntentRules} from './stitch-intent.mjs';
// SP1's two reviewed finite surface-run foundations. No backside is rendered.
import {validateBoundaryRecord,bounds} from './boundary.mjs';
import {nextDown,nextUp} from './stitch-rounding.mjs';
export const STITCH_SOURCE='stitch-recipe-v1';
export const STITCH_RECIPES=Object.freeze({
 'double-herringbone-field':{label:'Double Herringbone — continuous field adaptation',roles:['A','B'],runKeys:['U','D'],defaults:{pitch:120,height:60,rowStep:.8,overlap:.25,rotation:0}},
 'double-herringbone':{label:'Double Herringbone — alternating foundation',roles:['A','B'],runKeys:['U','D'],defaults:{pitch:120,height:60,rowGap:30,overlap:.25,rotation:0}},
 'herringbone-square':{label:'Herringbone Square — foundation',roles:['foundation'],runKeys:['T','R','B','L'],defaults:{width:80,height:80,gapX:40,gapY:40,extension:.125,rotation:0}}
});
const herringbone=s=>s.recipeId==='double-herringbone'||s.recipeId==='double-herringbone-field';
const rowPitch=s=>s.recipeId==='double-herringbone-field'?s.parameters.height*s.parameters.rowStep:s.parameters.height+s.parameters.rowGap;
export function changeHerringboneLayout(source,layout){
 validateStitchSource(source);if(!herringbone(source)||!['field','bands'].includes(layout))throw Error('Unsupported herringbone layout.');
 const id=layout==='field'?'double-herringbone-field':'double-herringbone';if(source.recipeId===id)return structuredClone(source);
 const next=createStitchSource(id,source.id,source.construction.version);next.origin=structuredClone(source.origin);
 for(const key of ['pitch','height','overlap','rotation'])next.parameters[key]=source.parameters[key];
 return validateStitchSource(next);
}
const stable=v=>Array.isArray(v)?'['+v.map(stable).join(',')+']':v&&typeof v==='object'?'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}':JSON.stringify(v);
const clone=x=>structuredClone(x),exact=(v,keys)=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).length===keys.length&&keys.every(k=>Object.hasOwn(v,k));
const fail=m=>{throw Error(m);},finite=n=>Number.isFinite(n)&&Math.abs(n)<=1e9;
export function createStitchSource(recipeId,id=`pattern-${crypto.randomUUID()}`,constructionVersion=1){const r=STITCH_RECIPES[recipeId];if(!r)fail('Unknown stitch foundation.');if(![1,2].includes(constructionVersion))fail('Unknown construction version.');const source={kind:STITCH_SOURCE,id,recipeId,recipeVersion:1,parameters:clone(r.defaults),origin:{x:0,y:0},roles:[...r.roles],runKeys:[...r.runKeys],construction:recipeId.startsWith('double-herringbone')?{version:1,backside:[['U','D',0,0],['D','U',1,0]],intent:recipeId==='double-herringbone-field'?'herringbone-field-unresolved-crossings-v1':'alternating-herringbone-v1'}:{version:1,backside:[['T','R',0,0],['R','B',0,0],['B','L',0,0]],intent:'square-cyclic-v1'}};if(constructionVersion===2)source.construction={...source.construction,version:2,rulesVersion:'stitch-intent-v1',rules:stitchIntentRules(recipeId),crossRowPolicy:recipeId==='double-herringbone-field'?'unresolved':'not-authored'};return source;}
export function validateStitchSource(s){
 if(!exact(s,['kind','id','recipeId','recipeVersion','parameters','origin','roles','runKeys','construction'])||s.kind!==STITCH_SOURCE||typeof s.id!=='string'||!s.id||s.id.length>120||new TextEncoder().encode(s.id).length>480||!STITCH_RECIPES[s.recipeId]||s.recipeVersion!==1)fail('Invalid stitch source.');
 const expected=createStitchSource(s.recipeId,s.id,s.construction?.version),p=s.parameters;
 if(!exact(p,Object.keys(expected.parameters))||!exact(s.origin,['x','y'])||!finite(s.origin.x)||!finite(s.origin.y)||JSON.stringify(s.roles)!==JSON.stringify(expected.roles)||JSON.stringify(s.runKeys)!==JSON.stringify(expected.runKeys)||stable(s.construction)!==stable(expected.construction))fail('Invalid stitch construction metadata.');
 for(const [k,v]of Object.entries(p))if(!finite(v)||(k==='rotation'?(v< -180||v>180):v<=0))fail('Stitch dimensions must be positive, finite and within supported limits.');
 if(herringbone(s)&&(p.overlap<.1||p.overlap>.4)||s.recipeId==='herringbone-square'&&(p.extension<.05||p.extension>.25))fail('Stitch overlap or extension is outside its construction range.');
 if(s.recipeId==='double-herringbone-field'&&(p.rowStep<.55||p.rowStep>.9))fail('Field row step must be between 0.55 and 0.9 of band height.');
 if(new TextEncoder().encode(JSON.stringify(s)).length>16384)fail('Stitch source exceeds the 16 KiB bound.');return s;
}
export function stitchReferenceSpacing(s){const p=s.parameters;return herringbone(s)?Math.min(p.pitch/2,p.height,p.overlap*p.pitch/2,s.recipeId==='double-herringbone-field'?p.height*(1-p.rowStep):p.rowGap):Math.min(p.width,p.height,p.extension*p.width,p.extension*p.height,p.gapX,p.gapY);}
export function stitchCell(s,row,column){
 validateStitchSource(s);if(![row,column].every(n=>Number.isInteger(n)&&n>=-2147483648&&n<=2147483647))fail('Stitch cell exceeds Int32 limits.');
 const p=s.parameters,a=p.rotation*Math.PI/180,c=Math.cos(a),z=Math.sin(a),out=[];
 const transform=([x,y])=>{const q={x:s.origin.x+c*x-z*y,y:s.origin.y+z*x+c*y};if(!finite(q.x)||!finite(q.y))fail('Stitch source coordinates exceed supported limits.');return q;};
 const run=(role,key,p0,p1)=>out.push({identity:{patternId:s.id,recipeVersion:1,row,column,roleId:role,runKey:key},p0:transform(p0),p1:transform(p1),domain:[0,1]});
 if(herringbone(s)){const y=row*rowPitch(s),scale=p.pitch/2;for(const [role,d]of [['A',0],['B',1]]){run(role,'U',[(2*column+d)*scale,y],[(2*column+d+1+p.overlap)*scale,y+p.height]);run(role,'D',[(2*column+d+1)*scale,y+p.height],[(2*column+d+2+p.overlap)*scale,y]);}}
 else{const e=p.extension,x=column*((1+2*e)*p.width+p.gapX),y=row*((1+2*e)*p.height+p.gapY),pt=(u,v)=>[x+u*p.width,y+v*p.height];run('foundation','T',pt(-e,1),pt(1+e,1));run('foundation','R',pt(1,1+e),pt(1,-e));run('foundation','B',pt(1+e,0),pt(-e,0));run('foundation','L',pt(0,-e),pt(0,1+e));}
 return out;
}
// Outward interval operations for conservative transformed search bounds.
const I=x=>[nextDown(x),nextUp(x)],add=(a,b)=>[nextDown(a[0]+b[0]),nextUp(a[1]+b[1])],neg=a=>[-a[1],-a[0]],mul=(a,b)=>{const v=[a[0]*b[0],a[0]*b[1],a[1]*b[0],a[1]*b[1]];return[nextDown(Math.min(...v)),nextUp(Math.max(...v))]};
export function stitchCandidates(boundary,s,margin=0){
 validateBoundaryRecord(boundary);validateStitchSource(s);if(!Number.isFinite(margin)||margin<0)fail('Invalid stitch search margin.');
 const b=bounds(boundary.points),p=s.parameters,a=p.rotation*Math.PI/180,c=I(Math.cos(a)),z=I(Math.sin(a)),xs=[],ys=[];
 for(const x of [nextDown(b.minX-margin),nextUp(b.maxX+margin)])for(const y of [nextDown(b.minY-margin),nextUp(b.maxY+margin)]){const dx=add(I(x),neg(I(s.origin.x))),dy=add(I(y),neg(I(s.origin.y)));xs.push(...add(mul(c,dx),mul(z,dy)));ys.push(...add(mul(neg(z),dx),mul(c,dy)));}
 const h=herringbone(s),px=h?p.pitch:(1+2*p.extension)*p.width+p.gapX,py=h?rowPitch(s):(1+2*p.extension)*p.height+p.gapY,minX=h?0:-p.extension*p.width,maxX=h?(3+p.overlap)*p.pitch/2:(1+p.extension)*p.width,minY=h?0:-p.extension*p.height,maxY=h?p.height:(1+p.extension)*p.height;
 const loX=Math.ceil(nextDown((Math.min(...xs)-maxX)/px)),hiX=Math.floor(nextUp((Math.max(...xs)-minX)/px)),loY=Math.ceil(nextDown((Math.min(...ys)-maxY)/py)),hiY=Math.floor(nextUp((Math.max(...ys)-minY)/py));
 if(![loX,hiX,loY,hiY].every(n=>Number.isInteger(n)&&n>=-2147483648&&n<=2147483647))fail('Stitch cell range exceeds Int32 limits.');
 const cells=Math.max(0,hiX-loX+1)*Math.max(0,hiY-loY+1);if(cells*4>2000)fail('Stitch derivation exceeded the 2,000 source-run limit.');
 const runs=[];for(let row=loY;row<=hiY;row++)for(let column=loX;column<=hiX;column++)runs.push(...stitchCell(s,row,column));return runs;
}
