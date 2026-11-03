import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CatmullRomCurve3, Vector3 } from 'three';

const cameraSource=readFileSync(new URL('./about-world-camera.tsx',import.meta.url),'utf8');
const memorySource=readFileSync(new URL('./about-world-memories.tsx',import.meta.url),'utf8');
const numbers=text=>text.split(',').map(Number);
const stops=[...cameraSource.matchAll(/position: \[([^\]]+)\], lookAt: \[([^\]]+)\]/g)].map(match=>({position:numbers(match[1]),target:numbers(match[2])}));
const memories=[...memorySource.matchAll(/id: "([^"]+)"[^\n]+position: \[([^\]]+)\], rotation: ([\d.-]+), size: \[([^\]]+)\]/g)].map(match=>({id:match[1],position:numbers(match[2]),rotation:Number(match[3]),size:numbers(match[4])}));
const route=new CatmullRomCurve3(stops.map(stop=>new Vector3(...stop.position)),false,'centripetal');
const look=new CatmullRomCurve3(stops.map(stop=>new Vector3(...stop.target)),false,'centripetal');

test('camera route keeps moving forward with a valid look direction',()=>{
 assert.equal(stops.length,5);let previous=Infinity;
 for(let i=0;i<=2000;i++){const position=route.getPoint(i/2000),target=look.getPoint(i/2000);assert.ok(position.toArray().every(Number.isFinite));assert.ok(position.z<=previous+.00001,'camera must not reverse along the route');assert.ok(position.distanceTo(target)>3,'look target must stay clear of camera');previous=position.z;}
});

test('camera and headroom never intersect the displayed photographs',()=>{
 assert.equal(memories.length,5);
 for(const memory of memories){const [x,y,z]=memory.position,[width,height]=memory.size;for(let i=0;i<=2000;i++){const camera=route.getPoint(i/2000),dx=camera.x-x,dz=camera.z-z;const localX=Math.cos(memory.rotation)*dx-Math.sin(memory.rotation)*dz;const localZ=Math.sin(memory.rotation)*dx+Math.cos(memory.rotation)*dz;const collision=Math.abs(localZ)<.6&&Math.abs(localX)<width/2+.5&&Math.abs(camera.y-y)<height/2+.4;assert.equal(collision,false,`${memory.id} intersects camera at progress ${i/2000}`);}}
});
