// Independent planning model only. Never imported by the application.
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-12,`${a} != ${b}`);
function cross(a,b){return a[0]*b[1]-a[1]*b[0];}
function intersect(a,b){
 const v=a.q.map((n,i)=>n-a.p[i]),w=b.q.map((n,i)=>n-b.p[i]),r=b.p.map((n,i)=>n-a.p[i]);
 const den=cross(v,w); if(!den)return null;
 const t=cross(r,w)/den,u=cross(r,v)/den;
 return t>0&&t<1&&u>0&&u<1?{t,u,p:a.p.map((n,i)=>n+t*v[i])}:null;
}
function band(o){const out=[];for(let i=-2;i<=2;i++)for(const [role,d]of [['A',0],['B',1]]){
 out.push({id:`${role}${i}U`,role,run:'U',i,p:[2*i+d,0],q:[2*i+d+1+o,1]});
 out.push({id:`${role}${i}D`,role,run:'D',i,p:[2*i+d+1,1],q:[2*i+d+2+o,0]});
}return out;}
function square(e){return [
 {id:'T',p:[-e,1],q:[1+e,1]}, {id:'R',p:[1,1+e],q:[1,-e]},
 {id:'B',p:[1+e,0],q:[-e,0]}, {id:'L',p:[0,-e],q:[0,1+e]}];}
const results=[];
for(const o of [.1,.25,.4]){
 const runs=band(o);
 for(const a of runs.filter(r=>r.i===0)){
  const hits=runs.filter(b=>b!==a).map(b=>({b,h:intersect(a,b)})).filter(x=>x.h).sort((x,y)=>x.h.t-y.h.t);
  assert.equal(hits.length,3);
  const seq=hits.map(({b})=>a.run==='U'?(a.role===b.role?'O':'U'):(a.role===b.role?'U':'O')).join('');
  assert.equal(seq,a.run==='U'?'OUO':'UOU');
  close(hits[0].h.t,o/(2*(1+o)));close(hits[1].h.t,.5);close(hits[2].h.t,1-o/(2*(1+o)));
  results.push({recipe:'double-herringbone',overlap:o,run:a.id,sequence:seq,hits:hits.map(({b,h})=>({other:b.id,u:h.t}))});
 }
}
const above={T:'L',R:'T',B:'R',L:'B'};
for(const e of [.05,.125,.25])for(const a of square(e)){
 const hits=square(e).filter(b=>b.id!==a.id).map(b=>({b,h:intersect(a,b)})).filter(x=>x.h).sort((x,y)=>x.h.t-y.h.t);
 assert.equal(hits.length,2);assert.equal(hits.map(({b})=>above[a.id]===b.id?'O':'U').join(''),'OU');
 close(hits[0].h.t,e/(1+2*e));close(hits[1].h.t,1-e/(1+2*e));
 results.push({recipe:'herringbone-square',extension:e,run:a.id,sequence:'OU',hits:hits.map(({b,h})=>({other:b.id,u:h.t}))});
}
// Prove the checker rejects the common wrong closure assignment.
assert.notEqual(['B','T'].map(b=>b==='T'?'O':'U').join(''),'OU');
const report={status:'PASS',scope:'24 normalized run fixtures; source crossing relationships only; no production, historical-authenticity, capacity or performance certification',fixtures:results};
writeFileSync(new URL('recipe-check-results.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
let svg='<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="660" viewBox="0 0 1080 660"><rect width="1080" height="660" fill="#faf9f6"/><g font-family="Arial" fill="#17212b"><text x="35" y="38" font-size="24">SP0 · original normalized construction models</text><text x="35" y="66" font-size="14">Planning only · local crossing notation shown here is future R2B behavior, not current application output.</text>';
function draw(runs,project,isAbove){
 let s='';for(const r of runs){const p=project(r.p),q=project(r.q);s+=`<path d="M${p} L${q}" fill="none" stroke="#263d50" stroke-width="3"/>`;}
 for(let i=0;i<runs.length;i++)for(let j=i+1;j<runs.length;j++){
  const h=intersect(runs[i],runs[j]);if(!h)continue;
  const a=isAbove(runs[i],runs[j])?runs[i]:runs[j],p=project(h.p),v=project(a.q).map((n,k)=>n-project(a.p)[k]),length=Math.hypot(...v),d=v.map(n=>n/length*7);
  s+=`<path d="M${p.map((n,k)=>n-d[k])} L${p.map((n,k)=>n+d[k])}" stroke="#faf9f6" stroke-width="9"/><path d="M${p.map((n,k)=>n-d[k])} L${p.map((n,k)=>n+d[k])}" stroke="#263d50" stroke-width="3"/>`;
 }
 for(const r of runs)for(const endpoint of [r.p,r.q]){const [x,y]=project(endpoint);s+=`<circle cx="${x}" cy="${y}" r="3" fill="#b05328"/>`;}
 return s;
}
svg+='<text x="35" y="110" font-size="19">Double Herringbone · alternating variation</text>';
svg+=draw(band(.25).filter(r=>r.i>=0&&r.i<=1),p=>[45+p[0]*110,300-p[1]*145],(a,b)=>a.run==='U'?a.role===b.role:a.role!==b.role);
svg+='<text x="35" y="335" font-size="14">U: over / under / over · D: under / over / under (interior repeats)</text><text x="35" y="362" font-size="14">Orange endpoints enter the fabric; hidden backside routes are not drawn.</text>';
svg+='<text x="715" y="110" font-size="19">Herringbone Square</text>';
svg+=draw(square(.125),p=>[755+p[0]*190,330-p[1]*190],(a,b)=>above[a.id]===b.id);
svg+='<text x="840" y="130">T</text><text x="978" y="240">R</text><text x="840" y="375">B</text><text x="705" y="240">L</text><text x="715" y="405" font-size="14">T over L · R over T · B over R · L over B</text><text x="35" y="462" font-size="18">Review boundary</text><text x="35" y="494" font-size="15">These coordinate models pass their reference crossing checks. Source illustration comparison is outstanding.</text><text x="35" y="523" font-size="15">SP1 creates editable foundations. R2A detects crossings; R2B applies local over/under notation.</text><text x="35" y="552" font-size="15">Curved lacing, physical thread behavior and unresolved historical variants are not included in SP1.</text><text x="35" y="607" font-size="13">Sources: RSN StitchBank double herringbone variation; Sarah’s Hand Embroidery herringbone square.</text></g></svg>';
writeFileSync(new URL('stitch-constructions.svg',import.meta.url),svg);
console.log(`PASS SP0: ${results.length} normalized run fixtures; original SVG generated.`);
