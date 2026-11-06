"use client";

/* Renderer-owned transforms stay outside React state. Data below is invented
 * solely to explain the interface; it is not a market feed or a backtest. */
import {useEffect, useMemo, useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {RoundedBox} from '@react-three/drei/core/RoundedBox';
import * as THREE from 'three';

type Time = {time: React.RefObject<{t:number}>};
type Bar = {open:number;close:number;high:number;low:number;volume:number};
const INK='#203b34', SHELL='#1d2c28', GOLD='#bba16a', PAPER='#e9dfc7';
const UP='#79b8a2', DOWN='#c98978';

/** A fixed synthetic OHLC sequence. Every wick contains its candle body. */
function researchBars():Bar[] {
 let previous=.45;
 return Array.from({length:32},(_,i)=>{
  const open=previous,close=THREE.MathUtils.clamp(open+Math.sin(i*1.82)*.062+Math.cos(i*.47)*.034,.22,.78);
  const high=Math.min(.92,Math.max(open,close)+.026+(i%3)*.009);
  const low=Math.max(.08,Math.min(open,close)-.022-(i%4)*.007);
  previous=close;
  return {open,close,high,low,volume:.2+Math.abs(Math.sin(i*.79))*.75};
 });
}

function texture(kind:'main'|'side'|'notes') {
 const canvas=document.createElement('canvas');canvas.width=kind==='main'?1536:768;canvas.height=kind==='notes'?896:864;
 const c=canvas.getContext('2d')!,w=canvas.width,h=canvas.height;
 c.fillStyle=kind==='notes'?'#efe7d4':'#152c27';c.fillRect(0,0,w,h);
 const text=(value:string,x:number,y:number,size:number,color=PAPER)=>{c.fillStyle=color;c.font=`${size>48?'600':'400'} ${size}px ui-monospace, monospace`;c.fillText(value,x,y);};
 const rule=(y:number)=>{c.strokeStyle=kind==='notes'?'#c8bda2':'#355147';c.lineWidth=2;c.beginPath();c.moveTo(48,y);c.lineTo(w-48,y);c.stroke();};
 if(kind==='main'){
  text('RESEARCH TERMINAL',64,96,60);text('01 / MARKET STRUCTURE',64,148,29,'#8eaa9b');
  c.fillStyle='#263e33';c.fillRect(1120,48,350,72);text('ILLUSTRATIVE DATA',1140,94,29,GOLD);rule(183);
  text('PRICE ACTION',68,240,32);text('OHLC / NORMALISED',1098,240,27,'#8eaa9b');
  for(let i=0;i<5;i++){
   const y=298+i*85;c.strokeStyle='#29473c';c.lineWidth=1;c.beginPath();c.moveTo(70,y);c.lineTo(1466,y);c.stroke();
   text((.8-i*.2).toFixed(1),1410,y-10,22,'#789487');
  }
  for(let i=0;i<9;i++){c.strokeStyle='#29473c';c.beginPath();c.moveTo(70+i*160,282);c.lineTo(70+i*160,667);c.stroke();}
  text('VOLUME',72,724,27,'#8eaa9b');rule(786);
  text('OBSERVE',68,833,28,GOLD);text('→',250,833,30);text('QUESTION',315,833,28);text('→',525,833,30);text('TEST',592,833,28);
  text('SYNTHETIC SERIES / 32 BARS',960,833,25,'#8eaa9b');
 }else if(kind==='side'){
  text('RESEARCH NOTES',48,87,44);text('A QUESTION BEFORE A TRADE',48,136,24,'#90a99a');rule(171);
  text('WATCHLIST',48,218,24,GOLD);text('SERIES A · B · C',48,258,30);
  const rows=[['01','COLLECT','Prepare observations'],['02','EXPLORE','Compare the context'],['03','TEST','Review the hypothesis']];
  rows.forEach(([number,label,note],i)=>{
   const y=330+i*125;text(number,48,y,34,GOLD);text(label,123,y,37);text(note,123,y+46,24,'#9ab0a1');
   c.strokeStyle='#355147';c.beginPath();c.moveTo(123,y+75);c.lineTo(719,y+75);c.stroke();
  });
  text('BUILT TO INVESTIGATE',48,741,26,GOLD);text('Python · FastAPI · React',48,794,27);
 }else{
  text('WORKING NOTES',56,105,46,INK);text('BEYOND THE TICKER',56,159,27,'#7c785f');rule(202);
  ['What changed?','What explains it?','What would disprove it?'].forEach((line,i)=>{
   c.strokeStyle='#ae9b73';c.lineWidth=2;c.strokeRect(57,269+i*139,24,24);text(line,106,291+i*139,31,INK);rule(321+i*139);
  });
  text('OBSERVATION ≠ CONCLUSION',56,783,26,'#7c785f');
 }
 const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;return map;
}

function Monitor({position,rotation=[-.25,0,0],width,height,map,children}:{position:[number,number,number];rotation?:[number,number,number];width:number;height:number;map:THREE.Texture;children?:React.ReactNode}) {
 return <group position={position} rotation={rotation}>
  <RoundedBox args={[width+.13,height+.13,.11]} radius={.055} smoothness={3} castShadow receiveShadow><meshStandardMaterial color={SHELL} metalness={.32} roughness={.4}/></RoundedBox>
  <mesh position={[0,0,.061]}><planeGeometry args={[width,height]}/><meshBasicMaterial map={map} toneMapped={false}/></mesh>
  <mesh position={[0,-height/2-.04,.065]}><boxGeometry args={[.22,.009,.004]}/><meshStandardMaterial color={GOLD} metalness={.4} roughness={.4}/></mesh>
  <mesh position={[width/2-.12,-height/2-.04,.067]}><sphereGeometry args={[.012,8,6]}/><meshBasicMaterial color={UP}/></mesh>
  {children}
 </group>;
}

function CandlestickChart({time,bars}:{bars:Bar[]}&Time) {
 const candles=useRef<THREE.Group>(null),scan=useRef<THREE.Group>(null);
 useFrame(()=>{
  const count=Math.min(bars.length,Math.floor(Math.max(0,time.current.t-.35)*7));
  if(candles.current)candles.current.children.forEach((item,i)=>{item.visible=i<count;});
  if(scan.current){scan.current.position.x=-1.45+Math.max(0,count-1)*.088;scan.current.visible=count>0;}
 });
 return <group position={[0,0,.069]}>
  <group ref={candles}>
   {bars.map((bar,i)=>{
    const x=-1.45+i*.088,up=bar.close>=bar.open,y=(v:number)=>-.47+(v-.08)*1.0;
    return <group key={i}>
     <mesh position={[x,(y(bar.high)+y(bar.low))/2,0]}><planeGeometry args={[.006,(bar.high-bar.low)]}/><meshBasicMaterial color={up?UP:DOWN}/></mesh>
     <mesh position={[x,(y(bar.open)+y(bar.close))/2,.001]}><planeGeometry args={[.054,Math.max(.009,Math.abs(bar.close-bar.open))]}/><meshBasicMaterial color={up?UP:DOWN}/></mesh>
     <mesh position={[x,-.735+bar.volume*.045,0]}><planeGeometry args={[.054,bar.volume*.09]}/><meshBasicMaterial color={up?'#416f5a':'#725344'}/></mesh>
    </group>;
   })}
  </group>
  <group ref={scan}>
   <mesh position={[0,-.12,.004]}><planeGeometry args={[.004,.8]}/><meshBasicMaterial color={GOLD} transparent opacity={.48}/></mesh>
   <mesh position={[0,.3,.004]}><planeGeometry args={[.045,.008]}/><meshBasicMaterial color={GOLD}/></mesh>
  </group>
 </group>;
}

function Keyboard() {
 const keys=useRef<THREE.InstancedMesh>(null);
 useEffect(()=>{
  if(!keys.current)return;const dummy=new THREE.Object3D();
  for(let row=0;row<4;row++)for(let col=0;col<13;col++){
   dummy.position.set(-.94+col*.156,.075,-.235+row*.145);dummy.updateMatrix();keys.current.setMatrixAt(row*13+col,dummy.matrix);
   keys.current.setColorAt(row*13+col,new THREE.Color(col===0&&row===0?GOLD:row%2?'#b5bcaa':'#c6cbbb'));
  }
  keys.current.instanceMatrix.needsUpdate=true;if(keys.current.instanceColor)keys.current.instanceColor.needsUpdate=true;
 },[]);
 return <group position={[-.62,.045,.92]} rotation={[0,.02,0]}>
  <RoundedBox args={[2.18,.1,.77]} radius={.045} smoothness={2} castShadow receiveShadow><meshStandardMaterial color={SHELL} metalness={.25} roughness={.55}/></RoundedBox>
  <instancedMesh ref={keys} args={[undefined,undefined,52]} castShadow receiveShadow><boxGeometry args={[.137,.045,.119]}/><meshStandardMaterial roughness={.57} metalness={.05}/></instancedMesh>
  <mesh position={[-.22,.076,.335]} castShadow><boxGeometry args={[.83,.045,.115]}/><meshStandardMaterial color="#b5bcaa" roughness={.57}/></mesh>
 </group>;
}

export function TradingDesk({time}:Time) {
 const bars=useMemo(()=>researchBars(),[]);
 const maps=useMemo(()=>({main:texture('main'),side:texture('side'),notes:texture('notes')}),[]);
 useEffect(()=>()=>Object.values(maps).forEach(map=>map.dispose()),[maps]);
 return <group name="research-trading-terminal">
  <group userData={{journalLayer:'terrain',revealOrder:0}}>
   <RoundedBox args={[5.55,.055,3.45]} radius={.018} smoothness={3} position={[0,.033,.02]} receiveShadow><meshStandardMaterial color="#344b3c" roughness={.92}/></RoundedBox>
   <mesh position={[-.52,.11,-.62]} receiveShadow castShadow><boxGeometry args={[1.3,.055,.65]}/><meshStandardMaterial color={SHELL} metalness={.35} roughness={.45}/></mesh>
   <mesh position={[-.52,.46,-.82]} castShadow><boxGeometry args={[.14,.73,.12]}/><meshStandardMaterial color="#7b8b7a" metalness={.65} roughness={.32}/></mesh>
   <mesh position={[1.92,.1,-.57]} receiveShadow castShadow><boxGeometry args={[.86,.045,.55]}/><meshStandardMaterial color={SHELL} metalness={.35} roughness={.45}/></mesh>
   <mesh position={[1.92,.45,-.78]} castShadow><boxGeometry args={[.105,.7,.105]}/><meshStandardMaterial color="#7b8b7a" metalness={.65} roughness={.32}/></mesh>
  </group>
  <group userData={{journalLayer:'actors',revealOrder:0}}>
   <Monitor position={[-.56,1.12,-.82]} width={3.36} height={1.89} map={maps.main}><CandlestickChart time={time} bars={bars}/></Monitor>
   <Monitor position={[1.94,1.10,-.72]} rotation={[-.25,-.18,0]} width={1.27} height={1.88} map={maps.side}/>
   <Keyboard/>
   <group position={[.99,.08,1.04]} rotation={[0,-.14,0]}>
    <mesh scale={[.17,.08,.27]} castShadow><sphereGeometry args={[1,24,16]}/><meshStandardMaterial color="#c1c8b5" roughness={.42} metalness={.1}/></mesh>
    <mesh position={[0,.078,-.055]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.021,.021,.075,12]}/><meshStandardMaterial color={SHELL} roughness={.9}/></mesh>
   </group>
  </group>
  <group userData={{journalLayer:'actors',revealOrder:3}}>
   <group position={[-2.1,.085,1.02]} rotation={[0,.12,0]}>
    <RoundedBox args={[.82,.075,1.17]} radius={.025} smoothness={2} castShadow receiveShadow><meshStandardMaterial color="#bc9d68" roughness={.9}/></RoundedBox>
    <mesh position={[0,.043,0]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[.76,1.1]}/><meshStandardMaterial map={maps.notes} roughness={1}/></mesh>
    <mesh position={[.27,.068,0]} rotation={[Math.PI/2,0,.03]} castShadow><cylinderGeometry args={[.018,.018,.91,10]}/><meshStandardMaterial color={INK} metalness={.3} roughness={.45}/></mesh>
   </group>
   <group position={[2.04,.09,1.05]} rotation={[0,-.16,0]}>
    <RoundedBox args={[.58,.025,.94]} radius={.01} smoothness={3} castShadow receiveShadow><meshStandardMaterial color={SHELL} metalness={.4} roughness={.4}/></RoundedBox>
    <mesh position={[0,.018,0]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[.52,.83]}/><meshStandardMaterial color="#152c27" roughness={.3}/></mesh>
    {[.08,.19,.12,.25,.18].map((v,i)=><mesh key={i} position={[-.18+i*.09,.023,-.05+v/2]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[.05,v]}/><meshBasicMaterial color={i%2?GOLD:UP}/></mesh>)}
    <mesh position={[0,.026,-.32]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[.29,.012]}/><meshBasicMaterial color="#96ac98"/></mesh>
   </group>
  </group>
 </group>;
}
