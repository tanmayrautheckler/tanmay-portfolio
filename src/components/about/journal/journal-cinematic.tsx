"use client";
/* Three.js owns scene transforms; animation never mutates React state. */
import {useEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {useTexture} from '@react-three/drei/core/Texture';
import * as THREE from 'three';
import {useJournalSurface} from './journal-materials';

type Clock={time:React.RefObject<{t:number}>};
type Point=[number,number,number];
const BASE='/images/about/journal/';
function Rod({a,b,r=.012,color='#36423d'}:{a:Point;b:Point;r?:number;color?:string}) {
 const mid=new THREE.Vector3(...a).add(new THREE.Vector3(...b)).multiplyScalar(.5);
 const axis=new THREE.Vector3(...b).sub(new THREE.Vector3(...a));
 const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),axis.clone().normalize());
 return <mesh position={mid} quaternion={q} castShadow><cylinderGeometry args={[r,r,axis.length(),8]}/><meshStandardMaterial color={color} roughness={.48} metalness={.25}/></mesh>;
}

/** Generic unbranded airliner, authored geometry. Nose points along +X. */
export function Airliner({time,offset=0}:Clock&{offset?:number}) {
 const plane=useRef<THREE.Group>(null);
 const profile=useMemo(()=>[[0,-.72],[.055,-.63],[.094,-.42],[.105,-.12],[.105,.37],[.08,.53],[.025,.69],[0,.73]].map(([x,y])=>new THREE.Vector2(x,y)),[]);
 const wing=useMemo(()=>{
  const s=new THREE.Shape();s.moveTo(.22,0);s.lineTo(-.28,.93);s.lineTo(-.48,.93);s.lineTo(-.28,.07);s.closePath();
  return new THREE.ExtrudeGeometry(s,{depth:.018,bevelEnabled:true,bevelSize:.008,bevelThickness:.008,bevelSegments:1,steps:1});
 },[]);
 useEffect(()=>()=>wing.dispose(),[wing]);
 useFrame(()=>{
  if(!plane.current)return;
  const p=((Math.max(0,time.current.t-offset))%20)/11;
  plane.current.position.set(-3.65+p*7.3,1.9+Math.sin(p*Math.PI)*.16,-.78+Math.sin(p*Math.PI)*.32);
  plane.current.rotation.set(-.04,Math.sin(p*Math.PI*2)*.08,-.03+Math.cos(p*Math.PI)*.04);
  plane.current.visible=p>.01&&p<.995;
 });
 return <group name="crossing-airliner" userData={{journalLayer:'atmosphere'}}><group ref={plane} scale={1.05}>
  <mesh rotation={[0,0,-Math.PI/2]} castShadow><latheGeometry args={[profile,32]}/><meshStandardMaterial color="#f2f3ed" metalness={.35} roughness={.28}/></mesh>
  {[-1,1].map(side=><group key={side} scale={[1,1,side]}>
   <mesh geometry={wing} rotation={[-Math.PI/2,0,0]} castShadow><meshStandardMaterial color="#dde2dc" metalness={.4} roughness={.35} side={THREE.DoubleSide}/></mesh>
   <mesh position={[-.51,.035,.27]} scale={[.36,.7,.42]} rotation={[-Math.PI/2,0,0]} geometry={wing} castShadow><meshStandardMaterial color="#cfd8d5" metalness={.3} roughness={.4}/></mesh>
   <group position={[-.03,-.1,.37]} rotation={[0,0,-Math.PI/2]}>
    <mesh castShadow><cylinderGeometry args={[.07,.085,.26,20]}/><meshStandardMaterial color="#d2d9d6" metalness={.6} roughness={.28}/></mesh>
    <mesh position={[0,.136,0]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[.056,20]}/><meshStandardMaterial color="#15232b" roughness={.6}/></mesh>
    <mesh position={[0,.14,0]}><coneGeometry args={[.018,.04,12]}/><meshStandardMaterial color="#778790" metalness={.7} roughness={.3}/></mesh>
   </group>
   {Array.from({length:15},(_,i)=><mesh key={i} position={[-.45+i*.059,.035,.097]}><sphereGeometry args={[.012,6,4]}/><meshStandardMaterial color="#17313d" metalness={.5} roughness={.3}/></mesh>)}
   <mesh position={[-.2,.024,.96]}><sphereGeometry args={[.018,8,6]}/><meshBasicMaterial color={side<0?'#d74b46':'#83e4b0'}/></mesh>
  </group>)}
  <mesh position={[-.52,.2,0]} rotation={[0,0,.45]} castShadow><boxGeometry args={[.18,.42,.025]}/><meshStandardMaterial color="#304d58" metalness={.2} roughness={.4}/></mesh>
  <mesh position={[.51,.065,0]} scale={[1,.25,1]}><sphereGeometry args={[.065,14,8]}/><meshStandardMaterial color="#19353e" metalness={.4} roughness={.25}/></mesh>
 </group></group>;
}

