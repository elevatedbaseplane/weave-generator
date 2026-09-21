import {stitchIntentRules} from './stitch-intent.mjs';
export const familyOf=s=>s.family||s.identity?.roleId;
export const defaultRule=(recipe='')=>({mode:'preset',recipe,inverted:false,over:1,under:1,phase:0,pairs:[]});
export const NAMED_RULE_MODES=Object.freeze(['preset','alternating','two-over-one','grouped','priority']);
export function namedRuleMode(rule){
 if(rule.mode==='preset'||rule.mode==='priority')return rule.mode;
 if(rule.over===1&&rule.under===1)return'alternating';
 if(rule.over===2&&rule.under===1)return'two-over-one';
 return'grouped';
}
export function applyNamedRuleMode(rule,mode){
 if(!NAMED_RULE_MODES.includes(mode))throw Error('Invalid named weave mode.');
 const next=structuredClone(rule);
 if(mode==='preset'||mode==='priority')next.mode=mode;
 else {const wasGrouped=namedRuleMode(next)==='grouped';next.mode='repeat';if(mode==='alternating'){next.over=1;next.under=1;}else if(mode==='two-over-one'){next.over=2;next.under=1;}else if(!wasGrouped){next.over=2;next.under=2;}}
 validateRule(next);return next;
}
export function repeatSequence(over,under,phase=0){
 if(!count(over)||!count(under)||!Number.isInteger(phase)||phase<0||phase>15)throw Error('Invalid weave repeat preview.');
 const length=over+under;return Array.from({length},(_,index)=>((index+phase)%length)<over?'OVER':'UNDER');
}
const mod=(value,length)=>((value%length)+length)%length;
function familyRelativeValues(pair,family){
 const length=pair.over+pair.under;
 return family===pair.first?{over:pair.over,under:pair.under,phase:pair.phase}:{over:pair.under,under:pair.over,phase:mod(pair.phase+pair.under,length)};
}
function storedPairValues(family,other,values){
 const [first,second]=[family,other].sort(),length=values.over+values.under;
 return family===first?{first,second,...values}:{first,second,over:values.under,under:values.over,phase:mod(values.phase-values.over,length)};
}
export function familyRepeatRule(rule,family,families){
 const others=families.filter(name=>name!==family);if(!others.length)return null;
 const values=[];for(const other of others){const [first,second]=[family,other].sort(),pair=rule.pairs.find(item=>item.first===first&&item.second===second);if(!pair)return null;values.push(familyRelativeValues(pair,family));}
 return values.every(value=>JSON.stringify(value)===JSON.stringify(values[0]))?values[0]:null;
}
export function pairRepeatRule(rule,first,second){
 if(first===second||!first||!second)return null;
 const names=[first,second].sort(),pair=rule.pairs.find(item=>item.first===names[0]&&item.second===names[1]);
 return pair?familyRelativeValues(pair,first):null;
}
export function applyPairNamedRule(rule,first,second,mode,custom={}){
 if(!['alternating','two-over-one','grouped'].includes(mode)||first===second||!first||!second)throw Error('Invalid family pair crossing mode.');
 const current=pairRepeatRule(rule,first,second),values=mode==='alternating'?{over:1,under:1,phase:0}:mode==='two-over-one'?{over:2,under:1,phase:0}:{over:custom.over??current?.over??2,under:custom.under??current?.under??2,phase:custom.phase??current?.phase??0};
 repeatSequence(values.over,values.under,values.phase);const next=structuredClone(rule),[a,b]=[first,second].sort();next.pairs=next.pairs.filter(pair=>pair.first!==a||pair.second!==b);next.pairs.push(storedPairValues(first,second,values));next.pairs.sort((x,y)=>(x.first+'|'+x.second).localeCompare(y.first+'|'+y.second));validateRule(next);return next;
}
export function clearPairRule(rule,first,second){const [a,b]=[first,second].sort(),next=structuredClone(rule);next.pairs=next.pairs.filter(pair=>pair.first!==a||pair.second!==b);validateRule(next);return next;}
export function applyFamilyNamedRule(rule,family,families,mode,custom={}){
 if(!['alternating','two-over-one','grouped'].includes(mode)||!families.includes(family)||families.length<2)throw Error('Invalid family crossing mode.');
 const current=familyRepeatRule(rule,family,families),values=mode==='alternating'?{over:1,under:1,phase:0}:mode==='two-over-one'?{over:2,under:1,phase:0}:{over:custom.over??current?.over??2,under:custom.under??current?.under??2,phase:custom.phase??current?.phase??0};
 repeatSequence(values.over,values.under,values.phase);const next=structuredClone(rule),targets=new Set(families.filter(name=>name!==family).map(other=>[family,other].sort().join('|')));next.pairs=next.pairs.filter(pair=>!targets.has(pair.first+'|'+pair.second));for(const other of families)if(other!==family)next.pairs.push(storedPairValues(family,other,values));next.pairs.sort((a,b)=>(a.first+'|'+a.second).localeCompare(b.first+'|'+b.second));validateRule(next);return next;
}
export function clearFamilyRule(rule,family,families){const targets=new Set(families.filter(name=>name!==family).map(other=>[family,other].sort().join('|'))),next=structuredClone(rule);next.pairs=next.pairs.filter(pair=>!targets.has(pair.first+'|'+pair.second));validateRule(next);return next;}
const exact=(v,keys)=>v&&Object.keys(v).sort().join(',')===keys.sort().join(',');
const count=n=>Number.isInteger(n)&&n>=1&&n<=8;
export function validateRule(r){
 if(!exact(r,['mode','recipe','inverted','over','under','phase','pairs'])||!['preset','repeat','priority'].includes(r.mode)||!['','double-herringbone-field','double-herringbone','herringbone-square'].includes(r.recipe)||typeof r.inverted!=='boolean'||!count(r.over)||!count(r.under)||!Number.isInteger(r.phase)||r.phase<0||r.phase>15||!Array.isArray(r.pairs)||r.pairs.length>36)throw Error('Invalid weave rule.');
 const seen=new Set();for(const p of r.pairs){if(!exact(p,['first','second','over','under','phase'])||typeof p.first!=='string'||typeof p.second!=='string'||!p.first||p.first.length>20||!p.second||p.second.length>20||p.first>p.second||!count(p.over)||!count(p.under)||!Number.isInteger(p.phase)||p.phase<0||p.phase>15||seen.has(p.first+'|'+p.second))throw Error('Invalid family pair rule.');seen.add(p.first+'|'+p.second);}
}
const pairKey=e=>[e.a.si,e.b.si].sort((a,b)=>a-b).join('/');
// Authored intent is admitted only for a unique strict meeting of two named source runs.
// No nearest-coordinate or tessellation-ordinal matching, including after deformation.
export function resolveWeaveRules(strands,result,settings,source){
 const assignments=new Map(),r=settings.rule,overrides=new Map(settings.source===source?settings.overrides:[]),counts=new Map();
 for(const e of result.events)counts.set(pairKey(e),(counts.get(pairKey(e))||0)+1);
 const intents=r?.recipe?stitchIntentRules(r.recipe):[];
 for(const e of result.events){if(e.ambiguous)continue;const a=strands[e.a.si],b=strands[e.b.si],fa=familyOf(a),fb=familyOf(b);let upper=null;
 if(!r||r.mode==='priority')upper=fa===settings.topFamily||fb!==settings.topFamily;
 else if(r.pairs.some(p=>p.first===[fa,fb].sort()[0]&&p.second===[fa,fb].sort()[1])){
  const first=fa<fb?fa:fb,second=fa<fb?fb:fa,p=r.pairs.find(p=>p.first===first&&p.second===second),index=s=>Number.isInteger(s.k)?s.k:s.identity?s.identity.row+s.identity.column:null,ia=index(a),ib=index(b);if(ia!==null&&ib!==null&&fa!==fb){const n=p.over+p.under,over=((ia+ib+p.phase)%n+n)%n<p.over;upper=fa===first?over:!over;}
 }else if(r.mode==='preset'&&r.recipe){
  const A=a.identity,B=b.identity;
  if(A&&B&&A.patternId===B.patternId&&A.recipeVersion===B.recipeVersion&&Number.isFinite(e.a.source)&&Number.isFinite(e.b.source)&&counts.get(pairKey(e))===1){
   const matches=(x,y,t)=>x.runKey===t.first.run&&x.roleId===t.first.role&&y.runKey===t.second.run&&y.roleId===t.second.role&&y.row-x.row===t.second.cell[0]-t.first.cell[0]&&y.column-x.column===t.second.cell[1]-t.first.cell[1];
   const votes=[];for(const t of intents){if(matches(A,B,t))votes.push(t.over==='first');if(matches(B,A,t))votes.push(t.over!=='first');}if(votes.length&&votes.every(v=>v===votes[0]))upper=votes[0];
  }
 }else{
  // Explicit design repeat on stable source lattice indices, not visible crossing order.
  // Clipping/visibility cannot renumber it. Stitch repeats use embedded cell coordinates.
  const first=fa<fb?fa:fb,second=fa<fb?fb:fa,p=r.mode==='preset'?{over:1,under:1,phase:0}:r;
  const index=s=>Number.isInteger(s.k)?s.k:s.identity? s.identity.row+s.identity.column:null;
  const ia=index(a),ib=index(b);if(ia!==null&&ib!==null&&fa!==fb){const n=p.over+p.under,over=((ia+ib+p.phase)%n+n)%n<p.over;upper=fa===first?over:!over;}
 }
 if(upper!==null&&r?.inverted)upper=!upper;
 if(overrides.has(e.id))upper=overrides.get(e.id);
 if(upper!==null)assignments.set(e.id,upper);
 }
 return assignments;
}
