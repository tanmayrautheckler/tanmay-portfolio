"use client";

/* Original anatomical miniature geometry. No external model or animation files.
 * Transforms belong to Three.js, never React state. */
import {useEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {RoundedBox} from '@react-three/drei/core/RoundedBox';
import * as THREE from 'three';

export type JournalCharacterPose='idle'|'walk'|'climb'|'photography'|'birdwatching'|'parachute'|'tactical';
type Point=[number,number,number];
export type JournalCharacterProps={
 time:React.RefObject<{t:number}>;
 height?:number;
 pose?:JournalCharacterPose;
 shirt?:string;
 pants?:string;
 skin?:string;
 backpack?:boolean;
 helmet?:boolean;
 phase?:number;
 position?:Point;
 rotation?:Point;
};
type Profile=[y:number,width:number,depth:number,zOffset?:number];

/** Elliptical cross sections describe clothed anatomy, not scaled sphere parts. */
function profileGeometry(profile:Profile[],segments=24){
 const positions:number[]=[],uvs:number[]=[],indices:number[]=[];
 const minimum=profile[0][0],range=profile.at(-1)![0]-minimum;
 profile.forEach(([y,width,depth,z=0])=>{
  for(let i=0;i<=segments;i++){
   const a=i/segments*Math.PI*2;
   positions.push(Math.cos(a)*width,y,z+Math.sin(a)*depth);uvs.push(i/segments,(y-minimum)/range);
  }
 });
 for(let row=0;row<profile.length-1;row++)for(let i=0;i<segments;i++){
  const a=row*(segments+1)+i,b=a+segments+1;indices.push(a,b,a+1,a+1,b,b+1);
 }
 for(const row of [0,profile.length-1]){
  const center=positions.length/3,[y,,,z=0]=profile[row];positions.push(0,y,z);uvs.push(.5,row===0?0:1);
  for(let i=0;i<segments;i++){
   const a=row*(segments+1)+i;
   if(row===0)indices.push(center,a,a+1);else indices.push(center,a+1,a);
  }
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}

function fabric(){
 const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;const c=canvas.getContext('2d')!;
 c.fillStyle='#808080';c.fillRect(0,0,128,128);
 for(let y=0;y<128;y+=2)for(let x=0;x<128;x+=2){
  const value=113+Math.round((Math.sin(x*47.2+y*81.7)*.5+.5)*29);c.fillStyle=`rgb(${value},${value},${value})`;c.fillRect(x,y,1,1);
 }
 const map=new THREE.CanvasTexture(canvas);map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(4,4);map.colorSpace=THREE.NoColorSpace;return map;
}

function Hand({skin}:{skin:string}){
 return <group>
  <mesh position={[0,-.032,0]} scale={[.75,1,.42]} castShadow><capsuleGeometry args={[.034,.045,4,10]}/><meshStandardMaterial color={skin} roughness={.84}/></mesh>
  {[0,1,2,3].map(i=><mesh key={i} position={[-.022+i*.014,-.076,.008]} rotation={[.12,0,0]} castShadow><capsuleGeometry args={[.0075,.023-(i===0||i===3?.007:0),3,6]}/><meshStandardMaterial color={skin} roughness={.84}/></mesh>)}
  <mesh position={[.033,-.032,.012]} rotation={[.23,0,-.55]} castShadow><capsuleGeometry args={[.011,.029,3,8]}/><meshStandardMaterial color={skin} roughness={.84}/></mesh>
 </group>;
}

function Boot(){
 return <group position={[0,-.035,.045]}>
  <RoundedBox args={[.12,.09,.23]} radius={.024} smoothness={2} castShadow receiveShadow><meshStandardMaterial color="#343b35" roughness={.87}/></RoundedBox>
  <mesh position={[0,-.035,.007]} castShadow><boxGeometry args={[.124,.025,.238]}/><meshStandardMaterial color="#232a25" roughness={1}/></mesh>
  {[-.035,0,.035].map(z=><mesh key={z} position={[0,.045,z]} rotation={[0,.14,0]}><boxGeometry args={[.075,.005,.007]}/><meshStandardMaterial color="#b7b59a" roughness={1}/></mesh>)}
 </group>;
}

/** Adult proportions: 1.8 authored units tall, approximately 7.4 heads.
 * Feet at local y=0; faces +Z. A parent owns locomotion/terrain placement.
 * All motion is sampled from the shared book clock, so pause/replay is exact.
 */
export function JournalCharacter({time,height=1,pose='idle',shirt='#995d45',pants='#4c5848',skin='#bd9474',backpack=true,helmet=false,phase=0,position=[0,0,0],rotation=[0,0,0]}:JournalCharacterProps){
 const pelvis=useRef<THREE.Group>(null),chest=useRef<THREE.Group>(null),head=useRef<THREE.Group>(null);
 const hipL=useRef<THREE.Group>(null),hipR=useRef<THREE.Group>(null),kneeL=useRef<THREE.Group>(null),kneeR=useRef<THREE.Group>(null);
 const armL=useRef<THREE.Group>(null),armR=useRef<THREE.Group>(null),elbowL=useRef<THREE.Group>(null),elbowR=useRef<THREE.Group>(null);
 const shapes=useMemo(()=>({
  torso:profileGeometry([[.04,.13,.09],[.1,.15,.105],[.23,.165,.112],[.36,.19,.115],[.44,.208,.1],[.49,.17,.075],[.515,.055,.047]]),
  hips:profileGeometry([[-.075,.115,.083],[.01,.145,.098],[.095,.138,.095]]),
  head:profileGeometry([[0,.033,.035],[.025,.054,.045,.009],[.06,.071,.057,.008],[.105,.082,.066,.004],[.155,.086,.073],[.205,.078,.065],[.241,.052,.043],[.253,.003,.003]]),
  hair:profileGeometry([[.15,.084,.071],[.19,.086,.071],[.23,.069,.056],[.263,.025,.025],[.265,.002,.002]]),
 }),[]);
 const bump=useMemo(()=>fabric(),[]);
 useEffect(()=>()=>{Object.values(shapes).forEach(g=>g.dispose());bump.dispose();},[shapes,bump]);
 useFrame(()=>{
  const t=time.current.t+phase,swing=Math.sin(t*5),opposite=Math.sin(t*5+Math.PI),breath=Math.sin(t*1.45)*.006;
  if(pelvis.current){pelvis.current.position.y=.94+(pose==='walk'?Math.abs(swing)*.018:breath*.5);pelvis.current.rotation.z=pose==='walk'?swing*.022:Math.sin(t*.57)*.009;}
  if(chest.current)chest.current.rotation.x=pose==='walk'?.055:pose==='climb'?-.09:pose==='tactical'?.12:.015+breath;
  if(head.current){head.current.rotation.x=pose==='climb'?-.16:pose==='photography'||pose==='birdwatching'?-.035:.015;head.current.rotation.y=Math.sin(t*.43)*.025;}
  const hips=[hipL.current,hipR.current],knees=[kneeL.current,kneeR.current],arms=[armL.current,armR.current],elbows=[elbowL.current,elbowR.current];
  for(let i=0;i<2;i++){
   const step=i===0?swing:opposite,side=i===0?1:-1;
   if(hips[i]){hips[i]!.rotation.set(pose==='walk'?step*.37:pose==='climb'?(i===0?-.58:-.96):pose==='parachute'?-.4:pose==='tactical'?(i===0?-.22:.13):0,0,pose==='climb'?side*.18:pose==='parachute'?side*.17:side*.022);}
   if(knees[i])knees[i]!.rotation.x=pose==='walk'?Math.max(0,-step)*.72:pose==='climb'?(i===0?.7:1.1):pose==='parachute'?.66:pose==='tactical'?.15:.035;
   if(arms[i]){
    const reach=pose==='climb'?(i===0?-2.3:-2.48-Math.sin(t*.65)*.15):pose==='parachute'?-2.45:pose==='photography'?-1.2:pose==='birdwatching'?-1.25:pose==='tactical'?-1.05:pose==='walk'?-step*.25:.05;
    arms[i]!.rotation.set(reach,0,pose==='climb'?side*.25:pose==='parachute'?side*.45:pose==='photography'||pose==='birdwatching'?side*.15:side*.045);
   }
   if(elbows[i])elbows[i]!.rotation.x=pose==='climb'?-.23:pose==='photography'?-1.72:pose==='birdwatching'?-1.75:pose==='tactical'?-.7:pose==='parachute'?-.28:pose==='walk'?-.16-Math.max(0,-step)*.18:-.07;
  }
 });
 const cloth=<meshStandardMaterial color={shirt} bumpMap={bump} bumpScale={.0022} roughness={.92}/>;
 return <group name={`adult-${pose}`} position={position} rotation={rotation} scale={height/1.8}>
  <group ref={pelvis} position={[0,.94,0]}>
   <mesh geometry={shapes.hips} castShadow receiveShadow><meshStandardMaterial color={pants} bumpMap={bump} bumpScale={.002} roughness={.96}/></mesh>
   <group ref={chest}>
    <mesh geometry={shapes.torso} castShadow receiveShadow>{cloth}</mesh>
    <mesh position={[0,.265,.113]}><boxGeometry args={[.008,.37,.009]}/><meshStandardMaterial color="#d0c3a0" roughness={.75}/></mesh>
    {[-1,1].map(side=><mesh key={side} position={[side*.087,.32,.113]}><boxGeometry args={[.085,.01,.012]}/><meshStandardMaterial color="#7e6350" roughness={.95}/></mesh>)}
    <mesh position={[0,.52,0]} castShadow><cylinderGeometry args={[.042,.046,.1,14]}/><meshStandardMaterial color={skin} roughness={.84}/></mesh>
    <group ref={head} position={[0,.58,0]}>
     <mesh geometry={shapes.head} castShadow receiveShadow><meshStandardMaterial color={skin} roughness={.8}/></mesh>
     <mesh geometry={shapes.hair} castShadow><meshStandardMaterial color={helmet?'#c1bca3':'#39372c'} roughness={helmet?.64:.92}/></mesh>
     {/* Separate brow, bridge, nose tip and ears keep the face adult at close range. */}
     <mesh position={[0,.107,.074]} rotation={[.16,0,0]} scale={[.43,1,.57]} castShadow><coneGeometry args={[.034,.081,4]}/><meshStandardMaterial color={skin} roughness={.83}/></mesh>
     <mesh position={[0,.073,.083]} scale={[1,.5,.75]}><sphereGeometry args={[.018,10,7]}/><meshStandardMaterial color={skin} roughness={.83}/></mesh>
     {[-1,1].map(side=><group key={side}>
      <mesh position={[side*.082,.109,0]} scale={[.55,1,.52]}><sphereGeometry args={[.025,10,8]}/><meshStandardMaterial color={skin} roughness={.85}/></mesh>
      <mesh position={[side*.031,.137,.066]} rotation={[0,side*.15,side*.04]}><boxGeometry args={[.032,.005,.005]}/><meshStandardMaterial color="#4b4436" roughness={1}/></mesh>
      <mesh position={[side*.031,.126,.069]} scale={[1,.37,.25]}><sphereGeometry args={[.013,10,6]}/><meshStandardMaterial color="#403d31" roughness={.9}/></mesh>
     </group>)}
     <mesh position={[0,.048,.061]}><boxGeometry args={[.035,.004,.004]}/><meshStandardMaterial color="#9d7159" roughness={.95}/></mesh>
    </group>
    {backpack&&<group position={[0,.27,-.155]}>
     <RoundedBox args={[.29,.4,.18]} radius={.045} smoothness={2} castShadow receiveShadow><meshStandardMaterial color="#5c6b54" bumpMap={bump} bumpScale={.003} roughness={.96}/></RoundedBox>
     <mesh position={[0,-.01,-.098]}><boxGeometry args={[.24,.025,.015]}/><meshStandardMaterial color="#a69c77" roughness={.9}/></mesh>
     {[-1,1].map(side=><mesh key={side} position={[side*.125,.02,.13]} rotation={[.12,0,-side*.05]}><boxGeometry args={[.025,.34,.025]}/><meshStandardMaterial color="#384b40" roughness={.95}/></mesh>)}
     <mesh position={[.175,0,-.015]} castShadow><cylinderGeometry args={[.033,.035,.19,12]}/><meshStandardMaterial color="#9eaa98" roughness={.6} metalness={.25}/></mesh>
    </group>}
    {[-1,1].map((side,i)=><group key={side} ref={i===0?armL:armR} position={[side*.205,.435,0]}>
     <mesh position={[0,-.018,0]} scale={[1,.82,1]} castShadow><sphereGeometry args={[.072,16,10]}/>{cloth}</mesh>
     <mesh position={[0,-.145,0]} castShadow receiveShadow><cylinderGeometry args={[.07,.054,.29,14]}/>{cloth}</mesh>
     <group ref={i===0?elbowL:elbowR} position={[0,-.29,0]}>
      <mesh position={[0,-.125,0]} castShadow receiveShadow><cylinderGeometry args={[.055,.035,.25,14]}/>{cloth}</mesh>
      <mesh position={[0,-.247,0]}><cylinderGeometry args={[.038,.038,.022,12]}/><meshStandardMaterial color="#716e57" roughness={1}/></mesh>
      <group position={[0,-.267,0]}><Hand skin={skin}/></group>
     </group>
    </group>)}
   </group>
   {[-1,1].map((side,i)=><group key={side} ref={i===0?hipL:hipR} position={[side*.088,-.005,0]}>
    <mesh position={[0,-.215,0]} castShadow receiveShadow><cylinderGeometry args={[.085,.06,.43,16]}/><meshStandardMaterial color={pants} bumpMap={bump} bumpScale={.002} roughness={.95}/></mesh>
    <group ref={i===0?kneeL:kneeR} position={[0,-.43,0]}>
     <mesh scale={[1,.92,1]} castShadow><sphereGeometry args={[.06,14,10]}/><meshStandardMaterial color={pants} bumpMap={bump} bumpScale={.002} roughness={.95}/></mesh>
     <mesh position={[0,-.215,0]} castShadow receiveShadow><cylinderGeometry args={[.061,.039,.43,16]}/><meshStandardMaterial color={pants} bumpMap={bump} bumpScale={.002} roughness={.95}/></mesh>
     <group position={[0,-.43,0]}><Boot/></group>
    </group>
   </group>)}
  </group>
 </group>;
}
