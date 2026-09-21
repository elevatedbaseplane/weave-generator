import {canonical} from './weave.mjs';

const same=(a,b)=>canonical(a)===canonical(b);
const familyKeys=c=>Object.keys(c?.generation?.variation?.families||c?.generation?.influences?.[0]?.families||{}).sort();
const active=(f,n)=>!!f?.enabled&&f.families?.[n]?.strength>0&&f.families[n].tension<100;
const fieldShape=f=>f&&({id:f.id,kind:f.kind,center:f.center,radius:f.radius,enabled:f.enabled,falloffVersion:f.falloffVersion,falloff:f.falloff,direction:f.direction});
function familyFieldShape(g,n){return (g?.influences||[]).map(f=>({field:fieldShape(f),response:f.families?.[n]}));}
function familyMargin(g,n){
 let sum=0;for(const f of g?.influences||[]){const q=f.families?.[n];if(!active(f,n))continue;const t=q.tension/100;sum+=f.kind==='deflector'?.2*f.radius*q.strength/100*(1-t):.8*f.radius*q.strength/100*(1-t)*(1+t)/4;}
 return sum;
}
function variationMargin(c,n){const q=c?.generation?.variation?.families?.[n],spacing=c?.carrier?.families?.[n]?.spacing;return q&&Number.isFinite(spacing)?spacing*.2*q.amount/100:0;}

export function dependencyPlan(previous,next){
 const names=[...new Set([...familyKeys(previous),...familyKeys(next)])].sort(),all=()=>new Set(names),affected=new Set(),reasons=[];
 if(!previous){return{version:'dependency-plan-v1',families:names,stages:['source','geometry','crossings','presentation'],reuse:{geometry:false,crossings:false,presentation:false},reasons:['no-complete-base']};}
 if(!same(previous.boundary,next.boundary)||!same(previous.carrier,next.carrier)||!same(previous.sourceContext,next.sourceContext)){
  names.forEach(n=>affected.add(n));reasons.push('source');
 }else{
  const a=previous.generation,b=next.generation;
  if(a?.version!==b?.version){names.forEach(n=>affected.add(n));reasons.push('generation-version');}
  else if(a?.variation&&b?.variation){
   const oldVariation=a.variation,newVariation=b.variation;
   for(const n of names)if(!same(oldVariation.families?.[n],newVariation.families?.[n])||(oldVariation.seed!==newVariation.seed&&(oldVariation.families?.[n]?.amount||newVariation.families?.[n]?.amount)))affected.add(n);
   for(const n of names)if(!same(familyFieldShape(a,n),familyFieldShape(b,n)))affected.add(n);
   const oldGlobal=Math.max(0,...names.map(n=>familyMargin(a,n)+variationMargin(previous,n))),newGlobal=Math.max(0,...names.map(n=>familyMargin(b,n)+variationMargin(next,n)));
   if(oldGlobal!==newGlobal){names.forEach(n=>affected.add(n));reasons.push('global-expansion-margin');}
  }else if(a?.roles&&b?.roles){
   if(!same(a.roles,b.roles))names.forEach(n=>affected.add(n));
   for(const n of names)if(!same(familyFieldShape(a,n),familyFieldShape(b,n)))affected.add(n);
  }else if(!same(a,b))names.forEach(n=>affected.add(n));
 }
 if(affected.size)reasons.push('family-geometry');
 const geometry=affected.size>0;
 return{version:'dependency-plan-v1',families:[...affected],stages:geometry?['geometry','crossings','presentation']:[],reuse:{geometry:!geometry,crossings:!geometry,presentation:!geometry},reasons:[...new Set(reasons)]};
}

export function presentationPlan(kind='appearance'){return{version:'dependency-plan-v1',families:[],stages:['presentation'],reuse:{geometry:true,crossings:kind==='appearance',presentation:false},reasons:[kind]};}