export {default as OutdoorWorld} from './journal-outdoor-world';

function Stadium() {
 const concrete=useJournalSurface('concrete',[3,2],.22);
  const seats=useRef<THREE.InstancedMesh>(null);
 const bowl=useMemo(()=>[[1.08,.01],[1.14,.1],[1.52,.47],[1.62,.49],[1.62,.035],[1.08,.01]].map(([r,y])=>new THREE.Vector2(r,y)),[]);
 const pitch=useMemo(()=>{
  const c=document.createElement('canvas');c.width=768;c.height=440;const x=c.getContext('2d')!;
  for(let i=0;i<12;i++){x.fillStyle=i%2?'#507448':'#587b4e';x.fillRect(i*64,0,64,440);}
  x.strokeStyle='#dddcc3';x.lineWidth=2;x.strokeRect(35,28,698,384);x.beginPath();x.moveTo(384,28);x.lineTo(384,412);x.stroke();
  x.beginPath();x.arc(384,220,57,0,Math.PI*2);x.stroke();x.strokeRect(35,110,100,220);x.strokeRect(633,110,100,220);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
 },[]);
 useEffect(()=>()=>pitch.dispose(),[pitch]);
 useEffect(()=>{
  if(!seats.current)return;const dummy=new THREE.Object3D();
  for(let row=0;row<5;row++)for(let i=0;i<160;i++){
   const a=i/160*Math.PI*2,r=1.18+row*.072,index=row*160+i;
   dummy.position.set(Math.cos(a)*r,.15+row*.075,Math.sin(a)*r*.58);dummy.rotation.set(0,-a+Math.PI/2,0);dummy.updateMatrix();
   seats.current.setMatrixAt(index,dummy.matrix);seats.current.setColorAt(index,new THREE.Color((i+row)%5<3?'#3e547c':'#8b4155'));
  }
  seats.current.instanceMatrix.needsUpdate=true;if(seats.current.instanceColor)seats.current.instanceColor.needsUpdate=true;
 },[]);
 return <group position={[1.28,.05,.46]} name="stadium-miniature" userData={{journalLayer:'terrain'}}>
  <mesh scale={[1,1,.58]} receiveShadow castShadow><latheGeometry args={[bowl,128]}/><meshStandardMaterial {...concrete} color="#b5b8ad" roughness={.95} side={THREE.DoubleSide}/></mesh>
  <mesh rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[2.15,1.22]}/><meshStandardMaterial map={pitch} roughness={.95}/></mesh>
  {[0,1,2,3,4].map(i=><mesh key={i} position={[0,.1+i*.075,0]} rotation={[-Math.PI/2,0,0]} scale={[1,.58,1]} receiveShadow castShadow><ringGeometry args={[1.13+i*.072,1.2+i*.072,120]}/><meshStandardMaterial {...concrete} color="#c1c0b3" roughness={.92} side={THREE.DoubleSide}/></mesh>)}
  <instancedMesh ref={seats} args={[undefined,undefined,800]} castShadow><boxGeometry args={[.028,.025,.03]}/><meshStandardMaterial roughness={.82}/></instancedMesh>
  <mesh position={[0,.55,0]} scale={[1,1,.58]}><cylinderGeometry args={[1.59,1.52,.22,80,1,true,Math.PI-1.35,2.7]}/><meshStandardMaterial color="#c8c6b4" side={THREE.DoubleSide} roughness={.92}/></mesh>
  {[-1,1].map(x=><group key={x} position={[x*1.03,.08,0]}>
   <Rod a={[0,0,-.2]} b={[0,.2,-.2]} r={.008} color="#f0ead8"/><Rod a={[0,0,.2]} b={[0,.2,.2]} r={.008} color="#f0ead8"/><Rod a={[0,.2,-.2]} b={[0,.2,.2]} r={.008} color="#f0ead8"/>
  </group>)}
  {[-1,1].flatMap(x=>[-1,1].map(z=><group key={`${x}${z}`} position={[x*1.38,0,z*.66]}>
   <Rod a={[0,0,0]} b={[0,1.1,0]} r={.015} color="#8e9998"/>
   <group position={[0,1.12,0]} rotation={[-.5,0,0]}>
    <mesh castShadow><boxGeometry args={[.28,.1,.07]}/><meshStandardMaterial color="#56605d" metalness={.7} roughness={.48}/></mesh>
    {[-.094,-.031,.031,.094].map(x=><mesh key={x} position={[x,0,.037]}><planeGeometry args={[.045,.064]}/><meshStandardMaterial color="#ded7bc" emissive="#d8c99b" emissiveIntensity={.18} roughness={.4}/></mesh>)}
   </group>
  </group>))}
 </group>;
}

