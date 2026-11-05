import {test} from 'node:test';
import assert from 'node:assert/strict';
import {pagePosition} from './journal-math.ts';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);

test('both endpoints lie flat with the printed surface above the page block',()=>{
 for(const u of [0,.2,.5,1])for(const z of [-2.2,0,2.2]) {
  const start=pagePosition(u,z,0,3.15,4.4),end=pagePosition(u,z,1,3.15,4.4);
  near(start[0],u*3.15);near(end[0],-u*3.15);
  near(start[1],.207);near(end[1],.207);near(start[2],z);near(end[2],z);
 }
});
test('the entire spine stays bound throughout a turn',()=>{
 for(let p=0;p<=1;p+=.05)for(const z of [-2.2,-1,0,1,2.2]) {
  const point=pagePosition(0,z,p,3.15,4.4);
  near(point[0],0);near(point[1],.207);near(point[2],z);
 }
});
test('a middle turn lifts and curves the sheet without invalid vertices',()=>{
 let lifted=0;
 for(let p=0;p<=1;p+=.025)for(let u=0;u<=1;u+=.05)for(const z of [-2.2,0,2.2]) {
  const point=pagePosition(u,z,p,3.15,4.4);
  assert.ok(point.every(Number.isFinite));
  assert.ok(Math.abs(point[0])<=3.15+1e-9);
  assert.ok(point[1]>=.16&&point[1]<=3.41);
  if(point[1]>2)lifted++;
 }
 assert.ok(lifted>0);
});
test('invalid or out-of-range progress cannot tear the geometry',()=>{
 assert.deepEqual(pagePosition(.5,1,NaN,3.15,4.4),pagePosition(.5,1,0,3.15,4.4));
 assert.deepEqual(pagePosition(.5,1,-2,3.15,4.4),pagePosition(.5,1,0,3.15,4.4));
 assert.deepEqual(pagePosition(.5,1,2,3.15,4.4),pagePosition(.5,1,1,3.15,4.4));
});
