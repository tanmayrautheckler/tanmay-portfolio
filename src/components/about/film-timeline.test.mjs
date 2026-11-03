import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source=await readFile(new URL("./film-timeline.ts",import.meta.url),"utf8");
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const {clampFilm,filmBeat,sceneOpacity,captionOpacity}=await import("data:text/javascript;base64,"+Buffer.from(compiled).toString("base64"));

test("scrubbing stays bounded, including invalid input",()=>{
  assert.equal(clampFilm(-1),0);assert.equal(clampFilm(8),1);assert.equal(clampFilm(NaN),0);
  assert.equal(filmBeat(0),0);assert.equal(filmBeat(1),4);
});
test("every timeline position has visible content and no more than two overlapping scenes",()=>{
  for(let i=0;i<=1000;i++){
    const opacities=Array.from({length:5},(_,index)=>sceneOpacity(i/1000,index));
    assert.ok(Math.max(...opacities)>=.499,`Blank transition at ${i}`);
    assert.ok(opacities.filter(value=>value>.001).length<=2);
    assert.ok(opacities[filmBeat(i/1000)]>=.499);
  }
});
test("each scene is fully visible at its navigation stop",()=>{
  for(let index=0;index<5;index++){
    assert.equal(sceneOpacity(index/4,index),1);
    assert.equal(filmBeat(index/4),index);
  }
});
test("captions never overlap while backgrounds crossfade",()=>{
  for(let frame=0;frame<=1000;frame++){
    assert.ok(Array.from({length:5},(_,index)=>captionOpacity(frame/1000,index)).filter(value=>value>.001).length<=1);
  }
});
