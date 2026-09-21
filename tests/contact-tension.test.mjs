import test from 'node:test';
import assert from 'node:assert/strict';
import {CONTACT_TENSION_DEFAULT,adaptiveContactReach,effectiveContactTension,validateContactTension} from '../dist/contact-tension.mjs';
import {defaultInterlacing,findCrossings,validateInterlacing} from '../dist/interlacing.mjs';
import {defaultRule} from '../dist/weave-rules.mjs';
import {weaveOcclusions} from '../dist/weave-occlusion.mjs';

const v4=contact=>({...defaultInterlacing(),version:'interlacing-v4',enabled:true,rule:{...defaultRule(''),mode:'priority'},contact});
const strands=()=>[{family:'A',strandId:'a',fragments:[{points:[{x:-20,y:0},{x:20,y:0}]}]},{family:'B',strandId:'b',fragments:[{points:[{x:0,y:-20},{x:0,y:20}]}]}];
const span=shape=>{const values=shape.d.match(/-?\d+(?:\.\d+)?/g).map(Number),xs=[];for(let i=0;i<values.length;i+=2)xs.push(values[i]);return Math.max(...xs)-Math.min(...xs);};

test('contact tension is an explicit bounded interlacing-v4 decision',()=>{
 assert.deepEqual(effectiveContactTension(defaultInterlacing()),CONTACT_TENSION_DEFAULT);
 const settings=v4({enabled:true,base:45,adaptive:70});validateInterlacing(settings);assert.deepEqual(effectiveContactTension(settings),settings.contact);
 for(const bad of [{enabled:true,base:-1,adaptive:50},{enabled:true,base:50,adaptive:101},{enabled:1,base:50,adaptive:50}])assert.throws(()=>validateContactTension(bad));
 assert.throws(()=>validateInterlacing({...settings,contact:{...settings.contact,extra:1}}));
});

test('adaptive reach never clips the required ribbon footprint and bounds extra reach by neighboring restraints',()=>{
 const loose={enabled:true,base:0,adaptive:0},tight={enabled:true,base:100,adaptive:100};
 assert.equal(adaptiveContactReach(5,4,{nearest:Infinity,neighborCount:0,sin:1,curvature:0},tight),5);
 assert.equal(adaptiveContactReach(5,4,{nearest:10,neighborCount:2,sin:.2,curvature:1},loose),10);
 assert.equal(adaptiveContactReach(5,4,{nearest:40,neighborCount:1,sin:1,curvature:0},loose),15);
 const visible=adaptiveContactReach(5,4,{nearest:40,neighborCount:1,sin:.7,curvature:.3},{enabled:true,base:85,adaptive:75});
 assert.ok(visible>6,'ordinary high-tension settings still create a visible response');
});

test('contact response changes only mask clearance and leaves strand geometry untouched',()=>{
 const source=strands(),copy=structuredClone(source),result=findCrossings(source),appearance={version:'thread-appearance-v1',families:{A:{width:4,mode:'outline'},B:{width:4,mode:'outline'}}},tight=weaveOcclusions(source,result,v4({enabled:true,base:100,adaptive:100}),appearance,'source'),loose=weaveOcclusions(source,result,v4({enabled:true,base:0,adaptive:0}),appearance,'source');
 assert.ok(span(loose.get('1/0')[0])>span(tight.get('1/0')[0]));assert.deepEqual(source,copy);
});
