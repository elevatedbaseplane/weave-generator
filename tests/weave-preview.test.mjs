import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {weaveAppearanceMarkup} from '../dist/weave-preview.mjs';

const strand=()=>({family:'A',fragments:[{points:[{x:0,y:0},{x:100,y:0}]}]});
const appearance=width=>({version:'thread-appearance-v2',families:{A:{width,mode:'outline',rank:1,edgeWidth:1}}});
const attractor={id:'field',kind:'attractor',enabled:true,center:{x:40,y:0},radius:30,direction:0,falloff:3,families:{A:{strength:50,tension:0}}};

test('the preview draws thread outlines and influence rings',()=>{
 const narrow=weaveAppearanceMarkup([strand()],appearance(4),[]);
 const wide=weaveAppearanceMarkup([strand()],appearance(20),[attractor]);
 assert.match(narrow,/<path class="weave-preview-thread"/);
 assert.doesNotMatch(narrow,/<line /);
 assert.doesNotMatch(narrow,/<circle /);
 assert.match(wide,/<circle class="weave-preview-influence"/);
 assert.notEqual(narrow.match(/d="([^"]+)"/)[1],wide.match(/d="([^"]+)"/)[1]);
 assert.equal(weaveAppearanceMarkup([],null,[]),'');
});

test('opening a saved field shows the distorted weave and its influence guide',()=>{
 const app=readFileSync(new URL('../dist/app.mjs',import.meta.url),'utf8');
 const open=app.slice(app.indexOf('async function openSavedWeaveRecord'),app.indexOf('const libraryClick'));
 assert.match(open,/display=applyDisplayPreset\(display,'derived-only'\);display\.attractor=true/);
 assert.doesNotMatch(open,/interlacing\?\.enabled/);
});
