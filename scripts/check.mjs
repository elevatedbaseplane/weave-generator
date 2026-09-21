import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('dist'),manifest=JSON.parse(fs.readFileSync('.openai/hosting.json','utf8'));
if(manifest.project_id==='appgprj_6aa6ca6ed94c81919e8ce2d122d91b80'||manifest.project_id==='appgprj_6aa43e7745588191a0338eb9a8fc3b3f')throw new Error('Original site cannot be a rebuild destination.');
if(manifest.static?.directory!=='dist')throw new Error('Unexpected public directory.');
for(const file of fs.readdirSync(root)){if(/\.pdf$|\.md$|\.zip$|\.bundle$/.test(file))throw new Error('Private reference in public output.');}
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)){if(match[1].startsWith('data:'))continue;const asset=match[1].split('?')[0];if(!fs.existsSync(path.join(root,asset)))throw new Error(`Missing asset: ${match[1]}`);}
console.log('PASS: static entrypoint, local references, private-output exclusion, rebuild-only target. Run node --check on each module separately.');
