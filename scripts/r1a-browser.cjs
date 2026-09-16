const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const dir=path.resolve('verification/local-r1a');fs.mkdirSync(dir,{recursive:true});
(async()=>{
 const browser=process.env.R1A_CDP?await chromium.connectOverCDP(process.env.R1A_CDP):await chromium.launch({executablePath:process.env.BROWSER_EXE||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const context=await browser.newContext({viewport:{width:1500,height:1000},acceptDownloads:true});
 const errors=[];const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await context.addInitScript(()=>{Object.defineProperty(document,'modelContext',{configurable:true,value:{registerTool:tool=>{window.readTool=tool;}}});});
 const url='http://127.0.0.1:43830/';
 await page.goto(url);await page.waitForFunction(()=>window.readTool);
 // Isolated synthetic schema-3 workspace, never the user's live storage.
 const legacy=await page.evaluate(async()=>{const {createWorkspace}=await import('/document.mjs');const w=createWorkspace();w.schemaVersion=3;for(const p of w.projects){delete p.weaveStudies;delete p.working.weave;}const raw=JSON.stringify(w,null,1);localStorage.setItem('weave-foundation-workspace-v2',raw);return raw;});
 await page.reload();await page.waitForFunction(()=>window.readTool);
 const read=()=>page.evaluate(()=>window.readTool.execute({}));
 const status=()=>page.locator('#status').innerText();
 const open=async id=>{if(!(await page.locator(id).evaluate(e=>e.open)))await page.locator(id+' > summary').click();};
 await open('#carrier-section');await page.locator('#create-carrier').click();
 assert.match(await status(),/CARRIER CREATED/);
 await page.locator('#carrier-name').fill('SOURCE');await page.locator('#save-carrier').click();
 let state=await read();const carrierRevision=state.workspace.projects[0].carrierStudies[0].latestRevisionId;
 assert.equal(await page.evaluate(()=>localStorage.getItem('weave-foundation-workspace-v2-schema3-original')),legacy);
 await open('#weave-section');await page.locator('#weave-source-revision').selectOption(carrierRevision);await page.locator('#create-weave').click();
 assert.match(await status(),/WEAVE CREATED/);
 state=await read();assert.deepEqual(state.workspace.projects[0].working.weave.derived.diagnostics.counts,{A:9,B:9});assert.equal(await page.locator('#weave-derived-layer line').count(),18);
 await page.locator('#show-weave-source').check();const countsBefore=await read();
 for(let i=0;i<3;i++){await page.locator('#show-weave-source').uncheck();await page.locator('#show-weave-source').check();await page.locator('#show-weave-derived').uncheck();await page.locator('#show-weave-derived').check();}
 const countsAfter=await read();assert.equal(countsBefore.carrierDerivationCount,countsAfter.carrierDerivationCount);assert.equal(countsBefore.weaveDerivationCount,countsAfter.weaveDerivationCount);
 const change=async(id,value)=>{await page.locator(id).fill(value);await page.locator(id).press('Tab');};
 const timings={};let start=Date.now();await change('#a-spacing','100');timings.spacingGestureMs=Date.now()-start;
 await change('#carrier-angle','30');assert.match(await page.locator('#weave-summary').innerText(),/MODIFIED/);
 await page.locator('#undo').click();await page.locator('#undo').click();state=await read();assert.equal(state.workspace.projects[0].working.carrier.angleDegrees,0);assert.equal(state.workspace.projects[0].working.carrier.families.A.spacing,50);
 await page.locator('#weave-name').fill('WEAVE TEST');start=Date.now();await page.locator('#save-weave').click();timings.saveMs=Date.now()-start;assert.match(await status(),/WEAVE REVISION SAVED/);
 await change('#a-spacing','100');await page.locator('#save-weave').click();state=await read();const revs=state.workspace.projects[0].weaveStudies[0].revisions;assert.equal(revs.length,2);
 await page.locator('[data-weave-revision="'+revs[0].id+'"]').click();assert.equal((await read()).workspace.projects[0].working.carrier.families.A.spacing,50);
 await page.locator('[data-weave-revision="'+revs[1].id+'"]').click();assert.equal((await read()).workspace.projects[0].working.carrier.families.A.spacing,100);
 start=Date.now();await page.reload();await page.waitForFunction(()=>window.readTool);timings.reloadMs=Date.now()-start;
 assert.equal((await read()).workspace.projects[0].weaveStudies[0].revisions.length,2);
 await open('#weave-section');await page.screenshot({path:path.join(dir,'desktop.png'),fullPage:true});
 // Concave geometry, working weave regenerates while its original source is retained.
 const coord=page.locator('details').filter({has:page.locator('#coordinates')});await coord.locator('summary').click();
 await page.locator('#coordinates').fill('-150,-150\n150,-150\n150,150\n50,150\n50,-50\n-50,-50\n-50,150\n-150,150');await page.locator('#apply-coordinates').click();
 state=await read();const top=state.workspace.projects[0].working.weave.derived.strands.find(p=>p.family==='A'&&p.k===1);assert.equal(top.fragments.length,2);assert.equal(top.fragments[0].points[1].x,-50);assert.equal(top.fragments[1].points[0].x,50);
 await page.locator('#show-weave-derived').uncheck();await page.locator('#show-weave-source').uncheck();
 const downloadPromise=page.waitForEvent('download');await page.locator('#export-derived-svg').click();const downloaded=await downloadPromise;await downloaded.saveAs(path.join(dir,'derived.svg'));const svg=fs.readFileSync(path.join(dir,'derived.svg'),'utf8');
 const parsed=await page.evaluate(text=>{const doc=new DOMParser().parseFromString(text,'image/svg+xml');return {error:!!doc.querySelector('parsererror'),paths:[...doc.querySelectorAll('path')].map(p=>p.getAttribute('d')),metadata:JSON.parse(doc.querySelector('metadata').textContent)};},svg);
 assert.equal(parsed.error,false);assert.equal(parsed.paths.length,state.workspace.projects[0].working.weave.derived.diagnostics.intervals);assert.ok(parsed.paths.every(p=>!p.includes('Z')));assert.equal(parsed.metadata.derived.complete,true);
 await page.locator('#show-weave-derived').check();await page.locator('#fit').click();await page.locator('[data-theme="neo"]').click();await page.screenshot({path:path.join(dir,'concave-neo.png'),fullPage:true});
 const backupPromise=page.waitForEvent('download');await page.locator('#backup').click();const backup=await backupPromise;await backup.saveAs(path.join(dir,'backup.json'));
 const second=await browser.newContext({viewport:{width:1400,height:900}});await second.addInitScript(()=>{Object.defineProperty(document,'modelContext',{configurable:true,value:{registerTool:tool=>{window.readTool=tool;}}});});const other=await second.newPage();other.on('pageerror',e=>errors.push(e.message));await other.goto(url);await other.locator('#import-backup').click();await other.locator('#backup-file').setInputFiles(path.join(dir,'backup.json'));await other.locator('#confirm-import').click();
 await other.waitForFunction(()=>window.readTool.execute({}).workspace.projects.length===2);
 const transferred=await other.evaluate(()=>window.readTool.execute({}).workspace);const imported=transferred.projects.find(p=>p.carrierStudies.length);assert.equal(imported.weaveStudies[0].revisions.length,2);
 for(const rev of imported.weaveStudies[0].revisions){await other.locator('[data-weave-revision="'+rev.id+'"]').click();assert.equal((await other.evaluate(()=>window.readTool.execute({}).workspace.projects.find(p=>p.id===window.readTool.execute({}).workspace.activeProjectId).working)).carrier.families.A.spacing,rev.working.carrier.families.A.spacing);}
 // Responsive/themed verification without moving model coordinates.
 await page.setViewportSize({width:390,height:844});await page.locator('#toggle-controls').click();await page.locator('#toggle-boards').click();await page.locator('[data-theme="dark"]').click();await page.screenshot({path:path.join(dir,'mobile-dark.png'),fullPage:true});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(dir,'browser-results.json'),JSON.stringify({build:'WF-R1A-20260916',passed:['schema3 raw recovery','create 9/9 identity','zero-derivation toggles','spacing/rotation/undo','immutable revisions/reload','concave gaps','hidden raw SVG export','isolated backup transfer','mobile/themes'],timings,errors},null,2));
 await second.close();await context.close();await browser.close();console.log('PASS local browser R1A',JSON.stringify(timings));
})().catch(e=>{console.error(e);process.exit(1);});
