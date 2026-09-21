import fs from 'node:fs';

// Opt-in loopback preview instrumentation. Never copied into dist or a Site.
export function phase0PreviewAsset(pathname,enabled=false){
 if(!enabled)return null;
 if(pathname==='/__phase0/compatibility-baseline.mjs')return fs.readFileSync(new URL('./compatibility-baseline.mjs',import.meta.url));
 if(pathname!=='/app.mjs')return null;
 const source=fs.readFileSync(new URL('../dist/app.mjs',import.meta.url),'utf8');
 const marker="window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});";
 if(source.split(marker).length!==2)throw Error('Phase 0 diagnostic registration point changed. Review the local adapter.');
 const hook="const {compatibilityBaselineTool}=await import('/__phase0/compatibility-baseline.mjs');\n"+
  "const baselineTool=compatibilityBaselineTool(()=>({build:BUILD,blocked:store.blocked,pending:Boolean(pending||activeJob||threadSaving),packed:store.lastPacked,root:store.head?.currentRoot}), (packed,projectId)=>storageTask({type:'export',packed,projectId}));\n"+
  "try{Promise.resolve(document.modelContext.registerTool(baselineTool,{signal:lifecycle.signal})).catch(()=>{});}catch{}\n";
 return Buffer.from(source.replace(marker,hook+marker));
}
