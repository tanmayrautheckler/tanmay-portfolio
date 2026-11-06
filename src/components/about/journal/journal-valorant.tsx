"use client";

/* An authored tactical miniature, not a replay or a claim about player rank. */
import {createContext,useContext,useEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {RoundedBox} from '@react-three/drei/core/RoundedBox';
import {useJournalSurface} from './journal-materials';
import {JournalCharacter} from './journal-character';

type Props={time:React.RefObject<{t:number}>};
type Point=[number,number,number];
const PAPER='#dbd0b5',PLASTER='#b9ac8b',INK='#263c39',TEAL='#659b8d',CORAL='#ad6655',STEEL='#75857c';
const softenPaint=(shader:Parameters<THREE.MeshStandardMaterial['onBeforeCompile']>[0])=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n diffuseColor.rgb = mix(diffuseColor.rgb, diffuse, 0.76);');};
const SurfaceContext=createContext<ReturnType<typeof useJournalSurface>|null>(null);
const TERRAIN={journalLayer:'terrain',revealOrder:0},ACTORS={journalLayer:'actors',revealOrder:2},AIR={journalLayer:'atmosphere',revealOrder:3};
function Beam({a,b,r=.012,color=STEEL}:{a:Point;b:Point;r?:number;color?:string}){
 const transform=useMemo(()=>{const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start);return {center:start.add(end).multiplyScalar(.5),quaternion:new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),delta.clone().normalize()),length:delta.length()};},[a,b]);
 return <mesh position={transform.center} quaternion={transform.quaternion} castShadow><cylinderGeometry args={[r,r,transform.length,7]}/><meshStandardMaterial color={color} roughness={.65} metalness={.3}/></mesh>;
}
function Panel({position,size,color=PLASTER}:{position:Point;size:Point;color?:string}){
 const surface=useContext(SurfaceContext),textured=Math.max(...size)>.36,metal=color===INK||color===STEEL||color===TEAL;
 const detail=surface??{};
 return <RoundedBox args={size} radius={Math.min(.012,...size.map(v=>v*.15))} smoothness={2} position={position} castShadow receiveShadow><meshStandardMaterial {...(textured?detail:{})} color={color} roughness={metal?.64:.94} metalness={metal?.35:0} envMapIntensity={metal?.75:.35} onBeforeCompile={softenPaint}/></RoundedBox>;
}
function SiteFloor(){
 const surface=useContext(SurfaceContext);
 const floor=useMemo(()=>{
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=640;const c=canvas.getContext('2d')!;
  c.fillStyle='#adac98';c.fillRect(0,0,1024,640);c.strokeStyle='#989d8a';c.lineWidth=2;
  for(let x=0;x<1024;x+=64){c.beginPath();c.moveTo(x,0);c.lineTo(x,640);c.stroke();}
  for(let y=0;y<640;y+=64){c.beginPath();c.moveTo(0,y);c.lineTo(1024,y);c.stroke();}
  c.fillStyle='#8d9787';c.fillRect(62,58,240,130);c.fillRect(735,58,223,150);
  c.strokeStyle='#c9c8ad';c.lineWidth=5;c.strokeRect(66,62,892,516);
  c.strokeStyle='#bd806a';c.lineWidth=7;c.setLineDash([20,14]);c.strokeRect(445,250,236,250);c.setLineDash([]);
  c.fillStyle='#d2cbb0';c.font='bold 52px monospace';c.textAlign='center';c.fillText('A',563,398);
  c.strokeStyle='#ced0b8';c.lineWidth=4;c.beginPath();c.moveTo(100,512);c.lineTo(390,512);c.lineTo(390,430);c.stroke();
  c.beginPath();c.moveTo(366,452);c.lineTo(390,428);c.lineTo(414,452);c.stroke();
  // Dust and wear remain subtle, so wayfinding keeps its hierarchy.
  for(let i=0;i<600;i++){const x=(Math.sin(i*82.3)*.5+.5)*1024,y=(Math.sin(i*36.8+7)*.5+.5)*640;c.fillStyle=i%2?'rgba(65,77,66,.06)':'rgba(235,226,197,.12)';c.fillRect(x,y,4,2);}
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;return map;
 },[]);
 useEffect(()=>()=>floor.dispose(),[floor]);
 return <group userData={TERRAIN}>
  <Panel position={[0,.035,.1]} size={[5.55,.07,3.05]} color='#777e6b'/>
  <mesh position={[0,.074,.1]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[5.55,3.05]}/><meshStandardMaterial {...(surface??{})} map={floor} roughness={.97}/></mesh>
  {[-1,1].map(s=><Panel key={s} position={[s*2.65,.1,.1]} size={[.055,.06,2.9]} color={PAPER}/>)}
 </group>;
}
function Passage(){
 const surface=useContext(SurfaceContext);
 const sign=useMemo(()=>{
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=128;const c=canvas.getContext('2d')!;
  c.fillStyle='#713e36';c.fillRect(0,0,1024,128);c.fillStyle='#eadfc6';
  c.beginPath();c.moveTo(40,28);c.lineTo(85,83);c.lineTo(125,83);c.lineTo(40,0);c.fill();
  c.beginPath();c.moveTo(152,27);c.lineTo(111,67);c.lineTo(152,67);c.fill();
  c.font='600 65px sans-serif';c.fillText('VALORANT',210,88);
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;return map;
 },[]);
 const arch=useMemo(()=>{
  const shape=new THREE.Shape();shape.absarc(0,.68,.53,0,Math.PI,false);shape.lineTo(-.33,.68);shape.absarc(0,.68,.33,Math.PI,0,true);shape.closePath();
  return new THREE.ExtrudeGeometry(shape,{depth:.23,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:1});
 },[]);
 useEffect(()=>()=>{arch.dispose();sign.dispose();},[arch,sign]);
 return <group position={[-1.76,.08,-.78]} userData={TERRAIN} name='arched-passage'>
  <Panel position={[-.54,.35,.12]} size={[.42,.7,.24]}/><Panel position={[.54,.35,.12]} size={[.42,.7,.24]}/>
  <mesh geometry={arch} castShadow receiveShadow><meshStandardMaterial {...(surface??{})} onBeforeCompile={softenPaint} color={PLASTER} roughness={.96}/></mesh>
  <Panel position={[0,1.24,.12]} size={[1.66,.1,.3]} color={PAPER}/><Panel position={[0,1.31,.12]} size={[1.78,.055,.36]} color={CORAL}/>
  <mesh position={[0,1.24,.272]}><planeGeometry args={[1.24,.155]}/><meshStandardMaterial map={sign} roughness={.9}/></mesh>
  <Panel position={[-.74,.57,-.27]} size={[.15,1.14,.77]}/><Panel position={[.74,.57,-.27]} size={[.15,1.14,.77]}/>
  <Panel position={[0,.025,-.26]} size={[1.46,.05,.78]} color='#8a8e7d'/>
  <Panel position={[-.58,.37,.25]} size={[.05,.69,.025]} color={CORAL}/><Panel position={[.58,.37,.25]} size={[.05,.69,.025]} color={CORAL}/>
  {[0,1,2,3,4,5].map(i=><group key={i}>
   <Panel position={[-.55,.16+i*.17,.246]} size={[.35,.016,.012]} color='#938d75'/>
   <Panel position={[.55,.16+i*.17,.246]} size={[.35,.016,.012]} color='#938d75'/>
  </group>)}
  <Panel position={[.02,.72,-.64]} size={[.5,.65,.04]} color={INK}/>
  <Panel position={[.02,1.08,-.61]} size={[.56,.045,.06]} color={TEAL}/>
  <Beam a={[-.76,.07,-.56]} b={[-.76,1.34,-.56]} r={.026}/>
  <mesh position={[-.48,.94,.28]}><boxGeometry args={[.12,.09,.06]}/><meshStandardMaterial color='#eee2ba' emissive='#b6a882' emissiveIntensity={.3}/></mesh>
  {/* Narrow planter softens the site without obscuring the passage. */}
  <Panel position={[-.53,.1,.49]} size={[.38,.2,.2]} color={CORAL}/>
  {[-.12,-.04,.05,.13].map((x,i)=><mesh key={x} position={[-.53+x,.25+(i%2)*.03,.49]} scale={[.025,.1,.04]} rotation={[0,0,x*2]} castShadow><sphereGeometry args={[1,7,5]}/><meshStandardMaterial color='#57725b' roughness={1}/></mesh>)}
 </group>;
}
function Catwalk(){
 return <group position={[1.64,.08,-.71]} userData={TERRAIN} name='two-level-catwalk'>
  <Panel position={[0,.39,-.25]} size={[1.5,.78,.2]} color={INK}/><Panel position={[0,.81,-.02]} size={[1.68,.12,1.06]} color='#899286'/>
  <Panel position={[0,1.24,-.57]} size={[1.57,.8,.13]} color={PLASTER}/>
  {[0,1,2,3].map(i=><Panel key={i} position={[-.58+i*.38,1.22,-.49]} size={[.022,.61,.018]} color='#978e75'/>)}
  <Panel position={[0,1.66,-.54]} size={[1.71,.065,.25]} color={PAPER}/>
  <Panel position={[.47,.38,.25]} size={[.12,.76,.16]} color={INK}/><Panel position={[-.57,.38,.25]} size={[.12,.76,.16]} color={INK}/>
  {Array.from({length:8},(_,i)=><Panel key={i} position={[.98,.05+i*.05,.91-i*.16]} size={[.48,.1+i*.1,.17]} color={i%2?'#888f80':'#9ba18f'}/>)}
  {[0,1,2,3,4].map(i=><Beam key={i} a={[-.72+i*.36,.89,.48]} b={[-.72+i*.36,1.16,.48]} r={.014} color={INK}/>)}
  <Beam a={[-.76,1.16,.48]} b={[.76,1.16,.48]} r={.018} color={INK}/>
  <Beam a={[.98,.22,1.02]} b={[.98,1.08,-.15]} r={.014}/>
  <Beam a={[-.71,.22,-.35]} b={[-.71,1.44,-.35]} r={.028}/>
  <Beam a={[-.71,1.44,-.35]} b={[-.37,1.44,-.35]} r={.028}/>
  <Panel position={[-.19,1.22,-.48]} size={[.36,.43,.05]} color={TEAL}/>
  {[-.3,-.23,-.16,-.09].map(x=><Panel key={x} position={[x,1.22,-.44]} size={[.018,.34,.018]} color={INK}/>)}
  <mesh position={[.56,1.39,-.44]}><boxGeometry args={[.16,.07,.055]}/><meshStandardMaterial color='#eee2ba' emissive='#c6b98c' emissiveIntensity={.35}/></mesh>
 </group>;
}
function Crate({position,size=1}:{position:Point;size?:number}){
 const surface=useContext(SurfaceContext);
 return <group position={position} scale={size}>
  <Panel position={[0,.36,0]} size={[.88,.72,.6]} color={INK}/>
  {[-1,1].map(s=><group key={s}>
   <mesh position={[0,.36,s*.306]}><planeGeometry args={[.74,.56]}/><meshPhysicalMaterial {...(surface??{})} onBeforeCompile={softenPaint} color={TEAL} emissive={TEAL} emissiveIntensity={.035} side={THREE.DoubleSide} roughness={.47} metalness={.36} clearcoat={.16}/></mesh>
   <Beam a={[-.36,.08,s*.32]} b={[.36,.64,s*.32]} r={.023} color={INK}/><Beam a={[-.36,.64,s*.32]} b={[.36,.08,s*.32]} r={.023} color={INK}/>
  </group>)}
  <Panel position={[0,.735,0]} size={[.92,.035,.65]} color='#465e54'/>
  {[-.36,.36].map(x=><Panel key={x} position={[x,.36,.005]} size={[.055,.75,.63]} color='#52695e'/>)}
 </group>;
}
function Agent({time,moving=false,position=[0,0,0],color=TEAL,angle=0}:{time:Props['time'];moving?:boolean;position?:Point;color?:string;angle?:number}){
 const root=useRef<THREE.Group>(null),motion=useRef({t:0});
 const route=useMemo(()=>new THREE.CatmullRomCurve3([new THREE.Vector3(-2.1,.08,1.18),new THREE.Vector3(-1.3,.08,1.13),new THREE.Vector3(-.83,.08,.82),new THREE.Vector3(-.61,.08,.64)]),[]);
 useFrame(()=>{
  const t=time.current.t,cycle=t%30,progress=cycle<10?cycle/10:cycle<16?1:cycle<26?1-(cycle-16)/10:0,walking=moving&&(cycle<10||cycle>16&&cycle<26);
  if(root.current&&moving){root.current.position.copy(route.getPointAt(progress));const tangent=route.getTangentAt(Math.max(.001,Math.min(.999,progress)));root.current.rotation.y=Math.atan2(tangent.x,tangent.z)+(cycle>16&&cycle<26?Math.PI:0);}
  motion.current.t=walking?t:cycle<16?10:26;
 });
 return <group userData={ACTORS} name={moving?'agent-cover-route':'agent-holding-angle'}><group ref={root} position={position} rotation={[0,angle,0]}>
  <JournalCharacter time={moving?motion:time} height={.73} pose={moving?'walk':'tactical'} shirt={color} pants="#303e38" backpack={false} helmet={false}/>
  <group position={[0,moving?-.09:0,moving?-.06:0]} rotation={[0,0,moving?-.3:0]}><Panel position={[0,.475,.19]} size={[.038,.045,.22]} color='#24332f'/><Beam a={[0,.48,.23]} b={[0,.48,.4]} r={.01} color='#283a35'/>
  <Panel position={[0,.43,.18]} size={[.025,.068,.045]} color='#354940'/></group>
 </group></group>;
}
function Spike({time}:Props){
 const core=useRef<THREE.MeshStandardMaterial>(null),scan=useRef<THREE.Mesh>(null),scanMaterial=useRef<THREE.MeshBasicMaterial>(null);
 useFrame(()=>{
  const t=time.current.t;if(core.current)core.current.emissiveIntensity=.35+Math.sin(t*.8)*.12;
  if(scan.current){const phase=(t*.07)%1;scan.current.scale.setScalar(.3+phase*.6);if(scanMaterial.current)scanMaterial.current.opacity=(1-phase)*.13;}
 });
 return <group position={[.57,.08,.68]} userData={AIR} name='spike-site-device'>
  <mesh rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.27,.285,44]}/><meshStandardMaterial color={CORAL} roughness={.8}/></mesh>
  <mesh position={[0,.055,0]} castShadow><cylinderGeometry args={[.15,.19,.11,6]}/><meshStandardMaterial color={INK} roughness={.55} metalness={.35}/></mesh>
  <mesh position={[0,.24,0]} castShadow><cylinderGeometry args={[.04,.1,.32,4]}/><meshStandardMaterial ref={core} color='#8fb9a6' emissive={TEAL} emissiveIntensity={.4} roughness={.45} metalness={.4}/></mesh>
  {[0,1,2].map(i=><group key={i} rotation={[0,i*Math.PI*2/3,0]}><mesh position={[.11,.2,0]} rotation={[0,0,-.22]} castShadow><boxGeometry args={[.055,.26,.09]}/><meshStandardMaterial color={INK} metalness={.45} roughness={.4}/></mesh><mesh position={[.14,.21,0]} rotation={[0,0,-.22]}><boxGeometry args={[.008,.17,.04]}/><meshStandardMaterial color={TEAL} emissive={TEAL} emissiveIntensity={.25}/></mesh></group>)}
  <mesh ref={scan} position={[0,.009,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.97,1,60]}/><meshBasicMaterial ref={scanMaterial} color={TEAL} transparent opacity={.1} depthWrite={false}/></mesh>
 </group>;
}

export function ValorantScene({time}:Props){
 const surface=useJournalSurface('concrete',[1.5,1.5],.5);
 return <SurfaceContext.Provider value={surface}><group name='tactical-site-miniature'>
  <SiteFloor/><Passage/><Catwalk/>
  <group userData={TERRAIN}><group position={[-.15,.08,-.1]} rotation={[0,-.08,0]}><Crate position={[0,0,0]}/><Crate position={[-.12,.74,.04]} size={.56}/></group><Crate position={[1.46,.08,.9]} size={.66}/></group>
  <Agent time={time} moving color={TEAL}/><Agent time={time} position={[1.43,.95,-.65]} angle={-.5} color={CORAL}/><Agent time={time} position={[-1.85,.08,-.82]} angle={.1} color='#7a876d'/>
  <Spike time={time}/>
 </group></SurfaceContext.Provider>;
}
