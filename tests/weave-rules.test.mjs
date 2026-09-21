import test from 'node:test';import assert from 'node:assert/strict';
import {defaultRule,resolveWeaveRules,effectiveWeaveRule,validateRule,namedRuleMode,applyNamedRuleMode,repeatSequence,seededVariationSequence,withStructuredVariation,familyRepeatRule,applyFamilyNamedRule,clearFamilyRule,pairRepeatRule,applyPairNamedRule,clearPairRule} from '../dist/weave-rules.mjs';
import {defaultInterlacing,validateInterlacing,findCrossings} from '../dist/interlacing.mjs';
import {createStitchSource,stitchCell} from '../dist/stitch-source.mjs';
const settings=recipe=>({...defaultInterlacing(),version:'interlacing-v2',enabled:true,rule:defaultRule(recipe)});
const line=(family,k)=>({family,k,strandId:family+k,fragments:[]});
const event=(i,a,b)=>({id:String(i),a:{si:a,source:.3},b:{si:b,source:.7}});
test('named modes map to exact repeat values without mutating existing rules or pair overrides',()=>{
 const original={...defaultRule(''),pairs:[{first:'A',second:'B',over:3,under:2,phase:1}]},text=JSON.stringify(original);
 const alternating=applyNamedRuleMode(original,'alternating');assert.equal(namedRuleMode(alternating),'alternating');assert.deepEqual([alternating.mode,alternating.over,alternating.under],['repeat',1,1]);
 const two=applyNamedRuleMode(alternating,'two-over-one');assert.equal(namedRuleMode(two),'two-over-one');assert.deepEqual([two.over,two.under],[2,1]);
 const grouped=applyNamedRuleMode(two,'grouped');assert.equal(namedRuleMode(grouped),'grouped');assert.deepEqual([grouped.over,grouped.under],[2,2]);assert.deepEqual(grouped.pairs,original.pairs);
 assert.equal(namedRuleMode(applyNamedRuleMode(grouped,'preset')),'preset');assert.equal(namedRuleMode(applyNamedRuleMode(grouped,'priority')),'priority');assert.equal(JSON.stringify(original),text);assert.throws(()=>applyNamedRuleMode(original,'random'));
});
test('live repeat previews follow the resolver phase convention',()=>{
 assert.deepEqual(repeatSequence(1,1),['OVER','UNDER']);assert.deepEqual(repeatSequence(2,1),['OVER','OVER','UNDER']);assert.deepEqual(repeatSequence(2,2,1),['OVER','UNDER','UNDER','OVER']);assert.throws(()=>repeatSequence(9,1));
});
test('seeded structured variation is deterministic, balanced and run bounded',()=>{
 const a=seededVariationSequence(1042,50,3,128,'A|B'),b=seededVariationSequence(1042,50,3,128,'A|B'),c=seededVariationSequence(1043,50,3,128,'A|B');assert.deepEqual(a,b);assert.notDeepEqual(a,c);
 let run=1,max=1;for(let i=1;i<a.length;i++){run=a[i]===a[i-1]?run+1:1;max=Math.max(max,run);}assert.ok(max<=3);assert.ok(Math.abs(a.filter(Boolean).length/128-.5)<.08);
 for(const invalid of [[-1,50,3],[1,51,3],[1,50,0],[1,50,3,300]])assert.throws(()=>seededVariationSequence(...invalid));
});
test('seeded mode uses v3 persistence while v2 remains byte-compatible',()=>{
 const legacy=settings(''),rule=applyNamedRuleMode(legacy.rule,'seeded'),edited=withStructuredVariation(rule,{seed:65001,balance:65,maxRun:2}),v3={...legacy,version:'interlacing-v3',rule:edited};assert.equal(namedRuleMode(rule),'seeded');assert.deepEqual([edited.seed,edited.balance,edited.maxRun],[65001,65,2]);assert.deepEqual(withStructuredVariation(edited),edited);validateInterlacing(v3);assert.deepEqual(JSON.parse(JSON.stringify(v3)),v3);assert.throws(()=>validateInterlacing({...v3,version:'interlacing-v2'}));assert.throws(()=>validateInterlacing({...legacy,version:'interlacing-v3'}));
});
test('seeded assignments ignore event order and preserve pair and manual precedence',()=>{
 const strands=[line('A',0),line('B',0),line('B',1),line('B',2),line('B',3)],events=[event(1,0,1),event(2,0,2),event(3,0,3),event(4,0,4)],rule=applyNamedRuleMode(defaultRule(''),'seeded'),v={...settings(''),version:'interlacing-v3',rule};
 const first=resolveWeaveRules(strands,{events},v,'source'),reordered=resolveWeaveRules(strands,{events:[...events].reverse()},v,'source');assert.deepEqual([...first].sort(),[...reordered].sort());
 v.rule=applyPairNamedRule(v.rule,'A','B','alternating');assert.deepEqual([...resolveWeaveRules(strands,{events},v,'source').values()],[true,false,true,false]);
 v.source='source';v.overrides=[['2',true]];assert.equal(resolveWeaveRules(strands,{events},v,'source').get('2'),true);
});
test('effective rule explanation follows the exact renderer precedence',()=>{
 const strands=[line('A',0),line('B',1)],result={events:[event(1,0,1)]},rule=withStructuredVariation(applyNamedRuleMode(defaultRule(''),'seeded'),{seed:9,balance:60,maxRun:2}),v={...settings(''),version:'interlacing-v3',rule},assigned=resolveWeaveRules(strands,result,v,'source');
 assert.deepEqual(effectiveWeaveRule(strands,result,v,'source',result.events[0],assigned),{kind:'global',mode:'seeded',relationship:null,assigned:true,upper:assigned.get('1'),inverted:false});
 v.rule=applyPairNamedRule(v.rule,'A','B','two-over-one');let detail=effectiveWeaveRule(strands,result,v,'source',result.events[0]);assert.equal(detail.kind,'pair');assert.equal(detail.mode,'two-over-one');assert.deepEqual(detail.relationship,{first:'A',second:'B',over:2,under:1,phase:0});
 v.rule.inverted=true;detail=effectiveWeaveRule(strands,result,v,'source',result.events[0]);assert.equal(detail.inverted,true);
 v.source='source';v.overrides=[['1',false]];detail=effectiveWeaveRule(strands,result,v,'source',result.events[0]);assert.deepEqual([detail.kind,detail.mode,detail.upper,detail.inverted],['manual','manual',false,false]);
 v.source='other';assert.equal(effectiveWeaveRule(strands,result,v,'source',result.events[0]).kind,'pair');
});
test('named crossing settings preserve their exact v2 representation through portable JSON',()=>{
 for(const mode of ['preset','alternating','two-over-one','grouped','priority']){
  const v=settings('');v.rule=applyNamedRuleMode(v.rule,mode);if(mode==='grouped'){v.rule.over=3;v.rule.under=2;v.rule.phase=1;}validateInterlacing(v);
  const copy=JSON.parse(JSON.stringify(v));assert.deepEqual(copy,v);assert.equal(namedRuleMode(copy.rule),mode);
 }
});
test('family-targeted modes affect every relationship for that family without changing the global default',()=>{
 const original=applyNamedRuleMode(defaultRule(''),'alternating'),families=['A','B','C'];
 const next=applyFamilyNamedRule(original,'B',families,'two-over-one');assert.deepEqual([original.over,original.under,original.pairs.length],[1,1,0]);assert.deepEqual(familyRepeatRule(next,'B',families),{over:2,under:1,phase:0});assert.equal(familyRepeatRule(next,'A',families),null);assert.equal(next.pairs.length,2);
 const settingsB={...settings(''),rule:next},strands=[line('A',0),line('B',0),line('C',0)];assert.equal(resolveWeaveRules(strands,{events:[event(1,0,1),event(2,1,2)]},settingsB,'x').get('1'),false);assert.equal(resolveWeaveRules(strands,{events:[event(1,0,1),event(2,1,2)]},settingsB,'x').get('2'),true);
 const cleared=clearFamilyRule(next,'B',families);assert.equal(cleared.pairs.length,0);assert.equal(namedRuleMode(cleared),'alternating');
});
test('exact family-pair rules edit one relationship, preserve the others, and retain the selected family perspective',()=>{
 const families=['A','B','C'],base=applyFamilyNamedRule(defaultRule(''),'A',families,'alternating'),before=JSON.stringify(base);
 const edited=applyPairNamedRule(base,'C','A','two-over-one');
 assert.deepEqual(pairRepeatRule(edited,'C','A'),{over:2,under:1,phase:0});
 assert.deepEqual(pairRepeatRule(edited,'A','C'),{over:1,under:2,phase:1});
 assert.deepEqual(pairRepeatRule(edited,'A','B'),{over:1,under:1,phase:0});
 assert.equal(JSON.stringify(base),before);
 const cleared=clearPairRule(edited,'A','C');assert.equal(pairRepeatRule(cleared,'A','C'),null);assert.deepEqual(pairRepeatRule(cleared,'A','B'),{over:1,under:1,phase:0});
 assert.throws(()=>applyPairNamedRule(base,'A','A','alternating'));
});
test('an exact pair rule wins over the whole-pattern default without affecting a third family',()=>{
 const rule=applyPairNamedRule(applyNamedRuleMode(defaultRule(''),'alternating'),'A','B','two-over-one'),v={...settings(''),rule},strands=[line('A',0),line('B',0),line('C',0)],result={events:[event(1,0,1),event(2,0,2)]},resolved=resolveWeaveRules(strands,result,v,'x');
 assert.equal(resolved.get('1'),true);assert.equal(resolved.get('2'),true);
 const shifted=resolveWeaveRules([line('A',1),line('B',1),line('C',1)],result,v,'x');assert.equal(shifted.get('1'),false);assert.equal(shifted.get('2'),true);
});
test('repeat and pair controls are deterministic under clipping and input order, inverted explicitly',()=>{
 const s=[line('A',-1),line('B',0),line('B',1),line('C',0)],r={events:[event(1,0,1),event(2,0,2),event(3,0,3)]},v=settings('');v.rule.mode='repeat';
 assert.deepEqual([...resolveWeaveRules(s,r,v,'x').values()],[false,true,false]);
 v.rule.pairs=[{first:'A',second:'C',over:2,under:1,phase:1}];assert.equal(resolveWeaveRules(s,r,v,'x').get('3'),true);
 v.rule.inverted=true;assert.deepEqual([...resolveWeaveRules(s,r,v,'x').values()],[true,false,false]);
 const reversed={events:r.events.map(e=>({...e,a:e.b,b:e.a}))};for(const [id,value] of resolveWeaveRules(s,reversed,v,'x'))assert.equal(value,!resolveWeaveRules(s,r,v,'x').get(id));
 assert.equal(resolveWeaveRules(s,{events:[r.events[1]]},v,'x').get('2'),false);
});
test('both preset construction rules resolve unique source-run meetings, not ambiguous or repeated meetings',()=>{
 for(const recipe of ['herringbone-square','double-herringbone-field']){
  const src=createStitchSource(recipe,'p',2),strands=[...stitchCell(src,0,-1),...stitchCell(src,0,0)].map(r=>({identity:r.identity,fragments:[{u0:0,u1:1,points:[r.p0,r.p1]}]})),result=findCrossings(strands),v=settings(recipe),before=JSON.stringify(strands),map=resolveWeaveRules(strands,result,v,'x');assert.ok(map.size>0,recipe);
  for(const e of result.events.filter(e=>map.has(e.id))){const duplicate={...e,id:e.id+'duplicate'};assert.equal(resolveWeaveRules(strands,{events:[e,duplicate]},v,'x').size,0);assert.equal(resolveWeaveRules(strands,{events:[{...e,ambiguous:true}]},v,'x').size,0);assert.equal(resolveWeaveRules(strands,{events:[{...e,a:{...e.a,source:null}}]},v,'x').size,0);}
  assert.equal(JSON.stringify(strands),before);
 }
});
test('legacy rules are unchanged; local overrides are input bound and take precedence over inversion',()=>{
 const s=[line('A',0),line('B',0)],r={events:[event(1,0,1)]},v={...defaultInterlacing(),enabled:true};assert.equal(resolveWeaveRules(s,r,v,'x').get('1'),true);
 v.version='interlacing-v2';v.rule={...defaultRule(''),inverted:true};v.source='x';v.overrides=[['1',true]];assert.equal(resolveWeaveRules(s,r,v,'x').get('1'),true);assert.equal(resolveWeaveRules(s,r,v,'changed').get('1'),false);
});
test('bounded exact v2 validation rejects malformed and duplicate pair settings',()=>{
 const v=settings('herringbone-square');validateInterlacing(v);assert.throws(()=>validateInterlacing({...v,rule:{...v.rule,over:9}}));assert.throws(()=>validateRule({...v.rule,extra:1}));assert.throws(()=>validateRule({...v.rule,pairs:[{first:'B',second:'A',over:1,under:1,phase:0}]}));assert.throws(()=>validateInterlacing({...defaultInterlacing(),rule:v.rule}));
});
import {createWorkspace,saveCarrierStudy,createWeaveStudy,saveWeaveStudy,validateTrustedWorkspace} from '../dist/document.mjs';
import {packWorkspace,portableText,parsePortable,prepareIncrementalRevisionWorkspace} from '../dist/storage-codec.mjs';
import {digest,derivedSvg} from '../dist/weave.mjs';
test('v2 rules roundtrip immutable revisions and backup without new geometry payloads or changed fingerprint',()=>{
 const ws=createWorkspace();let p=ws.projects[0];p.working.carrier=createStitchSource('herringbone-square','rules',2);p=saveCarrierStudy(p,'P').project;p=createWeaveStudy(p,p.carrierStudies[0].latestRevisionId);p=saveWeaveStudy(p,'W',true).project;ws.projects[0]=p;const packed=packWorkspace(ws),hash=digest(p.working.weave.derived),old=JSON.stringify(p.weaveStudies);
 p=structuredClone(p);p.working.interlacing=settings('herringbone-square');p=saveWeaveStudy(p,'W',true).project;ws.projects[0]=p;validateTrustedWorkspace(ws);const next=prepareIncrementalRevisionWorkspace(ws,packed);assert.equal(next.newPayloads.length,0);assert.deepEqual(parsePortable(portableText(next.packed)),ws);assert.equal(digest(p.working.weave.derived),hash);const oldEntry=JSON.parse(old)[0];assert.deepEqual(p.weaveStudies[0].revisions.slice(0,oldEntry.revisions.length),oldEntry.revisions);assert.equal(JSON.stringify(packed.manifest).includes('interlacing-v2'),false);
 const result=findCrossings(p.working.weave.derived.strands);assert.match(derivedSvg(p.working,p.id,true,result),/interlacing-v2/);
});

