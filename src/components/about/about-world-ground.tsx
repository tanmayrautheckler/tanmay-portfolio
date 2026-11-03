"use client";

import { useEffect, useMemo, useRef } from "react";
import { CanvasTexture, CatmullRomCurve3, Color, InstancedMesh, Matrix4, Quaternion, SRGBColorSpace, Vector3 } from "three";
import { WORLD_CAMERA_STOPS } from "./about-world-camera";

function useWood(){
 const texture=useMemo(()=>{const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const c=canvas.getContext('2d');if(c){c.fillStyle='#9d8d73';c.fillRect(0,0,512,128);for(let i=0;i<100;i++){c.strokeStyle=`rgba(45,32,20,${.025+(i%7)*.008})`;c.lineWidth=.4;c.beginPath();for(let x=0;x<=512;x+=8){const y=i*1.3+Math.sin(x*.018+i*2.7)*1.5;if(x===0)c.moveTo(x,y);else c.lineTo(x,y);}c.stroke();}}const t=new CanvasTexture(canvas);t.colorSpace=SRGBColorSpace;return t;},[]);
 useEffect(()=>()=>texture.dispose(),[texture]);return texture;
}
const bays=[{x:0,z:0,width:10,depth:10},{x:0,z:-29,width:10,depth:10},{x:9,z:-49,width:14,depth:24},{x:-1,z:-72,width:10,depth:8},{x:-1,z:-106,width:10,depth:8}];
function Bay({x,z,width,depth}:{x:number;z:number;width:number;depth:number}){
 const wood=useWood();const count=Math.ceil(depth/.45);
 return <group position={[x,-2.69,z]}>{Array.from({length:count},(_,i)=><mesh key={i} position={[0,0,-depth/2+i*.45]}><boxGeometry args={[width,.14,.42]}/><meshStandardMaterial map={wood} color={i%3===0?'#a28f73':'#93836d'} roughness={.93}/></mesh>)}<mesh position={[0,-.28,0]}><boxGeometry args={[width-.3,.42,depth]}/><meshStandardMaterial color="#3b342a" roughness={1}/></mesh></group>;
}
export function WorldGround(){
 const wood=useWood();const planks=useRef<InstancedMesh>(null);
 const path=useMemo(()=>new CatmullRomCurve3([new Vector3(0,-2.72,20),...WORLD_CAMERA_STOPS.map(stop=>new Vector3(stop.position[0],-2.72,stop.position[2])),new Vector3(0,-2.72,-117)],false,'centripetal'),[]);
 const count=Math.ceil(path.getLength()/.43);
 useEffect(()=>{if(!planks.current)return;const matrix=new Matrix4(),rotation=new Quaternion(),up=new Vector3(0,1,0),scale=new Vector3(1,1,1),color=new Color();for(let i=0;i<count;i++){const t=i/(count-1),position=path.getPointAt(t),direction=path.getTangentAt(t);rotation.setFromAxisAngle(up,Math.atan2(direction.x,direction.z));matrix.compose(position,rotation,scale);planks.current.setMatrixAt(i,matrix);planks.current.setColorAt(i,color.set(i%3===0?'#a6977f':i%3===1?'#97866e':'#9e8d73'));}planks.current.instanceMatrix.needsUpdate=true;if(planks.current.instanceColor)planks.current.instanceColor.needsUpdate=true;},[path,count]);
 return <group name="Continuous shoreline boardwalk"><instancedMesh ref={planks} args={[undefined,undefined,count]} frustumCulled={false}><boxGeometry args={[8.8,.14,.405]}/><meshStandardMaterial map={wood} roughness={.94}/></instancedMesh>{bays.map(bay=><Bay key={bay.z} {...bay}/>)}</group>;
}
