"use client";

import { Suspense, useEffect, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Image as SceneImage } from "@react-three/drei";
import * as THREE from "three";
import { InterestObject } from "./world-stage";
import { Surface } from "./cinematic-materials";
import { aboutPhotos } from "./photos";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { canWalk, hallwayRooms, nearestDoor, roomAt } from "./hallway-data";

export type WalkInput = {
  keys: Set<string>;
  turn: number;
  pitch: number;
};
export type WalkSnapshot = { x: number; z: number; yaw: number; room: number | null; door: number | null };
type Props = {
  entered: boolean; active: boolean; reduced: boolean; doors: boolean[];
  actions: number[]; input: RefObject<WalkInput>; reset: number;
  onUpdate: (state: WalkSnapshot) => void; onDoor: (index: number) => void;
  onObject: (index: number) => void; onReady: () => void;
  flashlight: boolean; onStep: (room: boolean) => void;
};
type V3 = [number,number,number];

function Box({p,s,c="#b9ae94",metal=0}:{p:V3;s:V3;c?:string;metal?:number}){
  return <mesh position={p} receiveShadow castShadow><boxGeometry args={s}/><meshStandardMaterial color={c} roughness={metal ? .38 : .8} metalness={metal}/></mesh>;
}
function Sign({label,sub="",p,rotation=0,width=1.5,height=.6}:{label:string;sub?:string;p:V3;rotation?:number;width?:number;height?:number}){
  const texture=useMemo(()=>{
    const canvas=document.createElement("canvas");
    canvas.width=1024;canvas.height=320;
    const context=canvas.getContext("2d");
    if(context){
      context.fillStyle="#26332f";context.fillRect(0,0,1024,320);
      context.strokeStyle="#b59a69";context.lineWidth=3;context.strokeRect(12,12,1000,296);
      context.textAlign="center";context.fillStyle="#ebddbc";
      context.font="500 86px Georgia";context.fillText(label,512,sub?139:190);
      if(sub){context.fillStyle="#cbbf9b";context.font="29px monospace";context.fillText(sub.toUpperCase(),512,229);}
    }
    const result=new THREE.CanvasTexture(canvas);result.colorSpace=THREE.SRGBColorSpace;
    return result;
  },[label,sub]);
  useEffect(()=>()=>texture.dispose(),[texture]);
  return <mesh position={p} rotation={[0,rotation,0]}><planeGeometry args={[width,height]}/><meshStandardMaterial map={texture} roughness={.6}/></mesh>;
}
function Door({index,open,onOpen,reduced}:{index:number;open:boolean;onOpen:()=>void;reduced:boolean}){
  const room=hallwayRooms[index];
  const hinge=useRef<THREE.Group>(null);
  useFrame((_,delta)=>{
    if(hinge.current)hinge.current.rotation.y=THREE.MathUtils.damp(hinge.current.rotation.y,open?Math.PI*.52:0,reduced?100:4,Math.min(delta,.05));
  });
  return <group position={[room.side*3,0,room.z]} rotation={[0,room.side===-1?Math.PI/2:-Math.PI/2,0]}>
    <Box p={[-1.12,1.5,.08]} s={[.16,3,.28]} c="#8b795a"/>
    <Box p={[1.12,1.5,.08]} s={[.16,3,.28]} c="#8b795a"/>
    <Box p={[0,3,.08]} s={[2.4,.18,.28]} c="#8b795a"/>
    <Box p={[0,.025,0]} s={[2.1,.05,.45]} c="#b2a382" metal={.3}/>
    <group ref={hinge} position={[-1.02,0,0]} onClick={event=>{event.stopPropagation();onOpen();}}>
      <mesh position={[1.02,1.44,0]} castShadow receiveShadow><boxGeometry args={[2.04,2.88,.1]}/><Suspense fallback={<meshStandardMaterial color="#5c3d29"/>}><Surface kind="wood_floor" repeat={[1,1]}/></Suspense></mesh>
      <Box p={[1.02,1.76,.065]} s={[1.63,1.65,.025]} c="#392a22"/>
      <Box p={[1.02,.55,.065]} s={[1.63,.55,.025]} c="#392a22"/>
      <Sign label={room.number} sub={room.name} p={[1.02,2.1,.091]} width={1.15} height={.5}/>
      <Box p={[1.79,1.12,.09]} s={[.12,.31,.035]} c="#bfaa76" metal={.75}/>
      <Box p={[1.69,1.15,.13]} s={[.25,.045,.04]} c="#d5bd7f" metal={.75}/>
    </group>
    <Sign label={room.number} p={[1.43,1.78,.16]} width={.34} height={.16}/>
  </group>;
}
function Corridor({unlocked}:{unlocked:boolean}){
  const segments=(side:number)=>{
    const openings=hallwayRooms.filter(room=>room.side===side).map(room=>room.z).sort((a,b)=>a-b);
    const blocks:React.ReactNode[]=[];
    let start=-33;
    openings.forEach((z,i)=>{
      const end=z-1.1;
      if(end>start)blocks.push(<Box key={"wall"+i} p={[side*3.09,1.72,(start+end)/2]} s={[.18,3.44,end-start]} c="#476e7b"/>);
      blocks.push(<Box key={"lintel"+i} p={[side*3.09,3.22,z]} s={[.18,.45,2.2]} c="#476e7b"/>);
      start=z+1.1;
    });
    if(start<5)blocks.push(<Box key="end" p={[side*3.09,1.72,(start+5)/2]} s={[.18,3.44,5-start]} c="#476e7b"/>);
    return blocks;
  };
  return <>
    <mesh position={[0,-.08,-14]} receiveShadow><boxGeometry args={[6.2,.16,38]}/><Suspense fallback={<meshStandardMaterial color="#77746d"/>}><Surface kind="concrete_floor_02" repeat={[2,12]} color="#89918f"/></Suspense></mesh>
    <Box p={[0,3.5,-14]} s={[6.3,.15,38]} c="#141e24"/>
    <Box p={[0,.012,-14]} s={[2.35,.025,37.5]} c="#21383c"/>
    {[-1.08,1.08].map(x=><Box key={x} p={[x,.028,-14]} s={[.025,.006,37.5]} c="#b59d72"/>)}
    {Array.from({length:25},(_,i)=><Box key={i} p={[0,.028,4-i*1.5]} s={[1.94,.007,.018]} c="#76a7a0"/>)}
    {segments(-1)}{segments(1)}
    {[-1,1].flatMap(side=>[.2,2.9,3.35].map(y=><Box key={side+":"+y} p={[side*2.97,y,-14]} s={[.07,.045,38]} c={y===.2?"#61583f":"#c2b28b"}/>))}
    <Box p={[-2.03,1.75,-33]} s={[2.1,3.5,.18]} c="#476e7b"/>
    <Box p={[2.03,1.75,-33]} s={[2.1,3.5,.18]} c="#476e7b"/>
    <Box p={[0,3.2,-33]} s={[2,.6,.18]} c="#476e7b"/>
    {!unlocked && <Box p={[0,1.45,-33]} s={[1.9,2.9,.13]} c="#22394e"/>}
    <Sign label={unlocked?"THE ROOFTOP IS OPEN":"FIND THE FIVE"} sub={unlocked?"You earned the view.":"Five keepsakes. One last door."} p={[0,2.65,-32.88]} width={1.8} height={.5}/>
    <pointLight position={[0,2,-32]} intensity={unlocked?17:4} color={unlocked?"#f2c389":"#80c4e7"} distance={7}/>
    <Sign label="THE LONG WAY HOME" sub="Five rooms. A life between them." p={[0,2.82,-2.2]} width={2.6} height={.63}/>
    <Architecture/>
    {[-1,-7,-13,-19,-25,-31].map((z,i)=><group key={z}>
      <Box p={[0,3.39,z]} s={[.65,.045,.5]} c="#ddca9b" metal={.3}/>
      <mesh position={[0,3.35,z]} rotation={[Math.PI/2,0,0]}><planeGeometry args={[.5,.36]}/><meshBasicMaterial color="#ffe3aa" side={THREE.DoubleSide}/></mesh>
      <pointLight position={[0,2.85,z]} color="#ffcf92" intensity={11} distance={7} decay={2}/>
      <Box p={[i%2?2.9:-2.9,1.72,z-1.4]} s={[.09,.4,.2]} c="#b49a65" metal={.5}/>
    </group>)}
  </>;
}
function Architecture(){
  return <>
    <Box p={[0,1.75,4.65]} s={[6.2,3.5,.14]} c="#243339"/>
    <Box p={[0,1.45,4.53]} s={[2.6,2.9,.12]} c="#454e50" metal={.7}/>
    <Box p={[0,1.45,4.44]} s={[.018,2.9,.02]} c="#111a20"/>
    <Sign label="01" sub="Arrivals" p={[0,3.12,4.4]} rotation={Math.PI} width={.7} height={.28}/>
    {[-1,1].map(side=><group key={side}>
      <mesh position={[side*2.8,3.16,-14]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.045,.045,37,10]}/><meshStandardMaterial color="#6f6654" metalness={.8} roughness={.4}/></mesh>
      {Array.from({length:18},(_,i)=>i).filter(i=>!hallwayRooms.some(room=>room.side===side&&Math.abs(room.z-(3-i*2.1))<2.15)).map(i=><group key={i}>
        <Box p={[side*2.96,.62,3-i*2.1]} s={[.045,1.2,1.95]} c="#273639"/>
        <Box p={[side*2.92,1.25,3-i*2.1]} s={[.05,.045,1.95]} c="#938268" metal={.5}/>
      </group>)}
      {[-1,-7,-13,-19,-25,-31].map(z=><group key={z}>
        <Box p={[side*2.91,2.12,z]} s={[.16,.55,.13]} c="#131c22" metal={.65}/>
        <mesh position={[side*2.8,2.12,z]}><boxGeometry args={[.08,.39,.075]}/><meshStandardMaterial color="#ffe0ac" emissive="#ffc27b" emissiveIntensity={3}/></mesh>
        <pointLight position={[side*2.65,2.1,z]} color="#ffc182" intensity={4} distance={3.5}/>
      </group>)}
    </group>)}
    {[-2.3,2.3].map(x=><group key={x} position={[x,0,2.6]}>
      <Box p={[0,.25,0]} s={[.7,.5,.7]} c="#333c3b" metal={.2}/>
      {Array.from({length:8},(_,i)=><mesh key={i} position={[Math.sin(i*2.4)*.15,.7+i*.055,Math.cos(i*2.4)*.15]} rotation={[0,i,Math.sin(i)*.6]}><sphereGeometry args={[.26,10,8]}/><meshStandardMaterial color={i%2?"#405a43":"#2b4639"}/></mesh>)}
    </group>)}
  </>;
}
function Room({index,action,reduced,onObject}:{index:number;action:number;reduced:boolean;onObject:()=>void}){
  const room=hallwayRooms[index];
  const center=room.side*6.9;
  const wall=["#91b7bb","#273d60","#608471","#6b577a","#28555c"][index];
  const photo=index===1?aboutPhotos[action%aboutPhotos.length].id:["la-skyline","tahoe","camping","northern-lights","bmw"][index];
  return <group>
    <mesh position={[center,-.07,room.z]} receiveShadow><boxGeometry args={[7.7,.14,6.6]}/><Suspense fallback={<meshStandardMaterial color="#8b7565"/>}><Surface kind="wood_floor" repeat={[3,3]} color="#bdac94"/></Suspense></mesh>
    <Box p={[center,3.5,room.z]} s={[7.7,.15,6.6]} c={index===1?"#162b4a":"#343c3a"}/>
    <Box p={[center,1.75,room.z-3.25]} s={[7.7,3.5,.16]} c={wall}/>
    <Box p={[center,1.75,room.z+3.25]} s={[7.7,3.5,.16]} c={wall}/>
    <Box p={[room.side*10.75,1.75,room.z]} s={[.15,3.5,6.6]} c={wall}/>
    <Box p={[center,.014,room.z]} s={[4.3,.025,4.6]} c={index===2?"#3b8b56":index===3?"#8b6378":"#577b79"}/>
    <Sign label={room.name} sub={room.number+" / A little about me"} p={[center,2.5,room.z-3.13]} width={2.3} height={.72}/>
    <Suspense fallback={null}>
      <group position={[room.side*10.64,1.9,room.z]} rotation={[0,room.side===-1?Math.PI/2:-Math.PI/2,0]}>
        <Box p={[0,0,-.05]} s={[3.12,2.05,.09]} c="#6a5840"/>
        <SceneImage url={"/images/about/gallery/"+photo+".webp"} scale={[3,1.94]} toneMapped position={[0,0,.01]}/>
      </group>
    </Suspense>
    <group position={[room.side*7.8,0,room.z-.7]} rotation={[0,room.side===-1?Math.PI/2:-Math.PI/2,0]} onClick={event=>{event.stopPropagation();onObject();}}>
      {index===0?<PaperPlane action={action} reduced={reduced}/>:<InterestObject index={room.object} action={action} reduced={reduced}/>}
      <Keepsake found={action>0} reduced={reduced}/>
    </group>
    <RoomDetails index={index} center={center} z={room.z} reduced={reduced}/>
    <group position={[center,0,room.z+2.4]}>
      <Box p={[0,.34,0]} s={[2.1,.55,.7]} c="#453e35"/>
      <Box p={[0,.66,0]} s={[2.15,.12,.78]} c="#86725d"/>
      <Box p={[0,1.04,.32]} s={[2.15,.65,.12]} c="#796653"/>
      {[-.88,.88].map(x=><Box key={x} p={[x,.12,0]} s={[.08,.24,.6]} c="#242b2a" metal={.7}/>)}
      <mesh position={[2.5,.8,0]} castShadow><cylinderGeometry args={[.015,.02,1.6,10]}/><meshStandardMaterial color="#c6ac7e" metalness={.8} roughness={.3}/></mesh>
      <mesh position={[2.5,.045,0]} receiveShadow><cylinderGeometry args={[.27,.3,.06,24]}/><meshStandardMaterial color="#333536" metalness={.6}/></mesh>
      <mesh position={[2.5,1.64,0]} castShadow><cylinderGeometry args={[.19,.34,.42,24,1,true]}/><meshStandardMaterial color="#d9c8a0" side={THREE.DoubleSide} roughness={.85}/></mesh>
      <pointLight position={[2.5,1.5,0]} color="#ffc785" intensity={5} distance={4}/>
    </group>
    <Box p={[center,3.34,room.z]} s={[.8,.08,.8]} c="#ddc79b"/>
    <pointLight position={[center,2.8,room.z]} intensity={14} distance={8} color={room.accent}/>
  </group>;
}

