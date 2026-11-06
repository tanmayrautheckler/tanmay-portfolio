import test from 'node:test';
import assert from 'node:assert/strict';
import {turnProgress,sheetPhase,outgoingReveal,incomingReveal,layerReveal} from './journal-timeline.ts';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);

test('a forward and reverse turn have the same physical choreography',()=>{
  for(let p=0;p<=1;p+=.01){
    near(turnProgress(p,1,2),turnProgress(1-p,2,1));
    near(sheetPhase(p,1,2),1-sheetPhase(1-p,2,1));
  }
});
test('the outgoing world folds into the paper before the sheet curls',()=>{
  for(let p=0;p<=1;p+=.005){
    if(sheetPhase(p,1,2)>0) near(outgoingReveal(p),0);
    if(incomingReveal(p)>0) near(sheetPhase(p,1,2),1);
  }
});
test('cancelled drags reverse smoothly to the original living spread',()=>{
  near(outgoingReveal(0),1);near(incomingReveal(0),0);
  near(sheetPhase(0,1,2),0);near(sheetPhase(1,2,1),1);
  const forward=Array.from({length:51},(_,i)=>outgoingReveal(i/100));
  const reverse=Array.from({length:51},(_,i)=>outgoingReveal((50-i)/100));
  assert.deepEqual([...forward].reverse(),reverse);
});
test('terrain precedes actors, and atmosphere arrives last',()=>{
  for(let p=0;p<=1;p+=.01){
    assert.ok(layerReveal(p,'terrain')>=layerReveal(p,'actors'));
    assert.ok(layerReveal(p,'actors')>=layerReveal(p,'atmosphere'));
  }
  for(const layer of ['terrain','actors','atmosphere']){
    near(layerReveal(0,layer),0);near(layerReveal(1,layer),1);
    assert.ok(layerReveal(.5,layer,3)<=layerReveal(.5,layer,0));
  }
});
test('incoming reveal stops short of full scale so commit cannot snap a whole world into view',()=>{
  near(incomingReveal(1),.18);near(incomingReveal(.5),0);
});
