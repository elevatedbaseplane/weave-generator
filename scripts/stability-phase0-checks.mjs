import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const out='docs/evidence/stability-phase0';
const files=['stability-phase0','atomic-field-commit','project-library','family-architecture','edit-draft','edit-preview-worker','influence-controls','weave-rules','thread-appearance','multitab-capacity-guard','crossing-execution','workflow-cleanup','w2-refinements','stitch-migration','stitch-codec-reuse'].map(n=>'tests/'+n+'.test.mjs');
const commands=[['--test','--test-isolation=none',...files],['--test','--test-isolation=none','--test-name-pattern=schema-4 raw recovery','tests/r1b.test.mjs'],['scripts/check.mjs'],...['dist/app.mjs','scripts/compatibility-baseline.mjs','scripts/phase0-preview.mjs','scripts/serve.mjs','scripts/stability-phase0.mjs','scripts/stability-phase0-checks.mjs'].map(p=>['--check',p])];
const results=[];
for(let i=0;i<commands.length;i++){
 const result=spawnSync(process.execPath,commands[i],{encoding:'utf8',maxBuffer:8*1024*1024}),output=(result.stdout||'')+(result.stderr||'');
 fs.writeFileSync(out+'/focused-check-'+i+'.txt',output);
 results.push({command:['node',...commands[i]],exitCode:result.status,error:result.error?.message,summary:output.split('\n').filter(l=>/^ℹ (tests|pass|fail|duration)|^PASS|^✖/.test(l))});
}
fs.writeFileSync(out+'/focused-checks.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
if(results.some(r=>r.exitCode!==0))process.exitCode=1;
