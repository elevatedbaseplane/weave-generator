const assert=require('node:assert/strict');
// Finish all workspace actions before selecting. Fit intentionally deselects.
async function prepareDenseSelection(page,boardId,{read,open,step=()=>{}}){
 step('board restore');
 await page.locator(`[data-board="${boardId}"]`).click();
 await page.waitForFunction(()=>document.querySelector('#status').textContent==='BOARD RESTORED.',null,{timeout:10000});
 const restored=await read(page);
 assert.equal(restored.workspace.activeProjectId,boardId,'Dense board restore did not finish');
 const board=restored.workspace.projects.find(p=>p.id===boardId),g=board?.working.weave?.generation;
 const field=g?.influences?.[0]||g?.attractor||g?.influence;
 assert.ok(field?.id,'Dense fixture has no influence');
 step('show guides and Fit');
 await open(page,'#field-section');
 await page.locator('#show-attractor').check();
 await page.locator('#fit').click();
 step('select influence and verify guide');
 const item=page.locator('#influence-list button');
 // Attribute comparison avoids putting an imported ID into selector syntax.
 const items=await item.all();let selected=null;
 for(const candidate of items)if(await candidate.getAttribute('data-influence-id')===field.id){selected=candidate;break;}
 assert.ok(selected,'Dense influence is missing from the visible list');
 await selected.click();
 assert.equal(await selected.getAttribute('aria-selected'),'true','Influence list did not select the requested field');
 const handle=page.locator('.attractor-center.active[data-attractor-handle="center"]');
 assert.equal(await handle.count(),1,'Expected exactly one selected influence center after Fit and selection');
 assert.equal(await handle.getAttribute('data-influence-id'),field.id,'Selected guide belongs to another influence');
 assert.equal(await handle.isVisible(),true,'Selected influence center is hidden');
 const box=await handle.boundingBox({timeout:2000});assert.ok(box,'Selected influence has no canvas bounds');
 return {fieldId:field.id,boardId,box};
}
module.exports={prepareDenseSelection};
