import {test} from 'node:test';
import assert from 'node:assert/strict';
import {supportsJournal3D} from './journal-capabilities.ts';

test('disabled browser graphics does not start the 3D renderer',()=>{
 assert.equal(supportsJournal3D({getContext:()=>null}),false);
});
test('browser refusing context creation remains a handled unsupported state',()=>{
 assert.equal(supportsJournal3D({getContext:()=>{throw new Error('GPU disabled');}}),false);
});
test('WebGL 2 support releases the probe before the real renderer starts',()=>{
 let released=0;
 const requested=[];
 const canvas={getContext:(kind)=>{requested.push(kind);return {getExtension:name=>name==='WEBGL_lose_context'?{loseContext:()=>released++}:null};}};
 assert.equal(supportsJournal3D(canvas),true);
 assert.deepEqual(requested,['webgl2']);
 assert.equal(released,1);
});
test('a valid context without the optional release extension remains supported',()=>{
 assert.equal(supportsJournal3D({getContext:()=>({getExtension:()=>null})}),true);
});