function PaperPlane({action,reduced}:{action:number;reduced:boolean}){
  const plane=useRef<THREE.Group>(null),last=useRef(action),time=useRef(10);
  const geometry=useMemo(()=>{
    const result=new THREE.BufferGeometry();
    result.setAttribute("position",new THREE.Float32BufferAttribute([
      0,.05,-.65,-.55,0,.38,0,.18,.12, 0,.05,-.65,0,.18,.12,.55,0,.38,
      -.55,0,.38,-.12,-.08,.25,0,.05,-.65, .55,0,.38,0,.05,-.65,.12,-.08,.25
    ],3));result.computeVertexNormals();return result;
  },[]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  useFrame((_,delta)=>{
    if(last.current!==action){last.current=action;time.current=0;}
    time.current=Math.min(2.5,time.current+delta);
    if(plane.current){const t=time.current/2.5;plane.current.position.set(reduced?0:Math.sin(t*Math.PI*2)*.7,1.5+(reduced?0:Math.sin(t*Math.PI)*.8),reduced?0:Math.sin(t*Math.PI)*-.7);plane.current.rotation.y=t*Math.PI*2;}
  });
  return <><Box p={[0,.6,0]} s={[1.6,.08,.8]} c="#aa8760"/>{[-.6,.6].map(x=><Box key={x} p={[x,.3,0]} s={[.08,.6,.65]} c="#304b5b"/>)}<group ref={plane} position={[0,1.5,0]}><mesh geometry={geometry}><meshStandardMaterial color="#f4d69c" roughness={.45} metalness={.2} side={THREE.DoubleSide}/></mesh></group></>;
}
function Keepsake({found,reduced}:{found:boolean;reduced:boolean}){
  const group=useRef<THREE.Group>(null);
  useFrame(({clock})=>{if(group.current&&!reduced){group.current.position.y=2.3+Math.sin(clock.elapsedTime*2)*.1;group.current.rotation.y=clock.elapsedTime*.8;}});
  if(found)return null;
  return <group ref={group} position={[0,2.3,0]}>
    <mesh rotation={[Math.PI/2,0,0]}><torusGeometry args={[.23,.022,8,32]}/><meshStandardMaterial color="#f4ca78" emissive="#e3a54c" emissiveIntensity={.7}/></mesh>
    <mesh><octahedronGeometry args={[.11]}/><meshStandardMaterial color="#ffe4a4" emissive="#f2c06c" emissiveIntensity={1}/></mesh>
    <pointLight color="#efc77a" intensity={1.4} distance={2}/>
  </group>;
}
function RoomDetails({index,center,z,reduced}:{index:number;center:number;z:number;reduced:boolean}){
  const stars=useMemo(()=>Float32Array.from(Array.from({length:180},(_,i)=>{
    const n=Math.floor(i/3),axis=i%3;
    return axis===0?Math.sin(n*6.73)*3.4:axis===1?3.25:Math.cos(n*9.37)*3;
  })),[]);
  return <group position={[center,0,z]}>
    {index===1&&<>
      <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[stars,3]}/></bufferGeometry><pointsMaterial color="#d8edff" size={.035} sizeAttenuation/></points>
      {[-2.8,2.7].map((x,i)=><group key={x} position={[x,0,1.9-i*3.9]}><mesh position={[0,.65,0]}><cylinderGeometry args={[.05,.09,1.3,8]}/><meshStandardMaterial color="#4e4037"/></mesh>{[0,1,2].map(k=><mesh key={k} position={[0,1.1+k*.45,0]}><coneGeometry args={[.65-k*.15,1.2,7]}/><meshStandardMaterial color={k%2?"#3c7d7b":"#285e68"}/></mesh>)}</group>)}
      <mesh position={[-2,.6,-2.2]} rotation={[0,.3,0]}><coneGeometry args={[.8,1.3,3]}/><meshStandardMaterial color="#d4ac71" roughness={.9}/></mesh>
    </>}
    {index===2&&<>
      <Box p={[0,.035,0]} s={[6.4,.015,.035]} c="#d3e2b7"/>{[-2.6,2.6].map(x=><Box key={x} p={[x,.035,0]} s={[.035,.015,5.5]} c="#d3e2b7"/>)}
      <mesh position={[0,.046,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.8,.825,48]}/><meshBasicMaterial color="#d3e2b7"/></mesh>
      <Sign label="OFF THE CLOCK" sub="A different kind of focus." p={[0,2.6,3.12]} rotation={Math.PI} width={2.1} height={.6}/>
    </>}
    {index===3&&[-2.8,2.8].map((x,j)=><group key={x} position={[x,0,-2.4]}>
      {[.6,1.5,2.4].map((y,k)=><group key={y}><Box p={[0,y,0]} s={[.9,.07,.6]} c="#b4987e"/>{Array.from({length:6},(_,i)=><Box key={i} p={[-.34+i*.135,y+.31,0]} s={[.1,.48+(i%2)*.1,.35]} c={["#b2bba0","#d2b486","#759a9e","#bc9296"][(i+j+k)%4]}/>)}</group>)}
    </group>)}
    {index===4&&<>
      <Sign label="What if?" sub="Follow the question." p={[0,2.5,3.12]} rotation={Math.PI} width={2} height={.7}/>
      <mesh position={[0,3.25,0]} rotation={[Math.PI/2,0,0]}><ringGeometry args={[1.8,1.84,64]}/><meshBasicMaterial color="#77d8d5"/></mesh>
      {!reduced&&<pointLight position={[0,1.8,1]} color="#63b4ca" intensity={3} distance={5}/>}
    </>}
  </group>;
}
function Rooftop(){return <group>
  <Box p={[0,-.08,-38.2]} s={[11.2,.16,10.5]} c="#b19578"/>
  {[-5.55,5.55].map(x=><Box key={x} p={[x,.5,-38.2]} s={[.18,1,10.5]} c="#728e91"/>)}
  <Box p={[0,.5,-43.4]} s={[11.2,1,.18]} c="#728e91"/>
  <Box p={[-3.7,.4,-38.5]} s={[1.3,.08,2.2]} c="#9c775a"/>
  <Box p={[-4.25,.85,-38.5]} s={[.08,.9,2.2]} c="#9c775a"/>
  <Suspense fallback={null}><SceneImage url="/images/about/tahoe/landscape.webp" position={[0,4.2,-47]} scale={[29,12]} toneMapped/></Suspense>
  <mesh position={[5,6.5,-46]}><sphereGeometry args={[1.3,32,24]}/><meshBasicMaterial color="#ffd6a0"/></mesh>
  {[-4,4].map(x=><group key={x}><Box p={[x,.25,-41.7]} s={[1.2,.5,1.2]} c="#8f826a"/><mesh position={[x,.95,-41.7]}><sphereGeometry args={[.65,12,8]}/><meshStandardMaterial color="#426f65"/></mesh></group>)}
  <pointLight position={[0,3,-38]} color="#ffdbac" intensity={30} distance={15}/>
</group>;
}
function Walker({entered,doors,input,reset,reduced,onUpdate,onReady,actions,flashlight,onStep}:Pick<Props,"entered"|"doors"|"input"|"reset"|"reduced"|"onUpdate"|"onReady"|"actions"|"flashlight"|"onStep">){
  const player=useRef({x:0,z:2.8,yaw:0,pitch:0,time:0,vx:0,vz:0,height:1.62,step:0});
  const lamp=useRef<THREE.SpotLight>(null);
  const ceilingLight=useRef<THREE.SpotLight>(null);
  const lampTarget=useMemo(()=>new THREE.Object3D(),[]);
  const floorTarget=useMemo(()=>new THREE.Object3D(),[]);
  const direction=useMemo(()=>new THREE.Vector3(),[]);
  const lastReset=useRef(reset);
  const report=useRef(0);
  const lastLook=useRef({turn:0,pitch:0});
  useEffect(()=>onReady(),[onReady]);
  useFrame(({camera},rawDelta)=>{
    const delta=Math.min(rawDelta,.04);
    const p=player.current;
    if(lastReset.current!==reset){lastReset.current=reset;p.x=0;p.z=2.8;p.yaw=0;p.pitch=0;p.vx=0;p.vz=0;p.height=1.62;p.step=0;lastLook.current={turn:input.current.turn,pitch:input.current.pitch};}
    const controls=input.current;
    let walking=false;
    if(entered){
      p.yaw+=controls.turn-lastLook.current.turn;
      p.pitch=THREE.MathUtils.clamp(p.pitch+controls.pitch-lastLook.current.pitch,-.65,.65);
      lastLook.current={turn:controls.turn,pitch:controls.pitch};
      if(controls.keys.has("ArrowLeft"))p.yaw+=delta*1.6;
      if(controls.keys.has("ArrowRight"))p.yaw-=delta*1.6;
      let forward=Number(controls.keys.has("KeyW")||controls.keys.has("ArrowUp"))-Number(controls.keys.has("KeyS")||controls.keys.has("ArrowDown"));
      let strafe=Number(controls.keys.has("KeyD"))-Number(controls.keys.has("KeyA"));
      const magnitude=Math.hypot(forward,strafe);
      walking=magnitude>0;
      if(magnitude){forward/=magnitude;strafe/=magnitude;}
      const crouched=controls.keys.has("KeyC");
      const sprinting=!crouched&&(controls.keys.has("ShiftLeft")||controls.keys.has("ShiftRight"));
      const speed=crouched?1.3:sprinting?4.1:2.4;
      p.vx=THREE.MathUtils.damp(p.vx,(-Math.sin(p.yaw)*forward+Math.cos(p.yaw)*strafe)*speed,10,delta);
      p.vz=THREE.MathUtils.damp(p.vz,(-Math.cos(p.yaw)*forward-Math.sin(p.yaw)*strafe)*speed,10,delta);
      p.height=THREE.MathUtils.damp(p.height,crouched?1.12:1.62,10,delta);
      const dx=p.vx*delta;
      const dz=p.vz*delta;
      const oldX=p.x,oldZ=p.z;
      if(canWalk({x:p.x+dx,z:p.z},doors,actions.every(value=>value>0)))p.x+=dx;
      if(canWalk({x:p.x,z:p.z+dz},doors,actions.every(value=>value>0)))p.z+=dz;
      const distance=Math.hypot(p.x-oldX,p.z-oldZ);
      walking=distance>.001;
      if(walking){p.time+=delta*(sprinting?1.45:.95);p.step+=distance;}
      if(p.step>(crouched?.85:sprinting?1.6:1.15)){p.step=0;onStep(roomAt(p)!==null);}
      if(camera instanceof THREE.PerspectiveCamera){camera.fov=THREE.MathUtils.damp(camera.fov,sprinting&&walking&&!reduced?76:68,6,delta);camera.updateProjectionMatrix();}
    }else{
      p.vx=0;p.vz=0;
    }
    camera.position.set(p.x,p.height+(!reduced&&walking?Math.sin(p.time*10)*.026:0),p.z);
    camera.rotation.order="YXZ";camera.rotation.set(p.pitch,p.yaw,!reduced&&walking?Math.sin(p.time*5)*.003:0);
    if(lamp.current){
      camera.getWorldDirection(direction);
      lamp.current.position.copy(camera.position);lamp.current.position.y-=.12;
      lampTarget.position.copy(camera.position).addScaledVector(direction,9);
      lamp.current.target=lampTarget;
      lamp.current.intensity=entered&&flashlight?28:0;
    }
    if(ceilingLight.current){
      const room=roomAt(p);
      const x=room===null?0:hallwayRooms[room].side*6.9;
      const z=room===null?p.z:hallwayRooms[room].z;
      ceilingLight.current.position.set(x,3.15,z);
      floorTarget.position.set(x,0,z);
      ceilingLight.current.target=floorTarget;
    }
    report.current+=delta;
    if(report.current>.12){report.current=0;onUpdate({x:p.x,z:p.z,yaw:p.yaw,room:roomAt(p),door:nearestDoor(p)});}
  });
  return <><primitive object={lampTarget}/><primitive object={floorTarget}/><spotLight ref={lamp} angle={.38} penumbra={.7} intensity={0} distance={19} decay={1.5} color="#e5eeff" castShadow shadow-mapSize={[1024,1024]} shadow-bias={-.00015}/><spotLight ref={ceilingLight} angle={1.1} penumbra={.6} intensity={18} distance={9} color="#ffe1b1" castShadow shadow-mapSize={[512,512]} shadow-bias={-.0003}/></>;
}
export default function HallwayStage(props:Props){
  const unlocked=props.actions.every(value=>value>0);
  const latest=useRef<WalkSnapshot>({x:0,z:2.8,yaw:0,room:null,door:null});
  function update(state:WalkSnapshot){latest.current=state;props.onUpdate(state);}
  return <Canvas shadows dpr={[1,1.5]} camera={{position:[0,1.62,2.8],fov:68,near:.08,far:65}} gl={{antialias:true,powerPreference:"high-performance",toneMapping:THREE.ACESFilmicToneMapping,toneMappingExposure:1.2}} frameloop={props.active?"always":"demand"} aria-label="Walkable hallway with five doors into Tanmay’s life" fallback={<div>3D is unavailable. Use “Read the rooms” to explore the stories.</div>}>
    <color attach="background" args={["#111c24"]}/><fog attach="fog" args={["#172c35",12,48]}/>
    <ambientLight intensity={.22} color="#ded8bc"/><hemisphereLight args={["#b9d1e3","#514332",.48]}/>
    <Corridor unlocked={unlocked}/><Rooftop/>
    {hallwayRooms.map((room,index)=><group key={room.number}>
      <Door index={index} open={props.doors[index]} reduced={props.reduced} onOpen={()=>props.onDoor(index)}/>
      <Room index={index} action={props.actions[index]} reduced={props.reduced} onObject={()=>{if(latest.current.room===index)props.onObject(index);}}/>
    </group>)}
    <Walker {...props} onUpdate={update}/>
    {!props.reduced&&<EffectComposer multisampling={0}><Bloom intensity={.3} luminanceThreshold={1.3} mipmapBlur/><Vignette offset={.25} darkness={.35}/></EffectComposer>}
  </Canvas>;
}