test('v3 seeded rules roundtrip a saved revision and portable backup without new geometry payloads',()=>{
 const ws=createWorkspace();let p=ws.projects[0];p.working.carrier=createStitchSource('herringbone-square','seeded-rules',2);p=saveCarrierStudy(p,'P').project;p=createWeaveStudy(p,p.carrierStudies[0].latestRevisionId);p=saveWeaveStudy(p,'W',true).project;ws.projects[0]=p;const packed=packWorkspace(ws),hash=digest(p.working.weave.derived);
 const rule=applyNamedRuleMode(defaultRule('herringbone-square'),'seeded');Object.assign(rule,{seed:65001,balance:65,maxRun:2});p=structuredClone(p);p.working.interlacing={...settings('herringbone-square'),version:'interlacing-v3',rule};p=saveWeaveStudy(p,'W',true).project;ws.projects[0]=p;validateTrustedWorkspace(ws);
 const next=prepareIncrementalRevisionWorkspace(ws,packed),round=parsePortable(portableText(next.packed));assert.equal(next.newPayloads.length,0);assert.deepEqual(round,ws);assert.equal(digest(p.working.weave.derived),hash);assert.deepEqual(round.projects[0].working.interlacing.rule,{...rule});assert.equal(round.projects[0].weaveStudies[0].revisions.at(-1).working.interlacing.version,'interlacing-v3');
});

test('preset rules use construction order, new cross-row meetings stay unresolved, and explicit family rules override fallback',()=>{
 const id=(runKey,row=0)=>({patternId:'p',recipeVersion:1,roleId:'foundation',runKey,row,column:0});
 const s=[{identity:id('T')},{identity:id('L')},{identity:id('R')},{identity:id('B')},{identity:id('L',1)}],r={events:[event(1,0,1),event(2,2,0),event(3,3,2),event(4,1,3),event(5,0,4)]};
 const map=resolveWeaveRules(s,r,settings('herringbone-square'),'x');assert.deepEqual([...map.values()],[true,true,true,true]);assert.equal(map.has('5'),false);
 const v=settings('');v.rule.over=8;v.rule.pairs=[{first:'A',second:'B',over:8,under:1,phase:0}];assert.equal(resolveWeaveRules([line('A',0),line('B',1)],{events:[event(1,0,1)]},v,'x').get('1'),true);
});
