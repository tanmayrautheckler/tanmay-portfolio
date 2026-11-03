"use client";

import { Suspense, useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { BackSide, CanvasTexture, DoubleSide, Group, ShaderMaterial, SRGBColorSpace } from "three";
import type { MotionValue } from "framer-motion";
import { WorldCamera } from "./about-world-camera";
import { WorldMemories } from "./about-world-memories";
import { WorldGround } from "./about-world-ground";

const vertex=`varying vec2 vUv; varying vec3 worldPosition; uniform float time;
void main(){vUv=uv;vec3 p=position;p.z+=sin(p.x*.6+time*.55)*.07+sin(p.y*.8-time*.7)*.05;worldPosition=(modelMatrix*vec4(p,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`;
const fragment=`varying vec2 vUv;varying vec3 worldPosition;uniform float time;uniform sampler2D lake;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
void main(){vec2 p=worldPosition.xz;float swell=sin(p.x*.7+p.y*.24+time*.65)*sin(p.y*.42-time*.5);float ripple=noise(p*2.2+vec2(time*.2,-time*.3));vec2 uv=vec2(.5+p.x*.025,.18+fract(-p.y*.025)*.24);uv+=vec2(swell*.0015,ripple*.0035);vec3 photo=texture2D(lake,uv).rgb;vec3 color=mix(photo,vec3(.035,.20,.24),.27);float glint=pow(max(0.,noise(p*5.+time*.15)),19.);color+=vec3(.66,.78,.72)*glint*.6;color+=swell*.012;float farFade=(1.-smoothstep(-165.,-80.,worldPosition.z));color=mix(color,vec3(.28,.44,.49),farFade*.5);gl_FragColor=vec4(color,1.);}`;
function Water({reduced}:{reduced:boolean}){
 const mat=useRef<ShaderMaterial>(null);
 const lake=useTexture("/images/about/tahoe/landscape.webp");
 useFrame((_,dt)=>{if(mat.current&&!reduced&&!document.hidden)mat.current.uniforms.time.value+=Math.min(dt,.05);});
 const uniforms=useMemo(()=>({time:{value:0},lake:{value:lake}}),[lake]);
 return <mesh rotation={[-Math.PI/2,0,0]} position={[0,-2.8,-55]}><planeGeometry args={[150,210,100,140]}/><shaderMaterial ref={mat} uniforms={uniforms} vertexShader={vertex} fragmentShader={fragment}/></mesh>;
}
function MapArtifact({reduced}:{reduced:boolean}){
 const source=useTexture('/textures/earth-day.jpg');
 const texture=useMemo(()=>{const copy=source.clone();copy.colorSpace=SRGBColorSpace;return copy;},[source]);
 const plaque=useMemo(()=>{const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=180;const c=canvas.getContext('2d');if(c){c.fillStyle='#24322e';c.fillRect(0,0,1024,180);c.fillStyle='#e3cd9f';c.font='36px monospace';c.textAlign='center';c.fillText('PLACES THAT SHAPED ME',512,75);c.fillStyle='#b4c4b8';c.font='25px monospace';c.fillText('MANIPAL · MUMBAI · PHOENIX',512,130);}const result=new CanvasTexture(canvas);result.colorSpace=SRGBColorSpace;return result;},[]);
 useEffect(()=>()=>{texture.dispose();plaque.dispose();},[texture,plaque]);
 const globe=useRef<Group>(null);
 useFrame((_,dt)=>{if(globe.current&&!reduced&&!document.hidden)globe.current.rotation.y+=Math.min(dt,.05)*.085;});
 const marks=[[13.35,74.79],[19.08,72.88],[33.45,-112.07]];
 return <group position={[1.4,.2,-30]} name="A rotating desk globe, places that shaped me"><group ref={globe} rotation={[.1,2.7,0]}><mesh><sphereGeometry args={[1.8,64,64]}/><meshStandardMaterial map={texture} roughness={.8}/></mesh>{marks.map(([lat,lng],i)=>{const phi=(90-lat)*Math.PI/180,theta=(lng+180)*Math.PI/180;return <mesh key={i} position={[-1.82*Math.sin(phi)*Math.cos(theta),1.82*Math.cos(phi),1.82*Math.sin(phi)*Math.sin(theta)]}><sphereGeometry args={[.035,10,10]}/><meshBasicMaterial color="#f6cf83"/></mesh>;})}</group>
 <mesh rotation={[0,0,.28]}><torusGeometry args={[1.94,.028,10,100]}/><meshStandardMaterial color="#b59a60" metalness={.7} roughness={.4}/></mesh>
 <mesh position={[0,-1.84,0]}><cylinderGeometry args={[.65,.85,.18,32]}/><meshStandardMaterial color="#766448" metalness={.5} roughness={.6}/></mesh>
 <mesh position={[0,-2.38,0]}><boxGeometry args={[4.7,.9,3.5]}/><meshStandardMaterial color="#746651" roughness={.95}/></mesh>
 <mesh position={[0,-1.84,1.77]}><planeGeometry args={[3.6,.64]}/><meshBasicMaterial map={plaque} toneMapped={false}/></mesh>
 </group>;
}
function Objects(){
 const narrow=useThree(state=>state.size.width/state.size.height<.8);
 const [landscapeSource,personSource]=useTexture(['/images/about/tahoe/landscape.webp','/images/about/tahoe/tanmay.webp']);
 const [landscape,person]=useMemo(()=>[landscapeSource,personSource].map(source=>{const copy=source.clone();copy.colorSpace=SRGBColorSpace;return copy;}),[landscapeSource,personSource]);
 useEffect(()=>()=>{landscape.dispose();person.dispose();},[landscape,person]);
 return <>
  <mesh position={[0,60,0]}><cylinderGeometry args={[1000,1000,1300,96,1,true,Math.PI/2,Math.PI]}/><meshBasicMaterial map={landscape} toneMapped={false} side={BackSide} fog={false}/></mesh>
  <mesh position={[narrow?1.3:3.3,2.3,0]}><planeGeometry args={[5.2,9.8]}/><meshBasicMaterial map={person} transparent alphaTest={.05} toneMapped={false} side={DoubleSide}/></mesh>

 </>;
}
export default function AboutWorldScene({progress,renderedProgress,pointer,reduced}:{progress:MotionValue<number>;renderedProgress:MotionValue<number>;pointer:MutableRefObject<{x:number;y:number}>;reduced:boolean}){
 return <Canvas camera={{position:[0,2,12],fov:52,near:.1,far:2200}} dpr={[1,1.5]} gl={{antialias:true,alpha:false,powerPreference:"high-performance"}} style={{touchAction:"pan-y"}}>
  <color attach="background" args={['#567f8c']}/><fog attach="fog" args={['#567f8c',55,190]}/>
  <ambientLight intensity={1.8}/><directionalLight position={[18,30,16]} intensity={2.5} color="#fff0ce"/>
  <WorldCamera progress={progress} pointer={pointer} reduced={reduced} renderedProgress={renderedProgress}/>
  <WorldGround/><Suspense fallback={null}><Water reduced={reduced}/></Suspense><Suspense fallback={null}><Objects/></Suspense><Suspense fallback={null}><MapArtifact reduced={reduced}/></Suspense><WorldMemories reducedMotion={reduced}/>
 </Canvas>;
}
