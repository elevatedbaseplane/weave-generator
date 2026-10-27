import test from 'node:test';
import assert from 'node:assert/strict';
import {fitImagePlacement,moveImage,resizeImageFromCorner,cornerPoint,hitSourceImage} from '../dist/source-image.mjs';

const view={cx:10,cy:20,scale:2};

test('a fitted image stays centered and keeps its proportions',()=>{
 const placement=fitImagePlacement(view,400,200,200,100);
 assert.deepEqual(placement.center,{x:10,y:20});
 assert.equal(placement.width/placement.height,2);
 assert.ok(placement.width<=(400-96)/2);
 assert.ok(placement.height<=(200-96)/2);
});

test('moving shifts the center and resizing keeps the opposite corner',()=>{
 const placement={center:{x:0,y:0},width:100,height:50};
 const moved=moveImage(placement,5,-3);
 assert.deepEqual(moved.center,{x:5,y:-3});
 const anchor=cornerPoint(placement,'nw');
 const resized=resizeImageFromCorner(placement,'se',{x:150,y:-75});
 assert.equal(resized.width/resized.height,2);
 assert.deepEqual(cornerPoint(resized,'nw'),anchor);
 assert.equal(resized.width,200);
});

test('a corner drag cannot flip or collapse the image',()=>{
 const placement={center:{x:0,y:0},width:100,height:50};
 const resized=resizeImageFromCorner(placement,'se',{x:-200,y:200});
 assert.ok(resized.width>=8);
 assert.ok(resized.height>=4);
 assert.equal(resized.width/resized.height,2);
});

test('an unlocked image hit distinguishes a corner from the body',()=>{
 const rect={x:10,y:20,width:100,height:40};
 assert.deepEqual(hitSourceImage({x:10,y:20},rect),{kind:'resize',corner:'nw'});
 assert.deepEqual(hitSourceImage({x:40,y:30},rect),{kind:'move'});
 assert.equal(hitSourceImage({x:0,y:0},rect),null);
});
