const assert=require('node:assert/strict');
// Native pointer transport can round client coordinates to float32. Choose an
// integral display scale so x=0 and x=1 remain exact after that transport.
function densePointer(view,box,x){
 const point={x:box.x+box.width/2+(x-view.cx)*view.scale,y:box.y+box.height/2+view.cy*view.scale};
 const restored={x:Number((view.cx+(Math.fround(point.x)-box.x-box.width/2)/view.scale).toFixed(6)),y:Number((view.cy-(Math.fround(point.y)-box.y-box.height/2)/view.scale).toFixed(6))};
 assert.deepEqual(restored,{x,y:0},'Dense pointer target is not exactly representable at this viewport');
 return point;
}
async function prepareDenseViewport(page,read){
 const before=await read(page),scale=Math.ceil(before.view.scale);
 // View setup only: dispatch a DOM wheel event with double precision through
 // the real UI handler. Native wheel transport rounds both delta and anchor.
 // Derivation measurements still use real mouse down/move/up gestures.
 const geometry=await page.locator('#canvas').evaluate((canvas,{view,scale})=>{
  const rect=canvas.getBoundingClientRect(),vb=canvas.viewBox.baseVal;
  const clientX=rect.left+vb.width/2,clientY=rect.top+vb.height/2;
  if(scale!==view.scale)canvas.dispatchEvent(new WheelEvent('wheel',{clientX,clientY,deltaY:-Math.log(scale/view.scale)/.001,deltaMode:0,bubbles:true,cancelable:true}));
  return{x:rect.left,y:rect.top,width:vb.width,height:vb.height};
 },{view:before.view,scale});
 const after=await read(page),diagnostics={before:before.view,after:after.view,targetScale:scale,box:geometry};
 try{
  assert.deepEqual({cx:after.view.cx,cy:after.view.cy},{cx:before.view.cx,cy:before.view.cy},'View setup moved the document anchor');
  for(const x of [0,1])densePointer(after.view,geometry,x);
 }catch(error){error.setupDiagnostics=diagnostics;throw error;}
 return diagnostics;
}
module.exports={densePointer,prepareDenseViewport};