export function FootballCinema({time}:Clock) {
 const source=useTexture(BASE+'messi-barca-2014.webp');
 const ball=useRef<THREE.Group>(null);
 const messi=useMemo(()=>{
  const texture=source.clone();texture.colorSpace=THREE.SRGBColorSpace;
  // Preserve the photograph's pixels and aspect ratio; focus the print on Messi.
  texture.repeat.set(.55,.96);texture.offset.set(.025,.01);texture.needsUpdate=true;
  return texture;
 },[source]);
 const dedication=useMemo(()=>{
  const c=document.createElement('canvas');c.width=1024;c.height=256;const x=c.getContext('2d')!;
  x.fillStyle='#203830';x.fillRect(0,0,1024,256);x.fillStyle='#d4bb81';x.font='128px Georgia';x.fillText('10',40,174);
  x.fillStyle='#f0e8d3';x.font='53px Georgia';x.fillText('Lionel Messi',240,112);
  x.fillStyle='#b2bca7';x.font='24px monospace';x.fillText('BARÇA / THE BEAUTIFUL GAME',243,173);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
 },[]);
 const panels=useMemo(()=>{
  const g=new THREE.IcosahedronGeometry(1,0),points:THREE.Vector3[]=[];
  for(let i=0;i<g.attributes.position.count;i++){
   const point=new THREE.Vector3().fromBufferAttribute(g.attributes.position,i).normalize();
   if(!points.some(p=>p.distanceToSquared(point)<.001))points.push(point);
  }
  g.dispose();return points;
 },[]);
 useEffect(()=>()=>{messi.dispose();dedication.dispose();},[messi,dedication]);
 useFrame(()=>{
  const p=(time.current.t%10)/10;
  if(ball.current){
   ball.current.position.set(.4+p*1.82,.19+Math.sin(p*Math.PI)*.14,.62-p*.16);
   ball.current.rotation.z=-p*12;
  }
 });
 return <>
  <group name="football-photo-print" userData={{journalLayer:'actors',revealOrder:1}}>
   <group position={[-1.7,.045,.12]} rotation={[-.17,.055,-.015]}>
    <mesh position={[0,1.26,-.036]} castShadow><boxGeometry args={[2.02,2.62,.05]}/><meshStandardMaterial color="#ebdfc5" roughness={.92}/></mesh>
    <mesh position={[0,1.29,-.005]}><planeGeometry args={[1.86,2.435]}/><meshBasicMaterial map={messi} toneMapped={false}/></mesh>
    <mesh position={[0,.05,-.14]} castShadow receiveShadow><boxGeometry args={[1.5,.08,.48]}/><meshStandardMaterial color="#d3c5a6" roughness={.95}/></mesh>
   </group>
   <mesh position={[-1.7,.035,1.52]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[2.32,.58]}/><meshStandardMaterial map={dedication} roughness={.85}/></mesh>
  </group>
  <Stadium/>
  <group userData={{journalLayer:'actors',revealOrder:2}}><group ref={ball}>
   <mesh castShadow><sphereGeometry args={[.1,24,16]}/><meshStandardMaterial color="#f3edd7" roughness={.6}/></mesh>
   {panels.map((normal,i)=><mesh key={i} position={normal.clone().multiplyScalar(.099)} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),normal)}><circleGeometry args={[.035,5]}/><meshStandardMaterial color="#28352f" roughness={.8}/></mesh>)}
  </group></group>
  <group userData={{journalLayer:'terrain'}}>{Array.from({length:8},(_,i)=><mesh key={i} position={[.2+i*.36,.055,1.52]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[.12,.03]}/><meshBasicMaterial color={i%2?'#8f2d48':'#244f7a'}/></mesh>)}</group>
 </>;
}
